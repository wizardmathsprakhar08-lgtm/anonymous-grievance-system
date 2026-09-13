from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Grievance, Department
from app.schemas import AnalyticsResponse
from app.routers.auth import get_current_user, Officer

router = APIRouter(prefix="/api/admin", tags=["Admin Analytics"])

@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(
    current_user: Officer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total = db.query(Grievance).count()
    
    # Department breakdown
    departments = db.query(Department).all()
    by_dept = {}
    for d in departments:
        count = db.query(Grievance).filter(Grievance.department_id == d.id).count()
        by_dept[d.name] = count

    # Urgency breakdown
    urgencies = ["low", "medium", "high", "critical"]
    by_urgency = {}
    for u in urgencies:
        count = db.query(Grievance).filter(Grievance.urgency_level == u).count()
        by_urgency[u] = count

    # Status breakdown
    statuses = ["submitted", "in_progress", "resolved", "rejected"]
    by_status = {}
    for s in statuses:
        count = db.query(Grievance).filter(Grievance.status == s).count()
        by_status[s] = count

    # Duplicate count
    duplicate_count = db.query(Grievance).filter(Grievance.is_duplicate == True).count()

    # Average resolution time in hours
    resolved = db.query(Grievance).filter(Grievance.status == "resolved").all()
    if resolved:
        total_seconds = sum((g.updated_at - g.created_at).total_seconds() for g in resolved)
        avg_hours = round((total_seconds / len(resolved)) / 3600.0, 1)
    else:
        avg_hours = 0.0

    return AnalyticsResponse(
        total_grievances=total,
        by_department=by_dept,
        by_urgency=by_urgency,
        by_status=by_status,
        duplicate_count=duplicate_count,
        avg_resolution_hours=avg_hours
    )
