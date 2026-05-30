"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { format, parse } from "date-fns";
import { cn, isValidSAPhone, formatZAR, formatDuration } from "@/lib/utils";
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

const inputClass =
  "flex h-11 w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm text-white placeholder:text-white/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3d9a]/60 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50";

const textareaClass =
  "flex min-h-[80px] w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-white/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3d9a]/60 focus-visible:border-transparent";

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
    } catch {
      setServerError("Network issue. Please try again.");
    }
  };

  const dateObj = parse(draft.date, "yyyy-MM-dd", new Date());

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-white/65 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Booking summary */}
      <div className="flex items-center gap-4 rounded-3xl border border-white/15 bg-gradient-to-br from-[#ff3d9a]/15 via-[#b388ff]/10 to-[#4cc9f0]/15 p-4 backdrop-blur-xl">
        <div className="text-3xl">{draft.service.emoji}</div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-white">{draft.service.name}</div>
          <div className="text-sm text-white/65">
            {format(dateObj, "EEE, d MMM")} · {draft.startTime} · {formatDuration(draft.service.duration)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/55">Total</div>
          <div className="text-xl font-semibold text-[#ffd166]">{formatZAR(draft.service.price)}</div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl backdrop-blur-xl sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-white">Your details</h2>
        <p className="mt-1 text-sm text-white/65">
          We don't take payment now — pay on the day in cash or by EFT.
        </p>

        <div
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(onSubmit)()}
        >
          <Field className="sm:col-span-2" label="Your name" error={errors.clientName?.message}>
            <input id="clientName" autoComplete="name" placeholder="Lara Mokoena" className={inputClass} {...register("clientName")} />
          </Field>
          <Field label="Mobile" error={errors.clientPhone?.message}>
            <input id="clientPhone" inputMode="tel" autoComplete="tel" placeholder="082 123 4567" className={inputClass} {...register("clientPhone")} />
          </Field>
          <Field label="Email" error={errors.clientEmail?.message}>
            <input id="clientEmail" type="email" autoComplete="email" placeholder="lara@example.com" className={inputClass} {...register("clientEmail")} />
          </Field>
          <Field className="sm:col-span-2" label="Address (where I'll meet you)" error={errors.address?.message}>
            <input id="address" autoComplete="street-address" placeholder="12 Kloof St, Gardens" className={inputClass} {...register("address")} />
          </Field>
          <Field className="sm:col-span-2" label="Tell me about your pet 🐾" error={errors.petDetails?.message}>
            <input id="petDetails" placeholder="Biscuit · French Bulldog · 3 yrs · super friendly" className={inputClass} {...register("petDetails")} />
          </Field>
          <Field className="sm:col-span-2" label="Anything else? (optional)">
            <textarea
              id="notes"
              rows={3}
              placeholder="Allergies, key location, leash preferences, treats they love…"
              className={textareaClass}
              {...register("notes")}
            />
          </Field>
        </div>

        {serverError && (
          <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
            {serverError}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            size="lg"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-[#ff3d9a] via-[#ff7a5c] to-[#ffd166] text-white shadow-[0_12px_32px_-8px_rgba(255,61,154,0.6)] hover:opacity-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Booking…
              </>
            ) : (
              <>Confirm booking — {formatZAR(draft.service.price)}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-white/80">{label}</Label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
    </div>
  );
}
