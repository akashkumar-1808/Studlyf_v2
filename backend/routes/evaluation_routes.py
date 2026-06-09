from fastapi import APIRouter, HTTPException, Body, Depends
from typing import Optional, Tuple, Any, Dict
from bson import ObjectId
from datetime import datetime, timezone
from auth_institution import get_auth_user_optional

router = APIRouter(prefix="/api/evaluation", tags=["Evaluation"])


async def _find_submission_by_token(token: str) -> Tuple[Optional[dict], Optional[dict]]:
    from db import submission_data_col

    sub = await submission_data_col.find_one({"evaluation_token": token})
    if sub:
        judges = sub.get("assigned_judges") or []
        judge_entry = next(
            (j for j in judges if isinstance(j, dict) and j.get("evaluation_token") == token),
            judges[0] if judges else None,
        )
        return sub, judge_entry if isinstance(judge_entry, dict) else None

    sub = await submission_data_col.find_one({"assigned_judges.evaluation_token": token})
    if not sub:
        return None, None
    judge_entry = next(
        (j for j in (sub.get("assigned_judges") or []) if isinstance(j, dict) and j.get("evaluation_token") == token),
        None,
    )
    return sub, judge_entry


async def _resolve_event(event_id: str):
    from db import events_col

    if not event_id:
        return None
    try:
        return await events_col.find_one({"_id": ObjectId(str(event_id))})
    except Exception:
        return await events_col.find_one({"event_id": str(event_id)}) or await events_col.find_one({"event_link_id": str(event_id)})


def _event_criteria(event: Optional[dict]) -> list:
    if not event:
        return []
    criteria = event.get("judging_criteria") or event.get("evaluation_criteria") or []
    if criteria:
        return criteria
    rubric = event.get("rubric") or {}
    if isinstance(rubric, dict) and rubric.get("criteria"):
        return rubric["criteria"]
    return []


def _sanitize_submission_data(data: dict) -> dict:
    from services.field_validation import sanitize_submission_data_for_client

    sanitized = sanitize_submission_data_for_client(data or {})
    for field in ("user_email", "user_name", "email", "contact", "phone"):
        sanitized.pop(field, None)
    return sanitized


@router.get("/{token_or_id}")
async def get_evaluation_submission(token_or_id: str, user: Optional[dict] = Depends(get_auth_user_optional)):
    """Load submission for judge evaluation via secure token link or authenticated id."""
    from db import submission_data_col, scores_col

    submission = None
    judge_entry = None
    submission_id = None

    is_object_id = len(token_or_id) == 24
    if is_object_id:
        try:
            ObjectId(token_or_id)
        except Exception:
            is_object_id = False

    if is_object_id and user:
        judge_id = str(user.get("user_id") or user.get("id") or "")
        submission = await submission_data_col.find_one({
            "_id": ObjectId(token_or_id),
            "assigned_judges.judge_id": judge_id,
        })
        submission_id = token_or_id
    else:
        submission, judge_entry = await _find_submission_by_token(token_or_id)
        if submission:
            submission_id = str(submission["_id"])

    if not submission or not submission_id:
        raise HTTPException(status_code=404, detail="Invalid or expired evaluation link")

    expires = submission.get("evaluation_token_expires")
    if expires and isinstance(expires, datetime):
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > expires:
            raise HTTPException(status_code=410, detail="This evaluation link has expired")

    event = await _resolve_event(submission.get("event_id"))
    criteria = _event_criteria(event)

    judge_id = (judge_entry or {}).get("judge_id") or ""
    judge_email = (judge_entry or {}).get("email") or ""
    score_filter: Dict[str, Any] = {"submission_id": submission_id}
    if judge_id:
        score_filter["judge_id"] = judge_id
    elif judge_email:
        score_filter["judge_email"] = judge_email
    existing_evaluation = await scores_col.find_one(score_filter)

    return {
        "_id": submission_id,
        "event_id": submission.get("event_id"),
        "stage_id": submission.get("stage_id"),
        "title": submission.get("title") or submission.get("project_name") or "Untitled Project",
        "team_name": submission.get("team_name") or "Solo Participant",
        "data": _sanitize_submission_data(submission.get("data") or {}),
        "criteria": criteria,
        "existing_evaluation": {
            "score": existing_evaluation.get("total_score"),
            "criteria_scores": existing_evaluation.get("criteria_scores") or existing_evaluation.get("scores") or {},
            "recommendation": existing_evaluation.get("recommendation"),
            "comments": existing_evaluation.get("comments") or existing_evaluation.get("feedback"),
        } if existing_evaluation else None,
    }


