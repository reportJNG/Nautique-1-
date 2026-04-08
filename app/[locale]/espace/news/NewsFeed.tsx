"use client";

import { NewsPostCard, type NewsItem } from "./NewsPostCard";

interface NewsFeedProps {
  news: NewsItem[];
}

export default function NewsFeed({ news }: NewsFeedProps) {
  return (
    <section className="mx-auto w-full max-w-[640px]">
      <div className="space-y-5 sm:space-y-6">
        {news.map((item) => (
          <NewsPostCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export type { NewsItem };
