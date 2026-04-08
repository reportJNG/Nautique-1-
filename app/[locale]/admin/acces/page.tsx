import { getTranslations } from "next-intl/server";
import { ShieldCheck } from "lucide-react";
import { AdminPageHeader, AdminPageShell } from "@/components/admin/AdminPage";
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
        description={t("accessUi.pageDescription")}
        icon={<ShieldCheck />}
      />
      <AccesClient />
    </AdminPageShell>
  );
}
