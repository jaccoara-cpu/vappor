<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    /**
     * Get all products for admin
     */
    public function products(): JsonResponse
    {
        $products = Product::with('volumeStocks')->orderBy('created_at', 'desc')->get();
        return response()->json($products);
    }

    /**
     * Get all orders for admin
     */
    public function orders(): JsonResponse
    {
        $orders = Order::with('product')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($orders);
    }

    /**
     * Get order statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_products' => Product::count(),
            'active_products' => Product::where('is_active', true)->count(),
            'total_orders' => Order::count(),
            'new_orders' => Order::where('status', 'new')->count(),
            'completed_orders' => Order::where('status', 'completed')->count(),
        ];

        return response()->json($stats);
    }
}
