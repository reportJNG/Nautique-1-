"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Droplets, Users, Trophy, Calendar, Clock, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const t = useTranslations("landing.features");
  const features = [
    {
      icon: Droplets,
      title: t("items.pools.title"),
      description: t("items.pools.description"),
      color: "from-primary to-primary/80",
    },
    {
      icon: Users,
      title: t("items.staff.title"),
      description: t("items.staff.description"),
      color: "from-primary to-primary/80",
    },
    {
      icon: Trophy,
      title: t("items.competitions.title"),
      description: t("items.competitions.description"),
      color: "from-primary to-primary/80",
    },
    {
      icon: Calendar,
      title: t("items.schedule.title"),
      description: t("items.schedule.description"),
      color: "from-primary to-primary/80",
    },
    {
      icon: Clock,
      title: t("items.extendedHours.title"),
      description: t("items.extendedHours.description"),
      color: "from-primary to-primary/80",
    },
    {
      icon: Sparkles,
      title: t("items.ambience.title"),
      description: t("items.ambience.description"),
      color: "from-primary to-primary/80",
    },
  ];
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };
  return (<section ref={ref} className="py-20 ">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate={isInView ? "visible" : "hidden"} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, idx) => (<motion.div key={idx} variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }} className="group relative overflow-hidden rounded-2xl bg-card/80 p-6 backdrop-blur-sm transition-all hover:shadow-xl dark:bg-card/80">
          <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity group-hover:opacity-10`} />
          <feature.icon className="h-10 w-10 text-primary transition-transform group-hover:scale-110" />
          <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
          <p className="mt-2 text-muted-foreground">{feature.description}</p>
        </motion.div>))}
      </motion.div>
    </div>
  </section>);
}