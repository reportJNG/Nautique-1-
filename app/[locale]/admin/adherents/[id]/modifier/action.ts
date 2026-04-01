"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateAdherent(
    id: number,
    data: {
        nom: string;
        prenom: string;
        email?: string | null;
        telephone?: string | null;
        dateNaissance: string;
        sexe: string;
        adresse?: string | null;
        numeroMatricule?: string | null;
        organisationId: number;
        actif: number;
        password?: string;
    }
) {
    const updateData: Record<string, unknown> = {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email || null,
        telephone: data.telephone || null,
        dateNaissance: new Date(data.dateNaissance),
        sexe: data.sexe,
        adresse: data.adresse || null,
        numeroMatricule: data.numeroMatricule || null,
        organisationId: data.organisationId,
        actif: data.actif,
    };

    if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10);
    }

    await prisma.adherent.update({
        where: { id },
        data: updateData,
    });

    revalidatePath(`/admin/adherents/${id}`);
    revalidatePath(`/admin/adherents/${id}/modifier`);
}