// Compares how many missing items two builds need, on random inventories large enough for the
// forward-backward engine. Runs the engine directly (no page). usage: node tests/depthbench.js A.html B.html [cases] [mode]
const fs = require('fs');
const load = file => {
  const h = fs.readFileSync(file, 'utf8'), js = h.slice(h.indexOf('<script>') + 8, h.lastIndexOf('</script>'));
  const DATA = eval(js.slice(js.indexOf('const DATA = ') + 13, js.indexOf(';\n// ---- engine')));
  const makeEngine = new Function('performance', js.slice(js.indexOf('function makeEngine'), js.indexOf('\n(() => {')) + '\nreturn makeEngine;')(performance);
  return { DATA, E: makeEngine(DATA, { noOver: true, depth: 5 }) };
};
const [A, B] = process.argv.slice(2, 4).map(load), N = +(process.argv[4] || 40), mode = process.argv[5] || 'fast';
const C = A.E.compile(0), P = C.P, S = C.S, Bs = C.B;
let seed = 12345; const rnd = k => { seed = (seed * 16807) % 2147483647; return seed % k; };
const tally = { better: 0, worse: 0, same: 0 }; const rows = [];
for (let i = 0; i < N; i++) {
  const inv = []; for (let j = 0; j < 20; j++) inv.push({ p: P[rnd(14)], b: Bs[rnd(Bs.length)], s: rnd(6) ? S[rnd(12)] : '', l: true });
  const tg = { p: P[8 + rnd(10)], b: Bs[rnd(Bs.length)], s: S[6 + rnd(9)], l: '*' };
  const res = [A, B].map(({ E }) => { const C = E.compile(0), t0 = Date.now(); const F = E.findRoutes(C, E.targetSets(C, tg), inv, mode, false, null); const r = F.routes[0]; return { m: r ? r.missing : 9, st: r ? r.steps : 0, ms: Date.now() - t0, eng: F.R.engine }; });
  const d = res[1].m - res[0].m; tally[d < 0 ? 'better' : d > 0 ? 'worse' : 'same']++;
  if (d) rows.push(`${tg.p} ${tg.b} ${tg.s}: missing ${res[0].m} -> ${res[1].m} (steps ${res[0].st} -> ${res[1].st})`);
  process.stderr.write('.');
}
console.log('\n' + rows.join('\n')); console.log(JSON.stringify(tally));
