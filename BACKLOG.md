# Warsztat Anżeja backlog (queued for the next version)

- Optymalna "ugly loop" (user report, open, no fix chosen yet): the search finds a lower item that
  could make an ingredient, but its partner needs an affix equal to the target's tier, which makes
  the step pointless. Ideas to test: in manual-plan fills, cap missing partners strictly below the
  target's tiers (today: at most equal); or prefer Najtańsza's strict rule for sub-fills.
- Top-down exhaustive search (research/2026-11-top-down): an extra mode for deep ladders, or lifting
  Najtańsza's depth cap with a time limit; it must stop at an unbeatable plan (0 missing).

## Shipped in version 54 (2026-11-12)
- Fix: Optymalna missed complete routes that Najszybsza found (user report). Random search:
  23 of 146 such cases, all from "Nie zużywaj lepszych niż cel". Its second pass never uses an item
  "at least as good as the target", and that check compared prefix and suffix only, ignoring the
  base and rarity, so a higher-prefix miecz dwuręczny counted as "a better kąsająca kosa". Now the
  item must also have a base the target allows and the target's rarity: 13 of the 23 now get the
  complete route. The other 10 consume a real better version of the target (e.g. kompozytowa
  spódnica tropiciela for kompozytowa spódnica handlarza bronią); Optymalna now offers that complete
  route in the box above the result (never chosen) and says Najszybsza will use it.
- Engine limits (exact search 12 items for Najszybsza vs 10 for Optymalna) caused none of them.

## Shipped in version 53 (2026-11-10)
- "Zrób ręcznie" reworked into a bottom-up workbench (user feedback: no target card at the start).
  Empty bench; first dropped item becomes a card; an item dropped on any card combines with it and
  the result appears above; results and lower cards take further drops. Non-combining drops are
  refused. List + Połącz for phones, Cofnij, Usuń zaznaczony, Wyczyść stół, Zapisz jako plan; the
  header compares the result with the target. Dropping onto cards of a "Zbuduj plan" tree keeps the
  v52 behaviour. tests/manhand.js rewritten for the workbench.

## Shipped in version 52 (2026-11-10)
- Ręczny plan: "Zrób ręcznie" next to "Zbuduj plan" starts an empty builder. Drag and drop
  (computer) from Ekwipunek / Aukcja onto tree cards: a fitting item fills the card; an item that
  can make it becomes item + missing partner (partner selected for the next drop); otherwise it is
  placed and marked red, or refused on the target with a message. Every card's panel has
  "Złóż z dwóch przedmiotów": two selects, live preview of the result and whether it fits, Połącz.
  tests/manhand.js.
- Idea: on a computer the inventory sits above the tree in Ręczny plan, so long drags scroll the
  page; a side-by-side layout for this view would make dragging easier.

## Shipped in version 51 (2026-11-09)
- Najszybsza takes the shortest route outright: "Nie zużywaj lepszych niż cel" no longer applies to
  it (Ustawienia says so). Only between routes with the same number of combines: cheapest items
  (lowest route cost), then fewest auction items. The v50 "krótsza ścieżka" box is gone.
  fastbench with the setting on: 60/60 proven shortest (v50: 37, 18 longer); tie check: cheaper
  items in 8 of 50 equal-length cases, dearer in none.

## Shipped in version 50 (2026-11-09)
- Najszybsza always ranks by fewest combines first (auction purchases are not combines), then
  fewest auction items, then cost; the forward-backward engine stops as soon as its shortest route
  is provably shortest. tests/fastbench.js: 80/80 proven shortest on 14-item inventories (was 79,
  ~3x faster); on 24-item inventories the old build was longer in 11 of 50 cases, the new never.
- With "Nie zużywaj lepszych niż cel" on, Najszybsza offers a shorter complete route that needs
  your better items ("Jest krótsza ścieżka: 2 połączenia zamiast 6…"), never chooses it.

## Shipped in version 49 (2026-11-09)
- Plans colour-coded: six colours by plan number, shared by the number badge in Plany and the
  "W planie N" labels in the inventory and auction list (several plans: each number in its colour).
