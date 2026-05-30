"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { saveRules } from "./actions";
import { toast } from "@/components/ui/toaster";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Rule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotInterval: number;
  active: boolean;
}

export function AvailabilityEditor({ rules: initialRules }: { rules: Rule[] }) {
  const [rules, setRules] = useState(initialRules);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const addRule = () =>
    setRules((r) => [
      ...r,
      {
        id: `new-${Date.now()}`,
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
        slotInterval: 30,
        active: true,
      },
    ]);

  const updateRule = (id: string, patch: Partial<Rule>) =>
    setRules((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const deleteRule = (id: string) => setRules((r) => r.filter((x) => x.id !== id));

  const onSave = () => {
    startTransition(async () => {
      const result = await saveRules(rules);
      if (result.ok) {
        toast({ title: "Saved", description: "Your weekly hours are updated." });
        router.refresh();
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          {rules.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No availability rules yet — add one below.</div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="grid grid-cols-2 items-end gap-3 rounded-2xl border border-blush-100 p-3 sm:grid-cols-5">
                  <div className="col-span-2 sm:col-span-1">
                    <Label>Day</Label>
                    <select
                      className="mt-1 h-11 w-full rounded-2xl border border-input bg-white px-3 text-sm"
                      value={rule.dayOfWeek}
                      onChange={(e) => updateRule(rule.id, { dayOfWeek: Number(e.target.value) })}
                    >
                      {DAYS.map((d, i) => (
                        <option key={i} value={i}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>From</Label>
                    <Input type="time" value={rule.startTime} onChange={(e) => updateRule(rule.id, { startTime: e.target.value })} />
                  </div>
                  <div>
                    <Label>To</Label>
                    <Input type="time" value={rule.endTime} onChange={(e) => updateRule(rule.id, { endTime: e.target.value })} />
                  </div>
                  <div>
                    <Label>Slot (min)</Label>
                    <Input
                      type="number"
                      min={15}
                      max={120}
                      step={15}
                      value={rule.slotInterval}
                      onChange={(e) => updateRule(rule.id, { slotInterval: Number(e.target.value) })}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-between gap-2">
            <Button variant="outline" onClick={addRule}>
              <Plus className="h-4 w-4" /> Add rule
            </Button>
            <Button onClick={onSave} disabled={pending}>
              {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
