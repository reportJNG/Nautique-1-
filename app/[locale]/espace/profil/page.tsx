import { getSession } from "@/lib/auth/session";
import { getEspaceProfileData } from "@/lib/espace";
import { ProfilClient } from "./ProfilClient";

export default async function ProfilPage() {
  const session = await getSession();

  if (!session || session.type !== "adherent") {
    return null;
  }

  const profile = await getEspaceProfileData(session.id);

  if (!profile) {
    return null;
  }

  return <ProfilClient profile={profile} />;
}
