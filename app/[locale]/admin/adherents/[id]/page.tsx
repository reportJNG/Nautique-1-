// app/[locale]/admin/adherents/[id]/page.tsx
import { prisma } from "@/lib/db/prisma";
import { getTranslations } from "next-intl/server";
import { AdminPageShell } from "@/components/admin/AdminPage";
import { notFound } from "next/navigation";
import {
  User, Mail, Phone, Calendar, Building2, ArrowLeft, Dumbbell,
  CheckCircle, Clock, XCircle, FileText, Hash, CalendarDays,
  CreditCard, Award, MapPin, AtSign, Briefcase
} from "lucide-react";
import Link from "next/link";
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
  const tc = await getTranslations({ locale, namespace: "common" });
  const dateLocale = locale === "en" ? "en-US" : locale === "ar" ? "ar-DZ" : "fr-FR";
  const adherent = await getAdherent(parseInt(id));
  if (!adherent) notFound();

  const initials = `${adherent.prenom?.[0] ?? ""}${adherent.nom?.[0] ?? ""}`.toUpperCase();
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
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <Link
          href={`/${locale}/admin/adherents`}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 hover:bg-muted/30 border border-border/30 text-muted-foreground hover:text-foreground text-sm transition-all w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Link>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-card/50 to-card/80 backdrop-blur-sm border border-border/30 p-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-xl ring-4 ring-primary/20">
                {initials || "?"}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-border ${adherent.actif === 1 ? 'bg-primary' : 'bg-card'
                }`} />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {adherent.prenom} {adherent.nom}
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${adherent.actif === 1
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-muted/10 text-muted-foreground border border-border/20'
                  }`}>
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
                  <span>Membre depuis {new Date(adherent.createdAt).toLocaleDateString(dateLocale)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-card/20 backdrop-blur-sm rounded-xl border border-border/30 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-border/30 bg-muted/20">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                  Informations personnelles
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                      <p className="text-sm text-foreground">{adherent.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Téléphone</p>
                      <p className="text-sm text-foreground">
                        {adherent.telephone || <span className="text-muted-foreground italic">Non renseigné</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Date de naissance</p>
                      <p className="text-sm text-foreground">
                        {new Date(adherent.dateNaissance).toLocaleDateString(dateLocale, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Sexe</p>
                      <p className="text-sm text-foreground">
                        {adherent.sexe === 'M' ? 'Masculin' : 'Féminin'}
                      </p>
                    </div>
                  </div>
                </div>

                {adherent.adresse && (
                  <div className="flex items-start gap-3 pt-2 border-t border-border/20">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-0.5">Adresse</p>
                      <p className="text-sm text-foreground">{adherent.adresse}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Subscriptions Card */}
            <div className="bg-card/20 backdrop-blur-sm rounded-xl border border-border/30 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-border/30 bg-muted/20">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                  Abonnements ({adherent.abonnements.length})
                </h2>
              </div>

              <div className="p-6">
                {adherent.abonnements.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">
                      Aucun abonnement trouvé
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adherent.abonnements.map((abo) => (
                      <div key={abo.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-foreground">
                              {abo.discipline.designation}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {abo.saison.designation}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>Début: {new Date(abo.dateDebut).toLocaleDateString(dateLocale)}</span>
                            <span>Fin: {new Date(abo.dateFin).toLocaleDateString(dateLocale)}</span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[abo.statut] || statusStyles.ANL}`}>
                          {t(`abonnementStatus.${abo.statut}`)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            <div className="bg-card/20 backdrop-blur-sm rounded-xl border border-border/30 overflow-hidden sticky top-6">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-border/30 bg-muted/20">
                <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-accent" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                  Actions
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <AdherentDetailActions
                  adherentId={adherent.id}
                  isActive={adherent.actif === 1}
                  locale={locale}
                />

                <Link
                  href={`/${locale}/admin/abonnements/nouveau?adherent=${adherent.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-muted/20 hover:bg-muted/30 border border-border/30 text-muted-foreground hover:text-primary text-sm font-medium transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  Nouvel abonnement
                </Link>

                <Link
                  href={`/${locale}/admin/adherents/${adherent.id}/modifier`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-muted/20 hover:bg-muted/30 border border-border/30 text-muted-foreground hover:text-primary text-sm font-medium transition-all"
                >
                  <Briefcase className="w-4 h-4" />
                  Modifier les informations
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}