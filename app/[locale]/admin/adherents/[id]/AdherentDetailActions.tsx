// app/[locale]/admin/adherents/[id]/AdherentDetailActions.tsx
"use client";

import React from "react";
import { AlertTriangle, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { useAdminToast } from "@/components/admin/AdminToast";

import { toggleAdherentStatus } from "../actions";

interface AdherentDetailActionsProps {
  adherentId: number;
  isActive: boolean;
}

export function AdherentDetailActions({ adherentId, isActive }: AdherentDetailActionsProps) {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const { toast } = useAdminToast();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  async function handleToggle() {
    setLoading(true);

    const fd = new FormData();
    fd.set("id", String(adherentId));

    const result = await toggleAdherentStatus(fd);
    setLoading(false);
    setShowConfirm(false);

    if (result?.error) {
      toast({
        variant: "error",
        title: t("toast.toggleError.title"),
        description: t("toast.toggleError.desc"),
      });
    } else {
      toast({
        variant: "success",
        title: t("toast.toggleSuccess.title"),
        description: t("toast.toggleSuccess.desc"),
      });
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      {showConfirm ? (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-lg border border-accent/20 bg-accent/10 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
            <div className="flex-1">
              <p className="text-sm font-medium text-accent">
                {isActive
                  ? t("adherentsUi.detail.actions.confirmDeactivateTitle")
                  : t("adherentsUi.detail.actions.confirmReactivateTitle")}
              </p>
              <p className="mt-1 text-xs text-accent/70">
                {isActive
                  ? t("adherentsUi.detail.actions.confirmDeactivateDescription")
                  : t("adherentsUi.detail.actions.confirmReactivateDescription")}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleToggle}
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/20 px-3 py-2 text-sm font-medium text-destructive transition-all hover:bg-destructive/30 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isActive ? (
                t("adherentsUi.detail.actions.deactivate")
              ) : (
                t("adherentsUi.detail.actions.reactivate")
              )}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 rounded-lg border border-border/30 bg-muted/20 px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/30"
            >
              {tc("cancel")}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${isActive
            ? "border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20"
            : "border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20"}`}
        >
          {isActive ? (
            <>
              <ToggleLeft className="h-4 w-4" />
              {t("adherentsUi.detail.actions.deactivateMember")}
            </>
          ) : (
            <>
              <ToggleRight className="h-4 w-4" />
              {t("adherentsUi.detail.actions.reactivateMember")}
            </>
          )}
        </button>
      )}
    </div>
  );
}
