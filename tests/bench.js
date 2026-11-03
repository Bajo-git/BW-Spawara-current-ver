// Times reported by the app itself ("… ms" in the verdict), v37 vs v38, alternating runs.
// usage: node bench38.js v37.html v38.html
const { chromium } = require('playwright');
const fs = require('fs');
const [A, B] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const helms = fs.readFileSync(require('path').join(__dirname, 'fixtures', 'user1.js'), 'utf8').match(/const raw=`([\s\S]*?)`/)[1];
  const inv20 = JSON.parse(fs.readFileSync(require('path').join(__dirname, 'fixtures', 'inv20.json'), 'utf8')).map(x => ({ p: x.p, b: x.b, s: x.s, l: x.l, n: 1, lock: 0 }));
  const mk = raw => raw.split('\n').map(l => { const w = l.replace('Legendary', '').split(' '); return { p: w[0], b: w[1], s: w.slice(2).join(' '), l: true, n: 1, lock: 0 }; });
  const cases = [
    { name: 'best both, 20 helmets', btn: '#bestBtn', st: { bestMode: 'both', inv: inv20 } },
    { name: 'best both, 11 helmets', btn: '#bestBtn', st: { bestMode: 'both', inv: mk(helms) } },
    { name: 'find optimal krwawy bandana adrenaliny, 20 helmets', btn: '#findBtn', st: { mode: 'optimal', inv: inv20 } },
    { name: 'find fast krwawy bandana adrenaliny, 20 helmets', btn: '#findBtn', st: { mode: 'fast', inv: inv20 } },
    { name: 'find cheap krwawy bandana adrenaliny, 20 helmets', btn: '#findBtn', st: { mode: 'cheap', inv: inv20 } },
  ];
  const run = async (file, c) => {
    const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
    await pg.goto('file://' + require('path').resolve(file));
    const D = { v32: 1, cat: 0, noOver: true, mode: c.st.mode || 'fast', bestMode: c.st.bestMode, view: c.btn === '#bestBtn' ? 'best' : 'find', 'Głowa': { inv: c.st.inv, example: false, target: { p: 'krwawy', b: 'bandana', s: 'adrenaliny', l: '*' }, plans: [], auction: [] } };
    await pg.evaluate(D => localStorage.setItem('bw-forge-v2', JSON.stringify(D)), D); await pg.reload();
    await pg.$eval(c.btn, e => e.click());
    await pg.waitForFunction(() => { const x = document.querySelector('#result').innerText; return x && !/^Szukam/.test(x); }, null, { timeout: 120000 });
    const t = await pg.locator('#result').innerText();
    await pg.close();
    const m = t.match(/(\d+) ms/); return m ? +m[1] : NaN;
  };
  for (const c of cases) {
    const ra = [], rb = [];
    for (let i = 0; i < 5; i++) { ra.push(await run(A, c)); rb.push(await run(B, c)); }
    const med = r => r.slice().sort((x, y) => x - y)[2];
    console.log(`${c.name}: v37 ${med(ra)} ms, v38 ${med(rb)} ms  (v37 ${ra.join('/')}, v38 ${rb.join('/')})`);
  }
  await b.close();
})();
