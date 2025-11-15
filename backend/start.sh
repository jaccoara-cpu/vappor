#!/bin/bash
set -e

echo "Starting VAPOR backend..."

# Ensure storage directory exists and has correct permissions
mkdir -p /var/www/html/storage
chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

# Create database file in persistent storage if it doesn't exist
if [ ! -f /var/www/html/storage/database.sqlite ]; then
    echo "Creating database file..."
    touch /var/www/html/storage/database.sqlite
    chmod 666 /var/www/html/storage/database.sqlite
    echo "Database file created at /var/www/html/storage/database.sqlite"
    ls -la /var/www/html/storage/database.sqlite || echo "ERROR: Database file was not created!"
else
    echo "Database file already exists at /var/www/html/storage/database.sqlite"
    ls -la /var/www/html/storage/database.sqlite
fi

# Run migrations
echo "Running migrations..."
php artisan migrate --force || echo "WARNING: Migrations failed, but continuing..."

# Verify database file exists before starting server
if [ ! -f /var/www/html/storage/database.sqlite ]; then
    echo "ERROR: Database file does not exist! Creating it now..."
    touch /var/www/html/storage/database.sqlite
    chmod 666 /var/www/html/storage/database.sqlite
    php artisan migrate --force
fi

# Start the server
echo "Starting Laravel server on port ${PORT:-8000}..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}

