from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_get_room():
    room_id = "55a31f3d-ee98-4d55-a464-bff39a7229e4"

    response = client.get(
        f"/api/rooms/{room_id}"
    )

    assert response.status_code == 200

    data = response.json()

    assert "id" in data
    assert "title" in data