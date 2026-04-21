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

// ── RANDOM EVENTS ────────────────────────────────────────────────────────────
const EVENTS = [
  { name: '⚡ LUCKY MONTH!',    desc: 'Tax refund energy! Double damage!',       mult: 2.0,  prob: 0.07 },
  { name: '🌟 CRITICAL HIT!',   desc: 'Caught them off guard! 1.5× damage!',     mult: 1.5,  prob: 0.12 },
  { name: '💪 DETERMINED!',     desc: 'Pure willpower! +20% bonus damage!',      mult: 1.2,  prob: 0.15 },
  { name: '💀 CURSED MONTH',    desc: 'Unexpected expense. Only 80% applies.',   mult: 0.8,  prob: 0.10 },
  { name: null,                                                                   mult: 1.0,  prob: 0.56 },
];

function rollEvent() {
  const cls = state.playerClass;
  const pool = EVENTS.map(e => {
    let prob = e.prob;
    if (cls === 'mage'  && e.name?.includes('LUCKY'))    prob = prob * 2;
    if (cls === 'rogue' && e.name?.includes('CRITICAL')) prob = prob * 2;
    return { ...e, prob };
  });
  const total = pool.reduce((s, e) => s + e.prob, 0);
  let r = Math.random() * total, sum = 0;
  for (const e of pool) { sum += e.prob; if (r < sum) return e; }
  return pool[pool.length - 1];
}

// ── LOOT DROPS ────────────────────────────────────────────────────────────────
const LOOT = {
  goblin:  ["Tattered Coin Pouch", "Goblin's Ear (+5 luck)", "Rusted Copper Ring"],
  slime:   ["Slime Core", "Gooey Interest Token", "Blob Fragment"],
  ghost:   ["Forgotten Bill Receipt", "Spectral Envelope", "Ghost Coin"],
  rat:     ["Chewed Wallet", "Rat King's Tooth", "Gnawed Copper"],
  specter: ["Spectral Essence", "Ledger Page Fragment", "Faded Invoice"],
  phantom: ["Phantom Dust", "Whisper Token", "Silver Sliver"],
  imp:     ["Imp's Tail (APR immunity)", "Mischief Potion", "Cursed Credit Scroll"],
  vampire: ["Bloodless Ledger", "Fang of Compound Interest", "Crimson Credit Card"],
  witch:   ["Hexed Invoice", "Cauldron Coin", "Cursed Late Fee Scroll"],
  spider:  ["Debt Web Fragment", "Eight-Eyed Crystal", "Silk-Wrapped Statement"],
  troll:   ["Troll Bridge Key 🗝️", "Boss Ruby (+100 XP)", "Freedom Stone 💎"],
  dragon:  ["Dragon Scale Fragment", "Hoard Ember", "Ancient Debt Tome"],
  golem:   ["Stone of Bad Decisions", "Cracked Credit Tablet", "Iron Will Shard"],
  ogre:    ["Ogre Club Splinter", "Smashed Piggy Bank", "Blunt Force Receipt"],
};

// ── GEAR CHEST LOOT ──────────────────────────────────────────────────────────
const GEAR_CHEST_LOOT = [
  'Iron Buckler',       'Leather Greaves',    'Copper Amulet',
  'Healing Herb',       'Lucky Rabbit\'s Foot','Steel-tipped Boots',
  'Chainmail Coif',     'Enchanted Ring',     'Battle Rations',
  'Map of Savings',     'Thrifty Cloak',      'Budgeter\'s Tome',
  'Anti-Debt Charm',    'Silver Pauldron',    'Mana Flask',
  'Scroll of Compound Interest (reversed)',   'Shield of Frugality',
];

// ── MONSTER TAUNTS LOOKUP ────────────────────────────────────────────────────
const MONSTER_TAUNTS = {
  goblin:  ['"You\'ll be paying me forever!"', '"Every missed payment feeds my power!"', '"Interest compounds daily. Sleep well."', '"Your degree was worth every copper... said no one."'],
  slime:   ['"I\'m small, but I multiply with interest!"', '"You can\'t squish what keeps growing!"', '"Cheap debt is still debt, adventurer."', '"I seep into everything. Especially your wallet."'],
  ghost:   ['"I haunt your credit report long after you forget me."', '"Even the dead can collect on debts."', '"I am every forgotten subscription you still pay."', '"Boo. Also — you owe me."'],
  rat:     ['"Small? Yes. Going away? No."', '"I gnaw at your finances every single day."', '"Ignore me and I\'ll chew through your savings."', '"Every forgotten fee feeds my kin."'],
  specter: ['"I haunt your credit history from beyond!"', '"You can\'t outrun what you owe."', '"Every dollar you spend should be mine."'],
  phantom: ['"Small debt, big guilt!"', '"I may be tiny, but I\'m still here."', '"Pay me first. I\'m the easiest."'],
  imp:     ['"APR is my favorite spell!"', '"Late fees make me stronger!"', '"Buy now. Suffer later. Hehehe."'],
  vampire: ['"I drain a little every month whether you like it or not."', '"Your APR is my favorite flavor."', '"Compound interest? We call that dinner."', '"I\'ve been feeding on your minimum payments for years."', '"You invited me in. The direct debit said so."'],
  witch:   ['"I\'ve cursed your credit score with late fees!"', '"Every month you don\'t pay, my hex grows stronger."', '"Eye of newt, toe of frog, 24.99% APR."', '"My cauldron bubbles with your accumulated interest."'],
  spider:  ['"I\'ve been weaving this debt web for months."', '"Trapped — just like your finances."', '"My eight eyes see every missed payment."', '"Struggle all you want. The interest holds."'],
  troll:   ['"NONE SHALL PASS without a monthly payment!"', '"I am the debt that breaks adventurers!"', '"Your car depreciates. I do not."', '"60 months? More like forever. RARGH!"'],
  dragon:  ['"I hoard gold. You hand it to me monthly."', '"My fire melts credit scores."', '"Centuries old. Your debt is young. I\'ll outlast it."', '"Every missed payment adds to my hoard."', '"I don\'t accept minimum payments. Only tribute."'],
  golem:   ['"I was carved from your bad decisions."', '"Stone doesn\'t care about your excuses."', '"I am immovable. So is your debt."', '"Every late fee adds another stone to my body."'],
  ogre:    ['"OGRE SMASH YOUR SAVINGS!"', '"Big debt. Big problem. Big ogre."', '"Me hungry. Credit score tasty."', '"Ogre been waiting. Ogre will keep waiting."', '"RARGH! Pay or ogre sit on your dreams!"'],
};

// Per-type suggested floor based on typical debt size
const MONSTER_SUGGESTIONS = [
  { maxAmount: 200,   type: 'rat',     floor: 1 },
  { maxAmount: 500,   type: 'slime',   floor: 1 },
  { maxAmount: 800,   type: 'ghost',   floor: 1 },
  { maxAmount: 1200,  type: 'imp',     floor: 2 },
  { maxAmount: 2000,  type: 'vampire', floor: 2 },
  { maxAmount: 3500,  type: 'witch',   floor: 2 },
  { maxAmount: 6000,  type: 'troll',   floor: 3 },
  { maxAmount: 12000, type: 'dragon',  floor: 3 },
  { maxAmount: Infinity, type: 'golem', floor: 3 },
];

function suggestMonster(amount) {
  return MONSTER_SUGGESTIONS.find(s => amount <= s.maxAmount)
      || MONSTER_SUGGESTIONS[MONSTER_SUGGESTIONS.length - 1];
}

// ── HERO CUSTOMIZATION PALETTES ──────────────────────────────────────────────
const HAIR_COLORS = [
  { id:'raven',    name:'Raven',    val:'#1a0a00', shadow:'#100500' },
  { id:'brunette', name:'Brunette', val:'#4a2c0a', shadow:'#2a1400' },
  { id:'auburn',   name:'Auburn',   val:'#7a3510', shadow:'#4a1a00' },
  { id:'blonde',   name:'Blonde',   val:'#c8a040', shadow:'#886010' },
  { id:'ginger',   name:'Ginger',   val:'#c84010', shadow:'#882000' },
  { id:'silver',   name:'Silver',   val:'#9090a0', shadow:'#606070' },
  { id:'white',    name:'White',    val:'#e0dce8', shadow:'#a0a0b0' },
  { id:'violet',   name:'Violet',   val:'#6030a0', shadow:'#401870' },
];

const SKIN_TONES = [
  { id:'fair',   name:'Fair',   val:'#fde4d0', shadow:'#d4a880' },
  { id:'light',  name:'Light',  val:'#fdbcb4', shadow:'#d8907a' },
  { id:'medium', name:'Medium', val:'#d4845a', shadow:'#a05830' },
  { id:'tan',    name:'Tan',    val:'#b06030', shadow:'#803010' },
  { id:'dark',   name:'Dark',   val:'#7a3a10', shadow:'#502208' },
];

