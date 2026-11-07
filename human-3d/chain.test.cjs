// R9：剣の振りで確認（点検bb・cc）。腰→胸→肩→肘→手首の順（mode:'連鎖'）と、手首を返すのは目標物の手前20°から（snapDeg）
const assert=require('node:assert/strict');
const B3=require('./body3d.js'),R8=require('./body3d-r8.js');
const S=(m,L=.6)=>({sword:{m,c:L/3,L}}),TR=B3.TARGET_R,D=180/Math.PI;
let n=0;const ok=(c,msg)=>{assert.ok(c,msg);n++};
const C=[[1,.6,1],[3,.9,1],[3,.6,.6],[3,.9,.6]],f=r=>r.fail&&r.fail.blew?'計算が破たん':r.fail?'足が滑って失敗':r.hit?r.hitV.toFixed(1)+'m/s':'外れ(あと'+(r.gap*100).toFixed(0)+'cm)';
// 点検cc：新しい動き（連鎖・遅い手首）を使わなければ、R8と同じ数値
for(const [m,L,st] of C)for(const mode of ['なし','同時','順番'])for(const twist of [false,'both'])for(const wrist of [false,'hold','snap'])for(const hands of [1,2]){
 if(mode==='なし'&&twist)continue;const o={mode,mu:.6,twist,wrist,hands,targetR:TR},a=R8.simulateBody(S(m,L),st,o),b=B3.simulateBody(S(m,L),st,o);
 ok(!!a.hit===!!b.hit&&!!a.fail===!!b.fail&&Math.abs(a.hitV-b.hitV)<1e-6&&(a.gap===null?b.gap===null:Math.abs(a.gap-b.gap)<1e-6),`R8と同じ（${m}kg・${L}m・${st*100}%・${mode}・ひねり${twist}・手首${wrist}・${hands}手）`)}
ok((()=>{try{B3.makeBodySwing(S(1),1,{mode:'れんさ'});return false}catch(e){return /使えない値/.test(e.message)}})(),'打ち間違いはエラー');
// 連鎖：本当に「腰→胸→肩→肘」の順に始まっている
for(const [m,L,st] of C){const r=B3.simulateBody(S(m,L),st,{mode:'連鎖',mu:.6,hands:2,targetR:TR});
 ok(r.chainT&&r.chainT.length>=2&&r.chainT.every((t,i)=>i===0||t>r.chainT[i-1]),`順番どおりに始まる（${m}kg・${L}m・${st*100}%：${(r.chainT||[]).map(x=>x.toFixed(2)).join('→')}秒）`)}
// 手首は目標物の手前20°まで倒したまま（早く返しきらない）
for(const [m,L,st] of C){const r=B3.simulateBody(S(m,L),st,{mode:'同時',twist:'both',wrist:'snap',snapDeg:20,mu:.6,hands:2,targetR:TR}),r0=B3.simulateBody(S(m,L),st,{mode:'同時',twist:'both',wrist:'snap',mu:.6,hands:2,targetR:TR});
 ok(r.snapAt!==null&&(!r0.hit||!r.hit||r.wristAtHit>r0.wristAtHit),`手首は遅く返す（${m}kg：打つ瞬間 ${r.hit?(r.wristAtHit*D).toFixed(0):'-'}° 対 早く返すと ${r0.hit?(r0.wristAtHit*D).toFixed(0):'-'}°）`)}
// 点検bb：決めた条件で比べる（結果はそのまま表示。速くなったかどうかは assert しない）
const rows=[];let faster=0,total=0;
for(const [m,L,st] of C){const o=k=>B3.simulateBody(S(m,L),st,{mu:.6,hands:2,targetR:TR,...k}),a=o({mode:'同時',twist:'both'}),b=o({mode:'連鎖'}),c=o({mode:'同時',twist:'both',wrist:'snap',snapDeg:20}),e=o({mode:'連鎖',wrist:'snap',snapDeg:20});
 for(const [x,y] of [[a,b],[c,e]]){total++;if(y.hit&&(!x.hit||y.hitV>x.hitV+.1))faster++}
 rows.push(`${m}kg ${L}m ${st*100}%：全部同時 ${f(a)}／順に ${f(b)}／全部同時＋手首 ${f(c)}／順に＋手首 ${f(e)}`)}
console.log(rows.join('\n'));console.log(`順番で速くなった：${faster}/${total}`);
// 摩擦が大きいほど良いか同じ（連鎖）
{const v=[0,.3,.6,1].map(mu=>{const r=B3.simulateBody(S(1),1,{mode:'連鎖',mu,hands:2,targetR:TR});return r.fail?-1:r.hit?r.hitV:0});ok(v[0]<=v[2]+.05,'連鎖：摩擦0は摩擦0.6より良くない：'+v.map(x=>x.toFixed(1)).join(' → '))}
// 計算の破たん：R8までの振り方では起きない。起きたら「失敗（計算が破たん）」として記録し、速さに数えない
for(const [m,L,st] of C)for(const k of [{mode:'同時',twist:'both'},{mode:'同時',twist:'both',wrist:'snap',snapDeg:20}]){const r=B3.simulateBody(S(m,L),st,{mu:.6,hands:2,targetR:TR,...k});ok(!(r.fail&&r.fail.blew)&&!r.blew,`全部同時では計算が破たんしない（${m}kg・${L}m・${st*100}%）`)}
{const bad=[];for(const [m,L,st] of C)for(const k of [{mode:'連鎖'},{mode:'連鎖',wrist:'snap',snapDeg:20}]){const r=B3.simulateBody(S(m,L),st,{mu:.6,hands:2,targetR:TR,...k});if(r.blew){bad.push(`${m}kg・${L}m・${st*100}%・${k.wrist?'手首あり':'手首なし'}`);ok(r.fail&&r.fail.blew&&!r.hit,'破たんしたら失敗扱いで速さを記録しない')}}console.log('計算が破たんした条件：'+(bad.join('、')||'なし'))}
{const w=[];for(const [m,L,st] of C)for(const mode of ['なし','同時','順番'])for(const twist of [false,'both'])for(const wrist of [false,'hold','snap'])for(const hands of [1,2]){if(mode==='なし'&&twist)continue;const r=B3.simulateBody(S(m,L),st,{mode,mu:.6,twist,wrist,hands,targetR:TR});if(r.blew)w.push(`${m}kg・${L}m・${st*100}%・${mode}・ひねり${twist||'なし'}・手首${wrist||'固定'}・${hands}手（${f(r)}）`)}
 console.log(`R8までの振り方で、振っている間に計算が破たんしかけた条件 ${w.length}個：`+w.join('、'))}
console.log(`剣の振りで確認 ${n}項目 OK`);
