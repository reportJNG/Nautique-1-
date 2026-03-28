"use server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/jwt";
import { revalidatePath } from "next/cache";
import { z } from "zod";
const toggleSchema = z.object({
    id: z.string().transform(Number),
});
export async function toggleAgentStatus(formData: FormData) {
    await requireRole(["ADMIN", "DIR"]);
    try {
        const data = Object.fromEntries(formData);
        const parsed = toggleSchema.safeParse(data);
        if (!parsed.success) {
            return { error: "Données invalides" };
        }
        const agent = await prisma.agent.findUnique({
            where: { id: parsed.data.id },
        });
        if (!agent) {
            return { error: "Agent non trouvé" };
        }
        await prisma.agent.update({
            where: { id: parsed.data.id },
            data: { actif: agent.actif === 1 ? 0 : 1 },
        });
        revalidatePath("/[locale]/admin/agents");
        return { success: true };
    }
    catch (error) {
        console.error("Toggle agent status error:", error);
        return { error: "Une erreur est survenue" };
    }
}
