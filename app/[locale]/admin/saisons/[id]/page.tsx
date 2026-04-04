import { prisma } from "@/lib/db/prisma";
import { getTranslations } from "next-intl/server";
import { AdminPageShell } from "@/components/admin/AdminPage";
import { notFound } from "next/navigation";
import { Calendar, CalendarRange, Clock, ArrowLeft, Dumbbell } from "lucide-react";
import Link from "next/link";

async function getSaison(id: number) {
  return prisma.saison.findUnique({
    where: { id },
    include: {
      periodes: true,
      creneaux: {
        include: { discipline: true },
        orderBy: [{ jourSemaine: "asc" }, { heureDebut: "asc" }],
      },
    },
  });
}

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export default async function SaisonDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const dateLocale = locale === "en" ? "en-US" : locale === "ar" ? "ar-DZ" : "fr-FR";
  const saison = await getSaison(parseInt(id));
  if (!saison) notFound();

  const statutColor: Record<string, { cls: string; label: string }> = {
    OUV: { cls: "sai-stat-ouv", label: t("saisonStatus.OUV") },
    FER: { cls: "sai-stat-fer", label: t("saisonStatus.FER") },
    CLO: { cls: "sai-stat-clo", label: t("saisonStatus.CLO") },
  };
  const stat = statutColor[saison.statut] ?? { cls: "sai-stat-fer", label: saison.statut };

  return (
    <AdminPageShell locale={locale}>
      <style>{`
        .sai-back {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 7px 14px; border-radius: 8px;
          background: hsl(var(--muted)/0.1); border: 1px solid hsl(var(--border)/0.5);
          color: hsl(var(--muted-foreground)); font-size: 13px; font-weight: 500;
          text-decoration: none; margin-bottom: 24px;
          transition: background 150ms, color 150ms;
        }
        .sai-back:hover { background: hsl(var(--muted)/0.15); color: hsl(var(--foreground)); }

        .sai-hero {
          padding: 20px 24px; border-radius: 14px;
          border: 1px solid hsl(var(--border)/0.5);
          background: hsl(var(--card)/0.8); backdrop-filter: blur(12px);
          margin-bottom: 16px; display: flex; align-items: flex-start;
          gap: 16px; position: relative; overflow: hidden;
        }
        .sai-hero::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, hsl(var(--primary)/0.4), transparent);
        }
        .sai-hero-icon {
          width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
          background: hsl(var(--primary)/0.12); border: 1px solid hsl(var(--primary)/0.2);
          display: flex; align-items: center; justify-content: center; color: hsl(var(--primary));
        }
        .sai-hero-icon svg { width: 22px; height: 22px; }
        .sai-hero-title { font-size: 20px; font-weight: 800; color: hsl(var(--foreground)); }
        .sai-hero-dates { font-size: 12.5px; color: hsl(var(--muted-foreground)); margin-top: 4px; display: flex; align-items: center; gap: 5px; }
        .sai-hero-badges { display: flex; gap: 8px; margin-top: 8px; }
        .sai-stat-ouv { display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:700;background:hsl(var(--primary)/0.12);color:hsl(var(--primary));border:1px solid hsl(var(--primary)/0.25); }
        .sai-stat-fer { display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:700;background:hsl(var(--muted)/0.12);color:hsl(var(--muted-foreground));border:1px solid hsl(var(--muted)/0.2); }
        .sai-stat-clo { display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:700;background:hsl(var(--destructive)/0.12);color:hsl(var(--destructive));border:1px solid hsl(var(--destructive)/0.25); }
        .sai-count-chip { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:hsl(var(--primary)/0.1);color:hsl(var(--primary));border:1px solid hsl(var(--primary)/0.2); }

        .sai-grid { display: grid; gap: 14px; }
        @media (min-width: 900px) { .sai-grid { grid-template-columns: 2fr 1fr; } }

        .sai-card {
          border-radius: 14px; border: 1px solid hsl(var(--border)/0.5);
          background: hsl(var(--card)/0.8); backdrop-filter: blur(12px); overflow: hidden;
        }
        .sai-card-hdr {
          display: flex; align-items: center; gap: 9px;
          padding: 13px 18px 11px; border-bottom: 1px solid hsl(var(--border)/0.3);
        }
        .sai-card-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .sai-card-icon.cyan { background: hsl(var(--primary)/0.12); color: hsl(var(--primary)); border: 1px solid hsl(var(--primary)/0.2); }
        .sai-card-icon.purple { background: hsl(var(--primary)/0.12); color: hsl(var(--primary)); border: 1px solid hsl(var(--primary)/0.2); }
        .sai-card-icon svg { width: 14px; height: 14px; }
        .sai-card-title { font-size: 13px; font-weight: 600; color: hsl(var(--foreground)); }

        /* Creneaux table */
        .apg-table { width: 100%; border-collapse: collapse; }
        .apg-table thead th { padding: 10px 14px; font-size: 11px; font-weight: 700; color: hsl(var(--muted-foreground)); text-transform: uppercase; letter-spacing: 0.08em; text-align: left; border-bottom: 1px solid hsl(var(--border)/0.3); background: hsl(var(--muted)/0.1); }
        .apg-table tbody tr { border-bottom: 1px solid hsl(var(--border)/0.2); transition: background 120ms; }
        .apg-table tbody tr:hover { background: hsl(var(--primary)/0.03); }
        .apg-table tbody tr:last-child { border-bottom: none; }
        .apg-table td { padding: 10px 14px; font-size: 13px; color: hsl(var(--foreground)); vertical-align: middle; }
        .apg-table td strong { color: hsl(var(--foreground)); font-weight: 600; }
        .apg-table-empty { padding: 40px 20px; text-align: center; color: hsl(var(--muted-foreground)); font-size: 13px; }

        /* Day badge */
        .sai-day-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11.5px; font-weight: 600; background: hsl(var(--primary)/0.1); color: hsl(var(--primary)); border: 1px solid hsl(var(--primary)/0.2); }
        .sai-time { display: inline-flex; align-items: center; gap: 4px; font-size: 12.5px; color: hsl(var(--muted-foreground)); }

        /* Periods */
        .sai-period { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border-bottom: 1px solid hsl(var(--border)/0.2); }
        .sai-period:last-child { border-bottom: none; }
        .sai-period-icon { width: 28px; height: 28px; border-radius: 7px; background: hsl(var(--primary)/0.1); border: 1px solid hsl(var(--primary)/0.2); display: flex; align-items: center; justify-content: center; color: hsl(var(--primary)); flex-shrink: 0; }
        .sai-period-icon svg { width: 13px; }
        .sai-period-text { font-size: 13px; color: hsl(var(--foreground)); }
        .sai-period-empty { padding: 24px 18px; text-align: center; color: hsl(var(--muted-foreground)); font-size: 13px; }
      `}</style>

      <Link href={`/${locale}/admin/saisons`} className="sai-back">
        <ArrowLeft size={14} />
        {t("saisonsUi.pageTitle")}
      </Link>

      {/* Hero */}
      <div className="sai-hero">
        <div className="sai-hero-icon"><Calendar /></div>
        <div>
          <div className="sai-hero-title">{saison.designation}</div>
          <div className="sai-hero-dates">
            <CalendarRange size={12} />
            {t("saisonsUi.detail.dateRange", {
              start: new Date(saison.dateDebut).toLocaleDateString(dateLocale),
              end: new Date(saison.dateFin).toLocaleDateString(dateLocale),
            })}
          </div>
          <div className="sai-hero-badges">
            <span className={stat.cls}>{stat.label}</span>
            <span className="sai-count-chip"><Dumbbell size={10} />{saison.creneaux.length} créneaux</span>
            <span className="sai-count-chip"><CalendarRange size={10} />{saison.periodes.length} périodes</span>
          </div>
        </div>
      </div>

      <div className="sai-grid">
        {/* Creneaux */}
        <div className="sai-card">
          <div className="sai-card-hdr">
            <div className="sai-card-icon cyan"><Dumbbell /></div>
            <span className="sai-card-title">{t("saisonsUi.detail.cards.creneaux")} ({saison.creneaux.length})</span>
          </div>
          {saison.creneaux.length === 0 ? (
            <div className="apg-table-empty">Aucun créneau dans cette saison</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="apg-table">
                <thead>
                  <tr>
                    <th>{t("saisonsUi.detail.table.discipline")}</th>
                    <th>{t("saisonsUi.detail.table.day")}</th>
                    <th>{t("saisonsUi.detail.table.schedule")}</th>
                    <th>{t("saisonsUi.detail.table.group")}</th>
                  </tr>
                </thead>
                <tbody>
                  {saison.creneaux.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.discipline.designation}</strong></td>
                      <td><span className="sai-day-badge">{t(`days.${DAY_KEYS[c.jourSemaine]}`)}</span></td>
                      <td>
                        <span className="sai-time">
                          <Clock size={11} />
                          {new Date(c.heureDebut).toTimeString().slice(0, 5)} – {new Date(c.heureFin).toTimeString().slice(0, 5)}
                        </span>
                      </td>
                      <td>{c.groupe || <span style={{ color: "hsl(var(--muted-foreground))" }}>—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Periodes */}
        <div className="sai-card">
          <div className="sai-card-hdr">
            <div className="sai-card-icon purple"><CalendarRange /></div>
            <span className="sai-card-title">{t("saisonsUi.detail.cards.periodes")} ({saison.periodes.length})</span>
          </div>
          {saison.periodes.length === 0 ? (
            <div className="sai-period-empty">{t("saisonsUi.detail.emptyPeriods")}</div>
          ) : (
            <div>
              {saison.periodes.map((p) => (
                <div key={p.id} className="sai-period">
                  <div className="sai-period-icon"><CalendarRange /></div>
                  <span className="sai-period-text">
                    {t("saisonsUi.detail.dateRange", {
                      start: new Date(p.dateDebut).toLocaleDateString(dateLocale),
                      end: new Date(p.dateFin).toLocaleDateString(dateLocale),
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminPageShell>
  );
}