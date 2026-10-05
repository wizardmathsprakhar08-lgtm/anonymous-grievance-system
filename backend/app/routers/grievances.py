from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Grievance, Department, StatusLog, Officer
from app.schemas import GrievanceSubmitRequest, GrievanceResponse, StatusLogSchema
from app.agents import GrievancePipeline

router = APIRouter(prefix="/api/grievances", tags=["Grievances"])
pipeline = GrievancePipeline()

def format_grievance_response(g: Grievance, db: Session) -> GrievanceResponse:
    dept = db.query(Department).filter(Department.id == g.department_id).first()
    dept_name = dept.name if dept else "Unknown"
    dept_code = dept.code if dept else "unknown"

    logs = []
    for log in g.status_logs:
        officer_name = None
        if log.changed_by_officer_id:
            off = db.query(Officer).filter(Officer.id == log.changed_by_officer_id).first()
            if off:
                officer_name = off.username
        
        logs.append(StatusLogSchema(
            id=log.id,
            previous_status=log.previous_status,
            new_status=log.new_status,
            changed_by_username=officer_name,
            note=log.note,
            timestamp=log.timestamp
        ))

    # Sort logs by timestamp ascending
    logs.sort(key=lambda x: x.timestamp)

    return GrievanceResponse(
        id=g.id,
        tracking_id=g.tracking_id,
        sanitized_text=g.sanitized_text,
        department_id=g.department_id,
        department_name=dept_name,
        department_code=dept_code,
        urgency_level=g.urgency_level,
        urgency_score=g.urgency_score,
        is_duplicate=g.is_duplicate,
        duplicate_of_id=g.duplicate_of_id,
        status=g.status,
        media_url=g.media_url,
        media_type=g.media_type,
        resolved_by=g.resolved_by,
        resolution_note=g.resolution_note,
        resolved_at=g.resolved_at,
        created_at=g.created_at,
        updated_at=g.updated_at,
        status_logs=logs
    )

@router.get("", response_model=List[GrievanceResponse])
def get_public_grievances(
    status: Optional[str] = None,
    department_id: Optional[int] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Public endpoint to browse all registered complaints in the app."""
    query = db.query(Grievance)
    if status and status.lower() != "all":
        query = query.filter(Grievance.status == status.lower())
    if department_id:
        query = query.filter(Grievance.department_id == department_id)
    
    # Sort by urgency and recency
    records = query.order_by(Grievance.created_at.desc()).offset(offset).limit(limit).all()
    return [format_grievance_response(g, db) for g in records]

@router.post("", response_model=GrievanceResponse)
def submit_grievance(req: GrievanceSubmitRequest, db: Session = Depends(get_db)):
    if not req.text or len(req.text.strip()) < 5:
        raise HTTPException(status_code=400, detail="Grievance text must be at least 5 characters long.")

    # 1. Fetch existing open grievances for similarity comparison
    existing_records = db.query(Grievance).filter(Grievance.status != "resolved").all()
    existing_list = [
        {"id": r.id, "sanitized_text": r.sanitized_text}
        for r in existing_records
    ]

    # 2. Fetch all departments
    departments = db.query(Department).all()
    dept_list = [
        {"id": d.id, "name": d.name, "code": d.code}
        for d in departments
    ]

    # 3. Execute 5-agent pipeline
    pipeline_res = pipeline.run(
        raw_text=req.text,
        category_hint=req.category_hint,
        existing_grievances=existing_list,
        departments=dept_list
    )

    # 4. Store grievance record
    grievance = Grievance(
        tracking_id=pipeline_res["tracking_id"],
        raw_text=pipeline_res["raw_text"],
        sanitized_text=pipeline_res["sanitized_text"],
        department_id=pipeline_res["department_id"],
        urgency_level=pipeline_res["urgency_level"],
        urgency_score=pipeline_res["urgency_score"],
        is_duplicate=pipeline_res["is_duplicate"],
        duplicate_of_id=pipeline_res["duplicate_of_id"],
        media_url=req.media_url,
        media_type=req.media_type,
        status="submitted"
    )
    db.add(grievance)
    db.commit()
    db.refresh(grievance)

    # 5. Add initial StatusLog entry
    log_note = (
        f"Grievance ingested anonymously. Classified to '{pipeline_res['department_name']}' "
        f"with Urgency: {pipeline_res['urgency_level'].upper()} (Score: {pipeline_res['urgency_score']})."
    )
    if pipeline_res["is_duplicate"]:
        log_note += f" [DUPLICATE DETECTED: Similar to Grievance #{pipeline_res['duplicate_of_id']}]"

    initial_log = StatusLog(
        grievance_id=grievance.id,
        previous_status=None,
        new_status="submitted",
        note=log_note
    )
    db.add(initial_log)
    db.commit()

    return format_grievance_response(grievance, db)

@router.get("/{tracking_id}", response_model=GrievanceResponse)
def get_grievance_by_tracking_id(tracking_id: str, db: Session = Depends(get_db)):
    clean_id = tracking_id.strip().upper()
    grievance = db.query(Grievance).filter(Grievance.tracking_id == clean_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found. Please check your tracking ID.")
    return format_grievance_response(grievance, db)
