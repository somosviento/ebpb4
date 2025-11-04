from fastapi import APIRouter, HTTPException, status
from schemas.auth import LoginRequest, LoginResponse
from core.config import get_settings
import os

router = APIRouter(tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest):
    """
    Endpoint de login para administrador.
    Usuario: admin
    Contraseña: configurada en ADMIN_TOKEN (default: 1234)
    """
    settings = get_settings()
    admin_password = os.getenv("ADMIN_TOKEN") or settings.admin_token or "1234"
    
    if credentials.username != "admin" or credentials.password != admin_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )
    
    # Devolver el token (que es la misma contraseña en este caso simple)
    return LoginResponse(token=admin_password)
