// 67 人気度グラフ（合成1本）+ 出来事の点 + ホバーカード
(function(){
const svg=document.getElementById('chart'),card=document.getElementById('card'),box=document.getElementById('chartbox');
const W=960,H=430,L=50,R=20,T=20,B=50,NS='http://www.w3.org/2000/svg';
const t=s=>new Date(s+'T00:00:00').getTime();
const pts=D.months.map((m,i)=>({x:t(m.slice(0,4)+'-'+m.slice(4)+'-15'),y:D.values[i]}));
const x0=t('2024-01-01'),x1=t('2026-10-01');
const X=v=>L+(v-x0)/(x1-x0)*(W-L-R), Y=v=>T+(1-v/100)*(H-T-B);
const el=(n,a,p)=>{const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);(p||svg).appendChild(e);return e};
// axes（方眼は背景のCSS。ここでは目盛りの数字だけ）
for(let v=0;v<=100;v+=20){if(v)el('line',{x1:L,x2:W-R,y1:Y(v),y2:Y(v),class:'gl'});const tx=el('text',{x:L-8,y:Y(v)+4,'text-anchor':'end',class:'ax'});tx.textContent=v;}
for(let y=2024;y<=2026;y++)for(let m=1;m<=12;m+=3){const v=t(`${y}-${String(m).padStart(2,'0')}-01`);if(v>x1)break;
  el('line',{x1:X(v),x2:X(v),y1:H-B,y2:H-B+5,stroke:'#4a463d'});const tx=el('text',{x:X(v),y:H-B+20,'text-anchor':'middle',class:'ax'});tx.textContent=`${y}/${m}`;}
el('line',{x1:L,x2:W-R,y1:H-B,y2:H-B,stroke:'#4a463d','stroke-width':1.5});
let tx=el('text',{x:W/2,y:H-8,'text-anchor':'middle',class:'ax'});tx.textContent='日付';
tx=el('text',{x:14,y:H/2,'text-anchor':'middle',class:'ax',transform:`rotate(-90 14 ${H/2})`});tx.textContent='人気度（頂点=100）';
// line（ボールペンの青）
const line=el('path',{d:pts.map((p,i)=>(i?'L':'M')+X(p.x).toFixed(1)+' '+Y(p.y).toFixed(1)).join(' '),class:'ln'});
// interpolate y at a date
const yAt=v=>{if(v<=pts[0].x)return pts[0].y;for(let i=1;i<pts.length;i++)if(v<=pts[i].x){const a=pts[i-1],b=pts[i];return a.y+(b.y-a.y)*(v-a.x)/(b.x-a.x)}return pts[pts.length-1].y};
let cur=null,lastType='mouse';
const go=e=>{location.href='event/'+e.id+'.html'};
function show(e,g){
  cur=e;document.querySelectorAll('.dot.on').forEach(d=>d.classList.remove('on'));g.classList.add('on');
  card.innerHTML=`<div class="d">${e.label}</div>${e.img?`<img src="img/${e.img}" alt="" width="250" height="140">`:''}<div class="t">${e.title}</div><div class="s">${e.text}</div><div class="more">${lastType==='mouse'?'クリックで詳しく':'もう一度タップで詳しく'}</div>`;
  card.style.display='block';card.style.pointerEvents=lastType==='mouse'?'none':'auto';
  const r=svg.getBoundingClientRect(),br=box.getBoundingClientRect(),s=r.width/W,px=r.left-br.left+X(t(e.date))*s,py=r.top-br.top+Y(yAt(t(e.date)))*s;
  const cw=card.offsetWidth,ch=card.offsetHeight;
  let left=Math.min(Math.max(px-cw/2,4),box.clientWidth-cw-4);
  let top=py-ch-16;
  if(top<4){ // 上に入らない時は点の横に出す
    const bw=box.clientWidth;
    if(px+18+cw<=bw-4) left=px+18; else if(px-18-cw>=4) left=px-cw-18;
    else { left=Math.min(Math.max(px-cw/2,4),bw-cw-4); top=py+18; } // 狭い画面は点の下
    if(top<4) top=Math.min(Math.max(py-ch/2,4),box.clientHeight-ch-4);
  }
  card.style.left=left+'px';card.style.top=top+'px';
}
function hide(){card.style.display='none';cur=null;document.querySelectorAll('.dot.on').forEach(d=>d.classList.remove('on'))}
// 赤ペンの書き込み（点から線を伸ばしてコメント）
const noteLayer=el('g',{});
D.events.forEach(e=>{const n=(D.notes||{})[e.id];if(!n)return;const cx=X(t(e.date)),cy=Y(yAt(t(e.date)));
  const tx=el('text',{class:'note',x:cx+n[1],y:cy+n[2],'text-anchor':n[3]},noteLayer);tx.textContent=n[0];});
D.events.forEach((e,i)=>{
  const cx=X(t(e.date)),cy=Y(yAt(t(e.date)));
  const g=el('g',{class:'dot',tabindex:0,role:'link','aria-label':`${i+1}. ${e.label} ${e.title}`});
  el('circle',{class:'hit',cx,cy,r:10},g);el('circle',{class:'v',cx,cy,r:9},g);
  const n=el('text',{x:cx,y:cy+4.5,'text-anchor':'middle'},g);n.textContent=i+1;
  g.addEventListener('pointerdown',ev=>{lastType=ev.pointerType});
  g.addEventListener('pointerenter',ev=>{if(ev.pointerType==='mouse'){lastType='mouse';show(e,g)}});
  g.addEventListener('pointerleave',ev=>{if(ev.pointerType==='mouse'&&cur===e)hide()});
  g.addEventListener('focus',()=>{if(g.matches(':focus-visible'))show(e,g)});g.addEventListener('blur',()=>{if(cur===e&&lastType!=='touch')hide()});
  g.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();go(e)}});
  g.addEventListener('click',ev=>{ev.stopPropagation();if(lastType==='mouse')go(e);else if(cur===e)go(e);else show(e,g)});
});
card.addEventListener('click',()=>{if(cur)go(cur)});
document.getElementById('scroller').addEventListener('scroll',hide);
document.addEventListener('click',ev=>{if(!card.contains(ev.target)&&!ev.target.closest('.dot'))hide()});
// スクロールで見えたら、線を左から描き、出来事の点を時間順に灯す
(function(){
  if(location.hash||matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
  const len=line.getTotalLength();line.style.strokeDasharray=len;line.style.strokeDashoffset=len;svg.classList.add('pre');
  const span=X(x1)-X(x0),DUR=2800;
  svg.querySelectorAll('.dot,.note').forEach(n=>{const b=n.getBBox();n.style.transitionDelay=Math.max(0,(b.x+b.width/2-L)/span*DUR-150)+'ms'});
  const io=new IntersectionObserver(es=>{if(!es[0].isIntersecting)return;io.disconnect();
    line.getBoundingClientRect();line.classList.add('drawing');line.style.strokeDashoffset=0;svg.classList.remove('pre');
    setTimeout(()=>svg.querySelectorAll('.dot,.note').forEach(n=>n.style.transitionDelay=''),DUR+600);},{threshold:.35});
  io.observe(svg);
})();
})();
