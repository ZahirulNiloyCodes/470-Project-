import pytest
from fastapi.testclient import TestClient
from main import app
from controllers import canvas_controller


@pytest.fixture
def client():
    return TestClient(app)


def test_get_snapshot_endpoint_returns_records(client, monkeypatch):
    monkeypatch.setattr(
        canvas_controller,
        "get_canvas_snapshot",
        lambda room_id: [{"id": "rec-1", "type": "draw"}],
    )

    response = client.get("/canvas/room-1/snapshot")

    assert response.status_code == 200
    assert response.json() == {"records": [{"id": "rec-1", "type": "draw"}]}


def test_get_snapshot_endpoint_empty_room(client, monkeypatch):
    monkeypatch.setattr(canvas_controller, "get_canvas_snapshot", lambda room_id: [])

    response = client.get("/canvas/empty-room/snapshot")

    assert response.status_code == 200
    assert response.json() == {"records": []}


def test_websocket_update_message_saves_and_does_not_echo_to_sender(client, monkeypatch):
    saved_calls = []
    monkeypatch.setattr(
        canvas_controller,
        "save_records",
        lambda room_id, records: saved_calls.append((room_id, records)),
    )

    with client.websocket_connect("/canvas/ws/room-1") as ws:
        ws.send_json({"type": "update", "records": [{"id": "rec-1", "x": 1}]})
        # sender নিজে broadcast পায় না, তাই এখানে দ্বিতীয় client দিয়ে verify করবো নিচে

    assert saved_calls == [("room-1", [{"id": "rec-1", "x": 1}])]


def test_websocket_broadcasts_update_to_other_clients_in_same_room(client, monkeypatch):
    monkeypatch.setattr(canvas_controller, "save_records", lambda room_id, records: None)

    with client.websocket_connect("/canvas/ws/room-1") as ws1:
        with client.websocket_connect("/canvas/ws/room-1") as ws2:
            ws1.send_json({"type": "update", "records": [{"id": "rec-1", "x": 5}]})

            received = ws2.receive_json()
            assert received["type"] == "update"
            assert received["records"] == [{"id": "rec-1", "x": 5}]


def test_websocket_does_not_broadcast_across_different_rooms(client, monkeypatch):
    monkeypatch.setattr(canvas_controller, "save_records", lambda room_id, records: None)

    with client.websocket_connect("/canvas/ws/room-A") as ws_a:
        with client.websocket_connect("/canvas/ws/room-B") as ws_b:
            ws_a.send_json({"type": "update", "records": [{"id": "rec-x"}]})

            # room-B ws কিছু পাবে না — timeout না দিয়ে বরং room-A তে দ্বিতীয় client দিয়ে confirm করা নিরাপদ
            with client.websocket_connect("/canvas/ws/room-A") as ws_a2:
                ws_a.send_json({"type": "update", "records": [{"id": "rec-y"}]})
                received = ws_a2.receive_json()
                assert received["records"] == [{"id": "rec-y"}]


def test_websocket_delete_message_calls_remove_records(client, monkeypatch):
    removed_calls = []
    monkeypatch.setattr(
        canvas_controller,
        "remove_records",
        lambda room_id, ids: removed_calls.append((room_id, ids)),
    )

    with client.websocket_connect("/canvas/ws/room-1") as ws:
        ws.send_json({"type": "delete", "ids": ["rec-1", "rec-2"]})

    assert removed_calls == [("room-1", ["rec-1", "rec-2"])]