import pytest
from fastapi.testclient import TestClient
from main import app
from controllers.peer_rating_controller import PeerRatingController
from schemas.peer_rating_schema import PeerRatingOut, PeerRatingSummaryOut, SessionPeerOut


@pytest.fixture
def client():
    return TestClient(app)


def test_post_rating_success(client, monkeypatch):
    fake_out = PeerRatingOut(
        id="rate-1",
        room_id="room-1",
        rater_id="user-1",
        ratee_id="user-2",
        rating=5,
        feedback="Great partner",
        created_at="2024-01-01T00:00:00Z",
        updated_at="2024-01-01T00:00:00Z",
    )
    monkeypatch.setattr(PeerRatingController, "submit_rating", lambda req, rater_id: fake_out)

    response = client.post(
        "/api/ratings/",
        json={
            "room_id": "room-1",
            "ratee_id": "user-2",
            "rating": 5,
            "feedback": "Great partner",
        },
        headers={"X-User-Id": "user-1"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["id"] == "rate-1"
    assert data["rating"] == 5
    assert data["ratee_id"] == "user-2"


def test_post_rating_self_rejected(client):
    response = client.post(
        "/api/ratings/",
        json={
            "room_id": "room-1",
            "ratee_id": "user-1",
            "rating": 5,
            "feedback": "Myself",
        },
        headers={"X-User-Id": "user-1"},
    )
    assert response.status_code == 400
    assert "cannot rate their own" in response.json()["detail"]


def test_post_rating_invalid_score_rejected(client):
    response = client.post(
        "/api/ratings/",
        json={
            "room_id": "room-1",
            "ratee_id": "user-2",
            "rating": 6,
        },
        headers={"X-User-Id": "user-1"},
    )
    assert response.status_code == 422  # Pydantic ge=1, le=5 validation


def test_post_batch_ratings_success(client, monkeypatch):
    fake_results = [
        PeerRatingOut(
            id="rate-1",
            room_id="room-1",
            rater_id="user-1",
            ratee_id="user-2",
            rating=5,
            created_at="2024-01-01T00:00:00Z",
        ),
        PeerRatingOut(
            id="rate-2",
            room_id="room-1",
            rater_id="user-1",
            ratee_id="user-3",
            rating=4,
            created_at="2024-01-01T00:00:00Z",
        ),
    ]
    monkeypatch.setattr(PeerRatingController, "submit_batch_ratings", lambda req, rater_id: fake_results)

    response = client.post(
        "/api/ratings/batch",
        json={
            "room_id": "room-1",
            "ratings": [
                {"ratee_id": "user-2", "rating": 5},
                {"ratee_id": "user-3", "rating": 4},
            ],
        },
        headers={"X-User-Id": "user-1"},
    )
    assert response.status_code == 201
    data = response.json()
    assert len(data) == 2
    assert data[0]["ratee_id"] == "user-2"
    assert data[1]["ratee_id"] == "user-3"


def test_get_user_summary_endpoint(client, monkeypatch):
    fake_summary = PeerRatingSummaryOut(
        user_id="user-2",
        average_rating=4.8,
        total_ratings=5,
        rating_distribution={1: 0, 2: 0, 3: 0, 4: 1, 5: 4},
        recent_feedback=["Awesome helper!", "Clear explanations"],
    )
    monkeypatch.setattr(PeerRatingController, "get_user_summary", lambda uid: fake_summary)

    response = client.get("/api/ratings/user/user-2/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "user-2"
    assert data["average_rating"] == 4.8
    assert data["total_ratings"] == 5
    assert len(data["recent_feedback"]) == 2


def test_get_eligible_session_peers_endpoint(client, monkeypatch):
    fake_peers = [
        SessionPeerOut(
            user_id="user-2",
            username="Sarah",
            has_rated=False,
        ),
        SessionPeerOut(
            user_id="user-3",
            username="Alex",
            has_rated=True,
            current_rating=5,
            current_feedback="Superb",
        ),
    ]
    monkeypatch.setattr(PeerRatingController, "get_eligible_session_peers", lambda r_id, current_user_id: fake_peers)

    response = client.get(
        "/api/ratings/room/room-1/eligible",
        headers={"X-User-Id": "user-1"},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["username"] == "Sarah"
    assert data[1]["has_rated"] is True
    assert data[1]["current_rating"] == 5


def test_get_my_ratings_in_room_endpoint(client, monkeypatch):
    fake_mine = [
        PeerRatingOut(
            id="rate-1",
            room_id="room-1",
            rater_id="user-1",
            ratee_id="user-2",
            rating=5,
            feedback="Great",
        )
    ]
    monkeypatch.setattr(PeerRatingController, "get_user_ratings_in_room", lambda r_id, rater_id: fake_mine)

    response = client.get(
        "/api/ratings/room/room-1/mine",
        headers={"X-User-Id": "user-1"},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["rating"] == 5
