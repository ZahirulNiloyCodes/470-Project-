import pytest
from models import canvas_model


@pytest.fixture(autouse=True)
def patch_supabase(monkeypatch, fake_supabase):
    monkeypatch.setattr(canvas_model, "supabase", fake_supabase)
    return fake_supabase


def test_upsert_record_inserts_new_record(patch_supabase):
    canvas_model.upsert_record("room-1", "rec-1", {"id": "rec-1", "type": "shape"})

    rows = patch_supabase._data_store["canvas_records"]
    assert len(rows) == 1
    assert rows[0]["room_id"] == "room-1"
    assert rows[0]["record_id"] == "rec-1"


def test_upsert_record_updates_existing_record(patch_supabase):
    canvas_model.upsert_record("room-1", "rec-1", {"id": "rec-1", "x": 1})
    canvas_model.upsert_record("room-1", "rec-1", {"id": "rec-1", "x": 2})

    rows = patch_supabase._data_store["canvas_records"]
    assert len(rows) == 1
    assert rows[0]["record"]["x"] == 2


def test_get_records_by_room_filters_correctly(patch_supabase):
    canvas_model.upsert_record("room-1", "rec-1", {"id": "rec-1"})
    canvas_model.upsert_record("room-2", "rec-2", {"id": "rec-2"})

    result = canvas_model.get_records_by_room("room-1")

    assert len(result) == 1
    assert result[0]["record_id"] == "rec-1"


def test_get_records_by_room_returns_empty_list_when_none(patch_supabase):
    result = canvas_model.get_records_by_room("nonexistent-room")
    assert result == []


def test_delete_records_removes_only_matching_ids(patch_supabase):
    canvas_model.upsert_record("room-1", "rec-1", {"id": "rec-1"})
    canvas_model.upsert_record("room-1", "rec-2", {"id": "rec-2"})
    canvas_model.upsert_record("room-1", "rec-3", {"id": "rec-3"})

    canvas_model.delete_records("room-1", ["rec-1", "rec-3"])

    remaining = canvas_model.get_records_by_room("room-1")
    assert len(remaining) == 1
    assert remaining[0]["record_id"] == "rec-2"