(function(root){
// 3-e-g-2：体幹（腰から上の前傾）＋踏み込み＋右腕（肩・肘）＋剣。横から見た図、x=前、y=下。片手持ちのみ。
// 自由度 q=[x(腰の前後位置), q0(体幹の前傾), q1(肩を前に上げる), q2(肘の曲げ)]。平面の連結体の運動方程式（質量行列＋遠心・振り回しの力）。
// 床：足が床を押せる横向きの力は「摩擦×体重」まで（3-dの歩行と同じ考え）。超えると足が滑る。体幹を回す・踏み込むと体全体の前後の勢いが変わるので、その分の力を床からもらう必要がある。
const Mu=(typeof module!=='undefined'&&module.exports)?require('./muscle.js'):root.Muscle;
const {ARM,ARM2,MUS,fv,lengthFactor,momentArm,momentArmS,lengthFactorS,targetFor}=Mu;
const D=Math.PI/180,G=9.81;
const B={mLeg:20,mT:45,cT:0.30,IT:1.6,Lt:0.55,dampT:8,q0min:-25*D,q0max:60*D,fTflex:200,fText:260,vmaxT:6,legF:0.9,vStep:1.0,kx:12,hHip:0.9,stepLen:0.3,stopA:3,slipFail:0.02};
const cl=(v,hi=1)=>Math.max(0,Math.min(hi,v||0));
const fvT=v=>fv(v*14/B.vmaxT);
function bodies(q,qd,load){const [x,q0,q1,q2]=q,[,w0,w1,w2]=qd,sw=load.sword||{m:0,c:0,L:0},w=load.w||0,a=ARM,p=ARM2;
 const st=Math.sin(q0),ct=Math.cos(q0),dT=[st,-ct],dTq=[ct,st],bT=[-st*w0*w0,ct*w0*w0];
 const f1=q1-q0,f2=q1+q2-q0,d1=[Math.sin(f1),Math.cos(f1)],dd1=[Math.cos(f1),-Math.sin(f1)],d2=[Math.sin(f2),Math.cos(f2)],dd2=[Math.cos(f2),-Math.sin(f2)],v1=w1-w0,v2=w1+w2-w0,J1=[0,-1,1,0],J2=[0,-1,1,1];
 const pt=(base,Jb,bb,l,dir,ddir,Jf,vf)=>({p:[base[0]+l*dir[0],base[1]+l*dir[1]],J:Jb.map((j,i)=>[j[0]+l*ddir[0]*Jf[i],j[1]+l*ddir[1]*Jf[i]]),b:[bb[0]-l*dir[0]*vf*vf,bb[1]-l*dir[1]*vf*vf]});
 const hipJ=[[1,0],[0,0],[0,0],[0,0]],hip={p:[x,0],J:hipJ,b:[0,0]};
 const trunkPt=l=>({p:[x+l*dT[0],l*dT[1]],J:[[1,0],[l*dTq[0],l*dTq[1]],[0,0],[0,0]],b:[l*bT[0],l*bT[1]]});
 const S=trunkPt(B.Lt),E=pt(S.p,S.J,S.b,p.L1,d1,dd1,J1,v1);
 const list=[{m:B.mLeg,I:0,Jw:[0,0,0,0],...hip},{m:B.mT,I:B.IT,Jw:[0,1,0,0],...trunkPt(B.cT)},
  {m:p.m1,I:.3*p.m1*p.c1*p.c1,Jw:J1,...pt(S.p,S.J,S.b,p.c1,d1,dd1,J1,v1)},
  {m:a.mForearm,I:.3*a.mForearm*a.rCom*a.rCom,Jw:J2,...pt(E.p,E.J,E.b,a.rCom,d2,dd2,J2,v2)}];
 if(w)list.push({m:w,I:0,Jw:J2,...pt(E.p,E.J,E.b,a.lHand,d2,dd2,J2,v2)});
 if(sw.m)list.push({m:sw.m,I:sw.m*(sw.L||0)**2/12,Jw:J2,...pt(E.p,E.J,E.b,a.lHand+sw.c,d2,dd2,J2,v2)});
 const H=[E.p[0]+a.lHand*d2[0],E.p[1]+a.lHand*d2[1]];
 return {list,S:S.p,E:E.p,H,u:d2,tip:[H[0]+(sw.L||0)*d2[0],H[1]+(sw.L||0)*d2[1]],L:sw.L||0}}
function solve(A,b){const n=b.length,M=A.map((r,i)=>[...r,b[i]]);for(let i=0;i<n;i++){let p=i;for(let k=i+1;k<n;k++)if(Math.abs(M[k][i])>Math.abs(M[p][i]))p=k;[M[i],M[p]]=[M[p],M[i]];for(let k=i+1;k<n;k++){const f=M[k][i]/M[i][i];for(let j=i;j<=n;j++)M[k][j]-=f*M[i][j]}}
 const x=Array(n).fill(0);for(let i=n-1;i>=0;i--){let s=M[i][n];for(let j=i+1;j<n;j++)s-=M[i][j]*x[j];x[i]=s/M[i][i]}return x}
function dyn(q,qd,load){const K=bodies(q,qd,load),M=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],h=[0,0,0,0],Qg=[0,0,0,0];let mt=0;
 for(const b of K.list){mt+=b.m;for(let i=0;i<4;i++){h[i]+=b.m*(b.J[i][0]*b.b[0]+b.J[i][1]*b.b[1]);Qg[i]+=b.m*G*b.J[i][1];for(let j=0;j<4;j++)M[i][j]+=b.m*(b.J[i][0]*b.J[j][0]+b.J[i][1]*b.J[j][1])+b.I*b.Jw[i]*b.Jw[j]}}
 return {K,M,h,Qg,mt}}
function maxT(s){return {tf:B.fTflex*fvT(s.w0),te:B.fText*fvT(-s.w0),up:MUS.fUp*lengthFactorS(s.q1)*momentArmS(s.q1)*fv(s.w1),down:MUS.fDown*.03*fv(-s.w1),flex:MUS.fFlex*lengthFactor(s.q2)*momentArm(s.q2)*fv(s.w2),ext:MUS.fExt*.02*fv(-s.w2)}}
// s={x,vx,q0,w0,q1,w1,q2,w2}; act={tf,te,up,down,flex,ext,step}; opt={mu,lock}
function bodyStep(s,act,load,dt,opt={}){const mu=opt.mu??.6,q=[s.x,s.q0,s.q1,s.q2],qd=[s.vx,s.w0,s.w1,s.w2],{K,M,h,Qg,mt}=dyn(q,qd,load),T=maxT(s);
 const tau=[0,cl(act.tf)*T.tf-cl(act.te)*T.te,cl(act.up)*T.up-cl(act.down)*T.down,cl(act.flex)*T.flex-cl(act.ext)*T.ext];
 // 床：足は体全体の前後の勢いの変化に必要な力（F）を床から受ける。|F|は摩擦×体重まで。超えると足が滑り、腰が後ろへ逃げる。
 // 体幹を回す力は体の中の力なので、床が受け持つのは「体全体の前後の勢いの変化」＝Fだけ（体幹を倒すと重心が前へ動き、その分がFに入る）。
 // 以前の仮の欄（体幹の力を別に摩擦へ数える欄）は二重に数えることになるので削除した。
 const damp=[0,B.dampT*s.w0,ARM2.damp1*s.w1,ARM.damp*s.w2],rhs=q.map((_,i)=>Qg[i]+tau[i]-h[i]-damp[i]);
 const sub=(free,pres)=>{const A=free.map(i=>free.map(j=>M[i][j])),bb=free.map(i=>rhs[i]-pres.reduce((t,[j,a])=>t+M[i][j]*a,0)),sol=solve(A,bb),acc=[0,0,0,0];pres.forEach(([j,a])=>acc[j]=a);free.forEach((i,k)=>acc[i]=sol[k]);return acc};
 let acc,F=0,slip=false;
 if(opt.lock){acc=sub([2,3],[[0,0],[1,0]]);F=M[0].reduce((t,v,j)=>t+v*acc[j],0)-rhs[0]}
 else{const lim=B.legF*mt*G,vWant=act.step?Math.min(B.vStep,Math.sqrt(2*B.stopA*Math.max(0,B.stepLen-s.x))):0,ax=Math.max(-lim/mt,Math.min(lim/mt,B.kx*(vWant-s.vx)));
  // 点検n：踏み込みは目標の距離（stepLen）で止まるよう、残りの距離から出してよい速さを決めて脚で減速する
  const Fof=a0=>{const ac=sub([1,2,3],[[0,a0]]);return [ac,M[0].reduce((t,v,j)=>t+v*ac[j],0)-rhs[0]]},fr=mu*mt*G;
  [acc,F]=Fof(ax);
  if(Math.abs(F)>fr){
   // 脚は滑らない範囲まで踏み込みの力を弱める（人は床に合わせて加減する）。力Fは踏み込みの加速度に比例して変わる
   const [ac0,F0]=Fof(0);
   if(Math.abs(F0)<=fr){const tgt=Math.sign(F)*fr,a2=ax*(tgt-F0)/(F-F0);[acc,F]=Fof(a2)}
   else{F=Math.sign(F0)*fr;slip=true;rhs[0]+=F;acc=solve(M,rhs)}}} // 踏み込みを止めても体と腕の動きだけで摩擦を超える＝本当に滑る
 const n={vx:s.vx+acc[0]*dt,w0:s.w0+acc[1]*dt,w1:s.w1+acc[2]*dt,w2:s.w2+acc[3]*dt};
 n.x=s.x+n.vx*dt;n.q0=s.q0+n.w0*dt;n.q1=s.q1+n.w1*dt;n.q2=s.q2+n.w2*dt;
 if(n.q0<B.q0min){n.q0=B.q0min;n.w0=Math.max(0,n.w0)}if(n.q0>B.q0max){n.q0=B.q0max;n.w0=Math.min(0,n.w0)}
 if(n.q1<0){n.q1=0;n.w1=Math.max(0,n.w1)}if(n.q1>ARM2.q1max){n.q1=ARM2.q1max;n.w1=Math.min(0,n.w1)}
 if(n.q2<ARM.min){n.q2=ARM.min;n.w2=Math.max(0,n.w2)}if(n.q2>ARM.max){n.q2=ARM.max;n.w2=Math.min(0,n.w2)}
 return {s:n,F,N:mt*G,slip,K,tau,used:Math.abs(F)/(mt*G)}}
// 狙いの姿勢を保つ力（重さの打ち消し＋ばね）→ 筋肉の力の入れ具合
function hold(goal,s,load,strength){const q=[s.x,s.q0,s.q1,s.q2],{Qg}=dyn(q,[s.vx,s.w0,s.w1,s.w2],load),T=maxT({...s,w0:0,w1:0,w2:0}),o={};
 const g=(i,gq,k,b,pos,neg,cur,w)=>{if(gq==null)return;const t=-Qg[i]+k*(gq-cur)-b*w;o[pos]=t>0?Math.min(strength,t/T[pos]):0;o[neg]=t<0?Math.min(strength,-t/T[neg]):0};
 g(1,goal[0],400,60,'tf','te',s.q0,s.w0);g(2,goal[1],60,6,'up','down',s.q1,s.w1);g(3,goal[2],40,3,'flex','ext',s.q2,s.w2);return o}
function bladeWorld(K,T){const rx=T.x-K.H[0],ry=T.y-K.H[1],ux=K.u[0],uy=K.u[1],along=ux*rx+uy*ry,t=Math.max(0,Math.min(K.L,along));return {cross:ux*ry-uy*rx,along,dist:Math.hypot(rx-t*ux,ry-t*uy)}}
// mode：'なし'＝体幹・足を固定（肩と肘は同時に全力）／'同時'＝体幹・踏み込み・肩・肘を同時に全力／'順番'＝体幹＋踏み込みが先→体幹にブレーキ・肩→肘
function makeBodySwing(load,strength=1,opt={}){const mode=opt.mode||'順番',mu=opt.mu??.6,lock=mode==='なし',tg=targetFor(load),T=opt.target||{x:tg.x,y:-B.Lt+tg.y};
 const st={mode,mu,target:T,targetRel:{x:T.x-0,y:T.y+B.Lt},t:0,since:0,phase:'構え',stage:0,s:{x:0,vx:0,q0:0,w0:0,q1:35*D,w1:0,q2:35*D,w2:0},hit:null,minDist:1e9,v:0,prevTip:null,prevC:null,act:{},maxFr:0,slipT:0,maxW0:0,F:0};
 const go=p=>{st.phase=p;st.since=0};
 st.step=dt=>{const s=st.s;
  if(st.phase==='構え'&&st.since>=.1)go('振りかぶり');
  if(st.phase==='振りかぶり'&&st.since>=.15){const near=Math.abs(s.q1-150*D)<12*D&&Math.abs(s.q2-110*D)<15*D,still=Math.abs(s.w1)<.4&&Math.abs(s.w2)<.6&&Math.abs(s.w0)<.5;
   if((still&&(near||st.since>=.4))||st.since>=1.5){st.raise={q0:s.q0,q1:s.q1,q2:s.q2,t:st.since};st.stage=0;go('打ち込み')}}
  if(st.phase==='止め'&&((Math.abs(s.w1)<.8&&Math.abs(s.w2)<.8&&Math.abs(s.w0)<.8)||st.since>=.6))go('戻し');
  if(st.phase==='戻し'&&st.since>=.5)go('残心');
  let a;
  if(st.phase==='構え')a=hold([lock?null:0,35*D,35*D],s,load,strength);
  else if(st.phase==='振りかぶり')a=hold([lock?null:-10*D,150*D,110*D],s,load,strength);
  else if(st.phase==='戻し'||st.phase==='残心')a=hold([lock?null:0,25*D,15*D],s,load,strength);
  else if(st.phase==='止め'){const b=v=>Math.min(strength,Math.abs(v)*.25);a={tf:s.w0<0?b(s.w0):0,te:s.w0>0?b(s.w0):0,up:s.w1<0?b(s.w1):0,down:s.w1>0?b(s.w1):0,flex:s.w2<0?b(s.w2):0,ext:s.w2>0?b(s.w2):0}}
  else{const R=st.raise;
   if(mode==='なし')a={down:strength,ext:strength};
   else if(mode==='同時')a={tf:strength,down:strength,ext:strength,step:true};
   else{ // 順番
    if(st.stage===0&&s.q0-R.q0>(opt.trunkDeg??25)*D){st.stage=1;st.trunkStopAt=st.since}
    if(st.stage===1&&R.q1-s.q1>(opt.switchDeg??35)*D){st.stage=2;st.elbowAt=st.since}
    const armHold=hold([null,R.q1,R.q2],s,load,strength);
    if(st.stage===0)a={tf:strength,step:true,up:armHold.up,down:armHold.down,flex:armHold.flex,ext:armHold.ext};
    else{a={te:s.w0>.2?Math.min(strength,s.w0*.3):0,step:true,down:strength};if(st.stage===1){a.flex=hold([null,null,R.q2],s,load,strength).flex;a.ext=hold([null,null,R.q2],s,load,strength).ext}else a.ext=strength}}}
  st.act=a;
  const r=bodyStep(s,a,load,dt,{mu,lock});st.F=r.F;st.N=r.N;st.slip=r.slip;if(!lock)st.maxFr=Math.max(st.maxFr,r.used);st.used=r.used;if(r.slip)st.slipT+=dt;
  st.s=r.s;const K=bodies([r.s.x,r.s.q0,r.s.q1,r.s.q2],[r.s.vx,r.s.w0,r.s.w1,r.s.w2],load);st.K=K;
  if(st.prevTip)st.v=Math.hypot(K.tip[0]-st.prevTip[0],K.tip[1]-st.prevTip[1])/dt;
  // 点検m：打つ前に足が滑ったら踏ん張れず失敗（転倒扱い）。速さは記録しない。転ぶ動きそのものは未計算
  if(!st.hit&&!st.fail&&(st.phase==='振りかぶり'||st.phase==='打ち込み')&&r.slip){st.preSlip=(st.preSlip||0)+dt;if(st.preSlip>=B.slipFail){st.fail={t:st.t,phase:st.phase};go('止め')}}
  if(st.phase==='打ち込み'){st.maxW0=Math.max(st.maxW0,r.s.w0);if(st.prevS)st.maxSv=Math.max(st.maxSv||0,(K.S[0]-st.prevS[0])/dt);const TT={x:r.s.x+T.x,y:T.y};st.targetNow=TT;const c=bladeWorld(K,TT);st.minDist=Math.min(st.minDist,c.dist);
   if(st.prevC!==null&&st.prevC>0&&c.cross<=0&&c.along>=0&&c.along<=K.L){st.hit={v:st.v,t:st.t,x:r.s.x,q0:r.s.q0,q1:r.s.q1,q2:r.s.q2};go('止め')}
   else if(st.since>=.8)go('止め');st.prevC=c.cross}
  if(st.hit&&st.phase!=='打ち込み')st.afterMax=Math.max(st.afterMax||0,st.v);
  st.prevS=K.S;st.prevTip=K.tip;st.t+=dt;st.since+=dt;return st};
 return st}
function simulateBody(load,strength=1,opt={},sec=2.5,dt=.0005){const sw=makeBodySwing(load,strength,opt);let maxX=0;for(let i=0;i<sec/dt;i++){sw.step(dt);maxX=Math.max(maxX,sw.s.x)}
 return {fail:sw.fail||null,maxSv:sw.maxSv||0,hit:sw.hit,hitV:sw.hit?sw.hit.v:0,minDist:sw.hit?0:sw.minDist,maxFr:sw.maxFr,slipT:sw.slipT,maxW0:sw.maxW0,maxX,end:sw.s,afterMax:sw.afterMax||0,raise:sw.raise,trunkStopAt:sw.trunkStopAt,elbowAt:sw.elbowAt}}
const api={B,bodies,dyn,bodyStep,hold,makeBodySwing,simulateBody};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Body=api;
})(this);
