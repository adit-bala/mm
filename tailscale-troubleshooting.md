# Troubleshooting Tailscale Access for Severance Mystery App

If you're experiencing issues accessing the application through Tailscale, particularly with login not working, follow these steps to resolve the problem:

## Common Issues and Solutions

### 1. API Base URL Issue

The most common issue is that the frontend is trying to access the API at `localhost:3000/api` instead of using the Tailscale hostname.

**Solution:**
We've updated the API client to use a relative URL (`/api`) instead of an absolute URL (`http://localhost:3000/api`). This change allows the application to work regardless of how it's accessed.

To apply this fix:

1. Rebuild the application:
   ```bash
   ./rebuild.sh
   ```

2. If you're using Tailscale serve on the host:
   ```bash
   tailscale serve https:3000 / http://localhost:3000
   ```

### 2. CORS (Cross-Origin Resource Sharing) Issues

If you're still experiencing issues, it might be related to CORS.

**Solution:**
The backend is already configured to allow all origins, but you can verify this in `backend/api/main.py`.

### 3. Mixed Content Issues

If you're accessing the app via HTTPS through Tailscale but the API calls are using HTTP, browsers might block the requests.

**Solution:**
Use `https:3000` instead of `tcp:3000` in your Tailscale serve command:
```bash
tailscale serve https:3000 / http://localhost:3000
```

### 4. Network Connectivity

Make sure all devices can properly connect to each other through Tailscale.

**Solution:**
1. Check Tailscale status:
   ```bash
   tailscale status
   ```

2. Ensure the device running the app shows as "online"

3. Try pinging the Tailscale IP from another device:
   ```bash
   ping <tailscale-ip>
   ```

## Testing the Connection

To verify that the application is accessible through Tailscale:

1. On the server, run:
   ```bash
   curl http://localhost:3000
   ```
   This should return the HTML for the frontend.

2. On a client device, run:
   ```bash
   curl http://<tailscale-hostname>:3000
   ```
   This should also return the HTML for the frontend.

## Complete Reset

If you're still experiencing issues, try a complete reset:

1. Stop all containers:
   ```bash
   docker-compose down
   ```

2. Reset Tailscale serve:
   ```bash
   tailscale serve reset
   ```

3. Rebuild the application:
   ```bash
   ./rebuild.sh
   ```

4. Set up Tailscale serve again:
   ```bash
   tailscale serve https:3000 / http://localhost:3000
   ```

5. Access the application at `http://<tailscale-hostname>:3000`
