'use strict';
(function(root){
 function step(state,force,p,dt){
  let {x,v}=state;const normal=p.mass*p.gravity;const air=-p.drag*v*Math.abs(v);const driving=force+air;
  if(Math.abs(v)<1e-8 && Math.abs(driving)<=p.muStatic*normal)return {x,v:0};
  const direction=Math.abs(v)>=1e-8?Math.sign(v):Math.sign(driving);
  let next=v+(driving-p.muKinetic*normal*direction)/p.mass*dt;
  if(v!==0 && Math.sign(next)!==Math.sign(v) && Math.abs(force)<=p.muStatic*normal)next=0;
  return {x:x+(v+next)*.5*dt,v:next};
 }
 function footContacts(nodes,floorY,radius){return nodes.filter(n=>(n.id==='lf'||n.id==='rf')&&n.y+radius>=floorY-.5).map(n=>n.id)}
 function humanStep(state,force,p,dt,grounded){return step(state,force,grounded?p:{...p,muStatic:0,muKinetic:0},dt)}
 // 歩行：立ち足が床を後ろへ押す力（＝床が体を前へ押す反力）を、摩擦の上限で打ち切る
 function walkStep(state,p,dt,grounded){
  let v=state.v,x=state.x;const N=p.mass*p.gravity,limit=p.muStatic*N,air=p.drag*v*Math.abs(v);
  const need=p.mass*(p.vTarget-v)/p.tau+air;let force=0,slip=false;
  if(grounded){if(Math.abs(need)<=limit)force=need;else{force=Math.sign(need)*p.muKinetic*N;slip=true}}
  const next=v+(force-air)/p.mass*dt;return {x:x+(v+next)*.5*dt,v:next,force,limit,slip};
 }
 const api={step,footContacts,humanStep,walkStep};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Physics=api;
})(globalThis);
