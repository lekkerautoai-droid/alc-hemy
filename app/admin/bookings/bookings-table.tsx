"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, MessageCircle, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { formatZAR, cn } from "@/lib/utils";
import { updateBookingStatus } from "./actions";

interface BookingItem {
  id: string;
  ref: string;
  date: Date;
  startTime: string;
  status: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  address: string;
  petDetails: string;
  notes: string | null;
  service: { name: string; emoji: string; price: number; duration: number };
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "sage" | "muted" | "outline" }> = {
  CONFIRMED: { label: "Confirmed", variant: "default" },
  COMPLETED: { label: "Completed", variant: "sage" },
  CANCELLED: { label: "Cancelled", variant: "muted" },
  NO_SHOW: { label: "No-show", variant: "outline" },
};

export function BookingsTable({
  bookings,
  initialFilter,
  initialStatus,
}: {
  bookings: BookingItem[];
  initialFilter: string;
  initialStatus?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const setParam = (key: string, value: string | null) => {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set(key, value);
    else sp.delete(key);
    router.push(`${pathname}?${sp.toString()}`);
  };

  const updateStatus = (id: string, status: string) => {
    startTransition(async () => {
      await updateBookingStatus(id, status);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <FilterBtn active={initialFilter === "upcoming"} onClick={() => setParam("filter", "upcoming")}>Upcoming</FilterBtn>
        <FilterBtn active={initialFilter === "past"} onClick={() => setParam("filter", "past")}>Past</FilterBtn>
        <FilterBtn active={initialFilter === "all"} onClick={() => setParam("filter", "all")}>All</FilterBtn>
        <div className="ml-auto flex flex-wrap gap-2">
          <FilterBtn active={!initialStatus} onClick={() => setParam("status", null)}>Any status</FilterBtn>
          {["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"].map((s) => (
            <FilterBtn key={s} active={initialStatus === s} onClick={() => setParam("status", s)}>
              {STATUS_LABELS[s].label}
            </FilterBtn>
          ))}
        </div>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <div className="mb-2 text-3xl">🌷</div>
            No bookings match these filters.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id} className={cn(pending && "opacity-60")}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blush-50 text-2xl">
                      {b.service.emoji}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{b.clientName}</span>
                        <Badge variant={STATUS_LABELS[b.status]?.variant || "muted"}>
                          {STATUS_LABELS[b.status]?.label || b.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">#{b.ref}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {b.service.name} ·{" "}
                        {b.date.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" })}{" "}
                        · {b.startTime}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <a href={`tel:${b.clientPhone}`} className="inline-flex items-center gap-1 hover:text-blush-500">
                          <Phone className="h-3 w-3" /> {b.clientPhone}
                        </a>
                        <a href={`mailto:${b.clientEmail}`} className="inline-flex items-center gap-1 hover:text-blush-500">
                          <Mail className="h-3 w-3" /> {b.clientEmail}
                        </a>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {b.address}
                        </span>
                      </div>
                      <div className="mt-2 text-sm">🐾 {b.petDetails}</div>
                      {b.notes && <div className="mt-1 text-sm italic text-muted-foreground">"{b.notes}"</div>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-lg font-semibold text-blush-500">{formatZAR(b.service.price)}</div>
                    {b.status === "CONFIRMED" && (
                      <div className="flex flex-wrap gap-1">
                        <Button size="sm" variant="secondary" onClick={() => updateStatus(b.id, "COMPLETED")}>
                          <CheckCircle2 className="h-3 w-3" /> Done
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => updateStatus(b.id, "NO_SHOW")}>
                          <AlertCircle className="h-3 w-3" /> No-show
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => updateStatus(b.id, "CANCELLED")}>
                          <XCircle className="h-3 w-3" /> Cancel
                        </Button>
                      </div>
                    )}
                    {b.status !== "CONFIRMED" && (
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(b.id, "CONFIRMED")}>
                        Re-open
                      </Button>
                    )}
                    <a
                      href={`https://wa.me/${b.clientPhone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-sage-500 hover:underline"
                    >
                      <MessageCircle className="h-3 w-3" /> Message client
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-blush-400 bg-blush-400 text-white"
          : "border-blush-100 bg-white text-foreground/70 hover:border-blush-300"
      )}
    >
      {children}
    </button>
  );
}
