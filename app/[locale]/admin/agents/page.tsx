import Link from "next/link";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import {
  CheckCircle,
  Hash,
  Mail,
  Plus,
  UserCog,
  XCircle,
} from "lucide-react";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  AdminDataTable,
  AdminPageHeader,
  AdminPageShell,
  AdminSection,
} from "@/components/admin/AdminPage";

async function getAgents() {
  return prisma.agent.findMany({
    include: { role: true },
    orderBy: [{ createdAt: "desc" }, { nom: "asc" }, { prenom: "asc" }],
  });
}

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AgentsPage({ params }: PageProps) {
  const { locale } = await params;
  const [t, tc, session, agents] = await Promise.all([
    getTranslations({ locale, namespace: "admin" }),
    getTranslations({ locale, namespace: "common" }),
    getSession(),
    getAgents(),
  ]);

  const canManageAgents =
    session?.type === "agent" && session.roleCode === "ADMIN";

  const roleColors: Record<string, string> = {
    ADMIN: "text-primary ring-primary/30",
    DIR: "text-primary ring-primary/30",
    "RESP-COM": "text-primary ring-primary/30",
    "AG-COM": "text-primary ring-primary/30",
    "AG-FIN": "text-accent ring-accent/30",
  };

  const getStatusBadge = (actif: number) => {
    if (actif === 1) {
      return {
        label: t("status.active"),
        color: "text-primary ring-primary/30",
        icon: <CheckCircle className="mr-1 h-3 w-3" />,
      };
    }

    return {
      label: t("status.inactive"),
      color: "text-muted-foreground ring-border/30",
      icon: <XCircle className="mr-1 h-3 w-3" />,
    };
  };

  return (
    <AdminPageShell locale={locale}>
      <AdminPageHeader
        title={t("agentsUi.pageTitle")}
        description={t("agentsUi.pageDescription", {
          count: agents.length,
        })}
        icon={<UserCog />}
        actions={
          canManageAgents ? (
            <Link
              href={`/${locale}/admin/agents/new`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-primary to-primary/80 px-4 py-2 text-[13px] font-semibold text-primary-foreground shadow-[0_2px_8px_hsl(var(--primary)/0.3)] transition-all duration-150 hover:-translate-y-px hover:opacity-90 [&_svg]:h-[15px] [&_svg]:w-[15px]"
            >
              <Plus />
              {t("agentsUi.newButton")}
            </Link>
          ) : null
        }
      />

      <AdminSection
        title={t("agentsUi.listTitle")}
        description={`${agents.length} ${tc("total")}`}
      >
        <AdminDataTable>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("agentsUi.table.name")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("agentsUi.table.role")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("agentsUi.table.email")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("agentsUi.table.status")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {agents.map((agent) => {
                  const initials =
                    `${agent.prenom?.[0] ?? ""}${agent.nom?.[0] ?? ""}`.toUpperCase();
                  const statusBadge = getStatusBadge(agent.actif);
                  const roleColorClass =
                    roleColors[agent.role.code] ?? roleColors["AG-COM"];
                  const detailHref = `/${locale}/admin/agents/${agent.id}` as Route;

                  const nameContent = (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 ring-2 ring-primary/30 shadow-sm">
                        <span className="text-xs font-bold text-primary-foreground">
                          {initials}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {agent.prenom} {agent.nom}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 font-mono text-xs text-muted-foreground">
                          <Hash className="h-3 w-3" />
                          {agent.login}
                        </div>
                      </div>
                    </div>
                  );

                  const roleContent = (
                    <span
                      className={`inline-flex items-center rounded-md bg-transparent px-2.5 py-1 text-xs font-medium ring-1 ${roleColorClass}`}
                    >
                      {t(`roles.${agent.role.code}`)}
                    </span>
                  );

                  const emailContent = (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
                      <span className="truncate">
                        {agent.email || t("agentsUi.noEmail")}
                      </span>
                    </div>
                  );

                  const statusContent = (
                    <span
                      className={`inline-flex items-center rounded-md bg-transparent px-2.5 py-1 text-xs font-medium ring-1 ${statusBadge.color}`}
                    >
                      {statusBadge.icon}
                      {statusBadge.label}
                    </span>
                  );

                  return (
                    <tr
                      key={agent.id}
                      className={`transition-colors ${canManageAgents ? "hover:bg-card/50" : ""}`}
                    >
                      <td className="px-6 py-4">
                        {canManageAgents ? (
                          <Link href={detailHref} className="block">
                            {nameContent}
                          </Link>
                        ) : (
                          nameContent
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {canManageAgents ? (
                          <Link href={detailHref} className="block w-fit">
                            {roleContent}
                          </Link>
                        ) : (
                          roleContent
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {canManageAgents ? (
                          <Link href={detailHref} className="block">
                            {emailContent}
                          </Link>
                        ) : (
                          emailContent
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {canManageAgents ? (
                          <Link href={detailHref} className="block w-fit">
                            {statusContent}
                          </Link>
                        ) : (
                          statusContent
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {agents.length === 0 && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-card/50 ring-1 ring-border">
                <UserCog className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground/50">
                {t("agentsUi.empty")}
              </p>
            </div>
          )}
        </AdminDataTable>
      </AdminSection>
    </AdminPageShell>
  );
}
