"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/auth";
import { toDateOnly } from "@/lib/booking";

export async function addBlocked(isoDate: string, reason: string | null) {
  if (!(await isAdminAuthed())) return { ok: false, error: "Unauthorized" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return { ok: false, error: "Invalid date" };

  try {
    await prisma.blockedDate.upsert({
      where: { date: toDateOnly(isoDate) },
      update: { reason },
      create: { date: toDateOnly(isoDate), reason },
    });
  } catch (err) {
    return { ok: false, error: "Couldn't block date" };
  }
  revalidatePath("/admin/blocked");
  revalidatePath("/book");
  return { ok: true };
}

export async function removeBlocked(id: string) {
  if (!(await isAdminAuthed())) return { ok: false };
  await prisma.blockedDate.delete({ where: { id } });
  revalidatePath("/admin/blocked");
  revalidatePath("/book");
  return { ok: true };
}
