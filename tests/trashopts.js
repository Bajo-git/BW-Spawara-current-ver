// Przeróbka złomu options: Tylko duże ulepszenia and Kierunek ulepszeń (prefiks / sufiks). Runs the
// helmets and the trousers through each setting and checks every step against its rule, using the
// tier numbers shown in the steps. usage: node tests/trashopts.js index.html
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 1440, height: 950 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await pg.goto('file://' + path.resolve(process.argv[2]));
  let bad = 0;
  for (const [cat, name, file] of [[0, 'Głowa', 'inv20.json'], [2, 'Gacie', 'gacie12.json']]) {
    const inv = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', file)));
    for (const [label, opt] of [['zwykła', {}], ['tylko duże', { trashBig: true }], ['w stronę prefiksu', { trashDir: 'p' }], ['w stronę sufiksu', { trashDir: 's' }]]) {
      await pg.evaluate(([cat, name, inv, opt]) => localStorage.setItem('bw-forge-v2', JSON.stringify({ v32: 1, cat, view: 'trash', trashMode: 'both', trashRar: 'both', ...opt, [name]: { inv, auction: [], example: false, plans: [] } })), [cat, name, inv, opt]);
      await pg.reload(); await pg.click('#trashBtn');
      // each step: [a tiers, b tiers, result tiers] as [prefix, base, suffix]
      const steps = await pg.$$eval('ol.steps > li', ls => ls.map(li => [...li.querySelectorAll('.item')].slice(0, 3).map(it => { const sup = [...it.querySelectorAll('sup.tier')].map(x => +x.textContent), has = c => !!it.querySelector('.' + c);
        let i = 0; return { p: has('p') ? sup[i++] : 0, b: sup[i++], s: has('s') ? sup[i++] : 0 }; })));
      let n = 0;
      for (const [a, c, r] of steps) {
        const mp = Math.max(a.p, c.p), ms = Math.max(a.s, c.s), upP = r.p > mp, upS = r.s > ms;
        const ok = opt.trashBig ? upP && upS : opt.trashDir === 'p' ? upP && r.s >= ms : opt.trashDir === 's' ? upS && r.p >= mp : (upP && r.s >= ms) || (upS && r.p >= mp);
        if (!ok) { n++; bad++; }
      }
      const sum = (await pg.$eval('#trashSet', e => e.innerText)).replace('Zmień', '').trim();
      console.log(`${name.padEnd(6)} ${label.padEnd(18)} ${String(steps.length).padStart(2)} połączeń · złamanych reguł ${n} · ${await pg.$eval('#trashNote', e => e.innerText)} · ${sum}`);
    }
  }
  console.log('steps breaking their rule:', bad, '· errors', errs); await b.close();
})();
