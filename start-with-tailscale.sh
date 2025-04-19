#!/bin/bash

# Check if TS_AUTH_KEY is provided
if [ -z "$TS_AUTH_KEY" ]; then
  echo "Error: TS_AUTH_KEY environment variable is not set."
  echo "Please obtain an auth key from the Tailscale admin console and set it:"
  echo "export TS_AUTH_KEY=tskey-auth-xxxxxxxxxxxx"
  exit 1
fi

# Create directory for Tailscale data if it doesn't exist
mkdir -p tailscale-data

# Start the services with Tailscale
docker-compose -f docker-compose.tailscale.yml up --build

echo "\nApplication is now running with Tailscale!\n"
echo "Your Tailscale hostname or IP will be used to access the app."
echo "Players can access the game at: http://<your-tailscale-hostname>:3000"
echo "\nTo find your Tailscale hostname and IP, run: tailscale status"

# Note: To stop the services, use:
# docker-compose -f docker-compose.tailscale.yml down
