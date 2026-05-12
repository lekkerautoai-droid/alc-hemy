import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE = 'nr_admin';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET not set');
  return s;
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function b64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64');
}

export function sign(payload) {
  const body = b64url(JSON.stringify(payload));
  const sig = b64url(createHmac('sha256', secret()).update(body).digest());
  return `${body}.${sig}`;
}

export function verify(token) {
  if (!token || typeof token !== 'string') return null;
  const dot = token.indexOf('.');
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const sigStr = token.slice(dot + 1);
  const expected = createHmac('sha256', secret()).update(body).digest();
  const got = b64urlDecode(sigStr);
  if (got.length !== expected.length) return null;
  if (!timingSafeEqual(got, expected)) return null;
  try {
    const payload = JSON.parse(b64urlDecode(body).toString('utf8'));
    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(/;\s*/)) {
    if (!part) continue;
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    out[part.slice(0, eq).trim()] = decodeURIComponent(part.slice(eq + 1));
  }
  return out;
}

export function isAuthed(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const payload = verify(cookies[COOKIE]);
  return !!payload;
}

export function authCookie(secure = true) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const token = sign({ sub: 'admin', exp });
  return [
    `${COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    secure ? 'Secure' : null,
    `Max-Age=${MAX_AGE_SECONDS}`,
  ].filter(Boolean).join('; ');
}

export function clearCookie(secure = true) {
  return [
    `${COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    secure ? 'Secure' : null,
    'Max-Age=0',
  ].filter(Boolean).join('; ');
}

export function requireAuth(req, res) {
  if (!isAuthed(req)) {
    res.status(401).json({ error: 'unauthorized' });
    return false;
  }
  return true;
}
