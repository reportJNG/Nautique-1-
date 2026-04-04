import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader, AdminPageShell } from "@/components/admin/AdminPage";
import { getTranslations } from "next-intl/server";
import { Settings, Clock } from "lucide-react";
import { ParametresForm } from "./ParametresForm";

async function getParametres() {
  return prisma.parametres.findFirst();
}

export default async function ParametresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const dbParams = await getParametres();

  return (
    <AdminPageShell locale={locale}>
      <style>{`
        .par-form-grid {
          display: grid; gap: 20px;
        }
        @media (min-width: 768px) {
          .par-form-grid { grid-template-columns: minmax(0,2fr) minmax(0,1fr); }
        }

        .par-card {
          border-radius: 14px;
          border: 1px solid hsl(var(--border)/0.5);
          background: hsl(var(--card)/0.8);
          backdrop-filter: blur(12px);
          overflow: hidden;
          transition: border-color 200ms ease;
        }
        .par-card:hover { border-color: hsl(var(--primary)/0.12); }

        .par-card-header {
          display: flex; align-items: center; gap: 10px;
          padding: 16px 20px 14px;
          border-bottom: 1px solid hsl(var(--border)/0.3);
        }
        .par-card-icon {
          width: 34px; height: 34px; border-radius: 9px;
          background: hsl(var(--primary)/0.12);
          border: 1px solid hsl(var(--primary)/0.2);
          display: flex; align-items: center; justify-content: center;
          color: hsl(var(--primary)); flex-shrink: 0;
        }
        .par-card-icon svg { width: 16px; height: 16px; }
        .par-card-title { font-size: 14px; font-weight: 600; color: hsl(var(--foreground)); }
        .par-card-desc  { font-size: 12px; color: hsl(var(--muted-foreground)); margin-top: 2px; }

        .par-card-body { padding: 20px; display: flex; flex-direction: column; gap: 18px; }

        .par-field { display: flex; flex-direction: column; gap: 6px; }
        .par-field-row { display: grid; gap: 14px; }
        @media (min-width: 480px) { .par-field-row { grid-template-columns: 1fr 1fr; } }

        .par-label {
          font-size: 11.5px; font-weight: 600; color: hsl(var(--muted-foreground));
          text-transform: uppercase; letter-spacing: 0.07em;
          display: flex; align-items: center; gap: 5px;
        }
        .par-label svg { color: hsl(var(--muted-foreground)); }

        .par-input {
          width: 100%; padding: 9px 13px;
          background: hsl(var(--muted)/0.1);
          border: 1px solid hsl(var(--border)/0.5);
          border-radius: 8px;
          color: hsl(var(--foreground)); font-size: 13.5px;
          transition: border-color 180ms ease, box-shadow 180ms ease;
          outline: none; box-sizing: border-box;
        }
        .par-input::placeholder { color: hsl(var(--muted-foreground)); }
        .par-input:focus {
          border-color: hsl(var(--primary)/0.4);
          box-shadow: 0 0 0 3px hsl(var(--primary)/0.08);
        }
        .par-input[type="number"] { font-variant-numeric: tabular-nums; }

        .par-save-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 8px;
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.8));
          color: hsl(var(--primary-foreground)); font-size: 13.5px; font-weight: 600;
          border: none; cursor: pointer;
          box-shadow: 0 2px 12px hsl(var(--primary)/0.35);
          transition: opacity 150ms ease, transform 150ms ease;
        }
        .par-save-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .par-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .par-save-btn svg { width: 15px; height: 15px; }

        .par-info-card {
          border-radius: 12px;
          border: 1px solid hsl(var(--primary)/0.12);
          background: hsl(var(--primary)/0.05);
          padding: 16px;
        }
        .par-info-title { font-size: 12px; font-weight: 700; color: hsl(var(--primary)); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.06em; }
        .par-info-row { display: flex; align-items: flex-start; gap: 6px; font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.5; padding: 3px 0; }
        .par-info-row svg { color: hsl(var(--muted-foreground)); margin-top: 2px; flex-shrink: 0; }
        .par-divider { height: 1px; background: hsl(var(--border)/0.3); margin: 2px 0; }
      `}</style>

      <AdminPageHeader
        title={t("parametresUi.title")}
        description={t("parametresUi.card.title")}
        icon={<Settings />}
      />

      <div className="par-form-grid">
        {/* Form (client component handles toasts) */}
        <ParametresForm dbParams={dbParams} />

        {/* Info aside */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="par-info-card">
            <div className="par-info-title">ℹ️ À propos</div>
            <div className="par-info-row">
              <Settings size={12} />
              Ces paramètres s&apos;appliquent à l&apos;ensemble du système.
            </div>
            <div className="par-divider" />
            <div className="par-info-row">
              <Clock size={12} />
              La tolérance d&apos;avance permet aux adhérents d&apos;entrer avant l&apos;heure de début du créneau.
            </div>
            <div className="par-info-row">
              <Clock size={12} />
              La tolérance de retard permet l&apos;entrée après le début du créneau.
            </div>
          </div>

          {dbParams && (
            <div className="par-card" style={{ padding: 16 }}>
              <div className="par-card-title" style={{ marginBottom: 10, fontSize: 12 }}>Informations système</div>
              <div className="par-info-row" style={{ fontSize: 11.5 }}>
                <Settings size={11} />
                ID: {dbParams.id}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminPageShell>
  );
}