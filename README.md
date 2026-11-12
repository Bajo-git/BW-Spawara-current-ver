# Warsztat Anżeja (BW Spawara), current version

A Bloodwars item-crafting planner: it plans routes from the items you own (and items on the auction) to a
target item, using the combination tables from the game's sheet. The UI is in Polish.

## Open the app

**`index.html` is the whole app in one file.** Download it (on GitHub: open the file, then the download
button) and open it in any browser, on a computer or a phone. No install, no server, no internet needed
after it has loaded. Your inventory, plans and settings are saved in that browser.

The same version is also published as the Claude artifact "Warsztat Anżeja". Saved data does not move
between the two (each browser and each address keeps its own).

- **Rules:** the "Warsztat Anżeja rulebook" doc describes every rule the engine follows, with examples.
- **Plans and decisions:** `BACKLOG.md`.
- **Older versions and unused art:** the archive repo Bajo-git/BW-Spawara.
- **Experiments:** `research/` (each folder has a RESULTS.md).

## Layout

| Path | What it is |
| --- | --- |
| `src/app.js` | The whole app: engines, UI, storage. `/*DATA*/` is replaced by the sheet data at build time |
| `src/template.html` | Page markup and styles. `/*APP*/` is replaced by the app script |
| `data/r21.json` | Sheet data the app uses (R21): per category, part names and result tables |
| `data/r21-raw.json` | The same sheet as the parser reads it (name pairs) |
| `tools/parse_sheet.py` | Reads the sheet `.xlsx` into the raw form |
| `tools/to_matrix.py` | Turns the raw form into the app's tables; enforces A + A = A and warns where the sheet disagrees |
| `index.html` | The built app (what gets published). Rebuilt by `build.py`, never edited by hand |
| `build.py` | Builds `index.html` (and `--debug`: `index-debug.html`) |
| `tests/` | Regression suite, scenario tests, layout and speed checks (see below) |

## Build

```
python build.py                      # data/r21.json -> index.html
python build.py --debug              # also index-debug.html with window.__d for engine tests
```

A new sheet (another server or season):

```
python tools/parse_sheet.py sheet.xlsx data/NAME-raw.json
python tools/to_matrix.py data/NAME-raw.json data/NAME.json
python build.py data/NAME.json
```

## Test

Needs Node and Playwright with Chromium (`npm i playwright && npx playwright install chromium`).
Run from the repo root; page paths are relative.

| Command | Checks |
| --- | --- |
| `node tests/regress.js index.html out.txt` | 92 checks: every route mode on fixed inventories, highest craft, trash upgrade, paste, plans, auction, all category tabs. Compare `out.txt` with `tests/baseline/regress.txt`; timings are stripped, tier numbers hidden |
| `node tests/scenarios/katana-loop.js index.html` | Manual plan: tries every option on missing slots; the target must never appear below the top (expect `bad 0`) |
| `node tests/scenarios/no-better-items.js index.html` | Items above the target's tier are not used |
| `node tests/scenarios/manual-cap.js index.html` | Manual options never offer an item above the target's tier |
| `node tests/scenarios/cheap-mode.js index.html` | Najtańsza: depth setting, ladder, higher options |
| `node tests/scenarios/topdown-engine.js index-debug.html` | Top-down engine at depths 3, 5 and 8 |
| `node tests/scenarios/open-affix.js index.html` | Fixed and "dowolny" suffix give the same route; the full route with better items is offered, never consuming an item already better than the target |
| `node tests/scenarios/cheap-strict.js index.html` | Najtańsza and its manual-plan 3-level search: every combine's ingredients strictly lower than its result (expect `0`) |
| `node tests/scenarios/manual-cheap-deep.js index.html` | Manual plan with Najtańsza builds trees from your items 3 levels deep |
| `node tests/scenarios/progress-ticks.js index.html` | Step ticks, progress, plans keep their ticks |
| `node tests/worker.js index.html` | Search runs in the background worker, shows phases, Anuluj stops it, the manual plan's first fill too |
| `node tests/invtools.js index.html` | Inventory search box and sort orders |
| `node tests/whynot.js index.html` | "Dlaczego nie?" list under route results, in three modes |
| `node tests/twomissing.js index.html` | Manual plan "Dwa brakujące": first pairs balanced and low |
| `node tests/sheet.js index.html outdir` | Arkusze: miniatures for every category, the pop-up table (names in cells, same-result highlight, Esc, outside click), the phone button; screenshots |
| `node tests/treetouch.js index.html [outdir]` | Phone tree: pinch zooms around the fingers, one-finger swipe scrolls, a tap while zoomed reaches the card, the page never gets wider than the screen |
| `node tests/trashopts.js index.html` | Przeróbka złomu: default, Tylko duże ulepszenia, w stronę prefiksu / sufiksu; every step obeys its rule (expect `0`) |
| `node tests/planlabels.js index.html` | Three saved plans; each reserved item's "W planie N" names the plan that holds it |
| `node tests/manhand.js index.html [outdir]` | Ręczny plan "Zrób ręcznie" workbench: empty start, drops onto a card, onto a result and onto a lower card, refusal of items that don't combine, Cofnij, Usuń zaznaczony, the list for phones |
| `node tests/mobile.js index.html outdir` | Phone layout at 390×844 with touch: screenshots of every screen, checks for sideways scrolling |
| `node tests/cardfit.js index.html 80 200` | Longest names with tiers fit in tree cards (expect `0 overflow`) |
| `node tests/filtcheck.js index.html` | Manual-plan filter matches names across tier numbers |
| `node tests/cssdiff.js PAGE outdir` | Screenshots of 12 screens, to compare two builds pixel by pixel |
| `node tests/bench.js OLD.html NEW.html` | Search and highest-craft timings, old vs new |
| `node tests/optfast.js index.html 300 999` | Random inventories: wherever Najszybsza has a complete route, Optymalna must show one or offer it in the box (expect `NOT full and not offered in 0`) |
| `node tests/fastbench.js OLD.html NEW.html 80` | Najszybsza against the proven shortest route on random 14-item inventories (`SIZE=24` for bigger ones, compared with each other) |
| `node --max-old-space-size=6000 tests/depthbench.js OLD.html NEW.html 40 fast` | Fewest missing items found by two builds on 40 random 20-item inventories (runs the engine directly) |

Some scenario scripts were written for earlier versions and stop part-way with today's defaults
(`progress-ticks.js` expects a 3-step route); compare their output between versions rather than
expecting a clean exit.
