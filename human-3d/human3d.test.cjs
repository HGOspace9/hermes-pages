// R5：3Dに写しても、平面の計算と同じ数値が出るか
const assert=require('node:assert/strict');
const Body=require('../human-motion/body.js'),Muscle=require('../human-motion/muscle.js'),Motion=require('../human-motion/motion.js'),Physics=require('../human-motion/physics.js'),Rg=require('./rig3d.js');
const S=(m,L=.6)=>({sword:{m,c:L/3,L}}),d3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
let n=0;const ok=(c,msg)=>{assert.ok(c,msg);n++};
// 1) 剣の振り：平面の剣先と3Dの剣先の速さが同じ（打つ瞬間）
const DT=.0005,rows=[];
for(const [m,L,st] of [[1,.6,1],[3,.9,1],[3,.6,.6],[3,.9,.6]])for(const mode of ['なし','同時','順番']){
 const ref=Body.simulateBody(S(m,L),st,{mode,mu:.6});
 const sw=Body.makeBodySwing(S(m,L),st,{mode,mu:.6});let prev=null,v3=0,hit3=null,maxBone=0,feetOK=true;
 for(let i=0;i<2.5/DT;i++){const had=!!sw.hit;sw.step(DT);const J=Rg.swing(sw.K,sw.s);if(prev)v3=d3(J.tip,prev)/DT;prev=J.tip;if(!had&&sw.hit)hit3=v3;
  for(const s of ['l','r'])if(Math.abs(J[s+'ank'][1]-Rg.R.ANKLE)>1e-6||Math.abs(d3(J[s+'hip'],J[s+'knee'])-Rg.R.THIGH)>1e-6||Math.abs(d3(J[s+'knee'],J[s+'ank'])-Rg.R.SHIN)>1e-6)feetOK=false;
  maxBone=Math.max(maxBone,Math.abs(d3(J.rsh,J.relb)-Rg.R.U),Math.abs(d3(J.relb,J.rhand)-Rg.R.F),Math.abs(d3(J.rhand,J.tip)-L));}
 ok(!!ref.hit===!!sw.hit&&!!ref.fail===!!sw.fail,`当たり・外れ・失敗が同じ（${m}kg・${L}m・${st*100}%・${mode}）`);
 if(ref.hit){ok(Math.abs(ref.hitV-sw.hit.v)<1e-9,'平面の速さは同じ');ok(Math.abs(hit3-ref.hitV)<.05,`3Dで測った剣先の速さも同じ（${hit3.toFixed(2)} 対 ${ref.hitV.toFixed(2)}）`)}
 ok(maxBone<1e-6,'腕と剣の長さは3Dでも変わらない');ok(feetOK,'振っている間、両足は床についたまま・脚の長さも変わらない');
 rows.push(`${m}kg ${L}m ${st*100}% ${mode}: ${ref.fail?'失敗':ref.hit?ref.hitV.toFixed(1)+' / 3D '+hit3.toFixed(1):'外れ'+(ref.minDist*100).toFixed(0)+'cm'}`)}
// 目安：1kg・全部同時・摩擦0.6で毎秒13.6m
{const r=Body.simulateBody(S(1),1,{mode:'同時',mu:.6});ok(Math.abs(r.hitV-13.6)<.05,'目安 13.6 m/s')}
// 摩擦0では体幹ありは失敗（3Dでも同じ計算）
ok(!!Body.simulateBody(S(1),1,{mode:'同時',mu:0}).fail,'摩擦0では踏ん張れず失敗');
// 2) 立ちポーズと脚の長さ
{const J=Rg.stand();for(const s of ['l','r']){ok(Math.abs(d3(J[s+'hip'],J[s+'knee'])-Rg.R.THIGH)<1e-6&&Math.abs(d3(J[s+'knee'],J[s+'ank'])-Rg.R.SHIN)<1e-6,'立ちポーズの脚の長さ');}
 ok(Math.abs(J.lank[1]-Rg.R.ANKLE)<1e-6,'立ちポーズで足が床についている');}
// 3) 歩く：脚の長さが保たれ、どちらかの足が床につき、摩擦0.6で進み摩擦0で進まない
{let minLow=9;for(let k=0;k<50;k++){const J=Rg.walk(Motion.sampleWalk(k/50),0);for(const s of ['l','r'])ok(Math.abs(d3(J[s+'hip'],J[s+'knee'])-Rg.R.THIGH)<1e-6&&Math.abs(d3(J[s+'knee'],J[s+'ank'])-Rg.R.SHIN)<1e-6,'歩行中の脚の長さ');minLow=Math.min(Math.abs(Math.min(J.lank[1],J.rank[1])-Rg.R.ANKLE),minLow);ok(Math.abs(Math.min(J.lank[1],J.rank[1])-Rg.R.ANKLE)<1e-6,'いつもどちらかの足が床')}
 const walkV=mu=>{let s={x:0,v:0},ph=0;for(let i=0;i<600;i++){ph+=.01*1.2/1.2;const J=Rg.walk(Motion.sampleWalk(ph),s.x),gr=Math.min(J.lank[1],J.rank[1])<=Rg.R.ANKLE+.01;s=Physics.walkStep(s,{mass:70,gravity:9.81,muStatic:mu,muKinetic:mu*.8,drag:3,tau:.5,vTarget:1.2},.01,gr)}return s.v};
 const v6=walkV(.6),v0=walkV(0);ok(v6>1&&v6<1.3,`摩擦0.6で歩ける（${v6.toFixed(2)} m/s）`);ok(Math.abs(v0)<.01,'摩擦0では進まない');rows.push(`歩く 摩擦0.6: ${v6.toFixed(2)} m/s ／ 摩擦0: ${v0.toFixed(2)} m/s`)}
// 4) 右腕：真横90°で止まる（平面と同じ計算）
{let st={q1:Math.PI/2,w1:0,q2:0,w2:0};const h=Muscle.holdArm(st.q1,0,0);for(let i=0;i<2000;i++){const o=Muscle.armStep(st,Math.min(1,h.shoulder),0,0,.0005);st={q1:o.q1,w1:o.w1,q2:o.q2,w2:o.w2}}
 ok(Math.abs(st.q1*180/Math.PI-90)<2,'右腕を真横90°で止められる');const J=Rg.armSide(st.q1,st.q2);ok(Math.abs(J.rhand[1]-J.rsh[1])<.02&&J.rhand[0]<J.rsh[0]-.5,'3Dでも右手は肩の真横')}
console.log(rows.join('\n'));console.log(`3Dの人形 ${n}項目 OK`);
