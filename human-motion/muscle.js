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
const api={ARM,ARM2,armTorques,armStep,holdArm,lengthFactor,momentArm,gravityTorque,step,holdActivation};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Muscle=api;
})(this);
