// 入り口の演出：黒い携帯（TikTok風）が開く → 30度ひねりながら画面に飛び込むと、もうサイトの中
(function(){const box=document.getElementById('intro');if(!box)return;const H=document.documentElement;
let sent=false;const fin=()=>{T.forEach(clearTimeout);box.classList.add('done');H.classList.remove('opening','go');if(!sent)dispatchEvent(new Event('introdone'))};
addEventListener('introdone',()=>sent=true,{once:true});
const T=[];
if(matchMedia('(prefers-reduced-motion: reduce)').matches||location.hash){window.INTRO=false;box.classList.add('done');return}
window.INTRO=true;H.classList.add('opening');
box.querySelector('.sk').onclick=fin;
T.push(setTimeout(()=>box.classList.add('s1'),150));
T.push(setTimeout(()=>{box.classList.add('s2');H.classList.add('go');dispatchEvent(new Event('introdone'))},1450));
T.push(setTimeout(fin,1450+700));})();
