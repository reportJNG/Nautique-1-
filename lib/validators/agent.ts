import { z } from "zod";

export const AGENT_STATUS_VALUES = ["1", "0"] as const;

export type AgentStatusValue = (typeof AGENT_STATUS_VALUES)[number];

export type AgentFormInput = {
  nom: string;
  prenom: string;
  login: string;
  email: string;
  roleCode: string;
  actif: AgentStatusValue;
  password: string;
  confirmPassword: string;
};

export type AgentSchemaMessages = {
  nomRequired: string;
  nomMin: string;
  nomMax: string;
  prenomRequired: string;
  prenomMin: string;
  prenomMax: string;
  loginRequired: string;
  loginMin: string;
  loginMax: string;
  loginPattern: string;
  emailInvalid: string;
  roleRequired: string;
  statusRequired: string;
  passwordRequired: string;
  passwordMin: string;
  passwordMax: string;
  passwordPattern: string;
  confirmPasswordRequired: string;
  confirmPasswordMismatch: string;
  adminRoleForbidden: string;
};

type CreateAgentSchemaOptions = {
  requirePassword: boolean;
  allowAdminRole?: boolean;
};

export function normalizeAgentName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeAgentLogin(value: string) {
  return value.trim();
}

export function normalizeOptionalAgentText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function createAgentSchema(
  messages: AgentSchemaMessages,
  options: CreateAgentSchemaOptions,
) {
  const requiredNameField = (
    requiredMessage: string,
    minMessage: string,
    maxMessage: string,
  ) =>
    z
      .string()
      .transform(normalizeAgentName)
      .pipe(
        z
          .string()
          .min(1, requiredMessage)
          .min(2, minMessage)
          .max(60, maxMessage),
      );

  return z
    .object({
      nom: requiredNameField(
        messages.nomRequired,
        messages.nomMin,
        messages.nomMax,
      ),
      prenom: requiredNameField(
        messages.prenomRequired,
        messages.prenomMin,
        messages.prenomMax,
      ),
      login: z
        .string()
        .transform(normalizeAgentLogin)
        .pipe(
          z
            .string()
            .min(1, messages.loginRequired)
            .min(3, messages.loginMin)
            .max(60, messages.loginMax)
            .regex(/^[a-zA-Z0-9_.-]+$/, messages.loginPattern),
        ),
      email: z
        .string()
        .transform((value) => value.trim())
        .refine(
          (value) => value.length === 0 || z.email().safeParse(value).success,
          messages.emailInvalid,
        ),
      roleCode: z
        .string()
        .transform((value) => value.trim())
        .pipe(z.string().min(1, messages.roleRequired)),
      actif: z.enum(AGENT_STATUS_VALUES, {
        error: () => messages.statusRequired,
      }),
      password: z
        .string()
        .transform((value) => value.trim())
        .pipe(z.string().max(128, messages.passwordMax)),
      confirmPassword: z
        .string()
        .transform((value) => value.trim())
        .pipe(z.string().max(128, messages.passwordMax)),
    })
    .superRefine((data, ctx) => {
      if (!options.allowAdminRole && data.roleCode === "ADMIN") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["roleCode"],
          message: messages.adminRoleForbidden,
        });
      }

      const passwordProvided = data.password.length > 0;
      const confirmProvided = data.confirmPassword.length > 0;

      if (options.requirePassword && !passwordProvided) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: messages.passwordRequired,
        });
      }

      if (options.requirePassword && !confirmProvided) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["confirmPassword"],
          message: messages.confirmPasswordRequired,
        });
      }

      if (!passwordProvided && !confirmProvided) {
        return;
      }

      if (!passwordProvided) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: messages.passwordRequired,
        });
      }

      if (!confirmProvided) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["confirmPassword"],
          message: messages.confirmPasswordRequired,
        });
      }

      if (!passwordProvided) {
        return;
      }

      if (data.password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: messages.passwordMin,
        });
      }

      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: messages.passwordPattern,
        });
      }

      if (passwordProvided && confirmProvided && data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["confirmPassword"],
          message: messages.confirmPasswordMismatch,
        });
      }
    });
}
