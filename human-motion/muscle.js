(function(root){
// 肘1か所の筋肉モデル（仮の値。体重70kg男性の目安：Winterの体節表など）
const ARM={mForearm:1.54,rCom:0.17,lHand:0.34,g:9.81,fMax:1600,damp:0.6,min:0,max:145*Math.PI/180};
// 曲げる筋肉のてこの長さ：伸ばし切りで短く、90度付近で最大（約4.5cm）
function momentArm(th){return 0.015+0.03*Math.sin(Math.min(th,Math.PI/2)+Math.max(0,th-Math.PI/2)*0.3)}
// 筋肉は縮むほど出せる力が落ちる（長さと力の関係・簡略）。これで姿勢が安定する
function lengthFactor(th,p=ARM){return 1-0.5*th/p.max}
function gravityTorque(th,w,p=ARM){return (p.mForearm*p.rCom+w*p.lHand)*p.g*Math.sin(th)}
function inertia(w,p=ARM){return p.mForearm*p.rCom*p.rCom*1.3+w*p.lHand*p.lHand}
// s={th,om} 肘の角度(0=伸ばす)と角速度、a=筋肉の力の入れ具合0〜1、w=手に持つ重さkg
function step(s,a,w,dt,p=ARM){a=Math.max(0,Math.min(1,a));const force=a*p.fMax*lengthFactor(s.th,p),tm=force*momentArm(s.th),tg=gravityTorque(s.th,w,p);
 let om=s.om+(tm-tg-p.damp*s.om)/inertia(w,p)*dt,th=s.th+om*dt,stop=false;
 if(th<p.min){th=p.min;om=Math.max(0,om);stop=true}if(th>p.max){th=p.max;om=Math.min(0,om);stop=true}
 return {th,om,force,muscleTorque:tm,gravityTorque:tg,stop}}
// その角度で止めておくのに必要な力の入れ具合（1を超えたら支えきれない）
function holdActivation(th,w,p=ARM){return gravityTorque(th,w,p)/(p.fMax*lengthFactor(th,p)*momentArm(th))}

// 3-e-b：肩（三角筋＝腕を横に上げる）＋肘（曲げる筋肉）の2関節。正面図で右腕。
// q1=肩の上げ角（0=下ろす）、q2=肘の曲げ角、腕の向き φ=q1+q2（0=真下）
const ARM2={m1:1.96,c1:0.13,L1:0.30,fMaxS:2000,q1max:170*Math.PI/180,damp1:1.5};
function momentArmS(q){return 0.02+0.015*Math.sin(Math.min(q,Math.PI/2))}
function lengthFactorS(q,p=ARM2){return 1-0.4*q/p.q1max}
function armTorques(q1,q2,w,a=ARM,p=ARM2){const g=a.g,phi=q1+q2,fore=(a.mForearm*a.rCom+w*a.lHand)*g*Math.sin(phi);
 return {shoulder:(p.m1*p.c1+(a.mForearm+w)*p.L1)*g*Math.sin(q1)+fore,elbow:fore}}
function armStep(s,aS,aE,w,dt,a=ARM,p=ARM2){aS=Math.max(0,Math.min(1,aS));aE=Math.max(0,Math.min(1,aE));
 const gt=armTorques(s.q1,s.q2,w,a,p),fS=aS*p.fMaxS*lengthFactorS(s.q1,p),fE=aE*a.fMax*lengthFactor(s.q2,a),tS=fS*momentArmS(s.q1),tE=fE*momentArm(s.q2);
 const I1=p.m1*p.c1*p.c1*1.3+(a.mForearm+w)*p.L1*p.L1+inertia(w,a),I2=inertia(w,a);
 // 肘の重さの力は肘自身だけにかかる（肩の式には既に含めた）。簡略化：2関節の振り回し合いは無視
 let w1=s.w1+(tS-gt.shoulder-p.damp1*s.w1)/I1*dt,w2=s.w2+(tE-gt.elbow-a.damp*s.w2)/I2*dt;
 let q1=s.q1+w1*dt,q2=s.q2+w2*dt;
 if(q1<0){q1=0;w1=Math.max(0,w1)}if(q1>p.q1max){q1=p.q1max;w1=Math.min(0,w1)}
 if(q2<a.min){q2=a.min;w2=Math.max(0,w2)}if(q2>a.max){q2=a.max;w2=Math.min(0,w2)}
 return {q1,w1,q2,w2,tS,tE,gS:gt.shoulder,gE:gt.elbow,fS,fE}}
function holdArm(q1,q2,w,a=ARM,p=ARM2){const gt=armTorques(q1,q2,w,a,p);return {shoulder:gt.shoulder/(p.fMaxS*lengthFactorS(q1,p)*momentArmS(q1)),elbow:gt.elbow/(a.fMax*lengthFactor(q2,a)*momentArm(q2))}}

// 3-e-c：4つの筋肉＋剣。up=三角筋(上げる) down=広背筋・大胸筋(下ろす) flex=上腕二頭筋(曲げる) ext=上腕三頭筋(伸ばす)
// 剣は前腕の延長線上に持つ簡略化。sword={m:質量kg,c:手から剣の重心m,L:手から剣先m}
const MUS={fUp:2000,fDown:2600,fFlex:1600,fExt:1800};
const maDown=q=>0.03,maExt=q=>0.02;
// 速く縮むほど筋肉は力を出せない（力と速度の関係・Hillの式の簡略）。v=縮む向きの関節の角速度
const VMAX=14;function fv(v){if(v<=0)return Math.min(1.5,1-v/VMAX*0.5);return Math.max(0,(1-v/VMAX)/(1+4*v/VMAX))}
function swordStep(s,act,load,dt,a=ARM,p=ARM2,M=MUS){const cl=v=>Math.max(0,Math.min(1,v||0)),sw=load.sword||{m:0,c:0},w=load.w||0;
 const rS=a.lHand+sw.c,phi=s.q1+s.q2,foreMom=a.mForearm*a.rCom+w*a.lHand+sw.m*rS,g=a.g;
 const gE=foreMom*g*Math.sin(phi),gS=(p.m1*p.c1+(a.mForearm+w+sw.m)*p.L1)*g*Math.sin(s.q1)+gE;
 const tS=cl(act.up)*M.fUp*lengthFactorS(s.q1,p)*momentArmS(s.q1)*fv(s.w1)-cl(act.down)*M.fDown*maDown(s.q1)*fv(-s.w1);
 const tE=cl(act.flex)*M.fFlex*lengthFactor(s.q2,a)*momentArm(s.q2)*fv(s.w2)-cl(act.ext)*M.fExt*maExt(s.q2)*fv(-s.w2);
 const I2=inertia(w,a)+sw.m*rS*rS+sw.m*(sw.L||0)**2/12,I1=p.m1*p.c1*p.c1*1.3+(a.mForearm+w+sw.m)*p.L1*p.L1+I2;
 let w1=s.w1+(tS-gS-p.damp1*s.w1)/I1*dt,w2=s.w2+(tE-gE-a.damp*s.w2)/I2*dt,q1=s.q1+w1*dt,q2=s.q2+w2*dt;
 if(q1<0){q1=0;w1=Math.max(0,w1)}if(q1>p.q1max){q1=p.q1max;w1=Math.min(0,w1)}
 if(q2<a.min){q2=a.min;w2=Math.max(0,w2)}if(q2>a.max){q2=a.max;w2=Math.min(0,w2)}
 // 剣先の位置(m)：肩を原点、x=外側、y=下向き
 const ph=q1+q2,ex=p.L1*Math.sin(q1),ey=p.L1*Math.cos(q1),tip={x:ex+(a.lHand+(sw.L||0))*Math.sin(ph),y:ey+(a.lHand+(sw.L||0))*Math.cos(ph)};
 return {q1,w1,q2,w2,tS,tE,gS,gE,tip}}
// 振りの筋肉プログラム：脳が「どの姿勢へ」を決め、筋肉の力の入れ具合に変える（目標がある段階）。
// 打ち込みだけは目標なしで全力（広背筋＋上腕三頭筋）。動き自体は力の計算から生まれる。
const D=Math.PI/180;
const SWING=[{t:0,name:'構え',goal:[35,35]},{t:.1,name:'振りかぶり',goal:[150,110]},{t:.8,name:'打ち込み',ballistic:{down:1,ext:1}},{t:1.0,name:'止め',goal:[25,15]},{t:1.5,name:'残心',goal:[25,15]}];
function toAct(goalDeg,s,load,strength=1){const a=ARM,sw=load.sw||load.sword||{m:0,c:0},w=load.w||0,q1g=goalDeg[0]*D,q2g=goalDeg[1]*D;
 const rS=a.lHand+sw.c,fm=a.mForearm*a.rCom+w*a.lHand+sw.m*rS,g=a.g;
 const gE=fm*g*Math.sin(s.q1+s.q2),gS=(ARM2.m1*ARM2.c1+(a.mForearm+w+sw.m)*ARM2.L1)*g*Math.sin(s.q1)+gE;
 const k1=60,b1=6,k2=40,b2=3; // 狙いへの固さと、速さを抑える働き（筋肉の反射の簡略）
 const T1=gS+k1*(q1g-s.q1)-b1*s.w1,T2=gE+k2*(q2g-s.q2)-b2*s.w2;
 const up=T1>0?T1/(MUS.fUp*lengthFactorS(s.q1)*momentArmS(s.q1)):0,down=T1<0?-T1/(MUS.fDown*0.03):0;
 const flex=T2>0?T2/(MUS.fFlex*lengthFactor(s.q2)*momentArm(s.q2)):0,ext=T2<0?-T2/(MUS.fExt*0.02):0;
 const c=v=>Math.min(strength,v);return {up:c(up),down:c(down),flex:c(flex),ext:c(ext)}}
// 指摘①②の修正：段階は時間ではなく出来事で切り替える。打ち込みは「剣先が肩の高さを下向きに通る（＝打つ瞬間）」まで全力で続け、
// 速さはその瞬間に測る。どの振りも同じ地点で比べられる。届かなければ hit=null。
function swingAct(t,s,load,strength=1,prog=SWING){let cur=prog[0];for(const k of prog)if(t>=k.t)cur=k;
 if(cur.ballistic){const o={up:0,down:0,flex:0,ext:0};for(const k in cur.ballistic)o[k]=cur.ballistic[k]*strength;return {name:cur.name,act:o}}
 return {name:cur.name,act:toAct(cur.goal,s,load,strength)}}
function makeSwing(load,strength=1){const st={t:0,s:{q1:35*D,w1:0,q2:35*D,w2:0},phase:'構え',since:0,hit:null,top:0,prevTip:null,v:0,act:{}};
 const ballistic={up:0,down:strength,flex:0,ext:strength},goal={構え:[35,35],振りかぶり:[150,110],止め:[25,15],残心:[25,15]};
 st.step=dt=>{const go=p=>{st.phase=p;st.since=0};
  if(st.phase==='構え'&&st.since>=.1)go('振りかぶり');
  if(st.phase==='振りかぶり'&&st.since>=.7)go('打ち込み');
  if(st.phase==='止め'&&st.since>=.5)go('残心');
  st.act=st.phase==='打ち込み'?ballistic:toAct(goal[st.phase],st.s,load,strength);
  const r=swordStep(st.s,st.act,load,dt);
  if(st.prevTip)st.v=Math.hypot(r.tip.x-st.prevTip.x,r.tip.y-st.prevTip.y)/dt;
  if(st.phase==='振りかぶり')st.top=Math.min(st.top,r.tip.y);
  if(st.phase==='打ち込み'){
   if(st.prevTip&&st.prevTip.y<0&&r.tip.y>=0){st.hit={v:st.v,t:st.t,q1:r.q1,q2:r.q2};go('止め')}
   else if(st.since>=.6)go('止め'); // 0.6秒たっても届かない＝打てなかった
  }
  st.prevTip=r.tip;st.s={q1:r.q1,w1:r.w1,q2:r.q2,w2:r.w2};st.tip=r.tip;st.t+=dt;st.since+=dt;return st};
 return st}
function simulateSwing(load,strength=1,sec=2,dt=.001){const sw=makeSwing(load,strength);let peak=0,qmax=0,peakPhase='';
 for(let i=0;i<sec/dt;i++){sw.step(dt);if(sw.v>peak){peak=sw.v;peakPhase=sw.phase}qmax=Math.max(qmax,sw.s.q1)}
 return {hit:sw.hit,hitV:sw.hit?sw.hit.v:0,top:sw.top,qmax,end:sw.s,peak,peakPhase}}
const api={makeSwing,fv,ARM,ARM2,MUS,swordStep,SWING,swingAct,simulateSwing,toAct,armTorques,armStep,holdArm,lengthFactor,momentArm,gravityTorque,step,holdActivation};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Muscle=api;
})(this);
