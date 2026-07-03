<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Http\Resources\Admin\SystemSettingResource;
use App\Traits\LogsAdminAudit;
use Illuminate\Http\Request;

class SystemSettingController extends Controller
{
    use LogsAdminAudit;

    /**
     * Display all system settings grouped or listed.
     */
    public function index()
    {
        $settings = SystemSetting::orderBy('key')->get();

        return response()->json([
            'success' => true,
            'message' => 'System settings retrieved successfully',
            'data' => [
                'settings' => SystemSettingResource::collection($settings)
            ]
        ]);
    }

    /**
     * Update or create system settings in batch.
     */
    public function update(UpdateSettingsRequest $request)
    {
        $items = $request->input('settings', []);
        $updatedSettings = [];
        $oldValues = [];
        $newValues = [];

        foreach ($items as $item) {
            $existing = SystemSetting::where('key', $item['key'])->first();
            $oldVal = $existing ? $existing->value : null;

            $setting = SystemSetting::updateOrCreate(
                ['key' => $item['key']],
                [
                    'value'       => $item['value'] ?? '',
                    'description' => $item['description'] ?? ($existing ? $existing->description : null),
                ]
            );

            $oldValues[$item['key']] = $oldVal;
            $newValues[$item['key']] = $setting->value;
            $updatedSettings[] = $setting;
        }

        $this->logAudit(
            action: 'update_system_settings',
            entityType: 'SystemSetting',
            entityId: null,
            oldValues: $oldValues,
            newValues: $newValues
        );

        return response()->json([
            'success' => true,
            'message' => 'System settings updated successfully',
            'data' => [
                'settings' => SystemSettingResource::collection($updatedSettings)
            ]
        ]);
    }
}
