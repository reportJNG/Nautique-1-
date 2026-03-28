import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/auth/session";
import { type AgentSession } from "@/lib/auth/jwt";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
export default async function AdminLayout({ children, params: { locale }, }: {
    children: React.ReactNode;
    params: {
        locale: string;
    };
}) {
    const session = await getSession();
    if (!session || session.type !== "agent") {
        redirect({ href: "/auth/login", locale });
    }
    const agentSession = session as AgentSession;
    return (<div className="flex min-h-screen">
      <AdminSidebar agent={agentSession}/>
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
        {children}
      </main>
    </div>);
}
