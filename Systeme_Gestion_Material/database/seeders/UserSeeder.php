<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        // Initialize Faker
        $faker = Faker::create();

        // Get the 'validator' and 'employee' roles
        $validatorRole = Role::where('name', 'validator')->first();
        $employeeRole = Role::where('name', 'employee')->first();

        // Ensure the roles exist
        if (!$validatorRole || !$employeeRole) {
            $this->command->error('Roles "validator" and "employee" must exist!');
            return;
        }

        // Create 10 random users
        for ($i = 0; $i < 10; $i++) {
            $role = $faker->randomElement([$validatorRole, $employeeRole]);

            User::create([
                'name' => $faker->name,
                'email' => $faker->unique()->safeEmail,
                'password' => Hash::make('password@123'), 
                'role_id' => $role->id, 
            ]);
        }

        $this->command->info('10 random users created successfully!');
    }
}
