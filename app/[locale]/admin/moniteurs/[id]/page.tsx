import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  Clock3,
  Mail,
  Phone,
  Star,
  UserCheck,
} from "lucide-react";
import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { formatTimeForLocale, getDayKey, inferOneBasedWeek } from "@/lib/creneaux";
import {
  AdminPageHeader,
  AdminPageShell,
  AdminSection,
} from "@/components/admin/AdminPage";
import { MoniteurForm } from "../MoniteurForm";

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

async function getMoniteur(id: number) {
  return prisma.moniteur.findUnique({
    where: { id },
    include: {
      creneauxMoniteur: {
        include: {
          creneau: {
            include: {
              discipline: true,
              saison: true,
            },
          },
        },
      },
    },
  });
}

export default async function MoniteurDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  const [t, session] = await Promise.all([
    getTranslations({ locale, namespace: "admin" }),
    getSession(),
  ]);

  const isAdmin =
    session?.type === "agent" && session.roleCode === "ADMIN";

  if (!isAdmin) {
    redirect({ href: "/admin/moniteurs", locale });
  }

  const moniteurId = Number.parseInt(id, 10);

  if (Number.isNaN(moniteurId)) {
    notFound();
  }

  const moniteur = await getMoniteur(moniteurId);

  if (!moniteur) {
    notFound();
  }

  const assignments = [...moniteur.creneauxMoniteur].sort((left, right) => {
    const dayDiff = left.creneau.jourSemaine - right.creneau.jourSemaine;

    if (dayDiff !== 0) {
      return dayDiff;
    }

    return (
      new Date(left.creneau.heureDebut).getTime() -
      new Date(right.creneau.heureDebut).getTime()
    );
  });
  const oneBasedWeek = inferOneBasedWeek(
    assignments.map((assignment) => assignment.creneau.jourSemaine),
  );
  const badgeClass =
    moniteur.actif === 1
      ? "inline-flex items-center rounded-full border border-primary/25 bg-primary/12 px-2.5 py-1 text-[11px] font-semibold text-primary"
      : "inline-flex items-center rounded-full border border-border/40 bg-muted/20 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground";

  return (
    <AdminPageShell locale={locale}>
      <Link
        href={`/${locale}/admin/moniteurs`}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border/50 bg-muted/10 px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/20"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("moniteursUi.detail.back")}
      </Link>

      <AdminPageHeader
        title={`${moniteur.prenom} ${moniteur.nom}`}
        description={t("moniteursUi.detail.assignmentCount", {
          count: assignments.length,
        })}
        icon={<UserCheck className="h-5 w-5" />}
        badge={
          <span className={badgeClass}>
            {moniteur.actif === 1
              ? t("moniteursUi.status.active")
              : t("moniteursUi.status.inactive")}
          </span>
        }
      >
        <div className="flex flex-wrap gap-2">
          {moniteur.specialite ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
              <Star className="h-3.5 w-3.5" />
              {moniteur.specialite}
            </span>
          ) : null}
          {moniteur.email ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {moniteur.email}
            </span>
          ) : null}
          {moniteur.telephone ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              {moniteur.telephone}
            </span>
          ) : null}
        </div>
      </AdminPageHeader>

      <MoniteurForm
        locale={locale}
        mode="edit"
        moniteurId={moniteur.id}
        assignmentCount={assignments.length}
        initialValues={{
          nom: moniteur.nom,
          prenom: moniteur.prenom,
          sexe: moniteur.sexe === "F" ? "F" : "M",
          telephone: moniteur.telephone ?? "",
          email: moniteur.email ?? "",
          specialite: moniteur.specialite ?? "",
          actif: moniteur.actif === 1 ? "1" : "0",
        }}
      />

      <AdminSection
        title={t("moniteursUi.detail.assignmentsTitle", {
          count: assignments.length,
        })}
      >
        {assignments.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t("moniteursUi.detail.emptyAssignments")}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {assignments.map((assignment) => {
              const dayKey = getDayKey(
                assignment.creneau.jourSemaine,
                oneBasedWeek,
              );
              const startTime = formatTimeForLocale(
                assignment.creneau.heureDebut,
                locale,
              );
              const endTime = formatTimeForLocale(
                assignment.creneau.heureFin,
                locale,
              );

              return (
                <Link
                  key={assignment.id}
                  href={`/${locale}/admin/creneaux/${assignment.creneau.id}`}
                  className="group rounded-xl border border-border/40 bg-card/60 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-foreground">
                        {assignment.creneau.discipline.designation}
                      </p>
                      <p className="mt-1 truncate text-[12px] text-muted-foreground">
                        {assignment.creneau.saison.designation}
                      </p>
                    </div>
                    {dayKey ? (
                      <span className="inline-flex shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {t(`days.${dayKey}`)}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-[12px] text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    <span>
                      {startTime} - {endTime}
                    </span>
                  </div>

                  {assignment.creneau.groupe ? (
                    <div className="mt-3 text-[12px] text-muted-foreground">
                      {assignment.creneau.groupe}
                    </div>
                  ) : null}
                </Link>
              );
            })}
          </div>
        )}
      </AdminSection>
    </AdminPageShell>
  );
}
