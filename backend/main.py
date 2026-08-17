from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.room_router import router as room_router
from routers.pomodoro_router import router as pomodoro_router
from routers.flashcard_router import router as flashcard_router

app = FastAPI(title="EduStream Collaborative API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(room_router)
app.include_router(pomodoro_router)
app.include_router(flashcard_router)

@app.get("/")
def health():
    return {"status": "running", "service": "EduStream Backend"}
