// Experiment (not in the app): exhaustive top-down search for a manual plan.
// From the target down, every node may be: one of your items (each copy used once), a missing item,
// or a pair of ingredients whose prefix AND suffix tiers are strictly lower than the node's own
// (bases are free; "no affix" may only come from "no affix"; a node with neither affix is not split).
// Depth-first branch and bound over the whole tree: fewest missing items wins, then fewest steps.
// usage: node exhaust.js ../../index.html [secondsPerTarget]
const fs = require('fs'), path = require('path');
const file = process.argv[2], CAP = +(process.argv[3] || 600) * 1000;
const h = fs.readFileSync(file, 'utf8'), js = h.slice(h.indexOf('<script>') + 8, h.lastIndexOf('</script>'));
const DATA = eval(js.slice(js.indexOf('const DATA = ') + 13, js.indexOf(';\n// ---- engine')));
const makeEngine = new Function('performance', js.slice(js.indexOf('function makeEngine'), js.indexOf('\n(() => {')) + '\nreturn makeEngine;')(performance);
const top = m => 31 - Math.clz32(m);
const fix = require('path').join(__dirname, '../../tests/fixtures');

function exhaustive(C, tg, inv, capMs) {
  const NB = C.NB, NP = C.NP, NS = C.NS, L = tg.l ? 2 : 1;
  const tab = (P, n) => { const r = []; for (let i = 0; i < n; i++) r.push([]); for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) { const m = C.fns[P](1 << a, 1 << b); if (m) r[top(m)].push([a, b]); } return r; };
  const pb = tab('b', NB).map(l => l.filter(([a, b]) => a <= b)), pp = tab('p', NP), ps = tab('s', NS);
  const lower = (list, t) => list.filter(([a, b]) => t === 0 ? a === 0 && b === 0 : a < t && b < t);
  const K = (b, p, s) => (b * 32 + p) * 32 + s;
  const avail = new Map(); let owned = 0;
  for (const it of inv) { if (!!it.l !== !!tg.l) continue; const x = C.psOf(it); const k = K(top(x.b), top(x.p), top(x.s)); avail.set(k, (avail.get(k) || 0) + 1); owned++; }
  // splits of a node, and a lower bound on its missing items with copies ignored (0 or 1)
  const splitCache = new Map(), lbCache = new Map();
  const splits = (b, p, s) => { const k = K(b, p, s); let r = splitCache.get(k); if (r) return r; r = [];
    if (p || s) { const P2 = lower(pp[p], p), S2 = lower(ps[s], s);
      for (const [b1, b2] of pb[b]) for (const [p1, p2] of P2) for (const [s1, s2] of S2) r.push([[b1, p1, s1], [b2, p2, s2]]); }
    splitCache.set(k, r); return r; };
  const lb = (b, p, s) => { const k = K(b, p, s); let v = lbCache.get(k); if (v !== undefined) return v;
    v = avail.get(k) ? 0 : 1; lbCache.set(k, v);
    if (v) for (const [A, B] of splits(b, p, s)) if (lb(...A) + lb(...B) === 0) { v = 0; break; }
    lbCache.set(k, v); return v; };
  // order splits: those your items can fully cover first, then lower tiers
  const ordered = new Map();
  const order = (b, p, s) => { const k = K(b, p, s); let r = ordered.get(k); if (r) return r;
    r = splits(b, p, s).slice().sort((x, y) => (lb(...x[0]) + lb(...x[1])) - (lb(...y[0]) + lb(...y[1])) || (x[0][1] + x[0][2] + x[1][1] + x[1][2]) - (y[0][1] + y[0][2] + y[1][1] + y[1][2]));
    ordered.set(k, r); return r; };
  let best = { miss: Infinity, mt: Infinity, steps: Infinity, plan: null, at: 0 }, nodes = 0, firstAt = null, done = true;
  const t0 = Date.now(), plan = [];
  const dfs = (open, miss, steps, mt = 0) => {
    if ((++nodes & 0xfff) === 0 && Date.now() - t0 > capMs) { done = false; throw 'cap'; }
    if (!open.length) {
      if (miss < best.miss || (miss === best.miss && (mt < best.mt || (mt === best.mt && steps < best.steps)))) { best = { miss, mt, steps, plan: plan.slice(), at: Date.now() - t0 }; if (firstAt === null) firstAt = best.at; }
      return;
    }
    let bound = miss; for (const o of open) bound += lb(...o);
    if (bound > best.miss || (bound === best.miss && (mt > best.mt || (mt === best.mt && steps >= best.steps)))) return;
    const [cur, ...rest] = open, k = K(...cur);
    if (avail.get(k) > 0) { avail.set(k, avail.get(k) - 1); plan.push(['own', cur]); dfs(rest, miss, steps, mt); plan.pop(); avail.set(k, avail.get(k) + 1); }
    for (const [A, B] of order(...cur)) { plan.push(['split', cur]); dfs([A, B, ...rest], miss, steps + 1, mt); plan.pop(); }
    plan.push(['miss', cur]); dfs(rest, miss + 1, steps, mt + cur[1] + cur[2]); plan.pop();
  };
  const tx = C.psOf({ p: tg.p, b: tg.b, s: tg.s, l: tg.l });
  try { for (const [A, B] of order(top(tx.b), top(tx.p), top(tx.s))) { plan.push(['split', [top(tx.b), top(tx.p), top(tx.s)]]); dfs([A, B], 0, 1); plan.pop(); } } catch (e) { if (e !== 'cap') throw e; }
  const name = ([b, p, s]) => [C.itemOf({ b: 1 << b, p: 1 << p, s: 1 << s, l: L }), b, p, s];
  const text = ([it, b, p, s]) => [it.p && it.p + '^' + p, it.b + '^' + (b + 1), it.s && it.s + '^' + s].filter(Boolean).join(' ');
  const used = best.plan ? best.plan.filter(x => x[0] === 'own').map(x => text(name(x[1]))) : [];
  const missing = best.plan ? best.plan.filter(x => x[0] === 'miss').map(x => text(name(x[1]))) : [];
  return { miss: best.miss, mt: best.mt, steps: best.steps, used, missing, ms: Date.now() - t0, bestAt: best.at, firstAt, nodes, done, owned };
}

