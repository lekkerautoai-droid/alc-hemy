// NR Botanicals Admin — single-page editor.
// Loads /api/menu, edits in memory, saves whole JSON back via PUT /api/menu.
// Photo uploads go to POST /api/upload (Vercel Blob) and we store the returned URL.

const { useState, useEffect, useRef, useCallback, useMemo } = React;

const ITEMS_KEY = { flower: 'strains', concentrates: 'items', edibles: 'items', mushrooms: 'items' };
const SECTION_LABELS = {
  brand: 'Brand',
  flower: 'Flower',
  concentrates: 'Concentrates',
  edibles: 'Wellness',
  mushrooms: 'Mushrooms',
};
const SECTION_ORDER = ['brand', 'flower', 'concentrates', 'edibles', 'mushrooms'];

const defaultStrain = () => ({ name: '', type: '', thc: '', terps: [], effect: '', price: '', unit: '/g' });
const defaultItem   = () => ({ name: '', price: '', desc: '' });
const defaultCategory = (section) => section === 'flower'
  ? { category: 'New category', sub: '', strains: [] }
  : section === 'mushrooms'
    ? { category: 'New category', sub: '', items: [], footnote: '' }
    : { category: 'New category', sub: '', items: [] };

async function apiJson(method, url, body) {
  const opts = { method, credentials: 'same-origin', headers: {} };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  let payload = null;
  try { payload = await res.json(); } catch {}
  if (!res.ok) {
    const err = new Error(payload?.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return payload;
}

function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

// ---------- root ---------- //

function NRAdmin() {
  const [authed, setAuthed] = useState(null);
  const [menu, setMenu] = useState(null);
  const [saved, setSaved] = useState(null);
  const [tab, setTab] = useState('brand');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Initial auth check + menu load
  useEffect(() => {
    (async () => {
      try {
        const { authed: a } = await apiJson('GET', '/api/auth');
        setAuthed(a);
        if (a) await loadMenu();
      } catch {
        setAuthed(false);
      }
    })();
  }, []);

  async function loadMenu() {
    const data = await apiJson('GET', '/api/menu');
    setMenu(data);
    setSaved(deepClone(data));
  }

  async function onLogin(passcode) {
    await apiJson('POST', '/api/login', { passcode });
    setAuthed(true);
    await loadMenu();
  }

  async function onLogout() {
    try { await apiJson('POST', '/api/logout'); } catch {}
    setAuthed(false);
    setMenu(null);
    setSaved(null);
  }

  async function onSave() {
    if (!menu) return;
    setSaving(true);
    try {
      await apiJson('PUT', '/api/menu', menu);
      setSaved(deepClone(menu));
      flashToast('Saved · live now', 'ok');
    } catch (e) {
      flashToast(`Save failed: ${e.message}`, 'err');
    } finally {
      setSaving(false);
    }
  }

  function flashToast(text, kind = 'ok') {
    setToast({ text, kind });
    setTimeout(() => setToast(t => (t && t.text === text ? null : t)), 2400);
  }

  const dirty = useMemo(() => menu && saved && JSON.stringify(menu) !== JSON.stringify(saved), [menu, saved]);

  if (authed === null) {
    return <FullScreen><Spinner /></FullScreen>;
  }
  if (!authed) {
    return <Login onLogin={onLogin} />;
  }
  if (!menu) {
    return <FullScreen><Spinner /></FullScreen>;
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Header dirty={dirty} saving={saving} onSave={onSave} onLogout={onLogout} />
      <Tabs tab={tab} setTab={setTab} />
      <main style={{ flex: 1, padding: '20px 16px 120px', maxWidth: 760, width: '100%', margin: '0 auto' }}>
        {tab === 'brand' && <BrandEditor menu={menu} setMenu={setMenu} onUploaded={flashToast} />}
        {tab !== 'brand' && (
          <SectionEditor
            section={tab}
            menu={menu}
            setMenu={setMenu}
            onUploaded={flashToast}
          />
        )}
      </main>
      <SaveBar dirty={dirty} saving={saving} onSave={onSave} />
      {toast && (
        <div style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          background: toast.kind === 'err' ? 'var(--danger)' : 'var(--ok)',
          color: 'var(--ink)', padding: '10px 18px', borderRadius: 4,
          fontSize: 13, fontWeight: 600, zIndex: 50,
          boxShadow: '0 6px 24px rgba(0,0,0,0.4)',
        }}>{toast.text}</div>
      )}
    </div>
  );
}

