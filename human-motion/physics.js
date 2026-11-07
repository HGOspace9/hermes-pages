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
 const api={step};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Physics=api;
})(globalThis);
