# EBpb4 - Desarrollo rápido

## Sincronizar OpenAPI y tipos del frontend

1. Exportar esquema y generar tipos/hash:
   - PowerShell (Windows):
     ```powershell
     .\.venv\Scripts\python.exe .\sync_openapi_and_frontend.py
     ```
   Esto genera/actualiza:
   - `openapi.json` (raíz)
   - `frontend/src/generated-types.ts`
   - `frontend/src/openapi-hash.json`

## Levantar entorno de desarrollo (back + front)

Opciones:
- VS Code Tasks: abrí la paleta (Ctrl+Shift+P) → “Run Task” → `dev: both`.
  - Lanza:
    - Backend en http://127.0.0.1:8000
    - Frontend en http://127.0.0.1:5173 (proxy a /api → 8000)
- Manual:
  ```powershell
  # Backend
  $env:ADMIN_TOKEN = "dev"
  .\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000

  # Frontend
  cd .\frontend
  npm run dev
  ```

## Generación de tipos (solo frontend)

```powershell
cd .\frontend
npm run gen:types
npm run gen:openapi-hash
```

## Tests

- Backend (pytest):
  ```powershell
  .\.venv\Scripts\python.exe -m pytest -q
  ```
- Frontend (Vitest):
  ```powershell
  cd .\frontend
  npm test
  ```

## Notas

- Si cambia el OpenAPI y no regenerás tipos, la app muestra un aviso en la parte superior (compara `openapi-hash.json` con `localStorage`).
- En desarrollo, mantené backend y Vite en los puertos indicados o actualizá `frontend/vite.config.ts`.
- Endpoints admin exigen Bearer token; definí `ADMIN_TOKEN` en el entorno.
