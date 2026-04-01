"use client";

import { useAdminToast } from "@/components/admin/AdminToast";
import { useTranslations } from "next-intl";
import { validatePayment } from "../actions";
import { useRouter } from "@/i18n/navigation";
import { CheckCircle2 } from "lucide-react";
import React from "react";

interface FactureDetailActionsProps {
  factureId: number;
  locale: string;
}

export function FactureDetailActions({ factureId, locale }: FactureDetailActionsProps) {
  const t = useTranslations("admin");
  const { toast } = useAdminToast();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function handleValidate() {
    setLoading(true);
    const fd = new FormData();
    fd.set("id", String(factureId));
    const result = await validatePayment(fd);
    setLoading(false);

    if (result?.error) {
      toast({ variant: "error", title: t("toast.paymentError.title"), description: result.error });
    } else {
      toast({ variant: "success", title: t("toast.paymentSuccess.title"), description: t("toast.paymentSuccess.desc") });
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleValidate}
      disabled={loading}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center",
        padding: "10px 16px", borderRadius: 9, width: "100%",
        background: "linear-gradient(135deg, #10b981, #059669)",
        border: "none", color: "#fff", fontSize: 13.5, fontWeight: 700,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
        boxShadow: "0 2px 10px rgba(16,185,129,0.35)",
        transition: "opacity 150ms ease, transform 150ms ease",
      }}
    >
      <CheckCircle2 size={15} />
      {loading ? "..." : t("abonnementsUi.detail.actions.validatePayment")}
    </button>
  );
}
