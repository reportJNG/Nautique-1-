"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  Send,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link, useRouter } from "@/i18n/navigation";
import { submitAbonnementToAdmin } from "./nouveau/actions";

interface Props {
  abonnementId: number;
  factureId: number | null;
  statutCode: string;
  locale: string;
  invoiceNumber: string | null;
  invoiceStatus: string | null;
  invoiceMode: string | null;
  invoicePaidAt: string | null;
  amount: string;
}

export function AbonnementActionCard({
  abonnementId,
  factureId,
  statutCode,
  locale: _locale,
  invoiceNumber,
  invoiceStatus,
  invoiceMode,
  invoicePaidAt,
  amount,
}: Props) {
  const t = useTranslations("espace.abonnements");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmingSubmit, setConfirmingSubmit] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);

  function handleSubmit() {
    startTransition(async () => {
      const result = await submitAbonnementToAdmin({ abonnementId });

      if (result.error) {
        toast.error(t("actions.submitError"), { description: result.error });
        return;
      }

      setConfirmingSubmit(false);
      toast.success(t("actions.submitSuccess"), {
        description: t("actions.submitSuccessDescription"),
      });
      router.refresh();
    });
  }

  return (
    <div
      className={`rounded-[28px] border border-border/50 border-l-2 border-l-cyan-400 bg-background/70 p-5 ${
        statutCode === "CRE" ? "border-dashed" : ""
      }`}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CreditCard className="size-4 text-cyan-600 dark:text-cyan-300" />
            {t("payment.title")}
          </div>
          <div className="mt-4 rounded-2xl border border-border/50 bg-white/70 p-4 dark:bg-slate-950/50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {t("payment.lastInvoice")}
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {amount}
                </p>
              </div>
              {invoiceStatus ? (
                <Badge variant="outline" className="rounded-full">
                  {invoiceStatus === "PAY" ? t("payment.paid") : t("payment.pending")}
                </Badge>
              ) : (
                <Badge variant="outline" className="rounded-full">
                  {t("payment.notGenerated")}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {t("actions.title")}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(`actions.descriptions.${statutCode}`)}
            </p>
          </div>

          {statutCode === "CRE" ? (
            confirmingSubmit ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/40 dark:text-red-300"
                  onClick={() => setConfirmingSubmit(false)}
                  disabled={pending}
                >
                  <X className="size-4" />
                  {t("actions.cancel")}
                </Button>
                <Button
                  type="button"
                  className="h-11 rounded-2xl"
                  onClick={handleSubmit}
                  disabled={pending}
                >
                  <Check className="size-4" />
                  {pending
                    ? t("actions.submitting")
                    : t("actions.confirmSubmit")}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                className="h-11 w-full rounded-2xl"
                disabled={pending}
                onClick={() => setConfirmingSubmit(true)}
              >
                <Send className="size-4" />
                {pending ? t("actions.submitting") : t("actions.submit")}
              </Button>
            )
          ) : null}

          {statutCode === "ATP" ? (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/20">
              <span className="relative flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-amber-500" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  {t("actions.awaiting")}
                </p>
                <p className="text-sm text-amber-900/75 dark:text-amber-200/80">
                  {t("actions.pendingLine")}
                </p>
              </div>
            </div>
          ) : null}

          {statutCode === "ACT" ? (
            <>
              <Button asChild className="h-11 w-full rounded-2xl">
                <Link href={`/espace/abonnements/${abonnementId}/payer`}>
                  <CreditCard className="size-4" />
                  {t("actions.payNow")}
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="h-auto rounded-2xl justify-start px-0 text-cyan-700 hover:bg-transparent hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200"
              >
                <Link href={`/espace/abonnements/${abonnementId}/payer`}>
                  {t("actions.openPaymentFlow")}
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            </>
          ) : null}

          {statutCode === "APP" ? (
            <>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-800 dark:border-cyan-900/60 dark:bg-cyan-950/30 dark:text-cyan-200">
                <CheckCircle2 className="size-3.5" />
                {t("actions.receiptReady")}
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl"
                disabled={!factureId}
                onClick={() => setReceiptOpen((value) => !value)}
              >
                <FileText className="size-4" />
                {receiptOpen ? t("actions.hideReceipt") : t("actions.viewReceipt")}
              </Button>
            </>
          ) : null}

          <AnimatePresence initial={false}>
            {receiptOpen && statutCode === "APP" ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl border border-border/50 bg-white/70 p-4 dark:bg-slate-950/50">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">
                      {t("actions.receiptPanelTitle")}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto rounded-2xl px-0 text-sm"
                      onClick={() => setReceiptOpen(false)}
                    >
                      {t("actions.closeReceipt")}
                    </Button>
                  </div>

                  <div className="mt-4 space-y-3">
                    <InvoiceRow
                      label={t("actions.receiptNumberLabel")}
                      value={invoiceNumber ?? t("payment.notGenerated")}
                    />
                    <InvoiceRow
                      label={t("actions.receiptAmountLabel")}
                      value={amount}
                    />
                    <InvoiceRow
                      label={t("actions.receiptStatusLabel")}
                      value={
                        invoiceStatus === "PAY"
                          ? t("payment.paid")
                          : t("payment.pending")
                      }
                    />
                    <InvoiceRow
                      label={t("actions.receiptMethodLabel")}
                      value={
                        invoiceMode === "CRD"
                          ? t("actions.card")
                          : invoiceMode === "CSH"
                            ? t("actions.cash")
                            : t("actions.notAvailable")
                      }
                    />
                    <InvoiceRow
                      label={t("actions.receiptPaidAtLabel")}
                      value={invoicePaidAt ?? t("actions.notAvailable")}
                    />
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function InvoiceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-background/70 px-3 py-2.5">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
