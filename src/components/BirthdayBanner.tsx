"use client";
import { UpcomingBirthday } from "@/types";
import { MONTHS } from "@/lib/helpers";

interface Props { items: UpcomingBirthday[]; }

export default function BirthdayBanner({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="empty">
        Sin cumpleaños en los próximos 7 días
        <style jsx>{`.empty { padding: 16px 0; color: var(--muted); font-size: 13px; }`}</style>
      </div>
    );
  }

  return (
    <div className="track-wrap">
      <div className="track">
        {items.map((b, i) => (
          <div key={b.id} className="card" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="day-col">
              <span className="day-num">{String(b.day).padStart(2, "0")}</span>
              <span className="day-mon">{MONTHS[b.month].slice(0, 3).toUpperCase()}</span>
            </div>
            <div className="info">
              <p className="name">{b.name}</p>
              {b.note && <p className="note">{b.note}</p>}
              <p className="sub">
                en {b.days_until} día{b.days_until !== 1 ? "s" : ""}
                {b.age !== null ? ` · ${b.age + 1} años` : ""}
              </p>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .track-wrap {
          overflow-x: auto;
          padding-bottom: 8px;
          /* scrollbar siempre visible como en el mockup */
          scrollbar-width: thin;
          scrollbar-color: var(--border) var(--bg2);
          cursor: grab;
        }
        .track-wrap:active { cursor: grabbing; }
        .track-wrap::-webkit-scrollbar { height: 4px; }
        .track-wrap::-webkit-scrollbar-track { background: var(--bg2); border-radius: 99px; }
        .track-wrap::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

        .track {
          display: grid;
          /* Muestra exactamente 3 cards visibles en desktop */
          grid-auto-flow: column;
          grid-auto-columns: calc((100% - 24px) / 3);
          gap: 12px;
          min-width: max-content;
          width: 100%;
        }

        .card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          animation: fadeUp .35s ease both;
          transition: background var(--transition);
          min-width: 0;
        }
        .card:hover { background: var(--surface2); }

        .day-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          min-width: 36px;
        }
        .day-num {
          font-family: 'DM Serif Display', serif;
          font-size: 24px;
          line-height: 1;
          color: var(--text);
        }
        .day-mon {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .1em;
          color: var(--text2);
          margin-top: 2px;
        }

        .info { flex: 1; min-width: 0; }
        .name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .note { font-size: 11px; color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
        .sub  { font-size: 11px; color: var(--gold); margin-top: 4px; }

        @media (max-width: 600px) {
          .track { grid-auto-columns: 72vw; }
        }
      `}</style>
    </div>
  );
}