<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\TradeController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\WatchlistController;
Route::post(
    '/register',
    [AuthController::class,'register']
);

Route::post(
  
'/login', [AuthController::class,'login']);


Route::middleware('auth:sanctum')->group(function () {

Route::get(
        '/profile',
        [AuthController::class,'profile']
    );

    Route::post(
    '/logout',
    [AuthController::class,'logout']
);

    Route::get(
        '/stocks/search',
        [StockController::class,'search']
    );
    
    Route::get(
    '/stocks/{symbol}', [StockController::class, 'getCurrentStockPrice']);

    Route::post(
        '/trade/execute',
        [TradeController::class, 'executeTrade']
    );



    Route::get(
    '/portfolio', [PortfolioController::class, 'index']);

    Route::get(
    '/transactions',
    [TransactionController::class, 'index']
);


Route::get('/dashboard', [DashboardController::class, 'index']);   

Route::post('/watchlist', [WatchlistController::class, 'store']);

Route::get('/watchlist', [WatchlistController::class, 'index']);

Route::delete('/watchlist/{id}', [WatchlistController::class, 'destroy']);

});


