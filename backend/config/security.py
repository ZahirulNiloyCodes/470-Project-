import os
import json
import base64
import hmac
import hashlib
from datetime import datetime, timedelta, timezone

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev_jwt_secret_key_change_in_production_12345")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

try:
    import bcrypt

    def hash_password(password: str) -> str:
        pwd_bytes = password.encode("utf-8")[:72]
        return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode("utf-8")

    def verify_password(plain_password: str, hashed_password: str) -> bool:
        try:
            return bcrypt.checkpw(plain_password.encode("utf-8")[:72], hashed_password.encode("utf-8"))
        except Exception:
            return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password
except ImportError:
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

        def hash_password(password: str) -> str:
            return pwd_context.hash(password)

        def verify_password(plain_password: str, hashed_password: str) -> bool:
            try:
                return pwd_context.verify(plain_password, hashed_password)
            except Exception:
                return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password
    except ImportError:
        def hash_password(password: str) -> str:
            return "sha256:" + hashlib.sha256(password.encode()).hexdigest()

        def verify_password(plain_password: str, hashed_password: str) -> bool:
            expected = "sha256:" + hashlib.sha256(plain_password.encode()).hexdigest()
            if hashed_password.startswith("sha256:"):
                return expected == hashed_password
            return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password


try:
    from jose import jwt, JWTError

    def create_access_token(user_id: str, role: str) -> str:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {"sub": user_id, "role": role, "exp": expire}
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    def decode_access_token(token: str):
        try:
            return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        except JWTError:
            return None
except ImportError:
    def create_access_token(user_id: str, role: str) -> str:
        payload = {
            "sub": user_id,
            "role": role,
            "exp": (datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)).timestamp(),
        }
        encoded = base64.b64encode(json.dumps(payload).encode()).decode()
        sig = hmac.new(SECRET_KEY.encode(), encoded.encode(), hashlib.sha256).hexdigest()
        return f"{encoded}.{sig}"

    def decode_access_token(token: str):
        try:
            encoded, sig = token.split(".", 1)
            expected = hmac.new(SECRET_KEY.encode(), encoded.encode(), hashlib.sha256).hexdigest()
            if not hmac.compare_digest(sig, expected):
                return None
            return json.loads(base64.b64decode(encoded.encode()).decode())
        except Exception:
            return None