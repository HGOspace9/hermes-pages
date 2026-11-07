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
const low=M.simulateSwing(S(3,.9),.6);assert.ok(low.qmax<90*D&&low.hit&&low.hitV>5,'低い振りでも目標物を打てば速さが出る（0にならない）');
// 指摘c：振りかぶりの時間は固定ではなく、重い剣ほど上がりきるのに時間がかかる
assert.ok(heavy.raiseTime>light.raiseTime+.2,'重い剣ほど振りかぶりが長い（時間決め打ちではない）');
const far=M.simulateSwing(S(1),1,2.5,.001,{x:3,y:0});assert.ok(!far.hit,'遠すぎる目標物には届かない');
console.log('剣の振り 12項目 OK');
