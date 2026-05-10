"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { addBlocked, removeBlocked } from "./actions";

interface Blocked {
  id: string;
  date: string;
  reason: string | null;
}

export function BlockedDatesEditor({ dates }: { dates: Blocked[] }) {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onAdd = () => {
    if (!date) return;
    startTransition(async () => {
      const result = await addBlocked(date, reason || null);
      if (result.ok) {
        setDate("");
        setReason("");
        router.refresh();
        toast({ title: "Date blocked", description: "Clients won't be able to book on this day." });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    });
  };

  const onRemove = (id: string) =>
    startTransition(async () => {
      await removeBlocked(id);
      router.refresh();
    });

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
            <div className="sm:col-span-3">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
            </div>
            <div className="sm:col-span-7">
              <Label>Reason (optional)</Label>
              <Input
                value={reason}
                placeholder="e.g. School exam, family weekend"
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="flex items-end sm:col-span-2">
              <Button onClick={onAdd} disabled={pending || !date} className="w-full">
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Block</>}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {dates.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <div className="mb-2 text-3xl">🌷</div>
            No blocked dates. Add one above when you need a day off.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {dates.map((d) => (
            <Card key={d.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="font-semibold">
                    {new Date(d.date).toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  {d.reason && <div className="text-sm text-muted-foreground">{d.reason}</div>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => onRemove(d.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
