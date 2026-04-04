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
      className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg w-full bg-gradient-to-br from-primary to-primary/80 border-none text-primary-foreground text-[13.5px] font-bold cursor-pointer shadow-[0_2px_10px_hsl(var(--primary)/0.35)] transition-all duration-150 hover:opacity-90 hover:-translate-y-px disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <CheckCircle2 size={15} />
      {loading ? "..." : t("abonnementsUi.detail.actions.validatePayment")}
    </button>
  );
}