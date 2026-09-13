from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import seed_db
from app.routers import auth_router, grievances_router, officer_router, admin_router

app = FastAPI(
    title="Anonymous Public Grievance Redressal System API",
    description="Multi-Agent AI Pipeline powered Grievance Redressal System backend.",
    version="1.0.0"
)

# CORS middleware for React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(grievances_router)
app.include_router(officer_router)
app.include_router(admin_router)

@app.on_event("startup")
def on_startup():
    seed_db()

@app.get("/")
def read_root():
    return {
        "system": "Anonymous Public Grievance Redressal System Using Multi-Agent AI",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
