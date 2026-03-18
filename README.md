# 🎂 Birthday Tracker

Aplicación personal para gestionar cumpleaños con notificaciones push automáticas.

## Stack

- **Frontend + API:** Next.js 14 (App Router)
- **Base de datos:** Supabase (PostgreSQL)
- **Notificaciones:** Web Push API + VAPID
- **Deploy:** Vercel

## Funcionalidades

- 🎉 Banner con cumpleaños de hoy y próximos 7 días
- 📋 Lista completa con edad calculada automáticamente
- ➕ Agregar, editar y eliminar cumpleaños
- 🔔 Notificaciones push diarias vía Vercel Cron
- 📥 Importación desde Excel (.xlsx)

## Configuración local

### 1. Clonar el repositorio

```bash
git clone https://github.com/FranciscoML/birthday-tracker.git
cd birthday-tracker
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Variables de entorno

Copia `.env.example` a `.env.local` y completa los valores:

```bash
cp .env.example .env.local
```

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto en Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (solo server-side) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Clave pública VAPID para Web Push |
| `VAPID_PRIVATE_KEY` | Clave privada VAPID |
| `VAPID_EMAIL` | Email de contacto para el servidor push |

Generar claves VAPID:

```bash
npx web-push generate-vapid-keys
```

### 4. Correr en desarrollo

```bash
npm run dev
```

## Deploy en Vercel

1. Conectar el repositorio en [vercel.com](https://vercel.com)
2. Agregar las variables de entorno en **Settings → Environment Variables**
3. El deploy es automático en cada push a `main`

## Base de datos

Correr el archivo `schema.sql` en el **SQL Editor** de Supabase para crear las tablas necesarias.

## Estructura del proyecto

```bash
birthday-tracker/
├── app/
│   ├── api/
│   │   ├── birthdays/      # CRUD endpoints
│   │   └── push/           # Web Push endpoints
│   ├── components/         # Componentes React
│   └── page.tsx            # Página principal
├── public/
│   └── sw.js               # Service Worker
├── lib/
│   └── supabase.ts         # Cliente Supabase
├── schema.sql              # SQL para Supabase
├── scripts/
│   └── import-excel.ts     # Migración desde Excel
├── .env.example
└── .gitignore
```

## Licencia

MIT
