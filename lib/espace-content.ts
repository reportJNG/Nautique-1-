import { promises as fs } from "node:fs";
import path from "node:path";

type Locale = "fr" | "en" | "ar";

type NewsRecord = {
  id: string;
  slug: string;
  level: "info" | "warning" | "success";
  publishedAt: string;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  ctaHref: string;
};

type FeedbackRecord = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "reviewing" | "queued";
};

const newsPath = path.join(process.cwd(), "data", "espace-news.json");
const feedbackPath = path.join(process.cwd(), "data", "admin-feedback.json");

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(filePath: string, data: T) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export async function getEspaceNews(locale: Locale) {
  const news = await readJsonFile<NewsRecord[]>(newsPath, []);
  return news
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .map((item) => ({
      id: item.id,
      slug: item.slug,
      level: item.level,
      publishedAt: item.publishedAt,
      title: item.title[locale],
      excerpt: item.excerpt[locale],
      ctaHref: item.ctaHref,
    }));
}

export async function getAdminFeedback() {
  const feedback = await readJsonFile<FeedbackRecord[]>(feedbackPath, []);
  return feedback.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getFeedbackForMember(email: string) {
  const feedback = await getAdminFeedback();
  return feedback.filter((item) => item.email.toLowerCase() === email.toLowerCase());
}

export async function createAdminFeedback(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const feedback = await getAdminFeedback();
  const record: FeedbackRecord = {
    id: `fb-${Date.now()}`,
    createdAt: new Date().toISOString(),
    name: input.name.trim(),
    email: input.email.trim(),
    subject: input.subject.trim(),
    message: input.message.trim(),
    status: "new",
  };

  const nextData = [record, ...feedback];
  await writeJsonFile(feedbackPath, nextData);
  return record;
}
