"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Clock3,
  Hash,
  Infinity as InfinityIcon,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  createAdherentAbonnement,
  lookupAdherent,
  type LookupAdherentResult,
} from "./actions";
import { InlineChip, SectionHeading, Stepper, SummaryCard } from "./WizardUi";
import { BuilderStep, ReviewStep, WhoStep } from "./SubscriptionNewStepSections";

export interface RestrictionShape {
  categorieAgeId: number;
  sexeAutorise: string | null;
}

export interface CreneauShape {
  id: number;
  saisonId: number;
  jourSemaine: number;
  heureDebut: string;
  heureFin: string;
  groupe: string | null;
  label: string;
  restrictions: RestrictionShape[];
}

export interface DisciplineShape {
  id: number;
  designation: string;
  availableSaisonIds: number[];
  creneaux: CreneauShape[];
}

export interface CategoryShape {
  id: number;
  designation: string;
  ageMin: number;
  ageMax: number | null;
  ageRange: string;
}

export interface EspaceShape {
  id: number;
  code: string;
  designation: string;
  description: string;
  categories: CategoryShape[];
  disciplines: DisciplineShape[];
}

export interface SaisonShape {
  id: number;
  designation: string;
  dateRange: string;
  startDate: string;
  endDate: string;
}

export interface AdherentProfile {
  id: number;
  nom: string;
  prenom: string;
  numeroDossier: string;
  age: number;
  sexe: string;
}

interface FormDataShape {
  adherent: AdherentProfile;
  saisons: SaisonShape[];
  espaces: EspaceShape[];
}

interface Props {
  locale: string;
  data: FormDataShape;
}

