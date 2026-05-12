from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import re
import tempfile
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone

from emergentintegrations.llm.chat import (
    LlmChat,
    UserMessage,
    FileContentWithMimeType,
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']

# Create the main app without a prefix
app = FastAPI(title="Unbound — Family Court Counselling")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# =========================
# Models
# =========================
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class Counselor(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    title: str
    credentials: str
    bio: str
    specialties: List[str]
    modalities: List[str]  # virtual / in-person
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


# =========================
# Seed Data
# =========================
SEED_COUNSELORS: List[dict] = [
    {
        "id": "c-001",
        "name": "Dr. Maren Holloway",
        "title": "Licensed Family Therapist",
        "credentials": "PhD, LMFT",
        "bio": "Maren has spent 14 years helping parents and children rebuild after high-conflict custody battles. She believes the courtroom is not the only place truth lives.",
        "specialties": ["Parental Alienation", "Co-parenting Trauma", "Child Anxiety"],
        "modalities": ["Virtual", "In-person"],
        "location": "Austin, TX",
        "languages": ["English", "Spanish"],
        "rate": "$140 / session",
        "rating": 4.9,
        "accepting_new": True,
        "image_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=940&q=80",
    },
    {
        "id": "c-002",
        "name": "Jordan Vance, LCSW",
        "title": "Court-Ordered Counselling Specialist",
        "credentials": "MSW, LCSW",
        "bio": "Jordan works specifically with parents navigating court mandates. Direct, non-judgmental, and ferociously protective of the child's voice.",
        "specialties": ["Mandated Counselling", "Father's Rights", "Reunification"],
        "modalities": ["Virtual"],
        "location": "Remote — National",
        "languages": ["English"],
        "rate": "$120 / session",
        "rating": 4.8,
        "accepting_new": True,
        "image_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=940&q=80",
    },
    {
        "id": "c-003",
        "name": "Priya Anand",
        "title": "Child & Adolescent Counsellor",
        "credentials": "MA, LPC",
        "bio": "Priya holds space for the kids no one is listening to. She turns crayon and silence into language a court can finally hear.",
        "specialties": ["Children of Divorce", "Play Therapy", "Adolescent Grief"],
        "modalities": ["In-person"],
        "location": "Seattle, WA",
        "languages": ["English", "Hindi"],
        "rate": "$135 / session",
        "rating": 5.0,
        "accepting_new": False,
        "image_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=940&q=80",
    },
    {
        "id": "c-004",
        "name": "Marcus Reed",
        "title": "Trauma-Informed Coach",
        "credentials": "MA, CCTP",
        "bio": "Marcus survived a four-year custody war. Now he coaches parents through the parts of the system that pretend they aren't broken.",
        "specialties": ["Litigation Stress", "Burnout", "Self-Advocacy"],
        "modalities": ["Virtual"],
        "location": "Remote — National",
        "languages": ["English"],
        "rate": "$95 / session",
        "rating": 4.7,
        "accepting_new": True,
        "image_url": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=940&q=80",
    },
    {
        "id": "c-005",
        "name": "Dr. Elena Brooks",
        "title": "Forensic Family Psychologist",
        "credentials": "PsyD",
        "bio": "Elena reviews custody evaluations and helps parents understand the language the court speaks in — and where it fails them.",
        "specialties": ["Custody Evaluations", "Expert Testimony Prep", "PTSD"],
        "modalities": ["Virtual", "In-person"],
        "location": "Denver, CO",
        "languages": ["English"],
        "rate": "$180 / session",
        "rating": 4.9,
        "accepting_new": True,
        "image_url": "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=940&q=80",
    },
    {
        "id": "c-006",
        "name": "Samuel Okafor",
        "title": "Family Mediator & Counsellor",
        "credentials": "MA, LPC",
        "bio": "Samuel works with families to find paths the court never offered. Calm, structured, deeply unbiased.",
        "specialties": ["Co-parenting", "Mediation", "Communication"],
        "modalities": ["Virtual", "In-person"],
        "location": "Atlanta, GA",
        "languages": ["English", "French"],
        "rate": "$110 / session",
        "rating": 4.8,
        "accepting_new": True,
        "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=940&q=80",
    },
]

SEED_STORIES: List[dict] = [
    {
        "id": "s-001",
        "pen_name": "A Father in Ohio",
        "title": "The day the judge stopped listening",
        "body": "I brought three years of texts, school records, and a child therapist's letter. The judge read for forty seconds and called recess. My son cried in the hallway because he wasn't allowed to speak. That's the day I learned the courtroom isn't where the truth lives — it's where the truth gets rationed.",
        "state": "OH",
        "tags": ["custody", "father"],
        "status": "approved",
        "created_at": now_iso(),
        "likes": 247,
    },
    {
        "id": "s-002",
        "pen_name": "Mama Bear",
        "title": "They mandated counselling. They didn't mandate anyone to listen.",
        "body": "Court-ordered counselling sounded like help. It became another report card from a stranger paid to summarize my pain in 90 minutes. The therapist was kind. The system she fed wasn't.",
        "state": "CA",
        "tags": ["mandate", "mother"],
        "status": "approved",
        "created_at": now_iso(),
        "likes": 412,
    },
    {
        "id": "s-003",
        "pen_name": "Anonymous",
        "title": "My kids learned to perform 'okay'",
        "body": "Two custody evaluations in four years. My daughter is 9. She practices her answers in the mirror. No child should rehearse their own life so adults will believe them.",
        "state": "NY",
        "tags": ["children", "evaluation"],
        "status": "approved",
        "created_at": now_iso(),
        "likes": 538,
    },
    {
        "id": "s-004",
        "pen_name": "Quiet Survivor",
        "title": "I am the parent the court forgot",
        "body": "I followed every order. Paid every fee. Showed up to every appointment. The other parent didn't. The court still treated us as equally culpable because equality is easier to print than fairness.",
        "state": "FL",
        "tags": ["mandate"],
        "status": "approved",
        "created_at": now_iso(),
        "likes": 189,
    },
]

SEED_RESOURCES: List[dict] = [
    {
        "id": "r-001",
        "category": "For Parents",
        "title": "Surviving Court-Ordered Counselling",
        "summary": "What the order really means, what the counsellor reports, and how to protect your peace inside a process designed to extract it.",
        "read_time": "8 min",
    },
    {
        "id": "r-002",
        "category": "For Parents",
        "title": "Documenting Without Drowning",
        "summary": "A grounded framework for recording incidents that protects your case and your nervous system.",
        "read_time": "6 min",
    },
    {
        "id": "r-003",
        "category": "For Children",
        "title": "Helping Kids Speak When No One Asked",
        "summary": "Age-appropriate language to help your child name their experience of the family court system.",
        "read_time": "5 min",
    },
    {
        "id": "r-004",
        "category": "Systemic",
        "title": "Why 'Best Interest of the Child' Often Isn't",
        "summary": "A plain-English breakdown of the legal standard, its blind spots, and the data that haunts it.",
        "read_time": "12 min",
    },
    {
        "id": "r-005",
        "category": "Self-Care",
        "title": "Litigation Burnout Is Real",
        "summary": "Recognizing the somatic toll of years inside the family court system — and what actually helps.",
        "read_time": "7 min",
    },
    {
        "id": "r-006",
        "category": "Systemic",
        "title": "The Counsellor's Report: Decoded",
        "summary": "How court-ordered evaluations are written, what gets cherry-picked, and how to read between the lines.",
        "read_time": "10 min",
    },
]


@app.on_event("startup")
async def seed_db():
    # Idempotent seed
    if await db.counselors.count_documents({}) == 0:
        await db.counselors.insert_many([dict(c) for c in SEED_COUNSELORS])
    else:
        # Keep image_urls fresh on every restart so theming stays in sync.
        for c in SEED_COUNSELORS:
            await db.counselors.update_one(
                {"id": c["id"]}, {"$set": {"image_url": c["image_url"]}}
            )
    if await db.stories.count_documents({}) == 0:
        await db.stories.insert_many([dict(s) for s in SEED_STORIES])
    if await db.resources.count_documents({}) == 0:
        await db.resources.insert_many([dict(r) for r in SEED_RESOURCES])


# =========================
# Routes
# =========================
@api_router.get("/")
async def root():
    return {"message": "Unbound API is live", "version": "1.0"}


@api_router.get("/counselors", response_model=List[Counselor])
async def list_counselors(
    specialty: Optional[str] = None,
    modality: Optional[str] = None,
    accepting: Optional[bool] = None,
):
    query: dict = {}
    if specialty:
        query["specialties"] = {"$regex": specialty, "$options": "i"}
    if modality:
        query["modalities"] = {"$regex": modality, "$options": "i"}
    if accepting is not None:
        query["accepting_new"] = accepting
    docs = await db.counselors.find(query, {"_id": 0}).to_list(100)
    return docs


@api_router.get("/counselors/{counselor_id}", response_model=Counselor)
async def get_counselor(counselor_id: str):
    doc = await db.counselors.find_one({"id": counselor_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Counselor not found")
    return doc


@api_router.post("/bookings", response_model=Booking)
async def create_booking(payload: BookingCreate):
    counselor = await db.counselors.find_one({"id": payload.counselor_id}, {"_id": 0})
    if not counselor:
        raise HTTPException(status_code=404, detail="Counselor not found")
    booking = Booking(**payload.model_dump())
    await db.bookings.insert_one(booking.model_dump())
    return booking


@api_router.get("/stories", response_model=List[Story])
async def list_stories(status: Optional[str] = "approved"):
    query = {"status": status} if status else {}
    docs = await db.stories.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    return docs


@api_router.post("/stories", response_model=Story)
async def submit_story(payload: StoryCreate):
    story = Story(**payload.model_dump(), status="pending")
    await db.stories.insert_one(story.model_dump())
    return story


@api_router.post("/stories/{story_id}/like")
async def like_story(story_id: str):
    res = await db.stories.find_one_and_update(
        {"id": story_id, "status": "approved"},
        {"$inc": {"likes": 1}},
        return_document=True,
        projection={"_id": 0},
    )
    if not res:
        raise HTTPException(status_code=404, detail="Story not found")
    return {"id": story_id, "likes": res.get("likes", 0)}


@api_router.get("/resources")
async def list_resources(category: Optional[str] = None):
    query = {"category": category} if category else {}
    docs = await db.resources.find(query, {"_id": 0}).to_list(100)
    return docs


@api_router.post("/contact", response_model=Contact)
async def submit_contact(payload: ContactCreate):
    contact = Contact(**payload.model_dump())
    await db.contacts.insert_one(contact.model_dump())
    return contact


ANCHOR_BASE_PROMPT = (
    "You are 'Anchor', a warm, grounded guidance companion on Unbound — a platform for "
    "people living through family court-ordered counselling. You are NOT a lawyer, judge, "
    "or licensed therapist. You give compassionate, plain-language information about the "
    "emotional and procedural realities of family court, court-ordered counselling, "
    "co-parenting under mandate, and supporting children through it. "
    "Acknowledge the user's pain. Validate that the system is often unjust and unequally "
    "applied. Never minimize. Never pretend the court is fair when the user's experience "
    "says otherwise. Offer one small, doable next step. Encourage connection with a "
    "licensed counsellor in the directory when emotions feel heavy. Keep replies under "
    "180 words unless asked. Use short paragraphs. Never give specific legal advice — "
    "instead, name the kind of professional who could help."
)


# Map of jurisdiction code -> (display name, code-reference shorthand the LLM should cite)
JURISDICTION_REFS: dict[str, dict[str, str]] = {
    "TX": {
        "name": "Texas",
        "code": "Texas Family Code (e.g., §153.312 standard possession, §6.502 temporary orders)",
    },
    "CA": {
        "name": "California",
        "code": "California Family Code (e.g., §3011 best interest, §3170 mediation, §3190 counseling orders)",
    },
    "NY": {
        "name": "New York",
        "code": "NY Domestic Relations Law & Family Court Act (e.g., DRL §240, FCA Art. 6)",
    },
    "FL": {
        "name": "Florida",
        "code": "Florida Statutes Chapter 61 (e.g., §61.13 parenting plans, §61.21 parenting course)",
    },
    "IL": {
        "name": "Illinois",
        "code": "Illinois Marriage and Dissolution of Marriage Act (750 ILCS 5/602.5–602.7)",
    },
    "GA": {
        "name": "Georgia",
        "code": "Georgia Code Title 19 (e.g., O.C.G.A. §19-9-3 best interest factors)",
    },
    "PA": {
        "name": "Pennsylvania",
        "code": "23 Pa.C.S. §5328 (custody factors) and §5337 (relocation)",
    },
    "OH": {
        "name": "Ohio",
        "code": "Ohio Revised Code §3109.04 (allocation of parental rights)",
    },
    "WA": {
        "name": "Washington",
        "code": "RCW 26.09 (parenting plans), RCW 26.12 (family court)",
    },
    "MA": {
        "name": "Massachusetts",
        "code": "M.G.L. c.208 §31 (custody) and c.215 §56A (GAL/probate)",
    },
    "OTHER": {
        "name": "Other / Unknown jurisdiction",
        "code": "(Jurisdiction not specified — speak in general U.S. family-court terms and tell the reader to confirm specifics with a local attorney.)",
    },
}


def _jurisdiction_addendum(juris: Optional[str]) -> str:
    if not juris:
        return ""
    info = JURISDICTION_REFS.get(juris.upper())
    if not info:
        return (
            f"\n\nJURISDICTION CONTEXT: The user has identified their "
            f"jurisdiction as '{juris}'. Reference the relevant family-law "
            f"framework for that jurisdiction in general terms only; do not "
            f"fabricate statutes. Tell the user to confirm specifics with a "
            f"local attorney."
        )
    return (
        f"\n\nJURISDICTION CONTEXT: The user's jurisdiction is "
        f"{info['name']}. When referencing law, prefer {info['code']}. "
        f"Cite statutes by section/title only — never quote exact text. "
        f"Always remind the user these references are for orientation, not "
        f"legal advice, and that family law varies by county and judge."
    )


def _order_context_addendum(analysis: dict, filename: str) -> str:
    if not analysis:
        return ""
    parts = [
        "\n\nATTACHED ORDER CONTEXT: The user has previously uploaded a "
        f"court document ('{filename}') which Decipher analyzed. Use this "
        "context in every reply. Quote specific obligations or deadlines "
        "from it when relevant. Do not invent details not present here.",
        f"Document type: {analysis.get('document_type', 'Unknown')}",
        f"Summary: {analysis.get('summary', '')}",
    ]
    obligations = analysis.get("key_obligations") or []
    if obligations:
        parts.append("Obligations:")
        for o in obligations[:10]:
            parts.append(
                f"  • {o.get('item','')} — {o.get('responsible_party','')} — {o.get('due','')}"
            )
    deadlines = analysis.get("deadlines") or []
    if deadlines:
        parts.append("Deadlines:")
        for d in deadlines[:10]:
            parts.append(
                f"  • {d.get('date_or_window','')}: {d.get('what','')}"
            )
    watch = analysis.get("things_to_watch") or []
    if watch:
        parts.append("Flags to watch: " + " | ".join(str(x) for x in watch[:6]))
    return "\n".join(parts)


@api_router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    session_id = payload.session_id or str(uuid.uuid4())
    try:
        context_label = None
        system_message = ANCHOR_BASE_PROMPT
        system_message += _jurisdiction_addendum(payload.jurisdiction)

        if payload.order_id:
            order = await db.order_analyses.find_one(
                {"id": payload.order_id}, {"_id": 0}
            )
            if order:
                system_message += _order_context_addendum(
                    order.get("analysis") or {},
                    order.get("filename") or "uploaded order",
                )
                doc_type = (order.get("analysis") or {}).get("document_type")
                context_label = (
                    f"{doc_type} · {order.get('filename')}"
                    if doc_type
                    else order.get("filename")
                )

        chat_client = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_message,
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")

        await db.chat_messages.insert_one({
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "role": "user",
            "content": payload.message,
            "order_id": payload.order_id,
            "jurisdiction": payload.jurisdiction,
            "created_at": now_iso(),
        })

        reply = await chat_client.send_message(UserMessage(text=payload.message))

        await db.chat_messages.insert_one({
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "role": "assistant",
            "content": reply,
            "created_at": now_iso(),
        })

        return ChatResponse(
            session_id=session_id, reply=reply, context_label=context_label
        )
    except Exception as e:
        logging.exception("Chat error")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@api_router.get("/jurisdictions")
async def list_jurisdictions():
    """Return a list of supported jurisdictions for the UI dropdown."""
    return [
        {"code": code, "name": data["name"]}
        for code, data in JURISDICTION_REFS.items()
    ]


@api_router.get("/chat/history/{session_id}")
async def chat_history(session_id: str):
    msgs = await db.chat_messages.find(
        {"session_id": session_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(200)
    return {"session_id": session_id, "messages": msgs}


# =========================
# Court Order Decipher (Gemini 2.5 Pro — supports file attachments)
# =========================
ORDER_ANALYZER_SYSTEM = (
    "You are 'Decipher', a calm, plain-language analyst on Unbound — a "
    "platform for people navigating family court. You read court orders, "
    "stipulations, mandates, and custody documents and translate them into "
    "human language. You are NOT a lawyer. You give educational analysis "
    "and recommended next steps, never legal advice. "
    "You always: (1) acknowledge the emotional weight of receiving an "
    "order, (2) identify obligations clearly, (3) flag deadlines, (4) name "
    "anything that looks unusual, vague, or potentially biased so the "
    "reader can ask their attorney about it, (5) recommend concrete next "
    "steps a non-lawyer can take this week. "
    "ALWAYS respond with VALID JSON ONLY (no prose outside the JSON, no "
    "markdown fences). The JSON schema is: "
    '{"document_type": str, "summary": str, "tone_note": str, '
    '"key_obligations": [{"item": str, "responsible_party": str, '
    '"due": str}], "deadlines": [{"date_or_window": str, "what": str}], '
    '"things_to_watch": [str], "next_steps": [{"step": str, '
    '"why_it_matters": str}], "questions_for_your_attorney": [str], '
    '"emotional_grounding": str}. '
    "If a field has no content, return an empty string or empty array — "
    "never omit a key. Keep each string under 280 characters."
)


class OrderAnalysisResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    filename: str
    mime_type: str
    created_at: str
    jurisdiction: Optional[str] = None
    jurisdiction_name: Optional[str] = None
    analysis: dict


ALLOWED_MIMES = {
    "application/pdf",
    "text/plain",
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/heic",
    "image/heif",
}


def _safe_parse_json(raw: str) -> dict:
    """Try hard to parse Gemini's reply as JSON."""
    if not raw:
        return {"error": "Empty model response"}
    # Strip code fences if present
    cleaned = raw.strip()
    cleaned = re.sub(r"^```(?:json)?", "", cleaned).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()
    try:
        return json.loads(cleaned)
    except Exception:
        # Find first { and last } and try again
        first = cleaned.find("{")
        last = cleaned.rfind("}")
        if first != -1 and last != -1:
            try:
                return json.loads(cleaned[first : last + 1])
            except Exception:
                pass
    return {
        "document_type": "Unknown",
        "summary": cleaned[:2000],
        "tone_note": "",
        "key_obligations": [],
        "deadlines": [],
        "things_to_watch": [],
        "next_steps": [],
        "questions_for_your_attorney": [],
        "emotional_grounding": "",
        "_raw": True,
    }


@api_router.post("/orders/analyze", response_model=OrderAnalysisResult)
async def analyze_order(
    file: UploadFile = File(...),
    notes: Optional[str] = Form(None),
    jurisdiction: Optional[str] = Form(None),
):
    mime = (file.content_type or "").lower()
    if mime not in ALLOWED_MIMES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {mime}. Upload a PDF, image, or text file.",
        )

    # Persist to a temp file — emergentintegrations needs a real file path
    suffix = Path(file.filename or "").suffix or ".bin"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        content = await file.read()
        if len(content) > 15 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 15 MB).")
        tmp.write(content)
        tmp.flush()
        tmp.close()

        session_id = f"order-{uuid.uuid4()}"
        system_msg = ORDER_ANALYZER_SYSTEM + _jurisdiction_addendum(jurisdiction)
        chat_client = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_msg,
        ).with_model("gemini", "gemini-2.5-pro")

        attachment = FileContentWithMimeType(
            file_path=tmp.name,
            mime_type=mime,
        )

        user_text = (
            "Analyze the attached family court document. Return ONLY the "
            "JSON object described in the system message. "
        )
        if jurisdiction:
            j_info = JURISDICTION_REFS.get(jurisdiction.upper())
            j_name = j_info["name"] if j_info else jurisdiction
            user_text += (
                f"\n\nUser has identified their jurisdiction as {j_name}. "
                f"When citing legal references in questions_for_your_attorney "
                f"or things_to_watch, prefer that jurisdiction's framework."
            )
        if notes:
            user_text += f"\n\nUser context (optional): {notes[:500]}"

        raw = await chat_client.send_message(
            UserMessage(text=user_text, file_contents=[attachment])
        )

        analysis = _safe_parse_json(raw)

        j_info = JURISDICTION_REFS.get((jurisdiction or "").upper()) if jurisdiction else None
        result = {
            "id": str(uuid.uuid4()),
            "filename": file.filename or "untitled",
            "mime_type": mime,
            "created_at": now_iso(),
            "jurisdiction": jurisdiction.upper() if jurisdiction else None,
            "jurisdiction_name": j_info["name"] if j_info else None,
            "analysis": analysis,
        }
        await db.order_analyses.insert_one(result.copy())
        # Mongo mutates dict with _id — strip it before returning.
        result.pop("_id", None)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("Order analysis error")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    finally:
        try:
            os.unlink(tmp.name)
        except Exception:
            pass


@api_router.get("/orders/{order_id}", response_model=OrderAnalysisResult)
async def get_order_analysis(order_id: str):
    doc = await db.order_analyses.find_one({"id": order_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return doc


@api_router.get("/stats")
async def stats():
    return {
        "counselors": await db.counselors.count_documents({}),
        "stories_approved": await db.stories.count_documents({"status": "approved"}),
        "stories_pending": await db.stories.count_documents({"status": "pending"}),
        "bookings": await db.bookings.count_documents({}),
        "orders_analyzed": await db.order_analyses.count_documents({}),
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
