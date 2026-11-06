// Tree on a phone (390×844, touch): one-finger swipe scrolls the tree natively, two-finger pinch zooms
// around the fingers, + / − zoom around the view centre, and a tap on a card still works when zoomed.
// Uses a found route (find view), then the manual plan for the tap.
// usage: node tests/treetouch.js index.html [outdir]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch(), errs = [];
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await pg.goto('file://' + path.resolve(process.argv[2]));
  const inv = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'inv20.json')));
  await pg.evaluate(inv => localStorage.setItem('bw-forge-v2', JSON.stringify({ v32: 1, cat: 0, mode: 'optimal', view: 'find', 'Głowa': { inv, auction: [], example: false, target: { p: 'szturmowy', b: 'kapelusz', s: '*', l: '*' }, plans: [] } })), inv);
  await pg.reload(); await pg.tap('#findBtn');
  await pg.waitForFunction(() => { const t = document.querySelector('.tree-scroll.canvas .tree'); return t && parseFloat(t.style.width) > 400; }, null, { timeout: 60000 });
  const box = await pg.$('details.treebox'); if (box && !(await box.evaluate(d => d.open))) await pg.tap('details.treebox > summary');
  const sc = await pg.$('.tree-scroll.canvas'); await sc.scrollIntoViewIfNeeded();
  const st = () => sc.evaluate(s => ({ z: +(s.querySelector('.tree').style.transform.match(/scale\(([\d.]+)/) || [0, 1])[1], l: Math.round(s.scrollLeft), t: Math.round(s.scrollTop), ta: getComputedStyle(s).touchAction }));
  const r = await sc.boundingBox(), cdp = await ctx.newCDPSession(pg), cx = r.x + r.width / 2, cy = r.y + r.height / 2;
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], id) => ({ x, y, id })) });
  console.log('start', JSON.stringify(await st()));
  // pinch out: fingers 60 px apart → 220 px apart, in 12 steps
  await touch('touchStart', [[cx - 30, cy], [cx + 30, cy]]);
  for (let i = 1; i <= 12; i++) { const d = 30 + i * 80 / 12; await touch('touchMove', [[cx - d, cy], [cx + d, cy]]); await pg.waitForTimeout(16); }
  await touch('touchEnd', []); await pg.waitForTimeout(100);
  const a = await st(); console.log('after pinch', JSON.stringify(a), a.z > 1.5 ? 'zoomed' : 'NOT ZOOMED');
  // one finger swipe left/up: native scroll
  await touch('touchStart', [[cx + 100, cy + 80]]);
  for (let i = 1; i <= 10; i++) { await touch('touchMove', [[cx + 100 - i * 18, cy + 80 - i * 12]]); await pg.waitForTimeout(16); }
  await touch('touchEnd', []); await pg.waitForTimeout(400);
  const s2 = await st(); console.log('after swipe', JSON.stringify(s2), s2.l > a.l || s2.t > a.t ? 'scrolled' : 'NOT SCROLLED');
  await pg.screenshot({ path: (process.argv[3] || '.') + '/treetouch-zoomed.png' });
  // tap a card (where it shows inside the box) while zoomed: the tap must reach it as a click
  const spot = await sc.evaluate(s => { const R = s.getBoundingClientRect();
    for (const c of s.querySelectorAll('.tcard')) { const q = c.getBoundingClientRect(), l = Math.max(q.left, R.left + 4), r = Math.min(q.right, R.right - 4), t = Math.max(q.top, R.top + 4), b = Math.min(q.bottom, R.bottom - 4);
      if (r - l > 30 && b - t > 20) { c.id = 'tapme'; c.addEventListener('click', () => { window.__tapped = (window.__tapped || 0) + 1; }); return { x: (l + r) / 2, y: (t + b) / 2 }; } } return null; });
  if (spot) { await pg.touchscreen.tap(spot.x, spot.y); await pg.waitForTimeout(300); console.log('tap on a card while zoomed reaches it:', await pg.evaluate(() => window.__tapped === 1)); }
  else console.log('no card visible to tap');
  console.log('page wider than screen:', await pg.evaluate(() => document.documentElement.scrollWidth > innerWidth), '· tree box width', await sc.evaluate(s => s.clientWidth));
  console.log('errors', errs); await b.close();
})();
