from fastapi import HTTPException
from typing import List, Optional
from models.room_model import RoomModel
from schemas.room_schema import RoomCreateRequest, RoomResponse

class RoomController:
    @staticmethod
    def create_room(data: RoomCreateRequest, host_id: str) -> RoomResponse:
        payload = data.model_dump()
        payload["host_id"] = host_id
        if payload["is_private"] and not payload.get("access_code"):
            raise HTTPException(status_code=400, detail="Private rooms require an access code.")
        try:
            return RoomResponse(**RoomModel.create_room(payload))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def list_rooms(tag: Optional[str] = None) -> List[RoomResponse]:
        return [RoomResponse(**r) for r in RoomModel.get_public_rooms(tag=tag)]
