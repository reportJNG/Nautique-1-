export const defaultLocale = "fr";
export const locales = ["fr", "en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const rtlLocales = ["ar"];
export function isRTL(locale: string): boolean {
    return rtlLocales.includes(locale);
}
