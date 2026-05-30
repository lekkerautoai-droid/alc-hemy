"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/auth";

interface RuleInput {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotInterval: number;
  active: boolean;
}

export async function saveRules(rules: RuleInput[]) {
  if (!(await isAdminAuthed())) return { ok: false, error: "Unauthorized" };

  for (const r of rules) {
    if (r.dayOfWeek < 0 || r.dayOfWeek > 6) return { ok: false, error: "Invalid day" };
    if (!/^\d{2}:\d{2}$/.test(r.startTime) || !/^\d{2}:\d{2}$/.test(r.endTime)) return { ok: false, error: "Invalid time" };
    if (r.startTime >= r.endTime) return { ok: false, error: "Start must be before end" };
    if (r.slotInterval < 15 || r.slotInterval > 240) return { ok: false, error: "Slot length out of range" };
  }

  const existing = await prisma.availabilityRule.findMany();
  const keepIds = new Set(rules.filter((r) => !r.id.startsWith("new-")).map((r) => r.id));
  const toDelete = existing.filter((e) => !keepIds.has(e.id)).map((e) => e.id);

  await prisma.$transaction([
    ...(toDelete.length ? [prisma.availabilityRule.deleteMany({ where: { id: { in: toDelete } } })] : []),
    ...rules.map((r) =>
      r.id.startsWith("new-")
        ? prisma.availabilityRule.create({
            data: {
              dayOfWeek: r.dayOfWeek,
              startTime: r.startTime,
              endTime: r.endTime,
              slotInterval: r.slotInterval,
              active: r.active,
            },
          })
        : prisma.availabilityRule.update({
            where: { id: r.id },
            data: {
              dayOfWeek: r.dayOfWeek,
              startTime: r.startTime,
              endTime: r.endTime,
              slotInterval: r.slotInterval,
              active: r.active,
            },
          }),
    ),
  ]);

  revalidatePath("/admin/availability");
  revalidatePath("/book");
  return { ok: true };
}
