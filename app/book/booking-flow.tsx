"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ServiceStep } from "./steps/service-step";
import { DateStep } from "./steps/date-step";
import { TimeStep } from "./steps/time-step";
import { DetailsStep } from "./steps/details-step";
import { ConfirmationStep } from "./steps/confirmation-step";
import { ProgressBar } from "./progress-bar";

export interface ServiceLite {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  emoji: string;
}

export interface BookingDraft {
  service?: ServiceLite;
  date?: string;       // yyyy-MM-dd
  startTime?: string;  // HH:mm
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  address?: string;
  petDetails?: string;
  notes?: string;
}

const steps = ["Service", "Date", "Time", "Details", "Done"] as const;

export function BookingFlow({ services }: { services: ServiceLite[] }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<BookingDraft>({});
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  const update = (patch: Partial<BookingDraft>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="space-y-8">
      <header className="text-center">
        <div className="mb-3 text-3xl">🐾</div>
        <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
          Book a sitting
        </h1>
        <p className="mt-2 text-white/65">
          {step < 4 ? `Step ${step + 1} of ${steps.length - 1}` : "All done!"}
        </p>
      </header>

      <ProgressBar steps={[...steps]} current={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {step === 0 && (
            <ServiceStep
              services={services}
              selectedId={draft.service?.id}
              onSelect={(s) => {
                update({ service: s });
                setStep(1);
              }}
            />
          )}
          {step === 1 && draft.service && (
            <DateStep
              service={draft.service}
              selectedDate={draft.date}
              onBack={() => setStep(0)}
              onSelect={(date) => {
                update({ date, startTime: undefined });
                setStep(2);
              }}
            />
          )}
          {step === 2 && draft.service && draft.date && (
            <TimeStep
              service={draft.service}
              date={draft.date}
              selectedTime={draft.startTime}
              onBack={() => setStep(1)}
              onSelect={(startTime) => {
                update({ startTime });
                setStep(3);
              }}
            />
          )}
          {step === 3 && draft.service && draft.date && draft.startTime && (
            <DetailsStep
              draft={draft as Required<BookingDraft>}
              onBack={() => setStep(2)}
              onSubmitSuccess={(ref) => {
                setBookingRef(ref);
                setStep(4);
              }}
              onUpdate={update}
            />
          )}
          {step === 4 && bookingRef && draft.service && draft.date && draft.startTime && (
            <ConfirmationStep
              bookingRef={bookingRef}
              draft={draft as Required<BookingDraft>}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
