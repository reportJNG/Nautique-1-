"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const t = useTranslations("theme");
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    const active = (t: string) => mounted && theme === t ? "bg-gray-100 dark:bg-gray-800" : "";
    return (<div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1 dark:border-gray-700 cursor-pointer">
      <Button variant="ghost" size="icon" className={`h-7 w-7 cursor-pointer ${active("light")}`} onClick={() => setTheme("light")} title={t("light")}>
        <Sun className="h-4 w-4"/>
      </Button>
      <Button variant="ghost" size="icon" className={`h-7 w-7 cursor-pointer ${active("dark")}`} onClick={() => setTheme("dark")} title={t("dark")}>
        <Moon className="h-4 w-4"/>
      </Button>
      <Button variant="ghost" size="icon" className={`h-7 w-7 cursor-pointer  ${active("system")}`} onClick={() => setTheme("system")} title={t("system")}>
        <Laptop className="h-4 w-4"/>
      </Button>
    </div>);
}
