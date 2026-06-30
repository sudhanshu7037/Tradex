<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use App\Models\Portfolio;
use App\Models\Transaction;

class TradeController extends Controller
{
    public function executeTrade(Request $request)
    {
        // Step 1: Validate Request Data
        $validated = $request->validate([
            'stock_symbol'     => 'required|string|max:20',
            'transaction_type' => 'required|in:BUY,SELL',
            'quantity'         => 'required|integer|min:1',
        ]);

        // Step 2: Fetch Current Stock Price From Finnhub API
        $response = Http::get('https://finnhub.io/api/v1/quote', [
            'symbol' => strtoupper($validated['stock_symbol']),
            'token'  => config('services.finnhub.api_key'),
        ]);

        // Step 3: Check API Response
        if (!$response->successful()) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to fetch current stock price.',
            ], 500);
        }

        // Step 4: Get Current Stock Price
        $stock        = $response->json();
        $currentPrice = $stock['c'];

        // Step 5: Calculate Total Trade Value
        $totalTradeValue = round($currentPrice * $validated['quantity'], 2);

        // Step 6: Get Logged-In User
        $user          = $request->user();
        $walletBalance = $user->wallet_balance;

        // Step 7: BUY — check sufficient wallet balance
        if ($validated['transaction_type'] === 'BUY' && $walletBalance < $totalTradeValue) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient wallet balance.',
            ], 400);
        }

        // Step 8: Start Database Transaction
        DB::beginTransaction();

        try {
            $symbol    = strtoupper(trim($validated['stock_symbol']));
            $quantity  = $validated['quantity'];
            $tradeType = $validated['transaction_type'];

            // Step 9: Load or create portfolio entry
            $portfolio = Portfolio::firstOrNew([
                'user_id'      => $user->id,
                'stock_symbol' => $symbol,
            ]);

            if ($tradeType === 'BUY') {

                if ($portfolio->exists) {
                    $oldQty      = $portfolio->total_quantity;
                    $oldAvgPrice = $portfolio->average_buy_price;
                    $totalQty    = $oldQty + $quantity;

                    $portfolio->average_buy_price = round(
                        (($oldQty * $oldAvgPrice) + ($quantity * $currentPrice)) / $totalQty,
                        2
                    );
                    $portfolio->total_quantity = $totalQty;
                } else {
                    $portfolio->total_quantity    = $quantity;
                    $portfolio->average_buy_price = $currentPrice;
                }

                // Debit wallet
                $user->wallet_balance = round($walletBalance - $totalTradeValue, 2);

            } else { // SELL

                // Step 10: Validate sufficient shares to sell
                if (!$portfolio->exists || $portfolio->total_quantity < $quantity) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Insufficient shares to sell.',
                    ], 400);
                }

                $portfolio->total_quantity -= $quantity;

                // Remove portfolio record if no shares remain
                if ($portfolio->total_quantity === 0) {
                    $portfolio->delete();
                    $portfolio = null;
                }

                // Credit wallet
                $user->wallet_balance = round($walletBalance + $totalTradeValue, 2);
            }

            // Step 11: Persist portfolio and wallet changes
            if ($portfolio) {
                $portfolio->save();
            }
            $user->save();

            // Step 12: Save Transaction History
            Transaction::create([
                'user_id'          => $user->id,
                'stock_symbol'     => $symbol,
                'transaction_type' => $tradeType,
                'quantity'         => $quantity,
                'price_per_share'  => $currentPrice,
                'total_value'      => $totalTradeValue,
                'executed_at'      => now(),
            ]);

            // Step 13: Commit
            DB::commit();

            // Step 14: Success Response
            return response()->json([
                'success' => true,
                'message' => $tradeType === 'BUY'
                    ? 'Stock purchased successfully.'
                    : 'Stock sold successfully.',
                'data' => [
                    'stock_symbol'      => $symbol,
                    'transaction_type'  => $tradeType,
                    'quantity'          => $quantity,
                    'current_price'     => $currentPrice,
                    'total_trade_value' => $totalTradeValue,
                    'wallet_balance'    => $user->wallet_balance,
                    'portfolio'         => $portfolio,
                ],
            ], 200);

        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}