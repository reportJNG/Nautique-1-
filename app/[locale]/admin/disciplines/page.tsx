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
    { border: "ring-cyan-500/30", glow: "bg-cyan-500/5", accent: "text-cyan-400" },
    { border: "ring-teal-500/30", glow: "bg-teal-500/5", accent: "text-teal-400" },
    { border: "ring-sky-500/30", glow: "bg-sky-500/5", accent: "text-sky-400" },
    { border: "ring-blue-500/30", glow: "bg-blue-500/5", accent: "text-blue-400" },
  ];

  return (
    <AdminPageShell locale={locale}>
      <style>{`
        .dis-tabs { display: flex; gap: 4px; margin-bottom: 24px; }
        .dis-tab-input { display: none; }
        .dis-tab-label {
          padding: 8px 18px; border-radius: 8px;
          font-size: 13px; font-weight: 500; cursor: pointer;
          color: #94a3b8; background: transparent;
          transition: all 180ms ease; user-select: none;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .dis-tab-input:checked + .dis-tab-label {
          background: rgba(6,182,212,0.1);
          color: #22d3ee;
          font-weight: 600;
          ring: 1px solid rgba(6,182,212,0.3);
        }
        .dis-tab-label:hover { color: #e2f0ff; background: rgba(255,255,255,0.04); }
        #dis-tab-espaces:checked  ~ .dis-content .dis-panel-espaces     { display: block; }
        #dis-tab-espaces:checked  ~ .dis-content .dis-panel-disciplines { display: none; }
        #dis-tab-disc:checked     ~ .dis-content .dis-panel-espaces     { display: none; }
        #dis-tab-disc:checked     ~ .dis-content .dis-panel-disciplines { display: block; }
        .dis-espace-grid { display: grid; gap: 16px; grid-template-columns: 1fr; }
        @media (min-width: 768px) { .dis-espace-grid { grid-template-columns: repeat(2, 1fr); } }
        .dis-content { margin-top: 0; }
      `}</style>

      <AdminPageHeader
        title={t("disciplinesUi.pageTitle")}
        description={`${espaces.length} espaces · ${disciplines.length} disciplines`}
        icon={<Dumbbell />}
      />

      <input type="radio" name="dis-tab" id="dis-tab-espaces" className="dis-tab-input" defaultChecked />
      <input type="radio" name="dis-tab" id="dis-tab-disc" className="dis-tab-input" />

      <div className="dis-tabs">
        <label htmlFor="dis-tab-espaces" className="dis-tab-label">
          <Waves size={14} />
          {t("disciplinesUi.tabs.espaces")}
        </label>
        <label htmlFor="dis-tab-disc" className="dis-tab-label">
          <Tag size={14} />
          {t("disciplinesUi.tabs.disciplines")}
        </label>
      </div>

      <div className="dis-content">
        <div className="dis-panel-espaces">
          <div className="dis-espace-grid">
            {espaces.map((espace, idx) => {
              const col = espaceColors[idx % espaceColors.length];
              return (
                <div
                  key={espace.id}
                  className={`rounded-2xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-sm p-5 flex flex-col gap-4 transition-all duration-200 hover:translate-y-[-2px] hover:bg-slate-900/60 ring-1 ${col.border}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-base font-bold text-slate-100">
                      {espace.designation}
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ring-1 bg-transparent ${col.border} ${col.accent}`}>
                      {espace.code}
                    </span>
                  </div>
                  {espace.description && (
                    <div className="text-sm text-slate-400 leading-relaxed">
                      {espace.description}
                    </div>
                  )}
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                      {t("disciplinesUi.labelAgeCategories")}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {espace.categoriesAge.map((cat) => (
                        <span
                          key={cat.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-800/50 ring-1 ring-slate-700 text-slate-300"
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

        <div className="dis-panel-disciplines">
          <AdminSection title={t("disciplinesUi.tabs.disciplines")} description={`${disciplines.length} disciplines enregistrées`}>
            <AdminDataTable>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-700/50">
                    <tr className="bg-slate-800/20">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {t("disciplinesUi.table.code")}
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {t("disciplinesUi.table.designation")}
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {t("disciplinesUi.table.space")}
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {t("disciplinesUi.table.status")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {disciplines.map((disc) => (
                      <tr key={disc.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-cyan-400">
                            {disc.code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-200">
                            {disc.designation}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-cyan-500/10 ring-1 ring-cyan-500/20 text-cyan-400">
                            <Waves size={11} />
                            {disc.espace.designation}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {disc.actif === 1 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-400">
                              <CheckCircle className="w-3 h-3" />
                              {t("status.active")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-500/10 ring-1 ring-slate-500/30 text-slate-400">
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
                  <div className="w-12 h-12 rounded-full bg-slate-800/50 ring-1 ring-slate-700 flex items-center justify-center mx-auto mb-3">
                    <Dumbbell className="w-6 h-6 text-slate-500" />
                  </div>
                  <p className="text-sm text-slate-500">Aucune discipline configurée</p>
                </div>
              )}
            </AdminDataTable>
          </AdminSection>
        </div>
      </div>
    </AdminPageShell>
  );
}