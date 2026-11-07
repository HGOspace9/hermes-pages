// R7：手首（body3d.js）と点検v（球の目標物）
const assert=require('node:assert/strict');
const B3=require('./body3d.js'),R6=require('./body3d-r6.js'),Rg=require('./rig3d.js');
const S=(m,L=.6)=>({sword:{m,c:L/3,L}}),d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]),TR=B3.TARGET_R;
let n=0;const ok=(c,msg)=>{assert.ok(c,msg);n++};
const C=[[1,.6,1],[3,.9,1],[3,.6,.6],[3,.9,.6]],f=r=>r.fail?'失敗':r.hit?r.hitV.toFixed(1)+'m/s':'外れ(あと'+(r.gap*100).toFixed(0)+'cm)';
// 手首を固定すると、R6と同じ数値（点の目標物・球の目標物の両方、ひねりあり・なし、3つの使い方）
for(const [m,L,st] of C)for(const mode of ['なし','同時','順番'])for(const twist of [false,'only','both'])for(const targetR of [undefined,TR]){
 if(mode==='なし'&&twist)continue;const o={mode,mu:.6,twist,targetR},a=R6.simulateBody(S(m,L),st,o),b=B3.simulateBody(S(m,L),st,o);
 ok(!!a.hit===!!b.hit&&!!a.fail===!!b.fail&&Math.abs(a.hitV-b.hitV)<1e-6&&(a.minDist===null?b.minDist===null:Math.abs(a.minDist-b.minDist)<1e-6),`手首固定でR6と同じ（${m}kg・${L}m・${st*100}%・${mode}・ひねり${twist}・目標物${targetR?'球':'点'}）`)}
// 点検v：球の目標物（半径10cm）。刃が球に触れたら当たり。外れは「あと何cm」で表す
{const r=B3.simulateBody(S(3,.9),1,{mode:'同時',mu:.6,twist:'both',targetR:TR});ok(r.hit,'3kg・0.9m・全力・ひねり両方は、球の目標物なら当たる（点では8cm外れていた）');
 const far=B3.simulateBody(S(1),1,{mode:'なし',mu:.6,targetR:TR,target:{x:3,y:0}});ok(!far.hit&&far.gap>1,'遠い目標物は外れて、あと何cmかが出る');}
// 手首：可動域の中、手と剣の長さは変わらない
for(const wrist of ['hold','snap'])for(const [m,L,st] of C){const sw=B3.makeBodySwing(S(m,L),st,{mode:'同時',mu:.6,wrist,targetR:TR});let bad=0,mn=0,mx=0,m6=0;
 for(let i=0;i<5000;i++){sw.step(.0005);const J=Rg.swing3(sw.g,sw.s);mn=Math.min(mn,sw.s.q5);mx=Math.max(mx,sw.s.q5);m6=Math.max(m6,Math.abs(sw.s.q6));
  if(Math.abs(d3(J.relb,J.rwr)-(.34-B3.W3.HAND))>1e-6||Math.abs(d3(J.rwr,J.rhand)-B3.W3.HAND)>1e-6||Math.abs(d3(J.rhand,J.tip)-L)>1e-6)bad++}
 ok(mn>=B3.W3.q5min-1e-9&&mx<=B3.W3.q5max+1e-9&&m6<=B3.W3.q6max+1e-9,`手首は動く範囲の中（${wrist}・${m}kg：${(mn*57.3).toFixed(0)}°〜${(mx*57.3).toFixed(0)}°）`);ok(bad===0,`手首を曲げても手と剣の長さは変わらない（${wrist}・${m}kg）`)}
// 手首を返すと剣先が速くなる（1kg・全力、目標物は球）
{const o={mode:'同時',mu:.6,targetR:TR},fx=B3.simulateBody(S(1),1,o),sn=B3.simulateBody(S(1),1,{...o,wrist:'snap'});ok(sn.hit&&sn.hitV>fx.hitV,`手首を返すと速くなる（${fx.hitV.toFixed(1)} → ${sn.hitV.toFixed(1)} m/s）`)}
// 手首の筋肉は弱い：振りかぶりで重い剣を手首だけで支えきれない（倒れて止まる）＝ 1kg より 3kg のほうが大きく倒れる
{const lean=m=>{const sw=B3.makeBodySwing(S(m,.9),1,{mode:'同時',mu:.6,wrist:'hold',targetR:TR});let mn=0;for(let i=0;i<1600;i++){sw.step(.0005);mn=Math.min(mn,sw.s.q5)}return mn};ok(lean(3)<lean(1)-.05,'重い剣ほど手首が倒れる')}
// 摩擦が大きいほど結果が良いか同じ（手首を返す・1kg）
{const v=[0,.3,.6,1].map(mu=>{const r=B3.simulateBody(S(1),1,{mode:'同時',mu,wrist:'snap',twist:'both',targetR:TR});return r.fail?-1:r.hit?r.hitV:0});ok(v.every((x,i)=>i===0||x>=v[i-1]-.05),'摩擦が大きいほど良いか同じ：'+v.map(x=>x.toFixed(1)).join(' → '))}
// 比べる表（球の目標物）
const rows=[];for(const [m,L,st] of C){const o={mode:'同時',mu:.6,targetR:TR};
 rows.push(`${m}kg ${L}m ${st*100}%：手首固定 ${f(B3.simulateBody(S(m,L),st,o))}／保つ ${f(B3.simulateBody(S(m,L),st,{...o,wrist:'hold'}))}／返す ${f(B3.simulateBody(S(m,L),st,{...o,wrist:'snap'}))}／返す＋ひねり ${f(B3.simulateBody(S(m,L),st,{...o,wrist:'snap',twist:'both'}))}　｜ひねり比較（手首固定）腕だけ ${f(B3.simulateBody(S(m,L),st,o))}・ひねりだけ ${f(B3.simulateBody(S(m,L),st,{...o,twist:'only'}))}・両方 ${f(B3.simulateBody(S(m,L),st,{...o,twist:'both'}))}`)}
console.log(rows.join('\n'));console.log(`手首 ${n}項目 OK`);
