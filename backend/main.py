from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from controllers.resource_controller import router as resource_router
from controllers.task_controller import router as task_router
from controllers.study_log_controller import router as study_log_router
from controllers.room_search_controller import router as room_router

app = FastAPI(title="EduStream API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resource_router)
app.include_router(task_router)
app.include_router(study_log_router)
app.include_router(room_router)

@app.get("/")
def read_root():
    return {"message": "EduStream Backend API is running"}