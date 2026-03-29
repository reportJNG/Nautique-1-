"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
    TESTIMONIAL_IDS,
    SOCIAL_STATS,
    initialsFromName,
    testimonialRatingForId,
    type Testimonial,
} from "./testimonialsSection.logic";

export function useTestimonials(): Testimonial[] {
    const t = useTranslations("landing.testimonials");
    const locale = useLocale();

    return useMemo(
        () =>
            TESTIMONIAL_IDS.map((id) => ({
                id,
                name: t(`items.${id}.name`),
                role: t(`items.${id}.role`),
                content: t(`items.${id}.content`),
                avatar: initialsFromName(t(`items.${id}.name`)),
                rating: testimonialRatingForId(id),
                date: t(`items.${id}.date`),
                location: t(`items.${id}.location`),
                verified: true,
                tags: [t(`items.${id}.tags.tag1`), t(`items.${id}.tags.tag2`)],
                social: SOCIAL_STATS[id],
            })),
        [t, locale],
    );
}
