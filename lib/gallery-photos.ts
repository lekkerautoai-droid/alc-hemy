import type { GalleryItem } from "@/components/ui/circular-gallery";

/**
 * Bells & Paws photo gallery.
 *
 * To swap in real photos:
 *   1) Drop image files into /public/gallery/ (jpg, png, or webp)
 *   2) Update the URLs below to "/gallery/your-file.jpg"
 *   3) Commit + push — Vercel auto-deploys
 *
 * For higher quality, host on Vercel Blob or Cloudinary and paste the URL.
 *
 * The placeholders below are picked to roughly match Anabel's vibe:
 * forest walks, water-loving dogs, snuggly buddies.
 */
export const galleryPhotos: GalleryItem[] = [
  {
    caption: "Bridge crew",
    subCaption: "Forest stroll · 3 happy pups",
    photo: {
      url: "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=900&auto=format&fit=crop&q=80",
      alt: "Three dogs walking on a forest trail",
      pos: "50% 50%",
      by: "Anabel",
    },
  },
  {
    caption: "River dip",
    subCaption: "Best Friend gets her swim on",
    photo: {
      url: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=900&auto=format&fit=crop&q=80",
      alt: "Black dog in a forest stream",
      pos: "50% 50%",
      by: "Anabel",
    },
  },
  {
    caption: "Trail buddies",
    subCaption: "Rottie & Spot, mid-adventure",
    photo: {
      url: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=900&auto=format&fit=crop&q=80",
      alt: "Two dogs in greenery",
      pos: "50% 50%",
      by: "Anabel",
    },
  },
  {
    caption: "Tailgate squad",
    subCaption: "Pickup ride home",
    photo: {
      url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=900&auto=format&fit=crop&q=80",
      alt: "Two dogs in a pickup truck",
      pos: "50% 50%",
      by: "Anabel",
    },
  },
  {
    caption: "Cuddle puddle",
    subCaption: "Post-walk snuggles",
    photo: {
      url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=900&auto=format&fit=crop&q=80",
      alt: "Two dogs cuddling",
      pos: "50% 50%",
      by: "Anabel",
    },
  },
  {
    caption: "Sandy nose",
    subCaption: "Beach day at Clifton",
    photo: {
      url: "https://images.unsplash.com/photo-1530051539600-ce6c1bd99c83?w=900&auto=format&fit=crop&q=80",
      alt: "Black and white dog on a sandy beach",
      pos: "50% 50%",
      by: "Anabel",
    },
  },
];
