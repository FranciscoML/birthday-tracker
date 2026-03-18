"use client";
import { UpcomingBirthday } from "@/types";
import { MONTHS, isToday } from "@/lib/helpers";

interface Props { items: UpcomingBirthday[]; }

export default function BirthdayBanner({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="banner-empty">
        <span>Sin cumpleaños en los próximos 7 días 🎈</span>
        <style jsx>{`
          .banner-empty { padding: 20px 24px; color: var(--muted); font-size: 13px; text-align: center; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="banner">
      <div className="banner-track">
        {items.map((b, i) => {
          const today = isToday(b.day, b.month);
          return (
            <div key={b.id} className={`banner-item ${today ? "is-today" : ""}`} style={{ animationDelay: `${i * 60}ms` }}>
              <div className="banner-day">
                <span className="bd-num">{String(b.day).padStart(2, "0")}</span>
                <span className="bd-mon">{MONTHS[b.month].slice(0, 3).toUpperCase()}</span>
              </div>
              <div className="banner-info">
                <p className="banner-name">{b.name}</p>
                {b.note && <p className="banner-note">{b.note}</p>}
                <p className="banner-sub">
                  {today
                    ? `🎂 ¡Hoy!${b.age ? ` · ${b.age} años` : ""}`
                    : `en ${b.days_until} día${b.days_until !== 1 ? "s" : ""}${b.age ? ` · ${b.age + 1} años` : ""}`
                  }
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .banner { overflow-x: auto; padding: 4px 0 8px; scrollbar-width: thin; }
        .banner-track {
          display: flex;
          gap: 12px;
          padding: 0 2px;
          min-width: min-content;
        }
        .banner-item {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          min-width: 200px;
          max-width: 240px;
          animation: fadeUp .4s ease both;
          transition: transform var(--transition);
        }
        .banner-item:hover { transform: translateY(-2px); }
        .is-today {
          background: var(--accent-dim);
          border-color: var(--accent);
          box-shadow: 0 0 0 1px var(--accent)22;
        }

        .banner-day {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }
        .bd-num {
          font-family: 'DM Serif Display', serif;
          font-size: 26px;
          line-height: 1;
          color: var(--text);
        }
        .is-today .bd-num { color: var(--accent); }
        .bd-mon { font-size: 9px; font-weight: 700; letter-spacing: .1em; color: var(--text2); margin-top: 2px; }

        .banner-info { min-width: 0; flex: 1; }
        .banner-name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .banner-note { font-size: 11px; color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
        .banner-sub  { font-size: 11px; color: var(--gold); margin-top: 4px; }
        .is-today .banner-sub { color: var(--accent); }
      `}</style>
    </div>
  );
}
