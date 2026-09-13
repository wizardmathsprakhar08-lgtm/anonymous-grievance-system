from app.routers.auth import router as auth_router
from app.routers.grievances import router as grievances_router
from app.routers.officer import router as officer_router
from app.routers.admin import router as admin_router

__all__ = ["auth_router", "grievances_router", "officer_router", "admin_router"]
