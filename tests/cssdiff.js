// Screenshots of the main views for a page, to compare two builds pixel by pixel.
// usage: node cssdiff.js page.html outdir
const { chromium } = require('playwright');
const fs = require('fs');
const [file, dir] = process.argv.slice(2);
(async () => {
  fs.mkdirSync(dir, { recursive: true });
  const b = await chromium.launch();
  const helms = fs.readFileSync(require('path').join(__dirname, 'fixtures', 'user1.js'), 'utf8').match(/const raw=`([\s\S]*?)`/)[1];
  const inv = helms.split('\n').map(l => { const w = l.replace('Legendary', '').split(' '); return { p: w[0], b: w[1], s: w.slice(2).join(' '), l: true, n: 1, lock: 0 }; });
  const auction = [{ p: 'zlosliwy', b: 'korona', s: 'mocy', l: true, n: 1, price: 1200, pk: 'bid' }, { p: 'krwawy', b: 'czapka', s: 'kary', l: true, n: 2, price: null, pk: 'none' }, { p: 'bojowy', b: 'kask', s: '', l: true, n: 1, price: 90000, pk: 'min' }];
  const base = { v32: 1, noOver: true, cat: 0, cash: 5000, mode: 'fast', 'Głowa': { inv, example: false, target: { p: 'krwawy', b: 'bandana', s: 'adrenaliny', l: '*' }, plans: [], auction } };
  for (const [name, vw] of [['desk', { width: 1280, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
    const pg = await b.newPage({ viewport: vw });
    const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
    await pg.goto('file://' + require('path').resolve(file));
    await pg.evaluate(D => localStorage.setItem('bw-forge-v2', JSON.stringify(D)), base); await pg.reload();
    const shot = async tag => { await pg.waitForTimeout(150); await pg.screenshot({ path: `${dir}/${name}-${tag}.png`, fullPage: true }); };
    await shot('start');
    await pg.$eval('#findBtn', e => e.click());
    await pg.waitForFunction(() => { const x = document.querySelector('#result').innerText; return x && !/^Szukam/.test(x); }, null, { timeout: 60000 });
    await shot('find');
    await pg.$eval('#lockPlan', e => e.click());
    await pg.$eval('#tabAuc', e => e.click()); await shot('auction');
    await pg.$eval('.navlist [data-view="plans"]', e => e.click()); await pg.$eval('#planList [data-view="0"]', e => e.click()); await shot('plan');
    await pg.$eval('.navlist [data-view="shop"]', e => e.click()); await shot('shop');
    await pg.$eval('.navlist [data-view="trash"]', e => e.click()); await pg.$eval('#trashBtn', e => e.click()); await shot('trash');
    console.log(name, 'errors:', errs.length, errs.slice(0, 3));
    await pg.close();
  }
  await b.close();
})();