const ARMOR_COLORS = [
  { id:'steel',   name:'Steel',   val:'#9090a0', shadow:'#606070' },
  { id:'gold',    name:'Gold',    val:'#d4a800', shadow:'#906000' },
  { id:'crimson', name:'Crimson', val:'#901820', shadow:'#601010' },
  { id:'forest',  name:'Forest',  val:'#286820', shadow:'#184010' },
  { id:'ocean',   name:'Ocean',   val:'#205888', shadow:'#103060' },
  { id:'void',    name:'Void',    val:'#281838', shadow:'#180c28' },
  { id:'copper',  name:'Copper',  val:'#b05820', shadow:'#703010' },
  { id:'rose',    name:'Rose',    val:'#9a3060', shadow:'#601840' },
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

// ── ACHIEVEMENTS ─────────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id: 'first_blood',  icon: '🗡️',  name: 'First Blood',       desc: 'Make your first payment' },
  { id: 'century',      icon: '💯',  name: 'Century Club',       desc: 'Pay $100 in one attack' },
  { id: 'big_hit',      icon: '💥',  name: 'Big Hit',            desc: 'Pay $500 in one attack' },
  { id: 'goblin_slayer',icon: '👺',  name: 'Goblin Slayer',      desc: 'Defeat the Student Debt Goblin' },
  { id: 'ghostbuster',  icon: '👻',  name: 'Ghostbuster',        desc: 'Clear all Floor 1 enemies' },
  { id: 'sub2k',        icon: '💰',  name: 'Sub-2K Hero',        desc: 'Total remaining drops below $2,000' },
  { id: 'imp_hunter',   icon: '😈',  name: 'Imp Hunter',         desc: 'Defeat both Credit Card Imps' },
  { id: 'consistent',   icon: '⚔️',  name: 'Consistent Slayer',  desc: 'Make 10 total payments' },
  { id: 'halfway',      icon: '🌗',  name: 'Halfway There',      desc: 'Pay off 50% of total debt' },
  { id: 'credit_climb', icon: '📈',  name: 'Credit Climber',     desc: 'Credit score reaches 700' },
  { id: 'troll_slayer', icon: '🧌',  name: 'Troll Slayer',       desc: 'Defeat the Car Loan Troll' },
  { id: 'castle',       icon: '🏰',  name: 'Castle Claimed',     desc: 'Defeat every last debt' },
];

function checkAchievements() {
  const score   = creditScore();
  const total   = state.debts.reduce((s, d) => s + d.amount, 0);
  const paidPct = total > 0 ? (state.totalPaid / total) * 100 : 0;
  const rem     = state.debts.reduce((s, d) => s + Math.max(0, d.amount - d.paid), 0);

  const conditions = {
    first_blood:   () => state.totalPaid > 0,
    century:       () => state.lastPayment >= 100,
    big_hit:       () => state.lastPayment >= 500,
    goblin_slayer: () => state.debts.find(d => d.id === 'student')?.defeated,
    ghostbuster:   () => state.debts.filter(d => d.floor === 1).every(d => d.defeated),
    sub2k:         () => rem < 2000 && rem > 0,
    imp_hunter:    () => state.debts.filter(d => d.type === 'imp').every(d => d.defeated),
    consistent:    () => state.paymentCount >= 10,
    halfway:       () => paidPct >= 50,
    credit_climb:  () => score >= 700,
    troll_slayer:  () => state.debts.find(d => d.id === 'car')?.defeated,
    castle:        () => state.debts.every(d => d.defeated),
  };

  const newOnes = [];
  for (const ach of ACHIEVEMENTS) {
    if (!state.achievements.includes(ach.id) && conditions[ach.id]?.()) {
      state.achievements.push(ach.id);
      newOnes.push(ach);
    }
  }
  return newOnes;
}

function checkTitles() {
  const newOnes = [];
  for (const t of TITLES) {
    if (!state.earnedTitles.includes(t.id) && state.xp >= t.minXP) {
      state.earnedTitles.push(t.id);
      newOnes.push(t);
    }
  }
  // Auto-equip highest earned
  const highest = [...TITLES].reverse().find(t => state.earnedTitles.includes(t.id));
  if (highest && highest.id !== state.equippedTitle) {
    state.equippedTitle = highest.id;
  }
  return newOnes;
}

// ── STATE ─────────────────────────────────────────────────────────────────────
const state = {
  debts:          JSON.parse(JSON.stringify(INITIAL_DEBTS)),
  xp:             0,
  totalPaid:      0,
  paymentCount:   0,
  currentFloor:   1,
  activeEnemyId:  'student',
  loot:           [],
  log:            [],
  lastPayment:    0,
  achievements:   [],
  earnedTitles:   ['squire'],
  equippedTitle:  'squire',
  playerName:     '',
  playerClass:    'slayer',
  heroCustom:     { hair: null, skin: null, armor: null },
  heroStyle:      'default',
  pendingChest:   null,
  manualScore:    null,
  scoreUpdateDate:null,
};

