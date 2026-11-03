"""Builds index.html (the whole app in one file) from the page template, the app script and the sheet data.

usage:  python build.py                 # data/r21.json -> index.html
        python build.py --debug         # index-debug.html: also exposes engine internals as window.__d (tests/scenarios/topdown-engine.js)
        python build.py data/other.json # another sheet
"""
import os, sys
root = os.path.dirname(os.path.abspath(__file__))
args = [a for a in sys.argv[1:] if not a.startswith('--')]
debug = '--debug' in sys.argv
data = open(args[0] if args else os.path.join(root, 'data', 'r21.json'), encoding='utf-8').read()
app = open(os.path.join(root, 'src', 'app.js'), encoding='utf-8').read().replace('/*DATA*/', data)
if debug:
    anchor = '  renderAll();\n  setView(store.view || "find");\n})();'
    assert app.count(anchor) == 1, 'debug anchor not found in src/app.js'
    app = app.replace(anchor, '  window.__d = { compile, findRoutes, targetSets, key, store };\n' + anchor)
page = open(os.path.join(root, 'src', 'template.html'), encoding='utf-8').read().replace('/*APP*/', app)
out = os.path.join(root, 'index-debug.html' if debug else 'index.html')
open(out, 'w', encoding='utf-8').write(page)
print('built', os.path.relpath(out, root), len(page.encode('utf-8')), 'bytes')
