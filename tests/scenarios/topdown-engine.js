const { chromium } = require('playwright'); const fs=require('fs');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage(); await pg.goto('file://' + require('path').resolve(process.argv[2])); await pg.waitForSelector('#findBtn');
  const inv = JSON.parse(fs.readFileSync(require('path').join(__dirname, '..', 'fixtures', 'inv20.json'))).map(x => ({ p: x.p, b: x.b, s: x.s, l: x.l }));
  const out = await pg.evaluate((inv) => {
    const D = window.__d, C = D.compile(0), rows = [];
    for (const tg of [['krwawy','bandana','adrenaliny'],['tygrysi','opaska','prekognicji'],['bojowy','korona','ochrony'],['runiczny','korona','magii']]) for (const depth of [3, 5, 8]) {
      D.store.depth = depth;
      const T = D.targetSets(C, { p: tg[0], b: tg[1], s: tg[2], l: '1' });
      const t0 = performance.now(), F = D.findRoutes(C, T, inv, 'cheap', false), r = F.routes[0];
      const lv = []; if (r) { const w = t => { if (t.kids) t.kids.forEach(w); else lv.push((t.wild ? 'MISS ' : t.auction ? 'AUC ' : '') + D.key(t.it).replace(/\|1$/, '')); }; w(r.tree); }
      rows.push(`${tg.join(' ')} d=${depth}: ${r ? `${r.missing} missing, ${r.steps} steps` : 'none'} (${Math.round(performance.now() - t0)} ms) higher=${F.higher ? F.higher.length : '-'}\n     ${lv.join(' | ')}`);
    }
    return rows;
  }, inv);
  out.forEach(r => console.log(r)); await b.close();
})();
