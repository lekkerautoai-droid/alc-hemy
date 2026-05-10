import Link from "next/link";
import nextDynamic from "next/dynamic";
import { prisma } from "@/lib/prisma";
import { BookingFlow } from "./booking-flow";

const ParticleAnimation = nextDynamic(
  () => import("@/components/ui/particle-animation").then((m) => m.ParticleAnimation),
  { ssr: false },
);

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0717] text-white">
      {/* Multi-color glow blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,61,154,0.22),transparent_60%)] blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-[32rem] w-[32rem] translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(76,201,240,0.22),transparent_60%)] blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 translate-y-1/4 rounded-full bg-[radial-gradient(circle,rgba(255,209,102,0.18),transparent_60%)] blur-3xl" />
      </div>

      {/* Particle ring as ambient background */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-60">
        <ParticleAnimation amount={1400} />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/65 transition-colors hover:text-white"
        >
          ← Back home
        </Link>
        <BookingFlow services={services} />
      </div>
    </main>
  );
}