console.error('start');
const E = makeEngine(DATA, { noOver: true, depth: 5 });
const helms = JSON.parse(fs.readFileSync(path.join(fix, 'inv20.json')));
const gacie = JSON.parse(fs.readFileSync(path.join(fix, 'gacie12.json')));
const katSrc = fs.readFileSync(require('path').join(__dirname, '../../tests/scenarios/katana-loop.js'), 'utf8');
const C6 = E.compile(6), kat = katSrc.match(/const raw = `([\s\S]*?)`/)[1].split('\n').map(l => { const w = l.trim().split(' '); for (let k = 1; k < w.length; k++) { const b = w.slice(1, k + 1).join(' '); if (C6.B.includes(b)) return { p: w[0], b, s: w.slice(k + 1).join(' '), l: true }; } return null; }).filter(Boolean);
const cases = [
  [0, helms, { p: 'krwawy', b: 'bandana', s: 'adrenaliny', l: true }],
  [0, helms, { p: 'tygrysi', b: 'opaska', s: 'prekognicji', l: true }],
  [0, helms, { p: 'runiczny', b: 'korona', s: 'magii', l: true }],
  [0, helms, { p: 'szturmowy', b: 'kapelusz', s: 'krwi', l: true }],
  [2, gacie, { p: 'tygrysie', b: 'kilt', s: 'unikow', l: true }],
  [6, kat, { p: 'demoniczny', b: 'katana', s: 'drakuli', l: true }],
  [6, kat, { p: 'zabojczy', b: 'korbacz', s: 'krwi', l: true }],
];
for (const [ci, inv, tg] of cases.slice(+(process.argv[4] || 0))) {
  const C = E.compile(ci), T = E.targetSets(C, { p: tg.p, b: tg.b, s: tg.s, l: '1' });
  const units0 = inv.map(x => ({ p: x.p, b: x.b, s: x.s, l: x.l }));
  const now = (mode, deep) => { const t = Date.now(), r = E.findRoutes(C, T, units, mode, deep, null).routes[0]; return r ? `${r.missing} brak./${r.steps} kr. (${Date.now() - t} ms)` : `brak ścieżki (${Date.now() - t} ms)`; };
  const units = units0;
  const appNow = `teraz: optymalna ${now('optimal', false)}, głęboka ${now('optimal', true)}, najtańsza ${now('cheap', false)}`;
  console.error('teraz gotowe:', tg.p, tg.b, appNow);
  const x = exhaustive(C, tg, units, CAP);
  console.log(`\n${tg.p} ${tg.b} ${tg.s} (${inv.length} przedm.)\n  ${appNow}\n  wyczerpujące: ${x.miss} brak. (suma poziomów brakujących ${x.mt})/${x.steps} kr. · najlepsze po ${x.bestAt} ms, pierwsze po ${x.firstAt} ms · ${x.done ? 'sprawdzone w całości' : 'PRZERWANE na limicie'} po ${x.ms} ms, ${x.nodes} węzłów\n  zużywa: ${x.used.join(' | ')}\n  brakuje: ${x.missing.join(' | ')}`);
}
