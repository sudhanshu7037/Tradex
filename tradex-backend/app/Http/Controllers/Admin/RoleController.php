<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Http\Requests\Admin\StoreRoleRequest;
use App\Http\Requests\Admin\UpdateRoleRequest;
use App\Http\Resources\Admin\RoleResource;
use App\Traits\LogsAdminAudit;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    use LogsAdminAudit;

    /**
     * Display a list of roles.
     */
    public function index()
    {
        $roles = Role::with('permissions')->orderBy('id')->get();

        return response()->json([
            'success' => true,
            'message' => 'Roles retrieved successfully',
            'data' => [
                'roles' => RoleResource::collection($roles)
            ]
        ]);
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(StoreRoleRequest $request)
    {
        $role = Role::create($request->only(['name', 'slug', 'description']));

        if ($request->has('permissions')) {
            $role->permissions()->sync($request->input('permissions', []));
        }

        $role->load('permissions');

        $this->logAudit(
            action: 'create_role',
            entityType: 'Role',
            entityId: $role->id,
            newValues: [
                'name' => $role->name,
                'slug' => $role->slug,
                'permissions' => $request->input('permissions')
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Role created successfully',
            'data' => [
                'role' => new RoleResource($role)
            ]
        ], 201);
    }

    /**
     * Display the specified role.
     */
    public function show($id)
    {
        $role = Role::with('permissions')->find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Role retrieved successfully',
            'data' => [
                'role' => new RoleResource($role)
            ]
        ]);
    }

    /**
     * Update the specified role in storage.
     */
    public function update(UpdateRoleRequest $request, $id)
    {
        $role = Role::find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found'
            ], 404);
        }

        if ($role->slug === 'super_admin' && $request->has('slug') && $request->input('slug') !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot change slug of super_admin role'
            ], 403);
        }

        $oldValues = [
            'name' => $role->name,
            'slug' => $role->slug,
            'description' => $role->description,
            'permissions' => $role->permissions()->pluck('permissions.id')->toArray()
        ];

        $role->update($request->only(['name', 'slug', 'description']));

        if ($request->has('permissions')) {
            $role->permissions()->sync($request->input('permissions', []));
        }

        $role->load('permissions');

        $this->logAudit(
            action: 'update_role',
            entityType: 'Role',
            entityId: $role->id,
            oldValues: $oldValues,
            newValues: [
                'name' => $role->name,
                'slug' => $role->slug,
                'description' => $role->description,
                'permissions' => $request->input('permissions')
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Role updated successfully',
            'data' => [
                'role' => new RoleResource($role)
            ]
        ]);
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy($id)
    {
        $role = Role::find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found'
            ], 404);
        }

        if ($role->slug === 'super_admin' || $role->is_system) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete system or super_admin role'
            ], 403);
        }

        $oldValues = $role->toArray();
        $role->permissions()->detach();
        $role->delete();

        $this->logAudit(
            action: 'delete_role',
            entityType: 'Role',
            entityId: $id,
            oldValues: $oldValues
        );

        return response()->json([
            'success' => true,
            'message' => 'Role deleted successfully',
            'data' => []
        ]);
    }
}