window.NRAdmin = NRAdmin;

// ---------- shells ---------- //

function FullScreen({ children }) {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)',
    }}>{children}</div>
  );
}
function Spinner() {
  return (
    <div style={{ width: 28, height: 28, border: '2px solid var(--rule2)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 700ms linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Login({ onLogin }) {
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try { await onLogin(pass); }
    catch (ex) { setErr(ex.status === 401 ? 'Wrong passcode' : ex.message); }
    finally { setBusy(false); }
  }

  return (
    <FullScreen>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 360, padding: '0 20px' }}>
        <div style={{
          fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 38, lineHeight: 1, color: 'var(--cream)',
          textAlign: 'center', marginBottom: 6,
        }}>NR Botanicals</div>
        <div style={{
          fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--gold)',
          textAlign: 'center', marginBottom: 36,
        }}>Admin</div>
        <label htmlFor="passcode">Passcode</label>
        <input id="passcode" type="password" autoComplete="current-password"
          autoFocus value={pass} onChange={e => setPass(e.target.value)} />
        {err && <div style={{ marginTop: 12, color: 'var(--danger)', fontSize: 13 }}>{err}</div>}
        <button className="btn btn-primary" type="submit" disabled={busy || !pass}
          style={{ width: '100%', marginTop: 18 }}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </FullScreen>
  );
}

function Header({ dirty, saving, onSave, onLogout }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: 'var(--ink)', borderBottom: '1px solid var(--rule)',
      padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--cream)' }}>
        NR Botanicals
      </div>
      <div style={{
        fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--gold)',
      }}>Admin</div>
      <div style={{ flex: 1 }} />
      {dirty && <span style={{ fontSize: 11, color: 'var(--cream2)', letterSpacing: '0.08em' }}>Unsaved</span>}
      <a href="/" target="_blank" rel="noopener" className="btn btn-ghost" style={{ fontSize: 12 }} title="Open menu">View →</a>
      <button onClick={onLogout} className="btn btn-ghost" style={{ fontSize: 12 }}>Sign out</button>
    </header>
  );
}

function Tabs({ tab, setTab }) {
  return (
    <nav style={{
      position: 'sticky', top: 60, zIndex: 20,
      background: 'var(--ink)', borderBottom: '1px solid var(--rule)',
      display: 'flex', overflowX: 'auto', WebkitOverflowScrolling: 'touch',
    }}>
      {SECTION_ORDER.map(s => {
        const active = tab === s;
        return (
          <button key={s} onClick={() => setTab(s)}
            style={{
              flex: '0 0 auto', padding: '14px 18px', background: 'transparent', border: 'none',
              borderBottom: '2px solid ' + (active ? 'var(--gold)' : 'transparent'),
              color: active ? 'var(--gold)' : 'var(--cream2)',
              fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 500,
              cursor: 'pointer',
            }}>{SECTION_LABELS[s]}</button>
        );
      })}
    </nav>
  );
}

function SaveBar({ dirty, saving, onSave }) {
  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40,
      background: 'linear-gradient(to top, var(--ink) 70%, rgba(13,15,12,0))',
      padding: '14px 16px 18px',
      display: 'flex', justifyContent: 'center', pointerEvents: 'none',
    }}>
      <div style={{ width: '100%', maxWidth: 760, display: 'flex', gap: 10, pointerEvents: 'auto' }}>
        <div style={{ flex: 1, alignSelf: 'center', fontSize: 12, color: 'var(--cream2)' }}>
          {dirty ? 'You have unsaved changes' : 'All changes saved'}
        </div>
        <button onClick={onSave} disabled={!dirty || saving}
          className="btn btn-primary" style={{ minWidth: 140 }}>
          {saving ? 'Saving…' : dirty ? 'Save & publish' : 'Saved'}
        </button>
      </div>
    </div>
  );
}

// ---------- editors ---------- //

