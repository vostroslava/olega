import Image from "next/image";
import { assetPath } from "@/lib/site-utils";

export function GlassScrollScene() {
  return (
    <div className="glass-scroll-scene" id="glass-scene" aria-hidden="true">
      <div className="glass-scroll-scene-media">
        <Image
          src={assetPath("/assets/photos/project-avenue.png")}
          alt=""
          fill
          sizes="100vw"
        />
      </div>
      <svg className="glass-scroll-scene-blueprint" viewBox="0 0 1600 760" preserveAspectRatio="none" aria-hidden="true">
        <path className="glass-scroll-blueprint-path glass-scroll-blueprint-roof" d="M84 575 516 256 1034 346 1490 156" />
        <path className="glass-scroll-blueprint-path glass-scroll-blueprint-base" d="M84 575h1120l286-419M516 256v322m518-232v232M1204 575V334" />
        <path className="glass-scroll-blueprint-path glass-scroll-blueprint-grid" d="M260 446h944M388 351v225m258-385v385m270-326v326m190-367v367" />
      </svg>
      <div className="glass-scroll-scene-shade" />
      <div className="glass-scroll-scene-pane" />
      <div className="glass-scroll-scene-rule glass-scroll-scene-rule-top" />
      <div className="glass-scroll-scene-rule glass-scroll-scene-rule-side" />
      <span className="glass-scroll-scene-spec glass-scroll-scene-spec-top">РЕАЛЬНЫЙ ОБЪЕКТ · МОГИЛЁВ</span>
      <span className="glass-scroll-scene-spec glass-scroll-scene-spec-bottom">ФАСАД / ВИТРАЖИ / СВЕТ</span>
    </div>
  );
}
