from fastapi import APIRouter, HTTPException, Depends
from db import db
from models.eligibility_models import EligibilityRule, RuleStatus
from datetime import datetime

router = APIRouter(prefix="/api/v1/certificates/rules", tags=["Eligibility Rules"])

from fastapi import APIRouter, HTTPException, Depends
from typing import List
from db import db
from models.eligibility_models import EligibilityRule, RuleStatus, RuleType
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/api/v1/certificates/rules", tags=["Eligibility Rules"])

async def get_rule_or_404(rule_id: str, user: dict):
    rule = await db.eligibility_rules.find_one({"rule_id": rule_id, "is_deleted": False})
    if not rule: raise HTTPException(status_code=404, detail="Rule not found")
    
    # Ownership: Verify event belongs to user's institution
    event = await db.events.find_one({"_id": ObjectId(rule["event_id"])})
    if not event or event.get("institution_id") != user.get("institution_id"):
        raise HTTPException(status_code=403, detail="Forbidden")
    return rule

@router.post("/", response_model=EligibilityRule)
async def create_rule(rule: EligibilityRule, user: dict = Depends(get_auth_user)):
    # Ownership Check
    event = await db.events.find_one({"_id": ObjectId(rule.event_id)})
    if not event or event.get("institution_id") != user.get("institution_id"):
        raise HTTPException(status_code=403, detail="Forbidden: Event not owned by institution")
    
    # Winner duplication check
    if rule.certificate_type == "winner" and rule.status == RuleStatus.ACTIVE:
        exists = await db.eligibility_rules.find_one({"event_id": rule.event_id, "stage_id": rule.stage_id, "certificate_type": "winner", "status": RuleStatus.ACTIVE})
        if exists: raise HTTPException(status_code=400, detail="Active Winner rule already exists")
    
    rule.created_by = rule.updated_by = user["user_id"]
    await db.eligibility_rules.insert_one(rule.dict())
    return rule

@router.patch("/{rule_id}/status")
async def update_rule_status(rule_id: str, status: RuleStatus, user: dict = Depends(get_auth_user)):
    rule = await get_rule_or_404(rule_id, user)
    
    # Status Transition Controls
    current = rule["status"]
    if (current, status) not in [(RuleStatus.DRAFT, RuleStatus.ACTIVE), (RuleStatus.ACTIVE, RuleStatus.ARCHIVED), (RuleStatus.ARCHIVED, RuleStatus.ACTIVE)]:
        raise HTTPException(status_code=400, detail="Invalid status transition")
        
    update = {"status": status, "updated_at": datetime.utcnow(), "updated_by": user["user_id"]}
    if status == RuleStatus.ACTIVE:
        update.update({"activated_at": datetime.utcnow(), "activated_by": user["user_id"]})
    elif status == RuleStatus.ARCHIVED:
        update.update({"archived_at": datetime.utcnow(), "archived_by": user["user_id"]})
        
    await db.eligibility_rules.update_one({"rule_id": rule_id}, {"$set": update})
    return {"status": "success"}

@router.delete("/{rule_id}")
async def delete_rule(rule_id: str, user: dict = Depends(get_auth_user)):
    await get_rule_or_404(rule_id, user)
    await db.eligibility_rules.update_one(
        {"rule_id": rule_id},
        {"$set": {"is_deleted": True, "deleted_at": datetime.utcnow(), "deleted_by": user["user_id"]}}
    )
    return {"status": "success"}

