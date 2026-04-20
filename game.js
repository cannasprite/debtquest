'use strict';

// ── DEBT / ENEMY DATA ────────────────────────────────────────────────────────
const INITIAL_DEBTS = [
  {
    id: 'student', name: 'Student Debt Goblin', amount: 2608.61, paid: 0,
    floor: 1, type: 'goblin', defeated: false,
    taunts: [
      '"You\'ll be paying me forever, adventurer!"',
      '"Every missed payment feeds my power!"',
      '"Interest compounds daily. Sleep well."',
      '"Your degree was worth every copper... said no one."',
    ],
  },
  {
    id: 'collin', name: "Collin's Ledger Specter", amount: 1100, paid: 0,
    floor: 1, type: 'specter', defeated: false,
    taunts: [
      '"I haunt your credit history from beyond!"',
      '"You can\'t outrun what you owe a friend..."',
      '"Every dollar you spend should be mine."',
    ],
  },
  {
    id: 'ben', name: "Ben's Frame Phantom", amount: 300, paid: 0,
    floor: 1, type: 'phantom', defeated: false,
    taunts: [
      '"Small debt, big guilt!"',
      '"I may be tiny, but I\'m still here."',
      '"Pay me first. I\'m the easiest."',
    ],
  },
  {
    id: 'cc1', name: 'Credit Card Imp #1', amount: 935.08, paid: 0,
    floor: 2, type: 'imp', defeated: false,
    taunts: [
      '"APR is my favorite spell!"',
      '"Late fees make me stronger!"',
      '"Buy now. Suffer later. Hehehe."',
    ],
  },
  {
    id: 'cc2', name: 'Credit Card Imp #2', amount: 931.96, paid: 0,
    floor: 2, type: 'imp', defeated: false,
    taunts: [
      '"My twin and I share your suffering!"',
      '"Minimum payments are my life force!"',
      '"Two of us. One of you. Good luck."',
    ],
  },
  {
    id: 'car', name: 'Car Loan Troll', amount: 11680, paid: 0,
    floor: 3, type: 'troll', defeated: false,
    taunts: [
      '"NONE SHALL PASS without a monthly payment!"',
      '"I am the debt that breaks adventurers!"',
      '"Your car depreciates. I do not."',
      '"60 months? More like forever. RARGH!"',
    ],
  },
];

// ── TITLES ───────────────────────────────────────────────────────────────────
const TITLES = [
  { id: 'squire',   name: 'Squire of Debt',   minXP: 0,    gear: 'Cloth Armor | Wooden Sword',      tier: 0 },
  { id: 'fighter',  name: 'Debt Fighter',      minXP: 100,  gear: 'Leather Armor | Iron Sword',       tier: 1 },
  { id: 'warrior',  name: 'Debt Warrior',      minXP: 500,  gear: 'Chain Mail | Steel Sword',         tier: 2 },
  { id: 'champion', name: 'Debt Champion',     minXP: 1500, gear: 'Plate Armor | Enchanted Blade',    tier: 3 },
  { id: 'hero',     name: 'Debt Hero',         minXP: 3000, gear: 'Dragon Scale Armor | Runic Blade', tier: 4 },
  { id: 'legend',   name: 'Debt Legend',       minXP: 8000, gear: 'Celestial Armor | Excalibur',      tier: 5 },
];

// ── STATE ─────────────────────────────────────────────────────────────────────
const state = {
  debts:         JSON.parse(JSON.stringify(INITIAL_DEBTS)),
  xp:            0,
  totalPaid:     0,
  currentFloor:  1,
  activeEnemyId: 'student',
};

// ── PERSISTENCE ───────────────────────────────────────────────────────────────
const SAVE_KEY = 'dq_v2';

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    debts:         state.debts,
    xp:            state.xp,
    totalPaid:     state.totalPaid,
    currentFloor:  state.currentFloor,
    activeEnemyId: state.activeEnemyId,
  }));
}

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (!d) return;
    Object.assign(state, d);
  } catch (_) {}
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function fmt(n) {
  return '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function hpPct(debt) {
  return Math.max(0, Math.min(100, ((debt.amount - debt.paid) / debt.amount) * 100));
}

function hpColor(pct) {
  if (pct > 60) return 'var(--hp-hi)';
  if (pct > 25) return 'var(--hp-mid)';
  return 'var(--hp-lo)';
}

function remaining(debt) { return Math.max(0, debt.amount - debt.paid); }

