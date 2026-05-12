// Initial menu data — used only when Blob has no menu.json yet.
// After the first admin save, the Blob copy becomes the source of truth.
export const SEED = {
  brand: {
    name: 'NR Botanicals',
    tagline: 'Pure · Natural · Botanics',
    est: 2026,
  },
  flower: [
    {
      category: 'Greenhouse',
      sub: 'Sun-grown · All 10g R250',
      strains: [
        { name: 'Sour Bree',       type: 'Sativa-dom', thc: '18%', terps: ['Limonene', 'Pinene'],       effect: 'Bright · Citrus · Daytime',  price: 'R30', unit: '/g', img: 'assets/bud-3.jpeg' },
        { name: 'Forbidden Candy', type: 'Hybrid',     thc: '20%', terps: ['Caryophyllene', 'Linalool'], effect: 'Sweet · Mellow · Social',    price: 'R30', unit: '/g' },
        { name: 'Super Cheese',    type: 'Indica-dom', thc: '19%', terps: ['Myrcene', 'Caryophyllene'],  effect: 'Funky · Calming · Body',     price: 'R30', unit: '/g' },
      ],
    },
    {
      category: 'Indoor',
      sub: 'Climate-controlled',
      strains: [
        { name: 'True Mintz', type: 'Hybrid', thc: '22%', terps: ['Caryophyllene', 'Limonene'], effect: 'Cool · Crisp · Balanced', price: 'R40', unit: '/g', img: 'assets/bud-2.jpeg' },
      ],
    },
    {
      category: 'Hydro Indoor',
      sub: 'Soilless · Premium',
      strains: [
        { name: 'Cream Soda', type: 'Hybrid', thc: '24%', terps: ['Limonene', 'Myrcene'], effect: 'Creamy · Uplifting · Smooth', price: 'R60', unit: '/g', alt: 'R500 / 10g', img: 'assets/bud-1.jpeg' },
      ],
    },
  ],
  concentrates: [
    {
      category: 'Live Rosin',
      sub: 'Solventless · Cold-pressed',
      items: [
        { name: 'Super Cheese', type: 'Indica-dom', terps: 'Myrcene, Caryophyllene', price: 'R300', unit: '/g' },
        { name: 'Joker',        type: 'Hybrid',     terps: 'Terpinolene, Pinene',     price: 'R300', unit: '/g' },
        { name: 'Blockberry',   type: 'Indica',     terps: 'Linalool, Myrcene',       price: 'R300', unit: '/g' },
        { name: 'Piatella',     type: 'Hybrid',     terps: 'Limonene, Caryophyllene', price: 'R300', unit: '/g' },
      ],
    },
    {
      category: 'Distillate',
      sub: 'High-purity oil',
      items: [
        { name: 'Battery Pen',         desc: 'Rechargeable · Universal 510 thread', price: 'R250' },
        { name: '1ml Distillate Cart', desc: 'Choice of strain · 80%+ THC',          price: 'R250' },
      ],
    },
  ],
  edibles: [
    {
      category: 'Wellness Oil',
      sub: 'Full-spectrum extract',
      items: [
        { name: 'RSO Oil', desc: 'Pain relief · Restless sleep · Sublingual or topical', price: 'R150', unit: '/syringe' },
      ],
    },
  ],
  mushrooms: [
    {
      category: 'Happy Caps',
      sub: 'Encapsulated · Ideal for micro-dosing',
      items: [
        { name: '1 Capsule',   desc: 'Single serving · ~150mg', price: 'R50'  },
        { name: '10 Capsules', desc: 'Course · Save R200',       price: 'R300' },
      ],
      footnote: 'For other mushroom products, message us directly.',
    },
  ],
};
