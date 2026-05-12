import { put } from '@vercel/blob';
import { requireAuth } from './_lib/auth.js';

export const config = { api: { bodyParser: false } };

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method not allowed' });
  }
  if (!requireAuth(req, res)) return;

  const contentType = (req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  if (!ALLOWED.has(contentType)) {
    return res.status(400).json({ error: 'unsupported content type', got: contentType });
  }
  const declaredLen = Number(req.headers['content-length'] || 0);
  if (declaredLen && declaredLen > MAX_BYTES) {
    return res.status(413).json({ error: 'file too large', max: MAX_BYTES });
  }

  const rawName = String(req.headers['x-filename'] || 'upload');
  const safeName = rawName.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'upload';
  const ext = contentType.split('/')[1].replace('jpeg', 'jpg');
  const finalName = /\.(jpg|jpeg|png|webp|gif)$/i.test(safeName) ? safeName : `${safeName}.${ext}`;

  try {
    const chunks = [];
    let total = 0;
    for await (const chunk of req) {
      total += chunk.length;
      if (total > MAX_BYTES) {
        return res.status(413).json({ error: 'file too large', max: MAX_BYTES });
      }
      chunks.push(chunk);
    }
    const buf = Buffer.concat(chunks);
    const { url } = await put(`uploads/${Date.now()}-${finalName}`, buf, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
    });
    return res.status(200).json({ url });
  } catch (err) {
    console.error('upload error', err);
    return res.status(500).json({ error: 'upload failed', message: String(err?.message || err) });
  }
}
