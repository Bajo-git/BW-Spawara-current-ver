// "Dlaczego nie?" under route results. usage: node tests/whynot.js index.html
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await pg.goto('file://' + path.resolve(process.argv[2]));
  const inv = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'inv20.json'))).map((x, i) => ({ ...x, n: 1, lock: i === 0 ? 1 : 0 }));
  const auction = [{ p: 'zlosliwy', b: 'korona', s: 'mocy', l: true, n: 2, price: 9000, pk: 'min' }];
  for (const [mode, target] of [['fast', ['krwawy', 'bandana', 'adrenaliny', '1']], ['cheap', ['bojowy', 'korona', 'ochrony', '*']], ['optimal', ['runiczny', 'korona', 'magii', '0']]]) {
    await pg.evaluate(D => localStorage.setItem('bw-forge-v2', JSON.stringify(D)), { v32: 1, cat: 0, mode, cash: 5000, affordOnly: true, 'Głowa': { inv, auction, example: false, target: { p: target[0], b: target[1], s: target[2], l: target[3] }, plans: [] } });
    await pg.reload(); await pg.$eval('#findBtn', e => e.click());
    await pg.waitForFunction(() => { const x = document.querySelector('#result').innerText; return x && !/^Szukam/.test(x); }, null, { timeout: 60000 });
    const w = await pg.$('#result details.whynot'); if (!w) { console.log(mode, target.join(' '), ': no list'); continue; }
    await pg.$eval('#result details.whynot', d => d.open = true);
    const rows = await pg.$$eval('#result details.whynot li', l => l.map(x => x.innerText.replace(/\s+/g, ' ')));
    const reasons = {}; for (const r of rows) { const why = r.replace(/^.*?(?=(zablokowany|zarezerwowany|cel jest|to już|nie ma|Najtańsza|afiks|pasuje|aukcja))/, ''); reasons[why] = (reasons[why] || 0) + 1; }
    console.log(mode, target.join(' '), '|', await pg.$eval('#result details.whynot summary', s => s.innerText.replace(/\s+/g, ' ')), '|', JSON.stringify(reasons));
  }
  console.log('errors', errs); await b.close();
})();
