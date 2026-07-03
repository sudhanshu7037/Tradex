<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class PermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [

            [
                'name' => 'Manage Admins',
                'slug' => 'manage_admins',
                'description' => 'Create and manage admins',
            ],

            [
                'name' => 'Manage Users',
                'slug' => 'manage_users',
                'description' => 'Manage platform users',
            ],

            [
                'name' => 'Manage Orders',
                'slug' => 'manage_orders',
                'description' => 'Manage trading orders',
            ],

            [
                'name' => 'Manage Assets',
                'slug' => 'manage_assets',
                'description' => 'Manage stocks and assets',
            ],

            [
                'name' => 'Manage Settings',
                'slug' => 'manage_settings',
                'description' => 'Manage system settings',
            ],

            [
                'name' => 'View Audit Logs',
                'slug' => 'view_audit_logs',
                'description' => 'View audit history',
            ],

            [
                'name' => 'Manage Roles',
                'slug' => 'manage_roles',
                'description' => 'Manage roles',
            ],

            [
                'name' => 'Manage Permissions',
                'slug' => 'manage_permissions',
                'description' => 'Manage permissions',
            ],

            [
                'name' => 'View Dashboard',
                'slug' => 'view_dashboard',
                'description' => 'View admin dashboard',
            ],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['slug' => $permission['slug']],
                $permission
            );
        }
    }
}