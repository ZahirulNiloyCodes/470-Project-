import pytest
from models import user_model


@pytest.fixture(autouse=True)
def patch_supabase(monkeypatch, fake_supabase):
    monkeypatch.setattr(user_model, "supabase", fake_supabase)
    return fake_supabase


def test_create_user_inserts_with_default_role_and_score(patch_supabase):
    user = user_model.create_user("Alice", "alice@test.com", "hashed_pw")

    assert user["name"] == "Alice"
    assert user["email"] == "alice@test.com"
    assert user["password_hash"] == "hashed_pw"
    assert user["role"] == "student"
    assert user["peer_reputation_score"] == 0
    assert "id" in user


def test_get_user_by_email_returns_none_when_missing(patch_supabase):
    assert user_model.get_user_by_email("nobody@test.com") is None


def test_get_user_by_email_returns_matching_user(patch_supabase):
    user_model.create_user("Alice", "alice@test.com", "hashed_pw")
    found = user_model.get_user_by_email("alice@test.com")
    assert found["name"] == "Alice"


def test_get_user_by_id_returns_none_when_missing(patch_supabase):
    assert user_model.get_user_by_id("nonexistent") is None


def test_get_user_by_id_returns_matching_user(patch_supabase):
    created = user_model.create_user("Alice", "alice@test.com", "hashed_pw")
    found = user_model.get_user_by_id(created["id"])
    assert found["email"] == "alice@test.com"


def test_update_user_updates_specified_fields(patch_supabase):
    created = user_model.create_user("Alice", "alice@test.com", "hashed_pw")
    updated = user_model.update_user(created["id"], {"name": "Alice Updated"})
    assert updated["name"] == "Alice Updated"
    assert updated["email"] == "alice@test.com"  # unchanged


def test_update_user_returns_none_for_missing_id(patch_supabase):
    result = user_model.update_user("nonexistent", {"name": "X"})
    assert result is None


def test_update_reputation_score_sets_new_value(patch_supabase):
    created = user_model.create_user("Alice", "alice@test.com", "hashed_pw")
    user_model.update_reputation_score(created["id"], 4.5)

    updated = user_model.get_user_by_id(created["id"])
    assert updated["peer_reputation_score"] == 4.5