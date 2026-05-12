import { loadMenu, saveMenu } from './_lib/store.js';
import { requireAuth } from './_lib/auth.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { data } = await loadMenu();
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=0, must-revalidate');
      return res.status(200).json(data);
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      if (!requireAuth(req, res)) return;
      const body = await readJson(req);
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({ error: 'expected JSON object' });
      }
      // Minimal shape check; admin is the only writer so we trust the editor's structure
      if (!body.brand || !body.flower) {
        return res.status(400).json({ error: 'missing brand or flower fields' });
      }
      await saveMenu(body);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'method not allowed' });
  } catch (err) {
    console.error('menu handler error', err);
    return res.status(500).json({ error: 'internal error', message: String(err?.message || err) });
  }
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
