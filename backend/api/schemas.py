from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Authentication schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# User schemas
class UserResponse(BaseModel):
    username: str
    role: str

# Room schemas
class RoomCreate(BaseModel):
    playerA: str
    playerB: str

class RoomResponse(BaseModel):
    code4: str
    playerA: str
    playerB: str
    created_at: datetime

# Message schemas
class MessageCreate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: int
    sender: str
    content: str
    ts: datetime

# Clue schemas
class CluesResponse(BaseModel):
    clues: List[str]

class MurderCluesResponse(BaseModel):
    to_outies: List[str]
    to_innies: List[str]

# Persona schemas
class PersonaResponse(BaseModel):
    username: str
    group: str
    description: str
