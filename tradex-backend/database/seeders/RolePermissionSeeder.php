<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $roles = Role::all()->keyBy('slug');
        $permissions = Permission::all()->keyBy('slug');

        // Super Admin → All Permissions
        $roles['super_admin']->permissions()->sync(
            $permissions->pluck('id')->toArray()
        );

        // Admin
        $roles['admin']->permissions()->sync([
            $permissions['manage_users']->id,
            $permissions['manage_orders']->id,
            $permissions['manage_assets']->id,
            $permissions['view_audit_logs']->id,
            $permissions['view_dashboard']->id,
        ]);

        // Moderator
        $roles['moderator']->permissions()->sync([
            $permissions['manage_users']->id,
            $permissions['manage_orders']->id,
            $permissions['view_dashboard']->id,
        ]);

        // Support Executive
        $roles['support_executive']->permissions()->sync([
            $permissions['view_dashboard']->id,
        ]);

        // Compliance Officer
        $roles['compliance_officer']->permissions()->sync([
            $permissions['manage_orders']->id,
            $permissions['view_audit_logs']->id,
            $permissions['view_dashboard']->id,
        ]);
    }
}