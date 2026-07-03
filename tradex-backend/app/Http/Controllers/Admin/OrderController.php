<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Traits\LogsAdminAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class OrderController extends Controller
{
    use LogsAdminAudit;

    /**
     * Get paginated order book.
     */
    public function index(Request $request)
    {
        $query = Transaction::with('user');

        // Search by symbol or user ID
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('stock_symbol', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        // Filter by transaction type
        if ($type = $request->input('type')) {
            $query->where('transaction_type', strtoupper($type));
        }

        // Filter by status if status column exists in DB
        if (Schema::hasColumn('transactions', 'status') && $status = $request->input('status')) {
            $query->where('status', ucfirst($status));
        }

        $perPage = (int) $request->input('per_page', 15);
        $orders = $query->latest('executed_at')->paginate($perPage);

        $items = collect($orders->items())->map(function ($t) {
            // Default status to Executed or pull from DB column if present
            $status = $t->status ?? 'Executed';
            return [
                'id' => $t->id,
                'user' => [
                    'id' => $t->user?->id,
                    'name' => $t->user?->name ?? 'Unknown Trader',
                    'email' => $t->user?->email ?? '',
                ],
                'stock_symbol' => $t->stock_symbol,
                'transaction_type' => $t->transaction_type,
                'quantity' => $t->quantity,
                'price_per_share' => (float) $t->price_per_share,
                'total_value' => (float) $t->total_value,
                'status' => $status,
                'executed_at' => $t->executed_at ? $t->executed_at->format('Y-m-d H:i:s') : null,
            ];
        });

        // Filter post-query if status column wasn't in DB but status filter requested
        if (!Schema::hasColumn('transactions', 'status') && $status = $request->input('status')) {
            if (strcasecmp($status, 'Executed') !== 0) {
                $items = collect([]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Orders retrieved successfully',
            'data' => [
                'items' => $items,
                'pagination' => [
                    'current_page' => $orders->currentPage(),
                    'last_page'    => $orders->lastPage(),
                    'per_page'     => $orders->perPage(),
                    'total'        => $orders->total(),
                ],
            ]
        ]);
    }

    /**
     * Force cancel an order.
     */
    public function cancel($id)
    {
        $order = Transaction::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        if (Schema::hasColumn('transactions', 'status')) {
            $oldStatus = $order->status ?? 'Executed';
            $order->update(['status' => 'Cancelled']);
        } else {
            $oldStatus = 'Executed';
        }

        $this->logAudit(
            action: 'force_cancel_order',
            entityType: 'Order',
            entityId: $id,
            oldValues: ['status' => $oldStatus],
            newValues: ['status' => 'Cancelled', 'stock_symbol' => $order->stock_symbol]
        );

        return response()->json([
            'success' => true,
            'message' => "Order #{$id} force cancelled successfully",
            'data' => [
                'id' => $order->id,
                'status' => 'Cancelled'
            ]
        ]);
    }
}
