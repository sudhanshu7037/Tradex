<?php

namespace App\Http\Controllers\Admin;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;



class AuthController4 extends Controller
{
   
    
    public function login(Request $request)
{


    
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $admin = Admin::where('email', $request->email)->first();

    if (!$admin || !Hash::check($request->password, $admin->password)) {
        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials'
        ], 401);
    }

    if ($admin->status !== 'active') {
        return response()->json([
            'success' => false,
            'message' => 'Admin account is not active'
        ], 403);
    }

    $token = $admin->createToken('admin-token')->plainTextToken;

    $admin->update([
        'last_login_at' => now()
    ]);

    AdminAuditLog::create([
    'admin_id'    => $admin->id,
    'action'      => 'login',
    'entity_type' => 'admin',
    'entity_id'   => $admin->id,
    'ip_address'  => $request->ip(),
    'user_agent'  => $request->userAgent(),
]);

    $admin->load('roles.permissions');
    $permissions = $admin->roles
        ->flatMap(fn($role) => $role->permissions)
        ->pluck('slug')
        ->unique()
        ->values();

    return response()->json([
        'success' => true,
        'message' => 'Login successful',
        'token' => $token,
        'admin' => [
            'id' => $admin->id,
            'name' => $admin->name,
            'email' => $admin->email,
            'status' => $admin->status,
            'roles' => $admin->roles->map(fn($r) => ['id' => $r->id, 'name' => $r->name, 'slug' => $r->slug]),
            'permissions' => $permissions
        ]
    ]);
}


public function profile(Request $request)
{
    $admin = Admin::with('roles.permissions')
        ->find($request->user()->id);

    $permissions = $admin->roles
        ->flatMap(fn($role) => $role->permissions)
        ->pluck('slug')
        ->unique()
        ->values();

    return response()->json([
        'success' => true,
        'data' => [
            'id' => $admin->id,
            'name' => $admin->name,
            'email' => $admin->email,
            'status' => $admin->status,
            'last_login_at' => $admin->last_login_at,
            'roles' => $admin->roles->map(fn($r) => ['id' => $r->id, 'name' => $r->name, 'slug' => $r->slug]),
            'permissions' => $permissions
        ]
    ]);
}


public function logout(Request $request)
{



    $admin = $request->user();

    AdminAuditLog::create([
    'admin_id'    => $admin->id,
    'action'      => 'logout',
    'entity_type' => 'admin',
    'entity_id'   => $admin->id,
    'ip_address'  => $request->ip(),
    'user_agent'  => $request->userAgent(),
]);
         $admin->currentAccessToken()
        ->delete();

    return response()->json([
        'success' => true,
        'message' => 'Logout successful'
    ]);
}



}
