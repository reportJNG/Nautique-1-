import { prisma } from "@/lib/db/prisma";
import { getTranslations } from "next-intl/server";
import { AdminPageShell } from "@/components/admin/AdminPage";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer, FileText, User, Hash, Dumbbell, CreditCard, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { FactureDetailActions } from "./FactureDetailActions";

async function getFacture(id: number) {
  return prisma.facture.findUnique({
    where: { id },
    include: { adherent: true, abonnement: { include: { discipline: true } } },
  });
}

export default async function FactureDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const dateLocale = locale === "en" ? "en-US" : locale === "ar" ? "ar-DZ" : "fr-FR";
  const facture = await getFacture(parseInt(id));
  if (!facture) notFound();

  const isPaid = facture.statut === "PAY";
  const methodEmoji: Record<string, string> = { ESP: "💵", VIR: "🏦", CHQ: "📄", TPE: "💳", CSH: "💵", CRT: "💳" };

  return (
    <AdminPageShell locale={locale}>
      <style>{`
        .fcd-back {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 7px 14px; border-radius: 8px;
          background: hsl(var(--muted)/0.1); border: 1px solid hsl(var(--border)/0.5);
          color: hsl(var(--muted-foreground)); font-size: 13px; font-weight: 500;
          text-decoration: none; margin-bottom: 24px;
          transition: background 150ms, color 150ms;
        }
        .fcd-back:hover { background: hsl(var(--muted)/0.15); color: hsl(var(--foreground)); }

        .fcd-layout { display: grid; gap: 20px; }
        @media (min-width: 768px) { .fcd-layout { grid-template-columns: 1fr auto; align-items: start; } }

        /* ── Receipt card ── */
        .fcd-receipt {
          border-radius: 16px; overflow: hidden;
          border: 1px solid hsl(var(--border)/0.5);
          background: hsl(var(--card)/0.9); backdrop-filter: blur(16px);
          width: 100%; max-width: 540px;
        }

        .fcd-receipt-header {
          padding: 24px 28px 20px; text-align: center;
          background: linear-gradient(135deg, hsl(var(--primary)/0.08), hsl(var(--primary)/0.04));
          border-bottom: 1px solid hsl(var(--border)/0.3);
          position: relative;
        }
        .fcd-receipt-logo {
          font-size: 11px; font-weight: 800; letter-spacing: 0.15em;
          color: hsl(var(--primary)); text-transform: uppercase; margin-bottom: 4px;
        }
        .fcd-receipt-title { font-size: 20px; font-weight: 800; color: hsl(var(--foreground)); }
        .fcd-receipt-subtitle { font-size: 12px; color: hsl(var(--muted-foreground)); margin-top: 2px; }

        .fcd-receipt-status-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 24px; border-bottom: 1px solid hsl(var(--border)/0.3);
          background: hsl(var(--muted)/0.1);
        }
        .fcd-receipt-num { font-family: monospace; font-size: 13px; font-weight: 700; color: hsl(var(--primary)); }
        .fcd-status-paid { display: inline-flex; align-items: center; gap: 5px; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; background: hsl(var(--primary)/0.12); color: hsl(var(--primary)); border: 1px solid hsl(var(--primary)/0.25); }
        .fcd-status-att  { display: inline-flex; align-items: center; gap: 5px; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; background: hsl(var(--accent)/0.12); color: hsl(var(--accent)); border: 1px solid hsl(var(--accent)/0.25); }

        .fcd-receipt-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 0; }
        .fcd-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 0; border-bottom: 1px solid hsl(var(--border)/0.2);
          gap: 12px;
        }
        .fcd-row:last-child { border-bottom: none; }
        .fcd-row-left { display: flex; align-items: center; gap: 8px; }
        .fcd-row-icon { color: hsl(var(--muted-foreground)); flex-shrink: 0; }
        .fcd-row-label { font-size: 12.5px; color: hsl(var(--muted-foreground)); }
        .fcd-row-val { font-size: 13.5px; font-weight: 600; color: hsl(var(--foreground)); text-align: right; }
        .fcd-row-total { font-size: 18px; font-weight: 800; color: hsl(var(--foreground)); text-align: right; }

        .fcd-total-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 24px; margin: 0;
          border-top: 1px solid hsl(var(--primary)/0.15);
          background: hsl(var(--primary)/0.04);
        }
        .fcd-total-label { font-size: 14px; font-weight: 700; color: hsl(var(--foreground)); }

        .fcd-paid-on { padding: 12px 24px 20px; text-align: center; font-size: 12px; color: hsl(var(--muted-foreground)); }

        /* ── Action panel ── */
        .fcd-actions {
          display: flex; flex-direction: column; gap: 10px; min-width: 200px;
        }
        .fcd-action-card {
          border-radius: 12px; border: 1px solid hsl(var(--border)/0.5);
          background: hsl(var(--card)/0.8); backdrop-filter: blur(12px);
          overflow: hidden;
        }
        .fcd-action-hdr {
          padding: 12px 16px 10px; border-bottom: 1px solid hsl(var(--border)/0.3);
          font-size: 12px; font-weight: 700; color: hsl(var(--muted-foreground)); letter-spacing: 0.06em; text-transform: uppercase;
        }
        .fcd-action-body { padding: 14px; display: flex; flex-direction: column; gap: 8px; }

        .fcd-print-btn {
          display: inline-flex; align-items: center; gap: 7px; justify-content: center;
          padding: 9px 16px; border-radius: 8px; width: 100%;
          background: hsl(var(--muted)/0.1); border: 1px solid hsl(var(--border)/0.5);
          color: hsl(var(--muted-foreground)); font-size: 13px; font-weight: 500; cursor: pointer;
          transition: background 150ms, color 150ms;
        }
        .fcd-print-btn:hover { background: hsl(var(--muted)/0.15); color: hsl(var(--foreground)); }
        .fcd-print-btn svg { width: 14px; }
      `}</style>

      <Link href={`/${locale}/admin/factures`} className="fcd-back">
        <ArrowLeft size={14} />
        {t("facturesUi.listTitle")}
      </Link>

      <div className="fcd-layout">
        {/* Receipt */}
        <div className="fcd-receipt">
          <div className="fcd-receipt-header">
            <div className="fcd-receipt-logo">Centre Nautique SONATRACH</div>
            <div className="fcd-receipt-title">{t("facturesUi.detail.receipt.headerTitle")}</div>
            <div className="fcd-receipt-subtitle">{t("facturesUi.detail.receipt.subtitle")}</div>
          </div>

          <div className="fcd-receipt-status-row">
            <span className="fcd-receipt-num">{facture.numeroRecu || "—"}</span>
            <span className={isPaid ? "fcd-status-paid" : "fcd-status-att"}>
              {isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
              {t(`factureStatus.${facture.statut}`)}
            </span>
          </div>

          <div className="fcd-receipt-body">
            <div className="fcd-row">
              <div className="fcd-row-left">
                <User size={13} className="fcd-row-icon" />
                <span className="fcd-row-label">{t("facturesUi.detail.labels.member")}</span>
              </div>
              <span className="fcd-row-val">{facture.adherent.prenom} {facture.adherent.nom}</span>
            </div>
            <div className="fcd-row">
              <div className="fcd-row-left">
                <Hash size={13} className="fcd-row-icon" />
                <span className="fcd-row-label">{t("facturesUi.detail.labels.fileNumber")}</span>
              </div>
              <span className="fcd-row-val" style={{ fontFamily: "monospace" }}>{facture.adherent.numeroDossier}</span>
            </div>
            <div className="fcd-row">
              <div className="fcd-row-left">
                <Dumbbell size={13} className="fcd-row-icon" />
                <span className="fcd-row-label">{t("facturesUi.detail.labels.discipline")}</span>
              </div>
              <span className="fcd-row-val">{facture.abonnement.discipline.designation}</span>
            </div>
            <div className="fcd-row">
              <div className="fcd-row-left">
                <CreditCard size={13} className="fcd-row-icon" />
                <span className="fcd-row-label">{t("facturesUi.detail.labels.paymentMethod")}</span>
              </div>
              <span className="fcd-row-val">
                {methodEmoji[facture.modePaiement] ?? "💳"} {t(`paymentMethods.${facture.modePaiement}`)}
              </span>
            </div>
          </div>

          <div className="fcd-total-row">
            <span className="fcd-total-label">{t("facturesUi.detail.labels.totalAmount")}</span>
            <span className="fcd-row-total">
              {Number(facture.montantTtc).toLocaleString(dateLocale)} DA
            </span>
          </div>

          {facture.datePaiement && (
            <div className="fcd-paid-on">
              {t("facturesUi.detail.paidOn", {
                date: new Date(facture.datePaiement).toLocaleDateString(dateLocale),
              })}
            </div>
          )}
        </div>

        {/* Action panel */}
        <div className="fcd-actions">
          <div className="fcd-action-card">
            <div className="fcd-action-hdr">Actions</div>
            <div className="fcd-action-body">
              {!isPaid && (
                <FactureDetailActions factureId={facture.id} locale={locale} />
              )}
              <button
                type="button"
                className="fcd-print-btn"
                onClick={() => window.print()}
              >
                <Printer size={14} />
                {t("facturesUi.detail.print")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}