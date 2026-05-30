"use client";

import React, { useState, useEffect, useRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface GalleryItem {
  /** Display caption (e.g. dog name). */
  caption: string;
  /** Sub-caption (e.g. breed / context). */
  subCaption?: string;
  photo: {
    url: string;
    alt: string;
    /** CSS object-position, e.g. "50% 35%". */
    pos?: string;
    by?: string;
  };
}

interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  /** How far each card sits from the center, in px. */
  radius?: number;
  /** Idle auto-rotation speed (deg per frame). */
  autoRotateSpeed?: number;
}

/**
 * 3D circular gallery. Auto-rotates while idle and reacts to page scroll
 * (when used inside a tall sticky container).
 */
export const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  ({ items, className, radius = 520, autoRotateSpeed = 0.05, ...props }, ref) => {
    const [rotation, setRotation] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Scroll-driven rotation: 0–360° as the section is in view
    useEffect(() => {
      const handleScroll = () => {
        const container = containerRef.current;
        if (!container) return;

        setIsScrolling(true);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

        // Find nearest scrollable parent (or window)
        const rect = container.getBoundingClientRect();
        const viewportH = window.innerHeight;
        // Progress from when the section enters → fully past
        const progress = Math.max(
          0,
          Math.min(1, (viewportH - rect.top) / (viewportH + rect.height)),
        );
        setRotation(progress * 360);

        scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 200);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
      return () => {
        window.removeEventListener("scroll", handleScroll);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      };
    }, []);

    // Idle auto-rotation
    useEffect(() => {
      const tick = () => {
        if (!isScrolling) {
          setRotation((prev) => prev + autoRotateSpeed);
        }
        animationFrameRef.current = requestAnimationFrame(tick);
      };
      animationFrameRef.current = requestAnimationFrame(tick);
      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
    }, [isScrolling, autoRotateSpeed]);

    const anglePerItem = 360 / Math.max(items.length, 1);

    return (
      <div
        ref={ref}
        role="region"
        aria-label="Photo gallery"
        className={cn(
          "relative flex h-full w-full items-center justify-center",
          className,
        )}
        style={{ perspective: "1800px" }}
        {...props}
      >
        <div
          ref={containerRef}
          className="relative h-full w-full"
          style={{
            transform: `rotateY(${rotation}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {items.map((item, i) => {
            const itemAngle = i * anglePerItem;
            const totalRotation = rotation % 360;
            const relativeAngle = (itemAngle + totalRotation + 360) % 360;
            const normalized = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);
            // Front-most card is fully opaque, back side dims
            const opacity = Math.max(0.25, 1 - normalized / 180);

            return (
              <div
                key={`${item.photo.url}-${i}`}
                role="group"
                aria-label={item.caption}
                className="absolute h-[360px] w-[260px] sm:h-[420px] sm:w-[300px]"
                style={{
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                  left: "50%",
                  top: "50%",
                  marginLeft: "-130px",
                  marginTop: "-180px",
                  opacity,
                  transition: "opacity 0.3s linear",
                }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.05] shadow-[0_20px_60px_-20px_rgba(255,61,154,0.45)] backdrop-blur-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.photo.url}
                    alt={item.photo.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: item.photo.pos || "center" }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 text-white">
                    <h3 className="font-display text-xl font-semibold leading-tight">
                      {item.caption}
                    </h3>
                    {item.subCaption && (
                      <p className="mt-1 text-sm text-white/75">{item.subCaption}</p>
                    )}
                    {item.photo.by && (
                      <p className="mt-2 text-[10px] uppercase tracking-widest text-white/45">
                        📷 {item.photo.by}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
CircularGallery.displayName = "CircularGallery";
