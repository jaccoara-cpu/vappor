<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVolumeStock;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        // Показываем все активные товары в каталоге
        // Проверка наличия товара (quantity > 0) будет выполняться при создании заказа
        $products = Product::with('volumeStocks')
            ->where('is_active', true)
            ->get();

        return response()->json($products);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        return response()->json($product);
    }

    /**
     * Получить закупочную цену по умолчанию для категории
     */
    private function getDefaultPurchasePrice(?string $category): ?float
    {
        if (!$category) {
            return null;
        }

        $liquidCategories = ['Chaser for pods', 'Chaser My Mint', 'Chaser Mix'];
        if (in_array($category, $liquidCategories)) {
            return 165.0; // 30ml по умолчанию
        }
        if ($category === 'Sticks for IQOS') {
            return 50.0;
        }
        if ($category === 'Cartridges') {
            return 78.0;
        }

        return null;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        // Логируем информацию о загружаемом файле ДО валидации
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            \Log::info('File upload attempt', [
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'error' => $file->getError(),
                'is_valid' => $file->isValid(),
                'upload_max_filesize' => ini_get('upload_max_filesize'),
                'post_max_size' => ini_get('post_max_size'),
                'memory_limit' => ini_get('memory_limit'),
                'max_file_uploads' => ini_get('max_file_uploads'),
            ]);
            
            // Проверяем ошибку загрузки PHP
            if ($file->getError() !== UPLOAD_ERR_OK) {
                $errorMessages = [
                    UPLOAD_ERR_INI_SIZE => 'Файл превышает upload_max_filesize в php.ini',
                    UPLOAD_ERR_FORM_SIZE => 'Файл превышает MAX_FILE_SIZE из формы',
                    UPLOAD_ERR_PARTIAL => 'Файл загружен только частично',
                    UPLOAD_ERR_NO_FILE => 'Файл не был загружен',
                    UPLOAD_ERR_NO_TMP_DIR => 'Отсутствует временная папка',
                    UPLOAD_ERR_CANT_WRITE => 'Не удалось записать файл на диск',
                    UPLOAD_ERR_EXTENSION => 'Расширение PHP остановило загрузку',
                ];
                $errorMsg = $errorMessages[$file->getError()] ?? 'Неизвестная ошибка загрузки: ' . $file->getError();
                \Log::error('PHP upload error: ' . $errorMsg, ['error_code' => $file->getError()]);
                return response()->json([
                    'message' => 'Ошибка при загрузке файла',
                    'errors' => ['image' => [$errorMsg]]
                ], 422);
            }
            
            if (!$file->isValid()) {
                \Log::error('File is not valid after upload');
                return response()->json([
                    'message' => 'Ошибка при загрузке файла',
                    'errors' => ['image' => ['Файл не прошел проверку валидности']]
                ], 422);
            }
        }
        
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'category' => 'nullable|string',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'image' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:20480',
                'quantity' => 'nullable|integer|min:0',
                'purchase_price' => 'nullable|numeric|min:0',
                'volumes' => 'nullable|string', // JSON строка с объемами
            ]);
        } catch (ValidationException $e) {
            \Log::error('Validation failed: ' . json_encode($e->errors()), [
                'request_data' => [
                    'has_file' => $request->hasFile('image'),
                    'file_error' => $request->hasFile('image') ? $request->file('image')->getError() : null,
                    'file_size' => $request->hasFile('image') ? $request->file('image')->getSize() : null,
                    'file_mime' => $request->hasFile('image') ? $request->file('image')->getMimeType() : null,
                    'upload_max_filesize' => ini_get('upload_max_filesize'),
                    'post_max_size' => ini_get('post_max_size'),
                ]
            ]);
            return response()->json([
                'message' => 'Ошибка валидации данных',
                'errors' => $e->errors()
            ], 422);
        }

        if ($request->hasFile('image')) {
            try {
                $file = $request->file('image');
                
                // Проверка размера файла (20 МБ)
                $maxSize = 20 * 1024 * 1024; // 20 МБ в байтах
                if ($file->getSize() > $maxSize) {
                    throw new \Exception('Размер изображения превышает 20 МБ. Размер файла: ' . round($file->getSize() / 1024 / 1024, 2) . ' МБ');
                }
                
                // Проверка PHP настроек
                $uploadMaxSize = ini_get('upload_max_filesize');
                $postMaxSize = ini_get('post_max_size');
                \Log::info('PHP upload settings', [
                    'upload_max_filesize' => $uploadMaxSize,
                    'post_max_size' => $postMaxSize,
                    'file_size' => $file->getSize()
                ]);
                
                // Убеждаемся, что директория существует
                if (!Storage::disk('public')->exists('products')) {
                    Storage::disk('public')->makeDirectory('products');
                }
                
                // Проверяем права на запись
                $testPath = storage_path('app/public/products');
                if (!is_writable($testPath)) {
                    throw new \Exception('Папка для загрузки изображений недоступна для записи. Проверьте права доступа.');
                }
                
                $path = $file->store('products', 'public');
                
                if (!$path) {
                    throw new \Exception('Не удалось сохранить файл');
                }
                
                $validated['image_path'] = $path;
            } catch (\Exception $e) {
                \Log::error('Image upload failed: ' . $e->getMessage(), [
                    'file' => $request->hasFile('image') ? $request->file('image')->getClientOriginalName() : null,
                    'size' => $request->hasFile('image') ? $request->file('image')->getSize() : null,
                    'upload_max_filesize' => ini_get('upload_max_filesize'),
                    'post_max_size' => ini_get('post_max_size'),
                    'memory_limit' => ini_get('memory_limit'),
                    'trace' => $e->getTraceAsString()
                ]);
                return response()->json([
                    'message' => 'Ошибка при загрузке изображения',
                    'errors' => ['image' => [$e->getMessage()]]
                ], 422);
            }
        }

        // Устанавливаем закупочную цену по умолчанию если не указана
        if (!isset($validated['purchase_price']) && isset($validated['category'])) {
            $validated['purchase_price'] = $this->getDefaultPurchasePrice($validated['category']);
        }

        // Устанавливаем quantity по умолчанию если не указан
        if (!isset($validated['quantity'])) {
            $validated['quantity'] = 0;
        }

        // Обрабатываем объемы, если они переданы
        if ($request->has('volumes') && !empty($request->input('volumes'))) {
            $volumesJson = $request->input('volumes');
            $volumes = json_decode($volumesJson, true);
            
            if (json_last_error() === JSON_ERROR_NONE && is_array($volumes)) {
                $validated['volumes'] = $volumes;
            }
        }

        $product = Product::create($validated);
        return response()->json($product, 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'category' => 'nullable|string',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'image' => 'nullable|image|max:20480',
            'is_active' => 'sometimes|boolean',
            'quantity' => 'sometimes|integer|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
            'volumes' => 'nullable|string', // JSON строка с объемами
        ]);

        if ($request->hasFile('image')) {
            try {
                $file = $request->file('image');
                
                // Проверка размера файла (20 МБ)
                $maxSize = 20 * 1024 * 1024; // 20 МБ в байтах
                if ($file->getSize() > $maxSize) {
                    throw new \Exception('Размер изображения превышает 20 МБ. Размер файла: ' . round($file->getSize() / 1024 / 1024, 2) . ' МБ');
                }
                
                // Убеждаемся, что директория существует
                if (!Storage::disk('public')->exists('products')) {
                    Storage::disk('public')->makeDirectory('products');
                }
                
                // Проверяем права на запись
                $testPath = storage_path('app/public/products');
                if (!is_writable($testPath)) {
                    throw new \Exception('Папка для загрузки изображений недоступна для записи. Проверьте права доступа.');
                }
                
                if ($product->image_path) {
                    Storage::disk('public')->delete($product->image_path);
                }
                $path = $file->store('products', 'public');
                
                if (!$path) {
                    throw new \Exception('Не удалось сохранить файл');
                }
                
                $validated['image_path'] = $path;
            } catch (\Exception $e) {
                \Log::error('Image upload failed: ' . $e->getMessage(), [
                    'file' => $request->hasFile('image') ? $request->file('image')->getClientOriginalName() : null,
                    'size' => $request->hasFile('image') ? $request->file('image')->getSize() : null,
                    'upload_max_filesize' => ini_get('upload_max_filesize'),
                    'post_max_size' => ini_get('post_max_size'),
                ]);
                return response()->json([
                    'message' => 'Ошибка при загрузке изображения',
                    'errors' => ['image' => [$e->getMessage()]]
                ], 422);
            }
        }

        // Устанавливаем закупочную цену по умолчанию если не указана и изменилась категория
        if (!isset($validated['purchase_price']) && isset($validated['category'])) {
            $validated['purchase_price'] = $this->getDefaultPurchasePrice($validated['category']);
        }

        // Обрабатываем объемы, если они переданы
        if ($request->has('volumes') && !empty($request->input('volumes'))) {
            $volumesJson = $request->input('volumes');
            $volumes = json_decode($volumesJson, true);
            
            if (json_last_error() === JSON_ERROR_NONE && is_array($volumes)) {
                $validated['volumes'] = $volumes;
            }
        }

        $product->update($validated);
        return response()->json($product);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }
        
        $product->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }

    /**
     * Remove a specific flavor from a volume
     */
    public function removeFlavor(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        
        $validated = $request->validate([
            'volume' => 'required|string',
            'flavor_name' => 'required|string',
        ]);

        $volumes = $product->volumes ?? [];
        $volume = $validated['volume'];
        $flavorName = $validated['flavor_name'];

        if (!isset($volumes[$volume])) {
            return response()->json(['error' => 'Volume not found'], 404);
        }

        // Удаляем вкус из массива
        $flavors = $volumes[$volume]['flavors'] ?? [];
        $flavors = array_filter($flavors, function($flavor) use ($flavorName) {
            return $flavor['name'] !== $flavorName;
        });

        // Обновляем volumes
        $volumes[$volume]['flavors'] = array_values($flavors);
        $product->volumes = $volumes;
        $product->save();

        return response()->json($product);
    }

    /**
     * Add a new flavor to a volume
     */
    public function addFlavor(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        
        $validated = $request->validate([
            'volume' => 'required|string',
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|max:20480',
        ]);

        $volumes = $product->volumes ?? [];
        $volume = $validated['volume'];
        $flavorName = $validated['name'];

        if (!isset($volumes[$volume])) {
            return response()->json(['error' => 'Volume not found'], 404);
        }

        // Проверяем, не существует ли уже такой вкус
        $flavors = $volumes[$volume]['flavors'] ?? [];
        foreach ($flavors as $flavor) {
            if ($flavor['name'] === $flavorName) {
                return response()->json(['error' => 'Flavor with this name already exists'], 400);
            }
        }

        // Сохраняем изображение, если оно есть
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        // Добавляем новый вкус
        $newFlavor = [
            'name' => $flavorName,
            'image_path' => $imagePath,
            'is_active' => true,
        ];

        $flavors[] = $newFlavor;
        $volumes[$volume]['flavors'] = $flavors;
        $product->volumes = $volumes;
        $product->save();

        return response()->json($product);
    }

    /**
     * Add a flavor to a product (for products without volumes)
     */
    public function addFlavorToProduct(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|max:20480',
        ]);

        $flavorName = $validated['name'];
        $flavors = $product->flavors ?? [];

        // Проверяем, не существует ли уже такой вкус
        foreach ($flavors as $flavor) {
            if ($flavor['name'] === $flavorName) {
                return response()->json(['error' => 'Flavor with this name already exists'], 400);
            }
        }

        // Сохраняем изображение, если оно есть
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        // Добавляем новый вкус
        $newFlavor = [
            'name' => $flavorName,
            'image_path' => $imagePath,
            'is_active' => true,
        ];

        $flavors[] = $newFlavor;
        $product->flavors = $flavors;
        $product->save();

        return response()->json($product);
    }

    /**
     * Remove a flavor from a product (for products without volumes)
     */
    public function removeFlavorFromProduct(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        
        $validated = $request->validate([
            'flavor_name' => 'required|string',
        ]);

        $flavorName = $validated['flavor_name'];
        $flavors = $product->flavors ?? [];

        // Удаляем вкус из массива
        $flavors = array_filter($flavors, function($flavor) use ($flavorName) {
            return $flavor['name'] !== $flavorName;
        });

        $product->flavors = array_values($flavors);
        $product->save();

        return response()->json($product);
    }

    /**
     * Toggle flavor active status for volumes
     */
    public function toggleFlavorStatus(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        
        $validated = $request->validate([
            'volume' => 'required|string',
            'flavor_name' => 'required|string',
            'is_active' => 'required|boolean',
        ]);

        $volumes = $product->volumes ?? [];
        $volume = $validated['volume'];
        $flavorName = $validated['flavor_name'];
        $isActive = $validated['is_active'];

        if (!isset($volumes[$volume])) {
            return response()->json(['error' => 'Volume not found'], 404);
        }

        $flavors = $volumes[$volume]['flavors'] ?? [];
        $flavorFound = false;

        foreach ($flavors as &$flavor) {
            if ($flavor['name'] === $flavorName) {
                $flavor['is_active'] = $isActive;
                $flavorFound = true;
                break;
            }
        }

        if (!$flavorFound) {
            return response()->json(['error' => 'Flavor not found'], 404);
        }

        $volumes[$volume]['flavors'] = $flavors;
        $product->volumes = $volumes;
        $product->save();

        return response()->json($product);
    }

    /**
     * Toggle flavor active status for products without volumes
     */
    public function toggleFlavorStatusFromProduct(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        
        $validated = $request->validate([
            'flavor_name' => 'required|string',
            'is_active' => 'required|boolean',
        ]);

        $flavorName = $validated['flavor_name'];
        $isActive = $validated['is_active'];
        $flavors = $product->flavors ?? [];
        $flavorFound = false;

        foreach ($flavors as &$flavor) {
            if ($flavor['name'] === $flavorName) {
                $flavor['is_active'] = $isActive;
                $flavorFound = true;
                break;
            }
        }

        if (!$flavorFound) {
            return response()->json(['error' => 'Flavor not found'], 404);
        }

        $product->flavors = $flavors;
        $product->save();

        return response()->json($product);
    }
}
