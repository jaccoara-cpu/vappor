<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Путь к папке с фото - пробуем разные варианты
        // На продакшн папки будут в корне проекта (на уровень выше от backend)
        // Локально тоже на уровень выше от backend
        $photosPath = base_path('../photos liquid');
        
        // Если не найдено, пробуем в корне проекта
        if (!File::exists($photosPath)) {
            $photosPath = base_path('../../photos liquid');
        }
        
        // Если все еще не найдено, пробуем абсолютный путь от storage
        if (!File::exists($photosPath)) {
            $photosPath = storage_path('../photos liquid');
        }
        
        // Создаем директорию для продуктов если её нет
        $destinationPath = storage_path('app/public/products');
        if (!File::exists($destinationPath)) {
            File::makeDirectory($destinationPath, 0755, true);
        }
        
        // Смаки для 30 мл
        $podsPhotosPath = $photosPath . '/for pods';
        $flavors30ml = $this->importFlavors(
            $podsPhotosPath,
            $destinationPath,
            function (\SplFileInfo $photo, int $index): array {
                $filename = $photo->getFilename();
                $name = preg_replace('/\.(jpg|jpeg|png)$/i', '', $filename) ?? $filename;
                $name = str_replace(['Mockup For Pods 30ml ', ' ULTRA'], '', $name);
                $name = trim($name);
                
            $nameMap = [
                'виноград' => 'Виноград',
                'вишня' => 'Вишня',
                'смородина ментоол' => 'Смородина ментоол',
            ];
            
                $normalized = mb_strtolower($name);
                
                $displayName = $nameMap[$normalized] ?? mb_convert_case($name, MB_CASE_TITLE, 'UTF-8');
                
                return [
                        'name' => $displayName,
                ];
            },
            'chaser-for-pods-30ml'
        );
        
        if (empty($flavors30ml)) {
            $this->command->warn('Photos directory not found. Creating sample flavors without images.');
            
            // Создаем смаки без изображений
            $flavors30ml = [
                [
                    'name' => 'Виноград',
                    'image_path' => null,
                ],
                [
                    'name' => 'Вишня',
                    'image_path' => null,
                ],
                [
                    'name' => 'Смородина ментоол',
                    'image_path' => null,
                ],
            ];
        }
        
        // Смаки для 10 мл
        $pods10mlPhotosPath = $photosPath . '/for pods/for pods 10 ml';
        $flavors10ml = $this->importFlavors(
            $pods10mlPhotosPath,
            $destinationPath,
            function (\SplFileInfo $photo, int $index): array {
                $filename = $photo->getFilename();
                $name = preg_replace('/\.(jpg|jpeg|png)$/i', '', $filename) ?? $filename;
                $name = str_replace(['Mockup For Pods 10ml ', ' ultra'], '', $name);
                $name = trim($name);
                
            $nameMap = [
                'полуниця' => 'Полуниця',
                'ягоди' => 'Ягоди',
                'м\'ята' => 'М\'ята',
                'персик' => 'Персик',
            ];
            
                $normalized = mb_strtolower($name);
                
                $displayName = $nameMap[$normalized] ?? mb_convert_case($name, MB_CASE_TITLE, 'UTF-8');
                
                return [
                        'name' => $displayName,
                ];
            },
            'chaser-for-pods-10ml'
        );
        
        if (empty($flavors10ml)) {
            $this->command->warn('10ml photos directory not found. Creating sample flavors without images.');
            
            // Создаем смаки без изображений
            $flavors10ml = [
                [
                    'name' => 'Полуниця',
                    'image_path' => null,
                ],
                [
                    'name' => 'Ягоди',
                    'image_path' => null,
                ],
                [
                    'name' => 'М\'ята',
                    'image_path' => null,
                ],
                [
                    'name' => 'Персик',
                    'image_path' => null,
                ],
            ];
        }
        
        // Используем первое изображение как основное для продукта
        $mainImagePath = !empty($flavors30ml) && !empty($flavors30ml[0]['image_path']) 
            ? $flavors30ml[0]['image_path'] 
            : null;
        
        // Структура для зберігання смаків для кожного об'єму
        $volumes = [
            '30ml' => [
                'flavors' => $flavors30ml,
                'price' => 325.00,
            ],
            '10ml' => [
                'flavors' => $flavors10ml,
                'price' => 150.00, // Ціна за 10 мл
            ],
        ];
        
        // Создаем один продукт "Chaser for pods" з об'ємами та смаками
        $this->createOrUpdateProduct(
            [
            'name' => 'Chaser for pods',
            'category' => 'Chaser for pods',
            ],
            [
            'description' => 'Премиум жидкость для парения',
            'price' => 325.00, // Ціна за 30 мл за замовчуванням
            'image_path' => $mainImagePath,
            'flavors' => $flavors30ml, // Для сумісності зі старою структурою
            'volumes' => $volumes, // Нова структура з об'ємами
            'is_active' => true,
            ]
        );
        
        // Обработка стіків для IQOS
        $iqosPhotosPath = base_path('../photos iqos');
        if (!File::exists($iqosPhotosPath)) {
            $iqosPhotosPath = base_path('../../photos iqos');
        }
        if (!File::exists($iqosPhotosPath)) {
            $iqosPhotosPath = storage_path('../photos iqos');
        }
        $iqosFlavors = [];
        
        // Популярні назви смаків для IQOS стіків
        $iqosFlavorNames = [
            'Амброзия',
            'Бронзове сонце',
            'Світанок',
            'Зелений тютюн',
            'Жовтий тютюн',
            'Сірий тютюн',
            'Свіжість',
            'М\'ята',
            'Смарагд',
            'Класичний',
        ];
        
        if (File::exists($iqosPhotosPath)) {
            $iqosFlavors = $this->importFlavors(
                $iqosPhotosPath,
                $destinationPath,
                function (\SplFileInfo $photo, int $index) use ($iqosFlavorNames): array {
                    $flavorName = $iqosFlavorNames[$index] ?? 'Смак ' . ($index + 1);
                    
                    return [
                        'name' => $flavorName,
                        'slug' => $flavorName,
                    ];
                },
                'sticks-for-iqos'
            );
        }
        
        // Создаем продукт "Sticks for IQOS" если есть смаки
        if (!empty($iqosFlavors)) {
            $iqosMainImagePath = $iqosFlavors[0]['image_path'];
            
            $this->createOrUpdateProduct(
                [
                'name' => 'Sticks for IQOS',
                'category' => 'Sticks for IQOS',
                ],
                [
                'description' => 'Премиум стіки для IQOS',
                'price' => 120.00,
                'image_path' => $iqosMainImagePath,
                'flavors' => $iqosFlavors,
                'is_active' => true,
                ]
            );
        }
        
        // Обработка новой линейки My Mint
        $myMintPath = $photosPath . '/my mintt';
        $myMintFlavors = $this->importFlavors(
            $myMintPath,
            $destinationPath,
            function (\SplFileInfo $photo, int $index): array {
                $filename = $photo->getFilename();
                $name = pathinfo($filename, PATHINFO_FILENAME);
                $name = str_replace(['_', '-'], ' ', $name);
                $name = trim($name);
                
                $nameMap = [
                    'bubble mint' => 'Bubble Mint',
                    'cranberry mint' => 'Cranberry Mint',
                    'bilberry mint' => 'Bilberry Mint',
                ];
                
                $normalized = mb_strtolower($name);
                
                $displayName = $nameMap[$normalized] ?? mb_convert_case($name, MB_CASE_TITLE, 'UTF-8');
                
                return [
                    'name' => $displayName,
                ];
            },
            'chaser-my-mint'
        );
        
        if (empty($myMintFlavors)) {
            $this->command->warn('My Mint photos directory not found. Creating My Mint flavors without images.');
            
            $myMintFlavors = [
                [
                    'name' => 'Bubble Mint',
                    'image_path' => null,
                ],
                [
                    'name' => 'Cranberry Mint',
                    'image_path' => null,
                ],
                [
                    'name' => 'Bilberry Mint',
                    'image_path' => null,
                ],
            ];
        }
        
        $myMintMainImagePath = !empty($myMintFlavors) && !empty($myMintFlavors[0]['image_path'])
            ? $myMintFlavors[0]['image_path']
            : null;
        
        $this->createOrUpdateProduct(
            [
                'name' => 'Chaser My Mint',
                'category' => 'Chaser My Mint',
            ],
            [
                'description' => 'Премиум жидкость линейки My Mint 30ml',
                'price' => 325.00,
                'image_path' => $myMintMainImagePath,
                'flavors' => $myMintFlavors,
                'is_active' => true,
            ]
        );
        
        // Обработка картриджей Vaporesso XROS
        $cartridgesPath = base_path('../photo cardridz');
        if (!File::exists($cartridgesPath)) {
            $cartridgesPath = base_path('../../photo cardridz');
        }
        if (!File::exists($cartridgesPath)) {
            $cartridgesPath = storage_path('../photo cardridz');
        }
        $cartridgeImagePath = null;
        
        if (File::exists($cartridgesPath)) {
            $cartridgePhotos = File::files($cartridgesPath);
            
            if (!empty($cartridgePhotos)) {
                // Берем первое фото
                $cartridgePhoto = $cartridgePhotos[0];
                $filename = $cartridgePhoto->getFilename();
                $extension = strtolower($cartridgePhoto->getExtension() ?: pathinfo($filename, PATHINFO_EXTENSION) ?: 'jpg');
                
                $newFilename = 'vaporesso_xros_0_6om.' . $extension;
                $destinationFile = $destinationPath . '/' . $newFilename;
                
                if (File::copy($cartridgePhoto->getPathname(), $destinationFile)) {
                    $cartridgeImagePath = 'products/' . $newFilename;
                }
            }
        }
        
        // Создаем продукт "Vaporesso XROS 0.6Ω"
        $this->createOrUpdateProduct(
            [
                'name' => 'Vaporesso XROS 0.6Ω',
                'category' => 'Cartridges',
            ],
            [
                'description' => 'Картридж для Vaporesso XROS Series 0.6Ω',
                'price' => 135.00,
                'image_path' => $cartridgeImagePath,
                'flavors' => [],
                'is_active' => true,
            ]
        );
        
        // Обработка линейки Mix
        $mixPath = $photosPath . '/mix';
        $mixFlavors = $this->importFlavors(
            $mixPath,
            $destinationPath,
            function (\SplFileInfo $photo, int $index): array {
                $filename = $photo->getFilename();
                $name = pathinfo($filename, PATHINFO_FILENAME);
                // Убираем цифры в конце (например "1", "2")
                $name = preg_replace('/\s+\d+$/', '', $name);
                $name = trim($name);
                
                // Маппинг названий для правильного отображения
                $nameMap = [
                    'ожиновий джем' => 'Ожиновий джем',
                    'ожиновийджем' => 'Ожиновий джем',
                ];
                
                $normalized = mb_strtolower($name);
                $displayName = $nameMap[$normalized] ?? mb_convert_case($name, MB_CASE_TITLE, 'UTF-8');
                
                return [
                    'name' => $displayName,
                ];
            },
            'chaser-mix'
        );
        
        if (empty($mixFlavors)) {
            $this->command->warn('Mix photos directory not found. Creating Mix flavors without images.');
            
            $mixFlavors = [
                [
                    'name' => 'Ожиновий джем',
                    'image_path' => null,
                ],
            ];
        }
        
        $mixMainImagePath = !empty($mixFlavors) && !empty($mixFlavors[0]['image_path'])
            ? $mixFlavors[0]['image_path']
            : null;
        
        $this->createOrUpdateProduct(
            [
                'name' => 'Chaser Mix',
                'category' => 'Chaser Mix',
            ],
            [
                'description' => 'Премиум жидкость линейки Mix 30ml',
                'price' => 350.00,
                'image_path' => $mixMainImagePath,
                'flavors' => $mixFlavors,
                'is_active' => true,
            ]
        );
    }
    
    /**
     * Импортирует смаки из директории, копируя изображения в storage.
     *
     * @param  string  $sourcePath
     * @param  string  $destinationPath
     * @param  callable  $nameResolver
     * @return array<int, array<string, mixed>>
     */
    private function importFlavors(
        string $sourcePath,
        string $destinationPath,
        callable $nameResolver,
        string $slugPrefix = ''
    ): array
    {
        if (!File::exists($sourcePath)) {
            return [];
        }
        
        $photos = File::files($sourcePath);
        
        if (empty($photos)) {
            return [];
        }
        
        usort($photos, function ($a, $b) {
            return strcmp($a->getFilename(), $b->getFilename());
        });
        
        $flavors = [];
        
        foreach (array_values($photos) as $index => $photo) {
            $filename = $photo->getFilename();
            $resolved = $nameResolver($photo, $index);
            
            if (is_string($resolved)) {
                $displayName = $resolved;
                $slugBase = $resolved;
            } elseif (is_array($resolved) && isset($resolved['name'])) {
                $displayName = $resolved['name'];
                $slugBase = $resolved['slug'] ?? $displayName;
            } else {
                continue;
            }
            
            $extension = strtolower($photo->getExtension() ?: pathinfo($filename, PATHINFO_EXTENSION) ?: 'jpg');
            $baseSlug = Str::slug($slugBase, '_');
            if (!empty($slugPrefix)) {
                $baseSlug = Str::slug($slugPrefix, '_') . '_' . $baseSlug;
            }
            
            $newFilename = $baseSlug . '.' . $extension;
            $destinationFile = $destinationPath . '/' . $newFilename;
            
            if (File::copy($photo->getPathname(), $destinationFile)) {
                $flavors[] = [
                    'name' => $displayName,
                    'image_path' => 'products/' . $newFilename,
                ];
            }
        }
        
        return $flavors;
    }
    
    /**
     * Создает или обновляет продукт и удаляет дубликаты по ключевым полям.
     *
     * @param  array<string, mixed>  $identifiers
     * @param  array<string, mixed>  $data
     * @return \App\Models\Product
     */
    private function createOrUpdateProduct(array $identifiers, array $data): Product
    {
        $product = Product::updateOrCreate($identifiers, array_merge($identifiers, $data));
        
        Product::where($identifiers)
            ->where('id', '!=', $product->id)
            ->delete();
        
        return $product;
    }
}
