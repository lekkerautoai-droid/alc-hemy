"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { deletePhoto, updatePhotoOrder } from "./actions";

interface Photo {
  id: string;
  url: string;
  caption: string;
  subCaption: string | null;
  sortOrder: number;
  active: boolean;
}

export function GalleryEditor({
  photos: initialPhotos,
  canUpload,
}: {
  photos: Photo[];
  canUpload: boolean;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [subCaption, setSubCaption] = useState("");
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  const onUpload = async () => {
    const files = fileRef.current?.files;
    if (!files || files.length === 0) {
      toast({ title: "Pick a photo first", variant: "destructive" });
      return;
    }
    if (!caption.trim()) {
      toast({ title: "Add a caption", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", files[0]);
      fd.append("caption", caption.trim());
      fd.append("subCaption", subCaption.trim());
      const res = await fetch("/api/admin/gallery", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Upload failed", description: data.error, variant: "destructive" });
        return;
      }
      toast({ title: "Photo added", description: caption });
      setCaption("");
      setSubCaption("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const onDelete = (id: string) =>
    startTransition(async () => {
      const result = await deletePhoto(id);
      if (result.ok) {
        toast({ title: "Deleted" });
        router.refresh();
      } else {
        toast({ title: "Couldn't delete", description: result.error, variant: "destructive" });
      }
    });

  const onReorder = (id: string, sortOrder: number) =>
    startTransition(async () => {
      await updatePhotoOrder(id, sortOrder);
      router.refresh();
    });

  return (
    <div className="space-y-6">
      {/* Uploader */}
      <Card>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div className="sm:col-span-5">
              <Label>Photo (jpg/png/webp, ≤8 MB)</Label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  className="block w-full cursor-pointer rounded-2xl border border-input bg-white px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-blush-100 file:px-3 file:py-1 file:text-blush-500 file:font-semibold hover:file:bg-blush-200"
                />
              </div>
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="caption">Caption</Label>
              <Input
                id="caption"
                value={caption}
                placeholder="Bridge crew"
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="subCaption">Sub-caption (optional)</Label>
              <Input
                id="subCaption"
                value={subCaption}
                placeholder="Forest stroll · 3 happy pups"
                onChange={(e) => setSubCaption(e.target.value)}
              />
            </div>
            <div className="flex items-end sm:col-span-1">
              <Button onClick={onUpload} disabled={!canUpload || uploading} className="w-full">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo list */}
      {initialPhotos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
            <ImagePlus className="h-8 w-8 text-blush-400" />
            No photos uploaded yet. Add one above to get started.
            <p className="mt-2 text-xs text-muted-foreground/80">
              While the gallery is empty, the landing page falls back to the placeholder photos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {initialPhotos.map((p) => (
            <Card key={p.id} className={pending ? "opacity-60" : ""}>
              <CardContent className="p-3">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.caption} className="h-full w-full object-cover" />
                </div>
                <div className="mt-3">
                  <div className="truncate font-semibold">{p.caption}</div>
                  {p.subCaption && (
                    <div className="truncate text-xs text-muted-foreground">{p.subCaption}</div>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-muted-foreground">Order</span>
                    <input
                      type="number"
                      defaultValue={p.sortOrder}
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (v !== p.sortOrder) onReorder(p.id, v);
                      }}
                      className="h-7 w-14 rounded-lg border border-input bg-white px-2 text-center text-sm"
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(p.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
