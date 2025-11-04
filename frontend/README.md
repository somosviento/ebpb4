# EBPB4 Frontend

SPA React + Vite para la gestión de solicitudes y reservas.

## Tech Stack
- React 18 + TypeScript + Vite
- React Router v6
- Context API (Auth / Notifications)
- Fetch wrapper propio (retry GET 5xx, parse 422, ApiError)
- Vitest + React Testing Library

## Flujos Principales
### Autenticación
- Token almacenado en localStorage (`token`).
- Logout automático en 401 (interceptor global) con preservación de la ruta en `sessionStorage.postLoginRedirect`.

### Solicitudes
1. Crear (Investigación / Cátedras)
2. Validación frontend (requeridos, fechas, email, duplicados en reservas)
3. POST -> redirección al detalle
4. Persistencia de última solicitud visitada en localStorage (`lastSolicitudId` / `lastSolicitudTipo`).

### Detalle de Solicitud
- Muestra participantes embebidos con sus reservas.
- Acciones Admin (si hay token): agregar participante, CRUD de reservas.

### Disponibilidad
- Consulta GET `/api/reservas/disponibilidad/{fecha}`.

### Notificaciones
- `NotificationCenter` con `aria-live`.
- Tipos: success / error.

## Generación de Tipos desde OpenAPI
Scripts:
```bash
npm run gen:types         # Genera src/generated-types.ts
npm run gen:openapi-hash  # Registra hash (src/openapi-hash.json) para detección de cambios
```
Banner en la app avisa si el hash cambió respecto a localStorage.

## Añadir Nuevos Endpoints
1. Actualizar backend y regenerar `openapi.json`.
2. Ejecutar scripts de tipos y hash.
3. Crear hook o función API en `src/api/` (usar `useApiClient().request`).
4. Añadir modelos si aplica (o consumir los generados).
5. Añadir test si es lógica relevante.

## Wrapper HTTP
Características:
- Inyección de Authorization si hay token.
- Reintento automático (solo GET, status 5xx, límite configurable con `retry`).
- Parse JSON condicional por content-type.
- Errores 422 -> `ApiError.validation` (map loc -> campo plano).

## Tests
Ejecutar:
```bash
npm test
npm run test:watch
```
Cobertura (opcional):
```bash
npx vitest run --coverage
```

## Accesibilidad
- Campos con `aria-invalid` + `aria-describedby`.
- Primer error enfocado tras validar.
- Notificaciones con `role="status"` / `aria-live`.

## Estructura de Código
```
src/
  api/        # http wrapper y cliente
  components/ # UI reutilizable (forms, layout, notificaciones)
  context/    # Auth / Notifications
  hooks/      # Lógica derivada (detalle, admin, etc.)
  pages/      # Vistas de routing
  test/       # Pruebas
  utils/      # helpers (storage, validation)
  generated-types.ts # autogenerado
  openapi-hash.json  # hash actual del esquema
```

## Validación Frontend
Archivo: `src/utils/validateSolicitud.ts`.
- Requeridos principales
- Fechas (inicio <= fin)
- Email básico
- Duplicados de fecha en reservas detalladas

## Scripts Disponibles
```bash
npm run dev              # Dev server
npm run build            # Build producción
npm run preview          # Previsualizar build
npm run gen:types        # Generar tipos
npm run gen:openapi-hash # Actualizar hash OpenAPI
npm test                 # Ejecutar tests
npm run test:watch       # Watch mode
```

## Próximos Pasos (Sugeridos)
- Añadir pruebas de integración para flujo completo de creación -> detalle.
- Endpoint de búsqueda/listado de solicitudes (paginación) si se amplía el dominio.
- Manejo de refresh de token (si se implementa backend).
- Internacionalización (i18n) si se requiere multi-idioma.

---
**Nota**: `generated-types.ts` no debe editarse manualmente.
# EBPB4 Frontend

Este proyecto es un frontend mínimo (sin estilos) creado con React + Vite y TypeScript para interactuar con la API de reservas. El login es mediante un token de administrador (Bearer) que se guarda localmente.

## Desarrollo

1. Instalar dependencias
2. Ejecutar el servidor de desarrollo
3. Backend: levantar FastAPI en `http://localhost:8000`

La app usa un proxy de Vite para `/api` hacia `http://localhost:8000`.

## Flujo de Login

No hay endpoint de login. Ingresá el token de administrador configurado en el backend (variable `ADMIN_TOKEN`). Este token se persiste en `localStorage` y se usa en el header `Authorization`.

## Rutas

- `/login`: formulario para ingresar token.
- `/admin`: área protegida de ejemplo.

## TODO próximo

- Consumir endpoints reales del OpenAPI para listar/gestionar solicitudes, participantes y reservas.
