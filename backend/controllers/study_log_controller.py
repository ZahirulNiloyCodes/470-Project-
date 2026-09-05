from fastapi import APIRouter
from models.study_log import StudyLogModel
from database import supabase

router = APIRouter(prefix="/api/study-logs", tags=["Study Logs"])

@router.post("")
def log_session(data: StudyLogModel):
    response = supabase.table("study_logs").insert(data.model_dump(exclude_none=True)).execute()
    return response.data

@router.get("/user/{user_id}")
def get_user_logs(user_id: str):
    response = supabase.table("study_logs").select("*").eq("user_id", user_id).order("session_date", desc=True).execute()
    return response.data