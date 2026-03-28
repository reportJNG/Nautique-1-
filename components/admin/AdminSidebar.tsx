"use client";
import Link from "next/link";
import { usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Users, Calendar, Clock, Dumbbell, UserCheck, UserCog, CreditCard, LogIn, Settings, LogOut, Waves, } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth.actions";
import { AGENT_ROLES } from "@/lib/constants";
interface AdminSidebarProps {
    agent: {
        nom: string;
        prenom: string;
        roleCode: string;
    };
}
export function AdminSidebar({ agent }: AdminSidebarProps) {
    const t = useTranslations("admin");
    const pathname = usePathname();
    const locale = useLocale();
    const navItems = [
        { href: "/admin", label: t("dashboard"), icon: LayoutDashboard, roles: ["ADMIN", "DIR", "RESP-COM", "AG-COM", "AG-FIN"] },
        { href: "/admin/adherents", label: t("adherents"), icon: Users, roles: ["ADMIN", "DIR", "RESP-COM", "AG-COM"] },
        { href: "/admin/abonnements", label: t("abonnements"), icon: Calendar, roles: ["ADMIN", "DIR", "RESP-COM", "AG-COM", "AG-FIN"] },
        { href: "/admin/saisons", label: t("saisons"), icon: Clock, roles: ["ADMIN", "DIR", "RESP-COM"] },
        { href: "/admin/creneaux", label: t("creneaux"), icon: Clock, roles: ["ADMIN", "DIR", "RESP-COM", "AG-COM"] },
        { href: "/admin/disciplines", label: t("disciplines"), icon: Dumbbell, roles: ["ADMIN", "DIR", "RESP-COM"] },
        { href: "/admin/moniteurs", label: t("moniteurs"), icon: UserCheck, roles: ["ADMIN", "DIR", "RESP-COM", "AG-COM"] },
        { href: "/admin/agents", label: t("agents"), icon: UserCog, roles: ["ADMIN", "DIR"] },
        { href: "/admin/factures", label: t("factures"), icon: CreditCard, roles: ["ADMIN", "DIR", "AG-FIN"] },
        { href: "/admin/acces", label: t("access"), icon: LogIn, roles: ["ADMIN", "DIR", "RESP-COM", "AG-COM", "AG-FIN"] },
        { href: "/admin/parametres", label: t("settings"), icon: Settings, roles: ["ADMIN"] },
    ];
    const allowedNavItems = navItems.filter(item => item.roles.includes(agent.roleCode));
    async function handleLogout() {
        await logoutAction();
        window.location.href = `/${locale}`;
    }
    return (<aside className="flex h-screen w-64 flex-col bg-[#1e293b] text-white">
      
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4">
        <Waves className="h-8 w-8 text-cyan-400"/>
        <span className="text-lg font-bold">Admin</span>
      </div>

      
      <div className="border-b border-white/10 p-4">
        <p className="font-medium">{agent.prenom} {agent.nom}</p>
        <Badge variant="secondary" className="mt-1 text-xs">
          {AGENT_ROLES[agent.roleCode as keyof typeof AGENT_ROLES]}
        </Badge>
      </div>

      
      <nav className="flex-1 overflow-auto p-2">
        <ul className="space-y-1">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (<li key={item.href}>
                <Link href={`/${locale}${item.href}`} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors", isActive
                    ? "bg-cyan-600 text-white"
                    : "text-gray-300 hover:bg-white/10 hover:text-white")}>
                  <Icon className="h-4 w-4"/>
                  {item.label}
                </Link>
              </li>);
        })}
        </ul>
      </nav>

      
      <div className="border-t border-white/10 p-4">
        <form action={handleLogout}>
          <Button type="submit" variant="ghost" className="w-full justify-start gap-2 text-gray-300 hover:bg-white/10 hover:text-white">
            <LogOut className="h-4 w-4"/>
            Déconnexion
          </Button>
        </form>
      </div>
    </aside>);
}
