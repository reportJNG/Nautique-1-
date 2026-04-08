"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Layers,
  Loader2,
  Lock,
  Search,
  Sparkles,
  UserRound,
  Users,
  Waves,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BeneficiaryCard,
  InlineChip,
  ScheduleSlotButton,
  SectionHeading,
  SelectionCard,
  SelectionGroupLabel,
  SummaryCard,
  TypeCard,
} from "./WizardUi";
import type {
  AdherentProfile,
  CategoryShape,
  CreneauShape,
  DisciplineShape,
  EspaceShape,
  SaisonShape,
  SubjectMode,
  TypeOption,
} from "./NouvelAbonnementClientImpl";
import type { LookupAdherentResult } from "./actions";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

type TFunc = ReturnType<typeof useTranslations>;

export function WhoStep({
  t,
  adherent,
  subjectMode,
  searchedDossier,
  lookupPending,
  lookupResult,
  lookupError,
  onSearchDossierChange,
  onSelectSelf,
  onSelectOther,
  onLookup,
  onResetLookup,
  getGenderLabel,
}: {
  t: TFunc;
  adherent: AdherentProfile;
  subjectMode: SubjectMode;
  searchedDossier: string;
  lookupPending: boolean;
  lookupResult: LookupAdherentResult | null;
  lookupError: string | null;
  onSearchDossierChange: (value: string) => void;
  onSelectSelf: () => void;
  onSelectOther: () => void;
  onLookup: () => void;
  onResetLookup: () => void;
  getGenderLabel: (sexe: string) => string;
}) {
  return (
    <>
      <SectionHeading
        icon={Users}
        title={t("sections.who.title")}
        subtitle={t("sections.who.subtitle")}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <BeneficiaryCard
          active={subjectMode === "self"}
          icon={UserRound}
          title={t("who.self.title")}
          subtitle={`${adherent.prenom} ${adherent.nom} · ${t("who.ageChip", { value: adherent.age })}`}
          onSelect={onSelectSelf}
        >
          <div className="flex flex-wrap gap-2">
            <InlineChip label={getGenderLabel(adherent.sexe)} />
            <InlineChip label={adherent.numeroDossier} />
          </div>
        </BeneficiaryCard>

        <BeneficiaryCard
          active={subjectMode === "other"}
          icon={Users}
          title={t("who.other.title")}
          subtitle={t("who.other.subtitle")}
          onSelect={onSelectOther}
        >
          <AnimatePresence initial={false}>
            {subjectMode === "other" ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                {lookupResult?.id ? (
                  <div className="rounded-[24px] border border-emerald-200 bg-emerald-50/90 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                          {lookupResult.prenom} {lookupResult.nom}
                        </p>
                        <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-100/80">
                          {t("who.ageChip", { value: lookupResult.age ?? 0 })} ·{" "}
                          {lookupResult.numeroDossier}
                        </p>
                      </div>
                      <InlineChip label={t("who.other.linked")} />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="mt-3 h-auto rounded-2xl px-0 text-sm text-emerald-700 hover:bg-transparent hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
                      onClick={onResetLookup}
                    >
                      {t("who.other.change")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Input
                        value={searchedDossier}
                        onChange={(event) =>
                          onSearchDossierChange(event.target.value)
                        }
                        placeholder={t("who.other.searchPlaceholder")}
                        className="h-11 rounded-2xl"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-2xl"
                        onClick={onLookup}
                        disabled={lookupPending}
                      >
                        <Search className="size-4" />
                        {t("who.other.searchButton")}
                      </Button>
                    </div>

                    <div className="min-h-5">
                      {lookupPending ? (
                        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="size-4 animate-spin" />
                          {t("who.other.searching")}
                        </div>
                      ) : lookupError ? (
                        <p className="text-sm text-red-600 dark:text-red-300">
                          {lookupError}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {t("who.other.helper")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </BeneficiaryCard>
      </div>
    </>
  );
}

export function BuilderStep({
  t,
  espaces,
  saisons,
  selectedEspaceId,
  selectedSaisonId,
  selectedDisciplineId,
  selectedType,
  availableDisciplines,
  selectedDiscipline,
  availableCategories,
  selectedCategoryId,
  typeOptions,
  filteredCreneaux,
  creneauxByDay,
  selectedCreneauIds,
  suggestedAmount,
  onSelectEspace,
  onSelectDiscipline,
  onSelectSaison,
  onSelectCategory,
  onSelectType,
  onToggleCreneau,
  formatAmount,
}: {
  t: TFunc;
  espaces: EspaceShape[];
  saisons: SaisonShape[];
  selectedEspaceId: number | null;
  selectedSaisonId: number | null;
  selectedDisciplineId: number | null;
  selectedType: TypeOption["id"];
  availableDisciplines: DisciplineShape[];
  selectedDiscipline: DisciplineShape | null;
  availableCategories: CategoryShape[];
  selectedCategoryId: number | null;
  typeOptions: TypeOption[];
  filteredCreneaux: CreneauShape[];
  creneauxByDay: Array<{
    key: string;
    label: string;
    items: CreneauShape[];
  }>;
  selectedCreneauIds: number[];
  suggestedAmount: number;
  onSelectEspace: (id: number) => void;
  onSelectDiscipline: (id: number) => void;
  onSelectSaison: (id: number) => void;
  onSelectCategory: (id: number) => void;
  onSelectType: (id: TypeOption["id"]) => void;
  onToggleCreneau: (id: number) => void;
  formatAmount: (value: number, digits?: number) => string;
}) {
  return (
    <>
      <SectionHeading
        icon={Layers}
        title={t("sections.builder.title")}
        subtitle={t("sections.builder.subtitle")}
      />

      <div className="space-y-3">
        <SelectionGroupLabel label={t("summaryLabels.space")} />
        <div className="grid gap-3 md:grid-cols-2">
          {espaces.map((espace) => (
            <SelectionCard
              key={espace.id}
              active={selectedEspaceId === espace.id}
              title={espace.designation}
              description={espace.description || t("spaceAvailable")}
              onClick={() => onSelectEspace(espace.id)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SelectionGroupLabel label={t("labels.discipline")} />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {availableDisciplines.map((discipline) => {
            const available = selectedSaisonId
              ? discipline.availableSaisonIds.includes(selectedSaisonId)
              : true;

            return (
              <SelectionCard
                key={discipline.id}
                active={selectedDisciplineId === discipline.id}
                disabled={!available}
                title={discipline.designation}
                description={t(
                  available
                    ? "availability.available"
                    : "availability.unavailable",
                )}
                tag={{
                  label: t(
                    available
                      ? "availability.available"
                      : "availability.unavailable",
                  ),
                  tone: available ? "green" : "muted",
                }}
                onClick={() => available && onSelectDiscipline(discipline.id)}
              />
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <SelectionGroupLabel label={t("labels.season")} />
        <div className="grid gap-3 md:grid-cols-2">
          {saisons.map((saison) => {
            const availableForDiscipline = selectedDiscipline
              ? selectedDiscipline.availableSaisonIds.includes(saison.id)
              : true;

            return (
              <SelectionCard
                key={saison.id}
                active={selectedSaisonId === saison.id}
                disabled={!availableForDiscipline}
                title={saison.designation}
                description={saison.dateRange}
                onClick={() => availableForDiscipline && onSelectSaison(saison.id)}
              />
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <SelectionGroupLabel label={t("labels.category")} />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {availableCategories.map((category) => (
            <SelectionCard
              key={category.id}
              active={selectedCategoryId === category.id}
              title={category.designation}
              description={category.ageRange}
              onClick={() => onSelectCategory(category.id)}
            />
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-border/50 bg-background/70 p-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <Sparkles className="size-3.5" />
          {t("eligibility.title")}
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          {t("eligibility.description")}
        </p>
      </div>

      <div className="space-y-3">
        <SelectionGroupLabel label={t("summaryLabels.formula")} />
        <div className="grid gap-3 md:grid-cols-3">
          {typeOptions.map((option) => (
            <TypeCard
              key={option.id}
              active={selectedType === option.id}
              title={option.label}
              description={option.description}
              amount={formatAmount(option.baseAmount)}
              icon={option.icon}
              onClick={() => onSelectType(option.id)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-[28px] border border-border/50 bg-background/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Waves className="size-3.5" />
            {t("slots.available")}
          </div>
          {selectedType === "OPN" ? (
            <Badge className="rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
              {t("slots.openBadge")}
            </Badge>
          ) : null}
        </div>

        {selectedType === "OPN" ? (
          <div className="rounded-[24px] border border-cyan-200 bg-cyan-50/80 p-5 dark:border-cyan-900/60 dark:bg-cyan-950/20">
            <div className="flex items-start gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200">
                <Lock className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">
                  {t("slots.openBadge")}
                </p>
                <p className="mt-1 text-sm text-cyan-900/80 dark:text-cyan-100/80">
                  {t("slots.openMessage")}
                </p>
              </div>
            </div>
          </div>
        ) : filteredCreneaux.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-border/70 bg-background/60 px-4 py-8 text-center text-sm text-muted-foreground">
            {t("slots.empty")}
          </div>
        ) : (
          <>
            <div className="hidden gap-3 lg:grid lg:grid-cols-7">
              {creneauxByDay.map((day) => (
                <div key={day.key} className="space-y-3">
                  <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {day.label}
                  </p>
                  <div className="space-y-2">
                    {day.items.map((creneau) => (
                      <ScheduleSlotButton
                        key={creneau.id}
                        checked={selectedCreneauIds.includes(creneau.id)}
                        onClick={() => onToggleCreneau(creneau.id)}
                        time={`${creneau.heureDebut} - ${creneau.heureFin}`}
                        group={creneau.groupe || t("slots.noGroup")}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 lg:hidden">
              {creneauxByDay
                .filter((day) => day.items.length > 0)
                .map((day) => (
                  <div key={day.key} className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {day.label}
                    </p>
                    <div className="space-y-2">
                      {day.items.map((creneau) => (
                        <ScheduleSlotButton
                          key={creneau.id}
                          checked={selectedCreneauIds.includes(creneau.id)}
                          onClick={() => onToggleCreneau(creneau.id)}
                          time={`${creneau.heureDebut} - ${creneau.heureFin}`}
                          group={creneau.groupe || t("slots.noGroup")}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      <div className="rounded-[28px] border border-border/50 bg-slate-50/80 p-4 dark:bg-slate-900/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {t("amount.label")}
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {formatAmount(suggestedAmount)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("amount.locked")}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white px-3 py-2 text-xs font-medium text-muted-foreground dark:bg-slate-950/60">
            <Lock className="size-3.5" />
            {t("amount.autoCalculated")}
          </div>
        </div>
      </div>
    </>
  );
}

export function ReviewStep({
  t,
  selectedTarget,
  selectedEspace,
  selectedDiscipline,
  selectedSaison,
  selectedCategory,
  selectedType,
  selectedTypeOption,
  selectedCreneaux,
  suggestedAmount,
  reviewConsent,
  submittedRequest,
  pending,
  onToggleReviewConsent,
  onSubmitRequest,
  formatAmount,
}: {
  t: TFunc;
  selectedTarget: AdherentProfile | null;
  selectedEspace: EspaceShape | null;
  selectedDiscipline: DisciplineShape | null;
  selectedSaison: SaisonShape | null;
  selectedCategory: CategoryShape | null;
  selectedType: TypeOption["id"];
  selectedTypeOption: TypeOption | null;
  selectedCreneaux: CreneauShape[];
  suggestedAmount: number;
  reviewConsent: boolean;
  submittedRequest: boolean;
  pending: boolean;
  onToggleReviewConsent: () => void;
  onSubmitRequest: () => void;
  formatAmount: (value: number, digits?: number) => string;
}) {
  return (
    <>
      <SectionHeading
        icon={CreditCard}
        title={t("sections.review.title")}
        subtitle={t("sections.review.subtitle")}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCard
          label={t("summaryLabels.forWhom")}
          value={
            selectedTarget
              ? `${selectedTarget.prenom} ${selectedTarget.nom}`
              : "-"
          }
          hint={selectedTarget?.numeroDossier ?? "-"}
        />
        <SummaryCard
          label={t("summaryLabels.spaceDiscipline")}
          value={`${selectedEspace?.designation ?? "-"} - ${selectedDiscipline?.designation ?? "-"}`}
        />
        <SummaryCard
          label={t("summaryLabels.season")}
          value={selectedSaison?.designation ?? "-"}
          hint={selectedSaison?.dateRange ?? "-"}
        />
        <SummaryCard
          label={t("summaryLabels.category")}
          value={selectedCategory?.designation ?? "-"}
          hint={selectedCategory?.ageRange ?? "-"}
        />
        <SummaryCard
          label={t("summaryLabels.formula")}
          value={selectedTypeOption?.label ?? "-"}
        />
        <SummaryCard
          label={t("summaryLabels.amount")}
          value={formatAmount(suggestedAmount, 2)}
          hint={t("amount.autoCalculated")}
        />
      </div>

      <div className="rounded-[28px] border border-border/50 bg-background/70 p-4">
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

      <div className="rounded-[28px] border border-amber-200 bg-amber-50/80 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            <AlertTriangle className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {t("review.submitTitle")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("review.submitDescription")}
            </p>
          </div>
        </div>
      </div>

      <div
        className={`rounded-[28px] border p-5 transition-all ${
          submittedRequest
            ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/40 dark:bg-emerald-950/20"
            : reviewConsent
              ? "border-cyan-300 bg-cyan-50/70 dark:border-cyan-900/60 dark:bg-cyan-950/20"
              : "border-border/50 bg-background/70"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {submittedRequest ? t("review.submitted") : t("review.submitAction")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("review.toggleDescription")}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={reviewConsent}
            disabled={submittedRequest}
            onClick={() => !submittedRequest && onToggleReviewConsent()}
            className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition-all ${
              reviewConsent || submittedRequest
                ? "border-cyan-500 bg-cyan-500"
                : "border-border/70 bg-muted/60"
            } ${submittedRequest ? "cursor-not-allowed border-emerald-500 bg-emerald-500" : ""}`}
          >
            <span
              className={`inline-flex size-6 items-center justify-center rounded-full bg-white shadow-sm transition-transform ${
                reviewConsent || submittedRequest ? "translate-x-6" : "translate-x-1"
              } ${submittedRequest ? "text-emerald-600" : "text-cyan-600"}`}
            >
              {submittedRequest ? <CheckCircle2 className="size-3.5" /> : null}
            </span>
          </button>
        </div>

        <AnimatePresence initial={false}>
          {submittedRequest ? (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-slate-950/40 dark:text-emerald-300"
            >
              <CheckCircle2 className="size-4" />
              {t("review.submitted")}
            </motion.div>
          ) : reviewConsent ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4"
            >
              <Button
                type="button"
                className="h-12 rounded-2xl"
                disabled={pending}
                onClick={onSubmitRequest}
              >
                {pending ? t("review.submitting") : t("review.confirmAction")}
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
}
