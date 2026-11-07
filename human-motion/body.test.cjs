const assert=require('node:assert/strict');const Bd=require('./body.js'),M=require('./muscle.js');const S=(m,L=.6)=>({sword:{m,c:L/3,L}}),D=Math.PI/180;
// 運動方程式の確かさ：力を抜くと腕も体も重さで下がり、エネルギーが増えない（暴れない）
{let s={x:0,vx:0,q0:0,w0:0,q1:2,w1:0,q2:1,w2:0};for(let i=0;i<8000;i++)s=Bd.bodyStep(s,{},S(1),.0005,{lock:true}).s;assert.ok(s.q1<.15&&Math.abs(s.w1)<.5,'体を固定して力を抜くと腕は下がって落ち着く')}
// 体幹なし＝腕だけの以前の計算と同じ結果になる（新しい式の検算）
for(const [m,L,st] of [[1,.6,1],[3,.9,1]]){const a=Bd.simulateBody(S(m,L),st,{mode:'なし'}),b=M.simulateSwing(S(m,L),st,2.5,.001,undefined,{order:'同時'});assert.ok(a.hit&&b.hit&&Math.abs(a.hitV-b.hitV)<.3,`体幹なしは腕だけの計算と一致（${m}kg）`)}
// 点検k：体を回す・踏み込む力は床の摩擦から。摩擦0では踏み込めず、体幹の回転も弱い
{const g=Bd.simulateBody(S(1),1,{mode:'同時',mu:.6}),z=Bd.simulateBody(S(1),1,{mode:'同時',mu:0});
 assert.ok(g.maxX>.25&&z.maxX<g.maxX/2,'摩擦0では踏み込めない');
 assert.ok(g.maxFr<=.6+1e-6,'床の摩擦の使用は上限（摩擦×体重）を超えない')}
{const g=Bd.simulateBody(S(1),1,{mode:'同時',mu:.6}),z=Bd.simulateBody(S(1),1,{mode:'同時',mu:0});
 assert.ok(z.maxSv<g.maxSv*.5,'摩擦0では体幹を倒しても腰が後ろへ逃げ、肩を前へ運べない（体幹の働きが弱い）')}
// 体幹ありは体幹なしより速い（全力・1kg）＝体の力が剣に伝わる
{const a=Bd.simulateBody(S(1),1,{mode:'なし'}),b=Bd.simulateBody(S(1),1,{mode:'同時'});assert.ok(b.hit&&b.hitV>a.hitV,'体幹と踏み込みを足すと剣先が速くなる')}
// 順番：体が先に前へ倒れ、そのあと肩、肘の順に切り替わる
{const sw=Bd.makeBodySwing(S(1),1,{mode:'順番'});for(let i=0;i<5000;i++)sw.step(.0005);assert.ok(sw.trunkStopAt>0&&sw.elbowAt>sw.trunkStopAt,'順番：体幹→肩→肘の順に切り替わる')}
// 止めで加速しない（点検b）・外れたら距離が出る
for(const mode of ['なし','同時','順番']){const r=Bd.simulateBody(S(1),1,{mode});if(r.hit)assert.ok(r.afterMax<=r.hitV*1.001,`止めで剣が加速しない（${mode}）`);else assert.ok(r.minDist>0,'外れたら距離が出る')}
// 点検m：摩擦0では踏ん張れず失敗になるか、摩擦0.6より遅い（滑ったほうが速い逆転がない）
for(const [m,L,st] of [[1,.6,1],[3,.9,1],[3,.6,.6],[3,.9,.6]])for(const mode of ['同時','順番']){const g=Bd.simulateBody(S(m,L),st,{mode,mu:.6}),z=Bd.simulateBody(S(m,L),st,{mode,mu:0});
 assert.ok(z.fail||!z.hit||(g.hit&&z.hitV<=g.hitV),`摩擦0では失敗か遅い（${m}kg・${L}m・${st*100}%・${mode}）`);if(z.fail)assert.ok(!z.hit,'失敗した振りは速さを記録しない')}
// 点検n：踏み込みは目標の距離（0.3m）で止まる（行き過ぎは10cm未満）
for(const [m,L,st] of [[1,.6,1],[3,.9,1],[3,.9,.6]])for(const mode of ['同時','順番']){const r=Bd.simulateBody(S(m,L),st,{mode,mu:.6});assert.ok(r.maxX<Bd.B.stepLen+.1,`踏み込みは目標の距離で止まる（${m}kg・${mode}・${r.maxX.toFixed(2)}m）`)}
// 点検p：失敗した振りは「一番近づいた距離」を出さない（計算用の仮の大きな数を返さない）
{const z=Bd.simulateBody(S(1),1,{mode:'同時',mu:0});assert.ok(z.fail&&z.minDist===null,'失敗した時は距離を出さない')}
console.log('全身の振り 15項目 OK');
