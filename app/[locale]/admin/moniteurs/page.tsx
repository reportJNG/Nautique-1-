import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader, AdminSection, AdminPageShell } from "@/components/admin/AdminPage";
import { getTranslations } from "next-intl/server";
import { UserCheck, Plus, Mail, Phone, Star } from "lucide-react";

async function getMoniteurs() {
  return prisma.moniteur.findMany({ orderBy: { nom: "asc" } });
}

export default async function MoniteursPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const moniteurs = await getMoniteurs();

  const avatarColors = [
    "linear-gradient(135deg,#0ea5e9,#06b6d4)",
    "linear-gradient(135deg,#8b5cf6,#06b6d4)",
    "linear-gradient(135deg,#10b981,#0ea5e9)",
    "linear-gradient(135deg,#f59e0b,#ef4444)",
    "linear-gradient(135deg,#06b6d4,#8b5cf6)",
  ];

  return (
    <AdminPageShell locale={locale}>
      <style>{`
        .btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: #fff; font-size: 13px; font-weight: 600; border: none; cursor: pointer; box-shadow: 0 2px 8px rgba(6,182,212,0.3); transition: opacity 150ms ease, transform 150ms ease; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-primary svg { width: 15px; height: 15px; }
        .mon-grid { display: grid; gap: 16px; grid-template-columns: 1fr; }
        @media (min-width: 640px) { .mon-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .mon-grid { grid-template-columns: repeat(3, 1fr); } }
        .mon-card { border-radius: 14px; border: 1px solid rgba(255,255,255,0.06); background: rgba(13,21,38,0.72); backdrop-filter: blur(12px); padding: 20px; display: flex; flex-direction: column; gap: 14px; transition: border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease; position: relative; overflow: hidden; }
        .mon-card::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, #06b6d4, transparent); opacity: 0; transition: opacity 200ms ease; }
        .mon-card:hover { border-color: rgba(6,182,212,0.2); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .mon-card:hover::before { opacity: 0.6; }
        .mon-card-header { display: flex; align-items: center; gap: 14px; }
        .mon-avatar { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: #fff; flex-shrink: 0; box-shadow: 0 0 16px rgba(6,182,212,0.25); }
        .mon-name { font-size: 15px; font-weight: 700; color: #f0f9ff; }
        .mon-specialite { font-size: 12px; color: #06b6d4; margin-top: 2px; display: flex; align-items: center; gap: 4px; }
        .mon-info-row { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: #7a93b4; }
        .mon-info-row svg { color: #4a6280; flex-shrink: 0; }
        .mon-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.04); }
        .mon-status-active   { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.25); }
        .mon-status-inactive { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: rgba(100,116,139,0.12); color: #94a3b8; border: 1px solid rgba(100,116,139,0.2); }
        .mon-empty { padding: 60px 20px; text-align: center; color: #4a6280; font-size: 14px; }
      `}</style>

      <AdminPageHeader
        title={t("moniteursUi.pageTitle")}
        description={`${moniteurs.length} moniteur${moniteurs.length !== 1 ? "s" : ""} enregistré${moniteurs.length !== 1 ? "s" : ""}`}
        icon={<UserCheck />}
        actions={<button className="btn-primary" type="button"><Plus />{t("moniteursUi.newButton")}</button>}
      />

      {moniteurs.length === 0 ? (
        <AdminSection><div className="mon-empty">{t("status.noData")}</div></AdminSection>
      ) : (
        <div className="mon-grid">
          {moniteurs.map((moniteur, idx) => {
            const initials = `${moniteur.prenom?.[0] ?? ""}${moniteur.nom?.[0] ?? ""}`.toUpperCase();
            return (
              <div key={moniteur.id} className="mon-card">
                <div className="mon-card-header">
                  <div className="mon-avatar" style={{ background: avatarColors[idx % avatarColors.length] }} aria-hidden="true">{initials}</div>
                  <div>
                    <div className="mon-name">{moniteur.prenom} {moniteur.nom}</div>
                    {moniteur.specialite && <div className="mon-specialite"><Star size={10} />{moniteur.specialite}</div>}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {moniteur.email && <div className="mon-info-row"><Mail size={13} />{moniteur.email}</div>}
                  {moniteur.telephone && <div className="mon-info-row"><Phone size={13} />{moniteur.telephone}</div>}
                </div>
                <div className="mon-footer">
                  <span className={moniteur.actif === 1 ? "mon-status-active" : "mon-status-inactive"}>
                    {moniteur.actif === 1 ? t("status.active") : t("status.inactive")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminPageShell>
  );
}