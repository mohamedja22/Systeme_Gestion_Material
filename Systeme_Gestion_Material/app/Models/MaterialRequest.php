<?php

// app/Models/MaterialRequest.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaterialRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'material_name',
        'quantity',
        'justification',
        'user_id',
        'status',
        'delivery_date',
        'rejection_reason'
    ];

    protected $attributes = [
        'quantity' => 1, // Default value
    ];

    /*** Cast fields to proper types */
    protected $casts = [
    'delivery_date'    => 'datetime:Y-m-d\TH:i:s\Z', // Format ISO
    'created_at'       => 'datetime:Y-m-d\TH:i:s\Z', // Format ISO
    'updated_at'       => 'datetime:Y-m-d\TH:i:s\Z', // Format ISO
];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}