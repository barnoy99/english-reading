/* data.js — all content lives here.
   Swap the reward world by editing ROOM. Nothing else knows about it. */

const CHILD = { name: 'אביגיל', emoji: '👧' };

/* ---------- letters ----------
   `sound`  = the phoneme id. Two options may NEVER share one, or a sound
              question would have two right answers (c/k both say /k/).
   `say`    = TTS-friendly spelling of the sound. Bare phonemes make speech
              engines read the letter NAME instead, so /b/ is written "buh" —
              which is how the sound is taught out loud anyway.
   The letter NAME is spoken from the glyph itself ("A"), which speech engines
   handle reliably; a respelling like "ay" was read as /iː/ on a real device,
   turning A into E. Add `nameSay:'...'` to any letter that still sounds wrong
   on your device and it overrides the glyph. Name and sound are taught and
   tested separately either way — conflating them is the classic way kids
   get stuck.
   `confuse`= looks alike. Used as hard distractors only once the letter is solid.
   `near`   = sounds alike. NEVER used as distractors — several are the specific
              traps for a Hebrew speaker: ו has no /w/, so v and w blur, and
              פ is both /p/ and /f/.
   `order`  = unlock order. Phonics order (s,a,t,p,i,n...), not alphabetical,
              so real words become readable within the first week. */

const LETTERS = [
  { id:'a', up:'A', low:'a', name:'אֵיי', sound:'a', say:'ah',
    kw:'apple', kwHe:'תפוח', emoji:'🍎', confuse:['e','o','c'], near:['u','o','e'], order:2 },
  { id:'b', up:'B', low:'b', name:'בִּי', sound:'b', say:'buh',
    kw:'ball', kwHe:'כדור', emoji:'⚽', confuse:['d','p','q','h'], near:['v','p','d'], order:18 },
  { id:'c', up:'C', low:'c', name:'סִי', sound:'k', say:'kuh',
    kw:'cat', kwHe:'חתול', emoji:'🐱', confuse:['e','o','a'], near:[], order:11 },
  { id:'d', up:'D', low:'d', name:'דִי', sound:'d', say:'duh',
    kw:'dog', kwHe:'כלב', emoji:'🐶', confuse:['b','p','q','a'], near:['t','b'], order:8 },
  { id:'e', up:'E', low:'e', name:'אִי', sound:'e', say:'eh',
    kw:'egg', kwHe:'ביצה', emoji:'🥚', confuse:['a','c','o'], near:['i','a'], order:13 },
  { id:'f', up:'F', low:'f', name:'אֶף', sound:'f', say:'fuh',
    kw:'fish', kwHe:'דג', emoji:'🐟', confuse:['t','l','r'], near:['p','v'], order:19 },
  { id:'g', up:'G', low:'g', name:'גִ׳י', sound:'g', say:'guh',
    kw:'girl', kwHe:'ילדה', emoji:'👧', confuse:['q','j','y','p'], near:['k','j'], order:9 },
  { id:'h', up:'H', low:'h', name:'אֵייץ׳', sound:'h', say:'huh',
    kw:'hat', kwHe:'כובע', emoji:'🎩', confuse:['n','b','k'], near:[], order:17 },
  { id:'i', up:'I', low:'i', name:'אַיי', sound:'i', say:'ih',
    kw:'insect', kwHe:'חרק', emoji:'🦗', confuse:['j','l','t'], near:['e'], order:5 },
  { id:'j', up:'J', low:'j', name:'גֵ׳יי', sound:'j', say:'juh',
    kw:'juice', kwHe:'מיץ', emoji:'🧃', confuse:['i','g','y'], near:['g','z'], order:22 },
  { id:'k', up:'K', low:'k', name:'קֵיי', sound:'k', say:'kuh',
    kw:'key', kwHe:'מפתח', emoji:'🔑', confuse:['x','h'], near:['g'], order:12 },
  { id:'l', up:'L', low:'l', name:'אֶל', sound:'l', say:'luh',
    kw:'lion', kwHe:'אריה', emoji:'🦁', confuse:['i','t','f'], near:['r'], order:20 },
  { id:'m', up:'M', low:'m', name:'אֶם', sound:'m', say:'muh',
    kw:'moon', kwHe:'ירח', emoji:'🌙', confuse:['n','w','h'], near:['n'], order:7 },
  { id:'n', up:'N', low:'n', name:'אֶן', sound:'n', say:'nuh',
    kw:'nose', kwHe:'אף', emoji:'👃', confuse:['m','h','r','u'], near:['m'], order:6 },
  { id:'o', up:'O', low:'o', name:'אוֹ', sound:'o', say:'awe',
    kw:'octopus', kwHe:'תמנון', emoji:'🐙', confuse:['a','c','e','q'], near:['a','u'], order:10 },
  { id:'p', up:'P', low:'p', name:'פִּי', sound:'p', say:'puh',
    kw:'pizza', kwHe:'פיצה', emoji:'🍕', confuse:['q','b','d','g'], near:['b','f'], order:4 },
  { id:'q', up:'Q', low:'q', name:'קְיוּ', sound:'kw', say:'kwuh',
    kw:'queen', kwHe:'מלכה', emoji:'👑', confuse:['p','g','b','d'], near:['k'], order:26 },
  { id:'r', up:'R', low:'r', name:'אָר', sound:'r', say:'ruh',
    kw:'rabbit', kwHe:'ארנב', emoji:'🐰', confuse:['n','f','v'], near:['l'], order:14 },
  { id:'s', up:'S', low:'s', name:'אֶס', sound:'s', say:'suh',
    kw:'sun', kwHe:'שמש', emoji:'☀️', confuse:['z','c'], near:['z'], order:1 },
  { id:'t', up:'T', low:'t', name:'טִי', sound:'t', say:'tuh',
    kw:'tree', kwHe:'עץ', emoji:'🌳', confuse:['f','l','i'], near:['d'], order:3 },
  { id:'u', up:'U', low:'u', name:'יוּ', sound:'u', say:'uh',
    kw:'umbrella', kwHe:'מטרייה', emoji:'☂️', confuse:['v','n','o'], near:['a','o'], order:21 },
  { id:'v', up:'V', low:'v', name:'וִי', sound:'v', say:'vuh',
    kw:'violin', kwHe:'כינור', emoji:'🎻', confuse:['u','w','y','r'], near:['w','b','f'], order:23 },
  { id:'w', up:'W', low:'w', name:'דַּבֶּל-יוּ', sound:'w', say:'wuh',
    kw:'water', kwHe:'מים', emoji:'💧', confuse:['v','m','u'], near:['v'], order:24 },
  { id:'x', up:'X', low:'x', name:'אֶקְס', sound:'ks', say:'ks',
    kw:'fox', kwHe:'שועל', emoji:'🦊', confuse:['k','y','z'], near:[], order:25, endSound:true },
  { id:'y', up:'Y', low:'y', name:'וַואי', sound:'y', say:'yuh',
    kw:'yellow', kwHe:'צהוב', emoji:'🟡', confuse:['v','g','j','x'], near:['w'], order:16 },
  { id:'z', up:'Z', low:'z', name:'זִי', sound:'z', say:'zuh',
    kw:'zebra', kwHe:'זברה', emoji:'🦓', confuse:['s','x','n'], near:['s','j'], order:15 }
];

