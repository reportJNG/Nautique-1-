import { getTranslations } from "next-intl/server";
import { Settings, Clock } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader, AdminPageShell } from "@/components/admin/AdminPage";
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
        <ParametresForm dbParams={dbParams} />

        <div className="flex flex-col gap-3.5">
          <div className="rounded-xl border border-primary/12 bg-primary/5 p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-primary">
              {t("parametresUi.about.title")}
            </div>
            <div className="flex items-start gap-1.5 py-0.5 text-xs leading-relaxed text-muted-foreground">
              <Settings size={12} className="mt-0.5 shrink-0 text-muted-foreground" />
              {t("parametresUi.about.description")}
            </div>
            <div className="my-1 h-px bg-border/30" />
            <div className="flex items-start gap-1.5 py-0.5 text-xs leading-relaxed text-muted-foreground">
              <Clock size={12} className="mt-0.5 shrink-0 text-muted-foreground" />
              {t("parametresUi.about.advanceTolerance")}
            </div>
            <div className="flex items-start gap-1.5 py-0.5 text-xs leading-relaxed text-muted-foreground">
              <Clock size={12} className="mt-0.5 shrink-0 text-muted-foreground" />
              {t("parametresUi.about.delayTolerance")}
            </div>
          </div>

          {dbParams && (
            <div className="rounded-xl border border-border/50 bg-card/80 p-4 backdrop-blur-sm">
              <div className="mb-2.5 text-xs font-semibold text-foreground">
                {t("parametresUi.system.title")}
              </div>
              <div className="flex items-start gap-1.5 text-[11.5px] text-muted-foreground">
                <Settings size={11} className="mt-0.5 shrink-0 text-muted-foreground" />
                {t("parametresUi.system.id", { value: dbParams.id })}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminPageShell>
  );
}
