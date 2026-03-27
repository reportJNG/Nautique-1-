// components/ui/badge.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          "border-transparent bg-cyan-600 text-white": variant === "default",
          "border-transparent bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100": variant === "secondary",
          "border-transparent bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400": variant === "destructive",
          "border-gray-200 text-gray-900 dark:border-gray-700 dark:text-gray-100": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