/* What she already knows, seeded from the parent panel. Empty = start clean;
   the engine opens the first OPENING_LETTERS of LETTER_ORDER by itself. */
const START_LETTERS = [];
const OPENING_LETTERS = 4;

const LETTER_ORDER = LETTERS.slice().sort((a, b) => a.order - b.order).map(l => l.id);

/* ---------- words ----------
   English + Hebrew pairs are the same ones she already meets in Word Missile,
   so the two apps never disagree on a translation. `emoji` is the picture —
   no image files, works offline, nothing to license.
   Only words whose first LETTER matches their first SOUND are usable in the
   sound hunt; engine.js works that out from the spelling (see HUNT_UNSAFE). */

const WORDS = [
  // animals
  { en:'dog', he:'כלב', topic:'animals', emoji:'🐶' },
  { en:'cat', he:'חתול', topic:'animals', emoji:'🐱' },
  { en:'bird', he:'ציפור', topic:'animals', emoji:'🐦' },
  { en:'fish', he:'דג', topic:'animals', emoji:'🐟' },
  { en:'horse', he:'סוס', topic:'animals', emoji:'🐴' },
  { en:'cow', he:'פרה', topic:'animals', emoji:'🐮' },
  { en:'sheep', he:'כבשה', topic:'animals', emoji:'🐑' },
  { en:'duck', he:'ברווז', topic:'animals', emoji:'🦆' },
  { en:'rabbit', he:'ארנב', topic:'animals', emoji:'🐰' },
  { en:'mouse', he:'עכבר', topic:'animals', emoji:'🐭' },
  { en:'lion', he:'אריה', topic:'animals', emoji:'🦁' },
  { en:'elephant', he:'פיל', topic:'animals', emoji:'🐘' },
  { en:'monkey', he:'קוף', topic:'animals', emoji:'🐵' },
  { en:'snake', he:'נחש', topic:'animals', emoji:'🐍' },
  { en:'bear', he:'דוב', topic:'animals', emoji:'🐻' },
  { en:'tiger', he:'נמר', topic:'animals', emoji:'🐯' },
  { en:'frog', he:'צפרדע', topic:'animals', emoji:'🐸' },
  { en:'turtle', he:'צב', topic:'animals', emoji:'🐢' },
  { en:'kitten', he:'חתלתול', topic:'animals', emoji:'🐈' },
  { en:'puppy', he:'גור', topic:'animals', emoji:'🐕' },
  { en:'butterfly', he:'פרפר', topic:'animals', emoji:'🦋' },
  { en:'bee', he:'דבורה', topic:'animals', emoji:'🐝' },
  { en:'fox', he:'שועל', topic:'animals', emoji:'🦊' },
  { en:'owl', he:'ינשוף', topic:'animals', emoji:'🦉' },
  { en:'pig', he:'חזיר', topic:'animals', emoji:'🐷' },

  // food
  { en:'apple', he:'תפוח', topic:'food', emoji:'🍎' },
  { en:'banana', he:'בננה', topic:'food', emoji:'🍌' },
  { en:'bread', he:'לחם', topic:'food', emoji:'🍞' },
  { en:'milk', he:'חלב', topic:'food', emoji:'🥛' },
  { en:'water', he:'מים', topic:'food', emoji:'💧' },
  { en:'egg', he:'ביצה', topic:'food', emoji:'🥚' },
  { en:'cheese', he:'גבינה', topic:'food', emoji:'🧀' },
  { en:'cake', he:'עוגה', topic:'food', emoji:'🎂' },
  { en:'ice cream', he:'גלידה', topic:'food', emoji:'🍦' },
  { en:'juice', he:'מיץ', topic:'food', emoji:'🧃' },
  { en:'pizza', he:'פיצה', topic:'food', emoji:'🍕' },
  { en:'chocolate', he:'שוקולד', topic:'food', emoji:'🍫' },
  { en:'rice', he:'אורז', topic:'food', emoji:'🍚' },
  { en:'soup', he:'מרק', topic:'food', emoji:'🍲' },
  { en:'salad', he:'סלט', topic:'food', emoji:'🥗' },
  { en:'cookie', he:'עוגייה', topic:'food', emoji:'🍪' },
  { en:'candy', he:'ממתק', topic:'food', emoji:'🍬' },
  { en:'tomato', he:'עגבנייה', topic:'food', emoji:'🍅' },
  { en:'cucumber', he:'מלפפון', topic:'food', emoji:'🥒' },
  { en:'sandwich', he:'כריך', topic:'food', emoji:'🥪' },
  { en:'popcorn', he:'פופקורן', topic:'food', emoji:'🍿' },
  { en:'lemonade', he:'לימונדה', topic:'food', emoji:'🍋' },

  // body
  { en:'hand', he:'יד', topic:'body', emoji:'✋' },
  { en:'eye', he:'עין', topic:'body', emoji:'👁️' },
  { en:'ear', he:'אוזן', topic:'body', emoji:'👂' },
  { en:'nose', he:'אף', topic:'body', emoji:'👃' },
  { en:'mouth', he:'פה', topic:'body', emoji:'👄' },
  { en:'foot', he:'כף רגל', topic:'body', emoji:'🦶' },
  { en:'tooth', he:'שן', topic:'body', emoji:'🦷' },
  { en:'hair', he:'שיער', topic:'body', emoji:'💇' },

  // family & people
  { en:'mother', he:'אמא', topic:'family', emoji:'👩' },
  { en:'father', he:'אבא', topic:'family', emoji:'👨' },
  { en:'baby', he:'תינוק', topic:'family', emoji:'👶' },
  { en:'grandmother', he:'סבתא', topic:'family', emoji:'👵' },
  { en:'grandfather', he:'סבא', topic:'family', emoji:'👴' },
  { en:'family', he:'משפחה', topic:'family', emoji:'👨‍👩‍👧' },
  { en:'boy', he:'ילד', topic:'family', emoji:'👦' },
  { en:'girl', he:'ילדה', topic:'family', emoji:'👧' },

  // school
  { en:'book', he:'ספר', topic:'school', emoji:'📕' },
  { en:'pen', he:'עט', topic:'school', emoji:'🖊️' },
  { en:'pencil', he:'עיפרון', topic:'school', emoji:'✏️' },
  { en:'bag', he:'תיק', topic:'school', emoji:'🎒' },
  { en:'notebook', he:'מחברת', topic:'school', emoji:'📒' },
  { en:'school', he:'בית ספר', topic:'school', emoji:'🏫' },
  { en:'teacher', he:'מורה', topic:'school', emoji:'👩‍🏫' },
  { en:'heart', he:'לב', topic:'school', emoji:'❤️' },
  { en:'star', he:'כוכב', topic:'school', emoji:'⭐' },

  // house
  { en:'house', he:'בית', topic:'house', emoji:'🏠' },
  { en:'door', he:'דלת', topic:'house', emoji:'🚪' },
  { en:'window', he:'חלון', topic:'house', emoji:'🪟' },
  { en:'chair', he:'כיסא', topic:'house', emoji:'🪑' },
  { en:'bed', he:'מיטה', topic:'house', emoji:'🛏️' },
  { en:'key', he:'מפתח', topic:'house', emoji:'🔑' },
  { en:'cup', he:'ספל', topic:'house', emoji:'☕' },
  { en:'plate', he:'צלחת', topic:'house', emoji:'🍽️' },
  { en:'spoon', he:'כף', topic:'house', emoji:'🥄' },
  { en:'fork', he:'מזלג', topic:'house', emoji:'🍴' },
  { en:'bottle', he:'בקבוק', topic:'house', emoji:'🍼' },
  { en:'soap', he:'סבון', topic:'house', emoji:'🧼' },
  { en:'bath', he:'אמבטיה', topic:'house', emoji:'🛁' },
  { en:'toothbrush', he:'מברשת שיניים', topic:'house', emoji:'🪥' },
  { en:'comb', he:'מסרק', topic:'house', emoji:'🪮' },

  // clothes
  { en:'shirt', he:'חולצה', topic:'clothes', emoji:'👕' },
  { en:'pants', he:'מכנסיים', topic:'clothes', emoji:'👖' },
  { en:'shoes', he:'נעליים', topic:'clothes', emoji:'👟' },
  { en:'hat', he:'כובע', topic:'clothes', emoji:'🎩' },
  { en:'dress', he:'שמלה', topic:'clothes', emoji:'👗' },
  { en:'socks', he:'גרביים', topic:'clothes', emoji:'🧦' },
  { en:'coat', he:'מעיל', topic:'clothes', emoji:'🧥' },
  { en:'boots', he:'מגפיים', topic:'clothes', emoji:'👢' },
  { en:'gloves', he:'כפפות', topic:'clothes', emoji:'🧤' },
  { en:'scarf', he:'צעיף', topic:'clothes', emoji:'🧣' },

  // nature
  { en:'sun', he:'שמש', topic:'nature', emoji:'☀️' },
  { en:'moon', he:'ירח', topic:'nature', emoji:'🌙' },
  { en:'rain', he:'גשם', topic:'nature', emoji:'🌧️' },
  { en:'tree', he:'עץ', topic:'nature', emoji:'🌳' },
  { en:'flower', he:'פרח', topic:'nature', emoji:'🌸' },
  { en:'sea', he:'ים', topic:'nature', emoji:'🌊' },
  { en:'cloud', he:'ענן', topic:'nature', emoji:'☁️' },
  { en:'snow', he:'שלג', topic:'nature', emoji:'❄️' },
  { en:'fire', he:'אש', topic:'nature', emoji:'🔥' },

  // transport
  { en:'car', he:'מכונית', topic:'transport', emoji:'🚗' },
  { en:'bus', he:'אוטובוס', topic:'transport', emoji:'🚌' },
  { en:'train', he:'רכבת', topic:'transport', emoji:'🚂' },
  { en:'plane', he:'מטוס', topic:'transport', emoji:'✈️' },
  { en:'boat', he:'סירה', topic:'transport', emoji:'⛵' },
  { en:'bicycle', he:'אופניים', topic:'transport', emoji:'🚲' },

  // things
  { en:'ball', he:'כדור', topic:'things', emoji:'⚽' },
  { en:'money', he:'כסף', topic:'things', emoji:'💰' },
  { en:'phone', he:'טלפון', topic:'things', emoji:'📱' },
  { en:'computer', he:'מחשב', topic:'things', emoji:'💻' },
  { en:'music', he:'מוזיקה', topic:'things', emoji:'🎵' },
  { en:'present', he:'מתנה', topic:'things', emoji:'🎁' },
  { en:'box', he:'קופסה', topic:'things', emoji:'📦' },
  { en:'doll', he:'בובה', topic:'things', emoji:'🪆' },
  { en:'kite', he:'עפיפון', topic:'things', emoji:'🪁' },
  { en:'balloon', he:'בלון', topic:'things', emoji:'🎈' },
  { en:'robot', he:'רובוט', topic:'things', emoji:'🤖' },
  { en:'puzzle', he:'פאזל', topic:'things', emoji:'🧩' },
  { en:'crown', he:'כתר', topic:'things', emoji:'👑' },
  { en:'umbrella', he:'מטרייה', topic:'things', emoji:'☂️' },
  { en:'violin', he:'כינור', topic:'things', emoji:'🎻' },
  { en:'clock', he:'שעון', topic:'things', emoji:'🕐' },

  // colors — kept apart so the picture games never offer two colour swatches
  { en:'red', he:'אדום', topic:'colors', emoji:'🟥' },
  { en:'blue', he:'כחול', topic:'colors', emoji:'🟦' },
  { en:'green', he:'ירוק', topic:'colors', emoji:'🟩' },
  { en:'yellow', he:'צהוב', topic:'colors', emoji:'🟨' },
  { en:'black', he:'שחור', topic:'colors', emoji:'⬛' },
  { en:'white', he:'לבן', topic:'colors', emoji:'⬜' },
  { en:'orange', he:'כתום', topic:'colors', emoji:'🟧' },
  { en:'purple', he:'סגול', topic:'colors', emoji:'🟪' },
  { en:'brown', he:'חום', topic:'colors', emoji:'🟫' }
];

