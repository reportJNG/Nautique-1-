"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import type { z } from "zod";

import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  createAgentSchema,
  type AgentFormInput,
  type AgentSchemaMessages,
} from "@/lib/validators/agent";

type AgentFieldErrors = Partial<Record<keyof AgentFormInput, string>>;

type AgentMutationResult =
  | { success: true; createdId?: number; updatedId?: number; clearedReferences?: number }
  | { success: false; error: string; fieldErrors?: AgentFieldErrors };

function getValidationMessages(
  t: Awaited<ReturnType<typeof getTranslations>>,
): AgentSchemaMessages {
  return {
    nomRequired: t("nomRequired"),
    nomMin: t("nomMin"),
    nomMax: t("nomMax"),
    prenomRequired: t("prenomRequired"),
    prenomMin: t("prenomMin"),
    prenomMax: t("prenomMax"),
    loginRequired: t("loginRequired"),
    loginMin: t("loginMin"),
    loginMax: t("loginMax"),
    loginPattern: t("loginPattern"),
    emailInvalid: t("emailInvalid"),
    roleRequired: t("roleRequired"),
    statusRequired: t("statusRequired"),
    passwordRequired: t("passwordRequired"),
    passwordMin: t("passwordMin"),
    passwordMax: t("passwordMax"),
    passwordPattern: t("passwordPattern"),
    confirmPasswordRequired: t("confirmPasswordRequired"),
    confirmPasswordMismatch: t("confirmPasswordMismatch"),
    adminRoleForbidden: t("adminRoleForbidden"),
  };
}

function getFieldErrors(
  error: z.ZodError<AgentFormInput>,
): AgentFieldErrors {
  const flattened = error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(flattened)
      .map(([field, messages]) => [field, messages?.[0]])
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  ) as AgentFieldErrors;
}

function revalidateAgentPaths(
  locale: string,
  options?: { agentId?: number },
) {
  revalidatePath(`/${locale}/admin/agents`);
  revalidatePath(`/${locale}/admin/agents/new`);

  if (options?.agentId) {
    revalidatePath(`/${locale}/admin/agents/${options.agentId}`);
  }
}

function isValidAgentId(agentId: number) {
  return Number.isInteger(agentId) && agentId > 0;
}

async function getRoleByCode(roleCode: string) {
  return prisma.agentRole.findUnique({
    where: { code: roleCode },
    select: { id: true, code: true },
  });
}

function duplicateLoginResult(
  feedbackT: Awaited<ReturnType<typeof getTranslations>>,
): AgentMutationResult {
  return {
    success: false,
    error: feedbackT("loginTaken"),
    fieldErrors: {
      login: feedbackT("loginTaken"),
    },
  };
}

function invalidRoleResult(
  feedbackT: Awaited<ReturnType<typeof getTranslations>>,
): AgentMutationResult {
  return {
    success: false,
    error: feedbackT("roleUnavailable"),
    fieldErrors: {
      roleCode: feedbackT("roleUnavailable"),
    },
  };
}

export async function createAgent(
  locale: string,
  input: AgentFormInput,
): Promise<AgentMutationResult> {
  const [validationT, feedbackT] = await Promise.all([
    getTranslations({
      locale,
      namespace: "admin.agentsUi.form.validation",
    }),
    getTranslations({
      locale,
      namespace: "admin.agentsUi.form.feedback",
    }),
  ]);

  try {
    await requireRole(["ADMIN"]);

    const schema = createAgentSchema(getValidationMessages(validationT), {
      requirePassword: true,
      allowAdminRole: false,
    });
    const parsed = schema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: feedbackT("invalidForm"),
        fieldErrors: getFieldErrors(parsed.error),
      };
    }

    const [existingLogin, role] = await Promise.all([
      prisma.agent.findUnique({
        where: { login: parsed.data.login },
        select: { id: true },
      }),
      getRoleByCode(parsed.data.roleCode),
    ]);

    if (existingLogin) {
      return duplicateLoginResult(feedbackT);
    }

    if (!role || role.code === "ADMIN") {
      return invalidRoleResult(feedbackT);
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

    const agent = await prisma.agent.create({
      data: {
        roleId: role.id,
        nom: parsed.data.nom,
        prenom: parsed.data.prenom,
        login: parsed.data.login,
        motDePasse: hashedPassword,
        email: parsed.data.email || null,
        actif: parsed.data.actif === "1" ? 1 : 0,
      },
      select: { id: true },
    });

    revalidateAgentPaths(locale, { agentId: agent.id });

    return {
      success: true,
      createdId: agent.id,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return {
        success: false,
        error: feedbackT("forbidden"),
      };
    }

    console.error("Create agent error:", error);

    return {
      success: false,
      error: feedbackT("unexpected"),
    };
  }
}

