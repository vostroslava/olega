"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { assetPath } from "@/lib/site-utils";

const FRAME_COUNT = 36;

type WindowAssemblySequenceProps = {
  rootId: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function WindowAssemblySequence({ rootId }: WindowAssemblySequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const isReducedMotionRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  const framePaths = useMemo(
    () =>
      Array.from({ length: FRAME_COUNT }, (_, index) =>
        assetPath(`/assets/motion/window-assembly/frame_${String(index + 1).padStart(3, "0")}.jpg`)
      ),
    []
  );

  function drawFrame(index: number) {
    const canvas = canvasRef.current;
    const image = imagesRef.current[index];

    if (!canvas || !image) {
      return;
    }

    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(Math.floor(bounds.width), 1);
    const height = Math.max(Math.floor(bounds.height), 1);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);

    const scale = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const offsetX = (canvas.width - drawWidth) / 2;
    const offsetY = (canvas.height - drawHeight) / 2;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  }

  useEffect(() => {
    let isCancelled = false;

    async function loadFrames() {
      isReducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const frames = await Promise.all(
        framePaths.map(
          (src) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const image = new window.Image();
              image.decoding = "async";
              image.src = src;
              image.onload = () => resolve(image);
              image.onerror = () => reject(new Error(`Failed to load frame: ${src}`));
            })
        )
      );

      if (isCancelled) {
        return;
      }

      imagesRef.current = frames;
      setIsReady(true);
      drawFrame(isReducedMotionRef.current ? FRAME_COUNT - 1 : 0);
    }

    loadFrames().catch(() => {
      if (!isCancelled) {
        setIsReady(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [framePaths]);

  useEffect(() => {
    if (!isReady || isReducedMotionRef.current) {
      return;
    }

    const root = document.getElementById(rootId);

    if (!root) {
      return;
    }

    let rafId = 0;
    let currentFrame = -1;

    const update = () => {
      const rect = root.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const startOffset = viewportHeight * 0.18;
      const travel = rect.height - viewportHeight * 0.72;
      const progress = travel <= 0 ? 0 : clamp((startOffset - rect.top) / travel, 0, 1);
      const nextFrame = Math.round(progress * (FRAME_COUNT - 1));

      if (nextFrame !== currentFrame) {
        currentFrame = nextFrame;
        drawFrame(nextFrame);
      } else {
        drawFrame(currentFrame < 0 ? 0 : currentFrame);
      }
    };

    const requestUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(update);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [isReady, rootId]);

  return (
    <div className={`assembly-stage-frame ${isReady ? "is-ready" : ""}`}>
      <Image
        className="assembly-stage-poster"
        src={assetPath("/assets/motion/window-assembly/poster.jpg")}
        alt="Послойная сборка оконной системы"
        fill
        priority={false}
        sizes="(max-width: 1180px) 100vw, 56vw"
      />
      <canvas
        ref={canvasRef}
        className="assembly-stage-canvas"
        aria-hidden="true"
      />
      <div className="assembly-stage-overlay">
        <span>Разложено по слоям</span>
        <span>Готовая система</span>
      </div>
    </div>
  );
}
