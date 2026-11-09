// Najszybsza vs the true shortest route. Random 14-item inventories (+ a few auction items), random
// targets: the reference is the exact search over every group (deep, nothing excluded), which
// proves the fewest items for a complete route. Prints how often each build is longer.
// NOOVER=1 (env): run the builds with "Nie zużywaj lepszych niż cel" on.
// SIZE=24 (env): bigger inventories; the reference is then the shorter of the builds, not a proof.
// usage: node tests/fastbench.js A.html [B.html] [cases]
const fs = require('fs');
const load = file => {
  const h = fs.readFileSync(file, 'utf8'), js = h.slice(h.indexOf('<script>') + 8, h.lastIndexOf('</script>'));
  const DATA = eval(js.slice(js.indexOf('const DATA = ') + 13, js.indexOf(';\n// ---- engine')));
  const mk = new Function('performance', js.slice(js.indexOf('function makeEngine'), js.indexOf('\n(() => {')) + '\nreturn makeEngine;')(performance);
  return { name: file, run: (inv, tg, store, deep) => { const E = mk(DATA, store), C = E.compile(0), t0 = Date.now(); const F = E.findRoutes(C, E.targetSets(C, tg), inv, 'fast', deep, null); const r = F.routes[0]; return r ? { m: r.missing, st: r.steps, a: r.auction, ms: Date.now() - t0, alt: F.alt && F.alt.routes[0] ? F.alt.routes[0].steps : null } : null; } };
};
const SIZE = +(process.env.SIZE || 14);
const files = process.argv.slice(2).filter(a => /\.html$/.test(a)), N = +(process.argv.find(a => /^\d+$/.test(a)) || 60);
const builds = files.map(load), C0 = (() => { const h = fs.readFileSync(files[0], 'utf8'), js = h.slice(h.indexOf('<script>') + 8, h.lastIndexOf('</script>')); const D = eval(js.slice(js.indexOf('const DATA = ') + 13, js.indexOf(';\n// ---- engine'))); return new Function('performance', js.slice(js.indexOf('function makeEngine'), js.indexOf('\n(() => {')) + '\nreturn makeEngine;')(performance)(D, {}).compile(0); })();
let seed = 777; const rnd = k => { seed = (seed * 16807) % 2147483647; return seed % k; };
const tally = builds.map(() => ({ shortest: 0, longer: 0, none: 0, extra: 0, ms: 0 })); let cases = 0;
for (let i = 0; cases < N && i < N * 20; i++) {
  const inv = []; for (let j = 0; j < SIZE; j++) inv.push({ p: C0.P[rnd(12)], b: C0.B[rnd(C0.B.length)], s: C0.S[rnd(12)], l: true });
  for (let j = 0; j < 3; j++) inv.push({ p: C0.P[rnd(14)], b: C0.B[rnd(C0.B.length)], s: C0.S[rnd(13)], l: true, src: 'auction', price: 5 + rnd(50), pk: 'manual' });
  const tg = { p: C0.P[6 + rnd(9)], b: C0.B[rnd(C0.B.length)], s: C0.S[6 + rnd(8)], l: '*' };
  const ref = SIZE <= 16 ? builds[0].run(inv, tg, { noOver: false }, true) : builds.map(B => B.run(inv, tg, { noOver: false }, false)).filter(r => r && !r.m).sort((a, b) => a.st - b.st)[0];
  if (!ref || ref.m) continue; // only targets with a complete route
  cases++;
  builds.forEach((B, k) => { const r = B.run(inv, tg, { noOver: !!process.env.NOOVER }, false); const t = tally[k]; if (!r || r.m) t.none++; else if (r.st > ref.st) { t.longer++; t.extra += r.st - ref.st; } else t.shortest++; t.ms += r ? r.ms : 0; });
  process.stderr.write('.');
}
console.log(`\n${cases} targets with a complete route (${SIZE <= 16 ? "shortest proven by exact search" : "reference: the shorter of the builds"})`);
builds.forEach((B, k) => { const t = tally[k]; console.log(`${B.name}: shortest ${t.shortest}, longer ${t.longer} (+${t.extra} połączeń in total), none/missing ${t.none}, avg ${(t.ms / cases).toFixed(0)} ms`); });
