from pathlib import Path
import json

from main import app
from database import engine
from models import base  # noqa: F401
from models import solicitudes, participantes, reservas  # noqa: F401

# Ensure tables exist and app is initialized
base.Base.metadata.create_all(bind=engine)

output = Path(__file__).resolve().parent / "openapi.json"
output.write_text(json.dumps(app.openapi(), ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Wrote {output}")
