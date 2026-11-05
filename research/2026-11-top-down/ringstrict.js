// Fewest starting rings that make czarny pierscien latwosci with no loops: at every step both ingredients'
// prefix AND suffix are strictly lower than the item made (no-affix only from no-affix). Starting rings may be
// any ring whose prefix and suffix are both at most tier k; one table per k, with the leaf list of the best tree.
const fs = require('fs');
const h = fs.readFileSync(process.argv[2], 'utf8'), js = h.slice(h.indexOf('<script>') + 8, h.lastIndexOf('</script>'));
const DATA = eval(js.slice(js.indexOf('const DATA = ') + 13, js.indexOf(';\n// ---- engine')));
const C = new Function('performance', js.slice(js.indexOf('function makeEngine'), js.indexOf('\n(() => {')) + '\nreturn makeEngine;')(performance)(DATA, {}).compile(3);
const top = m => 31 - Math.clz32(m);
const { NB, NP, NS } = C;
const tab = (P, n) => { const r = []; for (let i = 0; i < n; i++) r.push([]); for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) { const m = C.fns[P](1 << a, 1 << b); if (m) r[top(m)].push([a, b]); } return r; };
const pb = tab('b', NB), pp = tab('p', NP), ps = tab('s', NS);
const lower = (l, t) => l.filter(([a, b]) => t === 0 ? a === 0 && b === 0 : a < t && b < t);
const name = (b, p, s) => [p ? C.P[p - 1] + '^' + p : '', C.B[b], s ? C.S[s - 1] + '^' + s : ''].filter(Boolean).join(' ');
const tB = C.B.indexOf('pierscien'), tP = C.P.indexOf('czarny') + 1, tS = C.S.indexOf('latwosci') + 1;
const out = [];
for (let k = 1; k <= 27; k++) {
  // states in order of p+s ascending so ingredients are solved first (strictly lower on both => smaller sum)
  const memo = new Map();
  const solve = (b, p, s) => { const key = (b * 32 + p) * 32 + s; if (memo.has(key)) return memo.get(key);
    let best = (p <= k && s <= k) ? { n: 1, d: 0, leaves: [[b, p, s]] } : null;
    if (!best && (p || s)) for (const [b1, b2] of pb[b]) for (const [p1, p2] of lower(pp[p], p)) for (const [s1, s2] of lower(ps[s], s)) {
      const x = solve(b1, p1, s1); if (!x) continue; const y = solve(b2, p2, s2); if (!y) continue;
      const n = x.n + y.n, d = Math.max(x.d, y.d) + 1;
      if (!best || n < best.n || (n === best.n && d < best.d)) best = { n, d, x, y };
    }
    memo.set(key, best); return best; };
  const r = solve(tB, tP, tS);
  const leaves = new Map(); const walk = t => { if (t.leaves) { const nm = name(...t.leaves[0]); leaves.set(nm, (leaves.get(nm) || 0) + 1); } else { walk(t.x); walk(t.y); } };
  if (r) walk(r);
  out.push({ k, n: r ? r.n : null, d: r ? r.d : null, leaves: [...leaves].sort((a, b) => b[1] - a[1]) });
  console.log(`najwyższy poziom startowy ${String(k).padStart(2)}: ` + (r ? `${r.n} pierścieni, ${r.d} poziomów, ${leaves.size} rodzajów` : 'nieosiągalny'));
}
fs.writeFileSync(__dirname + '/ringstrict.json', JSON.stringify(out));
