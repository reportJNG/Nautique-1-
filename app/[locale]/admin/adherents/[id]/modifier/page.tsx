// app/[locale]/admin/adherents/[id]/modifier/page.tsx
import { prisma } from "@/lib/db/prisma";
import { AdminPageShell } from "@/components/admin/AdminPage";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ModifierAdherentClient } from "./ModifierAdherentClient";

async function getAdherent(id: number) {
    return prisma.adherent.findUnique({
        where: { id },
        include: { organisation: true },
    });
}

async function getOrganisations() {
    return prisma.organisation.findMany({ orderBy: { designation: "asc" } });
}

export default async function ModifierAdherentPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale, id } = await params;

    if (!id || isNaN(parseInt(id))) notFound();

    const [adherent, organisations] = await Promise.all([
        getAdherent(parseInt(id)),
        getOrganisations(),
    ]);

    if (!adherent) notFound();

    return (
        <AdminPageShell locale={locale}>
            <div className="max-w-2xl mx-auto py-8">
                <div className="mb-6">
                    <Link
                        href={`/${locale}/admin/adherents/${id}`}
                        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour au profil
                    </Link>
                </div>

                <ModifierAdherentClient
                    adherent={adherent}
                    organisations={organisations}
                    locale={locale}
                />
            </div>
        </AdminPageShell>
    );
}