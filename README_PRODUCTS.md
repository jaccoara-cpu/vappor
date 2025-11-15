# Создание товаров на продакшн

## ✅ Что было сделано:

1. ✅ Создана Artisan команда `products:create-basic` для создания товаров
2. ✅ Создан API endpoint `/api/create-basic-products` 
3. ✅ Обновлен `start.sh` - товары будут создаваться автоматически при каждом деплое
4. ✅ Улучшено логирование в Catalog.jsx

## 🚀 Быстрое выполнение (ВЫБЕРИТЕ ОДИН СПОСОБ):

### Способ 1: Через Render Shell (САМЫЙ БЫСТРЫЙ - выполните СЕЙЧАС)

1. Откройте [Render Dashboard](https://dashboard.render.com)
2. Выберите сервис `vapor-backend`
3. Нажмите на вкладку **Shell**
4. Выполните команду:

```bash
php artisan products:create-basic
```

**Готово!** Товары созданы. Проверьте: `curl "https://vapor-backend-sy48.onrender.com/api/products"`

---

### Способ 2: Автоматически при следующем деплое

Просто задеплойте изменения в Render. Товары создадутся автоматически благодаря обновленному `start.sh`.

---

### Способ 3: Через API endpoint (после деплоя)

После деплоя выполните:

```bash
curl -X POST "https://vapor-backend-sy48.onrender.com/api/create-basic-products"
```

---

## 📋 Список создаваемых товаров:

1. **Chaser for pods** - 325 ₴** (5 вкусов 30ml + 4 вкуса 10ml)
2. **Sticks for IQOS** - 120 ₴ (10 вкусов)
3. **Chaser My Mint** - 325 ₴ (3 вкуса)
4. **Vaporesso XROS 0.6Ω** - 135 ₴ (картриджи)
5. **Chaser Mix** - 350 ₴ (1 вкус)

---

## ✅ Проверка результата:

```bash
curl "https://vapor-backend-sy48.onrender.com/api/products"
```

Должен вернуться JSON массив с 5 товарами вместо пустого `[]`.

---

## 🎯 РЕКОМЕНДАЦИЯ:

**Используйте Способ 1** - это самый быстрый способ создать товары прямо сейчас без ожидания деплоя.

