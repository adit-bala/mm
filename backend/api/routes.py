from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from typing import List, Dict, Optional
import random
import string
import time
from datetime import datetime, timedelta
from collections import defaultdict

from .database import get_session
from .models import User, Persona, Room, Message
from .schemas import (
    Token, UserResponse, RoomCreate, RoomResponse,
    MessageCreate, MessageResponse, CluesResponse,
    MurderCluesResponse, PersonaResponse
)
from .auth import (
    authenticate_user, create_access_token,
    get_current_user, get_admin_user
)
from .seed_data import SEED_DATA

router = APIRouter(prefix="/api")

# Store for long-polling requests
message_events = defaultdict(list)
waiting_clients = defaultdict(list)

# Rate limiting for messages
message_rate_limit = {}
MAX_MESSAGES_PER_MINUTE = 60

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {"username": current_user.username, "role": current_user.role}

@router.get("/personas", response_model=List[PersonaResponse])
async def get_personas(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    personas = session.exec(select(Persona)).all()
    return personas

@router.get("/clues", response_model=CluesResponse)
async def get_clues(current_user: User = Depends(get_current_user)):
    if current_user.username in SEED_DATA["clues_regular"]:
        return {"clues": SEED_DATA["clues_regular"][current_user.username]}
    return {"clues": []}

@router.get("/clues/murder", response_model=MurderCluesResponse)
async def get_murder_clues(current_user: User = Depends(get_admin_user)):
    return {
        "to_outies": SEED_DATA["clues_murder"]["to_outies"],
        "to_innies": SEED_DATA["clues_murder"]["to_innies"]
    }

@router.get("/rooms", response_model=List[RoomResponse])
async def get_all_rooms(current_user: User = Depends(get_admin_user), session: Session = Depends(get_session)):
    """Get all rooms (admin only)"""
    rooms = session.exec(select(Room).order_by(Room.created_at.desc())).all()
    return rooms

@router.post("/rooms", response_model=RoomResponse)
async def create_room(room_data: RoomCreate, current_user: User = Depends(get_admin_user), session: Session = Depends(get_session)):
    # Generate a random 4-character code
    code4 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))

    # Check if code already exists
    while session.exec(select(Room).where(Room.code4 == code4)).first():
        code4 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))

    # Create the room
    room = Room(
        code4=code4,
        playerA=room_data.playerA,
        playerB=room_data.playerB
    )
    session.add(room)
    session.commit()
    session.refresh(room)

    return room

@router.get("/rooms/{code4}", response_model=RoomResponse)
async def get_room(code4: str, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    room = session.exec(select(Room).where(Room.code4 == code4)).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Check if user is allowed in this room
    if current_user.role != "admin" and current_user.username not in [room.playerA, room.playerB]:
        raise HTTPException(status_code=403, detail="Not authorized to access this room")

    return room

@router.get("/rooms/{code4}/messages", response_model=List[MessageResponse])
async def get_messages(code4: str, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    room = session.exec(select(Room).where(Room.code4 == code4)).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Check if user is allowed in this room
    if current_user.role != "admin" and current_user.username not in [room.playerA, room.playerB]:
        raise HTTPException(status_code=403, detail="Not authorized to access this room")

    # Get the last 50 messages
    messages = session.exec(
        select(Message)
        .where(Message.room_id == room.id)
        .order_by(Message.ts.desc())
        .limit(50)
    ).all()

    return list(reversed(messages))

@router.post("/rooms/{code4}/msg", response_model=MessageResponse)
async def create_message(
    code4: str,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Rate limiting
    now = datetime.utcnow()
    user_key = f"{current_user.username}:{now.minute}"

    if user_key in message_rate_limit:
        if message_rate_limit[user_key] >= MAX_MESSAGES_PER_MINUTE:
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        message_rate_limit[user_key] += 1
    else:
        # Clean up old entries
        for key in list(message_rate_limit.keys()):
            if key.split(':')[1] != str(now.minute):
                del message_rate_limit[key]
        message_rate_limit[user_key] = 1

    room = session.exec(select(Room).where(Room.code4 == code4)).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Check if user is allowed in this room
    if current_user.role != "admin" and current_user.username not in [room.playerA, room.playerB]:
        raise HTTPException(status_code=403, detail="Not authorized to access this room")

    # Create the message
    message = Message(
        room_id=room.id,
        sender=current_user.username,
        content=message_data.content
    )
    session.add(message)
    session.commit()
    session.refresh(message)

    # Notify waiting clients
    message_events[code4].append(message)

    # Notify waiting clients directly instead of using background tasks
    notify_clients(code4)

    return message

@router.get("/rooms/{code4}/stream")
async def stream_messages(
    code4: str,
    after: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    room = session.exec(select(Room).where(Room.code4 == code4)).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Check if user is allowed in this room
    if current_user.role != "admin" and current_user.username not in [room.playerA, room.playerB]:
        raise HTTPException(status_code=403, detail="Not authorized to access this room")

    # Get new messages since 'after'
    query = select(Message).where(Message.room_id == room.id)
    if after:
        query = query.where(Message.id > after)
    query = query.order_by(Message.ts.asc())

    # Limit to 50 messages to avoid overwhelming the client
    query = query.limit(50)

    new_messages = session.exec(query).all()

    # If there are new messages, return them immediately
    if new_messages:
        return [
            {
                "id": msg.id,
                "sender": msg.sender,
                "content": msg.content,
                "ts": msg.ts
            } for msg in new_messages
        ]

    # For simplicity, we'll return an empty list immediately instead of long-polling
    # This avoids blocking issues and the client will poll again after a short delay
    return []

def notify_clients(code4: str):
    """Notify waiting clients about new messages"""
    if code4 not in waiting_clients:
        return

    for event in waiting_clients[code4]:
        event["has_new_messages"] = True
        event["messages"] = [
            {
                "id": msg.id,
                "sender": msg.sender,
                "content": msg.content,
                "ts": msg.ts
            } for msg in message_events[code4]
        ]

    # Clear the events and waiting clients
    message_events[code4] = []
    waiting_clients[code4] = []