export type SubjectMode = "self" | "other";
export type AbonnementType = "OPN" | "DUR" | "SEA";
export type TypeOption = {
  id: AbonnementType;
  label: string;
  description: string;
  baseAmount: number;
  icon: React.ElementType;
};

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export function NouvelAbonnementClient({ locale, data }: Props) {
  const router = useRouter();
  const t = useTranslations("espace.client.subscriptionNew");
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();
  const [lookupPending, startLookupTransition] = useTransition();
  const [subjectMode, setSubjectMode] = useState<SubjectMode>("self");
  const [searchedDossier, setSearchedDossier] = useState("");
  const [lookupResult, setLookupResult] = useState<LookupAdherentResult | null>(
    null,
  );
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [selectedEspaceId, setSelectedEspaceId] = useState<number | null>(
    data.espaces[0]?.id ?? null,
  );
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<number | null>(
    null,
  );
  const [selectedSaisonId, setSelectedSaisonId] = useState<number | null>(
    data.saisons[0]?.id ?? null,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedType, setSelectedType] = useState<AbonnementType>("OPN");
  const [selectedCreneauIds, setSelectedCreneauIds] = useState<number[]>([]);
  const [reviewConsent, setReviewConsent] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  const selectedTarget = useMemo<AdherentProfile | null>(() => {
    if (subjectMode === "self") return data.adherent;
    if (
      !lookupResult?.id ||
      !lookupResult.nom ||
      !lookupResult.prenom ||
      !lookupResult.numeroDossier ||
      lookupResult.age === undefined ||
      !lookupResult.sexe
    ) {
      return null;
    }
    return {
      id: lookupResult.id,
      nom: lookupResult.nom,
      prenom: lookupResult.prenom,
      numeroDossier: lookupResult.numeroDossier,
      age: lookupResult.age,
      sexe: lookupResult.sexe,
    };
  }, [data.adherent, lookupResult, subjectMode]);

  const selectedEspace = useMemo(
    () => data.espaces.find((item) => item.id === selectedEspaceId) ?? null,
    [data.espaces, selectedEspaceId],
  );
  const availableDisciplines = selectedEspace?.disciplines ?? [];
  const selectedDiscipline = useMemo(
    () =>
      availableDisciplines.find((item) => item.id === selectedDisciplineId) ??
      null,
    [availableDisciplines, selectedDisciplineId],
  );
  const availableCategories = useMemo(() => {
    if (!selectedEspace || !selectedTarget) return [];
    return selectedEspace.categories.filter(
      (category) =>
        selectedTarget.age >= category.ageMin &&
        (category.ageMax === null || selectedTarget.age <= category.ageMax),
    );
  }, [selectedEspace, selectedTarget]);
  const selectedCategory = useMemo(
    () =>
      availableCategories.find((item) => item.id === selectedCategoryId) ?? null,
    [availableCategories, selectedCategoryId],
  );
  const selectedSaison = useMemo(
    () => data.saisons.find((item) => item.id === selectedSaisonId) ?? null,
    [data.saisons, selectedSaisonId],
  );

  const typeOptions = useMemo<TypeOption[]>(
    () => [
      {
        id: "OPN",
        label: t("typeOptions.open.label"),
        description: t("typeOptions.open.description"),
        baseAmount: 8500,
        icon: InfinityIcon,
      },
      {
        id: "DUR",
        label: t("typeOptions.duration.label"),
        description: t("typeOptions.duration.description"),
        baseAmount: 5200,
        icon: Clock3,
      },
      {
        id: "SEA",
        label: t("typeOptions.session.label"),
        description: t("typeOptions.session.description"),
        baseAmount: 3200,
        icon: Hash,
      },
    ],
    [t],
  );

  const filteredCreneaux = useMemo(() => {
    if (
      !selectedDiscipline ||
      !selectedSaisonId ||
      !selectedCategoryId ||
      !selectedTarget
    ) {
      return [];
    }
    return selectedDiscipline.creneaux.filter((creneau) => {
      if (creneau.saisonId !== selectedSaisonId) return false;
      if (creneau.restrictions.length === 0) return true;
      return creneau.restrictions.some((restriction) => {
        const categoryOk = restriction.categorieAgeId === selectedCategoryId;
        const genderOk =
          !restriction.sexeAutorise ||
          restriction.sexeAutorise === selectedTarget.sexe;
        return categoryOk && genderOk;
      });
    });
  }, [selectedCategoryId, selectedDiscipline, selectedSaisonId, selectedTarget]);

  const creneauxByDay = useMemo(
    () =>
      DAY_KEYS.map((dayKey, index) => ({
        key: dayKey,
        label: t(`days.${dayKey}`),
        items: filteredCreneaux.filter((creneau) => creneau.jourSemaine === index),
      })),
    [filteredCreneaux, t],
  );

  const selectedCreneaux = useMemo(
    () =>
      filteredCreneaux.filter((creneau) =>
        selectedCreneauIds.includes(creneau.id),
      ),
    [filteredCreneaux, selectedCreneauIds],
  );
  const selectedTypeOption = useMemo(
    () => typeOptions.find((option) => option.id === selectedType) ?? null,
    [selectedType, typeOptions],
  );

  const suggestedAmount = useMemo(() => {
    const base = selectedTypeOption?.baseAmount ?? 0;
    const creneauBoost =
      selectedType === "OPN" ? 0 : Math.max(selectedCreneaux.length, 1) * 250;
    const espaceBoost = selectedEspace?.code === "NAU" ? 900 : 600;
    return base + creneauBoost + espaceBoost;
  }, [selectedCreneaux.length, selectedEspace?.code, selectedType, selectedTypeOption]);

  const canAdvanceFromWho = Boolean(selectedTarget);
  const canAdvanceFromBuilder =
    Boolean(selectedEspaceId) &&
    Boolean(selectedDisciplineId) &&
    Boolean(selectedSaisonId) &&
    Boolean(selectedCategoryId);
  const canSubmit =
    canAdvanceFromWho && canAdvanceFromBuilder && Boolean(selectedTarget?.id);
  const canContinue =
    step === 1 ? canAdvanceFromWho : step === 2 ? canAdvanceFromBuilder : false;
  const continueHint =
    step === 1 && !canAdvanceFromWho
      ? t("buttons.completeWho")
      : step === 2 && !canAdvanceFromBuilder
        ? t("buttons.completeBuilder")
        : null;

  useEffect(() => {
    if (
      selectedDisciplineId &&
      !availableDisciplines.some((item) => item.id === selectedDisciplineId)
    ) {
      setSelectedDisciplineId(null);
    }
  }, [availableDisciplines, selectedDisciplineId]);

  useEffect(() => {
    if (
      selectedDiscipline &&
      selectedSaisonId &&
      !selectedDiscipline.availableSaisonIds.includes(selectedSaisonId)
    ) {
      setSelectedDisciplineId(null);
      setSelectedCreneauIds([]);
    }
  }, [selectedDiscipline, selectedSaisonId]);

  useEffect(() => {
    if (
      selectedCategoryId &&
      !availableCategories.some((item) => item.id === selectedCategoryId)
    ) {
      setSelectedCategoryId(availableCategories[0]?.id ?? null);
      setSelectedCreneauIds([]);
      return;
    }
    if (!selectedCategoryId && availableCategories[0]) {
      setSelectedCategoryId(availableCategories[0].id);
    }
  }, [availableCategories, selectedCategoryId]);

  useEffect(() => {
    if (selectedType === "OPN") setSelectedCreneauIds([]);
  }, [selectedType]);

  useEffect(() => {
    setSelectedCreneauIds((items) =>
      items.filter((id) =>
        filteredCreneaux.some((creneau) => creneau.id === id),
      ),
    );
  }, [filteredCreneaux]);

  function formatAmount(value: number, digits = 0) {
    return `${new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value)} DZD`;
  }

  function getGenderLabel(sexe: string) {
    if (sexe === "M") return t("gender.male");
    if (sexe === "F") return t("gender.female");
    return t("gender.other");
  }

  function resetLookupSelection() {
    setLookupResult(null);
    setLookupError(null);
    setSearchedDossier("");
  }

  async function handleLookup() {
    if (!searchedDossier.trim()) {
      setLookupError(t("who.other.searchRequired"));
      setLookupResult(null);
      return;
    }
    startLookupTransition(async () => {
      const result = await lookupAdherent({
        numeroDossier: searchedDossier.trim(),
      });
      if (result.error) {
        setLookupResult(null);
        setLookupError(result.error);
        return;
      }
      setLookupError(null);
      setLookupResult(result);
      setSearchedDossier(result.numeroDossier ?? searchedDossier.trim());
    });
  }

  function handleSubmitRequest() {
    if (
      !canSubmit ||
      !selectedTarget ||
      !selectedDisciplineId ||
      !selectedSaisonId ||
      !selectedCategoryId
    ) {
      toast.error(t("toasts.incompleteTitle"), {
        description: t("toasts.incompleteDescription"),
      });
      return;
    }
    if (!reviewConsent) {
      toast.error(t("review.confirmRequired"));
      return;
    }
    startTransition(async () => {
      const result = await createAdherentAbonnement({
        adherentId: selectedTarget.id,
        disciplineId: selectedDisciplineId,
        saisonId: selectedSaisonId,
        categorieAgeId: selectedCategoryId,
        typeAbonnement: selectedType,
        creneauIds: selectedType === "OPN" ? [] : selectedCreneauIds,
      });
      if (result.error) {
        toast.error(t("toasts.createError"), { description: result.error });
        return;
      }
      setSubmittedRequest(true);
      toast.success(t("toasts.createSuccess"), {
        description: t("toasts.createSuccessDescription"),
      });
      router.push(`/${locale}/espace/abonnements`);
      router.refresh();
    });
  }

  const stepItems = [t("steps.who"), t("steps.builder"), t("steps.review")];
  const summaryItems = [
    {
      label: t("aside.profile"),
      value: selectedTarget
        ? `${selectedTarget.prenom} ${selectedTarget.nom}`
        : t("aside.toChoose"),
      hint: selectedTarget?.numeroDossier ?? t("aside.toChoose"),
    },
    {
      label: t("aside.profileAge"),
      value: selectedTarget
        ? t("who.ageChip", { value: selectedTarget.age })
        : t("aside.toChoose"),
    },
    {
      label: t("summaryLabels.space"),
      value: selectedEspace?.designation ?? t("aside.toChoose"),
    },
    {
      label: t("summaryLabels.discipline"),
      value: selectedDiscipline?.designation ?? t("aside.toChoose"),
    },
    {
      label: t("summaryLabels.season"),
      value: selectedSaison?.designation ?? t("aside.toChoose"),
      hint: selectedSaison?.dateRange,
    },
    {
      label: t("summaryLabels.category"),
      value: selectedCategory?.designation ?? t("aside.toChoose"),
      hint: selectedCategory?.ageRange,
    },
    {
      label: t("summaryLabels.formula"),
      value: selectedTypeOption?.label ?? t("aside.toChoose"),
    },
    {
      label: t("aside.estimatedAmount"),
      value: formatAmount(suggestedAmount, 2),
      hint: t("amount.autoCalculated"),
    },
  ];

  function renderSummaryBody() {
    return (
      <>
      <div className="space-y-3">
        {summaryItems.map((item) => (
          <SummaryCard
            key={item.label}
            label={item.label}
            value={item.value}
            hint={item.hint}
          />
        ))}
      </div>
      <div className="mt-6 rounded-[28px] border border-border/50 bg-background/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {t("summaryLabels.selectedSlots")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedType === "OPN" ? (
            <InlineChip label={t("summaryLabels.openAccess")} />
          ) : selectedCreneaux.length === 0 ? (
            <span className="rounded-full border border-dashed border-border/70 px-3 py-1.5 text-xs text-muted-foreground">
              {t("summaryLabels.noSpecificSlot")}
            </span>
          ) : (
            selectedCreneaux.map((creneau) => (
              <InlineChip
                key={creneau.id}
                label={`${t(`days.${DAY_KEYS[creneau.jourSemaine]}`)} ${creneau.heureDebut} - ${creneau.heureFin}`}
              />
            ))
          )}
        </div>
      </div>
      <div className="mt-6 rounded-[28px] border border-cyan-200 bg-cyan-50/80 p-4 dark:border-cyan-900/50 dark:bg-cyan-950/20">
        <p className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">
          {t("aside.verificationTitle")}
        </p>
        <ul className="mt-3 space-y-2 text-sm text-cyan-900/80 dark:text-cyan-100/80">
          <li>{t("aside.checks.subject")}</li>
          <li>{t("aside.checks.ageCategory")}</li>
          <li>{t("aside.checks.validSlots")}</li>
        </ul>
      </div>
      </>
    );
  }

  return (
    <div className="space-y-6 pb-52 xl:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" className="rounded-2xl">
          <Link href={`/espace/abonnements`}>
            <ArrowLeft className="size-4" />
            {t("backToSubscriptions")}
          </Link>
        </Button>
        <Badge variant="outline" className="rounded-full px-4 py-1.5">
          {t("ageDetected", { value: data.adherent.age })}
        </Badge>
      </div>
      <section className="overflow-hidden rounded-[32px] border border-border/50 bg-[linear-gradient(135deg,rgba(8,145,178,0.97),rgba(14,116,144,0.92),rgba(15,23,42,0.94))] p-6 text-white shadow-[0_30px_80px_rgba(8,145,178,0.22)]">
        <div className="max-w-3xl">
          <Badge className="border-white/10 bg-white/10 text-white">
            {t("hero.badge")}
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            {t("hero.title")}
          </h1>
          <p className="mt-3 text-sm text-cyan-50/90">{t("hero.subtitle")}</p>
        </div>
      </section>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="overflow-hidden rounded-[32px] border border-border/50 bg-white/80 shadow-sm backdrop-blur dark:bg-slate-950/50">
          <div className="border-b border-border/50 bg-white/90 p-6 backdrop-blur dark:bg-slate-950/80">
            <Stepper
              currentStep={step}
              items={stepItems}
              progressLabel={t("progressLabel", {
                current: step,
                total: stepItems.length,
              })}
              stepLabel={t("stepLabel", { value: step })}
            />
          </div>
          <div className="space-y-6 p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
                className="space-y-6"
              >
                {step === 1 ? (
                  <WhoStep
                    t={t}
                    adherent={data.adherent}
                    subjectMode={subjectMode}
                    searchedDossier={searchedDossier}
                    lookupPending={lookupPending}
                    lookupResult={lookupResult}
                    lookupError={lookupError}
                    onSearchDossierChange={setSearchedDossier}
                    onSelectSelf={() => {
                      setSubjectMode("self");
                      resetLookupSelection();
                    }}
                    onSelectOther={() => {
                      setSubjectMode("other");
                      setLookupError(null);
                    }}
                    onLookup={handleLookup}
                    onResetLookup={resetLookupSelection}
                    getGenderLabel={getGenderLabel}
                  />
                ) : null}
                {step === 2 ? (
                  <BuilderStep
                    t={t}
                    espaces={data.espaces}
                    saisons={data.saisons}
                    selectedEspaceId={selectedEspaceId}
                    selectedSaisonId={selectedSaisonId}
                    selectedDisciplineId={selectedDisciplineId}
                    selectedType={selectedType}
                    availableDisciplines={availableDisciplines}
                    selectedDiscipline={selectedDiscipline}
                    availableCategories={availableCategories}
                    selectedCategoryId={selectedCategoryId}
                    typeOptions={typeOptions}
                    filteredCreneaux={filteredCreneaux}
                    creneauxByDay={creneauxByDay}
                    selectedCreneauIds={selectedCreneauIds}
                    suggestedAmount={suggestedAmount}
                    onSelectEspace={(id) => {
                      setSelectedEspaceId(id);
                      setSelectedDisciplineId(null);
                      setSelectedCategoryId(null);
                      setSelectedCreneauIds([]);
                    }}
                    onSelectDiscipline={(id) => {
                      setSelectedDisciplineId(id);
                      setSelectedCreneauIds([]);
                    }}
                    onSelectSaison={(id) => {
                      setSelectedSaisonId(id);
                      setSelectedCreneauIds([]);
                    }}
                    onSelectCategory={(id) => {
                      setSelectedCategoryId(id);
                      setSelectedCreneauIds([]);
                    }}
                    onSelectType={setSelectedType}
                    onToggleCreneau={(id) => {
                      if (selectedType === "OPN") return;
                      setSelectedCreneauIds((items) =>
                        items.includes(id)
                          ? items.filter((value) => value !== id)
                          : [...items, id],
                      );
                    }}
                    formatAmount={formatAmount}
                  />
                ) : null}
                {step === 3 ? (
                  <ReviewStep
                    t={t}
                    selectedTarget={selectedTarget}
                    selectedEspace={selectedEspace}
                    selectedDiscipline={selectedDiscipline}
                    selectedSaison={selectedSaison}
                    selectedCategory={selectedCategory}
                    selectedType={selectedType}
                    selectedTypeOption={selectedTypeOption}
                    selectedCreneaux={selectedCreneaux}
                    suggestedAmount={suggestedAmount}
                    reviewConsent={reviewConsent}
                    submittedRequest={submittedRequest}
                    pending={pending}
                    onToggleReviewConsent={() =>
                      setReviewConsent((value) => !value)
                    }
                    onSubmitRequest={handleSubmitRequest}
                    formatAmount={formatAmount}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
            <div className="hidden items-center justify-between gap-4 lg:flex">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl"
                disabled={step === 1 || pending}
                onClick={() => setStep((value) => Math.max(1, value - 1))}
              >
                {t("buttons.previousStep")}
              </Button>
              {step < 3 ? (
                <div className="flex items-center gap-3">
                  {continueHint ? (
                    <p className="max-w-sm text-sm text-muted-foreground">
                      {continueHint}
                    </p>
                  ) : null}
                  <Button
                    type="button"
                    className="h-11 rounded-2xl"
                    disabled={!canContinue || pending}
                    onClick={() => canContinue && setStep((value) => value + 1)}
                  >
                    {t("buttons.continue")}
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </section>
        <aside className="hidden rounded-[32px] border border-border/50 bg-white/80 p-6 shadow-sm backdrop-blur dark:bg-slate-950/50 xl:sticky xl:top-6 xl:block xl:h-fit">
          <SectionHeading
            icon={Sparkles}
            title={t("aside.title")}
            subtitle={t("aside.subtitle")}
          />
          <div className="mt-6">{renderSummaryBody()}</div>
        </aside>
      </div>
      <div className="fixed inset-x-3 bottom-28 z-30 xl:hidden">
        <div className="overflow-hidden rounded-[28px] border border-border/50 bg-white/90 shadow-lg backdrop-blur dark:bg-slate-950/85">
          <button
            type="button"
            onClick={() => setMobileSummaryOpen((value) => !value)}
            className="flex w-full items-center justify-between gap-3 p-4 text-left"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t("aside.mobileSummary")}
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                {selectedTarget
                  ? `${selectedTarget.prenom} ${selectedTarget.nom}`
                  : t("aside.toChoose")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                {formatAmount(suggestedAmount)}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform",
                  mobileSummaryOpen && "rotate-180",
                )}
              />
            </div>
          </button>
          <AnimatePresence initial={false}>
            {mobileSummaryOpen ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden border-t border-border/50 p-4"
              >
                {renderSummaryBody()}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
      <div className="fixed inset-x-3 bottom-3 z-40 lg:hidden">
        <div className="rounded-[28px] border border-border/50 bg-white/95 p-3 shadow-lg backdrop-blur dark:bg-slate-950/90">
          {step < 3 && continueHint ? (
            <p className="px-1 pb-2 text-xs text-muted-foreground">
              {continueHint}
            </p>
          ) : null}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-2xl"
              disabled={step === 1 || pending}
              onClick={() => setStep((value) => Math.max(1, value - 1))}
            >
              {t("buttons.previousStep")}
            </Button>
            {step < 3 ? (
              <Button
                type="button"
                className="h-11 flex-1 rounded-2xl"
                disabled={!canContinue || pending}
                onClick={() => canContinue && setStep((value) => value + 1)}
              >
                {t("buttons.continue")}
                <ChevronRight className="size-4" />
              </Button>
            ) : (
              <div className="flex h-11 flex-1 items-center justify-center rounded-2xl border border-border/60 bg-muted/40 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t("steps.review")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
