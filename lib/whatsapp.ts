export function whatsappLink(phone: string | undefined, message: string) {
  const number = (phone || "").replace(/\D/g, "");
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildBookingWhatsAppMessage(args: {
  ref: string;
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
}) {
  return `Hi ${process.env.NEXT_PUBLIC_SITTER_NAME || "Anabel"}! 🐾 I just booked ${args.serviceName} on ${args.date} at ${args.time}. Booking ref: ${args.ref}. — ${args.clientName}`;
}
