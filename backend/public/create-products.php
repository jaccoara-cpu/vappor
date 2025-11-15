<?php
/**
 * Quick script to create products - call via: https://vapor-backend-sy48.onrender.com/create-products.php
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Product;

header('Content-Type: application/json');

try {
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
        $product = Product::updateOrCreate(
            ['name' => $productData['name'], 'category' => $productData['category']],
            $productData
        );
        $created++;
    }

    $activeCount = Product::where('is_active', true)->count();

    echo json_encode([
        'success' => true,
        'message' => 'Products created successfully',
        'created' => $created,
        'active_products' => $activeCount
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to create products: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}

