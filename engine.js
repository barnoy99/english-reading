/* engine.js — content selection, mastery tracking and progression.
   Knows nothing about the DOM. Inspect it live via window.__engine. */

const Engine = (function () {
  const KEY = 'abigailEnglish_state';

  const L = {}; LETTERS.forEach(l => L[l.id] = l);
  const W = {}; WORDS.forEach(w => W[w.en] = w);

  /* Every letter is tracked on four separate skills. Knowing that B is called
     "bee" is not the same as knowing it says /b/, and neither means she can
     form it — so they get their own scores and their own review schedules. */
  const LETTER_SKILLS = ['sound', 'name', 'case', 'trace'];

  /* Leitner box -> how many missions until the item comes back. */
  const INTERVALS = [0, 1, 2, 4, 8, 16];
  const SOLID_BOX = 3;
  const QUESTIONS_PER_ACTIVITY = 5;

  /* Letter names rhyme in big families — bee/see/dee/gee/pee/tee/vee/zee is
     eight letters that sound almost alike. That IS the hard part of English
     letter names, so rhyming distractors are used once a letter is solid and
     avoided before that. */
  const NAME_RHYME = {
    b:'ee', c:'ee', d:'ee', e:'ee', g:'ee', p:'ee', t:'ee', v:'ee', z:'ee',
    a:'ay', j:'ay', k:'ay',
    f:'eh', l:'eh', m:'eh', n:'eh', s:'eh', x:'eh',
    i:'eye', y:'eye',
    q:'you', u:'you', w:'you',
    o:'oh', r:'ar', h:'aitch'
  };

  let s = null;
  let mission = null;
  let audioOk = true;   // set by the app once the voice list has loaded

  /* ---------- state ---------- */

  function fresh() {
    return {
      letters: START_LETTERS.length ? START_LETTERS.slice()
                                    : LETTER_ORDER.slice(0, OPENING_LETTERS),
      stage: 1,
      mastery: {},   // itemKey -> 0..1
      box: {},       // itemKey -> Leitner box 0..5
      seen: {},      // itemKey -> times asked
      due: {},       // itemKey -> mission number it becomes due again
      mission: 0,
      /* `earned` is the lifetime coin count and only ever goes up; the
         spendable balance is derived from it. That is what makes two devices
         mergeable — a running balance would lose every purchase made on the
         other one. */
      earned: 0,
      coins: 0,
      owned: [],     // ROOM item ids
      shop: [],      // the three ids currently on offer
      streak: 0,
      lastDay: null,
      newest: null,
      mic: true,
      goal: 3        // activities per mission
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      s = raw ? JSON.parse(raw) : fresh();
    } catch (e) { s = fresh(); }

    const hadEarned = s.earned !== undefined;
    const base = fresh();
    Object.keys(base).forEach(k => { if (s[k] === undefined) s[k] = base[k]; });
    // a save from before coins were derived: reconstruct the lifetime total
    if (!hadEarned) s.earned = (s.coins || 0) + spent();

    // guard against a save that references content no longer in data.js
    s.letters = (s.letters || []).filter(id => L[id]);
    if (!s.letters.length) s.letters = LETTER_ORDER.slice(0, OPENING_LETTERS);
    s.owned = (s.owned || []).filter(id => ROOM.some(r => r.id === id));
    s.shop = (s.shop || []).filter(id => ROOM.some(r => r.id === id));
    recomputeCoins();
    if (!s.shop.length) rollShop();
    return s;
  }

  let onSave = null;

  function save() {
    s.updatedAt = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
    if (onSave) onSave();
  }

  const spent = () => (s.owned || []).reduce((a, id) => {
    const item = ROOM.find(r => r.id === id);
    return a + (item ? item.cost : 0);
  }, 0);

  /* Never stored as truth — always recomputed from earned minus what the room
     cost, so it survives a merge from another device. */
  function recomputeCoins() { s.coins = Math.max(0, (s.earned || 0) - spent()); }
  function reset() { s = fresh(); rollShop(); save(); return s; }

  /* ---------- scoring ---------- */

  const lKey = (id, skill) => 'l:' + id + ':' + skill;
  const wKey = (en, skill) => 'w:' + en + ':' + skill;

  function m(k) { return s.mastery[k] || 0; }
  function box(k) { return s.box[k] || 0; }

  function record(key, correct) {
    const cur = m(key);
    s.mastery[key] = correct
      ? Math.min(1, cur + 0.25 * (1 - cur) + 0.06)
      : Math.max(0, cur - 0.30);
    s.seen[key] = (s.seen[key] || 0) + 1;

    const b = box(key);
    const nb = correct ? Math.min(5, b + 1) : Math.max(0, b - 2);
    s.box[key] = nb;
    // a miss is due again inside this same mission; a hit waits out its box
    s.due[key] = s.mission + (correct ? INTERVALS[nb] : 0);
    save();
  }

  function letterScore(id) {
    let sum = 0;
    LETTER_SKILLS.forEach(sk => sum += m(lKey(id, sk)));
    return sum / LETTER_SKILLS.length;
  }

  function letterSolid(id) {
    const solid = LETTER_SKILLS.filter(sk => box(lKey(id, sk)) >= SOLID_BOX).length;
    return solid / LETTER_SKILLS.length;
  }

  function openSolidFraction() {
    let ok = 0, total = 0;
    s.letters.forEach(id => LETTER_SKILLS.forEach(sk => {
      total++; if (box(lKey(id, sk)) >= SOLID_BOX) ok++;
    }));
    return total ? ok / total : 0;
  }

  /* ---------- picking ---------- */

  function weightedPick(list) {
    const total = list.reduce((a, x) => a + x.w, 0);
    if (total <= 0) return list[Math.floor(Math.random() * list.length)];
    let r = Math.random() * total;
    for (const x of list) { r -= x.w; if (r <= 0) return x; }
    return list[list.length - 1];
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* Favours what is due, what is weak, what has never been seen, and the
     letter that opened most recently. Items not yet due are heavily damped
     rather than banned, so a short session still has something to ask. */
  function itemWeight(key) {
    let w = 1 + 4 * (1 - m(key));
    if (!s.seen[key]) w += 4;
    if ((s.due[key] || 0) <= s.mission) w += 3; else w *= 0.2;
    if (s.newest && key.indexOf('l:' + s.newest + ':') === 0) w *= 2.2;
    return w;
  }

  function pickLetter(skill, exclude) {
    const cands = s.letters
      .filter(id => id !== exclude)
      .map(id => ({ id, w: itemWeight(lKey(id, skill)) }));
    if (!cands.length) return s.letters[0];
    return weightedPick(cands).id;
  }

  /* ---------- distractors ---------- */

  /* Options for a question about a letter's SOUND. Anything that shares the
     target's phoneme is disqualified outright (c and k both say /k/, so a
     question with both has two right answers). Anything merely close is held
     back until the letter is solid. */
  function soundOptions(targetId, n) {
    const t = L[targetId];
    const hard = m(lKey(targetId, 'sound')) > 0.6;
    const near = t.near || [];
    const conf = t.confuse || [];

    const pool = s.letters.filter(id => id !== targetId && L[id].sound !== t.sound);
    const scored = pool.map(id => {
      let sc = Math.random();
      if (near.indexOf(id) >= 0) sc += hard ? 2.5 : -5;   // the tricky pairs, when ready
      if (conf.indexOf(id) >= 0) sc += hard ? 1.2 : -1;
      return { id, sc };
    }).sort((a, b) => b.sc - a.sc);

    /* No two options may say the same thing, even when neither is the answer:
       c and k side by side teaches that they are interchangeable. */
    const taken = new Set([t.sound]);
    const out = [];
    for (const x of scored) {
      if (out.length >= n) break;
      if (taken.has(L[x.id].sound)) continue;
      taken.add(L[x.id].sound);
      out.push(L[x.id]);
    }
    return out;
  }

  /* Options for a question about a letter's NAME — rhyming names are the trap. */
  function nameOptions(targetId, n) {
    const hard = m(lKey(targetId, 'name')) > 0.6;
    const rhyme = NAME_RHYME[targetId];

    const pool = s.letters.filter(id => id !== targetId);
    const scored = pool.map(id => {
      let sc = Math.random();
      if (NAME_RHYME[id] === rhyme) sc += hard ? 3 : -4;
      return { id, sc };
    }).sort((a, b) => b.sc - a.sc);

    return scored.slice(0, n).map(x => L[x.id]);
  }

  /* Options for upper/lowercase matching — look-alikes once solid. */
  function caseOptions(targetId, n) {
    const hard = m(lKey(targetId, 'case')) > 0.6;
    const conf = L[targetId].confuse || [];
    const pool = s.letters.filter(id => id !== targetId);
    const scored = pool.map(id => {
      let sc = Math.random();
      if (conf.indexOf(id) >= 0) sc += hard ? 3 : -2;
      return { id, sc };
    }).sort((a, b) => b.sc - a.sc);
    return scored.slice(0, n).map(x => L[x.id]);
  }

  /* ---------- the sound hunt ---------- */

  /* A word can only be used when its first letter really is its first sound.
     "cheese" starts with c but says /tʃ/; "ice cream" starts with i but says
     /aɪ/. Both would make the question a lie. */
  function huntSafe(en) {
    const w = en.toLowerCase();
    if (!L[w[0]]) return false;
    return HUNT_UNSAFE.indexOf(w.slice(0, 2)) < 0;
  }

  /* The letter keywords carry the clean short-vowel examples (apple, egg,
     insect, octopus, umbrella) that the main word list has none of. */
  function huntPool() {
    const out = WORDS.filter(w => w.emoji && huntSafe(w.en));
    LETTERS.forEach(l => {
      if (!out.some(w => w.en === l.kw) && huntSafe(l.kw)) {
        out.push({ en: l.kw, he: l.kwHe, topic: 'letters', emoji: l.emoji });
      }
    });
    return out;
  }

  function huntTargets() {
    const pool = huntPool();
    return s.letters.filter(id => !L[id].endSound &&
      pool.some(w => w.en[0] === id));
  }

  /* ---------- words ---------- */

  function wordPool() {
    return WORDS.filter(w => w.emoji);
  }

  function pickWord(skill, exclude) {
    const cands = wordPool()
      .filter(w => w.en !== exclude)
      .map(w => ({ w, weight: itemWeight(wKey(w.en, skill)) }));
    return weightedPick(cands.map(c => ({ w: c.weight, item: c.w }))).item;
  }

  function wordOptions(target, n, skill) {
    const hard = m(wKey(target.en, skill)) > 0.6;
    const pool = wordPool().filter(w => w.en !== target.en && w.emoji !== target.emoji);
    const scored = pool.map(w => {
      let sc = Math.random();
      // once she is sure of a word, crowd it with its own topic; before that
      // keep the four pictures obviously different from each other
      if (w.topic === target.topic) sc += hard ? 2 : -1.5;
      if (skill === 'read' && w.en[0] === target.en[0]) sc += hard ? 1.5 : -1;
      return { w, sc };
    }).sort((a, b) => b.sc - a.sc);
    return scored.slice(0, n).map(x => x.w);
  }

  /* ---------- questions ---------- */

  function withOptions(correctItem, others) {
    const opts = shuffle([correctItem].concat(others));
    return { options: opts, correct: opts.indexOf(correctItem) };
  }

  function makeQuestion(type, prev) {
    if (type === 'letterSound') {
      const id = pickLetter('sound', prev);
      const o = withOptions(L[id], soundOptions(id, 3));
      return { type, key: lKey(id, 'sound'), target: id, letter: L[id],
               options: o.options, correct: o.correct };
    }
    if (type === 'letterName') {
      const id = pickLetter('name', prev);
      const o = withOptions(L[id], nameOptions(id, 3));
      return { type, key: lKey(id, 'name'), target: id, letter: L[id],
               options: o.options, correct: o.correct };
    }
    if (type === 'letterCase') {
      const id = pickLetter('case', prev);
      const o = withOptions(L[id], caseOptions(id, 3));
      return { type, key: lKey(id, 'case'), target: id, letter: L[id],
               options: o.options, correct: o.correct };
    }
    if (type === 'letterTrace') {
      const id = pickLetter('trace', prev);
      return { type, key: lKey(id, 'trace'), target: id, letter: L[id],
               which: Math.random() < 0.5 ? 'up' : 'low' };
    }
    if (type === 'soundHunt') {
      const targets = huntTargets();
      const id = targets.length
        ? weightedPick(targets.filter(x => x !== prev).concat(targets.length === 1 ? targets : [])
            .map(x => ({ id: x, w: itemWeight(lKey(x, 'sound')) }))).id
        : s.letters[0];
      const pool = huntPool();
      const hits = pool.filter(w => w.en[0] === id);
      const hit = hits[Math.floor(Math.random() * hits.length)];
      const others = shuffle(pool.filter(w =>
        L[w.en[0]] && L[w.en[0]].sound !== L[id].sound && w.emoji !== hit.emoji
      )).slice(0, 3);
      const o = withOptions(hit, others);
      return { type, key: lKey(id, 'sound'), target: id, letter: L[id],
               options: o.options, correct: o.correct };
    }
    if (type === 'hearPic') {
      const w = pickWord('hear', prev);
      const o = withOptions(w, wordOptions(w, 3, 'hear'));
      return { type, key: wKey(w.en, 'hear'), target: w.en, word: w,
               options: o.options, correct: o.correct };
    }
    if (type === 'picWord') {
      const w = pickWord('read', prev);
      const o = withOptions(w, wordOptions(w, 3, 'read'));
      return { type, key: wKey(w.en, 'read'), target: w.en, word: w,
               options: o.options, correct: o.correct };
    }
    return null;
  }

  /* ---------- missions ---------- */

  /* Stage 1 owns the mission while the letters are shaky. The listening game
     needs no reading at all, so it joins the rotation early for variety —
     picture-to-WORD stays locked until stage 2, because that one needs
     letters. */
  function availableActivities() {
    const acts = ['letterCase', 'letterTrace'];
    /* Three of the games are pure listening. On a device with no English voice
       installed they are unanswerable, so they leave the rotation entirely
       rather than handing her silent questions. */
    if (audioOk) {
      acts.push('letterSound', 'letterName');
      if (huntTargets().length >= 1) acts.push('soundHunt');
      if (s.mission >= 2) acts.push('hearPic');
    }
    if (s.stage >= 2) acts.push('picWord');
    return acts;
  }

  function chooseActivities() {
    const pool = availableActivities();
    const stage1 = ['letterSound', 'letterName', 'letterCase', 'letterTrace', 'soundHunt'];
    const scored = pool.map(t => {
      let w = stage1.indexOf(t) >= 0 ? (s.stage === 1 ? 3 : 1.4) : 1;
      if (t === 'hearPic' && s.stage === 1) w = 0.8;   // a taste, not the main course
      return { t, w };
    });
    const out = [];
    const left = scored.slice();
    while (out.length < s.goal && left.length) {
      const pick = weightedPick(left.map(x => ({ w: x.w, t: x.t })));
      out.push(pick.t);
      const i = left.findIndex(x => x.t === pick.t);
      if (i >= 0) left.splice(i, 1);
    }
    while (out.length < s.goal) out.push(pool[Math.floor(Math.random() * pool.length)]);
    return out;
  }

  function startMission() {
    mission = {
      acts: chooseActivities(), ai: 0, qi: 0,
      correct: 0, total: 0, prev: null
    };
    return { activities: mission.acts, total: mission.acts.length * QUESTIONS_PER_ACTIVITY };
  }

  function next() {
    if (!mission) return null;
    if (mission.qi >= QUESTIONS_PER_ACTIVITY) { mission.ai++; mission.qi = 0; mission.prev = null; }
    if (mission.ai >= mission.acts.length) return null;
    const q = makeQuestion(mission.acts[mission.ai], mission.prev);
    if (!q) { mission.ai++; return next(); }
    mission.qi++;
    mission.prev = q.target;
    q.index = mission.total;
    q.of = mission.acts.length * QUESTIONS_PER_ACTIVITY;
    q.activity = mission.acts[mission.ai];
    return q;
  }

  function answer(q, correct) {
    if (!q) return;
    record(q.key, correct);
    if (mission) { mission.total++; if (correct) mission.correct++; }
  }

  function todayKey(d) { return (d || new Date()).toISOString().slice(0, 10); }

  function finishMission(bonus) {
    const acc = mission && mission.total ? mission.correct / mission.total : 0;
    s.mission++;
    s.earned = (s.earned || 0) + 1 + (bonus || 0);
    recomputeCoins();

    const today = todayKey();
    if (s.lastDay !== today) {
      const y = new Date(); y.setDate(y.getDate() - 1);
      s.streak = (s.lastDay === todayKey(y)) ? s.streak + 1 : 1;
      s.lastDay = today;
    }

    const unlocked = tryUnlock();
    const stageUp = tryOpenStage();
    rollShop();
    save();
    mission = null;
    return { coins: s.coins, streak: s.streak, accuracy: acc, unlocked, stageUp };
  }

  /* ---------- progression ---------- */

  function tryUnlock() {
    if (s.letters.length >= LETTER_ORDER.length) return null;
    if (openSolidFraction() < 0.8) return null;
    const id = LETTER_ORDER.find(x => s.letters.indexOf(x) < 0);
    if (!id) return null;
    s.letters.push(id);
    s.newest = id;
    save();
    return L[id];
  }

  function tryOpenStage() {
    if (s.stage !== 1) return null;
    const solid = s.letters.filter(id => letterSolid(id) >= 0.75).length;
    if (solid < 10) return null;
    s.stage = 2;
    save();
    return 2;
  }

  /* ---------- the room ---------- */

  function slotFull(slot) {
    const used = s.owned.filter(id => (ROOM.find(r => r.id === id) || {}).slot === slot).length;
    return used >= (ROOM_SLOTS[slot] || 0);
  }

  function buyable() {
    return ROOM.filter(r => s.owned.indexOf(r.id) < 0 && !slotFull(r.slot));
  }

  function rollShop() {
    const pool = buyable();
    const scored = pool.map(r => {
      let w = 1;
      if (r.cost <= s.coins) w += 3;               // something she can afford today
      else if (r.cost <= s.coins + 2) w += 1.5;    // something to save up for
      return { r, w: w * (0.5 + Math.random()) };
    }).sort((a, b) => b.w - a.w);
    s.shop = scored.slice(0, 3).map(x => x.r.id);
    save();
    return s.shop;
  }

  function buy(id) {
    const item = ROOM.find(r => r.id === id);
    if (!item) return { ok: false, why: 'missing' };
    if (s.owned.indexOf(id) >= 0) return { ok: false, why: 'owned' };
    if (slotFull(item.slot)) return { ok: false, why: 'full' };
    if (s.coins < item.cost) return { ok: false, why: 'coins' };
    s.owned.push(id);
    recomputeCoins();
    s.shop = s.shop.filter(x => x !== id);
    while (s.shop.length < 3) {
      const extra = buyable().filter(r => s.shop.indexOf(r.id) < 0);
      if (!extra.length) break;
      s.shop.push(extra[Math.floor(Math.random() * extra.length)].id);
    }
    save();
    return { ok: true, item: item };
  }

  function roomLayout() {
    const out = {};
    Object.keys(ROOM_SLOTS).forEach(k => out[k] = []);
    s.owned.forEach(id => {
      const item = ROOM.find(r => r.id === id);
      if (item && out[item.slot]) out[item.slot].push(item);
    });
    return out;
  }

  /* ---------- merging another device ----------
     Never "last write wins" — that would throw away whatever she did on the
     other device. Every field has a rule that cannot lose work:
       per-item progress : whichever device has practised that item more often
       letters / owned    : union
       stage / mission    : the further along
       earned             : the higher lifetime total (it only ever grows)
       streak             : whichever device has the later day
       settings           : whichever device was touched more recently */
  function mergeState(r) {
    if (!r || typeof r !== 'object') return false;

    const keys = new Set(Object.keys(s.seen || {}).concat(Object.keys(r.seen || {})));
    keys.forEach(k => {
      const mine = (s.seen || {})[k] || 0;
      const theirs = (r.seen || {})[k] || 0;
      if (theirs <= mine) return;
      // take that item's whole record together, so the four fields stay coherent
      s.seen[k] = theirs;
      if (r.mastery && r.mastery[k] !== undefined) s.mastery[k] = r.mastery[k];
      if (r.box && r.box[k] !== undefined) s.box[k] = r.box[k];
      if (r.due && r.due[k] !== undefined) s.due[k] = r.due[k];
    });

    const union = (a, b) => Array.from(new Set((a || []).concat(b || [])));
    s.letters = union(s.letters, r.letters).filter(id => L[id]);
    s.owned = union(s.owned, r.owned).filter(id => ROOM.some(x => x.id === id));
    s.stage = Math.max(s.stage || 1, r.stage || 1);
    s.mission = Math.max(s.mission || 0, r.mission || 0);
    s.earned = Math.max(s.earned || 0, r.earned || 0);
    if (!s.newest && r.newest) s.newest = r.newest;

    if (r.lastDay && (!s.lastDay || r.lastDay > s.lastDay)) {
      s.lastDay = r.lastDay; s.streak = r.streak || 0;
    } else if (r.lastDay && r.lastDay === s.lastDay) {
      s.streak = Math.max(s.streak || 0, r.streak || 0);
    }

    // preferences are the parent's, so the most recently changed one wins
    if ((r.updatedAt || 0) > (s.updatedAt || 0)) {
      if (r.mic !== undefined) s.mic = r.mic;
      if (r.goal !== undefined) s.goal = r.goal;
    }

    recomputeCoins();
    // an offer she has since bought elsewhere must not stay on the shelf
    s.shop = (s.shop || []).filter(id => s.owned.indexOf(id) < 0);
    if (s.shop.length < 3) rollShop();
    save();
    return true;
  }

  /* ---------- parent panel ---------- */

  function report() {
    return s.letters.map(id => ({
      id, up: L[id].up, low: L[id].low, name: L[id].name,
      score: letterScore(id),
      solid: letterSolid(id),
      skills: LETTER_SKILLS.map(sk => ({
        skill: sk, score: m(lKey(id, sk)), box: box(lKey(id, sk)),
        seen: s.seen[lKey(id, sk)] || 0
      })),
      seen: LETTER_SKILLS.reduce((a, sk) => a + (s.seen[lKey(id, sk)] || 0), 0)
    })).sort((a, b) => a.score - b.score);
  }

  function setLetter(id, on) {
    if (!L[id]) return;
    const i = s.letters.indexOf(id);
    if (on && i < 0) s.letters.push(id);
    if (!on && i >= 0 && s.letters.length > 1) s.letters.splice(i, 1);
    save();
  }

  function set(k, v) {
    if (k === 'stage') s.stage = Math.max(1, Math.min(2, v | 0));
    if (k === 'mic') s.mic = !!v;
    if (k === 'goal') s.goal = Math.max(1, Math.min(6, v | 0));
    save();
  }

  load();

  return {
    get state() { return s; },
    LETTER_SKILLS, QUESTIONS_PER_ACTIVITY,
    load, save, reset,
    startMission, next, answer, finishMission,
    setAudio(on) { audioOk = !!on; },
    get audioOk() { return audioOk; },
    makeQuestion, availableActivities,
    record, letterScore, letterSolid, openSolidFraction,
    tryUnlock, tryOpenStage,
    roomLayout, rollShop, buy, buyable,
    report, setLetter, set,
    mergeState,
    setOnSave(fn) { onSave = fn; },
    get inMission() { return mission !== null; },
    huntPool, huntTargets, soundOptions, nameOptions
  };
})();

window.__engine = Engine;
