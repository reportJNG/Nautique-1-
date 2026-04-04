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
    <div className="flex flex-col gap-1">
      {statut === "CRE" && (
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg text-[13px] font-semibold cursor-pointer border-none transition-all duration-150 hover:opacity-90 hover:translate-y-[-1px] disabled:opacity-60 disabled:cursor-not-allowed mb-2 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-[0_2px_10px_hsl(var(--primary)/0.3)]"
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
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg text-[13px] font-semibold cursor-pointer border-none transition-all duration-150 hover:opacity-90 hover:translate-y-[-1px] disabled:opacity-60 disabled:cursor-not-allowed mb-2 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-[0_2px_10px_hsl(var(--primary)/0.3)]"
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
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg text-[13px] font-semibold cursor-pointer border-none transition-all duration-150 hover:opacity-90 hover:translate-y-[-1px] disabled:opacity-60 disabled:cursor-not-allowed mb-2 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-[0_2px_10px_hsl(var(--primary)/0.3)]"
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
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg text-[13px] font-semibold cursor-pointer border border-destructive/25 transition-all duration-150 hover:opacity-90 hover:translate-y-[-1px] disabled:opacity-60 disabled:cursor-not-allowed bg-destructive/10 text-destructive"
          onClick={() => callAction("cancel")}
          disabled={btnDisabled("cancel")}
        >
          <XCircle size={14} />
          {loading === "cancel" ? "..." : t("abonnementsUi.detail.actions.cancel")}
        </button>
      )}

      {(statut === "ANL" || statut === "EXP") && (
        <div className="text-center text-xs text-muted-foreground py-3">
          {statut === "ANL" ? "Abonnement annulé" : "Abonnement expiré"}
        </div>
      )}
    </div>
  );
}