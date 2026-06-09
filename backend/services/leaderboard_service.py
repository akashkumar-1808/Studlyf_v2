from datetime import datetime
from bson import ObjectId
from db import scores_col, submissions_col, submission_data_col, leaderboard_col, events_col

class LeaderboardService:
    async def calculate_event_leaderboard(self, event_id: str):
        """
        Dynamically calculates rankings by aggregating judge scores.
        Handles both individual and team participation across submission types.
        """
        # 1. Get all submissions for the event from both collections
        submissions = await submissions_col.find({"event_id": event_id}).to_list(None)
        stage_submissions = await submission_data_col.find({"event_id": event_id}).to_list(None)
        
        # Combine submissions (ensure we don't have duplicates if id overlaps)
        all_submissions = submissions + stage_submissions
        if not all_submissions:
            return []

        rankings_data = []

        for sub in all_submissions:
            sub_id = str(sub["_id"])
            
            # 2. Get all scores for this submission
            scores = await scores_col.find({"submission_id": sub_id}).to_list(None)
            
            if not scores:
                avg_score = 0
            else:
                # 3. Calculate average score across all criteria and judges
                total_points = 0
                total_criteria = 0
                
                for s in scores:
                    points_dict = s.get("scores", {})
                    total_points += sum(points_dict.values())
                    total_criteria += len(points_dict)
                
                avg_score = round(total_points / total_criteria, 2) if total_criteria > 0 else 0

            # Fetch names for integration
            team_name = "N/A"
            recipient_name = "Participant"
            
            if sub.get("team_id"):
                from db import teams_col
                team = await teams_col.find_one({"_id": ObjectId(sub["team_id"])})
                team_name = team.get("team_name", "Unknown Team") if team else "Unknown Team"
            
            if sub.get("participant_id"):
                from db import participants_col
                p = await participants_col.find_one({"_id": ObjectId(sub["participant_id"])})
                recipient_name = p.get("full_name", "Participant") if p else "Participant"
            elif sub.get("user_id"): # Fallback for stage submissions
                from db import users_col
                p = await users_col.find_one({"user_id": sub["user_id"]})
                recipient_name = p.get("full_name", "Participant") if p else "Participant"

            rankings_data.append({
                "event_id": event_id,
                "team_id": sub.get("team_id"),
                "participant_id": sub.get("participant_id") or sub.get("user_id"),
                "participation_type": "TEAM" if sub.get("team_id") else "INDIVIDUAL",
                "team_name": team_name,
                "recipient_name": recipient_name,
                "total_score": avg_score,
                "project_name": sub.get("project_name") or (sub.get("data", {}).get("project_name")) or "Unnamed Project",
                "last_updated": datetime.utcnow()
            })

        # 4. Sort by score descending
        rankings_data.sort(key=lambda x: x["total_score"], reverse=True)

        # 5. Assign ranks
        for idx, entry in enumerate(rankings_data):
            entry["rank"] = idx + 1

        # 6. Atomic Sync: Clear old and insert new
        await leaderboard_col.delete_many({"event_id": event_id})
        if rankings_data:
            await leaderboard_col.insert_many(rankings_data)

        return rankings_data

leaderboard_service = LeaderboardService()
