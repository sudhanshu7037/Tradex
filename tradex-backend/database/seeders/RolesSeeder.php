<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Super Admin',
                'slug' => 'super_admin',
                'description' => 'Full system access',
            ],
            [
                'name' => 'Admin',
                'slug' => 'admin',
                'description' => 'Platform administrator',
            ],
            [
                'name' => 'Moderator',
                'slug' => 'moderator',
                'description' => 'User and order moderation',
            ],
            [
                'name' => 'Support Executive',
                'slug' => 'support_executive',
                'description' => 'Customer support access',
            ],
            [
                'name' => 'Compliance Officer',
                'slug' => 'compliance_officer',
                'description' => 'Compliance and audit access',
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['slug' => $role['slug']],
                $role
            );
        }
    }
}