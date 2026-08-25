/* test-merge.js — the cross-device merge rules, run with `node test-merge.js`.

   These exist because the merge is the one part of the app that cannot be
   checked by playing it: every rule here is about a SECOND device, and a
   mistake shows up as progress or a preference quietly disappearing rather
   than as anything breaking. The settings rule in particular was wrong for
   months without a single visible symptom. */

const fs = require('fs');
const path = require('path');

const SRC = ['data.js', 'engine.js']
  .map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');

/* The whole suite runs inside one millisecond, so the engine's Date.now()
   would stamp every device identically and "which was changed later" would be
   untestable. Each device gets a controllable clock instead, and `tick()`
   makes the passage of time explicit at the points where it is the thing
   under test. */
let clock = 1756000000000;
const tick = ms => { clock += (ms || 1000); };

class FakeDate extends Date {
  constructor(...a) { if (a.length) super(...a); else super(clock); }
  static now() { return clock; }
}

/* A device is an isolated copy of the engine over its own localStorage. */
function device(seed) {
  const store = seed ? { abigailEnglish_state: JSON.stringify(seed) } : {};
  const win = {};
  new Function('window', 'localStorage', 'Date', SRC)(win, {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = v; }
  }, FakeDate);
  return win.__engine;
}

const copy = e => JSON.parse(JSON.stringify(e.state));

let failures = 0;
function check(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failures++;
  console.log((ok ? '  ok   ' : '  FAIL ') + name +
              (ok ? '' : '\n         got ' + JSON.stringify(got) +
                         ', wanted ' + JSON.stringify(want)));
}

/* ---------------------------------------------------------------- */
console.log('\npreferences follow the device where they were CHANGED');

{
  /* The bug: `updatedAt` moves on every recorded answer, so a device she had
     merely played on outranked the device where the parent actually changed
     the setting. One answer before the pull landed was enough. */
  const tablet = device(null);
  tablet.set('goal', 5);
  tablet.set('mic', false);
  const cloud = copy(tablet);

  tick();
  const phone = device(null);
  phone.record('l:a:sound', true);       // one answer — this is all it took
  check('the phone now looks newer by updatedAt',
        phone.state.updatedAt > cloud.updatedAt, true);

  phone.mergeState(cloud);
  check('goal still came down from the tablet', phone.state.goal, 5);
  check('mic still came down from the tablet', phone.state.mic, false);
}

{
  const a = device(null);
  a.set('goal', 5);
  const cloud = copy(a);

  const b = device(null);
  b.mergeState(cloud);                   // b adopts
  tick();
  b.set('goal', 2);                      // then b changes it for real
  const newer = copy(b);

  a.mergeState(newer);
  check('a genuinely newer change is adopted', a.state.goal, 2);

  a.mergeState(cloud);                   // the stale copy syncs in late
  check('a stale copy cannot undo it', a.state.goal, 2);
}

{
  const a = device(null);
  a.set('goal', 6);
  const cloud = copy(a);
  delete cloud.settingsAt;               // a record written before the field existed
  const b = device(null);
  b.mergeState(cloud);
  check('a legacy record falls back to updatedAt', b.state.goal, 6);
}

/* ---------------------------------------------------------------- */
console.log('\nthe outfit follows the same rule');

{
  const tablet = device(null);
  const buyable = tablet.catalog('hat').find(c => !c.owned);
  tablet.state.earned = 500;
  tablet.state.coins = 500;
  tablet.buy(buyable.item.id);
  const cloud = copy(tablet);

  tick();
  const phone = device(null);
  phone.record('l:a:sound', true);
  phone.mergeState(cloud);
  check('the hat she bought elsewhere is owned here',
        phone.state.owned.indexOf(buyable.item.id) >= 0, true);
  check('and she is still wearing it',
        phone.state.equipped.hat, buyable.item.id);
}

/* ---------------------------------------------------------------- */
console.log('\nnothing she has done can be lost');

{
  const a = device(null);
  ['l:a:sound', 'l:t:sound', 'l:p:name'].forEach(k => a.record(k, true));
  a.state.earned = 40;
  const cloud = copy(a);

  const b = device(null);
  b.mergeState(cloud);
  check('per-item progress carried',
        Object.keys(cloud.seen).every(k => b.state.seen[k] === cloud.seen[k] &&
                                           b.state.box[k] === cloud.box[k]), true);
  check('lifetime coins carried', b.state.earned, 40);

  b.record('l:m:sound', true);
  b.state.earned = 60;
  const before = b.state.earned;
  b.mergeState(cloud);                   // the older copy syncs in again
  check('an older copy cannot lower lifetime coins', b.state.earned, before);
  check('and cannot erase the newer item', b.state.seen['l:m:sound'] > 0, true);
}

{
  /* A coin reset has to beat max-wins, or an old device would simply undo it. */
  const a = device(null);
  a.state.earned = 100;
  const rich = copy(a);

  const b = device(null);
  b.mergeState(rich);
  b.resetCoins();
  const afterReset = copy(b);

  a.mergeState(afterReset);
  check('a reset propagates instead of bouncing back', a.state.earned, 0);
}

/* ---------------------------------------------------------------- */
console.log(failures ? '\n' + failures + ' FAILED\n' : '\nall passed\n');
process.exit(failures ? 1 : 0);
