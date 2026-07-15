import { StructuredData } from "@/components/seo/structured-data";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { OpticalHero } from "@/components/ui/optical-hero";
import { GlassScrollScene } from "@/components/ui/glass-scroll-scene";
import { GlassAnatomy } from "@/components/ui/glass-anatomy";
import { ProjectLens } from "@/components/ui/project-lens";
import {
  AudiencePathways,
  HomeQuoteSection,
  ProductionStory,
  ProjectShowcase,
  ProofBand,
  SolutionsShowcase,
} from "@/components/sections/monolith-sections";
import { MobileCta } from "@/components/ui/mobile-cta";
import { HomeMotion } from "@/components/ui/home-motion";
import { RevealInit } from "@/components/ui/reveal-init";
import { HOME_FAQ } from "@/lib/site-data";
import { createFaqStructuredData } from "@/lib/seo";

export function HomePage() {
  return (
    <div className="page-shell">
      <StructuredData data={createFaqStructuredData(HOME_FAQ)} />
      <SiteHeader />

      <main id="top" className="home-main">
        <div className="glass-thread" aria-hidden="true" />
        <OpticalHero />
        <ProofBand />
        <AudiencePathways />
        <ProjectShowcase />
        <GlassScrollScene />
        <GlassAnatomy />
        <ProjectLens />
        <SolutionsShowcase />
        <ProductionStory />
        <HomeQuoteSection />
      </main>

      <SiteFooter />
      <RevealInit />
      <HomeMotion />
      <MobileCta heroId="hero-shell" requestId="request" href="/raschet/" label="Получить расчёт" />
    </div>
  );
}
