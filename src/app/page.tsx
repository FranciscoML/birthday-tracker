"use client";
import { useEffect, useState, useMemo } from "react";
import { Birthday, BirthdayFormData, UpcomingBirthday } from "@/types";
import { MONTHS, daysUntilBirthday, isToday, calcAge } from "@/lib/helpers";
import BirthdayBanner from "@/components/BirthdayBanner";
import BirthdayCard   from "@/components/BirthdayCard";
import BirthdayModal  from "@/components/BirthdayModal";
import PushButton     from "@/components/PushButton";

// Register SW on mount
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
  const [filterMonth, setFilterMonth] = useState(0); // 0 = todos
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<Birthday | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);

  // ── Fetch ────────────────────────────────────────────────
  const fetchBirthdays = async () => {
    const res  = await fetch("/api/birthdays");
    const data = await res.json();
    setBirthdays(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchBirthdays(); }, []);

  // ── Upcoming (banner) ────────────────────────────────────
  const upcoming: UpcomingBirthday[] = useMemo(() => {
    return birthdays
      .map(b => ({
        ...b,
        age: calcAge(b.year),
        days_until: daysUntilBirthday(b.day, b.month),
      }))
      .filter(b => b.days_until <= 7)
      .sort((a, b) => a.days_until - b.days_until);
  }, [birthdays]);

  // ── Filtered list ────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return birthdays.filter(b => {
      const matchSearch = !q || b.name.toLowerCase().includes(q) || (b.note ?? "").toLowerCase().includes(q);
      const matchMonth  = !filterMonth || b.month === filterMonth;
      return matchSearch && matchMonth;
    });
  }, [birthdays, search, filterMonth]);

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

  // ── Today count ──────────────────────────────────────────
  const todayCount = upcoming.filter(b => b.days_until === 0).length;

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <h1 className="logo">🎂 <span>Cumpleaños</span></h1>
            {todayCount > 0 && (
              <span className="today-pill">{todayCount} hoy</span>
            )}
          </div>
          <div className="header-right">
            <PushButton />
            <button className="btn-add" onClick={openAdd}>＋ Agregar</button>
          </div>
        </div>
      </header>

      <main className="main">
        {/* ── Banner próximos ── */}
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Próximos 7 días</h2>
            <span className="section-count">{upcoming.length}</span>
          </div>
          {loading
            ? <div className="skeleton-row">{[...Array(3)].map((_, i) => <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 100}ms` }} />)}</div>
            : <BirthdayBanner items={upcoming} />
          }
        </section>

        {/* ── Lista completa ── */}
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
            <select className="filter-month" value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}>
              <option value={0}>Todos los meses</option>
              {Object.entries(MONTHS).map(([num, name]) => (
                <option key={num} value={num}>{name}</option>
              ))}
            </select>
          </div>

          {/* Lista */}
          {loading ? (
            <div className="list">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-item" style={{ animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <p>{search || filterMonth ? "Sin resultados para este filtro" : "No hay cumpleaños registrados"}</p>
              {!search && !filterMonth && <button className="empty-cta" onClick={openAdd}>Agregar el primero ＋</button>}
            </div>
          ) : (
            <div className="list">
              {filtered.map((b, i) => (
                <BirthdayCard
                  key={b.id}
                  birthday={b}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  style={{ animationDelay: `${Math.min(i, 20) * 40}ms`, opacity: deleting === b.id ? 0.4 : 1 }}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ── Modal ── */}
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
          background: var(--bg)dd;
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
        }
        .header-inner {
          max-width: 860px; margin: 0 auto;
          padding: 14px 24px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px;
        }
        .header-left { display: flex; align-items: center; gap: 12px; }
        .header-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }

        .logo {
          font-family: 'DM Serif Display', serif;
          font-size: 20px; font-weight: 400;
          display: flex; align-items: center; gap: 8px;
        }
        .logo span { color: var(--text); }

        .today-pill {
          font-size: 11px; font-weight: 600;
          background: var(--accent); color: white;
          border-radius: 99px; padding: 3px 10px;
          animation: pulse 2s ease infinite;
        }

        .btn-add {
          background: var(--accent); color: white;
          border: none; border-radius: var(--radius-sm);
          padding: 8px 18px; font-size: 13px; font-weight: 600;
          transition: opacity var(--transition);
          white-space: nowrap;
        }
        .btn-add:hover { opacity: .88; }

        /* Main */
        .main { max-width: 860px; margin: 0 auto; padding: 32px 24px 80px; display: flex; flex-direction: column; gap: 40px; }

        /* Section */
        .section { display: flex; flex-direction: column; gap: 16px; }
        .section-head { display: flex; align-items: center; gap: 10px; }
        .section-title { font-family: 'DM Serif Display', serif; font-size: 22px; font-weight: 400; }
        .section-count {
          font-size: 12px; font-weight: 600; color: var(--muted);
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 99px; padding: 2px 9px;
        }

        /* Filters */
        .filters { display: flex; gap: 10px; flex-wrap: wrap; }
        .search-wrap {
          flex: 1; min-width: 200px;
          position: relative; display: flex; align-items: center;
        }
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
        .search-clear {
          position: absolute; right: 10px;
          background: none; border: none; color: var(--muted);
          font-size: 12px; padding: 2px 4px;
        }
        .filter-month {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-sm); color: var(--text);
          padding: 9px 14px; font-size: 13px; appearance: none;
          transition: border-color var(--transition);
        }
        .filter-month:focus { outline: none; border-color: var(--accent); }

        /* List */
        .list { display: flex; flex-direction: column; gap: 8px; }

        /* Empty */
        .empty {
          text-align: center; padding: 48px 24px;
          color: var(--muted); font-size: 14px;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
        }
        .empty-cta {
          background: none; border: 1px dashed var(--border);
          color: var(--text2); border-radius: var(--radius-sm);
          padding: 8px 20px; font-size: 13px;
          transition: border-color var(--transition), color var(--transition);
        }
        .empty-cta:hover { border-color: var(--accent); color: var(--accent); }

        /* Skeletons */
        .skeleton-row { display: flex; gap: 12px; overflow: hidden; }
        .skeleton-card {
          flex-shrink: 0; width: 200px; height: 72px;
          background: var(--surface); border-radius: var(--radius);
          animation: pulse 1.4s ease infinite;
        }
        .skeleton-item {
          height: 62px; border-radius: var(--radius);
          background: var(--surface);
          animation: pulse 1.4s ease infinite;
        }

        /* Responsive */
        @media (max-width: 600px) {
          .header-inner { padding: 12px 16px; }
          .main { padding: 24px 16px 60px; }
          .logo { font-size: 18px; }
        }
      `}</style>
    </div>
  );
}
