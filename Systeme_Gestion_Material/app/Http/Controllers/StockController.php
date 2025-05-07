<?php

namespace App\Http\Controllers;

use App\Http\Resources\StockResource;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    public function index()
    {
        if (!auth()->check() || !auth()->user()->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized - Admin privileges required'
            ], 403);
        }

        // Charge les relations si besoin
        $stocks = Stock::with([])->get();

        return StockResource::collection($stocks);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'quantity' => 'required|integer|min:0',
            'description' => 'nullable|string',
        ]);

        $stock = Stock::create($validated);

        return response()->json([
            'message' => 'Stock created successfully',
            'data' => new StockResource($stock),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        if (!auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'quantity' => 'required|integer|min:0',
            'description' => 'nullable|string',
        ]);

        DB::transaction(function () use ($id, $validated) {
            $stock = Stock::findOrFail($id);
            $stock->update($validated);
        });

        return response()->json([
            'message' => 'Stock updated successfully',
            'data' => new StockResource(Stock::find($id)),
        ]);
    }

    public function destroy($id)
    {
        if (!auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $stock = Stock::findOrFail($id);
        $stock->delete();

        return response()->json([
            'message' => 'Stock deleted successfully'
        ], 204);
    }
}
