import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { StructuredData } from "@/components/seo/structured-data";
import {
  createOrganizationStructuredData,
  createWebsiteStructuredData,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${manrope.variable}`}>
      <body>
        <StructuredData data={createOrganizationStructuredData()} />
        <StructuredData data={createWebsiteStructuredData()} />
        {children}
      </body>
    </html>
  );
}
