/* sync.js — keeps progress the same on every device she uses.

   Shape of the deal: localStorage is always the source of truth locally and
   the app is fully usable with no network. Firebase is a courier. On start
   (and whenever she comes back to the app) the remote copy is merged in via
   Engine.mergeState — never assigned over the top — and the merged result is
   written back. Every write is debounced, so a mission of 15 answers costs
   one round trip, not fifteen.

   If Firebase is unreachable, blocked, or simply not configured, every
   function here quietly does nothing. */

const Sync = (function () {
  /* This database is shared with Le-Francais-au-Quotidien, whose security
     rules open the `progress` subtree and nothing else — so this app lives at
     a sibling key beside its `progress/user1`. Separate keys, no collision,
     and no rules change was needed. */
  const SYNC_PATH = 'progress/abigailEnglish';
  const PUSH_DELAY = 1500;

  let ref = null;
  let ready = false;      // a first successful read happened; safe to write
  let timer = null;
  let onChange = null;
  let status = 'off';     // off | connecting | synced | local

  function configured() {
    return typeof FIREBASE_CONFIG !== 'undefined'
        && FIREBASE_CONFIG.apiKey
        && FIREBASE_CONFIG.apiKey.indexOf('YOUR_') !== 0
        && typeof firebase !== 'undefined';
  }

  function init(cb) {
    onChange = cb;
    if (!configured()) { status = 'off'; return false; }
    try {
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      ref = firebase.database().ref(SYNC_PATH);
    } catch (e) { status = 'local'; return false; }

    status = 'connecting';
    Engine.setOnSave(push);
    pull();

    /* Coming back to the app is exactly when another device may have moved
       on. Mid-mission is left alone so nothing shifts under her feet. */
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && !Engine.inMission) pull();
    });
    return true;
  }

  function pull() {
    if (!ref) return Promise.resolve(false);
    return ref.once('value').then(function (snap) {
      const remote = snap.val();
      const merged = remote ? Engine.mergeState(remote) : false;
      ready = true;
      status = 'synced';
      push(true);                 // publish the merged result (or seed an empty node)
      if (onChange) onChange(merged);
      return merged;
    }).catch(function () {
      status = 'local';           // offline or blocked — carry on locally
      if (onChange) onChange(false);
      return false;
    });
  }

  function push(now) {
    if (!ref || !ready) return;
    clearTimeout(timer);
    const write = function () {
      try {
        // Firebase rejects undefined; a JSON round trip also drops functions
        ref.set(JSON.parse(JSON.stringify(Engine.state)))
           .then(function () { status = 'synced'; })
           .catch(function () { status = 'local'; });
      } catch (e) { status = 'local'; }
    };
    if (now === true) write(); else timer = setTimeout(write, PUSH_DELAY);
  }

  return {
    init: init, pull: pull, push: push, configured: configured,
    get status() { return status; },
    get path() { return SYNC_PATH; }
  };
})();

window.__sync = Sync;