// ── PERSISTENCE ───────────────────────────────────────────────────────────────
const SAVE_KEY = 'dq_v2';

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    debts:         state.debts,
    xp:            state.xp,
    totalPaid:     state.totalPaid,
    paymentCount:  state.paymentCount,
    currentFloor:  state.currentFloor,
    activeEnemyId: state.activeEnemyId,
    loot:          state.loot,
    log:           state.log.slice(0, 30),
    lastPayment:   state.lastPayment,
    achievements:  state.achievements,
    earnedTitles:  state.earnedTitles,
    equippedTitle: state.equippedTitle,
    playerName:    state.playerName,
    playerClass:   state.playerClass,
    heroCustom:    state.heroCustom,
    heroStyle:     state.heroStyle,
    pendingChest:    state.pendingChest,
    manualScore:     state.manualScore,
    scoreUpdateDate: state.scoreUpdateDate,
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
// String-row engine: each row is a string, each char maps to a color via palette.
// '.' = transparent. All rows may differ in length (trailing transparent).
function spr(rows, pal, scale = 5) {
  const H = rows.length;
  const W = Math.max(...rows.map(r => r.length));
  const rects = [];
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const col = pal[rows[r][c]];
      if (col) rects.push(`<rect x="${c*scale}" y="${r*scale}" width="${scale}" height="${scale}" fill="${col}"/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W*scale} ${H*scale}" width="${W*scale}" height="${H*scale}" style="image-rendering:pixelated;display:block">${rects.join('')}</svg>`;
}

// ── HERO (12 wide × 26 tall, scale 5 = 60×130px) ────────────────────────────
function heroSVG(tier, scale = 5) {
  // Per-tier color palette
  const T = [
    { A:'#9B8060', a:'#6B5030', W:'#A8A8A8', w:'#686868', H:'#3A2A12', h:'#5A4020', cp:null    }, // 0 cloth
    { A:'#8B6010', a:'#5A3A00', W:'#C0C0C0', w:'#808080', H:'#8B6010', h:'#5A3A00', cp:null    }, // 1 leather
    { A:'#9090A0', a:'#606070', W:'#E8E8E8', w:'#A0A0B0', H:'#808090', h:'#505060', cp:null    }, // 2 chain
    { A:'#6080A0', a:'#405060', W:'#FFD700', w:'#CC9900', H:'#506070', h:'#304050', cp:'#506070'}, // 3 plate
    { A:'#503090', a:'#301860', W:'#FF5050', w:'#CC1010', H:'#401880', h:'#200840', cp:'#8B0000'}, // 4 dragon
    { A:'#D4A800', a:'#906000', W:'#FFFFFF', w:'#DDDDDD', H:'#C08000', h:'#806000', cp:'#8B6914'}, // 5 legend
  ][Math.min(tier, 5)];

  const SK='#FDBCB4', sk='#D8907A', EY='#222222';
  const PA='#2A2A70', pa='#18185A';
  const BT=T.a,       bl='#4A2A08';

  const rows = [
    // helmet / hair
    tier===0
      ? `....${T.H}${T.H}${T.H}${T.H}....`
      : `...${T.H}${T.H}${T.H}${T.H}${T.H}${T.H}...`,
    tier>=1
      ? `..${T.H}${SK}${SK}${SK}${SK}${SK}${SK}${T.H}..`
      : `...${SK}${SK}${SK}${SK}${SK}${SK}....`,
    // face row with eyes
    tier>=1
      ? `..${T.H}${SK}${sk}${EY}${SK}${EY}${sk}${SK}${T.H}..`
      : `...${SK}${sk}${EY}${SK}${EY}${sk}${SK}....`,
    // face
    `....${SK}${SK}${SK}${SK}${SK}${SK}....`,
    `....${sk}${SK}${SK}${SK}${SK}${sk}....`,
    // neck
    `....${SK}${SK}${SK}${SK}${SK}.....`,
    // shoulders + torso
    tier>=4
      ? `..${T.cp}${T.A}${T.A}${T.A}${T.A}${T.A}${T.A}${T.cp}..`
      : `...${T.A}${T.A}${T.A}${T.A}${T.A}${T.A}....`,
    // sword on right, torso
    `${T.W}..${T.A}${T.A}${T.A}${T.A}${T.A}${T.A}....`,
    `${T.W}..${T.A}${T.A}${T.A}${T.A}${T.A}${T.A}....`,
    `${T.w}${T.w}.${T.A}${bl}${bl}${bl}${bl}${T.A}....`,  // belt
    // shield on left (tier 2+), torso continues
    tier>=2
      ? `..${T.a}${T.a}${T.A}${T.A}${T.A}${T.A}${T.A}.${T.W}.`
      : `...${T.A}${T.A}${T.A}${T.A}${T.A}${T.A}.${T.W}.`,
    tier>=2
      ? `..${T.a}${T.a}${T.A}${T.A}${T.A}${T.A}${T.A}.${T.w}.`
      : `...${T.A}${T.A}${T.A}${T.A}${T.A}${T.A}.${T.w}.`,
    // legs
    `....${PA}${PA}${T.A}${T.A}${PA}....`,
    `....${PA}${PA}${T.A}${T.A}${PA}....`,
    `....${pa}${PA}${pa}${pa}${PA}....`,
    // boots
    `....${BT}${BT}${BT}${BT}${BT}....`,
    `....${BT}${BT}${BT}${BT}${BT}....`,
    tier>=5
      ? `...${T.W}${BT}${BT}${BT}${BT}${T.W}...`   // glowing boots at legend
      : `....${BT}${BT}${BT}${BT}${BT}....`,
  ];

  // Build from structured rows above - but let's use raw strings for clarity:
  const heroRows = [
    tier===0 ? '....HHHH....' : '...HHHHHH...',
    tier>=1  ? '..HSSSSSSH..' : '...SSSSSS...',
    tier>=1  ? '..HSsESEsH..' : '...SsESEs...',
    '....SSSSSS....',
    '....sSSSSs....',
    '.....SSSS.....',
    tier>=4  ? '..XAAAAAA X..' : '...AAAAAA...',
    'W..AAAAAA....',
    'W..AAAAAA....',
    'ww.AbbbbbA...',
    tier>=2  ? '..aaAAAAA.W.' : '...AAAAA..W.',
    tier>=2  ? '..aaAAAAA.w.' : '...AAAAA..w.',
    '....PPAPPPP..',
    '....PPAPPPP..',
    '....pPpppP...',
    '....BBBBB....',
    '....BBBBB....',
    tier>=5  ? '...WBBBBBW..' : '....BBBBB....',
  ];

  const c = state.heroCustom || {};
  const pal = {
    S: c.skin?.val    || SK,
    s: c.skin?.shadow || sk,
    E: EY,
    H: c.hair?.val    || T.H,
    h: c.hair?.shadow || T.h,
    A: c.armor?.val   || T.A,
    a: c.armor?.shadow|| T.a,
    W: T.W, w: T.w,
    X: T.cp || c.armor?.val || T.A,
    b: bl,
    P: PA, p: pa,
    B: c.armor?.shadow || BT,
  };
  return spr(heroRows, pal, scale);
}

// ── HERO FEMININE ─────────────────────────────────────────────────────────────
function heroFemSVG(tier, scale = 5) {
  const T = [
    { A:'#9B8060', a:'#6B5030', W:'#A8A8A8', w:'#686868', H:'#3A2A12', h:'#5A4020', cp:null    },
    { A:'#8B6010', a:'#5A3A00', W:'#C0C0C0', w:'#808080', H:'#8B6010', h:'#5A3A00', cp:null    },
    { A:'#9090A0', a:'#606070', W:'#E8E8E8', w:'#A0A0B0', H:'#808090', h:'#505060', cp:null    },
    { A:'#6080A0', a:'#405060', W:'#FFD700', w:'#CC9900', H:'#506070', h:'#304050', cp:'#506070'},
    { A:'#503090', a:'#301860', W:'#FF5050', w:'#CC1010', H:'#401880', h:'#200840', cp:'#8B0000'},
    { A:'#D4A800', a:'#906000', W:'#FFFFFF', w:'#DDDDDD', H:'#C08000', h:'#806000', cp:'#8B6914'},
  ][Math.min(tier, 5)];

  const SK='#FDBCB4', sk='#D8907A', EY='#222222';
  const PA='#2A2A70', pa='#18185A';
  const bl='#4A2A08';

  const c = state.heroCustom || {};
  const pal = {
    S: c.skin?.val    || SK,
    s: c.skin?.shadow || sk,
    E: EY,
    H: c.hair?.val    || T.H,
    h: c.hair?.shadow || T.h,
    A: c.armor?.val   || T.A,
    a: c.armor?.shadow|| T.a,
    W: T.W, w: T.w,
    X: T.cp || c.armor?.val || T.A,
    b: bl, P: PA, p: pa,
    B: c.armor?.shadow || T.a,
  };

  const femRows = [
    // Hair top (wider)
    tier===0 ? '..HHHHHHHH....' : '...HHHHHH...',
    // Head sides: long flowing hair at tier 0, helmet at tier 1+
    tier>=1  ? '..HSSSSSSH..'   : '.HHSSSSSSSHH.',
    // Eyes
    tier>=1  ? '..HSsESEsH..'   : '.HHSsESEsHH.',
    // Lower face: hair framing wide at tier 0
    tier>=1  ? '....SSSSSS....' : '.HHsSSSSsSHH.',
    // Chin
    '....sSSSSs....',
    // Neck: ponytail visible on right at all tiers, long hair on left at tier 0
    tier===0  ? '.H...SSSS....H' : '.....SSSS..HH',
    // Shoulders: cape/hair draping at tier 0, ponytail at tier 1+
    tier>=4   ? '..XAAAAAA...HH' :
    tier===0  ? 'H..AAAAAA....H' : '...AAAAAA..HH',
    // Torso + sword: ponytail bottom
    tier===0  ? 'WH.AAAAAA....H' : 'W..AAAAAA..H.',
    tier===0  ? 'WH.AAAAAA.....' : 'W..AAAAAA....',
    // Belt
    'ww.AbbbbbA...',
    // Shield + lower torso
    tier>=2  ? '..aaAAAAA.W.' : '...AAAAA..W.',
    tier>=2  ? '..aaAAAAA.w.' : '...AAAAA..w.',
    // Legs
    '....PPAPPPP..',
    '....PPAPPPP..',
    '....pPpppP...',
    // Boots
    '....BBBBB....',
    '....BBBBB....',
    tier>=5  ? '...WBBBBBW..' : '....BBBBB....',
  ];

  return spr(femRows, pal, scale);
}

// ── GOBLIN (20 wide × 20 tall) ───────────────────────────────────────────────
function goblinSVG() {
  const rows = [
    '....gg........gg....',   // ear tips
    '...gGGg......gGGg...',   // ears
    '....GGGGGGGGGGGg....',   // head top
    '...GGGGGGGGGGGGGg...',   // head
    '...GGGeGGGGGeGGGg...',   // red eyes
    '...GGGEGGGGGEGGGd...',   // eye glow
    '...GGGGGyyGGGGGGd...',   // yellow nose
    '...GGGGGGGGGGGGGd...',   // lower face
    '...GkTkTkTkTGGGd....',   // teeth grin
    '...GGGGGGGGGGGGd....',   // chin
    '....cCCCCCCCCCcg....',   // clothes collar
    '...cCCCCCCCCCCCCg...',   // body
    '..wcCCCCCCCCCCCCw...',   // arms out w/ claws
    '..wcCCCCCCCCCCCCw...',
    '..wwcCCCCCCCCCcww...',   // claw spread
    '....cCCCC..cCCCC....',   // legs
    '....cCCCC..cCCCC....',
    '....cCCCC..cCCCC....',
    '....bbbbb..bbbbb....',   // boots
    '...bbbbbb..bbbbbb...',
  ];
  return spr(rows, {
    G:'#3ab03a', g:'#2a8a2a', d:'#1a5a1a',
    e:'#ff3333', E:'#ff8800', y:'#ccaa00',
    k:'#1a0000', T:'#ffe8c0',
    C:'#8a5a30', c:'#5a3a10', b:'#3a2008',
    w:'#f0e880',
  });
}

// ── SPECTER (18 wide × 24 tall) ──────────────────────────────────────────────
function specterSVG() {
  const rows = [
    '.......WW.........',   // wispy crown
    '......WWWW........',
    '.....WWWWWWW......',
    '....WWWWWWWWWW....',
    '....WwRwWWwRwW....',   // glowing red eyes
    '....WWWwWWwWWW....',
    '...WWWWWWWWWWWWW..',   // main body
    '...WwWWWWWWWWWwW..',
    '...WWWWwwwwWWWWW..',   // inner shadow
    '....WWWWWWWWWWW...',
    '....WwWWWWWWWwW...',
    '.....WWWWWWWWW....',
    '.....wWWWWWWwW....',
    '......WWWWWWW.....',
    '......wWwwWwW.....',   // wispy lower edge
    '.......WwwwW......',
    '.......wW.Ww......',   // tendrils
    '........W.W.......',
    '....W...w.w...W...',   // side wisps
    '.....w.......w....',
    '......W.....W.....',
    '.......w...w......',
    '........W.W.......',
    '.........w........',
  ];
  return spr(rows, {
    W:'#b0ccff', w:'#7099ee', R:'#ff3333',
  });
}

// ── PHANTOM (16 wide × 22 tall) ──────────────────────────────────────────────
function phantomSVG() {
  const rows = [
    '.......WW.......',   // crown
    '......WWWW......',
    '.....WWWWWWW....',
    '....WWWWWWWWWW..',
    '....WwEwWWwEwW..',   // white eyes
    '....WWWWWWWWWW..',
    '...WWWWWWWWWWWW.',
    '...WwWWwwwwWWwW.',
    '...WWWWWWWWWWWW.',
    '....WWWWWWWWWW..',
    '....wWWwwwWWWw..',
    '.....WWWWWWWW...',
    '.....wWwwwWwW...',
    '......WwwwWW....',
    '......wW..Ww....',
    '.......W..W.....',
    '...W...w..w...W.',
    '....w.........w.',
    '.....W.......W..',
    '......w.....w...',
    '.......W...W....',
    '........w.w.....',
  ];
  return spr(rows, {
    W:'#ddb0ff', w:'#9966cc', E:'#ffffff',
  });
}

// ── IMP (20 wide × 24 tall) ──────────────────────────────────────────────────
function impSVG() {
  const rows = [
    '....rr......rr......',   // horn tips
    '...rRRr....rRRr.....',   // horns
    '....RRRRRRRRRR......',   // head top
    '...RRRRRRRRRRRR.....',
    '...RROoRRRRRoOR.....',   // orange eyes w/ pupils
    '...RRRRRRRRRRRRd....',
    '...RRRkRRRRkRRRd....',   // nostrils
    '..RRRRRRRRRRRRRRd...',
    'WW.RRRkkkkkkkRR.WW..',   // jagged mouth + wings
    'WW.RRRRRRRRRRRd.wW..',
    'Ww.RRRRRRRRRRRR.ww..',
    '...RRRRRRRRRRRR.....',   // body
    '...RRRRRRRRRRRR.....',
    '...rRRRRRRRRRRrr....',
    '....rRRRRRRRRr......',
    '....RRRR..RRRR......',   // legs
    '....RRRR..RRRR...rr.',   // tail starts
    '....rrrr..rrrr..rr..',
    '.....rr....rr..rr...',
    '...........r..rr....',
    '..............rRr...',   // tail tip
    '.............rRRr...',
  ];
  return spr(rows, {
    R:'#cc2200', r:'#881100', d:'#550800',
    O:'#ff6600', o:'#ffcc00', k:'#1a0000',
    W:'#770000', w:'#550000',
  });
}

// ── TROLL BOSS (26 wide × 28 tall, scale 5 = 130×140px) ─────────────────────
function trollSVG() {
  const rows = [
    '.........GGGGGGGG.........',   // top of huge head
    '.......GGGGGGGGGGGGg......',
    '......GGGGGeGGGGeGGGGg....',   // red eyes
    '......GGGGGGssGGGGGGGg....',   // snout highlight
    '.....GGGGGGGGGGGGGGGGGg...',
    '.....GGGwGGGGGGGGGwGGGGg..',   // tusks w=ivory
    '.....GGGGGGGGGGGGGGGGGGg..',
    '.....gGGkGkGkGkGkGGGGGgg..',   // teeth row
    '.....GGGGGGGGGGGGGGGGGgg..',
    '.....dDDDDDDDDDDDDDDDDd...',   // body top
    '....dDDDDDDDDDDDDDDDDDdd...',
    '..BbdDDDDDDDDDDDDDDDDDdBb.',   // arms + club
    '..BbdDDDDDDDDDDDDDDDDDdBb.',
    '.BBbdDDDDDDDDDDDDDDDDDdbBB',
    '.BBbdDDDDDDDDDDDDDDDDDdbBB',
    'BBBbdDDDDDDDDDDDDDDDDDdbbB',
    'BBBbbDDDDDDDDDDDDDDDDDdbBB',
    'BBBbdDDDDDDDDDDDDDDDDDdbbB',
    '.BBbbDDDDDDDDDDDDDDDDDdbBB',
    '..BbdDDDDD..DDDDDDDdBb.',    // legs gap
    '....dDDDDD..DDDDDDDd....',
    '....DDDDDDD..DDDDDDD....',
    '....DDDDDDD..DDDDDDD....',
    '....DDDDDDD..DDDDDDD....',
    '....ggggggg..ggggggg....',   // big feet
    '...gggggggg..gggggggg...',
    '..ggggggggg..ggggggggg..',
    '.gggggggggg..gggggggggg.',
  ];
  return spr(rows, {
    G:'#6a8a6a', g:'#4a6a4a', d:'#2a4a2a', D:'#3a5a3a',
    e:'#ff2200', s:'#8aaa7a', w:'#ffffcc',
    k:'#1a0808', B:'#5a3a1a', b:'#3a2008',
  }, 5);
}

// ── SLIME (14w × 12h) ────────────────────────────────────────────────────────
function slimeSVG() {
  return spr([
    '......hh......',
    '....SSSSSS....',
    '...SSSSSSSS...',
    '..SSeSSSSeSS..',
    '..SSSSSSSSSS..',
    '..SSSkSSSSSS..',
    '..SSSSSSSSSS..',
    '...SSSSSSSS...',
    '....SSSSSS....',
    '.....ssss.....',
    '......dd......',
  ], { S:'#44cc44', s:'#229922', h:'#aaffaa', e:'#1a1a1a', k:'#003300', d:'#115511' });
}

// ── GHOST (14w × 16h) ────────────────────────────────────────────────────────
function ghostSVG() {
  return spr([
    '......GG......',
    '.....GGGG.....',
    '....GGGGGG....',
    '....GeGGeG....',
    '....GGGGGG....',
    '....GGmGGG....',
    '....GGGGGG....',
    '...GGGGGGGG...',
    '...GGGGGGGG...',
    '...GGGGGGGG...',
    '..GGGGGGGGGG..',
    '..GGGGGGGGGG..',
    '..GGg.GGG.gG..',
    '..G...GGG...G.',
    '...G.......G..',
  ], { G:'#ddeeff', g:'#99bbdd', e:'#ff3333', m:'#333344' });
}

// ── RAT (16w × 12h) ──────────────────────────────────────────────────────────
function ratSVG() {
  return spr([
    '.e..e...........',
    '.eR..RRRRR......',
    '..RRRRRRRRn.....',
    '..CCRRRRRRR.....',
    '.CCCCCCCCCCCCCTT',
    '.CCCCCCCCCCCCC..',
    '.CCCCCCCCCCC....',
    '..llll..llll....',
    '..l......l......',
  ], { R:'#cc9966', e:'#ffaaaa', n:'#ffccaa', C:'#aa7744', c:'#885522', T:'#cc8866', l:'#884422' });
}

// ── VAMPIRE (14w × 18h) ──────────────────────────────────────────────────────
function vampireSVG() {
  return spr([
    '....hhhh......',
    '...hFFFFFh....',
    '...hFeFeFFh...',
    '...hFFFFFFFh..',
    '...hFfFFfFFh..',
    '....VVVVVVV...',
    '...VVVVVVVVV..',
    '..VVVVVVVVVVV.',
    '..VVVVVVVVVVV.',
    '.VVVVVVVVVVVVV',
    '.VVVVVVVVVVVVV',
    '..VV.VVVVV.VV.',
    '..VV..VVV..VV.',
    '..VVV.....VVV.',
    '..VVV.....VVV.',
    '...vv.....vv..',
    '...vv.....vv..',
  ], { F:'#f0e0e8', h:'#220022', e:'#ff2020', f:'#fffcfc', V:'#330044', v:'#220033' });
}

// ── WITCH (14w × 22h) ────────────────────────────────────────────────────────
function witchSVG() {
  return spr([
    '.......H......',
    '......HHH.....',
    '.....HHHHH....',
    '....HHHHHHH...',
    '...HHHHHHHHH..',
    '..HHHHHHHHHHH.',
    '...GgGGGGGgG..',
    '...GGeGGeGGG..',
    '...GGGGGGGGG..',
    '...GGmGGGGGG..',
    '....PPPPPPP...',
    '...PPPPPPPPP..',
    '..PPPPPPPPPPP.',
    '.PPPPPPPPPPPPP',
    '..PPP.....PPP.',
    '..PPP.....PPP.',
    '..PPP.....PPP.',
    '..bbb.....bbb.',
  ], { H:'#221122', G:'#c0a060', g:'#806030', e:'#ff4400', m:'#440000', P:'#6633aa', p:'#441188', b:'#1a1a1a' });
}

// ── SPIDER (18w × 12h) ───────────────────────────────────────────────────────
function spiderSVG() {
  return spr([
    'l..l..........l..l',
    '.l.l..........l.l.',
    '....SSSSSSSSSS....',
    '...SSSSeeeeSSSSS..',
    '...SSSSSSSSSSSS...',
    '....SSSSSSSSSS....',
    '.l.l..........l.l.',
    'l..l..........l..l',
    '.l................',
  ], { S:'#1a1a2a', e:'#ff3300', l:'#2a2a3a' });
}

// ── DRAGON (20w × 22h) ───────────────────────────────────────────────────────
function dragonSVG() {
  return spr([
    '.........hh.........',
    '........hDDh........',
    '.......DDDDDD.......',
    '......DDDeDeDD......',
    '......DDDDDDDD......',
    'WW....DDDDDDDD....WW',
    'WWWW.DDDDDDDDDD.WWWW',
    'WWWWWDDDDDDDDDDWWWWW',
    'WW...DDDDDDDDDD...WW',
    '.....DDDDDDDDDD.....',
    '.....DDDDDDDDD......',
    '....DDDDDDDDDDD.....',
    '....DDDDDDDDDDD.....',
    '.....DD.....DD......',
    '.....DD.....DD......',
    '.....dd.....dd......',
    '......TTTTTTT.......',
    '.......TTTTT........',
    '........TTT.........',
    '.........T..........',
  ], { D:'#8B0000', d:'#5a0000', h:'#cc4400', e:'#ff8800', W:'#600000', T:'#6a0000' });
}

// ── GOLEM (16w × 18h) ────────────────────────────────────────────────────────
function golemSVG() {
  return spr([
    '....GGGGGGGG....',
    '....GGGGGGGG....',
    '....GeGGGeGG....',
    '....GcGGGcGG....',
    '....GGGGGGGG....',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    'GGGGGGGGGGGGGGGG',
    'GGGGGGggGGGGGGGG',
    'GGGGGGGGGGGGGGGG',
    '..GGGGGGGGGGGG..',
    '....GG....GG....',
    '....GG....GG....',
    '....GG....GG....',
    '....gg....gg....',
    '....gg....gg....',
  ], { G:'#8a8070', g:'#5a5040', e:'#ff6600', c:'#6a6050' });
}

// ── OGRE (18w × 20h) ─────────────────────────────────────────────────────────
function ogreSVG() {
  return spr([
    '....OOOOOOOOOO....',
    '...OOOOOOOOOOOO...',
    '..OOOOeOOeOOOOO..',
    '..OOOOnnnnnOOOO..',
    '..OOOOttttOOOOO..',
    '..OOOOOOOOOOOOO..',
    '.OOOOOOOOOOOOOOO.',
    'BBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBB',
    '.BBBBBBBBBBBBBBBB.',
    '..BBBBBBBBBBBBBB..',
    '...BBBBB..BBBBB...',
    '...BBBBB..BBBBB...',
    '...BBBBB..BBBBB...',
    '...BBBBB..BBBBB...',
    '...bbbbb..bbbbb...',
    '..bbbbbb..bbbbbb..',
  ], { O:'#cc8844', e:'#ff2200', n:'#aa6622', t:'#ffe8c0', B:'#8a5530', b:'#5a3510' });
}

function enemySVG(type) {
  switch (type) {
    case 'goblin':  return goblinSVG();
    case 'slime':   return slimeSVG();
    case 'ghost':   return ghostSVG();
    case 'rat':     return ratSVG();
    case 'specter': return specterSVG();
    case 'phantom': return phantomSVG();
    case 'imp':     return impSVG();
    case 'vampire': return vampireSVG();
    case 'witch':   return witchSVG();
    case 'spider':  return spiderSVG();
    case 'troll':   return trollSVG();
    case 'dragon':  return dragonSVG();
    case 'golem':   return golemSVG();
    case 'ogre':    return ogreSVG();
    default:        return goblinSVG();
  }
}

// ── COMBAT ────────────────────────────────────────────────────────────────────
function addLog(msg, type = 'system') {
  state.log.unshift({ msg, type });
  if (state.log.length > 50) state.log.pop();
  renderLog();
}

function attack() {
  const input  = document.getElementById('payment-input');
  const amount = parseFloat(input.value);

  if (!amount || amount <= 0) {
    addLog('>> Enter a payment amount to attack!', 'system');
    return;
  }

  const enemy = state.debts.find(d => d.id === state.activeEnemyId);
  if (!enemy)          { addLog('>> Select an enemy first!', 'system'); return; }
  if (enemy.defeated)  { addLog('>> That enemy is already defeated!', 'system'); return; }

  const event      = rollEvent();
  const classMult  = state.playerClass === 'slayer' ? 1.1 : 1.0;
  const effective  = +(amount * event.mult * classMult).toFixed(2);

  // Apply damage
  state.lastPayment  = amount;
  state.totalPaid   += amount;
  state.paymentCount++;
  enemy.paid         = Math.min(enemy.amount, enemy.paid + effective);

  // Check HP threshold chests (75%, 50%, 25%)
  if (!enemy.chestsOpened) enemy.chestsOpened = [];
  const pctNow = hpPct(enemy);
  for (const t of [75, 50, 25]) {
    if (pctNow <= t && !enemy.chestsOpened.includes(t) && !enemy.defeated) {
      enemy.chestsOpened.push(t);
      const gear = GEAR_CHEST_LOOT[Math.floor(Math.random() * GEAR_CHEST_LOOT.length)];
      state.pendingChest = { gear, enemyName: enemy.name, threshold: t };
      addLog(`🎁 Treasure chest at ${t}% HP! Claim it!`, 'event');
      break;
    }
  }

  // XP: 1 per dollar + event bonus
  const xpGained = Math.round(amount + (event.mult > 1 ? amount * 0.3 : 0));
  state.xp += xpGained;

  // Log it
  addLog(`⚔ ATTACK! ${fmt(amount)} damage dealt!`, 'damage');
  if (event.name) {
    addLog(`${event.name} — ${event.desc}`, 'event');
    if (effective !== amount) addLog(`Effective hit: ${fmt(effective)}`, 'event');
  }
  addLog(`+${xpGained} XP`, 'system');

  // Animate
  floatDamage(fmt(amount));
  document.getElementById('enemy-panel').classList.add('shake');
  setTimeout(() => document.getElementById('enemy-panel').classList.remove('shake'), 380);

  // Defeat?
  let defeated = null;
  if (enemy.paid >= enemy.amount) {
    enemy.defeated = true;
    defeated = enemy;
    const drops = LOOT[enemy.type] || ['Mystery Item'];
    const drop  = drops[Math.floor(Math.random() * drops.length)];
    state.loot.push({ item: drop, from: enemy.name });
    addLog(`💀 ${enemy.name} DEFEATED! Loot: ${drop}`, 'defeat');
    // Bonus XP for kill
    state.xp += 50;
    addLog(`+50 KILL BONUS XP`, 'loot');
  }

  const newAchs    = checkAchievements();
  const newTitles  = checkTitles();

  input.value = '';
  save();
  render();

  if (defeated || newAchs.length || newTitles.length) {
    setTimeout(() => showModal(defeated, newAchs, newTitles), 500);
  }
}

function floatDamage(text) {
  const panel = document.getElementById('enemy-panel');
  const el    = document.createElement('div');
  el.className   = 'dmg-float';
  el.textContent = `-${text}`;
  panel.style.position = 'relative';
  panel.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

function showModal(defeated, newAchs = [], newTitles = [], custom = null) {
  if (custom) {
    document.getElementById('modal-icon').textContent  = custom.icon;
    document.getElementById('modal-title').textContent = custom.title;
    document.getElementById('modal-body').innerHTML    = `<p>${custom.body}</p>`;
    document.getElementById('modal-overlay').classList.remove('hidden');
    return;
  }

  const hasDefeat = !!defeated;
  const hasAchs   = newAchs.length > 0;
  const hasTitles = newTitles.length > 0;

  document.getElementById('modal-icon').textContent =
    hasDefeat ? '💀' : hasAchs ? '🏆' : '👑';
  document.getElementById('modal-title').textContent =
    hasDefeat ? 'ENEMY DEFEATED!' : hasAchs ? 'ACHIEVEMENT UNLOCKED!' : 'NEW TITLE!';

  let html = '';
  if (hasDefeat) {
    const loot = state.loot.find(l => l.from === defeated.name);
    html += `<p>${defeated.name} has been slain!</p>`;
    if (loot) html += `<p style="color:var(--purple);margin-top:6px">🎁 LOOT: ${loot.item}</p>`;
    html += `<p style="color:var(--gold);margin-top:6px">+50 Kill Bonus XP</p>`;
  }
  if (hasAchs) {
    if (html) html += `<hr style="border-color:var(--border);margin:10px 0">`;
    newAchs.forEach(a => {
      html += `<p>${a.icon} <span style="color:var(--gold)">${a.name}</span></p>`;
      html += `<p style="color:var(--dim);font-size:6px;margin-bottom:6px">${a.desc}</p>`;
    });
  }
  if (hasTitles) {
    if (html) html += `<hr style="border-color:var(--border);margin:10px 0">`;
    newTitles.forEach(t => {
      html += `<p>👑 NEW TITLE: <span style="color:var(--purple)">${t.name}</span></p>`;
      html += `<p style="color:var(--dim);font-size:6px;margin-bottom:6px">${t.gear}</p>`;
    });
  }

  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

// ── RENDER ────────────────────────────────────────────────────────────────────
function render() {
  renderHeader();
  renderHero();
  renderFloorNav();
  renderEnemy();
  renderRoster();
  renderLog();
  renderChest();
}

function renderChest() {
  const el = document.getElementById('chest-alert');
  if (!el) return;
  if (state.pendingChest) {
    el.classList.remove('hidden');
    document.getElementById('chest-gear-name').textContent = state.pendingChest.gear;
  } else {
    el.classList.add('hidden');
  }
}

function claimChest() {
  if (!state.pendingChest) return;
  const { gear, enemyName } = state.pendingChest;
  state.loot.push({ item: gear, from: enemyName + ' (chest)' });
  state.xp += 20;
  addLog(`🎁 CHEST OPENED: ${gear} (+20 XP)`, 'loot');
  state.pendingChest = null;
  save();
  render();
  showModal(null, [], [], {
    icon: '🎁', title: 'CHEST OPENED!',
    body: `You found: <strong>${gear}</strong>!<br><br>+20 XP rewarded for your progress.`,
  });
}

function renderLog() {
  const el = document.getElementById('combat-log');
  if (!el) return;
  el.innerHTML = state.log.map(e =>
    `<div class="log-entry log-${e.type}">${e.msg}</div>`
  ).join('');
}

function renderHeader() {
  const title = getTitleForXP(state.xp);
  document.getElementById('player-title').textContent  = title.name;
  document.getElementById('xp-val').textContent        = state.xp;
  document.getElementById('paid-val').textContent      = state.totalPaid.toFixed(2);
  document.getElementById('remaining-val').textContent = totalRemaining().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Total progress bar
  const total = state.debts.reduce((s, d) => s + d.amount, 0);
  const pct   = total > 0 ? Math.min(100, (state.totalPaid / total) * 100) : 0;
  const bar   = document.getElementById('total-progress-bar');
  if (bar) bar.style.width = pct + '%';
}

function renderHero() {
  const title = getTitleForXP(state.xp);
  const next  = getNextTitle(state.xp);

  document.getElementById('hero-sprite').innerHTML = state.heroStyle === 'lady' ? heroFemSVG(title.tier) : heroSVG(title.tier);
  document.getElementById('hero-name').textContent = state.playerName || 'SPRITE';
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

// ── CODEX RENDERER ───────────────────────────────────────────────────────────
function renderCodex() {
  renderAchievements();
  renderTitles();
  renderLoot();
  renderLedger();
}

function renderAchievements() {
  const el = document.getElementById('achievements-grid');
  if (!el) return;
  el.innerHTML = ACHIEVEMENTS.map(a => {
    const unlocked = state.achievements.includes(a.id);
    return `
      <div class="ach-card ${unlocked ? 'unlocked' : 'locked'}">
        <span class="ach-icon">${a.icon}</span>
        <div class="ach-name">${a.name}</div>
        <div class="ach-desc">${a.desc}</div>
        ${unlocked ? '<div class="ach-check">✓</div>' : ''}
      </div>`;
  }).join('');
}

function renderTitles() {
  const el = document.getElementById('titles-list');
  if (!el) return;
  el.innerHTML = TITLES.map(t => {
    const earned   = state.earnedTitles.includes(t.id);
    const equipped = state.equippedTitle === t.id;
    if (!earned) {
      return `<div class="title-badge locked" title="Requires ${t.minXP} XP">??? (${t.minXP} XP)</div>`;
    }
    return `
      <div class="title-badge ${equipped ? 'equipped' : 'earned'}"
           onclick="equipTitle('${t.id}')" title="${t.gear}">
        ${equipped ? '▶ ' : ''}${t.name}
      </div>`;
  }).join('');
}

function renderLoot() {
  const el = document.getElementById('loot-list');
  if (!el) return;
  if (!state.loot.length) {
    el.innerHTML = '<span class="empty-msg">No loot yet — defeat enemies to earn drops!</span>';
    return;
  }
  el.innerHTML = state.loot.map(l =>
    `<div class="loot-item" title="From: ${l.from}">🎁 ${l.item}</div>`
  ).join('');
}

function renderLedger() {
  const el = document.getElementById('ledger-rows');
  if (!el) return;
  const total = state.debts.reduce((s, d) => s + d.amount, 0);
  el.innerHTML = state.debts.map(d => {
    const rem = Math.max(0, d.amount - d.paid);
    const pct = Math.min(100, (d.paid / d.amount) * 100);
    return `
      <div class="ledger-row ${d.defeated ? 'defeated' : ''}">
        <div class="ledger-name">${d.name}</div>
        <div class="ledger-bar-wrap">
          <div class="ledger-bar-fill" style="width:${pct}%"></div>
        </div>
        <div class="ledger-paid">${fmt(d.paid)} paid</div>
        <div class="ledger-rem">${d.defeated ? '✓ DONE' : fmt(rem) + ' left'}</div>
      </div>`;
  }).join('');
}

function equipTitle(id) {
  if (!state.earnedTitles.includes(id)) return;
  state.equippedTitle = id;
  save();
  renderHeader();
  renderHero();
  renderTitles();
}

// ── CASTLE RENDERER ──────────────────────────────────────────────────────────
const MILESTONES = [
  { score: 620, label: 'Turrets appear',    pct: 0.125 },
  { score: 640, label: 'Walls emerge',      pct: 0.25  },
  { score: 660, label: 'Windows glow',      pct: 0.375 },
  { score: 680, label: 'Gates visible',     pct: 0.50  },
  { score: 700, label: 'Drawbridge lowers', pct: 0.625 },
  { score: 720, label: 'Banners raised',    pct: 0.75  },
  { score: 740, label: 'Moat revealed',     pct: 0.875 },
  { score: 760, label: '🏰 CASTLE CLAIMED', pct: 1.0   },
];

function creditScore() {
  if (state.manualScore !== null) return state.manualScore;
  const total = state.debts.reduce((s, d) => s + d.amount, 0);
  const pct   = total > 0 ? state.totalPaid / total : 0;
  return Math.round(600 + pct * 160);
}

function renderCastle() {
  const canvas = document.getElementById('castle-canvas');
  if (!canvas) return;

  const W = canvas.width  = canvas.offsetWidth  || 700;
  const H = canvas.height = canvas.offsetHeight || 320;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  const score   = creditScore();
  const reveal  = Math.max(0, Math.min(1, (score - 600) / 160)); // 0..1

  // ── Sky ──
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.72);
  sky.addColorStop(0, '#04040f');
  sky.addColorStop(1, '#0e0e2a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.72);

  // ── Stars (more appear as fog lifts) ──
  const starCount = Math.floor(20 + reveal * 80);
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < starCount; i++) {
    const sx   = ((i * 173.7) % W);
    const sy   = ((i * 97.3)  % (H * 0.65));
    const size = i % 5 === 0 ? 2 : 1;
    ctx.globalAlpha = 0.4 + (i % 3) * 0.2;
    ctx.fillRect(Math.floor(sx), Math.floor(sy), size, size);
  }
  ctx.globalAlpha = 1;

  // Moon (appears at 50% reveal)
  if (reveal > 0.5) {
    ctx.globalAlpha = (reveal - 0.5) * 2;
    ctx.fillStyle = '#fffde7';
    ctx.beginPath();
    ctx.arc(W * 0.82, H * 0.12, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0e0e2a';
    ctx.beginPath();
    ctx.arc(W * 0.82 + 6, H * 0.12, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // ── Ground ──
  const ground = ctx.createLinearGradient(0, H * 0.72, 0, H);
  ground.addColorStop(0, '#111a0f');
  ground.addColorStop(1, '#080d08');
  ctx.fillStyle = ground;
  ctx.fillRect(0, H * 0.72, W, H * 0.28);

  // Moat (appears at 87.5% reveal)
  if (reveal > 0.875) {
    ctx.globalAlpha = (reveal - 0.875) * 8;
    ctx.fillStyle = '#1a3a5a';
    ctx.fillRect(W/2 - 90, H * 0.72 - 6, 180, 8);
    ctx.globalAlpha = 1;
  }

  // ── Pixel castle (drawn centered, bottom-anchored) ──
  drawCastle(ctx, W / 2, H * 0.72, reveal);

  // ── Fog overlay (burns away from center outward) ──
  if (reveal < 1) {
    const fogDense = 1 - reveal;
    const fog = ctx.createRadialGradient(W/2, H * 0.45, 0, W/2, H * 0.45, W * 0.55);
    fog.addColorStop(0,   `rgba(8,8,20,${fogDense * 0.15})`);
    fog.addColorStop(0.4, `rgba(8,8,20,${fogDense * 0.65})`);
    fog.addColorStop(1,   `rgba(8,8,20,${fogDense * 0.97})`);
    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, W, H);

    // Fog text
    if (fogDense > 0.6) {
      ctx.globalAlpha = Math.min(1, (fogDense - 0.6) * 2.5);
      ctx.fillStyle   = '#4a4a7a';
      ctx.font        = '9px monospace';
      ctx.textAlign   = 'center';
      ctx.fillText('~ SHROUDED IN DEBT FOG ~', W / 2, H / 2);
      ctx.globalAlpha = 1;
    }
  }

  // ── Info panel ──
  document.getElementById('castle-score').textContent = score;
  const pct = ((score - 600) / 160) * 100;
  document.getElementById('castle-prog-bar').style.width = Math.min(100, pct) + '%';

  const statuses = [
    [0,    'The castle is completely shrouded in fog...'],
    [0.12, 'Distant turrets emerge from the mist...'],
    [0.25, 'The castle walls come into view...'],
    [0.5,  'Windows flicker with warm light...'],
    [0.75, 'Almost there — the drawbridge is visible!'],
    [0.99, '🏰 YOUR CASTLE AWAITS, DEBT SLAYER!'],
  ];
  const status = [...statuses].reverse().find(([t]) => reveal >= t);
  document.getElementById('castle-status-text').textContent = status[1];

  // Milestones
  document.getElementById('castle-milestones').innerHTML = MILESTONES.map(m =>
    `<div class="milestone ${score >= m.score ? 'reached' : ''}">${m.label} (${m.score})</div>`
  ).join('');

  // Score update panel
  const scoreInput = document.getElementById('score-input');
  if (scoreInput && state.manualScore) scoreInput.value = state.manualScore;
  const dateEl = document.getElementById('score-update-date');
  if (dateEl) {
    dateEl.textContent = state.scoreUpdateDate
      ? `Last updated: ${state.scoreUpdateDate}${state.manualScore ? '' : ' (using estimated score)'}`
      : 'Enter your real score to track actual credit progress';
  }
  // Update score line to show source
  document.getElementById('castle-score-line').innerHTML =
    `CREDIT SCORE: <span id="castle-score">${score}</span> / 760` +
    (state.manualScore ? ' <span style="font-size:6px;color:var(--green)">[real]</span>' : ' <span style="font-size:6px;color:var(--dim)">[estimated]</span>');
}

function drawCastle(ctx, cx, groundY, reveal) {
  const S = 5; // pixel scale
  ctx.globalAlpha = Math.min(1, reveal * 1.5); // fade in

  function px(col, row, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(
      Math.floor(cx + col * S),
      Math.floor(groundY - (row + h) * S),
      w * S, h * S
    );
  }

  const stone = '#4a4a6a', dark = '#2e2e4e', lit = '#ffd700',
        flag  = '#cc0000', batt = '#3a3a5a', roof = '#333355';

  // Left outer tower
  px(-20, 0, 6, 14, dark);
  px(-20,14, 2,  2, batt); px(-17,14, 2, 2, batt); px(-14,14, 2, 2, batt);
  if (reveal > 0.3) px(-18, 7, 2, 3, lit);
  if (reveal > 0.75) { px(-20,16, 1, 3, '#8B6914'); px(-19,18, 3, 2, flag); }

  // Left wing wall
  px(-14, 0, 8, 10, dark);
  px(-14,10, 2,  2, batt); px(-11,10, 2, 2, batt); px(-8,10, 2, 2, batt);
  if (reveal > 0.25) px(-12, 4, 2, 3, lit);

  // Main center tower
  px(-5, 0, 10, 18, stone);
  px(-5,18, 2,  2, batt); px(-2,18, 2, 2, batt); px(1,18, 2, 2, batt); px(3,18, 2, 2, batt);
  if (reveal > 0.12) px(-1, 6, 2, 4, lit);
  if (reveal > 0.12) px(-1,12, 2, 4, lit);
  if (reveal > 0.75) { px(0,20, 1, 4, '#8B6914'); px(1,22, 4, 2, flag); }

  // Right wing wall
  px(6, 0, 8, 10, dark);
  px(6, 10, 2, 2, batt); px(9,10, 2, 2, batt); px(12,10, 2, 2, batt);
  if (reveal > 0.25) px(8, 4, 2, 3, lit);

  // Right outer tower
  px(14, 0, 6, 14, dark);
  px(14,14, 2, 2, batt); px(17,14, 2, 2, batt); px(19,14, 2, 2, batt);
  if (reveal > 0.3) px(16, 7, 2, 3, lit);
  if (reveal > 0.75) { px(19,16, 1, 3, '#8B6914'); px(19,18, 3, 2, flag); }

  // Gate arch (appears at 50%)
  if (reveal > 0.5) {
    ctx.globalAlpha = Math.min(1, (reveal - 0.5) * 3);
    px(-2, 0, 4, 5, '#8B6914');   // gate frame
    px(-1, 0, 2, 4, '#1a0a00');   // gate darkness
    ctx.globalAlpha = Math.min(1, reveal * 1.5);
  }

  ctx.globalAlpha = 1;
}

// ── ACTIONS ───────────────────────────────────────────────────────────────────
// ── SUMMON ────────────────────────────────────────────────────────────────────
function handleSummon(e) {
  e.preventDefault();

  const name   = document.getElementById('s-name').value.trim();
  const amount = parseFloat(document.getElementById('s-amount').value);
  const floor  = parseInt(document.getElementById('s-floor').value);
  const type   = document.getElementById('s-type').value;
  const notes  = document.getElementById('s-notes').value.trim();

  if (!name || !amount || amount <= 0) return;

  const newDebt = {
    id:       'custom_' + Date.now(),
    name,
    amount,
    paid:     0,
    floor,
    type,
    defeated: false,
    taunts: MONSTER_TAUNTS[type]
      ? [...MONSTER_TAUNTS[type], notes ? `"${notes}"` : null].filter(Boolean)
      : [`"${name} won't pay itself!"`, '"You summoned me. Now deal with me."', notes ? `"${notes}"` : '"Every day you wait, I grow stronger."'],
  };

  state.debts.push(newDebt);
  e.target.reset();
  document.getElementById('s-floor').value = '1';
  save();

  // Jump to the floor it was added to
  addLog(`⚠ NEW MONSTER SUMMONED: ${name} (${fmt(amount)}) on Floor ${floor}!`, 'event');
  switchTab('dungeon');
  switchFloor(floor);
  selectEnemy(newDebt.id);
}

// ── HERO EDITOR ───────────────────────────────────────────────────────────────
function buildSwatches(containerId, palette, key) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  // "Default" reset swatch
  const reset = document.createElement('div');
  reset.className = 'he-swatch he-swatch-reset' + (!state.heroCustom[key] ? ' selected' : '');
  reset.title = 'Default (tier color)';
  reset.textContent = '↺';
  reset.addEventListener('click', () => {
    state.heroCustom[key] = null;
    save(); renderHeroEditor(); renderHero();
  });
  container.appendChild(reset);

  palette.forEach(color => {
    const el = document.createElement('div');
    el.className = 'he-swatch' + (state.heroCustom[key]?.id === color.id ? ' selected' : '');
    el.style.background = color.val;
    el.title = color.name;
    el.addEventListener('click', () => {
      state.heroCustom[key] = color;
      save(); renderHeroEditor(); renderHero();
    });
    container.appendChild(el);
  });
}

function renderHeroEditor() {
  const tier = getTitleForXP(state.xp).tier;
  const isLady = state.heroStyle === 'lady';

  const wrap = document.getElementById('he-sprite-wrap');
  if (wrap) wrap.innerHTML = isLady ? heroFemSVG(tier) : heroSVG(tier);

  const nameEl = document.getElementById('he-hero-name');
  if (nameEl) nameEl.textContent = state.playerName || 'SPRITE';

  const classLabels = { slayer: '⚔ Debt Slayer', mage: '🔮 Budget Mage', rogue: '🗡 Frugal Rogue' };
  const clsEl = document.getElementById('he-hero-class');
  if (clsEl) clsEl.textContent = classLabels[state.playerClass] || '';

  const nameInput = document.getElementById('he-name');
  if (nameInput) nameInput.value = state.playerName || '';

  // Mini style preview cards
  const pd = document.getElementById('he-style-preview-default');
  const pl = document.getElementById('he-style-preview-lady');
  if (pd) pd.innerHTML = heroSVG(tier, 2);
  if (pl) pl.innerHTML = heroFemSVG(tier, 2);

  document.querySelectorAll('.he-style-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.style === state.heroStyle);
  });

  buildSwatches('he-hair',  HAIR_COLORS,  'hair');
  buildSwatches('he-skin',  SKIN_TONES,   'skin');
  buildSwatches('he-armor', ARMOR_COLORS, 'armor');
}

// ── ONBOARDING STATE MACHINE ──────────────────────────────────────────────────
const OB = { step: 1, debts: [] };

const MONSTER_ICONS = {
  rat: '🐀', slime: '🫧', ghost: '👻', goblin: '👺',
  imp: '😈', vampire: '🧛', witch: '🧙', spider: '🕷',
  troll: '👹', dragon: '🐉', golem: '⛏', ogre: '👾',
};

function torchSVG() {
  return spr([
    '..f..',
    '.fff.',
    '.FFF.',
    '.fff.',
    '..f..',
    '..s..',
    '..s..',
    '.sss.',
  ], { f: '#ff6010', F: '#ffe060', s: '#7a4810' }, 6);
}

function obInitScreen1() {
  const sc = document.getElementById('ob1-stars');
  if (sc && !sc.hasChildNodes()) {
    let h = '';
    for (let i = 0; i < 80; i++) {
      const x  = (Math.random() * 100).toFixed(1);
      const y  = (Math.random() * 72).toFixed(1);
      const sz = Math.random() > 0.85 ? '3px' : Math.random() > 0.5 ? '2px' : '1px';
      const op = (0.25 + Math.random() * 0.75).toFixed(2);
      h += `<div class="ob1-star" style="left:${x}%;top:${y}%;width:${sz};height:${sz};opacity:${op}"></div>`;
    }
    sc.innerHTML = h;
  }
  const tl = document.getElementById('ob1-torch-l');
  const tr = document.getElementById('ob1-torch-r');
  if (tl && !tl.hasChildNodes()) tl.innerHTML = torchSVG();
  if (tr && !tr.hasChildNodes()) tr.innerHTML = torchSVG();
}

function obInitScreen2() {
  // Animate stat bars from 0 on each visit (force reflow trick)
  document.querySelectorAll('.ob2-fill').forEach(el => {
    const target = el.style.width;
    el.style.width = '0%';
    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.width = target; }));
  });
  setTimeout(() => document.getElementById('ob-name')?.focus(), 180);
}

