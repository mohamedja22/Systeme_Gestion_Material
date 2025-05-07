<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MaterialRequestResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'demandeur' => $this->user->name,
            'material' => $this->material_name,
            'quantity' => $this->quantity,
            'date' => $this->created_at->format('Y-m-d H:i'),
            'status' => $this->status,
            'delivery_date' => $this->delivery_date?->format('Y-m-d'),
            'rejection_reason' => $this->rejection_reason,
            'justification' => $this->justification,
            'actions' => [
                'edit' => route('material-requests.update', $this->id),
                'delete' => route('material-requests.destroy', $this->id)
            ]
        ];
    }
}