// 得点板の7セグメント数字。開いた時に 00 から 67 まで得点が入るように数える
(function(){const SEG={0:"abcdef",1:"bc",2:"abged",3:"abgcd",4:"fgbc",5:"afgcd",6:"afgedc",7:"abc",8:"abcdefg",9:"abcfgd"};
const P={a:"12,4 48,4 42,10 18,10",b:"50,6 50,46 44,41 44,12",c:"50,54 50,94 44,88 44,59",d:"12,96 48,96 42,90 18,90",e:"10,54 16,59 16,88 10,94",f:"10,6 16,12 16,41 10,46",g:"13,50 18,45 42,45 47,50 42,55 18,55"};
const draw=(el,n)=>{el.innerHTML=[...n].map(d=>`<svg viewBox="0 0 60 100" aria-hidden="true">${Object.keys(P).map(k=>`<polygon points="${P[k]}" class="${SEG[d].includes(k)?'on':'off'}"/>`).join('')}</svg>`).join('')};
document.querySelectorAll('.seg[data-n]').forEach(e=>{if(e.id!=='score')draw(e,e.dataset.n)});
const el=document.getElementById('score');if(!el)return;
if(matchMedia('(prefers-reduced-motion: reduce)').matches){draw(el,'67');return}
const seq=['00','06','16','26','36','46','56','66','67'];let i=0;draw(el,'00');
const go=()=>setTimeout(function tick(){draw(el,seq[i]);if(++i<seq.length)setTimeout(tick,i<seq.length-1?110:260)},500);
if(window.INTRO)addEventListener('introdone',go,{once:true});else go();})();
