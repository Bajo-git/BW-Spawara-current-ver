// User report 2026-11-03: "tygrysie kilt unikow" found no full route, while "tygrysie kilt <any suffix>"
// showed a full route making exactly tygrysie kilt unikow (it used items with a better suffix).
// Both targets must now give the same route, and offer the full route as an alternative that
// never consumes the runiczne kilt unikow (already better than the target).
// usage: node tests/scenarios/open-affix.js index.html
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(() => { new MutationObserver(() => document.querySelectorAll('sup.tier').forEach(x => x.remove())).observe(document, { subtree: true, childList: true }); });
  await pg.goto('file://' + path.resolve(process.argv[2]));
  const inv = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'gacie12.json'))).map(x => ({ ...x, n: 1, lock: 0 }));
  const res = {};
  for (const mode of ['optimal', 'fast']) for (const s of ['unikow', '*']) {
    await pg.evaluate(D => localStorage.setItem('bw-forge-v2', JSON.stringify(D)), { v32: 1, cat: 2, mode, 'Spodnie': { inv, example: false, target: { p: 'tygrysie', b: 'kilt', s, l: '*' }, plans: [] } });
    await pg.reload(); await pg.$eval('#findBtn', e => e.click());
    await pg.waitForFunction(() => { const x = document.querySelector('#result').innerText; return x && !/^Szukam/.test(x); }, null, { timeout: 60000 });
    const head = (await pg.locator('#result .verdict').first().innerText()).replace(/\(ścieżka.*$/s, '').replace(/\s+/g, ' ').trim();
    const alt = await pg.$('#altGo') ? (await pg.locator('.altbox').innerText()).replace(/\s+/g, ' ') : 'no alternative';
    res[mode + ' ' + s] = head;
    console.log(`${mode} tygrysie kilt ${s}: ${head}\n   alt: ${alt.slice(0, 160)}`);
  }
  console.log('same answer for fixed and open suffix:', res['optimal unikow'] === res['optimal *'] && res['fast unikow'] === res['fast *']);
  console.log('errors', errs); await b.close();
})();
