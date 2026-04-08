"use client";

import { useTranslations } from "next-intl";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  alert?: boolean;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  alert,
}: StatCardProps) {
  const t = useTranslations("common");

  return (
    <div
      className={cn(
        "bg-card rounded-xl border p-6 shadow-sm",
        alert ? "border-destructive bg-destructive/5" : "border-border",
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <p
              className={cn(
                "mt-1 text-sm",
                trendUp ? "text-green-600 dark:text-green-400" : "text-destructive",
              )}
            >
              {trend} {t("vsLastMonth")}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg",
            alert ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
