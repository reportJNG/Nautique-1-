"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  Dumbbell,
  UserCheck,
  UserCog,
  CreditCard,
  DoorOpen,
  Settings,
  Menu,
  LogOut,
  Waves,
  ChevronRight,
} from "lucide-react";
import { logout } from "@/app/actions";

interface AdminSidebarProps {
  agent: {
    nom: string;
    prenom: string;
    roleCode: string;
    roleDesignation: string;
  };
  locale: string;
}

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "nav.dashboard", roles: ["ADMIN", "DIR", "RESP-COM", "AG-COM", "AG-FIN"] },
  { href: "/admin/adherents", icon: Users, label: "nav.adherents", roles: ["ADMIN", "DIR", "RESP-COM", "AG-COM"] },
  { href: "/admin/abonnements", icon: ClipboardList, label: "nav.abonnements", roles: ["ADMIN", "DIR", "RESP-COM", "AG-COM", "AG-FIN"] },
  { href: "/admin/factures", icon: CreditCard, label: "nav.factures", roles: ["ADMIN", "DIR", "AG-FIN"] },
  { href: "/admin/saisons", icon: Calendar, label: "nav.saisons", roles: ["ADMIN", "DIR", "RESP-COM"] },
  { href: "/admin/creneaux", icon: Calendar, label: "nav.creneaux", roles: ["ADMIN", "DIR", "RESP-COM", "AG-COM"] },
  { href: "/admin/disciplines", icon: Dumbbell, label: "nav.disciplinesMenu", roles: ["ADMIN", "DIR", "RESP-COM"] },
  { href: "/admin/moniteurs", icon: UserCheck, label: "nav.moniteurs", roles: ["ADMIN", "DIR", "RESP-COM", "AG-COM"] },
  { href: "/admin/agents", icon: UserCog, label: "nav.agents", roles: ["ADMIN", "DIR"] },
  { href: "/admin/acces", icon: DoorOpen, label: "nav.controleAcces", roles: ["ADMIN", "DIR", "RESP-COM", "AG-COM", "AG-FIN"] },
  { href: "/admin/parametres", icon: Settings, label: "nav.parametresGlobaux", roles: ["ADMIN"] },
];

export function AdminSidebar({ agent, locale }: AdminSidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(agent.roleCode)
  );

  const NavContent = () => (
    <>
      <div className="flex items-center gap-2 px-4 py-6 border-b border-gray-700">
        <Waves className="h-8 w-8 text-cyan-400" />
        <div>
          <span className="text-lg font-bold text-white">{t("metadata.title")}</span>
          <p className="text-xs text-gray-400">{t("nav.espaceStaff")}</p>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-semibold">
            {agent.prenom.charAt(0)}{agent.nom.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {agent.prenom} {agent.nom}
            </p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-900 text-cyan-200">
              {agent.roleDesignation}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-cyan-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {t(item.label)}
              {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700 space-y-3">
        <div className="flex items-center justify-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-center text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t("nav.logout")}
          </Button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-[#1e293b] p-0">
          <div className="flex flex-col h-full">
            <NavContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-[#1e293b] flex-col z-40">
        <NavContent />
      </aside>
    </>
  );
}
