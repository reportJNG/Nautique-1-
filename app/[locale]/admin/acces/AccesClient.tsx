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
      {/* Stats row */}
      <div className="grid gap-3 grid-cols-3 mb-0">
        <div className="rounded-lg p-3.5 px-4 border border-border/30 bg-card/50 text-center">
          <div className="text-[22px] font-extrabold text-foreground tracking-tight text-primary">
            {stats.granted}
          </div>
          <div className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground mt-0.5">
            Entrées aujourd&apos;hui
          </div>
        </div>
        <div className="rounded-lg p-3.5 px-4 border border-border/30 bg-card/50 text-center">
          <div className="text-[22px] font-extrabold text-foreground tracking-tight text-destructive">
            {stats.denied}
          </div>
          <div className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground mt-0.5">
            Refusés
          </div>
        </div>
        <div className="rounded-lg p-3.5 px-4 border border-border/30 bg-card/50 text-center">
          <div className="text-[22px] font-extrabold text-foreground tracking-tight">
            {journal.length}
          </div>
          <div className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground mt-0.5">
            Total scans
          </div>
        </div>
      </div>

      {/* Scanner Card */}
      <div className="rounded-xl border border-primary/15 bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-3.5 border-b border-border/30 bg-primary/4">
          <div className="w-9 h-9 rounded-lg bg-primary/12 border border-primary/25 flex items-center justify-center text-primary shrink-0">
            <LogIn size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              {t("accessUi.card.save")}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Saisir un numéro de dossier ou scanner un badge
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex gap-2.5 items-center">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                className="w-full py-2.5 px-3.5 pl-[38px] bg-muted/10 border border-border/50 rounded-lg text-foreground text-sm outline-none transition-all duration-180 focus:border-primary/40 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)] placeholder:text-muted-foreground"
                placeholder={t("accessUi.searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                autoComplete="off"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 py-2.5 px-5 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-[13.5px] font-semibold border-none cursor-pointer whitespace-nowrap shadow-[0_2px_10px_hsl(var(--primary)/0.3)] transition-all duration-150 hover:opacity-90 hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed [&_svg]:w-[15px] [&_svg]:h-[15px]"
              onClick={handleValidate}
              disabled={loading}
            >
              <ShieldCheck />
              {loading ? "..." : t("accessUi.button.validate")}
            </button>
          </div>

          <div className="flex items-center gap-2.5 mt-4 p-3 px-4 rounded-lg bg-primary/5 border border-primary/12">
            <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)] animate-[pulse_2s_infinite]" />
            <span className="text-[12.5px] text-muted-foreground">
              Système <strong className="text-primary">actif</strong> · Appuyez sur Entrée pour scanner
            </span>
          </div>
        </div>
      </div>

      {/* Journal Section */}
      <AdminSection
        title={t("accessUi.card.journal")}
        description="Historique des accès de la journée"
        headerRight={
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Activity size={12} />
            Temps réel
          </span>
        }
      >
        {journal.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-5 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/6 border border-primary/12 flex items-center justify-center text-muted-foreground">
              <Clock size={24} />
            </div>
            <div className="text-[13.5px] text-muted-foreground">
              {t("accessUi.emptyJournal")}
            </div>
          </div>
        ) : (
          <div>
            {journal.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-3 py-2.5 px-[18px] border-b border-border/20 last:border-b-0">
                <div>
                  <div className="text-[13px] font-semibold text-foreground">
                    {entry.name}
                  </div>
                  <div className="text-[11.5px] text-muted-foreground font-mono">
                    {entry.dossier}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-tabular-nums">
                    {entry.time}
                  </span>
                  {entry.granted
                    ? <CheckCircle2 size={16} className="text-primary" />
                    : <XCircle size={16} className="text-destructive" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminSection>
    </>
  );
}