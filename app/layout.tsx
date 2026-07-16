import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { Suspense } from "react";
import { StructuredData } from "@/components/seo/structured-data";
import { Analytics } from "@/components/seo/analytics";
import { MotionProvider } from "@/components/ui/motion-provider";
import { SiteAiChat } from "@/components/ui/site-ai-chat";
import {
  createOrganizationStructuredData,
  createWebsiteStructuredData,
} from "@/lib/seo";
import { isPreviewDeployment, siteConfig } from "@/lib/site-config";
import { getPublishedCmsSettings } from "@/lib/cms-published";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.defaultTitle,
    template: siteConfig.titleTemplate,
  },
  description: siteConfig.defaultDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.companyName,
    url: "/",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.companyName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    images: [siteConfig.ogImage],
  },
  robots: isPreviewDeployment ? { index: false, follow: false } : undefined,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getPublishedCmsSettings();
  const analytics = settings.analytics ?? {};
  return (
    <html lang="ru" className={`${inter.variable} ${manrope.variable}`}>
      <body>
        <StructuredData data={createOrganizationStructuredData()} />
        <StructuredData data={createWebsiteStructuredData()} />
        <Suspense fallback={null}>
          <Analytics config={{ gaMeasurementId: analytics.gaMeasurementId, yandexMetrikaId: analytics.yandexMetrikaId }} />
        </Suspense>
        <MotionProvider>{children}</MotionProvider>
        <SiteAiChat />
      </body>
    </html>
  );
}
