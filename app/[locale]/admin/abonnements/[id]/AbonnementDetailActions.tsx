"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminToast";

interface AbonnementDetailActionsProps {
  abonnementId: number;
  statut: string;
  locale: string;
}

export function AbonnementDetailActions({
  abonnementId,
  statut,
}: AbonnementDetailActionsProps) {
  const t = useTranslations("admin");
  const { toast } = useAdminToast();
  const router = useRouter();
  const [loading, setLoading] = React.useState<string | null>(null);

  async function callAction(action: string) {
    setLoading(action);

    try {
      const response = await fetch(`/api/admin/abonnements/${abonnementId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      setLoading(null);

      if (data.error) {
        toast({
          variant: "error",
          title: t("toast.updateError.title"),
          description: data.error,
        });
      } else {
        toast({
          variant: "success",
          title: t("toast.updateSuccess.title"),
          description: t("toast.updateSuccess.desc"),
        });
        router.refresh();
      }
    } catch {
      setLoading(null);
      toast({
        variant: "error",
        title: t("toast.updateError.title"),
        description: t("toast.updateError.desc"),
      });
    }
  }

  const btnDisabled = (action: string) => loading === action;

  return (
    <div className="flex flex-col gap-1">
      {statut === "CRE" ? (
        <button
          type="button"
          className="mb-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border-none bg-gradient-to-br from-primary to-primary/80 px-4 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-[0_2px_10px_hsl(var(--primary)/0.3)] transition-all duration-150 hover:-translate-y-[-1px] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => callAction("to_atp")}
          disabled={btnDisabled("to_atp")}
        >
          <Clock size={14} />
          {loading === "to_atp" ? "..." : t("abonnementsUi.detail.actions.metToATP")}
        </button>
      ) : null}

      {statut === "ATP" || statut === "ATT" ? (
        <button
          type="button"
          className="mb-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border-none bg-gradient-to-br from-primary to-primary/80 px-4 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-[0_2px_10px_hsl(var(--primary)/0.3)] transition-all duration-150 hover:-translate-y-[-1px] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => callAction("validate_payment")}
          disabled={btnDisabled("validate_payment")}
        >
          <CheckCircle2 size={14} />
          {loading === "validate_payment"
            ? "..."
            : t("abonnementsUi.detail.actions.validatePayment")}
        </button>
      ) : null}

      {statut === "APP" ? (
        <button
          type="button"
          className="mb-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border-none bg-gradient-to-br from-primary to-primary/80 px-4 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-[0_2px_10px_hsl(var(--primary)/0.3)] transition-all duration-150 hover:-translate-y-[-1px] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => callAction("activate")}
          disabled={btnDisabled("activate")}
        >
          <CheckCircle2 size={14} />
          {loading === "activate" ? "..." : t("abonnementsUi.detail.actions.activate")}
        </button>
      ) : null}

      {statut !== "ANL" && statut !== "EXP" ? (
        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-2.5 text-[13px] font-semibold text-destructive transition-all duration-150 hover:-translate-y-[-1px] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => callAction("cancel")}
          disabled={btnDisabled("cancel")}
        >
          <XCircle size={14} />
          {loading === "cancel" ? "..." : t("abonnementsUi.detail.actions.cancel")}
        </button>
      ) : (
        <div className="py-3 text-center text-xs text-muted-foreground">
          {statut === "ANL"
            ? t("abonnementsUi.detail.cancelled")
            : t("abonnementsUi.detail.expired")}
        </div>
      )}
    </div>
  );
}
