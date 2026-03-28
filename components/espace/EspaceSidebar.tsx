"use client";
import Link from "next/link";
import { usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Calendar, PlusCircle, User, History, Settings, LogOut, Waves, } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth.actions";
interface EspaceSidebarProps {
    adherent: {
        nom: string;
        prenom: string;
        numeroDossier: string;
    };
}
export function EspaceSidebar({ adherent }: EspaceSidebarProps) {
    const t = useTranslations("adherent");
    const pathname = usePathname();
    const locale = useLocale();
    const navItems = [
        { href: "/espace", label: t("dashboard"), icon: LayoutDashboard },
        { href: "/espace/abonnements", label: t("abonnements"), icon: Calendar },
        { href: "/espace/abonnements/nouveau", label: t("newAbonnement"), icon: PlusCircle },
        { href: "/espace/profil", label: t("profile"), icon: User },
        { href: "/espace/acces", label: t("access"), icon: History },
        { href: "/espace/parametres", label: t("settings"), icon: Settings },
    ];
    async function handleLogout() {
        await logoutAction();
        window.location.href = `/${locale}`;
    }
    return (<aside className="flex h-screen w-64 flex-col bg-[#0c4a6e] text-white">
      
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4">
        <Waves className="h-8 w-8 text-cyan-300"/>
        <span className="text-lg font-bold">SONATRACH</span>
      </div>

      
      <div className="border-b border-white/10 p-4">
        <p className="font-medium">{adherent.prenom} {adherent.nom}</p>
        <p className="text-sm text-cyan-200">{adherent.numeroDossier}</p>
      </div>

      
      <nav className="flex-1 overflow-auto p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (<li key={item.href}>
                <Link href={`/${locale}${item.href}`} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors", isActive
                    ? "bg-cyan-600 text-white"
                    : "text-cyan-100 hover:bg-white/10 hover:text-white")}>
                  <Icon className="h-4 w-4"/>
                  {item.label}
                </Link>
              </li>);
        })}
        </ul>
      </nav>

      
      <div className="border-t border-white/10 p-4">
        <form action={handleLogout}>
          <Button type="submit" variant="ghost" className="w-full justify-start gap-2 text-cyan-100 hover:bg-white/10 hover:text-white">
            <LogOut className="h-4 w-4"/>
            {t("logout")}
          </Button>
        </form>
      </div>
    </aside>);
}
