// Manual plan, "Dwa brakujące": the first pairs should be balanced and low, not one very low and one very high.
// usage: node tests/twomissing.js index.html
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await pg.goto('file://' + path.resolve(process.argv[2]));
  for (const [p, bb, s] of [['rytualny', 'korona', 'magii'], ['krwawy', 'bandana', 'adrenaliny'], ['tygrysi', 'opaska', 'prekognicji']]) {
    await pg.evaluate(D => localStorage.setItem('bw-forge-v2', JSON.stringify(D)), { v32: 1, cat: 0, view: 'manual', 'Głowa': { inv: [{ p: 'utwardzony', b: 'czapka', s: 'podroznika', l: false, n: 1 }], example: false, target: { p, b: bb, s, l: '0' }, plans: [] } });
    await pg.reload(); await pg.$eval('#manBtn', e => e.click()); await pg.waitForSelector('#manEdit');
    const opts = await pg.$$eval('.mgrp', gs => { const g = gs.find(x => /Dwa brakujące/i.test(x.innerText)); return g ? [...g.querySelectorAll('.mopt')].slice(0, 3).map(o => o.innerText.replace(/\s+/g, ' ')) : []; });
    console.log(`${p} ${bb} ${s}:\n  ` + opts.join('\n  '));
  }
  await b.close();
})();
