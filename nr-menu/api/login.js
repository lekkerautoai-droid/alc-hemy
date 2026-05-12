import { authCookie } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method not allowed' });
  }

  const expected = process.env.ADMIN_PASSCODE;
  if (!expected) return res.status(500).json({ error: 'admin passcode not configured' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  if (!body || typeof body !== 'object') {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    try { body = JSON.parse(raw || '{}'); } catch { body = {}; }
  }

  const passcode = String(body?.passcode || '');
  if (passcode !== expected) {
    // Constant-ish delay to slow brute force a little (best-effort; serverless cold start dominates anyway)
    await new Promise(r => setTimeout(r, 400));
    return res.status(401).json({ error: 'wrong passcode' });
  }

  res.setHeader('Set-Cookie', authCookie(true));
  return res.status(200).json({ ok: true });
}