function Card({ children, depth = 0 }) {
  const bg = depth === 0 ? 'var(--ink2)' : 'var(--ink3)';
  return (
    <div style={{
      background: bg, border: '1px solid var(--rule)', borderRadius: 6, padding: 16, marginBottom: 14,
    }}>{children}</div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11, color: 'var(--cream3)', marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function Row({ children, gap = 10 }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap, marginBottom: 12 }}>{children}</div>;
}

function ImageField({ value, onChange }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function pick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': file.type, 'X-Filename': file.name },
        body: file,
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || `HTTP ${res.status}`);
      onChange(payload.url);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 64, height: 84, background: 'var(--ink)',
          border: '1px solid var(--rule)', borderRadius: 3, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flex: '0 0 64px',
        }}>
          {value ? (
            <img src={value} alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 10, color: 'var(--cream3)', letterSpacing: '0.1em' }}>NO IMG</span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? 'Uploading…' : value ? 'Replace photo' : 'Upload photo'}
          </button>
          {value && (
            <button type="button" className="btn btn-ghost btn-danger" onClick={() => onChange('')} disabled={busy}>
              Remove photo
            </button>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={pick} />
      {err && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>{err}</div>}
    </div>
  );
}

function ReorderBar({ onUp, onDown, onDelete, label, canUp, canDown }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}>
      <button type="button" className="btn btn-icon btn-ghost" onClick={onUp} disabled={!canUp} title="Move up">↑</button>
      <button type="button" className="btn btn-icon btn-ghost" onClick={onDown} disabled={!canDown} title="Move down">↓</button>
      <div style={{ flex: 1 }} />
      <button type="button" className="btn btn-ghost btn-danger" onClick={() => {
        if (window.confirm(`Remove ${label}?`)) onDelete();
      }}>Remove</button>
    </div>
  );
}

function BrandEditor({ menu, setMenu, onUploaded }) {
  const b = menu.brand || {};
  function set(field, value) {
    setMenu({ ...menu, brand: { ...b, [field]: value } });
  }
  return (
    <Card>
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 24, marginBottom: 14 }}>Brand</div>
      <Field label="Name"><input value={b.name || ''} onChange={e => set('name', e.target.value)} /></Field>
      <Field label="Tagline" hint="Shown under the logo on the home screen, ALL CAPS with letterspacing.">
        <input value={b.tagline || ''} onChange={e => set('tagline', e.target.value)} />
      </Field>
      <Row>
        <Field label="Established (year)"><input value={b.est || ''} onChange={e => set('est', e.target.value)} placeholder="2026" /></Field>
      </Row>
      <Field label="Logo" hint={b.logoTransparent
        ? 'Transparent logo: shown as-is.'
        : 'JPEG with white background gets a screen-blend treatment so it sits on the dark page. Toggle transparency if your logo already has a transparent background.'}>
        <ImageField value={b.logo || ''} onChange={url => set('logo', url)} />
      </Field>
      <Field label="">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, textTransform: 'none', letterSpacing: 0, fontSize: 14, color: 'var(--cream)', cursor: 'pointer', marginBottom: 0 }}>
          <input type="checkbox" checked={!!b.logoTransparent} onChange={e => set('logoTransparent', e.target.checked)}
            style={{ width: 18, height: 18, flex: '0 0 18px', accentColor: 'var(--gold)' }} />
          Logo has transparent background (no blend treatment needed)
        </label>
      </Field>
    </Card>
  );
}

