<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $transactions = Transaction::where('user_id', $user->id)
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'message' => 'Transactions fetched successfully',
            'data' => $transactions
        ]);
    }
}