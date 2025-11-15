FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    sqlite3 \
    libsqlite3-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql pdo_sqlite mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy backend directory
COPY backend/ /var/www/html/

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Create .env file with basic configuration
# Note: Environment variables from Render will override these values
RUN echo "APP_NAME=VAPOR" > .env && \
    echo "APP_ENV=production" >> .env && \
    echo "APP_KEY=base64:KZ7ZcvhZd78pShCKFUQoHUmOKFdPXxay6HVTIqnerPI=" >> .env && \
    echo "APP_DEBUG=true" >> .env && \
    echo "APP_TIMEZONE=Europe/Kiev" >> .env && \
    echo "APP_LOCALE=ru" >> .env && \
    echo "APP_FALLBACK_LOCALE=ru" >> .env && \
    echo "DB_CONNECTION=sqlite" >> .env && \
    echo "DB_DATABASE=/var/www/html/database/database.sqlite" >> .env && \
    echo "LOG_CHANNEL=stack" >> .env && \
    echo "LOG_LEVEL=error" >> .env && \
    echo "SESSION_DRIVER=file" >> .env && \
    echo "TELEGRAM_BOT_TOKEN=8577074525:AAGusZJT_kPcjnOHVfRB22ZtJNteDGG1DlE" >> .env && \
    echo "TELEGRAM_USER_ID=7736398733" >> .env

# Create database directory (file will be created at runtime if needed)
# Note: Database file should be created before migrations run
RUN mkdir -p database && \
    chmod 777 database

# Set permissions
RUN chmod -R 777 storage bootstrap/cache database
RUN chown -R www-data:www-data storage bootstrap/cache database

# Expose port (Render will set PORT env var)
EXPOSE 8000

# Start command (will be overridden by Render's startCommand)
CMD php artisan serve --host=0.0.0.0 --port=8000

