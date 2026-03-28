import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
    console.log("🌱 Starting seed...");
    await prisma.parametres.upsert({
        where: { id: 1 },
        update: {},
        create: {
            designationCentre: "Centre Nautique SONATRACH",
            toleranceAccesAvance: 15,
            toleranceAccesRetard: 10,
            emailCentre: "nautique@sonatrach.dz",
            telephoneCentre: "+213 21 000 000",
            adresseCentre: "Alger, Algérie",
        },
    });
    console.log("✅ Paramètres created");
    const roles = [
        { code: "ADMIN", designation: "Administrateur" },
        { code: "DIR", designation: "Directeur" },
        { code: "RESP-COM", designation: "Responsable Commercial" },
        { code: "AG-COM", designation: "Agent Commercial" },
        { code: "AG-FIN", designation: "Agent Financier" },
    ];
    for (const role of roles) {
        await prisma.agentRole.upsert({
            where: { code: role.code },
            update: {},
            create: role,
        });
    }
    console.log("✅ Agent roles created");
    const adminRole = await prisma.agentRole.findUnique({ where: { code: "ADMIN" } });
    const agComRole = await prisma.agentRole.findUnique({ where: { code: "AG-COM" } });
    const agFinRole = await prisma.agentRole.findUnique({ where: { code: "AG-FIN" } });
    if (adminRole) {
        const adminPassword = await bcrypt.hash("Admin@2026", 12);
        await prisma.agent.upsert({
            where: { login: "admin" },
            update: {},
            create: {
                roleId: adminRole.id,
                nom: "Administrateur",
                prenom: "Système",
                login: "admin",
                motDePasse: adminPassword,
                email: "admin@nautique.sonatrach.dz",
                actif: 1,
            },
        });
    }
    if (agComRole) {
        const comPassword = await bcrypt.hash("Com@2026", 12);
        await prisma.agent.upsert({
            where: { login: "commercial" },
            update: {},
            create: {
                roleId: agComRole.id,
                nom: "Commercial",
                prenom: "Agent",
                login: "commercial",
                motDePasse: comPassword,
                email: "commercial@nautique.sonatrach.dz",
                actif: 1,
            },
        });
    }
    if (agFinRole) {
        const finPassword = await bcrypt.hash("Fin@2026", 12);
        await prisma.agent.upsert({
            where: { login: "financier" },
            update: {},
            create: {
                roleId: agFinRole.id,
                nom: "Financier",
                prenom: "Agent",
                login: "financier",
                motDePasse: finPassword,
                email: "financier@nautique.sonatrach.dz",
                actif: 1,
            },
        });
    }
    console.log("✅ Agents created");
    const orgs = [
        { code: "SON", designation: "Employés SONATRACH" },
        { code: "PAR", designation: "Membres particuliers" },
        { code: "CLB", designation: "Club sportif convention" },
    ];
    for (const org of orgs) {
        await prisma.organisation.upsert({
            where: { code: org.code },
            update: {},
            create: org,
        });
    }
    console.log("✅ Organisations created");
    const espaceNau = await prisma.espace.upsert({
        where: { code: "NAU" },
        update: {},
        create: {
            code: "NAU",
            designation: "Espace Nautique",
            description: "Activités aquatiques",
            actif: 1,
        },
    });
    const espaceFor = await prisma.espace.upsert({
        where: { code: "FOR" },
        update: {},
        create: {
            code: "FOR",
            designation: "Espace Forme",
            description: "Activités fitness",
            actif: 1,
        },
    });
    console.log("✅ Espaces created");
    const catAgeNau = [
        { designation: "Bébé", ageMin: 6, ageMax: 35 },
        { designation: "Enfant", ageMin: 36, ageMax: 143 },
        { designation: "Adolescent", ageMin: 144, ageMax: 215 },
        { designation: "Adulte", ageMin: 216, ageMax: null },
    ];
    for (const cat of catAgeNau) {
        await prisma.categorieAge.upsert({
            where: {
                id: await prisma.categorieAge.findFirst({
                    where: { espaceId: espaceNau.id, designation: cat.designation },
                }).then(c => c?.id || 0),
            },
            update: {},
            create: {
                espaceId: espaceNau.id,
                ...cat,
            },
        });
    }
    const catAgeFor = [
        { designation: "Enfant", ageMin: 96, ageMax: 155 },
        { designation: "Adolescent", ageMin: 156, ageMax: 215 },
        { designation: "Adulte", ageMin: 216, ageMax: null },
    ];
    for (const cat of catAgeFor) {
        const existing = await prisma.categorieAge.findFirst({
            where: { espaceId: espaceFor.id, designation: cat.designation },
        });
        if (!existing) {
            await prisma.categorieAge.create({
                data: {
                    espaceId: espaceFor.id,
                    ...cat,
                },
            });
        }
    }
    console.log("✅ Catégories d'âge created");
    const disciplinesNau = [
        { code: "NAT", designation: "Natation" },
        { code: "AQG", designation: "Aquagym" },
        { code: "PLO", designation: "Plongeon" },
        { code: "WPO", designation: "Water-polo" },
    ];
    for (const disc of disciplinesNau) {
        await prisma.discipline.upsert({
            where: {
                espaceId_code: { espaceId: espaceNau.id, code: disc.code },
            },
            update: {},
            create: {
                espaceId: espaceNau.id,
                ...disc,
                actif: 1,
            },
        });
    }
    const disciplinesFor = [
        { code: "FIT", designation: "Fitness" },
        { code: "AER", designation: "Aérobic" },
        { code: "MUS", designation: "Musculation" },
        { code: "YOG", designation: "Yoga" },
    ];
    for (const disc of disciplinesFor) {
        await prisma.discipline.upsert({
            where: {
                espaceId_code: { espaceId: espaceFor.id, code: disc.code },
            },
            update: {},
            create: {
                espaceId: espaceFor.id,
                ...disc,
                actif: 1,
            },
        });
    }
    console.log("✅ Disciplines created");
    const moniteurs = [
        { nom: "Benali", prenom: "Karim", sexe: "M", specialite: "Natation" },
        { nom: "Merad", prenom: "Sofia", sexe: "F", specialite: "Aquagym" },
        { nom: "Haddad", prenom: "Amine", sexe: "M", specialite: "Fitness" },
    ];
    for (const mon of moniteurs) {
        await prisma.moniteur.upsert({
            where: {
                id: await prisma.moniteur.findFirst({
                    where: { nom: mon.nom, prenom: mon.prenom },
                }).then(m => m?.id || 0),
            },
            update: {},
            create: {
                ...mon,
                actif: 1,
            },
        });
    }
    console.log("✅ Moniteurs created");
    const saison = await prisma.saison.upsert({
        where: {
            id: await prisma.saison.findFirst({
                where: { designation: "Saison 2025-2026" },
            }).then(s => s?.id || 0),
        },
        update: {},
        create: {
            designation: "Saison 2025-2026",
            dateDebut: new Date("2025-09-01"),
            dateFin: new Date("2026-06-30"),
            statut: "OUV",
        },
    });
    console.log("✅ Saison created");
    const parOrg = await prisma.organisation.findUnique({ where: { code: "PAR" } });
    if (parOrg) {
        const testPassword = await bcrypt.hash("Test@2026", 12);
        await prisma.adherent.upsert({
            where: { email: "ahmed@test.dz" },
            update: {},
            create: {
                organisationId: parOrg.id,
                numeroDossier: "DOS-123456",
                nom: "Test",
                prenom: "Ahmed",
                email: "ahmed@test.dz",
                password: testPassword,
                sexe: "M",
                dateNaissance: new Date("1990-01-15"),
                telephone: "+213 555 123 456",
                actif: 1,
            },
        });
    }
    console.log("✅ Test adherent created");
    console.log("🎉 Seed completed!");
}
main()
    .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
