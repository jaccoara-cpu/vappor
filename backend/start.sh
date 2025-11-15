#!/bin/bash
set -e

echo "Starting VAPOR backend..."

# Create database file in persistent storage if it doesn't exist
if [ ! -f /var/www/html/storage/database.sqlite ]; then
    echo "Creating database file..."
    touch /var/www/html/storage/database.sqlite
    chmod 666 /var/www/html/storage/database.sqlite
    echo "Database file created"
else
    echo "Database file already exists"
fi

# Set permissions
chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Start the server
echo "Starting Laravel server..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}

