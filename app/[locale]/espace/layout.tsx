import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { EspaceSidebar } from "@/components/espace/EspaceSidebar";
export default async function EspaceLayout({ children, params: { locale }, }: {
    children: React.ReactNode;
    params: {
        locale: string;
    };
}) {
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
        },
    });
    if (!adherent) {
        redirect({ href: "/auth/adherent/login", locale });
        return null;
    }
    return (<div className="flex min-h-screen">
      <EspaceSidebar adherent={adherent}/>
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
        {children}
      </main>
    </div>);
}
