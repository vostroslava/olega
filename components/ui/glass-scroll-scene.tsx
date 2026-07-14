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
      <div className="glass-scroll-scene-shade" />
      <div className="glass-scroll-scene-pane" />
      <div className="glass-scroll-scene-rule glass-scroll-scene-rule-top" />
      <div className="glass-scroll-scene-rule glass-scroll-scene-rule-side" />
      <span className="glass-scroll-scene-spec glass-scroll-scene-spec-top">РЕАЛЬНЫЙ ОБЪЕКТ · МОГИЛЁВ</span>
      <span className="glass-scroll-scene-spec glass-scroll-scene-spec-bottom">ФАСАД / ВИТРАЖИ / СВЕТ</span>
    </div>
  );
}
