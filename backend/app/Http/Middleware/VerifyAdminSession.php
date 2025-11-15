<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class VerifyAdminSession
{
    private const ADMIN_USER_ID = 'Vapor_managerr';

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
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
                'error' => 'Не авторизован',
                'message' => 'Требуется авторизация администратора',
            ], 401);
        }

        $sessionKey = 'admin_session_' . $token;
        $session = Cache::get($sessionKey);

        if (!$session || $session['user_id'] !== self::ADMIN_USER_ID) {
            return response()->json([
                'error' => 'Не авторизован',
                'message' => 'Сессия истекла или недействительна',
            ], 401);
        }

        // Attach session info to request for use in controllers
        $request->merge(['admin_session' => $session]);

        return $next($request);
    }
}

