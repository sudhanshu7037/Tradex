<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Http\Requests\Admin\TransactionListRequest;
use App\Http\Resources\Admin\TransactionResource;
use App\Traits\LogsAdminAudit;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    use LogsAdminAudit;

    /**
     * Display a paginated list of transactions.
     */
    public function index(TransactionListRequest $request)
    {
        $query = Transaction::with('user');

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

        // Filter by user
        if ($userId = $request->input('user_id')) {
            $query->where('user_id', $userId);
        }

        // Filter by symbol
        if ($symbol = $request->input('symbol')) {
            $query->where('stock_symbol', strtoupper($symbol));
        }

        // Filter by type
        if ($type = $request->input('transaction_type')) {
            $query->where('transaction_type', strtoupper($type));
        }

        // Filter by date range
        if ($fromDate = $request->input('from_date')) {
            $query->whereDate('executed_at', '>=', $fromDate);
        }
        if ($toDate = $request->input('to_date')) {
            $query->whereDate('executed_at', '<=', $toDate);
        }

        // Sort
        $sortBy = $request->input('sort_by', 'executed_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $perPage = (int) $request->input('per_page', 15);
        $transactions = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Transactions retrieved successfully',
            'data' => [
                'items' => TransactionResource::collection($transactions->items()),
                'pagination' => [
                    'current_page' => $transactions->currentPage(),
                    'last_page'    => $transactions->lastPage(),
                    'per_page'     => $transactions->perPage(),
                    'total'        => $transactions->total(),
                ],
            ]
        ]);
    }

    /**
     * Display single transaction details.
     */
    public function show($id)
    {
        $transaction = Transaction::with('user')->find($id);

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Transaction details retrieved successfully',
            'data' => [
                'transaction' => new TransactionResource($transaction)
            ]
        ]);
    }
}