function obUpdateMonsterPreview() {
  const amt    = parseFloat(document.getElementById('ob3-debt-amount')?.value) || 0;
  const iconEl = document.getElementById('ob3-preview-icon');
  const lblEl  = document.getElementById('ob3-preview-label');
  const wrap   = document.getElementById('ob3-preview');
  if (!iconEl || !lblEl) return;
  if (amt <= 0) {
    iconEl.textContent = '⚔';
    lblEl.textContent  = 'Enter an amount to reveal your foe';
    wrap?.classList.remove('has-monster');
    return;
  }
  const s = suggestMonster(amt);
  iconEl.textContent = MONSTER_ICONS[s.type] || '👹';
  lblEl.textContent  = `${s.type.toUpperCase()} · Floor ${s.floor}`;
  wrap?.classList.add('has-monster');
}

function obRenderDebtList() {
  const list = document.getElementById('ob3-debt-list');
  const hint = document.getElementById('ob3-empty-hint');
  if (!list) return;
  if (OB.debts.length === 0) {
    list.innerHTML = '';
    if (hint) hint.style.display = '';
    return;
  }
  if (hint) hint.style.display = 'none';
  list.innerHTML = OB.debts.map((d, i) => `
    <div class="ob3-debt-row" data-idx="${i}">
      <span class="ob3-debt-icon">${MONSTER_ICONS[d.type] || '👹'}</span>
      <span class="ob3-debt-info">
        <span class="ob3-debt-name">${d.name}</span>
        <span class="ob3-debt-meta">${d.type} · Floor ${d.floor}</span>
      </span>
      <span class="ob3-debt-amount">${fmt(d.amount)}</span>
      <button class="ob3-remove-btn" data-idx="${i}" title="Remove">✕</button>
    </div>
  `).join('');
  list.querySelectorAll('.ob3-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      OB.debts.splice(parseInt(btn.dataset.idx), 1);
      obRenderDebtList();
    });
  });
}

