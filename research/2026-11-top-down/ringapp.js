// The app's engine on an inventory of only A × miedziany pierscien urody + B × srebrny pierscien wystepku, target czarny pierscien latwosci.
// usage: node ringapp.js index.html mode deep A B
const fs = require('fs');
const [, , file, mode, deep, nA, nB, tp = 'czarny', ts = 'latwosci'] = process.argv;
const h = fs.readFileSync(file, 'utf8'), js = h.slice(h.indexOf('<script>') + 8, h.lastIndexOf('</script>'));
const DATA = eval(js.slice(js.indexOf('const DATA = ') + 13, js.indexOf(';\n// ---- engine')));
const E = new Function('performance', js.slice(js.indexOf('function makeEngine'), js.indexOf('\n(() => {')) + '\nreturn makeEngine;')(performance)(DATA, { noOver: true, depth: 8 });
let last = Date.now(); E.onPhase = (...a) => { if (Date.now() - last > 5000) { last = Date.now(); console.error('faza', ...a.map(x => typeof x === 'object' ? JSON.stringify(x).slice(0, 80) : x)); } };
const C = E.compile(3), T = E.targetSets(C, { p: tp, b: 'pierscien', s: ts, l: '0' });
const units = [];
for (let i = 0; i < +nA; i++) units.push({ p: 'miedziany', b: 'pierscien', s: 'urody', l: false });
for (let i = 0; i < +nB; i++) units.push({ p: 'srebrny', b: 'pierscien', s: 'wystepku', l: false });
const t = Date.now();
const F = E.findRoutes(C, T, units, mode, deep === 'deep', null), r = F.routes && F.routes[0];
const used = r ? JSON.stringify(r).match(/"own"|"inv"|"have"/g) : null;
console.log(`${tp} ${ts} · ${mode}${deep === 'deep' ? ' głęboka' : ''} · ${nA}+${nB} przedm. · ${Date.now() - t} ms · ` + (r ? `${r.missing} brak., ${r.steps} kr.` : 'brak ścieżki') + (F.alt ? ' · jest alternatywa' : ''));
if (r) console.log('  klucze trasy:', Object.keys(r).join(','));
