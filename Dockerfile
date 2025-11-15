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
    # DB_DATABASE will be set by Render environment variables
    echo "LOG_CHANNEL=stack" >> .env && \
    echo "LOG_LEVEL=error" >> .env && \
    echo "SESSION_DRIVER=file" >> .env && \
    echo "TELEGRAM_BOT_TOKEN=8577074525:AAGusZJT_kPcjnOHVfRB22ZtJNteDGG1DlE" >> .env && \
    echo "TELEGRAM_USER_ID=7736398733" >> .env

# Database will be created in persistent storage at runtime
# No need to create database directory in image

# Set permissions
RUN chmod -R 777 storage bootstrap/cache database
RUN chown -R www-data:www-data storage bootstrap/cache database

# Copy and set up start script
COPY backend/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# Expose port (Render will set PORT env var)
EXPOSE 8000

# Start command (will be overridden by Render's startCommand)
CMD ["/usr/local/bin/start.sh"]

