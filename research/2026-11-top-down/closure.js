const fs = require('fs');
const h = fs.readFileSync(process.argv[2], 'utf8'), js = h.slice(h.indexOf('<script>') + 8, h.lastIndexOf('</script>'));
const DATA = eval(js.slice(js.indexOf('const DATA = ') + 13, js.indexOf(';\n// ---- engine')));
const makeEngine = new Function('performance', js.slice(js.indexOf('function makeEngine'), js.indexOf('\n(() => {')) + '\nreturn makeEngine;')(performance);
const C = makeEngine(DATA, {}).compile(3), top = m => 31 - Math.clz32(m);
// pure set closure of (prefix, suffix) pairs on pierscien, from (1,2) and (2,1)
let S = new Set(['1,2', '2,1']), grow = true;
while (grow) { grow = false; const a = [...S].map(x => x.split(',').map(Number));
  for (const [p1, s1] of a) for (const [p2, s2] of a) { const rp = C.fns.p(1 << p1, 1 << p2), rs = C.fns.s(1 << s1, 1 << s2);
    if (rp && rs) { const k = top(rp) + ',' + top(rs); if (!S.has(k)) { S.add(k); grow = true; } } } }
const ps = new Set([...S].map(x => +x.split(',')[0])), ss = new Set([...S].map(x => +x.split(',')[1]));
console.log('par osiągalnych', S.size, '· prefiksy', [...ps].sort((a, b) => a - b).join(' '), '· sufiksy', [...ss].sort((a, b) => a - b).join(' '));
console.log('czarny^28 latwosci^20 osiągalny?', S.has('28,20'));
const P = C.P; const make = t => { const r = []; for (let a = 0; a < C.NP; a++) for (let b = a; b < C.NP; b++) if (top(C.fns.p(1 << a, 1 << b)) === t && C.fns.p(1 << a, 1 << b)) r.push(`${P[a - 1] || '—'}^${a}+${P[b - 1] || '—'}^${b}`); return r; };
for (const t of [28, 27, 26]) console.log(`${P[t - 1]}^${t} powstaje z:`, make(t).join(', '));
const withL = [...S].filter(x => x.endsWith(',20')).map(x => +x.split(',')[0]);
console.log('z sufiksem latwosci^20 osiągalne prefiksy:', withL.sort((a, b) => a - b).join(' '));
