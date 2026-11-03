const { chromium } = require('playwright'); const fs=require('fs');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1440, height: 950 } }); await pg.addInitScript(() => { new MutationObserver(() => document.querySelectorAll('sup.tier').forEach(x => x.remove())).observe(document, { subtree: true, childList: true }); });
  const errs=[]; pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await pg.goto('file://' + require('path').resolve(process.argv[2]));
  const inv = JSON.parse(fs.readFileSync(require('path').join(__dirname, '..', 'fixtures', 'inv20.json')));
  await pg.evaluate(([inv]) => localStorage.setItem('bw-forge-v2', JSON.stringify({ v32: 1, cat: 0, mode: 'cheap', view: 'find', 'Głowa': { inv, auction: [], example: false, target: { p:'bojowy', b:'korona', s:'ochrony', l:'1' }, plans: [] } })), [inv]);
  await pg.reload();
  console.log('settings line:', await pg.innerText('#findSet'), '| legendary select:', await pg.$eval('#tg-l', s => [...s.options].map(o => o.text).join('/')));
  await pg.click('#findBtn'); await pg.waitForFunction(() => { const x = document.querySelector('#result').innerText; return x && !/^Szukam/.test(x); });
  const res = (await pg.innerText('#result')).split('\n');
  console.log('cheap:', res.slice(0, 6).join(' / ').slice(0, 600));
  console.log('cards:', (await pg.$$eval('.tcard', c => c.map(x => x.innerText.replace(/\s+/g,' ')))).join(' | '));
  await pg.click('#toManual'); await pg.waitForSelector('#manEdit');
  console.log('manual after open:', (await pg.innerText('#result')).split('\n')[0]);
  const owned = await pg.$$('.tcard.owned'); await owned[0].click();
  console.log('groups:', await pg.$$eval('.mgrp-h', g => g.map(x => x.innerText.split('\n')[0])));
  console.log('option sample:', (await pg.$$eval('#manEdit .mopts .mopt', o => o.slice(0,3).map(x => x.innerText.replace(/\s+/g,' ')))).join(' || '));
  // ladder names in optimal
  await pg.click('.navlist [data-view="find"]'); await pg.click('#modeSeg [data-v="optimal"]');
  await pg.evaluate(() => { document.querySelector('#tg-p').value='runiczny'; document.querySelector('#tg-s').value='magii'; document.querySelector('#tgtPicker').dispatchEvent(new Event('change')); });
  await pg.click('#findBtn'); await pg.waitForFunction(() => { const x = document.querySelector('#result').innerText; return x && !/^Szukam/.test(x); }, null, {timeout: 60000});
  console.log('ladder:', await pg.$$eval('.alt', a => a.map(x => x.innerText)));
  console.log('errors', errs); await b.close();
})();
