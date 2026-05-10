"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { format, parse } from "date-fns";
import { isValidSAPhone, formatZAR, formatDuration } from "@/lib/utils";
import type { BookingDraft } from "../booking-flow";

const schema = z.object({
  clientName: z.string().min(2, "Please enter your name").max(80),
  clientPhone: z.string().refine(isValidSAPhone, "Use a SA mobile e.g. 082 123 4567"),
  clientEmail: z.string().email("Please enter a valid email"),
  address: z.string().min(5, "Where will I meet you?").max(200),
  petDetails: z.string().min(2, "Tell me about your pet").max(300),
  notes: z.string().max(800).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  draft: Required<BookingDraft>;
  onBack: () => void;
  onSubmitSuccess: (ref: string) => void;
  onUpdate: (patch: Partial<BookingDraft>) => void;
}

export function DetailsStep({ draft, onBack, onSubmitSuccess, onUpdate }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientName: draft.clientName || "",
      clientPhone: draft.clientPhone || "",
      clientEmail: draft.clientEmail || "",
      address: draft.address || "",
      petDetails: draft.petDetails || "",
      notes: draft.notes || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    onUpdate(values);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          serviceId: draft.service.id,
          date: draft.date,
          startTime: draft.startTime,
          ...values,
          notes: values.notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "Something went wrong. Please try again.");
        return;
      }
      onSubmitSuccess(data.ref);
    } catch (err) {
      setServerError("Network issue. Please try again.");
    }
  };

  const dateObj = parse(draft.date, "yyyy-MM-dd", new Date());

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-blush-500">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Booking summary */}
      <Card className="bg-blush-50/60">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="text-3xl">{draft.service.emoji}</div>
          <div className="flex-1">
            <div className="font-semibold">{draft.service.name}</div>
            <div className="text-sm text-muted-foreground">
              {format(dateObj, "EEE, d MMM")} · {draft.startTime} · {formatDuration(draft.service.duration)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-xl font-semibold text-blush-500">{formatZAR(draft.service.price)}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 sm:p-6">
          <h2 className="font-display text-2xl font-semibold">Your details</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We don't take payment now — pay on the day in cash or by EFT.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" onKeyDown={(e) => e.key === "Enter" && handleSubmit(onSubmit)()}>
            <div className="sm:col-span-2">
              <Label htmlFor="clientName">Your name</Label>
              <Input id="clientName" placeholder="Lara Mokoena" autoComplete="name" {...register("clientName")} />
              {errors.clientName && <p className="mt-1 text-xs text-destructive">{errors.clientName.message}</p>}
            </div>

            <div>
              <Label htmlFor="clientPhone">Mobile</Label>
              <Input id="clientPhone" inputMode="tel" placeholder="082 123 4567" autoComplete="tel" {...register("clientPhone")} />
              {errors.clientPhone && <p className="mt-1 text-xs text-destructive">{errors.clientPhone.message}</p>}
            </div>

            <div>
              <Label htmlFor="clientEmail">Email</Label>
              <Input id="clientEmail" type="email" placeholder="lara@example.com" autoComplete="email" {...register("clientEmail")} />
              {errors.clientEmail && <p className="mt-1 text-xs text-destructive">{errors.clientEmail.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="address">Address (where I'll meet you)</Label>
              <Input id="address" placeholder="12 Kloof St, Gardens, Cape Town" autoComplete="street-address" {...register("address")} />
              {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="petDetails">Tell me about your pet 🐾</Label>
              <Input id="petDetails" placeholder="Biscuit · French Bulldog · 3 yrs · super friendly" {...register("petDetails")} />
              {errors.petDetails && <p className="mt-1 text-xs text-destructive">{errors.petDetails.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="notes">Anything else? (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Allergies, key location, leash preferences, treats they love…"
                rows={3}
                {...register("notes")}
              />
            </div>
          </div>

          {serverError && (
            <div className="mt-4 rounded-2xl border border-destructive/30 bg-red-50 p-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button type="button" size="lg" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Booking…
                </>
              ) : (
                <>Confirm booking — {formatZAR(draft.service.price)}</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