- Faster inventory edits: list rows outside the scroll box skip layout (content-visibility);
  "+" / lock on a 300-row inventory 51 → 24 ms in the page. Regression harness forces rows visible
  when reading text.
- A refused save (storage full, private mode) shows a one-time warning instead of failing silently.
- Review: no unused functions, ids or styles left (one stray id removed).

## Review suggestions (2026-11-09, not started)
- Export / import of all data to a file (backup; moving between the artifact and the downloaded app).
- Plans that recover partly when only some of their items come back.
- Optymalna "ugly loop" (above).
- Inventory: update only the changed row on + / lock, and one delegated click handler per list,
  for inventories of 1,000+ rows.
- Exhaustive top-down search as an option for deep ladders (research/2026-11-top-down).
- One `npm test` for the fast checks; make the regression harness wait for each result (its
  occasional garbled FIND line is a stale read).
- Split src/app.js (2,300 lines) into engine and UI files joined by build.py; engine tests in
  Node without a browser.

## Shipped in version 48 (2026-11-08)
- Fixed: the inventory and auction pill "W planie N" showed the number of reserved copies, so any
  single reserved item read "W planie 1". It now names the plan(s) holding the item ("W planie 3",
  "W planach 1, 3"), with each plan's target on hover; Plany numbers its plans to match.
- Przeróbka złomu, Ustawienia (Oba afiksy mode): "Tylko duże ulepszenia" (both affixes rise) and
  "Kierunek ulepszeń" (dowolny / w stronę prefiksu / w stronę sufiksu: every combine raises that
  affix, the other stays at least as good as in the better input). Either one turns base-only
  upgrades off. Steps say "ulepszenie prefiksu/sufiksu". tests/trashopts.js, tests/planlabels.js.

## Shipped in version 47 (2026-11-06)
- Tree on phones: the tree box no longer stretches with a zoomed tree (grid child min-width), so
  zoomed trees scroll inside a phone-wide box; one finger scrolls natively (momentum, taps stay
  taps); two fingers pinch-zoom around the fingers (drawn once per frame); + / − zoom around the
  view centre, Ctrl + wheel around the cursor. Mouse drag on desktop unchanged.
  tests/treetouch.js checks pinch, swipe, tap while zoomed and page width.

## Shipped in version 46 (2026-11-06)
- "Lepsze niż cel: tylko w ostateczności": when the route without better items has missing items
  but the route with them is complete, the complete route is now the result (the other is offered
  with "Pokaż ścieżkę bez nich"). If the route with better items would still miss items, the route
  without them stays the result, as before. Applies to route search and the manual plan's first fill.

## Shipped in version 45 (2026-11-05)
- Arkusze moved from the sidebar to the free space under the view panel (desktop); phones get one
  small "Pokaż arkusze" button right under the view's main button (Więcej entry removed).
- Table cells show the result's full name (no numbers); same part twice (A + A) is darker; clicking
  a cell highlights every cell with the same result (others fade), clicking it again clears.

## Shipped in version 44 (2026-11-05)
- Arkusz cheat sheet: the chosen category's combine tables (Bazy, Prefiksy, Sufiksy) as colour-coded
  miniatures in the sidebar under Ustawienia; a click opens the full table in a pop-up over the
  page (tabs between tables, Esc / × / click outside closes). Cells show the result's tier on a
  per-table colour ramp; bold = beats both inputs, faded = below the better input, dashed = same
  part twice; clicking a cell spells out "wiersz + kolumna = wynik". Drawn from the app's own data,
  so it always matches the engine. Phones: Więcej → Arkusz (tabele), full screen.

## Shipped in version 43 (2026-11-05)
- Przeróbka złomu: a Podsumowanie box under the steps lists every item of yours that goes in and
  every final product (results not used by a later step), identical items counted together (×n).
  Regression baseline updated for the trash checks (text after the steps).

