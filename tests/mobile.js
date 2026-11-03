// Phone layout: screenshots of each screen at 390×844 with touch. usage: node tests/mobile.js index.html outdir
const { chromium, devices } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const dir = process.argv[3] || 'mobile-shots'; fs.mkdirSync(dir, { recursive: true });
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await pg.goto('file://' + path.resolve(process.argv[2]));
  const inv = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'inv20.json'))).map(x => ({ ...x, n: 1, lock: 0 }));
  await pg.evaluate(D => localStorage.setItem('bw-forge-v2', JSON.stringify(D)), { v32: 1, cat: 0, mode: 'optimal', cash: 5000, 'Głowa': { inv, example: false, target: { p: 'krwawy', b: 'bandana', s: 'adrenaliny', l: '*' }, plans: [], auction: [{ p: 'krwawy', b: 'czapka', s: 'kary', l: true, n: 1, price: null, pk: 'none' }] } });
  await pg.reload();
  const shot = async n => { await pg.waitForTimeout(250); await pg.screenshot({ path: `${dir}/${n}.png` }); };
  const tap = sel => pg.locator(sel).first().tap();
  await shot('1-start');
  await tap('#findBtn'); await pg.waitForTimeout(700); await shot('2-searching');
  await pg.waitForFunction(() => { const x = document.querySelector('#result').innerText; return x && !/^Szukam/.test(x); }, null, { timeout: 60000 });
  await shot('3-result');
  await pg.evaluate(() => window.scrollTo(0, 99999)); await shot('3b-result-bottom');
  const overflow = await pg.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  await tap('#lockPlan');
  await tap('.mnav [data-mv="inv"]'); await shot('4-inventory');
  await tap('.mnav [data-mv="manual"]'); await tap('#manBtn'); await pg.waitForSelector('#manEdit', { timeout: 60000 }); await shot('5-manual');
  await tap('.mnav [data-mv="plans"]'); await shot('6-plans');
  await tap('.mnav [data-mv="more"]'); await shot('7-more');
  await tap('#mMore [data-mv="settings"]'); await shot('8-settings');
  console.log('horizontal overflow on result screen:', overflow, '| errors', errs);
  await b.close();
})();
