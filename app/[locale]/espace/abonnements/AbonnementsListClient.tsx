"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Plus, Waves } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { STATUT_ABONNEMENT_STYLES } from "@/lib/constants";
import { AbonnementActionCard } from "./AbonnementActionCard";

interface AbonnementListItem {
  id: number;
  designation: string;
  beneficiaryName: string;
  beneficiaryDossier: string;
  espace: string;
  saison: string;
  saisonDateRange: string;
  categorie: string;
  statut: string;
  statutCode: string;
  type: string;
  startDate: string;
  endDate: string;
  amount: string;
  creneaux: Array<{
    id: number;
    dayIndex: number;
    dayLabel: string;
    start: string;
    end: string;
    group: string | null;
    label: string;
  }>;
  factureId: number | null;
  invoiceStatus: string | null;
  invoiceNumber: string | null;
  invoiceMode: string | null;
  invoicePaidAt: string | null;
}

interface Props {
  locale: string;
  abonnements: AbonnementListItem[];
}

type FilterValue = "all" | "CRE" | "ATP" | "ACT" | "APP";

export function AbonnementsListClient({ locale, abonnements }: Props) {
  const t = useTranslations("espace.abonnements");
  const [filter, setFilter] = useState<FilterValue>("all");

  const filteredItems = useMemo(() => {
    if (filter === "all") {
      return abonnements;
    }

    return abonnements.filter((item) => item.statutCode === filter);
  }, [abonnements, filter]);

  const filters: Array<{ value: FilterValue; label: string }> = [
    { value: "all", label: t("filters.all") },
    { value: "CRE", label: t("filters.draft") },
    { value: "ATP", label: t("filters.pending") },
    { value: "ACT", label: t("filters.active") },
    { value: "APP", label: t("filters.approved") },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[32px] border border-border/50 bg-white/75 p-6 shadow-sm backdrop-blur dark:bg-slate-950/50 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-300">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <Button asChild className="h-11 rounded-2xl">
          <Link href={`/espace/abonnements/nouveau`}>
            <Plus className="size-4" />
            {t("addButton")}
          </Link>
        </Button>
      </section>

      {abonnements.length === 0 ? (
        <section className="rounded-[32px] border border-dashed border-border/70 bg-white/70 px-6 py-16 text-center shadow-sm backdrop-blur dark:bg-slate-950/40">
          <div className="mx-auto flex size-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-cyan-500 to-sky-700 text-white shadow-lg">
            <CalendarDays className="size-7" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-foreground">
            {t("empty.title")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {t("empty.description")}
          </p>
          <Button asChild className="mt-6 h-11 rounded-2xl">
            <Link href={`/espace/abonnements/nouveau`}>{t("empty.cta")}</Link>
          </Button>
        </section>
      ) : (
        <>
          <div className="rounded-[28px] border border-border/50 bg-white/80 p-4 shadow-sm backdrop-blur dark:bg-slate-950/50">
            <div className="flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                    filter === item.value
                      ? "border-cyan-500 bg-cyan-500 text-white"
                      : "border-border/60 bg-background/70 text-muted-foreground hover:border-cyan-200 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-border/70 bg-white/70 px-5 py-10 text-center text-sm text-muted-foreground shadow-sm backdrop-blur dark:bg-slate-950/40">
              {t("filters.empty")}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredItems.map((abonnement, index) => {
                const visibleSlots = abonnement.creneaux.slice(0, 4);
                const hiddenCount = Math.max(abonnement.creneaux.length - 4, 0);

                return (
                  <motion.article
                    key={abonnement.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="overflow-hidden rounded-[30px] border border-border/50 bg-white/80 shadow-sm backdrop-blur dark:bg-slate-950/50"
                  >
                    <div className="grid gap-4 p-5 lg:grid-cols-[1.4fr_0.85fr] lg:p-6">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-start gap-3">
                          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-700 text-white shadow-lg">
                            <Waves className="size-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <h2 className="truncate text-lg font-semibold text-foreground">
                                {abonnement.beneficiaryName}
                              </h2>
                              <Badge
                                className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUT_ABONNEMENT_STYLES[abonnement.statutCode] || ""}`}
                              >
                                {abonnement.statut}
                              </Badge>
                            </div>

                            <p className="mt-1 text-sm font-medium text-foreground">
                              {abonnement.designation}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {abonnement.beneficiaryDossier}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                              <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5">
                                {abonnement.espace}
                              </span>
                              <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5">
                                {abonnement.designation}
                              </span>
                              <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5">
                                {abonnement.saison}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 grid-cols-2 xl:grid-cols-4">
                          <InfoCard
                            label={t("cards.period")}
                            value={`${abonnement.startDate} - ${abonnement.endDate}`}
                          />
                          <InfoCard
                            label={t("cards.category")}
                            value={abonnement.categorie}
                          />
                          <InfoCard label={t("cards.plan")} value={abonnement.type} />
                          <InfoCard
                            label={t("cards.amount")}
                            value={abonnement.amount}
                          />
                        </div>

                        <div className="mt-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            {t("slots.title")}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {abonnement.creneaux.length === 0 ? (
                              <span className="rounded-full border border-dashed border-border/70 px-3 py-1.5 text-xs text-muted-foreground">
                                {t("slots.empty")}
                              </span>
                            ) : (
                              <>
                                {visibleSlots.map((creneau) => (
                                  <span
                                    key={creneau.id}
                                    className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-800 dark:border-cyan-900/60 dark:bg-cyan-950/30 dark:text-cyan-200"
                                  >
                                    {creneau.label}
                                  </span>
                                ))}
                                {hiddenCount > 0 ? (
                                  <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                                    {t("slots.more", { count: hiddenCount })}
                                  </span>
                                ) : null}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <AbonnementActionCard
                        abonnementId={abonnement.id}
                        factureId={abonnement.factureId}
                        statutCode={abonnement.statutCode}
                        locale={locale}
                        invoiceNumber={abonnement.invoiceNumber}
                        invoiceStatus={abonnement.invoiceStatus}
                        invoiceMode={abonnement.invoiceMode}
                        invoicePaidAt={abonnement.invoicePaidAt}
                        amount={abonnement.amount}
                      />
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
