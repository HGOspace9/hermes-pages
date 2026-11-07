const assert=require('node:assert/strict');
const {footContacts,humanStep}=require('./physics.js');
assert.deepEqual(footContacts([{id:'lf',y:196},{id:'rf',y:196}],208,12),['lf','rf']);
assert.deepEqual(footContacts([{id:'lf',y:150},{id:'rf',y:196}],208,12),['rf']);
const params={mass:70,gravity:9.81,muStatic:.6,muKinetic:.48,drag:0};
assert.equal(humanStep({x:0,v:0},100,params,.1,true).v,0);
assert.ok(humanStep({x:0,v:0},100,params,.1,false).v>0);
console.log('足の接地と摩擦 4項目 OK');
