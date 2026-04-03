import { StructuredData } from "@/components/seo/structured-data";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  DocumentsSection,
  FaqSection,
  HeroSection,
  OperationsSection,
  PartnersSection,
  ProcessSection,
  ProductsSection,
  ProjectsSection,
  QuickEstimateSection,
  RequestSection,
  StandardsSection,
  TrustSection,
} from "@/components/sections/home-sections";
import { MobileCta } from "@/components/ui/mobile-cta";
import { RevealInit } from "@/components/ui/reveal-init";
import { HOME_FAQ } from "@/lib/site-data";
import { createFaqStructuredData } from "@/lib/seo";

export function HomePage() {
  return (
    <div className="page-shell">
      <StructuredData data={createFaqStructuredData(HOME_FAQ)} />
      <SiteHeader />

      <main id="top">
        <HeroSection />
        <QuickEstimateSection />
        <ProductsSection />
        <StandardsSection />
        <TrustSection />
        <DocumentsSection />
        <OperationsSection />
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
