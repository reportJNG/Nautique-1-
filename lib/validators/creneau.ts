import { z } from "zod";

export type CreateCreneauInput = {
  saisonId: string;
  disciplineId: string;
  jourSemaine: string;
  heureDebut: string;
  heureFin: string;
  nombreMin: string;
  nombreMax: string;
  groupe: string;
  observations: string;
};

export type CreateCreneauSchemaMessages = {
  saisonRequired: string;
  disciplineRequired: string;
  dayRequired: string;
  heureDebutRequired: string;
  heureFinRequired: string;
  invalidTime: string;
  endBeforeStart: string;
  nombreMinRequired: string;
  nombreMaxRequired: string;
  minCapacityInvalid: string;
  maxCapacityInvalid: string;
  maxLessThanMin: string;
  groupeMax: string;
  observationsMax: string;
};

const TIME_INPUT_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const POSITIVE_INTEGER_REGEX = /^\d+$/;
const DAY_VALUE_REGEX = /^(0|[1-7])$/;

export function normalizeOptionalText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function isValidTimeInput(value: string) {
  return TIME_INPUT_REGEX.test(value);
}

export function timeInputToUtcDate(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0, 0));
}

export function createCreneauSchema(messages: CreateCreneauSchemaMessages) {
  const relationField = (requiredMessage: string) =>
    z
      .string()
      .trim()
      .min(1, requiredMessage)
      .refine(
        (value) =>
          POSITIVE_INTEGER_REGEX.test(value) && Number.parseInt(value, 10) > 0,
        requiredMessage,
      )
      .transform((value) => Number.parseInt(value, 10));

  const capacityField = (
    requiredMessage: string,
    invalidMessage: string,
  ) =>
    z
      .string()
      .trim()
      .min(1, requiredMessage)
      .refine(
        (value) =>
          POSITIVE_INTEGER_REGEX.test(value) && Number.parseInt(value, 10) > 0,
        invalidMessage,
      )
      .transform((value) => Number.parseInt(value, 10));

  const timeField = (requiredMessage: string) =>
    z
      .string()
      .trim()
      .min(1, requiredMessage)
      .refine(isValidTimeInput, messages.invalidTime);

  const optionalTextField = (max: number, maxMessage: string) =>
    z
      .string()
      .transform(normalizeOptionalText)
      .pipe(z.string().max(max, maxMessage));

  return z
    .object({
      saisonId: relationField(messages.saisonRequired),
      disciplineId: relationField(messages.disciplineRequired),
      jourSemaine: z
        .string()
        .trim()
        .min(1, messages.dayRequired)
        .refine((value) => DAY_VALUE_REGEX.test(value), messages.dayRequired)
        .transform((value) => Number.parseInt(value, 10)),
      heureDebut: timeField(messages.heureDebutRequired),
      heureFin: timeField(messages.heureFinRequired),
      nombreMin: capacityField(
        messages.nombreMinRequired,
        messages.minCapacityInvalid,
      ),
      nombreMax: capacityField(
        messages.nombreMaxRequired,
        messages.maxCapacityInvalid,
      ),
      groupe: optionalTextField(40, messages.groupeMax),
      observations: optionalTextField(255, messages.observationsMax),
    })
    .superRefine(
      ({ heureDebut, heureFin, nombreMin, nombreMax }, context) => {
        if (
          isValidTimeInput(heureDebut) &&
          isValidTimeInput(heureFin) &&
          timeInputToUtcDate(heureFin) <= timeInputToUtcDate(heureDebut)
        ) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["heureFin"],
            message: messages.endBeforeStart,
          });
        }

        if (nombreMax < nombreMin) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["nombreMax"],
            message: messages.maxLessThanMin,
          });
        }
      },
    );
}
