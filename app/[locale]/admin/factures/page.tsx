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
    PAY: "bg-primary/12 text-primary border border-primary/25",
    ATT: "bg-accent/12 text-accent border border-accent/25",
    ANN: "bg-muted/12 text-muted-foreground border border-muted/20",
    REM: "bg-primary/12 text-primary border border-primary/25",
  };
  const methodIcon: Record<string, string> = { ESP: "💵", VIR: "🏦", CHQ: "📄", TPE: "💳" };

  return (
    <AdminPageShell locale={locale}>
      <AdminPageHeader
        title={t("facturesUi.pageTitle")}
        description={`${factures.length} facture${factures.length !== 1 ? "s" : ""}`}
        icon={<CreditCard />}
      />

      {/* KPI Cards */}
      <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-3 mb-6">
        {/* Total Paid */}
        <div className="group relative rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-[18px] pt-5 flex flex-col gap-2.5 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:border-primary/25 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary before:to-transparent before:opacity-60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              {t("facturesUi.kpis.totalPaid")}
            </span>
            <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-foreground tracking-tight leading-none">
            {totalPaye.toLocaleString(dateLocale)} DA
          </div>
        </div>

        {/* Pending */}
        <div className="group relative rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-[18px] pt-5 flex flex-col gap-2.5 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:border-accent/25 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-accent before:to-transparent before:opacity-60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              {t("facturesUi.kpis.pending")}
            </span>
            <div className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-foreground tracking-tight leading-none">
            {pending}
          </div>
        </div>

        {/* Total Invoices */}
        <div className="group relative rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-[18px] pt-5 flex flex-col gap-2.5 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:border-primary/25 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary before:to-transparent before:opacity-60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              {t("facturesUi.kpis.totalInvoices")}
            </span>
            <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
          </div>
          <div className="text-[26px] font-extrabold text-foreground tracking-tight leading-none">
            {factures.length}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <AdminSection title={t("facturesUi.listTitle")}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="border-b border-border/30 bg-muted/10">
              <tr>
                <th className="px-3.5 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide text-left">
                  {t("facturesUi.table.receiptNumber")}
                </th>
                <th className="px-3.5 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide text-left">
                  {t("facturesUi.table.member")}
                </th>
                <th className="px-3.5 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide text-left">
                  {t("facturesUi.table.amount")}
                </th>
                <th className="px-3.5 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide text-left">
                  {t("facturesUi.table.paymentMethod")}
                </th>
                <th className="px-3.5 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide text-left">
                  {t("facturesUi.table.status")}
                </th>
                <th className="px-3.5 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide text-right">
                  {t("facturesUi.table.date")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {factures.map((facture) => {
                const initials = `${facture.adherent.prenom?.[0] ?? ""}${facture.adherent.nom?.[0] ?? ""}`.toUpperCase();
                return (
                  <tr key={facture.id} className="hover:bg-card/30 transition-colors">
                    <td className="px-3.5 py-2.5 align-middle">
                      <span className="font-mono text-[11.5px] text-muted-foreground">
                        {facture.numeroRecu || "—"}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
                          {initials}
                        </div>
                        <span className="text-[13px] font-semibold text-foreground">
                          {facture.adherent.prenom} {facture.adherent.nom}
                        </span>
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5 align-middle">
                      <span className="font-bold text-foreground">
                        {Number(facture.montantTtc).toLocaleString(dateLocale)} DA
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 align-middle">
                      <span className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                        <span aria-hidden="true">{methodIcon[facture.modePaiement] ?? "💳"}</span>
                        {t(`paymentMethods.${facture.modePaiement}`)}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 align-middle">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${statusStyle[facture.statut] ?? "bg-muted/12 text-muted-foreground border border-muted/20"}`}>
                        {t(`factureStatus.${facture.statut}`)}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 align-middle text-right text-xs text-muted-foreground">
                      {new Date(facture.dateCreation).toLocaleDateString(dateLocale)}
                    </td>
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