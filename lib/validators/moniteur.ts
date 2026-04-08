import { z } from "zod";

export const MONITEUR_SEX_VALUES = ["M", "F"] as const;
export const MONITEUR_STATUS_VALUES = ["1", "0"] as const;

export type MoniteurSexValue = (typeof MONITEUR_SEX_VALUES)[number];
export type MoniteurStatusValue = (typeof MONITEUR_STATUS_VALUES)[number];

export type MoniteurFormInput = {
  nom: string;
  prenom: string;
  sexe: MoniteurSexValue;
  telephone: string;
  email: string;
  specialite: string;
  actif: MoniteurStatusValue;
};

export type MoniteurSchemaMessages = {
  nomRequired: string;
  nomMin: string;
  nomMax: string;
  prenomRequired: string;
  prenomMin: string;
  prenomMax: string;
  sexeRequired: string;
  telephoneMax: string;
  emailInvalid: string;
  specialiteMax: string;
  statusRequired: string;
};

export function normalizeMoniteurName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeOptionalMoniteurText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

const optionalTextField = (max: number, maxMessage: string) =>
  z
    .string()
    .transform(normalizeOptionalMoniteurText)
    .pipe(z.string().max(max, maxMessage));

export function createMoniteurSchema(messages: MoniteurSchemaMessages) {
  const requiredNameField = (
    requiredMessage: string,
    minMessage: string,
    maxMessage: string,
  ) =>
    z
      .string()
      .transform(normalizeMoniteurName)
      .pipe(
        z
          .string()
          .min(1, requiredMessage)
          .min(2, minMessage)
          .max(60, maxMessage),
      );

  return z.object({
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
    sexe: z.enum(MONITEUR_SEX_VALUES, {
      error: () => messages.sexeRequired,
    }),
    telephone: optionalTextField(20, messages.telephoneMax),
    email: z
      .string()
      .transform((value) => value.trim())
      .refine(
        (value) => value.length === 0 || z.email().safeParse(value).success,
        messages.emailInvalid,
      ),
    specialite: optionalTextField(80, messages.specialiteMax),
    actif: z.enum(MONITEUR_STATUS_VALUES, {
      error: () => messages.statusRequired,
    }),
  });
}
