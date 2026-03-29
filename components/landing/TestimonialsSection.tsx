"use client";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Quote, Star, CheckCircle2, Calendar, MapPin, Heart, MessageCircle, Share2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Testimonial } from "./testimonialsSection.logic";
import { useTestimonials } from "./useTestimonials";

interface TestimonialsSectionProps {
    className?: string;
    showStats?: boolean;
    autoplayInterval?: number;
}

const RatingStars = ({ rating, size = "md" }: {
    rating: number;
    size?: "sm" | "md" | "lg";
}) => {
    const sizes = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" };
    return (<div className="flex gap-1">
      {[...Array(5)].map((_, i) => (<Star key={i} className={`${sizes[size]} ${i < rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-200 dark:text-gray-700"} transition-colors duration-200`}/>))}
    </div>);
};

const SocialStats = ({ stats }: {
    stats: Testimonial["social"];
}) => {
    if (!stats)
        return null;
    return (<div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
      {stats.likes && (<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Heart className="h-3.5 w-3.5"/>
          <span>{stats.likes}</span>
        </div>)}
      {stats.comments && (<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MessageCircle className="h-3.5 w-3.5"/>
          <span>{stats.comments}</span>
        </div>)}
      {stats.shares && (<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Share2 className="h-3.5 w-3.5"/>
          <span>{stats.shares}</span>
        </div>)}
    </div>);
};

export function TestimonialsSection({ className = "", showStats = true, autoplayInterval = 5000 }: TestimonialsSectionProps) {
    const ref = useRef<HTMLElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const locale = useLocale();
    const isRTL = locale === "ar";
    const t = useTranslations("landing.testimonials");
    const testimonials = useTestimonials();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (<section ref={ref} id="testimonials" className={`py-24 bg-muted/30 ${className}`} aria-label={t("ariaLabel")}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-4">
            
          </div>
          
          <h2 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {t("subtitle")}
          </p>
        </motion.div>

        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.2 }}>
          <Carousel key={locale} opts={{
            align: "start",
            loop: true,
            direction: isRTL ? "rtl" : "ltr",
        }} className="w-full">
            <CarouselContent>
              {testimonials.map((testimonial, idx) => (<CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                  <motion.div onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)} whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="p-2 h-full">
                    <Card className="h-full border-0   transition-all duration-500 overflow-hidden">
                      
                      <motion.div animate={{ opacity: hoveredIndex === idx ? 1 : 0 }} transition={{ duration: 0.3 }}/>
                      
                      <CardContent className="p-6 relative">
                        
                        <motion.div animate={{
                rotate: hoveredIndex === idx ? -5 : 0,
                scale: hoveredIndex === idx ? 1.05 : 1
            }} transition={{ duration: 0.3 }}>
                          <Quote className="mb-4 h-8 w-8 text-primary/60"/>
                        </motion.div>
                        
                        
                        <p className="text-foreground/80 leading-relaxed mb-4">
                          "{testimonial.content}"
                        </p>
                        
                        
                        <div className="mb-4">
                          <RatingStars rating={testimonial.rating}/>
                        </div>
                        
                        
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-12 w-12 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary font-semibold">
                              {testimonial.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-lg">{testimonial.name}</p>
                              {testimonial.verified && (<CheckCircle2 className="h-4 w-4 text-green-500"/>)}
                            </div>
                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                            
                            
                            {(testimonial.location || testimonial.date) && (<div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                {testimonial.location && (<>
                                    <MapPin className="h-3 w-3"/>
                                    <span>{testimonial.location}</span>
                                  </>)}
                                {testimonial.date && (<>
                                    <span>•</span>
                                    <Calendar className="h-3 w-3"/>
                                    <span>{testimonial.date}</span>
                                  </>)}
                              </div>)}
                          </div>
                        </div>
                        
                        
                        {testimonial.tags && (<div className="flex flex-wrap gap-2 mb-3">
                            {testimonial.tags.map((tag, i) => (<Badge key={i} variant="secondary" className="text-xs bg-primary/5">
                                {tag}
                              </Badge>))}
                          </div>)}
                        
                        
                        {showStats && testimonial.social && (<SocialStats stats={testimonial.social}/>)}
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>))}
            </CarouselContent>
            
            
            <CarouselPrevious className="left-0 -translate-x-1/2 bg-white dark:bg-gray-950 border shadow-md hover:bg-primary hover:text-white transition-all duration-300"/>
            <CarouselNext className="right-0 translate-x-1/2 bg-white dark:bg-gray-950 border shadow-md hover:bg-primary hover:text-white transition-all duration-300"/>
          </Carousel>
        </motion.div>
   
      </div>
    </section>);
}
