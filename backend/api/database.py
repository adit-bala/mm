from sqlmodel import SQLModel, create_engine, Session
import os

# SQLite database URL - use environment variable or default
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./severance.db")

# Ensure data directory exists
if DATABASE_URL.startswith("sqlite:///./data/"):
    os.makedirs("./data", exist_ok=True)

# Create SQLite engine
engine = create_engine(DATABASE_URL, echo=True, connect_args={"check_same_thread": False})

def create_db_and_tables():
    """Create database tables from SQLModel models"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Get a database session"""
    with Session(engine) as session:
        yield session