function SectionEditor({ section, menu, setMenu, onUploaded }) {
  const itemsKey = ITEMS_KEY[section];
  const cats = menu[section] || [];

  function updateCats(next) {
    setMenu({ ...menu, [section]: next });
  }
  function updateCat(idx, patch) {
    const next = cats.map((c, i) => i === idx ? { ...c, ...patch } : c);
    updateCats(next);
  }
  function moveCat(idx, dir) {
    const j = idx + dir;
    if (j < 0 || j >= cats.length) return;
    const next = cats.slice();
    [next[idx], next[j]] = [next[j], next[idx]];
    updateCats(next);
  }
  function removeCat(idx) {
    updateCats(cats.filter((_, i) => i !== idx));
  }
  function addCat() {
    updateCats([...cats, defaultCategory(section)]);
  }

  function updateItems(catIdx, nextItems) {
    updateCat(catIdx, { [itemsKey]: nextItems });
  }
  function updateItem(catIdx, itemIdx, patch) {
    const items = cats[catIdx][itemsKey] || [];
    const next = items.map((it, i) => i === itemIdx ? { ...it, ...patch } : it);
    updateItems(catIdx, next);
  }
  function moveItem(catIdx, itemIdx, dir) {
    const items = cats[catIdx][itemsKey] || [];
    const j = itemIdx + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[itemIdx], next[j]] = [next[j], next[itemIdx]];
    updateItems(catIdx, next);
  }
  function removeItem(catIdx, itemIdx) {
    const items = (cats[catIdx][itemsKey] || []).filter((_, i) => i !== itemIdx);
    updateItems(catIdx, items);
  }
  function addItem(catIdx) {
    const items = cats[catIdx][itemsKey] || [];
    const blank = section === 'flower' ? defaultStrain() : defaultItem();
    updateItems(catIdx, [...items, blank]);
  }

  return (
    <div>
      <div style={{
        fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 28, marginBottom: 4,
      }}>{SECTION_LABELS[section]}</div>
      <div style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--cream2)', textTransform: 'uppercase', marginBottom: 18 }}>
        {cats.length} {cats.length === 1 ? 'category' : 'categories'}
      </div>

      {cats.map((cat, catIdx) => (
        <CategoryCard
          key={catIdx}
          section={section}
          cat={cat}
          catIdx={catIdx}
          itemsKey={itemsKey}
          canUp={catIdx > 0}
          canDown={catIdx < cats.length - 1}
          onCat={(patch) => updateCat(catIdx, patch)}
          onMove={(dir) => moveCat(catIdx, dir)}
          onRemove={() => removeCat(catIdx)}
          onItem={(itemIdx, patch) => updateItem(catIdx, itemIdx, patch)}
          onMoveItem={(itemIdx, dir) => moveItem(catIdx, itemIdx, dir)}
          onRemoveItem={(itemIdx) => removeItem(catIdx, itemIdx)}
          onAddItem={() => addItem(catIdx)}
        />
      ))}

      <button type="button" className="btn" onClick={addCat} style={{ width: '100%', marginTop: 4 }}>
        + Add category
      </button>
    </div>
  );
}

function CategoryCard({ section, cat, catIdx, itemsKey, canUp, canDown, onCat, onMove, onRemove, onItem, onMoveItem, onRemoveItem, onAddItem }) {
  const items = cat[itemsKey] || [];
  return (
    <Card>
      <Field label="Category name">
        <input value={cat.category || ''} onChange={e => onCat({ category: e.target.value })} />
      </Field>
      <Field label="Subtitle" hint="Italic line under the category title (e.g. 'Sun-grown · All 10g R250').">
        <input value={cat.sub || ''} onChange={e => onCat({ sub: e.target.value })} />
      </Field>
      {section === 'mushrooms' && (
        <Field label="Footnote" hint="Optional. Appears below the items.">
          <input value={cat.footnote || ''} onChange={e => onCat({ footnote: e.target.value })} />
        </Field>
      )}

      <div style={{
        fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
        color: 'var(--cream2)', marginTop: 20, marginBottom: 10,
      }}>
        {section === 'flower' ? 'Strains' : 'Items'} · {items.length}
      </div>

      {items.map((it, itIdx) => (
        section === 'flower'
          ? <StrainEditor
              key={itIdx}
              strain={it}
              canUp={itIdx > 0}
              canDown={itIdx < items.length - 1}
              onChange={(patch) => onItem(itIdx, patch)}
              onMove={(dir) => onMoveItem(itIdx, dir)}
              onRemove={() => onRemoveItem(itIdx)}
            />
          : <ItemEditor
              key={itIdx}
              item={it}
              canUp={itIdx > 0}
              canDown={itIdx < items.length - 1}
              onChange={(patch) => onItem(itIdx, patch)}
              onMove={(dir) => onMoveItem(itIdx, dir)}
              onRemove={() => onRemoveItem(itIdx)}
            />
      ))}

      <button type="button" className="btn" onClick={onAddItem} style={{ width: '100%', marginBottom: 4 }}>
        + Add {section === 'flower' ? 'strain' : 'item'}
      </button>

      <ReorderBar
        label={`category "${cat.category || 'unnamed'}"`}
        canUp={canUp} canDown={canDown}
        onUp={() => onMove(-1)} onDown={() => onMove(1)}
        onDelete={onRemove}
      />
    </Card>
  );
}

