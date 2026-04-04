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
    "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.8))",
    "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.8))",
    "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.8))",
    "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.8))",
    "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.8))",
  ];

  return (
    <AdminPageShell locale={locale}>
      <style>{`
        .btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.8)); color: hsl(var(--primary-foreground)); font-size: 13px; font-weight: 600; border: none; cursor: pointer; box-shadow: 0 2px 8px hsl(var(--primary)/0.3); transition: opacity 150ms ease, transform 150ms ease; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-primary svg { width: 15px; height: 15px; }
        .mon-grid { display: grid; gap: 16px; grid-template-columns: 1fr; }
        @media (min-width: 640px) { .mon-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .mon-grid { grid-template-columns: repeat(3, 1fr); } }
        .mon-card { border-radius: 14px; border: 1px solid hsl(var(--border)/0.5); background: hsl(var(--card)/0.8); backdrop-filter: blur(12px); padding: 20px; display: flex; flex-direction: column; gap: 14px; transition: border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease; position: relative; overflow: hidden; }
        .mon-card::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, hsl(var(--primary)), transparent); opacity: 0; transition: opacity 200ms ease; }
        .mon-card:hover { border-color: hsl(var(--primary)/0.2); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .mon-card:hover::before { opacity: 0.6; }
        .mon-card-header { display: flex; align-items: center; gap: 14px; }
        .mon-avatar { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: hsl(var(--primary-foreground)); flex-shrink: 0; box-shadow: 0 0 16px hsl(var(--primary)/0.25); }
        .mon-name { font-size: 15px; font-weight: 700; color: hsl(var(--foreground)); }
        .mon-specialite { font-size: 12px; color: hsl(var(--primary)); margin-top: 2px; display: flex; align-items: center; gap: 4px; }
        .mon-info-row { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: hsl(var(--muted-foreground)); }
        .mon-info-row svg { color: hsl(var(--muted-foreground)); flex-shrink: 0; }
        .mon-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 1px solid hsl(var(--border)/0.3); }
        .mon-status-active   { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: hsl(var(--primary)/0.12); color: hsl(var(--primary)); border: 1px solid hsl(var(--primary)/0.25); }
        .mon-status-inactive { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: hsl(var(--muted)/0.12); color: hsl(var(--muted-foreground)); border: 1px solid hsl(var(--muted)/0.2); }
        .mon-empty { padding: 60px 20px; text-align: center; color: hsl(var(--muted-foreground)); font-size: 14px; }
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