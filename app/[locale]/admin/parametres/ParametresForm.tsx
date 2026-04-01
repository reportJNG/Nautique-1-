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
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Centre info card */}
      <div className="par-card">
        <div className="par-card-header">
          <div className="par-card-icon"><Building2 /></div>
          <div>
            <div className="par-card-title">{t("parametresUi.card.title")}</div>
            <div className="par-card-desc">Informations du centre nautique</div>
          </div>
        </div>
        <div className="par-card-body">
          <div className="par-field">
            <label className="par-label">
              <Building2 size={12} />
              {t("parametresUi.labels.designationCentre")}
            </label>
            <input
              name="designationCentre"
              className="par-input"
              defaultValue={dbParams?.designationCentre ?? ""}
              placeholder="Ex: Centre Nautique Municipal"
              required
            />
          </div>
          <div className="par-field-row">
            <div className="par-field">
              <label className="par-label">
                <Mail size={12} />
                {t("parametresUi.labels.email")}
              </label>
              <input
                name="emailCentre"
                type="email"
                className="par-input"
                defaultValue={dbParams?.emailCentre ?? ""}
                placeholder="contact@centre.dz"
              />
            </div>
            <div className="par-field">
              <label className="par-label">
                <Phone size={12} />
                {t("parametresUi.labels.telephone")}
              </label>
              <input
                name="telephoneCentre"
                className="par-input"
                defaultValue={dbParams?.telephoneCentre ?? ""}
                placeholder="+213 xx xx xx xx"
              />
            </div>
          </div>
          <div className="par-field">
            <label className="par-label">
              <MapPin size={12} />
              {t("parametresUi.labels.adresse")}
            </label>
            <input
              name="adresseCentre"
              className="par-input"
              defaultValue={dbParams?.adresseCentre ?? ""}
              placeholder="Adresse complète du centre"
            />
          </div>
        </div>
      </div>

      {/* Access tolerances */}
      <div className="par-card">
        <div className="par-card-header">
          <div className="par-card-icon"><Clock /></div>
          <div>
            <div className="par-card-title">Contrôle d&apos;Accès</div>
            <div className="par-card-desc">Tolérances horaires pour les entrées</div>
          </div>
        </div>
        <div className="par-card-body">
          <div className="par-field-row">
            <div className="par-field">
              <label className="par-label">
                <Clock size={12} />
                {t("parametresUi.labels.toleranceAdvance")}
              </label>
              <input
                name="toleranceAccesAvance"
                type="number"
                className="par-input"
                defaultValue={dbParams?.toleranceAccesAvance ?? 15}
                min={0} max={60}
              />
            </div>
            <div className="par-field">
              <label className="par-label">
                <Clock size={12} />
                {t("parametresUi.labels.toleranceDelay")}
              </label>
              <input
                name="toleranceAccesRetard"
                type="number"
                className="par-input"
                defaultValue={dbParams?.toleranceAccesRetard ?? 10}
                min={0} max={60}
              />
            </div>
          </div>
          <div style={{ paddingTop: 4 }}>
            <button type="submit" className="par-save-btn" disabled={loading}>
              <Save />
              {loading ? "..." : t("parametresUi.button.saveChanges")}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
