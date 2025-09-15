# Taskly Frontend (Vite)

## Cómo correr en local
1. Requisitos: Node 18+
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Crea `.env` en la raíz (o usa el que ya viene). Puedes dejar varias URLs separadas por coma:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api/v1,https://TU-BACK.render.com/api/v1
   VITE_APP_NAME=Taskly
   ```
   El frontend tomará **la primera** si corres en `npm run dev`, y **la última** si haces build/producción.
4. Ejecuta en desarrollo:
   ```bash
   npm run dev
   ```
   Abre `http://localhost:5173`.

## Funcionalidades Sprint 1
- Menú superior (Tasks, Login, Register, Recover, Logout)
- Vistas `home` (registro), `login` (inicio de sesión), `recover` (recuperación simulada), `board` (placeholder)
- Llamadas HTTP usando `fetch` y variables de entorno
- Router con hash: `#/home`, `#/login`, `#/recover`, `#/board`

## Archivos tocados
- `src/api/http.js` → Soporta `.env` con múltiples URLs separadas por coma y maneja errores de red.
- `src/routes/route.js` → Router reescrito: usa `import.meta.glob(..., { query: '?raw', import: 'default' })` para Vite 7. Inicializa cada vista y maneja Logout.
- `src/views/login.html` → Ahora es un formulario de login real (email + password).
