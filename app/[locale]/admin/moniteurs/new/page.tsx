import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, UserPlus } from "lucide-react";
import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/auth/session";
import {
  AdminPageHeader,
  AdminPageShell,
} from "@/components/admin/AdminPage";
import { MoniteurForm } from "../MoniteurForm";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NewMoniteurPage({ params }: PageProps) {
  const { locale } = await params;
  const [t, session] = await Promise.all([
    getTranslations({ locale, namespace: "admin" }),
    getSession(),
  ]);

  const isAdmin =
    session?.type === "agent" && session.roleCode === "ADMIN";

  if (!isAdmin) {
    redirect({ href: "/admin/moniteurs", locale });
  }

  return (
    <AdminPageShell locale={locale}>
      <Link
        href={`/${locale}/admin/moniteurs`}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border/50 bg-muted/10 px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/20"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("moniteursUi.detail.back")}
      </Link>

      <AdminPageHeader
        title={t("moniteursUi.newPage.title")}
        description={t("moniteursUi.newPage.description")}
        icon={<UserPlus className="h-5 w-5" />}
      />

      <MoniteurForm locale={locale} mode="create" />
    </AdminPageShell>
  );
}
