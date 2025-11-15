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
mkdir -p /var/www/html/storage/app/public/products
chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

# Create storage link for public access to images
echo "Creating storage symbolic link..." >&2
# Remove old link if exists
rm -f /var/www/html/public/storage
# Create new link
php artisan storage:link || echo "Storage link may already exist" >&2
# Verify link was created
if [ -L /var/www/html/public/storage ]; then
    echo "Storage link created successfully" >&2
    ls -la /var/www/html/public/storage >&2
else
    echo "WARNING: Storage link not created, trying manual creation..." >&2
    ln -sf /var/www/html/storage/app/public /var/www/html/public/storage
    ls -la /var/www/html/public/storage >&2
fi

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

# Verify DB_DATABASE environment variable is set
echo "Checking DB_DATABASE environment variable..." >&2
echo "DB_DATABASE env var: ${DB_DATABASE:-NOT SET}" >&2

# Clear config cache to ensure environment variables are loaded
echo "Clearing config cache..." >&2
php artisan config:clear

# Verify the database path Laravel will use
echo "Verifying Laravel database configuration..." >&2
php -r "require 'vendor/autoload.php'; \$app = require_once 'bootstrap/app.php'; \$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap(); echo 'DB_DATABASE config: ' . config('database.connections.sqlite.database') . PHP_EOL;" >&2 || echo "Could not verify config" >&2

# Run migrations (this will also create tables if needed)
echo "Running migrations..." >&2
php artisan migrate --force

# Seed products with images (ProductSeeder will import images if folders exist)
echo "Seeding products with images..." >&2
php artisan db:seed --class=ProductSeeder --force || echo "Product seeding skipped (non-critical)" >&2

# Now clear cache after database is ready
echo "Clearing application cache..." >&2
php artisan cache:clear || echo "Cache clear skipped (non-critical)" >&2

# Verify migrations succeeded
echo "Verifying database..." >&2
php artisan db:show || echo "WARNING: Could not verify database" >&2

# Start the server
echo "Starting Laravel server on port ${PORT:-8000}..." >&2
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}

