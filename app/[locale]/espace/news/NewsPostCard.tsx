"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export interface NewsItem {
  id: string;
  publishedAt: string;
  title: string;
  username?: string | null;
  likes?: number;
}

interface NewsPostCardProps {
  item: NewsItem;
}

const adminAvatarStyle = {
  backgroundColor: "hsl(var(--secondary))",
  borderColor: "hsl(var(--border))",
  color: "hsl(var(--primary))",
};

function getInitials(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "NN";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function getRelativeTimestamp(dateString: string, t: ReturnType<typeof useTranslations>) {
  const publishedAt = new Date(dateString);
  const diffMs = Date.now() - publishedAt.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (Number.isNaN(publishedAt.getTime()) || diffMs < minute) {
    return t("just_now");
  }

  if (diffMs < hour) {
    return t("minutes_ago", { count: Math.max(1, Math.floor(diffMs / minute)) });
  }

  if (diffMs < day) {
    return t("hours_ago", { count: Math.max(1, Math.floor(diffMs / hour)) });
  }

  return t("days_ago", { count: Math.max(1, Math.floor(diffMs / day)) });
}

function HeartIcon({ liked, popping }: { liked: boolean; popping: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`size-[18px] transition-all duration-200 ${popping ? "scale-125" : "scale-100"}`}
      fill={liked ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s-6.716-4.315-9.192-8.16C.716 9.563 2.09 5.25 6.05 4.336c2.096-.484 4.14.325 5.95 2.438 1.81-2.113 3.854-2.922 5.95-2.438 3.96.914 5.334 5.227 3.242 8.504C18.716 16.685 12 21 12 21Z" />
    </svg>
  );
}

export function NewsPostCard({ item }: NewsPostCardProps) {
  const t = useTranslations("espace.news");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(() => item.likes ?? 0);
  const [popping, setPopping] = useState(false);
  const popTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (popTimerRef.current) {
        clearTimeout(popTimerRef.current);
      }
    };
  }, []);

  const publisherName = item.username?.trim() || t("sourceDefault");
  const timestamp = getRelativeTimestamp(item.publishedAt, t);

  function handleLikeToggle() {
    if (popTimerRef.current) {
      clearTimeout(popTimerRef.current);
    }

    setPopping(true);
    popTimerRef.current = setTimeout(() => setPopping(false), 200);

    setLiked((current) => {
      const nextLiked = !current;
      setLikeCount((currentCount) => currentCount + (nextLiked ? 1 : -1));
      return nextLiked;
    });
  }

  return (
    <article
      className="rounded-xl bg-card px-5 py-5 transition-colors duration-200 hover:bg-[hsl(var(--muted)/0.16)] sm:px-6 sm:py-6"
      style={{ border: "0.5px solid hsl(var(--border))" }}
    >
      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold uppercase"
            style={adminAvatarStyle}
            aria-hidden="true"
          >
            {getInitials(publisherName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-card-foreground">{publisherName}</p>
            <p className="mt-0.5 text-xs font-normal text-muted-foreground">{t("admin_badge")}</p>
          </div>
        </div>

        <p className="shrink-0 text-xs font-normal text-muted-foreground">{timestamp}</p>
      </header>

      <div className="pb-6 pt-5 sm:pb-7 sm:pt-6">
        <h2 className="text-base leading-[1.6] font-normal text-[hsl(var(--foreground)/0.88)] sm:text-[17px]">
          {item.title}
        </h2>
      </div>

      <footer style={{ borderTop: "0.5px solid hsl(var(--border))" }} className="pt-4">
        <button
          type="button"
          onClick={handleLikeToggle}
          aria-label={t("like_this_post")}
          aria-pressed={liked}
          className={`inline-flex items-center gap-2 text-[13px] font-normal transition-colors duration-200 active:scale-[0.98] ${
            liked ? "text-[hsl(var(--destructive))]" : "text-muted-foreground hover:text-[hsl(var(--destructive))]"
          }`}
        >
          <HeartIcon liked={liked} popping={popping} />
          <span>{likeCount}</span>
        </button>
      </footer>
    </article>
  );
}
