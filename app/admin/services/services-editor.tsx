"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { saveServices } from "./actions";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  emoji: string;
  active: boolean;
  sortOrder: number;
}

export function ServicesEditor({ services: initial }: { services: Service[] }) {
  const [services, setServices] = useState(initial);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const update = (id: string, patch: Partial<Service>) =>
    setServices((all) => all.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const remove = (id: string) => setServices((all) => all.filter((s) => s.id !== id));

  const add = () =>
    setServices((all) => [
      ...all,
      {
        id: `new-${Date.now()}`,
        name: "New service",
        description: "Describe what's included.",
        duration: 30,
        price: 100,
        emoji: "🐾",
        active: true,
        sortOrder: all.length + 1,
      },
    ]);

  const onSave = () =>
    startTransition(async () => {
      const result = await saveServices(services);
      if (result.ok) {
        toast({ title: "Saved", description: "Service list updated." });
        router.refresh();
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    });

  return (
    <div className="space-y-3">
      {services.map((s) => (
        <Card key={s.id}>
          <CardContent className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-12">
            <div className="sm:col-span-1">
              <Label>Emoji</Label>
              <Input value={s.emoji} maxLength={4} onChange={(e) => update(s.id, { emoji: e.target.value })} />
            </div>
            <div className="sm:col-span-4">
              <Label>Name</Label>
              <Input value={s.name} onChange={(e) => update(s.id, { name: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Duration (min)</Label>
              <Input
                type="number"
                min={15}
                step={15}
                value={s.duration}
                onChange={(e) => update(s.id, { duration: Number(e.target.value) })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Price (R)</Label>
              <Input
                type="number"
                min={0}
                value={s.price}
                onChange={(e) => update(s.id, { price: Number(e.target.value) })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Order</Label>
              <Input
                type="number"
                value={s.sortOrder}
                onChange={(e) => update(s.id, { sortOrder: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-end justify-end sm:col-span-1">
              <Button variant="ghost" size="icon" onClick={() => remove(s.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="sm:col-span-12">
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={s.description}
                onChange={(e) => update(s.id, { description: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-12">
              <input
                id={`active-${s.id}`}
                type="checkbox"
                checked={s.active}
                onChange={(e) => update(s.id, { active: e.target.checked })}
                className="h-4 w-4 rounded accent-blush-400"
              />
              <Label htmlFor={`active-${s.id}`} className="cursor-pointer">Active (visible to clients)</Label>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-between">
        <Button variant="outline" onClick={add}>
          <Plus className="h-4 w-4" /> Add service
        </Button>
        <Button onClick={onSave} disabled={pending}>
          {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
