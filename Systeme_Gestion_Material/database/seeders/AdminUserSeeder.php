<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
{
    $user = \App\Models\User::create([
        'name' => 'System Admin',
        'email' => 'sysadmin@yourdomain.com',
        'password' => bcrypt('Admin@2025'),
    ]);

    \App\Models\Employee::create([
        'matricule' => 'SYSADMIN',
        'user_id' => $user->id,
        'role_id' => 1,
    ]);
}
}
