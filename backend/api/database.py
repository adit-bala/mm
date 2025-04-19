from sqlmodel import SQLModel, create_engine, Session
import os

# SQLite database URL
DATABASE_URL = "sqlite:///./severance.db"

# Create SQLite engine
engine = create_engine(DATABASE_URL, echo=True, connect_args={"check_same_thread": False})

def create_db_and_tables():
    """Create database tables from SQLModel models"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Get a database session"""
    with Session(engine) as session:
        yield session
