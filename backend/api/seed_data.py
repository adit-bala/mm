import json
from sqlmodel import Session, select
from .models import User, Persona
from .auth import get_password_hash

# Seed data as specified in the requirements
SEED_DATA = {
  "users": [
    # role = "admin" gets dashboard access
    { "username": "admin", "password_plain": "changeme", "role": "admin" },

    # 14 regular players, role = "player"
    { "username": "Dhruv",   "password_plain": "play123", "role": "player" },
    { "username": "Aishani", "password_plain": "play123", "role": "player" },
    { "username": "Pragya",  "password_plain": "play123", "role": "player" },
    { "username": "Saurav",  "password_plain": "play123", "role": "player" },
    { "username": "Kailyn",  "password_plain": "play123", "role": "player" },
    { "username": "Janani",  "password_plain": "play123", "role": "player" },
    { "username": "Srihitha","password_plain": "play123", "role": "player" },
    { "username": "Vijay",   "password_plain": "play123", "role": "player" },
    { "username": "Reena",   "password_plain": "play123", "role": "player" },
    { "username": "Riteka",  "password_plain": "play123", "role": "player" },
    { "username": "Varun",   "password_plain": "play123", "role": "player" },
    { "username": "Sree",    "password_plain": "play123", "role": "player" },
    { "username": "Suhani",  "password_plain": "play123", "role": "player" },
    { "username": "Marissa", "password_plain": "play123", "role": "player" },
    { "username": "Ishan",   "password_plain": "play123", "role": "player" },
    { "username": "Gaurav",  "password_plain": "play123", "role": "player" }
  ],

  "personas": {
    "outies": {
      "Dhruv":   "14 Oakwood Ln • teal single‑speed bike • double espresso • vintage‑postcard collector • stargazing‑podcast sleeper",
      "Aishani": "22 Birchwood Ave • silver hatchback w/ bird decal • iced matcha latte • street‑mural photographer • canvas tote of fresh herbs",
      "Pragya":  "3 Elmwood Ct • rides the light rail • vanilla cappuccino • sketches cafés in accordion notebook • mismatched socks",
      "Saurav":  "18 Rosewood Dr • black motorcycle • cold‑brew coffee, black • Friday street‑badminton • limited‑edition sneaker hoard",
      "Kailyn":  "11 Pinewood Ter • lime e‑scooter share • mango smoothie • dawn pier‑yoga coach • bright coral water bottle",
      "Janani":  "7 Maplewood Cres • teal wagon w/ surf rack • spiced ginger chai • beachcombs seashells • thin silver ankle bracelet",
      "Srihitha":"9 Cedarwood Walk • lavender electric scooter • chilled hibiscus tea • cryptogram‑puzzle addict • pocket chess set",
      "Vijay":   "25 Dogwood Cir • red sports car • straight Americano • collects antique fedoras • always carries a silver pen"
    },
    "innies": {
      "Reena":   "Cubicle G12 • badge 15624 • chamomile tea • plush dino • dark chocolate",
      "Riteka":  "Cubicle B31 • badge 79888 • cinnamon‑oat latte • animal‑USB stash • neon notes",
      "Varun":   "Cubicle B30 • badge 69071 • lime sparkling water • dad‑joke calendar • trail mix",
      "Sree":    "Cubicle G41 • badge 42322 • hazelnut latte • mini solar system • mixed nuts",
      "Suhani":  "Cubicle G40 • badge 17255 • mango smoothie • coral stamp pad • blueberry‑oat cookies",
      "Marissa": "Cubicle D12 • badge 03414 • peppermint hot‑choc • glass‑cube weight • ginger cookies",
      "Ishan":   "Cubicle D11 • badge 39239 • black coffee • pocket Rubik's cube • granola bars",
      "Gaurav":  "Cubicle C42 • badge 63006 • berry protein shake • cassette stress‑ball • gummy bears"
    }
  },

  "clues_regular": {
    "Dhruv":   ["badge last digit <5", "non‑coffee hot drink", "plush dino"],
    "Aishani": ["cubicle B or D", "badge even", "animal USB"],
    "Pragya":  ["cubicle ends 0/1", "double digits", "coral stamp"],
    "Saurav":  ["badge 2/4/8", "cubicle G", "mini solar system"],
    "Kailyn":  ["cubicle B or D", "badge even", "glass cube"],
    "Janani":  ["cubicle B or D", "badge odd", "dad‑joke calendar"],
    "Srihitha":["cubicle ends 1/2", "coffee drink", "pocket Rubik's cube"],

    "Reena":   ["two‑wheel commute", "coffee drink", "collects postcards"],
    "Riteka":  ["car OR light‑rail", "tea drink", "carries herbs"],
    "Varun":   ["tea or smoothie", "four‑wheel vehicle", "silver anklet"],
    "Sree":    ["two‑wheel commute", "coffee drink", "street badminton"],
    "Suhani":  ["coffee drink", "no personal vehicle", "café sketches"],
    "Marissa": ["two‑wheel commute", "NOT coffee", "coral bottle"],
    "Ishan":   ["cold drink", "electric two‑wheeler", "cryptogram puzzles"]
  },

  "clues_murder": {
    "to_outies": [
      "badge ends 2/4/6",
      "cubicle letter C or D",
      "drinks NO coffee or tea"
    ],
    "to_innies": [
      "coffee‑based beverage",
      "motorized vehicle",
      "collects unusual fashion items"
    ]
  }
}

def seed_database(session: Session):
    """Seed the database with initial data"""
    # Check if data already exists
    existing_user = session.exec(select(User)).first()
    if existing_user:
        print("Database already seeded, skipping...")
        return
    
    # Seed users
    for user_data in SEED_DATA["users"]:
        user = User(
            username=user_data["username"],
            pw_hash=get_password_hash(user_data["password_plain"]),
            role=user_data["role"]
        )
        session.add(user)
    
    # Seed personas - outies
    for username, description in SEED_DATA["personas"]["outies"].items():
        persona = Persona(
            username=username,
            group="outie",
            description=description
        )
        session.add(persona)
    
    # Seed personas - innies
    for username, description in SEED_DATA["personas"]["innies"].items():
        persona = Persona(
            username=username,
            group="innie",
            description=description
        )
        session.add(persona)
    
    session.commit()
    print("Database seeded successfully!")
