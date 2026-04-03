import type { Metadata } from "next";
import { ThankYouPage } from "@/components/thank-you-page";

export const metadata: Metadata = {
  title: "Заявка принята",
  description: "Подтверждение отправки заявки на сайте СтеклоСтройГрупп.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouRoutePage() {
  return <ThankYouPage />;
}
