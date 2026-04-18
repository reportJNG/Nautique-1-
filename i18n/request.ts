import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";
import { defaultLocale, locales } from "./config";

function isLocale(value: string): value is (typeof locales)[number] {
    return locales.some((locale) => locale === value);
}

export default getRequestConfig(async ({ requestLocale }) => {
    const headersList = await headers();
    const headerLocale = headersList.get("x-locale");
    const requested = requestLocale ? await requestLocale : undefined;
    const candidate = requested ?? headerLocale ?? defaultLocale;
    const locale = isLocale(candidate) ? candidate : defaultLocale;
    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default,
        timeZone: "Africa/Algiers",
    };
});
