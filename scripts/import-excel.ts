/**
 * Birthday Tracker — Script de importación
 * Migra Cumpleaños.xlsx → Supabase (tabla: birthdays)
 *
 * Uso:
 *   1. Coloca Cumpleaños.xlsx en la raíz del proyecto
 *   2. npm run import-excel
 */

import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// ── Validar variables de entorno ──────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ── Mapa de meses en español → número ────────────────────
const MONTHS: Record<string, number> = {
  Enero: 1,   Febrero: 2,  Marzo: 3,     Abril: 4,
  Mayo: 5,    Junio: 6,    Julio: 7,     Agosto: 8,
  Septiembre: 9, Setiembre: 9, Octubre: 10, Noviembre: 11,
  Diciembre: 12,
};

// ── Tipos ─────────────────────────────────────────────────
interface ExcelRow {
  Nombre: string;
  Día:    number;
  Mes:    string;
  Año:    number;
  Edad:   number;
}

interface BirthdayInsert {
  name:  string;
  note:  string | null;
  day:   number;
  month: number;
  year:  number | null;
}

// ── Parsear nombre y nota ─────────────────────────────────
function parseName(raw: string): { name: string; note: string | null } {
  const match = raw.match(/\((.+?)\)/);
  const note  = match ? match[1].trim() : null;
  const name  = raw.replace(/\s*\(.+?\)/, "").trim();
  return { name, note };
}

// ── Main ──────────────────────────────────────────────────
async function main() {
  const excelPath = path.resolve(process.cwd(), "Cumpleaños.xlsx");

  if (!fs.existsSync(excelPath)) {
    console.error(`❌ No se encontró el archivo: ${excelPath}`);
    console.error("   Coloca Cumpleaños.xlsx en la raíz del proyecto.");
    process.exit(1);
  }

  console.log("📂 Leyendo Excel...");
  const workbook  = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const rows: ExcelRow[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  console.log(`   ${rows.length} filas encontradas en "${sheetName}"`);

  // ── Transformar filas ────────────────────────────────────
  const records: BirthdayInsert[] = [];
  const skipped: string[] = [];

  for (const row of rows) {
    const nameRaw = String(row["Nombre"] ?? "").trim();
    const mesRaw  = String(row["Mes"]    ?? "").trim();
    const day     = Number(row["Día"]);
    const yearRaw = Number(row["Año"]);

    if (!nameRaw) { skipped.push("Fila sin nombre — omitida"); continue; }

    const month = MONTHS[mesRaw];
    if (!month) { skipped.push(`"${nameRaw}" — mes desconocido: "${mesRaw}"`); continue; }

    if (!day || day < 1 || day > 31) { skipped.push(`"${nameRaw}" — día inválido: ${day}`); continue; }

    const { name, note } = parseName(nameRaw);
    const year = yearRaw > 0 ? yearRaw : null;

    records.push({ name, note, day, month, year });
  }

  console.log(`\n✅ Registros válidos:  ${records.length}`);
  console.log(`⚠️  Registros omitidos: ${skipped.length}`);
  if (skipped.length > 0) skipped.forEach((s) => console.log(`   • ${s}`));

  console.log("\n📋 Preview (primeros 5):");
  records.slice(0, 5).forEach((r) => {
    console.log(`   ${r.name} | nota: ${r.note ?? "—"} | ${r.day}/${r.month} | ${r.year ?? "sin año"}`);
  });

  console.log(`\n¿Insertar ${records.length} registros en Supabase? (Ctrl+C para cancelar)`);
  console.log("Esperando 3 segundos...");
  await new Promise((r) => setTimeout(r, 3000));

  // ── Insertar en lotes de 50 ──────────────────────────────
  const BATCH = 50;
  let inserted = 0;

  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const { error } = await supabase.from("birthdays").insert(batch);

    if (error) {
      console.error(`\n❌ Error en lote ${i / BATCH + 1}: ${error.message}`);
      process.exit(1);
    }

    inserted += batch.length;
    process.stdout.write(`\r   Insertados: ${inserted}/${records.length}`);
  }

  console.log("\n\n🎂 Importación completada exitosamente.");
  console.log(`   ${inserted} cumpleaños importados a Supabase.`);
}

main().catch((err) => {
  console.error("❌ Error inesperado:", err);
  process.exit(1);
});