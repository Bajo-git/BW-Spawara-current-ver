"""Turns the sheet parser's output (name pairs) into the app's data (result tables).

usage: python tools/to_matrix.py data/r21-raw.json data/r21.json
Enforces A + A = A. For every table, m[i][j] = position of the part that parts i and j give, or -1 if they don't combine.
"""
import json, sys

def table(t, name):
    parts = t["parts"]
    pos = {p: i for i, p in enumerate(parts)}
    m = [[-1] * len(parts) for _ in parts]
    for k, r in t["pairs"].items():
        a, b = k.split("|")
        if r is None or r not in pos:
            continue
        m[pos[a]][pos[b]] = m[pos[b]][pos[a]] = pos[r]
    # game rule A + A = A; the R21 sheet has one cell that says otherwise (rings: wystepku + wystepku)
    for i, p in enumerate(parts):
        if m[i][i] != i:
            print(f"warning: {name}: {p} + {p} gives {parts[m[i][i]] if m[i][i] >= 0 else 'nothing'} in the sheet; using {p} (A + A = A)", file=sys.stderr)
            m[i][i] = i
    return {"parts": parts, "m": m}

src, dst = sys.argv[1], sys.argv[2]
cats = json.load(open(src, encoding="utf-8"))
out = [{"name": c["name"], "tables": {k: (table(t, f"{c['name']} {k}") if t else t) for k, t in c["tables"].items()}} for c in cats]
json.dump(out, open(dst, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
