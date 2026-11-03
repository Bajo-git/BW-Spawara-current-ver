const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1440, height: 950 } });
  await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await pg.goto('file://' + require('path').resolve(process.argv[2]));
  const inv20 = JSON.parse(fs.readFileSync(require('path').join(__dirname, 'fixtures', 'inv20.json'), 'utf8')).map(x => ({ p: x.p, b: x.b, s: x.s, l: x.l, n: 1, lock: 0 }));
  const D = { v32: 1, cat: 0, noOver: true, mode: 'optimal', view: 'manual', 'Głowa': { inv: inv20, example: false, target: { p: 'krwawy', b: 'bandana', s: 'adrenaliny', l: '*' }, plans: [], auction: [] } };
  await pg.evaluate(D => localStorage.setItem('bw-forge-v2', JSON.stringify(D)), D); await pg.reload();
  await pg.$eval('#manBtn', e => e.click()); await pg.waitForSelector('#manEdit');
  const count = () => pg.$$eval('#manEdit .mopts button', bs => [bs.length, bs.filter(b => !b.hidden).length, bs.filter(b => !b.hidden).map(b => b.innerText.replace(/\s+/g, ' ')).slice(0, 3)]);
  console.log('all:', JSON.stringify(await count()));
  for (const q of ['bojowy opaska', 'BOJOWY', 'opaska ochrony', 'xyz']) { await pg.fill('#manFilter', q); console.log(JSON.stringify(q), JSON.stringify(await count())); }
  await b.close();
})();
