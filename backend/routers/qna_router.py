from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Query
from controllers import qna_controller
from websocket.qna_ws import qna_manager
from schemas.qna_schema import QuestionCreate, QuestionAnswer

router = APIRouter(prefix="/qna", tags=["qna"])


@router.get("/{room_id}/questions")
def get_questions(room_id: str, view: str = Query("participant", enum=["host", "participant"])):
    if view == "host":
        return {"questions": qna_controller.list_questions_for_host(room_id)}
    return {"questions": qna_controller.list_questions_for_participants(room_id)}


@router.get("/questions/{question_id}/position")
def get_position(question_id: str):
    return {"position": qna_controller.get_queue_position(question_id)}


@router.websocket("/ws/{room_id}/participant")
async def qna_participant_ws(websocket: WebSocket, room_id: str):
    await qna_manager.connect_participant(room_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "submit":
                try:
                    payload = QuestionCreate(**data["payload"])
                    question = qna_controller.submit_question(
                        payload.room_id, payload.participant_id, payload.question
                    )
                    await qna_manager.broadcast_all(
                        room_id, {"type": "new", "question": question}
                    )
                except HTTPException as exc:
                    await websocket.send_json({"type": "error", "detail": exc.detail})
                except Exception as exc:
                    await websocket.send_json({"type": "error", "detail": str(exc)})
    except WebSocketDisconnect:
        pass
    finally:
        qna_manager.disconnect_participant(room_id, websocket)


@router.websocket("/ws/{room_id}/host")
async def qna_host_ws(websocket: WebSocket, room_id: str):
    await qna_manager.connect_host(room_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("type")

            try:
                if action == "answer":
                    payload = QuestionAnswer(answer=data["answer"])
                    question = qna_controller.answer_question(data["question_id"], payload.answer)
                    await qna_manager.broadcast_all(
                        room_id, {"type": "answered", "question": question}
                    )
                elif action == "dismiss":
                    question = qna_controller.dismiss_question(data["question_id"])
                    await qna_manager.broadcast_all(
                        room_id, {"type": "dismissed", "question": question}
                    )
            except HTTPException as exc:
                await websocket.send_json({"type": "error", "detail": exc.detail})
    except WebSocketDisconnect:
        pass
    finally:
        qna_manager.disconnect_host(room_id, websocket)