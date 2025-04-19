#!/bin/bash

echo "Stopping any running containers..."
docker-compose down

echo "Rebuilding the application..."
docker-compose build

echo "Starting the application..."
docker-compose up -d

echo "Application is now running!"
echo "You can access it locally at: http://localhost:3000"
echo "If using Tailscale, share your Tailscale hostname or IP with players."
echo "They can access the game at: http://<your-tailscale-hostname>:3000"
