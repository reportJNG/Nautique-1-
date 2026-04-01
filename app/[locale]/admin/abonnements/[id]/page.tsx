import React from "react";
import { prisma } from "@/lib/db/prisma";
import { getTranslations } from "next-intl/server";
import { AdminPageShell } from "@/components/admin/AdminPage";
import { notFound } from "next/navigation";
import {
  ArrowLeft, User, Dumbbell, Waves, CreditCard, Calendar,
  CheckCircle2, Clock, XCircle, ReceiptText
} from "lucide-react";
import Link from "next/link";
import { AbonnementDetailActions } from "./AbonnementDetailActions";

async function getAbonnement(id: number) {
  return prisma.abonnement.findUnique({
    where: { id },
    include: {
      adherent: true,
      discipline: { include: { espace: true } },
      saison: true,
      categorieAge: true,
      factures: { orderBy: { dateCreation: "desc" } },
    },
  });
}

export default async function AbonnementDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const dateLocale = locale === "en" ? "en-US" : locale === "ar" ? "ar-DZ" : "fr-FR";
  const abo = await getAbonnement(parseInt(id));
  if (!abo) notFound();

  const initials = `${abo.adherent.prenom?.[0] ?? ""}${abo.adherent.nom?.[0] ?? ""}`.toUpperCase();

  const statusBadge: Record<string, { cls: string; icon: React.ReactNode }> = {
    ACT: { cls: "abd-s-act", icon: <CheckCircle2 size={11} /> },
    CRE: { cls: "abd-s-cre", icon: <Clock size={11} /> },
    ATP: { cls: "abd-s-atp", icon: <Clock size={11} /> },
    APP: { cls: "abd-s-app", icon: <CheckCircle2 size={11} /> },
    ANL: { cls: "abd-s-anl", icon: <XCircle size={11} /> },
    EXP: { cls: "abd-s-exp", icon: <XCircle size={11} /> },
    ATT: { cls: "abd-s-atp", icon: <Clock size={11} /> },
  };
  const sb = statusBadge[abo.statut] ?? { cls: "abd-s-anl", icon: null };

  const factureStatusStyle: Record<string, string> = {
    PAY: "abd-fac-pay", ATT: "abd-fac-att", ANN: "abd-fac-ann",
  };

  return (
    <AdminPageShell locale={locale}>
      <style>{`
        .abd-back {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 7px 14px; border-radius: 8px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          color: #7a93b4; font-size: 13px; font-weight: 500;
          text-decoration: none; margin-bottom: 24px;
          transition: background 150ms, color 150ms;
        }
        .abd-back:hover { background: rgba(255,255,255,0.08); color: #e2f0ff; }

        .abd-grid { display: grid; gap: 16px; }
        @media (min-width: 900px) { .abd-grid { grid-template-columns: 1fr 340px; } }

        .abd-card {
          border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);
          background: rgba(13,21,38,0.72); backdrop-filter: blur(12px);
          overflow: hidden;
        }
        .abd-card-hdr {
          display: flex; align-items: center; gap: 9px;
          padding: 13px 18px 11px; border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .abd-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .abd-icon.cyan { background: rgba(6,182,212,0.12); color: #06b6d4; border: 1px solid rgba(6,182,212,0.2); }
        .abd-icon.purple { background: rgba(139,92,246,0.12); color: #a78bfa; border: 1px solid rgba(139,92,246,0.2); }
        .abd-icon.emerald { background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .abd-icon svg { width: 14px; height: 14px; }
        .abd-card-title { font-size: 13px; font-weight: 600; color: #e2f0ff; }
        .abd-card-body { padding: 18px; }

        .abd-hero {
          display: flex; align-items: center; gap: 16px; margin-bottom: 18px;
          padding-bottom: 18px; border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .abd-initials {
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 800; color: #fff; flex-shrink: 0;
        }
        .abd-hero-name { font-size: 16px; font-weight: 700; color: #f0f9ff; }
        .abd-hero-sub { font-size: 12px; color: #4a6280; margin-top: 2px; font-family: monospace; }

        .abd-row {
          display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
          padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .abd-row:last-child { border-bottom: none; }
        .abd-lbl { font-size: 12px; color: #7a93b4; display: flex; align-items: center; gap: 5px; }
        .abd-lbl svg { color: #4a6280; }
        .abd-val { font-size: 13.5px; font-weight: 600; color: #e2f0ff; text-align: right; }

        /* Status badges */
        .abd-status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 600; }
        .abd-s-act { background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.25); }
        .abd-s-cre { background: rgba(96,165,250,0.12); color: #60a5fa; border: 1px solid rgba(96,165,250,0.25); }
        .abd-s-atp { background: rgba(245,158,11,0.12); color: #f59e0b; border: 1px solid rgba(245,158,11,0.25); }
        .abd-s-app { background: rgba(6,182,212,0.12); color: #22d3ee; border: 1px solid rgba(6,182,212,0.25); }
        .abd-s-anl { background: rgba(100,116,139,0.12); color: #94a3b8; border: 1px solid rgba(100,116,139,0.2); }
        .abd-s-exp { background: rgba(248,113,113,0.12); color: #f87171; border: 1px solid rgba(248,113,113,0.25); }

        /* Amount */
        .abd-amount { font-size: 24px; font-weight: 800; color: #f0f9ff; letter-spacing: -0.02em; }
        .abd-amount-unit { font-size: 14px; color: #7a93b4; font-weight: 400; }

        /* Factures list */
        .abd-fac-row {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .abd-fac-row:last-child { border-bottom: none; }
        .abd-fac-num { font-size: 12px; font-family: monospace; color: #22d3ee; }
        .abd-fac-date { font-size: 11.5px; color: #4a6280; }
        .abd-fac-badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
        .abd-fac-pay { background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.25); }
        .abd-fac-att { background: rgba(245,158,11,0.12); color: #f59e0b; border: 1px solid rgba(245,158,11,0.25); }
        .abd-fac-ann { background: rgba(100,116,139,0.12); color: #94a3b8; border: 1px solid rgba(100,116,139,0.2); }
        .abd-fac-empty { padding: 20px; text-align: center; font-size: 12.5px; color: #4a6280; }
      `}</style>

      <Link href={`/${locale}/admin/abonnements`} className="abd-back">
        <ArrowLeft size={14} />
        {t("abonnementsUi.pageTitle")}
      </Link>

      <div className="abd-grid">
        {/* Main info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="abd-card">
            <div className="abd-card-hdr">
              <div className="abd-icon cyan"><Dumbbell /></div>
              <span className="abd-card-title">{t("abonnementsUi.detail.cards.informations")}</span>
            </div>
            <div className="abd-card-body">
              {/* Adherent hero */}
              <div className="abd-hero">
                <div className="abd-initials" aria-hidden="true">{initials}</div>
                <div>
                  <div className="abd-hero-name">{abo.adherent.prenom} {abo.adherent.nom}</div>
                  <div className="abd-hero-sub">{abo.adherent.numeroDossier}</div>
                </div>
              </div>

              <div className="abd-row">
                <span className="abd-lbl"><Dumbbell size={12} />{t("abonnementsUi.detail.labels.discipline")}</span>
                <span className="abd-val">{abo.discipline.designation}</span>
              </div>
              <div className="abd-row">
                <span className="abd-lbl"><Waves size={12} />{t("abonnementsUi.detail.labels.space")}</span>
                <span className="abd-val">{abo.discipline.espace.code} — {abo.discipline.espace.designation}</span>
              </div>
              <div className="abd-row">
                <span className="abd-lbl"><Calendar size={12} />Saison</span>
                <span className="abd-val">{abo.saison.designation}</span>
              </div>
              <div className="abd-row">
                <span className="abd-lbl"><CreditCard size={12} />Type</span>
                <span className="abd-val">{abo.typeAbonnement}</span>
              </div>
              <div className="abd-row">
                <span className="abd-lbl">{t("abonnementsUi.detail.labels.status")}</span>
                <span className={`abd-status-badge ${sb.cls}`}>{sb.icon}{t(`abonnementStatus.${abo.statut}`)}</span>
              </div>
            </div>
          </div>

          {/* Factures */}
          <div className="abd-card">
            <div className="abd-card-hdr">
              <div className="abd-icon emerald"><ReceiptText /></div>
              <span className="abd-card-title">Factures ({abo.factures.length})</span>
            </div>
            <div className="abd-card-body" style={{ padding: "0 18px" }}>
              {abo.factures.length === 0 ? (
                <div className="abd-fac-empty">Aucune facture</div>
              ) : (
                abo.factures.map((fac) => (
                  <div key={fac.id} className="abd-fac-row">
                    <div>
                      <div className="abd-fac-num">{fac.numeroRecu || "—"}</div>
                      <div className="abd-fac-date">
                        {new Date(fac.dateCreation).toLocaleDateString(dateLocale)}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#e2f0ff" }}>
                        {Number(fac.montantTtc).toLocaleString(dateLocale)} DA
                      </span>
                      <span className={`abd-fac-badge ${factureStatusStyle[fac.statut] ?? "abd-fac-att"}`}>
                        {t(`factureStatus.${fac.statut}`)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Amount */}
          <div className="abd-card">
            <div className="abd-card-hdr">
              <div className="abd-icon emerald"><CreditCard /></div>
              <span className="abd-card-title">{t("abonnementsUi.detail.labels.amount")}</span>
            </div>
            <div className="abd-card-body" style={{ textAlign: "center", padding: "20px 18px" }}>
              <div className="abd-amount">
                {Number(abo.montantTtc).toLocaleString(dateLocale)}
                <span className="abd-amount-unit"> DA</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="abd-card">
            <div className="abd-card-hdr">
              <div className="abd-icon purple"><User /></div>
              <span className="abd-card-title">{t("abonnementsUi.detail.cards.actions")}</span>
            </div>
            <div className="abd-card-body">
              <AbonnementDetailActions
                abonnementId={abo.id}
                statut={abo.statut}
                locale={locale}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
