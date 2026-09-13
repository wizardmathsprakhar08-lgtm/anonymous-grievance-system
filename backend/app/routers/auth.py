import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.database import get_db, hash_password
from app.models import Officer, Department
from app.schemas import LoginRequest, TokenResponse

SECRET_KEY = "AGY_SECRET_KEY_FOR_LOCAL_PROTOTYPE_DEMO"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

router = APIRouter(prefix="/api/auth", tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Officer:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(Officer).filter(Officer.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    hashed = hash_password(req.password)
    user = db.query(Officer).filter(Officer.username == req.username, Officer.hashed_password == hashed).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid username or password")

    dept_name = None
    if user.department_id:
        dept = db.query(Department).filter(Department.id == user.department_id).first()
        if dept:
            dept_name = dept.name

    access_token = create_access_token(
        data={
            "sub": user.username,
            "role": user.role,
            "department_id": user.department_id
        }
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        username=user.username,
        role=user.role,
        department_id=user.department_id,
        department_name=dept_name
    )
