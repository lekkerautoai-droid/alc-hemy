// Direction 1 — DARK APOTHECARY
// Deep black-green canvas, museum-lit hero photography, gold serif accents,
// cream type. Botanical-soft kept through hairline rules + slow-set serif.

const D1 = {
  ink:   '#0d0f0c',
  ink2:  '#151813',
  cream: '#e8e2d0',
  cream2:'#b8b0a0',
  gold:  '#c9a866',
  gold2: '#8a7448',
  moss:  '#5a6b3a',
  rule:  'rgba(232,226,208,0.14)',
  serif: '"Cormorant Garamond", "EB Garamond", Georgia, serif',
  sans:  '"Inter Tight", -apple-system, system-ui, sans-serif',
  mono:  '"JetBrains Mono", ui-monospace, monospace',
};

function D1Shell({ screen, setScreen, children }) {
  const tabs = [
    { id: 'cover',    label: 'Home' },
    { id: 'flower',   label: 'Flower' },
    { id: 'conc',     label: 'Extract' },
    { id: 'edibles',  label: 'Wellness' },
    { id: 'shrooms',  label: 'Caps' },
  ];
  return (
    <div style={{
      width: '100%', height: '100%',
      background: D1.ink,
      color: D1.cream,
      fontFamily: D1.serif,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative',
    }}>
      <div style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}>{children}</div>
      <nav style={{
        flex: '0 0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
        background: D1.ink2,
        borderTop: '1px solid ' + D1.rule,
        padding: '8px 6px 14px',
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setScreen(t.id)}
            style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              padding: '6px 0', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4,
              fontFamily: D1.sans, fontSize: 9, letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: screen === t.id ? D1.gold : D1.cream2,
            }}>
            <span style={{
              width: 4, height: 4, borderRadius: 4,
              background: screen === t.id ? D1.gold : 'transparent',
              border: '1px solid ' + (screen === t.id ? D1.gold : D1.cream2),
            }} />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function D1Header({ eyebrow, title, sub }) {
  return (
    <div style={{ padding: '36px 24px 20px', borderBottom: '1px solid ' + D1.rule }}>
      {eyebrow && (
        <div style={{
          fontFamily: D1.sans, fontSize: 9, letterSpacing: '0.32em',
          color: D1.gold, textTransform: 'uppercase', marginBottom: 14,
        }}>— {eyebrow}</div>
      )}
      <h1 style={{
        fontFamily: D1.serif, fontWeight: 400, fontStyle: 'italic',
        fontSize: 38, lineHeight: 1, margin: 0,
        color: D1.cream, letterSpacing: -0.5,
      }}>{title}</h1>
      {sub && (
        <div style={{
          fontFamily: D1.sans, fontSize: 11, color: D1.cream2,
          marginTop: 10, letterSpacing: '0.04em',
        }}>{sub}</div>
      )}
    </div>
  );
}

