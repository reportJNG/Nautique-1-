"use client";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Laptop, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
export default function ParametresPage() {
    const { theme, setTheme } = useTheme();
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations();
    const handleLanguageChange = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
    };
    return (<div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Paramètres
      </h1>

      <div className="grid gap-6 max-w-2xl">
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-cyan-600"/>
              Thème
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")} className="flex-1 gap-2">
                <Sun className="h-4 w-4"/>
                Clair
              </Button>
              <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")} className="flex-1 gap-2">
                <Moon className="h-4 w-4"/>
                Sombre
              </Button>
              <Button variant={theme === "system" ? "default" : "outline"} onClick={() => setTheme("system")} className="flex-1 gap-2">
                <Laptop className="h-4 w-4"/>
                Système
              </Button>
            </div>
          </CardContent>
        </Card>

        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyan-600"/>
              Langue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {["fr", "en", "ar"].map((lang) => (<Button key={lang} variant={locale === lang ? "default" : "outline"} onClick={() => handleLanguageChange(lang)} className={cn("flex-1", locale === lang && "bg-cyan-600 hover:bg-cyan-500")}>
                  {lang === "fr" && "Français"}
                  {lang === "en" && "English"}
                  {lang === "ar" && "العربية"}
                </Button>))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);
}
