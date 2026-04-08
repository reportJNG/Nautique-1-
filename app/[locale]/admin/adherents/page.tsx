import { prisma } from "@/lib/db/prisma";
import { Link } from "@/i18n/navigation";
import {
  AdminPageHeader,
  AdminPageShell,
  AdminSection,
} from "@/components/admin/AdminPage";
import { getTranslations } from "next-intl/server";
import { Building2, ExternalLink, Plus, Users } from "lucide-react";
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
        { email: { contains: search, mode: "insensitive" as const } },
        { nom: { contains: search, mode: "insensitive" as const } },
        { prenom: { contains: search, mode: "insensitive" as const } },
        { numeroDossier: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(status && {
      actif: status === "active" ? 1 : status === "inactive" ? 0 : undefined,
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

  return {
    adherents,
    totalCount,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
  };
}

async function getOrganisations() {
  return prisma.organisation.findMany({
    select: { id: true, code: true, designation: true },
    orderBy: { code: "asc" },
  });
}

export default async function AdminAdherentsPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const { search, status, organisation, page } = resolvedSearchParams || {};

  const t = await getTranslations({ locale, namespace: "admin" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const { adherents, totalCount, totalPages } = await getAdherents({
    search,
    status,
    organisation,
    page: page ? parseInt(page) : 1,
  });

  const organisations = await getOrganisations();
  const activeCount = adherents.filter(
    (adherent) => adherent.actif === 1,
  ).length;
  const inactiveCount = totalCount - activeCount;
  const dateLocale =
    locale === "en" ? "en-US" : locale === "ar" ? "ar-DZ" : "fr-FR";

  return (
    <AdminPageShell locale={locale}>
      <div className="space-y-6">
        <AdminPageHeader
          title={t("adherentsUi.pageTitle")}
          description={t("adherentsUi.description")}
          icon={<Users className="h-5 w-5" />}
          actions={
            <Link
              href="/admin/adherents/nouveau"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              {t("adherentsUi.newButton")}
            </Link>
          }
        >
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Users className="h-3.5 w-3.5" />
              <span>
                {totalCount} {tc("total")}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span>
                {activeCount} {t("status.active")}
              </span>
            </div>
            {inactiveCount > 0 ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-border/20 bg-muted/10 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-muted" />
                <span>
                  {inactiveCount} {t("status.inactive")}
                </span>
              </div>
            ) : null}
          </div>
        </AdminPageHeader>

        <AdherentsFilters
          locale={locale}
          initialSearch={search}
          initialStatus={status}
          initialOrganisation={organisation}
          organisations={organisations}
          labels={{
            searchPlaceholder: t("adherentsUi.searchPlaceholder"),
            allStatuses: t("adherentsUi.filters.allStatuses"),
            active: t("status.active"),
            inactive: t("status.inactive"),
            allOrganisations: t("adherentsUi.filters.allOrganisations"),
            reset: t("adherentsUi.filters.reset"),
          }}
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {t("adherentsUi.resultsCount", { count: totalCount })}
          </p>
        </div>

        <AdminSection>
          <div className="overflow-x-auto rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm">
            <table className="w-full">
              <thead className="border-b border-border/30 bg-muted/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("adherentsUi.table.name")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("adherentsUi.table.email")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("adherentsUi.table.organization")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("adherentsUi.table.status")}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("adherentsUi.table.signupDate")}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {tc("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {adherents.map((adherent) => {
                  const initials =
                    `${adherent.prenom?.[0] ?? ""}${adherent.nom?.[0] ?? ""}`.toUpperCase();

                  return (
                    <tr
                      key={adherent.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 text-xs font-bold text-primary-foreground shadow-lg">
                            {initials || "?"}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-foreground">
                              {adherent.prenom} {adherent.nom}
                            </div>
                            <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                              {adherent.numeroDossier}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">
                          {adherent.email}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2 py-1">
                          <Building2 className="h-3 w-3 text-primary" />
                          <span className="text-xs font-medium text-primary">
                            {adherent.organisation.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                            adherent.actif === 1
                              ? "border border-primary/20 bg-primary/10 text-primary"
                              : "border border-border/20 bg-muted/10 text-muted-foreground"
                          }`}
                        >
                          <span
                            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                              adherent.actif === 1
                                ? "animate-pulse bg-primary"
                                : "bg-muted"
                            }`}
                          />
                          {adherent.actif === 1
                            ? t("status.active")
                            : t("status.inactive")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(adherent.createdAt).toLocaleDateString(
                            dateLocale,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/adherents/${adherent.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border/30 bg-muted/20 px-3 py-1.5 text-sm text-muted-foreground transition-all hover:bg-muted/30 hover:text-primary"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          {tc("view")}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {adherents.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t("adherentsUi.noResults")}
                </p>
              </div>
            ) : null}

            {totalPages > 1 ? (
              <div className="flex justify-center gap-2 border-t border-border/30 py-4">
                {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                  const currentPage = page ? parseInt(page) : 1;
                  let pageNum = index + 1;

                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 2 + index;
                    if (pageNum > totalPages) return null;
                  }

                  const isActive = currentPage === pageNum;
                  const params = new URLSearchParams();
                  if (search) params.set("search", search);
                  if (status) params.set("status", status);
                  if (organisation) params.set("organisation", organisation);
                  params.set("page", String(pageNum));

                  return (
                    <Link
                      key={pageNum}
                      href={`/admin/adherents${params.toString() ? `?${params.toString()}` : ""}`}
                      className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg"
                          : "bg-muted/20 text-muted-foreground hover:bg-muted/30"
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        </AdminSection>
      </div>
    </AdminPageShell>
  );
}
