# UTR Nexus Labs — Web

Sistema de Control de Laboratorios de Cómputo de la Universidad Tecnológica El Retoño (UTR).

## Stack

- React 19 + Vite 8
- React Router 7
- axios

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_API_BASE_URL` | URL base de la API (incluye `/api`) |
| `VITE_API_APP_TOKEN` | Token de aplicación (header `x-api-token`) |

## Ramas

- `main`: versión entregable
- `develop`: integración
- `feature/*` y `fix/*`: se crean desde `develop` y se integran por Pull Request
