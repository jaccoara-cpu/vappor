<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\FinanceController;

// Public API routes
// Products
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Orders
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/slots', [OrderController::class, 'getAvailableSlots']);

// Admin authentication routes (public)
Route::prefix('admin/auth')->group(function () {
    Route::post('/request-code', [AdminAuthController::class, 'requestCode']);
    Route::post('/verify-code', [AdminAuthController::class, 'verifyCode']);
    Route::post('/check-session', [AdminAuthController::class, 'checkSession']);
    Route::post('/logout', [AdminAuthController::class, 'logout']);
});

// Admin routes (protected with session middleware)
Route::prefix('admin')->middleware(['admin.session'])->group(function () {
    Route::get('/products', [AdminController::class, 'products']);
    Route::get('/orders', [AdminController::class, 'orders']);
    Route::get('/statistics', [AdminController::class, 'statistics']);
    
    // Product management
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::post('/products/{id}/remove-flavor', [ProductController::class, 'removeFlavor']);
    Route::post('/products/{id}/add-flavor', [ProductController::class, 'addFlavor']);
    Route::post('/products/{id}/add-flavor-to-product', [ProductController::class, 'addFlavorToProduct']);
    Route::post('/products/{id}/remove-flavor-from-product', [ProductController::class, 'removeFlavorFromProduct']);
    Route::post('/products/{id}/toggle-flavor-status', [ProductController::class, 'toggleFlavorStatus']);
    Route::post('/products/{id}/toggle-flavor-status-from-product', [ProductController::class, 'toggleFlavorStatusFromProduct']);
    
    // Order management
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}', [OrderController::class, 'update']);
    Route::delete('/orders/{id}', [OrderController::class, 'destroy']);
    
    // Finance routes
    Route::get('/finance/stats', [FinanceController::class, 'stats']);
    Route::post('/products/{id}/update-quantity', [FinanceController::class, 'updateProductQuantity']);
    Route::post('/products/{id}/update-volume-quantity', [FinanceController::class, 'updateVolumeQuantity']);
});

