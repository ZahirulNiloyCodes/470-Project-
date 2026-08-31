# integration-ish endpoint test
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_get_messages():
    room_id = "7c4e2c3a-6a72-4f8d-9f1a-123456789abc"

    response = client.get(
        f"/api/messages/{room_id}"
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)