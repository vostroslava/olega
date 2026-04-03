import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { CONTACTS } from "@/lib/site-data";

type BuildPageMetadataArgs = {
  title: string;
  description: string;
  path: string;
};

export function buildPageMetadata({
  title,
  description,
  path,
}: BuildPageMetadataArgs): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.companyName,
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
      title,
      description,
      images: [siteConfig.ogImage],
    },
  };
}

type BreadcrumbItem = {
  name: string;
  path: string;
};

export function createBreadcrumbStructuredData(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.siteUrl}${item.path}`,
    })),
  };
}

export function createOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.companyName,
    legalName: siteConfig.legalName,
    url: siteConfig.siteUrl,
    logo: `${siteConfig.siteUrl}${siteConfig.ogImage}`,
    email: CONTACTS.primaryEmail,
    telephone: CONTACTS.phones.map((item) => item.label),
    address: {
      "@type": "PostalAddress",
      streetAddress: "пер. Коммунистический, д. 2, оф. 5",
      addressLocality: "Могилёв",
      postalCode: "212030",
      addressCountry: "BY",
    },
  };
}

export function createWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.companyName,
    url: siteConfig.siteUrl,
    inLanguage: "ru-BY",
  };
}

type FaqStructuredDataItem = {
  question: string;
  answer: string;
};

export function createFaqStructuredData(items: FaqStructuredDataItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

type ItemListEntry = {
  name: string;
  path: string;
};

export function createItemListStructuredData(items: ItemListEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: `${siteConfig.siteUrl}${item.path}`,
    })),
  };
}

type ServiceStructuredDataArgs = {
  name: string;
  description: string;
  path: string;
  areaServed?: string;
};

export function createServiceStructuredData({
  name,
  description,
  path,
  areaServed = "Беларусь",
}: ServiceStructuredDataArgs) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: name,
    name,
    description,
    areaServed,
    provider: {
      "@type": "Organization",
      name: siteConfig.companyName,
      url: siteConfig.siteUrl,
    },
    url: `${siteConfig.siteUrl}${path}`,
  };
}

type LocalBusinessStructuredDataArgs = {
  name: string;
  email: string;
  telephone: string[];
  streetAddress: string;
  addressLocality: string;
  postalCode: string;
  addressCountry: string;
  areaServed: string;
  path: string;
};

export function createLocalBusinessStructuredData({
  name,
  email,
  telephone,
  streetAddress,
  addressLocality,
  postalCode,
  addressCountry,
  areaServed,
  path,
}: LocalBusinessStructuredDataArgs) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    email,
    telephone,
    address: {
      "@type": "PostalAddress",
      streetAddress,
      addressLocality,
      postalCode,
      addressCountry,
    },
    areaServed,
    url: `${siteConfig.siteUrl}${path}`,
  };
}
