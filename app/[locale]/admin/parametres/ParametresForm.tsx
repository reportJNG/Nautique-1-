"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Save, Building2, Mail, Phone, MapPin, Clock } from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminToast";
import { updateParametres } from "./actions";

interface ParametresFormProps {
  dbParams: {
    id: number;
    designationCentre: string;
    emailCentre: string | null;
    telephoneCentre: string | null;
    adresseCentre: string | null;
    toleranceAccesAvance: number;
    toleranceAccesRetard: number;
  } | null;
}

export function ParametresForm({ dbParams }: ParametresFormProps) {
  const t = useTranslations("admin");
  const { toast } = useAdminToast();
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const result = await updateParametres(formData);
    setLoading(false);

    if (result?.error) {
      toast({
        variant: "error",
        title: t("toast.settingsError.title"),
        description: result.error,
      });
    } else {
      toast({
        variant: "success",
        title: t("toast.settingsSaved.title"),
        description: t("toast.settingsSaved.desc"),
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 border-b border-border/30 bg-primary/4 px-5 pb-3.5 pt-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/12 text-primary">
            <Building2 size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              {t("parametresUi.card.title")}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {t("parametresUi.card.centerInfo")}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Building2 size={12} />
              {t("parametresUi.labels.designationCentre")}
            </label>
            <input
              name="designationCentre"
              className="w-full rounded-lg border border-border/50 bg-muted/10 px-3.5 py-2.5 text-[13.5px] text-foreground outline-none transition-all duration-180 placeholder:text-muted-foreground focus:border-primary/40 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
              defaultValue={dbParams?.designationCentre ?? ""}
              placeholder={t("parametresUi.placeholders.designationCentre")}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Mail size={12} />
                {t("parametresUi.labels.email")}
              </label>
              <input
                name="emailCentre"
                type="email"
                className="w-full rounded-lg border border-border/50 bg-muted/10 px-3.5 py-2.5 text-[13.5px] text-foreground outline-none transition-all duration-180 placeholder:text-muted-foreground focus:border-primary/40 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
                defaultValue={dbParams?.emailCentre ?? ""}
                placeholder={t("parametresUi.placeholders.emailCentre")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Phone size={12} />
                {t("parametresUi.labels.telephone")}
              </label>
              <input
                name="telephoneCentre"
                className="w-full rounded-lg border border-border/50 bg-muted/10 px-3.5 py-2.5 text-[13.5px] text-foreground outline-none transition-all duration-180 placeholder:text-muted-foreground focus:border-primary/40 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
                defaultValue={dbParams?.telephoneCentre ?? ""}
                placeholder={t("parametresUi.placeholders.telephoneCentre")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
              <MapPin size={12} />
              {t("parametresUi.labels.adresse")}
            </label>
            <input
              name="adresseCentre"
              className="w-full rounded-lg border border-border/50 bg-muted/10 px-3.5 py-2.5 text-[13.5px] text-foreground outline-none transition-all duration-180 placeholder:text-muted-foreground focus:border-primary/40 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
              defaultValue={dbParams?.adresseCentre ?? ""}
              placeholder={t("parametresUi.placeholders.adresseCentre")}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 border-b border-border/30 bg-primary/4 px-5 pb-3.5 pt-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/12 text-primary">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              {t("parametresUi.accessCard.title")}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {t("parametresUi.accessCard.subtitle")}
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Clock size={12} />
                {t("parametresUi.labels.toleranceAdvance")}
              </label>
              <input
                name="toleranceAccesAvance"
                type="number"
                className="w-full rounded-lg border border-border/50 bg-muted/10 px-3.5 py-2.5 text-[13.5px] text-foreground outline-none transition-all duration-180 focus:border-primary/40 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
                defaultValue={dbParams?.toleranceAccesAvance ?? 15}
                min={0}
                max={60}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Clock size={12} />
                {t("parametresUi.labels.toleranceDelay")}
              </label>
              <input
                name="toleranceAccesRetard"
                type="number"
                className="w-full rounded-lg border border-border/50 bg-muted/10 px-3.5 py-2.5 text-[13.5px] text-foreground outline-none transition-all duration-180 focus:border-primary/40 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
                defaultValue={dbParams?.toleranceAccesRetard ?? 10}
                min={0}
                max={60}
              />
            </div>
          </div>

          <div className="pt-5">
            <button
              type="submit"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-none bg-gradient-to-br from-primary to-primary/80 px-6 py-2.5 text-[13.5px] font-semibold text-primary-foreground shadow-[0_2px_10px_hsl(var(--primary)/0.3)] transition-all duration-150 hover:-translate-y-px hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              <Save size={16} />
              {loading ? "..." : t("parametresUi.button.saveChanges")}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
