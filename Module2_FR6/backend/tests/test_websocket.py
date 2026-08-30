from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)

def test_websocket_connection():
    room_id = "55a31f3d-ee98-4d55-a464-bff39a7229e4"

    with client.websocket_connect(
        f"/ws/chat/{room_id}"
    ) as websocket:

        assert websocket is not None

#---------------Message send WebSocket test-------------------
def test_websocket_send_message():
    room_id = "55a31f3d-ee98-4d55-a464-bff39a7229e4"

    with client.websocket_connect(
        f"/ws/chat/{room_id}"
    ) as websocket:

        websocket.send_json({
            "type": "message",
            "room_id": room_id,
            "user_id": "55a31f3d-ee98-4d55-a464-bff39a7229e4",
            "username": "Test User",
            "content": "Hello from test",
        })

        response = websocket.receive_json()

        assert response["type"] == "message"
        assert response["data"]["content"] == "Hello from test"

#---------------Edit test-------------------
def test_websocket_edit_message():
    room_id = "55a31f3d-ee98-4d55-a464-bff39a7229e4"

    with client.websocket_connect(
        f"/ws/chat/{room_id}"
    ) as websocket:

        websocket.send_json({
            "type": "message",
            "room_id": room_id,
            "user_id": "40efdb95-4543-43d0-b736-8dc1fe9dd4f9",
            "username": "Test User",
            "content": "Original message",
        })

        created = websocket.receive_json()

        message_id = created["data"]["id"]

        websocket.send_json({
            "type": "edit",
            "message_id": message_id,
            "room_id": room_id,
            "user_id": "40efdb95-4543-43d0-b736-8dc1fe9dd4f9",
            "username": "Test User",
            "content": "Edited message",
        })

        response = websocket.receive_json()

        assert response["type"] == "edit"
        assert response["data"]["content"] == "Edited message"
        assert response["data"]["is_edited"] is True

#---------------Delete test-------------------
def test_websocket_delete_message():
    room_id = "55a31f3d-ee98-4d55-a464-bff39a7229e4"

    with client.websocket_connect(
        f"/ws/chat/{room_id}"
    ) as websocket:

        websocket.send_json({
            "type": "message",
            "room_id": room_id,
            "user_id": "40efdb95-4543-43d0-b736-8dc1fe9dd4f9",
            "username": "Test User",
            "content": "Message to delete",
        })

        created = websocket.receive_json()

        message_id = created["data"]["id"]

        websocket.send_json({
            "type": "delete",
            "message_id": message_id,
            "room_id": room_id,
            "user_id": "40efdb95-4543-43d0-b736-8dc1fe9dd4f9",
            "username": "Test User",
        })

        response = websocket.receive_json()

        assert response["type"] == "delete"
        assert response["data"]["is_deleted"] is True