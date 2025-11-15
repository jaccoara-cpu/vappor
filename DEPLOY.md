# Инструкция по деплою на сервер

## 📋 Подготовка к деплою

### 1. Настройка Backend (Laravel)

#### Шаг 1: Настройка `.env` файла на сервере

Создайте файл `.env` в папке `backend/` со следующим содержимым:

```env
APP_NAME="VAPOR"
APP_ENV=production
APP_KEY=base64:ВАШ_СГЕНЕРИРОВАННЫЙ_КЛЮЧ
APP_DEBUG=false
APP_TIMEZONE=Europe/Kiev
APP_URL=https://ваш-домен.com
APP_LOCALE=ru
APP_FALLBACK_LOCALE=ru
APP_FAKER_LOCALE=ru_UA

DB_CONNECTION=sqlite
DB_DATABASE=/полный/путь/к/проекту/backend/database/database.sqlite

TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_USER_ID=ваш_telegram_id

LOG_CHANNEL=stack
LOG_LEVEL=error
```

**Важно:**
- Замените `APP_KEY` на сгенерированный ключ (выполните `php artisan key:generate` на сервере)
- Установите `APP_DEBUG=false` для продакшена
- Укажите правильный `APP_URL` (ваш домен)
- Укажите полный путь к базе данных SQLite

#### Шаг 2: Установка зависимостей

```bash
cd backend
composer install --optimize-autoloader --no-dev
```

#### Шаг 3: Настройка базы данных

```bash
# Создайте базу данных если её нет
touch database/database.sqlite

# Выполните миграции
php artisan migrate --force

# Создайте символическую ссылку для storage
php artisan storage:link
```

#### Шаг 4: Настройка прав доступа

```bash
# Установите права на запись для storage и cache
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

#### Шаг 5: Оптимизация для продакшена

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 2. Настройка Frontend (React)

#### Шаг 1: Настройка `.env` файла на сервере

Создайте файл `.env.production` в папке `frontend/`:

```env
VITE_API_URL=https://ваш-домен.com/api
VITE_STORAGE_URL=https://ваш-домен.com
```

**Важно:**
- Замените `ваш-домен.com` на ваш реальный домен
- Используйте `https://` для продакшена

#### Шаг 2: Сборка проекта

```bash
cd frontend
npm install
npm run build
```

После сборки файлы будут в папке `frontend/dist/`

### 3. Настройка веб-сервера

#### Nginx конфигурация

Пример конфигурации для Nginx:

```nginx
server {
    listen 80;
    server_name ваш-домен.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ваш-домен.com;
    root /путь/к/проекту/backend/public;

    ssl_certificate /путь/к/ssl/cert.pem;
    ssl_certificate_key /путь/к/ssl/key.pem;

    # Backend (Laravel)
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location /api {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location /storage {
        alias /путь/к/проекту/backend/storage/app/public;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Frontend (React)
    location / {
        root /путь/к/проекту/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

#### Apache конфигурация

Если используете Apache, добавьте в `.htaccess` в папке `backend/public/`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^storage/(.*)$ ../storage/app/public/$1 [L]
</IfModule>
```

### 4. Настройка CORS (если frontend на другом домене)

Если frontend и backend на разных доменах, обновите `backend/config/cors.php`:

```php
'allowed_origins' => [
    'https://ваш-frontend-домен.com',
],
```

### 5. Проверка после деплоя

1. **Проверьте доступность API:**
   ```bash
   curl https://ваш-домен.com/api/products
   ```

2. **Проверьте доступность изображений:**
   ```bash
   curl -I https://ваш-домен.com/storage/products/test.jpg
   ```

3. **Проверьте права доступа:**
   ```bash
   ls -la backend/storage/app/public/products
   ```

4. **Проверьте логи:**
   ```bash
   tail -f backend/storage/logs/laravel.log
   ```

### 6. Важные моменты

✅ **Обязательно:**
- Установите `APP_DEBUG=false` в продакшене
- Используйте HTTPS
- Настройте правильные права доступа для `storage/`
- Создайте символическую ссылку `storage:link`
- Настройте CORS для вашего домена
- Используйте переменные окружения для URL

⚠️ **Безопасность:**
- Не коммитьте `.env` файлы в Git
- Используйте сильные пароли для базы данных
- Настройте firewall
- Регулярно обновляйте зависимости

### 7. Обновление проекта на сервере

После изменений в коде:

```bash
# Backend
cd backend
git pull  # или загрузите новые файлы
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Frontend
cd frontend
npm install
npm run build
```

### 8. Troubleshooting

**Проблема: Изображения не загружаются**
- Проверьте символическую ссылку: `ls -la backend/public/storage`
- Проверьте права доступа: `chmod -R 775 backend/storage`
- Проверьте путь в `.env`: `APP_URL` должен быть правильным

**Проблема: CORS ошибки**
- Проверьте настройки в `backend/config/cors.php`
- Убедитесь, что домен добавлен в `allowed_origins`

**Проблема: 500 ошибки**
- Проверьте логи: `tail -f backend/storage/logs/laravel.log`
- Проверьте права доступа на `storage/` и `bootstrap/cache/`
- Очистите кэш: `php artisan config:clear && php artisan cache:clear`

---

**Удачи с деплоем! 🚀**