export async function updateAgent(
  locale: string,
  agentId: number,
  input: AgentFormInput,
): Promise<AgentMutationResult> {
  const [validationT, feedbackT] = await Promise.all([
    getTranslations({
      locale,
      namespace: "admin.agentsUi.form.validation",
    }),
    getTranslations({
      locale,
      namespace: "admin.agentsUi.form.feedback",
    }),
  ]);

  try {
    const session = await requireRole(["ADMIN"]);

    if (!isValidAgentId(agentId)) {
      return {
        success: false,
        error: feedbackT("notFound"),
      };
    }

    const existingAgent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        role: {
          select: { code: true },
        },
      },
    });

    if (!existingAgent) {
      return {
        success: false,
        error: feedbackT("notFound"),
      };
    }

    const isProtectedAdmin = existingAgent.role.code === "ADMIN";
    const isSelf = session.id === existingAgent.id;

    const schema = createAgentSchema(getValidationMessages(validationT), {
      requirePassword: false,
      allowAdminRole: isProtectedAdmin,
    });
    const parsed = schema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: feedbackT("invalidForm"),
        fieldErrors: getFieldErrors(parsed.error),
      };
    }

    if (isSelf && parsed.data.actif !== "1") {
      return {
        success: false,
        error: feedbackT("selfDeactivateForbidden"),
        fieldErrors: {
          actif: feedbackT("selfDeactivateForbidden"),
        },
      };
    }

    if (isSelf && parsed.data.roleCode !== existingAgent.role.code) {
      return {
        success: false,
        error: feedbackT("selfRoleForbidden"),
        fieldErrors: {
          roleCode: feedbackT("selfRoleForbidden"),
        },
      };
    }

    if (isProtectedAdmin && parsed.data.actif !== "1") {
      return {
        success: false,
        error: feedbackT("protectedAdmin"),
        fieldErrors: {
          actif: feedbackT("protectedAdmin"),
        },
      };
    }

    const nextRoleCode = isProtectedAdmin
      ? existingAgent.role.code
      : parsed.data.roleCode;

    const [role, duplicateLogin] = await Promise.all([
      getRoleByCode(nextRoleCode),
      prisma.agent.findUnique({
        where: { login: parsed.data.login },
        select: { id: true },
      }),
    ]);

    if (duplicateLogin && duplicateLogin.id !== agentId) {
      return duplicateLoginResult(feedbackT);
    }

    if (!role || (!isProtectedAdmin && role.code === "ADMIN")) {
      return invalidRoleResult(feedbackT);
    }

    const updateData: {
      roleId: number;
      nom: string;
      prenom: string;
      login: string;
      email: string | null;
      actif: number;
      motDePasse?: string;
    } = {
      roleId: role.id,
      nom: parsed.data.nom,
      prenom: parsed.data.prenom,
      login: parsed.data.login,
      email: parsed.data.email || null,
      actif: isProtectedAdmin ? 1 : parsed.data.actif === "1" ? 1 : 0,
    };

    if (parsed.data.password) {
      updateData.motDePasse = await bcrypt.hash(parsed.data.password, 12);
    }

    await prisma.agent.update({
      where: { id: agentId },
      data: updateData,
    });

    revalidateAgentPaths(locale, { agentId });

    return {
      success: true,
      updatedId: agentId,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return {
        success: false,
        error: feedbackT("forbidden"),
      };
    }

    console.error("Update agent error:", error);

    return {
      success: false,
      error: feedbackT("unexpected"),
    };
  }
}

export async function deleteAgent(
  locale: string,
  agentId: number,
): Promise<AgentMutationResult> {
  const feedbackT = await getTranslations({
    locale,
    namespace: "admin.agentsUi.form.feedback",
  });

  try {
    const session = await requireRole(["ADMIN"]);

    if (!isValidAgentId(agentId)) {
      return {
        success: false,
        error: feedbackT("notFound"),
      };
    }

    const existingAgent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        role: {
          select: { code: true },
        },
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

    if (!existingAgent) {
      return {
        success: false,
        error: feedbackT("notFound"),
      };
    }

    if (session.id === existingAgent.id) {
      return {
        success: false,
        error: feedbackT("selfDeleteForbidden"),
      };
    }

    if (existingAgent.role.code === "ADMIN") {
      return {
        success: false,
        error: feedbackT("protectedAdmin"),
      };
    }

    const clearedReferences =
      existingAgent._count.adherentsCreated +
      existingAgent._count.abonnementsCreated +
      existingAgent._count.facturesCreated +
      existingAgent._count.facturesValidated;

    await prisma.$transaction([
      prisma.adherent.updateMany({
        where: { createdBy: agentId },
        data: { createdBy: null },
      }),
      prisma.abonnement.updateMany({
        where: { createdBy: agentId },
        data: { createdBy: null },
      }),
      prisma.facture.updateMany({
        where: { createdBy: agentId },
        data: { createdBy: null },
      }),
      prisma.facture.updateMany({
        where: { validatedBy: agentId },
        data: { validatedBy: null },
      }),
      prisma.agent.delete({
        where: { id: agentId },
      }),
    ]);

    revalidateAgentPaths(locale, { agentId });

    return {
      success: true,
      clearedReferences,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return {
        success: false,
        error: feedbackT("forbidden"),
      };
    }

    console.error("Delete agent error:", error);

    return {
      success: false,
      error: feedbackT("unexpected"),
    };
  }
}

export async function toggleAgentStatus(
  locale: string,
  agentId: number,
): Promise<AgentMutationResult> {
  const feedbackT = await getTranslations({
    locale,
    namespace: "admin.agentsUi.form.feedback",
  });

  try {
    const session = await requireRole(["ADMIN"]);

    if (!isValidAgentId(agentId)) {
      return {
        success: false,
        error: feedbackT("notFound"),
      };
    }

    const existingAgent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        role: {
          select: { code: true },
        },
      },
    });

    if (!existingAgent) {
      return {
        success: false,
        error: feedbackT("notFound"),
      };
    }

    if (session.id === existingAgent.id) {
      return {
        success: false,
        error: feedbackT("selfDeactivateForbidden"),
      };
    }

    if (existingAgent.role.code === "ADMIN") {
      return {
        success: false,
        error: feedbackT("protectedAdmin"),
      };
    }

    await prisma.agent.update({
      where: { id: agentId },
      data: {
        actif: existingAgent.actif === 1 ? 0 : 1,
      },
    });

    revalidateAgentPaths(locale, { agentId });

    return {
      success: true,
      updatedId: agentId,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return {
        success: false,
        error: feedbackT("forbidden"),
      };
    }

    console.error("Toggle agent status error:", error);

    return {
      success: false,
      error: feedbackT("unexpected"),
    };
  }
}
