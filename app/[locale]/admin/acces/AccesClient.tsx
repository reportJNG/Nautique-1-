"use client";

import { useAdminToast } from "@/components/admin/AdminToast";
import { useTranslations } from "next-intl";
import { ShieldCheck, Search, LogIn, Activity, Clock, CheckCircle2, XCircle } from "lucide-react";
import { AdminSection } from "@/components/admin/AdminPage";
import React from "react";

interface AccessEntry {
  id: string;
  name: string;
  dossier: string;
  time: string;
  granted: boolean;
}

export function AccesClient() {
  const t = useTranslations("admin");
  const { toast } = useAdminToast();
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [journal, setJournal] = React.useState<AccessEntry[]>([]);
  const [stats, setStats] = React.useState({ granted: 0, denied: 0 });

  async function handleValidate() {
    if (!query.trim()) {
      toast({ variant: "warning", title: t("toast.validationError.title"), description: `Saisissez un n° de dossier.` });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/acces?dossier=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setLoading(false);

      const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

      if (data.granted) {
        toast({ variant: "success", title: t("toast.accessGranted.title"), description: `${data.name} — ${data.discipline ?? ""}` });
        setJournal((prev) => [
          { id: String(Date.now()), name: data.name, dossier: query, time: now, granted: true },
          ...prev.slice(0, 49),
        ]);
        setStats((s) => ({ ...s, granted: s.granted + 1 }));
      } else {
        toast({ variant: "error", title: t("toast.accessDenied.title"), description: data.reason ?? t("toast.accessDenied.desc") });
        setJournal((prev) => [
          { id: String(Date.now()), name: data.name ?? query, dossier: query, time: now, granted: false },
          ...prev.slice(0, 49),
        ]);
        setStats((s) => ({ ...s, denied: s.denied + 1 }));
      }
    } catch {
      setLoading(false);
      toast({ variant: "error", title: t("toast.accessError.title"), description: t("toast.accessError.desc") });
    }
    setQuery("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleValidate();
  }

  return (
    <>
      <style>{`
        .acc-scanner-card {
          border-radius: 14px; border: 1px solid hsl(var(--primary)/0.15);
          background: hsl(var(--card)/0.8); backdrop-filter: blur(12px); overflow: hidden;
        }
        .acc-scanner-header {
          display: flex; align-items: center; gap: 10px;
          padding: 16px 20px 14px; border-bottom: 1px solid hsl(var(--border)/0.3);
          background: hsl(var(--primary)/0.04);
        }
        .acc-scanner-icon {
          width: 36px; height: 36px; border-radius: 9px;
          background: hsl(var(--primary)/0.12); border: 1px solid hsl(var(--primary)/0.25);
          display: flex; align-items: center; justify-content: center; color: hsl(var(--primary)); flex-shrink: 0;
        }
        .acc-scanner-icon svg { width: 18px; height: 18px; }
        .acc-scanner-title { font-size: 14px; font-weight: 600; color: hsl(var(--foreground)); }
        .acc-scanner-desc  { font-size: 12px; color: hsl(var(--muted-foreground)); margin-top: 1px; }
        .acc-scanner-body { padding: 20px; }

        .acc-search-wrap { display: flex; gap: 10px; align-items: center; }
        .acc-search-field { position: relative; flex: 1; }
        .acc-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: hsl(var(--muted-foreground)); pointer-events: none; }
        .acc-search-input {
          width: 100%; padding: 10px 14px 10px 38px;
          background: hsl(var(--muted)/0.1); border: 1px solid hsl(var(--border)/0.5);
          border-radius: 9px; color: hsl(var(--foreground)); font-size: 14px; outline: none; box-sizing: border-box;
          transition: border-color 180ms ease, box-shadow 180ms ease;
        }
        .acc-search-input::placeholder { color: hsl(var(--muted-foreground)); }
        .acc-search-input:focus { border-color: hsl(var(--primary)/0.4); box-shadow: 0 0 0 3px hsl(var(--primary)/0.08); }
        .acc-validate-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 9px;
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.8));
          color: hsl(var(--primary-foreground)); font-size: 13.5px; font-weight: 600;
          border: none; cursor: pointer; white-space: nowrap;
          box-shadow: 0 2px 10px hsl(var(--primary)/0.3);
          transition: opacity 150ms ease, transform 150ms ease;
        }
        .acc-validate-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .acc-validate-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .acc-validate-btn svg { width: 15px; height: 15px; }

        .acc-status-row {
          display: flex; align-items: center; gap: 10px;
          margin-top: 16px; padding: 12px 16px; border-radius: 10px;
          background: hsl(var(--primary)/0.05); border: 1px solid hsl(var(--primary)/0.12);
        }
        .acc-status-dot {
          width: 10px; height: 10px; border-radius: 50%; background: hsl(var(--primary));
          box-shadow: 0 0 8px hsl(var(--primary)/0.5); animation: acc-pulse 2s infinite;
        }
        @keyframes acc-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .acc-status-text { font-size: 12.5px; color: hsl(var(--muted-foreground)); }
        .acc-status-text strong { color: hsl(var(--primary)); }

        .acc-stats-grid { display: grid; gap: 12px; grid-template-columns: repeat(3, 1fr); margin-bottom: 0; }
        .acc-stat {
          border-radius: 10px; padding: 14px 16px;
          border: 1px solid hsl(var(--border)/0.3); background: hsl(var(--card)/0.5); text-align: center;
        }
        .acc-stat-val { font-size: 22px; font-weight: 800; color: hsl(var(--foreground)); letter-spacing: -0.02em; }
        .acc-stat-lbl { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: hsl(var(--muted-foreground)); margin-top: 3px; }

        .acc-journal-entry {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          padding: 10px 18px; border-bottom: 1px solid hsl(var(--border)/0.2);
        }
        .acc-journal-entry:last-child { border-bottom: none; }
        .acc-jname { font-size: 13px; font-weight: 600; color: hsl(var(--foreground)); }
        .acc-jdossier { font-size: 11.5px; color: hsl(var(--muted-foreground)); font-family: monospace; }
        .acc-jtime { font-size: 12px; color: hsl(var(--muted-foreground)); font-variant-numeric: tabular-nums; }
        .acc-granted { color: hsl(var(--primary)); }
        .acc-denied  { color: hsl(var(--destructive)); }

        .acc-empty {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 12px; padding: 60px 20px; text-align: center;
        }
        .acc-empty-icon {
          width: 56px; height: 56px; border-radius: 50%;
          background: hsl(var(--primary)/0.06); border: 1px solid hsl(var(--primary)/0.12);
          display: flex; align-items: center; justify-content: center; color: hsl(var(--muted-foreground));
        }
        .acc-empty-text { font-size: 13.5px; color: hsl(var(--muted-foreground)); }
      `}</style>

      {/* Stats row */}
      <div className="acc-stats-grid">
        <div className="acc-stat">
          <div className="acc-stat-val" style={{ color: "hsl(var(--primary))" }}>{stats.granted}</div>
          <div className="acc-stat-lbl">Entrées aujourd&apos;hui</div>
        </div>
        <div className="acc-stat">
          <div className="acc-stat-val" style={{ color: "hsl(var(--destructive))" }}>{stats.denied}</div>
          <div className="acc-stat-lbl">Refusés</div>
        </div>
        <div className="acc-stat">
          <div className="acc-stat-val" style={{ color: "hsl(var(--primary))" }}>{journal.length}</div>
          <div className="acc-stat-lbl">Total scans</div>
        </div>
      </div>

      {/* Scanner */}
      <div className="acc-scanner-card">
        <div className="acc-scanner-header">
          <div className="acc-scanner-icon"><LogIn /></div>
          <div>
            <div className="acc-scanner-title">{t("accessUi.card.save")}</div>
            <div className="acc-scanner-desc">Saisir un numéro de dossier ou scanner un badge</div>
          </div>
        </div>
        <div className="acc-scanner-body">
          <div className="acc-search-wrap">
            <div className="acc-search-field">
              <Search size={16} className="acc-search-icon" />
              <input
                type="text"
                className="acc-search-input"
                placeholder={t("accessUi.searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                autoComplete="off"
              />
            </div>
            <button type="button" className="acc-validate-btn" onClick={handleValidate} disabled={loading}>
              <ShieldCheck />
              {loading ? "..." : t("accessUi.button.validate")}
            </button>
          </div>

          <div className="acc-status-row">
            <div className="acc-status-dot" />
            <span className="acc-status-text">
              Système <strong>actif</strong> · Appuyez sur Entrée pour scanner
            </span>
          </div>
        </div>
      </div>

      {/* Journal */}
      <AdminSection
        title={t("accessUi.card.journal")}
        description="Historique des accès de la journée"
        headerRight={
          <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", display: "flex", alignItems: "center", gap: 4 }}>
            <Activity size={12} />
            Temps réel
          </span>
        }
      >
        {journal.length === 0 ? (
          <div className="acc-empty">
            <div className="acc-empty-icon"><Clock size={24} /></div>
            <div className="acc-empty-text">{t("accessUi.emptyJournal")}</div>
          </div>
        ) : (
          <div>
            {journal.map((entry) => (
              <div key={entry.id} className="acc-journal-entry">
                <div>
                  <div className="acc-jname">{entry.name}</div>
                  <div className="acc-jdossier">{entry.dossier}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="acc-jtime">{entry.time}</span>
                  {entry.granted
                    ? <CheckCircle2 size={16} className="acc-granted" />
                    : <XCircle size={16} className="acc-denied" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminSection>
    </>
  );
}