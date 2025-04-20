import json
from sqlmodel import Session, select
from .models import User, Persona
from .auth import get_password_hash

# Seed data as specified in the requirements
SEED_DATA = {
  "users": [
    # role = "admin" gets dashboard access
    { "username": "admin", "password_plain": "admin123", "role": "admin" },

    # 14 regular players, role = "player"
    { "username": "Dhruv",   "password_plain": "bike123", "role": "player" },
    { "username": "Aishani", "password_plain": "silver22", "role": "player" },
    { "username": "Pragya",  "password_plain": "elmwood3", "role": "player" },
    { "username": "Saurav",  "password_plain": "moto18", "role": "player" },
    { "username": "Kailyn",  "password_plain": "pine11", "role": "player" },
    { "username": "Srihitha","password_plain": "cedar9", "role": "player" },
    { "username": "Vijay",   "password_plain": "dog25", "role": "player" },
    { "username": "Reena",   "password_plain": "dino12", "role": "player" },
    { "username": "Riteka",  "password_plain": "notes31", "role": "player" },
    { "username": "Sree",    "password_plain": "solar41", "role": "player" },
    { "username": "Suhani",  "password_plain": "mango40", "role": "player" },
    { "username": "Marissa", "password_plain": "cube12", "role": "player" },
    { "username": "Janani",  "password_plain": "chai30", "role": "player" },
    { "username": "Gaurav",  "password_plain": "ball42", "role": "player"}
  ],

  "personas": {
    "outies": {
      "Dhruv":   "14 Oakwood Ln • teal single‑speed bike • double espresso • vintage‑postcard collector • stargazing‑podcast sleeper",
      "Aishani": "22 Birchwood Ave • silver hatchback w/ bird decal • iced matcha latte • street‑mural photographer • canvas tote of fresh herbs",
      "Pragya":  "3 Elmwood Ct • rides the light rail • vanilla cappuccino • sketches cafés in accordion notebook • mismatched socks",
      "Saurav":  "18 Rosewood Dr • black motorcycle • cold‑brew coffee, black • Friday street‑badminton • limited‑edition sneaker hoard",
      "Vijay":   "25 Dogwood Cir • red sports car • straight Americano • collects antique fedoras • always carries a silver pen",
      "Kailyn":  "11 Pinewood Ter • lime e‑scooter share • mango smoothie • dawn pier‑yoga coach • bright coral water bottle",
      "Srihitha":"9 Cedarwood Walk • lavender electric scooter • chilled hibiscus tea • cryptogram‑puzzle addict • pocket chess set",
    },
    "innies": {
      "Gaurav":  "Cubicle C42 • badge 63006 • berry protein shake • cassette stress‑ball • gummy bears",
      "Sree":    "Cubicle G41 • badge 42322 • hazelnut latte • mini solar‑system model • mixed nuts",
      "Reena":   "Cubicle G12 • badge 15624 • chamomile tea • plush dino • dark chocolate",
      "Marissa": "Cubicle D12 • badge 03414 • peppermint hot‑choc • glass‑cube paperweight • ginger cookies",
      "Janani":  "Cubicle B30 • badge 69071 • spiced ginger chai • beach‑combs seashells • thin silver ankle bracelet",
      "Riteka":  "Cubicle B31 • badge 79888 • cinnamon‑oat latte • animal‑USB stash • neon sticky‑notes",
      "Suhani":  "Cubicle G40 • badge 17255 • mango smoothie • coral stamp pad • blueberry‑oat cookies",
    }
  },

  "clues_regular": {
    "Dhruv":   ["badge last digit <5", "non‑coffee hot drink", "plush dino"],
    "Aishani": ["cubicle B or D", "badge even", "animal USB"],
    "Pragya":  ["cubicle ends 0/1", "identical digits", "coral stamp"],
    "Saurav":  ["badge 2/4/8", "cubicle G", "mini solar system"],
    "Kailyn":  ["cubicle B or D", "badge even", "glass cube"],
    "Srihitha":["cubicle ends 1/2", "coffee drink", "pocket Rubik's cube"],
    "Vijay":   ["badge last digit >5", "motorized vehicle", "antique fedoras"],

    "Reena":   ["two‑wheel commute", "coffee drink", "collects postcards"],
    "Riteka":  ["car OR light‑rail", "tea drink", "carries herbs"],
    "Sree":    ["two‑wheel commute", "coffee drink", "street badminton"],
    "Suhani":  ["coffee drink", "no personal vehicle", "café sketches"],
    "Marissa": ["two‑wheel commute", "NOT coffee", "coral bottle"],
    "Janani":  ["badge digits even sum", "cubicle row B", "silver anklet"],
    "Gaurav":  ["badge last digit even", "protein shake", "cassette stress‑ball"]
  },

  "clues_murder": {
    "to_outies": [
      "coffee‑based beverage",
      "innie murderer is in cubicle letter C or D",
      "collects unusual fashion items"
    ],
    "to_innies": [
      "badge ends 2/4/6",
      "outie murderer has a motorized vehicle",
      "drinks NO coffee or tea"
      
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
