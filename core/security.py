from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from core.config import get_settings
import os

bearer_scheme = HTTPBearer(auto_error=False)


def admin_required(creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)):
    settings = get_settings()
    # Prefer environment variable to allow tests and runtime overrides, fallback to settings
    configured_token = os.getenv("ADMIN_TOKEN") or settings.admin_token
    if not configured_token:
        # Treat as unauthorized when no token configured to avoid 500s in tests/envs
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autorizado")
    if creds is None or creds.credentials != configured_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autorizado")
    return True
