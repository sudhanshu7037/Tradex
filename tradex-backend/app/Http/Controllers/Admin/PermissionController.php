<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Http\Requests\Admin\StorePermissionRequest;
use App\Http\Requests\Admin\UpdatePermissionRequest;
use App\Http\Resources\Admin\PermissionResource;
use App\Traits\LogsAdminAudit;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    use LogsAdminAudit;

    /**
     * Display a list of all permissions.
     */
    public function index()
    {
        $permissions = Permission::orderBy('id')->get();

        return response()->json([
            'success' => true,
            'message' => 'Permissions retrieved successfully',
            'data' => [
                'permissions' => PermissionResource::collection($permissions)
            ]
        ]);
    }

    /**
     * Store a newly created permission in storage.
     */
    public function store(StorePermissionRequest $request)
    {
        $permission = Permission::create($request->only(['name', 'slug', 'description']));

        $this->logAudit(
            action: 'create_permission',
            entityType: 'Permission',
            entityId: $permission->id,
            newValues: $permission->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'Permission created successfully',
            'data' => [
                'permission' => new PermissionResource($permission)
            ]
        ], 201);
    }

    /**
     * Display the specified permission.
     */
    public function show($id)
    {
        $permission = Permission::find($id);

        if (!$permission) {
            return response()->json([
                'success' => false,
                'message' => 'Permission not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Permission retrieved successfully',
            'data' => [
                'permission' => new PermissionResource($permission)
            ]
        ]);
    }

    /**
     * Update the specified permission in storage.
     */
    public function update(UpdatePermissionRequest $request, $id)
    {
        $permission = Permission::find($id);

        if (!$permission) {
            return response()->json([
                'success' => false,
                'message' => 'Permission not found'
            ], 404);
        }

        $oldValues = $permission->toArray();
        $permission->update($request->only(['name', 'slug', 'description']));

        $this->logAudit(
            action: 'update_permission',
            entityType: 'Permission',
            entityId: $permission->id,
            oldValues: $oldValues,
            newValues: $permission->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'Permission updated successfully',
            'data' => [
                'permission' => new PermissionResource($permission)
            ]
        ]);
    }

    /**
     * Remove the specified permission from storage.
     */
    public function destroy($id)
    {
        $permission = Permission::find($id);

        if (!$permission) {
            return response()->json([
                'success' => false,
                'message' => 'Permission not found'
            ], 404);
        }

        $oldValues = $permission->toArray();
        $permission->roles()->detach();
        $permission->delete();

        $this->logAudit(
            action: 'delete_permission',
            entityType: 'Permission',
            entityId: $id,
            oldValues: $oldValues
        );

        return response()->json([
            'success' => true,
            'message' => 'Permission deleted successfully',
            'data' => []
        ]);
    }
}
