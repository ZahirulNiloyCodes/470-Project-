import pytest
from models.room_model import RoomModel
from models import room_model as room_model_module


@pytest.fixture(autouse=True)
def patch_supabase(monkeypatch, fake_supabase):
    monkeypatch.setattr(room_model_module, "supabase", fake_supabase)
    return fake_supabase


def test_create_room_model_inserts_row(patch_supabase):
    payload = {
        "title": "Machine Learning Lab",
        "description": "Lab session for CS470",
        "is_private": False,
        "access_code": None,
        "tags": ["AI", "ML"],
        "host_id": "11111111-1111-4111-a111-111111111111",
        "max_participants": 12,
    }
    created = RoomModel.create_room(payload)
    assert created["title"] == "Machine Learning Lab"
    assert created["is_private"] is False
    assert "id" in created


def test_get_public_rooms_filters_out_private(patch_supabase):
    RoomModel.create_room({
        "title": "Public Room 1",
        "is_private": False,
        "tags": ["General"],
        "host_id": "11111111-1111-4111-a111-111111111111",
    })
    RoomModel.create_room({
        "title": "Private Room 2",
        "is_private": True,
        "access_code": "secret",
        "tags": ["Private"],
        "host_id": "11111111-1111-4111-a111-111111111111",
    })

    public_rooms = RoomModel.get_public_rooms()
    assert len(public_rooms) == 1
    assert public_rooms[0]["title"] == "Public Room 1"
