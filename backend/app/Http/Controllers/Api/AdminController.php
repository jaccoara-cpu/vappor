<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

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

    /**
     * Seed products (for initial setup or reset)
     */
    public function seedProducts(Request $request): JsonResponse
    {
        try {
            // Run the ProductSeeder
            Artisan::call('db:seed', ['--class' => 'ProductSeeder', '--force' => true]);
            
            $output = Artisan::output();
            Log::info('Products seeded', ['output' => $output]);
            
            $activeCount = Product::where('is_active', true)->count();
            
            return response()->json([
                'success' => true,
                'message' => 'Products seeded successfully',
                'active_products' => $activeCount,
                'output' => $output
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to seed products', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to seed products: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create basic products directly (for quick setup without images)
     * Uses ProductSeeder to import images if folders exist
     */
    public function createBasicProducts(): JsonResponse
    {
        try {
            // ВСЕГДА используем ProductSeeder, который импортирует изображения
            Artisan::call('db:seed', ['--class' => 'ProductSeeder', '--force' => true]);
            $output = Artisan::output();
            Log::info('Products seeded with images', ['output' => $output]);
            
            $activeCount = Product::where('is_active', true)->count();
            $productsWithImages = Product::where('is_active', true)->whereNotNull('image_path')->count();
            
            return response()->json([
                'success' => true,
                'message' => 'Products created using ProductSeeder',
                'active_products' => $activeCount,
                'products_with_images' => $productsWithImages,
                'output' => $output
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to seed products', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create products: ' . $e->getMessage()
            ], 500);
        }
    }
    
}
