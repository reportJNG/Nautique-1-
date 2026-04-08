import { getTranslations } from "next-intl/server";
import { UserCog, Mail, Hash, CheckCircle, XCircle } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import {
  AdminPageHeader,
  AdminSection,
  AdminDataTable,
  AdminPageShell,
} from "@/components/admin/AdminPage";

async function getAgents() {
  return prisma.agent.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AgentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const agents = await getAgents();

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
        description={t("agentsUi.listTitle")}
        icon={<UserCog />}
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

                  return (
                    <tr key={agent.id} className="transition-colors hover:bg-card/50">
                      <td className="px-6 py-4">
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
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-md bg-transparent px-2.5 py-1 text-xs font-medium ring-1 ${roleColorClass}`}
                        >
                          {t(`roles.${agent.role.code}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
                          <span className="truncate">{agent.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-md bg-transparent px-2.5 py-1 text-xs font-medium ring-1 ${statusBadge.color}`}
                        >
                          {statusBadge.icon}
                          {statusBadge.label}
                        </span>
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
              <p className="text-sm text-muted-foreground/50">{t("agentsUi.empty")}</p>
            </div>
          )}
        </AdminDataTable>
      </AdminSection>
    </AdminPageShell>
  );
}
