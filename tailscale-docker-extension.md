# Using Tailscale Docker Extension

If you're using Docker Desktop, you can use the Tailscale Docker Extension for an easy integration.

## Steps

1. **Install the Tailscale Docker Extension**:
   - Open Docker Desktop
   - Go to Extensions
   - Search for "Tailscale"
   - Click "Install"

2. **Configure the Tailscale Extension**:
   - After installation, click on the Tailscale extension in Docker Desktop
   - Log in with your Tailscale account
   - You'll see your Tailscale IP address in the extension UI

3. **Start your Severance Mystery app**:
   ```bash
   docker-compose up --build
   ```

4. **Expose your app through Tailscale**:
   - In the Tailscale extension, click "Add Service"
   - Select your severance-app container
   - Set the port to 3000
   - Click "Add"

5. **Access your app** from other devices on your Tailscale network:
   - From a browser on another device in your Tailscale network, navigate to:
     ```
     http://<your-tailscale-hostname>:3000
     ```
   - Or use your Tailscale IP address:
     ```
     http://<your-tailscale-ip>:3000
     ```