function D1Cover({ setScreen }) {
  return (
    <div style={{ minHeight: '100%', position: 'relative', padding: '40px 0 24px' }}>
      <div style={{
        position: 'absolute', top: 28, left: 24, right: 24,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: D1.mono, fontSize: 9, letterSpacing: '0.2em',
        color: D1.cream2, textTransform: 'uppercase',
      }}>
        <span>NR · 002</span>
        <span>EST. 2026</span>
      </div>

      <div style={{ padding: '60px 28px 0' }}>
        <img src="assets/logo.jpeg" alt="NR Botanicals"
          style={{
            width: '100%', borderRadius: 2, display: 'block',
            mixBlendMode: 'screen', opacity: 0.95,
            filter: 'contrast(1.05) brightness(1.1)',
          }}/>
      </div>

      <div style={{ padding: '8px 28px 0', textAlign: 'center' }}>
        <div style={{
          fontFamily: D1.sans, fontSize: 9, letterSpacing: '0.4em',
          color: D1.gold, textTransform: 'uppercase',
        }}>Pure · Natural · Botanics</div>
      </div>

      <div style={{ padding: '36px 28px 0' }}>
        <div style={{ height: 1, background: D1.rule, marginBottom: 24 }} />
        <div style={{
          fontFamily: D1.serif, fontStyle: 'italic', fontSize: 22,
          lineHeight: 1.25, color: D1.cream, textAlign: 'center',
        }}>
          A small catalogue of flower, extracts &amp; wellness — grown with care.
        </div>
        <div style={{ height: 1, background: D1.rule, marginTop: 24 }} />
      </div>

      <div style={{ padding: '32px 24px 0', display: 'grid', gap: 1, background: D1.rule }}>
        {[
          { id: 'flower',  k: '01', t: 'Flower',       n: '5 cultivars' },
          { id: 'conc',    k: '02', t: 'Concentrates', n: 'Rosin · Carts' },
          { id: 'edibles', k: '03', t: 'Wellness',     n: 'RSO oil' },
          { id: 'shrooms', k: '04', t: 'Mushrooms',    n: 'Happy Caps' },
        ].map(row => (
          <button key={row.id} onClick={() => setScreen(row.id)}
            style={{
              background: D1.ink, border: 'none', cursor: 'pointer',
              padding: '18px 4px', textAlign: 'left',
              display: 'grid', gridTemplateColumns: '40px 1fr auto',
              alignItems: 'baseline', gap: 12, color: D1.cream,
            }}>
            <span style={{ fontFamily: D1.mono, fontSize: 10, color: D1.gold, letterSpacing: '0.1em' }}>{row.k}</span>
            <span style={{ fontFamily: D1.serif, fontStyle: 'italic', fontSize: 22 }}>{row.t}</span>
            <span style={{ fontFamily: D1.sans, fontSize: 10, color: D1.cream2, letterSpacing: '0.06em' }}>{row.n} ›</span>
          </button>
        ))}
      </div>

      <div style={{
        padding: '40px 28px 8px', textAlign: 'center',
        fontFamily: D1.mono, fontSize: 8.5, letterSpacing: '0.24em',
        color: D1.cream2, textTransform: 'uppercase',
      }}>
        21+ · ZA · By appointment
      </div>
    </div>
  );
}

