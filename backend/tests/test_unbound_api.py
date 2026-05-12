"""Backend regression tests for Unbound — Family Court Counselling platform."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or "https://family-court-truth.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Root ----------
def test_root_message(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert "Unbound API is live" in data.get("message", "")


# ---------- Counsellors ----------
def test_list_counselors_seeded(session):
    r = session.get(f"{API}/counselors")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 6
    # No mongo _id
    for c in data:
        assert "_id" not in c
        assert "id" in c
        assert "name" in c


def test_get_single_counselor(session):
    r = session.get(f"{API}/counselors/c-001")
    assert r.status_code == 200
    data = r.json()
    assert data["id"] == "c-001"
    assert data["name"] == "Dr. Maren Holloway"


def test_get_counselor_not_found(session):
    r = session.get(f"{API}/counselors/does-not-exist")
    assert r.status_code == 404


def test_filter_counselors_by_specialty(session):
    r = session.get(f"{API}/counselors", params={"specialty": "Reunification"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1
    for c in data:
        assert any("Reunification".lower() in s.lower() for s in c["specialties"])


def test_filter_counselors_by_accepting(session):
    r = session.get(f"{API}/counselors", params={"accepting": "true"})
    assert r.status_code == 200
    data = r.json()
    for c in data:
        assert c["accepting_new"] is True


# ---------- Bookings ----------
def test_create_booking_success(session):
    payload = {
        "counselor_id": "c-001",
        "full_name": "TEST_Booking User",
        "email": "test_booking@example.com",
        "preferred_date": "2026-02-15",
        "phone": "555-0100",
        "message": "Testing booking flow",
    }
    r = session.post(f"{API}/bookings", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["counselor_id"] == "c-001"
    assert data["email"] == "test_booking@example.com"
    assert data["status"] == "pending"
    assert "id" in data


def test_create_booking_bad_counselor(session):
    payload = {
        "counselor_id": "does-not-exist",
        "full_name": "TEST_Bad",
        "email": "test_bad@example.com",
        "preferred_date": "2026-02-15",
    }
    r = session.post(f"{API}/bookings", json=payload)
    assert r.status_code == 404


# ---------- Stories ----------
def test_list_approved_stories(session):
    r = session.get(f"{API}/stories", params={"status": "approved"})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    # At least 4 seeded (more can exist if previous test runs added & got approved manually)
    assert len(data) >= 4
    for s in data:
        assert "_id" not in s
        assert s["status"] == "approved"


def test_submit_story_pending(session):
    payload = {
        "pen_name": "TEST_Author",
        "title": "TEST_A test story title",
        "body": "This is a test story body for automation",
        "state": "TX",
        "tags": ["test"],
    }
    r = session.post(f"{API}/stories", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "pending"
    assert data["title"] == payload["title"]
    assert data["likes"] == 0


def test_like_story(session):
    # like a seeded approved story
    r = session.post(f"{API}/stories/s-001/like")
    assert r.status_code == 200
    data = r.json()
    assert data["id"] == "s-001"
    assert isinstance(data["likes"], int)
    likes_before = data["likes"]
    # increment again to confirm increment
    r2 = session.post(f"{API}/stories/s-001/like")
    assert r2.status_code == 200
    assert r2.json()["likes"] == likes_before + 1


def test_like_story_not_found(session):
    r = session.post(f"{API}/stories/nonexistent/like")
    assert r.status_code == 404


# ---------- Resources ----------
def test_list_resources(session):
    r = session.get(f"{API}/resources")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 6
    for res in data:
        assert "_id" not in res
        assert "category" in res


def test_resources_filter_by_category(session):
    r = session.get(f"{API}/resources", params={"category": "Systemic"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1
    for res in data:
        assert res["category"] == "Systemic"


# ---------- Contact ----------
def test_contact_submit(session):
    payload = {
        "name": "TEST_Contact User",
        "email": "test_contact@example.com",
        "subject": "Test inquiry",
        "message": "This is a test contact submission",
    }
    r = session.post(f"{API}/contact", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == payload["email"]
    assert "id" in data


# ---------- Chat (Claude Sonnet 4.5 via Emergent LLM key) ----------
def test_chat_flow_and_history(session):
    payload = {"message": "I feel overwhelmed by my custody case. Where do I begin?"}
    r = session.post(f"{API}/chat", json=payload, timeout=60)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "session_id" in data
    assert "reply" in data
    assert isinstance(data["reply"], str)
    assert len(data["reply"]) > 0
    sid = data["session_id"]

    time.sleep(1)
    # second message in same session
    r2 = session.post(f"{API}/chat", json={"session_id": sid, "message": "Thank you. Can you say more?"}, timeout=60)
    assert r2.status_code == 200, r2.text
    data2 = r2.json()
    assert data2["session_id"] == sid
    assert len(data2["reply"]) > 0

    # history
    r3 = session.get(f"{API}/chat/history/{sid}")
    assert r3.status_code == 200
    hist = r3.json()
    assert hist["session_id"] == sid
    # 2 user + 2 assistant = 4
    assert len(hist["messages"]) >= 4
    roles = [m["role"] for m in hist["messages"]]
    assert "user" in roles and "assistant" in roles


# ---------- Stats ----------
def test_stats(session):
    r = session.get(f"{API}/stats")
    assert r.status_code == 200
    data = r.json()
    for k in ["counselors", "stories_approved", "stories_pending", "bookings"]:
        assert k in data
        assert isinstance(data[k], int)
    assert data["counselors"] == 6
    assert data["stories_approved"] >= 4
