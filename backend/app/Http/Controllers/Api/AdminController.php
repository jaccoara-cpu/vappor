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
            // Сначала пытаемся использовать ProductSeeder, который импортирует изображения
            try {
                Artisan::call('db:seed', ['--class' => 'ProductSeeder', '--force' => true]);
                $output = Artisan::output();
                Log::info('Products seeded with images', ['output' => $output]);
                
                $activeCount = Product::where('is_active', true)->count();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Products created successfully with images using ProductSeeder',
                    'active_products' => $activeCount,
                    'output' => $output
                ]);
            } catch (\Exception $e) {
                Log::warning('ProductSeeder failed, creating products without images', ['error' => $e->getMessage()]);
                // Fallback: создаем товары без изображений
            }
            
            // Fallback: создаем товары без изображений
            $products = [
                [
                    'name' => 'Chaser for pods',
                    'category' => 'Chaser for pods',
                    'description' => 'Премиум жидкость для парения',
                    'price' => 325.00,
                    'is_active' => true,
                    'flavors' => [
                        ['name' => 'Виноград', 'image_path' => null, 'is_active' => true],
                        ['name' => 'Вишня', 'image_path' => null, 'is_active' => true],
                        ['name' => 'Вишня Ментол', 'image_path' => null, 'is_active' => true],
                        ['name' => 'Персик', 'image_path' => null, 'is_active' => true],
                        ['name' => 'Смородина ментоол', 'image_path' => null, 'is_active' => true],
                    ],
                    'volumes' => [
                        '30ml' => [
                            'flavors' => [
                                ['name' => 'Виноград', 'image_path' => null, 'is_active' => true],
                                ['name' => 'Вишня', 'image_path' => null, 'is_active' => true],
                                ['name' => 'Вишня Ментол', 'image_path' => null, 'is_active' => true],
                                ['name' => 'Персик', 'image_path' => null, 'is_active' => true],
                                ['name' => 'Смородина ментоол', 'image_path' => null, 'is_active' => true],
                            ],
                            'price' => 325.00,
                        ],
                        '10ml' => [
                            'flavors' => [
                                ['name' => 'Полуниця', 'image_path' => null, 'is_active' => true],
                                ['name' => 'Ягоди', 'image_path' => null, 'is_active' => true],
                                ['name' => 'М\'ята', 'image_path' => null, 'is_active' => true],
                                ['name' => 'Персик', 'image_path' => null, 'is_active' => true],
                            ],
                            'price' => 150.00,
                        ],
                    ],
                    'purchase_price' => 165.0,
                ],
                [
                    'name' => 'Sticks for IQOS',
                    'category' => 'Sticks for IQOS',
                    'description' => 'Премиум стіки для IQOS',
                    'price' => 120.00,
                    'is_active' => true,
                    'flavors' => [
                        ['name' => 'Амброзия', 'image_path' => null, 'is_active' => true],
                        ['name' => 'Бронзове сонце', 'image_path' => null, 'is_active' => true],
                        ['name' => 'Світанок', 'image_path' => null, 'is_active' => true],
                        ['name' => 'Зелений тютюн', 'image_path' => null, 'is_active' => true],
                        ['name' => 'Жовтий тютюн', 'image_path' => null, 'is_active' => true],
                        ['name' => 'Сірий тютюн', 'image_path' => null, 'is_active' => true],
                        ['name' => 'Свіжість', 'image_path' => null, 'is_active' => true],
                        ['name' => 'М\'ята', 'image_path' => null, 'is_active' => true],
                        ['name' => 'Смарагд', 'image_path' => null, 'is_active' => true],
                        ['name' => 'Класичний', 'image_path' => null, 'is_active' => true],
                    ],
                    'purchase_price' => 50.0,
                ],
                [
                    'name' => 'Chaser My Mint',
                    'category' => 'Chaser My Mint',
                    'description' => 'Премиум жидкость линейки My Mint 30ml',
                    'price' => 325.00,
                    'is_active' => true,
                    'flavors' => [
                        ['name' => 'Bubble Mint', 'image_path' => null, 'is_active' => true],
                        ['name' => 'Cranberry Mint', 'image_path' => null, 'is_active' => true],
                        ['name' => 'Bilberry Mint', 'image_path' => null, 'is_active' => true],
                    ],
                    'purchase_price' => 165.0,
                ],
                [
                    'name' => 'Vaporesso XROS 0.6Ω',
                    'category' => 'Cartridges',
                    'description' => 'Картридж для Vaporesso XROS Series 0.6Ω',
                    'price' => 135.00,
                    'is_active' => true,
                    'flavors' => [],
                    'purchase_price' => 78.0,
                ],
                [
                    'name' => 'Chaser Mix',
                    'category' => 'Chaser Mix',
                    'description' => 'Премиум жидкость линейки Mix 30ml',
                    'price' => 350.00,
                    'is_active' => true,
                    'flavors' => [
                        ['name' => 'Ожиновий джем', 'image_path' => null, 'is_active' => true],
                    ],
                    'purchase_price' => 165.0,
                ],
            ];

            $created = 0;
            foreach ($products as $productData) {
                Product::updateOrCreate(
                    ['name' => $productData['name'], 'category' => $productData['category']],
                    $productData
                );
                $created++;
            }

            $activeCount = Product::where('is_active', true)->count();

            return response()->json([
                'success' => true,
                'message' => 'Basic products created successfully',
                'created' => $created,
                'active_products' => $activeCount
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create basic products', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create products: ' . $e->getMessage()
            ], 500);
        }
    }
}
