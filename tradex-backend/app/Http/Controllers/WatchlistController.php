<?php

namespace App\Http\Controllers;

use App\Models\Watchlist;
use Illuminate\Http\Request;

class WatchlistController extends Controller
{
    /**
     * Add stock to watchlist
     */
    public function store(Request $request)
    {
        $request->validate([
            'stock_symbol' => 'required|string|max:20'
        ]);

        $stockSymbol = strtoupper(
            trim($request->stock_symbol)
        );

        $existing = Watchlist::where(
            'user_id',
            $request->user()->id
        )
        ->where(
            'stock_symbol',
            $stockSymbol
        )
        ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Stock already exists in watchlist'
            ], 409);
        }

        $watchlist = Watchlist::create([
            'user_id' => $request->user()->id,
            'stock_symbol' => $stockSymbol
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Stock added to watchlist',
            'data' => $watchlist
        ], 201);
    }

    /**
     * Get user watchlist
     */
    public function index(Request $request)
    {
        $watchlist = Watchlist::where(
            'user_id',
            $request->user()->id
        )
        ->latest()
        ->get();

        return response()->json([
            'success' => true,
            'count' => $watchlist->count(),
            'data' => $watchlist
        ]);
    }

    /**
     * Remove stock from watchlist
     */
    public function destroy(Request $request, $id)
    {
        $watchlist = Watchlist::where(
            'user_id',
            $request->user()->id
        )
        ->findOrFail($id);

        $watchlist->delete();

        return response()->json([
            'success' => true,
            'message' => 'Stock removed from watchlist'
        ]);
    }
}