import openpyxl, json, sys, difflib, unicodedata
wb=openpyxl.load_workbook(sys.argv[1],data_only=True)
def norm(s): return ''.join(c for c in unicodedata.normalize('NFD',str(s).strip().lower()) if unicodedata.category(c)!='Mn').replace('ł','l')
out=[]; issues=[]
for ws in wb.worksheets:
    rows=[list(r) for r in ws.iter_rows(values_only=True)]
    blocks=[]; i=0
    while i<len(rows):
        r=rows[i]
        if r[0] and r[1] and isinstance(r[1],str):
            hdr=[str(x).strip() for x in r[1:] if x]
            body=[]; j=i+1
            while j<len(rows) and rows[j][0]: body.append(rows[j]); j+=1
            blocks.append((str(r[0]).strip(),hdr,body)); i=j
        else: i+=1
    cat={'name':ws.title,'tables':{}}
    for bi,(title,hdr,body) in enumerate(blocks):
        t=norm(title)
        kind='suffix' if 'suf' in t else 'prefix' if 'pref' in t else 'base'
        canon={norm(h):h for h in hdr}
        def fix(v,where):
            n=norm(v)
            if n in canon: return canon[n]
            m=difflib.get_close_matches(n,canon.keys(),1,0.75)
            if m: issues.append(f'{ws.title}/{kind}: "{v}" read as "{canon[m[0]]}" ({where})'); return canon[m[0]]
            issues.append(f'{ws.title}/{kind}: UNKNOWN "{v}" ({where})'); return None
        res={}
        for ri,row in enumerate(body):
            a=fix(row[0],'row label')
            if a!=hdr[ri]: issues.append(f'{ws.title}/{kind}: row {ri+1} label {row[0]} != column {hdr[ri]}')
            for ci,b in enumerate(hdr):
                v=row[1+ci]
                if v is None: issues.append(f'{ws.title}/{kind}: empty cell {a}+{b}'); continue
                res[(a,b)]=fix(v,f'{a} + {b}')
        pairs={}
        for x in hdr:
            for y in hdr:
                k=tuple(sorted((x,y)))
                v1,v2=res.get((x,y)),res.get((y,x))
                if x==y and v1!=x: issues.append(f'{ws.title}/{kind}: {x}+{x} gives {v1}, not {x}')
                if x<y and v1!=v2: issues.append(f'{ws.title}/{kind}: asymmetric {x}+{y}: {v1} vs {v2}')
                if x<=y: pairs['|'.join(k)]=v1 or v2
        from collections import Counter
        cnt={h:Counter() for h in hdr}
        for row in body:
            for v in [row[0]]+list(row[1:1+len(hdr)]):
                if v is None: continue
                n=norm(v); m=canon.get(n) or (difflib.get_close_matches(n,canon.keys(),1,0.75) or [None])[0]
                if m in canon: m=canon[m]
                if m in cnt: cnt[m][str(v).strip().lower()]+=1
        for h in hdr: cnt[h][h.lower()]+=1
        ren={h:cnt[h].most_common(1)[0][0] for h in hdr}
        pairs={'|'.join(sorted((ren[a],ren[b]) for _ in [0] for a,b in [k.split('|')])) if False else '|'.join(sorted([ren[x] for x in k.split('|')])):ren[v] for k,v in pairs.items() if v}
        cat['tables'][kind]={'parts':[ren[h] for h in hdr],'pairs':pairs}
    out.append(cat)
json.dump(out,open(sys.argv[2],'w',encoding='utf-8'),ensure_ascii=False)  # usage: python tools/parse_sheet.py sheet.xlsx data/NAME-raw.json
print('\n'.join(issues)); print(len(issues),'issues')
