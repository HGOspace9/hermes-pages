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
// 3-e-f：肩と肘の連動（2関節の運動方程式）。上腕と「前腕＋手＋剣」が互いを振り回す力を含める。
// M(q)·角加速度 + 振り回し合いの力 + 重さ = 筋肉の力 − 関節の粘り。opt.coupled=false で連動なし（比較用）
function swordStep(s,act,load,dt,a=ARM,p=ARM2,M=MUS,opt={}){const cl=v=>Math.max(0,Math.min(1,v||0)),sw=load.sword||{m:0,c:0},w=load.w||0,coupled=opt.coupled!==false;
 const rS=a.lHand+sw.c,phi=s.q1+s.q2,m2=a.mForearm+w+sw.m,foreMom=a.mForearm*a.rCom+w*a.lHand+sw.m*rS,g=a.g;
 const gE=foreMom*g*Math.sin(phi),gS=(p.m1*p.c1+m2*p.L1)*g*Math.sin(s.q1)+gE;
 const tS=cl(act.up)*M.fUp*lengthFactorS(s.q1,p)*momentArmS(s.q1)*fv(s.w1)-cl(act.down)*M.fDown*maDown(s.q1)*fv(-s.w1);
 const tE=cl(act.flex)*M.fFlex*lengthFactor(s.q2,a)*momentArm(s.q2)*fv(s.w2)-cl(act.ext)*M.fExt*maExt(s.q2)*fv(-s.w2);
 const Ie=inertia(w,a)+sw.m*rS*rS+sw.m*(sw.L||0)**2/12,Iu=p.m1*p.c1*p.c1*1.3,k=coupled?foreMom*p.L1:0,c=Math.cos(s.q2),h=k*Math.sin(s.q2);
 const M11=Iu+m2*p.L1*p.L1+Ie+2*k*c,M12=Ie+k*c,M22=Ie;
 const r1=tS-gS-p.damp1*s.w1+h*(2*s.w1*s.w2+s.w2*s.w2),r2=tE-gE-a.damp*s.w2-h*s.w1*s.w1;
 let A1,A2;if(coupled){const det=M11*M22-M12*M12;A1=(M22*r1-M12*r2)/det;A2=(M11*r2-M12*r1)/det}else{A1=r1/(Iu+m2*p.L1*p.L1+Ie);A2=r2/Ie}
 let w1=s.w1+A1*dt,w2=s.w2+A2*dt,q1=s.q1+w1*dt,q2=s.q2+w2*dt;
 if(q1<0){q1=0;w1=Math.max(0,w1)}if(q1>p.q1max){q1=p.q1max;w1=Math.min(0,w1)}
 if(q2<a.min){q2=a.min;w2=Math.max(0,w2)}if(q2>a.max){q2=a.max;w2=Math.min(0,w2)}
 // 剣先の位置(m)：肩を原点、x=前、y=下向き
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
// 3-e-e：横から見た図。q1=肩を前に上げる角度（0=下ろす）、x=前、y=下。
// 指摘a：打つ瞬間＝剣（手〜剣先）が目標物を上から下へ通った時。target={x,y}（肩から、m）。
// 指摘c：振りかぶり→打ち込みは「腕が上がりきって止まった時」（狙いに近く、ほぼ止まった）。安全のため最大1.5秒。
const TARGET={x:0.95,y:-0.15};
// 点検g：目標物は剣の長さに合わせる。肩から（上腕＋前腕・手＋剣）の8割の距離、水平より約9°上
function targetFor(load,frac=.8,a=ARM,p=ARM2){const L=(load.sword&&load.sword.L)||0,R=frac*(p.L1+a.lHand+L),ang=9*Math.PI/180;return {x:R*Math.cos(ang),y:-R*Math.sin(ang)}}
// 刃（手〜剣先）と目標物の最短距離(m)
function bladeDist(s,load,target,a=ARM,p=ARM2){const L=(load.sword&&load.sword.L)||0,ph=s.q1+s.q2,ex=p.L1*Math.sin(s.q1),ey=p.L1*Math.cos(s.q1),ux=Math.sin(ph),uy=Math.cos(ph),hx=ex+a.lHand*ux,hy=ey+a.lHand*uy,t=Math.max(0,Math.min(L,(target.x-hx)*ux+(target.y-hy)*uy));return Math.hypot(target.x-hx-t*ux,target.y-hy-t*uy)}
function bladeCross(s,load,target,a=ARM,p=ARM2){const sw=load.sword||{L:0},ph=s.q1+s.q2,ex=p.L1*Math.sin(s.q1),ey=p.L1*Math.cos(s.q1),ux=Math.sin(ph),uy=Math.cos(ph),hx=ex+a.lHand*ux,hy=ey+a.lHand*uy,rx=target.x-hx,ry=target.y-hy;
 return {cross:ux*ry-uy*rx,along:ux*rx+uy*ry,len:sw.L||0}}
function makeSwing(load,strength=1,target,opt={}){target=target||targetFor(load);const order=opt.order||'順番';const st={order,minDist:1e9,t:0,s:{q1:35*D,w1:0,q2:35*D,w2:0},phase:'構え',since:0,hit:null,top:0,prevTip:null,prevC:null,v:0,act:{},target};
 const ballistic={up:0,down:strength,flex:0,ext:strength},goal={構え:[35,35],振りかぶり:[150,110],戻し:[25,15],残心:[25,15]};
 st.step=dt=>{const go=p=>{st.phase=p;st.since=0};
  if(st.phase==='構え'&&st.since>=.1)go('振りかぶり');
  if(st.phase==='振りかぶり'&&st.since>=.15){const g=goal['振りかぶり'],near=Math.abs(st.s.q1-g[0]*D)<12*D&&Math.abs(st.s.q2-g[1]*D)<15*D,still=Math.abs(st.s.w1)<.4&&Math.abs(st.s.w2)<.6;
   if((still&&(near||st.since>=.4))||st.since>=1.5){st.raiseTime=st.since;st.raiseQ1=st.s.q1;st.raiseQ2=st.s.q2;go('打ち込み')}}
  // 点検b：止め＝まずブレーキ。動いている向きと逆の筋肉だけを使い（伸ばされながら踏ん張る）、ほぼ止まったら構えへ戻す
  if(st.phase==='止め'&&Math.abs(st.s.w1)<.8&&Math.abs(st.s.w2)<.8)go('戻し');
  if(st.phase==='止め'&&st.since>=.6)go('戻し');
  if(st.phase==='戻し'&&st.since>=.5)go('残心');
  if(st.phase==='止め'){const k=strength,b1=Math.min(k,Math.abs(st.s.w1)*.25),b2=Math.min(k,Math.abs(st.s.w2)*.25);
   st.act={up:st.s.w1<0?b1:0,down:st.s.w1>0?b1:0,flex:st.s.w2<0?b2:0,ext:st.s.w2>0?b2:0}}
  else if(st.phase==='打ち込み'){
   // 3-e-g-1：力を入れる順番。'同時'＝下ろす・伸ばすを同時に全力。'順番'＝まず肩だけ全力で下ろし、肘は曲げたまま保つ。
   // 肩が十分速く回り（上がりきりから35°下りた）たら、肘を伸ばす筋肉に切り替える＝肩の勢いを肘から先へ渡す
   const sd=(opt.switchDeg??35)*D,elbowMode=opt.elbow||'保持',brake=opt.brake||0;
   if(order==='同時')st.act=ballistic;
   else{if(!st.elbowGo&&st.raiseQ1-st.s.q1>sd){st.elbowGo=true;st.elbowAt=st.since}
    if(st.elbowGo)st.act={up:brake*strength,down:brake?0:strength,flex:0,ext:strength};
    else if(elbowMode==='脱力')st.act={up:0,down:strength,flex:0,ext:0};
    else{const hold=toAct([st.s.q1/D,st.raiseQ2/D],st.s,load,strength);st.act={up:0,down:strength,flex:hold.flex,ext:hold.ext}}}}
  else st.act=toAct(goal[st.phase],st.s,load,strength);
  const r=swordStep(st.s,st.act,load,dt);
  if(st.prevTip)st.v=Math.hypot(r.tip.x-st.prevTip.x,r.tip.y-st.prevTip.y)/dt;
  if(st.phase==='振りかぶり')st.top=Math.min(st.top,r.tip.y);
  const c=bladeCross(r,load,target);if(st.phase==='打ち込み')st.minDist=Math.min(st.minDist,bladeDist(r,load,target));
  if(st.phase==='打ち込み'){
   // 剣が上から前へ振り下ろされ、目標の上側→下側へ刃が通り過ぎた瞬間で、目標が刃の範囲内なら命中
   if(st.prevC!==null&&st.prevC>0&&c.cross<=0&&c.along>=0&&c.along<=c.len){st.hit={v:st.v,t:st.t,q1:r.q1,q2:r.q2,tip:r.tip};go('止め')}
   else if(st.since>=.8)go('止め');
  }
  if(st.hit&&st.phase!=='打ち込み')st.afterMax=Math.max(st.afterMax||0,st.v);st.prevC=c.cross;st.prevTip=r.tip;st.s={q1:r.q1,w1:r.w1,q2:r.q2,w2:r.w2};st.tip=r.tip;st.t+=dt;st.since+=dt;return st};
 return st}
function simulateSwing(load,strength=1,sec=2.5,dt=.001,target,opt={}){const sw=makeSwing(load,strength,target,opt);let peak=0,qmax=0,peakPhase='';
 for(let i=0;i<sec/dt;i++){sw.step(dt);if(sw.v>peak){peak=sw.v;peakPhase=sw.phase}qmax=Math.max(qmax,sw.s.q1)}
 return {minDist:sw.hit?0:sw.minDist,elbowAt:sw.elbowAt,target:sw.target,afterMax:sw.afterMax||0,raiseTime:sw.raiseTime,hit:sw.hit,hitV:sw.hit?sw.hit.v:0,top:sw.top,qmax,end:sw.s,peak,peakPhase}}
const api={targetFor,bladeDist,TARGET,bladeCross,makeSwing,fv,ARM,ARM2,MUS,swordStep,SWING,swingAct,simulateSwing,toAct,armTorques,armStep,holdArm,lengthFactor,momentArm,gravityTorque,step,holdActivation};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Muscle=api;
})(this);
