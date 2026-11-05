// Sheet cheat sheet: sidebar thumbnails per category, the pop-up table (open, pick a cell, Esc, backdrop),
// and the phone entry under Więcej. usage: node tests/sheet.js index.html outdir
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(), errs = [];
  const pg = await b.newPage({ viewport: { width: 1440, height: 950 }, deviceScaleFactor: 2 }); pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await pg.goto('file://' + path.resolve(process.argv[2]));
  await pg.evaluate(() => localStorage.setItem('bw-forge-v2', JSON.stringify({ v32: 1, cat: 0, view: 'find' }))); await pg.reload();
  await pg.screenshot({ path: process.argv[3] + '/sh-side.png', clip: { x: 0, y: 0, width: 230, height: 950 } });
  await pg.click('[data-sheet="1"]'); await pg.waitForTimeout(200);
  await pg.click('td[data-r="9"][data-c="12"]');
  await pg.screenshot({ path: process.argv[3] + '/sh-dlg.png' });
  console.log('pick:', await pg.innerText('#sheetPick'));
  await pg.keyboard.press('Escape'); console.log('closed by Esc:', !(await pg.$eval('#sheetDlg', d => d.open)));
  // every category: thumbnails count, open each table, check sizes
  for (let i = 0; i < 10; i++) { await pg.click(`#tab-${i}`); const n = await pg.$$eval('.sheetthumb', l => l.length);
    const sizes = []; for (let j = 0; j < n; j++) { await pg.click(`[data-sheet="${j}"]`); sizes.push(await pg.$$eval('table.sheet tbody tr', r => r.length)); await pg.click('#sheetClose'); }
    console.log(await pg.innerText('#sheetCat'), n, sizes.join('/')); }
  await pg.click('#tab-3'); await pg.click('[data-sheet="1"]'); await pg.screenshot({ path: process.argv[3] + '/sh-rings.png' });
  await pg.mouse.click(5, 5); console.log('closed by backdrop:', !(await pg.$eval('#sheetDlg', d => d.open)));
  const ph = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); ph.on('pageerror', e => errs.push(e.message));
  await ph.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await ph.goto('file://' + path.resolve(process.argv[2]));
  await ph.evaluate(() => localStorage.setItem('bw-forge-v2', JSON.stringify({ v32: 1, cat: 0, view: 'find' }))); await ph.reload();
  await ph.tap('.mnav [data-mv="more"]'); await ph.screenshot({ path: process.argv[3] + '/sh-phone-more.png' });
  await ph.tap('#mSheet'); await ph.waitForTimeout(200); await ph.tap('td[data-r="3"][data-c="5"]'); await ph.screenshot({ path: process.argv[3] + '/sh-phone.png' });
  console.log('errors', errs); await b.close(); })();
