"use client";
import { useEffect, useState } from "react";
import { Birthday, BirthdayFormData } from "@/types";
import { MONTHS } from "@/lib/helpers";

interface Props {
  open:    boolean;
  initial: Birthday | null;
  onSave:  (data: BirthdayFormData) => Promise<void>;
  onClose: () => void;
}

const EMPTY: BirthdayFormData = { name: "", note: "", day: 1, month: 1, year: null };

export default function BirthdayModal({ open, initial, onSave, onClose }: Props) {
  const [form, setForm]       = useState<BirthdayFormData>(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (open) {
      setForm(initial
        ? { name: initial.name, note: initial.note ?? "", day: initial.day, month: initial.month, year: initial.year }
        : EMPTY
      );
      setError("");
    }
  }, [open, initial]);

  if (!open) return null;

  const set = (k: keyof BirthdayFormData, v: string | number | null) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("El nombre es requerido"); return; }
    if (form.day < 1 || form.day > 31) { setError("Día inválido"); return; }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch {
      setError("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{initial ? "Editar cumpleaños" : "Nuevo cumpleaños"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Nombre */}
          <label className="field">
            <span className="label">Nombre <span className="req">*</span></span>
            <input
              className="input"
              value={form.name}
              onChange={e => set("name", e.target.value)}
              placeholder="Ej: María García"
              autoFocus
            />
          </label>

          {/* Nota */}
          <label className="field">
            <span className="label">Nota <span className="opt">(opcional)</span></span>
            <input
              className="input"
              value={form.note ?? ""}
              onChange={e => set("note", e.target.value)}
              placeholder="Ej: Mamá de Juan"
            />
          </label>

          {/* Día y Mes */}
          <div className="row">
            <label className="field">
              <span className="label">Día <span className="req">*</span></span>
              <input
                className="input"
                type="number" min={1} max={31}
                value={form.day}
                onChange={e => set("day", Number(e.target.value))}
              />
            </label>
            <label className="field">
              <span className="label">Mes <span className="req">*</span></span>
              <select className="input" value={form.month} onChange={e => set("month", Number(e.target.value))}>
                {Object.entries(MONTHS).map(([num, name]) => (
                  <option key={num} value={num}>{name}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Año */}
          <label className="field">
            <span className="label">Año <span className="opt">(opcional — para calcular edad)</span></span>
            <input
              className="input"
              type="number" min={1900} max={new Date().getFullYear()}
              value={form.year ?? ""}
              onChange={e => set("year", e.target.value ? Number(e.target.value) : null)}
              placeholder="Ej: 1990"
            />
          </label>

          {error && <p className="error">{error}</p>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-save" onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando…" : initial ? "Guardar cambios" : "Agregar"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .overlay {
          position: fixed; inset: 0;
          background: #00000088;
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 100;
          animation: fadeIn .15s ease;
          padding: 16px;
        }
        .modal {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          width: 100%; max-width: 440px;
          animation: scaleIn .2s ease;
          box-shadow: var(--shadow);
        }
        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px 0;
        }
        .modal-title { font-family: 'DM Serif Display', serif; font-size: 20px; }
        .modal-close {
          background: none; border: none; color: var(--muted);
          font-size: 16px; padding: 4px 8px; border-radius: var(--radius-sm);
          transition: color var(--transition), background var(--transition);
        }
        .modal-close:hover { color: var(--text); background: var(--surface2); }

        .modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
        .modal-footer {
          padding: 0 24px 20px;
          display: flex; justify-content: flex-end; gap: 10px;
        }

        .field { display: flex; flex-direction: column; gap: 6px; }
        .label { font-size: 12px; font-weight: 500; color: var(--text2); }
        .req { color: var(--accent); }
        .opt { color: var(--muted); font-weight: 400; }

        .input {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: var(--radius-sm); color: var(--text);
          padding: 9px 12px; font-size: 14px;
          transition: border-color var(--transition);
          width: 100%;
        }
        .input:focus { outline: none; border-color: var(--accent); }
        .input::placeholder { color: var(--muted); }
        select.input { appearance: none; }

        .row { display: grid; grid-template-columns: 1fr 2fr; gap: 12px; }

        .error { font-size: 12px; color: var(--danger); background: #e0555522; border-radius: var(--radius-sm); padding: 8px 12px; }

        .btn-cancel {
          background: none; border: 1px solid var(--border);
          border-radius: var(--radius-sm); color: var(--text2);
          padding: 9px 18px; font-size: 13px; font-weight: 500;
          transition: background var(--transition);
        }
        .btn-cancel:hover { background: var(--surface2); }
        .btn-save {
          background: var(--accent); border: none;
          border-radius: var(--radius-sm); color: white;
          padding: 9px 22px; font-size: 13px; font-weight: 600;
          transition: opacity var(--transition);
        }
        .btn-save:hover { opacity: .88; }
        .btn-save:disabled { opacity: .5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
