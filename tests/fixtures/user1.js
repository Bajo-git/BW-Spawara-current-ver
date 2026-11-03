const E=require('./engine.js'); const C=E.compile(0);
const raw=`utwardzony kominiarka wieszcza
wzmocniony helm ochrony
utwardzony czapka zmyslow
rogaty opaska wytrzymalosci
krwawy obrecz ochrony
leniwy bandana pasterza
kuloodporny helm wieszcza
tygrysi czapka gladiatora
ozdobny kask ochrony
runiczny kask przezornosci
wzmocniony obrecz wytrzymalosci`;
const inv=raw.split('\n').map(l=>{const w=l.split(' ');return {p:w[0],b:w[1],s:w.slice(2).join(' '),l:true};});
const T=E.targetSets(C,{p:'krwawy',b:'bandana',s:'adrenaliny',l:'*'});
const R=E.search(C,T,inv,{mode:'cheap',maxW:4,limit:12,wildLimit:9,timeMs:20000});
const tierTxt=it=>`p${C.idxP(it)} b${C.B.indexOf(it.b)+1} s${C.idxS(it)}`;
const rs=R.cands.map(c=>{const r=E.concretizeRaw(C,E.rawFromMemo(R,c.sk,c.k),R.T);const ms=[];const os=[];
 (function w(t){if(t.kids)t.kids.forEach(w);else if(t.wild)ms.push(t.it);else os.push(t.it);})(r.tree);
 return {r,ms,os};});
console.log('candidates',rs.length,'missing',R.cands[0]&&R.cands[0].W);
rs.sort((a,b)=>a.r.cost-b.r.cost);
for (const x of rs.slice(0,8)) console.log('cost',x.r.cost,'missCost',x.r.missCost,'steps',x.r.steps,'| owned:',x.os.map(i=>`${i.p} ${i.b} ${i.s}`).join(' + '),'| MISSING:',x.ms.map(i=>`${i.p} ${i.b} ${i.s} [${tierTxt(i)} score ${C.score(i)}]`).join(', '));
console.log('--- sorted by missing item score first');
rs.sort((a,b)=>a.r.missCost-b.r.missCost||a.r.cost-b.r.cost);
for (const x of rs.slice(0,8)) console.log('missCost',x.r.missCost,'cost',x.r.cost,'steps',x.r.steps,'| owned:',x.os.map(i=>`${i.p} ${i.b} ${i.s}`).join(' + '),'| MISSING:',x.ms.map(i=>`${i.p} ${i.b} ${i.s} [${tierTxt(i)}]`).join(', '));
console.log('target tiers', tierTxt({p:'krwawy',b:'bandana',s:'adrenaliny'}));
for (const i of inv) console.log(' ', `${i.p} ${i.b} ${i.s}`, tierTxt(i), 'score', C.score(i));
console.log('--- weighted: owned + w * missing');
for (const w of [1,2,3,5]) {
  rs.sort((a,b)=>(a.r.cost-a.r.missCost+w*a.r.missCost)-(b.r.cost-b.r.missCost+w*b.r.missCost)||a.r.steps-b.r.steps);
  const x=rs[0];
  console.log('w='+w,'steps',x.r.steps,'| owned:',x.os.map(i=>`${i.p} ${i.b} ${i.s}`).join(' + '),'| MISSING:',x.ms.map(i=>`${i.p} ${i.b} ${i.s} [${tierTxt(i)}]`).join(', '));
}
console.log('--- trade-off: missing item affix tiers vs owned items used (non-dominated options)');
const opts=rs.map(x=>{const m=x.ms[0];return {pt:C.idxP(m),st:C.idxS(m),aff:C.idxP(m)+C.idxS(m),used:x.os.length,steps:x.r.steps,x};});
const front=opts.filter(o=>!opts.some(q=>(q.aff<=o.aff&&q.used<=o.used)&&(q.aff<o.aff||q.used<o.used)));
const seen=new Set();
front.sort((a,b)=>a.used-b.used).forEach(o=>{const k=o.aff+'/'+o.used;if(seen.has(k))return;seen.add(k);const m=o.x.ms[0];console.log(`use ${o.used} owned (${o.steps} combines) -> buy prefix tier ${o.pt}, suffix tier ${o.st}: ${m.p} ${m.b} ${m.s} | owned: ${o.x.os.map(i=>i.p+' '+i.b+' '+i.s).join(' + ')}`);});
