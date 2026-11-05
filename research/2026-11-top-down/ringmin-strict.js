// Fewest leaves per state with no cap (BigInt), tracking the A/B split of that cheapest tree; also fewest steps tree.
const fs = require('fs');
const h = fs.readFileSync(process.argv[2], 'utf8'), js = h.slice(h.indexOf('<script>') + 8, h.lastIndexOf('</script>'));
const DATA = eval(js.slice(js.indexOf('const DATA = ') + 13, js.indexOf(';\n// ---- engine')));
const C = new Function('performance', js.slice(js.indexOf('function makeEngine'), js.indexOf('\n(() => {')) + '\nreturn makeEngine;')(performance)(DATA, {}).compile(3);
const top = m => 31 - Math.clz32(m), K = (p, s) => p * 32 + s;
const A = K(1, 2), B = K(2, 1), T = K(28, 20);
const best = new Map([[A, { a: 1n, b: 0n, d: 0 }], [B, { a: 0n, b: 1n, d: 0 }]]);
const t0 = Date.now(); let ch = true, it = 0;
while (ch) { ch = false; it++; const ks = [...best.keys()];
  for (const x of ks) for (const y of ks) { const rp = C.fns.p(1 << (x >> 5), 1 << (y >> 5)), rs = C.fns.s(1 << (x & 31), 1 << (y & 31)); if (!rp || !rs) continue;
    const r = K(top(rp), top(rs)); if (process.argv[3] && !((x >> 5) < (r >> 5) && (y >> 5) < (r >> 5) && (x & 31) < (r & 31) && (y & 31) < (r & 31))) continue; const u = best.get(x), v = best.get(y), c = { a: u.a + v.a, b: u.b + v.b, d: Math.max(u.d, v.d) + 1 };
    const o = best.get(r); if (!o || c.a + c.b < o.a + o.b || (c.a + c.b === o.a + o.b && c.d < o.d)) { best.set(r, c); ch = true; } } }
const t = best.get(T);
console.log(`${it} przebiegów, ${best.size} stanów, ${Date.now() - t0} ms`);
console.log(t ? `czarny pierscien latwosci: najmniej ${t.a + t.b} sztuk = ${t.a} × miedziany pierscien urody + ${t.b} × srebrny pierscien wystepku, głębokość drzewa ${t.d}` : 'nieosiągalny');
// ladder: cheapest count for each prefix tier with suffix latwosci
for (let p = 1; p <= 28; p++) { const v = best.get(K(p, 20)); if (v) console.log(`  ${C.P[p - 1]}^${p} pierscien latwosci: ${v.a + v.b} (${v.a} + ${v.b})`); }
fs.writeFileSync(__dirname + '/ringmin-strict.json', JSON.stringify(t ? { a: String(t.a), b: String(t.b), d: t.d } : null));
