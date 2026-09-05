from fastapi import APIRouter
from controllers import auth_controller
from schemas.user_schema import RegisterRequest, LoginRequest, UserOut, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut)
def register(payload: RegisterRequest):
    return auth_controller.register_user(payload.name, payload.email, payload.password)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    return auth_controller.login_user(payload.email, payload.password)