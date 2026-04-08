import { getSession } from "@/lib/auth/session";
import { getEspaceAbonnementsData } from "@/lib/espace";
import { AbonnementsListClient } from "./AbonnementsListClient";

export default async function AdherentAbonnementsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();

  if (!session || session.type !== "adherent") {
    return null;
  }

  const abonnements = await getEspaceAbonnementsData(session.id);

  return <AbonnementsListClient locale={locale} abonnements={abonnements} />;
}
