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

const FIELD_STYLE: React.CSSProperties = {
  width: "100%", padding: "9px 13px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8, color: "#e2f0ff", fontSize: 13.5,
  outline: "none", boxSizing: "border-box",
};
const LABEL_STYLE: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 5,
  fontSize: 11.5, fontWeight: 600, color: "#7a93b4",
  textTransform: "uppercase" as const, letterSpacing: "0.07em",
  marginBottom: 6,
};
const CARD_STYLE: React.CSSProperties = {
  borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(13,21,38,0.72)", backdropFilter: "blur(12px)",
  overflow: "hidden", marginBottom: 14,
};

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
      <style>{`
        .nab-sel-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 14px; cursor: pointer; border-radius: 8px;
          transition: background 150ms;
        }
        .nab-sel-item:hover { background: rgba(6,182,212,0.07); }
        .nab-sel-item.selected { background: rgba(6,182,212,0.12); border: 1px solid rgba(6,182,212,0.2); }
        .nab-sel-init {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg,#0ea5e9,#8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 800; color: #fff; flex-shrink: 0;
        }
        .nab-sel-name { font-size: 13px; font-weight: 600; color: #e2f0ff; }
        .nab-sel-dos  { font-size: 11px; color: #4a6280; font-family: monospace; }
        .nab-search-wrap { position: relative; margin-bottom: 10px; }
        .nab-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #4a6280; }
        .nab-search-input {
          width: 100%; padding: 8px 12px 8px 34px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; color: #e2f0ff; font-size: 13px; outline: none; box-sizing: border-box;
        }
        .nab-search-input:focus { border-color: rgba(6,182,212,0.35); }
        .nab-search-input::placeholder { color: #4a6280; }
        .nab-card-hdr {
          display: flex; align-items: center; gap: 9px;
          padding: 13px 18px 11px; border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .nab-card-icon {
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(6,182,212,0.12); border: 1px solid rgba(6,182,212,0.2);
          display: flex; align-items: center; justify-content: center; color: #06b6d4; flex-shrink: 0;
        }
        .nab-card-icon svg { width: 14px; }
        .nab-card-title { font-size: 13px; font-weight: 600; color: #e2f0ff; }
        .nab-footer {
          display: flex; align-items: center; gap: 10px; justify-content: flex-end;
          padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.04);
        }
        .nab-submit {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 22px; border-radius: 9px;
          background: linear-gradient(135deg,#0ea5e9,#06b6d4);
          color: #fff; font-size: 13.5px; font-weight: 600;
          border: none; cursor: pointer;
          box-shadow: 0 2px 12px rgba(6,182,212,0.35);
          transition: opacity 150ms, transform 150ms;
        }
        .nab-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .nab-back-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 7px 14px; border-radius: 8px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          color: #7a93b4; font-size: 13px; font-weight: 500;
          text-decoration: none; margin-bottom: 24px;
          transition: background 150ms, color 150ms;
        }
        .nab-back-btn:hover { background: rgba(255,255,255,0.08); color: #e2f0ff; }
        .nab-form-grid { display: grid; gap: 14px; }
        @media (min-width: 640px) { .nab-form-grid { grid-template-columns: 1fr 1fr; } }
        .nab-field { display: flex; flex-direction: column; }
        select.nab-select option { background: #0a1728; }
      `}</style>

      <Link href={`/${locale}/admin/abonnements`} className="nab-back-btn">
        <ArrowLeft size={14} />
        {t("abonnementsUi.new.back")}
      </Link>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#f0f9ff", letterSpacing: "-0.02em" }}>
          {t("abonnementsUi.new.title")}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1 — Select adherent */}
        <div style={CARD_STYLE}>
          <div className="nab-card-hdr">
            <div className="nab-card-icon"><User /></div>
            <span className="nab-card-title">{t("abonnementsUi.new.selectAdherentTitle")}</span>
          </div>
          <div style={{ padding: 18 }}>
            {selectedAdherent ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="nab-sel-init" aria-hidden="true">
                    {selectedAdherent.prenom[0]}{selectedAdherent.nom[0]}
                  </div>
                  <div>
                    <div className="nab-sel-name">{selectedAdherent.prenom} {selectedAdherent.nom}</div>
                    <div className="nab-sel-dos">{selectedAdherent.numeroDossier}</div>
                  </div>
                </div>
                <button type="button" onClick={() => setSelectedAdherent(null)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "#7a93b4", padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>
                  Changer
                </button>
              </div>
            ) : (
              <>
                <div className="nab-search-wrap">
                  <Search size={14} className="nab-search-icon" />
                  <input
                    type="text"
                    className="nab-search-input"
                    placeholder={t("abonnementsUi.new.searchPlaceholder")}
                    value={adherentSearch}
                    onChange={(e) => setAdherentSearch(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                  {filtered.length === 0 && (
                    <div style={{ padding: "20px", textAlign: "center", fontSize: 12.5, color: "#4a6280" }}>Aucun résultat</div>
                  )}
                  {filtered.map((a) => (
                    <div
                      key={a.id}
                      className="nab-sel-item"
                      onClick={() => { setSelectedAdherent(a); setAdherentSearch(""); }}
                    >
                      <div className="nab-sel-init" aria-hidden="true">{a.prenom[0]}{a.nom[0]}</div>
                      <div>
                        <div className="nab-sel-name">{a.prenom} {a.nom}</div>
                        <div className="nab-sel-dos">{a.numeroDossier}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Step 2 — Subscription details */}
        <div style={CARD_STYLE}>
          <div className="nab-card-hdr">
            <div className="nab-card-icon"><Dumbbell /></div>
            <span className="nab-card-title">Détails de l&apos;abonnement</span>
          </div>
          <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="nab-form-grid">
              <div className="nab-field">
                <label style={LABEL_STYLE}><Dumbbell size={12} />{t("abonnementsUi.new.disciplineLabel")}</label>
                <select name="disciplineId" style={FIELD_STYLE} className="nab-select" defaultValue="">
                  <option value="" disabled>{t("abonnementsUi.new.disciplineSelectPlaceholder")}</option>
                  {disciplines.map((d) => (
                    <option key={d.id} value={d.id}>{d.designation}</option>
                  ))}
                </select>
              </div>
              <div className="nab-field">
                <label style={LABEL_STYLE}>{t("abonnementsUi.new.subscriptionTypeLabel")}</label>
                <select name="typeAbonnement" style={FIELD_STYLE} className="nab-select" defaultValue="">
                  <option value="" disabled>Sélectionner</option>
                  <option value="OPN">{t("abonnementsUi.new.subscriptionTypeOptions.OPN")}</option>
                  <option value="DUR">{t("abonnementsUi.new.subscriptionTypeOptions.DUR")}</option>
                  <option value="SEA">{t("abonnementsUi.new.subscriptionTypeOptions.SEA")}</option>
                </select>
              </div>
            </div>

            <div className="nab-form-grid">
              <div className="nab-field">
                <label style={LABEL_STYLE}>Saison</label>
                <select name="saisonId" style={FIELD_STYLE} className="nab-select" defaultValue="">
                  <option value="" disabled>Sélectionner</option>
                  {saisons.map((s) => (
                    <option key={s.id} value={s.id}>{s.designation}</option>
                  ))}
                </select>
              </div>
              <div className="nab-field">
                <label style={LABEL_STYLE}>Catégorie d&apos;âge <span style={{ color: "#f87171" }}>*</span></label>
                <select name="categorieAgeId" style={FIELD_STYLE} className="nab-select" required defaultValue="">
                  <option value="" disabled>Sélectionner</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.designation}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="nab-field" style={{ maxWidth: 280 }}>
              <label style={LABEL_STYLE}><CreditCard size={12} />{t("abonnementsUi.new.subscriptionAmountLabel")}</label>
              <input
                name="montantTtc"
                type="number"
                step="0.01"
                min="0"
                style={FIELD_STYLE}
                placeholder={t("abonnementsUi.new.amountPlaceholder")}
              />
            </div>
          </div>

          <div className="nab-footer">
            <Link href={`/${locale}/admin/abonnements`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 9, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#7a93b4", fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
              {t("abonnementsUi.new.back")}
            </Link>
            <button type="submit" className="nab-submit" disabled={loading}>
              <Save size={15} />
              {loading ? "..." : t("abonnementsUi.new.submit")}
            </button>
          </div>
        </div>
      </form>
    </AdminPageShell>
  );
}
