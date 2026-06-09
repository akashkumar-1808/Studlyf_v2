from fastapi import APIRouter, HTTPException, Body, Depends
from typing import Optional
from bson import ObjectId
from datetime import datetime, timezone
from auth_institution import get_auth_user

router = APIRouter(prefix="/api/evaluation", tags=["Evaluation"])

@router.get("/{submission_id}")
async def get_evaluation_submission(submission_id: str, user: dict = Depends(get_auth_user)):
    """Get submission details for evaluation only if the judge is assigned."""
    from db import submission_data_col, events_col, scores_col
    
    judge_id = str(user.get("user_id"))
    
    # Verify submission exists and judge is assigned
    submission = await submission_data_col.find_one({
        "_id": ObjectId(submission_id),
        "assigned_judges.judge_id": judge_id
    })
    
    if not submission:
        raise HTTPException(status_code=403, detail="You are not authorized to evaluate this submission.")
    
    # Get event details
    event = await events_col.find_one({"_id": ObjectId(submission["event_id"])})
    
    # Sanitize data
    sanitized_data = submission.get("data", {}).copy()
    sensitive_fields = ['user_email', 'user_name', 'email', 'contact', 'phone']
    for field in sensitive_fields:
        if field in sanitized_data:
            del sanitized_data[field]
            
    # Check if judge has already submitted
    existing_evaluation = await scores_col.find_one({
        "submission_id": submission_id,
        "judge_id": judge_id
    })
    
    return {
        "_id": submission_id,
        "event_id": submission.get("event_id"),
        "title": submission.get("project_name", "Untitled Project"),
        "team_name": submission.get("team_name", "Solo Participant"),
        "data": sanitized_data,
        "criteria": event.get("judging_criteria", []) if event else [],
        "existing_evaluation": {
            "score": existing_evaluation.get("total_score"),
            "criteria_scores": existing_evaluation.get("criteria_scores", {}),
            "recommendation": existing_evaluation.get("recommendation"),
            "comments": existing_evaluation.get("comments")
        } if existing_evaluation else None
    }

@router.post("/{submission_id}")
async def submit_evaluation(submission_id: str, evaluation_data: dict = Body(...), user: dict = Depends(get_auth_user)):
    """Submit evaluation only if judge is assigned to this submission and stage."""
    from db import submission_data_col, scores_col, events_col
    
    judge_id = str(user.get("user_id"))
    
    # Verify assignment to submission
    submission = await submission_data_col.find_one({
        "_id": ObjectId(submission_id),
        "assigned_judges.judge_id": judge_id
    })
    
    if not submission:
        raise HTTPException(status_code=403, detail="You are not authorized to evaluate this submission.")
    
    # Verify assignment to stage (if stage-based restrictions apply)
    stage_id = submission.get("stage_id")
    event_id = submission.get("event_id")
    event = await events_col.find_one({"_id": ObjectId(event_id)})
    
    if event and stage_id:
        stage = next((s for s in event.get("stages", []) if s.get("id") == stage_id), None)
        if stage and "assigned_judges" in stage:
            allowed_judges = [j.get("judge_id") for j in stage.get("assigned_judges", [])]
            if judge_id not in allowed_judges:
                raise HTTPException(status_code=403, detail="You are not assigned to evaluate this stage.")
    
    # Extract evaluation data
    score = evaluation_data.get("score")
    recommendation = evaluation_data.get("recommendation", "")
    comments = evaluation_data.get("comments", "")
    criteria_scores = evaluation_data.get("criteria_scores", {})
    
    if not score or not (0 <= score <= 100):
        raise HTTPException(status_code=400, detail="Invalid score. Must be between 0 and 100.")
    
    # Save evaluation
    score_data = {
        "submission_id": submission_id,
        "team_id": submission.get("team_id"),
        "judge_id": judge_id,
        "event_id": event_id,
        "stage_id": stage_id,
        "total_score": score,
        "criteria_scores": criteria_scores,
        "recommendation": recommendation,
        "comments": comments,
        "evaluated_at": datetime.now(timezone.utc),
        "status": "completed"
    }
    
    await scores_col.update_one(
        {"submission_id": submission_id, "judge_id": judge_id},
        {"$set": score_data},
        upsert=True
    )
    
    # Update submission status
    await submission_data_col.update_one(
        {"_id": submission["_id"]},
        {"$set": {"evaluation_status": "completed", "evaluation_score": score}}
    )
    
    return {"success": True, "message": "Evaluation submitted successfully"}
