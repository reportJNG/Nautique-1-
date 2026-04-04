import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader, AdminPageShell } from "@/components/admin/AdminPage";
import { getTranslations } from "next-intl/server";
import { Settings, Clock } from "lucide-react";
import { ParametresForm } from "./ParametresForm";

async function getParametres() {
  return prisma.parametres.findFirst();
}

export default async function ParametresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const dbParams = await getParametres();

  return (
    <AdminPageShell locale={locale}>
      <AdminPageHeader
        title={t("parametresUi.title")}
        description={t("parametresUi.card.title")}
        icon={<Settings />}
      />

      <div className="grid gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Form (client component handles toasts) */}
        <ParametresForm dbParams={dbParams} />

        {/* Info aside */}
        <div className="flex flex-col gap-3.5">
          <div className="rounded-xl border border-primary/12 bg-primary/5 p-4">
            <div className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">
              ℹ️ À propos
            </div>
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground leading-relaxed py-0.5">
              <Settings size={12} className="text-muted-foreground mt-0.5 shrink-0" />
              Ces paramètres s&apos;appliquent à l&apos;ensemble du système.
            </div>
            <div className="h-px bg-border/30 my-1" />
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground leading-relaxed py-0.5">
              <Clock size={12} className="text-muted-foreground mt-0.5 shrink-0" />
              La tolérance d&apos;avance permet aux adhérents d&apos;entrer avant l&apos;heure de début du créneau.
            </div>
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground leading-relaxed py-0.5">
              <Clock size={12} className="text-muted-foreground mt-0.5 shrink-0" />
              La tolérance de retard permet l&apos;entrée après le début du créneau.
            </div>
          </div>

          {dbParams && (
            <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4">
              <div className="text-xs font-semibold text-foreground mb-2.5">
                Informations système
              </div>
              <div className="flex items-start gap-1.5 text-[11.5px] text-muted-foreground">
                <Settings size={11} className="text-muted-foreground mt-0.5 shrink-0" />
                ID: {dbParams.id}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminPageShell>
  );
}