const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1440, height: 950 } }); await pg.addInitScript(() => { new MutationObserver(() => document.querySelectorAll('sup.tier').forEach(x => x.remove())).observe(document, { subtree: true, childList: true }); });
  const errs=[]; pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await pg.goto('file://' + require('path').resolve(process.argv[2]));
  const P=['wzmocniony','cwiekowany','wladczy','lekki','luskowy','bojowy','plytowy','gietki','krwawy','lowiecki','szamanski','kuloodporny','tygrysi','elfi','runiczny','smiercionosny'];
  const B=['koszulka','kurtka','marynarka','kamizelka','gorset','peleryna','smoking','kolczuga','zbroja warstwowa','pelna zbroja'];
  const S=['adepta','straznika','zlodzieja','silacza','narkomana','szermierza','zabojcy','gwardzisty','kobry','skorupy zolwia','unikow','grabiezcy','mistrza','adrenaliny','centuriona','odpornosci','kaliguli','siewcy smierci','szybkosci','orchidei'];
  let used = 0, runs = 0;
  for (let seed0 = 1; seed0 <= 8; seed0++) {
    let seed = seed0 * 7919; const rnd = k => { seed = (seed * 16807) % 2147483647; return seed % k; };
    const inv = [{ p: 'smiercionosny', b: 'gorset', s: 'orchidei', l: true, n: 1, lock: 0 }];
    for (let i = 0; i < 7; i++) inv.push({ p: P[6 + rnd(9)], b: B[3 + rnd(7)], s: S[8 + rnd(11)], l: true, n: 1, lock: 0 });
    await pg.evaluate(([inv]) => localStorage.setItem('bw-forge-v2', JSON.stringify({ v32: 1, cat: 1, mode: 'optimal', view: 'manual', 'Klata': { inv, auction: [], example: false, target: { p: 'runiczny', b: 'zbroja warstwowa', s: 'szybkosci', l: '1' }, plans: [] } })), [inv]);
    await pg.reload(); await pg.click('#manBtn'); await pg.waitForSelector('#manEdit', { timeout: 60000 });
    const cards = await pg.$$eval('.tcard', c => c.map(x => x.innerText.replace(/\s+/g, ' ')));
    const g = cards.some(t => /smiercionosny gorset orchidei/.test(t)); runs++; if (g) used++;
    // also: click each missing card and auto/halves first option
    const head = (await pg.innerText('#result')).split('\n')[0];
    let optG = -1;
    const miss = await pg.$$(".tcard.root");
    if (miss.length) { await miss[0].click(); const opts = await pg.$$eval('#manEdit .mopts .mopt', o => o.map(x => x.innerText.replace(/\s+/g,' '))); optG = opts.findIndex(t => /smiercionosny gorset orchidei/.test(t)); 
      const first = await pg.$('#manEdit .mopts .mopt:not(.nofit)'); if (first) { await first.click(); const c2 = await pg.$$eval('.tcard', c => c.map(x => x.innerText.replace(/\s+/g, ' '))); if (c2.some(t => /smiercionosny gorset orchidei/.test(t))) optG = 'USED after first option'; } }
    console.log(seed0, g ? 'GORSET USED' : 'ok', '|', head.slice(0, 80), '| first option with gorset index:', optG);
  }
  console.log('used', used, 'of', runs, errs);
  await b.close();
})();
