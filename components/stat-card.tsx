"use client";
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
  alert
}: StatCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-xl p-6 border shadow-sm",
      alert ? "border-destructive" : "border-border",
      alert ? "bg-destructive/5" : ""
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {value}
          </p>
          {trend && (
            <p className={cn(
              "text-sm mt-1",
              trendUp ? "text-green-600 dark:text-green-400" : "text-destructive"
            )}>
              {trend} vs mois dernier
            </p>
          )}
        </div>
        <div className={cn(
          "h-12 w-12 rounded-lg flex items-center justify-center",
          alert
            ? "bg-destructive/10 text-destructive"
            : "bg-primary/10 text-primary"
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}