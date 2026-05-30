"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

type ToastInput = { title?: string; description?: string; variant?: "default" | "destructive" };
type Toast = ToastInput & { id: number };

let listeners: ((t: Toast) => void)[] = [];
let nextId = 1;
export function toast(t: ToastInput) {
  const item: Toast = { id: nextId++, ...t };
  listeners.forEach((l) => l(item));
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    const listener = (t: Toast) => {
      setToasts((cur) => [...cur, t]);
      setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== t.id)), 4500);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <ToastPrimitives.Provider swipeDirection="right">
      {toasts.map((t) => (
        <ToastPrimitives.Root
          key={t.id}
          className={cn(
            "data-[state=open]:animate-fade-in pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-2xl border p-4 pr-8 shadow-lg",
            t.variant === "destructive"
              ? "border-destructive/30 bg-red-50 text-destructive"
              : "border-blush-100 bg-white text-foreground"
          )}
        >
          <div className="flex-1">
            {t.title ? <div className="text-sm font-semibold">{t.title}</div> : null}
            {t.description ? <div className="mt-1 text-sm opacity-90">{t.description}</div> : null}
          </div>
          <ToastPrimitives.Close className="absolute right-2 top-2 rounded-md p-1 opacity-60 hover:opacity-100">
            <X className="h-4 w-4" />
          </ToastPrimitives.Close>
        </ToastPrimitives.Root>
      ))}
      <ToastPrimitives.Viewport className="fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2 outline-none" />
    </ToastPrimitives.Provider>
  );
}
