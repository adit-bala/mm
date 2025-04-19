import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from api.main import app
from api.database import get_session
from api.models import User
from api.auth import get_password_hash

# Create an in-memory SQLite database for testing
@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        # Create a test user
        test_user = User(
            username="testuser",
            pw_hash=get_password_hash("testpassword"),
            role="player"
        )
        session.add(test_user)
        
        # Create a test admin
        test_admin = User(
            username="testadmin",
            pw_hash=get_password_hash("adminpassword"),
            role="admin"
        )
        session.add(test_admin)
        
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

def test_login_success(client: TestClient):
    """Test successful login"""
    response = client.post(
        "/api/login",
        data={"username": "testuser", "password": "testpassword"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_failure(client: TestClient):
    """Test failed login with wrong password"""
    response = client.post(
        "/api/login",
        data={"username": "testuser", "password": "wrongpassword"}
    )
    assert response.status_code == 401

def test_get_current_user(client: TestClient):
    """Test getting current user info with valid token"""
    # First login to get token
    login_response = client.post(
        "/api/login",
        data={"username": "testuser", "password": "testpassword"}
    )
    token = login_response.json()["access_token"]
    
    # Use token to get user info
    response = client.get(
        "/api/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["role"] == "player"

def test_admin_access(client: TestClient):
    """Test admin-only endpoint access"""
    # Login as admin
    admin_login = client.post(
        "/api/login",
        data={"username": "testadmin", "password": "adminpassword"}
    )
    admin_token = admin_login.json()["access_token"]
    
    # Login as regular user
    user_login = client.post(
        "/api/login",
        data={"username": "testuser", "password": "testpassword"}
    )
    user_token = user_login.json()["access_token"]
    
    # Admin should be able to access murder clues
    admin_response = client.get(
        "/api/clues/murder",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert admin_response.status_code == 200
    
    # Regular user should not be able to access murder clues
    user_response = client.get(
        "/api/clues/murder",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert user_response.status_code == 403
