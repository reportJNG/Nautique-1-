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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/30 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              {t("adherentsUi.newButton")}
            </Link>
          }
        >
          {/* Stats Cards */}
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>{totalCount} {tc("total")}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>{activeCount} {t("status.active")}</span>
            </div>
            {inactiveCount > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/10 border border-border/20 text-muted-foreground text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-muted" />
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
          <p className="text-xs text-muted-foreground">
            {totalCount} {totalCount === 1 ? 'résultat' : 'résultats'}
          </p>
        </div>

        {/* Table */}
        <AdminSection>
          <div className="overflow-x-auto rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm">
            <table className="w-full">
              <thead className="border-b border-border/30 bg-muted/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("adherentsUi.table.name")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("adherentsUi.table.email")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("adherentsUi.table.organization")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("adherentsUi.table.status")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("adherentsUi.table.signupDate")}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {tc("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {adherents.map((adherent) => {
                  const initials = `${adherent.prenom?.[0] ?? ""}${adherent.nom?.[0] ?? ""}`.toUpperCase();
                  return (
                    <tr key={adherent.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0 shadow-lg">
                            {initials || "?"}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-foreground">
                              {adherent.prenom} {adherent.nom}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono mt-0.5">
                              {adherent.numeroDossier}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{adherent.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
                          <Building2 className="w-3 h-3 text-primary" />
                          <span className="text-xs font-medium text-primary">
                            {adherent.organisation.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${adherent.actif === 1
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-muted/10 text-muted-foreground border border-border/20'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${adherent.actif === 1 ? 'bg-primary animate-pulse' : 'bg-muted'
                            }`} />
                          {adherent.actif === 1 ? t("status.active") : t("status.inactive")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/20 hover:bg-muted/30 border border-border/30 text-sm text-muted-foreground hover:text-primary transition-all"
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
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  {t.has("adherentsUi.noResults") ? t("adherentsUi.noResults") : "Aucun adhérent trouvé"}
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 py-4 border-t border-border/30">
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
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg'
                        : 'bg-muted/20 hover:bg-muted/30 text-muted-foreground'
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