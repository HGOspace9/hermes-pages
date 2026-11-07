const assert=require('node:assert/strict');
const {walkStep}=require('./physics.js');const {sampleWalk}=require('./motion.js');
const base={mass:70,gravity:9.81,muStatic:.6,muKinetic:.48,drag:3,tau:.5,vTarget:1.2};
function run(p,sec=4){let s={x:0,v:0},slips=0;for(let i=0;i<sec*100;i++){s=walkStep(s,p,.01,true);if(s.slip)slips++}return {...s,slips}}
const normal=run(base);assert.ok(Math.abs(normal.v-1.2)<.15,'普通の床では目標の速さに近づく');assert.equal(normal.slips,0,'普通の床では滑らない');
const ice=run({...base,muStatic:.05,muKinetic:.03});assert.ok(ice.slips>0,'氷では足が滑る');assert.ok(ice.v<normal.v,'氷では遅い');
const zero=run({...base,muStatic:0,muKinetic:0});assert.ok(zero.v<=0,'摩擦ゼロでは前に進めない');
const air=walkStep({x:0,v:1.2},{...base},.01,false);assert.equal(air.force,0,'足が浮いていれば蹴れない');
const a=sampleWalk(.1),b=sampleWalk(.6);assert.notEqual(a.stance,b.stance,'半周期で立ち足が入れ替わる');assert.ok(Math.abs(a.hipL+a.hipR)<1e-9,'左右の脚は逆に振る');
console.log('歩行 7項目 OK');
