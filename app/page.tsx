import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/hero";
import { GallerySection } from "@/components/gallery-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { galleryPhotos } from "@/lib/gallery-photos";
import { formatZAR, formatDuration } from "@/lib/utils";
import { Clock, Sparkles, MessageCircle, ArrowRight } from "lucide-react";

const AREA = process.env.NEXT_PUBLIC_SERVICE_AREA || "Cape Town CBD";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <main className="min-h-screen">
      <Hero area={AREA} />

      {/* SERVICES */}
      <section id="services" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-blush-400">Services</span>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Pick what your pet needs</h2>
            <p className="mt-4 text-muted-foreground">
              Instant booking — no back-and-forth. Pay on the day in cash or by EFT.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Card key={s.id} className="group transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-blush-100">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blush-100 to-lavender-100 text-3xl">
                    {s.emoji}
                  </div>
                  <h3 className="text-xl font-semibold">{s.name}</h3>
                  <p className="mt-2 min-h-[3rem] text-sm text-muted-foreground">{s.description}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" /> {formatDuration(s.duration)}
                    </div>
                    <div className="text-2xl font-semibold text-blush-500">{formatZAR(s.price)}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <Link href="/book">Start booking <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white/40 py-24 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-sage-500">How it works</span>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Booking takes 60 seconds</h2>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { n: "1", title: "Pick a service", body: "Walk, drop-in, or full-day sitting — choose what suits.", icon: <Sparkles className="h-5 w-5" /> },
              { n: "2", title: "Choose your time", body: "Live availability for the next 3 weeks.", icon: <Clock className="h-5 w-5" /> },
              { n: "3", title: "Get a confirmation", body: "I'll WhatsApp you to say hi & meet your pet.", icon: <MessageCircle className="h-5 w-5" /> },
            ].map((step) => (
              <div key={step.n} className="relative rounded-3xl border border-blush-100 bg-white p-6 shadow-sm">
                <div className="absolute -top-4 left-6 flex h-9 w-9 items-center justify-center rounded-full bg-blush-500 text-white shadow-md">
                  {step.icon}
                </div>
                <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-blush-400">Step {step.n}</div>
                <h3 className="mt-1 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY — circular 3D gallery */}
      <GallerySection items={galleryPhotos} />

      {/* TESTIMONIALS */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-lavender-500">Happy tails</span>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">What pet parents say</h2>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full bg-blush-100">
                      <Image src={t.img} alt={t.name} fill className="object-cover" sizes="48px" />
                    </div>
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.pet}</div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/80">"{t.quote}"</p>
                  <div className="mt-3 text-blush-400">★★★★★</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-blush-100 bg-white/60 py-10 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-lg">🐾</span>
            <span className="font-display font-semibold text-foreground">Bells & Paws</span>
            <span>· Made with love in {AREA}</span>
          </div>
          <div className="flex gap-4">
            <Link href="/book" className="hover:text-blush-500">Book</Link>
            <Link href="/admin" className="hover:text-blush-500">Admin</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

const TESTIMONIALS = [
  {
    name: "Lara M.",
    pet: "Mom of Biscuit (Frenchie)",
    quote: "Anabel is so reliable and Biscuit literally cries with happiness when she arrives. 10/10.",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces",
  },
  {
    name: "Thandi K.",
    pet: "Mom of Mochi (cat)",
    quote: "Honestly the easiest pet booking I've ever done. Felt so calm leaving Mochi for the weekend.",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=faces",
  },
  {
    name: "Jordan W.",
    pet: "Dad of Rex (lab)",
    quote: "Photos and updates the whole time. Rex got a longer walk than I'd give him on my best day!",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces",
  },
];
