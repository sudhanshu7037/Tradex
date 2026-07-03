<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\Admin\UserListRequest;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Http\Resources\Admin\UserResource;
use App\Traits\LogsAdminAudit;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use LogsAdminAudit;

    /**
     * Display a paginated list of users.
     */
    public function index(UserListRequest $request)
    {
        $query = User::query();

        // Search by name, email, or ID
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Sort
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        // Pagination
        $perPage = (int) $request->input('per_page', 15);
        $users = $query->withCount(['portfolios', 'transactions', 'watchlists'])->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Users retrieved successfully',
            'data' => [
                'items' => UserResource::collection($users->items()),
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'last_page'    => $users->lastPage(),
                    'per_page'     => $users->perPage(),
                    'total'        => $users->total(),
                ],
            ]
        ]);
    }

    /**
     * Display single user details.
     */
    public function show($id)
    {
        $user = User::withCount(['portfolios', 'transactions', 'watchlists'])
            ->with(['portfolios', 'watchlists'])
            ->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'User details retrieved successfully',
            'data' => [
                'user' => new UserResource($user)
            ]
        ]);
    }

    /**
     * Update user status (activate / suspend).
     */
    public function updateStatus(UpdateUserStatusRequest $request, $id)
    {
        return $this->changeStatus($id, $request->input('status'));
    }

    /**
     * Shortcut to block user.
     */
    public function block($id)
    {
        return $this->changeStatus($id, 'suspended');
    }

    /**
     * Shortcut to unblock user.
     */
    public function unblock($id)
    {
        return $this->changeStatus($id, 'active');
    }

    private function changeStatus($id, $newStatus)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $oldStatus = $user->status;
        $user->update(['status' => $newStatus]);

        // Log audit
        $this->logAudit(
            action: 'update_user_status',
            entityType: 'User',
            entityId: $user->id,
            oldValues: ['status' => $oldStatus],
            newValues: ['status' => $newStatus]
        );

        return response()->json([
            'success' => true,
            'message' => "User account set to {$newStatus} successfully",
            'data' => [
                'user' => new UserResource($user)
            ]
        ]);
    }

    /**
     * Adjust user wallet balance (+ or - amount).
     */
    public function adjustBalance(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|numeric',
            'reason' => 'nullable|string|max:255',
        ]);

        $user = User::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $oldBalance = $user->wallet_balance;
        $amount = (float) $request->input('amount');
        $newBalance = $oldBalance + $amount;

        if ($newBalance < 0) {
            return response()->json(['success' => false, 'message' => 'Insufficient wallet balance to deduct this amount'], 400);
        }

        $user->update(['wallet_balance' => $newBalance]);

        $this->logAudit(
            action: 'adjust_user_balance',
            entityType: 'User',
            entityId: $user->id,
            oldValues: ['wallet_balance' => $oldBalance],
            newValues: ['wallet_balance' => $newBalance, 'adjustment' => $amount, 'reason' => $request->input('reason', 'Admin adjustment')]
        );

        return response()->json([
            'success' => true,
            'message' => ($amount >= 0 ? "+\$" . number_format($amount, 2) . " added to" : "-\$" . number_format(abs($amount), 2) . " deducted from") . " {$user->name}'s wallet",
            'data' => [
                'user' => new UserResource($user),
                'old_balance' => $oldBalance,
                'new_balance' => $newBalance
            ]
        ]);
    }

    /**
     * Remove the specified user.
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $oldValues = $user->toArray();
        $user->delete();

        // Log audit
        $this->logAudit(
            action: 'delete_user',
            entityType: 'User',
            entityId: $id,
            oldValues: $oldValues
        );

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully',
            'data' => []
        ]);
    }
}
