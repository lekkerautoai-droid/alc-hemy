"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, ShieldCheck, Heart } from "lucide-react";

// p5.js needs window — load client-only
const ParticleAnimation = dynamic(
  () => import("@/components/ui/particle-animation").then((m) => m.ParticleAnimation),
  { ssr: false },
);

interface HeroProps {
  area: string;
}

export function Hero({ area }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#0a0717] text-white">
      {/* multi-color glow blobs behind the particles */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,61,154,0.25),transparent_60%)] blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-[36rem] w-[36rem] translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(76,201,240,0.25),transparent_60%)] blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 translate-y-1/3 rounded-full bg-[radial-gradient(circle,rgba(255,209,102,0.18),transparent_60%)] blur-3xl" />
      </div>

      {/* particle ring */}
      <div className="absolute inset-0 z-0">
        <ParticleAnimation />
      </div>

      {/* Hero content centered inside the ring */}
      <div className="relative z-10 mx-auto flex min-h-[100vh] max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-md">
          <span className="inline-block animate-paw-bounce">🐾</span>
          Now booking in {area}
        </div>

        <h1 className="font-display text-6xl font-semibold leading-[0.95] tracking-tight sm:text-8xl md:text-[9rem]">
          <span className="block bg-gradient-to-r from-[#ff3d9a] via-[#ffd166] to-[#4cc9f0] bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(255,61,154,0.35)]">
            Bells
          </span>
          <span className="my-1 block text-3xl font-light italic text-white/70 sm:text-4xl">&amp;</span>
          <span className="block bg-gradient-to-r from-[#06d6a0] via-[#b388ff] to-[#ff7a5c] bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(76,201,240,0.35)]">
            Paws
          </span>
        </h1>

        <div className="relative mt-8 flex flex-col items-center">
          {/* dark scrim so subtitle + CTAs read clearly through the particles */}
          <div className="pointer-events-none absolute inset-x-1/2 -inset-y-3 -translate-x-1/2 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(10,7,23,0.85)_30%,rgba(10,7,23,0.55)_60%,transparent_100%)] blur-md sm:-inset-x-12" aria-hidden />
          <p className="relative max-w-xl text-base font-medium text-white sm:text-lg [text-shadow:0_1px_8px_rgba(0,0,0,0.65)]">
            Cuddles, walks &amp; tail wags — on demand. Friendly pet sitting in{" "}
            <span className="font-semibold text-white">{area}</span>.
          </p>

          <div className="relative mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="group bg-white text-[#0a0717] shadow-[0_0_32px_rgba(255,255,255,0.45)] hover:bg-white/90">
              <Link href="/book">
                Book a sitting{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-black/30 text-white backdrop-blur-md hover:bg-black/40"
            >
              <Link href="#services">See services</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
          <TrustBadge icon={<MapPin className="h-4 w-4" />} label={`Local to ${area}`} />
          <TrustBadge icon={<ShieldCheck className="h-4 w-4" />} label="Reliable & responsible" />
          <TrustBadge icon={<Heart className="h-4 w-4" />} label="Treats your pet like family" />
        </div>
      </div>

      {/* fade-out into the cream sections below */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-32 bg-gradient-to-b from-transparent to-cream-50" />
    </section>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85 backdrop-blur-md">
      <span className="text-[#ff3d9a]">{icon}</span>
      {label}
    </div>
  );
}
