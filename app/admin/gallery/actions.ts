"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/auth";

export async function deletePhoto(id: string) {
  if (!(await isAdminAuthed())) return { ok: false, error: "Unauthorized" };

  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) return { ok: false, error: "Photo not found" };

  if (photo.blobPath && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await del(photo.url);
    } catch (err) {
      console.warn("Blob delete failed (continuing):", err);
    }
  }

  await prisma.photo.delete({ where: { id } });
  revalidatePath("/admin/gallery");
  revalidatePath("/");
  return { ok: true as const };
}

export async function updatePhotoOrder(id: string, sortOrder: number) {
  if (!(await isAdminAuthed())) return { ok: false };
  await prisma.photo.update({ where: { id }, data: { sortOrder } });
  revalidatePath("/admin/gallery");
  revalidatePath("/");
  return { ok: true as const };
}