function obShakeInput(el) {
  if (!el) return;
  el.classList.remove('ob-input-shake');
  void el.offsetWidth;
  el.classList.add('ob-input-shake');
  el.focus();
}

function obAddDebt() {
  const nameEl   = document.getElementById('ob3-debt-name');
  const amountEl = document.getElementById('ob3-debt-amount');
  const name   = nameEl?.value.trim();
  const amount = parseFloat(amountEl?.value);
  if (!name)                  { obShakeInput(nameEl);   return; }
  if (!amount || amount <= 0) { obShakeInput(amountEl); return; }
  const s = suggestMonster(amount);
  OB.debts.push({
    id:           `ob_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name, amount,
    type:         s.type,
    floor:        s.floor,
    hp:           amount, maxHp: amount,
    defeated:     false,
    chestsOpened: [],
  });
  if (nameEl)   nameEl.value   = '';
  if (amountEl) amountEl.value = '';
  nameEl?.focus();
  obRenderDebtList();
  obUpdateMonsterPreview();
}

function obInitScreen3() {
  obRenderDebtList();
  obUpdateMonsterPreview();
  setTimeout(() => document.getElementById('ob3-debt-name')?.focus(), 180);
}

function obGoTo(n) {
  document.querySelectorAll('.ob-screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`ob-screen-${n}`).classList.add('active');
  document.querySelectorAll('.ob-dot').forEach(d => {
    const s = parseInt(d.dataset.step);
    d.classList.toggle('active', s === n);
    d.classList.toggle('done',   s < n);
  });
  OB.step = n;
  if (n === 1) obInitScreen1();
  if (n === 2) obInitScreen2();
  if (n === 3) obInitScreen3();
  if (n === 5) obRenderScreen5();
}

function showOnboarding() {
  document.getElementById('onboarding-overlay').classList.remove('hidden');
  obGoTo(1);
}

function obFinish() {
  const name = document.getElementById('ob-name')?.value.trim() || 'SPRITE';
  const cls  = document.querySelector('input[name="ob-class"]:checked')?.value || 'slayer';

  state.playerName  = name;
  state.playerClass = cls;

  if (OB.debts.length > 0) {
    const existing = state.debts.filter(d => !d.id.startsWith('ob_'));
    state.debts = [...OB.debts, ...existing];
    const first = state.debts.find(d => !d.defeated) || state.debts[0];
    if (first) { state.activeEnemyId = first.id; state.currentFloor = first.floor; }
  }

  document.getElementById('onboarding-overlay').classList.add('hidden');
  save(); render();

  const classLabels = { slayer: 'Debt Slayer', mage: 'Budget Mage', rogue: 'Frugal Rogue' };
  const classDesc   = {
    slayer: '+10% bonus damage on every attack',
    mage:   'Lucky Month events strike twice as often',
    rogue:  'Critical Hits land twice as often',
  };
  addLog(`⚔ ${name} the ${classLabels[cls]} enters the dungeon!`, 'event');
  addLog(`Class bonus: ${classDesc[cls]}`, 'system');
  setTimeout(() => showModal(null, [], [], {
    icon: '⚔', title: `WELCOME, ${name.toUpperCase()}!`,
    body: `You have chosen the path of the <strong>${classLabels[cls]}</strong>.<br><br>${classDesc[cls]}.<br><br>The dungeon awaits. Slay your debts!`,
  }), 200);
}

function obRenderScreen5() {
  const name   = document.getElementById('ob-name')?.value.trim() || 'SPRITE';
  const cls    = document.querySelector('input[name="ob-class"]:checked')?.value || 'slayer';
  const debts  = OB.debts.length > 0 ? OB.debts : state.debts;
  const total  = debts.reduce((s, d) => s + d.amount, 0);
  const clsLbl = { slayer: 'Debt Slayer', mage: 'Budget Mage', rogue: 'Frugal Rogue' };

  const prev = document.getElementById('ob5-preview');
  const nm   = document.getElementById('ob5-hero-name');
  const st   = document.getElementById('ob5-stats');
  if (prev) prev.innerHTML = state.heroStyle === 'lady' ? heroFemSVG(0) : heroSVG(0);
  if (nm)   nm.textContent  = name;
  if (st)   st.innerHTML    = `${clsLbl[cls] || 'Hero'}<br>${debts.length} monster${debts.length !== 1 ? 's' : ''} await &nbsp;·&nbsp; ${fmt(total)} total debt`;
}

function switchTab(name) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');
  document.querySelector(`.tab-btn[data-tab="${name}"]`).classList.add('active');
  if (name === 'castle') renderCastle();
  if (name === 'codex')  renderCodex();
  if (name === 'hero')   renderHeroEditor();
}

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

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.getElementById('attack-btn').addEventListener('click', attack);
  document.getElementById('chest-claim-btn').addEventListener('click', claimChest);
  document.getElementById('payment-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') attack();
  });

  document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('modal-overlay').classList.add('hidden');
  });

  document.getElementById('summon-form').addEventListener('submit', handleSummon);

  // Onboarding navigation
  document.getElementById('ob1-begin').addEventListener('click', () => obGoTo(2));
  document.getElementById('ob2-back').addEventListener('click',  () => obGoTo(1));
  document.getElementById('ob2-next').addEventListener('click',  () => {
    if (!document.getElementById('ob-name')?.value.trim()) {
      document.getElementById('ob-name')?.focus(); return;
    }
    obGoTo(3);
  });
  document.getElementById('ob3-back').addEventListener('click',  () => obGoTo(2));
  document.getElementById('ob3-next').addEventListener('click',  () => {
    if (OB.debts.length === 0) {
      const hint = document.getElementById('ob3-empty-hint');
      if (hint) { hint.classList.remove('ob3-shake'); void hint.offsetWidth; hint.classList.add('ob3-shake'); }
      return;
    }
    obGoTo(4);
  });
  document.getElementById('ob3-add-btn').addEventListener('click', obAddDebt);
  document.getElementById('ob3-debt-amount').addEventListener('input', obUpdateMonsterPreview);
  document.getElementById('ob3-debt-name').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('ob3-debt-amount')?.focus(); });
  document.getElementById('ob3-debt-amount').addEventListener('keydown', e => { if (e.key === 'Enter') obAddDebt(); });
  document.getElementById('ob4-back').addEventListener('click',  () => obGoTo(3));
  document.getElementById('ob4-next').addEventListener('click',  () => { obRenderScreen5(); obGoTo(5); });
  document.getElementById('ob5-back').addEventListener('click',  () => obGoTo(4));
  document.getElementById('ob5-enter').addEventListener('click', obFinish);

  document.getElementById('score-update-btn').addEventListener('click', () => {
    const val = parseInt(document.getElementById('score-input').value);
    if (!val || val < 300 || val > 850) {
      addLog('>> Credit score must be between 300 and 850.', 'system');
      return;
    }
    state.manualScore     = val;
    state.scoreUpdateDate = new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
    save();
    renderCastle();
    checkAchievements();
    addLog(`📈 Credit score updated: ${val}`, 'event');
  });
  document.getElementById('score-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('score-update-btn').click();
  });

  document.querySelectorAll('.he-style-card').forEach(card => {
    card.addEventListener('click', () => {
      state.heroStyle = card.dataset.style;
      save(); renderHeroEditor(); renderHero();
    });
  });

  document.getElementById('he-name-btn').addEventListener('click', () => {
    const val = document.getElementById('he-name').value.trim();
    if (!val) return;
    state.playerName = val;
    save(); renderHeroEditor(); renderHero();
    addLog(`✏ Name changed to: ${val}`, 'system');
  });
  document.getElementById('he-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('he-name-btn').click();
  });

  // Auto-suggest floor + type from amount
  document.getElementById('s-amount').addEventListener('input', e => {
    const v = parseFloat(e.target.value) || 0;
    if (v > 0) {
      const suggestion = suggestMonster(v);
      document.getElementById('s-floor').value = String(suggestion.floor);
      document.getElementById('s-type').value  = suggestion.type;
    }
  });

  // Show onboarding on first visit, else welcome back
  if (!state.playerName) {
    showOnboarding();
  } else if (state.log.length === 0) {
    addLog(`⚔ Welcome back, ${state.playerName}!`, 'event');
    addLog('Enter a payment amount and hit ATTACK to deal damage.', 'system');
    addLog(`Total debt: ${fmt(state.debts.reduce((s,d)=>s+d.amount,0))} across ${state.debts.length} enemies.`, 'system');
  }

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
