import { z } from "zod";

export const SAISON_STATUS_VALUES = ["PRE", "OUV", "FER", "CLO"] as const;

export type SaisonStatusValue = (typeof SAISON_STATUS_VALUES)[number];

export type CreateSaisonInput = {
  designation: string;
  dateDebut: string;
  dateFin: string;
  statut: SaisonStatusValue;
};

export type CreateSaisonSchemaMessages = {
  designationRequired: string;
  designationMin: string;
  designationMax: string;
  dateDebutRequired: string;
  dateFinRequired: string;
  invalidDate: string;
  endBeforeStart: string;
  statusRequired: string;
};

const DATE_INPUT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeSaisonDesignation(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function isValidDateInput(value: string) {
  if (!DATE_INPUT_REGEX.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    !Number.isNaN(date.getTime()) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function dateInputToUtcDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function createSaisonSchema(messages: CreateSaisonSchemaMessages) {
  const dateField = (requiredMessage: string) =>
    z
      .string()
      .trim()
      .min(1, requiredMessage)
      .refine(isValidDateInput, messages.invalidDate);

  return z
    .object({
      designation: z
        .string()
        .transform(normalizeSaisonDesignation)
        .pipe(
          z
            .string()
            .min(1, messages.designationRequired)
            .min(3, messages.designationMin)
            .max(80, messages.designationMax),
        ),
      dateDebut: dateField(messages.dateDebutRequired),
      dateFin: dateField(messages.dateFinRequired),
      statut: z.enum(SAISON_STATUS_VALUES, {
        error: () => messages.statusRequired,
      }),
    })
    .superRefine(({ dateDebut, dateFin }, ctx) => {
      if (!isValidDateInput(dateDebut) || !isValidDateInput(dateFin)) {
        return;
      }

      if (dateInputToUtcDate(dateFin) < dateInputToUtcDate(dateDebut)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dateFin"],
          message: messages.endBeforeStart,
        });
      }
    });
}
