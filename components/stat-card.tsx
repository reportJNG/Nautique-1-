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
  alert,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm",
        alert && "border-red-300 dark:border-red-800"
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                "text-sm mt-1",
                trendUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}
            >
              {trend} vs mois dernier
            </p>
          )}
        </div>
        <div
          className={cn(
            "h-12 w-12 rounded-lg flex items-center justify-center",
            alert
              ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              : "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400"
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
