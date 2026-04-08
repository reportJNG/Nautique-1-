"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export function EspacePageHeader({
  badge,
  title,
  subtitle,
  aside,
}: {
  badge: string;
  title: string;
  subtitle: string;
  aside?: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[32px] border border-border/50 bg-white/75 p-6 shadow-sm backdrop-blur dark:bg-slate-950/50"
    >
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-200">
            {badge}
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {aside ? <div>{aside}</div> : null}
      </div>
    </motion.section>
  );
}