function totalRemaining() { return state.debts.reduce((s, d) => s + remaining(d), 0); }

function getTitleForXP(xp) {
  return [...TITLES].reverse().find(t => xp >= t.minXP) || TITLES[0];
}

function getNextTitle(xp) {
  return TITLES.find(t => xp < t.minXP) || null;
}

// ── PIXEL-ART SVG SPRITES ─────────────────────────────────────────────────────
function buildSVG(pixels, cols, rows, scale = 4) {
  const W = cols * scale, H = rows * scale;
  const rects = pixels.map(([c, r, color]) =>
    `<rect x="${c*scale}" y="${r*scale}" width="${scale}" height="${scale}" fill="${color}"/>`
  ).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="image-rendering:pixelated">${rects}</svg>`;
}

function heroSVG(tier) {
  const P = [
    { A: '#8B7355', sw: '#A0A0A0', ac: '#D4A574', hm: '#3A2A1A' },
    { A: '#7B5A1A', sw: '#C8C8C8', ac: '#D4A574', hm: '#7B5A1A' },
    { A: '#909090', sw: '#E0E0E0', ac: '#B0B0C0', hm: '#808090' },
    { A: '#607080', sw: '#FFD700', ac: '#708090', hm: '#506070' },
    { A: '#4A3A7A', sw: '#FF6060', ac: '#6A5AAA', hm: '#3A2A6A' },
    { A: '#DAA520', sw: '#FFFFFF', ac: '#FFF080', hm: '#B8860B' },
  ][Math.min(tier, 5)];
  const sk = '#FDBCB4', ey = '#1a1a1a', pa = '#2A2A6A', bl = '#5A3A10';
  const px = [
    [6,1,sk],[7,1,sk],[8,1,sk],[9,1,sk],
    [6,2,sk],[7,2,sk],[8,2,sk],[9,2,sk],
    [6,3,sk],[7,3,ey],[8,3,ey],[9,3,sk],
    [6,4,sk],[7,4,sk],[8,4,sk],[9,4,sk],
    [6,0,P.hm],[7,0,P.hm],[8,0,P.hm],[9,0,P.hm],
    ...(tier>=1?[[5,1,P.hm],[10,1,P.hm],[5,2,P.hm],[10,2,P.hm]]:[]),
    [5,5,P.A],[6,5,P.A],[7,5,P.A],[8,5,P.A],[9,5,P.A],[10,5,P.A],
    [5,6,P.A],[6,6,P.A],[7,6,P.A],[8,6,P.A],[9,6,P.A],[10,6,P.A],
    [5,7,P.A],[6,7,P.A],[7,7,P.A],[8,7,P.A],[9,7,P.A],[10,7,P.A],
    [5,8,P.A],[6,8,P.A],[7,8,P.A],[8,8,P.A],[9,8,P.A],[10,8,P.A],
    [5,9,bl],[6,9,bl],[7,9,bl],[8,9,bl],[9,9,bl],[10,9,bl],
    [6,10,pa],[7,10,pa],[8,10,P.A],[9,10,P.A],
    [6,11,pa],[7,11,pa],[8,11,P.A],[9,11,P.A],
    [6,12,pa],[7,12,pa],[8,12,P.A],[9,12,P.A],
    [6,13,P.ac],[7,13,P.ac],[8,13,P.ac],[9,13,P.ac],
    [6,14,P.ac],[7,14,P.ac],[8,14,P.ac],[9,14,P.ac],
    [11,4,P.sw],[11,5,P.sw],[11,6,P.sw],[11,7,P.sw],[11,8,P.sw],
    [10,7,bl],[12,7,bl],
    ...(tier>=2?[[3,6,P.ac],[4,6,P.ac],[3,7,P.ac],[4,7,P.ac],[3,8,P.ac],[4,8,P.ac]]:[]),
    ...(tier>=4?[[4,5,'#8B0000'],[4,6,'#8B0000'],[4,7,'#8B0000'],[4,8,'#8B0000'],[4,9,'#8B0000']]:[]),
    ...(tier>=5?[[11,3,P.sw],[11,9,P.sw],[13,7,'#FFFAAA']]:[]),
  ];
  return buildSVG(px, 16, 16);
}

function enemySVG(type) {
  switch (type) {
    case 'goblin':  return goblinSVG();
    case 'specter': return specterSVG();
    case 'phantom': return phantomSVG();
    case 'imp':     return impSVG();
    case 'troll':   return trollSVG();
    default:        return goblinSVG();
  }
}

function goblinSVG() {
  const g='#2d8a2d',t='#1a6a1a',e='#ff3333',s='#ffd700',w='#ffffaa';
  const px = [
    [3,3,g],[12,3,g], // ears
    [4,2,g],[5,2,g],[6,2,g],[7,2,g],[8,2,g],[9,2,g],[10,2,g],[11,2,g],
    [4,3,g],[5,3,g],[6,3,e],[7,3,e],[8,3,e],[9,3,e],[10,3,g],[11,3,g],
    [4,4,g],[5,4,g],[6,4,g],[7,4,s],[8,4,s],[9,4,g],[10,4,g],[11,4,g],
    [4,5,g],[5,5,g],[6,5,w],[7,5,g],[8,5,g],[9,5,w],[10,5,g],[11,5,g],
    [4,6,g],[5,6,g],[6,6,g],[7,6,g],[8,6,g],[9,6,g],[10,6,g],[11,6,g],
    [5,7,t],[6,7,t],[7,7,t],[8,7,t],[9,7,t],[10,7,t],
    [4,8,t],[5,8,t],[6,8,t],[7,8,t],[8,8,t],[9,8,t],[10,8,t],[11,8,t],
    [4,9,t],[5,9,t],[6,9,t],[7,9,t],[8,9,t],[9,9,t],[10,9,t],[11,9,t],
    [2,8,g],[3,8,g],[2,9,g],[3,9,g],[2,10,g],[3,10,g],
    [12,8,g],[13,8,g],[12,9,g],[13,9,g],[12,10,g],[13,10,g],
    [5,10,t],[6,10,t],[9,10,t],[10,10,t],
    [5,11,'#8B6914'],[6,11,'#8B6914'],[9,11,'#8B6914'],[10,11,'#8B6914'],
    [5,12,'#8B6914'],[6,12,'#8B6914'],[9,12,'#8B6914'],[10,12,'#8B6914'],
  ];
  return buildSVG(px, 16, 14);
}

function specterSVG() {
  const w='#aaccff',d='#7799dd',e='#ff4444',k='#ffaaaa';
  const px = [
    [7,0,w],[8,0,w],
    [6,1,w],[7,1,w],[8,1,w],[9,1,w],
    [5,2,d],[6,2,d],[7,2,d],[8,2,d],[9,2,d],[10,2,d],
    [4,3,w],[5,3,w],[6,3,e],[7,3,w],[8,3,w],[9,3,e],[10,3,w],[11,3,w],
    [4,4,d],[5,4,d],[6,4,d],[7,4,d],[8,4,d],[9,4,d],[10,4,d],[11,4,d],
    [4,5,w],[5,5,w],[6,5,w],[7,5,w],[8,5,w],[9,5,w],[10,5,w],[11,5,w],
    [4,6,d],[5,6,d],[6,6,d],[7,6,d],[8,6,d],[9,6,d],[10,6,d],[11,6,d],
    [5,7,w],[6,7,w],[7,7,w],[8,7,w],[9,7,w],[10,7,w],
    [5,8,d],[7,8,d],[9,8,d],
    [6,9,w],[8,9,w],[10,9,w],
    [5,10,d],[9,10,d],
  ];
  return buildSVG(px, 16, 12);
}

function phantomSVG() {
  const w='#ccaaff',d='#9977cc',e='#ffffff';
  const px = [
    [7,0,w],[8,0,w],
    [6,1,w],[7,1,w],[8,1,w],[9,1,w],
    [5,2,d],[6,2,d],[7,2,d],[8,2,d],[9,2,d],[10,2,d],
    [4,3,d],[5,3,d],[6,3,e],[7,3,d],[8,3,d],[9,3,e],[10,3,d],[11,3,d],
    [4,4,w],[5,4,w],[6,4,w],[7,4,w],[8,4,w],[9,4,w],[10,4,w],[11,4,w],
    [4,5,d],[5,5,d],[6,5,d],[7,5,d],[8,5,d],[9,5,d],[10,5,d],[11,5,d],
    [5,6,w],[6,6,w],[7,6,w],[8,6,w],[9,6,w],[10,6,w],
    [5,7,d],[7,7,d],[9,7,d],
    [6,8,w],[10,8,w],
    [5,9,d],[9,9,d],
  ];
  return buildSVG(px, 16, 11);
}

function impSVG() {
  const r='#cc2200',d='#aa1100',h='#ff4422',e='#ffff00';
  const px = [
    [5,0,r],[10,0,r],[6,1,r],[9,1,r], // horns
    [5,2,r],[6,2,r],[7,2,r],[8,2,r],[9,2,r],[10,2,r],
    [4,3,r],[5,3,r],[6,3,h],[7,3,r],[8,3,r],[9,3,h],[10,3,r],[11,3,r],
    [4,4,r],[5,4,r],[6,4,r],[7,4,r],[8,4,r],[9,4,r],[10,4,r],[11,4,r],
    [5,5,r],[6,5,'#111'],[7,5,r],[8,5,r],[9,5,'#111'],[10,5,r],
    [1,3,d],[2,3,d],[2,4,d],[1,4,d],[1,5,d], // left wing
    [13,3,d],[14,3,d],[13,4,d],[14,4,d],[14,5,d], // right wing
    [5,6,d],[6,6,d],[7,6,d],[8,6,d],[9,6,d],[10,6,d],
    [5,7,r],[6,7,r],[7,7,r],[8,7,r],[9,7,r],[10,7,r],
    [6,8,r],[7,8,r],[8,8,r],[9,8,r],
    [6,9,d],[7,9,d],[8,9,d],[9,9,d],
    [11,7,d],[12,7,d],[13,8,d],[13,9,d],[12,10,d],[11,10,d], // tail
    [5,10,d],[6,10,d],[8,10,d],[9,10,d],
  ];
  return buildSVG(px, 16, 12);
}

function trollSVG() {
  const g='#5a7a5a',d='#3a5a3a',s='#8aaa7a',e='#ff2200',w='#ffffcc';
  const px = [
    [4,0,g],[5,0,g],[6,0,g],[7,0,g],[8,0,g],[9,0,g],[10,0,g],[11,0,g],
    [3,1,g],[4,1,g],[5,1,g],[6,1,g],[7,1,g],[8,1,g],[9,1,g],[10,1,g],[11,1,g],[12,1,g],
    [3,2,g],[4,2,g],[5,2,e],[6,2,e],[7,2,g],[8,2,s],[9,2,s],[10,2,e],[11,2,e],[12,2,g],
    [3,3,g],[4,3,g],[5,3,g],[6,3,g],[7,3,g],[8,3,g],[9,3,g],[10,3,g],[11,3,g],[12,3,g],
    [5,4,g],[6,4,w],[7,4,g],[8,4,g],[9,4,w],[10,4,g],
    [6,5,w],[9,5,w], // tusks
    [3,5,d],[4,5,d],[5,5,d],[6,5,d],[7,5,d],[8,5,d],[9,5,d],[10,5,d],[11,5,d],[12,5,d],
    [2,6,g],[3,6,g],[4,6,g],[5,6,g],[6,6,g],[7,6,g],[8,6,g],[9,6,g],[10,6,g],[11,6,g],[12,6,g],[13,6,g],
    [2,7,d],[3,7,d],[4,7,d],[5,7,d],[6,7,d],[7,7,d],[8,7,d],[9,7,d],[10,7,d],[11,7,d],[12,7,d],[13,7,d],
    [2,8,g],[3,8,g],[4,8,g],[5,8,g],[6,8,g],[7,8,g],[8,8,g],[9,8,g],[10,8,g],[11,8,g],[12,8,g],[13,8,g],
    [0,6,g],[1,6,g],[0,7,g],[1,7,g],[0,8,g],[1,8,g],[0,5,d],[1,5,d],[0,4,d], // left arm+club
    [14,6,g],[15,6,g],[14,7,g],[15,7,g],[14,8,g],[15,8,g], // right arm
    [4,9,d],[5,9,d],[6,9,d],[7,9,d],[8,9,d],[9,9,d],[10,9,d],[11,9,d],
    [4,10,g],[5,10,g],[6,10,g],[7,10,g],[8,10,g],[9,10,g],[10,10,g],[11,10,g],
    [3,11,g],[4,11,g],[5,11,g],[6,11,g],[9,11,g],[10,11,g],[11,11,g],[12,11,g],
  ];
  return buildSVG(px, 16, 13, 5); // bigger scale for the boss
}

// ── RENDER ────────────────────────────────────────────────────────────────────
function render() {
  renderHeader();
  renderHero();
  renderFloorNav();
  renderEnemy();
  renderRoster();
}

function renderHeader() {
  const title = getTitleForXP(state.xp);
  document.getElementById('player-title').textContent  = title.name;
  document.getElementById('xp-val').textContent        = state.xp;
  document.getElementById('paid-val').textContent      = state.totalPaid.toFixed(2);
  document.getElementById('remaining-val').textContent = totalRemaining().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderHero() {
  const title = getTitleForXP(state.xp);
  const next  = getNextTitle(state.xp);

  document.getElementById('hero-sprite').innerHTML = heroSVG(title.tier);
  document.getElementById('hero-gear').textContent = title.gear;

  if (next) {
    const prev = title.minXP;
    const pct  = Math.min(100, ((state.xp - prev) / (next.minXP - prev)) * 100);
    document.getElementById('xp-bar').style.width  = pct + '%';
    document.getElementById('xp-bar-label').textContent = `${state.xp} / ${next.minXP} XP`;
  } else {
    document.getElementById('xp-bar').style.width  = '100%';
    document.getElementById('xp-bar-label').textContent = 'MAX RANK';
  }
}

function renderFloorNav() {
  document.querySelectorAll('.floor-btn').forEach(btn => {
    const f = parseInt(btn.dataset.floor);
    const enemies = state.debts.filter(d => d.floor === f);
    btn.classList.toggle('active',   f === state.currentFloor);
    btn.classList.toggle('cleared',  enemies.length > 0 && enemies.every(d => d.defeated));
  });
}

function renderEnemy() {
  const enemy = state.debts.find(d => d.id === state.activeEnemyId);
  if (!enemy) return;

  document.getElementById('enemy-sprite').innerHTML = enemySVG(enemy.type);
  document.getElementById('enemy-name').textContent = enemy.name;

  const pct = hpPct(enemy);
  document.getElementById('enemy-hp-bar').style.width      = pct + '%';
  document.getElementById('enemy-hp-bar').style.background = hpColor(pct);
  document.getElementById('enemy-hp-text').textContent =
    `${fmt(remaining(enemy))} remaining of ${fmt(enemy.amount)}`;

  const taunt = enemy.defeated
    ? '"...you have bested me."'
    : enemy.taunts[Math.floor(Math.random() * enemy.taunts.length)];
  document.getElementById('enemy-taunt').textContent = taunt;
  document.getElementById('enemy-taunt').style.color = enemy.defeated ? 'var(--green)' : '';
}

function renderRoster() {
  const roster = document.getElementById('enemy-roster');
  const floorEnemies = state.debts.filter(d => d.floor === state.currentFloor);

  roster.innerHTML = floorEnemies.map(d => {
    const pct = hpPct(d);
    const rem = remaining(d);
    return `
      <div class="enemy-card ${d.defeated ? 'defeated' : ''} ${d.id === state.activeEnemyId ? 'active' : ''}"
           data-id="${d.id}">
        <div class="card-name">${d.name}</div>
        <div class="card-amount">${fmt(rem)}</div>
        <div class="card-status">${d.defeated ? '✓ DEFEATED' : `${pct.toFixed(0)}% HP`}</div>
        <div class="card-hp-mini">
          <div class="card-hp-fill" style="width:${pct}%;background:${hpColor(pct)}"></div>
        </div>
      </div>`;
  }).join('');

  roster.querySelectorAll('.enemy-card:not(.defeated)').forEach(card => {
    card.addEventListener('click', () => selectEnemy(card.dataset.id));
  });
}

// ── ACTIONS ───────────────────────────────────────────────────────────────────
function selectEnemy(id) {
  const enemy = state.debts.find(d => d.id === id);
  if (!enemy || enemy.defeated) return;
  state.activeEnemyId = id;
  renderEnemy();
  renderRoster();
  save();
}

function switchFloor(floor) {
  state.currentFloor = floor;
  const first = state.debts.find(d => d.floor === floor && !d.defeated)
             || state.debts.find(d => d.floor === floor);
  if (first) state.activeEnemyId = first.id;
  render();
  save();
}

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  load();

  document.querySelectorAll('.floor-btn').forEach(btn => {
    btn.addEventListener('click', () => switchFloor(parseInt(btn.dataset.floor)));
  });

  // Rotate taunts every 5 seconds
  setInterval(() => {
    const enemy = state.debts.find(d => d.id === state.activeEnemyId);
    if (!enemy || enemy.defeated) return;
    const el = document.getElementById('enemy-taunt');
    if (el) {
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = enemy.taunts[Math.floor(Math.random() * enemy.taunts.length)];
        el.style.opacity = '1';
      }, 300);
    }
  }, 5000);

  render();
});
