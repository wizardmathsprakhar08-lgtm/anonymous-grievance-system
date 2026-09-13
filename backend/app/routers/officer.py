from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Grievance, StatusLog, Officer
from app.schemas import GrievanceResponse, UpdateStatusRequest
from app.routers.auth import get_current_user
from app.routers.grievances import format_grievance_response

router = APIRouter(prefix="/api/officer", tags=["Officer Operations"])

@router.get("/queue", response_model=List[GrievanceResponse])
def get_officer_queue(
    department_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    current_user: Officer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Grievance)

    # Filter by department: if user is officer, restrict to user's department
    if current_user.role == "officer":
        if not current_user.department_id:
            raise HTTPException(status_code=400, detail="Officer has no assigned department")
        query = query.filter(Grievance.department_id == current_user.department_id)
    elif department_id:
        query = query.filter(Grievance.department_id == department_id)

    # Status filter
    if status_filter:
        query = query.filter(Grievance.status == status_filter)

    # Sort by urgency_score descending
    grievances = query.order_by(Grievance.urgency_score.desc(), Grievance.created_at.desc()).all()

    return [format_grievance_response(g, db) for g in grievances]

@router.patch("/grievances/{grievance_id}", response_model=GrievanceResponse)
def update_grievance_status(
    grievance_id: int,
    req: UpdateStatusRequest,
    current_user: Officer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    # Officers can only update their department's grievances unless admin
    if current_user.role == "officer" and current_user.department_id != grievance.department_id:
        raise HTTPException(status_code=403, detail="Not authorized to update grievances of another department")

    valid_statuses = ["submitted", "in_progress", "resolved", "rejected"]
    if req.new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    prev_status = grievance.status
    grievance.status = req.new_status
    db.commit()

    # Append to StatusLog
    log = StatusLog(
        grievance_id=grievance.id,
        previous_status=prev_status,
        new_status=req.new_status,
        changed_by_officer_id=current_user.id,
        note=req.note or f"Status updated from '{prev_status}' to '{req.new_status}' by {current_user.username}."
    )
    db.add(log)
    db.commit()
    db.refresh(grievance)

    return format_grievance_response(grievance, db)