/* Spellings where the first letter is not the first sound. A word starting
   with any of these can never appear in a "which starts with /b/?" question. */
const HUNT_UNSAFE = ['ch', 'sh', 'th', 'ph', 'wh', 'kn', 'wr', 'ce', 'ci', 'cy', 'ge', 'gi', 'gy', 'sc',
                      'ic', 'ea', 'ey', 'ow'];

/* ---------- the dress-up figure ----------
   The reward is a character she dresses. Everything is inline SVG on a 200x400
   stage: no image files, scales to any screen, and adding a garment is a data
   edit.

   Proportions are fashion-illustration rather than cartoon — roughly six and a
   half heads tall, with a defined waist and long legs — so the clothes hang
   like clothes. The body landmarks every garment is cut to:
       head    ellipse cx100 cy54 r25x30      shoulders  y104, x70..130
       neck    y78..99                        waist      y174, x78..122
       hips    y210, x72..128                 knee       y300
       ankle   y372                           foot       y372..386
   Keep to those and a new garment will fit the first time.

   `z` is the paint order; `back` (hair) is painted behind the head, and
   anything with z below 10 is painted behind the body. A `dress` hides the
   `top` and `bottom` — that rule lives in engine.js. */

const FIGURE = {
  skin: '#f3d3ba',
  shade: '#e6bda1',
  body: [
    /* legs, tapering to the ankle */
    '<path d="M78 230 Q75 300 85 372 L97 372 Q98 300 99 230 Z" fill="#f3d3ba"/>',
    '<path d="M122 230 Q125 300 115 372 L103 372 Q102 300 101 230 Z" fill="#f3d3ba"/>',
    /* arms and hands */
    '<path d="M73 108 Q62 150 60 192" stroke="#f3d3ba" stroke-width="11" fill="none" stroke-linecap="round"/>',
    '<path d="M127 108 Q138 150 140 192" stroke="#f3d3ba" stroke-width="11" fill="none" stroke-linecap="round"/>',
    '<circle cx="59" cy="197" r="6" fill="#f3d3ba"/><circle cx="141" cy="197" r="6" fill="#f3d3ba"/>',
    /* torso: shoulders tapering to the waist */
    '<path d="M70 104 Q100 95 130 104 L126 148 Q122 166 121 176 L79 176 Q78 166 74 148 Z" fill="#f3d3ba"/>',
    /* hips */
    '<path d="M79 172 L121 172 Q128 188 128 210 Q128 226 122 238 L78 238 Q72 226 72 210 Q72 188 79 172 Z" fill="#f3d3ba"/>',
    /* neck and head */
    '<path d="M94 76 L106 76 L106 96 Q100 101 94 96 Z" fill="#e6bda1"/>',
    '<circle cx="76" cy="58" r="4.5" fill="#f3d3ba"/><circle cx="124" cy="58" r="4.5" fill="#f3d3ba"/>',
    '<ellipse cx="100" cy="54" rx="25" ry="30" fill="#f3d3ba"/>'
  ].join(''),
  face: [
    '<path d="M83 45 Q89 41 95 45" stroke="#7a5540" stroke-width="2" fill="none" stroke-linecap="round"/>',
    '<path d="M105 45 Q111 41 117 45" stroke="#7a5540" stroke-width="2" fill="none" stroke-linecap="round"/>',
    '<ellipse cx="89" cy="56" rx="3.6" ry="4.6" fill="#3d2b24"/><circle cx="90.3" cy="54.4" r="1.3" fill="#fff"/>',
    '<ellipse cx="111" cy="56" rx="3.6" ry="4.6" fill="#3d2b24"/><circle cx="112.3" cy="54.4" r="1.3" fill="#fff"/>',
    '<path d="M100 62 q2.4 2.8 -1 3.4" stroke="#d9a68f" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
    '<path d="M94 71 Q100 75.5 106 71" stroke="#c9695c" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
  ].join('')
};

