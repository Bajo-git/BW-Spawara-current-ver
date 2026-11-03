// Inventory search box and sort order. usage: node tests/invtools.js index.html
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await pg.goto('file://' + path.resolve(process.argv[2]));
  const inv = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'inv20.json'))).map(x => ({ ...x, n: 1, lock: 0 }));
  await pg.evaluate(D => localStorage.setItem('bw-forge-v2', JSON.stringify(D)), { v32: 1, cat: 0, 'Głowa': { inv, example: false, plans: [] } }); await pg.reload();
  const names = () => pg.$$eval('#invList li .item', l => l.map(x => x.innerText.replace(/\s+/g, ' ')));
  for (const s of ['sum', 'p', 's', 'b', 'name']) { await pg.selectOption('#invSort', s); console.log(s, (await names()).slice(0, 3).join(' | ')); }
  await pg.fill('#invSearch', 'krwawy'); console.log('"krwawy":', (await names()).join(' | '));
  await pg.fill('#invSearch', 'obrecz ochrony'); console.log('"obrecz ochrony":', (await names()).join(' | '));
  await pg.fill('#invSearch', 'xyz'); console.log('"xyz":', await pg.innerText('#invList'));
  console.log('sort kept after reload:', await (async () => { await pg.reload(); return pg.$eval('#invSort', s => s.value); })());
  console.log('errors', errs); await b.close();
})();
