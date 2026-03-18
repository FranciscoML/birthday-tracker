"use client";
import { Birthday } from "@/types";
import { MONTHS, calcAge, isToday, daysUntilBirthday } from "@/lib/helpers";

interface Props {
  birthday: Birthday;
  onEdit: (b: Birthday) => void;
  onDelete: (id: string) => void;
  style?: React.CSSProperties;
}

export default function BirthdayCard({ birthday, onEdit, onDelete, style }: Props) {
  const { id, name, note, day, month, year } = birthday;
  const today   = isToday(day, month);
  const age     = calcAge(year);
  const daysLeft = daysUntilBirthday(day, month);

  return (
    <div className={`bc-card ${today ? "bc-today" : ""}`} style={style}>
      <div className="bc-left">
        <span className="bc-date">
          {String(day).padStart(2, "0")}
          <span className="bc-month">{MONTHS[month].slice(0, 3).toUpperCase()}</span>
        </span>
      </div>

      <div className="bc-center">
        <p className="bc-name">{name}</p>
        {note && <p className="bc-note">{note}</p>}
        <div className="bc-meta">
          {age !== null && <span className="bc-age">{today ? age : age + 1} años</span>}
          {!today && (
            <span className="bc-days">
              {daysLeft === 0 ? "¡Hoy!" : `en ${daysLeft} día${daysLeft !== 1 ? "s" : ""}`}
            </span>
          )}
          {today && <span className="bc-badge">🎂 ¡Hoy!</span>}
        </div>
      </div>

      <div className="bc-actions">
        <button className="bc-btn bc-edit" onClick={() => onEdit(birthday)} title="Editar">✏️</button>
        <button className="bc-btn bc-del"  onClick={() => onDelete(id)}     title="Eliminar">🗑️</button>
      </div>

      <style jsx>{`
        .bc-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          transition: background var(--transition), transform var(--transition);
          animation: fadeUp .3s ease both;
        }
        .bc-card:hover { background: var(--surface2); transform: translateY(-1px); }
        .bc-today { border-color: var(--accent); background: var(--accent-dim); }
        .bc-today:hover { background: var(--accent-dim); }

        .bc-left { flex-shrink: 0; }
        .bc-date {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: 'DM Serif Display', serif;
          font-size: 22px;
          line-height: 1;
          color: var(--text);
          min-width: 42px;
        }
        .bc-month { font-family: 'DM Sans', sans-serif; font-size: 9px; font-weight: 600; color: var(--text2); letter-spacing: .08em; margin-top: 2px; }
        .bc-today .bc-date { color: var(--accent); }

        .bc-center { flex: 1; min-width: 0; }
        .bc-name { font-weight: 500; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bc-note { font-size: 12px; color: var(--text2); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bc-meta { display: flex; align-items: center; gap: 8px; margin-top: 4px; flex-wrap: wrap; }
        .bc-age  { font-size: 11px; color: var(--muted); }
        .bc-days { font-size: 11px; color: var(--gold); }
        .bc-badge { font-size: 11px; font-weight: 600; color: var(--accent); }

        .bc-actions { display: flex; gap: 4px; flex-shrink: 0; opacity: 0; transition: opacity var(--transition); }
        .bc-card:hover .bc-actions { opacity: 1; }
        .bc-btn { background: none; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 5px 8px; font-size: 13px; transition: background var(--transition); }
        .bc-btn:hover { background: var(--surface2); }
        .bc-del:hover  { border-color: var(--danger); }
      `}</style>
    </div>
  );
}
