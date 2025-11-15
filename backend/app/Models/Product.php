<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name',
        'category',
        'description',
        'price',
        'image_path',
        'flavors',
        'volumes',
        'is_active',
        'quantity',
        'purchase_price',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'purchase_price' => 'decimal:2',
        'is_active' => 'boolean',
        'flavors' => 'array',
        'volumes' => 'array',
        'quantity' => 'integer',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function volumeStocks(): HasMany
    {
        return $this->hasMany(ProductVolumeStock::class);
    }
}
