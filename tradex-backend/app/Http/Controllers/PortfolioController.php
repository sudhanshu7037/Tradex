<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $portfolio = Portfolio::where('user_id', $user->id)
            ->orderBy('stock_symbol')
            ->get();

        return response()->json([
            'success' => true,
            'count' => $portfolio->count(),
            'data' => $portfolio
        ]);
    }
}