import { prisma } from "@/lib/db/prisma";
import { NouvelAdherentClient } from "./NouvelAdherentClient";
import { AdminPageShell } from "@/components/admin/AdminPage";

async function getOrganisations() {
  return prisma.organisation.findMany({ orderBy: { designation: "asc" } });
}

export default async function NouvelAdherentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const organisations = await getOrganisations();

  return (
    <AdminPageShell locale={locale}>
      <NouvelAdherentClient organisations={organisations} />
    </AdminPageShell>
  );
}