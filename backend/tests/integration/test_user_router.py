import pytest
from fastapi.testclient import TestClient
from main import app
from dependencies.auth_dependency import get_current_user
from controllers import user_controller


FAKE_CURRENT_USER = {
    "id": "u1",
    "name": "Alice",
    "email": "alice@test.com",
    "password_hash": "should-never-leak",
    "role": "student",
    "peer_reputation_score": 0,
    "created_at": "2024-01-01T00:00:00Z",
}


@pytest.fixture
def client():
    app.dependency_overrides[get_current_user] = lambda: FAKE_CURRENT_USER
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_get_me_returns_current_user_without_password_hash(client):
    response = client.get("/users/me")
    assert response.status_code == 200
    body = response.json()
    assert body["email"] == "alice@test.com"
    assert "password_hash" not in body


def test_get_me_requires_authentication(monkeypatch):
    # dependency override ছাড়া raw client দিয়ে টেস্ট — token ছাড়া কল করলে reject হওয়া উচিত
    app.dependency_overrides.clear()
    raw_client = TestClient(app)
    response = raw_client.get("/users/me")
    assert response.status_code == 401


def test_update_me_success(client, monkeypatch):
    updated_user = {**FAKE_CURRENT_USER, "name": "Alice Updated"}
    updated_user.pop("password_hash")
    monkeypatch.setattr(user_controller, "update_profile", lambda *a, **kw: updated_user)

    response = client.put("/users/me", json={"name": "Alice Updated"})

    assert response.status_code == 200
    assert response.json()["name"] == "Alice Updated"


def test_rate_peer_endpoint_success(client, monkeypatch):
    monkeypatch.setattr(user_controller, "rate_peer", lambda *a, **kw: None)

    response = client.post("/users/u2/rate", json={"score": 5})

    assert response.status_code == 200
    assert response.json() == {"success": True}


def test_rate_peer_endpoint_rejects_invalid_score(client):
    response = client.post("/users/u2/rate", json={"score": 10})  # max 5
    assert response.status_code == 422


def test_rate_peer_endpoint_propagates_controller_error(client, monkeypatch):
    from fastapi import HTTPException

    def raise_error(*a, **kw):
        raise HTTPException(status_code=400, detail="You cannot rate yourself")

    monkeypatch.setattr(user_controller, "rate_peer", raise_error)

    response = client.post("/users/u1/rate", json={"score": 3})
    assert response.status_code == 400