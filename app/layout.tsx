import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
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
  title: "СтеклоСтройГрупп | Фасады, окна и остекление под ключ",
  description:
    "Производство и монтаж окон ПВХ, алюминиевых дверей, фасадных систем, витражей и панорамного остекления по всей Беларуси.",
  openGraph: {
    title: "СтеклоСтройГрупп | Фасады, окна и остекление под ключ",
    description:
      "Производство и монтаж окон ПВХ, алюминиевых дверей, фасадных систем, витражей и панорамного остекления по всей Беларуси.",
    type: "website",
    locale: "ru_BY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
