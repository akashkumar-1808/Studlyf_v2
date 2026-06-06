from db import submissions_col
from bson import ObjectId
from datetime import datetime, timezone

async def create_submission(data: dict):
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    data["status"] = data.get("status", "Submitted")
    result = await submissions_col.insert_one(data)
    data["_id"] = str(result.inserted_id)
    return data

async def get_all_submissions(filters: dict = None):
    query = filters or {}
    cursor = submissions_col.find(query).sort("created_at", -1)
    submissions = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        submissions.append(doc)
    return submissions

async def get_submission_by_id(submission_id: str):
    doc = await submissions_col.find_one({"_id": ObjectId(submission_id)})
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc

async def update_submission_status(submission_id: str, status: str):
    await submissions_col.update_one(
        {"_id": ObjectId(submission_id)},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return True
