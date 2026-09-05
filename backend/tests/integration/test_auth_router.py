import pytest
from fastapi.testclient import TestClient
from fastapi import HTTPException
from main import app
from controllers import auth_controller

@pytest.fixture
def client():
    return TestClient(app)


def test_register_endpoint_success(client, monkeypatch):
    fake_user = {
        "id": "u1", "name": "Alice", "email": "alice@test.com",
        "role": "student", "peer_reputation_score": 0, "created_at": "2024-01-01T00:00:00Z",
    }
    monkeypatch.setattr(auth_controller, "register_user", lambda *a, **kw: fake_user)

    response = client.post(
        "/auth/register",
        json={"name": "Alice", "email": "alice@test.com", "password": "test1234"},
    )

    assert response.status_code == 200
    assert response.json()["email"] == "alice@test.com"


def test_register_endpoint_rejects_short_password(client):
    response = client.post(
        "/auth/register",
        json={"name": "Alice", "email": "alice@test.com", "password": "short"},
    )
    assert response.status_code == 422  # Pydantic validation error


def test_register_endpoint_rejects_invalid_email(client):
    response = client.post(
        "/auth/register",
        json={"name": "Alice", "email": "not-an-email", "password": "test1234"},
    )
    assert response.status_code == 422


def test_register_endpoint_duplicate_email_returns_400(client, monkeypatch):
    def raise_duplicate(*a, **kw):
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    monkeypatch.setattr(auth_controller, "register_user", raise_duplicate)

    response = client.post(
        "/auth/register",
        json={"name": "Alice", "email": "alice@test.com", "password": "test1234"},
    )
    assert response.status_code == 400


def test_login_endpoint_success(client, monkeypatch):
    fake_response = {
        "access_token": "fake.jwt.token",
        "token_type": "bearer",
        "user": {
            "id": "u1", "name": "Alice", "email": "alice@test.com",
            "role": "student", "peer_reputation_score": 0, "created_at": "2024-01-01T00:00:00Z",
        },
    }
    monkeypatch.setattr(auth_controller, "login_user", lambda *a, **kw: fake_response)

    response = client.post(
        "/auth/login", json={"email": "alice@test.com", "password": "test1234"}
    )

    assert response.status_code == 200
    assert response.json()["access_token"] == "fake.jwt.token"


def test_login_endpoint_wrong_credentials_returns_401(client, monkeypatch):
    def raise_unauthorized(*a, **kw):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    monkeypatch.setattr(auth_controller, "login_user", raise_unauthorized)

    response = client.post(
        "/auth/login", json={"email": "alice@test.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401