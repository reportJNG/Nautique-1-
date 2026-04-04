import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader, AdminSection, AdminDataTable, AdminPageShell } from "@/components/admin/AdminPage";
import { getTranslations } from "next-intl/server";
import { Dumbbell, Tag, Waves, CheckCircle, XCircle } from "lucide-react";

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
    { border: "ring-primary/30", glow: "bg-primary/5", accent: "text-primary" },
    { border: "ring-primary/30", glow: "bg-primary/5", accent: "text-primary" },
    { border: "ring-primary/30", glow: "bg-primary/5", accent: "text-primary" },
    { border: "ring-primary/30", glow: "bg-primary/5", accent: "text-primary" },
  ];

  return (
    <AdminPageShell locale={locale}>
      <AdminPageHeader
        title={t("disciplinesUi.pageTitle")}
        description={`${espaces.length} espaces · ${disciplines.length} disciplines`}
        icon={<Dumbbell />}
      />

      {/* Hidden radio inputs for tab switching */}
      <input
        type="radio"
        name="dis-tab"
        id="dis-tab-espaces"
        className="hidden"
        defaultChecked
      />
      <input
        type="radio"
        name="dis-tab"
        id="dis-tab-disc"
        className="hidden"
      />

      {/* Tab Buttons */}
      <div className="flex gap-1 mb-6">
        <label
          htmlFor="dis-tab-espaces"
          className="inline-flex items-center gap-1.5 px-[18px] py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-180 text-muted-foreground bg-transparent hover:text-foreground hover:bg-muted/20 has-[:checked]:bg-primary/10 has-[:checked]:text-primary has-[:checked]:font-semibold has-[:checked]:ring-1 has-[:checked]:ring-primary/30"
        >
          <Waves size={14} />
          {t("disciplinesUi.tabs.espaces")}
        </label>
        <label
          htmlFor="dis-tab-disc"
          className="inline-flex items-center gap-1.5 px-[18px] py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-180 text-muted-foreground bg-transparent hover:text-foreground hover:bg-muted/20 has-[:checked]:bg-primary/10 has-[:checked]:text-primary has-[:checked]:font-semibold has-[:checked]:ring-1 has-[:checked]:ring-primary/30"
        >
          <Tag size={14} />
          {t("disciplinesUi.tabs.disciplines")}
        </label>
      </div>

      {/* Tab Content */}
      <div>
        {/* Espaces Panel */}
        <div className="block [input#dis-tab-disc:checked~&]:hidden">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {espaces.map((espace, idx) => {
              const col = espaceColors[idx % espaceColors.length];
              return (
                <div
                  key={espace.id}
                  className={`rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-card/60 ring-1 ${col.border}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-base font-bold text-foreground">
                      {espace.designation}
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ring-1 bg-transparent ${col.border} ${col.accent}`}>
                      {espace.code}
                    </span>
                  </div>
                  {espace.description && (
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      {espace.description}
                    </div>
                  )}
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      {t("disciplinesUi.labelAgeCategories")}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {espace.categoriesAge.map((cat) => (
                        <span
                          key={cat.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-card/50 ring-1 ring-border text-muted-foreground"
                        >
                          {cat.designation}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disciplines Panel */}
        <div className="hidden [input#dis-tab-espaces:checked~&]:hidden [input#dis-tab-disc:checked~&]:block">
          <AdminSection title={t("disciplinesUi.tabs.disciplines")} description={`${disciplines.length} disciplines enregistrées`}>
            <AdminDataTable>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border/50">
                    <tr className="bg-card/20">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("disciplinesUi.table.code")}
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("disciplinesUi.table.designation")}
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("disciplinesUi.table.space")}
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("disciplinesUi.table.status")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {disciplines.map((disc) => (
                      <tr key={disc.id} className="hover:bg-card/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-primary">
                            {disc.code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-foreground">
                            {disc.designation}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-primary/10 ring-1 ring-primary/20 text-primary">
                            <Waves size={11} />
                            {disc.espace.designation}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {disc.actif === 1 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 ring-1 ring-primary/30 text-primary">
                              <CheckCircle className="w-3 h-3" />
                              {t("status.active")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted/10 ring-1 ring-border/30 text-muted-foreground">
                              <XCircle className="w-3 h-3" />
                              {t("status.inactive")}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {disciplines.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-card/50 ring-1 ring-border flex items-center justify-center mx-auto mb-3">
                    <Dumbbell className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Aucune discipline configurée</p>
                </div>
              )}
            </AdminDataTable>
          </AdminSection>
        </div>
      </div>
    </AdminPageShell>
  );
}