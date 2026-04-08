import { getSession } from "@/lib/auth/session";
import { getEspaceAbonnementPaymentData } from "@/lib/espace";
import { PayerClient } from "./PayerClient";

export default async function PayerPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await getSession();

  if (!session || session.type !== "adherent") {
    return null;
  }

  const data = await getEspaceAbonnementPaymentData(session.id, Number(id));

  if (!data) {
    return null;
  }

  return <PayerClient locale={locale} abonnementId={Number(id)} data={data} />;
}
