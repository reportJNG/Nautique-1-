import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Hash, Mail, Shield, UserCog } from "lucide-react";

import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  AdminPageHeader,
  AdminPageShell,
  AdminSection,
} from "@/components/admin/AdminPage";

import { AgentForm } from "../AgentForm";

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

async function getAgent(agentId: number) {
  return prisma.agent.findUnique({
    where: { id: agentId },
    include: {
      role: true,
      _count: {
        select: {
          adherentsCreated: true,
          abonnementsCreated: true,
          facturesCreated: true,
          facturesValidated: true,
        },
      },
    },
  });
}

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

function getDateLocale(locale: string) {
  if (locale === "ar") {
    return "ar-DZ";
  }

  if (locale === "en") {
    return "en-US";
  }

  return "fr-FR";
}

export default async function AgentDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  const [t, session] = await Promise.all([
    getTranslations({ locale, namespace: "admin" }),
    getSession(),
  ]);

  const isAdmin =
    session?.type === "agent" && session.roleCode === "ADMIN";

  if (!isAdmin) {
    redirect({ href: "/admin/agents", locale });
  }

  const agentId = Number.parseInt(id, 10);

  if (Number.isNaN(agentId)) {
    notFound();
  }

  const [agent, roles] = await Promise.all([
    getAgent(agentId),
    getAssignableRoles(),
  ]);

  if (!agent) {
    notFound();
  }

  const dateLocale = getDateLocale(locale);
  const linkedRecordsCount =
    agent._count.adherentsCreated +
    agent._count.abonnementsCreated +
    agent._count.facturesCreated +
    agent._count.facturesValidated;
  const statusBadgeClass =
    agent.actif === 1
      ? "inline-flex items-center rounded-full border border-primary/25 bg-primary/12 px-2.5 py-1 text-[11px] font-semibold text-primary"
      : "inline-flex items-center rounded-full border border-border/40 bg-muted/20 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground";

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
        title={`${agent.prenom} ${agent.nom}`}
        description={t("agentsUi.detail.subtitle", {
          login: agent.login,
        })}
        icon={<UserCog className="h-5 w-5" />}
        badge={
          <span className={statusBadgeClass}>
            {agent.actif === 1 ? t("status.active") : t("status.inactive")}
          </span>
        }
      >
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
            <Shield className="h-3.5 w-3.5" />
            {t(`roles.${agent.role.code}`)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <Hash className="h-3.5 w-3.5" />
            {agent.login}
          </span>
          {agent.email ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {agent.email}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {t("agentsUi.detail.createdAt", {
              date: new Date(agent.createdAt).toLocaleDateString(dateLocale, {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
            })}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {t("agentsUi.detail.updatedAt", {
              date: new Date(agent.updatedAt).toLocaleDateString(dateLocale, {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
            })}
          </span>
        </div>
      </AdminPageHeader>

      <AgentForm
        locale={locale}
        mode="edit"
        agentId={agent.id}
        roleOptions={roles.map((role) => ({
          code: role.code,
          label: t(`roles.${role.code}`),
        }))}
        currentRoleLabel={t(`roles.${agent.role.code}`)}
        isProtectedAdmin={agent.role.code === "ADMIN"}
        isSelf={session?.type === "agent" && session.id === agent.id}
        linkedRecordsCount={linkedRecordsCount}
        initialValues={{
          nom: agent.nom,
          prenom: agent.prenom,
          login: agent.login,
          email: agent.email ?? "",
          roleCode: agent.role.code,
          actif: agent.actif === 1 ? "1" : "0",
          password: "",
          confirmPassword: "",
        }}
      />

      <AdminSection
        title={t("agentsUi.detail.activityTitle")}
        description={t("agentsUi.detail.activityDescription")}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border/30 bg-background/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {t("agentsUi.detail.stats.adherentsCreated")}
            </p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {agent._count.adherentsCreated}
            </p>
          </div>

          <div className="rounded-xl border border-border/30 bg-background/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {t("agentsUi.detail.stats.abonnementsCreated")}
            </p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {agent._count.abonnementsCreated}
            </p>
          </div>

          <div className="rounded-xl border border-border/30 bg-background/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {t("agentsUi.detail.stats.facturesCreated")}
            </p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {agent._count.facturesCreated}
            </p>
          </div>

          <div className="rounded-xl border border-border/30 bg-background/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {t("agentsUi.detail.stats.facturesValidated")}
            </p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {agent._count.facturesValidated}
            </p>
          </div>
        </div>
      </AdminSection>
    </AdminPageShell>
  );
}
