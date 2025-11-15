<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    private string $botToken;
    private string $userId;

    public function __construct()
    {
        $this->botToken = config('services.telegram.bot_token', '8577074525:AAGusZJT_kPcjnOHVfRB22ZtJNteDGG1DlE');
        $userId = config('services.telegram.user_id', '7736398733');
        // Remove @ symbol if present for Telegram API, but keep numeric IDs as is
        $this->userId = is_numeric($userId) ? $userId : ltrim($userId, '@');
        
        // Log the configuration for debugging
        Log::info('TelegramService initialized', [
            'bot_token_set' => !empty($this->botToken),
            'user_id_set' => !empty($this->userId),
            'user_id_value' => $this->userId
        ]);
    }

    /**
     * Send notification about new order to admin
     */
    public function sendOrderNotification(Order $order): bool
    {
        if (empty($this->botToken) || empty($this->userId)) {
            Log::warning('Telegram bot token or user ID not configured');
            return false;
        }

        try {
            $product = $order->product;
            $message = $this->formatOrderMessage($order, $product);

            $response = Http::post("https://api.telegram.org/bot{$this->botToken}/sendMessage", [
                'chat_id' => $this->userId,
                'text' => $message,
                'parse_mode' => 'HTML',
            ]);

            if ($response->successful()) {
                Log::info('Telegram notification sent successfully', ['order_id' => $order->id]);
                return true;
            }

            Log::error('Failed to send Telegram notification', [
                'order_id' => $order->id,
                'response' => $response->body(),
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('Exception while sending Telegram notification', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Get chat ID from username using getUpdates
     */
    private function getChatIdFromUsername(): ?string
    {
        try {
            $response = Http::timeout(10)->get("https://api.telegram.org/bot{$this->botToken}/getUpdates");
            
            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['result']) && is_array($data['result'])) {
                    foreach ($data['result'] as $update) {
                        if (isset($update['message']['from']['username'])) {
                            $username = $update['message']['from']['username'];
                            if (strtolower($username) === strtolower($this->userId)) {
                                $chatId = $update['message']['chat']['id'];
                                Log::info('Found chat ID for username', [
                                    'username' => $this->userId,
                                    'chat_id' => $chatId,
                                ]);
                                return (string) $chatId;
                            }
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            Log::warning('Failed to get chat ID from username', [
                'error' => $e->getMessage(),
            ]);
        }
        
        return null;
    }

    /**
     * Send 2FA code to admin via Telegram
     */
    public function sendTwoFactorCode(string $code): bool
    {
        if (empty($this->botToken) || empty($this->userId)) {
            Log::warning('Telegram bot token or user ID not configured', [
                'bot_token_empty' => empty($this->botToken),
                'user_id_empty' => empty($this->userId),
            ]);
            return false;
        }

        try {
            $message = "🔐 <b>Код авторизации VAPOR Admin</b>\n\n";
            $message .= "Ваш код доступа:\n";
            $message .= "<b><code>{$code}</code></b>\n\n";
            $message .= "Код действителен в течение 5 минут.";

            $url = "https://api.telegram.org/bot{$this->botToken}/sendMessage";
            
            // Use userId directly as chat_id (should be numeric ID for Telegram API)
            $chatId = $this->userId;
            
            // Only try to get chat_id from username if it's not numeric
            if (!is_numeric($chatId)) {
                $foundChatId = $this->getChatIdFromUsername();
                if ($foundChatId) {
                    $chatId = $foundChatId;
                }
            }
            
            Log::info('Sending 2FA code to Telegram', [
                'url' => $url,
                'chat_id' => $chatId,
                'original_user_id' => $this->userId,
            ]);

            $response = Http::timeout(10)->post($url, [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'HTML',
            ]);

            $responseData = $response->json();
            
            if ($response->successful()) {
                Log::info('2FA code sent successfully to Telegram', [
                    'user_id' => $this->userId,
                    'chat_id' => $chatId,
                    'response' => $responseData,
                ]);
                return true;
            }

            $errorDescription = $responseData['description'] ?? 'Unknown error';
            
            Log::error('Failed to send 2FA code to Telegram', [
                'user_id' => $this->userId,
                'chat_id' => $chatId,
                'status' => $response->status(),
                'error_code' => $responseData['error_code'] ?? null,
                'error_description' => $errorDescription,
                'response' => $responseData,
            ]);

            // Check if it's a "chat not found" error
            if (str_contains(strtolower($errorDescription), 'chat not found')) {
                Log::warning('Telegram chat not found. User needs to start a conversation with the bot first.', [
                    'user_id' => $this->userId,
                    'chat_id' => $chatId,
                ]);
            }

            return false;
        } catch (\Exception $e) {
            Log::error('Exception while sending 2FA code to Telegram', [
                'user_id' => $this->userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return false;
        }
    }

    /**
     * Format order message for Telegram
     */
    private function formatOrderMessage(Order $order, $product): string
    {
        $message = "🛒 <b>Новый заказ #{$order->id}</b>\n\n";
        $message .= "📦 <b>Товар:</b> {$product->name}\n";
        $message .= "💰 <b>Цена:</b> {$product->price} ₴\n\n";
        $message .= "👤 <b>Клиент:</b> {$order->customer_name}\n";
        
        if ($order->customer_phone) {
            $message .= "📱 <b>Телефон:</b> {$order->customer_phone}\n";
        }
        
        if ($order->customer_telegram) {
            $message .= "💬 <b>Telegram:</b> @{$order->customer_telegram}\n";
        }
        
        $message .= "\n";
        $message .= "🕐 <b>Время резервации:</b> " . $order->reservation_time->format('d.m.Y H:i') . "\n";
        $message .= "📅 <b>Создан:</b> " . $order->created_at->format('d.m.Y H:i') . "\n";

        return $message;
    }
}


