// Manual plan "Zrób ręcznie": starts empty; drag items from the inventory onto tree cards (a fitting
// item fills the card, an item that can make it becomes "item + missing partner", an item that can't
// make the target is refused with a message); "Złóż z dwóch przedmiotów" previews and applies a pair.
// usage: node tests/manhand.js index.html [outdir]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 1440, height: 1700 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await pg.goto('file://' + path.resolve(process.argv[2]));
  const inv = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'inv20.json')));
  await pg.evaluate(inv => localStorage.setItem('bw-forge-v2', JSON.stringify({ v32: 1, cat: 0, mode: 'optimal', view: 'manual', 'Głowa': { inv, auction: [], example: false, target: { p: 'szturmowy', b: 'kapelusz', s: 'krwi', l: '1' }, plans: [] } })), inv);
  await pg.reload();
  const head = async () => (await pg.innerText('#result .verdict')).split('\n')[0].slice(0, 150);
  const cards = async () => (await pg.$$eval('#result .tcard', cs => cs.map(c => c.innerText.replace(/\s+/g, ' ').replace(/\d+/g, '').trim()))).join(' | ');
  const row = name => pg.locator('#invList .inv-name', { hasText: new RegExp(name.split(' ').join('\\d* ')) }).first();
  await pg.click('#manHand');
  console.log('start:', await head(), '\n  cards:', await cards());
  // an item that cannot make the target with any partner
  await row('leniwy').dragTo(pg.locator('#result .tcard[data-mid="0"]'));
  console.log('drop leniwy on target:', (await pg.$$eval('#result .verdict', v => v.map(x => x.innerText.slice(0, 110)))).join(' / '));
  // the item the automatic plan uses
  await row('tygrysi czapka').dragTo(pg.locator('#result .tcard[data-mid="0"]'));
  console.log('drop tygrysi czapka on target:', await head(), '\n  cards:', await cards());
  // drop another item on the missing partner
  const partner = await pg.$eval('#result .tcard.wild, #result .tcard.missing', c => c.dataset.mid).catch(() => null);
  console.log('partner card mid:', partner, '· selected editor:', (await pg.innerText('#manEdit')).split('\n')[0]);
  if (partner) { await row('ozdobny').dragTo(pg.locator(`#result .tcard[data-mid="${partner}"]`)); console.log('drop ozdobny on partner:', await head(), '\n  cards:', await cards()); }
  // two-item picker on the target
  await pg.click('#result .tcard[data-mid="0"]');
  const opts = await pg.$$eval('#manTwoA option', o => o.map(x => x.value).filter(Boolean));
  await pg.selectOption('#manTwoA', opts[0]); await pg.selectOption('#manTwoB', opts[1]);
  console.log('picker preview:', await pg.innerText('#manTwoOut'));
  await pg.click('#manTwoGo'); console.log('after Połącz:', await head(), '\n  cards:', await cards());
  if (process.argv[3]) await pg.screenshot({ path: process.argv[3] + '/manhand.png', fullPage: true });
  console.log('errors', errs); await b.close();
})();
