#!/usr/bin/env bash
# =============================================================
# Birthday Tracker — Setup Script
# Ejecutar desde la raíz del proyecto: bash setup.sh
# =============================================================
set -e

echo "🎂 Birthday Tracker — Setup"
echo "============================"

# ── Carpetas ──────────────────────────────────────────────
echo "📁 Creando estructura de carpetas..."
mkdir -p src/app/api/birthdays/\[id\]
mkdir -p src/app/api/push/cron
mkdir -p src/app/api/push/subscribe
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/types
mkdir -p public
mkdir -p scripts

# ── package.json ──────────────────────────────────────────
echo "📦 Creando package.json..."
cat > package.json << 'EOF'
{
  "name": "birthday-tracker",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "import-excel": "npx tsx scripts/import-excel.ts"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.43.4",
    "next": "14.2.3",
    "react": "^18",
    "react-dom": "^18",
    "web-push": "^3.6.7",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/web-push": "^3.6.3",
    "tsx": "^4.11.0",
    "typescript": "^5"
  }
}
EOF

# ── next.config.mjs ───────────────────────────────────────
echo "⚙️  Creando next.config.mjs..."
cat > next.config.mjs << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
EOF

# ── tsconfig.json ─────────────────────────────────────────
echo "⚙️  Creando tsconfig.json..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# ── vercel.json ───────────────────────────────────────────
echo "⚙️  Creando vercel.json..."
cat > vercel.json << 'EOF'
{
  "crons": [
    {
      "path": "/api/push/cron",
      "schedule": "0 13 * * *"
    }
  ]
}
EOF

# ── src/types/index.ts ────────────────────────────────────
echo "🔷 Creando types..."
cat > src/types/index.ts << 'EOF'
export interface Birthday {
  id: string;
  name: string;
  note: string | null;
  day: number;
  month: number;
  year: number | null;
  created_at: string;
}

export interface UpcomingBirthday extends Birthday {
  age: number | null;
  days_until: number;
}

export interface PushSubscriptionRecord {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export type BirthdayFormData = {
  name: string;
  note: string;
  day: number;
  month: number;
  year: number | null;
};
EOF

# ── src/lib/supabase.ts ───────────────────────────────────
echo "🔷 Creando lib/supabase.ts..."
cat > src/lib/supabase.ts << 'EOF'
import { createClient } from "@supabase/supabase-js";

// Cliente público — para uso en componentes React (browser)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cliente admin — solo para API Routes y scripts server-side
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
EOF

# ── src/lib/helpers.ts ────────────────────────────────────
echo "🔷 Creando lib/helpers.ts..."
cat > src/lib/helpers.ts << 'EOF'
export const MONTHS: Record<number, string> = {
  1: "Enero",    2: "Febrero",   3: "Marzo",     4: "Abril",
  5: "Mayo",     6: "Junio",     7: "Julio",     8: "Agosto",
  9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre",
};

export function formatBirthday(day: number, month: number, year?: number | null): string {
  const base = `${day} de ${MONTHS[month]}`;
  return year ? `${base} de ${year}` : base;
}

export function calcAge(year: number | null): number | null {
  if (!year) return null;
  return new Date().getFullYear() - year;
}

export function daysUntilBirthday(day: number, month: number): number {
  const today = new Date();
  const thisYear = today.getFullYear();
  let next = new Date(thisYear, month - 1, day);
  if (next < today) next = new Date(thisYear + 1, month - 1, day);
  const diff = next.getTime() - today.setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isToday(day: number, month: number): boolean {
  const today = new Date();
  return today.getDate() === day && today.getMonth() + 1 === month;
}
EOF

# ── src/app/globals.css ───────────────────────────────────
echo "🎨 Creando globals.css..."
cat > src/app/globals.css << 'EOF'
:root {
  --bg:       #0f0f12;
  --surface:  #1a1a22;
  --border:   #2a2a38;
  --accent:   #f87c52;
  --accent-2: #f7c948;
  --text:     #f0ede8;
  --muted:    #7a7890;
  --radius:   12px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: inherit;
  min-height: 100vh;
}

button { cursor: pointer; }
EOF

# ── src/app/layout.tsx ────────────────────────────────────
echo "🔷 Creando layout.tsx..."
cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Birthday Tracker",
  description: "Gestiona tus cumpleaños con recordatorios automáticos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={geist.className}>{children}</body>
    </html>
  );
}
EOF

