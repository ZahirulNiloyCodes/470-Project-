from fastapi import APIRouter, Query
from typing import Optional
from database import supabase

router = APIRouter(prefix="/api/rooms", tags=["Room Search"])

@router.get("/search")
def search_rooms(q: Optional[str] = Query(None), tag: Optional[str] = Query(None)):
    query = supabase.table("study_rooms").select("*").eq("is_public", True)
    
    if q:
        query = query.ilike("title", f"%{q}%")
    if tag:
        query = query.contains("tags", [tag])
        
    response = query.execute()
    return response.data