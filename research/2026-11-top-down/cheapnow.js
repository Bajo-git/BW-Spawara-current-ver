// What Najtańsza returns today for the experiment's targets (depth 3, 5, 8): missing / leaves / steps.
const fs = require('fs'), file = process.argv[2];
const h = fs.readFileSync(file, 'utf8'), js = h.slice(h.indexOf('<script>') + 8, h.lastIndexOf('</script>'));
const DATA = eval(js.slice(js.indexOf('const DATA = ') + 13, js.indexOf(';\n// ---- engine')));
const mk = new Function('performance', js.slice(js.indexOf('function makeEngine'), js.indexOf('\n(() => {')) + '\nreturn makeEngine;')(performance);
const fix = require('path').join(__dirname, '../../tests/fixtures') + '/';
const helms = JSON.parse(fs.readFileSync(fix + 'inv20.json')), gacie = JSON.parse(fs.readFileSync(fix + 'gacie12.json'));
const E0 = mk(DATA, {}), C6 = E0.compile(6), katSrc = fs.readFileSync(require('path').join(__dirname, '../../tests/scenarios/katana-loop.js'), 'utf8');
const kat = katSrc.match(/const raw = `([\s\S]*?)`/)[1].split('\n').map(l => { const w = l.trim().split(' '); for (let k = 1; k < w.length; k++) { const b = w.slice(1, k + 1).join(' '); if (C6.B.includes(b)) return { p: w[0], b, s: w.slice(k + 1).join(' '), l: true }; } return null; }).filter(Boolean);
const cases = [[0, helms, 'krwawy bandana adrenaliny'], [0, helms, 'tygrysi opaska prekognicji'], [0, helms, 'runiczny korona magii'], [0, helms, 'szturmowy kapelusz krwi'], [2, gacie, 'tygrysie kilt unikow'], [6, kat, 'demoniczny katana drakuli'], [6, kat, 'zabojczy korbacz krwi']];
for (const [ci, inv, t] of cases) { const [p, b, ...s] = t.split(' '); const line = [];
  for (const depth of [3, 5, 8]) { const E = mk(DATA, { depth, noOver: true }), C = E.compile(ci), T = E.targetSets(C, { p, b, s: s.join(' '), l: '1' });
    const t0 = Date.now(), r = E.findRoutes(C, T, inv.map(x => ({ p: x.p, b: x.b, s: x.s, l: x.l })), 'cheap', false, null).routes[0];
    line.push(`g${depth}: ` + (r ? `${r.missing} brak./${r.L} przedm./${r.steps} kr.` : 'brak') + ` ${Date.now() - t0}ms`); }
  console.log(t.padEnd(28), line.join(' · ')); }
