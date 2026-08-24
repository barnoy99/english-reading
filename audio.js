/* audio.js — speaks English, and makes the little noises.

   To use your own recordings instead of the synthesiser: record e.g. "cat.mp3",
   drop it in audio/, and add its name to CLIPS. Keys are the spoken text
   lower-cased with spaces as underscores ("ice_cream", "double_you"). */

const CLIPS = new Set([
  // 'cat', 'buh', ...
]);

const Voice = (function () {
  let voice = null;
  let ready = false;
  let unlocked = false;
  let clip = null;

  /* The voice list is empty until the engine has loaded them, and on some
     browsers that happens after the first paint — hence voiceschanged. */
  function pickVoice() {
    const all = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    voice = all.find(v => /^en[-_]US/i.test(v.lang))
         || all.find(v => /^en[-_]GB/i.test(v.lang))
         || all.find(v => /^en/i.test(v.lang))
         || null;
    ready = true;
    return voice;
  }

  if (window.speechSynthesis) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }

  /* Mobile browsers refuse to make a sound until a real user gesture. */
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    if (window.speechSynthesis) {
      if (!voice) pickVoice();
      try {
        const u = new SpeechSynthesisUtterance(' ');
        u.volume = 0;
        speechSynthesis.speak(u);
      } catch (e) { /* nothing to do */ }
    }
    ctx();
  }

  function stop() {
    if (clip) { clip.onended = null; clip.pause(); clip = null; }
    if (window.speechSynthesis) speechSynthesis.cancel();
  }

  const clipKey = t => t.toLowerCase().replace(/\s+/g, '_');

  /* text: English to speak.  opts: { rate, pitch, onend } */
  function speak(text, opts) {
    opts = opts || {};
    stop();
    const key = clipKey(text);
    if (CLIPS.has(key)) {
      clip = new window.Audio('audio/' + key + '.mp3');
      clip.onended = () => { clip = null; if (opts.onend) opts.onend(); };
      clip.onerror = () => { clip = null; tts(text, opts); };
      clip.play().catch(() => { clip = null; tts(text, opts); });
      return;
    }
    tts(text, opts);
  }

  function tts(text, opts) {
    if (!window.speechSynthesis) { if (opts.onend) opts.onend(); return; }
    if (!voice) pickVoice();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = (voice && voice.lang) || 'en-US';
    if (voice) u.voice = voice;
    u.rate = opts.rate || 0.8;      // slow enough for a beginner to catch
    u.pitch = opts.pitch || 1.05;
    u.onend = () => { if (opts.onend) opts.onend(); };
    u.onerror = () => { if (opts.onend) opts.onend(); };
    speechSynthesis.speak(u);
  }

  /* A letter's sound, then the word it lives in: "buh ... ball". */
  function sound(letter, withKeyword) {
    if (!withKeyword) return speak(letter.say, { rate: 0.6 });
    speak(letter.say, { rate: 0.6, onend: () => {
      setTimeout(() => speak(letter.kw, { rate: 0.75 }), 180);
    }});
  }

  function name(letter) { speak(letter.nameSay, { rate: 0.7 }); }

  /* ---------- sound effects ---------- */

  let ac = null;
  function ctx() {
    if (!ac && (window.AudioContext || window.webkitAudioContext)) {
      ac = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ac && ac.state === 'suspended') ac.resume();
    return ac;
  }

  function tone(freq, start, dur, gain) {
    const a = ctx(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, a.currentTime + start);
    g.gain.linearRampToValueAtTime(gain || 0.18, a.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + start + dur);
    o.connect(g); g.connect(a.destination);
    o.start(a.currentTime + start);
    o.stop(a.currentTime + start + dur + 0.02);
  }

  const sfx = {
    good() { tone(660, 0, 0.12); tone(880, 0.09, 0.18); },
    oops() { tone(300, 0, 0.16, 0.12); tone(230, 0.12, 0.2, 0.12); },
    coin() { tone(880, 0, 0.08); tone(1170, 0.07, 0.09); tone(1560, 0.14, 0.22); },
    pop()  { tone(520, 0, 0.07, 0.1); },
    win()  { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.3)); }
  };

  return {
    unlock, speak, stop, sound, name, sfx,
    hasVoice: () => { if (!ready) pickVoice(); return !!voice; },
    voiceName: () => voice ? voice.name + ' (' + voice.lang + ')' : '(none)'
  };
})();
