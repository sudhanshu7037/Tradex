<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class StockController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:1',
        ]);

        $search = $request->input('query');

        $response = Http::get('https://finnhub.io/api/v1/search', [
            'q' => $search,
            'token' => env('FINNHUB_API_KEY'),
        ]);

        if (!$response->successful()) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to fetch stock data from Finnhub.',
            ], $response->status());
        }

        return response()->json([
            'success' => true,
            'data' => $response->json(),
        ], 200);
    }



    public function getCurrentStockPrice(string $symbol)
{
    try {

        $response = Http::timeout(10)
            ->acceptJson()
            ->get('https://finnhub.io/api/v1/quote', [

                'symbol' => strtoupper($symbol),

                'token' => config('services.finnhub.api_key'),

            ]);

        if (!$response->successful()) {

            return response()->json([

                'success' => false,

                'message' => 'Unable to fetch stock price.'

            ], $response->status());

        }

        $stock = $response->json();

        if (empty($stock) || $stock['c'] == 0) {

            return response()->json([

                'success' => false,

                'message' => 'Invalid stock symbol.'

            ], 404);

        }

        return response()->json([

            'success' => true,

            'message' => 'Current stock price fetched successfully.',

            'data' => [

                'symbol' => strtoupper($symbol),

                'current_price' => $stock['c'],

                'high_price' => $stock['h'],

                'low_price' => $stock['l'],

                'open_price' => $stock['o'],

                'previous_close' => $stock['pc'],

                'timestamp' => $stock['t']

            ]

        ], 200);

    } catch (\Exception $e) {

        return response()->json([

            'success' => false,

            'message' => 'Something went wrong while fetching stock price.'

        ], 500);
    }
}
}