function D1StrainCard({ s, i }) {
  return (
    <article style={{
      padding: '20px 24px 22px',
      borderBottom: '1px solid ' + D1.rule,
      display: 'grid', gridTemplateColumns: '64px 1fr',
      gap: 16, alignItems: 'flex-start',
    }}>
      <div style={{
        width: 64, height: 84, background: D1.ink2,
        border: '1px solid ' + D1.rule, borderRadius: 1,
        position: 'relative', overflow: 'hidden',
      }}>
        {s.img ? (
          <img src={s.img} alt="" style={{
            width: '100%', height: '100%', objectFit: 'cover',
            filter: 'brightness(1.1) contrast(1.05)',
          }}/>
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: D1.mono, fontSize: 8, color: D1.cream2, letterSpacing: '0.1em',
            background: `repeating-linear-gradient(45deg, ${D1.ink2} 0 6px, ${D1.ink} 6px 12px)`,
          }}>{String(i+1).padStart(2,'0')}</div>
        )}
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <h3 style={{
            margin: 0, fontFamily: D1.serif, fontStyle: 'italic',
            fontWeight: 400, fontSize: 22, color: D1.cream, lineHeight: 1.05,
          }}>{s.name}</h3>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: D1.serif, fontSize: 18, color: D1.gold }}>{s.price}<span style={{ fontFamily: D1.sans, fontSize: 10, color: D1.cream2 }}>{s.unit}</span></div>
            {s.alt && <div style={{ fontFamily: D1.sans, fontSize: 9, color: D1.cream2, marginTop: 2 }}>{s.alt}</div>}
          </div>
        </div>
        <div style={{
          fontFamily: D1.sans, fontSize: 9.5, letterSpacing: '0.16em',
          color: D1.gold2, textTransform: 'uppercase', marginTop: 8,
        }}>{s.type} · {s.thc} THC</div>
        <div style={{
          fontFamily: D1.serif, fontStyle: 'italic', fontSize: 13,
          color: D1.cream2, marginTop: 6, lineHeight: 1.4,
        }}>{s.effect}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          {(Array.isArray(s.terps) ? s.terps : String(s.terps).split(',')).map(t => (
            <span key={t} style={{
              fontFamily: D1.sans, fontSize: 9, letterSpacing: '0.08em',
              color: D1.cream2, border: '1px solid ' + D1.rule,
              padding: '2px 7px', borderRadius: 999,
            }}>{String(t).trim()}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

function D1Flower() {
  return (
    <div>
      <D1Header eyebrow="Chapter 01" title="Flower" sub="By origin · By the gram" />
      {window.NR.flower.map((cat, ci) => (
        <section key={cat.category}>
          <header style={{
            padding: '24px 24px 12px',
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{
                fontFamily: D1.sans, fontSize: 9, letterSpacing: '0.28em',
                color: D1.gold, textTransform: 'uppercase',
              }}>0{ci+1}</div>
              <h2 style={{
                margin: '4px 0 0', fontFamily: D1.serif, fontWeight: 500,
                fontSize: 24, color: D1.cream, letterSpacing: -0.2,
              }}>{cat.category}</h2>
              <div style={{ fontFamily: D1.serif, fontStyle: 'italic', fontSize: 12, color: D1.cream2, marginTop: 2 }}>{cat.sub}</div>
            </div>
          </header>
          {cat.strains.map((s, i) => <D1StrainCard key={s.name + i} s={s} i={i} />)}
        </section>
      ))}
      <div style={{ height: 40 }} />
    </div>
  );
}

function D1ItemRow({ it }) {
  return (
    <div style={{
      padding: '18px 24px',
      borderBottom: '1px solid ' + D1.rule,
      display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'baseline',
    }}>
      <div>
        <div style={{ fontFamily: D1.serif, fontStyle: 'italic', fontSize: 20, color: D1.cream, lineHeight: 1.1 }}>{it.name}</div>
        {it.type && (
          <div style={{ fontFamily: D1.sans, fontSize: 9, letterSpacing: '0.18em', color: D1.gold2, textTransform: 'uppercase', marginTop: 6 }}>
            {it.type}{it.terps ? ' · ' + it.terps : ''}
          </div>
        )}
        {it.desc && (
          <div style={{ fontFamily: D1.serif, fontStyle: 'italic', fontSize: 12.5, color: D1.cream2, marginTop: 6, lineHeight: 1.4 }}>{it.desc}</div>
        )}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: D1.serif, fontSize: 18, color: D1.gold }}>{it.price}<span style={{ fontFamily: D1.sans, fontSize: 10, color: D1.cream2 }}>{it.unit || ''}</span></div>
      </div>
    </div>
  );
}

function D1List({ eyebrow, title, sub, groups }) {
  return (
    <div>
      <D1Header eyebrow={eyebrow} title={title} sub={sub} />
      {groups.map((g, gi) => (
        <section key={g.category}>
          <header style={{ padding: '22px 24px 10px' }}>
            <div style={{ fontFamily: D1.sans, fontSize: 9, letterSpacing: '0.28em', color: D1.gold, textTransform: 'uppercase' }}>0{gi+1}</div>
            <h2 style={{ margin: '4px 0 0', fontFamily: D1.serif, fontWeight: 500, fontSize: 22, color: D1.cream }}>{g.category}</h2>
            <div style={{ fontFamily: D1.serif, fontStyle: 'italic', fontSize: 12, color: D1.cream2, marginTop: 2 }}>{g.sub}</div>
          </header>
          {g.items.map((it, i) => <D1ItemRow key={it.name + i} it={it} />)}
          {g.footnote && (
            <div style={{ padding: '14px 24px 4px', fontFamily: D1.serif, fontStyle: 'italic', fontSize: 12, color: D1.cream2 }}>
              — {g.footnote}
            </div>
          )}
        </section>
      ))}
      <div style={{ height: 40 }} />
    </div>
  );
}

function D1Menu() {
  const [screen, setScreen] = React.useState('cover');
  return (
    <D1Shell screen={screen} setScreen={setScreen}>
      {screen === 'cover'   && <D1Cover setScreen={setScreen} />}
      {screen === 'flower'  && <D1Flower />}
      {screen === 'conc'    && <D1List eyebrow="Chapter 02" title="Concentrates" sub="Solventless · Distillate"
                                       groups={window.NR.concentrates} />}
      {screen === 'edibles' && <D1List eyebrow="Chapter 03" title="Wellness"     sub="Plant medicine"
                                       groups={window.NR.edibles} />}
      {screen === 'shrooms' && <D1List eyebrow="Chapter 04" title="Mushrooms"    sub="Micro-dosing"
                                       groups={window.NR.mushrooms} />}
    </D1Shell>
  );
}

window.D1Menu = D1Menu;
