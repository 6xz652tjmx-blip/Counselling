"""Tests for Decipher (court order analyze) feature using Gemini 2.5 Pro."""
import os
import time
import io
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
assert BASE_URL, "REACT_APP_BACKEND_URL not set"
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"


SAMPLE_ORDER = """IN THE DISTRICT COURT OF TRAVIS COUNTY, TEXAS
CAUSE NO. D-1-FM-25-001234
IN THE INTEREST OF A MINOR CHILD

TEMPORARY ORDERS

On this 12th day of January, 2026, came on for hearing the request for temporary orders. The Court ORDERS:

1. The parties shall exchange the child every Friday at 6:00 PM at the Travis County Sheriff's Office parking lot.
2. Both parties SHALL complete a court-ordered co-parenting class within 60 days of this order.
3. Mother shall provide proof of attendance at her weekly counselling sessions by the 1st of each month.
4. Father shall pay child support of $750 per month, due on the 1st of each month, beginning February 1, 2026.
5. Neither party shall consume alcohol within 12 hours of a custody exchange.
6. A status hearing is set for March 15, 2026 at 9:00 AM.

SO ORDERED.
"""


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    return s


# ---------- /api/orders/analyze ----------
@pytest.fixture(scope="module")
def analyzed_order(session):
    files = {"file": ("temp_order.txt", io.BytesIO(SAMPLE_ORDER.encode("utf-8")), "text/plain")}
    data = {"notes": "Texas temporary order, first hearing"}
    # Gemini calls can be slow
    r = session.post(f"{API}/orders/analyze", files=files, data=data, timeout=180)
    assert r.status_code == 200, f"analyze failed: {r.status_code} {r.text[:500]}"
    return r.json()


def test_analyze_order_structure(analyzed_order):
    o = analyzed_order
    assert "_id" not in o
    for k in ["id", "filename", "mime_type", "created_at", "analysis"]:
        assert k in o, f"missing key {k}"
    assert o["mime_type"] == "text/plain"
    assert o["filename"] == "temp_order.txt"
    a = o["analysis"]
    assert isinstance(a, dict)
    for k in [
        "document_type",
        "summary",
        "key_obligations",
        "deadlines",
        "next_steps",
        "things_to_watch",
        "questions_for_your_attorney",
        "emotional_grounding",
        "tone_note",
    ]:
        assert k in a, f"analysis missing key {k}"
    assert isinstance(a["summary"], str) and len(a["summary"].strip()) > 0
    assert isinstance(a["key_obligations"], list)
    assert isinstance(a["deadlines"], list)
    assert isinstance(a["next_steps"], list)
    assert isinstance(a["things_to_watch"], list)
    assert isinstance(a["questions_for_your_attorney"], list)


def test_analyze_unsupported_mime(session):
    files = {"file": ("bad.zip", io.BytesIO(b"PK\x03\x04fake"), "application/zip")}
    r = session.post(f"{API}/orders/analyze", files=files, timeout=30)
    assert r.status_code == 400
    assert "Unsupported" in r.text or "unsupported" in r.text.lower()


def test_get_order_by_id(session, analyzed_order):
    oid = analyzed_order["id"]
    r = session.get(f"{API}/orders/{oid}", timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert "_id" not in data
    assert data["id"] == oid
    assert data["filename"] == analyzed_order["filename"]
    assert isinstance(data["analysis"], dict)
    assert data["analysis"]["summary"] == analyzed_order["analysis"]["summary"]


def test_get_order_not_found(session):
    r = session.get(f"{API}/orders/does-not-exist", timeout=15)
    assert r.status_code == 404


# ---------- /api/stats includes orders_analyzed and increments ----------
def test_stats_includes_orders_analyzed(session, analyzed_order):
    r = session.get(f"{API}/stats")
    assert r.status_code == 200
    data = r.json()
    assert "orders_analyzed" in data
    assert isinstance(data["orders_analyzed"], int)
    assert data["orders_analyzed"] >= 1


# ---------- quick smoke for prior endpoints ----------
def test_smoke_root(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200


def test_smoke_counselors(session):
    r = session.get(f"{API}/counselors")
    assert r.status_code == 200
    assert len(r.json()) == 6


def test_smoke_stories(session):
    r = session.get(f"{API}/stories", params={"status": "approved"})
    assert r.status_code == 200
    assert len(r.json()) >= 4


def test_smoke_resources(session):
    r = session.get(f"{API}/resources")
    assert r.status_code == 200
    assert len(r.json()) == 6


def test_smoke_contact(session):
    r = session.post(f"{API}/contact", json={
        "name": "TEST_Decipher Smoke",
        "email": "decipher_smoke@example.com",
        "subject": "smoke",
        "message": "smoke msg",
    })
    assert r.status_code == 200


def test_smoke_booking(session):
    r = session.post(f"{API}/bookings", json={
        "counselor_id": "c-001",
        "full_name": "TEST_Smoke Booking",
        "email": "smoke_booking@example.com",
        "preferred_date": "2026-03-01",
    })
    assert r.status_code == 200
