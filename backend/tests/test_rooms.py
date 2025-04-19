import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from api.main import app
from api.database import get_session
from api.models import User, Room, Message
from api.auth import get_password_hash

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
        player1 = User(
            username="player1",
            pw_hash=get_password_hash("player1pass"),
            role="player"
        )
        player2 = User(
            username="player2",
            pw_hash=get_password_hash("player2pass"),
            role="player"
        )
        player3 = User(
            username="player3",
            pw_hash=get_password_hash("player3pass"),
            role="player"
        )
        
        session.add(admin)
        session.add(player1)
        session.add(player2)
        session.add(player3)
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

def test_create_room(client: TestClient):
    """Test room creation by admin"""
    # Get admin token
    admin_token = get_token(client, "admin", "adminpass")
    
    # Create a room
    response = client.post(
        "/api/rooms",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"playerA": "player1", "playerB": "player2"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "code4" in data
    assert data["playerA"] == "player1"
    assert data["playerB"] == "player2"
    assert "created_at" in data

def test_non_admin_cannot_create_room(client: TestClient):
    """Test that non-admin users cannot create rooms"""
    # Get player token
    player_token = get_token(client, "player1", "player1pass")
    
    # Try to create a room
    response = client.post(
        "/api/rooms",
        headers={"Authorization": f"Bearer {player_token}"},
        json={"playerA": "player1", "playerB": "player2"}
    )
    
    assert response.status_code == 403

def test_get_room(client: TestClient, session: Session):
    """Test getting room details"""
    # Create a room directly in the database
    room = Room(code4="TEST", playerA="player1", playerB="player2")
    session.add(room)
    session.commit()
    
    # Get player1 token
    player1_token = get_token(client, "player1", "player1pass")
    
    # Get room details
    response = client.get(
        "/api/rooms/TEST",
        headers={"Authorization": f"Bearer {player1_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["code4"] == "TEST"
    assert data["playerA"] == "player1"
    assert data["playerB"] == "player2"

def test_unauthorized_room_access(client: TestClient, session: Session):
    """Test that users not in a room cannot access it"""
    # Create a room directly in the database
    room = Room(code4="TEST", playerA="player1", playerB="player2")
    session.add(room)
    session.commit()
    
    # Get player3 token (not in the room)
    player3_token = get_token(client, "player3", "player3pass")
    
    # Try to get room details
    response = client.get(
        "/api/rooms/TEST",
        headers={"Authorization": f"Bearer {player3_token}"}
    )
    
    assert response.status_code == 403

def test_send_and_get_messages(client: TestClient, session: Session):
    """Test sending and retrieving messages in a room"""
    # Create a room directly in the database
    room = Room(code4="CHAT", playerA="player1", playerB="player2")
    session.add(room)
    session.commit()
    session.refresh(room)
    
    # Get player1 token
    player1_token = get_token(client, "player1", "player1pass")
    
    # Send a message
    message_response = client.post(
        "/api/rooms/CHAT/msg",
        headers={"Authorization": f"Bearer {player1_token}"},
        json={"content": "Hello, player2!"}
    )
    
    assert message_response.status_code == 200
    message_data = message_response.json()
    assert message_data["sender"] == "player1"
    assert message_data["content"] == "Hello, player2!"
    
    # Get messages
    messages_response = client.get(
        "/api/rooms/CHAT/messages",
        headers={"Authorization": f"Bearer {player1_token}"}
    )
    
    assert messages_response.status_code == 200
    messages = messages_response.json()
    assert len(messages) == 1
    assert messages[0]["sender"] == "player1"
    assert messages[0]["content"] == "Hello, player2!"

def test_admin_can_access_any_room(client: TestClient, session: Session):
    """Test that admin can access any room"""
    # Create a room directly in the database
    room = Room(code4="ADMN", playerA="player1", playerB="player2")
    session.add(room)
    session.commit()
    
    # Get admin token
    admin_token = get_token(client, "admin", "adminpass")
    
    # Admin should be able to access the room
    response = client.get(
        "/api/rooms/ADMN",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["code4"] == "ADMN"
