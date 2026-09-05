from fastapi import HTTPException
from models import user_model
from config.security import hash_password, verify_password, create_access_token


def register_user(name: str, email: str, password: str) -> dict:
    # bcrypt max 72 bytes support kore — UTF-8 encode kore length check
    if len(password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password is too long (max 72 bytes). Try a shorter password."
        )

    existing = user_model.get_user_by_email(email.lower().strip())
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    password_hash = hash_password(password)
    user = user_model.create_user(name.strip(), email.lower().strip(), password_hash)
    user.pop("password_hash", None)
    return user

def login_user(email: str, password: str) -> dict:
    user = user_model.get_user_by_email(email.lower().strip())
    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user["id"], user["role"])
    safe_user = {k: v for k, v in user.items() if k != "password_hash"}
    return {"access_token": token, "token_type": "bearer", "user": safe_user}