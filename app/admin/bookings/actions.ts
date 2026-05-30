"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/auth";

const ALLOWED = new Set(["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]);

export async function updateBookingStatus(id: string, status: string) {
  if (!(await isAdminAuthed())) return { ok: false };
  if (!ALLOWED.has(status)) return { ok: false, error: "Invalid status" };
  await prisma.booking.update({ where: { id }, data: { status } });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { ok: true };
}
