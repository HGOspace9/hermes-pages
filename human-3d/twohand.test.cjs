// R8：両手持ち（body3d.js）と点検y・z・aa
const assert=require('node:assert/strict');
const B3=require('./body3d.js'),R7=require('./old/body3d-r7.js'),Rg=require('./rig3d.js');
const S=(m,L=.6)=>({sword:{m,c:L/3,L}}),d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]),TR=B3.TARGET_R,D=180/Math.PI;
let n=0;const ok=(c,msg)=>{assert.ok(c,msg);n++};
const C=[[1,.6,1],[3,.9,1],[3,.6,.6],[3,.9,.6]],f=r=>r.fail?'失敗':r.hit?r.hitV.toFixed(1)+'m/s':'外れ(あと'+(r.gap*100).toFixed(1)+'cm)';
// 片手に戻すと、R7と同じ数値（3つの使い方×ひねり×手首×目標物の点/球）
for(const [m,L,st] of C)for(const mode of ['なし','同時','順番'])for(const twist of [false,'both'])for(const wrist of [false,'hold','snap'])for(const targetR of [undefined,TR]){
 if(mode==='なし'&&twist)continue;const o={mode,mu:.6,twist,wrist,targetR},a=R7.simulateBody(S(m,L),st,o),b=B3.simulateBody(S(m,L),st,{...o,hands:1}),c=B3.simulateBody(S(m,L),st,o);
 const same=(a,b)=>!!a.hit===!!b.hit&&!!a.fail===!!b.fail&&Math.abs(a.hitV-b.hitV)<1e-6&&(a.minDist===null?b.minDist===null:Math.abs(a.minDist-b.minDist)<1e-6);
 ok(same(a,b)&&same(a,c),`片手ならR7と同じ（${m}kg・${L}m・${st*100}%・${mode}・ひねり${twist}・手首${wrist}・${targetR?'球':'点'}）`)}
// 点検aa：決まった言葉以外はエラー
for(const bad of [{wrist:'まっすぐ'},{wrist:true},{twist:'yes'},{mode:'一緒'},{hands:3}])ok((()=>{try{B3.makeBodySwing(S(1),1,bad);return false}catch(e){return /使えない値/.test(e.message)}})(),'打ち間違いはエラーになる：'+JSON.stringify(bad));
// 両手持ち：腕・剣の長さ、左手は柄の上で右手から10cm、左右の肩から届く
for(const [m,L,st] of C)for(const wrist of [false,'hold','snap']){const sw=B3.makeBodySwing(S(m,L),st,{mode:'同時',mu:.6,wrist,hands:2,targetR:TR});let bad=0,far=0;
 for(let i=0;i<5000;i++){sw.step(.0005);const g=sw.g,J=Rg.swing3(g,sw.s);if(!g.reach)far++;
  const onGrip=d3(g.LH,[g.H[0]-g.u[0]*B3.H2.gap,g.H[1]-g.u[1]*B3.H2.gap,g.H[2]-g.u[2]*B3.H2.gap]);
  if(Math.abs(d3(J.rsh,J.relb)-Rg.R.U)>1e-6||Math.abs(d3(J.lsh,J.lelb)-Rg.R.U)>1e-6||Math.abs(d3(J.relb,J.rhand)-Rg.R.F)>1e-6||Math.abs(d3(J.lelb,J.lhand)-Rg.R.F)>1e-6||Math.abs(d3(J.rhand,J.tip)-L)>1e-6||onGrip>1e-6)bad++}
 ok(bad===0,`両手：左右の腕と剣の長さが変わらず、左手は柄の上（${m}kg・手首${wrist}）`);ok(far===0,`両手：左右の肩から柄に届く（${m}kg・手首${wrist}）`)}
// 両手持ちは片手より速いか同じ（同じ条件・手首固定）、振りかぶりで腕が上がる
for(const [m,L,st] of C){const o={mode:'同時',mu:.6,targetR:TR},one=B3.simulateBody(S(m,L),st,o),two=B3.simulateBody(S(m,L),st,{...o,hands:2});
 ok(two.hit&&(!one.hit||two.hitV>=one.hitV),`両手は片手より速いか同じ（${m}kg・${L}m・${st*100}%：${f(one)} → ${f(two)}）`);ok(two.raise.q1>140/D,`両手なら振りかぶりで腕が頭の上まで上がる（${(two.raise.q1*D).toFixed(0)}°）`)}
// 点検z：「まっすぐ保つ」で保てたか。片手・重い剣は負ける、両手は保てる
{const o={mode:'同時',mu:.6,wrist:'hold',targetR:TR};const one=B3.simulateBody(S(3,.9),.6,o),two=B3.simulateBody(S(3,.9),.6,{...o,hands:2});
 ok(one.wristLost&&one.wristDev>20/D,`片手・3kg：手首が負けたと分かる（最大${(one.wristDev*D).toFixed(0)}°）`);ok(!two.wristLost,`両手・3kg：手首を保てる（最大${(two.wristDev*D).toFixed(0)}°）`);
 for(const [m,L,st] of C){const r=B3.simulateBody(S(m,L),st,{...o,hands:2}),r1=B3.simulateBody(S(m,L),st,o);ok(r.hit&&Math.abs(r.wristAtHit)<10/D&&r.wristDev<r1.wristDev,`両手：打つ瞬間の手首は10°以内で、片手より倒れない（${m}kg・${L}m・${st*100}%：打つ瞬間${(r.wristAtHit*D).toFixed(0)}°・途中の最大${(r.wristDev*D).toFixed(0)}° 対 片手${(r1.wristDev*D).toFixed(0)}°）`);console.log(`手首 ${m}kg ${L}m ${st*100}%：両手 最大${(r.wristDev*D).toFixed(0)}°${r.wristLost?'（負けた）':''} ／ 片手 最大${(r1.wristDev*D).toFixed(0)}°${r1.wristLost?'（負けた）':''}`)}}
// 点検y：1cm未満の外れは数値で区別できる（表示は「あと1cm未満」）
{const r=B3.simulateBody(S(3,.6),.6,{mode:'同時',mu:.6,targetR:TR});ok(!r.hit&&r.gap>0&&r.gap<.01,`3kg・0.6m・60%・片手・手首固定は1cm未満の外れ（${(r.gap*1000).toFixed(1)}mm）`)}
// 摩擦が大きいほど良いか同じ（両手）
{const v=[0,.3,.6,1].map(mu=>{const r=B3.simulateBody(S(1),1,{mode:'同時',mu,hands:2,wrist:'snap',twist:'both',targetR:TR});return r.fail?-1:r.hit?r.hitV:0});ok(v.every((x,i)=>i===0||x>=v[i-1]-.05),'両手：摩擦が大きいほど良いか同じ：'+v.map(x=>x.toFixed(1)).join(' → '))}
const rows=[];for(const [m,L,st] of C){const o={mode:'同時',mu:.6,targetR:TR},g=(h,w,tw)=>f(B3.simulateBody(S(m,L),st,{...o,hands:h,wrist:w,twist:tw}));
 rows.push(`${m}kg ${L}m ${st*100}%：片手（手首固定 ${g(1,false,false)}／保つ ${g(1,'hold',false)}）｜両手（手首固定 ${g(2,false,false)}／保つ ${g(2,'hold',false)}／返す ${g(2,'snap',false)}／返す＋ひねり ${g(2,'snap','both')}）`)}
console.log(rows.join('\n'));console.log(`両手持ち ${n}項目 OK`);
