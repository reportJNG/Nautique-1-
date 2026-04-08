import { prisma } from "@/lib/db/prisma";
import {
  AdminDataTable,
  AdminPageHeader,
  AdminPageShell,
  AdminSection,
} from "@/components/admin/AdminPage";
import { getTranslations } from "next-intl/server";
import { CheckCircle, Dumbbell, Tag, Waves, XCircle } from "lucide-react";

async function getData() {
  const [espaces, disciplines] = await Promise.all([
    prisma.espace.findMany({ include: { categoriesAge: true } }),
    prisma.discipline.findMany({ include: { espace: true } }),
  ]);

  return { espaces, disciplines };
}

export default async function DisciplinesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const { espaces, disciplines } = await getData();

  const espaceColors = [
    { border: "ring-primary/30", accent: "text-primary" },
    { border: "ring-primary/30", accent: "text-primary" },
    { border: "ring-primary/30", accent: "text-primary" },
    { border: "ring-primary/30", accent: "text-primary" },
  ];

  return (
    <AdminPageShell locale={locale}>
      <AdminPageHeader
        title={t("disciplinesUi.pageTitle")}
        description={t("disciplinesUi.pageDescription", {
          spaces: espaces.length,
          disciplines: disciplines.length,
        })}
        icon={<Dumbbell />}
      />

      <div className="space-y-6 [&:has(#dis-tab-disc:checked)_.disciplines-panel]:block [&:has(#dis-tab-disc:checked)_.disciplines-tab-trigger]:bg-primary/10 [&:has(#dis-tab-disc:checked)_.disciplines-tab-trigger]:font-semibold [&:has(#dis-tab-disc:checked)_.disciplines-tab-trigger]:text-primary [&:has(#dis-tab-disc:checked)_.disciplines-tab-trigger]:ring-1 [&:has(#dis-tab-disc:checked)_.disciplines-tab-trigger]:ring-primary/30 [&:has(#dis-tab-disc:checked)_.espaces-panel]:hidden [&:has(#dis-tab-espaces:checked)_.espaces-tab-trigger]:bg-primary/10 [&:has(#dis-tab-espaces:checked)_.espaces-tab-trigger]:font-semibold [&:has(#dis-tab-espaces:checked)_.espaces-tab-trigger]:text-primary [&:has(#dis-tab-espaces:checked)_.espaces-tab-trigger]:ring-1 [&:has(#dis-tab-espaces:checked)_.espaces-tab-trigger]:ring-primary/30">
        <input
          type="radio"
          name="dis-tab"
          id="dis-tab-espaces"
          className="sr-only"
          defaultChecked
        />
        <input
          type="radio"
          name="dis-tab"
          id="dis-tab-disc"
          className="sr-only"
        />

        <div className="mb-6 flex gap-1">
          <label
            htmlFor="dis-tab-espaces"
            className="espaces-tab-trigger inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-transparent px-[18px] py-2 text-[13px] font-medium text-muted-foreground transition-all duration-180 hover:bg-muted/20 hover:text-foreground"
          >
            <Waves size={14} />
            {t("disciplinesUi.tabs.espaces")}
          </label>
          <label
            htmlFor="dis-tab-disc"
            className="disciplines-tab-trigger inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-transparent px-[18px] py-2 text-[13px] font-medium text-muted-foreground transition-all duration-180 hover:bg-muted/20 hover:text-foreground"
          >
            <Tag size={14} />
            {t("disciplinesUi.tabs.disciplines")}
          </label>
        </div>

        <div className="espaces-panel block">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {espaces.map((espace, index) => {
              const colors = espaceColors[index % espaceColors.length];

              return (
                <div
                  key={espace.id}
                  className={`flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/40 p-5 ring-1 ${colors.border} backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-card/60`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-base font-bold text-foreground">
                      {espace.designation}
                    </div>
                    <span
                      className={`inline-flex items-center rounded-md bg-transparent px-2 py-1 text-xs font-semibold ring-1 ${colors.border} ${colors.accent}`}
                    >
                      {espace.code}
                    </span>
                  </div>

                  {espace.description ? (
                    <div className="text-sm leading-relaxed text-muted-foreground">
                      {espace.description}
                    </div>
                  ) : null}

                  <div>
                    <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {t("disciplinesUi.labelAgeCategories")}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {espace.categoriesAge.map((category) => (
                        <span
                          key={category.id}
                          className="inline-flex items-center rounded-full bg-card/50 px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border"
                        >
                          {category.designation}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="disciplines-panel hidden">
          <AdminSection
            title={t("disciplinesUi.tabs.disciplines")}
            description={t("disciplinesUi.listDescription", {
              count: disciplines.length,
            })}
          >
            <AdminDataTable>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border/50">
                    <tr className="bg-card/20">
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("disciplinesUi.table.code")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("disciplinesUi.table.designation")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("disciplinesUi.table.space")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("disciplinesUi.table.status")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {disciplines.map((discipline) => (
                      <tr
                        key={discipline.id}
                        className="transition-colors hover:bg-card/30"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-primary">
                            {discipline.code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-foreground">
                            {discipline.designation}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
                            <Waves size={11} />
                            {discipline.espace.designation}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {discipline.actif === 1 ? (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-primary/30">
                              <CheckCircle className="h-3 w-3" />
                              {t("status.active")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/10 px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border/30">
                              <XCircle className="h-3 w-3" />
                              {t("status.inactive")}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {disciplines.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-card/50 ring-1 ring-border">
                    <Dumbbell className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("disciplinesUi.empty")}
                  </p>
                </div>
              ) : null}
            </AdminDataTable>
          </AdminSection>
        </div>
      </div>
    </AdminPageShell>
  );
}
