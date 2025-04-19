# Severance Mystery Game

A LAN-only game portal for 16 players (14 regular + 1 admin) based on the Severance TV show theme.

## Tech Stack

- **Backend**: FastAPI 0.110, SQLModel 0.0.16, Uvicorn
- **Frontend**: React 18, Vite
- **Authentication**: JWT (HS256), bcrypt password hashing
- **Runtime**: Single Docker Compose service on port 3000
- **Database**: SQLite with persistent Docker volume

## Features

- User authentication with JWT tokens
- Character dossiers for "Outies" and "Innies"
- Admin dashboard for creating chat rooms
- Real-time chat between players using long-polling
- Dark mode support
- Mobile-responsive design
- Persistent database storage

## Running the Application

### Using Docker (Recommended)

1. Make sure you have Docker and Docker Compose installed
2. Clone this repository
3. Run the application:

```bash
docker-compose up --build
```

4. Access the application at http://localhost:3000

### Database Persistence

The application uses a Docker volume to persist the database. This means your data will be preserved even if you restart or rebuild the container.

If you have an existing database that you want to migrate to the persistent volume, you can use the provided script:

```bash
./migrate-db.sh
```

## Tailscale Integration

To make the application accessible over Tailscale:
```bash
tailscale funnel 3000
```