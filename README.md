# 🎂 Birthday Tracker

Aplicación personal para gestionar cumpleaños con notificaciones push automáticas. Desplegada en Vercel con base de datos en Supabase.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend + API | Next.js 14 (App Router) |
| Base de datos | Supabase (PostgreSQL) |
| Notificaciones | Web Push API + VAPID |
| Deploy | Vercel (Hobby) |
| Runtime | Node.js 20.x |

## Funcionalidades

- 🎉 Sección **Hoy** — cumpleaños del día destacados
- 📅 Sección **Próximos 7 días** — swipe horizontal con 3 cards visibles
- 🔍 Sección **Todos** — búsqueda por nombre/nota y filtro por mes
- ➕ Agregar, editar y eliminar cumpleaños
- 🎂 Edad calculada automáticamente si se conoce el año
- 🔔 Notificaciones push diarias a las 8:00am (Lima, UTC-5) vía Vercel Cron
- 📥 Script de migración desde Excel (.xlsx)

## Dependencias principales

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.43.4",
    "next": "14.2.3",
    "react": "^18",
    "web-push": "^3.6.7",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "dotenv": "^16.4.5",
    "tsx": "^4.11.0",
    "typescript": "^5"
  }
}
```

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

```bash
cp .env.example .env.local
```

Completa `.env.local` con tus valores:

| Variable | Dónde obtenerla |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | `npx web-push generate-vapid-keys` |
| `VAPID_EMAIL` | `mailto:tu@email.com` |

### 4. Correr en desarrollo

```bash
npm run dev
# → http://localhost:3000
```

## Base de datos

Corre `schema.sql` en **Supabase → SQL Editor → New query**:

```bash
# El archivo está en la raíz del proyecto
schema.sql
```

Crea las tablas `birthdays` y `push_subscriptions`, índices y la función `upcoming_birthdays()`.

## Importación desde Excel

```bash
# 1. Coloca el archivo en la raíz del proyecto
cp /ruta/a/Cumpleaños.xlsx .

# 2. Ejecuta el script
npm run import-excel
```

El script parsea nombres con notas entre paréntesis, convierte meses en español a números, trata `Año = 0` como `NULL` e inserta en lotes de 50.

## Estructura del proyecto

```
birthday-tracker/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── birthdays/route.ts        → GET + POST
│   │   │   ├── birthdays/[id]/route.ts   → PUT + DELETE
│   │   │   └── push/
│   │   │       ├── subscribe/route.ts    → Registrar suscripción
│   │   │       └── cron/route.ts         → Cron diario 8am Lima
│   │   ├── globals.css                   → Design system + variables
│   │   ├── layout.tsx
│   │   └── page.tsx                      → UI principal
│   ├── components/
│   │   ├── BirthdayBanner.tsx            → Próximos 7 días (swipe)
│   │   ├── BirthdayCard.tsx              → Card individual
│   │   ├── BirthdayModal.tsx             → Modal agregar/editar
│   │   └── PushButton.tsx                → Suscripción push
│   ├── lib/
│   │   ├── supabase.ts                   → Clientes lazy (public + admin)
│   │   └── helpers.ts                    → formatBirthday, calcAge, isToday
│   └── types/index.ts                    → Birthday, UpcomingBirthday...
├── public/
│   └── sw.js                             → Service Worker push
├── scripts/
│   └── import-excel.ts                   → Migración desde Excel
├── schema.sql                            → SQL para Supabase
├── vercel.json                           → Cron: 0 13 * * * (8am Lima)
├── .env.example                          → Variables requeridas
└── package.json
```

## Deploy en Vercel

1. Conectar el repositorio en [vercel.com](https://vercel.com)
2. **Framework Preset → Next.js**
3. **Node.js Version → 20.x**
4. Agregar las 6 variables de entorno en **Settings → Environment Variables**
5. El deploy es automático en cada push a `main`

## Notas técnicas

- Los clientes de Supabase se inicializan de forma **lazy** para evitar errores en build time
- Todas las API routes usan `export const dynamic = "force-dynamic"`
- El campo `year` se almacena como `NULL` cuando no se conoce; la edad se calcula en runtime
- El cron de Vercel dispara a las `13:00 UTC` = `08:00 AM Lima (UTC-5)`

## Licencia

MIT