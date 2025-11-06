from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.root_path import RootPathMiddleware
import os
from pathlib import Path

from core.config import get_settings
from api import api_router
from database import engine
from models import base  # noqa: F401  # ensure models Base is imported

settings = get_settings()

# If the app is served behind a reverse proxy at a path (e.g. /ebpb),
# read from settings (env .env) or fallback to OS env var
root_path = (settings.root_path or os.environ.get('ROOT_PATH') or '').strip()

# Create FastAPI app; when behind a proxy that rewrites path, RootPathMiddleware
# will ensure URL generation and OpenAPI reflect the mounted path.
app = FastAPI(title="EBPB Reservas API", version="0.1.0")
if root_path:
    # Starlette's RootPathMiddleware updates request.scope['root_path']
    app.add_middleware(RootPathMiddleware, root_path=root_path)

# CORS (tune as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers under configured prefix
app.include_router(api_router, prefix=settings.api_prefix)


@app.on_event("startup")
async def startup_event():
    # Import models to register mappings, then create tables if not present (simple dev setup)
    from models import solicitudes, participantes, reservas  # noqa: F401
    base.Base.metadata.create_all(bind=engine)

    # Optionally export OpenAPI schema at startup
    if settings.export_openapi:
        openapi_path = Path(__file__).resolve().parent / "openapi.json"
        # Generate schema dict and write JSON
        schema = app.openapi()
        import json

        with openapi_path.open("w", encoding="utf-8") as f:
            json.dump(schema, f, ensure_ascii=False, indent=2)
