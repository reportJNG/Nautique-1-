import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { StatsSection } from "@/components/landing/StatsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import DisciplinesSection from "@/components/landing/DisciplinesSection";
import { SaisonSection } from "@/components/landing/SaisonSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { GallerySection } from "@/components/landing/GallerySection";
import { Footer } from "@/components/landing/Footer";

export default function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <main className="bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-cyan-950/30 dark:via-gray-950 dark:to-blue-950/30">
        <Hero />
        <FeaturesSection />
        <StatsSection />
        <SaisonSection locale={params.locale} />
        <DisciplinesSection />
        <GallerySection />
        <TestimonialsSection />
      </main>
      <Footer locale={params.locale} />
    </div>
  );
}