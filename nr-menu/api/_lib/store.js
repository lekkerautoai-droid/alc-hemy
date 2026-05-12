import { put, list } from '@vercel/blob';
import { SEED } from './seed.js';

const MENU_KEY = 'menu.json';

async function fetchCurrentMenuUrl() {
  const { blobs } = await list({ prefix: MENU_KEY, limit: 1000 });
  if (!blobs.length) return null;
  // Vercel Blob may append a random suffix to filenames when addRandomSuffix is true.
  // We always write with addRandomSuffix=false, so the canonical pathname is exactly MENU_KEY.
  const exact = blobs.find(b => b.pathname === MENU_KEY);
  return exact?.url || blobs[0].url;
}

export async function loadMenu() {
  const url = await fetchCurrentMenuUrl();
  if (!url) return { data: SEED, seeded: true };
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return { data: SEED, seeded: true };
  const data = await res.json();
  return { data, seeded: false };
}

export async function saveMenu(data) {
  const json = JSON.stringify(data);
  const { url } = await put(MENU_KEY, json, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
  return url;
}
