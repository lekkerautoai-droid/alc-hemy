import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GalleryEditor } from "./gallery-editor";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  // Photo table may not exist yet on first run after deploy — handle gracefully
  let photos: Awaited<ReturnType<typeof prisma.photo.findMany>> = [];
  try {
    photos = await prisma.photo.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch (err) {
    console.warn("Photo table not ready yet:", err);
  }

  const blobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Gallery</h1>
        <p className="mt-1 text-muted-foreground">
          Photos shown in the landing page's spinning gallery.
        </p>
      </div>

      {!blobConfigured && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Vercel Blob not enabled yet.</strong> Open{" "}
          <a
            className="underline"
            href="https://vercel.com/lekkerautoai-6006s-projects/bells-and-paws/storage"
            target="_blank"
            rel="noreferrer"
          >
            the project's Storage tab
          </a>{" "}
          → Create Blob Store → accept defaults. Vercel will inject a
          <code className="mx-1 rounded bg-amber-100 px-1">BLOB_READ_WRITE_TOKEN</code>
          and redeploy. Then come back here and uploads will work.
        </div>
      )}

      <GalleryEditor photos={photos} canUpload={blobConfigured} />
    </div>
  );
}
