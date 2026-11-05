# Top-down search experiments (November 2026)

These experiments were not applied to the app as they stand. Version 42 took one idea from them:
the manual plan looks into missing items 3 levels deep under Najtańsza (see the end of this file).
Run every script from this folder as `node SCRIPT ../../index.html ...`. Outputs are in `output/`.

## 1. Exhaustive top-down search with the strict rule

**Script:** `exhaust.js` (`node --stack-size=500000 exhaust.js ../../index.html SECONDS [FIRST_CASE]`).

**How it searches.** It works down from the target with no depth limit. Each node can be:
- one of your items (each copy used once),
- a missing item,
- or a pair of ingredients whose prefix **and** suffix are strictly lower than the node's.

It is a depth-first branch and bound. The best plan has the fewest missing items, then the fewest
steps. The deep trees need a large stack, so run with `ulimit -s unlimited`.

**Results on the fixed inventories** (fully checked unless marked):

| Target | Today: Optymalna / głęboka / Najtańsza | Exhaustive strict | Time | Nodes |
| --- | --- | --- | --- | --- |
| krwawy bandana adrenaliny | 2 / 2 / 2 missing | 2 missing (buy both halves) | 0.09 s | 0.35 M |
| tygrysi opaska prekognicji | 1 / 1 / 2 | 2 | 0.25 s | 1.3 M |
| runiczny korona magii | 2 / 2 / 2 | 2 | 1.9 s | 9 M |
| szturmowy kapelusz krwi | 1 / 1 / 1 | 1 | 0.05 s | 42 k |
| tygrysie kilt unikow | 1 / 1 / 2 | 2 | 0.001 s | 1 k |
| demoniczny katana drakuli | 2 / 2 / 2 | 2 | 2.5 s | 14 M |
| zabojczy korbacz krwi | 1 / 1 / 2 | 2 | 0.34 s | 2 M |

On these inventories the strict rule found nothing better than today's modes. Optymalna is often
one missing item better, because it uses an ingredient that is equal to the target on one affix.

## 2. The same search, missing items weighted by tier

**Script:** `exhaust-tier.js` (5th argument `tier`).

A missing item costs `prefix tier + suffix tier + 1`, so missing items should be low tier. This was
much slower:
- runiczny korona: 6.4 min and 1.9 billion nodes;
- demoniczny katana: not finished in 30 min, after 7 billion nodes.

It also rewards absurd trees: it split the katana into 1,287 cheap missing items. Weighting by tier
needs a cap on the number of missing items.

## 3. Rings: miedziany pierscien urody + srebrny pierscien wystepku → czarny pierscien latwosci

**Script:** `ringmin.js`.

From only these two rings it takes at least **319,408 rings (122,990 + 196,418)**, in a tree
26 combines deep. Because A + A = A, each step must pair the two previous rungs of a ladder, so the
counts are Fibonacci numbers.

**With the strict rule this target is impossible from these two rings** (`ringmin-strict.js`).
After the first step every useful combine keeps one affix equal to an ingredient's.

**What the app's engine does with exactly these 319,408 rings** (`ringapp.js`, output `ringapp-full.txt`):
- Najtańsza returns "2 missing" in 0.05 s.
- Optymalna returns no route after 4 s.
- Głęboka returns no route after 8.5 s.

On smaller rungs of the same ladder, Optymalna finds full routes up to 22 rings (6 levels) and fails
at 57 rings (8 levels).

## 4. Rings without loops (strict rule), lowest possible start

**Script:** `ringstrict.js`.

Every loop-free step raises both affixes by one: (p, s) + (p−1, s−1) → (p+1, s+1). So the lowest
start for czarny pierscien latwosci is **tier 10: 6,765 rings = 4,181 × elastyczny pierscien urody
+ 2,584 × kardynalski pierscien wystepku**, in a tree 18 levels deep. Higher starts need fewer rings
(Fibonacci again); see `output/ringstrict.txt`.

**The app's engines on exactly those rings** (`ringapp2.js`):

| Start tier | Rings | Levels | Optymalna / głęboka | Najtańsza (depth 8) | Exhaustive strict (`exhaust-ring.js`) |
| --- | --- | --- | --- | --- | --- |
| 22 | 21 | 6 | full route, 2–4 s | full route | full route, 25 ms |
| 21 | 34 | 7 | 1 missing | full route | — |
| 20 | 55 | 8 | no route | full route, 0.02 s | full route, 4 ms |
| 18 | 144 | 10 | no route | 2 missing (depth limit) | full route, 2 ms |
| 15 | 610 | 13 | no route | 2 missing | full route, 1 ms |
| 10 | 6,765 | 18 | no route | 2 missing | full route, 6 ms |

The exhaustive search found each full route in milliseconds. It ran on to its 5-minute cap only
because it did not stop at a plan that cannot be beaten (0 missing, leaves − 1 steps). Stopping
there would end it at once.

## Conclusions

- A loop-free top-down search solves deep ladders that today's modes cannot.
- On mixed real inventories it is usually one missing item worse than Optymalna, and its time ranges
  from milliseconds to over 30 minutes.
- Best use: an extra option, or lifting Najtańsza's depth cap with a time limit. It should not be
  the default.
- Najtańsza already enforces the strict rule: every ingredient is lower than what it makes on both
  affixes, never equal (checked in `tests/scenarios/cheap-strict.js`).

## Applied in v42: manual plan, Najtańsza, 3 levels deep

When the plain Najtańsza fill uses none of your items, every missing item is looked into 3 levels
deep. Every pair that could make it is searched under the strict rule. A pair whose branch holds at
least one of your items replaces the missing item; the one needing the fewest missing items wins.
Branches where nothing of yours turns up stay one missing item. If no branch holds any of your
items, the slot shows no route, as before.

Results (`output/cheap-strict-v42.txt`):

| Target | Before | After |
| --- | --- | --- |
| krwawy bandana | no route | 1 yours + 5 missing (lower tiers) |
| tygrysi opaska | no route | 1 yours + 5 missing |
| demoniczny katana | no route | 2 yours + 7 missing |
| zabojczy korbacz | no route | 1 yours + 3 missing |
| runiczny korona | no route | no route (nothing of yours within 3 levels) |
| szturmowy kapelusz, tygrysie kilt | unchanged | unchanged (they already used your items) |
