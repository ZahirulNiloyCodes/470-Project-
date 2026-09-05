import pytest
from fastapi import HTTPException
from controllers.room_controller import RoomController
from schemas.room_schema import RoomCreateRequest
from models.room_model import RoomModel


class FakeRoomModel:
    def __init__(self):
        self.rooms = []
        self._counter = 0

    def create_room(self, payload):
        self._counter += 1
        room = {
            "id": f"00000000-0000-0000-0000-{self._counter:012d}",
            "title": payload["title"],
            "description": payload.get("description"),
            "is_private": payload.get("is_private", False),
            "access_code": payload.get("access_code"),
            "tags": payload.get("tags", []),
            "host_id": payload["host_id"],
            "max_participants": payload.get("max_participants", 10),
            "created_at": "2024-01-01T00:00:00Z",
        }
        self.rooms.append(room)
        return room

    def get_public_rooms(self, tag=None):
        public = [r for r in self.rooms if not r.get("is_private")]
        if tag:
            return [r for r in public if tag in r.get("tags", [])]
        return public


@pytest.fixture
def fake_room_model(monkeypatch):
    fake = FakeRoomModel()
    monkeypatch.setattr(RoomModel, "create_room", fake.create_room)
    monkeypatch.setattr(RoomModel, "get_public_rooms", fake.get_public_rooms)
    return fake


def test_create_public_room_success(fake_room_model):
    req = RoomCreateRequest(
        title="Operating Systems Review",
        description="Discussing deadlock and scheduling",
        is_private=False,
        tags=["OS", "ComputerScience"],
        max_participants=8,
    )
    room = RoomController.create_room(req, host_id="11111111-1111-4111-a111-111111111111")
    assert room.title == "Operating Systems Review"
    assert room.is_private is False
    assert "OS" in room.tags
    assert room.max_participants == 8


def test_create_private_room_without_access_code_fails(fake_room_model):
    req = RoomCreateRequest(
        title="Secret Study Group",
        is_private=True,
        access_code=None,
    )
    with pytest.raises(HTTPException) as exc:
        RoomController.create_room(req, host_id="11111111-1111-4111-a111-111111111111")
    assert exc.value.status_code == 400
    assert "Private rooms require an access code" in exc.value.detail


def test_create_private_room_with_access_code_success(fake_room_model):
    req = RoomCreateRequest(
        title="Secret Algorithms Group",
        is_private=True,
        access_code="pass123",
        tags=["Algorithms"],
    )
    room = RoomController.create_room(req, host_id="11111111-1111-4111-a111-111111111111")
    assert room.title == "Secret Algorithms Group"
    assert room.is_private is True
    assert room.access_code == "pass123"


def test_list_public_rooms_with_tag_filter(fake_room_model):
    fake_room_model.rooms = [
        {
            "id": "00000000-0000-0000-0000-000000000001",
            "title": "OS Room",
            "is_private": False,
            "tags": ["OS"],
            "host_id": "11111111-1111-4111-a111-111111111111",
            "max_participants": 10,
            "created_at": "2024-01-01T00:00:00Z",
        },
        {
            "id": "00000000-0000-0000-0000-000000000002",
            "title": "Math Room",
            "is_private": False,
            "tags": ["Math"],
            "host_id": "11111111-1111-4111-a111-111111111111",
            "max_participants": 10,
            "created_at": "2024-01-01T00:00:00Z",
        },
    ]

    all_rooms = RoomController.list_rooms()
    assert len(all_rooms) == 2

    os_rooms = RoomController.list_rooms(tag="OS")
    assert len(os_rooms) == 1
    assert os_rooms[0].title == "OS Room"
