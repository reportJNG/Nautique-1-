// i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";

import { defaultLocale, locales } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  // When using locale-based routing (`app/[locale]`), next-intl passes the
  // matched locale via `requestLocale`. This must be the source of truth.
  // Fallback to `x-locale` (set by middleware) only for safety.
  const headersList = await headers();
  const headerLocale = headersList.get("x-locale");

  const requested = requestLocale ? await requestLocale : undefined;
  const candidate = (requested ?? headerLocale ?? defaultLocale) as string;

  const locale = locales.includes(candidate as any)
    ? (candidate as (typeof locales)[number])
    : defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: "Africa/Algiers",
  };
});
