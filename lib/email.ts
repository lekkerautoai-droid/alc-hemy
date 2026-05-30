import { Resend } from "resend";

let _resend: Resend | null = null;
function client() {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

interface BookingEmailProps {
  ref: string;
  serviceName: string;
  emoji: string;
  date: string;       // formatted long
  timeRange: string;
  price: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  address: string;
  petDetails: string;
  notes?: string | null;
}

const SITTER_NAME = process.env.NEXT_PUBLIC_SITTER_NAME || "Anabel";
const FROM = process.env.RESEND_FROM || "Bells & Paws <onboarding@resend.dev>";

export async function sendBookingEmails(b: BookingEmailProps) {
  const r = client();
  if (!r) {
    console.warn("[email] RESEND_API_KEY not set, skipping email");
    return;
  }

  const sitterTo = process.env.SITTER_EMAIL;

  const clientHtml = `
    <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1f1f2e;">
      <div style="text-align:center; font-size:48px; margin-bottom: 12px;">🐾</div>
      <h1 style="font-family: Georgia, serif; color:#f55c89; margin:0 0 8px;">Booking confirmed!</h1>
      <p style="font-size:16px; line-height:1.6; color:#52525b;">
        Hi ${b.clientName}, thanks for booking with Bells & Paws. Here are your details:
      </p>
      <div style="background:#fff5f7; border-radius:16px; padding:20px; margin:20px 0;">
        <p style="margin:4px 0;"><strong>Reference:</strong> ${b.ref}</p>
        <p style="margin:4px 0;"><strong>Service:</strong> ${b.emoji} ${b.serviceName}</p>
        <p style="margin:4px 0;"><strong>When:</strong> ${b.date}</p>
        <p style="margin:4px 0;"><strong>Time:</strong> ${b.timeRange}</p>
        <p style="margin:4px 0;"><strong>Price:</strong> R${b.price}</p>
      </div>
      <p style="line-height:1.6;">${SITTER_NAME} will send you a quick WhatsApp to confirm. Payment is on the day, in cash or by EFT.</p>
      <p style="font-size:14px; color:#71717a;">If anything changes, just reply to this email or message ${SITTER_NAME} directly.</p>
      <p style="font-size:13px; color:#a1a1aa; text-align:center; margin-top:32px;">Bells & Paws · Cape Town CBD 🌸</p>
    </div>
  `;

  const sitterHtml = `
    <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 560px; margin:0 auto; padding: 24px;">
      <h2 style="color:#f55c89;">🎉 New booking — ${b.ref}</h2>
      <table style="width:100%; border-collapse:collapse;">
        <tr><td style="padding:6px 0;"><strong>Service</strong></td><td>${b.emoji} ${b.serviceName} (R${b.price})</td></tr>
        <tr><td style="padding:6px 0;"><strong>When</strong></td><td>${b.date} · ${b.timeRange}</td></tr>
        <tr><td style="padding:6px 0;"><strong>Client</strong></td><td>${b.clientName}</td></tr>
        <tr><td style="padding:6px 0;"><strong>Phone</strong></td><td><a href="tel:${b.clientPhone}">${b.clientPhone}</a></td></tr>
        <tr><td style="padding:6px 0;"><strong>Email</strong></td><td>${b.clientEmail}</td></tr>
        <tr><td style="padding:6px 0;"><strong>Address</strong></td><td>${b.address}</td></tr>
        <tr><td style="padding:6px 0;"><strong>Pets</strong></td><td>${b.petDetails}</td></tr>
        ${b.notes ? `<tr><td style="padding:6px 0;"><strong>Notes</strong></td><td>${b.notes}</td></tr>` : ""}
      </table>
    </div>
  `;

  try {
    const tasks: Promise<unknown>[] = [
      r.emails.send({
        from: FROM,
        to: b.clientEmail,
        subject: `Booking confirmed — ${b.ref} · Bells & Paws`,
        html: clientHtml,
      }),
    ];
    if (sitterTo) {
      tasks.push(
        r.emails.send({
          from: FROM,
          to: sitterTo,
          subject: `New booking ${b.ref} — ${b.clientName}`,
          html: sitterHtml,
        }),
      );
    }
    await Promise.allSettled(tasks);
  } catch (err) {
    console.error("[email] failed", err);
  }
}
