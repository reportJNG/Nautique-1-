import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Mail, Phone, Plus, Star, UserCheck } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import {
  AdminPageHeader,
  AdminPageShell,
  AdminSection,
} from "@/components/admin/AdminPage";

async function getMoniteurs() {
  return prisma.moniteur.findMany({
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
    include: {
      _count: {
        select: {
          creneauxMoniteur: true,
        },
      },
    },
  });
}

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MoniteursPage({ params }: PageProps) {
  const { locale } = await params;
  const [t, moniteurs, session] = await Promise.all([
    getTranslations({ locale, namespace: "admin" }),
    getMoniteurs(),
    getSession(),
  ]);

  const canManageMoniteurs =
    session?.type === "agent" && session.roleCode === "ADMIN";

  const avatarColors = [
    "bg-gradient-to-br from-primary to-primary/80",
    "bg-gradient-to-br from-primary to-primary/80",
    "bg-gradient-to-br from-primary to-primary/80",
    "bg-gradient-to-br from-primary to-primary/80",
    "bg-gradient-to-br from-primary to-primary/80",
  ];

  return (
    <AdminPageShell locale={locale}>
      <AdminPageHeader
        title={t("moniteursUi.pageTitle")}
        description={t("moniteursUi.pageDescription", {
          count: moniteurs.length,
        })}
        icon={<UserCheck />}
        actions={
          canManageMoniteurs ? (
            <Link
              href={`/${locale}/admin/moniteurs/new`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-primary to-primary/80 px-4 py-2 text-[13px] font-semibold text-primary-foreground shadow-[0_2px_8px_hsl(var(--primary)/0.3)] transition-all duration-150 hover:-translate-y-px hover:opacity-90 [&_svg]:h-[15px] [&_svg]:w-[15px]"
            >
              <Plus />
              {t("moniteursUi.newButton")}
            </Link>
          ) : null
        }
      />

      {moniteurs.length === 0 ? (
        <AdminSection>
          <div className="px-5 py-16 text-center text-sm text-muted-foreground">
            {t("moniteursUi.empty")}
          </div>
        </AdminSection>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {moniteurs.map((moniteur, idx) => {
            const initials = `${moniteur.prenom?.[0] ?? ""}${moniteur.nom?.[0] ?? ""}`
              .toUpperCase();
            const cardContent = (
              <>
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-primary-foreground shadow-[0_0_16px_hsl(var(--primary)/0.25)] ${avatarColors[idx % avatarColors.length]}`}
                    aria-hidden="true"
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-bold text-foreground">
                      {moniteur.prenom} {moniteur.nom}
                    </div>
                    {moniteur.specialite ? (
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-primary">
                        <Star size={10} />
                        <span className="truncate">{moniteur.specialite}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  {moniteur.email ? (
                    <div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                      <Mail size={13} className="shrink-0 text-muted-foreground" />
                      <span className="truncate">{moniteur.email}</span>
                    </div>
                  ) : null}
                  {moniteur.telephone ? (
                    <div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                      <Phone size={13} className="shrink-0 text-muted-foreground" />
                      <span className="truncate">{moniteur.telephone}</span>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-border/30 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        moniteur.actif === 1
                          ? "inline-flex items-center rounded-full border border-primary/25 bg-primary/12 px-2.5 py-0.5 text-[11px] font-semibold text-primary"
                          : "inline-flex items-center rounded-full border border-muted/20 bg-muted/12 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground"
                      }
                    >
                      {moniteur.actif === 1
                        ? t("status.active")
                        : t("status.inactive")}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {t("moniteursUi.cards.assignments", {
                        count: moniteur._count.creneauxMoniteur,
                      })}
                    </span>
                  </div>

                  {canManageMoniteurs ? (
                    <span className="text-[11px] font-medium text-muted-foreground/50 transition-colors group-hover:text-muted-foreground">
                      {t("moniteursUi.cards.view")}
                    </span>
                  ) : null}
                </div>
              </>
            );

            if (canManageMoniteurs) {
              return (
                <Link
                  key={moniteur.id}
                  href={`/${locale}/admin/moniteurs/${moniteur.id}`}
                  className="group relative flex flex-col gap-3.5 overflow-hidden rounded-xl border border-border/50 bg-card/80 p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] before:absolute before:left-0 before:right-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary before:to-transparent before:opacity-0 before:transition-opacity before:duration-200 before:content-[''] hover:before:opacity-60"
                >
                  {cardContent}
                </Link>
              );
            }

            return (
              <div
                key={moniteur.id}
                className="flex flex-col gap-3.5 overflow-hidden rounded-xl border border-border/50 bg-card/80 p-5 backdrop-blur-sm"
              >
                {cardContent}
              </div>
            );
          })}
        </div>
      )}
    </AdminPageShell>
  );
}
