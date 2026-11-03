// Background search: runs in the worker, reports phases, can be cancelled, page stays responsive.
// usage: node tests/worker.js index.html
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await pg.goto('file://' + path.resolve(process.argv[2]));
  const inv = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'inv20.json'))).map(x => ({ ...x, n: 1, lock: 0 }));
  const set = async extra => { await pg.evaluate(D => localStorage.setItem('bw-forge-v2', JSON.stringify(D)), { v32: 1, cat: 0, mode: 'fast', ...extra, 'Głowa': { inv, example: false, target: { p: 'krwawy', b: 'bandana', s: 'adrenaliny', l: '*' }, plans: [], auction: [] } }); await pg.reload(); };
  await set({});
  await pg.$eval('#findBtn', e => e.click());
  // while searching: the page answers, the box shows a phase and the time
  await pg.waitForTimeout(600);
  const t0 = Date.now(); await pg.evaluate(() => 1); const lag = Date.now() - t0;
  console.log('during search: page answered in', lag, 'ms | box:', (await pg.locator('#result').innerText()).replace(/\s+/g, ' '));
  await pg.waitForFunction(() => { const x = document.querySelector('#result').innerText; return x && !/^Szukam/.test(x); }, null, { timeout: 60000 });
  console.log('ran in:', await pg.$eval('#result', e => e.dataset.ran), '|', (await pg.locator('#result .verdict').first().innerText()).replace(/\s+/g, ' ').slice(0, 110));
  // deep search, cancelled after 1.5 s
  await set({ deep: true });
  await pg.$eval('#findBtn', e => e.click()); await pg.waitForTimeout(1500);
  const bar = await pg.$eval('#srchBar', e => e.style.width);
  await pg.$eval('#srchCancel', e => e.click()); await pg.waitForTimeout(300);
  console.log('deep bar after 1.5 s:', bar, '| after Anuluj:', await pg.locator('#result').innerText());
  // a new search after cancelling still works
  await set({}); await pg.$eval('#findBtn', e => e.click());
  await pg.waitForFunction(() => { const x = document.querySelector('#result').innerText; return x && !/^Szukam/.test(x); }, null, { timeout: 60000 });
  console.log('after cancel, new search ran in:', await pg.$eval('#result', e => e.dataset.ran));
  // manual plan's first fill
  await pg.$eval('.navlist [data-view="manual"]', e => e.click()); await pg.$eval('#manBtn', e => e.click());
  await pg.waitForSelector('#manEdit', { timeout: 60000 });
  console.log('manual fill ran in:', await pg.$eval('#result', e => e.dataset.ran), '|', (await pg.locator('#result .verdict').first().innerText()).slice(0, 80));
  console.log('errors', errs); await b.close();
})();
