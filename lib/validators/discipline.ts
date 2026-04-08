import { z } from "zod";

const ENTITY_CODE_REGEX = /^[A-Z0-9-]{2,10}$/;
const POSITIVE_INTEGER_REGEX = /^\d+$/;

export type CreateEspaceInput = {
  code: string;
  designation: string;
  description: string;
};

export type CreateDisciplineInput = {
  espaceId: string;
  code: string;
  designation: string;
};

export type CreateEspaceSchemaMessages = {
  codeRequired: string;
  codeInvalid: string;
  designationRequired: string;
  designationMin: string;
  designationMax: string;
  descriptionMax: string;
};

export type CreateDisciplineSchemaMessages = {
  espaceRequired: string;
  codeRequired: string;
  codeInvalid: string;
  designationRequired: string;
  designationMin: string;
  designationMax: string;
};

export function normalizeEntityCode(value: string) {
  return value.trim().toUpperCase();
}

export function normalizeEntityLabel(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeOptionalEntityText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function createCodeField(requiredMessage: string, invalidMessage: string) {
  return z
    .string()
    .transform(normalizeEntityCode)
    .pipe(
      z
        .string()
        .min(1, requiredMessage)
        .refine((value) => ENTITY_CODE_REGEX.test(value), invalidMessage),
    );
}

function createDesignationField(
  requiredMessage: string,
  minMessage: string,
  maxMessage: string,
) {
  return z
    .string()
    .transform(normalizeEntityLabel)
    .pipe(
      z
        .string()
        .min(1, requiredMessage)
        .min(2, minMessage)
        .max(80, maxMessage),
    );
}

export function createEspaceSchema(messages: CreateEspaceSchemaMessages) {
  return z.object({
    code: createCodeField(messages.codeRequired, messages.codeInvalid),
    designation: createDesignationField(
      messages.designationRequired,
      messages.designationMin,
      messages.designationMax,
    ),
    description: z
      .string()
      .transform(normalizeOptionalEntityText)
      .pipe(z.string().max(255, messages.descriptionMax)),
  });
}

export function createDisciplineSchema(
  messages: CreateDisciplineSchemaMessages,
) {
  return z.object({
    espaceId: z
      .string()
      .trim()
      .min(1, messages.espaceRequired)
      .refine(
        (value) =>
          POSITIVE_INTEGER_REGEX.test(value) && Number.parseInt(value, 10) > 0,
        messages.espaceRequired,
      )
      .transform((value) => Number.parseInt(value, 10)),
    code: createCodeField(messages.codeRequired, messages.codeInvalid),
    designation: createDesignationField(
      messages.designationRequired,
      messages.designationMin,
      messages.designationMax,
    ),
  });
}
