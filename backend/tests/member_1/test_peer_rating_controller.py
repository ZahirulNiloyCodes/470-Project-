import pytest
from fastapi import HTTPException
from controllers.peer_rating_controller import PeerRatingController
from schemas.peer_rating_schema import PeerRatingCreate, PeerRatingBatchCreate, PeerRatingItem


class FakePeerRatingModel:
    def __init__(self):
        self.ratings = []
        self._id_counter = 0

    def create_or_update_rating(self, payload):
        for r in self.ratings:
            if (
                r["room_id"] == payload["room_id"]
                and r["rater_id"] == payload["rater_id"]
                and r["ratee_id"] == payload["ratee_id"]
            ):
                r["rating"] = payload["rating"]
                r["feedback"] = payload.get("feedback")
                return r

        self._id_counter += 1
        new_rating = {
            "id": f"rating-{self._id_counter}",
            "room_id": payload["room_id"],
            "rater_id": payload["rater_id"],
            "ratee_id": payload["ratee_id"],
            "rating": payload["rating"],
            "feedback": payload.get("feedback"),
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
        }
        self.ratings.append(new_rating)
        return new_rating

    def get_ratings_for_user(self, user_id):
        return [r for r in self.ratings if r["ratee_id"] == user_id]

    def get_ratings_by_room(self, room_id):
        return [r for r in self.ratings if r["room_id"] == room_id]

    def get_ratings_by_rater_in_room(self, room_id, rater_id):
        return [r for r in self.ratings if r["room_id"] == room_id and r["rater_id"] == rater_id]

    def get_rating(self, room_id, rater_id, ratee_id):
        for r in self.ratings:
            if r["room_id"] == room_id and r["rater_id"] == rater_id and r["ratee_id"] == ratee_id:
                return r
        return None


@pytest.fixture
def fake_model(monkeypatch):
    fake = FakePeerRatingModel()
    monkeypatch.setattr(PeerRatingController, "model", fake)
    return fake


def test_submit_rating_success(fake_model):
    req = PeerRatingCreate(
        room_id="room-1",
        ratee_id="user-2",
        rating=5,
        feedback="Very helpful during the study session!",
    )
    result = PeerRatingController.submit_rating(req, rater_id="user-1")
    assert result.ratee_id == "user-2"
    assert result.rater_id == "user-1"
    assert result.rating == 5
    assert result.feedback == "Very helpful during the study session!"


def test_submit_rating_cannot_rate_self(fake_model):
    req = PeerRatingCreate(
        room_id="room-1",
        ratee_id="user-1",
        rating=5,
        feedback="I helped myself",
    )
    with pytest.raises(HTTPException) as exc_info:
        PeerRatingController.submit_rating(req, rater_id="user-1")
    assert exc_info.value.status_code == 400
    assert "cannot rate their own" in exc_info.value.detail


def test_submit_rating_unauthenticated(fake_model):
    req = PeerRatingCreate(
        room_id="room-1",
        ratee_id="user-2",
        rating=4,
    )
    with pytest.raises(HTTPException) as exc_info:
        PeerRatingController.submit_rating(req, rater_id="")
    assert exc_info.value.status_code == 401


def test_submit_rating_strips_whitespace_feedback(fake_model):
    req = PeerRatingCreate(
        room_id="room-1",
        ratee_id="user-2",
        rating=4,
        feedback="   ",
    )
    result = PeerRatingController.submit_rating(req, rater_id="user-1")
    assert result.feedback is None


def test_submit_rating_updates_existing(fake_model):
    req1 = PeerRatingCreate(
        room_id="room-1",
        ratee_id="user-2",
        rating=3,
        feedback="Good",
    )
    PeerRatingController.submit_rating(req1, rater_id="user-1")

    req2 = PeerRatingCreate(
        room_id="room-1",
        ratee_id="user-2",
        rating=5,
        feedback="Updated: Excellent!",
    )
    result2 = PeerRatingController.submit_rating(req2, rater_id="user-1")
    assert result2.rating == 5
    assert result2.feedback == "Updated: Excellent!"
    assert len(fake_model.ratings) == 1


def test_batch_ratings_success(fake_model):
    req = PeerRatingBatchCreate(
        room_id="room-1",
        ratings=[
            PeerRatingItem(ratee_id="user-2", rating=5, feedback="Great explanations"),
            PeerRatingItem(ratee_id="user-3", rating=4, feedback="Nice notes"),
        ],
    )
    results = PeerRatingController.submit_batch_ratings(req, rater_id="user-1")
    assert len(results) == 2
    assert results[0].ratee_id == "user-2"
    assert results[0].rating == 5
    assert results[1].ratee_id == "user-3"
    assert results[1].rating == 4


def test_batch_ratings_disallows_self_rating(fake_model):
    req = PeerRatingBatchCreate(
        room_id="room-1",
        ratings=[
            PeerRatingItem(ratee_id="user-2", rating=5),
            PeerRatingItem(ratee_id="user-1", rating=5),
        ],
    )
    with pytest.raises(HTTPException) as exc_info:
        PeerRatingController.submit_batch_ratings(req, rater_id="user-1")
    assert exc_info.value.status_code == 400
    assert "Cannot rate oneself" in exc_info.value.detail


def test_get_user_summary_empty(fake_model):
    summary = PeerRatingController.get_user_summary("nonexistent-user")
    assert summary.total_ratings == 0
    assert summary.average_rating == 0.0
    assert summary.rating_distribution == {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    assert summary.recent_feedback == []


def test_get_user_summary_with_ratings(fake_model):
    fake_model.ratings.extend([
        {"id": "r1", "room_id": "rm1", "rater_id": "u1", "ratee_id": "target", "rating": 5, "feedback": "Super!"},
        {"id": "r2", "room_id": "rm2", "rater_id": "u2", "ratee_id": "target", "rating": 4, "feedback": "Helpful"},
        {"id": "r3", "room_id": "rm3", "rater_id": "u3", "ratee_id": "target", "rating": 5, "feedback": None},
    ])
    summary = PeerRatingController.get_user_summary("target")
    assert summary.total_ratings == 3
    # (5 + 4 + 5) / 3 = 14 / 3 = 4.67
    assert summary.average_rating == 4.67
    assert summary.rating_distribution[5] == 2
    assert summary.rating_distribution[4] == 1
    assert "Super!" in summary.recent_feedback
    assert "Helpful" in summary.recent_feedback


def test_get_eligible_session_peers_excludes_self(fake_model):
    my_user_id = "11111111-1111-4111-a111-111111111111"
    peers = PeerRatingController.get_eligible_session_peers("room-test-1", current_user_id=my_user_id)
    # Ensure current user is not in the eligible peers list
    assert all(p.user_id != my_user_id for p in peers)
    assert len(peers) > 0
    # Initially none rated
    assert all(not p.has_rated for p in peers)

    # Now rate Sarah (22222222-2222-4222-a222-222222222222)
    sarah_id = "22222222-2222-4222-a222-222222222222"
    fake_model.ratings.append({
        "id": "r1",
        "room_id": "room-test-1",
        "rater_id": my_user_id,
        "ratee_id": sarah_id,
        "rating": 5,
        "feedback": "Outstanding partner",
    })

    updated_peers = PeerRatingController.get_eligible_session_peers("room-test-1", current_user_id=my_user_id)
    sarah = next(p for p in updated_peers if p.user_id == sarah_id)
    assert sarah.has_rated is True
    assert sarah.current_rating == 5
    assert sarah.current_feedback == "Outstanding partner"
