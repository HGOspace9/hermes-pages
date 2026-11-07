'use strict';
(function(root){
 const frames=[{t:0,upper:-2.2,fore:-.75,blade:-1.85},{t:.45,upper:-1.25,fore:-.30,blade:-.85},{t:1,upper:-.15,fore:.20,blade:.52}];
 function sampleSword(time){const t=Math.max(0,Math.min(1,time)),i=t<=frames[1].t?0:1,a=frames[i],b=frames[i+1],u=(t-a.t)/(b.t-a.t),v=u*u*(3-2*u);return {upper:a.upper+(b.upper-a.upper)*v,fore:a.fore+(b.fore-a.fore)*v,blade:a.blade+(b.blade-a.blade)*v};}
 // 歩行の脚の形（見た目）：股関節を前後に振り、振り出す脚だけ膝を曲げる。1周期=左右1歩ずつ
 function sampleWalk(phase){const a=2*Math.PI*(((phase%1)+1)%1),c=Math.cos(a),hipL=.35*Math.sin(a);
  return {hipL,hipR:-hipL,kneeL:.9*Math.max(0,c),kneeR:.9*Math.max(0,-c),armL:-.6*hipL,armR:.6*hipL,stance:c<0?'lf':'rf'};}
 const api={sampleSword,sampleWalk};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Motion=api;
})(globalThis);