## Shipped in version 42 (2026-11-05)
- Manual plan with Najtańsza: when the plain fill uses none of your items, missing items are
  looked into 3 levels deep under the strict rule. The pair whose branch holds your items and
  needs the fewest missing items replaces the missing one; branches without your items stay one
  missing item; no route only if nothing of yours turns up.
- Najtańsza search memo key fixed (depth 8 could mix the target up with a lower item).
- Experiments saved in research/2026-11-top-down (exhaustive top-down search, ring ladders).

## Shipped in version 38 (2026-11-02)
- Tier index everywhere: every prefix, base and suffix shows its tier number in small print in every
  view (inventory, auction list, route tree and steps, shopping list, plans, highest craft, trash
  upgrade, manual plan, paste preview, Optymalna ladder, "Szukaj:" hints, used-item chips).
- Tree cards 80 px tall (was 72) so three-line names with tiers fit; auction cards show what you pay.

## Shipped in version 41 (2026-11-03)
- Bug (user report, tygrysie kilt uników): with an open prefix/suffix ("dowolny") the "Nie zużywaj
  lepszych niż cel" check didn't apply, so a route consumed better-suffix items, while naming the
  same result kept them out. Now an open affix is judged against what the route makes (search
  repeated with it fixed): both give the same route.
- When keeping better items out costs missing items, the route with them is offered ("Pokaż
  ścieżkę z nimi"), listing which better items it consumes; it never consumes an item already as
  good as the target in every named affix.

## Shipped in version 40 (2026-11-02)
- Phone layout (≤700 px): bottom bar Szukaj / Ręczny / Ekwipunek / Plany / Więcej (Najlepszy
  możliwy, Przeróbka złomu, Lista zakupów, Ustawienia); Ekwipunek with the paste bar is its own
  screen; pill categories; 44 px controls; route tree folds (Drzewo łączenia), Zapisz jako plan
  stays above the bar. Desktop unchanged apart from the tree heading now folding.
- Ustawienia has a "← Wróć" button back to the view you came from (user report: no way back).

## Shipped in version 39 (2026-11-02)
- P3 search in a background worker: status box with phase, time, bar (deep: up to 15 s) and Anuluj;
  manual plan's first fill too; falls back to the page if the browser refuses workers.
- P6 Ustawienia view with every switch explained; one-line summaries with "Zmień" in the views.
- P7 inventory search box and Sortuj (sum of affix tiers, prefix, suffix, base, base A–Z).
- P4 "Dlaczego nie?" under route results.
- Manual plan "Dwa brakujące": pairs ranked by the higher tier of the two, then the sum (user report:
  one very low + one very high half). Fixed a loop it exposed: the item a chosen pair makes is now
  banned from its own halves, not only the slot's placeholder item.
- P8 investigated, not shipped: on 40 random 20-item inventories, 12 harder ones and the user's
  helmets and two-handed weapons, normal search already finds as few missing items as deep mode.
  Two extensions were tried (missing item at the bottom of long chains; joins of big groups holding
  missing items): no case improved, and they would add seconds before "no route". Revisit with a
  concrete case where Ręczny plan beats the search (tests/depthbench.js measures).

## Decisions on the v38 proposals (2026-11-02)
- P1 GitHub repo: user creates it once GitHub sign-up works again; then push source + tests first.
- P2 Eksport / Import: skip for now; at the desktop-app stage make the save file the same JSON so the
  web data can be moved over.
- P3 search in a Web Worker + progress + Anuluj: TO DO (plan: engine as a self-contained factory,
  run in a blob worker for Szukaj ścieżki and the manual plan's root fill, main-thread fallback).
- P4 "Dlaczego nie?": TO DO, also as a debugging aid for test builds.
- P5 Cofnij: later.
- P6 Ustawienia panel: TO DO, aim = clearer UI.
- P7 inventory search + sort by tier: TO DO.
- P8 best-first deep search: TO DO.
- P9 reframed: support several sheets (at least 3 more servers), user picks the server; later.
- P10 several targets: mostly covered by plans; only joint allocation is missing; not scheduled.
