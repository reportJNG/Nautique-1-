"use client";

import { useAdminToast } from "@/components/admin/AdminToast";
import { useTranslations } from "next-intl";
import { updateParametres } from "./actions";
import React from "react";
import { Save, Building2, Mail, Phone, MapPin, Clock } from "lucide-react";

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await updateParametres(fd);
    setLoading(false);

    if (result?.error) {
      toast({ variant: "error", title: t("toast.settingsError.title"), description: result.error });
    } else {
      toast({ variant: "success", title: t("toast.settingsSaved.title"), description: t("toast.settingsSaved.desc") });
    }
  }

  return (
    <form className="flex flex-col gap-4">
      {/* Centre info card */}
      <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-3.5 border-b border-border/30 bg-primary/4">
          <div className="w-9 h-9 rounded-lg bg-primary/12 border border-primary/25 flex items-center justify-center text-primary shrink-0">
            <Building2 size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              {t("parametresUi.card.title")}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Informations du centre nautique
            </div>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide">
              <Building2 size={12} />
              {t("parametresUi.labels.designationCentre")}
            </label>
            <input
              name="designationCentre"
              className="w-full py-2.5 px-3.5 bg-muted/10 border border-border/50 rounded-lg text-foreground text-[13.5px] outline-none transition-all duration-180 focus:border-primary/40 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)] placeholder:text-muted-foreground"
              defaultValue={dbParams?.designationCentre ?? ""}
              placeholder="Ex: Centre Nautique Municipal"
              required
            />
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide">
                <Mail size={12} />
                {t("parametresUi.labels.email")}
              </label>
              <input
                name="emailCentre"
                type="email"
                className="w-full py-2.5 px-3.5 bg-muted/10 border border-border/50 rounded-lg text-foreground text-[13.5px] outline-none transition-all duration-180 focus:border-primary/40 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)] placeholder:text-muted-foreground"
                defaultValue={dbParams?.emailCentre ?? ""}
                placeholder="contact@centre.dz"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide">
                <Phone size={12} />
                {t("parametresUi.labels.telephone")}
              </label>
              <input
                name="telephoneCentre"
                className="w-full py-2.5 px-3.5 bg-muted/10 border border-border/50 rounded-lg text-foreground text-[13.5px] outline-none transition-all duration-180 focus:border-primary/40 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)] placeholder:text-muted-foreground"
                defaultValue={dbParams?.telephoneCentre ?? ""}
                placeholder="+213 xx xx xx xx"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide">
              <MapPin size={12} />
              {t("parametresUi.labels.adresse")}
            </label>
            <input
              name="adresseCentre"
              className="w-full py-2.5 px-3.5 bg-muted/10 border border-border/50 rounded-lg text-foreground text-[13.5px] outline-none transition-all duration-180 focus:border-primary/40 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)] placeholder:text-muted-foreground"
              defaultValue={dbParams?.adresseCentre ?? ""}
              placeholder="Adresse complète du centre"
            />
          </div>
        </div>
      </div>

      {/* Access tolerances card */}
      <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-3.5 border-b border-border/30 bg-primary/4">
          <div className="w-9 h-9 rounded-lg bg-primary/12 border border-primary/25 flex items-center justify-center text-primary shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              Contrôle d&apos;Accès
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Tolérances horaires pour les entrées
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide">
                <Clock size={12} />
                {t("parametresUi.labels.toleranceAdvance")}
              </label>
              <input
                name="toleranceAccesAvance"
                type="number"
                className="w-full py-2.5 px-3.5 bg-muted/10 border border-border/50 rounded-lg text-foreground text-[13.5px] outline-none transition-all duration-180 focus:border-primary/40 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
                defaultValue={dbParams?.toleranceAccesAvance ?? 15}
                min={0}
                max={60}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide">
                <Clock size={12} />
                {t("parametresUi.labels.toleranceDelay")}
              </label>
              <input
                name="toleranceAccesRetard"
                type="number"
                className="w-full py-2.5 px-3.5 bg-muted/10 border border-border/50 rounded-lg text-foreground text-[13.5px] outline-none transition-all duration-180 focus:border-primary/40 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
                defaultValue={dbParams?.toleranceAccesRetard ?? 10}
                min={0}
                max={60}
              />
            </div>
          </div>

          <div className="pt-5">
            <button
              type="submit"
              className="inline-flex items-center gap-2 py-2.5 px-6 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-[13.5px] font-semibold border-none cursor-pointer shadow-[0_2px_10px_hsl(var(--primary)/0.3)] transition-all duration-150 hover:opacity-90 hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
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