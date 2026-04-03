import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  FaqSection,
  HeroSection,
  PartnersSection,
  ProcessSection,
  ProductsSection,
  ProjectsSection,
  RequestSection,
  StandardsSection,
  TrustSection,
} from "@/components/sections/home-sections";
import { MobileCta } from "@/components/ui/mobile-cta";
import { RevealInit } from "@/components/ui/reveal-init";

export function HomePage() {
  return (
    <div className="page-shell">
      <SiteHeader />

      <main id="top">
        <HeroSection />
        <ProductsSection />
        <StandardsSection />
        <TrustSection />
        <ProjectsSection />
        <ProcessSection />
        <PartnersSection />
        <FaqSection />
        <RequestSection />
      </main>

      <SiteFooter />
      <RevealInit />
      <MobileCta heroId="hero-shell" requestId="request" href="#request" label="Получить расчёт" />
    </div>
  );
}
