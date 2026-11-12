// usage: node tests/optfast.js index.html [cases] [seed] [out.json]  (expect "NOT full and not offered in 0")
// Fuzz: where Najszybsza finds a complete route but Optymalna does not. For each such case, rerun
// Optymalna with one thing changed to see what blocks it.
const fs = require('fs'), file = process.argv[2], N = +(process.argv[3] || 400);
const h = fs.readFileSync(file, 'utf8'), js = h.slice(h.indexOf('<script>') + 8, h.lastIndexOf('</script>'));
const DATA = eval(js.slice(js.indexOf('const DATA = ') + 13, js.indexOf(';\n// ---- engine')));
const mk = new Function('performance', js.slice(js.indexOf('function makeEngine'), js.indexOf('\n(() => {')) + '\nreturn makeEngine;')(performance);
let seed = +(process.argv[4] || 12345); const rnd = k => { seed = (seed * 16807) % 2147483647; return seed % k; };
const summ = r => r ? `${r.missing} brak./${r.steps} kr./${r.auction} auk./${r.over} lepsz.` : 'BRAK';
const found = []; let tried = 0, bothFull = 0;
for (let i = 0; i < N; i++) {
  const ci = [0, 1, 2, 3, 6][rnd(5)], E0 = mk(DATA, {}), C0 = E0.compile(ci);
  const size = 8 + rnd(18), maxT = 6 + rnd(16), inv = [];
  for (let j = 0; j < size; j++) inv.push({ p: C0.P[rnd(Math.min(maxT, C0.P.length))], b: C0.B[rnd(C0.B.length)], s: C0.S[rnd(Math.min(maxT, C0.S.length))], l: rnd(4) > 0 });
  for (let j = 0, na = rnd(4); j < na; j++) inv.push({ p: C0.P[rnd(Math.min(maxT + 3, C0.P.length))], b: C0.B[rnd(C0.B.length)], s: C0.S[rnd(Math.min(maxT + 3, C0.S.length))], l: true, src: 'auction', price: 1 + rnd(60), pk: 'manual' });
  const tg = { p: C0.P[3 + rnd(Math.min(maxT + 2, C0.P.length - 3))], b: rnd(3) ? C0.B[rnd(C0.B.length)] : '*', s: rnd(4) ? C0.S[3 + rnd(Math.min(maxT + 2, C0.S.length - 3))] : '*', l: rnd(4) ? '1' : '*' };
  const run = (store, mode, deep) => { const E = mk(DATA, store), C = E.compile(ci), T = E.targetSets(C, tg); const F = E.findRoutes(C, T, inv, mode, deep, null); return { r: F.routes[0], alt: F.alt && F.alt.routes[0] }; };
  const fast = run({ noOver: true }, 'fast', false).r;
  if (!fast || fast.missing) continue;
  tried++;
  const opt = run({ noOver: true }, 'optimal', false);
  if (opt.r && !opt.r.missing) { bothFull++; continue; }
  if (opt.alt && !opt.alt.missing) { (global.offered = (global.offered || 0) + 1); continue; }
  const why = {
    noOverOff: summ(run({ noOver: false }, 'optimal', false).r),
    deep: summ(run({ noOver: true }, 'optimal', true).r),
    altOffered: opt.alt ? summ(opt.alt) : '-',
  };
  found.push({ ci, tg, inv, fast: summ(fast), opt: summ(opt.r), why });
}
console.log(`${tried} cases where Najszybsza has a full route; Optymalna also full in ${bothFull}; offered in the box in ${global.offered || 0}; NOT full and not offered in ${found.length}`);
const tally = {};
for (const f of found) {
  const k = f.why.noOverOff.startsWith('0 brak') ? 'fixed by turning "nie zużywaj lepszych" off' : f.why.deep.startsWith('0 brak') ? 'fixed by głębokie szukanie' : 'neither fixes it';
  (tally[k] = tally[k] || []).push(f);
}
for (const [k, l] of Object.entries(tally)) { console.log(`\n== ${k}: ${l.length}`); for (const f of l.slice(0, 4)) console.log(`  cat ${f.ci} target ${f.tg.p} ${f.tg.b} ${f.tg.s} L${f.tg.l} · ${f.inv.length} items · fast ${f.fast} · opt ${f.opt} · noOver off ${f.why.noOverOff} · deep ${f.why.deep} · alt ${f.why.altOffered}`); }
fs.writeFileSync(process.argv[5] || 'found.json', JSON.stringify(found));
