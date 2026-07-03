<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Watchlist;
use App\Models\User;
use App\Http\Requests\Admin\WatchlistListRequest;
use App\Http\Resources\Admin\WatchlistResource;
use Illuminate\Http\Request;

class WatchlistController extends Controller
{
    /**
     * Display a paginated list of all watchlists.
     */
    public function index(WatchlistListRequest $request)
    {
        $query = Watchlist::with('user');

        // Search by symbol or user name/email
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

        // Filter by stock symbol
        if ($symbol = $request->input('symbol')) {
            $query->where('stock_symbol', strtoupper($symbol));
        }

        // Sort
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $perPage = (int) $request->input('per_page', 15);
        $watchlists = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Watchlists retrieved successfully',
            'data' => [
                'items' => WatchlistResource::collection($watchlists->items()),
                'pagination' => [
                    'current_page' => $watchlists->currentPage(),
                    'last_page'    => $watchlists->lastPage(),
                    'per_page'     => $watchlists->perPage(),
                    'total'        => $watchlists->total(),
                ],
            ]
        ]);
    }

    /**
     * Display a specific user's watchlist.
     */
    public function showUserWatchlist($userId)
    {
        $user = User::find($userId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $watchlists = Watchlist::where('user_id', $userId)
            ->orderBy('stock_symbol')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'User watchlist retrieved successfully',
            'data' => [
                'user' => [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,
                ],
                'count'      => $watchlists->count(),
                'watchlists' => WatchlistResource::collection($watchlists),
            ]
        ]);
    }
}
