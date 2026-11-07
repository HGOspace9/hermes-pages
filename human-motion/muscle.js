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
const api={ARM,lengthFactor,momentArm,gravityTorque,step,holdActivation};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Muscle=api;
})(this);
