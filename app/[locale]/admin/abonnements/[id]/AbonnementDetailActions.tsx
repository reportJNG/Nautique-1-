"use client";

import { useAdminToast } from "@/components/admin/AdminToast";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import React from "react";

interface AbonnementDetailActionsProps {
  abonnementId: number;
  statut: string;
  locale: string;
}

const BTN_BASE: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center",
  padding: "9px 16px", borderRadius: 9, width: "100%",
  fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
  transition: "opacity 150ms ease, transform 150ms ease",
  marginBottom: 8,
};

export function AbonnementDetailActions({ abonnementId, statut, locale }: AbonnementDetailActionsProps) {
  const t = useTranslations("admin");
  const { toast } = useAdminToast();
  const router = useRouter();
  const [loading, setLoading] = React.useState<string | null>(null);

  async function callAction(action: string) {
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/abonnements/${abonnementId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      setLoading(null);

      if (data.error) {
        toast({ variant: "error", title: t("toast.updateError.title"), description: data.error });
      } else {
        toast({ variant: "success", title: t("toast.updateSuccess.title"), description: t("toast.updateSuccess.desc") });
        router.refresh();
      }
    } catch {
      setLoading(null);
      toast({ variant: "error", title: t("toast.updateError.title"), description: t("toast.updateError.desc") });
    }
  }

  const btnDisabled = (action: string) => loading === action;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {statut === "CRE" && (
        <button
          type="button"
          style={{ ...BTN_BASE, background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", boxShadow: "0 2px 10px rgba(245,158,11,0.3)" }}
          onClick={() => callAction("to_atp")}
          disabled={btnDisabled("to_atp")}
        >
          <Clock size={14} />
          {loading === "to_atp" ? "..." : t("abonnementsUi.detail.actions.metToATP")}
        </button>
      )}

      {(statut === "ATP" || statut === "ATT") && (
        <button
          type="button"
          style={{ ...BTN_BASE, background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", boxShadow: "0 2px 10px rgba(16,185,129,0.3)" }}
          onClick={() => callAction("validate_payment")}
          disabled={btnDisabled("validate_payment")}
        >
          <CheckCircle2 size={14} />
          {loading === "validate_payment" ? "..." : t("abonnementsUi.detail.actions.validatePayment")}
        </button>
      )}

      {statut === "APP" && (
        <button
          type="button"
          style={{ ...BTN_BASE, background: "linear-gradient(135deg,#0ea5e9,#06b6d4)", color: "#fff", boxShadow: "0 2px 10px rgba(6,182,212,0.3)" }}
          onClick={() => callAction("activate")}
          disabled={btnDisabled("activate")}
        >
          <CheckCircle2 size={14} />
          {loading === "activate" ? "..." : t("abonnementsUi.detail.actions.activate")}
        </button>
      )}

      {(statut !== "ANL" && statut !== "EXP") && (
        <button
          type="button"
          style={{ ...BTN_BASE, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171", marginBottom: 0 }}
          onClick={() => callAction("cancel")}
          disabled={btnDisabled("cancel")}
        >
          <XCircle size={14} />
          {loading === "cancel" ? "..." : t("abonnementsUi.detail.actions.cancel")}
        </button>
      )}

      {(statut === "ANL" || statut === "EXP") && (
        <div style={{ textAlign: "center", fontSize: 12, color: "#4a6280", padding: "12px 0" }}>
          {statut === "ANL" ? "Abonnement annulé" : "Abonnement expiré"}
        </div>
      )}
    </div>
  );
}
