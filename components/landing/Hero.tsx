"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Droplets, Waves, Sailboat } from "lucide-react";
import heroImg from "@/public/hero-pool.jpg";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import WaveDivider from "./WaveDivider";

export function Hero() {
  const t = useTranslations("hero");
  const navT = useTranslations("nav");
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      ref={containerRef}
      id="accueil"
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      <div className="absolute inset-0">
        <Image
          src={heroImg}
          alt={t("imageAlt")}
          fill
          priority
          className="absolute inset-0 h-full w-full object-cover"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent" />

      <motion.div className="absolute bottom-0 left-0 right-0" style={{ y }}>
        <WaveDivider />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
          className="absolute left-10 top-20 opacity-20"
        >
          <Waves className="h-24 w-24 text-white" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -10, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-10 right-20 opacity-20"
        >
          <Sailboat className="h-20 w-20 text-white" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 9, repeat: Infinity, repeatType: "reverse" }}
          className="absolute right-10 top-1/3 hidden opacity-20 lg:block"
        >
          <Droplets className="h-16 w-16 text-white" />
        </motion.div>
      </div>

      <div className="container relative z-10 mx-auto px-4 pb-40 pt-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          <motion.div variants={itemVariants} className="mb-6 flex gap-2">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 inline-block rounded-full border border-white/30 bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm"
            >
              {t("seasonBadge")}
            </motion.span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mb-6 font-display text-5xl font-bold leading-tight text-white drop-shadow-2xl md:text-7xl"
          >
            {t("title")}
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mb-10 max-w-xl font-body text-lg leading-relaxed text-white/90 drop-shadow-md md:text-xl"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
            <Link href="/#disciplines">
              <Button
                size="lg"
                className="cursor-pointer bg-white px-8 text-base font-semibold text-black shadow-lg transition-all hover:scale-105 hover:bg-white/90 hover:shadow-xl"
              >
                {t("cta")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/adherent/login">
              <Button
                size="lg"
                variant="outline"
                className="cursor-pointer px-8 text-base font-semibold text-black backdrop-blur-sm hover:bg-white/20"
              >
                {navT("loginAdherent")}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
