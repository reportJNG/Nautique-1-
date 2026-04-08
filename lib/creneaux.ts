const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export type DayKey = (typeof DAY_KEYS)[number];

export function inferOneBasedWeek(days: number[]) {
  if (days.length === 0) {
    return false;
  }

  if (days.some((day) => day === 7)) {
    return true;
  }

  return !days.some((day) => day === 0) && days.every((day) => day >= 1 && day <= 7);
}

export function normalizeDayIndex(day: number, oneBasedWeek: boolean) {
  if (oneBasedWeek) {
    return day % 7;
  }

  return ((day % 7) + 7) % 7;
}

export function getDayKey(day: number, oneBasedWeek: boolean) {
  const normalizedDay = normalizeDayIndex(day, oneBasedWeek);

  return DAY_KEYS[normalizedDay] ?? null;
}

export function formatTimeForLocale(time: Date, locale: string) {
  const timeLocale = locale === "en" ? "en-US" : locale === "ar" ? "ar-DZ" : "fr-FR";

  return new Intl.DateTimeFormat(timeLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(time);
}
