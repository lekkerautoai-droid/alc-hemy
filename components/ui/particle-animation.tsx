"use client";

import { useEffect, useRef } from "react";

interface ParticleAnimationProps {
  /** Override the default fun multi-color palette. */
  colors?: string[];
  /** Particle count (auto-scales down on small screens). */
  amount?: number;
}

const DEFAULT_COLORS = [
  "#ff3d9a", // hot pink
  "#ff7a5c", // coral
  "#ffd166", // sunshine yellow
  "#06d6a0", // mint
  "#4cc9f0", // sky blue
  "#b388ff", // lavender
  "#ffffff", // white sparkle
  "#fef3e8", // cream
];

/**
 * Animated ring of particles that pulse and react to pointer position.
 * Uses p5.js for drawing and GSAP for the easing curves.
 */
export function ParticleAnimation({
  colors = DEFAULT_COLORS,
  amount,
}: ParticleAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sketchRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (typeof window === "undefined") return;
      const [{ default: p5 }, { gsap }] = await Promise.all([
        import("p5"),
        import("gsap"),
      ]);
      if (cancelled || !containerRef.current) return;

      const sketch = (p: any) => {
        const particles: Particle[] = [];
        const containerEl = containerRef.current as HTMLDivElement;
        const baseAmount =
          amount ??
          (window.innerWidth < 600 || window.innerHeight < 600 ? 1100 : 2200);
        const durationShrink = 7;
        const durationGrow = 7;
        const total = durationShrink + durationGrow;

        const proxy = { progress: 1, val: 0 };

        let progressTween: gsap.core.Tween;
        let interpolator: gsap.core.Timeline;

        class Particle {
          i: number;
          cos: number;
          sin: number;
          r: number;
          offset: number;
          color: string;

          constructor(i: number) {
            this.i = i;
            this.cos = p.cos(i * p.TWO_PI);
            this.sin = p.sin(i * p.TWO_PI);
            this.r = p.floor(p.random(2, 9));
            this.offset =
              p.pow(p.random(1, 2), 2.5) * p.random(-0.018, 0.018);
            this.color = p.random(colors);
          }

          draw() {
            interpolator.progress((proxy.progress + this.i) % 1);
            const r = p.width * (0.36 + proxy.val * this.offset);
            const x = this.cos * r + p.width / 2;
            const y = this.sin * r + p.height / 2;
            p.fill(this.color);
            p.circle(x, y, this.r);
          }
        }

        const sizeOf = () => {
          const w = containerEl.clientWidth;
          const h = containerEl.clientHeight;
          return Math.max(320, Math.min(w, h));
        };

        p.setup = () => {
          const size = sizeOf();
          const canvas = p.createCanvas(size, size);
          canvas.parent(containerEl);
          p.noStroke();
          if (navigator.userAgent.indexOf("Firefox") < 0) {
            p.blendMode(p.SCREEN);
          }

          progressTween = gsap.to(proxy, {
            progress: 0,
            ease: "none",
            duration: total,
            repeat: -1,
          });

          interpolator = gsap
            .timeline({ paused: true, reverse: true })
            .to(proxy, {
              val: 1,
              duration: durationShrink,
              ease: "elastic.in(1.5, 0.15)",
            })
            .to(proxy, {
              val: 0,
              duration: durationGrow,
              ease: "back.in(3)",
            });

          for (let i = 0; i < baseAmount; i++) {
            particles.push(new Particle(i / baseAmount));
          }
        };

        p.windowResized = () => {
          const size = sizeOf();
          p.resizeCanvas(size, size);
        };

        const onMove = (x: number, y: number) => {
          let mouseAngle = p.atan2(y - p.height / 2, x - p.width / 2);
          mouseAngle = mouseAngle < 0 ? mouseAngle + p.TWO_PI : mouseAngle;
          mouseAngle = p.abs(mouseAngle / p.TWO_PI) * total;
          progressTween.time(mouseAngle);
        };

        p.mouseMoved = () => onMove(p.mouseX, p.mouseY);
        p.touchMoved = () => {
          if (p.touches.length === 0) return;
          onMove(p.touches[0].x, p.touches[0].y);
        };

        p.draw = () => {
          p.clear();
          for (const particle of particles) particle.draw();
        };
      };

      sketchRef.current = new p5(sketch);
    })();

    return () => {
      cancelled = true;
      if (sketchRef.current) {
        sketchRef.current.remove();
        sketchRef.current = null;
      }
    };
  }, [colors, amount]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-auto absolute inset-0 flex items-center justify-center [&_canvas]:m-auto [&_canvas]:[touch-action:none] [&_canvas]:[filter:drop-shadow(0_0_12px_rgba(255,61,154,0.45))_drop-shadow(0_0_24px_rgba(76,201,240,0.35))]"
      aria-hidden
    />
  );
}
