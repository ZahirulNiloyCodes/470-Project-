from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from models.peer_rating_model import PeerRatingModel, peer_rating_model
from schemas.peer_rating_schema import (
    PeerRatingCreate,
    PeerRatingBatchCreate,
    PeerRatingOut,
    PeerRatingSummaryOut,
    SessionPeerOut,
)


class PeerRatingController:
    model = PeerRatingModel

    @classmethod
    def submit_rating(cls, data: PeerRatingCreate, rater_id: str) -> PeerRatingOut:
        if not rater_id:
            raise HTTPException(status_code=401, detail="Authentication required to submit peer ratings.")

        if rater_id == data.ratee_id:
            raise HTTPException(
                status_code=400,
                detail="Participants cannot rate their own helpfulness.",
            )

        if not (1 <= data.rating <= 5):
            raise HTTPException(
                status_code=400,
                detail="Helpfulness rating must be an integer between 1 and 5.",
            )

        feedback = data.feedback.strip() if data.feedback and data.feedback.strip() else None

        payload = {
            "room_id": data.room_id,
            "rater_id": rater_id,
            "ratee_id": data.ratee_id,
            "rating": data.rating,
            "feedback": feedback,
        }

        try:
            result = cls.model.create_or_update_rating(payload)
            return PeerRatingOut(**result)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save rating: {str(e)}")

    @classmethod
    def submit_batch_ratings(cls, data: PeerRatingBatchCreate, rater_id: str) -> List[PeerRatingOut]:
        if not rater_id:
            raise HTTPException(status_code=401, detail="Authentication required to submit peer ratings.")

        results = []
        for item in data.ratings:
            if item.ratee_id == rater_id:
                # Disallow self-rating in batch
                raise HTTPException(
                    status_code=400,
                    detail="Cannot rate oneself in batch rating submission.",
                )
            if not (1 <= item.rating <= 5):
                raise HTTPException(
                    status_code=400,
                    detail=f"Rating for peer {item.ratee_id} must be between 1 and 5.",
                )

            single_data = PeerRatingCreate(
                room_id=data.room_id,
                ratee_id=item.ratee_id,
                rating=item.rating,
                feedback=item.feedback,
            )
            saved = cls.submit_rating(single_data, rater_id)
            results.append(saved)

        return results

    @classmethod
    def get_user_summary(cls, user_id: str) -> PeerRatingSummaryOut:
        try:
            ratings = cls.model.get_ratings_for_user(user_id)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch user ratings: {str(e)}")

        total = len(ratings)
        distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        feedback_list = []

        total_score = 0
        for r in ratings:
            score = int(r.get("rating", 0))
            if 1 <= score <= 5:
                distribution[score] += 1
                total_score += score
            if r.get("feedback"):
                feedback_list.append(str(r["feedback"]).strip())

        avg = round(total_score / total, 2) if total > 0 else 0.0

        return PeerRatingSummaryOut(
            user_id=user_id,
            average_rating=avg,
            total_ratings=total,
            rating_distribution=distribution,
            recent_feedback=feedback_list[:10],
        )

    @classmethod
    def list_user_ratings(cls, user_id: str) -> List[PeerRatingOut]:
        try:
            ratings = cls.model.get_ratings_for_user(user_id)
            return [PeerRatingOut(**r) for r in ratings]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch user ratings: {str(e)}")

    @classmethod
    def list_room_ratings(cls, room_id: str) -> List[PeerRatingOut]:
        try:
            ratings = cls.model.get_ratings_by_room(room_id)
            return [PeerRatingOut(**r) for r in ratings]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch room ratings: {str(e)}")

    @classmethod
    def get_user_ratings_in_room(cls, room_id: str, rater_id: str) -> List[PeerRatingOut]:
        try:
            ratings = cls.model.get_ratings_by_rater_in_room(room_id, rater_id)
            return [PeerRatingOut(**r) for r in ratings]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch rater ratings: {str(e)}")

    @classmethod
    def get_eligible_session_peers(cls, room_id: str, current_user_id: str) -> List[SessionPeerOut]:
        # Predefined demo/known study session peers for room sessions
        standard_demo_peers = [
            {"user_id": "22222222-2222-4222-a222-222222222222", "username": "Sarah (Study Partner)"},
            {"user_id": "33333333-3333-4333-a333-333333333333", "username": "Alex (Discussion Lead)"},
            {"user_id": "44444444-4444-4444-a444-444444444444", "username": "David (Note Sharer)"},
            {"user_id": "11111111-1111-4111-a111-111111111111", "username": "You (Host / Participant)"},
        ]

        # Fetch existing ratings submitted by current user for this room
        try:
            my_ratings = cls.model.get_ratings_by_rater_in_room(room_id, current_user_id)
            rated_dict = {r["ratee_id"]: r for r in my_ratings}
        except Exception:
            rated_dict = {}

        eligible = []
        for p in standard_demo_peers:
            # Cannot rate oneself
            if p["user_id"] == current_user_id:
                continue

            existing = rated_dict.get(p["user_id"])
            eligible.append(
                SessionPeerOut(
                    user_id=p["user_id"],
                    username=p["username"],
                    has_rated=existing is not None,
                    current_rating=existing["rating"] if existing else None,
                    current_feedback=existing.get("feedback") if existing else None,
                )
            )

        return eligible


# Controller instance alias
peer_rating_controller = PeerRatingController()
