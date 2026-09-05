import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException
from controllers import screenshare_controller


class FakeScreenshareModel:
    def __init__(self):
        self.sessions = {}
        self._counter = 0

    def create_session(self, room_id, participant_id, livekit_room_name):
        self._counter += 1
        sid = f"s-{self._counter}"
        session = {
            "id": sid,
            "room_id": room_id,
            "participant_id": participant_id,
            "livekit_room_name": livekit_room_name,
            "ended_at": None,
        }
        self.sessions[sid] = session
        return session

    def get_active_sessions(self, room_id):
        return [s for s in self.sessions.values() if s["room_id"] == room_id and s["ended_at"] is None]

    def get_active_sessions_for_participant(self, room_id, participant_id):
        return [
            s for s in self.sessions.values()
            if s["room_id"] == room_id and s["participant_id"] == participant_id and s["ended_at"] is None
        ]

    def get_session_by_id(self, session_id):
        return self.sessions.get(session_id)

    def end_session(self, session_id):
        s = self.sessions[session_id]
        s["ended_at"] = "2024-01-01T00:05:00Z"
        return s


@pytest.fixture
def fake_model(monkeypatch):
    fake = FakeScreenshareModel()
    monkeypatch.setattr(screenshare_controller, "screenshare_model", fake)
    return fake


# ---------- start_screen_share ----------

def test_start_screen_share_creates_session(fake_model):
    session = screenshare_controller.start_screen_share("room-1", "p1")
    assert session["room_id"] == "room-1"
    assert session["participant_id"] == "p1"
    assert session["livekit_room_name"] == "room-room-1"


def test_start_screen_share_rejects_duplicate_active_session(fake_model):
    screenshare_controller.start_screen_share("room-1", "p1")

    with pytest.raises(HTTPException) as exc_info:
        screenshare_controller.start_screen_share("room-1", "p1")
    assert exc_info.value.status_code == 400
    assert "already sharing" in exc_info.value.detail


def test_start_screen_share_allows_different_participants_simultaneously(fake_model):
    s1 = screenshare_controller.start_screen_share("room-1", "p1")
    s2 = screenshare_controller.start_screen_share("room-1", "p2")
    assert s1["id"] != s2["id"]


def test_start_screen_share_allows_new_session_after_previous_ended(fake_model):
    first = screenshare_controller.start_screen_share("room-1", "p1")
    fake_model.end_session(first["id"])

    second = screenshare_controller.start_screen_share("room-1", "p1")
    assert second["id"] != first["id"]


# ---------- stop_screen_share ----------

def test_stop_screen_share_success(fake_model):
    session = screenshare_controller.start_screen_share("room-1", "p1")
    stopped = screenshare_controller.stop_screen_share(session["id"], "p1")
    assert stopped["ended_at"] is not None


def test_stop_screen_share_not_found(fake_model):
    with pytest.raises(HTTPException) as exc_info:
        screenshare_controller.stop_screen_share("nonexistent", "p1")
    assert exc_info.value.status_code == 404


def test_stop_screen_share_forbidden_for_other_participant(fake_model):
    session = screenshare_controller.start_screen_share("room-1", "p1")
    with pytest.raises(HTTPException) as exc_info:
        screenshare_controller.stop_screen_share(session["id"], "p2")
    assert exc_info.value.status_code == 403


def test_stop_screen_share_rejects_already_ended_session(fake_model):
    session = screenshare_controller.start_screen_share("room-1", "p1")
    screenshare_controller.stop_screen_share(session["id"], "p1")

    with pytest.raises(HTTPException) as exc_info:
        screenshare_controller.stop_screen_share(session["id"], "p1")
    assert exc_info.value.status_code == 400
    assert "already ended" in exc_info.value.detail


# ---------- list_active_sessions ----------

def test_list_active_sessions_returns_only_active(fake_model):
    s1 = screenshare_controller.start_screen_share("room-1", "p1")
    screenshare_controller.start_screen_share("room-1", "p2")
    screenshare_controller.stop_screen_share(s1["id"], "p1")

    active = screenshare_controller.list_active_sessions("room-1")
    assert len(active) == 1
    assert active[0]["participant_id"] == "p2"


# ---------- end_all_sessions_for_participant (disconnect handling) ----------

def test_end_all_sessions_for_participant_ends_active_session(fake_model):
    session = screenshare_controller.start_screen_share("room-1", "p1")

    ended = screenshare_controller.end_all_sessions_for_participant("room-1", "p1")

    assert len(ended) == 1
    assert ended[0]["id"] == session["id"]
    assert ended[0]["ended_at"] is not None


def test_end_all_sessions_for_participant_returns_empty_when_no_active_session(fake_model):
    ended = screenshare_controller.end_all_sessions_for_participant("room-1", "p1")
    assert ended == []


def test_end_all_sessions_for_participant_returns_empty_when_participant_id_none(fake_model):
    screenshare_controller.start_screen_share("room-1", "p1")
    ended = screenshare_controller.end_all_sessions_for_participant("room-1", None)
    assert ended == []


def test_end_all_sessions_does_not_affect_other_participants(fake_model):
    screenshare_controller.start_screen_share("room-1", "p1")
    session_p2 = screenshare_controller.start_screen_share("room-1", "p2")

    screenshare_controller.end_all_sessions_for_participant("room-1", "p1")

    still_active = screenshare_controller.list_active_sessions("room-1")
    assert len(still_active) == 1
    assert still_active[0]["id"] == session_p2["id"]


# ---------- generate_livekit_token ----------

def test_generate_livekit_token_returns_expected_shape(monkeypatch):
    fake_jwt = "fake.jwt.token"

    class FakeAccessToken:
        def __init__(self, *_args, **_kwargs):
            pass

        def with_identity(self, *_args, **_kwargs):
            return self

        def with_name(self, *_args, **_kwargs):
            return self

        def with_grants(self, *_args, **_kwargs):
            return self

        def to_jwt(self):
            return fake_jwt

    fake_lk_api = MagicMock()
    fake_lk_api.AccessToken = FakeAccessToken
    fake_lk_api.VideoGrants = MagicMock()

    monkeypatch.setattr(screenshare_controller, "lk_api", fake_lk_api)
    monkeypatch.setattr(screenshare_controller, "LIVEKIT_API_KEY", "key")
    monkeypatch.setattr(screenshare_controller, "LIVEKIT_API_SECRET", "secret")
    monkeypatch.setattr(screenshare_controller, "LIVEKIT_URL", "wss://fake.livekit.cloud")

    result = screenshare_controller.generate_livekit_token("room-1", "p1", "Alice")

    assert result["token"] == fake_jwt
    assert result["livekit_url"] == "wss://fake.livekit.cloud"
    assert result["room_name"] == "room-room-1"