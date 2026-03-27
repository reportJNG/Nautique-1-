"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="opacity-0 pointer-events-none">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  const getCurrentThemeIcon = () => {
    if (theme === "system") {
      return resolvedTheme === "dark" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      );
    }
    return theme === "dark" ? (
      <Moon className="h-5 w-5" />
    ) : (
      <Sun className="h-5 w-5" />
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-9 w-9 rounded-lg transition-all duration-200",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "active:scale-95"
          )}
          aria-label="Changer de thème"
        >
          {getCurrentThemeIcon()}
          <span className="sr-only">Changer de thème</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="min-w-[160px] p-1 rounded-xl shadow-lg backdrop-blur-sm bg-background/95 border border-border/50"
        sideOffset={8}
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center justify-between gap-2 px-3 py-2 rounded-lg cursor-pointer",
            "transition-colors duration-150",
            theme === "light" && "bg-accent text-accent-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span>Clair</span>
          </div>
          {theme === "light" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center justify-between gap-2 px-3 py-2 rounded-lg cursor-pointer",
            "transition-colors duration-150",
            theme === "dark" && "bg-accent text-accent-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span>Sombre</span>
          </div>
          {theme === "dark" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(
            "flex items-center justify-between gap-2 px-3 py-2 rounded-lg cursor-pointer",
            "transition-colors duration-150",
            theme === "system" && "bg-accent text-accent-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Laptop className="h-4 w-4" />
            <span>Système</span>
          </div>
          {theme === "system" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}