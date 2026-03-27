"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Waves, Dumbbell, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface Discipline {
  id: number;
  code: string;
  designation: string;
}

interface Espace {
  id: number;
  code: string;
  designation: string;
  description?: string | null;
  disciplines: Discipline[];
}

interface Props {
  espaces: Espace[];
}

export default function DisciplinesSectionClient({ espaces }: Props) {
  const t = useTranslations("landing.disciplines");

  return (
    <section id="disciplines" className="relative py-20 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-grid-slate-800/20" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent dark:from-cyan-400 dark:to-blue-400">
              {t("title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              {t("subtitle")}
            </p>
          </motion.div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {espaces.map((espace, index) => (
            <motion.div
              key={espace.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.1 }}
              className="group"
            >
              <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-2xl border-border/50 bg-background/50 backdrop-blur-sm hover:border-cyan-200 dark:hover:border-cyan-800">
                <CardHeader className="relative pb-4 border-b border-border/50 bg-gradient-to-r from-cyan-50/50 to-blue-50/50 dark:from-cyan-950/20 dark:to-blue-950/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      {espace.code === "NAU" ? (
                        <Waves className="h-5 w-5 text-white transition-transform group-hover:rotate-12" />
                      ) : (
                        <Dumbbell className="h-5 w-5 text-white transition-transform group-hover:scale-110" />
                      )}
                    </div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                      {espace.designation}
                    </CardTitle>
                  </div>
                  {espace.description && (
                    <p className="text-sm text-muted-foreground/80 leading-relaxed mt-2">
                      {espace.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2.5">
                    {espace.disciplines.map((discipline) => (
                      <Badge
                        key={discipline.id}
                        variant="secondary"
                        className="group/badge flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-105 hover:bg-cyan-100 hover:text-cyan-700 dark:hover:bg-cyan-900/50 dark:hover:text-cyan-300 cursor-default"
                      >
                        <span className="font-mono text-xs">{discipline.code}</span>
                        <ChevronRight className="h-3 w-3 opacity-60 group-hover/badge:translate-x-0.5 transition-transform" />
                        <span>{discipline.designation}</span>
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Optional: View more link */}
                  {espace.disciplines.length > 6 && (
                    <div className="mt-4 pt-2">
                      <Link 
                        href="/espace"
                        className="inline-flex items-center text-sm font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
                      >
                        Voir toutes les disciplines
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}