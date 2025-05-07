<?php

// app/Http/Controllers/API/MaterialRequestController.php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMaterialRequestRequest;
use App\Http\Resources\MaterialRequestResource;
use App\Models\MaterialRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class MaterialRequestController extends Controller
{
    public function store(StoreMaterialRequestRequest $request): JsonResponse
    {
        $materialRequest = MaterialRequest::create([
            'material_name' => $request->material_name,
            'quantity' => $request->quantity ?? 1, // Default to 1 if not provided
            'justification' => $request->justification,
            'user_id' => Auth::id(),
        ]);

        return response()->json([
            'message' => 'Material request created successfully',
            'data' => $materialRequest
        ], 201);
    }

    // Add other API endpoints as needed (index, show, update, etc.)
    public function index()
    {
        $requests = MaterialRequest::with('user:id,name')
            ->latest()
            ->paginate(10);

        return MaterialRequestResource::collection($requests);
    }

    // public function update(Request $request, MaterialRequest $id)
    // {
    //     $validated = $request->validate([
    //         'status' => 'required|in:pending,approved,rejected,delivered',
    //         'delivery_date' => 'nullable|date',
    //         'rejection_reason' => 'nullable|string|required_if:status,rejected'
    //     ]);

    //     $request->update($validated);

    //     return response()->json([
    //         'message' => 'Request updated successfully',
    //         'data' => new MaterialRequestResource($request)
    //     ]);
    // }

    public function update(Request $request, MaterialRequest $materialRequest)
    {
        $data = $request->validate([
            'status' => 'required|in:pending,approved,rejected,delivered',
            'delivery_date' => 'nullable|date',
            'rejection_reason' => 'nullable|string|required_if:status,rejected'
        ]);

        $materialRequest->update($data);

        return response()->json($materialRequest);
    }

    public function destroy(MaterialRequest $materialRequest)
    {
        $materialRequest->delete();
        return response()->json(['message' => 'Request deleted successfully']);
    }
}