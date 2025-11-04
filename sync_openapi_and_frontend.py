"""
Utilidad de desarrollo: exporta el OpenAPI (openapi.json) y sincroniza el frontend
generando tipos (src/generated-types.ts) y registrando el hash (src/openapi-hash.json).

Uso (PowerShell):
    .\.venv\Scripts\python.exe sync_openapi_and_frontend.py
"""
from __future__ import annotations

import subprocess
from pathlib import Path
import os
import sys

ROOT = Path(__file__).resolve().parent
FRONTEND = ROOT / "frontend"

def run(cmd: list[str], cwd: Path | None = None) -> int:
    print("$", " ".join(cmd), "(cwd=" + str(cwd or ROOT) + ")")
    # En Windows, npm es npm.cmd
    if os.name == "nt" and cmd and cmd[0] == "npm":
        cmd = ["npm.cmd", *cmd[1:]]
    return subprocess.call(cmd, cwd=str(cwd or ROOT), shell=False)

def main() -> int:
    # 1) Exportar OpenAPI
    code = run([sys.executable, str(ROOT / "openapi_export.py")])
    if code != 0:
        print("Fallo exportando OpenAPI", file=sys.stderr)
        return code

    # 2) Generar tipos en frontend
    code = run(["npm", "run", "gen:types"], cwd=FRONTEND)
    if code != 0:
        print("Fallo generando tipos en frontend", file=sys.stderr)
        return code

    # 3) Registrar hash OpenAPI en frontend
    code = run(["npm", "run", "gen:openapi-hash"], cwd=FRONTEND)
    if code != 0:
        print("Fallo registrando hash OpenAPI", file=sys.stderr)
        return code

    print("OpenAPI y frontend sincronizados correctamente.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
