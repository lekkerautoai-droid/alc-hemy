"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { addDays, format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import type { ServiceLite } from "../booking-flow";

interface Props {
  service: ServiceLite;
  selectedDate?: string;
  onBack: () => void;
  onSelect: (date: string) => void;
}

export function DateStep({ service, selectedDate, onBack, onSelect }: Props) {
  const [map, setMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/availability?serviceId=${service.id}&days=21`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setMap(data.map || {});
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [service.id]);

  const today = new Date();
  const days = Array.from({ length: 21 }, (_, i) => addDays(today, i));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-blush-500">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{service.emoji} {service.name}</span>
        </div>
      </div>

      <Card>
        <CardContent className="p-5 sm:p-6">
          <h2 className="font-display text-2xl font-semibold">Pick a day</h2>
          <p className="mt-1 text-sm text-muted-foreground">Available days are highlighted. Bookings open 21 days in advance.</p>

          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-7">
              {days.map((d) => {
                const iso = format(d, "yyyy-MM-dd");
                const available = map[iso] ?? false;
                const selected = selectedDate === iso;
                const todayFlag = isSameDay(d, today);
                return (
                  <button
                    key={iso}
                    disabled={!available}
                    onClick={() => onSelect(iso)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 rounded-2xl border-2 px-2 py-3 text-center transition-all",
                      available
                        ? "border-blush-100 bg-white hover:-translate-y-0.5 hover:border-blush-300 hover:shadow-md"
                        : "cursor-not-allowed border-transparent bg-muted/40 opacity-50",
                      selected && "border-blush-500 bg-blush-50 shadow-md"
                    )}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {format(d, "EEE")}
                    </span>
                    <span className={cn("font-display text-2xl font-semibold", selected && "text-blush-500")}>
                      {format(d, "d")}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{format(d, "MMM")}</span>
                    {todayFlag && <span className="mt-0.5 text-[9px] font-bold text-sage-500">TODAY</span>}
                  </button>
                );
              })}
            </div>
          )}

          {!loading && Object.values(map).every((v) => !v) && (
            <p className="mt-6 rounded-2xl bg-cream-100 p-4 text-center text-sm text-amber-800">
              No availability in the next 3 weeks. Please check back soon!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
