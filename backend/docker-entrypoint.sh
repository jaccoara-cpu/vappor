#!/bin/bash
set -e

# Create database file in persistent storage if it doesn't exist
if [ ! -f /var/www/html/storage/database.sqlite ]; then
    touch /var/www/html/storage/database.sqlite
    chmod 666 /var/www/html/storage/database.sqlite
    echo "Database file created in persistent storage"
fi

# Set permissions
chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

# Run migrations
php artisan migrate --force || true

# Start the server
exec "$@"

