import { prisma } from "@/lib/prisma";
import { galleryPhotos as fallbackPhotos } from "@/lib/gallery-photos";
import type { GalleryItem } from "@/components/ui/circular-gallery";

/**
 * Fetch published gallery photos. Falls back to the static placeholder set
 * when the DB is empty (so the section never looks broken).
 */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const rows = await prisma.photo.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    if (rows.length === 0) return fallbackPhotos;
    return rows.map((r) => ({
      caption: r.caption,
      subCaption: r.subCaption ?? undefined,
      photo: {
        url: r.url,
        alt: r.alt ?? r.caption,
        by: "Anabel",
      },
    }));
  } catch (err) {
    console.warn("[gallery] DB read failed, using fallback:", err);
    return fallbackPhotos;
  }
}
