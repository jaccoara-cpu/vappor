#!/bin/bash
set -e

# Redirect all output to stderr so it appears in Render logs
exec 1>&2

echo "=== Starting VAPOR backend ===" >&2
echo "Current directory: $(pwd)" >&2
echo "PORT: ${PORT:-8000}" >&2

# Check if storage directory exists
echo "Checking storage directory..." >&2
ls -la /var/www/html/storage/ || echo "Storage directory does not exist!" >&2

# Ensure storage directory exists and has correct permissions
echo "Creating storage directory if needed..." >&2
mkdir -p /var/www/html/storage
chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

# Check if persistent disk is mounted
echo "Checking persistent disk mount..." >&2
df -h | grep storage || echo "WARNING: Persistent disk may not be mounted" >&2

# Create database file in persistent storage
DB_PATH="/var/www/html/storage/database.sqlite"
echo "Database path: $DB_PATH" >&2

if [ ! -f "$DB_PATH" ]; then
    echo "Creating database file..." >&2
    touch "$DB_PATH"
    chmod 666 "$DB_PATH"
    echo "Database file created" >&2
    ls -la "$DB_PATH" || echo "ERROR: Database file was not created!" >&2
else
    echo "Database file already exists" >&2
    ls -la "$DB_PATH" >&2
fi

# Verify file was created
if [ ! -f "$DB_PATH" ]; then
    echo "CRITICAL ERROR: Database file does not exist after creation attempt!" >&2
    echo "Trying to create in current directory..." >&2
    touch ./database.sqlite
    chmod 666 ./database.sqlite
    ls -la ./database.sqlite >&2
    exit 1
fi

# Run migrations
echo "Running migrations..." >&2
php artisan migrate --force

# Verify migrations succeeded
echo "Verifying database..." >&2
php artisan db:show || echo "WARNING: Could not verify database" >&2

# Start the server
echo "Starting Laravel server on port ${PORT:-8000}..." >&2
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}

