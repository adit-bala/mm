from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    pw_hash: str
    role: str  # "admin" or "player"

class Persona(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    group: str  # "outie" or "innie"
    description: str

class Room(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    code4: str = Field(index=True, unique=True)
    playerA: str
    playerB: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    messages: List["Message"] = Relationship(back_populates="room")

class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    room_id: int = Field(foreign_key="room.id")
    sender: str
    content: str
    ts: datetime = Field(default_factory=datetime.utcnow)

    room: Room = Relationship(back_populates="messages")

class DirectMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    admin_username: str  # The admin who sent the message
    user_username: str   # The user who received the message
    content: str
    is_read: bool = Field(default=False)
    ts: datetime = Field(default_factory=datetime.utcnow)
