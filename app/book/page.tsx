import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookingFlow } from "./booking-flow";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <main className="min-h-screen px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-blush-500">
          ← Back home
        </Link>
        <BookingFlow services={services} />
      </div>
    </main>
  );
}
