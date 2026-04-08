"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  CreditCard,
  Lock,
  Receipt,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/navigation";
import { STATUT_ABONNEMENT_STYLES } from "@/lib/constants";
import { confirmPayment } from "../../nouveau/actions";

interface PaymentData {
  abonnement: {
    id: number;
    designation: string;
    espace: string;
    saison: string;
    statutCode: string;
    statut: string;
    amount: string;
    beneficiaryName: string;
    beneficiaryDossier: string;
  };
  facture: {
    id: number;
    statusCode: string;
    statusLabel: string;
    amount: string;
    amountValue: number;
    receiptNumber: string | null;
    paidAt: string | null;
    modePaiement: string;
  };
}

interface Props {
  locale: string;
  abonnementId: number;
  data: PaymentData;
}
export function PayerClient({ locale, abonnementId: _abonnementId, data }: Props) {
  const router = useRouter();
  const t = useTranslations("espace.client.abonnementPayment");
  const [pending, startTransition] = useTransition();
  const [holderName, setHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const paymentDisabled = data.abonnement.statutCode !== "ACT";
  const alreadyPaid =
    data.facture.statusCode === "PAY" || data.abonnement.statutCode === "APP";
  const formattedAmountValue = useMemo(
    () => data.facture.amountValue.toLocaleString(locale),
    [data.facture.amountValue, locale],
  );

  const maskedCardNumber = useMemo(() => {
    const digits = cardNumber.replace(/\D/g, "").slice(0, 16);
    const spaced = digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    return spaced || t("payment.preview.number");
  }, [cardNumber, t]);

  const maskedExpiry = useMemo(() => {
    const digits = expiry.replace(/\D/g, "").slice(0, 4);
    if (!digits) {
      return t("payment.preview.expiry");
    }
    if (digits.length <= 2) {
      return digits;
    }
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }, [expiry, t]);

  const displayHolder = holderName.trim() || t("payment.preview.name");

  const buttonLabel = paymentDisabled
    ? t("payment.unavailable")
    : t("payment.confirmCardAmount", { value: formattedAmountValue });

  function handleConfirm() {
    if (paymentDisabled) {
      return;
    }

    startTransition(async () => {
      const result = await confirmPayment({
        factureId: data.facture.id,
        modePaiement: "CRD",
      });

      if (result.error) {
        toast.error(t("toasts.error"), { description: result.error });
        return;
      }

      toast.success(t("toasts.success"), {
        description: t("toasts.successDescription"),
      });
      router.push(`/${locale}/espace/abonnements`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="rounded-2xl">
        <Link href={`/espace/abonnements`}>
          <ArrowLeft className="size-4" />
          {t("back")}
        </Link>
      </Button>

      <section className="overflow-hidden rounded-[32px] border border-border/50 bg-[linear-gradient(135deg,rgba(8,145,178,0.97),rgba(14,116,144,0.92),rgba(15,23,42,0.94))] p-6 text-white shadow-[0_30px_80px_rgba(8,145,178,0.22)]">
        <Badge className="border-white/10 bg-white/10 text-white">
          {t("hero.badge")}
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          {t("hero.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-cyan-50/90">
          {t("hero.subtitle")}
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="order-1 rounded-[32px] border border-border/50 bg-white/80 p-6 shadow-sm backdrop-blur dark:bg-slate-950/50">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Receipt className="size-4 text-cyan-600 dark:text-cyan-300" />
            {t("invoice.title")}
          </div>

          <div className="mt-6 space-y-3">
            <InvoiceMetaRow
              label={t("invoice.designation")}
              value={data.abonnement.designation}
            />
            <InvoiceMetaRow
              label={t("invoice.season")}
              value={data.abonnement.saison}
            />
            <InvoiceMetaRow
              label={t("invoice.space")}
              value={data.abonnement.espace}
            />
            <InvoiceMetaRow
              label={t("invoice.forWhom")}
              value={`${data.abonnement.beneficiaryName} - ${data.abonnement.beneficiaryDossier}`}
            />
          </div>

          <div className="mt-6 rounded-[28px] border border-cyan-200 bg-cyan-50/80 p-5 dark:border-cyan-900/50 dark:bg-cyan-950/20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
              {t("invoice.amount")}
            </p>
            <p className="mt-3 text-3xl font-semibold text-cyan-700 dark:text-cyan-300">
              {data.abonnement.amount}
            </p>
          </div>

          <div className="mt-6 rounded-[28px] border border-border/50 bg-background/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t("invoice.status")}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge
                className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUT_ABONNEMENT_STYLES[data.abonnement.statutCode] || ""}`}
              >
                {data.abonnement.statut}
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1 text-sm">
                {data.facture.statusLabel}
              </Badge>
            </div>
            <div className="mt-4 space-y-3">
              <InvoiceMetaRow
                label={t("invoice.receiptNumber")}
                value={data.facture.receiptNumber ?? t("invoice.pendingReceipt")}
              />
              <InvoiceMetaRow
                label={t("invoice.paymentMethod")}
                value={
                  data.facture.statusCode === "PAY"
                    ? data.facture.modePaiement === "CRD"
                    ? t("payment.card.title")
                    : t("payment.cash.title")
                    : t("invoice.pendingReceipt")
                }
              />
              <InvoiceMetaRow
                label={t("invoice.paidAt")}
                value={data.facture.paidAt ?? t("invoice.pendingReceipt")}
              />
            </div>
          </div>
        </section>

        <section className="order-2 rounded-[32px] border border-border/50 bg-white/80 p-6 shadow-sm backdrop-blur dark:bg-slate-950/50">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CreditCard className="size-4 text-cyan-600 dark:text-cyan-300" />
            {t("payment.title")}
          </div>

          {alreadyPaid ? (
            <div className="mt-6 rounded-[28px] border border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <div className="flex items-start gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-emerald-900 dark:text-emerald-100">
                    {t("payment.successTitle")}
                  </p>
                  <p className="mt-1 text-sm text-emerald-900/80 dark:text-emerald-100/80">
                    {t("payment.alreadyPaid")}
                  </p>
                  <div className="mt-4 space-y-3">
                    <InvoiceMetaRow
                      label={t("invoice.paidAt")}
                      value={data.facture.paidAt ?? t("invoice.pendingReceipt")}
                    />
                    <InvoiceMetaRow
                      label={t("invoice.receiptNumber")}
                      value={data.facture.receiptNumber ?? t("invoice.pendingReceipt")}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-6">
                <PaymentModeCard
                  active
                  title={t("payment.card.title")}
                  description={t("payment.card.description")}
                  icon={CreditCard}
                  onClick={() => undefined}
                />
              </div>

              <div className="mt-6 overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,rgba(8,145,178,0.98),rgba(14,116,144,0.92),rgba(2,132,199,0.9))] p-5 text-white shadow-[0_20px_50px_rgba(8,145,178,0.2)]">
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-50/90">
                    {t("payment.preview.label")}
                  </div>
                  <CreditCard className="size-5 text-cyan-50" />
                </div>
                <p className="mt-8 text-2xl font-semibold tracking-[0.18em]">
                  {maskedCardNumber}
                </p>
                <div className="mt-8 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-50/70">
                      {t("payment.fields.name")}
                    </p>
                    <p className="mt-1 text-sm font-medium">{displayHolder}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-50/70">
                      {t("payment.fields.expiry")}
                    </p>
                    <p className="mt-1 text-sm font-medium">{maskedExpiry}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field
                  label={t("payment.fields.name")}
                  value={holderName}
                  onChange={setHolderName}
                  placeholder={t("payment.placeholders.name")}
                />
                <Field
                  label={t("payment.fields.number")}
                  value={cardNumber.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ").trim()}
                  onChange={setCardNumber}
                  placeholder={t("payment.placeholders.number")}
                />
                <Field
                  label={t("payment.fields.expiry")}
                  value={expiry.replace(/\D/g, "").slice(0, 4)}
                  onChange={setExpiry}
                  placeholder={t("payment.placeholders.expiry")}
                />
                <Field
                  label={t("payment.fields.cvv")}
                  value={cvv.replace(/\D/g, "").slice(0, 3)}
                  onChange={setCvv}
                  placeholder={t("payment.placeholders.cvv")}
                />
              </div>

              <div className="mt-6 flex flex-col items-start gap-3">
                <Button
                  type="button"
                  className={`h-12 rounded-2xl ${paymentDisabled ? "bg-muted text-muted-foreground hover:bg-muted" : ""} w-full sm:w-auto`}
                  disabled={pending || paymentDisabled}
                  onClick={handleConfirm}
                  title={paymentDisabled ? t("payment.unavailable") : undefined}
                >
                  {paymentDisabled ? <Lock className="size-4" /> : null}
                  {pending ? t("payment.submitting") : buttonLabel}
                </Button>
                {paymentDisabled ? (
                  <p className="text-sm text-muted-foreground">
                    {t("payment.unavailableDescription")}
                  </p>
                ) : null}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function InvoiceMetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-border/50 bg-background/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function PaymentModeCard({
  active,
  title,
  description,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-[28px] border p-5 text-left transition-all ${
        active
          ? "border-cyan-300 border-l-[4px] bg-cyan-50 shadow-sm dark:border-cyan-900/60 dark:bg-cyan-950/30"
          : "border-border/50 bg-background/70 hover:border-cyan-200 dark:hover:border-cyan-900/60"
      }`}
    >
      {active ? (
        <span className="absolute right-4 top-4 inline-flex size-6 items-center justify-center rounded-full bg-cyan-500 text-white">
          <Check className="size-3.5" />
        </span>
      ) : null}
      <div
        className={`flex size-11 items-center justify-center rounded-2xl ${
          active
            ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
            : "bg-slate-100 text-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
        }`}
      >
        <Icon className="size-4" />
      </div>
      <p
        className={`mt-4 text-base font-semibold ${
          active ? "text-cyan-700 dark:text-cyan-300" : "text-foreground"
        }`}
      >
        {title}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-2xl"
      />
    </div>
  );
}
