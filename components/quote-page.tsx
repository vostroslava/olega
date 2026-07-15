import type { CSSProperties } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { QuoteWizard } from "@/components/ui/quote-wizard";
import { RevealInit } from "@/components/ui/reveal-init";
import { assetPath } from "@/lib/site-utils";

export function QuotePage() {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main
        className="quote-page-main"
        style={{ "--quote-page-scene": `url("${assetPath("/assets/photos/project-arbat.png")}")` } as CSSProperties}
      >
        <div className="container quote-page-grid">
          <div className="quote-page-intro reveal is-visible">
            <p className="optical-label">РАСЧЁТ ПРОЕКТА</p>
            <h1>Рассчитаем<br />ваш проект</h1>
            <p>Четыре коротких шага помогут собрать исходные данные из идеи, фото или чертежа для инженера.</p>
            <ul><li>Без автоматической «цены с потолка»</li><li>Файл увидит только команда проекта</li><li>Инженер проверит результат перед ответом</li></ul>
          </div>
          <QuoteWizard />
        </div>
      </main>
      <SiteFooter />
      <RevealInit />
    </div>
  );
}
