'use strict';

// ── TITLES (XP thresholds) ──────────────────────────────────────────────────
const TITLES = [
  { id: 'squire',   name: 'Squire of Debt',   minXP: 0,    gear: 'Cloth Armor | Wooden Sword',       tier: 0 },
  { id: 'fighter',  name: 'Debt Fighter',      minXP: 100,  gear: 'Leather Armor | Iron Sword',        tier: 1 },
  { id: 'warrior',  name: 'Debt Warrior',      minXP: 500,  gear: 'Chain Mail | Steel Sword',          tier: 2 },
  { id: 'champion', name: 'Debt Champion',     minXP: 1500, gear: 'Plate Armor | Enchanted Blade',     tier: 3 },
  { id: 'hero',     name: 'Debt Hero',         minXP: 3000, gear: 'Dragon Scale Armor | Runic Blade',  tier: 4 },
  { id: 'legend',   name: 'Debt Legend',       minXP: 8000, gear: 'Celestial Armor | Excalibur',       tier: 5 },
];

// ── STATE ───────────────────────────────────────────────────────────────────
const state = {
  xp:         0,
  totalPaid:  0,
};

// ── SAVE / LOAD ─────────────────────────────────────────────────────────────
const SAVE_KEY = 'dq_hero_v1';

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ xp: state.xp, totalPaid: state.totalPaid }));
}

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    if (d.xp       !== undefined) state.xp       = d.xp;
    if (d.totalPaid !== undefined) state.totalPaid = d.totalPaid;
  } catch (_) {}
}

// ── HERO SVG SPRITE ─────────────────────────────────────────────────────────
// Pixel art built from colored 4×4 rects on a 16×16 grid.
function heroSVG(tier) {
  const palettes = [
    { armor: '#8B7355', sword: '#A0A0A0', accent: '#D4A574', helm: null       }, // 0 cloth
    { armor: '#7B5A1A', sword: '#C8C8C8', accent: '#D4A574', helm: '#7B5A1A'  }, // 1 leather
    { armor: '#909090', sword: '#E0E0E0', accent: '#B0B0C0', helm: '#808090'  }, // 2 chain
    { armor: '#607080', sword: '#FFD700', accent: '#708090', helm: '#506070'  }, // 3 plate
    { armor: '#4A3A7A', sword: '#FF6060', accent: '#6A5AAA', helm: '#3A2A6A'  }, // 4 dragon
    { armor: '#DAA520', sword: '#FFFFFF', accent: '#FFF080', helm: '#B8860B'  }, // 5 celestial
  ];
  const p = palettes[Math.min(tier, palettes.length - 1)];
  const S = 4; // px per pixel
  const W = 16 * S, H = 16 * S;

  // [col, row, color]  — (0,0) = top-left
  const skin = '#FDBCB4', hair = '#3A2A1A', eye = '#1a1a1a';
  const pants = '#2A2A6A', boot = p.accent, belt = '#5A3A10';
  const A = p.armor, sw = p.sword, ac = p.accent;
  const hm = p.helm || hair;

  const pixels = [
    // Head
    [6,1,skin],[7,1,skin],[8,1,skin],[9,1,skin],
    [6,2,skin],[7,2,skin],[8,2,skin],[9,2,skin],
    [6,3,skin],[7,3,eye ],[8,3,eye ],[9,3,skin],
    [6,4,skin],[7,4,skin],[8,4,skin],[9,4,skin],
    // Hair / helm row 0
    [6,0,hm],[7,0,hm],[8,0,hm],[9,0,hm],
    // Helmet sides (tier 1+)
    ...(tier >= 1 ? [[5,1,hm],[10,1,hm],[5,2,hm],[10,2,hm]] : []),
    // Torso
    [5,5,A],[6,5,A],[7,5,A],[8,5,A],[9,5,A],[10,5,A],
    [5,6,A],[6,6,A],[7,6,A],[8,6,A],[9,6,A],[10,6,A],
    [5,7,A],[6,7,A],[7,7,A],[8,7,A],[9,7,A],[10,7,A],
    [5,8,A],[6,8,A],[7,8,A],[8,8,A],[9,8,A],[10,8,A],
    // Belt
    [5,9,belt],[6,9,belt],[7,9,belt],[8,9,belt],[9,9,belt],[10,9,belt],
    // Legs
    [6,10,pants],[7,10,pants],[8,10,A   ],[9,10,A   ],
    [6,11,pants],[7,11,pants],[8,11,A   ],[9,11,A   ],
    [6,12,pants],[7,12,pants],[8,12,A   ],[9,12,A   ],
    // Boots
    [6,13,boot],[7,13,boot],[8,13,boot],[9,13,boot],
    [6,14,boot],[7,14,boot],[8,14,boot],[9,14,boot],
    // Sword (right)
    [11,4,sw],[11,5,sw],[11,6,sw],[11,7,sw],[11,8,sw],
    [10,7,belt],[12,7,belt], // crossguard
    // Shield (tier 2+)
    ...(tier >= 2 ? [
      [3,6,ac],[4,6,ac],[3,7,ac],[4,7,ac],[3,8,ac],[4,8,ac],
    ] : []),
    // Cape (tier 4+)
    ...(tier >= 4 ? [
      [4,5,'#8B0000'],[4,6,'#8B0000'],[4,7,'#8B0000'],[4,8,'#8B0000'],[4,9,'#8B0000'],
    ] : []),
    // Glow effect on sword (tier 5)
    ...(tier >= 5 ? [[11,3,sw],[11,9,sw],[13,7,'#FFFAAA']] : []),
  ];

  const rects = pixels.map(([c, r, color]) =>
    `<rect x="${c*S}" y="${r*S}" width="${S}" height="${S}" fill="${color}"/>`
  ).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"
    width="${W}" height="${H}" style="image-rendering:pixelated">${rects}</svg>`;
}

// ── HELPERS ─────────────────────────────────────────────────────────────────
function getTitleForXP(xp) {
  return [...TITLES].reverse().find(t => xp >= t.minXP) || TITLES[0];
}

function getNextTitle(xp) {
  return TITLES.find(t => xp < t.minXP) || null;
}

// ── RENDER ──────────────────────────────────────────────────────────────────
function render() {
  const title = getTitleForXP(state.xp);
  const next  = getNextTitle(state.xp);

  // Header
  document.getElementById('player-title').textContent = title.name;
  document.getElementById('xp-val').textContent       = state.xp;
  document.getElementById('paid-val').textContent     = state.totalPaid.toFixed(2);

  // Hero sprite — swaps art when tier changes
  document.getElementById('hero-sprite').innerHTML = heroSVG(title.tier);

  // Gear line
  document.getElementById('hero-gear').textContent = title.gear;

  // XP progress bar toward next title
  const barWrap  = document.querySelector('#xp-bar-wrap > div');
  const barFill  = document.getElementById('xp-bar');
  const barLabel = document.getElementById('xp-bar-label');

  if (next) {
    const prev = title.minXP;
    const pct  = Math.min(100, ((state.xp - prev) / (next.minXP - prev)) * 100);
    barFill.style.width  = pct + '%';
    barLabel.textContent = `${state.xp} / ${next.minXP} XP → ${next.name}`;
  } else {
    barFill.style.width  = '100%';
    barLabel.textContent = 'MAX RANK';
  }
}

// ── INIT ─────────────────────────────────────────────────────────────────────
load();
render();
