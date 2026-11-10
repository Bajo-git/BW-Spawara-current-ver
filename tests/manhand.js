// Ręczny plan "Zrób ręcznie" = a bottom-up workbench: starts empty (no target card); the first item
// dropped becomes a card; an item dropped on any card combines with it and the result appears above;
// results take more drops; items that don't combine are refused; Cofnij / Usuń zaznaczony / the
// phone list work. usage: node tests/manhand.js index.html [outdir]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 1440, height: 1700 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await pg.goto('file://' + path.resolve(process.argv[2]));
  const inv = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'inv20.json')));
  await pg.evaluate(inv => localStorage.setItem('bw-forge-v2', JSON.stringify({ v32: 1, cat: 0, mode: 'optimal', view: 'manual', 'Głowa': { inv, auction: [], example: false, target: { p: 'szturmowy', b: 'kapelusz', s: 'krwi', l: '1' }, plans: [] } })), inv);
  await pg.reload();
  const head = async () => (await pg.$$eval('#result .verdict', v => v.map(x => x.innerText.replace(/\s+/g, ' ').slice(0, 130)))).join(' / ');
  const cards = async () => (await pg.$$eval('#result .tcard', cs => cs.map(c => c.innerText.replace(/\s+/g, ' ').replace(/\d+/g, '').replace(/LEGENDARNY/g, 'L ').trim()))).join(' | ');
  const names = await pg.$$eval('#invList .inv-name', l => l.map(x => x.innerText.replace(/\s+/g, ' ').trim()));
  const row = i => pg.locator('#invList .inv-name').nth(i);
  const card = mid => pg.locator(`#result .tcard[data-mid="${mid}"]`);
  const legIdx = names.map((n, i) => [n, i]).filter(([n]) => /^L /.test(n) || /LEGENDARNY/.test(n)).map(x => x[1]);
  const comIdx = names.map((n, i) => [n, i]).filter(([n]) => !(/^L /.test(n) || /LEGENDARNY/.test(n))).map(x => x[1]);
  console.log('inventory:', names.length, 'rows,', legIdx.length, 'legendary');
  await pg.click('#manHand');
  console.log('1 start:', await head(), '| tree cards:', (await pg.$$('#result .tcard')).length, '| drop zone:', !!(await pg.$('#benchDrop')));
  await row(legIdx[0]).dragTo(pg.locator('#benchDrop'));
  console.log('2 first item:', await cards());
  await row(legIdx[1]).dragTo(card(0));
  console.log('3 drop on it:', await head(), '\n   ', await cards());
  await row(legIdx[2]).dragTo(card(0));
  console.log('4 drop on result:', await head(), '\n   ', await cards());
  const leaf = await pg.$$eval('#result .tcard.leaf', cs => cs.map(c => c.dataset.mid));
  await row(legIdx[3]).dragTo(card(leaf[leaf.length - 1]));
  console.log('5 drop on a card below:', await head(), '\n   ', await cards());
  if (comIdx.length) { await row(comIdx[0]).dragTo(card(0)); console.log('6 common on legendary:', await head()); }
  await pg.click('#benchUndo'); console.log('7 undo:', (await pg.$$('#result .tcard')).length, 'cards');
  await card(leaf[0]).click(); await pg.click('#benchDel'); console.log('8 delete selected leaf:', await cards());
  // phone-style: pick from the list onto the selected card
  await card(0).click(); const opt = await pg.$$eval('#benchPick option', o => o.map(x => x.value).filter(Boolean));
  await pg.selectOption('#benchPick', opt[0]); console.log('9 list preview:', await pg.innerText('#benchPrev'));
  await pg.click('#benchAddBtn'); console.log('   after Połącz:', await head());
  console.log('save button:', !!(await pg.$('#benchSave')));
  if (process.argv[3]) await pg.screenshot({ path: process.argv[3] + '/bench.png', fullPage: true });
  console.log('errors', errs); await b.close();
})();
