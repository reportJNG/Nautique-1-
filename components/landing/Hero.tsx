"use client";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ArrowRight, ChevronDown, Droplets, Waves, Sailboat } from "lucide-react";
import { useRef } from "react";
import heroImg from "@/public/hero-pool.jpg";
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
    return (<section ref={containerRef} id="accueil" className="relative min-h-screen flex items-center overflow-hidden">
      
      <div className="absolute inset-0">
        <img src={heroImg.src} alt="Centre Nautique SONATRACH piscine" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080}/>
        
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/60"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"/>
      </div>

      
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent"/>

      
      <div className="absolute bottom-0 left-0 right-0" style={{ transform: `translateY(${y.get()})` }}>
        <WaveDivider />
      </div>

      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }} className="absolute top-20 left-10 opacity-20">
          <Waves className="h-24 w-24 text-white"/>
        </motion.div>
        <motion.div animate={{ y: [0, 20, 0], rotate: [0, -10, 10, 0] }} transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }} className="absolute bottom-10 right-20 opacity-20">
          <Sailboat className="h-20 w-20 text-white"/>
        </motion.div>
        <motion.div animate={{ y: [0, -15, 0], rotate: [0, -5, 5, 0] }} transition={{ duration: 9, repeat: Infinity, repeatType: "reverse" }} className="absolute top-1/3 right-10 opacity-20 hidden lg:block">
          <Droplets className="h-16 w-16 text-white"/>
        </motion.div>
      </div>

      
      <div className="container relative z-10 mx-auto px-4 pt-32 pb-40">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-3xl">
          <motion.div variants={itemVariants} className="mb-6 flex gap-2">
            <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white font-semibold text-sm mb-6 border border-white/30">
              Saison 2026 — 2027
            </motion.span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6 drop-shadow-2xl">
            {t("title")}
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/90 max-w-xl mb-10 font-body leading-relaxed drop-shadow-md">
            {t("subtitle")}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
            <Link href="/#disciplines">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 font-semibold text-base px-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer">
                {t("cta")}
                <ArrowRight className="ml-2 h-5 w-5"/>
              </Button>
            </Link>
            <Link href="/auth/adherent/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 font-semibold text-base px-8 backdrop-blur-sm cursor-pointer">
                {navT("loginAdherent")}
              </Button>
            </Link>
          </motion.div>
        </motion.div>

      </div>
    </section>);
}
export default Hero;
