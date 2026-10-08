"""
Evaluation endpoints: submitting mutual evaluations and listing the ones
a user has received.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.models.evaluation import EvaluationCreateRequest
from app.services.evaluation_service import EvaluationService

router = APIRouter()
_eval_svc = EvaluationService()


def _uid(user: dict) -> str:
    return user.get("sub", "")


def _serialize(obj):
    if hasattr(obj, "model_dump"):
        return obj.model_dump(mode="json")
    return obj


@router.get("/received")
def get_received_evaluations(user: dict = Depends(get_current_user)):
    """Get all evaluations received by the current user."""
    return [_serialize(e) for e in _eval_svc.get_received(_uid(user))]


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_evaluation(
    payload: EvaluationCreateRequest,
    user: dict = Depends(get_current_user),
):
    """Submit an evaluation of the other party for a completed application."""
    uid = _uid(user)
    role = user.get("role", "")
    if role not in ("student", "recruiter"):
        raise HTTPException(
            status_code=403,
            detail="Only students and recruiters can submit evaluations.",
        )
    try:
        evaluation = _eval_svc.create_evaluation(
            payload.applicationId,
            uid,
            role,
            payload.rating,
            payload.comment,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    # Notify the evaluated party
    from app.services.notification_service import NotificationService
    to_uid = str(getattr(evaluation, "toUid", ""))
    if to_uid:
        NotificationService().on_evaluation_received(
            to_uid, int(getattr(evaluation, "rating", 0)),
        )
    return _serialize(evaluation)
