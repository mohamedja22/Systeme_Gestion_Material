<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Mail\UserAccountNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class EmployeeController extends Controller {


    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index()
    {
        $employees = Employee::whereHas('role', function($query) {
            $query->where('name', '!=', 'administrateur'); // Exclude admins
        })
        ->orderBy('created_at', 'desc')
        ->paginate(10);

        return EmployeeResource::collection($employees);
    }
    
    public function store(StoreEmployeeRequest $request) 
    {

        if (!auth()->user()->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized - Admin privileges required'
            ], 403);
        }


        // Create user first
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password ? Hash::make($request->password) : Hash::make('password@123'),
        ]);

        // Get the role ID
        $role = Role::where('name', strtolower($request->role))->firstOrFail();

        // Then create employee record
        $employee = $user->employee()->create([
            'matricule' => $this->generateMatricule(),
            'role_id' => $role->id
        ]);

        // Send email notification
        Mail::to($user->email)->send(
            new UserAccountNotification($user, 'password@123')
        );

        return  response(new EmployeeResource($employee), 201);
    }

    public function update(UpdateEmployeeRequest $request, $id)
    {
        // Find employee or fail
        $employee = Employee::with('user', 'role')->findOrFail($id);

        // Authorization - using your existing admin check
        if (!auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        DB::transaction(function () use ($request, $employee) {
            // Update employee fields
            $employeeFields = $request->only(['matricule', 'department', 'position']);
            if (!empty($employeeFields)) {
                $employee->update($employeeFields);
            }

            // Update role if provided
            if ($request->has('role')) {
                $role = Role::where('name', strtolower($request->role))->firstOrFail();
                $employee->update(['role_id' => $role->id]);
            }

            // Update user fields
            if ($employee->user) {
                $userFields = $request->only(['name', 'email']);
                if (!empty($userFields)) {
                    $employee->user->update($userFields);
                }
            }
        });

        // Return fresh data with relationships
        return new EmployeeResource($employee->fresh());
    }

    public function destroy($id)
    {
        // Find the employee or fail with 404
        $employee = Employee::findOrFail($id);

        // Verify the authenticated user is an admin
        if (!auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Use transaction for data integrity
        DB::transaction(function () use ($employee) {
            // Delete the associated user if needed
            if ($employee->user) {
                $employee->user->delete();
            }
            
            // Delete the employee record
            $employee->delete();
        });

        return response()->json([
            'message' => 'Employee deleted successfully'
        ], 204); // 204 No Content is standard for delete operations
    }

    // protected function generateMatricule() {
    //     return 'EMP' . now()->format('Ym') . str_pad(Employee::count() + 1, 1, '0', STR_PAD_LEFT);
    // }
}
