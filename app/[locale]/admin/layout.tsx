import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/auth/session";
import { type AgentSession } from "@/lib/auth/jwt";
import { AdminShellClient } from "@/components/admin/AdminShellClient";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();

  if (!session || session.type !== "agent") {
    redirect({ href: "/auth/login", locale });
    return null; // Unreachable, but narrows type for TS
  }

  return (
    <AdminShellClient agent={session as AgentSession} >
      {children}
    </AdminShellClient>
  );
}