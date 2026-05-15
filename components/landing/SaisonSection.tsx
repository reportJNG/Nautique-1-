import { prisma } from "@/lib/db/prisma";
import {
    fallbackLandingSaison,
    withPublicLandingFallback,
} from "@/lib/public-landing";
import ClientSaisonSection from "./SaisonSectionClient";

export const dynamic = "force-dynamic";

type CreneauWithDiscipline = {
    id: number | string;
    jourSemaine: number;
    heureDebut: Date | string;
    heureFin: Date | string;
    groupe?: string | null;
    discipline: {
        designation: string;
    };
};

type SaisonWithCreneaux = {
    designation: string;
    statut: string;
    dateDebut: Date | string;
    dateFin: Date | string;
    creneaux: CreneauWithDiscipline[];
};

export async function SaisonSection({ locale }: {
    locale: string;
}) {
    const saison = await withPublicLandingFallback<SaisonWithCreneaux | null>(
        "saison",
        () => prisma.saison.findFirst({
            where: { statut: "OUV" },
            include: {
                creneaux: {
                    where: { actif: 1 },
                    include: { discipline: true },
                    orderBy: [{ jourSemaine: "asc" }, { heureDebut: "asc" }],
                },
            },
        }),
        fallbackLandingSaison,
    );

    const creneauxByDiscipline = saison?.creneaux.reduce<Record<string, CreneauWithDiscipline[]>>((acc, creneau) => {
        const discName = creneau.discipline.designation;
        if (!acc[discName]) acc[discName] = [];
        acc[discName].push(creneau);
        return acc;
    }, {} as Record<string, typeof saison.creneaux>) ?? {};

    return (
        <ClientSaisonSection
            saison={saison}
            creneauxByDiscipline={creneauxByDiscipline}
            locale={locale}
        />
    );
}
