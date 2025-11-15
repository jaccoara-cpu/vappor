#!/bin/bash
set -e

echo "=== Starting VAPOR backend ==="
echo "Current directory: $(pwd)"
echo "PORT: ${PORT:-8000}"

# Check if storage directory exists
echo "Checking storage directory..."
ls -la /var/www/html/storage/ || echo "Storage directory does not exist!"

# Ensure storage directory exists and has correct permissions
echo "Creating storage directory if needed..."
mkdir -p /var/www/html/storage
chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

# Check if persistent disk is mounted
echo "Checking persistent disk mount..."
df -h | grep storage || echo "WARNING: Persistent disk may not be mounted"

# Create database file in persistent storage
DB_PATH="/var/www/html/storage/database.sqlite"
echo "Database path: $DB_PATH"

if [ ! -f "$DB_PATH" ]; then
    echo "Creating database file..."
    touch "$DB_PATH"
    chmod 666 "$DB_PATH"
    echo "Database file created"
    ls -la "$DB_PATH" || echo "ERROR: Database file was not created!"
else
    echo "Database file already exists"
    ls -la "$DB_PATH"
fi

# Verify file was created
if [ ! -f "$DB_PATH" ]; then
    echo "CRITICAL ERROR: Database file does not exist after creation attempt!"
    echo "Trying to create in current directory..."
    touch ./database.sqlite
    chmod 666 ./database.sqlite
    ls -la ./database.sqlite
    exit 1
fi

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Verify migrations succeeded
echo "Verifying database..."
php artisan db:show || echo "WARNING: Could not verify database"

# Start the server
echo "Starting Laravel server on port ${PORT:-8000}..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}

