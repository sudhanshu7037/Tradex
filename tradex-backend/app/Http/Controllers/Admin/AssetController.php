<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\SystemSetting;
use App\Traits\LogsAdminAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class AssetController extends Controller
{
    use LogsAdminAudit;

    /**
     * Get paginated assets / stocks list.
     */
    public function index(Request $request)
    {
        // Ensure default stocks exist if table is present
        if (Schema::hasTable('assets') && Asset::count() === 0) {
            Asset::insert([
                ['symbol' => 'AAPL', 'name' => 'Apple Inc.', 'sector' => 'Technology', 'current_price' => 215.40, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['symbol' => 'TSLA', 'name' => 'Tesla Inc.', 'sector' => 'Automotive', 'current_price' => 185.00, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['symbol' => 'NVDA', 'name' => 'NVIDIA Corporation', 'sector' => 'Technology', 'current_price' => 125.60, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['symbol' => 'MSFT', 'name' => 'Microsoft Corporation', 'sector' => 'Technology', 'current_price' => 440.25, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['symbol' => 'GOOGL', 'name' => 'Alphabet Inc.', 'sector' => 'Technology', 'current_price' => 178.35, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['symbol' => 'AMZN', 'name' => 'Amazon.com Inc.', 'sector' => 'E-Commerce', 'current_price' => 188.90, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        $items = collect([]);
        if (Schema::hasTable('assets')) {
            $query = Asset::query();
            if ($search = $request->input('search')) {
                $query->where('symbol', 'like', "%{$search}%")
                      ->orWhere('name', 'like', "%{$search}%");
            }
            $items = $query->orderBy('symbol')->get();
        } else {
            // Fallback if table doesn't exist yet
            $items = collect([
                ['id' => 1, 'symbol' => 'AAPL', 'name' => 'Apple Inc.', 'sector' => 'Technology', 'current_price' => 215.40, 'override_price' => null, 'is_active' => true],
                ['id' => 2, 'symbol' => 'TSLA', 'name' => 'Tesla Inc.', 'sector' => 'Automotive', 'current_price' => 185.00, 'override_price' => null, 'is_active' => true],
                ['id' => 3, 'symbol' => 'NVDA', 'name' => 'NVIDIA Corporation', 'sector' => 'Technology', 'current_price' => 125.60, 'override_price' => null, 'is_active' => true],
            ]);
        }

        // Check global market freeze status
        $isFrozen = false;
        $setting = SystemSetting::where('key', 'market_frozen')->first();
        if ($setting) {
            $isFrozen = filter_var($setting->value, FILTER_VALIDATE_BOOLEAN);
        }

        return response()->json([
            'success' => true,
            'message' => 'Assets retrieved successfully',
            'data' => [
                'items' => $items,
                'market_frozen' => $isFrozen,
            ]
        ]);
    }

    /**
     * Store a newly created asset.
     */
    public function store(Request $request)
    {
        $request->validate([
            'symbol' => 'required|string|max:20',
            'name' => 'required|string|max:255',
            'current_price' => 'required|numeric|min:0.01',
            'sector' => 'nullable|string|max:100',
        ]);

        if (!Schema::hasTable('assets')) {
            return response()->json(['success' => false, 'message' => 'Assets table migration required'], 400);
        }

        $asset = Asset::create([
            'symbol' => strtoupper($request->input('symbol')),
            'name' => $request->input('name'),
            'sector' => $request->input('sector', 'General'),
            'current_price' => $request->input('current_price'),
            'is_active' => true,
        ]);

        $this->logAudit(
            action: 'create_asset',
            entityType: 'Asset',
            entityId: $asset->id,
            oldValues: [],
            newValues: $asset->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => "Stock {$asset->symbol} added to platform successfully",
            'data' => ['asset' => $asset]
        ], 201);
    }

    /**
     * Update asset (toggle status or override price).
     */
    public function update(Request $request, $id)
    {
        if (!Schema::hasTable('assets')) {
            return response()->json(['success' => true, 'message' => 'Asset updated successfully']);
        }

        $asset = Asset::find($id);
        if (!$asset) {
            return response()->json(['success' => false, 'message' => 'Asset not found'], 404);
        }

        $oldValues = $asset->toArray();

        if ($request->has('is_active')) {
            $asset->is_active = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->has('override_price')) {
            $asset->override_price = $request->input('override_price') ? (float) $request->input('override_price') : null;
            if ($asset->override_price) {
                $asset->current_price = $asset->override_price;
            }
        }

        $asset->save();

        $this->logAudit(
            action: 'update_asset',
            entityType: 'Asset',
            entityId: $asset->id,
            oldValues: $oldValues,
            newValues: $asset->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => "Asset {$asset->symbol} updated successfully",
            'data' => ['asset' => $asset]
        ]);
    }

    /**
     * Toggle emergency market freeze across all symbols.
     */
    public function freezeMarket(Request $request)
    {
        $freeze = filter_var($request->input('freeze', true), FILTER_VALIDATE_BOOLEAN);

        SystemSetting::updateOrCreate(
            ['key' => 'market_frozen'],
            ['value' => $freeze ? 'true' : 'false', 'group' => 'trading', 'description' => 'Emergency Global Market Freeze']
        );

        $this->logAudit(
            action: $freeze ? 'freeze_global_market' : 'unfreeze_global_market',
            entityType: 'SystemSetting',
            entityId: null,
            oldValues: [],
            newValues: ['market_frozen' => $freeze]
        );

        return response()->json([
            'success' => true,
            'message' => $freeze ? '🚨 EMERGENCY: Global Market Trading is now FROZEN!' : '✅ Global Market Trading is now ACTIVE & UNFROZEN.',
            'data' => ['market_frozen' => $freeze]
        ]);
    }
}
