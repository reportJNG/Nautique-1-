"use client";

import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAdminToast } from "@/components/admin/AdminToast";
import { AdminPageShell } from "@/components/admin/AdminPage";
import { ArrowLeft, User, Dumbbell, CreditCard, Save, Search } from "lucide-react";
import Link from "next/link";
import React from "react";

interface Adherent { id: number; prenom: string; nom: string; numeroDossier: string; }
interface Discipline { id: number; designation: string; }
interface Saison { id: number; designation: string; }
interface CategorieAge { id: number; designation: string; }

interface NouvelAbonnementClientProps {
  adherents: Adherent[];
  disciplines: Discipline[];
  saisons: Saison[];
  categories: CategorieAge[];
}

export function NouvelAbonnementClient({
  adherents, disciplines, saisons, categories,
}: NouvelAbonnementClientProps) {
  const locale = useLocale();
  const t = useTranslations("admin");
  const { toast } = useAdminToast();
  const router = useRouter();

  const [adherentSearch, setAdherentSearch] = React.useState("");
  const [selectedAdherent, setSelectedAdherent] = React.useState<Adherent | null>(null);
  const [loading, setLoading] = React.useState(false);

  const filtered = adherents.filter((a) => {
    const q = adherentSearch.toLowerCase();
    return (
      a.nom.toLowerCase().includes(q) ||
      a.prenom.toLowerCase().includes(q) ||
      a.numeroDossier.toLowerCase().includes(q)
    );
  }).slice(0, 8);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedAdherent) {
      toast({ variant: "warning", title: t("toast.validationError.title"), description: "Sélectionnez un adhérent." });
      return;
    }
    const fd = new FormData(e.currentTarget);
    if (!fd.get("disciplineId") || !fd.get("saisonId") || !fd.get("typeAbonnement")) {
      toast({ variant: "warning", title: t("toast.validationError.title"), description: t("toast.validationError.desc") });
      return;
    }

    fd.set("adherentId", String(selectedAdherent.id));
    setLoading(true);

    try {
      const res = await fetch("/api/admin/abonnements", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      setLoading(false);

      if (data.error) {
        toast({ variant: "error", title: t("toast.createError.title"), description: data.error });
      } else {
        toast({ variant: "success", title: t("toast.createSuccess.title"), description: t("toast.createSuccess.desc") });
        router.push(`/${locale}/admin/abonnements`);
      }
    } catch {
      setLoading(false);
      toast({ variant: "error", title: t("toast.createError.title"), description: t("toast.createError.desc") });
    }
  }

  return (
    <AdminPageShell locale={locale}>
      {/* Back button */}
      <Link
        href={`/${locale}/admin/abonnements`}
        className="inline-flex w-fit items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/10 border border-border/50 text-muted-foreground text-sm font-medium no-underline hover:bg-muted/15 hover:text-foreground transition-all duration-150 mb-6"
      >
        <ArrowLeft size={16} />
        {t("abonnementsUi.new.back")}
      </Link>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-[26px] font-extrabold text-foreground tracking-tight">
          {t("abonnementsUi.new.title")}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1 — Select adherent */}
        <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden mb-3.5">
          <div className="flex items-center gap-2.5 px-[18px] pt-[13px] pb-[11px] border-b border-border/30">
            <div className="w-[30px] h-[30px] rounded-lg bg-primary/12 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <User size={14} />
            </div>
            <span className="text-[13px] font-semibold text-foreground">
              {t("abonnementsUi.new.selectAdherentTitle")}
            </span>
          </div>

          <div className="p-[18px]">
            {selectedAdherent ? (
              <div className="flex items-center justify-between gap-3 p-2.5 px-3.5 rounded-lg bg-primary/8 border border-primary/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-[10px] font-extrabold text-primary-foreground shrink-0">
                    {selectedAdherent.prenom[0]}{selectedAdherent.nom[0]}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">
                      {selectedAdherent.prenom} {selectedAdherent.nom}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {selectedAdherent.numeroDossier}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAdherent(null)}
                  className="bg-muted/15 border border-border/50 rounded-md text-muted-foreground px-2.5 py-1 text-xs cursor-pointer hover:bg-muted/25 transition-colors"
                >
                  Changer
                </button>
              </div>
            ) : (
              <>
                <div className="relative mb-2.5">
                  <Search size={14} className="absolute left-[11px] top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    className="w-full py-2 px-3 pl-[34px] bg-muted/10 border border-border/50 rounded-lg text-foreground text-[13px] outline-none focus:border-primary/35 transition-colors placeholder:text-muted-foreground box-border"
                    placeholder={t("abonnementsUi.new.searchPlaceholder")}
                    value={adherentSearch}
                    onChange={(e) => setAdherentSearch(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="max-h-[220px] overflow-y-auto flex flex-col gap-0.5">
                  {filtered.length === 0 && (
                    <div className="py-5 text-center text-[12.5px] text-muted-foreground">
                      Aucun résultat
                    </div>
                  )}
                  {filtered.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-2.5 py-2.5 px-3.5 cursor-pointer rounded-lg hover:bg-primary/7 transition-colors"
                      onClick={() => { setSelectedAdherent(a); setAdherentSearch(""); }}
                    >
                      <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-[10px] font-extrabold text-primary-foreground shrink-0">
                        {a.prenom[0]}{a.nom[0]}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-foreground">
                          {a.prenom} {a.nom}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {a.numeroDossier}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Step 2 — Subscription details */}
        <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden mb-3.5">
          <div className="flex items-center gap-2.5 px-[18px] pt-[13px] pb-[11px] border-b border-border/30">
            <div className="w-[30px] h-[30px] rounded-lg bg-primary/12 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Dumbbell size={14} />
            </div>
            <span className="text-[13px] font-semibold text-foreground">
              Détails de l&apos;abonnement
            </span>
          </div>

          <div className="p-[18px] flex flex-col gap-4">
            {/* Row 1 */}
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="flex flex-col">
                <label className="flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  <Dumbbell size={12} />
                  {t("abonnementsUi.new.disciplineLabel")}
                </label>
                <select
                  name="disciplineId"
                  className="w-full py-2.5 px-3.5 bg-muted/10 border border-border/50 rounded-lg text-foreground text-[13.5px] outline-none box-border"
                  defaultValue=""
                >
                  <option value="" disabled>{t("abonnementsUi.new.disciplineSelectPlaceholder")}</option>
                  {disciplines.map((d) => (
                    <option key={d.id} value={d.id} className="bg-card">{d.designation}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  {t("abonnementsUi.new.subscriptionTypeLabel")}
                </label>
                <select
                  name="typeAbonnement"
                  className="w-full py-2.5 px-3.5 bg-muted/10 border border-border/50 rounded-lg text-foreground text-[13.5px] outline-none box-border"
                  defaultValue=""
                >
                  <option value="" disabled>Sélectionner</option>
                  <option value="OPN">{t("abonnementsUi.new.subscriptionTypeOptions.OPN")}</option>
                  <option value="DUR">{t("abonnementsUi.new.subscriptionTypeOptions.DUR")}</option>
                  <option value="SEA">{t("abonnementsUi.new.subscriptionTypeOptions.SEA")}</option>
                </select>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="flex flex-col">
                <label className="flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Saison
                </label>
                <select
                  name="saisonId"
                  className="w-full py-2.5 px-3.5 bg-muted/10 border border-border/50 rounded-lg text-foreground text-[13.5px] outline-none box-border"
                  defaultValue=""
                >
                  <option value="" disabled>Sélectionner</option>
                  {saisons.map((s) => (
                    <option key={s.id} value={s.id} className="bg-card">{s.designation}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Catégorie d&apos;âge <span className="text-destructive">*</span>
                </label>
                <select
                  name="categorieAgeId"
                  className="w-full py-2.5 px-3.5 bg-muted/10 border border-border/50 rounded-lg text-foreground text-[13.5px] outline-none box-border"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>Sélectionner</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-card">{c.designation}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount field */}
            <div className="flex flex-col max-w-[280px]">
              <label className="flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                <CreditCard size={12} />
                {t("abonnementsUi.new.subscriptionAmountLabel")}
              </label>
              <input
                name="montantTtc"
                type="number"
                step="0.01"
                min="0"
                className="w-full py-2.5 px-3.5 bg-muted/10 border border-border/50 rounded-lg text-foreground text-[13.5px] outline-none box-border"
                placeholder={t("abonnementsUi.new.amountPlaceholder")}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-2.5 justify-end px-5 py-4 border-t border-border/30">
            <Link
              href={`/${locale}/admin/abonnements`}
              className="inline-flex items-center gap-1.5 py-2.5 px-[18px] rounded-lg bg-transparent border border-border/50 text-muted-foreground text-[13px] font-medium no-underline hover:bg-muted/5 transition-colors"
            >
              {t("abonnementsUi.new.back")}
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-2 py-2.5 px-[22px] rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-[13.5px] font-semibold border-none cursor-pointer shadow-[0_2px_12px_hsl(var(--primary)/0.35)] hover:opacity-90 hover:translate-y-[-1px] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <Save size={15} />
              {loading ? "..." : t("abonnementsUi.new.submit")}
            </button>
          </div>
        </div>
      </form>
    </AdminPageShell>
  );
}