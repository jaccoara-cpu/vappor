#!/bin/bash
set -e

# Create database directory if it doesn't exist
mkdir -p /var/www/html/database

# Create database file if it doesn't exist
if [ ! -f /var/www/html/database/database.sqlite ]; then
    touch /var/www/html/database/database.sqlite
    chmod 666 /var/www/html/database/database.sqlite
    echo "Database file created"
fi

# Set permissions
chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/database

# Run migrations
php artisan migrate --force || true

# Start the server
exec "$@"

