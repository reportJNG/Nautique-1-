"use client";

import React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, User, Dumbbell, CreditCard, Save, Search } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { AdminPageShell } from "@/components/admin/AdminPage";
import { useAdminToast } from "@/components/admin/AdminToast";

interface Adherent {
  id: number;
  prenom: string;
  nom: string;
  numeroDossier: string;
}

interface Discipline {
  id: number;
  designation: string;
}

interface Saison {
  id: number;
  designation: string;
}

interface CategorieAge {
  id: number;
  designation: string;
}

interface NouvelAbonnementClientProps {
  adherents: Adherent[];
  disciplines: Discipline[];
  saisons: Saison[];
  categories: CategorieAge[];
}

export function NouvelAbonnementClient({
  adherents,
  disciplines,
  saisons,
  categories,
}: NouvelAbonnementClientProps) {
  const locale = useLocale();
  const t = useTranslations("admin");
  const { toast } = useAdminToast();
  const router = useRouter();

  const [adherentSearch, setAdherentSearch] = React.useState("");
  const [selectedAdherent, setSelectedAdherent] = React.useState<Adherent | null>(null);
  const [loading, setLoading] = React.useState(false);

  const filtered = adherents
    .filter((adherent) => {
      const query = adherentSearch.toLowerCase();
      return (
        adherent.nom.toLowerCase().includes(query) ||
        adherent.prenom.toLowerCase().includes(query) ||
        adherent.numeroDossier.toLowerCase().includes(query)
      );
    })
    .slice(0, 8);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedAdherent) {
      toast({
        variant: "warning",
        title: t("toast.validationError.title"),
        description: t("abonnementsUi.new.validationSelectAdherent"),
      });
      return;
    }

    const formData = new FormData(event.currentTarget);

    if (
      !formData.get("disciplineId") ||
      !formData.get("saisonId") ||
      !formData.get("typeAbonnement")
    ) {
      toast({
        variant: "warning",
        title: t("toast.validationError.title"),
        description: t("toast.validationError.desc"),
      });
      return;
    }

    formData.set("adherentId", String(selectedAdherent.id));
    setLoading(true);

    try {
      const response = await fetch("/api/admin/abonnements", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setLoading(false);

      if (data.error) {
        toast({
          variant: "error",
          title: t("toast.createError.title"),
          description: data.error,
        });
      } else {
        toast({
          variant: "success",
          title: t("toast.createSuccess.title"),
          description: t("toast.createSuccess.desc"),
        });
        router.push("/admin/abonnements");
      }
    } catch {
      setLoading(false);
      toast({
        variant: "error",
        title: t("toast.createError.title"),
        description: t("toast.createError.desc"),
      });
    }
  }

  return (
    <AdminPageShell locale={locale}>
      <Link
        href={`/${locale}/admin/abonnements`}
        className="mb-6 inline-flex w-fit items-center gap-2 rounded-lg border border-border/50 bg-muted/10 px-3 py-1.5 text-sm font-medium text-muted-foreground no-underline transition-all duration-150 hover:bg-muted/15 hover:text-foreground"
      >
        <ArrowLeft size={16} />
        {t("abonnementsUi.new.back")}
      </Link>

      <div className="mb-6">
        <h1 className="text-[26px] font-extrabold tracking-tight text-foreground">
          {t("abonnementsUi.new.title")}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3.5 overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 border-b border-border/30 px-[18px] pb-[11px] pt-[13px]">
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/12 text-primary">
              <User size={14} />
            </div>
            <span className="text-[13px] font-semibold text-foreground">
              {t("abonnementsUi.new.selectAdherentTitle")}
            </span>
          </div>

          <div className="p-[18px]">
            {selectedAdherent ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/8 p-2.5 px-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-[10px] font-extrabold text-primary-foreground">
                    {selectedAdherent.prenom[0]}
                    {selectedAdherent.nom[0]}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">
                      {selectedAdherent.prenom} {selectedAdherent.nom}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {selectedAdherent.numeroDossier}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAdherent(null)}
                  className="rounded-md border border-border/50 bg-muted/15 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/25 cursor-pointer"
                >
                  {t("abonnementsUi.new.change")}
                </button>
              </div>
            ) : (
              <>
                <div className="relative mb-2.5">
                  <Search
                    size={14}
                    className="absolute left-[11px] top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    className="box-border w-full rounded-lg border border-border/50 bg-muted/10 py-2 pl-[34px] pr-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/35"
                    placeholder={t("abonnementsUi.new.searchPlaceholder")}
                    value={adherentSearch}
                    onChange={(event) => setAdherentSearch(event.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="flex max-h-[220px] flex-col gap-0.5 overflow-y-auto">
                  {filtered.length === 0 && (
                    <div className="py-5 text-center text-[12.5px] text-muted-foreground">
                      {t("abonnementsUi.new.noResults")}
                    </div>
                  )}
                  {filtered.map((adherent) => (
                    <div
                      key={adherent.id}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3.5 py-2.5 transition-colors hover:bg-primary/7"
                      onClick={() => {
                        setSelectedAdherent(adherent);
                        setAdherentSearch("");
                      }}
                    >
                      <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-[10px] font-extrabold text-primary-foreground">
                        {adherent.prenom[0]}
                        {adherent.nom[0]}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-foreground">
                          {adherent.prenom} {adherent.nom}
                        </div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {adherent.numeroDossier}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mb-3.5 overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 border-b border-border/30 px-[18px] pb-[11px] pt-[13px]">
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/12 text-primary">
              <Dumbbell size={14} />
            </div>
            <span className="text-[13px] font-semibold text-foreground">
              {t("abonnementsUi.new.detailsTitle")}
            </span>
          </div>

          <div className="flex flex-col gap-4 p-[18px]">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="flex flex-col">
                <label className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Dumbbell size={12} />
                  {t("abonnementsUi.new.disciplineLabel")}
                </label>
                <select
                  name="disciplineId"
                  className="box-border w-full rounded-lg border border-border/50 bg-muted/10 px-3.5 py-2.5 text-[13.5px] text-foreground outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>
                    {t("abonnementsUi.new.disciplineSelectPlaceholder")}
                  </option>
                  {disciplines.map((discipline) => (
                    <option key={discipline.id} value={discipline.id} className="bg-card">
                      {discipline.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("abonnementsUi.new.subscriptionTypeLabel")}
                </label>
                <select
                  name="typeAbonnement"
                  className="box-border w-full rounded-lg border border-border/50 bg-muted/10 px-3.5 py-2.5 text-[13.5px] text-foreground outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>
                    {t("abonnementsUi.new.subscriptionTypePlaceholder")}
                  </option>
                  <option value="OPN">
                    {t("abonnementsUi.new.subscriptionTypeOptions.OPN")}
                  </option>
                  <option value="DUR">
                    {t("abonnementsUi.new.subscriptionTypeOptions.DUR")}
                  </option>
                  <option value="SEA">
                    {t("abonnementsUi.new.subscriptionTypeOptions.SEA")}
                  </option>
                </select>
              </div>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="flex flex-col">
                <label className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("abonnementsUi.new.seasonLabel")}
                </label>
                <select
                  name="saisonId"
                  className="box-border w-full rounded-lg border border-border/50 bg-muted/10 px-3.5 py-2.5 text-[13.5px] text-foreground outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>
                    {t("abonnementsUi.new.seasonPlaceholder")}
                  </option>
                  {saisons.map((saison) => (
                    <option key={saison.id} value={saison.id} className="bg-card">
                      {saison.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("abonnementsUi.new.ageCategoryLabel")}{" "}
                  <span className="text-destructive">*</span>
                </label>
                <select
                  name="categorieAgeId"
                  className="box-border w-full rounded-lg border border-border/50 bg-muted/10 px-3.5 py-2.5 text-[13.5px] text-foreground outline-none"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    {t("abonnementsUi.new.ageCategoryPlaceholder")}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id} className="bg-card">
                      {category.designation}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex max-w-[280px] flex-col">
              <label className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                <CreditCard size={12} />
                {t("abonnementsUi.new.subscriptionAmountLabel")}
              </label>
              <input
                name="montantTtc"
                type="number"
                step="0.01"
                min="0"
                className="box-border w-full rounded-lg border border-border/50 bg-muted/10 px-3.5 py-2.5 text-[13.5px] text-foreground outline-none"
                placeholder={t("abonnementsUi.new.amountPlaceholder")}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-border/30 px-5 py-4">
            <Link
              href={`/${locale}/admin/abonnements`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-transparent px-[18px] py-2.5 text-[13px] font-medium text-muted-foreground no-underline transition-colors hover:bg-muted/5"
            >
              {t("abonnementsUi.new.back")}
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg border-none bg-gradient-to-br from-primary to-primary/80 px-[22px] py-2.5 text-[13.5px] font-semibold text-primary-foreground shadow-[0_2px_12px_hsl(var(--primary)/0.35)] transition-all duration-150 hover:-translate-y-[1px] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              disabled={loading}
            >
              <Save size={15} />
              {loading ? t("abonnementsUi.new.creating") : t("abonnementsUi.new.submit")}
            </button>
          </div>
        </div>
      </form>
    </AdminPageShell>
  );
}
