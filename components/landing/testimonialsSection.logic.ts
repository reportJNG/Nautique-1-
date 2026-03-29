export interface Testimonial {
    id: string;
    name: string;
    role: string;
    content: string;
    avatar: string;
    image?: string;
    rating: number;
    date?: string;
    location?: string;
    verified?: boolean;
    tags?: string[];
    social?: {
        likes?: number;
        comments?: number;
        shares?: number;
    };
}

export const TESTIMONIAL_IDS = [
    "amira",
    "youcef",
    "meriem",
    "bilal",
    "sabrina",
    "karim",
    "naima",
    "ryad",
    "lina",
    "yacine",
    "samira",
    "farid",
    "ines",
    "nadir",
    "hocine",
    "malika",
    "mourad",
    "asma",
    "nassim",
    "souad",
] as const;

export type TestimonialId = (typeof TESTIMONIAL_IDS)[number];

export const SOCIAL_STATS: Record<TestimonialId, Testimonial["social"]> = {
    amira: { likes: 234, comments: 45, shares: 89 },
    youcef: { likes: 567, comments: 89, shares: 234 },
    meriem: { likes: 891, comments: 123, shares: 456 },
    bilal: { likes: 345, comments: 67, shares: 123 },
    sabrina: { likes: 1234, comments: 234, shares: 567 },
    karim: { likes: 412, comments: 55, shares: 98 },
    naima: { likes: 503, comments: 71, shares: 120 },
    ryad: { likes: 388, comments: 49, shares: 84 },
    lina: { likes: 642, comments: 80, shares: 142 },
    yacine: { likes: 459, comments: 60, shares: 110 },
    samira: { likes: 734, comments: 96, shares: 170 },
    farid: { likes: 321, comments: 43, shares: 76 },
    ines: { likes: 690, comments: 88, shares: 151 },
    nadir: { likes: 277, comments: 35, shares: 63 },
    hocine: { likes: 540, comments: 73, shares: 129 },
    malika: { likes: 608, comments: 82, shares: 145 },
    mourad: { likes: 366, comments: 51, shares: 92 },
    asma: { likes: 721, comments: 94, shares: 180 },
    nassim: { likes: 435, comments: 58, shares: 107 },
    souad: { likes: 680, comments: 90, shares: 166 },
};

export function testimonialRatingForId(id: TestimonialId): number {
    return id === "bilal" ? 4 : 5;
}

export function initialsFromName(fullName: string): string {
    return fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .filter(Boolean)
        .join("");
}
