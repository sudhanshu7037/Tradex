<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Http\Requests\Admin\StoreAdminRequest;
use App\Http\Requests\Admin\UpdateAdminRequest;
use App\Http\Resources\Admin\AdminResource;
use App\Traits\LogsAdminAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    use LogsAdminAudit;

    /**
     * Display a paginated list of admins.
     */
    public function index(Request $request)
    {
        $query = Admin::with('roles');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $perPage = (int) $request->input('per_page', 15);
        $admins = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Admins retrieved successfully',
            'data' => [
                'items' => AdminResource::collection($admins->items()),
                'pagination' => [
                    'current_page' => $admins->currentPage(),
                    'last_page'    => $admins->lastPage(),
                    'per_page'     => $admins->perPage(),
                    'total'        => $admins->total(),
                ],
            ]
        ]);
    }

    /**
     * Store a newly created admin account in storage.
     */
    public function store(StoreAdminRequest $request)
    {
        $data = $request->only(['name', 'email', 'status']);
        $data['password'] = Hash::make($request->input('password'));
        $data['status'] = $data['status'] ?? 'active';

        $admin = Admin::create($data);

        if ($request->has('roles')) {
            $admin->roles()->sync($request->input('roles', []));
        }

        $admin->load('roles');

        $this->logAudit(
            action: 'create_admin',
            entityType: 'Admin',
            entityId: $admin->id,
            newValues: [
                'name' => $admin->name,
                'email' => $admin->email,
                'status' => $admin->status,
                'roles' => $request->input('roles')
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Admin account created successfully',
            'data' => [
                'admin' => new AdminResource($admin)
            ]
        ], 201);
    }

    /**
     * Display the specified admin account.
     */
    public function show($id)
    {
        $admin = Admin::with('roles.permissions')->find($id);

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Admin account not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Admin account retrieved successfully',
            'data' => [
                'admin' => new AdminResource($admin)
            ]
        ]);
    }

    /**
     * Update the specified admin account in storage.
     */
    public function update(UpdateAdminRequest $request, $id)
    {
        $admin = Admin::find($id);

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Admin account not found'
            ], 404);
        }

        $oldValues = [
            'name' => $admin->name,
            'email' => $admin->email,
            'status' => $admin->status,
            'roles' => $admin->roles()->pluck('roles.id')->toArray()
        ];

        $data = $request->only(['name', 'email', 'status']);
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->input('password'));
        }

        $admin->update($data);

        if ($request->has('roles')) {
            $admin->roles()->sync($request->input('roles', []));
        }

        $admin->load('roles');

        $this->logAudit(
            action: 'update_admin',
            entityType: 'Admin',
            entityId: $admin->id,
            oldValues: $oldValues,
            newValues: [
                'name' => $admin->name,
                'email' => $admin->email,
                'status' => $admin->status,
                'roles' => $request->input('roles')
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Admin account updated successfully',
            'data' => [
                'admin' => new AdminResource($admin)
            ]
        ]);
    }

    /**
     * Remove the specified admin account from storage.
     */
    public function destroy(Request $request, $id)
    {
        $admin = Admin::find($id);

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Admin account not found'
            ], 404);
        }

        // Prevent self-deletion
        if ($request->user() && $request->user()->id == $id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete your own admin account'
            ], 403);
        }

        $oldValues = $admin->toArray();
        $admin->roles()->detach();
        $admin->delete();

        $this->logAudit(
            action: 'delete_admin',
            entityType: 'Admin',
            entityId: $id,
            oldValues: $oldValues
        );

        return response()->json([
            'success' => true,
            'message' => 'Admin account deleted successfully',
            'data' => []
        ]);
    }
}
