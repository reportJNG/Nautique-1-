import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/auth/session";
import NewsFeed from "./NewsFeed";
import type { NewsItem } from "./NewsFeed";

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: "fr" | "en" | "ar" }>;
}) {
  await params;
  const session = await getSession();

  if (!session || session.type !== "adherent") {
    return null;
  }

  const t = await getTranslations("espace.news");
  const posts: NewsItem[] = [
    {
      id: "1",
      username: t("posts.1.username"),
      publishedAt: "2026-03-25T09:00:00Z",
      title: t("posts.1.title"),
      likes: 312,
    },
    {
      id: "2",
      username: t("posts.2.username"),
      publishedAt: "2026-03-26T10:30:00Z",
      title: t("posts.2.title"),
      likes: 587,
    },
    {
      id: "3",
      username: t("posts.3.username"),
      publishedAt: "2026-03-27T08:00:00Z",
      title: t("posts.3.title"),
      likes: 214,
    },
    {
      id: "4",
      username: t("posts.4.username"),
      publishedAt: "2026-03-28T11:00:00Z",
      title: t("posts.4.title"),
      likes: 430,
    },
    {
      id: "5",
      username: t("posts.5.username"),
      publishedAt: "2026-03-29T09:30:00Z",
      title: t("posts.5.title"),
      likes: 763,
    },
    {
      id: "6",
      username: t("posts.6.username"),
      publishedAt: "2026-03-30T10:00:00Z",
      title: t("posts.6.title"),
      likes: 189,
    },
    {
      id: "7",
      username: t("posts.7.username"),
      publishedAt: "2026-03-31T17:00:00Z",
      title: t("posts.7.title"),
      likes: 641,
    },
    {
      id: "8",
      username: t("posts.8.username"),
      publishedAt: "2026-04-01T08:00:00Z",
      title: t("posts.8.title"),
      likes: 895,
    },
    {
      id: "9",
      username: t("posts.9.username"),
      publishedAt: "2026-04-02T09:00:00Z",
      title: t("posts.9.title"),
      likes: 528,
    },
    {
      id: "10",
      username: t("posts.10.username"),
      publishedAt: "2026-04-03T19:00:00Z",
      title: t("posts.10.title"),
      likes: 712,
    },
  ];

  return (
    <div className="px-4 pb-16 pt-8 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[960px]">
        <header className="mb-8 sm:mb-10">
          <h1 className="text-[28px] font-semibold tracking-tight text-foreground sm:text-[32px]">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {t("subtitle")}
          </p>
          <div className="mt-8 h-px w-full bg-border" />
        </header>

        <NewsFeed news={posts} />
      </div>
    </div>
  );
}
