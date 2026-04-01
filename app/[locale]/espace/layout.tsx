import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { EspaceSidebar } from "@/components/espace/EspaceSidebar";

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
        },
    });

    if (!adherent) {
        redirect({ href: "/auth/adherent/login", locale });
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Sidebar */}
            <aside className="sticky top-0 h-screen w-64 shrink-0 border-r border-gray-100 bg-white dark:border-gray-800/60 dark:bg-gray-900">
                <EspaceSidebar adherent={adherent} />
            </aside>

            {/* Main content */}
            <main className="flex min-h-screen flex-1 flex-col overflow-auto">
                {/* Top bar */}
                <div className="sticky top-0 z-10 flex h-14 items-center border-b border-gray-100 bg-white/80 px-6 backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/80">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                            Espace membre
                        </span>
                        <span className="text-gray-200 dark:text-gray-700">/</span>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {adherent.prenom} {adherent.nom}
                        </span>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            N° {adherent.numeroDossier}
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
                            {adherent.prenom.charAt(0).toUpperCase()}
                            {adherent.nom.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <div className="flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}