from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class GrievanceSubmitRequest(BaseModel):
    text: str
    category_hint: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = None  # 'image' or 'video'

class StatusLogSchema(BaseModel):
    id: int
    previous_status: Optional[str] = None
    new_status: str
    changed_by_username: Optional[str] = None
    note: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class GrievanceResponse(BaseModel):
    id: int
    tracking_id: str
    sanitized_text: str
    department_id: int
    department_name: str
    department_code: str
    urgency_level: str
    urgency_score: float
    is_duplicate: bool
    duplicate_of_id: Optional[int] = None
    status: str
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    resolved_by: Optional[str] = None
    resolution_note: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    status_logs: List[StatusLogSchema] = []

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    role: str
    department_id: Optional[int] = None
    department_name: Optional[str] = None

class UpdateStatusRequest(BaseModel):
    new_status: str
    note: Optional[str] = None

class AnalyticsResponse(BaseModel):
    total_grievances: int
    by_department: dict
    by_urgency: dict
    by_status: dict
    duplicate_count: int
    avg_resolution_hours: float
