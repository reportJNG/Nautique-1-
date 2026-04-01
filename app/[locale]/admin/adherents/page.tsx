// app/[locale]/admin/adherents/page.tsx
import { prisma } from "@/lib/db/prisma";
import { Link } from "@/i18n/navigation";
import { AdminPageHeader, AdminSection, AdminPageShell } from "@/components/admin/AdminPage";
import { getTranslations } from "next-intl/server";
import { Users, Plus, ExternalLink, Building2 } from "lucide-react";
import { AdherentsFilters } from "./AdherentsFilters";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    search?: string;
    status?: string;
    organisation?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 20;

async function getAdherents(filters: {
  search?: string;
  status?: string;
  organisation?: string;
  page?: number;
}) {
  const { search, status, organisation, page = 1 } = filters;

  const where = {
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' as const } },
        { nom: { contains: search, mode: 'insensitive' as const } },
        { prenom: { contains: search, mode: 'insensitive' as const } },
        { numeroDossier: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(status && {
      actif: status === 'active' ? 1 : status === 'inactive' ? 0 : undefined,
    }),
    ...(organisation && {
      organisationId: parseInt(organisation),
    }),
  };

  const [adherents, totalCount] = await Promise.all([
    prisma.adherent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { organisation: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.adherent.count({ where }),
  ]);

  return { adherents, totalCount, totalPages: Math.ceil(totalCount / PAGE_SIZE) };
}

async function getOrganisations() {
  return prisma.organisation.findMany({
    select: { id: true, code: true, designation: true },
    orderBy: { code: 'asc' },
  });
}

export default async function AdminAdherentsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const { search, status, organisation, page } = resolvedSearchParams || {};

  const t = await getTranslations({ locale, namespace: "admin" });
  const tc = await getTranslations({ locale, namespace: "common" });

  // Fetch data
  const { adherents, totalCount, totalPages } = await getAdherents({
    search,
    status,
    organisation,
    page: page ? parseInt(page) : 1,
  });

  const organisations = await getOrganisations();

  // Calculate stats
  const activeCount = adherents.filter((a) => a.actif === 1).length;
  const inactiveCount = totalCount - activeCount;

  const dateLocale = locale === "en" ? "en-US" : locale === "ar" ? "ar-DZ" : "fr-FR";

  return (
    <AdminPageShell locale={locale}>
      <div className="space-y-6">
        <AdminPageHeader
          title={t("adherentsUi.pageTitle")}
          description={t("adherentsUi.description")}
          icon={<Users className="w-5 h-5" />}
          actions={
            <Link
              href={`/admin/adherents/nouveau`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/30 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              {t("adherentsUi.newButton")}
            </Link>
          }
        >
          {/* Stats Cards */}
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>{totalCount} {tc("total")}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{activeCount} {t("status.active")}</span>
            </div>
            {inactiveCount > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>{inactiveCount} {t("status.inactive")}</span>
              </div>
            )}
          </div>
        </AdminPageHeader>

        {/* Filters - Client Component */}
        <AdherentsFilters
          locale={locale}
          initialSearch={search}
          initialStatus={status}
          initialOrganisation={organisation}
          organisations={organisations}
          labels={{
            searchPlaceholder: t("adherentsUi.searchPlaceholder"),
            allStatuses: t.has("filters.allStatuses") ? t("filters.allStatuses") : "Tous les statuts",
            active: t("status.active"),
            inactive: t("status.inactive"),
            allOrganisations: t.has("filters.allOrganisations") ? t("filters.allOrganisations") : "Toutes les organisations",
            reset: t.has("filters.reset") ? t("filters.reset") : "Réinitialiser",
          }}
        />

        {/* Results Count */}
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500">
            {totalCount} {totalCount === 1 ? 'résultat' : 'résultats'}
          </p>
        </div>

        {/* Table */}
        <AdminSection>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t("adherentsUi.table.name")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t("adherentsUi.table.email")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t("adherentsUi.table.organization")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t("adherentsUi.table.status")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t("adherentsUi.table.signupDate")}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {tc("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {adherents.map((adherent) => {
                  const initials = `${adherent.prenom?.[0] ?? ""}${adherent.nom?.[0] ?? ""}`.toUpperCase();
                  return (
                    <tr key={adherent.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-lg">
                            {initials || "?"}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-200">
                              {adherent.prenom} {adherent.nom}
                            </div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">
                              {adherent.numeroDossier}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-400">{adherent.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                          <Building2 className="w-3 h-3 text-cyan-400" />
                          <span className="text-xs font-medium text-cyan-400">
                            {adherent.organisation.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${adherent.actif === 1
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${adherent.actif === 1 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                            }`} />
                          {adherent.actif === 1 ? t("status.active") : t("status.inactive")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">
                          {new Date(adherent.createdAt).toLocaleDateString(dateLocale, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/adherents/${adherent.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-slate-400 hover:text-cyan-400 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {tc("view")}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Empty State */}
            {adherents.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  {t.has("adherentsUi.noResults") ? t("adherentsUi.noResults") : "Aucun adhérent trouvé"}
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 py-4 border-t border-white/10">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const currentPage = page ? parseInt(page) : 1;
                  let pageNum = i + 1;

                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 2 + i;
                    if (pageNum > totalPages) return null;
                  }

                  const isActive = currentPage === pageNum;
                  const params = new URLSearchParams();
                  if (search) params.set('search', search);
                  if (status) params.set('status', status);
                  if (organisation) params.set('organisation', organisation);
                  params.set('page', String(pageNum));

                  return (
                    <Link
                      key={pageNum}
                      href={`/admin/adherents${params.toString() ? `?${params.toString()}` : ''}`}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${isActive
                        ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400'
                        }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </AdminSection>
      </div>
    </AdminPageShell>
  );
}