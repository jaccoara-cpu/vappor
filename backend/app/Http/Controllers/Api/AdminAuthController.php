<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AdminAuthController extends Controller
{
    private const ADMIN_USER_ID = 'Vapor_managerr';
    private const CODE_EXPIRY = 300; // 5 minutes in seconds
    private const CODE_LENGTH = 6;

    private TelegramService $telegramService;

    public function __construct(TelegramService $telegramService)
    {
        $this->telegramService = $telegramService;
    }

    /**
     * Request 2FA code - check if user is admin and send code to Telegram
     */
    public function requestCode(Request $request): JsonResponse
    {
        $userId = $request->input('user_id');

        // Check if user ID matches admin
        if ($userId !== self::ADMIN_USER_ID) {
            return response()->json([
                'success' => false,
                'message' => 'Доступ запрещен. Только администратор может получить код.',
            ], 403);
        }

        // Generate 6-digit code
        $code = str_pad((string) random_int(0, 999999), self::CODE_LENGTH, '0', STR_PAD_LEFT);

        // Store code in cache with 5 minute expiry
        $cacheKey = 'admin_2fa_code_' . $userId;
        Cache::put($cacheKey, $code, self::CODE_EXPIRY);

        // Send code to Telegram
        $sent = $this->telegramService->sendTwoFactorCode($code);

        if (!$sent) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при отправке кода в Telegram. Проверьте настройки бота.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Код отправлен в Telegram',
        ]);
    }

    /**
     * Verify 2FA code and create admin session
     */
    public function verifyCode(Request $request): JsonResponse
    {
        $userId = $request->input('user_id');
        $code = $request->input('code');

        // Check if user ID matches admin
        if ($userId !== self::ADMIN_USER_ID) {
            return response()->json([
                'success' => false,
                'message' => 'Доступ запрещен.',
            ], 403);
        }

        // Validate code
        if (empty($code) || strlen($code) !== self::CODE_LENGTH) {
            return response()->json([
                'success' => false,
                'message' => 'Неверный формат кода.',
            ], 400);
        }

        // Check code from cache
        $cacheKey = 'admin_2fa_code_' . $userId;
        $storedCode = Cache::get($cacheKey);

        if (!$storedCode || $storedCode !== $code) {
            return response()->json([
                'success' => false,
                'message' => 'Неверный код или код истек.',
            ], 401);
        }

        // Code is valid - create session token
        $sessionToken = Str::random(64);
        $sessionKey = 'admin_session_' . $sessionToken;
        
        // Store session for 24 hours
        Cache::put($sessionKey, [
            'user_id' => $userId,
            'authenticated_at' => now()->toIso8601String(),
        ], 86400); // 24 hours

        // Delete used code
        Cache::forget($cacheKey);

        return response()->json([
            'success' => true,
            'message' => 'Авторизация успешна',
            'token' => $sessionToken,
        ]);
    }

    /**
     * Check if admin session is valid
     */
    public function checkSession(Request $request): JsonResponse
    {
        // Try to get token from header first, then from request body
        $token = $request->header('X-Admin-Token') 
            ?? $request->header('Authorization') 
            ?? $request->input('token');

        // Remove 'Bearer ' prefix if present
        if ($token && str_starts_with($token, 'Bearer ')) {
            $token = substr($token, 7);
        }

        if (empty($token)) {
            return response()->json([
                'authenticated' => false,
            ], 401);
        }

        $sessionKey = 'admin_session_' . $token;
        $session = Cache::get($sessionKey);

        if (!$session || $session['user_id'] !== self::ADMIN_USER_ID) {
            return response()->json([
                'authenticated' => false,
            ], 401);
        }

        return response()->json([
            'authenticated' => true,
            'user_id' => $session['user_id'],
        ]);
    }

    /**
     * Logout admin
     */
    public function logout(Request $request): JsonResponse
    {
        // Try to get token from header first, then from request body
        $token = $request->header('X-Admin-Token') 
            ?? $request->header('Authorization') 
            ?? $request->input('token');

        // Remove 'Bearer ' prefix if present
        if ($token && str_starts_with($token, 'Bearer ')) {
            $token = substr($token, 7);
        }

        if (!empty($token)) {
            $sessionKey = 'admin_session_' . $token;
            Cache::forget($sessionKey);
        }

        return response()->json([
            'success' => true,
            'message' => 'Выход выполнен',
        ]);
    }
}

