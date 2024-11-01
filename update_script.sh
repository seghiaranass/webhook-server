#!/bin/bash

cd /root/.a/workspaces/flex-configs/


# Bring down the Docker services
docker compose kill php server

# Change directory to src and pull the latest changes
cd /root/.a/workspaces/flex-configs/src

git config --global --add safe.directory /root/.a/workspaces/flex-configs/src

git pull

cd /root/.a/workspaces/flex-configs/

# Build and start necessary services
docker compose run --rm --remove-orphans composer 
docker compose up -d php server --build --remove-orphans

# Wait for MySQL to be ready (max 30s)
# echo "Waiting for MySQL to be ready..."
# until docker compose exec mysql mysqladmin ping -h"mysql" --silent; do
#   echo "Waiting for MySQL..."
#   sleep 2
# done
# echo "MySQL is ready!"

# Set proper permissions for storage
sudo chown -R www-data:www-data /root/.a/workspaces/flex-configs/src/storage/
chmod -R 777 /root/.a/workspaces/flex-configs/src/storage

# Run artisan commands
docker compose run --rm artisan key:generate
docker compose run --rm artisan config:clear

# Install npm dependencies and build assets
docker compose run --rm npm npm install
docker compose run --rm npm npm run build

# Run database migrations
docker compose run --rm artisan migrate --seed
