const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1440, height: 950 } }); await pg.addInitScript(() => { new MutationObserver(() => document.querySelectorAll('sup.tier').forEach(x => x.remove())).observe(document, { subtree: true, childList: true }); });
  const errs=[]; pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await pg.goto('file://' + require('path').resolve(process.argv[2]));
  const raw = `szeroki lom podstepu
okrutny korbacz mocy
zabojczy maczuga inkwizytora
mistyczny lom krwiopijcy
zebaty kosa krwiopijcy
szeroki topor dwureczny podkowy
napromieniowany lom zdobywcy
napromieniowany miecz dwureczny olowiu
mistyczny topor dwureczny hazardzisty
demoniczny maczuga zdrady
lekki pika zdrady
kosztowny maczuga zdrady
krysztalowy kosa podkowy
mistyczny pika hazardzisty
ostry katana zdrady
przeklety lom zdobywcy
krysztalowy miecz dwureczny olowiu
opiekunczy topor dwureczny wladzy
okrutny pila lancuchowa zdrady`;
  const bases = ['miecz dwureczny','topor dwureczny','pila lancuchowa','maczuga','lom','korbacz','kosa','pika','halabarda','katana'];
  const inv = raw.split('\n').map(l => { const [p, ...rest] = l.split(' '); const r = rest.join(' '); const bb = bases.find(x => r.startsWith(x)); return { p, b: bb, s: r.slice(bb.length).trim(), l: true, n: 1, lock: 0 }; });
  const tabs = await pg.$$eval('#tabs button', t => t.map(x => x.textContent)); const ci = tabs.indexOf('Biała 2h');
  const name = await pg.evaluate(ci => JSON.parse(localStorage.getItem('bw-forge-v2')||'{}'), ci);
  await pg.click(`#tabs button:nth-child(${ci+1})`);
  const catName = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', '..', 'data', 'r21.json')))[ci].name;
  console.log('cat', ci, catName);
  for (const view of ['find','manual']) {
    await pg.evaluate(([inv, ci, catName, view]) => { const st = JSON.parse(localStorage.getItem('bw-forge-v2')); st.cat = ci; st.view = view; st.mode='fast'; st[catName] = { inv, auction: [], example: false, target: { p:'demoniczny', b:'katana', s:'drakuli', l:'1' }, plans: [] }; localStorage.setItem('bw-forge-v2', JSON.stringify(st)); }, [inv, ci, catName, view]);
    await pg.reload();
    const t0 = Date.now();
    if (view === 'find') { await pg.click('#findBtn'); await pg.waitForFunction(() => { const x = document.querySelector('#result').innerText; return x && !/^Szukam/.test(x); }, null, {timeout: 60000}); }
    else { await pg.click('#manBtn'); await pg.waitForSelector('#manEdit', {timeout: 60000}); }
    console.log(`\n${view} (${Date.now()-t0} ms):`, (await pg.innerText('#result')).split('\n')[0]);
    console.log(' cards:', (await pg.$$eval('.tcard', c => c.map(x => x.innerText.replace(/\s+/g,' ')))).join(' | '));
  }
  // explore: for every missing card, try every option; check the target never appears below the top
  let bad = 0, tried = 0;
  const explore = async (depth) => {
    const miss = await pg.$$('.tcard.missing'); if (!miss[depth]) return;
    await miss[depth].click();
    const n = await pg.$$eval('.mopt', o => o.length);
    for (let i = 0; i < Math.min(n, 40); i++) {
      const snapshot = await pg.evaluate(() => 0);
      const opts = await pg.$$('#manEdit .mopts .mopt'); if (!opts[i]) break; if (await opts[i].evaluate(e => e.classList.contains('nofit'))) continue;
      const label = (await opts[i].innerText()).replace(/\s+/g,' ');
      await opts[i].click(); tried++;
      const cards = await pg.$$eval('.tcard', c => c.map(x => x.innerText.replace(/\s+/g,' ')));
      const below = cards.filter(t => (/demoniczny katana drakuli/.test(t) && !/WYNIK/.test(t)) || /NIE PASUJE/.test(t));
      if (below.length) { bad++; console.log('TARGET BELOW after', label, below); }
      // back to the start state
      await pg.click('#manAuto'); await pg.waitForSelector('#manEdit');
      const m2 = await pg.$$('.tcard.missing'); if (m2[depth]) await m2[depth].click();
    }
  };
  await explore(0); await explore(1);
  console.log('options tried', tried, 'bad', bad);
  console.log('errors', errs); await b.close();
})();
