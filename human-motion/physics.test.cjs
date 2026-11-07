const assert=require('node:assert/strict');
const {step}=require('./physics.js');
let p={mass:70,gravity:9.81,muStatic:.6,muKinetic:.4,drag:3};
let stationary=step({x:0,v:0},100,p,.01);assert.equal(stationary.v,0,'静止摩擦を超えなければ動かない');
let sliding=step({x:0,v:0},600,p,.01);assert.ok(sliding.v>0,'静止摩擦を超えれば動く');
let base=step({x:0,v:2},0,{...p,muKinetic:0,drag:0},.01);let air=step({x:0,v:2},0,{...p,muKinetic:0,drag:3},.01);assert.ok(air.v<base.v,'空気抵抗は進行方向と逆');
let stop=step({x:0,v:.001},0,p,.1);assert.equal(stop.v,0,'摩擦で逆向きに走り出さない');
let negative=step({x:0,v:0},-600,p,.01);assert.ok(negative.v<0,'左右両方向に動く');
console.log('物理モデル 5項目 OK');
