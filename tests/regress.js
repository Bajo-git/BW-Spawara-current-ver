// Runs every feature on fixed inventories and prints the results (timings stripped).
const { chromium } = require('playwright');
const file = process.argv[2], outFile = process.argv[3];
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await pg.goto('file://' + require('path').resolve(file));
  const fs = require('fs');
  const helms = fs.readFileSync(require('path').join(__dirname, 'fixtures', 'user1.js'),'utf8').match(/const raw=`([\s\S]*?)`/)[1];
  const rings = fs.readFileSync(require('path').join(__dirname, 'fixtures', 'myrings.js'),'utf8').match(/const raw=`([\s\S]*?)`/)[1];
  const lines = [];
  const clean = s => s.replace(/\s+/g, ' ').replace(/\(?[0-9]+ ms\)?/g, '').replace(/· +·/g, '·').trim();
  const setup = async (D) => { await pg.evaluate(D => localStorage.setItem('bw-forge-v2', JSON.stringify(D)), D); await pg.reload(); await pg.addStyleTag({ content: 'sup.tier{display:none!important} ul.inv li{content-visibility:visible!important}' }); };
  const wait = () => pg.waitForFunction(() => { const x = document.querySelector('#result').innerText; return x && !/^Szukam/.test(x); }, null, { timeout: 120000 });
  const txt = async sel => { await pg.evaluate(() => document.querySelectorAll('sup.tier').forEach(x => x.remove())); return clean(await pg.locator(sel).first().innerText()); };
  const res = async () => txt('#result');
  const mkInv = (raw, legAll) => raw.split('\n').map(l => { const leg = legAll || l.startsWith('Legendary'); const w = l.replace('Legendary', '').split(' '); return { p: w[0], b: w[1], s: w.slice(2).join(' '), l: leg, n: 1, lock: 0 }; });
  const P=['utwardzony','wzmocniony','pomocny','ozdobny','elegancki','rogaty','zlosliwy','leniwy','smiercionosny','bojowy','magnetyczny','krwawy'];
  const B=['czapka','kask','helm','maska','obrecz','kominiarka','kapelusz'];
  const S=['podroznika','przezornosci','wytrzymalosci','pasterza','narkomana','ochrony','zmyslow','wieszcza','kary'];
  const rand = (N, seed0) => { let seed = seed0; const rnd = k => { seed = (seed * 16807) % 2147483647; return seed % k; }; const inv = []; for (let i = 0; i < N; i++) inv.push({ p: P[rnd(12)], b: B[rnd(7)], s: rnd(5) ? S[rnd(9)] : '', l: false, n: 1, lock: 0 }); return inv; };
  const invs = { helms: mkInv(helms, true), r18: rand(18, 7), r24: rand(24, 7) };
  const targets = [['krwawy','bandana','adrenaliny','*'], ['bojowy','korona','+','*'], ['zlosliwy','*','*','*'], ['runiczny','korona','magii','*'], ['krwawy','obrecz','ochrony','*']];
  for (const [name, inv] of Object.entries(invs)) {
    for (const mode of ['fast', 'cheap', 'optimal']) {
      for (const [p, bb, s, l] of targets) {
        if (name !== 'helms' && mode === 'optimal' && p === 'runiczny') continue;
        await setup({ v32: 1, noOver: false, cat: 0, mode, 'Głowa': { inv, example: false, target: { p, b: bb, s, l }, plans: [], auction: name === 'helms' && p === 'krwawy' ? [{ p: 'zlosliwy', b: 'korona', s: 'mocy', l: true, n: 1 }] : [] } });
        await pg.$eval('#findBtn', e => e.click()); await wait();
        lines.push(`FIND ${name} ${mode} ${p}/${bb}/${s}: ${(await res()).slice(0, 900)}`);
      }
    }
    for (const bm of ['both', 'p', 's']) {
      await setup({ v32: 1, noOver: false, cat: 0, bestMode: bm, 'Głowa': { inv, example: false, target: null, plans: [] } });
      await pg.$eval('#bestBtn', e => e.click()); await wait(); lines.push(`BEST ${name} ${bm}: ${(await res()).slice(0, 900)}`);
    }
    for (const tm of ['both', 'p', 's']) for (const tb of [false, true]) {
      await setup({ v32: 1, noOver: false, cat: 0, trashMode: tm, trashBases: tb, 'Głowa': { inv, example: false, target: null, plans: [] } });
      await pg.$eval('#trashBtn', e => e.click()); lines.push(`TRASH ${name} ${tm} bases=${tb}: ${(await res()).slice(0, 1200)}`);
    }
  }
  // rings
  for (const bm of ['both', 'p']) { await setup({ cat: 3, bestMode: bm, 'Pierścienie': { inv: mkInv(rings, false), example: false, target: null, plans: [] } }); await pg.$eval('#bestBtn', e => e.click()); await wait(); lines.push(`BEST rings ${bm}: ${(await res()).slice(0, 700)}`); }
  for (const tm of ['p', 's']) { await setup({ cat: 3, trashMode: tm, 'Pierścienie': { inv: mkInv(rings, false), example: false, target: null, plans: [] } }); await pg.$eval('#trashBtn', e => e.click()); lines.push(`TRASH rings ${tm}: ${(await res()).slice(0, 1200)}`); }
  // paste, plans, auction flow
  await setup({ v32: 1, noOver: false, cat: 0, mode: 'fast', 'Głowa': { inv: invs.helms, example: false, target: { p: 'krwawy', b: 'bandana', s: 'adrenaliny', l: '*' }, plans: [], auction: [] } });
  await pg.$eval('#pasteMode [data-v="inv"]', e => e.click()); await pg.fill('#pasteBox', 'Legendarny Utwardzony Hełm Podróżnika  Obrona 20\nCzapka Podróżnika [Załóż]\nMiedziany Sygnet Urody'); await pg.$eval('#pasteGo', e => e.click());
  lines.push('PASTE: ' + (await txt('#pasteOut'))); await pg.$eval('#pasteAdd', e => e.click());
  lines.push('INV after paste: ' + (await txt('#invList')));
  await pg.$eval('#pasteMode [data-v="auc"]', e => e.click()); await pg.fill('#pasteBox', 'Legendarny Zlosliwy Korona Mocy'); await pg.$eval('#pasteGo', e => e.click());
  lines.push('AUC paste: ' + (await txt('#aucOut')));
  await pg.fill('#cashIn', '100'); await pg.$eval('#cashIn', e => e.dispatchEvent(new Event('change')));
  await pg.$eval('#findBtn', e => e.click()); await wait(); await pg.$eval('#lockPlan', e => e.click());
  lines.push('PLANS: ' + (await txt('#planList')) + ' | AUC: ' + (await txt('#aucList')));
  await pg.$eval('[data-bought="0"]', e => e.click()); lines.push('PLANS after bought: ' + (await txt('#planList')) + ' | CASH: ' + await pg.evaluate(() => JSON.parse(localStorage.getItem('bw-forge-v2')).cash));
  await pg.$eval('#planList [data-view="0"]', e => e.click()); if (await pg.locator('#craftPlan').count()) await pg.$eval('#craftPlan', e => e.click());
  lines.push('AFTER CRAFT: ' + (await txt('#result')) + ' | INV: ' + (await txt('#invList')));
  await pg.$eval('[data-lock="0"]', e => e.click()); lines.push('LOCK: ' + (await txt('#invList li')));
  for (let i = 0; i < 10; i++) { await pg.$eval(`#tab-${i}`, e => e.click()); lines.push(`TAB ${i}: ` + (await txt('#tgtPicker')).slice(0, 80) + ' | trashSeg hidden=' + await pg.locator('#trashSeg').isHidden() + ' | ' + (await txt('#trashSet'))); }
  lines.push('ERRORS: ' + JSON.stringify(errs));
  fs.writeFileSync(outFile, lines.join('\n') + '\n');
  console.log(lines.length, 'checks written; errors:', errs.length);
  await b.close();
})();
