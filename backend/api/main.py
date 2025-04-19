from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from sqlmodel import Session

from .database import create_db_and_tables, get_session
from .routes import router
from .seed_data import seed_database

app = FastAPI(title="Severance Mystery Game")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for LAN use
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API router
app.include_router(router)

@app.on_event("startup")
def on_startup():
    """Initialize database and seed data on startup"""
    create_db_and_tables()

    # Get a session to seed the database
    session = next(get_session())
    seed_database(session)

# Serve static files from the React build
frontend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")
if os.path.exists(frontend_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="assets")

    @app.get("/", include_in_schema=False)
    @app.get("/{path:path}", include_in_schema=False)
    async def serve_frontend(request: Request, path: str = ""):
        """Serve the frontend React app"""
        index_path = os.path.join(frontend_path, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"status": "error", "message": "Frontend not built"}
else:
    @app.get("/")
    def read_root():
        """Root endpoint for health check"""
        return {"status": "ok", "message": "Severance Mystery Game API is running"}
