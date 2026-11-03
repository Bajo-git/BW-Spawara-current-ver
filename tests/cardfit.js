// Renders worst-case tree cards (longest names per category, legendary, 2-digit tiers) with the
// page's own CSS and reports cards whose text doesn't fit.
const { chromium } = require('playwright');
const fs = require('fs');
const data = JSON.parse(fs.readFileSync(require('path').join(__dirname, '..', 'data', 'r21.json'), 'utf8'));
const H = +(process.argv[3] || 72), W = +(process.argv[4] || 200);
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await pg.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await pg.goto('file://' + require('path').resolve(process.argv[2]));
  const cases = [];
  for (const c of data) {
    const T = c.tables, longest = l => (l || []).slice().sort((a, b) => b.length - a.length).slice(0, 3);
    const Ps = longest(T.prefix && T.prefix.parts), Bs = longest(T.base.parts), Ss = longest(T.suffix && T.suffix.parts);
    for (const p of Ps.length ? Ps : [""]) for (const bb of Bs) for (const s of Ss.length ? Ss : [""]) cases.push({ cat: c.name, p, b: bb, s });
  }
  const res = await pg.evaluate(({ cases, H, W, LBL }) => {
    const host = document.createElement('div'); host.className = 'tree'; host.style.cssText = 'position:relative;width:3000px;height:200px';
    document.body.appendChild(host);
    const out = [];
    for (const c of cases) {
      host.innerHTML = `<div class="tcard leaf missing root" style="left:0;top:0;width:${W}px;height:${H}px"><span class="tlabel">${LBL}</span><span class="item"><span class="leg">Legendarny</span>${c.p ? `<span class="p">${c.p}</span><sup class="tier">19</sup> ` : ''}<span class="b">${c.b}</span><sup class="tier">12</sup>${c.s ? ` <span class="s">${c.s}</span><sup class="tier">19</sup>` : ''}</span></div>`;
      const card = host.firstChild, it = card.querySelector('.item'), lb = card.querySelector('.tlabel');
      const cr = card.getBoundingClientRect(), ir = it.getBoundingClientRect(), lr = lb.getBoundingClientRect();
      out.push({ ...c, over: Math.round(Math.max(ir.bottom - (cr.bottom - 2), cr.top + 2 - lr.top)), lines: Math.round(ir.height / 13) });
    }
    return out;
  }, { cases, H, W, LBL: process.argv[5] || "Krok 12 · wynik" });
  const bad = res.filter(r => r.over > 0);
  console.log(`H=${H} W=${W}: ${res.length} cards, ${bad.length} overflow; worst:`, bad.sort((a, b) => b.over - a.over).slice(0, 5).map(r => `${r.cat}: ${r.p} ${r.b} ${r.s} (+${r.over}px)`));
  await b.close();
})();