function StrainEditor({ strain, canUp, canDown, onChange, onMove, onRemove }) {
  const terpsStr = Array.isArray(strain.terps) ? strain.terps.join(', ') : (strain.terps || '');
  function setTerps(str) {
    const parts = str.split(',').map(s => s.trim()).filter(Boolean);
    onChange({ terps: parts });
  }
  return (
    <Card depth={1}>
      <Row>
        <Field label="Name"><input value={strain.name || ''} onChange={e => onChange({ name: e.target.value })} /></Field>
        <Field label="Type" hint="Sativa / Indica / Hybrid"><input value={strain.type || ''} onChange={e => onChange({ type: e.target.value })} /></Field>
      </Row>
      <Row>
        <Field label="THC %"><input value={strain.thc || ''} onChange={e => onChange({ thc: e.target.value })} placeholder="e.g. 22%" /></Field>
        <Field label="Effect" hint="e.g. 'Bright · Citrus · Daytime'"><input value={strain.effect || ''} onChange={e => onChange({ effect: e.target.value })} /></Field>
      </Row>
      <Field label="Terpenes" hint="Comma-separated, e.g. 'Limonene, Pinene'">
        <input value={terpsStr} onChange={e => setTerps(e.target.value)} />
      </Field>
      <Row>
        <Field label="Price"><input value={strain.price || ''} onChange={e => onChange({ price: e.target.value })} placeholder="e.g. R30" /></Field>
        <Field label="Unit"><input value={strain.unit || ''} onChange={e => onChange({ unit: e.target.value })} placeholder="/g" /></Field>
        <Field label="Alt price" hint="Optional bulk price">
          <input value={strain.alt || ''} onChange={e => onChange({ alt: e.target.value })} placeholder="R500 / 10g" />
        </Field>
      </Row>
      <Field label="Photo" hint="Optional. Shown as a 64×84 thumbnail on the strain card.">
        <ImageField value={strain.img || ''} onChange={url => onChange({ img: url })} />
      </Field>
      <ReorderBar
        label={`strain "${strain.name || 'unnamed'}"`}
        canUp={canUp} canDown={canDown}
        onUp={() => onMove(-1)} onDown={() => onMove(1)}
        onDelete={onRemove}
      />
    </Card>
  );
}

function ItemEditor({ item, canUp, canDown, onChange, onMove, onRemove }) {
  return (
    <Card depth={1}>
      <Row>
        <Field label="Name"><input value={item.name || ''} onChange={e => onChange({ name: e.target.value })} /></Field>
        <Field label="Type / variant" hint="Optional, e.g. 'Indica-dom' or strain name">
          <input value={item.type || ''} onChange={e => onChange({ type: e.target.value })} />
        </Field>
      </Row>
      <Field label="Terpenes" hint="Optional comma-separated list, free-form text shown as-is.">
        <input value={typeof item.terps === 'string' ? item.terps : (item.terps || []).join(', ')} onChange={e => onChange({ terps: e.target.value })} />
      </Field>
      <Field label="Description" hint="Optional. Replaces terpenes display if both are empty.">
        <textarea value={item.desc || ''} onChange={e => onChange({ desc: e.target.value })} rows={2} />
      </Field>
      <Row>
        <Field label="Price"><input value={item.price || ''} onChange={e => onChange({ price: e.target.value })} placeholder="e.g. R300" /></Field>
        <Field label="Unit" hint="Optional, e.g. '/g' or '/syringe'">
          <input value={item.unit || ''} onChange={e => onChange({ unit: e.target.value })} />
        </Field>
      </Row>
      <ReorderBar
        label={`item "${item.name || 'unnamed'}"`}
        canUp={canUp} canDown={canDown}
        onUp={() => onMove(-1)} onDown={() => onMove(1)}
        onDelete={onRemove}
      />
    </Card>
  );
}
