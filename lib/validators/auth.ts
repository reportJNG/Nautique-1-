// lib/validators/auth.ts
import { z } from "zod";

export const agentLoginSchema = z.object({
  login: z.string().min(1, "L'identifiant est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const adherentLoginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const adherentSignupSchema = z
  .object({
    nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    telephone: z.string().optional(),
    sexe: z.enum(["M", "F"], { message: "Le sexe est requis" }),
    dateNaissance: z.string().min(1, "La date de naissance est requise"),
    adresse: z.string().optional(),
    numeroMatricule: z.string().optional(),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type AgentLoginInput = z.infer<typeof agentLoginSchema>;
export type AdherentLoginInput = z.infer<typeof adherentLoginSchema>;
export type AdherentSignupInput = z.infer<typeof adherentSignupSchema>;
