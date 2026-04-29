from fastapi import APIRouter,Depends
from app.routes.auth_routes import require_admin
from app.models import User

router = APIRouter(prefix="/documents",tags=["documents"])

@router.get("/admin-check")
def admin_check(current_user: User = Depends(require_admin)):
    return{
        "message": "Admin access confirmed",
        "username": current_user.username,
        "role": current_user.role
    }