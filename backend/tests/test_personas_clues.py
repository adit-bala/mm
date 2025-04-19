import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from api.main import app
from api.database import get_session
from api.models import User, Persona
from api.auth import get_password_hash
from api.seed_data import SEED_DATA

# Create an in-memory SQLite database for testing
@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        # Create test users
        admin = User(
            username="admin",
            pw_hash=get_password_hash("adminpass"),
            role="admin"
        )
        dhruv = User(
            username="Dhruv",
            pw_hash=get_password_hash("dhruvpass"),
            role="player"
        )
        reena = User(
            username="Reena",
            pw_hash=get_password_hash("reenapass"),
            role="player"
        )
        
        session.add(admin)
        session.add(dhruv)
        session.add(reena)
        
        # Create test personas
        dhruv_persona = Persona(
            username="Dhruv",
            group="outie",
            description=SEED_DATA["personas"]["outies"]["Dhruv"]
        )
        reena_persona = Persona(
            username="Reena",
            group="innie",
            description=SEED_DATA["personas"]["innies"]["Reena"]
        )
        
        session.add(dhruv_persona)
        session.add(reena_persona)
        
        session.commit()
        
        yield session

# Override the get_session dependency
@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

def get_token(client: TestClient, username: str, password: str):
    """Helper function to get auth token"""
    response = client.post(
        "/api/login",
        data={"username": username, "password": password}
    )
    return response.json()["access_token"]

def test_get_personas(client: TestClient):
    """Test retrieving all personas"""
    # Get user token
    token = get_token(client, "Dhruv", "dhruvpass")
    
    # Get personas
    response = client.get(
        "/api/personas",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    personas = response.json()
    assert len(personas) == 2
    
    # Check that both personas are in the response
    persona_usernames = [p["username"] for p in personas]
    assert "Dhruv" in persona_usernames
    assert "Reena" in persona_usernames
    
    # Check persona details
    dhruv_persona = next(p for p in personas if p["username"] == "Dhruv")
    assert dhruv_persona["group"] == "outie"
    assert "teal single‑speed bike" in dhruv_persona["description"]
    
    reena_persona = next(p for p in personas if p["username"] == "Reena")
    assert reena_persona["group"] == "innie"
    assert "Cubicle G12" in reena_persona["description"]

def test_get_clues(client: TestClient):
    """Test retrieving clues for a user"""
    # Get Dhruv's token
    dhruv_token = get_token(client, "Dhruv", "dhruvpass")
    
    # Get Dhruv's clues
    response = client.get(
        "/api/clues",
        headers={"Authorization": f"Bearer {dhruv_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "clues" in data
    assert len(data["clues"]) == 3
    assert "badge last digit <5" in data["clues"]
    assert "non‑coffee hot drink" in data["clues"]
    assert "plush dino" in data["clues"]
    
    # Get Reena's token
    reena_token = get_token(client, "Reena", "reenapass")
    
    # Get Reena's clues
    response = client.get(
        "/api/clues",
        headers={"Authorization": f"Bearer {reena_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "clues" in data
    assert len(data["clues"]) == 3
    assert "two‑wheel commute" in data["clues"]
    assert "coffee drink" in data["clues"]
    assert "collects postcards" in data["clues"]

def test_get_murder_clues(client: TestClient):
    """Test retrieving murder clues (admin only)"""
    # Get admin token
    admin_token = get_token(client, "admin", "adminpass")
    
    # Get murder clues
    response = client.get(
        "/api/clues/murder",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "to_outies" in data
    assert "to_innies" in data
    assert len(data["to_outies"]) == 3
    assert len(data["to_innies"]) == 3
    
    # Check specific clues
    assert "badge ends 2/4/6" in data["to_outies"]
    assert "cubicle letter C or D" in data["to_outies"]
    assert "drinks NO coffee or tea" in data["to_outies"]
    
    assert "coffee‑based beverage" in data["to_innies"]
    assert "motorized vehicle" in data["to_innies"]
    assert "collects unusual fashion items" in data["to_innies"]
    
    # Regular user should not be able to access murder clues
    dhruv_token = get_token(client, "Dhruv", "dhruvpass")
    
    response = client.get(
        "/api/clues/murder",
        headers={"Authorization": f"Bearer {dhruv_token}"}
    )
    
    assert response.status_code == 403
