import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatZAR(amount: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return hours === 1 ? "1 hour" : `${hours} hours`;
}

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function generateBookingRef() {
  let ref = "";
  for (let i = 0; i < 6; i++) {
    ref += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return ref;
}

/** Validate SA phone number — accepts 0XXXXXXXXX or +27XXXXXXXXX. */
export function isValidSAPhone(phone: string) {
  const stripped = phone.replace(/\s|-/g, "");
  return /^(\+?27|0)[6-8][0-9]{8}$/.test(stripped);
}

export function normalizeSAPhone(phone: string) {
  const stripped = phone.replace(/\s|-/g, "");
  if (stripped.startsWith("+27")) return stripped;
  if (stripped.startsWith("27")) return `+${stripped}`;
  if (stripped.startsWith("0")) return `+27${stripped.slice(1)}`;
  return stripped;
}
