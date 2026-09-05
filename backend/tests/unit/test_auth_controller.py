import pytest
from fastapi import HTTPException
from controllers import auth_controller


class FakeUserModel:
    def __init__(self):
        self.users = {}
        self._counter = 0

    def get_user_by_email(self, email):
        for u in self.users.values():
            if u["email"] == email:
                return u
        return None

    def create_user(self, name, email, password_hash):
        self._counter += 1
        uid = f"u-{self._counter}"
        user = {
            "id": uid,
            "name": name,
            "email": email,
            "password_hash": password_hash,
            "role": "student",
            "peer_reputation_score": 0,
        }
        self.users[uid] = user
        return user


@pytest.fixture
def fake_model(monkeypatch):
    fake = FakeUserModel()
    monkeypatch.setattr(auth_controller, "user_model", fake)
    return fake


# ---------- register_user ----------

def test_register_user_success(fake_model):
    user = auth_controller.register_user("Alice", "Alice@Test.com", "test1234")

    assert user["name"] == "Alice"
    assert user["email"] == "alice@test.com"  # lowercased
    assert "password_hash" not in user  # কখনো response এ ফেরত যাবে না


def test_register_user_hashes_password_not_plaintext(fake_model):
    auth_controller.register_user("Alice", "alice@test.com", "test1234")
    stored = fake_model.get_user_by_email("alice@test.com")
    assert stored["password_hash"] != "test1234"  # hashed, plaintext না


def test_register_user_rejects_duplicate_email(fake_model):
    auth_controller.register_user("Alice", "alice@test.com", "test1234")

    with pytest.raises(HTTPException) as exc_info:
        auth_controller.register_user("Alice2", "alice@test.com", "different123")
    assert exc_info.value.status_code == 400
    assert "already exists" in exc_info.value.detail


def test_register_user_email_is_case_insensitive_for_duplicates(fake_model):
    auth_controller.register_user("Alice", "alice@test.com", "test1234")

    with pytest.raises(HTTPException):
        auth_controller.register_user("Alice2", "ALICE@TEST.COM", "different123")


def test_register_user_rejects_password_over_72_bytes(fake_model):
    long_password = "a" * 73
    with pytest.raises(HTTPException) as exc_info:
        auth_controller.register_user("Alice", "alice@test.com", long_password)
    assert exc_info.value.status_code == 400
    assert "too long" in exc_info.value.detail


def test_register_user_allows_exactly_72_bytes(fake_model):
    password_72_bytes = "a" * 72
    user = auth_controller.register_user("Alice", "alice@test.com", password_72_bytes)
    assert user["name"] == "Alice"


# ---------- login_user ----------

def test_login_user_success_returns_token_and_user(fake_model, monkeypatch):
    auth_controller.register_user("Alice", "alice@test.com", "test1234")

    # create_access_token আসল JWT লাইব্রেরি ব্যবহার করবে; JWT_SECRET_KEY লাগবে
    monkeypatch.setenv("JWT_SECRET_KEY", "test-secret-key-for-unit-tests")

    result = auth_controller.login_user("alice@test.com", "test1234")

    assert "access_token" in result
    assert result["token_type"] == "bearer"
    assert result["user"]["email"] == "alice@test.com"
    assert "password_hash" not in result["user"]


def test_login_user_rejects_wrong_password(fake_model):
    auth_controller.register_user("Alice", "alice@test.com", "test1234")

    with pytest.raises(HTTPException) as exc_info:
        auth_controller.login_user("alice@test.com", "wrongpassword")
    assert exc_info.value.status_code == 401
    assert "Invalid email or password" in exc_info.value.detail


def test_login_user_rejects_nonexistent_email(fake_model):
    with pytest.raises(HTTPException) as exc_info:
        auth_controller.login_user("nobody@test.com", "test1234")
    assert exc_info.value.status_code == 401


def test_login_user_is_case_insensitive_for_email(fake_model):
    auth_controller.register_user("Alice", "alice@test.com", "test1234")
    result = auth_controller.login_user("ALICE@TEST.COM", "test1234")
    assert result["user"]["email"] == "alice@test.com"