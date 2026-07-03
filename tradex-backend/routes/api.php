<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\TradeController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\WatchlistController;
use App\Http\Controllers\Admin\AuthController4;

// Admin Controllers
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\PortfolioController as AdminPortfolioController;
use App\Http\Controllers\Admin\TransactionController as AdminTransactionController;
use App\Http\Controllers\Admin\WatchlistController as AdminWatchlistController;
use App\Http\Controllers\Admin\RoleController as AdminRoleController;
use App\Http\Controllers\Admin\PermissionController as AdminPermissionController;
use App\Http\Controllers\Admin\AdminController as AdminController;
use App\Http\Controllers\Admin\AuditLogController as AdminAuditLogController;
use App\Http\Controllers\Admin\SystemSettingController as AdminSystemSettingController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\AssetController as AdminAssetController;

// 👇 FOR API TESTING
Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'API Working'
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/stocks/search', [StockController::class, 'search']);
    Route::get('/stocks/{symbol}', [StockController::class, 'getCurrentStockPrice']);
    Route::post('/trade/execute', [TradeController::class, 'executeTrade']);
    Route::get('/portfolio', [PortfolioController::class, 'index']);
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::post('/watchlist', [WatchlistController::class, 'store']);
    Route::get('/watchlist', [WatchlistController::class, 'index']);
    Route::delete('/watchlist/{id}', [WatchlistController::class, 'destroy']);
});

// ==========================================
// Admin Related APIs (Phases 1 - 11)
// ==========================================

Route::prefix('v1/admin')->group(function () {
    Route::post('/login', [AuthController4::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        // Phase 1: Profile & Logout
        Route::get('/profile', [AuthController4::class, 'profile']);
        Route::post('/logout', [AuthController4::class, 'logout']);

        // Phase 2: Dashboard & Recent Activities
        Route::middleware('permission:view_dashboard')->group(function () {
            Route::get('/dashboard', [AdminDashboardController::class, 'index']);
            Route::get('/recent-activities', [AdminDashboardController::class, 'recentActivities']);
        });

        // Phase 3: User Management
        Route::middleware('permission:manage_users')->group(function () {
            Route::get('/users', [AdminUserController::class, 'index']);
            Route::get('/users/{id}', [AdminUserController::class, 'show']);
            Route::patch('/users/{id}/status', [AdminUserController::class, 'updateStatus']);
            Route::patch('/users/{id}/block', [AdminUserController::class, 'block']);
            Route::patch('/users/{id}/unblock', [AdminUserController::class, 'unblock']);
            Route::post('/users/{id}/adjust-balance', [AdminUserController::class, 'adjustBalance']);
            Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);
        });

        // Phase 4 & Phase 6: Assets Management (Portfolios, Watchlists & Stock Assets)
        Route::middleware('permission:manage_assets')->group(function () {
            // Stock Assets & Market Control
            Route::get('/assets', [AdminAssetController::class, 'index']);
            Route::post('/assets', [AdminAssetController::class, 'store']);
            Route::patch('/assets/{id}', [AdminAssetController::class, 'update']);
            Route::patch('/market/freeze', [AdminAssetController::class, 'freezeMarket']);

            // Portfolios
            Route::get('/portfolios', [AdminPortfolioController::class, 'index']);
            Route::get('/portfolios/{userId}', [AdminPortfolioController::class, 'showUserPortfolio']);

            // Watchlists
            Route::get('/watchlists', [AdminWatchlistController::class, 'index']);
            Route::get('/watchlists/{userId}', [AdminWatchlistController::class, 'showUserWatchlist']);
        });

        // Phase 5: Order & Transaction Management
        Route::middleware('permission:manage_orders')->group(function () {
            Route::get('/orders', [AdminOrderController::class, 'index']);
            Route::patch('/orders/{id}/cancel', [AdminOrderController::class, 'cancel']);
            Route::get('/transactions', [AdminTransactionController::class, 'index']);
            Route::get('/transactions/{id}', [AdminTransactionController::class, 'show']);
        });

        // Phase 7: Role Management
        Route::middleware('permission:manage_roles')->group(function () {
            Route::get('/roles', [AdminRoleController::class, 'index']);
            Route::post('/roles', [AdminRoleController::class, 'store']);
            Route::get('/roles/{id}', [AdminRoleController::class, 'show']);
            Route::put('/roles/{id}', [AdminRoleController::class, 'update']);
            Route::delete('/roles/{id}', [AdminRoleController::class, 'destroy']);
        });

        // Phase 8: Permission Management
        Route::middleware('permission:manage_permissions')->group(function () {
            Route::get('/permissions', [AdminPermissionController::class, 'index']);
            Route::post('/permissions', [AdminPermissionController::class, 'store']);
            Route::get('/permissions/{id}', [AdminPermissionController::class, 'show']);
            Route::put('/permissions/{id}', [AdminPermissionController::class, 'update']);
            Route::delete('/permissions/{id}', [AdminPermissionController::class, 'destroy']);
        });

        // Phase 9: Admin Management
        Route::middleware('permission:manage_admins')->group(function () {
            Route::get('/admins', [AdminController::class, 'index']);
            Route::post('/admins', [AdminController::class, 'store']);
            Route::get('/admins/{id}', [AdminController::class, 'show']);
            Route::put('/admins/{id}', [AdminController::class, 'update']);
            Route::delete('/admins/{id}', [AdminController::class, 'destroy']);
        });

        // Phase 10: Audit Logs
        Route::middleware('permission:view_audit_logs')->group(function () {
            Route::get('/audit-logs', [AdminAuditLogController::class, 'index']);
            Route::get('/audit-logs/{id}', [AdminAuditLogController::class, 'show']);
        });

        // Phase 11: System Settings
        Route::middleware('permission:manage_settings')->group(function () {
            Route::get('/settings', [AdminSystemSettingController::class, 'index']);
            Route::put('/settings', [AdminSystemSettingController::class, 'update']);
        });
    });

    // Test Routes (Existing)
    Route::middleware(['auth:sanctum', 'permission:manage_users'])->get('/test-users', function () {
        return response()->json(['success' => true, 'message' => 'Permission Granted']);
    });

    Route::middleware(['auth:sanctum', 'role:super_admin'])->get('/test-role', function () {
        return response()->json(['success' => true, 'message' => 'Role Granted']);
    });
});
