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
