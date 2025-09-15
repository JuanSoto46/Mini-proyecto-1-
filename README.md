# Taskly Backend (Express 5 + Mongoose)

## Requisitos
- Node 18+
- MongoDB Atlas o instancia local

## Configuración
Crea un archivo `.env` en la raíz (ya hay uno de ejemplo). Campos mínimos:
```env
PORT=3000
MONGO_URI=<<TU CADENA DE CONEXIÓN>>
JWT_SECRET=un_secreto_largo_mejor_si_es_aleatorio
CORS_ORIGINS=http://localhost:5173,https://TU-FRONT.vercel.app
```

## Ejecutar
```bash
npm install
npm run dev
# o
npm start
```

## Endpoints base
La API se monta en `/api/v1`:
- `POST /api/v1/auth/register` body `{ firstName, lastName, age, email, password }`
- `POST /api/v1/auth/login` body `{ email, password }` → `{ token }`
- `POST /api/v1/auth/forgot-password` body `{ email }` → `{ ok: true }` (simulado en Sprint 1)

## Notas importantes
- Express 5 usa `path-to-regexp@^6`. Evita usar rutas con `*` sin patrón. Si necesitas un catch-all usa `"(.*)"`.
- CORS: edita `CORS_ORIGINS` para incluir exactamente los orígenes de tu frontend.
