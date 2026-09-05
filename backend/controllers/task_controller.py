from fastapi import APIRouter
from models.task import TaskCreateModel, TaskUpdateStatusModel
from database import supabase

router = APIRouter(prefix="/api/tasks", tags=["Kanban Tasks"])

@router.post("")
def create_task(task: TaskCreateModel):
    response = supabase.table("room_tasks").insert(task.model_dump(exclude_none=True)).execute()
    return response.data

@router.get("/{room_id}")
def get_tasks(room_id: str):
    response = supabase.table("room_tasks").select("*").eq("room_id", room_id).execute()
    return response.data

@router.patch("/{task_id}")
def update_task_status(task_id: str, payload: TaskUpdateStatusModel):
    response = supabase.table("room_tasks").update({"status": payload.status}).eq("id", task_id).execute()
    return response.data