/* app.js — everything that touches the DOM. Poke at it via window.__app. */

(function () {
  const $ = id => document.getElementById(id);
  const el = (tag, cls, txt) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt !== undefined) n.textContent = txt;
    return n;
  };

  let q = null;          // the question on screen
  let plan = null;       // { activities, total }
  let answered = 0;
  let busy = false;      // ignore taps while feedback plays

  const TITLES = {
    letterSound: 'איזו אות עושה את הצליל הזה?',
    letterName:  'איזו אות שמעת?',
    letterCase:  'מצאי את האות הקטנה',
    letterTrace: 'ציירי את האות',
    soundHunt:   'מה מתחיל בצליל הזה?',
    hearPic:     'מה שמעת?',
    picWord:     'איך כותבים את זה?'
  };

  /* ---------- screens ---------- */

  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $('screen-' + id).classList.add('active');
  }

  function sparkle(x, y, n) {
    const box = $('sparkles');
    for (let i = 0; i < (n || 10); i++) {
      const s = el('i', 'spark', ['✨', '⭐', '🌟', '💫'][i % 4]);
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
      s.style.setProperty('--dy', (-Math.random() * 140 - 40) + 'px');
      s.style.animationDelay = (i * 25) + 'ms';
      box.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }
  }

  function sparkleAt(node, n) {
    const r = node.getBoundingClientRect();
    sparkle(r.left + r.width / 2, r.top + r.height / 2, n);
  }

  /* ---------- home ---------- */

  function renderHome() {
    const s = Engine.state;
    $('stat-coins').textContent = '🪙 ' + s.coins;
    $('stat-streak').textContent = '🔥 ' + s.streak;
    $('hello-text').textContent = 'שלום ' + CHILD.name + '!';
    $('cta-sub').textContent = s.goal + ' משחקים';
    renderDoll();
  }

  /* The figure is painted back-to-front from what she is wearing: hair behind
     the head, then anything worn behind the body (a backpack), the body, the
     face, and finally every garment in `z` order. */
  function dollSVG() {
    const o = Engine.outfit();
    const parts = [o.back];
    o.behind.forEach(w => parts.push(w.svg));
    parts.push(FIGURE.body, FIGURE.face);
    o.front.forEach(w => parts.push(w.svg));
    return '<svg viewBox="0 0 200 400" class="doll-svg" aria-hidden="true">' +
           parts.join('') + '</svg>';
  }

  function renderDoll() {
    const svg = dollSVG();
    const home = $('doll');
    if (home) home.innerHTML = svg;
    const wardrobe = $('wardrobe-doll');
    if (wardrobe) wardrobe.innerHTML = svg;
  }

  /* ---------- mission ---------- */

  function startMission() {
    Voice.unlock();
    plan = Engine.startMission();
    answered = 0;
    show('play');
    nextQuestion();
  }

  function renderProgress() {
    const box = $('progress');
    box.innerHTML = '';
    for (let i = 0; i < plan.total; i++) {
      box.appendChild(el('i', 'dot' + (i < answered ? ' done' : '')));
    }
  }

  function nextQuestion() {
    q = Engine.next();
    if (!q) return micBonus();
    renderProgress();
    $('play-title').textContent = TITLES[q.type] || '';
    $('play-foot').innerHTML = '';
    const body = $('play-body');
    body.innerHTML = '';
    busy = false;

    if (q.type === 'letterTrace') renderTrace(body, q);
    else renderChoice(body, q);
  }

  /* Everything below binds to the question it was rendered for, never to the
     module-level `q` — a timer that fires after she has moved on (or tapped
     back) must do nothing rather than speak the wrong thing. */
  const live = cq => q === cq;

  /* Advance when the speech actually finishes, with a hard backstop in case a
     speech engine never fires `onend`. Whichever comes first wins, once. */
  function once(fn, maxWait) {
    let fired = false;
    const go = function () { if (fired) return; fired = true; fn(); };
    setTimeout(go, maxWait);
    return go;
  }

  function earButton(onPlay, cq, label) {
    const b = el('button', 'ear', label || '👂');
    b.onclick = () => { if (live(cq)) { Voice.sfx.pop(); onPlay(); } };
    setTimeout(() => { if (live(cq)) onPlay(); }, 350);  // play once on arrival
    return b;
  }

  /* One renderer covers every multiple-choice activity; only the prompt and
     the way an option is drawn change. */
  function renderChoice(body, cq) {
    const prompt = el('div', 'prompt');

    if (cq.type === 'letterSound') {
      prompt.appendChild(earButton(() => Voice.sound(cq.letter, false), cq));
      prompt.appendChild(el('div', 'prompt-hint', 'שמעי שוב'));
    } else if (cq.type === 'letterName') {
      prompt.appendChild(earButton(() => Voice.name(cq.letter), cq));
      prompt.appendChild(el('div', 'prompt-hint', 'שמעי שוב'));
    } else if (cq.type === 'letterCase') {
      prompt.appendChild(el('div', 'prompt-letter', cq.letter.up));
      prompt.appendChild(el('div', 'prompt-hint', cq.letter.name));
    } else if (cq.type === 'soundHunt') {
      prompt.appendChild(earButton(() => Voice.sound(cq.letter, false), cq));
      prompt.appendChild(el('div', 'prompt-letter small', cq.letter.up + cq.letter.low));
    } else if (cq.type === 'hearPic') {
      prompt.appendChild(earButton(() => Voice.speak(cq.word.en), cq));
      prompt.appendChild(el('div', 'prompt-hint', 'שמעי שוב'));
    } else if (cq.type === 'picWord') {
      prompt.appendChild(el('div', 'prompt-emoji', cq.word.emoji));
    }
    body.appendChild(prompt);

    const grid = el('div', 'options options-' + cq.options.length);
    cq.options.forEach((opt, i) => {
      const b = el('button', 'option');
      if (cq.type === 'soundHunt' || cq.type === 'hearPic') {
        b.classList.add('opt-pic');
        b.appendChild(el('span', 'opt-emoji', opt.emoji));
      } else if (cq.type === 'picWord') {
        b.classList.add('opt-word');
        b.appendChild(el('span', 'opt-en', opt.en));
      } else if (cq.type === 'letterCase') {
        b.classList.add('opt-letter');
        b.appendChild(el('span', 'glyph', opt.low));
      } else {
        b.classList.add('opt-letter');
        b.appendChild(el('span', 'glyph', opt.up));
        b.appendChild(el('span', 'glyph small', opt.low));
      }
      b.onclick = () => choose(i, b, cq);
      grid.appendChild(b);
    });
    body.appendChild(grid);

    // a translation is available, but only if she asks for it
    if (cq.type === 'hearPic' || cq.type === 'picWord') {
      const hint = el('button', 'hint-btn', '💭 מה זה?');
      hint.onclick = () => { hint.textContent = '💭 ' + cq.word.he; hint.disabled = true; };
      $('play-foot').appendChild(hint);
    }
  }

  function choose(i, btn, cq) {
    if (busy || !live(cq)) return;
    busy = true;
    const ok = i === cq.correct;
    const grid = btn.parentNode;
    grid.querySelectorAll('.option').forEach((b, j) => {
      b.disabled = true;
      if (j === cq.correct) b.classList.add('right');
    });
    if (!ok) btn.classList.add('wrong');

    Engine.answer(cq, ok);
    answered++;
    renderProgress();

    /* Wait for the word to finish before moving on. Advancing on a fixed timer
       cut "buh… ball" off halfway, and the next question's audio then talked
       over what was left. */
    if (ok) {
      Voice.sfx.good();
      sparkleAt(btn, 8);
      const go = once(() => { if (live(cq)) nextQuestion(); }, 4000);
      sayAnswer(cq, () => setTimeout(go, 550));
    } else {
      Voice.sfx.oops();
      // show the right answer and say it in full, so the miss still teaches
      const go = once(() => { if (live(cq)) nextQuestion(); }, 5000);
      setTimeout(() => {
        if (live(cq)) sayAnswer(cq, () => setTimeout(go, 900)); else go();
      }, 350);
    }
  }

  function sayAnswer(cq, onend) {
    if (cq.type === 'letterSound' || cq.type === 'soundHunt') Voice.sound(cq.letter, true, onend);
    else if (cq.type === 'letterName' || cq.type === 'letterCase') Voice.name(cq.letter, onend);
    else if (cq.word) Voice.speak(cq.word.en, { onend: onend });
    else if (onend) onend();
  }

  /* ---------- trace ----------
     The guide glyph is drawn onto the canvas, and the SAME glyph is rendered
     offscreen to make the mask — so the target she sees and the target she is
     scored against can never drift apart. No per-letter path data needed. */

  const TRACE = { size: 300, tol: 26, pen: 22, pass: { precision: 0.62, recall: 0.5 } };

  function traceFont(px) { return 'bold ' + px + 'px Rubik, Arial, sans-serif'; }

  function renderTrace(body, cq) {
    const ch = cq.which === 'up' ? cq.letter.up : cq.letter.low;
    const wrap = el('div', 'trace-wrap');

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cv = el('canvas', 'trace');
    cv.width = TRACE.size * dpr;
    cv.height = TRACE.size * dpr;
    cv.style.width = TRACE.size + 'px';
    cv.style.height = TRACE.size + 'px';
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);

    const strokes = [];
    let cur = null;
    let checkTimer = null;

    function drawGuide() {
      ctx.clearRect(0, 0, TRACE.size, TRACE.size);
      ctx.save();
      ctx.font = traceFont(TRACE.size * 0.78);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(20,60,80,.13)';
      ctx.fillText(ch, TRACE.size / 2, TRACE.size / 2);
      ctx.restore();
    }

    function drawStrokes() {
      ctx.save();
      ctx.strokeStyle = '#ff7ab8';
      ctx.lineWidth = TRACE.pen;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      strokes.forEach(st => {
        if (st.length < 2) {
          if (st.length === 1) {
            ctx.beginPath();
            ctx.arc(st[0].x, st[0].y, TRACE.pen / 2, 0, 7);
            ctx.fillStyle = '#ff7ab8'; ctx.fill();
          }
          return;
        }
        ctx.beginPath();
        ctx.moveTo(st[0].x, st[0].y);
        for (let i = 1; i < st.length; i++) ctx.lineTo(st[i].x, st[i].y);
        ctx.stroke();
      });
      ctx.restore();
    }

    function repaint() { drawGuide(); drawStrokes(); }

    function pos(ev) {
      const r = cv.getBoundingClientRect();
      return {
        x: (ev.clientX - r.left) * (TRACE.size / r.width),
        y: (ev.clientY - r.top) * (TRACE.size / r.height)
      };
    }

    cv.addEventListener('pointerdown', ev => {
      if (busy) return;
      ev.preventDefault();
      cv.setPointerCapture(ev.pointerId);
      clearTimeout(checkTimer);
      cur = [pos(ev)];
      strokes.push(cur);
      repaint();
    });
    cv.addEventListener('pointermove', ev => {
      if (!cur) return;
      ev.preventDefault();
      cur.push(pos(ev));
      repaint();
    });
    function lift() {
      if (!cur) return;
      cur = null;
      // multi-stroke letters (i, t, x, E) need a beat before we judge
      clearTimeout(checkTimer);
      checkTimer = setTimeout(() => check(false), 950);
    }
    cv.addEventListener('pointerup', lift);
    cv.addEventListener('pointercancel', lift);

    function check(forced) {
      if (busy || !live(cq)) return;
      const r = scoreTrace(ch, strokes);
      const ok = r.precision >= TRACE.pass.precision && r.recall >= TRACE.pass.recall;
      if (!ok && !forced) return;    // let her keep going
      finishTrace(ok, r);
    }

    function finishTrace(ok, r) {
      busy = true;
      cv.style.pointerEvents = 'none';
      Engine.answer(cq, ok);
      answered++;
      renderProgress();
      if (ok) {
        Voice.sfx.good();
        sparkleAt(cv, 12);
        const go = once(() => { if (live(cq)) nextQuestion(); }, 4000);
        Voice.name(cq.letter, () => setTimeout(go, 550));
      } else {
        Voice.sfx.oops();
        // show what it should look like, then move on — no second chance needed,
        // the letter comes straight back in the review queue
        ctx.save();
        ctx.font = traceFont(TRACE.size * 0.78);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(42,157,143,.55)';
        ctx.fillText(ch, TRACE.size / 2, TRACE.size / 2);
        ctx.restore();
        const go = once(() => { if (live(cq)) nextQuestion(); }, 5000);
        Voice.name(cq.letter, () => setTimeout(go, 900));
      }
      window.__lastTrace = r;
    }

    wrap.appendChild(cv);
    body.appendChild(wrap);
    repaint();

    const bar = $('play-foot');
    const clear = el('button', 'hint-btn', '↺ מחיקה');
    clear.onclick = () => { strokes.length = 0; clearTimeout(checkTimer); repaint(); };
    const done = el('button', 'hint-btn primary-ghost', '✓ סיימתי');
    done.onclick = () => { clearTimeout(checkTimer); check(true); };
    bar.appendChild(clear);
    bar.appendChild(done);

    // exposed so the scorer can be exercised without a real finger
    window.__trace = { strokes, check, repaint, ch };
  }

  /* precision = how much of what she drew sits on the letter.
     recall    = how much of the letter she actually covered.
     Both are needed: precision alone passes a single dot, recall alone passes
     a scribble that fills the whole box. */
  function scoreTrace(ch, strokes) {
    const N = TRACE.size;
    const mask = document.createElement('canvas'); mask.width = N; mask.height = N;
    const mc = mask.getContext('2d');
    mc.font = traceFont(N * 0.78);
    mc.textAlign = 'center'; mc.textBaseline = 'middle';
    mc.fillStyle = '#000';
    mc.fillText(ch, N / 2, N / 2);
    const ink = mc.getImageData(0, 0, N, N).data;

    // the same glyph fattened by the tolerance, for "is her line near it?"
    const fatC = document.createElement('canvas'); fatC.width = N; fatC.height = N;
    const fc = fatC.getContext('2d');
    fc.font = traceFont(N * 0.78);
    fc.textAlign = 'center'; fc.textBaseline = 'middle';
    fc.fillStyle = '#000'; fc.strokeStyle = '#000';
    fc.lineWidth = TRACE.tol * 2;
    fc.lineJoin = 'round';
    fc.strokeText(ch, N / 2, N / 2);
    fc.fillText(ch, N / 2, N / 2);
    const fat = fc.getImageData(0, 0, N, N).data;

    // her strokes, rasterised thick, for "did she cover the letter?"
    const drawnC = document.createElement('canvas'); drawnC.width = N; drawnC.height = N;
    const dc = drawnC.getContext('2d');
    dc.strokeStyle = '#000'; dc.fillStyle = '#000';
    dc.lineWidth = TRACE.pen + 14;
    dc.lineCap = 'round'; dc.lineJoin = 'round';
    strokes.forEach(st => {
      if (!st.length) return;
      if (st.length === 1) { dc.beginPath(); dc.arc(st[0].x, st[0].y, TRACE.pen, 0, 7); dc.fill(); return; }
      dc.beginPath();
      dc.moveTo(st[0].x, st[0].y);
      for (let i = 1; i < st.length; i++) dc.lineTo(st[i].x, st[i].y);
      dc.stroke();
    });
    const drawn = dc.getImageData(0, 0, N, N).data;

    let inside = 0, points = 0;
    strokes.forEach(st => st.forEach(p => {
      const x = Math.round(p.x), y = Math.round(p.y);
      if (x < 0 || y < 0 || x >= N || y >= N) { points++; return; }
      points++;
      if (fat[(y * N + x) * 4 + 3] > 10) inside++;
    }));

    let covered = 0, inkTotal = 0;
    for (let i = 0; i < N * N; i++) {
      if (ink[i * 4 + 3] > 40) {
        inkTotal++;
        if (drawn[i * 4 + 3] > 10) covered++;
      }
    }

    return {
      precision: points ? inside / points : 0,
      recall: inkTotal ? covered / inkTotal : 0,
      points: points
    };
  }

  /* ---------- microphone bonus ---------- */

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  function micBonus() {
    const s = Engine.state;
    const pool = WORDS.filter(w => w.emoji);
    const word = pool[Math.floor(Math.random() * pool.length)];
    if (!s.mic || !SR || !pool.length) return finish(0);

    $('play-title').textContent = 'בונוס: תגידי את המילה!';
    $('play-foot').innerHTML = '';
    const body = $('play-body');
    body.innerHTML = '';

    const card = el('div', 'mic-card');
    card.appendChild(el('div', 'prompt-emoji', word.emoji));
    card.appendChild(el('div', 'mic-word', word.en));
    const status = el('div', 'mic-status', 'לחצי על המיקרופון ותגידי');
    card.appendChild(status);

    const mic = el('button', 'mic-btn', '🎤');
    card.appendChild(mic);
    body.appendChild(card);

    const skip = el('button', 'hint-btn', 'דלגי ➜');
    skip.onclick = () => finish(0);
    $('play-foot').appendChild(skip);

    setTimeout(() => Voice.speak(word.en), 300);

    mic.onclick = () => {
      let rec;
      try { rec = new SR(); } catch (e) { return finish(0); }
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 5;
      mic.classList.add('listening');
      status.textContent = 'מקשיבה…';

      rec.onresult = ev => {
        const heard = [];
        for (let i = 0; i < ev.results[0].length; i++) {
          heard.push(ev.results[0][i].transcript.toLowerCase().trim());
        }
        const ok = heard.some(h => closeEnough(h, word.en.toLowerCase()));
        mic.classList.remove('listening');
        if (ok) {
          status.textContent = '🎉 מעולה! ' + heard[0];
          Voice.sfx.win();
          sparkleAt(card, 16);
          setTimeout(() => finish(1), 1400);
        } else {
          // never a failure — she tried, the coin is hers either way
          status.textContent = 'שמעתי "' + heard[0] + '" — ננסה שוב בפעם הבאה 🙂';
          Voice.sfx.pop();
          setTimeout(() => finish(0), 1600);
        }
      };
      rec.onerror = () => {
        mic.classList.remove('listening');
        status.textContent = 'לא הצלחתי לשמוע 🤷';
        setTimeout(() => finish(0), 1200);
      };
      rec.onend = () => mic.classList.remove('listening');
      try { rec.start(); } catch (e) { finish(0); }
    };
  }

  /* A child's accent through a browser recogniser is rough — one letter off,
     or the word buried in a phrase, still counts. */
  function closeEnough(heard, want) {
    if (heard === want) return true;
    if (heard.split(/\s+/).indexOf(want) >= 0) return true;
    if (heard.indexOf(want) >= 0) return true;
    return lev(heard, want) <= (want.length <= 4 ? 1 : 2);
  }

  function lev(a, b) {
    const m = a.length, n = b.length;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1,
                          prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  }

  /* ---------- finishing ---------- */

  function finish(bonus) {
    const r = Engine.finishMission(bonus || 0);
    renderHome();
    Voice.sfx.coin();

    $('celebrate-icon').textContent = r.gained >= 2 ? '🏆' : r.gained ? '🎉' : '💪';
    $('celebrate-text').textContent = r.gained
      ? 'סיימת! קיבלת ' + r.gained + ' 🪙'
      : 'סיימת! הפעם בלי מטבע — נסי לדייק יותר';

    const note = $('celebrate-note');
    const bits = ['דייקת ב־' + Math.round(r.accuracy * 100) + '%'];
    if (r.streak > 1) bits.push('🔥 ' + r.streak + ' ימים ברצף!');
    if (r.unlocked) bits.push('אות חדשה נפתחה: ' + r.unlocked.up + r.unlocked.low + ' (' + r.unlocked.name + ')');
    if (r.stageUp) bits.push('🎊 נפתח שלב חדש: מילים ראשונות!');
    note.innerHTML = bits.join('<br>');
    note.classList.remove('hidden');

    $('celebrate').classList.remove('hidden');
    if (r.unlocked || r.stageUp) Voice.sfx.win();
  }

  /* ---------- shop ---------- */

  let openSlot = 'hair';

  function renderShop() {
    const s = Engine.state;
    $('shop-coins').textContent = '🪙 ' + s.coins;
    renderDoll();

    const tabs = $('wardrobe-tabs');
    tabs.innerHTML = '';
    WARDROBE_SLOTS.forEach(slot => {
      const b = el('button', 'tab' + (slot.id === openSlot ? ' on' : ''));
      b.appendChild(el('span', 'tab-icon', slot.icon));
      b.appendChild(el('span', 'tab-label', slot.he));
      b.onclick = () => { openSlot = slot.id; Voice.sfx.pop(); renderShop(); };
      tabs.appendChild(b);
    });

    const body = $('shop-body');
    body.innerHTML = '';
    Engine.catalog(openSlot).forEach(entry => {
      const w = entry.item;
      const card = el('button', 'wear-card');
      if (entry.worn) card.classList.add('worn');
      if (!entry.owned) card.classList.add('locked');
      if (!entry.owned && !entry.affordable) card.classList.add('poor');

      card.appendChild(el('span', 'wear-icon', w.icon));
      card.appendChild(el('span', 'wear-name', w.he));
      card.appendChild(el('span', 'wear-tag',
        entry.worn ? '✓ לובשת' : entry.owned ? 'ללבוש' : '🪙 ' + w.cost));

      card.onclick = () => {
        if (entry.owned) {
          Engine.equip(w.id);
          Voice.sfx.pop();
        } else {
          const res = Engine.buy(w.id);
          if (!res.ok) {
            Voice.sfx.oops();
            card.classList.add('shake');
            setTimeout(() => card.classList.remove('shake'), 500);
            return;
          }
          Voice.sfx.coin();
          sparkleAt(card, 14);
        }
        renderShop();
        renderHome();
      };
      body.appendChild(card);
    });
  }

  /* ---------- parent panel ---------- */

  function openParent() {
    const s = Engine.state;
    $('parent-voice').textContent = Voice.hasVoice()
      ? '🔊 קול: ' + Voice.voiceName()
      : '🔇 אין קול אנגלי מותקן במכשיר';

    const syncText = {
      synced: '☁️ מסונכרן בין המכשירים',
      connecting: '☁️ מתחבר…',
      local: '📴 ללא חיבור — נשמר במכשיר הזה בלבד',
      off: '📴 סנכרון כבוי — נשמר במכשיר הזה בלבד'
    };
    $('parent-sync').textContent =
      typeof Sync !== 'undefined' ? (syncText[Sync.status] || Sync.status) : syncText.off;

    const stage = $('parent-stage'); stage.innerHTML = '';
    [1, 2].forEach(n => {
      const b = el('button', 'chip' + (s.stage === n ? ' on' : ''),
                   n === 1 ? '1 · אותיות' : '2 · מילים');
      b.onclick = () => { Engine.set('stage', n); openParent(); };
      stage.appendChild(b);
    });

    const goal = $('parent-goal'); goal.innerHTML = '';
    [2, 3, 4, 5].forEach(n => {
      const b = el('button', 'chip' + (s.goal === n ? ' on' : ''), n + ' משחקים');
      b.onclick = () => { Engine.set('goal', n); openParent(); renderHome(); };
      goal.appendChild(b);
    });

    const mic = $('parent-mic'); mic.innerHTML = '';
    [true, false].forEach(v => {
      const b = el('button', 'chip' + (s.mic === v ? ' on' : ''), v ? 'פעיל' : 'כבוי');
      b.onclick = () => { Engine.set('mic', v); openParent(); };
      mic.appendChild(b);
    });
    if (!SR) mic.appendChild(el('span', 'note', 'הדפדפן הזה לא תומך בזיהוי דיבור'));

    const letters = $('parent-letters'); letters.innerHTML = '';
    LETTER_ORDER.forEach(id => {
      const on = s.letters.indexOf(id) >= 0;
      const b = el('button', 'toggle' + (on ? ' on' : ''), LETTERS.find(l => l.id === id).up);
      b.onclick = () => { Engine.setLetter(id, !on); openParent(); };
      letters.appendChild(b);
    });

    const rep = Engine.report();
    const list = $('parent-mastery'); list.innerHTML = '';
    rep.forEach(r => {
      const row = el('div', 'mrow');
      row.appendChild(el('span', 'mglyph', r.up + r.low));
      const bar = el('span', 'mbar');
      const fill = el('i');
      fill.style.width = Math.round(r.score * 100) + '%';
      if (r.score < 0.35) fill.classList.add('low');
      else if (r.score < 0.7) fill.classList.add('mid');
      bar.appendChild(fill);
      row.appendChild(bar);
      row.appendChild(el('span', 'mnum', Math.round(r.score * 100) + '%'));
      row.appendChild(el('span', 'mseen', r.seen + '×'));
      list.appendChild(row);
    });

    $('parent').classList.remove('hidden');
  }

  /* ---------- wiring ---------- */

  function init() {
    Engine.load();
    renderHome();

    $('btn-start').onclick = startMission;
    $('btn-shop').onclick = () => { Voice.unlock(); renderShop(); show('shop'); };

    document.querySelectorAll('[data-back]').forEach(b => {
      b.onclick = () => { Voice.stop(); q = null; show('home'); renderHome(); };
    });

    $('celebrate-ok').onclick = () => {
      $('celebrate').classList.add('hidden');
      show('home');
      renderHome();
    };

    // long-press so she cannot wander into it by accident
    let gateTimer = null;
    const gate = $('parent-gate');
    const startGate = () => { gateTimer = setTimeout(openParent, 800); };
    const endGate = () => clearTimeout(gateTimer);
    gate.addEventListener('pointerdown', startGate);
    gate.addEventListener('pointerup', endGate);
    gate.addEventListener('pointerleave', endGate);

    $('parent-close').onclick = () => $('parent').classList.add('hidden');
    $('parent-reset').onclick = () => {
      if (!confirm('לאפס את כל ההתקדמות של ' + CHILD.name + '?')) return;
      Engine.reset();
      $('parent').classList.add('hidden');
      renderHome();
    };

    document.addEventListener('pointerdown', () => Voice.unlock(), { once: true });

    /* Progress from her other devices arrives asynchronously — redraw when it
       lands, unless she is already mid-mission. */
    if (typeof Sync !== 'undefined') {
      Sync.init(function () { if (!Engine.inMission) renderHome(); });
    }

    // the voice list can arrive late; check again before nagging
    let tries = 0;
    (function checkVoice() {
      const has = Voice.hasVoice();
      if (has || tries++ > 6) {
        $('no-voice').classList.toggle('hidden', has);
        // without an English voice the listening games are unanswerable, so
        // the engine drops them instead of asking silent questions
        Engine.setAudio(has);
        return;
      }
      setTimeout(checkVoice, 400);
    })();
  }

  window.__app = {
    show, startMission, nextQuestion, renderHome, renderShop, openParent,
    scoreTrace, closeEnough, finish,
    get q() { return q; },
    get plan() { return plan; },
    choose: i => {
      const b = document.querySelectorAll('.option')[i];
      if (b) b.click();
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
