"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Users, 
  CalendarDays, 
  ChevronRight,
  Sparkles,
  MapPin,
  Bell,
  Star,
  TrendingUp,
  Award
} from "lucide-react";
import { useTranslations } from "next-intl";
import { STATUT_SAISON_STYLES } from "@/lib/constants";

type SaisonLike = {
  designation: string;
  statut: string;
  dateDebut: Date | string;
  dateFin: Date | string;
  creneaux: Array<{
    id: number | string;
    jourSemaine: number;
    heureDebut: any;
    heureFin: any;
    groupe?: string | null;
    discipline: { designation: string };
  }>;
};

export default function SaisonSectionClient({
  saison,
  creneauxByDiscipline,
  locale,
}: {
  saison: SaisonLike | null;
  creneauxByDiscipline: Record<string, any[]>;
  locale: string;
}) {
  const t = useTranslations("landing.saison");

  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [hoveredDiscipline, setHoveredDiscipline] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const dateLocale =
    locale === "ar" ? "ar-DZ" : locale === "en" ? "en-US" : "fr-FR";

  const dayLabels = useMemo(() => {
    return [
      t("dayLabels.sun"),
      t("dayLabels.mon"),
      t("dayLabels.tue"),
      t("dayLabels.wed"),
      t("dayLabels.thu"),
      t("dayLabels.fri"),
      t("dayLabels.sat"),
    ];
  }, [t]);

  const days = useMemo(
    () =>
      dayLabels.map((label, value) => ({
        label,
        value,
        shortLabel: label.substring(0, 3),
      })),
    [dayLabels]
  );

  const formatTime = (value: unknown) => {
    if (value instanceof Date) {
      return value.toLocaleTimeString(dateLocale, {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    const parsed = new Date(value as any);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString(dateLocale, {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return String(value ?? "");
  };

  const filteredCreneaux = useMemo(() => {
    if (!saison) return {};
    if (activeDay === null) return creneauxByDiscipline;

    return Object.fromEntries(
      Object.entries(creneauxByDiscipline).map(([discipline, creneaux]) => [
        discipline,
        creneaux.filter((c) => Number(c.jourSemaine) === activeDay),
      ])
    );
  }, [activeDay, creneauxByDiscipline, saison]);

  const getDisciplineStats = (creneaux: any[]) => {
    const uniqueGroups = new Set(creneaux.map(c => c.groupe).filter(Boolean));
    const totalSlots = creneaux.length;
    const daysAvailable = new Set(creneaux.map(c => c.jourSemaine)).size;
    return { totalSlots, uniqueGroups: uniqueGroups.size, daysAvailable };
  };

  const totalDisciplines = Object.keys(creneauxByDiscipline).length;
  const totalTimeSlots = Object.values(creneauxByDiscipline).reduce(
    (sum, slots) => sum + slots.length, 0
  );

  if (!saison) {
    return (
      <section id="horaires" className="relative py-32 overflow-hidden">
        
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/40 dark:to-blue-900/40 rounded-2xl mb-6"
          >
            <Sparkles className="h-8 w-8 text-cyan-600" />
          </motion.div>
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t("title")}
          </h2>
          <p className="mt-6 text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("noSaison")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="horaires" className="relative py-32 overflow-hidden">

      
      <div ref={ref} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/40 dark:to-blue-900/40 rounded-2xl mb-6 shadow-lg"
          >
            <CalendarDays className="h-8 w-8 text-cyan-600" />
          </motion.div>
          
          <h2 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
            {t("title")}
          </h2>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <div className="flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full shadow-md border border-border">
              <Award className="h-5 w-5 text-cyan-600" />
              <span className="text-lg font-semibold">{saison.designation}</span>
            </div>
            <Badge 
              className={`${STATUT_SAISON_STYLES[saison.statut] || ""} px-5 py-2 text-sm font-medium shadow-md`}
            >
              {saison.statut}
            </Badge>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-muted-foreground flex items-center justify-center gap-2 text-sm"
          >
            <Calendar className="h-4 w-4" />
            {t("dateRange", {
              start: new Date(saison.dateDebut).toLocaleDateString(dateLocale, {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              }),
              end: new Date(saison.dateFin).toLocaleDateString(dateLocale, {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              }),
            })}
          </motion.p>

          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap justify-center gap-6"
          >
            <div className="flex items-center gap-3 px-5 py-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl border border-border">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-cyan-600" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold">{totalDisciplines}</div>
                <div className="text-xs text-muted-foreground">{t("disciplines")}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl border border-border">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold">{totalTimeSlots}</div>
                <div className="text-xs text-muted-foreground">{t("weeklySlots")}</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Day Selection Tabs - Modern Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-16"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent blur-xl" />
            <div className="relative flex flex-wrap justify-center gap-2 p-2">
            <button
  type="button"
  onClick={() => setActiveDay(null)}
  className={`cursor-pointer group relative px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
    activeDay === null
      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-500/30 hover:from-cyan-500 hover:to-blue-500 hover:shadow-cyan-500/40"
      : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-muted-foreground hover:bg-white dark:hover:bg-gray-900 border border-border hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10"
  }`}
>
  <span className="relative z-10">{t("allDays")}</span>
  {activeDay === null && (
    <motion.div
      layoutId="activeDayTab"
      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600"
      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
    />
  )}
</button>

{days.map((day) => (
  <button
    key={day.value}
    type="button"
    onClick={() => setActiveDay(day.value)}
    className={`cursor-pointer group relative px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
      activeDay === day.value
        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-500/30 hover:from-cyan-500 hover:to-blue-500 hover:shadow-cyan-500/40"
        : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-muted-foreground hover:bg-white dark:hover:bg-gray-900 border border-border hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10"
    }`}
  >
    <span className="relative z-10 hidden sm:inline">{day.label}</span>
    <span className="relative z-10 sm:hidden">{day.shortLabel}</span>
    {activeDay === day.value && (
      <motion.div
        layoutId="activeDayTab"
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
  </button>
))}
            </div>
          </div>
        </motion.div>

        {/* Disciplines Grid - Enhanced Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDay ?? "all"}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {Object.entries(filteredCreneaux).map(([discipline, creneaux], index) => {
              const { totalSlots, uniqueGroups, daysAvailable } = getDisciplineStats(creneaux);
              const isHovered = hoveredDiscipline === discipline;
              const hasSlots = creneaux.length > 0;
              
              return (
                <motion.div
                  key={discipline}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  onMouseEnter={() => setHoveredDiscipline(discipline)}
                  onMouseLeave={() => setHoveredDiscipline(null)}
                >
                  <Card className="group h-full overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                    
                    <CardHeader className="relative pb-4 pt-6 px-6 border-b border-border/50">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                      
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                            {discipline}
                          </CardTitle>
                          {uniqueGroups > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                              <Users className="h-3.5 w-3.5" />
                              <span>{uniqueGroups} {uniqueGroups === 1 ? t("group") : t("groups")}</span>
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                              <span>{daysAvailable} {t("days")}</span>
                            </div>
                          )}
                        </div>
                        {hasSlots && (
                          <Badge 
                            variant="secondary" 
                            className="gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/50 dark:to-blue-900/50 border-0"
                          >
                            <Clock className="h-3.5 w-3.5" />
                            {totalSlots}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      {hasSlots ? (
                        <div className="space-y-3">
                          {creneaux.slice(0, 5).map((creneau, idx) => (
                            <motion.button
                              key={creneau.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              onClick={() => setSelectedTimeSlot(selectedTimeSlot === creneau.id ? null : creneau.id)}
                              className="w-full group/slot relative"
                            >
                              <div className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                                selectedTimeSlot === creneau.id
                                  ? "bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/50 shadow-md"
                                  : "bg-muted/30 hover:bg-muted/50"
                              }`}>
                                <div className="flex items-center gap-3">
                                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
                                    selectedTimeSlot === creneau.id
                                      ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg"
                                      : "bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/50 dark:to-blue-900/50 text-cyan-600"
                                  }`}>
                                    <Calendar className="h-5 w-5" />
                                  </div>
                                  <div className="text-left">
                                    <p className="font-semibold text-sm">
                                      {dayLabels[Number(creneau.jourSemaine)]}
                                    </p>
                                    {creneau.groupe && (
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {creneau.groupe}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1.5 text-sm font-mono bg-background/50 px-3 py-1.5 rounded-lg">
                                    <Clock className="h-3.5 w-3.5 text-cyan-600" />
                                    <span>{formatTime(creneau.heureDebut)}</span>
                                    <span className="text-muted-foreground">—</span>
                                    <span>{formatTime(creneau.heureFin)}</span>
                                  </div>
                                  <ChevronRight className={`h-4 w-4 text-muted-foreground transition-all duration-300 ${
                                    selectedTimeSlot === creneau.id ? "rotate-90" : "group-hover/slot:translate-x-0.5"
                                  }`} />
                                </div>
                              </div>
                              
                              {/* Expanded Details */}
                              <AnimatePresence>
                                {selectedTimeSlot === creneau.id && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-2 ml-12 pl-3 border-l-2 border-cyan-500/30"
                                  >
                                    <div className="py-2 text-xs text-muted-foreground space-y-1">
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-3 w-3" />
                                        <span>{t("location")}: {t("gymnasium")}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Bell className="h-3 w-3" />
                                        <span>{t("reminder")}: {t("arriveEarly")}</span>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.button>
                          ))}
                          
                          {creneaux.length > 5 && (
                            <p className="text-center text-xs text-muted-foreground pt-2">
                              +{creneaux.length - 5} {t("moreSlots")}
                            </p>
                          )}
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center py-12 text-center"
                        >
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-xl" />
                            <div className="relative rounded-full bg-muted p-4 mb-3">
                              <Calendar className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground font-medium">
                            {t("noSlotsForDay")}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {t("checkOtherDays")}
                          </p>
                        </motion.div>
                      )}
                    </CardContent>
                    
                    {/* Decorative Element */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Call to Action */}
        {activeDay !== null && Object.values(filteredCreneaux).every(c => c.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-md border border-border">
              <Star className="h-5 w-5 text-cyan-600 animate-pulse" />
              <p className="text-muted-foreground">
                {t("noActivitiesForSelectedDay")}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}