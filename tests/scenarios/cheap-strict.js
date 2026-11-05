// usage: node tests/scenarios/cheap-strict.js index.html  (expect the last line to say 0)
// Najtańsza as it is and with the manual-plan 3-level search: missing / your items / leaves / steps, plus a strict-lower check on every combine.
const fs = require('fs'), file = process.argv[2];
const h = fs.readFileSync(file, 'utf8'), js = h.slice(h.indexOf('<script>') + 8, h.lastIndexOf('</script>'));
const DATA = eval(js.slice(js.indexOf('const DATA = ') + 13, js.indexOf(';\n// ---- engine')));
const mk = new Function('performance', js.slice(js.indexOf('function makeEngine'), js.indexOf('\n(() => {')) + '\nreturn makeEngine;')(performance);
const path = require('path'), fix = path.join(__dirname, '..', 'fixtures') + '/';
const helms = JSON.parse(fs.readFileSync(fix + 'inv20.json')), gacie = JSON.parse(fs.readFileSync(fix + 'gacie12.json'));
const C6 = mk(DATA, {}).compile(6), katSrc = fs.readFileSync(path.join(__dirname, 'katana-loop.js'), 'utf8');
const kat = katSrc.match(/const raw = `([\s\S]*?)`/)[1].split('\n').map(l => { const w = l.trim().split(' '); for (let k = 1; k < w.length; k++) { const b = w.slice(1, k + 1).join(' '); if (C6.B.includes(b)) return { p: w[0], b, s: w.slice(k + 1).join(' '), l: true }; } return null; }).filter(Boolean);
const cases = [[0, helms, 'krwawy bandana adrenaliny'], [0, helms, 'tygrysi opaska prekognicji'], [0, helms, 'runiczny korona magii'], [0, helms, 'szturmowy kapelusz krwi'], [2, gacie, 'tygrysie kilt unikow'], [6, kat, 'demoniczny katana drakuli'], [6, kat, 'zabojczy korbacz krwi']];
const top = m => 31 - Math.clz32(m);
let badAll = 0;
for (const [ci, inv, t] of cases) { const [p, b, ...s] = t.split(' ');
  for (const force of [0, 3]) { const E = mk(DATA, { depth: 5, noOver: true }), C = E.compile(ci), T = E.targetSets(C, { p, b, s: s.join(' '), l: '1' });
    const t0 = Date.now(), F = E.findRoutes(C, T, inv.map(x => ({ p: x.p, b: x.b, s: x.s, l: x.l })), 'cheap', false, force ? { force } : null), r = F.routes[0];
    let bad = 0, depth = 0; const mine = [], miss = [];
    const nm = it => [it.p, it.b, it.s].filter(Boolean).join(' ');
    (function go(n, d) { depth = Math.max(depth, d); if (n.kids) { const x = C.psOf(n.it); for (const k of n.kids) { const y = C.psOf(k.it); const ok = (top(x.p) === 0 ? top(y.p) === 0 : top(y.p) < top(x.p)) && (top(x.s) === 0 ? top(y.s) === 0 : top(y.s) < top(x.s)); if (!ok) bad++; go(k, d + 1); } } else (n.wild ? miss : mine).push(nm(n.it)); })(r ? r.tree : {}, 0);
    badAll += bad;
    console.log(`${t.padEnd(27)} ${force ? '3 poziomy' : 'teraz    '}: ` + (r ? `${r.missing} brak., ${r.L - r.missing} twoich, ${r.steps} kr., głęb. ${depth}` : 'brak') + ` · ${Date.now() - t0} ms` + (bad ? ` · ${bad} NIE NIŻSZYCH` : '') + (force && r ? `\n      twoje: ${mine.join(' | ')}\n      brakuje: ${miss.join(' | ')}` : ''));
  } }
console.log('składniki nie niższe niż wynik:', badAll);
