// The app's engine on the exact strict-lower starting rings for tier k (from ringstrict.json). usage: node ringapp2.js index.html k mode [deep]
const fs = require('fs'); const [, , file, k, mode, deep] = process.argv;
const h = fs.readFileSync(file, 'utf8'), js = h.slice(h.indexOf('<script>') + 8, h.lastIndexOf('</script>'));
const DATA = eval(js.slice(js.indexOf('const DATA = ') + 13, js.indexOf(';\n// ---- engine')));
const E = new Function('performance', js.slice(js.indexOf('function makeEngine'), js.indexOf('\n(() => {')) + '\nreturn makeEngine;')(performance)(DATA, { noOver: true, depth: 8 });
const C = E.compile(3), T = E.targetSets(C, { p: 'czarny', b: 'pierscien', s: 'latwosci', l: '0' });
const row = require('./ringstrict.json').find(r => r.k === +k), units = [];
for (const [nm, n] of row.leaves) { const w = nm.replace(/\^\d+/g, '').split(' '); for (let i = 0; i < n; i++) units.push({ p: w[0], b: w[1], s: w.slice(2).join(' '), l: false }); }
const t = Date.now(), F = E.findRoutes(C, T, units, mode, deep === 'deep', null), r = F.routes && F.routes[0];
console.log(`poziom ${k} (${units.length} pierśc.) · ${mode}${deep === 'deep' ? ' głęboka' : ''} · ${Date.now() - t} ms · ` + (r ? `${r.missing} brak., ${r.steps} kr.` : 'brak ścieżki'));
