import DisciplinesSectionClient from "./DiscplinesSectionClient";
import { prisma } from "@/lib/db/prisma";
import {
    fallbackLandingEspaces,
    withPublicLandingFallback,
} from "@/lib/public-landing";

export const dynamic = "force-dynamic";

type LandingEspace = {
    id: number;
    code: string;
    designation: string;
    description?: string | null;
    disciplines: {
        id: number;
        code: string;
        designation: string;
    }[];
};

async function getDisciplines() {
    const espaces = await withPublicLandingFallback<LandingEspace[]>(
        "disciplines",
        () => prisma.espace.findMany({
            where: { actif: 1 },
            include: {
                disciplines: {
                    where: { actif: 1 },
                    orderBy: { designation: "asc" },
                },
            },
            orderBy: { designation: "asc" },
        }),
        fallbackLandingEspaces,
    );
    return espaces;
}
export default async function DisciplinesSection() {
    const espaces = await getDisciplines();
    return <DisciplinesSectionClient espaces={espaces}/>;
}
