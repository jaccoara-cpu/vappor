# Быстрое создание товаров на продакшн

## Вариант 1: Через новый endpoint (после деплоя)

После деплоя изменений выполните:

```bash
curl -X POST "https://vapor-backend-sy48.onrender.com/api/create-basic-products"
```

Это создаст все 5 товаров без изображений.

## Вариант 2: Через Render Shell

1. Зайдите в Render Dashboard → ваш сервис `vapor-backend`
2. Откройте Shell
3. Выполните:

```bash
php artisan tinker
```

Затем в tinker выполните:

```php
$products = [
    ['name' => 'Chaser for pods', 'category' => 'Chaser for pods', 'description' => 'Премиум жидкость для парения', 'price' => 325.00, 'is_active' => true, 'flavors' => [['name' => 'Виноград', 'is_active' => true], ['name' => 'Вишня', 'is_active' => true], ['name' => 'Вишня Ментол', 'is_active' => true], ['name' => 'Персик', 'is_active' => true], ['name' => 'Смородина ментоол', 'is_active' => true]], 'volumes' => ['30ml' => ['flavors' => [['name' => 'Виноград', 'is_active' => true], ['name' => 'Вишня', 'is_active' => true], ['name' => 'Вишня Ментол', 'is_active' => true], ['name' => 'Персик', 'is_active' => true], ['name' => 'Смородина ментоол', 'is_active' => true]], 'price' => 325.00], '10ml' => ['flavors' => [['name' => 'Полуниця', 'is_active' => true], ['name' => 'Ягоди', 'is_active' => true], ['name' => 'М\'ята', 'is_active' => true], ['name' => 'Персик', 'is_active' => true]], 'price' => 150.00]], 'purchase_price' => 165.0],
    ['name' => 'Sticks for IQOS', 'category' => 'Sticks for IQOS', 'description' => 'Премиум стіки для IQOS', 'price' => 120.00, 'is_active' => true, 'flavors' => [['name' => 'Амброзия', 'is_active' => true], ['name' => 'Бронзове сонце', 'is_active' => true], ['name' => 'Світанок', 'is_active' => true], ['name' => 'Зелений тютюн', 'is_active' => true], ['name' => 'Жовтий тютюн', 'is_active' => true], ['name' => 'Сірий тютюн', 'is_active' => true], ['name' => 'Свіжість', 'is_active' => true], ['name' => 'М\'ята', 'is_active' => true], ['name' => 'Смарагд', 'is_active' => true], ['name' => 'Класичний', 'is_active' => true]], 'purchase_price' => 50.0],
    ['name' => 'Chaser My Mint', 'category' => 'Chaser My Mint', 'description' => 'Премиум жидкость линейки My Mint 30ml', 'price' => 325.00, 'is_active' => true, 'flavors' => [['name' => 'Bubble Mint', 'is_active' => true], ['name' => 'Cranberry Mint', 'is_active' => true], ['name' => 'Bilberry Mint', 'is_active' => true]], 'purchase_price' => 165.0],
    ['name' => 'Vaporesso XROS 0.6Ω', 'category' => 'Cartridges', 'description' => 'Картридж для Vaporesso XROS Series 0.6Ω', 'price' => 135.00, 'is_active' => true, 'flavors' => [], 'purchase_price' => 78.0],
    ['name' => 'Chaser Mix', 'category' => 'Chaser Mix', 'description' => 'Премиум жидкость линейки Mix 30ml', 'price' => 350.00, 'is_active' => true, 'flavors' => [['name' => 'Ожиновий джем', 'is_active' => true]], 'purchase_price' => 165.0],
];

foreach ($products as $p) {
    App\Models\Product::updateOrCreate(['name' => $p['name'], 'category' => $p['category']], $p);
}
```

## Вариант 3: Через сидер (после деплоя)

После деплоя выполните:

```bash
php artisan db:seed --class=ProductSeeder --force
```

Но это требует наличия папок с изображениями, которых может не быть на сервере.

## Рекомендация

**Самый быстрый способ:** Задеплойте изменения и вызовите endpoint `/api/create-basic-products` - это создаст все товары за секунды.

