import { prisma } from "@/lib/db/prisma";
import ClientSaisonSection from "./SaisonSectionClient";
export async function SaisonSection({ locale }: {
    locale: string;
}) {
    const saison = await prisma.saison.findFirst({
        where: { statut: "OUV" },
        include: {
            creneaux: {
                where: { actif: 1 },
                include: { discipline: true },
                orderBy: [{ jourSemaine: "asc" }, { heureDebut: "asc" }],
            },
        },
    });
    const creneauxByDiscipline = saison?.creneaux.reduce((acc, creneau) => {
        const discName = creneau.discipline.designation;
        if (!acc[discName])
            acc[discName] = [];
        acc[discName].push(creneau);
        return acc;
    }, {} as Record<string, typeof saison.creneaux>) ?? {};
    return (<ClientSaisonSection saison={saison as any} creneauxByDiscipline={creneauxByDiscipline} locale={locale}/>);
}
