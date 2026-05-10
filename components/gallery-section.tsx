"use client";

import dynamic from "next/dynamic";
import type { GalleryItem } from "@/components/ui/circular-gallery";

const CircularGallery = dynamic(
  () => import("@/components/ui/circular-gallery").then((m) => m.CircularGallery),
  { ssr: false },
);

interface GallerySectionProps {
  items: GalleryItem[];
}

export function GallerySection({ items }: GallerySectionProps) {
  return (
    <section
      id="gallery"
      className="relative w-full overflow-hidden bg-[#0a0717] text-white"
      style={{ height: "200vh" }}
    >
      {/* glow blobs to bridge from the cream sections above */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,61,154,0.22),transparent_60%)] blur-3xl" />
        <div className="absolute right-1/4 top-1/2 h-[32rem] w-[32rem] translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(76,201,240,0.22),transparent_60%)] blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,209,102,0.18),transparent_60%)] blur-3xl" />
      </div>

      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden">
        <div className="absolute top-12 z-20 px-6 text-center sm:top-20">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#ff3d9a]">
            Happy tails
          </span>
          <h2 className="mt-3 font-display text-4xl font-semibold sm:text-6xl">
            Pups I've{" "}
            <span className="bg-gradient-to-r from-[#ff3d9a] via-[#ffd166] to-[#4cc9f0] bg-clip-text text-transparent">
              loved
            </span>
          </h2>
          <p className="mt-3 text-sm text-white/60">Scroll to spin · the gallery turns as you go</p>
        </div>

        <div className="h-full w-full">
          <CircularGallery items={items} radius={460} autoRotateSpeed={0.04} />
        </div>

        <div className="absolute bottom-10 z-20 flex items-center gap-1 text-xs text-white/40">
          <span>← swipe / scroll →</span>
        </div>
      </div>
    </section>
  );
}
