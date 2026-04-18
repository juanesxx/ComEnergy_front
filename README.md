# EnergiConecta Frontend (React + Vite)

Frontend conectado al backend Node.js/Express por HTTP.

## Requisitos
1. Node.js 18+
2. Backend ejecutándose en `http://localhost:3000` (o la URL que configures)

## Configuración
1. Copia `frontend/.env.example` a `frontend/.env`.
2. Ajusta la URL de API si es necesario:

```bash
VITE_API_URL=http://localhost:3000
```

## Ejecutar localmente
1. `npm install`
2. `npm run dev`
3. Abre la URL que indique Vite (normalmente `http://localhost:5173`)

## Flujo conectado
1. Registro: `POST /accounts/users`
2. Login: `POST /accounts/login`
3. Refresh de sesión: `POST /accounts/refresh` (cookie `refresh_token`)
4. Logout: `POST /accounts/logout`
5. Catálogo de servicios: `GET /services` y `GET /company-services?serviceId=<id>`
6. Crear servicio global (rol ADMIN): `POST /services` con cuerpo JSON `{ title, summary, detail, imageUrl? }` y cabecera `Authorization: Bearer <token>`
7. Ofrecer un servicio como empresa (rol SELLER): `POST /company-services` con `{ serviceId }` y el mismo esquema de autorización
