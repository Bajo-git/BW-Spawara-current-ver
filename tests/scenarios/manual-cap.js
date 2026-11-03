const { chromium } = require('playwright'); const fs=require('fs');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1440, height: 950 } }); await pg.addInitScript(() => { new MutationObserver(() => document.querySelectorAll('sup.tier').forEach(x => x.remove())).observe(document, { subtree: true, childList: true }); });
  const errs=[]; pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await pg.goto('file://' + require('path').resolve(process.argv[2]));
  const inv = JSON.parse(fs.readFileSync(require('path').join(__dirname, '..', 'fixtures', 'inv20.json')));
  inv.push({ p:'krwawy', b:'bandana', s:'krwi', l:true, n:1, lock:0 });
  const P=['utwardzony','wzmocniony','pomocny','ozdobny','elegancki','rogaty','zlosliwy','leniwy','smiercionosny','bojowy','magnetyczny','krwawy','kunsztowny','kuloodporny','szamanski','tygrysi','szturmowy','runiczny','rytualny'];
  const S=['podroznika','przezornosci','wytrzymalosci','pasterza','narkomana','ochrony','zmyslow','wieszcza','kary','gladiatora','krwi','skorupy zolwia','slonca','adrenaliny','prekognicji','smoczej luski','mocy','magii'];
  const capP = P.indexOf('tygrysi'), capS = S.indexOf('prekognicji');
  const overText = t => { const w = t.toLowerCase(); const p = P.findIndex(x => w.includes(x + ' ')), s = S.findIndex(x => w.endsWith(x) || w.includes(x + ' ')); return p > capP || s > capS; };
  for (const view of ['find', 'manual']) {
    await pg.evaluate(([inv, view]) => localStorage.setItem('bw-forge-v2', JSON.stringify({ v32: 1, cat: 0, mode: 'optimal', view, 'Głowa': { inv, auction: [], example: false, target: { p:'tygrysi', b:'opaska', s:'prekognicji', l:'1' }, plans: [] } })), [inv, view]);
    await pg.reload();
    if (view === 'find') { await pg.click('#findBtn'); await pg.waitForFunction(() => { const x = document.querySelector('#result').innerText; return x && !/^Szukam/.test(x); }, null, {timeout:60000}); }
    else { await pg.click('#manBtn'); await pg.waitForSelector('#manEdit', {timeout:60000}); }
    const cards = await pg.$$eval('.tcard', c => c.map(x => ({ cls: x.className, t: x.innerText.replace(/\s+/g,' ').replace(/LEGENDARNY/g,'') })));
    console.log(`\n${view}:`, (await pg.innerText('#result')).split('\n')[0].slice(0,120));
    for (const c of cards) console.log('  ', /missing/.test(c.cls) ? 'MISSING' : /root/.test(c.cls) ? 'ROOT   ' : /leaf/.test(c.cls) ? 'OWNED  ' : 'STEP   ', c.t, /missing|owned/.test(c.cls) && overText(c.t) ? '<< ABOVE TARGET' : '');
    if (view === 'manual') {
      let bad = 0, tot = 0;
      const nC = (await pg.$$('.tcard')).length; for (let ci = 0; ci < nC; ci++) { await (await pg.$$('.tcard'))[ci].click(); const opts = await pg.$$eval('#manEdit .mopts .mopt', o => o.map(x => x.innerText.replace(/\s+/g,' ').replace(/LEGENDARNY/g,''))); for (const o of opts) { tot++; if (o.split(' + ').some(part => overText(part.replace(/▲.*/, '').trim()))) { bad++; if (bad < 4) console.log('   option above target:', o.slice(0,120)); } } }
      console.log('  options checked', tot, 'with an item above target', bad);
    }
  }
  console.log('errors', errs); await b.close();
})();
