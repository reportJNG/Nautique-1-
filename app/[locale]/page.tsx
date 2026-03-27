import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { StatsSection } from "@/components/landing/StatsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import DisciplinesSection from "@/components/landing/DisciplinesSection";
import { SaisonSection } from "@/components/landing/SaisonSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { GallerySection } from "@/components/landing/GallerySection";
import { Footer } from "@/components/landing/Footer";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <main className="overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20">
        <Hero />
        <FeaturesSection />
        <StatsSection />
        <SaisonSection locale={locale} />
        <DisciplinesSection />
        <GallerySection />
        <TestimonialsSection />
      </main>
      <Footer locale={locale} />
    </div>
  );
}