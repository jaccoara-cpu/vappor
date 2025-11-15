<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVolumeStock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FinanceController extends Controller
{
    /**
     * Получить категорию товара для группировки
     */
    private function getCategoryGroup(string $category): string
    {
        $liquidCategories = ['Chaser for pods', 'Chaser My Mint', 'Chaser Mix'];
        if (in_array($category, $liquidCategories)) {
            return 'Жижа';
        }
        if ($category === 'Sticks for IQOS') {
            return 'Стики';
        }
        if ($category === 'Cartridges') {
            return 'Картриджи';
        }
        return 'Другое';
    }

    /**
     * Получить закупочную цену для товара
     */
    private function getPurchasePrice(Product $product, ?string $volume = null): float
    {
        // Если есть объем, проверяем в product_volume_stock
        if ($volume) {
            $volumeStock = $product->volumeStocks()->where('volume', $volume)->first();
            if ($volumeStock && $volumeStock->purchase_price) {
                return (float) $volumeStock->purchase_price;
            }
            
            // Если закупочная цена не установлена для объема, используем значения по умолчанию
            $categoryGroup = $this->getCategoryGroup($product->category);
            if ($categoryGroup === 'Жижа') {
                if ($volume === '10ml') {
                    return 80.0;
                }
                return 165.0; // 30ml по умолчанию
            }
        }

        // Если у товара есть purchase_price, используем его
        if ($product->purchase_price) {
            return (float) $product->purchase_price;
        }

        // Закупочные цены по умолчанию в зависимости от категории
        $categoryGroup = $this->getCategoryGroup($product->category);

        if ($categoryGroup === 'Жижа') {
            return 165.0; // 30ml по умолчанию
        }

        if ($categoryGroup === 'Стики') {
            return 50.0;
        }

        if ($categoryGroup === 'Картриджи') {
            return 78.0;
        }

        return 0.0;
    }

    /**
     * Получить статистику финансов
     */
    public function stats(): JsonResponse
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();

        // Прибыль за текущий месяц (по выполненным заказам)
        $completedOrdersThisMonth = Order::with('product')
            ->where('status', 'completed')
            ->where('created_at', '>=', $startOfMonth)
            ->get();

        $monthlyRevenue = 0; // Доход (сумма всех продаж)
        $monthlyProfit = 0; // Чистая прибыль (доход - закупочная цена)
        $monthlyRevenueByCategory = [
            'Жижа' => 0,
            'Стики' => 0,
            'Картриджи' => 0,
            'Другое' => 0,
        ];
        $monthlyProfitByCategory = [
            'Жижа' => 0,
            'Стики' => 0,
            'Картриджи' => 0,
            'Другое' => 0,
        ];

        foreach ($completedOrdersThisMonth as $order) {
            if (!$order->product) {
                continue;
            }

            $product = $order->product;
            $categoryGroup = $this->getCategoryGroup($product->category);
            
            // Используем базовую цену товара (так как в заказах не сохраняется объем)
            $salePrice = (float) $product->price;
            $purchasePrice = $this->getPurchasePrice($product);
            $revenue = $salePrice; // Доход = цена продажи
            $profit = $salePrice - $purchasePrice; // Прибыль = доход - закупочная цена

            $monthlyRevenue += $revenue;
            $monthlyProfit += $profit;
            $monthlyRevenueByCategory[$categoryGroup] += $revenue;
            $monthlyProfitByCategory[$categoryGroup] += $profit;
        }

        // Потенциальная прибыль если продать всю партию
        $products = Product::with('volumeStocks')->get();
        $potentialProfit = 0;
        $potentialProfitByCategory = [
            'Жижа' => 0,
            'Стики' => 0,
            'Картриджи' => 0,
            'Другое' => 0,
        ];
        $potentialProfitDetails = [
            'Жижа' => ['profit' => 0, 'quantity' => 0],
            'Стики' => ['profit' => 0, 'quantity' => 0],
            'Картриджи' => ['profit' => 0, 'quantity' => 0],
            'Другое' => ['profit' => 0, 'quantity' => 0],
        ];

        foreach ($products as $product) {
            $categoryGroup = $this->getCategoryGroup($product->category);
            $salePrice = (float) $product->price;

            // Если у товара есть объемы
            if ($product->volumes && is_array($product->volumes) && count($product->volumes) > 0) {
                foreach ($product->volumes as $volumeKey => $volumeData) {
                    $volumeStock = $product->volumeStocks()->where('volume', $volumeKey)->first();
                    $quantity = $volumeStock ? $volumeStock->quantity : 0;
                    $volumePrice = isset($volumeData['price']) ? (float) $volumeData['price'] : $salePrice;
                    $purchasePrice = $this->getPurchasePrice($product, $volumeKey);
                    $profitPerUnit = $volumePrice - $purchasePrice;
                    $totalProfit = $profitPerUnit * $quantity;

                    $potentialProfit += $totalProfit;
                    $potentialProfitByCategory[$categoryGroup] += $totalProfit;
                    $potentialProfitDetails[$categoryGroup]['profit'] += $totalProfit;
                    $potentialProfitDetails[$categoryGroup]['quantity'] += $quantity;
                }
            } else {
                // Товар без объемов
                $quantity = $product->quantity ?? 0;
                $purchasePrice = $this->getPurchasePrice($product);
                $profitPerUnit = $salePrice - $purchasePrice;
                $totalProfit = $profitPerUnit * $quantity;

                $potentialProfit += $totalProfit;
                $potentialProfitByCategory[$categoryGroup] += $totalProfit;
                $potentialProfitDetails[$categoryGroup]['profit'] += $totalProfit;
                $potentialProfitDetails[$categoryGroup]['quantity'] += $quantity;
            }
        }

        return response()->json([
            'monthly_revenue' => round($monthlyRevenue, 2), // Доход за месяц
            'monthly_revenue_by_category' => array_map(fn($v) => round($v, 2), $monthlyRevenueByCategory),
            'monthly_profit' => round($monthlyProfit, 2), // Чистая прибыль за месяц
            'monthly_profit_by_category' => array_map(fn($v) => round($v, 2), $monthlyProfitByCategory),
            'potential_profit' => round($potentialProfit, 2),
            'potential_profit_by_category' => array_map(fn($v) => round($v, 2), $potentialProfitByCategory),
            'potential_profit_details' => array_map(function($v) {
                return [
                    'profit' => round($v['profit'], 2),
                    'quantity' => $v['quantity'],
                ];
            }, $potentialProfitDetails),
        ]);
    }

    /**
     * Обновить количество товара
     */
    public function updateProductQuantity(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);

        $product->quantity = $validated['quantity'];
        $product->save();

        return response()->json($product);
    }

    /**
     * Обновить количество для объема товара
     */
    public function updateVolumeQuantity(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'volume' => 'required|string',
            'quantity' => 'required|integer|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
        ]);

        // Если purchase_price не указан, устанавливаем по умолчанию
        $purchasePrice = $validated['purchase_price'];
        if (!$purchasePrice) {
            $categoryGroup = $this->getCategoryGroup($product->category);
            if ($categoryGroup === 'Жижа') {
                $purchasePrice = $validated['volume'] === '10ml' ? 80.0 : 165.0;
            } elseif ($categoryGroup === 'Стики') {
                $purchasePrice = 50.0;
            } elseif ($categoryGroup === 'Картриджи') {
                $purchasePrice = 78.0;
            }
        }

        $volumeStock = ProductVolumeStock::updateOrCreate(
            [
                'product_id' => $product->id,
                'volume' => $validated['volume'],
            ],
            [
                'quantity' => $validated['quantity'],
                'purchase_price' => $purchasePrice,
            ]
        );

        return response()->json($volumeStock);
    }
}
