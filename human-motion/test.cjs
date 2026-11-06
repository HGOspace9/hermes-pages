const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.existsSync(__dirname+'/index.html')?fs.readFileSync(__dirname+'/index.html','utf8'):'';
assert.ok(html.includes('data-human-motion-ready'), '人体モデルが用意されている');
console.log('人体モデルの準備 OK');
