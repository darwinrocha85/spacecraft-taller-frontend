# spacecraft-taller-frontend — AGENTS.md

> Proyecto independiente. Abrir opencode con cwd en `spacecraft-taller-frontend/`, nunca en `Projects/`.
> Stack: React 18.3 + Vite 5 + Axios. App del personal del taller (NO aprueba ni cobra).

## Cómo correr
- `npm.cmd install`, copiar `.env.example` a `.env`, `npm.cmd run dev` → `:5175` (sin colisiones)
- Local: flota `http://localhost:8080/api` + taller `http://localhost:8001/api`
- Sin `run-*.ps1` en este repo. Su asistente IA vive en `spacecraftSystem-frontend/functions`
  (emulador compartido con el admin): sin ese emulador corriendo, el chat del taller no responde.

## Contrato API
- `VITE_API_URL` + `VITE_TALLER_API_URL` por env; en prod fallback a
  `spacecraftsystem.onrender.com/api` y `spacecraft-taller-backend.onrender.com/api`.
- Recepción, sub-estados y presupuestos con stock. Aprobar/cobrar = solo admin.

## Deploy
- Proyecto Firebase propio `spacecraft-taller-frontend` (NO es target de `spacecraft-system`):
  `npm.cmd run build` + `firebase.cmd deploy --only hosting`

## No hacer
- No hardcodear URLs. No commitear `.env`, `node_modules/`, `dist/`, `.firebase/`.
- No agregar aprobación de presupuestos ni cobros aquí.
