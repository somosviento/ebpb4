from fastapi import APIRouter

from .endpoints import solicitudes, reservas, admin, auth

api_router = APIRouter()
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(solicitudes.router, prefix="/solicitudes", tags=["solicitudes"])
api_router.include_router(reservas.router, prefix="/reservas", tags=["reservas"])
api_router.include_router(admin.router)
