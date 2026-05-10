"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/auth";

interface ServiceInput {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  emoji: string;
  active: boolean;
  sortOrder: number;
}

export async function saveServices(services: ServiceInput[]) {
  if (!(await isAdminAuthed())) return { ok: false, error: "Unauthorized" };

  for (const s of services) {
    if (!s.name.trim()) return { ok: false, error: "Each service needs a name" };
    if (s.duration < 1) return { ok: false, error: "Duration must be at least 1 min" };
    if (s.price < 0) return { ok: false, error: "Price can't be negative" };
  }

  const existing = await prisma.service.findMany({ select: { id: true } });
  const keepIds = new Set(services.filter((s) => !s.id.startsWith("new-")).map((s) => s.id));
  const toDelete = existing.filter((e) => !keepIds.has(e.id)).map((e) => e.id);

  // Don't delete services with bookings — just mark inactive
  if (toDelete.length) {
    const withBookings = await prisma.booking.findMany({
      where: { serviceId: { in: toDelete } },
      select: { serviceId: true },
    });
    const blockedIds = new Set(withBookings.map((b) => b.serviceId));
    const safeToDelete = toDelete.filter((id) => !blockedIds.has(id));
    const safeToDeactivate = toDelete.filter((id) => blockedIds.has(id));

    if (safeToDelete.length) {
      await prisma.service.deleteMany({ where: { id: { in: safeToDelete } } });
    }
    if (safeToDeactivate.length) {
      await prisma.service.updateMany({ where: { id: { in: safeToDeactivate } }, data: { active: false } });
    }
  }

  await prisma.$transaction(
    services.map((s) =>
      s.id.startsWith("new-")
        ? prisma.service.create({
            data: {
              name: s.name.trim(),
              description: s.description.trim(),
              duration: s.duration,
              price: s.price,
              emoji: s.emoji || "🐾",
              active: s.active,
              sortOrder: s.sortOrder,
            },
          })
        : prisma.service.update({
            where: { id: s.id },
            data: {
              name: s.name.trim(),
              description: s.description.trim(),
              duration: s.duration,
              price: s.price,
              emoji: s.emoji || "🐾",
              active: s.active,
              sortOrder: s.sortOrder,
            },
          }),
    ),
  );

  revalidatePath("/admin/services");
  revalidatePath("/");
  revalidatePath("/book");
  return { ok: true };
}
