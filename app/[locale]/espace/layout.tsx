import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { EspaceShell } from "@/components/espace/EspaceShell";

export default async function EspaceLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const session = await getSession();

    if (!session || session.type !== "adherent") {
        redirect({ href: "/auth/adherent/login", locale });
        return null;
    }

    const adherent = await prisma.adherent.findUnique({
        where: { id: session.id },
        select: {
            nom: true,
            prenom: true,
            numeroDossier: true,
            email: true,
        },
    });

    if (!adherent) {
        redirect({ href: "/auth/adherent/login", locale });
        return null;
    }

    return (
        <EspaceShell adherent={adherent}>
            {children}
        </EspaceShell>
    );
}