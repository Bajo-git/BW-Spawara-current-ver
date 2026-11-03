# Working on Warsztat Anżeja

- Edit `src/app.js` and `src/template.html`, then `python build.py` (writes `index.html`). Never edit `index.html` by hand.
- The UI text is Polish; keep it Polish. Item names in data are ASCII (zlosliwy, not złośliwy).
- Rules live in the "Warsztat Anżeja rulebook" doc; change the rulebook and the code together.
- Before any change that could touch routes, run `node tests/regress.js index.html out.txt`
  and compare with `tests/baseline/regress.txt`. Only intended differences may remain; update the
  baseline in the same commit when they are intended.
- Old versions and unused assets live in the archive repo Bajo-git/BW-Spawara; this repo holds only the current version.
- Plans and decisions: `BACKLOG.md`.
