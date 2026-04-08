import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function generateNumeroDossier(): string {
    const prefix = 'DOS';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
}

export function generateNumeroRecu(year: number, sequence: number): string {
    const paddedSequence = sequence.toString().padStart(5, '0');
    return `REC-${year}-${paddedSequence}`;
}

export function formatCurrency(value: number, locale = "fr"): string {
    return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
        style: "currency",
        currency: "DZD",
        maximumFractionDigits: 2,
    }).format(value);
}

export function formatDate(date: Date, locale = "fr"): string {
    return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}
