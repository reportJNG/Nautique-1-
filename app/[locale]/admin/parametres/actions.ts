"use server";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
const updateSchema = z.object({
    designationCentre: z.string().min(1),
    emailCentre: z.string().email().optional().or(z.literal("")),
    telephoneCentre: z.string().optional().or(z.literal("")),
    adresseCentre: z.string().optional().or(z.literal("")),
    toleranceAccesAvance: z.string().transform(Number),
    toleranceAccesRetard: z.string().transform(Number),
});
export async function updateParametres(formData: FormData) {
    try {
        const data = Object.fromEntries(formData);
        const parsed = updateSchema.safeParse(data);
        if (!parsed.success) {
            return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
        }
        const { designationCentre, emailCentre, telephoneCentre, adresseCentre, toleranceAccesAvance, toleranceAccesRetard, } = parsed.data;
        const parametres = await prisma.parametres.findFirst();
        if (parametres) {
            await prisma.parametres.update({
                where: { id: parametres.id },
                data: {
                    designationCentre,
                    emailCentre: emailCentre || null,
                    telephoneCentre: telephoneCentre || null,
                    adresseCentre: adresseCentre || null,
                    toleranceAccesAvance,
                    toleranceAccesRetard,
                },
            });
        }
        else {
            await prisma.parametres.create({
                data: {
                    designationCentre,
                    emailCentre: emailCentre || null,
                    telephoneCentre: telephoneCentre || null,
                    adresseCentre: adresseCentre || null,
                    toleranceAccesAvance,
                    toleranceAccesRetard,
                },
            });
        }
        revalidatePath("/", "layout");
        return { success: true };
    }
    catch (error) {
        console.error("Update parametres error:", error);
        return { error: "Une erreur est survenue" };
    }
}
