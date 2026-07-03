<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use App\Models\User;
use App\Models\Transaction;
use App\Http\Requests\Admin\PortfolioListRequest;
use App\Http\Resources\Admin\PortfolioResource;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    /**
     * Display a paginated list of all portfolio holdings.
     */
    public function index(PortfolioListRequest $request)
    {
        $query = Portfolio::with('user');

        // Search by stock symbol or user name/email
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('stock_symbol', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by specific user
        if ($userId = $request->input('user_id')) {
            $query->where('user_id', $userId);
        }

        // Filter by stock symbol
        if ($symbol = $request->input('symbol')) {
            $query->where('stock_symbol', strtoupper($symbol));
        }

        // Sort
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $perPage = (int) $request->input('per_page', 15);
        $portfolios = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Portfolios retrieved successfully',
            'data' => [
                'items' => PortfolioResource::collection($portfolios->items()),
                'pagination' => [
                    'current_page' => $portfolios->currentPage(),
                    'last_page'    => $portfolios->lastPage(),
                    'per_page'     => $portfolios->perPage(),
                    'total'        => $portfolios->total(),
                ],
            ]
        ]);
    }

    /**
     * Display a specific user's portfolio and investment summary.
     */
    public function showUserPortfolio($userId)
    {
        $user = User::find($userId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $holdings = Portfolio::where('user_id', $userId)
            ->orderBy('stock_symbol')
            ->get();

        $totalInvested = 0;
        foreach ($holdings as $holding) {
            $totalInvested += $holding->total_quantity * $holding->average_buy_price;
        }

        // Calculate trade metrics from transactions
        $buyTransactions = Transaction::where('user_id', $userId)
            ->where('transaction_type', 'BUY')
            ->sum('total_value');

        $sellTransactions = Transaction::where('user_id', $userId)
            ->where('transaction_type', 'SELL')
            ->sum('total_value');

        // Realized cash flow difference
        $netTransactionFlow = $sellTransactions - $buyTransactions;

        return response()->json([
            'success' => true,
            'message' => 'User portfolio retrieved successfully',
            'data' => [
                'user' => [
                    'id'             => $user->id,
                    'name'           => $user->name,
                    'email'          => $user->email,
                    'wallet_balance' => (float) $user->wallet_balance,
                ],
                'summary' => [
                    'total_holdings_count'  => $holdings->count(),
                    'total_invested_value'  => round((float) $totalInvested, 2),
                    'total_buy_volume'      => round((float) $buyTransactions, 2),
                    'total_sell_volume'     => round((float) $sellTransactions, 2),
                    'net_realized_flow'     => round((float) $netTransactionFlow, 2),
                ],
                'holdings' => PortfolioResource::collection($holdings),
            ]
        ]);
    }
}
