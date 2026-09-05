import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# member1
from routers.room_router import router as room_router
from routers.pomodoro_router import router as pomodoro_router
from routers.flashcard_router import router as flashcard_router
from routers.peer_rating_router import router as peer_rating_router

# member2 (collaboration)
from routers import canvas_router
from routers import chat_router
from routers import qna_router
from routers import screenshare_router

# member2 (authentication & users)
from routers import auth_router
from routers import user_router

# member3 (FR3 Global Search, FR7 Kanban Tasks, FR11 Resource Hub, FR15 Study Logs)
from controllers.room_search_controller import router as room_search_router
from controllers.task_controller import router as task_router
from controllers.study_log_controller import router as study_log_router
from controllers.resource_controller import router as resource_router


app = FastAPI(title="EduStream Collaborative API")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# member1 routes
app.include_router(room_router)
app.include_router(pomodoro_router)
app.include_router(flashcard_router)
app.include_router(peer_rating_router)

# member2 collaboration routes
app.include_router(canvas_router.router)
app.include_router(chat_router.router)
app.include_router(qna_router.router)
app.include_router(screenshare_router.router)

# member2 authentication routes
app.include_router(auth_router.router)
app.include_router(user_router.router)

# member3 routes
app.include_router(room_search_router)
app.include_router(task_router)
app.include_router(study_log_router)
app.include_router(resource_router)


@app.get("/")
def health():
    return {"status": "running", "service": "EduStream Backend"}
