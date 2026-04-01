import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader, AdminSection, AdminPageShell } from "@/components/admin/AdminPage";
import { getTranslations } from "next-intl/server";
import { Calendar, Plus, Clock, LayoutGrid } from "lucide-react";

// Define the proper type for Next.js 15
type PageProps = {
  params: Promise<{ locale: string }>;
};

async function getSaisons() {
  return prisma.saison.findMany({
    orderBy: { dateDebut: "desc" },
    include: { _count: { select: { creneaux: true } } },
  });
}

export default async function SaisonsPage({ params }: PageProps) {
  // Await the params promise
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const dateLocale = locale === "en" ? "en-US" : locale === "ar" ? "ar-DZ" : "fr-FR";
  const saisons = await getSaisons();

  const statusStyle: Record<string, string> = {
    OUV: "sai-status-ouv",
    FER: "sai-status-fer",
    PRE: "sai-status-pre",
    CLO: "sai-status-clo",
  };
  return (
    <AdminPageShell locale={locale}>
      <style>{`
        .btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 8px;
          background: linear-gradient(135deg, #0ea5e9, #06b6d4);
          color: #fff; font-size: 13px; font-weight: 600;
          border: none; cursor: pointer;
          box-shadow: 0 2px 8px rgba(6,182,212,0.3);
          transition: opacity 150ms ease, transform 150ms ease;
        }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-primary svg { width: 15px; height: 15px; }

        .sai-grid {
          display: grid; gap: 16px; grid-template-columns: 1fr;
        }
        @media (min-width: 640px)  { .sai-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .sai-grid { grid-template-columns: repeat(3, 1fr); } }

        .sai-card {
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(13,21,38,0.72);
          backdrop-filter: blur(12px);
          padding: 20px;
          display: flex; flex-direction: column; gap: 14px;
          position: relative; overflow: hidden;
          transition: border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease;
        }
        .sai-card::after {
          content: "";
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          opacity: 0; transition: opacity 200ms ease;
        }
        .sai-card.ouv::after  { background: linear-gradient(90deg, transparent, #10b981, transparent); }
        .sai-card.fer::after  { background: linear-gradient(90deg, transparent, #94a3b8, transparent); }
        .sai-card.pre::after  { background: linear-gradient(90deg, transparent, #0ea5e9, transparent); }
        .sai-card.clo::after  { background: linear-gradient(90deg, transparent, #f87171, transparent); }
        .sai-card:hover {
          border-color: rgba(6,182,212,0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .sai-card:hover::after { opacity: 0.7; }

        .sai-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
        .sai-title { font-size: 16px; font-weight: 700; color: #f0f9ff; letter-spacing: -0.01em; }

        .sai-status-badge {
          display: inline-flex; align-items: center; padding: 2px 10px;
          border-radius: 20px; font-size: 10.5px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap;
        }
        .sai-status-ouv { background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.25); }
        .sai-status-fer { background: rgba(100,116,139,0.12); color: #94a3b8; border: 1px solid rgba(100,116,139,0.2); }
        .sai-status-pre { background: rgba(14,165,233,0.12); color: #0ea5e9; border: 1px solid rgba(14,165,233,0.25); }
        .sai-status-clo { background: rgba(248,113,113,0.12); color: #f87171; border: 1px solid rgba(248,113,113,0.25); }

        .sai-info { display: flex; flex-direction: column; gap: 7px; }
        .sai-info-row { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: #7a93b4; }
        .sai-info-row svg { color: #4a6280; flex-shrink: 0; }

        .sai-footer {
          display: flex; align-items: center; justify-content: flex-end;
          padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.04);
        }
        .sai-slots-chip {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(6,182,212,0.08); border: 1px solid rgba(6,182,212,0.15);
          border-radius: 8px; padding: 3px 10px;
          font-size: 12px; font-weight: 700; color: #06b6d4;
        }
      `}</style>

      <AdminPageHeader
        title={t("saisonsUi.pageTitle")}
        description={`${saisons.length} saison${saisons.length !== 1 ? "s" : ""}`}
        icon={<Calendar />}
        actions={
          <button className="btn-primary" type="button">
            <Plus />
            {t("saisonsUi.newButton")}
          </button>
        }
      />

      {saisons.length === 0 ? (
        <AdminSection>
          <div style={{ padding: "60px 20px", textAlign: "center", color: "#4a6280", fontSize: 14 }}>
            {t("status.noData")}
          </div>
        </AdminSection>
      ) : (
        <div className="sai-grid">
          {saisons.map((saison) => {
            const statusKey = saison.statut?.toLowerCase() ?? "fer";
            const clazz = statusStyle[saison.statut] ?? "sai-status-fer";
            return (
              <div key={saison.id} className={`sai-card ${statusKey}`}>
                <div className="sai-header">
                  <div className="sai-title">{saison.designation}</div>
                  <span className={`sai-status-badge ${clazz}`}>
                    {t(`saisonStatus.${saison.statut}`)}
                  </span>
                </div>

                <div className="sai-info">
                  <div className="sai-info-row">
                    <Clock size={13} />
                    {t("saisonsUi.detail.dateRange", {
                      start: new Date(saison.dateDebut).toLocaleDateString(dateLocale),
                      end: new Date(saison.dateFin).toLocaleDateString(dateLocale),
                    })}
                  </div>
                </div>

                <div className="sai-footer">
                  <div className="sai-slots-chip">
                    <LayoutGrid size={12} />
                    {t("saisonsUi.cards.slots", { count: saison._count.creneaux })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminPageShell>
  );
}