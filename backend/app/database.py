import os
import hashlib
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "grievance_system.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def seed_db():
    from app.models.models import Department, Officer, Grievance, StatusLog
    
    Base.metadata.create_all(bind=engine)
    
    # Run auto-migration for newly added columns if sqlite
    try:
        with engine.connect() as conn:
            from sqlalchemy import text
            for col, col_type in [
                ("media_url", "TEXT"),
                ("media_type", "VARCHAR(20)"),
                ("resolved_by", "VARCHAR(100)"),
                ("resolution_note", "TEXT"),
                ("resolved_at", "DATETIME")
            ]:
                try:
                    conn.execute(text(f"ALTER TABLE grievances ADD COLUMN {col} {col_type}"))
                    conn.commit()
                except Exception:
                    pass
    except Exception:
        pass

    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Department).count() == 0:
            departments_data = [
                {"name": "Water Supply Department", "code": "water", "description": "Handles water leakage, contamination, supply shortages, and pipeline issues."},
                {"name": "Roads & Infrastructure", "code": "road", "description": "Handles potholes, broken street lights, traffic signals, and road damage."},
                {"name": "Electricity & Power", "code": "electricity", "description": "Handles power outages, dangerous exposed wiring, transformer failures."},
                {"name": "Sanitation & Waste Management", "code": "sanitation", "description": "Handles uncollected garbage, open drains, public sanitation, overflow."},
                {"name": "Anti-Corruption & Governance", "code": "corruption", "description": "Handles bribery complaints, extortion, misconduct, and administrative fraud."}
            ]
            
            depts = []
            for d in departments_data:
                dept = Department(**d)
                db.add(dept)
                depts.append(dept)
            db.commit()
            
            # Fetch department IDs
            dept_map = {d.code: d.id for d in db.query(Department).all()}
            
            # Seed officers
            officers_data = [
                {"username": "admin", "hashed_password": hash_password("admin123"), "role": "admin", "department_id": None},
                {"username": "officer_water", "hashed_password": hash_password("officer123"), "role": "officer", "department_id": dept_map["water"]},
                {"username": "officer_road", "hashed_password": hash_password("officer123"), "role": "officer", "department_id": dept_map["road"]},
                {"username": "officer_elec", "hashed_password": hash_password("officer123"), "role": "officer", "department_id": dept_map["electricity"]},
                {"username": "officer_sanitation", "hashed_password": hash_password("officer123"), "role": "officer", "department_id": dept_map["sanitation"]},
                {"username": "officer_corruption", "hashed_password": hash_password("officer123"), "role": "officer", "department_id": dept_map["corruption"]},
            ]
            
            for o in officers_data:
                db.add(Officer(**o))
            db.commit()
            
            print("\n=======================================================")
            print("=== DB AUTO-SEEDED SUCCESSFULLY WITH DEMO CREDENTIALS ===")
            print("-------------------------------------------------------")
            print(" Admin Login   : admin / admin123")
            print(" Water Officer : officer_water / officer123")
            print(" Road Officer  : officer_road / officer123")
            print(" Elec Officer  : officer_elec / officer123")
            print(" Sanitation Off: officer_sanitation / officer123")
            print(" Corruption Off: officer_corruption / officer123")
            print("=======================================================\n")
    finally:
        db.close()
