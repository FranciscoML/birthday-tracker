"use client";
import { useEffect, useState } from "react";

type Status = "idle" | "subscribed" | "unsupported" | "loading";

export default function PushButton() {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported"); return;
    }
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setStatus(sub ? "subscribed" : "idle");
      });
    });
  }, []);

  const subscribe = async () => {
    setStatus("loading");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      setStatus("subscribed");
    } catch {
      setStatus("idle");
      alert("No se pudo activar las notificaciones. Verifica los permisos del navegador.");
    }
  };

  if (status === "unsupported") return null;
  if (status === "subscribed") return (
    <div className="push-on">
      <span>🔔</span> Notificaciones activas
      <style jsx>{`.push-on { font-size: 12px; color: var(--gold); display:flex; align-items:center; gap:6px; }`}</style>
    </div>
  );

  return (
    <>
      <button className="push-btn" onClick={subscribe} disabled={status === "loading"}>
        {status === "loading" ? "Activando…" : "🔔 Activar notificaciones"}
      </button>
      <style jsx>{`
        .push-btn {
          font-size: 12px; font-weight: 500;
          background: var(--gold-dim); border: 1px solid var(--gold)44;
          color: var(--gold); border-radius: 99px;
          padding: 6px 14px;
          transition: background var(--transition);
        }
        .push-btn:hover { background: var(--gold-dim); filter: brightness(1.2); }
        .push-btn:disabled { opacity: .6; cursor: not-allowed; }
      `}</style>
    </>
  );
}
