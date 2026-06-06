from db import db, events_col, participants_col, opportunities_col, opportunity_applications_col
from datetime import datetime

async def get_institution_stats(institution_id: str):
    try:
        institution_events = await events_col.find({"institution_id": institution_id}).to_list(length=1000)
        event_ids = [str(e["_id"]) for e in institution_events]

        _FINAL = frozenset({"ENDED", "COMPLETED", "CANCELLED", "REJECTED"})
        active_opps = sum(
            1 for e in institution_events
            if str(e.get("status", "")).strip().upper() not in _FINAL
        )

        institution_opps = await opportunities_col.find({
            "$or": [{"institution_id": institution_id}, {"createdBy": institution_id}]
        }).to_list(length=1000)

        def _opp_active(o):
            return str(o.get("status", "active")).lower() in ("active", "live", "published")

        # Mirror rows tied to an event (hackathons, etc.) — not Jobs/Internships
        event_linked = [
            o for o in institution_opps
            if o.get("event_link_id") and _opp_active(o)
        ]
        hack_opp_ids = [str(o["_id"]) for o in event_linked]

        ji_opps = [
            o for o in institution_opps
            if not o.get("event_link_id")
            and str(o.get("type", "")).strip().lower() in ("job", "internship")
            and _opp_active(o)
        ]
        ji_ids = [str(o["_id"]) for o in ji_opps]

        active_ji = len(ji_opps)

        portal_hack_regs = await opportunity_applications_col.count_documents(
            {"opportunity_id": {"$in": hack_opp_ids}}
        ) if hack_opp_ids else 0

        event_booth_regs = await participants_col.count_documents(
            {"event_id": {"$in": event_ids}}
        ) if event_ids else 0

        # Trophy card: portal applies for mirrored opps + classic event participants
        opp_registrations = portal_hack_regs + event_booth_regs

        ji_registrations = await opportunity_applications_col.count_documents(
            {"opportunity_id": {"$in": ji_ids}}
        ) if ji_ids else 0

        total_candidates = opp_registrations + ji_registrations

        # 4. Dynamic Engagement Rate & Assessments
        # Calculate engagement based on average participants per opportunity
        total_active_listings = active_opps + active_ji
        expected_participants = total_active_listings * 50 # Assuming 50 is a good baseline
        raw_engagement = (total_candidates / expected_participants * 100) if expected_participants > 0 else 0
        engagement_rate = round(min(100.0, max(12.5, raw_engagement)), 1) if total_candidates > 0 else 0.0

        return {
            "total_participants": total_candidates,
            "active_ji": active_ji,
            "ji_registrations": ji_registrations,
            "active_events": active_opps,
            "opp_registrations": opp_registrations,
            "active_assessments": total_active_listings, # Using listings as a proxy for active assessments
            "engagement_rate": engagement_rate
        }
    except Exception as e:
        print(f"STATS ERROR: {e}")
        return {
            "total_participants": 0,
            "active_ji": 0,
            "ji_registrations": 0,
            "active_events": 0,
            "opp_registrations": 0,
            "active_assessments": 0,
            "engagement_rate": 0
        }
