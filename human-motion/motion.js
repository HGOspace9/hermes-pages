'use strict';
(function(root){
 const frames=[{t:0,upper:-2.2,fore:-.75,blade:-1.85},{t:.45,upper:-1.25,fore:-.30,blade:-.85},{t:1,upper:-.15,fore:.20,blade:.52}];
 function sampleSword(time){const t=Math.max(0,Math.min(1,time)),i=t<=frames[1].t?0:1,a=frames[i],b=frames[i+1],u=(t-a.t)/(b.t-a.t),v=u*u*(3-2*u);return {upper:a.upper+(b.upper-a.upper)*v,fore:a.fore+(b.fore-a.fore)*v,blade:a.blade+(b.blade-a.blade)*v};}
 const api={sampleSword};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Motion=api;
})(globalThis);
