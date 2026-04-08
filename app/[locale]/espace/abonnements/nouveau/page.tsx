import { getSession } from "@/lib/auth/session";
import { getEspaceSubscriptionFormData } from "@/lib/espace";
import { NouvelAbonnementClient } from "./NouvelAbonnementClient";

export default async function NouvelAbonnementPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();

  if (!session || session.type !== "adherent") {
    return null;
  }

  const data = await getEspaceSubscriptionFormData(session.id);

  if (!data) {
    return null;
  }

  return <NouvelAbonnementClient locale={locale} data={data} />;
}
