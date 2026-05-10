"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatZAR, formatDuration, cn } from "@/lib/utils";
import { Clock, ArrowRight } from "lucide-react";
import type { ServiceLite } from "../booking-flow";

interface Props {
  services: ServiceLite[];
  selectedId?: string;
  onSelect: (s: ServiceLite) => void;
}

export function ServiceStep({ services, selectedId, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold">What does your pet need today?</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {services.map((s) => {
          const selected = s.id === selectedId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s)}
              className={cn(
                "group text-left transition-all",
                "rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            >
              <Card
                className={cn(
                  "h-full transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blush-100",
                  selected && "ring-2 ring-blush-400"
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blush-100 to-lavender-100 text-3xl">
                      {s.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold leading-tight">{s.name}</h3>
                        <span className="shrink-0 text-base font-semibold text-blush-500">{formatZAR(s.price)}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" /> {formatDuration(s.duration)}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-blush-500 opacity-0 transition-opacity group-hover:opacity-100">
                          Choose <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
