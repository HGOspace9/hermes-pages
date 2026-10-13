// 一番下の壊れたボタン：ときどき文字化けして震える。押すと大きく乱れる（中身＝ロブロックス株価は次の回）
(function(){const b=document.getElementById('glitch');if(!b)return;
const t=b.querySelector('.glt'),BASE='ERR_67',JUNK='#%!?/<>_0123456789ABCDEFXZ',msg=document.getElementById('glmsg');
b.insertAdjacentHTML('beforeend','<span class="scan" aria-hidden="true"></span>');
const set=v=>{t.textContent=v;b.dataset.t=v};
const scramble=(n,ms)=>{let k=0;const iv=setInterval(()=>{set([...BASE].map(c=>Math.random()<.45?JUNK[Math.random()*JUNK.length|0]:c).join(''));if(++k>=n){clearInterval(iv);set(BASE)}},ms)};
const P=document.getElementById('rbx');
P.querySelector('.rbx-x').onclick=()=>{P.hidden=true;b.setAttribute('aria-expanded','false');b.focus()};
// ロブロックスの株価（オレンジ）と、後ろに67の人気度（灰色）を同じ時間軸で描く
let drawn=false;function draw(){if(drawn)return;drawn=true;
const nar=innerWidth<600,W=nar?480:900,H=nar?340:330,L=48,R=nar?34:40,T=18,B=30,t=s=>new Date(s).getTime(),t0=t('2024-01-01'),t1=t('2026-10-15');
// 検索数は「数独」（一年中ほぼ一定）を100とした大きさ。6 7とブレインロットは同じ物差し
const SM=60,X=v=>L+(v-t0)/(t1-t0)*(W-L-R),Y=v=>H-B-v/150*(H-T-B),YS=v=>H-B-v/SM*(H-T-B);
const p67=AN.six.map(([d,v])=>[X(t(d)),YS(v)]),pbr=AN.brainrot.map(([d,v])=>[X(t(d)),YS(v)]),prb=RB.map(([d,v])=>[X(t(d)),Y(v)]);
const path=a=>a.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join('');
let g='';[0,50,100,150].forEach(v=>{g+=`<line class="gd" x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ax" x="${L-8}" y="${Y(v)+4}" text-anchor="end">$${v}</text>`});
[0,20,40,60].forEach(v=>{g+=`<text class="ax s" x="${W-R+6}" y="${YS(v)+4}">${v}</text>`});
['2024','2025','2026'].forEach(y=>{const x=X(t(y+'-01-01'));g+=`<line class="gd" x1="${x}" x2="${x}" y1="${T}" y2="${H-B}"/><text class="ax" x="${x+4}" y="${H-10}">${y}</text>`});
const pk=a=>a.reduce((p,q)=>q[1]>p[1]?q:p),fd=s=>s.slice(0,4)+'年'+(+s.slice(5,7))+'月';
const hi=pk(RB),last=RB[RB.length-1],k6=pk(AN.six),kb=pk(AN.brainrot);
const lab=(x,y,txt,cls,anc)=>`<circle cx="${x}" cy="${y}" r="3.5" class="pd ${cls}"/><text class="lb ${cls}" x="${x+(anc==='end'?-8:8)}" y="${y-8}" text-anchor="${anc}">${txt}</text>`;
const ring=p=>`<circle class="rg" cx="${X(t(p[0]))}" cy="${Y(p[1])}" r="5.5"/>`;
const C=P.querySelector('.rbx-c');
C.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="ロブロックスの株価と、6 7とイタリアンブレインロットの検索数の推移">${g}
<path class="a67" d="${path(p67)}L${p67[p67.length-1][0]} ${H-B}L${p67[0][0]} ${H-B}Z"/><path class="l67" d="${path(p67)}"/><path class="lbr" d="${path(pbr)}"/><path class="lrb" d="${path(prb)}"/>
${lab(X(t(k6[0])),YS(k6[1]),nar?'6 7の山':'6 7の山（'+fd(k6[0])+'）','g',nar?'end':'start')}
${lab(X(t(kb[0])),YS(kb[1]),nar?'ブレインロットの山':'ブレインロットの山（'+fd(kb[0])+'）','b','end')}
${ring(hi)}${ring(last)}
<line class="hv-l" y1="${T}" y2="${H-B}" visibility="hidden"/><circle class="hv-c" r="5" visibility="hidden"/>
<rect class="hit" x="${L}" y="${T}" width="${W-L-R}" height="${H-T-B}"/></svg><div class="tip" hidden></div>`;
// 線の上をなぞると、その週のロブロックスの株価を出す
const sv=C.querySelector('svg'),hl=sv.querySelector('.hv-l'),hc=sv.querySelector('.hv-c'),tp=C.querySelector('.tip');
const show=e=>{const r=sv.getBoundingClientRect(),vx=(e.clientX-r.left)/r.width*W;
 let i=0,bd=1e9;prb.forEach((p,k)=>{const dd=Math.abs(p[0]-vx);if(dd<bd){bd=dd;i=k}});
 const[x,y]=prb[i],[d,v]=RB[i];hl.setAttribute('x1',x);hl.setAttribute('x2',x);hc.setAttribute('cx',x);hc.setAttribute('cy',y);
 hl.setAttribute('visibility','visible');hc.setAttribute('visibility','visible');
 tp.innerHTML=`<b>$${v.toFixed(2)}</b><span>${d.slice(0,4)}年${+d.slice(5,7)}月${+d.slice(8,10)}日の週</span>`;tp.hidden=false;
 const cr=C.getBoundingClientRect(),px=r.left-cr.left+x/W*r.width,py=r.top-cr.top+y/H*r.height,cw=C.clientWidth,tw=tp.offsetWidth,th=tp.offsetHeight;
 tp.style.left=Math.min(Math.max(px-tw/2,4),cw-tw-4)+'px';tp.style.top=(py-th-14<4?py+14:py-th-14)+'px'};
const hide=()=>{hl.setAttribute('visibility','hidden');hc.setAttribute('visibility','hidden');tp.hidden=true};
const ht=sv.querySelector('.hit');ht.addEventListener('pointermove',show);ht.addEventListener('pointerdown',show);ht.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')hide()});}
if(matchMedia('(prefers-reduced-motion: reduce)').matches){b.onclick=()=>{draw();P.hidden=false;b.setAttribute('aria-expanded','true')};return}
(function loop(){setTimeout(()=>{b.classList.add('burst');scramble(6,50);setTimeout(()=>b.classList.remove('burst'),380);loop()},700+Math.random()*1800)})();
b.addEventListener('mouseenter',()=>scramble(8,45));
b.onclick=()=>{b.classList.remove('boom');void b.offsetWidth;b.classList.add('boom');scramble(12,50);msg.hidden=false;setTimeout(()=>{b.classList.remove('boom');msg.hidden=true;openP()},650)};
function openP(){if(!P.hidden)return;draw();P.hidden=false;P.classList.remove('in');void P.offsetWidth;P.classList.add('in');b.setAttribute('aria-expanded','true');P.scrollIntoView({behavior:'smooth',block:'nearest'})}
})();
