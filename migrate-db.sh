#!/bin/bash

echo "Migrating Severance Mystery database to persistent volume..."

# Check if the container is running
CONTAINER_ID=$(docker-compose ps -q severance-app)
if [ -z "$CONTAINER_ID" ]; then
  echo "Error: Severance app container is not running."
  echo "Please start the container first with: docker-compose up -d"
  exit 1
fi

# Check if the old database exists
if [ ! -f "severance.db" ]; then
  echo "No existing database found in the current directory."
  echo "A new database will be created in the persistent volume."
  exit 0
fi

echo "Found existing database. Copying to persistent volume..."

# Create a backup of the existing database
echo "Creating backup of existing database as severance.db.backup..."
cp severance.db severance.db.backup

# Copy the database to the container's data directory
docker cp severance.db ${CONTAINER_ID}:/app/data/severance.db

echo "Database migration complete!"
echo "Your database is now stored in a persistent Docker volume."
echo "The original database has been backed up as severance.db.backup"
echo ""
echo "You can now restart the application with: ./rebuild.sh"
