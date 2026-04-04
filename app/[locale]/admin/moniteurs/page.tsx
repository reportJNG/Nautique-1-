import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader, AdminSection, AdminPageShell } from "@/components/admin/AdminPage";
import { getTranslations } from "next-intl/server";
import { UserCheck, Plus, Mail, Phone, Star } from "lucide-react";

async function getMoniteurs() {
  return prisma.moniteur.findMany({ orderBy: { nom: "asc" } });
}

export default async function MoniteursPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const moniteurs = await getMoniteurs();

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
        description={`${moniteurs.length} moniteur${moniteurs.length !== 1 ? "s" : ""} enregistré${moniteurs.length !== 1 ? "s" : ""}`}
        icon={<UserCheck />}
        actions={
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-[13px] font-semibold border-none cursor-pointer shadow-[0_2px_8px_hsl(var(--primary)/0.3)] transition-all duration-150 hover:opacity-90 hover:-translate-y-px [&_svg]:w-[15px] [&_svg]:h-[15px]"
            type="button"
          >
            <Plus />
            {t("moniteursUi.newButton")}
          </button>
        }
      />

      {moniteurs.length === 0 ? (
        <AdminSection>
          <div className="py-16 px-5 text-center text-muted-foreground text-sm">
            {t("status.noData")}
          </div>
        </AdminSection>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {moniteurs.map((moniteur, idx) => {
            const initials = `${moniteur.prenom?.[0] ?? ""}${moniteur.nom?.[0] ?? ""}`.toUpperCase();
            return (
              <div
                key={moniteur.id}
                className="group relative rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 flex flex-col gap-3.5 transition-all duration-200 hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary before:to-transparent before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-60"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-[15px] font-bold text-primary-foreground shrink-0 shadow-[0_0_16px_hsl(var(--primary)/0.25)] ${avatarColors[idx % avatarColors.length]}`}
                    aria-hidden="true"
                  >
                    {initials}
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-foreground">
                      {moniteur.prenom} {moniteur.nom}
                    </div>
                    {moniteur.specialite && (
                      <div className="text-xs text-primary mt-0.5 flex items-center gap-1">
                        <Star size={10} />
                        {moniteur.specialite}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  {moniteur.email && (
                    <div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                      <Mail size={13} className="text-muted-foreground shrink-0" />
                      {moniteur.email}
                    </div>
                  )}
                  {moniteur.telephone && (
                    <div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                      <Phone size={13} className="text-muted-foreground shrink-0" />
                      {moniteur.telephone}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <span className={moniteur.actif === 1
                    ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/12 text-primary border border-primary/25"
                    : "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted/12 text-muted-foreground border border-muted/20"
                  }>
                    {moniteur.actif === 1 ? t("status.active") : t("status.inactive")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminPageShell>
  );
}