"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";
import CountUp from "react-countup";
import { Users, Activity, Trophy, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";

export function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const t = useTranslations("landing.stats");

  const stats = [
    { label: t("items.activeMembers"), value: 1250, suffix: "+", icon: Users },
    { label: t("items.disciplines"), value: 8, suffix: "", icon: Activity },
    { label: t("items.annualCompetitions"), value: 12, suffix: "", icon: Trophy },
    { label: t("items.yearsOfExcellence"), value: 25, suffix: "+", icon: Calendar },
  ];

  return (
    <section
      ref={ref}
      className="py-20"

    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-2xl bg-white/80 p-6 text-center backdrop-blur-sm transition-all hover:shadow-xl dark:bg-gray-900/80"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
              <stat.icon className="mx-auto h-12 w-12 text-cyan-600 dark:text-cyan-400" />
              <div className="mt-4 text-4xl font-bold text-cyan-600 dark:text-cyan-400 md:text-5xl">
                {isInView && (
                  <CountUp
                    end={stat.value}
                    suffix={stat.suffix}
                    duration={2}
                    separator=","
                  />
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}