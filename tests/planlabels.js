// "W planie N" labels: save two route plans, then every reserved item in the inventory must name the
// plan(s) that actually hold it, numbered as in Plany. usage: node tests/planlabels.js index.html
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 1440, height: 950 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await pg.goto('file://' + path.resolve(process.argv[2]));
  const inv = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'inv20.json')));
  await pg.evaluate(inv => localStorage.setItem('bw-forge-v2', JSON.stringify({ v32: 1, cat: 0, mode: 'optimal', view: 'find', 'Głowa': { inv, auction: [], example: false, plans: [] } })), inv);
  await pg.reload();
  const targets = [['szturmowy', 'kapelusz', 'krwi'], ['bojowy', 'korona', 'ochrony'], ['krwawy', 'bandana', 'adrenaliny']];
  for (const [p, bs, s] of targets) {
    await pg.evaluate(t => { const st = JSON.parse(localStorage.getItem('bw-forge-v2')); st['Głowa'].target = { p: t[0], b: t[1], s: t[2], l: '*' }; localStorage.setItem('bw-forge-v2', JSON.stringify(st)); }, [p, bs, s]);
    await pg.reload(); await pg.click('#findBtn'); await pg.waitForSelector('#lockPlan', { timeout: 60000 }); await pg.click('#lockPlan');
  }
  // what each plan uses (from storage) vs the labels in the inventory
  const out = await pg.evaluate(() => {
    const st = JSON.parse(localStorage.getItem('bw-forge-v2'))['Głowa'];
    const plans = st.plans.map((pl, i) => ({ n: i + 1, keys: pl.leaves.filter(l => l[2] !== 'a').map(l => l[0]) }));
    const rows = [...document.querySelectorAll('#invList li')].map(li => ({ name: li.querySelector('.inv-name').innerText.replace(/\s+/g, ' ').replace(/W plan.*$/, '').trim(), label: (li.querySelector('.pill.plan') || {}).textContent || '', tip: (li.querySelector('.pill.plan') || {}).title || '' }));
    return { plans: plans.map(p => `plan ${p.n}: ${p.keys.length} przedm.`), rows: rows.filter(r => r.label) };
  });
  console.log(out.plans.join(' · '));
  for (const r of out.rows) console.log(`  ${r.label.padEnd(16)} ${r.name.replace(/\d+/g, '')}   [${r.tip}]`);
  console.log('errors', errs); await b.close();
})();
