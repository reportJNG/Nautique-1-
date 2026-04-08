import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  ArrowLeft,
  Dumbbell,
  CheckCircle,
  XCircle,
  FileText,
  Hash,
  CalendarDays,
  CreditCard,
  Award,
  MapPin,
  Briefcase,
} from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { AdminPageShell } from "@/components/admin/AdminPage";
import { AdherentDetailActions } from "./AdherentDetailActions";

async function getAdherent(id: number) {
  return prisma.adherent.findUnique({
    where: { id },
    include: {
      organisation: true,
      abonnements: {
        include: { discipline: true, saison: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export default async function AdherentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const dateLocale = locale === "en" ? "en-US" : locale === "ar" ? "ar-DZ" : "fr-FR";
  const adherent = await getAdherent(Number.parseInt(id, 10));

  if (!adherent) {
    notFound();
  }

  const initials =
    `${adherent.prenom?.[0] ?? ""}${adherent.nom?.[0] ?? ""}`.toUpperCase();

  const statusStyles: Record<string, string> = {
    ACT: "bg-primary/10 text-primary border-primary/20",
    CRE: "bg-primary/10 text-primary border-primary/20",
    ATP: "bg-accent/10 text-accent border-accent/20",
    APP: "bg-primary/10 text-primary border-primary/20",
    ANL: "bg-muted/10 text-muted-foreground border-border/20",
    EXP: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <AdminPageShell locale={locale}>
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href={`/${locale}/admin/adherents`}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-border/30 bg-muted/20 px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-muted/30 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("adherentsUi.detail.back")}
        </Link>

        <div className="relative overflow-hidden rounded-xl border border-border/30 bg-gradient-to-r from-card/50 to-card/80 p-6 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 text-3xl font-bold text-primary-foreground shadow-xl ring-4 ring-primary/20">
                {initials || "?"}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-border ${
                  adherent.actif === 1 ? "bg-primary" : "bg-card"
                }`}
              />
            </div>

            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                  {adherent.prenom} {adherent.nom}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    adherent.actif === 1
                      ? "border border-primary/20 bg-primary/10 text-primary"
                      : "border border-border/20 bg-muted/10 text-muted-foreground"
                  }`}
                >
                  {adherent.actif === 1 ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {adherent.actif === 1 ? t("status.active") : t("status.inactive")}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" />
                  <span className="font-mono">{adherent.numeroDossier}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{adherent.organisation.designation}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>
                    {t("adherentsUi.detail.memberSince", {
                      date: new Date(adherent.createdAt).toLocaleDateString(dateLocale),
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="overflow-hidden rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 border-b border-border/30 bg-muted/20 px-6 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                  {t("adherentsUi.detail.personalInfo")}
                </h2>
              </div>

              <div className="space-y-4 p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="mb-0.5 text-xs text-muted-foreground">
                        {t("adherentsUi.detail.labels.email")}
                      </p>
                      <p className="text-sm text-foreground">{adherent.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="mb-0.5 text-xs text-muted-foreground">
                        {t("adherentsUi.detail.labels.phone")}
                      </p>
                      <p className="text-sm text-foreground">
                        {adherent.telephone || (
                          <span className="italic text-muted-foreground">
                            {t("adherentsUi.detail.labels.telephoneUnknown")}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="mb-0.5 text-xs text-muted-foreground">
                        {t("adherentsUi.detail.labels.birthDate")}
                      </p>
                      <p className="text-sm text-foreground">
                        {new Date(adherent.dateNaissance).toLocaleDateString(dateLocale, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award className="mt-0.5 w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="mb-0.5 text-xs text-muted-foreground">
                        {t("adherentsUi.detail.gender")}
                      </p>
                      <p className="text-sm text-foreground">
                        {t(`adherentsUi.detail.genderOptions.${adherent.sexe}`)}
                      </p>
                    </div>
                  </div>
                </div>

                {adherent.adresse && (
                  <div className="flex items-start gap-3 border-t border-border/20 pt-2">
                    <MapPin className="mt-0.5 w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="mb-0.5 text-xs text-muted-foreground">
                        {t("adherentsUi.detail.address")}
                      </p>
                      <p className="text-sm text-foreground">{adherent.adresse}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 border-b border-border/30 bg-muted/20 px-6 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                  <Dumbbell className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                  {t("adherentsUi.detail.subscriptionsTitle", {
                    count: adherent.abonnements.length,
                  })}
                </h2>
              </div>

              <div className="p-6">
                {adherent.abonnements.length === 0 ? (
                  <div className="py-8 text-center">
                    <CreditCard className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {t("adherentsUi.detail.noSubscriptions")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adherent.abonnements.map((abonnement) => (
                      <div
                        key={abonnement.id}
                        className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/20 p-3"
                      >
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">
                              {abonnement.discipline.designation}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {abonnement.saison.designation}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>
                              {t("adherentsUi.detail.start", {
                                date: new Date(abonnement.dateDebut).toLocaleDateString(
                                  dateLocale,
                                ),
                              })}
                            </span>
                            <span>
                              {t("adherentsUi.detail.end", {
                                date: new Date(abonnement.dateFin).toLocaleDateString(
                                  dateLocale,
                                ),
                              })}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                            statusStyles[abonnement.statut] || statusStyles.ANL
                          }`}
                        >
                          {t(`abonnementStatus.${abonnement.statut}`)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="sticky top-6 overflow-hidden rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 border-b border-border/30 bg-muted/20 px-6 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/20 bg-accent/10">
                  <FileText className="w-4 h-4 text-accent" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                  {t("adherentsUi.detail.actionsTitle")}
                </h2>
              </div>

              <div className="space-y-4 p-6">
                <AdherentDetailActions
                  adherentId={adherent.id}
                  isActive={adherent.actif === 1}
                />

                <Link
                  href={`/${locale}/admin/abonnements/nouveau?adherent=${adherent.id}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border/30 bg-muted/20 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/30 hover:text-primary"
                >
                  <CreditCard className="w-4 h-4" />
                  {t("adherentsUi.detail.newSubscription")}
                </Link>

                <Link
                  href={`/${locale}/admin/adherents/${adherent.id}/modifier`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border/30 bg-muted/20 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/30 hover:text-primary"
                >
                  <Briefcase className="w-4 h-4" />
                  {t("adherentsUi.detail.editInfo")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
