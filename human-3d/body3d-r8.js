// R8の計算の控え（R9で腰の回転・順番を入れる前）。テストで「腰を固定すると同じ数値」を確かめるためだけに使う
(function(root){
// R6：3D用の全身の計算（平面版 ../human-motion/body.js は書き換えない＝点検s）。
// 自由度 q=[x(腰の前後), q0(体幹の前傾), q1(肩を前に上げる), q2(肘), q4(体のひねり＝上から見た胸の回転), q5(手首を振りの面の中で曲げる＝コック／返す), q6(手首を面の外へ曲げる)]。
// R7：手首は肘から0.26mの所。手は0.08m（握りの位置は今までと同じ：肘から0.34m）。手首を固定するとR6と同じ式になる（テストで確認）。
// 座標は [前, 下, 左] （平面版の [前, 下] に左右を足したもの。腰の高さが下=0）。
// ひねりを0に固定すると、平面版と同じ式になる（テストで確認）。
// 質量行列などは、各部分の位置の式を数値で微分して作る（平面版の手書きの式を3Dに広げる代わり）。
// 床：前後の力F・左右の力Fl・上から見た回す力Mz を、足と床の摩擦（摩擦×体重）で支える。超えると足が滑る。
const isNode=typeof module!=='undefined'&&module.exports;
const Mu=isNode?require('../human-motion/muscle.js'):root.Muscle,Bd=isNode?require('../human-motion/body.js'):root.Body;
const {ARM,ARM2,MUS,fv,lengthFactor,momentArm,momentArmS,lengthFactorS,targetFor}=Mu,B=Bd.B,D=Math.PI/180,G=9.81;
// ひねりの値（仮の目安）：胴の上下の軸まわりの回りにくさ1.2kg·m²、腹斜筋など最大100Nm、最速12rad/s、可動域±45°
// 手首の値（仮の目安）：曲げる・返す筋肉 最大12Nm、最速15rad/s。振りの面の中は +25°（剣先を後ろへ倒す＝コック）〜−35°（返す）、面の外は±60°
const W3={lostDeg:10*Math.PI/180,HAND:0.08,f:12,vmax:15,damp:.05,I:.001,q5min:-35*Math.PI/180,q5max:25*Math.PI/180,q6max:60*Math.PI/180,cock:25*Math.PI/180};
// R8 両手持ちの値（仮の目安）：左手は右手の0.1m下で柄を握る。左腕の形は、左肩から握る位置へ届くように決まる（閉じた輪）。
// 両腕の筋肉は同じ向きに働くとみなし、肩と肘の筋力は2倍。手首は2本分＋両手の間隔で作る「てこ」（握る力300N×0.1m＝30Nm）で 12×2+30＝54Nm。
const H2={gap:0.10,wristF:54,L1:0.28,lHand:0.30}; // 見かけの腕：胸の中心から握りまで最大0.58m（左右の肩から0.61mまで届く）
const T3={SH:0.19,Iyaw:1.2,fTw:100,vmaxTw:12,dampTw:5,psMin:-45*D,psMax:45*D,rYaw:0.25,tolLat:0.08,wind:-30*D,brakeAt:-8*D};
const fvW=v=>fv(v*14/W3.vmax),cl=(v,hi=1)=>Math.max(0,Math.min(hi,v||0)),fvT=v=>fv(v*14/B.vmaxT),fvTw=v=>fv(v*14/T3.vmaxTw);
const add=(a,b,k=1)=>[a[0]+k*b[0],a[1]+k*b[1],a[2]+k*b[2]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
// 体の各点（名前つき）と、重さを持つ点の一覧
function geo(q,load){const two=load.hands===2,[x,q0,q1,q2,ps,q5=0,q6=0]=q,c=Math.cos(ps),s=Math.sin(ps),sw=load.sword||{m:0,c:0,L:0},w=load.w||0,a=ARM,p=ARM2;
 const fw=[c,0,s],lt=[-s,0,c],dn=[0,1,0],inpl=g=>add([Math.sin(g)*fw[0],0,Math.sin(g)*fw[2]],dn,Math.cos(g));
 const hip=[x,0,0],dT=[Math.sin(q0),-Math.cos(q0),0],C=add(hip,dT,B.Lt),S=add(C,lt,-T3.SH),LS=add(C,lt,T3.SH);
 // 両手持ち：振りの面は体の真ん中（胸の中心 C から）。肩・肘の角度 q1・q2 は「両腕でつくる三角形」をまとめた見かけの腕（上腕 H2.L1・前腕＋手 H2.lHand）の角度。
 // 本物の左右の腕は、それぞれの肩から握る位置へ届くように決まる（閉じた輪）。片手のときは今まで（R7）と同じ。
 const O=two?C:S,l1v=two?H2.L1:p.L1,lhv=two?H2.lHand:a.lHand;
 const d1=inpl(q1-q0),E=add(O,d1,l1v),d2=inpl(q1+q2-q0),Wr=add(E,d2,lhv-W3.HAND),dp=inpl(q1+q2-q0+q5),c6=Math.cos(q6),s6=Math.sin(q6),d3=[c6*dp[0]+s6*lt[0],c6*dp[1],c6*dp[2]+s6*lt[2]],H=add(Wr,d3,W3.HAND),L=sw.L||0,tip=add(H,d3,L);
 const rT=Math.sqrt(B.IT/B.mT),k=Math.sqrt(.3),mass=[[B.mLeg,hip],[B.mT/2,add(hip,dT,B.cT+rT)],[B.mT/2,add(hip,dT,B.cT-rT)]];
 const ik=(Sh,P,side)=>{const r=[P[0]-Sh[0],P[1]-Sh[1],P[2]-Sh[2]],dd=Math.hypot(...r),u=r.map(v=>v/dd),l1=p.L1,l2=a.lHand,dc=Math.min(dd,l1+l2-1e-4);
  const pole=add(lt,[0,1,0],side),pp=add(pole,u,-dot(pole,u)),pn=Math.hypot(...pp)||1,n=pp.map(v=>v/pn),ca=(l1*l1+dc*dc-l2*l2)/(2*l1*dc),sa=Math.sqrt(Math.max(0,1-ca*ca));
  const El=add(add(Sh,u,l1*ca),n,l1*sa),Hd=add(Sh,u,dc),e1=[El[0]-Sh[0],El[1]-Sh[1],El[2]-Sh[2]].map(v=>v/l1),e2=[Hd[0]-El[0],Hd[1]-El[1],Hd[2]-El[2]].map(v=>v/l2);
  mass.push([p.m1/2,add(Sh,e1,p.c1*(1+k))],[p.m1/2,add(Sh,e1,p.c1*(1-k))],[a.mForearm/2,add(El,e2,a.rCom*(1+k))],[a.mForearm/2,add(El,e2,a.rCom*(1-k))]);return {E:El,H:Hd,ok:dd<=l1+l2}};
 let LE=null,LH=null,RE=E,reach=true;
 if(two){const r=ik(S,H,-1),l=ik(LS,add(H,d3,-H2.gap),1);RE=r.E;LE=l.E;LH=l.H;reach=r.ok&&l.ok}
 else mass.push([p.m1/2,add(S,d1,p.c1*(1+k))],[p.m1/2,add(S,d1,p.c1*(1-k))],[a.mForearm/2,add(E,d2,a.rCom*(1+k))],[a.mForearm/2,add(E,d2,a.rCom*(1-k))]);
 if(w)mass.push([w,H]);if(sw.m){const r=L/Math.sqrt(12);mass.push([sw.m/2,add(Wr,d3,W3.HAND+sw.c+r)],[sw.m/2,add(Wr,d3,W3.HAND+sw.c-r)])}
 return {mass,hip,C,S,LS,E,RE,W:Wr,H,tip,u:d3,uArm:d2,fw,lt,L,LE,LH,reach,two,O}}
function solve(A,b){const n=b.length,M=A.map((r,i)=>[...r,b[i]]);for(let i=0;i<n;i++){let p=i;for(let k=i+1;k<n;k++)if(Math.abs(M[k][i])>Math.abs(M[p][i]))p=k;[M[i],M[p]]=[M[p],M[i]];for(let k=i+1;k<n;k++){const f=M[k][i]/M[i][i];for(let j=i;j<=n;j++)M[k][j]-=f*M[i][j]}}
 const x=Array(n).fill(0);for(let i=n-1;i>=0;i--){let s=M[i][n];for(let j=i+1;j<n;j++)s-=M[i][j]*x[j];x[i]=s/M[i][i]}return x}
// 運動方程式の材料：質量行列M、振り回しの力h、重さの力Qg（平面版と同じ形）。Jは各点の動きやすさ、bは速さだけで生まれる加速度
function dyn(q,qd,load){const NQ=q.length,g0=geo(q,load),n=g0.mass.length,hh=1e-6,J=g0.mass.map(()=>[]);
 for(let j=0;j<NQ;j++){const qp=q.slice(),qm=q.slice();qp[j]+=hh;qm[j]-=hh;const P=geo(qp,load).mass,Mm=geo(qm,load).mass;for(let i=0;i<n;i++)J[i][j]=[0,1,2].map(k=>(P[i][1][k]-Mm[i][1][k])/(2*hh))}
 const sp=Math.hypot(...qd),e=sp>0?1e-4/sp:0,b=g0.mass.map(()=>[0,0,0]);
 if(sp>0){const P=geo(q.map((v,i)=>v+e*qd[i]),load).mass,Mm=geo(q.map((v,i)=>v-e*qd[i]),load).mass;for(let i=0;i<n;i++)b[i]=[0,1,2].map(k=>(P[i][1][k]-2*g0.mass[i][1][k]+Mm[i][1][k])/(e*e))}
 const M=[...Array(NQ)].map(()=>Array(NQ).fill(0)),h=Array(NQ).fill(0),Qg=Array(NQ).fill(0);let mt=0;
 for(let i=0;i<n;i++){const m=g0.mass[i][0];mt+=m;for(let r=0;r<NQ;r++){h[r]+=m*dot(J[i][r],b[i]);Qg[r]+=m*G*J[i][r][1];for(let c=0;c<NQ;c++)M[r][c]+=m*dot(J[i][r],J[i][c])}}
 M[4][4]+=T3.Iyaw;if(NQ>5){M[5][5]+=W3.I;M[6][6]+=W3.I}return {g:g0,J,b,M,h,Qg,mt}}
function maxT(s,two){const k2=two?2:1,wf=two?H2.wristF:W3.f;return {tf:B.fTflex*fvT(s.w0),te:B.fText*fvT(-s.w0),up:k2*MUS.fUp*lengthFactorS(s.q1)*momentArmS(s.q1)*fv(s.w1),down:k2*MUS.fDown*.03*fv(-s.w1),flex:k2*MUS.fFlex*lengthFactor(s.q2)*momentArm(s.q2)*fv(s.w2),ext:k2*MUS.fExt*.02*fv(-s.w2),tw:T3.fTw*fvTw(s.w4),tb:T3.fTw*fvTw(-s.w4),wc:wf*fvW(s.w5||0),wu:wf*fvW(-(s.w5||0)),wl:wf*fvW(s.w6||0),wr:wf*fvW(-(s.w6||0))}}
// s={x,vx,q0,w0,q1,w1,q2,w2,q4,w4}（q4=ひねり。正＝右肩が前へ）。act に tw（ひねって右肩を前へ）・tb（戻す）を追加
// opt：mu, lock（体幹と足を固定）, twist（false=ひねり固定）, yaw（false=床のひねり・左右の判定をしない＝平面版と同じ）
function bodyStep(s,act,load,dt,opt={}){const mu=opt.mu??.6,tw=!!opt.twist,wr=!!opt.wrist,yaw=opt.yaw!==false,q=[s.x,s.q0,s.q1,s.q2,s.q4,s.q5||0,s.q6||0],qd=[s.vx,s.w0,s.w1,s.w2,s.w4,s.w5||0,s.w6||0],{g,J,b,M,h,Qg,mt}=dyn(q,qd,load),T=maxT(s,load.hands===2);
 const tau=[0,cl(act.tf)*T.tf-cl(act.te)*T.te,cl(act.up)*T.up-cl(act.down)*T.down,cl(act.flex)*T.flex-cl(act.ext)*T.ext,tw?cl(act.tw)*T.tw-cl(act.tb)*T.tb:0,wr?cl(act.wc)*T.wc-cl(act.wu)*T.wu:0,wr?cl(act.wl)*T.wl-cl(act.wr)*T.wr:0];
 const damp=[0,B.dampT*s.w0,ARM2.damp1*s.w1,ARM.damp*s.w2,T3.dampTw*s.w4,W3.damp*(s.w5||0),W3.damp*(s.w6||0)],tau4=tau[4];
 const fix=[...(tw?[]:[[4,0]]),...(wr?[]:[[5,0],[6,0]])],fixed=fix.map(f=>f[0]),fr=mu*mt*G,keep=l=>l.filter(i=>!fixed.includes(i));
 // 1回分の計算（ひねりの力を k 倍にして）
 const run=k=>{tau[4]=tau4*k;const rhs=q.map((_,i)=>Qg[i]+tau[i]-h[i]-damp[i]);
  const sub=(free,pres)=>{const A=free.map(i=>free.map(j=>M[i][j])),bb=free.map(i=>rhs[i]-pres.reduce((t,[j,a])=>t+M[i][j]*a,0)),sol=solve(A,bb),acc=Array(q.length).fill(0);pres.forEach(([j,a])=>acc[j]=a);free.forEach((i,k)=>acc[i]=sol[k]);return acc};
  const FofA=ac=>M[0].reduce((t,v,j)=>t+v*ac[j],0)-rhs[0];
  // 左右の力Flと、上から見て体を回す力Mz（腰の真下のまわり）。床が支える
  const side=ac=>{let Fl=0,Mz=T3.Iyaw*ac[4];for(let i=0;i<g.mass.length;i++){const m=g.mass[i][0],a=[0,1,2].map(k=>J[i].reduce((t,Jj,j)=>t+Jj[k]*ac[j],0)+b[i][k]),r=g.mass[i][1];Fl+=m*a[2];Mz+=m*((r[0]-s.x)*a[2]-r[2]*a[0])}return [Fl,Mz]};
  // 床の摩擦の使い方：前後F・左右Fl・回す力Mz/rYaw を合わせて「摩擦×体重」まで（摩擦の円の考え）。yaw=false なら平面版と同じく前後だけ
  const budget=ac=>{if(!yaw)return fr;const [Fl,Mz]=side(ac),o=Fl*Fl+(Mz/T3.rYaw)**2;return Math.sqrt(Math.max(0,fr*fr-o))};
  let acc,F=0,slip=false;
  if(opt.lock){acc=sub(keep([2,3,4,5,6]),[[0,0],[1,0],...fix]);F=FofA(acc)}
  else{const lim=B.legF*mt*G,vWant=act.step?Math.min(B.vStep,Math.sqrt(2*B.stopA*Math.max(0,B.stepLen-s.x))):0,ax=Math.max(-lim/mt,Math.min(lim/mt,B.kx*(vWant-s.vx)));
   const free=keep([1,2,3,4,5,6]),Fof=a0=>{const ac=sub(free,[[0,a0],...fix]);return [ac,FofA(ac)]};
   [acc,F]=Fof(ax);const bud=budget(acc);
   if(Math.abs(F)>bud){
    // 脚は滑らない範囲まで踏み込みの力を弱める（平面版と同じ）。ひねりや左右の力に摩擦を使う分だけ、前後に使える分は減る
    const [ac0,F0]=Fof(0),bud0=budget(ac0);
    if(Math.abs(F0)<=bud0){const tgt=Math.sign(F)*Math.min(bud,bud0),a2=ax*(tgt-F0)/(F-F0);[acc,F]=Fof(a2)}
    else{F=Math.sign(F0)*Math.min(fr,Math.max(bud0,0));slip=true;rhs[0]+=F;acc=sub(keep([0,1,2,3,4,5,6]),fix)}}}
  const [Fl,Mz]=side(acc),need=yaw?Math.sqrt(F*F+Fl*Fl+(Mz/T3.rYaw)**2):Math.abs(F);if(yaw&&!opt.lock&&need>fr*1.0001)slip=true;
  return {acc,F,Fl,Mz,need,slip}};
 let R=run(1);
 // ひねりの筋肉も、足が滑らない範囲まで力を加減する（人は床に合わせて加減する。踏み込みと同じ考え）
 if(R.slip&&tw&&tau4!==0&&!opt.lock){const R0=run(0);if(!R0.slip){let lo=0,hi=1;for(let i=0;i<10;i++){const m=(lo+hi)/2;run(m).slip?hi=m:lo=m}R=run(lo)}else R=R0}
 const {acc,F,Fl,Mz,need,slip}=R,yawSlip=slip&&yaw&&Math.abs(F)<need*.999;
 const n={vx:s.vx+acc[0]*dt,w0:s.w0+acc[1]*dt,w1:s.w1+acc[2]*dt,w2:s.w2+acc[3]*dt,w4:s.w4+acc[4]*dt,w5:(s.w5||0)+acc[5]*dt,w6:(s.w6||0)+acc[6]*dt};
 n.x=s.x+n.vx*dt;n.q0=s.q0+n.w0*dt;n.q1=s.q1+n.w1*dt;n.q2=s.q2+n.w2*dt;n.q4=s.q4+n.w4*dt;n.q5=(s.q5||0)+n.w5*dt;n.q6=(s.q6||0)+n.w6*dt;
 if(n.q0<B.q0min){n.q0=B.q0min;n.w0=Math.max(0,n.w0)}if(n.q0>B.q0max){n.q0=B.q0max;n.w0=Math.min(0,n.w0)}
 if(n.q1<0){n.q1=0;n.w1=Math.max(0,n.w1)}if(n.q1>ARM2.q1max){n.q1=ARM2.q1max;n.w1=Math.min(0,n.w1)}
 if(n.q2<ARM.min){n.q2=ARM.min;n.w2=Math.max(0,n.w2)}if(n.q2>ARM.max){n.q2=ARM.max;n.w2=Math.min(0,n.w2)}
 if(n.q4<T3.psMin){n.q4=T3.psMin;n.w4=Math.max(0,n.w4)}if(n.q4>T3.psMax){n.q4=T3.psMax;n.w4=Math.min(0,n.w4)}
 if(n.q5<W3.q5min){n.q5=W3.q5min;n.w5=Math.max(0,n.w5)}if(n.q5>W3.q5max){n.q5=W3.q5max;n.w5=Math.min(0,n.w5)}if(n.q6<-W3.q6max){n.q6=-W3.q6max;n.w6=Math.max(0,n.w6)}if(n.q6>W3.q6max){n.q6=W3.q6max;n.w6=Math.min(0,n.w6)}
 return {s:n,F,Fl,Mz,N:mt*G,slip,yawSlip,g,tau,Qg,used:Math.abs(F)/(mt*G),use:need/(mt*G)}}
// 両手持ちで体幹・肩・肘を狙いの姿勢に保つ力（平面版 hold と同じ強さのばね。重さは3Dの計算＝左腕も含む）
function hold3(goal,s,load,strength){const q=[s.x,s.q0,s.q1,s.q2,s.q4||0,s.q5||0,s.q6||0],{Qg}=dyn(q,[0,0,0,0,0,0,0],load),T=maxT({...s,w0:0,w1:0,w2:0},true),o={};
 const g=(i,gq,k,b,pos,neg,cur,w)=>{if(gq==null)return;const t=-Qg[i]+k*(gq-cur)-b*w;o[pos]=t>0?Math.min(strength,t/T[pos]):0;o[neg]=t<0?Math.min(strength,-t/T[neg]):0};
 g(1,goal[0],400,60,'tf','te',s.q0,s.w0);g(2,goal[1],60,6,'up','down',s.q1,s.w1);g(3,goal[2],40,3,'flex','ext',s.q2,s.w2);return o}
// 手首を狙いの角度に保つ力（重さの打ち消し＋ばね）。Qg は直前の計算の重さの力
function holdWr(g5,g6,s,Qg,strength,two){const T=maxT({...s,w5:0,w6:0},two),o={},kk=two?H2.wristF/W3.f:1,f=(gq,cur,w,qg,pos,neg)=>{const t=-(qg||0)+kk*(25*(gq-cur)-1.2*w);o[pos]=t>0?Math.min(strength,t/T[pos]):0;o[neg]=t<0?Math.min(strength,-t/T[neg]):0};
 f(g5,s.q5||0,s.w5||0,Qg&&Qg[5],'wc','wu');f(g6,s.q6||0,s.w6||0,Qg&&Qg[6],'wl','wr');return o}
// ひねりを狙いの角度に保つ力
function holdTw(goal,s,strength,two){const T=maxT({...s,w4:0},two),t=150*(goal-s.q4)-20*s.w4;return {tw:t>0?Math.min(strength,t/T.tw):0,tb:t<0?Math.min(strength,-t/T.tb):0}}
// 刃が目標物を横切ったか（腕の振りの面の中で判定。面から外れた距離が tolLat 以内のときだけ当たり）
function blade(g,T){const r=[T[0]-g.H[0],T[1]-g.H[1],T[2]-g.H[2]],a=dot(r,g.fw),bb=r[1],o=dot(r,g.lt),uf=dot(g.u,g.fw),ud=g.u[1],along=uf*a+ud*bb,t=Math.max(0,Math.min(g.L,along)),p=add(g.H,g.u,t);
 return {cross:uf*bb-ud*a,along,out:o,dist:Math.hypot(T[0]-p[0],T[1]-p[1],T[2]-p[2])}}
// mode：'なし'／'同時'／'順番'（平面版と同じ意味）。twist：false=ひねり固定（腕のみ）／'only'=ひねりのみ（腕は振りかぶった形のまま）／'both'=ひねり＋腕
// 点検aa：決まった言葉以外はエラーにする（打ち間違いに気づけるように）
const OK={mode:['なし','同時','順番',undefined],twist:[false,'only','both',undefined],wrist:[false,'hold','snap',undefined],hands:[1,2,undefined]};
function check(opt){for(const k of Object.keys(OK))if(!OK[k].includes(opt[k]))throw new Error(`設定「${k}」に使えない値です：${JSON.stringify(opt[k])}（使える値：${OK[k].filter(v=>v!==undefined).map(v=>JSON.stringify(v)).join('・')}）`)}
function makeBodySwing(load0,strength=1,opt={}){check(opt);const two=opt.hands===2,load=two?{...load0,hands:2}:load0;const mode=opt.mode||'同時',mu=opt.mu??.6,lock=mode==='なし',twist=lock?false:(opt.twist||false),tg=targetFor(load),T=opt.target||{x:tg.x,y:-B.Lt+tg.y};
 const wrist=opt.wrist||false,so={mu,lock,twist:!!twist,wrist:!!wrist,yaw:opt.yaw};
 const st={mode,twist,wrist,two,mu,wristDev:0,target:T,t:0,since:0,phase:'構え',stage:0,s:{x:0,vx:0,q0:0,w0:0,q1:35*D,w1:0,q2:35*D,w2:0,q4:0,w4:0,q5:0,w5:0,q6:0,w6:0},hit:null,minDist:1e9,v:0,maxV:0,prevTip:null,prevC:null,act:{},maxFr:0,slipT:0,maxW0:0,maxW4:0,F:0};
 const go=p=>{st.phase=p;st.since=0};
 st.step=dt=>{const s=st.s;
  if(st.phase==='構え'&&st.since>=.1)go('振りかぶり');
  if(st.phase==='振りかぶり'&&st.since>=.15){const near=Math.abs(s.q1-150*D)<12*D&&Math.abs(s.q2-110*D)<15*D,still=Math.abs(s.w1)<.4&&Math.abs(s.w2)<.6&&Math.abs(s.w0)<.5&&Math.abs(s.w4)<.6;
   if((still&&(near||st.since>=.4))||st.since>=1.5){st.raise={q0:s.q0,q1:s.q1,q2:s.q2,q4:s.q4,q5:s.q5||0,t:st.since};if(wrist)st.wristDev=Math.max(st.wristDev,Math.abs((s.q5||0)-(wrist==='snap'?W3.cock:0)));st.stage=0;go('打ち込み')}}
  if(st.phase==='止め'&&((Math.abs(s.w1)<.8&&Math.abs(s.w2)<.8&&Math.abs(s.w0)<.8&&Math.abs(s.w4)<.8)||st.since>=.6))go('戻し');
  if(st.phase==='戻し'&&st.since>=.5)go('残心');
  let a,hd=two?hold3:Bd.hold;
  if(st.phase==='構え'){a=hd([lock?null:0,35*D,35*D],s,load,strength);if(twist)Object.assign(a,holdTw(0,s,strength,two))}
  else if(st.phase==='振りかぶり'){a=hd([lock?null:-10*D,150*D,110*D],s,load,strength);if(twist)Object.assign(a,holdTw(T3.wind,s,strength,two))}
  else if(st.phase==='戻し'||st.phase==='残心'){a=hd([lock?null:0,25*D,15*D],s,load,strength);if(twist)Object.assign(a,holdTw(0,s,strength,two))}
  else if(st.phase==='止め'){const b=v=>Math.min(strength,Math.abs(v)*.25);a={tf:s.w0<0?b(s.w0):0,te:s.w0>0?b(s.w0):0,up:s.w1<0?b(s.w1):0,down:s.w1>0?b(s.w1):0,flex:s.w2<0?b(s.w2):0,ext:s.w2>0?b(s.w2):0,tw:s.w4<0?b(s.w4):0,tb:s.w4>0?b(s.w4):0}}
  else{const R=st.raise;
   if(mode==='なし')a={down:strength,ext:strength};
   else if(mode==='同時')a={tf:strength,down:strength,ext:strength,step:true};
   else{if(st.stage===0&&s.q0-R.q0>(opt.trunkDeg??25)*D){st.stage=1;st.trunkStopAt=st.since}
    if(st.stage===1&&R.q1-s.q1>(opt.switchDeg??35)*D){st.stage=2;st.elbowAt=st.since}
    const armHold=hd([null,R.q1,R.q2],s,load,strength);
    if(st.stage===0)a={tf:strength,step:true,up:armHold.up,down:armHold.down,flex:armHold.flex,ext:armHold.ext};
    else{a={te:s.w0>.2?Math.min(strength,s.w0*.3):0,step:true,down:strength};if(st.stage===1){const e=hd([null,null,R.q2],s,load,strength);a.flex=e.flex;a.ext=e.ext}else a.ext=strength}}
   if(twist==='only'){const ah=hd([null,R.q1,R.q2],s,load,strength);Object.assign(a,{up:ah.up,down:ah.down,flex:ah.flex,ext:ah.ext})}
   if(twist){// ひねり：右肩を前へ全力。正面に近づいたら（brakeAt）ブレーキで止める
    if(s.q4<T3.brakeAt)Object.assign(a,{tw:strength,tb:0});else Object.assign(a,{tw:0,tb:s.w4>0?Math.min(strength,s.w4*.3):0})}}
  if(wrist){// R7 手首：'hold'＝まっすぐに保つ／'snap'＝振りかぶりで剣先を後ろへ倒し（コック）、打ち込みで全力で返す
   const ph=st.phase,cock=wrist==='snap'&&(ph==='振りかぶり');let w;
   if(ph==='打ち込み'&&wrist==='snap')w={...holdWr(0,0,s,st.Qg,strength,two),wc:0,wu:(s.q5||0)>W3.q5min+5*D?strength:0};
   else if(ph==='止め'){const b=v=>Math.min(strength,Math.abs(v)*.02);w={...holdWr(0,0,s,st.Qg,strength,two),wc:(s.w5||0)<0?b(s.w5):0,wu:(s.w5||0)>0?b(s.w5):0}}
   else w=holdWr(cock?W3.cock:0,0,s,st.Qg,strength,two);Object.assign(a,w)}
  st.act=a;
  if(wrist==='hold'&&!st.hit&&(st.phase==='振りかぶり'||st.phase==='打ち込み'))st.wristDev=Math.max(st.wristDev,Math.abs(s.q5||0)); // 点検z：保つ間ずっと見張る
  const r=bodyStep(s,a,load,dt,so);st.Qg=r.Qg;st.F=r.F;st.Fl=r.Fl;st.Mz=r.Mz;st.slip=r.slip;st.yawSlip=r.yawSlip;st.use=r.use;if(!lock)st.maxFr=Math.max(st.maxFr,r.use);st.used=r.used;if(r.slip)st.slipT+=dt;
  st.s=r.s;const g=geo([r.s.x,r.s.q0,r.s.q1,r.s.q2,r.s.q4,r.s.q5,r.s.q6],load);st.g=g;if(two&&!g.reach)st.reachMiss=(st.reachMiss||0)+dt;
  if(st.prevTip)st.v=Math.hypot(g.tip[0]-st.prevTip[0],g.tip[1]-st.prevTip[1],g.tip[2]-st.prevTip[2])/dt;
  if(!st.hit&&!st.fail&&(st.phase==='振りかぶり'||st.phase==='打ち込み')&&r.slip){st.preSlip=(st.preSlip||0)+dt;if(st.preSlip>=B.slipFail){st.fail={t:st.t,phase:st.phase,yaw:!!r.yawSlip};go('止め')}}
  if(st.phase==='打ち込み'){st.maxW0=Math.max(st.maxW0,r.s.w0);st.maxW4=Math.max(st.maxW4,r.s.w4);st.maxV=Math.max(st.maxV,st.v);
   const TT=[r.s.x+T.x,T.y,two?0:-T3.SH];st.targetNow=TT;const c=blade(g,TT);st.minDist=Math.min(st.minDist,c.dist);
   // 球の目標物：刃が球に触れた瞬間に当たり（その時の剣先の速さ）。点の目標物：刃が目標物を横切った瞬間（平面版と同じ）
   const hitNow=opt.targetR!=null?(st.prevC!==null&&st.prevC>0&&c.dist<=opt.targetR):(st.prevC!==null&&st.prevC>0&&c.cross<=0&&c.along>=0&&c.along<=g.L&&Math.abs(c.out)<=T3.tolLat);
   if(hitNow){st.hit={v:st.v,t:st.t,x:r.s.x,q0:r.s.q0,q1:r.s.q1,q2:r.s.q2,q4:r.s.q4,q5:r.s.q5,q6:r.s.q6,out:c.out};if(wrist==='hold')st.wristDev=Math.max(st.wristDev,Math.abs(r.s.q5));go('止め')}
   else if(st.since>=.8)go('止め');st.prevC=c.cross}
  st.prevTip=g.tip;st.t+=dt;st.since+=dt;return st};
 return st}
function simulateBody(load,strength=1,opt={},sec=2.5,dt=.0005){const sw=makeBodySwing(load,strength,opt);let maxX=0;for(let i=0;i<sec/dt;i++){sw.step(dt);maxX=Math.max(maxX,sw.s.x)}
 return {wristDev:sw.wristDev,wristLost:!!sw.wrist&&sw.wristDev>W3.lostDeg,wristAtHit:sw.hit?sw.hit.q5:null,reachMiss:sw.reachMiss||0,fail:sw.fail||null,hit:sw.hit,hitV:sw.hit?sw.hit.v:0,minDist:sw.hit?0:(sw.fail||sw.minDist>=1e8)?null:sw.minDist,gap:sw.hit?0:(sw.fail||sw.minDist>=1e8)?null:Math.max(0,sw.minDist-(opt.targetR||0)),maxV:sw.maxV,maxUse:sw.maxFr,slipT:sw.slipT,maxW0:sw.maxW0,maxW4:sw.maxW4,maxX,end:sw.s,raise:sw.raise}}
const TARGET_R=0.10; // 目標物の半径（頭くらいの球）
const api={H2,check,W3,TARGET_R,T3,geo,dyn,bodyStep,makeBodySwing,simulateBody,blade};if(isNode)module.exports=api;else root.Body3D_R8=api;
})(globalThis);
