import pytest
from models import screenshare_model


@pytest.fixture(autouse=True)
def patch_supabase(monkeypatch, fake_supabase):
    monkeypatch.setattr(screenshare_model, "supabase", fake_supabase)
    return fake_supabase


def test_create_session_inserts_with_null_ended_at(patch_supabase):
    session = screenshare_model.create_session("room-1", "p1", "room-room-1")

    assert session["room_id"] == "room-1"
    assert session["participant_id"] == "p1"
    assert session["livekit_room_name"] == "room-room-1"
    assert session["ended_at"] is None
    assert "id" in session


def test_create_session_allows_null_participant(patch_supabase):
    session = screenshare_model.create_session("room-1", None, "room-room-1")
    assert session["participant_id"] is None


def test_end_session_sets_ended_at(patch_supabase):
    session = screenshare_model.create_session("room-1", "p1", "room-room-1")
    ended = screenshare_model.end_session(session["id"])

    assert ended["ended_at"] is not None


def test_end_session_returns_none_for_missing_id(patch_supabase):
    result = screenshare_model.end_session("nonexistent")
    assert result is None


def test_get_active_sessions_excludes_ended(patch_supabase):
    s1 = screenshare_model.create_session("room-1", "p1", "room-room-1")
    s2 = screenshare_model.create_session("room-1", "p2", "room-room-1")
    screenshare_model.end_session(s1["id"])

    active = screenshare_model.get_active_sessions("room-1")

    assert len(active) == 1
    assert active[0]["id"] == s2["id"]


def test_get_active_sessions_filters_by_room(patch_supabase):
    screenshare_model.create_session("room-1", "p1", "room-room-1")
    screenshare_model.create_session("room-2", "p2", "room-room-2")

    active = screenshare_model.get_active_sessions("room-1")

    assert len(active) == 1
    assert active[0]["room_id"] == "room-1"


def test_get_session_by_id_returns_none_when_missing(patch_supabase):
    assert screenshare_model.get_session_by_id("nonexistent") is None


def test_get_session_by_id_returns_row(patch_supabase):
    session = screenshare_model.create_session("room-1", "p1", "room-room-1")
    fetched = screenshare_model.get_session_by_id(session["id"])
    assert fetched["id"] == session["id"]


def test_get_active_sessions_for_participant_filters_correctly(patch_supabase):
    s1 = screenshare_model.create_session("room-1", "p1", "room-room-1")
    screenshare_model.create_session("room-1", "p2", "room-room-1")

    active = screenshare_model.get_active_sessions_for_participant("room-1", "p1")

    assert len(active) == 1
    assert active[0]["id"] == s1["id"]


def test_get_active_sessions_for_participant_excludes_ended(patch_supabase):
    s1 = screenshare_model.create_session("room-1", "p1", "room-room-1")
    screenshare_model.end_session(s1["id"])

    active = screenshare_model.get_active_sessions_for_participant("room-1", "p1")
    assert active == []