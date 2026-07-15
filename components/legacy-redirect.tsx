"use client";

import Link from "next/link";
import { useEffect } from "react";

export function LegacyRedirect({ destination }: { destination: string }) {
  useEffect(() => {
    window.location.replace(destination);
  }, [destination]);

  return (
    <main className="legacy-redirect-page">
      <p>Страница доступна по новому адресу.</p>
      <Link href={destination}>Перейти дальше</Link>
    </main>
  );
}
