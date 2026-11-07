const assert=require('node:assert/strict');const M=require('./muscle.js');const S=(m,L=.6)=>({sword:{m,c:L/3,L}}),D=Math.PI/180;
const light=M.simulateSwing(S(.5)),mid=M.simulateSwing(S(1)),heavy=M.simulateSwing(S(3));
assert.ok(light.hit&&mid.hit&&heavy.hit,'全力なら0.5〜3kgとも目標物を打てる');
assert.ok(light.hitV>mid.hitV&&mid.hitV>heavy.hitV,'打つ瞬間の速さ：剣が重いほど遅い');
assert.ok(mid.hitV>8&&mid.hitV<25,'1kgの剣の打つ瞬間の剣先は毎秒8〜25m');
assert.ok(mid.peakPhase==='打ち込み'||mid.peak<=mid.hitV*1.05,'一番速いのは打ち込み');
assert.ok(mid.qmax>120*D,'1kgなら腕を頭の上まで振りかぶれる');
const w3=M.simulateSwing(S(3),.6);assert.ok(!w3.hit||w3.hitV<heavy.hitV,'力が弱いと重い剣は届かないか遅い');
const w1=M.simulateSwing(S(1),.6);assert.ok(w1.hit&&w1.hitV<mid.hitV,'力が弱いと打つ瞬間が遅い');
assert.ok(Math.abs(mid.end.q1-25*D)<5*D,'振った後は止めの構えに戻る');
assert.ok(M.fv(7)<M.fv(0)&&M.fv(14)===0,'速く縮むほど筋肉は力を出せない');
// 指摘a：腕が肩より上がらない振りでも、目標物を通れば打ったと数える
const low=M.simulateSwing(S(3,.9),.6,2.5,.001,M.TARGET,{order:'同時'});assert.ok(low.qmax<90*D&&low.hit&&low.hitV>5,'低い振りでも目標物を打てば速さが出る（0にならない）');
// 指摘c：振りかぶりの時間は固定ではなく、重い剣ほど上がりきるのに時間がかかる
assert.ok(heavy.raiseTime>light.raiseTime+.2,'重い剣ほど振りかぶりが長い（時間決め打ちではない）');
const far=M.simulateSwing(S(1),1,2.5,.001,{x:3,y:0});assert.ok(!far.hit&&far.minDist>1,'遠すぎる目標物には届かず、一番近づいた距離が出る');
// 点検b：止めではブレーキだけ。打った後に剣先が打った瞬間より速くならない（0.5〜3kg、筋力100%・60%）
for(const st of [1,.6])for(const m of [.5,1,2,3]){const r=M.simulateSwing(S(m),st);if(r.hit)assert.ok(r.afterMax<=r.hitV*1.001,`止めで剣が加速しない（${m}kg・${st*100}%）`)}
assert.ok(Math.abs(mid.end.q2-15*D)<5*D,'ブレーキの後も構えに戻れる');
// 3-e-f：肩と肘の連動。肩を急に止めると、前腕が勢いで振り出される（鞭の動き）。連動なしでは起きない
const L1={sword:{m:1,c:.2,L:.6}},s0={q1:Math.PI/2,w1:-8,q2:Math.PI/3,w2:0};const run=c=>{let s=s0;for(let i=0;i<60;i++)s=M.swordStep(s,{up:1},L1,.001,undefined,undefined,undefined,{coupled:c});return s};
const cp=run(true),nc=run(false);assert.ok(cp.w2<-5&&Math.abs(nc.w2)<2,'肩にブレーキをかけると肘が勢いで伸びる（連動あり）');
// 連動ありでも、力を抜けば腕は下に落ちて止まる（計算が暴れない）
{let s={q1:2,w1:0,q2:1,w2:0};for(let i=0;i<5000;i++)s=M.swordStep(s,{},L1,.001);assert.ok(s.q1<.1&&Math.abs(s.w1)<.5&&Math.abs(s.w2)<.5,'連動ありで力を抜くと腕は下がって落ち着く')}
// 点検g：目標物は剣の長さに合わせて置く。長い剣ほど遠く、外れた時は一番近い距離を出す
assert.ok(M.targetFor(S(1,.9)).x>M.targetFor(S(1,.6)).x+.2,'長い剣ほど目標物が遠い');
assert.ok(M.simulateSwing(S(3,.9),1).hit,'剣0.9m・3kg・全力でも目標物を打てる（強いほど外れる逆転の解消）');
const miss=M.simulateSwing(S(3),.6);assert.ok(miss.hit||miss.minDist>0&&miss.minDist<.5,'外れた時は一番近づいた距離（50cm未満）を出す');
// 3-e-g-1：力を入れる順番。'順番'では肩が先に下り、肘は後から伸ばし始める。同じ条件で'同時'と比べられる
{const sw=M.makeSwing(S(1),1);let q2AtStart=null,q2Before=null;for(let i=0;i<2500;i++){sw.step(.001);if(sw.phase==='打ち込み'){if(q2AtStart===null)q2AtStart=sw.s.q2;if(!sw.elbowGo)q2Before=sw.s.q2}}
 assert.ok(sw.elbowAt>.05,'順番：肘を伸ばし始めるのは打ち込み開始より後');assert.ok(Math.abs(q2Before-q2AtStart)<20*D,'順番：肩が回る間、肘は曲げたまま保つ')}
{const a=M.simulateSwing(S(1),1,2.5,.001,undefined,{order:'同時'}),b=M.simulateSwing(S(1),1,2.5,.001,undefined,{order:'順番'});assert.ok(a.hit&&b.hit&&Math.abs(a.hitV-b.hitV)<3,'同じ条件で順番あり・なしの速さを比べられる')}
console.log('剣の振り 22項目 OK');
