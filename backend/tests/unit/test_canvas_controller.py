import pytest
from controllers import canvas_controller


class FakeCanvasModel:
    def __init__(self):
        self.saved = []
        self.deleted = []
        self.snapshot = []

    def get_records_by_room(self, room_id):
        return [{"room_id": room_id, "record_id": r["id"], "record": r} for r in self.snapshot]

    def upsert_record(self, room_id, record_id, record):
        self.saved.append((room_id, record_id, record))

    def delete_records(self, room_id, record_ids):
        self.deleted.append((room_id, record_ids))


@pytest.fixture
def fake_model(monkeypatch):
    fake = FakeCanvasModel()
    monkeypatch.setattr(canvas_controller, "canvas_model", fake)
    return fake


def test_get_canvas_snapshot_returns_raw_records(fake_model):
    fake_model.snapshot = [{"id": "a"}, {"id": "b"}]

    result = canvas_controller.get_canvas_snapshot("room-1")

    assert result == [{"id": "a"}, {"id": "b"}]


def test_save_records_calls_upsert_for_each_record_with_id(fake_model):
    records = [{"id": "rec-1", "x": 1}, {"id": "rec-2", "x": 2}]

    canvas_controller.save_records("room-1", records)

    assert len(fake_model.saved) == 2
    assert fake_model.saved[0] == ("room-1", "rec-1", records[0])


def test_save_records_skips_records_without_id(fake_model):
    records = [{"x": 1}, {"id": "rec-2", "x": 2}]

    canvas_controller.save_records("room-1", records)

    assert len(fake_model.saved) == 1
    assert fake_model.saved[0][1] == "rec-2"


def test_remove_records_calls_delete_when_ids_given(fake_model):
    canvas_controller.remove_records("room-1", ["rec-1", "rec-2"])
    assert fake_model.deleted == [("room-1", ["rec-1", "rec-2"])]


def test_remove_records_does_nothing_when_empty(fake_model):
    canvas_controller.remove_records("room-1", [])
    assert fake_model.deleted == []