"use client";
import { Badge } from "@/components/ui/badge";
import { Waves, Dumbbell, ArrowRight, Clock, Users, Trophy, Calendar, Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
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
    const enhancedFeatures = {
        NAU: {
            stats: { sessions: 24, members: 156, awards: 8 },
            duration: t("durations.short"),
            color: "from-cyan-500 to-teal-500",
            bgGradient: "from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30",
        },
        default: {
            stats: { sessions: 18, members: 98, awards: 5 },
            duration: t("durations.long"),
            color: "from-orange-500 to-red-500",
            bgGradient: "from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30",
        },
    };
    return (<section id="disciplines" className="relative py-32 bg-gradient-to-b from-background via-background to-muted/20">
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-primary/20 to-primary/5 rounded-full blur-3xl"/>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-l from-secondary/20 to-secondary/5 rounded-full blur-3xl"/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl"/>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-20">
        

          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text">
              {t("title")}
            </span>
          </motion.h2>

          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            {t("subtitle")}
          </motion.p>
        </div>

        
        <div className="grid gap-8 lg:grid-cols-2">
          {espaces.map((espace, index) => {
            const features = enhancedFeatures[espace.code as keyof typeof enhancedFeatures] || enhancedFeatures.default;
            const Icon = espace.code === "NAU" ? Waves : Dumbbell;
            return (<motion.div key={espace.id} initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.2 }} className="group">
                <div className="relative h-full">
                  
                  <div className={`absolute inset-0 bg-gradient-to-br ${features.bgGradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}/>
                  
                  
                  <div className="relative h-full bg-background/80 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-500 overflow-hidden">
                    
                    <div className={`h-1 w-full bg-gradient-to-r ${features.color}`}/>
                    
                    <div className="p-8">
                      
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${features.color} shadow-lg`}>
                            <Icon className="h-6 w-6 text-white"/>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                              {espace.designation}
                            </h3>
                            <Badge variant="outline" className="mt-1 text-xs font-mono">
                              {espace.code}
                            </Badge>
                          </div>
                        </div>
                        
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500"/>
                          <span>4.9</span>
                        </div>
                      </div>

                      
                      {espace.description && (<p className="text-muted-foreground/80 leading-relaxed mb-6">
                          {espace.description}
                        </p>)}

                      
                      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-xl">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Clock className="h-3 w-3 text-muted-foreground"/>
                            <span className="text-xs text-muted-foreground">{t("stats.duration")}</span>
                          </div>
                          <p className="text-sm font-semibold">{features.duration}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Users className="h-3 w-3 text-muted-foreground"/>
                            <span className="text-xs text-muted-foreground">{t("stats.members")}</span>
                          </div>
                          <p className="text-sm font-semibold">{features.stats.members}+</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Trophy className="h-3 w-3 text-muted-foreground"/>
                            <span className="text-xs text-muted-foreground">{t("stats.awards")}</span>
                          </div>
                          <p className="text-sm font-semibold">{features.stats.awards}</p>
                        </div>
                      </div>

                      
                      <div className="space-y-3">
                        
                        
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                          {espace.disciplines.map((discipline, idx) => (<motion.div key={discipline.id} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.02 }} whileHover={{ scale: 1.05 }}>
                              <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                                {discipline.designation}
                              </Badge>
                            </motion.div>))}
                        </div>
                      </div>

                      
                     
                    </div>
                  </div>
                </div>
              </motion.div>);
        })}
        </div>

        
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="mt-20 text-center">
     <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group">
  <Calendar className="h-5 w-5 text-white"/>
  <span className="text-sm font-medium text-white/90">{t("cta.prefix")}</span>
  <Link href={`/auth/adherent/login`} className="flex items-center gap-2">
    <span className="text-sm font-semibold text-white group-hover:underline underline-offset-2">
      {t("cta.action")}
    </span>
    <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-1 transition-transform"/>
  </Link>
    </div>
        </motion.div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--muted));
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--primary));
          border-radius: 10px;
        }
      `}</style>
    </section>);
}
