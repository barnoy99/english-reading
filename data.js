/* data.js — all content lives here.
   Swap the reward world by editing ROOM. Nothing else knows about it. */

const CHILD = { name: 'אביגיל', emoji: '👧' };

/* ---------- letters ----------
   `sound`  = the phoneme id. Two options may NEVER share one, or a sound
              question would have two right answers (c/k both say /k/).
   `say`    = TTS-friendly spelling of the sound. Bare phonemes make speech
              engines read the letter NAME instead, so /b/ is written "buh" —
              which is how the sound is taught out loud anyway.
   `nameSay`= TTS spelling of the letter NAME ("bee"). Name and sound are
              taught and tested separately; conflating them is the classic
              way kids get stuck.
   `confuse`= looks alike. Used as hard distractors only once the letter is solid.
   `near`   = sounds alike. NEVER used as distractors — several are the specific
              traps for a Hebrew speaker: ו has no /w/, so v and w blur, and
              פ is both /p/ and /f/.
   `order`  = unlock order. Phonics order (s,a,t,p,i,n...), not alphabetical,
              so real words become readable within the first week. */

const LETTERS = [
  { id:'a', up:'A', low:'a', name:'אֵיי', nameSay:'ay', sound:'a', say:'ah',
    kw:'apple', kwHe:'תפוח', emoji:'🍎', confuse:['e','o','c'], near:['u','o','e'], order:2 },
  { id:'b', up:'B', low:'b', name:'בִּי', nameSay:'bee', sound:'b', say:'buh',
    kw:'ball', kwHe:'כדור', emoji:'⚽', confuse:['d','p','q','h'], near:['v','p','d'], order:18 },
  { id:'c', up:'C', low:'c', name:'סִי', nameSay:'see', sound:'k', say:'kuh',
    kw:'cat', kwHe:'חתול', emoji:'🐱', confuse:['e','o','a'], near:[], order:11 },
  { id:'d', up:'D', low:'d', name:'דִי', nameSay:'dee', sound:'d', say:'duh',
    kw:'dog', kwHe:'כלב', emoji:'🐶', confuse:['b','p','q','a'], near:['t','b'], order:8 },
  { id:'e', up:'E', low:'e', name:'אִי', nameSay:'ee', sound:'e', say:'eh',
    kw:'egg', kwHe:'ביצה', emoji:'🥚', confuse:['a','c','o'], near:['i','a'], order:13 },
  { id:'f', up:'F', low:'f', name:'אֶף', nameSay:'eff', sound:'f', say:'fuh',
    kw:'fish', kwHe:'דג', emoji:'🐟', confuse:['t','l','r'], near:['p','v'], order:19 },
  { id:'g', up:'G', low:'g', name:'גִ׳י', nameSay:'gee', sound:'g', say:'guh',
    kw:'girl', kwHe:'ילדה', emoji:'👧', confuse:['q','j','y','p'], near:['k','j'], order:9 },
  { id:'h', up:'H', low:'h', name:'אֵייץ׳', nameSay:'aitch', sound:'h', say:'huh',
    kw:'hat', kwHe:'כובע', emoji:'🎩', confuse:['n','b','k'], near:[], order:17 },
  { id:'i', up:'I', low:'i', name:'אַיי', nameSay:'eye', sound:'i', say:'ih',
    kw:'insect', kwHe:'חרק', emoji:'🦗', confuse:['j','l','t'], near:['e'], order:5 },
  { id:'j', up:'J', low:'j', name:'גֵ׳יי', nameSay:'jay', sound:'j', say:'juh',
    kw:'juice', kwHe:'מיץ', emoji:'🧃', confuse:['i','g','y'], near:['g','z'], order:22 },
  { id:'k', up:'K', low:'k', name:'קֵיי', nameSay:'kay', sound:'k', say:'kuh',
    kw:'key', kwHe:'מפתח', emoji:'🔑', confuse:['x','h'], near:['g'], order:12 },
  { id:'l', up:'L', low:'l', name:'אֶל', nameSay:'el', sound:'l', say:'luh',
    kw:'lion', kwHe:'אריה', emoji:'🦁', confuse:['i','t','f'], near:['r'], order:20 },
  { id:'m', up:'M', low:'m', name:'אֶם', nameSay:'em', sound:'m', say:'muh',
    kw:'moon', kwHe:'ירח', emoji:'🌙', confuse:['n','w','h'], near:['n'], order:7 },
  { id:'n', up:'N', low:'n', name:'אֶן', nameSay:'en', sound:'n', say:'nuh',
    kw:'nose', kwHe:'אף', emoji:'👃', confuse:['m','h','r','u'], near:['m'], order:6 },
  { id:'o', up:'O', low:'o', name:'אוֹ', nameSay:'oh', sound:'o', say:'awe',
    kw:'octopus', kwHe:'תמנון', emoji:'🐙', confuse:['a','c','e','q'], near:['a','u'], order:10 },
  { id:'p', up:'P', low:'p', name:'פִּי', nameSay:'pee', sound:'p', say:'puh',
    kw:'pizza', kwHe:'פיצה', emoji:'🍕', confuse:['q','b','d','g'], near:['b','f'], order:4 },
  { id:'q', up:'Q', low:'q', name:'קְיוּ', nameSay:'cue', sound:'kw', say:'kwuh',
    kw:'queen', kwHe:'מלכה', emoji:'👑', confuse:['p','g','b','d'], near:['k'], order:26 },
  { id:'r', up:'R', low:'r', name:'אָר', nameSay:'ar', sound:'r', say:'ruh',
    kw:'rabbit', kwHe:'ארנב', emoji:'🐰', confuse:['n','f','v'], near:['l'], order:14 },
  { id:'s', up:'S', low:'s', name:'אֶס', nameSay:'ess', sound:'s', say:'suh',
    kw:'sun', kwHe:'שמש', emoji:'☀️', confuse:['z','c'], near:['z'], order:1 },
  { id:'t', up:'T', low:'t', name:'טִי', nameSay:'tee', sound:'t', say:'tuh',
    kw:'tree', kwHe:'עץ', emoji:'🌳', confuse:['f','l','i'], near:['d'], order:3 },
  { id:'u', up:'U', low:'u', name:'יוּ', nameSay:'you', sound:'u', say:'uh',
    kw:'umbrella', kwHe:'מטרייה', emoji:'☂️', confuse:['v','n','o'], near:['a','o'], order:21 },
  { id:'v', up:'V', low:'v', name:'וִי', nameSay:'vee', sound:'v', say:'vuh',
    kw:'violin', kwHe:'כינור', emoji:'🎻', confuse:['u','w','y','r'], near:['w','b','f'], order:23 },
  { id:'w', up:'W', low:'w', name:'דַּבֶּל-יוּ', nameSay:'double you', sound:'w', say:'wuh',
    kw:'water', kwHe:'מים', emoji:'💧', confuse:['v','m','u'], near:['v'], order:24 },
  { id:'x', up:'X', low:'x', name:'אֶקְס', nameSay:'ex', sound:'ks', say:'ks',
    kw:'fox', kwHe:'שועל', emoji:'🦊', confuse:['k','y','z'], near:[], order:25, endSound:true },
  { id:'y', up:'Y', low:'y', name:'וַואי', nameSay:'why', sound:'y', say:'yuh',
    kw:'yellow', kwHe:'צהוב', emoji:'🟡', confuse:['v','g','j','x'], near:['w'], order:16 },
  { id:'z', up:'Z', low:'z', name:'זִי', nameSay:'zee', sound:'z', say:'zuh',
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

/* ---------- the room ----------
   `slot` decides where an item lands; each slot has a fixed number of spots in
   the layout, filled in purchase order. Adding furniture is a data edit only.
   Costs are in coins, one coin per finished mission — so day one buys something. */

const ROOM = [
  { id:'rug',      emoji:'🟣', he:'שטיח',        slot:'floor', cost:1 },
  { id:'plant',    emoji:'🪴', he:'עציץ',        slot:'floor', cost:1 },
  { id:'bed',      emoji:'🛏️', he:'מיטה',        slot:'floor', cost:3 },
  { id:'desk',     emoji:'🪑', he:'כיסא',        slot:'floor', cost:2 },
  { id:'bookcase', emoji:'📚', he:'ספרייה',      slot:'floor', cost:3 },
  { id:'piano',    emoji:'🎹', he:'פסנתר',       slot:'floor', cost:5 },
  { id:'mirror',   emoji:'🪞', he:'מראה',        slot:'floor', cost:2 },
  { id:'guitar',   emoji:'🎸', he:'גיטרה',       slot:'floor', cost:4 },

  { id:'poster',   emoji:'🖼️', he:'תמונה',       slot:'wall',  cost:1 },
  { id:'clock',    emoji:'🕐', he:'שעון',        slot:'wall',  cost:2 },
  { id:'window',   emoji:'🪟', he:'חלון',        slot:'wall',  cost:3 },
  { id:'rainbow',  emoji:'🌈', he:'קשת',         slot:'wall',  cost:4 },
  { id:'star',     emoji:'⭐', he:'כוכב',        slot:'wall',  cost:1 },
  { id:'balloons', emoji:'🎈', he:'בלונים',      slot:'wall',  cost:2 },

  { id:'teddy',    emoji:'🧸', he:'דובי',        slot:'shelf', cost:2 },
  { id:'lamp',     emoji:'💡', he:'מנורה',       slot:'shelf', cost:1 },
  { id:'flowers',  emoji:'💐', he:'פרחים',       slot:'shelf', cost:2 },
  { id:'trophy',   emoji:'🏆', he:'גביע',        slot:'shelf', cost:5 },
  { id:'books',    emoji:'📗', he:'ספרים',       slot:'shelf', cost:1 },
  { id:'cupcake',  emoji:'🧁', he:'קאפקייק',     slot:'shelf', cost:2 },
  { id:'candle',   emoji:'🕯️', he:'נר',          slot:'shelf', cost:1 },
  { id:'crown',    emoji:'👑', he:'כתר',         slot:'shelf', cost:5 },

  { id:'cat',      emoji:'🐱', he:'חתול',        slot:'pet',   cost:4 },
  { id:'dog',      emoji:'🐶', he:'כלב',         slot:'pet',   cost:4 },
  { id:'bunny',    emoji:'🐰', he:'ארנב',        slot:'pet',   cost:3 },
  { id:'fishbowl', emoji:'🐠', he:'דג',          slot:'pet',   cost:2 },
  { id:'parrot',   emoji:'🦜', he:'תוכי',        slot:'pet',   cost:5 },
  { id:'unicorn',  emoji:'🦄', he:'חד־קרן',      slot:'pet',   cost:6 }
];

/* How many spots each slot has in the layout. Buying past the limit is
   blocked by the shop, so the room never overflows. */
const ROOM_SLOTS = { floor: 4, wall: 4, shelf: 4, pet: 2 };
