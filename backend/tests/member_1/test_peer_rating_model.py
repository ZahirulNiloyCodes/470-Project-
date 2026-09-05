import pytest
from models.peer_rating_model import PeerRatingModel
from models import peer_rating_model as peer_rating_model_module


@pytest.fixture(autouse=True)
def patch_supabase(monkeypatch, fake_supabase):
    monkeypatch.setattr(peer_rating_model_module, "supabase", fake_supabase)
    return fake_supabase


def test_create_rating_inserts_row(patch_supabase):
    payload = {
        "room_id": "room-1",
        "rater_id": "user-1",
        "ratee_id": "user-2",
        "rating": 5,
        "feedback": "Great study partner",
    }
    created = PeerRatingModel.create_or_update_rating(payload)
    assert created["room_id"] == "room-1"
    assert created["rater_id"] == "user-1"
    assert created["ratee_id"] == "user-2"
    assert created["rating"] == 5
    assert created["feedback"] == "Great study partner"
    assert "id" in created


def test_create_rating_updates_existing_row(patch_supabase):
    payload1 = {
        "room_id": "room-1",
        "rater_id": "user-1",
        "ratee_id": "user-2",
        "rating": 4,
        "feedback": "Good",
    }
    first = PeerRatingModel.create_or_update_rating(payload1)

    payload2 = {
        "room_id": "room-1",
        "rater_id": "user-1",
        "ratee_id": "user-2",
        "rating": 5,
        "feedback": "Updated to excellent",
    }
    second = PeerRatingModel.create_or_update_rating(payload2)

    assert second["id"] == first["id"]
    assert second["rating"] == 5
    assert second["feedback"] == "Updated to excellent"


def test_get_ratings_for_user(patch_supabase):
    PeerRatingModel.create_or_update_rating({
        "room_id": "room-1",
        "rater_id": "user-1",
        "ratee_id": "target-user",
        "rating": 5,
        "feedback": "Superb",
    })
    PeerRatingModel.create_or_update_rating({
        "room_id": "room-2",
        "rater_id": "user-3",
        "ratee_id": "other-user",
        "rating": 3,
        "feedback": "Okay",
    })

    ratings = PeerRatingModel.get_ratings_for_user("target-user")
    assert len(ratings) == 1
    assert ratings[0]["ratee_id"] == "target-user"
    assert ratings[0]["rating"] == 5


def test_get_ratings_by_room(patch_supabase):
    PeerRatingModel.create_or_update_rating({
        "room_id": "room-abc",
        "rater_id": "user-1",
        "ratee_id": "user-2",
        "rating": 4,
    })
    PeerRatingModel.create_or_update_rating({
        "room_id": "room-xyz",
        "rater_id": "user-1",
        "ratee_id": "user-3",
        "rating": 5,
    })

    ratings = PeerRatingModel.get_ratings_by_room("room-abc")
    assert len(ratings) == 1
    assert ratings[0]["room_id"] == "room-abc"


def test_get_rating_single(patch_supabase):
    PeerRatingModel.create_or_update_rating({
        "room_id": "room-1",
        "rater_id": "user-1",
        "ratee_id": "user-2",
        "rating": 5,
    })

    found = PeerRatingModel.get_rating("room-1", "user-1", "user-2")
    assert found is not None
    assert found["rating"] == 5

    missing = PeerRatingModel.get_rating("room-1", "user-1", "user-999")
    assert missing is None
