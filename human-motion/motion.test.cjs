const assert=require('node:assert/strict');
const {sampleSword}=require('./motion.js');
const a=sampleSword(0),b=sampleSword(.5),c=sampleSword(1);
assert.notEqual(a.upper,b.upper);assert.notEqual(b.blade,c.blade);
assert.deepEqual(sampleSword(-1),a);assert.deepEqual(sampleSword(2),c);
assert.ok(Object.values(b).every(Number.isFinite));
console.log('剣の動き 5項目 OK');