/* Slot order is also the order of the tabs in the wardrobe. */
const WARDROBE_SLOTS = [
  { id: 'hair',      he: 'שיער',   icon: '💇' },
  { id: 'top',       he: 'חולצה',  icon: '👕' },
  { id: 'bottom',    he: 'תחתון',  icon: '👖' },
  { id: 'dress',     he: 'שמלה',   icon: '👗' },
  { id: 'shoes',     he: 'נעליים', icon: '👟' },
  { id: 'hat',       he: 'כובע',   icon: '👒' },
  { id: 'bag',       he: 'תיק',    icon: '👜' },
  { id: 'makeup',    he: 'איפור',  icon: '💄' },
  { id: 'accessory', he: 'תכשיט',  icon: '💎' }
];

function FRINGE(c) {
  return '<path d="M69 46 Q71 13 100 13 Q129 13 131 46 Q123 29 100 27 Q77 29 69 46 Z" fill="' + c + '"/>';
}
function CAP_HAIR(c) {
  return '<ellipse cx="100" cy="50" rx="31" ry="34" fill="' + c + '"/>';
}
function LONG_HAIR(c) {
  return '<path d="M68 48 Q68 11 100 11 Q132 11 132 48 L136 200 Q134 214 123 211 L120 62 Q112 40 100 40 Q88 40 80 62 L77 211 Q66 214 64 200 Z" fill="' + c + '"/>';
}

