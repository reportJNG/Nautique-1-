import { AdminPageHeader, AdminPageShell } from "@/components/admin/AdminPage";
import { getTranslations } from "next-intl/server";
import { ShieldCheck } from "lucide-react";
import { AccesClient } from "./AccesClient";

export default async function AccesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <AdminPageShell locale={locale}>
      <AdminPageHeader
        title={t("accessUi.title")}
        description="Contrôle d'accès en temps réel"
        icon={<ShieldCheck />}
      />
      <AccesClient />
    </AdminPageShell>
  );
}
