import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# member1
from routers.room_router import router as room_router
from routers.pomodoro_router import router as pomodoro_router
from routers.flashcard_router import router as flashcard_router
from routers.peer_rating_router import router as peer_rating_router

# member2
from routers import canvas_router
from routers import chat_router
from routers import qna_router
from routers import screenshare_router


app = FastAPI(title="EduStream Collaborative API")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# member1
app.include_router(room_router)
app.include_router(pomodoro_router)
app.include_router(flashcard_router)
app.include_router(peer_rating_router)

# member2
app.include_router(canvas_router.router)
app.include_router(chat_router.router)
app.include_router(qna_router.router)
app.include_router(screenshare_router.router)

@app.get("/")
def health():
    return {"status": "running", "service": "EduStream Backend"}
