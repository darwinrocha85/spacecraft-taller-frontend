# spacecraft-taller-frontend

App para el personal del taller: confirma la recepción de una nave enviada a reparar, avanza
sus sub-estados, arma presupuestos (eligiendo repuestos del stock) y mantiene ese stock.
Incluye un asistente de chat con IA sobre los datos del taller. Aprobar o rechazar un
presupuesto y cobrarlo es responsabilidad del panel admin (dueño de la flota), no de esta app.

## Stack
React 18 + Vite 5, Axios, tema visual propio (acento ámbar).

## Cómo correr en local
```powershell
npm.cmd install
Copy-Item .env.example .env.development
npm.cmd run dev
```
Abre `http://localhost:5175`. Necesita `spacecraft-taller-backend` (8001) corriendo, y
`spacecraftSystem` (8080) para las herramientas compartidas del asistente.

## Variables de entorno
| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL de `spacecraftSystem` |
| `VITE_TALLER_API_URL` | URL de `spacecraft-taller-backend` |

El asistente vive en el proyecto aparte
[spacecraft-mcp](https://github.com/darwinrocha85/spacecraft-mcp) (Cloud Function
`askTaller`): este repo es solo frontend y lo llama por URL directa.

## Estado
Proyecto de Firebase propio (`spacecraft-taller-frontend`): `https://spacecraft-taller-frontend.web.app`.

## Build y deploy
```powershell
npm.cmd run build
firebase.cmd deploy --only hosting
```

## Repos relacionados
Backend: [spacecraft-taller-backend](https://github.com/darwinrocha85/spacecraft-taller-backend).
Lado dueño de flota:
[spacecraftSystem-frontend](https://github.com/darwinrocha85/spacecraftSystem-frontend).
IA: [spacecraft-mcp](https://github.com/darwinrocha85/spacecraft-mcp).
