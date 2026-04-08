import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { AdminPageShell } from "@/components/admin/AdminPage";
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
  const t = await getTranslations({ locale, namespace: "admin" });

  if (!id || Number.isNaN(Number.parseInt(id, 10))) {
    notFound();
  }

  const [adherent, organisations] = await Promise.all([
    getAdherent(Number.parseInt(id, 10)),
    getOrganisations(),
  ]);

  if (!adherent) {
    notFound();
  }

  return (
    <AdminPageShell locale={locale}>
      <div className="mx-auto max-w-2xl py-8">
        <div className="mb-6">
          <Link
            href={`/${locale}/admin/adherents/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("adherentsUi.edit.backToProfile")}
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
