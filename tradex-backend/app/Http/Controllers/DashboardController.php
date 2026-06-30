<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $portfolios = Portfolio::where(
            'user_id',
            $user->id
        )->get();

        $investedValue = 0;
        $currentValue = 0;

        foreach ($portfolios as $portfolio) {

            // Invested Amount
            $investedValue +=
                $portfolio->total_quantity *
                $portfolio->average_buy_price;

            try {

                $response = Http::get(
                    'https://finnhub.io/api/v1/quote',
                    [
                        'symbol' => $portfolio->stock_symbol,
                        'token' => config('services.finnhub.api_key')
                    ]
                );

                $currentPrice = $response->json()['c'] ?? 0;

            } catch (\Exception $e) {

                $currentPrice = 0;
            }

            // Current Market Value
            $currentValue +=
                $portfolio->total_quantity *
                $currentPrice;
        }

        $profitLoss = $currentValue - $investedValue;

        $totalTransactions = Transaction::where(
            'user_id',
            $user->id
        )->count();

        return response()->json([
            'success' => true,
            'wallet_balance' => (float) $user->wallet_balance,
            'total_holdings' => $portfolios->count(),
            'invested_value' => round($investedValue, 2),
            'current_value' => round($currentValue, 2),
            'profit_loss' => round($profitLoss, 2),
            'total_transactions' => $totalTransactions
        ]);
    }
}       