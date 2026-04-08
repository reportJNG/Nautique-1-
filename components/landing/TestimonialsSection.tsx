"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Calendar, MapPin, Heart, MessageCircle, Share2, Quote, Star, CheckCircle2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

import type { Testimonial } from "./testimonialsSection.logic";
import { useTestimonials } from "./useTestimonials";

interface TestimonialsSectionProps {
  className?: string;
  showStats?: boolean;
}

const RatingStars = ({ rating, size = "md" }: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) => {
  const sizes = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" };

  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          className={`${sizes[size]} ${index < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-muted-foreground/30"} transition-colors duration-200`}
        />
      ))}
    </div>
  );
};

const SocialStats = ({ stats }: { stats: Testimonial["social"] }) => {
  if (!stats) {
    return null;
  }

  return (
    <div className="mt-4 flex gap-4 border-t border-border pt-4">
      {stats.likes && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Heart className="h-3.5 w-3.5" />
          <span>{stats.likes}</span>
        </div>
      )}
      {stats.comments && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MessageCircle className="h-3.5 w-3.5" />
          <span>{stats.comments}</span>
        </div>
      )}
      {stats.shares && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Share2 className="h-3.5 w-3.5" />
          <span>{stats.shares}</span>
        </div>
      )}
    </div>
  );
};

export function TestimonialsSection({ className = "", showStats = true }: TestimonialsSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("landing.testimonials");
  const testimonials = useTestimonials();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section ref={ref} id="testimonials" className={`py-24 ${className}`} aria-label={t("ariaLabel")}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5" />

          <h2 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {t("subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Carousel
            key={locale}
            opts={{
              align: "start",
              loop: true,
              direction: isRTL ? "rtl" : "ltr",
            }}
            className="w-full"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                  <motion.div
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="h-full p-2"
                  >
                    <Card className="h-full overflow-hidden border-border bg-card transition-all duration-500">
                      <motion.div
                        animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                      />

                      <CardContent className="relative p-6">
                        <motion.div
                          animate={{
                            rotate: hoveredIndex === index ? -5 : 0,
                            scale: hoveredIndex === index ? 1.05 : 1,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <Quote className="mb-4 h-8 w-8 text-primary/60" />
                        </motion.div>

                        <p className="mb-4 leading-relaxed text-foreground/80">
                          &ldquo;{testimonial.content}&rdquo;
                        </p>

                        <div className="mb-4">
                          <RatingStars rating={testimonial.rating} />
                        </div>

                        <div className="mb-3 flex items-center gap-3">
                          <Avatar className="h-12 w-12 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 font-semibold text-primary">
                              {testimonial.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-lg font-semibold text-foreground">{testimonial.name}</p>
                              {testimonial.verified && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            </div>
                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>

                            {(testimonial.location || testimonial.date) && (
                              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                {testimonial.location && (
                                  <>
                                    <MapPin className="h-3 w-3" />
                                    <span>{testimonial.location}</span>
                                  </>
                                )}
                                {testimonial.date && (
                                  <>
                                    <span>&bull;</span>
                                    <Calendar className="h-3 w-3" />
                                    <span>{testimonial.date}</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {testimonial.tags && (
                          <div className="mb-3 flex flex-wrap gap-2">
                            {testimonial.tags.map((tag, indexTag) => (
                              <Badge key={indexTag} variant="secondary" className="bg-primary/5 text-xs text-muted-foreground">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {showStats && testimonial.social && <SocialStats stats={testimonial.social} />}
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="left-0 -translate-x-1/2 border-border bg-card shadow-md transition-all duration-300 hover:bg-primary hover:text-primary-foreground" />
            <CarouselNext className="right-0 translate-x-1/2 border-border bg-card shadow-md transition-all duration-300 hover:bg-primary hover:text-primary-foreground" />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}
