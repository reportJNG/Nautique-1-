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