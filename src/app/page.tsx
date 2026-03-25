"use client";
import { useEffect, useState, useMemo } from "react";
import { Birthday, BirthdayFormData, UpcomingBirthday } from "@/types";
import { MONTHS, daysUntilBirthday, isToday, calcAge } from "@/lib/helpers";
import BirthdayBanner from "@/components/BirthdayBanner";
import BirthdayCard   from "@/components/BirthdayCard";
import BirthdayModal  from "@/components/BirthdayModal";
import PushButton     from "@/components/PushButton";

function useServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
  }, []);
}

export default function Home() {
  useServiceWorker();

  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterMonth, setFilterMonth] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<Birthday | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);

  const currentMonth = new Date().getMonth() + 1; // 1-12

  const fetchBirthdays = async () => {
    const res  = await fetch("/api/birthdays");
    const data = await res.json();
    setBirthdays(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchBirthdays(); }, []);

  // ── HOY ─────────────────────────────────────────────────
  const todayBirthdays: UpcomingBirthday[] = useMemo(() => {
    return birthdays
      .filter(b => isToday(b.day, b.month))
      .map(b => ({ ...b, age: calcAge(b.year), days_until: 0 }));
  }, [birthdays]);

  // ── PRÓXIMOS 7 días (excluye hoy) ───────────────────────
  const upcoming: UpcomingBirthday[] = useMemo(() => {
    return birthdays
      .filter(b => !isToday(b.day, b.month))
      .map(b => ({ ...b, age: calcAge(b.year), days_until: daysUntilBirthday(b.day, b.month) }))
      .filter(b => b.days_until <= 7 && b.days_until > 0)
      .sort((a, b) => a.days_until - b.days_until);
  }, [birthdays]);

  // ── TODOS — orden: mes actual primero, luego resto ───────
  const sorted = useMemo(() => {
    const withDays = birthdays.map(b => ({
      ...b,
      _days: daysUntilBirthday(b.day, b.month),
    }));
    // Ordenar por días hasta el próximo cumpleaños (el más cercano primero)
    return withDays.sort((a, b) => a._days - b._days);
  }, [birthdays]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sorted.filter(b => {
      const matchSearch = !q || b.name.toLowerCase().includes(q) || (b.note ?? "").toLowerCase().includes(q);
      const matchMonth  = !filterMonth || b.month === filterMonth;
      return matchSearch && matchMonth;
    });
  }, [sorted, search, filterMonth]);

  // ── CRUD ─────────────────────────────────────────────────
  const handleSave = async (data: BirthdayFormData) => {
    if (editing) {
      await fetch(`/api/birthdays/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/birthdays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    await fetchBirthdays();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este cumpleaños?")) return;
    setDeleting(id);
    await fetch(`/api/birthdays/${id}`, { method: "DELETE" });
    await fetchBirthdays();
    setDeleting(null);
  };

  const openAdd  = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (b: Birthday) => { setEditing(b); setModalOpen(true); };

  return (
    <div className="app">

      {/* ── HEADER ── */}
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <h1 className="logo">🎂 <span>Cumpleaños</span></h1>
          </div>
          <div className="header-right">
            <PushButton />
            <button className="btn-add" onClick={openAdd}>＋ Agregar</button>
          </div>
        </div>
      </header>

      <main className="main">

        {/* ── SECCIÓN: HOY ── */}
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Hoy</h2>
            <span className="section-count">{todayBirthdays.length}</span>
          </div>
          {loading ? (
            <div className="skeleton-row">
              {[...Array(2)].map((_, i) => <div key={i} className="skeleton-card-lg" style={{ animationDelay: `${i * 100}ms` }} />)}
            </div>
          ) : todayBirthdays.length === 0 ? (
            <p className="no-today">Sin cumpleaños hoy 🎈</p>
          ) : (
            <div className="today-grid">
              {todayBirthdays.map((b, i) => (
                <div key={b.id} className="today-card" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="today-date">
                    <span className="today-num">{String(b.day).padStart(2, "0")}</span>
                    <span className="today-mon">{MONTHS[b.month].slice(0, 3).toUpperCase()}</span>
                  </div>
                  <div className="today-info">
                    <p className="today-name">{b.name}</p>
                    {b.note && <p className="today-note">{b.note}</p>}
                    {b.age !== null && <p className="today-age">🎉 {b.age} años</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── SECCIÓN: PRÓXIMOS 7 DÍAS ── */}
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Próximos 7 días</h2>
            <span className="section-count">{upcoming.length}</span>
          </div>
          {loading ? (
            <div className="skeleton-row">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 100}ms` }} />)}
            </div>
          ) : (
            <BirthdayBanner items={upcoming} />
          )}
        </section>

        {/* ── SECCIÓN: TODOS ── */}
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Todos</h2>
            <span className="section-count">{filtered.length}</span>
          </div>

          {/* Filtros */}
          <div className="filters">
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                className="search"
                placeholder="Buscar por nombre o nota…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="search-clear" onClick={() => setSearch("")}>✕</button>}
            </div>
            <select
              className="filter-month"
              value={filterMonth}
              onChange={e => setFilterMonth(Number(e.target.value))}
            >
              <option value={0}>Todos los meses</option>
              {/* Orden desde mes actual */}
              {Array.from({ length: 12 }, (_, i) => {
                const m = ((currentMonth - 1 + i) % 12) + 1;
                return <option key={m} value={m}>{MONTHS[m]}</option>;
              })}
            </select>
          </div>

          {/* Lista — solo muestra resultados cuando hay búsqueda o filtro */}
          {!search && !filterMonth ? (
            <div className="empty">
              <p>Escribe un nombre o elige un mes para buscar</p>
            </div>
          ) : loading ? (
            <div className="list">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-item" style={{ animationDelay: `${i * 60}ms` }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <p>Sin resultados para este filtro</p>
            </div>
          ) : (
            <div className="list">
              {filtered.map((b, i) => (
                <BirthdayCard
                  key={b.id}
                  birthday={b}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  style={{
                    animationDelay: `${Math.min(i, 20) * 35}ms`,
                    opacity: deleting === b.id ? 0.4 : 1,
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <BirthdayModal
        open={modalOpen}
        initial={editing}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
      />

      <style jsx>{`
        .app { min-height: 100vh; }

        /* Header */
        .header {
          position: sticky; top: 0; z-index: 50;
          background: var(--bg)ee;
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
        }
        .header-inner {
          max-width: 900px; margin: 0 auto;
          padding: 14px 24px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .header-left { display: flex; align-items: center; gap: 12px; }
        .header-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
        .logo {
          font-family: 'DM Serif Display', serif;
          font-size: 20px; font-weight: 400;
          display: flex; align-items: center; gap: 8px;
        }
        .btn-add {
          background: var(--accent); color: white; border: none;
          border-radius: var(--radius-sm);
          padding: 8px 18px; font-size: 13px; font-weight: 600;
          transition: opacity var(--transition); white-space: nowrap;
        }
        .btn-add:hover { opacity: .88; }

        /* Main */
        .main { max-width: 900px; margin: 0 auto; padding: 32px 24px 80px; display: flex; flex-direction: column; gap: 40px; }

        /* Section */
        .section { display: flex; flex-direction: column; gap: 14px; }
        .section-head { display: flex; align-items: center; gap: 10px; }
        .section-title { font-family: 'DM Serif Display', serif; font-size: 22px; font-weight: 400; }
        .section-count {
          font-size: 12px; font-weight: 600; color: var(--muted);
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 99px; padding: 2px 9px;
        }

        /* HOY */
        .no-today { font-size: 13px; color: var(--muted); padding: 8px 0; }
        .today-grid { display: flex; gap: 12px; flex-wrap: wrap; }
        .today-card {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 20px;
          background: var(--surface); border: 1px solid var(--accent);
          border-radius: var(--radius);
          min-width: 200px; flex: 1;
          animation: fadeUp .3s ease both;
          background: var(--accent-dim);
        }
        .today-date { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
        .today-num { font-family: 'DM Serif Display', serif; font-size: 30px; line-height: 1; color: var(--accent); }
        .today-mon { font-size: 9px; font-weight: 700; letter-spacing: .1em; color: var(--text2); margin-top: 2px; }
        .today-info { min-width: 0; flex: 1; }
        .today-name { font-size: 15px; font-weight: 500; }
        .today-note { font-size: 12px; color: var(--text2); margin-top: 2px; }
        .today-age  { font-size: 12px; color: var(--accent); margin-top: 6px; font-weight: 600; }

        /* Filters */
        .filters { display: flex; gap: 10px; flex-wrap: wrap; }
        .search-wrap { flex: 1; min-width: 200px; position: relative; display: flex; align-items: center; }
        .search-icon { position: absolute; left: 12px; font-size: 13px; pointer-events: none; }
        .search {
          width: 100%;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-sm); color: var(--text);
          padding: 9px 36px 9px 34px; font-size: 13px;
          transition: border-color var(--transition);
        }
        .search:focus { outline: none; border-color: var(--accent); }
        .search::placeholder { color: var(--muted); }
        .search-clear { position: absolute; right: 10px; background: none; border: none; color: var(--muted); font-size: 12px; padding: 2px 4px; }
        .filter-month {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-sm); color: var(--text);
          padding: 9px 14px; font-size: 13px; appearance: none;
          transition: border-color var(--transition); white-space: nowrap;
        }
        .filter-month:focus { outline: none; border-color: var(--accent); }

        /* List */
        .list { display: flex; flex-direction: column; gap: 8px; }

        /* Empty */
        .empty { text-align: center; padding: 48px 24px; color: var(--muted); font-size: 14px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .empty-cta { background: none; border: 1px dashed var(--border); color: var(--text2); border-radius: var(--radius-sm); padding: 8px 20px; font-size: 13px; transition: border-color var(--transition), color var(--transition); }
        .empty-cta:hover { border-color: var(--accent); color: var(--accent); }

        /* Skeletons */
        .skeleton-row { display: flex; gap: 12px; overflow: hidden; }
        .skeleton-card-lg { flex-shrink: 0; width: 200px; height: 80px; background: var(--surface); border-radius: var(--radius); animation: pulse 1.4s ease infinite; }
        .skeleton-card    { flex-shrink: 0; flex: 1; height: 68px; background: var(--surface); border-radius: var(--radius); animation: pulse 1.4s ease infinite; }
        .skeleton-item    { height: 62px; border-radius: var(--radius); background: var(--surface); animation: pulse 1.4s ease infinite; }

        @media (max-width: 600px) {
          .header-inner { padding: 12px 16px; }
          .main { padding: 24px 16px 60px; }
          .today-grid { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}