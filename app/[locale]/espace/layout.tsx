import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/auth/session";
import { EspaceShell } from "@/components/espace/EspaceShell";
import { getEspaceShellData } from "@/lib/espace";

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

    const shellData = await getEspaceShellData(session.id);

    if (!shellData) {
        redirect({ href: "/auth/adherent/login", locale });
        return null;
    }

    return (
        <EspaceShell
            adherent={shellData.adherent}
            centre={shellData.centre}
            stats={shellData.stats}
            context={shellData.context}
            notifications={shellData.notifications}
        >
            {children}
        </EspaceShell>
    );
}
