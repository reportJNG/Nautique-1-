"use server";
import { prisma } from "@/lib/db/prisma";
import { requireAgent } from "@/lib/auth/jwt";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { generateNumeroDossier } from "@/lib/utils";
const toggleSchema = z.object({
    id: z.string().transform(Number),
});
const createSchema = z.object({
    nom: z.string().min(1),
    prenom: z.string().min(1),
    email: z.string().email(),
    telephone: z.string().optional(),
    sexe: z.enum(["M", "F"]),
    dateNaissance: z.string(),
    adresse: z.string().optional(),
    organisationId: z.string().transform(Number),
    password: z.string().min(8),
});
export async function toggleAdherentStatus(formData: FormData) {
    const session = await requireAgent();
    try {
        const data = Object.fromEntries(formData);
        const parsed = toggleSchema.safeParse(data);
        if (!parsed.success) {
            return { error: "Données invalides" };
        }
        const adherent = await prisma.adherent.findUnique({
            where: { id: parsed.data.id },
        });
        if (!adherent) {
            return { error: "Adhérent non trouvé" };
        }
        await prisma.adherent.update({
            where: { id: parsed.data.id },
            data: { actif: adherent.actif === 1 ? 0 : 1 },
        });
        revalidatePath("/[locale]/admin/adherents");
        return { success: true };
    }
    catch (error) {
        console.error("Toggle status error:", error);
        return { error: "Une erreur est survenue" };
    }
}
export async function createAdherent(formData: FormData) {
    const session = await requireAgent();
    try {
        const data = Object.fromEntries(formData);
        const parsed = createSchema.safeParse(data);
        if (!parsed.success) {
            return { error: parsed.error.errors[0].message };
        }
        const { nom, prenom, email, telephone, sexe, dateNaissance, adresse, organisationId, password, } = parsed.data;
        const existing = await prisma.adherent.findUnique({
            where: { email },
        });
        if (existing) {
            return { error: "Cet email est déjà utilisé" };
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const numeroDossier = generateNumeroDossier();
        await prisma.adherent.create({
            data: {
                organisationId,
                numeroDossier,
                nom,
                prenom,
                dateNaissance: new Date(dateNaissance),
                sexe,
                telephone: telephone || null,
                email,
                adresse: adresse || null,
                password: hashedPassword,
                actif: 1,
                createdBy: session.id,
            },
        });
        revalidatePath("/[locale]/admin/adherents");
        return { success: true };
    }
    catch (error) {
        console.error("Create adherent error:", error);
        return { error: "Une erreur est survenue" };
    }
}
