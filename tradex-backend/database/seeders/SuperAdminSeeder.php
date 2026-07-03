<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Admin;
use App\Models\Role;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Admin::updateOrCreate(
            [
                'email' => 'admin@tradex.com',
            ],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('Admin@123'),
                'status' => 'active',
            ]
        );

        $role = Role::where('slug', 'super_admin')->first();

        if ($role) {
            $admin->roles()->syncWithoutDetaching([$role->id]);
        }
    }
}