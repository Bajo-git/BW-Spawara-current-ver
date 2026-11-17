// Routes through intermediate items: the user's armoury paste (fixtures/zbrojownia-kaliguli.txt) with
// tygrysia zbroja warstwowa siewcy śmierci locked has no direct route to elfia kolczuga kaliguli; the
// search must say so in the progress bar, try the stepping-stone variants, and show a complete route
// built from the user's own items, with a switch back to the direct one.
// usage: node tests/stones.js index.html [outdir]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 1440, height: 1100 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await pg.goto('file://' + path.resolve(process.argv[2])); await pg.evaluate(() => localStorage.clear()); await pg.reload();
  await pg.fill('#pasteBox', fs.readFileSync(path.join(__dirname, 'fixtures', 'zbrojownia-kaliguli.txt'), 'utf8')); await pg.click('#pasteGo'); await pg.click('#pasteReplace');
  const base = await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('bw-forge-v2')); for (const e of s['Klata'].inv) if (e.p === 'tygrysi' && e.b === 'zbroja warstwowa' && e.s === 'siewcy smierci') e.lock = e.n; return JSON.stringify(s); });
  for (const mode of ['optimal', 'fast', 'cheap']) {
    await pg.evaluate(([base, mode]) => { const s = JSON.parse(base); Object.assign(s, { cat: 1, view: 'find', mode, deep: false, noOver: true }); s['Klata'].target = { p: 'elfi', b: 'kolczuga', s: 'kaliguli', l: '*' }; localStorage.setItem('bw-forge-v2', JSON.stringify(s)); }, [base, mode]);
    await pg.reload();
    const seen = new Set(); const t0 = Date.now(); await pg.click('#findBtn');
    while (Date.now() - t0 < 180000) { const t = await pg.evaluate(() => { const s = document.querySelector('#result .searching'); return s ? s.innerText.replace(/\s+/g, ' ').replace(/\d+,\d s.*$/, '') : null; }); if (t === null && Date.now() - t0 > 500) break; if (t) seen.add(t); await pg.waitForTimeout(150); }
    const res = (await pg.innerText('#result')).replace(/\s+/g, ' ');
    console.log(`\n== ${mode} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
    [...seen].filter(x => /pośrednie/.test(x)).forEach(x => console.log('  bar: ' + x.slice(0, 160)));
    console.log('  result: ' + res.slice(0, 330));
    if (await pg.$('#viaSwap')) { await pg.click('#viaSwap'); console.log('  after switch: ' + (await pg.innerText('#result')).replace(/\s+/g, ' ').slice(0, 160)); await pg.click('#viaSwap'); }
    const leaves = await pg.$$eval('#result .tcard.leaf', cs => cs.map(c => c.className));
    console.log(`  tree: ${leaves.length} leaves, ${leaves.filter(c => /missing|wild/.test(c)).length} missing · save button: ${!!(await pg.$('#lockPlan'))}`);
    if (process.argv[3] && mode === 'fast') await pg.screenshot({ path: process.argv[3] + '/stones.png' });
  }
  console.log('\nerrors', errs); await b.close();
})();
