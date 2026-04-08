"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  Search,
  LogIn,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { AdminSection } from "@/components/admin/AdminPage";
import { useAdminToast } from "@/components/admin/AdminToast";

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
      toast({
        variant: "warning",
        title: t("toast.validationError.title"),
        description: t("accessUi.validationRequired"),
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `/api/admin/acces?dossier=${encodeURIComponent(query.trim())}`,
      );
      const data = await res.json();
      setLoading(false);

      const now = new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (data.granted) {
        toast({
          variant: "success",
          title: t("toast.accessGranted.title"),
          description: `${data.name} - ${data.discipline ?? ""}`,
        });
        setJournal((prev) => [
          { id: String(Date.now()), name: data.name, dossier: query, time: now, granted: true },
          ...prev.slice(0, 49),
        ]);
        setStats((prev) => ({ ...prev, granted: prev.granted + 1 }));
      } else {
        toast({
          variant: "error",
          title: t("toast.accessDenied.title"),
          description: data.reason ?? t("toast.accessDenied.desc"),
        });
        setJournal((prev) => [
          {
            id: String(Date.now()),
            name: data.name ?? query,
            dossier: query,
            time: now,
            granted: false,
          },
          ...prev.slice(0, 49),
        ]);
        setStats((prev) => ({ ...prev, denied: prev.denied + 1 }));
      }
    } catch {
      setLoading(false);
      toast({
        variant: "error",
        title: t("toast.accessError.title"),
        description: t("toast.accessError.desc"),
      });
    }

    setQuery("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      handleValidate();
    }
  }

  return (
    <>
      <div className="mb-0 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border/30 bg-card/50 p-3.5 px-4 text-center">
          <div className="text-[22px] font-extrabold tracking-tight text-foreground text-primary">
            {stats.granted}
          </div>
          <div className="mt-0.5 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
            {t("accessUi.stats.grantedToday")}
          </div>
        </div>
        <div className="rounded-lg border border-border/30 bg-card/50 p-3.5 px-4 text-center">
          <div className="text-[22px] font-extrabold tracking-tight text-destructive text-foreground">
            {stats.denied}
          </div>
          <div className="mt-0.5 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
            {t("accessUi.stats.denied")}
          </div>
        </div>
        <div className="rounded-lg border border-border/30 bg-card/50 p-3.5 px-4 text-center">
          <div className="text-[22px] font-extrabold tracking-tight text-foreground">
            {journal.length}
          </div>
          <div className="mt-0.5 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
            {t("accessUi.stats.totalScans")}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-primary/15 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 border-b border-border/30 bg-primary/4 px-5 pb-3.5 pt-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/12 text-primary">
            <LogIn size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              {t("accessUi.card.save")}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {t("accessUi.card.subtitle")}
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                className="w-full rounded-lg border border-border/50 bg-muted/10 py-2.5 pl-[38px] pr-3.5 text-sm text-foreground outline-none transition-all duration-180 placeholder:text-muted-foreground focus:border-primary/40 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
                placeholder={t("accessUi.searchPlaceholder")}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                autoComplete="off"
              />
            </div>
            <button
              type="button"
              className="inline-flex whitespace-nowrap rounded-lg border-none bg-gradient-to-br from-primary to-primary/80 px-5 py-2.5 text-[13.5px] font-semibold text-primary-foreground shadow-[0_2px_10px_hsl(var(--primary)/0.3)] transition-all duration-150 hover:-translate-y-px hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:h-[15px] [&_svg]:w-[15px]"
              onClick={handleValidate}
              disabled={loading}
            >
              <ShieldCheck />
              {loading ? "..." : t("accessUi.button.validate")}
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-primary/12 bg-primary/5 p-3 px-4">
            <div className="h-2.5 w-2.5 animate-[pulse_2s_infinite] rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
            <span className="text-[12.5px] text-muted-foreground">
              {t.rich("accessUi.systemActive", {
                strong: (chunks) => <strong className="text-primary">{chunks}</strong>,
              })}
            </span>
          </div>
        </div>
      </div>

      <AdminSection
        title={t("accessUi.card.journal")}
        description={t("accessUi.card.description")}
        headerRight={
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Activity size={12} />
            {t("accessUi.realtime")}
          </span>
        }
      >
        {journal.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/12 bg-primary/6 text-muted-foreground">
              <Clock size={24} />
            </div>
            <div className="text-[13.5px] text-muted-foreground">
              {t("accessUi.emptyJournal")}
            </div>
          </div>
        ) : (
          <div>
            {journal.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3 border-b border-border/20 px-[18px] py-2.5 last:border-b-0"
              >
                <div>
                  <div className="text-[13px] font-semibold text-foreground">
                    {entry.name}
                  </div>
                  <div className="font-mono text-[11.5px] text-muted-foreground">
                    {entry.dossier}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-tabular-nums text-muted-foreground">
                    {entry.time}
                  </span>
                  {entry.granted ? (
                    <CheckCircle2 size={16} className="text-primary" />
                  ) : (
                    <XCircle size={16} className="text-destructive" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminSection>
    </>
  );
}