const WARDROBE = [
  /* ----- hair ----- */
  { id:'hair-basic', he:'חלק', slot:'hair', cost:0, icon:'👧', z:50,
    back: CAP_HAIR('#5a3a22'), svg: FRINGE('#5a3a22') },
  { id:'hair-long', he:'ארוך', slot:'hair', cost:7, icon:'👩', z:50,
    back: LONG_HAIR('#5a3a22'), svg: FRINGE('#5a3a22') },
  { id:'hair-ponytail', he:'קוקו', slot:'hair', cost:9, icon:'🎀', z:50,
    back: CAP_HAIR('#5a3a22') + '<path d="M126 36 Q158 46 155 94 Q152 136 130 144 Q150 110 142 78 Q135 54 122 44 Z" fill="#5a3a22"/><ellipse cx="128" cy="38" rx="8" ry="6" fill="#ff7ab8"/>',
    svg: FRINGE('#5a3a22') },
  { id:'hair-bun', he:'פקעת', slot:'hair', cost:11, icon:'🩰', z:50,
    back: CAP_HAIR('#5a3a22'),
    svg:'<circle cx="100" cy="12" r="15" fill="#5a3a22"/><rect x="89" y="21" width="22" height="7" rx="3.5" fill="#ff7ab8"/>' + FRINGE('#5a3a22') },
  { id:'hair-curly', he:'מתולתל', slot:'hair', cost:13, icon:'🌀', z:50,
    back:'<g fill="#4a2c18"><ellipse cx="100" cy="50" rx="33" ry="36"/><circle cx="70" cy="28" r="12"/><circle cx="130" cy="28" r="12"/><circle cx="63" cy="58" r="13"/><circle cx="137" cy="58" r="13"/><circle cx="70" cy="88" r="12"/><circle cx="130" cy="88" r="12"/></g>',
    svg: FRINGE('#4a2c18') },
  { id:'hair-braids', he:'צמות', slot:'hair', cost:14, icon:'🎗️', z:50,
    back: CAP_HAIR('#5a3a22') + '<g fill="#5a3a22"><circle cx="70" cy="84" r="9"/><circle cx="68" cy="102" r="8"/><circle cx="70" cy="119" r="7"/><circle cx="130" cy="84" r="9"/><circle cx="132" cy="102" r="8"/><circle cx="130" cy="119" r="7"/></g><circle cx="70" cy="131" r="4" fill="#ff7ab8"/><circle cx="130" cy="131" r="4" fill="#ff7ab8"/>',
    svg: FRINGE('#5a3a22') },
  { id:'hair-pink', he:'ורוד', slot:'hair', cost:20, icon:'🦄', z:50,
    back: LONG_HAIR('#f06ec0'), svg: FRINGE('#f06ec0') },

  /* ----- tops ----- */
  { id:'top-basic', he:'חולצה פשוטה', slot:'top', cost:0, icon:'👚', z:25,
    svg:'<path d="M68 106 Q100 96 132 106 L127 150 Q123 170 122 182 L78 182 Q77 170 73 150 Z" fill="#f2b8c6"/><path d="M74 110 Q66 124 64 137" stroke="#f2b8c6" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M126 110 Q134 124 136 137" stroke="#f2b8c6" stroke-width="13" fill="none" stroke-linecap="round"/>' },
  { id:'top-tshirt', he:'טי-שירט', slot:'top', cost:5, icon:'👕', z:25,
    svg:'<path d="M68 106 Q100 96 132 106 L127 150 Q123 170 122 182 L78 182 Q77 170 73 150 Z" fill="#ffd166"/><path d="M74 110 Q66 124 64 137" stroke="#ffd166" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M126 110 Q134 124 136 137" stroke="#ffd166" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M100 152 l4.5 -9 -9 0 Z" fill="#ff7ab8"/><circle cx="100" cy="138" r="9" fill="#ff7ab8"/>' },
  { id:'top-blouse', he:'חולצה מכופתרת', slot:'top', cost:9, icon:'🎽', z:25,
    svg:'<path d="M68 106 Q100 96 132 106 L127 152 Q123 172 122 186 L78 186 Q77 172 73 152 Z" fill="#ffffff"/><path d="M74 110 Q64 132 62 152" stroke="#ffffff" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M126 110 Q136 132 138 152" stroke="#ffffff" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M90 100 L100 120 L110 100" stroke="#e2e8ec" stroke-width="2.5" fill="none"/><circle cx="100" cy="134" r="2" fill="#c9d4da"/><circle cx="100" cy="152" r="2" fill="#c9d4da"/><circle cx="100" cy="170" r="2" fill="#c9d4da"/>' },
  { id:'top-sweater', he:'סוודר', slot:'top', cost:11, icon:'🧶', z:25,
    svg:'<path d="M66 104 Q100 94 134 104 L130 154 Q126 178 125 196 L75 196 Q74 178 70 154 Z" fill="#8a6bd1"/><path d="M71 108 Q60 152 58 190" stroke="#8a6bd1" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M129 108 Q140 152 142 190" stroke="#8a6bd1" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M76 186 Q100 194 124 186" stroke="#6f52b0" stroke-width="4" fill="none"/><path d="M78 128 Q100 136 122 128" stroke="#6f52b0" stroke-width="3" fill="none"/>' },

  /* ----- bottoms ----- */
  { id:'bottom-basic', he:'מכנסיים קצרים', slot:'bottom', cost:0, icon:'🩳', z:20,
    svg:'<path d="M76 168 Q100 178 124 168 Q131 194 128 234 L105 234 L100 208 L95 234 L72 234 Q69 194 76 168 Z" fill="#7aa7d9"/>' },
  { id:'bottom-skirt', he:'חצאית', slot:'bottom', cost:6, icon:'🩱', z:20,
    svg:'<path d="M78 166 Q100 176 122 166 Q137 212 147 258 Q100 273 53 258 Q63 212 78 166 Z" fill="#e26d8a"/><path d="M78 166 Q100 176 122 166 L123 180 Q100 189 77 180 Z" fill="#d15c79"/>' },
  { id:'bottom-pants', he:'מכנסיים', slot:'bottom', cost:7, icon:'👖', z:20,
    svg:'<path d="M76 168 Q100 178 124 168 Q131 200 128 244 L123 364 L106 364 L100 244 L94 364 L77 364 L72 244 Q69 200 76 168 Z" fill="#4a6fa5"/>' },
  { id:'bottom-jeans', he:'ג׳ינס', slot:'bottom', cost:10, icon:'🧵', z:20,
    svg:'<path d="M76 168 Q100 178 124 168 Q131 200 128 244 L123 364 L106 364 L100 244 L94 364 L77 364 L72 244 Q69 200 76 168 Z" fill="#3f5c8a"/><path d="M74 190 Q100 199 126 190" stroke="#2e4468" stroke-width="2" fill="none"/><circle cx="82" cy="182" r="1.8" fill="#e8c04a"/><circle cx="118" cy="182" r="1.8" fill="#e8c04a"/>' },
  { id:'bottom-tutu', he:'חצאית טוטו', slot:'bottom', cost:15, icon:'🩰', z:20,
    svg:'<path d="M78 166 Q100 176 122 166 Q142 200 154 244 Q100 262 46 244 Q58 200 78 166 Z" fill="#ffb3d9"/><path d="M46 244 Q62 258 78 244 Q94 258 110 244 Q126 258 142 244 Q149 252 154 244" fill="none" stroke="#ff8ac4" stroke-width="5"/><path d="M78 166 Q100 176 122 166 L123 180 Q100 189 77 180 Z" fill="#ff8ac4"/>' },

  /* ----- dresses (hide top and bottom) ----- */
  { id:'dress-simple', he:'שמלה פשוטה', slot:'dress', cost:12, icon:'👗', z:28,
    svg:'<path d="M68 106 Q100 96 132 106 L127 150 L122 172 Q142 216 150 274 Q100 290 50 274 Q58 216 78 172 L73 150 Z" fill="#e05a7a"/><path d="M74 110 Q66 124 64 137" stroke="#e05a7a" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M126 110 Q134 124 136 137" stroke="#e05a7a" stroke-width="13" fill="none" stroke-linecap="round"/><rect x="76" y="168" width="48" height="7" rx="3.5" fill="#c2445f"/>' },
  { id:'dress-party', he:'שמלת מסיבה', slot:'dress', cost:18, icon:'✨', z:28,
    svg:'<path d="M68 106 Q100 96 132 106 L127 150 L122 172 Q148 220 158 292 Q100 310 42 292 Q52 220 78 172 L73 150 Z" fill="#8a4fd1"/><path d="M74 110 Q66 124 64 137" stroke="#8a4fd1" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M126 110 Q134 124 136 137" stroke="#8a4fd1" stroke-width="13" fill="none" stroke-linecap="round"/><rect x="76" y="167" width="48" height="8" rx="4" fill="#ffd166"/><g fill="#ffd166"><circle cx="86" cy="212" r="2.6"/><circle cx="114" cy="228" r="2.6"/><circle cx="96" cy="252" r="2.6"/><circle cx="126" cy="264" r="2.6"/><circle cx="72" cy="262" r="2.6"/><circle cx="104" cy="280" r="2.6"/></g>' },
  { id:'dress-gown', he:'שמלת נשף', slot:'dress', cost:26, icon:'👸', z:28,
    svg:'<path d="M68 106 Q100 96 132 106 L127 150 L122 172 Q152 240 166 360 Q100 378 34 360 Q48 240 78 172 L73 150 Z" fill="#2f7fd1"/><path d="M74 110 Q66 122 64 134" stroke="#2f7fd1" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M126 110 Q134 122 136 134" stroke="#2f7fd1" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M34 360 Q100 378 166 360 Q100 366 34 360 Z" fill="#8fc4f5"/><rect x="76" y="166" width="48" height="9" rx="4.5" fill="#e8c04a"/><g fill="#cfe8ff"><circle cx="88" cy="230" r="3"/><circle cx="116" cy="258" r="3"/><circle cx="100" cy="300" r="3"/><circle cx="76" cy="300" r="3"/><circle cx="126" cy="322" r="3"/></g>' },

  /* ----- shoes ----- */
  { id:'shoes-basic', he:'נעליים', slot:'shoes', cost:0, icon:'🥿', z:32,
    svg:'<ellipse cx="88" cy="378" rx="10" ry="6.8" fill="#5a5a6b"/><ellipse cx="112" cy="378" rx="10" ry="6.8" fill="#5a5a6b"/>' },
  { id:'shoes-sneakers', he:'סניקרס', slot:'shoes', cost:6, icon:'👟', z:32,
    svg:'<ellipse cx="90" cy="377" rx="12" ry="8" fill="#ffffff"/><ellipse cx="110" cy="377" rx="12" ry="8" fill="#ffffff"/><path d="M79 378 Q90 383 101 378" stroke="#ff7ab8" stroke-width="3" fill="none"/><path d="M99 378 Q110 383 121 378" stroke="#ff7ab8" stroke-width="3" fill="none"/>' },
  { id:'shoes-boots', he:'מגפיים', slot:'shoes', cost:11, icon:'👢', z:32,
    svg:'<path d="M81 332 L98 332 L97 374 Q97 384 89 384 L79 384 Q77 374 80 366 Z" fill="#8a4b2a"/><path d="M102 332 L119 332 L121 366 Q124 374 122 384 L111 384 Q103 384 103 374 Z" fill="#8a4b2a"/><rect x="80" y="338" width="18" height="5" fill="#6b381f"/><rect x="102" y="338" width="18" height="5" fill="#6b381f"/>' },
  { id:'shoes-heels', he:'עקבים', slot:'shoes', cost:14, icon:'👠', z:32,
    svg:'<path d="M78 368 Q89 362 99 370 L99 377 L78 377 Z" fill="#d6295b"/><rect x="94" y="377" width="4" height="9" fill="#d6295b"/><path d="M101 370 Q111 362 122 368 L122 377 L101 377 Z" fill="#d6295b"/><rect x="102" y="377" width="4" height="9" fill="#d6295b"/>' },

  /* ----- hats ----- */
  { id:'hat-cap', he:'כובע מצחייה', slot:'hat', cost:6, icon:'🧢', z:60,
    svg:'<path d="M72 30 Q100 2 128 30 L128 36 L72 36 Z" fill="#e05a7a"/><path d="M126 30 Q156 34 156 42 L126 39 Z" fill="#c94a68"/><circle cx="100" cy="6" r="3.5" fill="#c94a68"/>' },
  { id:'hat-sun', he:'כובע שמש', slot:'hat', cost:9, icon:'👒', z:60,
    svg:'<ellipse cx="100" cy="34" rx="54" ry="12" fill="#f4d06f"/><path d="M78 34 Q80 4 100 4 Q120 4 122 34 Z" fill="#f4d06f"/><rect x="78" y="26" width="44" height="7" fill="#e07a5f"/>' },
  { id:'hat-fancy', he:'כובע מהודר', slot:'hat', cost:19, icon:'🎩', z:60,
    svg:'<ellipse cx="100" cy="34" rx="58" ry="13" fill="#3b2b4a"/><path d="M76 34 Q78 0 100 0 Q122 0 124 34 Z" fill="#3b2b4a"/><rect x="76" y="24" width="48" height="8" fill="#d6295b"/><circle cx="128" cy="28" r="8" fill="#ff9ec9"/><circle cx="128" cy="28" r="3.5" fill="#ffd166"/>' },
  { id:'hat-crown', he:'כתר', slot:'hat', cost:24, icon:'👑', z:60,
    svg:'<path d="M76 32 L76 6 L88 18 L100 0 L112 18 L124 6 L124 32 Z" fill="#f0c419"/><rect x="76" y="30" width="48" height="8" rx="3" fill="#d9a70f"/><circle cx="100" cy="18" r="3.5" fill="#e94f7c"/><circle cx="86" cy="34" r="2.6" fill="#4fc3e9"/><circle cx="114" cy="34" r="2.6" fill="#4fc3e9"/>' },

  /* ----- bags ----- */
  { id:'bag-backpack', he:'תיק גב', slot:'bag', cost:6, icon:'🎒', z:8,
    svg:'<rect x="50" y="102" width="100" height="96" rx="20" fill="#ef6f4a"/><rect x="74" y="148" width="52" height="28" rx="9" fill="#d4562f"/><rect x="50" y="126" width="100" height="8" fill="#d4562f"/><circle cx="100" cy="162" r="4" fill="#ffd9c9"/>' },
  { id:'bag-hand', he:'תיק יד', slot:'bag', cost:10, icon:'👜', z:58,
    svg:'<rect x="130" y="198" width="34" height="27" rx="6" fill="#d94f70"/><path d="M137 198 Q147 181 157 198" stroke="#d94f70" stroke-width="4" fill="none"/><rect x="130" y="208" width="34" height="5" fill="#b83a58"/>' },
  { id:'bag-purse', he:'ארנק נוצץ', slot:'bag', cost:15, icon:'👝', z:58,
    svg:'<rect x="132" y="200" width="30" height="25" rx="10" fill="#f0c419"/><path d="M138 200 Q147 187 156 200" stroke="#f0c419" stroke-width="4" fill="none"/><circle cx="147" cy="212" r="3.5" fill="#fff3c4"/>' },

  /* ----- makeup ----- */
  { id:'makeup-blush', he:'סומק', slot:'makeup', cost:5, icon:'🌸', z:42,
    svg:'<ellipse cx="82" cy="64" rx="7" ry="4.4" fill="#f08a9a" opacity=".55"/><ellipse cx="118" cy="64" rx="7" ry="4.4" fill="#f08a9a" opacity=".55"/>' },
  { id:'makeup-lips', he:'שפתון', slot:'makeup', cost:7, icon:'💋', z:42,
    svg:'<path d="M93 70 Q96.5 66.5 100 69.5 Q103.5 66.5 107 70 Q100 77.5 93 70 Z" fill="#d6295b"/>' },
  { id:'makeup-eyes', he:'צלליות', slot:'makeup', cost:9, icon:'👁️', z:42,
    svg:'<path d="M84 50 Q89 45.5 94 50" stroke="#a86fd6" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M106 50 Q111 45.5 116 50" stroke="#a86fd6" stroke-width="3.4" fill="none" stroke-linecap="round"/>' },
  { id:'makeup-glam', he:'איפור מלא', slot:'makeup', cost:17, icon:'💄', z:42,
    svg:'<ellipse cx="82" cy="64" rx="7" ry="4.4" fill="#f08a9a" opacity=".6"/><ellipse cx="118" cy="64" rx="7" ry="4.4" fill="#f08a9a" opacity=".6"/><path d="M84 50 Q89 45.5 94 50" stroke="#c05fd6" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M106 50 Q111 45.5 116 50" stroke="#c05fd6" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M93 70 Q96.5 66.5 100 69.5 Q103.5 66.5 107 70 Q100 77.5 93 70 Z" fill="#d6295b"/><path d="M83.5 53 L80 50.5 M85 55.5 L81 55" stroke="#3d2b24" stroke-width="1.4" stroke-linecap="round"/><path d="M116.5 53 L120 50.5 M115 55.5 L119 55" stroke="#3d2b24" stroke-width="1.4" stroke-linecap="round"/>' },

  /* ----- accessories ----- */
  { id:'acc-glasses', he:'משקפיים', slot:'accessory', cost:6, icon:'👓', z:55,
    svg:'<circle cx="89" cy="56" r="8.5" fill="none" stroke="#3b2b4a" stroke-width="2.2"/><circle cx="111" cy="56" r="8.5" fill="none" stroke="#3b2b4a" stroke-width="2.2"/><path d="M97.5 56 L102.5 56" stroke="#3b2b4a" stroke-width="2.2"/>' },
  { id:'acc-earrings', he:'עגילים', slot:'accessory', cost:8, icon:'💎', z:55,
    svg:'<circle cx="75" cy="66" r="4.5" fill="#4fc3e9"/><circle cx="125" cy="66" r="4.5" fill="#4fc3e9"/><circle cx="75" cy="66" r="1.8" fill="#d9f4ff"/><circle cx="125" cy="66" r="1.8" fill="#d9f4ff"/>' },
  { id:'acc-necklace', he:'שרשרת', slot:'accessory', cost:12, icon:'📿', z:55,
    svg:'<path d="M88 98 Q100 114 112 98" stroke="#e8c04a" stroke-width="2.6" fill="none"/><circle cx="100" cy="112" r="4.5" fill="#e8c04a"/><circle cx="100" cy="112" r="1.8" fill="#fff3c4"/>' },
  { id:'acc-wings', he:'כנפי פיה', slot:'accessory', cost:22, icon:'🧚', z:9,
    svg:'<g opacity=".8"><path d="M74 112 Q26 80 30 142 Q34 190 78 164 Z" fill="#bde9ff"/><path d="M126 112 Q174 80 170 142 Q166 190 122 164 Z" fill="#bde9ff"/><path d="M74 112 Q44 104 38 140" stroke="#8fd4f2" stroke-width="2" fill="none"/><path d="M126 112 Q156 104 162 140" stroke="#8fd4f2" stroke-width="2" fill="none"/></g>' }
];

/* Free from day one, so she is never looking at an undressed figure. */
const STARTER = ['hair-basic', 'top-basic', 'bottom-basic', 'shoes-basic'];
