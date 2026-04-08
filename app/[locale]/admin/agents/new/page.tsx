import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, UserPlus } from "lucide-react";

import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  AdminPageHeader,
  AdminPageShell,
} from "@/components/admin/AdminPage";

import { AgentForm } from "../AgentForm";

type PageProps = {
  params: Promise<{ locale: string }>;
};

async function getAssignableRoles() {
  return prisma.agentRole.findMany({
    where: {
      code: {
        not: "ADMIN",
      },
    },
    orderBy: {
      designation: "asc",
    },
  });
}

export default async function NewAgentPage({ params }: PageProps) {
  const { locale } = await params;
  const [t, session, roles] = await Promise.all([
    getTranslations({ locale, namespace: "admin" }),
    getSession(),
    getAssignableRoles(),
  ]);

  const isAdmin =
    session?.type === "agent" && session.roleCode === "ADMIN";

  if (!isAdmin) {
    redirect({ href: "/admin/agents", locale });
  }

  return (
    <AdminPageShell locale={locale}>
      <Link
        href={`/${locale}/admin/agents`}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border/50 bg-muted/10 px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/20"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("agentsUi.detail.back")}
      </Link>

      <AdminPageHeader
        title={t("agentsUi.newPage.title")}
        description={t("agentsUi.newPage.description")}
        icon={<UserPlus className="h-5 w-5" />}
      />

      <AgentForm
        locale={locale}
        mode="create"
        roleOptions={roles.map((role) => ({
          code: role.code,
          label: t(`roles.${role.code}`),
        }))}
      />
    </AdminPageShell>
  );
}
