const E=require('./trashengine.js'); const C=E.compile(3);
const raw=`przebiegly pierscien wystepku
msciwy bransoleta celnosci
platynowy bransoleta
diamentowy sygnet
platynowy bransoleta sily
Legendaryelastyczny pierscien
Legendarytwardy pierscien
msciwy pierscien
Legendarydiamentowy bransoleta szczescia
archaiczny pierscien urody
miedziany sygnet koncentracji
tytanowy sygnet
Legendarysloneczny pierscien
niedzwiedzi pierscien nietoperza
przebiegly bransoleta twardej skory
twardy sygnet`;
const inv=raw.split('\n').map(l=>{const leg=l.startsWith('Legendary'); const w=l.replace('Legendary','').split(' '); return {p:w[0],b:w[1],s:w.slice(2).join(' '),l:leg};});
for (const i of inv) if (!C.P.includes(i.p)||!C.B.includes(i.b)||(i.s&&!C.S.includes(i.s))) console.log('UNKNOWN',i);
const tt=it=>`${it.l?'[L] ':''}${it.p} (${C.idxP(it)}) ${it.b}${it.s?' '+it.s+' ('+C.idxS(it)+')':''}`;
console.log('inventory by prefix tier:'); [...inv].sort((a,b)=>C.idxP(a)-C.idxP(b)).forEach(i=>console.log('  '+tt(i)));
for (const wb of [false,true]) {
  const {steps,pool}=E.trashPlan(C,inv,'p',wb);
  console.log(`\n== prefix only, bases ${wb?'ON':'OFF'}: ${steps.length} combines, ${inv.length} -> ${pool.length}`);
  steps.forEach((s,i)=>console.log(`  ${i+1}. ${tt(s.a.it)}${s.a.from?' [step '+s.a.from+']':''} + ${tt(s.b.it)}${s.b.from?' [step '+s.b.from+']':''} -> ${tt(s.r.it)}  ${s.kd===1?'BASE':'upgrade'}${s.warn?'  WARN: '+s.warn:''}`));
  console.log('  remaining:', pool.map(x=>tt(x.it)).join(' | '));
}
