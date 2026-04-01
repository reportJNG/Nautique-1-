// app/[locale]/admin/adherents/[id]/AdherentDetailActions.tsx
"use client";

import { useAdminToast } from "@/components/admin/AdminToast";
import { useTranslations } from "next-intl";
import { toggleAdherentStatus } from "../actions";
import { useRouter } from "@/i18n/navigation";
import { ToggleLeft, ToggleRight, Loader2, AlertTriangle } from "lucide-react";
import React from "react";

interface AdherentDetailActionsProps {
  adherentId: number;
  isActive: boolean;
  locale: string;
}

export function AdherentDetailActions({ adherentId, isActive, locale }: AdherentDetailActionsProps) {
  const t = useTranslations("admin");
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
        description: t("toast.toggleError.desc")
      });
    } else {
      toast({
        variant: "success",
        title: t("toast.toggleSuccess.title"),
        description: t("toast.toggleSuccess.desc")
      });
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      {showConfirm ? (
        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-amber-400 font-medium">
                {isActive ? "Désactiver l'adhérent ?" : "Réactiver l'adhérent ?"}
              </p>
              <p className="text-xs text-amber-500/70 mt-1">
                {isActive
                  ? "L'adhérent ne pourra plus se connecter ni réserver."
                  : "L'adhérent pourra à nouveau se connecter et réserver."}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleToggle}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-sm font-medium transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                isActive ? "Désactiver" : "Réactiver"
              )}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 text-sm font-medium transition-all"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${isActive
            ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400'
            : 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400'
            }`}
        >
          {isActive ? (
            <>
              <ToggleLeft className="w-4 h-4" />
              Désactiver l'adhérent
            </>
          ) : (
            <>
              <ToggleRight className="w-4 h-4" />
              Réactiver l'adhérent
            </>
          )}
        </button>
      )}
    </div>
  );
}