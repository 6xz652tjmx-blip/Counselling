"""Iteration 3: Jurisdictions + Order context wired into Anchor chat.

Covers:
- GET /api/jurisdictions
- POST /api/orders/analyze with optional jurisdiction form field
- POST /api/chat with optional order_id + jurisdiction (context_label)
- Bogus order_id graceful handling
- Jurisdiction-only chat (no order)
- Regression smoke on prior endpoints
"""
import io
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
assert BASE_URL, "REACT_APP_BACKEND_URL not set"
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"

EXPECTED_CODES = {"TX", "CA", "NY", "FL", "IL", "GA", "PA", "OH", "WA", "MA", "OTHER"}

SAMPLE_ORDER = """IN THE DISTRICT COURT OF TRAVIS COUNTY, TEXAS
CAUSE NO. D-1-FM-25-001234
IN THE INTEREST OF A MINOR CHILD

TEMPORARY ORDERS

On this 12th day of January, 2026, came on for hearing the request for temporary orders. The Court ORDERS:

1. The parties shall exchange the child every Friday at 6:00 PM at the Travis County Sheriff's Office parking lot.
2. Both parties SHALL complete a court-ordered co-parenting class within 14 days of this order.
3. Mother shall provide proof of attendance at her weekly counselling sessions by the 1st of each month.
4. Father shall pay child support of $750 per month, due on the 1st of each month, beginning February 1, 2026.
5. Neither party shall consume alcohol within 12 hours of a custody exchange.
6. A status hearing is set for March 15, 2026 at 9:00 AM.

SO ORDERED.
"""


@pytest.fixture(scope="module")
def session():
    return requests.Session()


# ---------- GET /api/jurisdictions ----------
def test_list_jurisdictions(session):
    r = session.get(f"{API}/jurisdictions", timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == len(EXPECTED_CODES)
    codes = {j["code"] for j in data}
    assert codes == EXPECTED_CODES
    # Each item should have code + name (strings)
    for j in data:
        assert isinstance(j["code"], str) and j["code"]
        assert isinstance(j["name"], str) and j["name"]
    # Spot check
    by_code = {j["code"]: j["name"] for j in data}
    assert by_code["TX"] == "Texas"
    assert by_code["CA"] == "California"


# ---------- POST /api/orders/analyze with jurisdiction ----------
@pytest.fixture(scope="module")
def analyzed_order_tx(session):
    files = {"file": ("temp_order_tx.txt", io.BytesIO(SAMPLE_ORDER.encode("utf-8")), "text/plain")}
    data = {"notes": "Texas temporary order", "jurisdiction": "TX"}
    r = session.post(f"{API}/orders/analyze", files=files, data=data, timeout=180)
    assert r.status_code == 200, f"analyze failed: {r.status_code} {r.text[:500]}"
    return r.json()


def test_analyze_with_jurisdiction_tx(analyzed_order_tx):
    o = analyzed_order_tx
    assert "_id" not in o
    assert o["jurisdiction"] == "TX"
    assert o["jurisdiction_name"] == "Texas"
    assert o["filename"] == "temp_order_tx.txt"
    assert isinstance(o["analysis"], dict)
    assert isinstance(o["analysis"].get("summary"), str) and o["analysis"]["summary"].strip()


def test_analyze_without_jurisdiction(session):
    files = {"file": ("no_juris.txt", io.BytesIO(SAMPLE_ORDER.encode("utf-8")), "text/plain")}
    r = session.post(f"{API}/orders/analyze", files=files, timeout=180)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["jurisdiction"] is None
    assert data["jurisdiction_name"] is None
    assert isinstance(data["analysis"], dict)


# ---------- POST /api/chat with order_id + jurisdiction ----------
def test_chat_with_order_and_jurisdiction(session, analyzed_order_tx):
    oid = analyzed_order_tx["id"]
    payload = {
        "message": "What's the most urgent deadline in this order?",
        "order_id": oid,
        "jurisdiction": "TX",
    }
    r = session.post(f"{API}/chat", json=payload, timeout=90)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "session_id" in data
    assert isinstance(data["reply"], str) and len(data["reply"]) > 20
    # context_label should be present and reference filename
    label = data.get("context_label")
    assert label is not None, "context_label should be set when order_id resolves"
    assert "temp_order_tx.txt" in label, f"context_label missing filename: {label}"
    # Reply should reference document content (deadlines/class/14 day/co-parenting/etc.)
    reply_low = data["reply"].lower()
    hits = ["14", "co-parenting", "class", "exchange", "deadline", "child support", "counseling", "counselling"]
    assert any(h in reply_low for h in hits), f"Reply doesn't reference doc: {data['reply'][:300]}"


def test_chat_with_bogus_order_id(session):
    bogus = str(uuid.uuid4())
    payload = {
        "message": "Hello — does this still work without a real order?",
        "order_id": bogus,
        "jurisdiction": "CA",
    }
    r = session.post(f"{API}/chat", json=payload, timeout=90)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("context_label") is None
    assert isinstance(data["reply"], str) and len(data["reply"]) > 0


def test_chat_jurisdiction_only(session):
    payload = {
        "message": "I'm in California. Where do I start with co-parenting orders?",
        "jurisdiction": "CA",
    }
    r = session.post(f"{API}/chat", json=payload, timeout=90)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("context_label") is None
    assert isinstance(data["reply"], str) and len(data["reply"]) > 0


# ---------- Regression smoke ----------
def test_regression_counselors(session):
    r = session.get(f"{API}/counselors")
    assert r.status_code == 200
    assert len(r.json()) == 6


def test_regression_stories(session):
    r = session.get(f"{API}/stories", params={"status": "approved"})
    assert r.status_code == 200
    assert len(r.json()) >= 4


def test_regression_resources(session):
    r = session.get(f"{API}/resources")
    assert r.status_code == 200
    assert len(r.json()) == 6


def test_regression_contact(session):
    r = session.post(f"{API}/contact", json={
        "name": "TEST_Iter3 Smoke",
        "email": "iter3_smoke@example.com",
        "subject": "smoke",
        "message": "smoke msg",
    })
    assert r.status_code == 200


def test_regression_booking(session):
    r = session.post(f"{API}/bookings", json={
        "counselor_id": "c-001",
        "full_name": "TEST_Iter3 Booking",
        "email": "iter3_booking@example.com",
        "preferred_date": "2026-04-01",
    })
    assert r.status_code == 200


def test_regression_decipher_without_jurisdiction_still_returns_nullable_fields(session):
    files = {"file": ("regression.txt", io.BytesIO(SAMPLE_ORDER.encode("utf-8")), "text/plain")}
    r = session.post(f"{API}/orders/analyze", files=files, timeout=180)
    assert r.status_code == 200
    data = r.json()
    # New fields present (nullable)
    assert "jurisdiction" in data
    assert "jurisdiction_name" in data
    assert data["jurisdiction"] is None
    assert data["jurisdiction_name"] is None
