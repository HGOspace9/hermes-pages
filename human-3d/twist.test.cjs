// R6：体のひねり（body3d.js）
const assert=require('node:assert/strict');
const Bd=require('../human-motion/body.js'),B3=require('./body3d.js'),Rg=require('./rig3d.js');
const S=(m,L=.6)=>({sword:{m,c:L/3,L}}),d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
let n=0;const ok=(c,msg)=>{assert.ok(c,msg);n++};
const C=[[1,.6,1],[3,.9,1],[3,.6,.6],[3,.9,.6]];
// 点検s：ひねりを0に固定すると、平面版と同じ数値（床の左右・回す力の判定を入れても同じ）
for(const [m,L,st] of C)for(const mode of ['なし','同時','順番'])for(const yaw of [false,true]){
 const a=Bd.simulateBody(S(m,L),st,{mode,mu:.6}),b=B3.simulateBody(S(m,L),st,{mode,mu:.6,yaw});
 ok(!!a.hit===!!b.hit&&!!a.fail===!!b.fail,`ひねり0で当たり・外れ・失敗が平面と同じ（${m}kg・${L}m・${st*100}%・${mode}・床判定${yaw}）`);
 if(a.hit)ok(Math.abs(a.hitV-b.hitV)<.05,`ひねり0で速さが平面と同じ（${a.hitV.toFixed(2)} 対 ${b.hitV.toFixed(2)}）`);
 if(!a.hit&&!a.fail)ok(Math.abs(a.minDist-b.minDist)<.01,'ひねり0で外れの距離も同じ')}
// 目安 13.6
ok(Math.abs(B3.simulateBody(S(1),1,{mode:'同時',mu:.6}).hitV-13.6)<.05,'目安 13.6 m/s（ひねり固定）');
// ひねりの効果：ひねりだけでも剣先が動く。両方は打ち込み中の剣先の最高の速さが腕だけ以上（1kg・全力）
{const arm=B3.simulateBody(S(1),1,{mode:'同時',mu:.6}),only=B3.simulateBody(S(1),1,{mode:'同時',mu:.6,twist:'only'}),both=B3.simulateBody(S(1),1,{mode:'同時',mu:.6,twist:'both'});
 ok(only.maxV>3&&only.maxW4>2,`ひねりだけでも剣先が速く動く（${only.maxV.toFixed(1)} m/s）`);ok(both.hit&&both.hitV>=arm.hitV-.05,`両方で打てて、腕だけより遅くない（${both.hitV.toFixed(2)} 対 ${arm.hitV.toFixed(2)}）`)}
// 床：ひねりは足と床の摩擦で支える。摩擦の使用は上限を超えない（滑ったら失敗）。摩擦0ではひねれない
for(const [m,L,st] of C)for(const tw of ['only','both'])for(const mu of [.3,.6,1]){const r=B3.simulateBody(S(m,L),st,{mode:'同時',mu,twist:tw});ok(r.fail||r.maxUse<=mu*1.01,`摩擦の使用は上限まで（${m}kg・${tw}・摩擦${mu}：${r.maxUse.toFixed(2)}）`)}
{const r0=B3.simulateBody(S(1),1,{mode:'なし',mu:0,twist:'both'});ok(r0.maxW4<1e-9,'体幹なし（足固定）ではひねらない');
 const sw=B3.makeBodySwing(S(1),1,{mode:'同時',mu:0,twist:'only'});let mx=0;for(let i=0;i<4000;i++){sw.step(.0005);if(!sw.fail)mx=Math.max(mx,Math.abs(sw.s.w4))}ok(mx<.05||sw.fail,'摩擦0では踏ん張れずひねれない（失敗）');
 const a=B3.simulateBody(S(1),1,{mode:'同時',mu:.3,twist:'only'}),b=B3.simulateBody(S(1),1,{mode:'同時',mu:1,twist:'only'});ok(b.maxW4>=a.maxW4-1e-6,`摩擦が大きいほど速くひねれる（${a.maxW4.toFixed(2)} → ${b.maxW4.toFixed(2)} rad/s）`)}
// 摩擦が大きいほど結果が良いか同じ（両方・1kg）
{const v=[0,.3,.6,1].map(mu=>{const r=B3.simulateBody(S(1),1,{mode:'同時',mu,twist:'both'});return r.fail?-1:r.hit?r.hitV:0});ok(v.every((x,i)=>i===0||x>=v[i-1]-.05),'摩擦が大きいほど良いか同じ：'+v.map(x=>x.toFixed(1)).join(' → '))}
// ひねりは可動域（±45°）を超えない
{const sw=B3.makeBodySwing(S(1),1,{mode:'同時',mu:1,twist:'both'});let mn=0,mx=0;for(let i=0;i<5000;i++){sw.step(.0005);mn=Math.min(mn,sw.s.q4);mx=Math.max(mx,sw.s.q4)}ok(mn>=B3.T3.psMin-1e-9&&mx<=B3.T3.psMax+1e-9,'ひねりは±45°の中');}
// 3Dの形：ひねると両肩が上から見て回り、肩幅・腕・剣の長さは変わらない
{const sw=B3.makeBodySwing(S(1,.6),1,{mode:'同時',mu:.6,twist:'both'});let bad=0,maxAng=0;for(let i=0;i<5000;i++){sw.step(.0005);const J=Rg.swing3(sw.g,sw.s);
  if(Math.abs(d3(J.lsh,J.rsh)-2*Rg.R.SH)>1e-6||Math.abs(d3(J.rsh,J.relb)-Rg.R.U)>1e-6||Math.abs(d3(J.relb,J.rhand)-Rg.R.F)>1e-6||Math.abs(d3(J.rhand,J.tip)-.6)>1e-6)bad++;
  const ang=Math.atan2(J.lsh[2]-J.rsh[2],J.lsh[0]-J.rsh[0]);maxAng=Math.max(maxAng,Math.abs(ang))}
 ok(bad===0,'ひねっても肩幅・腕・剣の長さは変わらない');ok(maxAng>20*Math.PI/180,`上から見て肩の線が回る（最大 ${(maxAng*180/Math.PI).toFixed(0)}°）`)}
// 点検t：比較表（ひねりだけ／腕だけ／両方）を作れる
const rows=[];for(const mode of ['同時','順番'])for(const [m,L,st] of C){const f=r=>(r.fail?'失敗':r.hit?r.hitV.toFixed(1):'外'+(r.minDist*100).toFixed(0)+'cm')+'(最高'+r.maxV.toFixed(1)+')';
 rows.push(`${mode} ${m}kg ${L}m ${st*100}%：腕だけ ${f(B3.simulateBody(S(m,L),st,{mode,mu:.6}))} ／ ひねりだけ ${f(B3.simulateBody(S(m,L),st,{mode,mu:.6,twist:'only'}))} ／ 両方 ${f(B3.simulateBody(S(m,L),st,{mode,mu:.6,twist:'both'}))}`)}
console.log(rows.join('\n'));console.log(`体のひねり ${n}項目 OK`);
