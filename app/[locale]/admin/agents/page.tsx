import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader, AdminSection, AdminDataTable, AdminPageShell } from "@/components/admin/AdminPage";
import { getTranslations } from "next-intl/server";
import { UserCog, Plus, Mail, Hash, CheckCircle, XCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";

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
        icon: <CheckCircle className="w-3 h-3 mr-1" />
      };
    }
    return {
      label: t("status.inactive"),
      color: "text-muted-foreground ring-border/30",
      icon: <XCircle className="w-3 h-3 mr-1" />
    };
  };

  return (
    <AdminPageShell locale={locale}>
      <AdminPageHeader
        title={t("agentsUi.pageTitle")}
        description={t("agentsUi.listTitle")}
        icon={<UserCog />}
        actions={
          <Link
            href={`/${locale}/admin/agents/nouveau`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary text-sm font-semibold ring-1 ring-primary/40 hover:bg-primary/30 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            {t("agentsUi.newButton")}
          </Link>
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
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("agentsUi.table.name")}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("agentsUi.table.role")}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("agentsUi.table.email")}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("agentsUi.table.status")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {agents.map((agent) => {
                  const initials = `${agent.prenom?.[0] ?? ""}${agent.nom?.[0] ?? ""}`.toUpperCase();
                  const statusBadge = getStatusBadge(agent.actif);
                  const roleColorClass = roleColors[agent.role.code] ?? roleColors["AG-COM"];

                  return (
                    <tr key={agent.id} className="hover:bg-card/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center ring-2 ring-primary/30 shadow-sm flex-shrink-0">
                            <span className="text-xs font-bold text-primary-foreground">{initials}</span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-foreground">
                              {agent.prenom} {agent.nom}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono mt-0.5">
                              <Hash className="w-3 h-3" />
                              {agent.login}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ring-1 bg-transparent ${roleColorClass}`}>
                          {t(`roles.${agent.role.code}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                          <span className="truncate">{agent.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ring-1 bg-transparent ${statusBadge.color}`}>
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

          {/* Empty State */}
          {agents.length === 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-card/50 ring-1 ring-border flex items-center justify-center mx-auto mb-3">
                <UserCog className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground/50">Aucun agent configuré</p>
            </div>
          )}
        </AdminDataTable>
      </AdminSection>
    </AdminPageShell>
  );
}