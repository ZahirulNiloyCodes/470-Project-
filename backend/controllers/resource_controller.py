from fastapi import APIRouter, HTTPException
from models.resource import ResourceModel
from database import supabase


router = APIRouter(prefix="/api/resources", tags=["Resource Hub"])

@router.post("")
def create_resource(resource: ResourceModel):
    if resource.resource_type not in ['link', 'file']:
        raise HTTPException(status_code=400, detail="Invalid resource type")
    
    data = resource.model_dump(exclude_none=True)
    response = supabase.table("room_resources").insert(data).execute()
    return response.data

@router.get("/{room_id}")
def get_resources(room_id: str):
    response = supabase.table("room_resources").select("*").eq("room_id", room_id).order("created_at", desc=True).execute()
    return response.data