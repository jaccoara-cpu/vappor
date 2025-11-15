<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $orders = Order::with('product')->orderBy('created_at', 'desc')->get();
        return response()->json($orders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'customer_telegram' => 'nullable|string|max:255',
            'reservation_time' => 'required|date',
            'volume' => 'nullable|string', // Для товаров с объемами
        ]);

        $product = Product::with('volumeStocks')->findOrFail($validated['product_id']);

        // Проверяем только активность товара
        if (!$product->is_active) {
                return response()->json([
                'message' => 'Товар неактивен',
                'error' => 'product_inactive'
                ], 400);
            }
            
        // Уменьшаем количество на складе только если оно отслеживается (опционально)
        // Но не блокируем заказ, если количество не отслеживается или равно 0
        if (isset($validated['volume']) && $validated['volume'] && $product->volumes && is_array($product->volumes)) {
            // Товар с объемами - уменьшаем количество если оно отслеживается
            $volumeStock = $product->volumeStocks->firstWhere('volume', $validated['volume']);
            if ($volumeStock && $volumeStock->quantity !== null && $volumeStock->quantity > 0) {
            $volumeStock->quantity--;
            $volumeStock->save();
            }
        } else {
            // Товар без объемов - уменьшаем количество если оно отслеживается
            if ($product->quantity !== null && $product->quantity > 0) {
            $product->quantity--;
            $product->save();
            }
        }

        $order = Order::create($validated);

        // Отправка уведомления в Telegram
        $telegramService = new TelegramService();
        $telegramService->sendOrderNotification($order);

        return response()->json($order->load('product'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $order = Order::with('product')->findOrFail($id);
        return response()->json($order);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'sometimes|in:new,completed,cancelled',
            'customer_name' => 'sometimes|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'customer_telegram' => 'nullable|string|max:255',
            'reservation_time' => 'sometimes|date',
        ]);

        $order->update($validated);
        return response()->json($order->load('product'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $order->delete();
        return response()->json(['message' => 'Order deleted successfully']);
    }

    /**
     * Get available time slots for a product
     */
    public function getAvailableSlots(Request $request): JsonResponse
    {
        $productId = $request->input('product_id');
        $date = $request->input('date', now()->format('Y-m-d'));

        // Генерируем доступные слоты (каждый час с 10:00 до 24:00)
        $slots = [];
        $startHour = 10;
        $endHour = 24;

        // Определяем, является ли выбранная дата сегодняшней
        $today = now()->format('Y-m-d');
        $isToday = $date === $today;

        for ($hour = $startHour; $hour < $endHour; $hour++) {
            $startTime = "$date " . str_pad($hour, 2, '0', STR_PAD_LEFT) . ":00:00";
            $endTime = "$date " . str_pad($hour + 1, 2, '0', STR_PAD_LEFT) . ":00:00";

            // Резервація - це резервація смаку, а не часу
            // Тому можна зробити кілька замовлень на один і той самий час
            // Показуємо всі слоти незалежно від наявності замовлень
            
            // Для сегодняшнего дня показываем все доступные слоты (можно сделать предзаказ даже ночью)
            // Для будущих дней показываем только слоты, которые еще не прошли
            if ($isToday) {
                // Для сегодняшнего дня показываем все слоты с 10:00 до 24:00
                // (можно сделать предзаказ даже ночью) - не проверяем время и наличие заказов
                $isAvailable = true;
            } else {
                // Для будущих дней показываем только слоты, которые еще не прошли
                $isAvailable = strtotime($startTime) > time();
            }

            if ($isAvailable) {
                $startFormatted = date('H:i', strtotime($startTime));
                // Для последнего слота (23:00) показываем 24:00 вместо 00:00
                $endFormatted = ($hour === 23) ? '24:00' : date('H:i', strtotime($endTime));
                
                $slots[] = [
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'formatted' => $startFormatted . ' - ' . $endFormatted,
                ];
            }
        }

        return response()->json($slots);
    }
}
