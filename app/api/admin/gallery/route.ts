import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Vercel Blob not enabled — provision storage in the Vercel dashboard first." },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  const caption = (form.get("caption") as string | null)?.trim() || "";
  const subCaption = (form.get("subCaption") as string | null)?.trim() || null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (file.size === 0) return NextResponse.json({ error: "Empty file" }, { status: 400 });
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_BYTES / 1024 / 1024} MB)` },
      { status: 413 },
    );
  }
  if (file.type && !ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: `Unsupported type: ${file.type}` }, { status: 415 });
  }
  if (caption.length < 1) {
    return NextResponse.json({ error: "Caption required" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const key = `gallery/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  let blob: { url: string; pathname: string };
  try {
    blob = await put(key, file, { access: "public", contentType: file.type || undefined });
  } catch (err) {
    console.error("Blob upload failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }

  // Determine next sortOrder = current max + 1
  const last = await prisma.photo.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const sortOrder = (last?.sortOrder ?? 0) + 1;

  const photo = await prisma.photo.create({
    data: {
      url: blob.url,
      blobPath: blob.pathname,
      caption,
      subCaption,
      alt: caption,
      sortOrder,
      active: true,
    },
  });

  return NextResponse.json({ ok: true, photo });
}
