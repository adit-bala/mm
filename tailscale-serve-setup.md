# Setting Up Tailscale Serve for Severance Mystery App

## Prerequisites
- Tailscale installed on your host machine
- Docker and Docker Compose installed

## Steps

1. **Install Tailscale** on your host machine if you haven't already:
   - For macOS: `brew install tailscale`
   - For Ubuntu/Debian: `curl -fsSL https://tailscale.com/install.sh | sh`
   - For other platforms: [Tailscale Installation Guide](https://tailscale.com/download)

2. **Log in to Tailscale** on your host machine:
   ```bash
   sudo tailscale up
   ```

3. **Start your Severance Mystery app** using the regular Docker Compose file:
   ```bash
   docker-compose up --build
   ```

4. **Set up Tailscale Serve** to expose your app:
   ```bash
   # This command exposes your app on port 3000 to other Tailscale devices
   tailscale serve https:3000 / http://localhost:3000
   ```

   Note: Using `https:3000` instead of `tcp:3000` provides HTTPS support, which may help with some browser security features.

5. **Access your app** from other devices on your Tailscale network:
   - From a browser on another device in your Tailscale network, navigate to:
     ```
     http://<your-tailscale-hostname>:3000
     ```
   - Or use your Tailscale IP address:
     ```
     http://<your-tailscale-ip>:3000
     ```

## Finding Your Tailscale Information

To find your Tailscale hostname and IP address:
```bash
tailscale status
```

This will show output similar to:
```
100.xx.yy.zz   your-machine-name    your@email.com    active
```

## Stopping Tailscale Serve

To stop serving your application:
```bash
tailscale serve reset
```
