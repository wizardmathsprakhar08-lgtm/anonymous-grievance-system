import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)

    officers = relationship("Officer", back_populates="department")
    grievances = relationship("Grievance", back_populates="department")


class Officer(Base):
    __tablename__ = "officers"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(128), nullable=False)
    role = Column(String(20), default="officer")  # 'officer' or 'admin'
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)

    department = relationship("Department", back_populates="officers")
    status_logs = relationship("StatusLog", back_populates="changed_by")


class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(Integer, primary_key=True, index=True)
    tracking_id = Column(String(64), unique=True, nullable=False, index=True)
    raw_text = Column(Text, nullable=False)
    sanitized_text = Column(Text, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    urgency_level = Column(String(20), nullable=False, default="low")  # 'low', 'medium', 'high', 'critical'
    urgency_score = Column(Float, nullable=False, default=0.0)
    is_duplicate = Column(Boolean, default=False)
    duplicate_of_id = Column(Integer, ForeignKey("grievances.id"), nullable=True)
    status = Column(String(20), nullable=False, default="submitted")  # 'submitted', 'in_progress', 'resolved', 'rejected'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    department = relationship("Department", back_populates="grievances")
    duplicate_of = relationship("Grievance", remote_side=[id])
    status_logs = relationship("StatusLog", back_populates="grievance", cascade="all, delete-orphan")


class StatusLog(Base):
    __tablename__ = "status_logs"

    id = Column(Integer, primary_key=True, index=True)
    grievance_id = Column(Integer, ForeignKey("grievances.id"), nullable=False)
    previous_status = Column(String(20), nullable=True)
    new_status = Column(String(20), nullable=False)
    changed_by_officer_id = Column(Integer, ForeignKey("officers.id"), nullable=True)
    note = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    grievance = relationship("Grievance", back_populates="status_logs")
    changed_by = relationship("Officer", back_populates="status_logs")
