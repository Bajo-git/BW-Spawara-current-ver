// Manual plan with Najtańsza: when nothing of yours fits at once, missing items are looked into 3 levels
// deep. Opens the manual plan for several helmet targets in the page (worker), prints the verdict and
// tree (? = missing, + = yours). The strict-lower check is in cheap-strict.js.
// usage: node tests/scenarios/manual-cheap-deep.js index.html
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 1440, height: 950 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await pg.goto('file://' + path.resolve(process.argv[2]));
  const inv = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'inv20.json')));
  for (const t of ['krwawy bandana adrenaliny', 'tygrysi opaska prekognicji', 'runiczny korona magii', 'szturmowy kapelusz krwi']) {
    const [p, bs, ...s] = t.split(' ');
    await pg.evaluate(([inv, tg]) => localStorage.setItem('bw-forge-v2', JSON.stringify({ v32: 1, cat: 0, mode: 'cheap', depth: 5, view: 'manual', 'Głowa': { inv, auction: [], example: false, target: tg, plans: [] } })), [inv, { p, b: bs, s: s.join(' '), l: '1' }]);
    await pg.reload(); await pg.click('#manBtn'); await pg.waitForSelector('#manEdit', { timeout: 60000 });
    const head = (await pg.innerText('#result')).split('\n')[0];
    const cards = await pg.$$eval('.tcard', cs => cs.map(c => ({ t: c.innerText.replace(/\s+/g, ' ').replace(/LEGENDARNY/g, '').trim(), cls: c.className, mid: c.dataset.mid })));
    console.log(`\n${t}: ${head.slice(0, 110)}\n  ${cards.length} elementów: ` + cards.map(c => (/missing/.test(c.cls) ? '?' : /leaf/.test(c.cls) ? '+' : '') + c.t.replace(/\d+/g, '').slice(0, 40)).join(' | ').slice(0, 600));
  }
  console.log('\nerrors', errs); await b.close();
})();
