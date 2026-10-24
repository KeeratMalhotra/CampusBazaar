"use client";

import { useState } from "react";
import { Flag, X, Loader2 } from "lucide-react";
import { REPORT_REASONS } from "@/lib/constants";

// opens a small popup to report a listing or a chat message
export default function ReportButton({ targetType, targetId, small = false }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function send(event) {
    event.preventDefault();
    setSending(true);
    setError("");
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, reason, details }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) return setError(data.error || "couldn't send the report");
    setDone(true);
  }

  function close() {
    setOpen(false);
    setDone(false);
    setError("");
  }

  return (
    <>
      {small ? (
        <button onClick={() => setOpen(true)} title="report" className="text-ink/40 hover:text-ink">
          <Flag size={14} />
        </button>
      ) : (
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-sm font-semibold text-ink/60 hover:text-ink">
          <Flag size={16} /> report
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4" onClick={close}>
          <div className="card w-full max-w-md bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h2 className="font-display text-2xl font-extrabold">
                {done ? "thanks for the heads up 🫡" : `report this ${targetType}`}
              </h2>
              <button onClick={close} aria-label="close"><X size={22} /></button>
            </div>

            {done ? (
              <p className="mt-3 text-ink/70">the mods will take a look. you won&apos;t be shown as the reporter.</p>
            ) : (
              <form onSubmit={send} className="mt-4 space-y-3">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-ink px-3 py-2 font-medium ${
                      reason === r.value ? "bg-sun" : "bg-white hover:bg-paper"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                      className="accent-ink"
                    />
                    {r.label}
                  </label>
                ))}
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  maxLength={500}
                  rows={2}
                  placeholder="anything else? (optional)"
                  className="w-full rounded-xl border-2 border-ink px-3 py-2 outline-none"
                />
                {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
                <button disabled={!reason || sending} className="btn w-full bg-ink text-white disabled:opacity-50">
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Flag size={18} />} send report
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
