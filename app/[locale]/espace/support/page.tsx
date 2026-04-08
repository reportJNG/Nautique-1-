import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/auth/session";
import { getEspaceShellData } from "@/lib/espace";
import { getAdminFeedback } from "@/lib/espace-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { CalendarDays, Headphones, Mail, Phone, ShieldCheck } from "lucide-react";
import { SupportFeedbackClient } from "./SupportFeedbackClient";

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: "fr" | "en" | "ar" }>;
}) {
  const { locale } = await params;
  const session = await getSession();

  if (!session || session.type !== "adherent") {
    return null;
  }

  const t = await getTranslations({ locale, namespace: "espace.support" });
  const [shellData, feedback] = await Promise.all([
    getEspaceShellData(session.id),
    getAdminFeedback(),
  ]);

  if (!shellData) {
    return null;
  }

  const supportCards = [
    {
      title: "Assistance administrative",
      description: "Pour une question de dossier, d'activation ou d'organisation des saisons.",
      action: shellData.centre?.emailCentre ?? "support@centre-nautique.local",
      href: `mailto:${shellData.centre?.emailCentre ?? "support@centre-nautique.local"}`,
      icon: Mail,
    },
    {
      title: "Hotline du centre",
      description: "Contact rapide pour un souci d'acces, de badge ou de seance.",
      action: shellData.centre?.telephoneCentre ?? "+213 000 000 000",
      href: `tel:${shellData.centre?.telephoneCentre ?? "+213000000000"}`,
      icon: Phone,
    },
    {
      title: "Gerer mes offres",
      description: "Besoin d'ajouter une souscription ou de verifier une facture en attente ?",
      action: "Voir mes abonnements",
      href: `/${locale}/espace/abonnements`,
      icon: CalendarDays,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-border/50 bg-white/75 p-6 shadow-sm backdrop-blur dark:bg-slate-950/50">
        <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-200">
          {t("badge")}
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("subtitle")}</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {supportCards.map((card) => (
          <article
            key={card.title}
            className="rounded-[30px] border border-border/50 bg-white/80 p-5 shadow-sm backdrop-blur dark:bg-slate-950/50"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
              <card.icon className="size-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">{card.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
            <Button asChild variant="outline" className="mt-6 h-11 w-full rounded-2xl">
              {card.href.startsWith("/") ? (
                <Link href={card.href}>{card.action}</Link>
              ) : (
                <a href={card.href}>{card.action}</a>
              )}
            </Button>
          </article>
        ))}
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-border/50 bg-white/80 p-6 shadow-sm backdrop-blur dark:bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t("faqTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("faqSubtitle")}</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {[
                "Comment regler une facture en attente ? Rendez-vous dans vos abonnements, puis contactez le centre si le statut n'a pas evolue.",
                "Je ne vois pas mon acces du jour. L'enregistrement peut arriver apres validation a l'accueil ou lecture du badge.",
                "Je veux changer de formule. Creez une nouvelle demande ou contactez l'assistance administrative pour arbitrer.",
              ].map((item) => (
                <div key={item} className="rounded-[24px] border border-border/50 bg-background/70 p-4 text-sm text-foreground">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <SupportFeedbackClient
            queueSize={feedback.length}
            translations={{
              title: t("feedback.title"),
              subtitle: t("feedback.subtitle"),
              subject: t("feedback.subject"),
              message: t("feedback.message"),
              subjectPlaceholder: t("feedback.subjectPlaceholder"),
              messagePlaceholder: t("feedback.messagePlaceholder"),
              submit: t("feedback.submit"),
              sending: t("feedback.sending"),
              successTitle: t("feedback.successTitle"),
              successDescription: t("feedback.successDescription"),
              errorTitle: t("feedback.errorTitle"),
            }}
          />
        </div>

        <div className="rounded-[32px] border border-border/50 bg-[linear-gradient(135deg,rgba(8,145,178,0.97),rgba(14,116,144,0.92),rgba(15,23,42,0.94))] p-6 text-white shadow-[0_30px_80px_rgba(8,145,178,0.22)]">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10">
              <Headphones className="size-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{t("contactTitle")}</h2>
              <p className="text-sm text-cyan-50/90">{t("contactSubtitle")}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-50/70">Centre</p>
              <p className="mt-2 text-sm font-medium">
                {shellData.centre?.designationCentre ?? "Centre Nautique SONATRACH"}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-50/70">Email</p>
              <p className="mt-2 text-sm font-medium">
                {shellData.centre?.emailCentre ?? "Non renseigne"}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-50/70">Telephone</p>
              <p className="mt-2 text-sm font-medium">
                {shellData.centre?.telephoneCentre ?? "Non renseigne"}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-950/15 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-50/70">Queue admin fake</p>
              <p className="mt-2 text-2xl font-semibold">{feedback.length}</p>
              <p className="mt-1 text-sm text-cyan-50/80">
                Messages currently stored for simulated admin review.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