@router.post("/{token_or_id}")
async def submit_evaluation(
    token_or_id: str,
    evaluation_data: dict = Body(...),
    user: Optional[dict] = Depends(get_auth_user_optional),
):
    """Submit rubric evaluation via token link (no login) or authenticated submission id."""
    from db import submission_data_col, scores_col

    submission = None
    judge_entry = None
    submission_id = None

    is_object_id = len(token_or_id) == 24
    if is_object_id:
        try:
            ObjectId(token_or_id)
        except Exception:
            is_object_id = False

    if is_object_id and user:
        judge_id = str(user.get("user_id") or user.get("id") or "")
        submission = await submission_data_col.find_one({
            "_id": ObjectId(token_or_id),
            "assigned_judges.judge_id": judge_id,
        })
        submission_id = token_or_id
    else:
        submission, judge_entry = await _find_submission_by_token(token_or_id)
        if submission:
            submission_id = str(submission["_id"])

    if not submission or not submission_id:
        raise HTTPException(status_code=404, detail="Invalid or expired evaluation link")

    criteria_scores = evaluation_data.get("criteria_scores") or {}
    if isinstance(criteria_scores, dict) and criteria_scores:
        try:
            total = sum(float(v) for v in criteria_scores.values())
        except (TypeError, ValueError):
            total = 0.0
        score = evaluation_data.get("score")
        if score is None:
            score = total
    else:
        score = evaluation_data.get("score")
        total = float(score or 0)

    if score is None or not (0 <= float(score) <= 100):
        raise HTTPException(status_code=400, detail="Invalid score. Must be between 0 and 100.")

    recommendation = evaluation_data.get("recommendation", "")
    comments = evaluation_data.get("comments", "")
    judge_id = (judge_entry or {}).get("judge_id") or (user or {}).get("user_id") or (user or {}).get("id") or ""
    judge_email = (judge_entry or {}).get("email") or (user or {}).get("email") or ""

    score_data = {
        "submission_id": submission_id,
        "team_id": submission.get("team_id"),
        "judge_id": str(judge_id) if judge_id else "",
        "judge_email": str(judge_email).strip().lower() if judge_email else "",
        "event_id": submission.get("event_id"),
        "stage_id": submission.get("stage_id"),
        "total_score": float(score),
        "criteria_scores": criteria_scores,
        "scores": criteria_scores,
        "recommendation": recommendation,
        "comments": comments,
        "feedback": comments,
        "evaluated_at": datetime.now(timezone.utc),
        "status": "completed",
    }

    upsert_filter: Dict[str, Any] = {"submission_id": submission_id}
    if judge_id:
        upsert_filter["judge_id"] = str(judge_id)
    elif judge_email:
        upsert_filter["judge_email"] = str(judge_email).strip().lower()
    else:
        upsert_filter["evaluation_token"] = token_or_id

    await scores_col.update_one(upsert_filter, {"$set": score_data}, upsert=True)

    await submission_data_col.update_one(
        {"_id": submission["_id"]},
        {"$set": {"evaluation_status": "completed", "evaluation_score": float(score), "status": "Scored"}},
    )

    return {"success": True, "message": "Evaluation submitted successfully"}


@router.get("/{token_or_id}/file/{field_id}")
async def download_evaluation_file(token_or_id: str, field_id: str):
    """Download a submission file for judges using their evaluation token (no login)."""
    import base64
    import os
    from pathlib import Path
    from fastapi.responses import Response

    submission, _ = await _find_submission_by_token(token_or_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Invalid or expired evaluation link")

    value = (submission.get("data") or {}).get(field_id)
    mime = "application/octet-stream"
    raw: bytes | None = None
    filename = f"{field_id}.bin"

    if isinstance(value, str) and value.startswith("data:"):
        header, _, encoded = value.partition(",")
        mime = header[5:].split(";")[0] if header.startswith("data:") else mime
        try:
            raw = base64.b64decode(encoded)
        except Exception:
            raise HTTPException(status_code=500, detail="Could not decode file")
        ext = mime.split("/")[-1] if "/" in mime else "bin"
        filename = f"{field_id}.{ext}"
    elif isinstance(value, dict) and value.get("_stored_file"):
        meta = value
        mime = str(meta.get("mime") or meta.get("mime_type") or mime)
        filename = str(meta.get("filename") or filename)
        storage_key = meta.get("storage_key") or meta.get("path")
        if storage_key:
            upload_root = Path(os.getenv("UPLOAD_DIR", "uploads"))
            file_path = upload_root / str(storage_key).lstrip("/")
            if file_path.is_file():
                raw = file_path.read_bytes()
    elif isinstance(value, str) and value.startswith("http"):
        raise HTTPException(status_code=400, detail="External URL — open link in browser")

    if raw is None:
        raise HTTPException(status_code=404, detail="File not found")

    return Response(
        content=raw,
        media_type=mime,
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )
