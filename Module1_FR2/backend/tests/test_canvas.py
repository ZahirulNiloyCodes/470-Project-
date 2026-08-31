# test_canvas.py = endpoint test + Unit test + Integration-ish test

import pytest
from fastapi.testclient import TestClient
from main import app
from websocket_manager import manager
from uuid import uuid4

TEST_ROOM_ID = str(uuid4())
TEST_ROOM_2_ID = str(uuid4())

# =========================================================
# RESET MANAGER BEFORE EACH TEST
# =========================================================

@pytest.fixture(autouse=True)
def reset_manager():
    """
    Reset in-memory room and canvas state
    before every test.
    """

    manager.rooms.clear()
    manager.canvas_states.clear()

    yield

    manager.rooms.clear()
    manager.canvas_states.clear()


# =========================================================
# TEST 1
# Root endpoint should work
# =========================================================

def test_root_endpoint():

    client = TestClient(app)

    response = client.get("/")

    assert response.status_code == 200

    assert response.json() == {
        "message":
        "Collaborative Canvas Backend is running"
    }


# =========================================================
# TEST 2
# Debug endpoint for empty room
# =========================================================

def test_debug_empty_room():

    client = TestClient(app)

    response = client.get(
        f"/debug/room/{TEST_ROOM_ID}"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["room_id"] == TEST_ROOM_ID

    assert data["connections"] == 0

    assert data["canvas_records_in_memory"] == 0
    assert data["canvas_records_in_database"] == 0


# =========================================================
# TEST 3
# Canvas state can be saved (unit test)
# =========================================================

def test_canvas_state_update():

    record = {
        "id": "shape:123",
        "typeName": "shape",
        "type": "geo",
        "x": 100,
        "y": 100,
        "props": {
            "w": 100,
            "h": 100,
            "geo": "rectangle",
            "color": "black",
            "fill": "none",
            "dash": "draw",
            "size": "m",
            "font": "draw",
            "text": "",
            "align": "middle",
            "verticalAlign": "middle",
            "labelColor": "black",
            "growY": 0,
            "url": "",
            "scale": 1
        },
        "parentId": "page:page",
        "index": "a1",
        "rotation": 0,
        "isLocked": False,
        "opacity": 1,
        "meta": {}
    }


    message = {
        "type": "canvas_changes",

        "changes": {
            "added": {
                "shape:123": record
            },

            "updated": {},

            "removed": {}
        }
    }


    manager.update_canvas_state(
        "test-room",
        message
    )


    assert "test-room" in manager.canvas_states

    assert "shape:123" in (
        manager.canvas_states["test-room"]
    )


    assert (
        manager.canvas_states["test-room"]
        ["shape:123"]
        == record
    )


# =========================================================
# TEST 4
# Updated canvas record should replace old record (unit test)
# =========================================================

def test_canvas_record_update():

    old_record = {
        "id": "shape:123",
        "typeName": "shape",
        "x": 100,
        "y": 100
    }


    new_record = {
        "id": "shape:123",
        "typeName": "shape",
        "x": 250,
        "y": 250
    }


    # Add original record

    manager.canvas_states[
        "test-room"
    ] = {

        "shape:123":
        old_record
    }


    message = {
        "type": "canvas_changes",

        "changes": {

            "added": {},

            "updated": {

                "shape:123": [
                    old_record,
                    new_record
                ]

            },

            "removed": {}
        }
    }


    manager.update_canvas_state(
        "test-room",
        message
    )


    assert (
        manager.canvas_states[
            "test-room"
        ]["shape:123"]
        == new_record
    )


# =========================================================
# TEST 5
# Deleted record should be removed (unit test)
# =========================================================

def test_canvas_record_delete():

    record = {
        "id": "shape:delete-me",
        "typeName": "shape",
        "x": 100,
        "y": 100
    }


    manager.canvas_states[
        "test-room"
    ] = {

        "shape:delete-me":
        record
    }


    message = {
        "type": "canvas_changes",

        "changes": {

            "added": {},

            "updated": {},

            "removed": {

                "shape:delete-me":
                record
            }
        }
    }


    manager.update_canvas_state(
        "test-room",
        message
    )


    assert (
        "shape:delete-me"
        not in manager.canvas_states[
            "test-room"
        ]
    )


# =========================================================
# TEST 6
# Different rooms must have separate canvas states (unit test)
# =========================================================

def test_room_isolation():

    room_1_record = {
        "id": "shape:room1",
        "typeName": "shape"
    }


    room_2_record = {
        "id": "shape:room2",
        "typeName": "shape"
    }


    room_1_message = {

        "type":
        "canvas_changes",

        "changes": {

            "added": {

                "shape:room1":
                room_1_record

            },

            "updated": {},

            "removed": {}
        }
    }


    room_2_message = {

        "type":
        "canvas_changes",

        "changes": {

            "added": {

                "shape:room2":
                room_2_record

            },

            "updated": {},

            "removed": {}
        }
    }


    manager.update_canvas_state(
        "test-room",
        room_1_message
    )


    manager.update_canvas_state(
        "room-2",
        room_2_message
    )


    # Room 1 has only room 1 record

    assert (
        "shape:room1"
        in manager.canvas_states[
            "test-room"
        ]
    )


    assert (
        "shape:room2"
        not in manager.canvas_states[
            "test-room"
        ]
    )


    # Room 2 has only room 2 record

    assert (
        "shape:room2"
        in manager.canvas_states[
            "room-2"
        ]
    )


    assert (
        "shape:room1"
        not in manager.canvas_states[
            "room-2"
        ]
    )


# =========================================================
# TEST 7
# Debug endpoint should show canvas record count (integration-ish test)
# =========================================================

def test_debug_canvas_record_count():

    manager.canvas_states[
        TEST_ROOM_ID
    ] = {

        "shape:1": {
            "id": "shape:1"
        },

        "shape:2": {
            "id": "shape:2"
        },

        "shape:3": {
            "id": "shape:3"
        }
    }


    client = TestClient(app)


    response = client.get(
        f"/debug/room/{TEST_ROOM_ID}"
    )


    assert response.status_code == 200


    data = response.json()


    assert data["room_id"] == TEST_ROOM_ID

    assert data["connections"] == 0

    assert data["canvas_records_in_memory"] == 3


# =========================================================
# TEST 8
# WebSocket client can connect (integration-ish test)
# =========================================================

def test_websocket_connection():

    client = TestClient(app)


    with client.websocket_connect(
        f"/ws/canvas/{TEST_ROOM_ID}"
    ) as websocket:

        # Connection should be successful.
        # Send a canvas update.

        record = {
            "id": "shape:websocket",
            "typeName": "shape",
            "x": 50,
            "y": 50
        }


        message = {

            "type":
            "canvas_changes",

            "changes": {

                "added": {

                    "shape:websocket":
                    record

                },

                "updated": {},

                "removed": {}
            }
        }


        websocket.send_json(
            message
        )


    # After websocket closes,
    # canvas state should still exist.

    assert (
        "shape:websocket"
        in manager.canvas_states[
            TEST_ROOM_ID
        ]
    )


# =========================================================
# TEST 9
# Canvas state should survive client disconnect (integration-ish test)
# =========================================================

def test_canvas_state_survives_disconnect():

    client = TestClient(app)


    record = {
        "id": "shape:persistent",
        "typeName": "shape",
        "x": 300,
        "y": 300
    }


    with client.websocket_connect(
        f"/ws/canvas/{TEST_ROOM_ID}"
    ) as websocket:

        websocket.send_json({

            "type":
            "canvas_changes",

            "changes": {

                "added": {

                    "shape:persistent":
                    record

                },

                "updated": {},

                "removed": {}
            }
        })


    # Client disconnected,
    # but canvas state must remain.

    assert (
        TEST_ROOM_ID
        in manager.canvas_states
    )


    assert (
        "shape:persistent"
        in manager.canvas_states[
            TEST_ROOM_ID
        ]
    )


# =========================================================
# TEST 10
# Multiple clients can connect to same room (integration-ish test)
# =========================================================

def test_multiple_clients_same_room():

    client = TestClient(app)


    with client.websocket_connect(
        f"/ws/canvas/{TEST_ROOM_ID}"
    ) as websocket_1:

        with client.websocket_connect(
            f"/ws/canvas/{TEST_ROOM_ID}"
        ) as websocket_2:

            assert (
                len(
                    manager.rooms[
                        TEST_ROOM_ID
                    ]
                )
                == 2
            )

# =========================================================
# END OF TEST FILE
# =========================================================