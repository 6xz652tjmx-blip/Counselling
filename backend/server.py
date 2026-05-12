from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone
import asyncio

# === TEMPORARY MOCK ===
class MockLlmChat:
    def __init__(self, api_key, session_id, system_message):
        self.api_key = api_key
        self.session_id = session_id
        self.system_message = system_message

    def with_model(self, provider, model):
        return self

    async def send_message(self, message):
        return "I'm here with you. What's weighing on your heart about the court situation today? ❤️ (Simple mode — full AI coming soon)"

class MockAnchor:
    async def chat(self, message: str, **kwargs):
        return {"response": "I'm here with you. What's on your mind about the court situation? ❤️ (Simple mode)"}

LlmChat = MockLlmChat
Anchor = MockAnchor()

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def connect_db():
    # === YOUR MONGODB ATLAS CONNECTION (HARDCODED) ===
    mongo_url = "mongodb+srv://charts+6a02b60d1b413567168ea237:njP%sjKSC#0aAjU&7qfs@cluster0.czw0rlt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    
    db_name = os.environ.get('DB_NAME', 'unbound_counselling')
    
    logging.info("🔗 Using MongoDB Atlas (hardcoded)")

    for attempt in range(8):
        try:
            client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=15000)
            await client.admin.command('ping')
            db = client[db_name]
            logging.info(f'✅ Connected to MongoDB Atlas - {db_name}')
            return client, db
        except Exception as e:
            logging.warning(f'Attempt {attempt+1}/8: {str(e)[:200]}...')
            await asyncio.sleep(2 ** attempt)
    
    logging.error('❌ MongoDB connection failed after retries')
    return None, None

client, db = None, None

app = FastAPI(title="Unbound — Family Court Counselling")
api_router = APIRouter(prefix="/api")

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

# Full models and seed data from original
class Counselor(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    title: str
    credentials: str
    bio: str
    specialties: List[str]
    modalities: List[str]
    location: str
    languages: List[str]
    rate: str
    rating: float = 4.8
    accepting_new: bool = True
    image_url: str

class BookingCreate(BaseModel):
    counselor_id: str
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    preferred_date: str
    case_stage: Optional[str] = None
    children_involved: Optional[bool] = False
    message: Optional[str] = None

class Booking(BookingCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: Literal["pending", "confirmed", "cancelled"] = "pending"
    created_at: str = Field(default_factory=now_iso)

class StoryCreate(BaseModel):
    pen_name: Optional[str] = "Anonymous"
    title: str
    body: str
    state: Optional[str] = None
    tags: Optional[List[str]] = []

class Story(StoryCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: Literal["pending", "approved", "rejected"] = "pending"
    created_at: str = Field(default_factory=now_iso)
    likes: int = 0

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    subject: Optional[str] = "General inquiry"
    message: str

class Contact(ContactCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=now_iso)

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    order_id: Optional[str] = None
    jurisdiction: Optional[str] = None

class ChatResponse(BaseModel):
    session_id: str
    reply: str
    context_label: Optional[str] = None

class OrderAnalysisResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    filename: str
    mime_type: str
    created_at: str
    jurisdiction: Optional[str] = None
    jurisdiction_name: Optional[str] = None
    analysis: dict

SEED_COUNSELORS = [{"id": "c-001", "name": "Dr. Maren Holloway", "title": "Licensed Family Therapist", "credentials": "PhD, LMFT", "bio": "Maren has spent 14 years helping parents and children rebuild after high-conflict custody battles.", "specialties": ["Parental Alienation", "Co-parenting Trauma", "Child Anxiety"], "modalities": ["Virtual", "In-person"], "location": "Austin, TX", "languages": ["English", "Spanish"], "rate": "$140 / session", "rating": 4.9, "accepting_new": True, "image_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=940&q=80"}]

@app.on_event("startup")
async def startup_event():
    global client, db
    client, db = await connect_db()
    if db:
        await seed_db()

async def seed_db():
    if not db:
        return
    try:
        if await db.counselors.count_documents({}) == 0:
            await db.counselors.insert_many(SEED_COUNSELORS)
        logging.info("✅ Database seeded")
    except Exception as e:
        logging.error(f"Seed error: {e}")

@api_router.get("/")
async def root():
    return {"message": "Unbound API is live on Railway", "db_connected": db is not None}

# Add other routes similarly, with checks for db
app.include_router(api_router)

app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

logging.basicConfig(level=logging.INFO)

@app.on_event("shutdown")
async def shutdown():
    if client:
        client.close()