# ── src/app/page.tsx ──────────────────────────────────────
echo "🔷 Creando page.tsx..."
cat > src/app/page.tsx << 'EOF'
export default function Home() {
  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h1>🎂 Birthday Tracker</h1>
      <p style={{ marginTop: "1rem", color: "var(--muted)" }}>
        Scaffold listo — UI viene en el Paso 4
      </p>
    </main>
  );
}
EOF

# ── src/app/api/birthdays/route.ts ────────────────────────
echo "🔷 Creando API routes..."
cat > src/app/api/birthdays/route.ts << 'EOF'
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { BirthdayFormData } from "@/types";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("birthdays")
    .select("*")
    .order("month", { ascending: true })
    .order("day", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body: BirthdayFormData = await req.json();

  const { data, error } = await supabaseAdmin
    .from("birthdays")
    .insert({
      name: body.name.trim(),
      note: body.note?.trim() || null,
      day: body.day,
      month: body.month,
      year: body.year || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
EOF

# ── src/app/api/birthdays/[id]/route.ts ──────────────────
cat > "src/app/api/birthdays/[id]/route.ts" << 'EOF'
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { BirthdayFormData } from "@/types";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body: BirthdayFormData = await req.json();

  const { data, error } = await supabaseAdmin
    .from("birthdays")
    .update({
      name: body.name.trim(),
      note: body.note?.trim() || null,
      day: body.day,
      month: body.month,
      year: body.year || null,
    })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { error } = await supabaseAdmin
    .from("birthdays")
    .delete()
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
EOF

# ── src/app/api/push/subscribe/route.ts ──────────────────
cat > src/app/api/push/subscribe/route.ts << 'EOF'
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  const { endpoint, keys } = await req.json();

  const { error } = await supabaseAdmin
    .from("push_subscriptions")
    .upsert(
      { endpoint, p256dh: keys.p256dh, auth: keys.auth },
      { onConflict: "endpoint" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
EOF

# ── src/app/api/push/cron/route.ts ───────────────────────
cat > src/app/api/push/cron/route.ts << 'EOF'
import { NextResponse } from "next/server";
import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabase";
import { isToday } from "@/lib/helpers";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET() {
  const { data: birthdays } = await supabaseAdmin
    .from("birthdays")
    .select("name, day, month");

  const todaysBirthdays = (birthdays ?? []).filter((b) =>
    isToday(b.day, b.month)
  );

  if (todaysBirthdays.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const names = todaysBirthdays.map((b) => b.name).join(", ");
  const payload = JSON.stringify({
    title: "🎂 ¡Cumpleaños hoy!",
    body: names,
  });

  const { data: subs } = await supabaseAdmin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth");

  let sent = 0;
  for (const sub of subs ?? []) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      );
      sent++;
    } catch {
      await supabaseAdmin
        .from("push_subscriptions")
        .delete()
        .eq("endpoint", sub.endpoint);
    }
  }

  return NextResponse.json({ sent });
}
EOF

# ── public/sw.js ──────────────────────────────────────────
echo "🔷 Creando Service Worker..."
cat > public/sw.js << 'EOF'
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "🎂 Cumpleaños", {
      body: data.body ?? "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
EOF

# ── scripts/import-excel.ts ───────────────────────────────
echo "🔷 Creando scripts/import-excel.ts (placeholder)..."
cat > scripts/import-excel.ts << 'EOF'
// Paso 3 — Script de importación del Excel a Supabase
// Ejecutar con: npm run import-excel
// Requiere: .env.local configurado
EOF

# ── Instalar dependencias ─────────────────────────────────
echo ""
echo "📦 Instalando dependencias (npm install)..."
npm install

echo ""
echo "✅ Setup completo."
echo ""
echo "Próximo paso:"
echo "  npm run dev   → http://localhost:3000"
echo ""
