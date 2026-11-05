# Warsztat Anżeja backlog (queued for the next version)

- Optymalna "ugly loop" (user report, open, no fix chosen yet): the search finds a lower item that
  could make an ingredient, but its partner needs an affix equal to the target's tier, which makes
  the step pointless. Ideas to test: in manual-plan fills, cap missing partners strictly below the
  target's tiers (today: at most equal); or prefer Najtańsza's strict rule for sub-fills.
- Top-down exhaustive search (research/2026-11-top-down): an extra mode for deep ladders, or lifting
  Najtańsza's depth cap with a time limit; it must stop at an unbeatable plan (0 missing).

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
