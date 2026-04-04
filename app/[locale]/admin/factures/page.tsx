import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader, AdminSection, AdminPageShell } from "@/components/admin/AdminPage";
import { getTranslations } from "next-intl/server";
import { CreditCard, TrendingUp, Clock, FileText } from "lucide-react";

async function getFactures() {
  return prisma.facture.findMany({
    orderBy: { dateCreation: "desc" },
    include: { adherent: true },
    take: 50,
  });
}

export default async function FacturesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const dateLocale = locale === "en" ? "en-US" : locale === "ar" ? "ar-DZ" : "fr-FR";
  const factures = await getFactures();

  const totalPaye = factures.filter((f) => f.statut === "PAY").reduce((sum, f) => sum + Number(f.montantTtc), 0);
  const pending = factures.filter((f) => f.statut === "ATT").length;

  const statusStyle: Record<string, string> = {
    PAY: "fac-status-pay", ATT: "fac-status-att",
    ANN: "fac-status-ann", REM: "fac-status-rem",
  };
  const methodIcon: Record<string, string> = { ESP: "💵", VIR: "🏦", CHQ: "📄", TPE: "💳" };

  return (
    <AdminPageShell locale={locale}>
      <style>{`
        .fac-kpi-grid { display: grid; gap: 14px; grid-template-columns: 1fr; }
        @media (min-width: 640px) { .fac-kpi-grid { grid-template-columns: repeat(3, 1fr); } }
        .fac-kpi { border-radius: 14px; border: 1px solid hsl(var(--border)/0.5); background: hsl(var(--card)/0.8); backdrop-filter: blur(12px); padding: 18px 20px; display: flex; flex-direction: column; gap: 10px; position: relative; overflow: hidden; transition: transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease; }
        .fac-kpi:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .fac-kpi::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px; opacity: 0.6; }
        .fac-kpi.emerald::before { background: linear-gradient(90deg, transparent, hsl(var(--primary)), transparent); }
        .fac-kpi.amber::before   { background: linear-gradient(90deg, transparent, hsl(var(--accent)), transparent); }
        .fac-kpi.sky::before     { background: linear-gradient(90deg, transparent, hsl(var(--primary)), transparent); }
        .fac-kpi.emerald:hover { border-color: hsl(var(--primary)/0.25); }
        .fac-kpi.amber:hover   { border-color: hsl(var(--accent)/0.25); }
        .fac-kpi.sky:hover     { border-color: hsl(var(--primary)/0.25); }
        .fac-kpi-top { display: flex; align-items: center; justify-content: space-between; }
        .fac-kpi-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: hsl(var(--muted-foreground)); }
        .fac-kpi-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .fac-kpi-icon svg { width: 18px; height: 18px; }
        .fac-kpi-icon.emerald { background: hsl(var(--primary)/0.15); color: hsl(var(--primary)); }
        .fac-kpi-icon.amber   { background: hsl(var(--accent)/0.15);  color: hsl(var(--accent)); }
        .fac-kpi-icon.sky     { background: hsl(var(--primary)/0.15);  color: hsl(var(--primary)); }
        .fac-kpi-val { font-size: 26px; font-weight: 800; color: hsl(var(--foreground)); letter-spacing: -0.02em; line-height: 1; }
        .fac-status-badge { display: inline-flex; align-items: center; padding: 2px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
        .fac-status-pay { background: hsl(var(--primary)/0.12); color: hsl(var(--primary)); border: 1px solid hsl(var(--primary)/0.25); }
        .fac-status-att { background: hsl(var(--accent)/0.12); color: hsl(var(--accent)); border: 1px solid hsl(var(--accent)/0.25); }
        .fac-status-ann { background: hsl(var(--muted)/0.12); color: hsl(var(--muted-foreground)); border: 1px solid hsl(var(--muted)/0.2); }
        .fac-status-rem { background: hsl(var(--primary)/0.12); color: hsl(var(--primary)); border: 1px solid hsl(var(--primary)/0.25); }
        .fac-receipt { font-family: monospace; font-size: 11.5px; color: hsl(var(--muted-foreground)); }
        .fac-amount  { font-weight: 700; color: hsl(var(--foreground)); }
        .fac-method  { font-size: 12.5px; color: hsl(var(--muted-foreground)); display: flex; align-items: center; gap: 5px; }
        .fac-user-cell { display: flex; align-items: center; gap: 8px; }
        .fac-initials { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.8)); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: hsl(var(--primary-foreground)); flex-shrink: 0; }
        .fac-user-name { font-size: 13px; font-weight: 600; color: hsl(var(--foreground)); }
      `}</style>

      <AdminPageHeader
        title={t("facturesUi.pageTitle")}
        description={`${factures.length} facture${factures.length !== 1 ? "s" : ""}`}
        icon={<CreditCard />}
      />

      <div className="fac-kpi-grid">
        <div className="fac-kpi emerald">
          <div className="fac-kpi-top"><span className="fac-kpi-label">{t("facturesUi.kpis.totalPaid")}</span><div className="fac-kpi-icon emerald"><TrendingUp /></div></div>
          <div className="fac-kpi-val">{totalPaye.toLocaleString(dateLocale)} DA</div>
        </div>
        <div className="fac-kpi amber">
          <div className="fac-kpi-top"><span className="fac-kpi-label">{t("facturesUi.kpis.pending")}</span><div className="fac-kpi-icon amber"><Clock /></div></div>
          <div className="fac-kpi-val">{pending}</div>
        </div>
        <div className="fac-kpi sky">
          <div className="fac-kpi-top"><span className="fac-kpi-label">{t("facturesUi.kpis.totalInvoices")}</span><div className="fac-kpi-icon sky"><FileText /></div></div>
          <div className="fac-kpi-val">{factures.length}</div>
        </div>
      </div>

      <AdminSection title={t("facturesUi.listTitle")}>
        <div style={{ overflowX: "auto" }}>
          <table className="apg-table">
            <thead>
              <tr>
                <th>{t("facturesUi.table.receiptNumber")}</th>
                <th>{t("facturesUi.table.member")}</th>
                <th>{t("facturesUi.table.amount")}</th>
                <th>{t("facturesUi.table.paymentMethod")}</th>
                <th>{t("facturesUi.table.status")}</th>
                <th style={{ textAlign: "right" }}>{t("facturesUi.table.date")}</th>
              </tr>
            </thead>
            <tbody>
              {factures.map((facture) => {
                const initials = `${facture.adherent.prenom?.[0] ?? ""}${facture.adherent.nom?.[0] ?? ""}`.toUpperCase();
                return (
                  <tr key={facture.id}>
                    <td><span className="fac-receipt">{facture.numeroRecu || "—"}</span></td>
                    <td>
                      <div className="fac-user-cell">
                        <div className="fac-initials" aria-hidden="true">{initials}</div>
                        <span className="fac-user-name">{facture.adherent.prenom} {facture.adherent.nom}</span>
                      </div>
                    </td>
                    <td><span className="fac-amount">{Number(facture.montantTtc).toLocaleString(dateLocale)} DA</span></td>
                    <td><span className="fac-method"><span aria-hidden="true">{methodIcon[facture.modePaiement] ?? "💳"}</span>{t(`paymentMethods.${facture.modePaiement}`)}</span></td>
                    <td><span className={`fac-status-badge ${statusStyle[facture.statut] ?? "fac-status-ann"}`}>{t(`factureStatus.${facture.statut}`)}</span></td>
                    <td style={{ textAlign: "right", color: "hsl(var(--muted-foreground))", fontSize: 12 }}>{new Date(facture.dateCreation).toLocaleDateString(dateLocale)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminSection>
    </AdminPageShell>
  );
}