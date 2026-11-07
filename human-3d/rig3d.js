(function(root){
// R5：平面の計算（../human-motion の muscle.js・body.js・physics.js・motion.js）の結果を、3Dの人形の関節位置に写す。
// 3Dの座標：y=上、z=人形の前、x=人形の左。単位はm。床は y=0。
// 平面（横から見た図）の座標 x=前・y=下（腰の高さが0）→ 3D の z=x、y=HIP−y にそのまま写すので、長さ・速さは変わらない。
const isNode=typeof module!=='undefined'&&module.exports;
const Muscle=isNode?require('../human-motion/muscle.js'):root.Muscle;
const ARM=Muscle.ARM,ARM2=Muscle.ARM2;
const R={HIP:0.86,THIGH:0.43,SHIN:0.43,ANKLE:0.07,SH:0.19,HIPW:0.09,NECK:0.08,HEAD:0.17,U:ARM2.L1,F:ARM.lHand};
const v=(x,y,z)=>[x,y,z],add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k],len=a=>Math.hypot(a[0],a[1],a[2]);
// 横から見た平面の点 (前, 下) → 3D。sideX は人形の左右位置
const sag=(p,sideX=0)=>v(sideX,R.HIP-p[1],p[0]);
// 脚：腰と足首から、ひざを前に出す2本の骨の計算（長さを保つ）
function leg(hip,ankle){const d=[0,ankle[1]-hip[1],ankle[2]-hip[2]],dd=Math.min(R.THIGH+R.SHIN-1e-6,len(d)),a=Math.atan2(d[1],d[2]),c=Math.acos(Math.max(-1,Math.min(1,(R.THIGH**2+dd*dd-R.SHIN**2)/(2*R.THIGH*dd))));
 const k=a+c;return [hip[0],hip[1]+R.THIGH*Math.sin(k),hip[2]+R.THIGH*Math.cos(k)]}
function upper(J,hip,shC){const t=[shC[0]-hip[0],shC[1]-hip[1],shC[2]-hip[2]],u=mul(t,1/len(t));
 J.pelvis=hip;J.chest=shC;J.neck=add(shC,mul(u,R.NECK));J.head=add(shC,mul(u,R.NECK+R.HEAD/2));J.lsh=add(shC,v(R.SH,0,0));J.rsh=add(shC,v(-R.SH,0,0));return u}
function lowerLegs(J,hip,lAnk,rAnk){J.lhip=add(hip,v(R.HIPW,0,0));J.rhip=add(hip,v(-R.HIPW,0,0));
 for(const [s,a] of [['l',lAnk],['r',rAnk]]){J[s+'ank']=a;J[s+'knee']=leg(J[s+'hip'],a);J[s+'toe']=add(a,v(0,-R.ANKLE+.02,.13))}}
// 立ちポーズ
function stand(){const J={},hip=v(0,R.HIP,0);upper(J,hip,v(0,R.HIP+.55,0));
 lowerLegs(J,hip,v(R.HIPW,R.ANKLE,0),v(-R.HIPW,R.ANKLE,0));
 for(const s of ['l','r']){const S=J[s+'sh'];J[s+'elb']=add(S,v(0,-R.U,0));J[s+'hand']=add(J[s+'elb'],v(0,-R.F,0))}return J}
// 筋肉で剣を振る（body.js の bodies() の結果 K と状態 s）。右腕・剣は人形の右（x=−SH）の縦の面で動く
function swing(K,s){const J={},x=s.x,hip=sag([x,0]);
 // 体幹：腰→肩（平面の S）。平面の肩は1点なので、右肩をその点に合わせる
 const S3=sag(K.S,-R.SH),shC=add(S3,v(R.SH,0,0));const u=upper(J,hip,shC);
 J.relb=sag(K.E,-R.SH);J.rhand=sag(K.H,-R.SH);J.tip=sag(K.tip,-R.SH);
 J.lelb=add(J.lsh,mul(u,-R.U));J.lhand=add(J.lelb,mul(u,-R.F));
 // 脚：後ろ（左）足は床に残り、前（右）足は踏み込む。届かない分は腰を下げる（平面と同じ考え）
 const back=-Math.min(.24,x),front=Math.min(.21,x*.5),reach=Math.max(Math.abs(back),Math.abs(front)),Lg=R.THIGH+R.SHIN,drop=Math.max(0,(R.HIP-R.ANKLE)-Math.sqrt(Math.max(0,Lg*Lg-reach*reach)));
 lowerLegs(J,hip,v(R.HIPW,R.ANKLE,x+back),v(-R.HIPW,R.ANKLE,x+front));J.drop=drop;/* 腰を少し低く（ひざを軽く曲げた構え）したので、0.24m開いても足は床に届く（drop=0） */J.L=K.L;return J}
// R6：body3d.js の geo()（座標 [前,下,左]）から3Dの関節へ。胸はひねりで回り、腰から下は回らない
const m3=(p)=>v(p[2],R.HIP-p[1],p[0]);
function swing3(g,s){const J={},x=s.x,hip=m3(g.hip),shC=m3(g.C);const u=upper(J,hip,shC);J.rsh=m3(g.S);J.lsh=m3(g.LS);
 J.relb=m3(g.E);J.rhand=m3(g.H);J.tip=m3(g.tip);if(g.W)J.rwr=m3(g.W);J.lelb=add(J.lsh,mul(u,-R.U));J.lhand=add(J.lelb,mul(u,-R.F));
 const back=-Math.min(.24,x),front=Math.min(.21,x*.5);lowerLegs(J,hip,v(R.HIPW,R.ANKLE,x+back),v(-R.HIPW,R.ANKLE,x+front));J.L=g.L;J.twist=s.q4;return J}
// 歩く（motion.js の sampleWalk の角度）。z方向へ進む
function walk(g,z){const J={},hip0=v(0,R.HIP,z);const kn=(h)=>[Math.sin(h),-Math.cos(h)];
 const legPts=(hx,h,k)=>{const H=v(hx,R.HIP,z),K=add(H,v(0,-R.THIGH*Math.cos(h),R.THIGH*Math.sin(h))),A=add(K,v(0,-R.SHIN*Math.cos(h-k),R.SHIN*Math.sin(h-k)));return {K,A}};
 const L=legPts(R.HIPW,g.hipL,g.kneeL),Rr=legPts(-R.HIPW,g.hipR,g.kneeR),low=Math.min(L.A[1],Rr.A[1])-R.ANKLE;
 const hip=add(hip0,v(0,-low,0));upper(J,hip,add(hip,v(0,.55,0)));
 J.lhip=add(hip,v(R.HIPW,0,0));J.rhip=add(hip,v(-R.HIPW,0,0));J.lknee=add(L.K,v(0,-low,0));J.lank=add(L.A,v(0,-low,0));J.rknee=add(Rr.K,v(0,-low,0));J.rank=add(Rr.A,v(0,-low,0));
 for(const s of ['l','r'])J[s+'toe']=add(J[s+'ank'],v(0,-R.ANKLE+.02,.13));
 for(const [s,a] of [['l',g.armL],['r',g.armR]]){const S=J[s+'sh'],d=v(0,-Math.cos(a),-Math.sin(a));J[s+'elb']=add(S,mul(d,R.U));J[s+'hand']=add(J[s+'elb'],mul(d,R.F))}
 J.stance=g.stance;return J}
// 筋肉で右腕を動かす（muscle.js armStep の q1=横に上げる角度, q2=肘）。正面の面で動く
function armSide(q1,q2){const J=stand(),S=J.rsh,phi=q1+q2;J.relb=add(S,v(-R.U*Math.sin(q1),-R.U*Math.cos(q1),0));J.rhand=add(J.relb,v(-R.F*Math.sin(phi),-R.F*Math.cos(phi),0));return J}
const BONES=[['pelvis','chest','胴'],['chest','head','首'],['lsh','lelb','左上腕'],['lelb','lhand','左前腕'],['rsh','relb','右上腕'],['relb','rhand','右前腕'],['lhip','lknee','左もも'],['lknee','lank','左すね'],['rhip','rknee','右もも'],['rknee','rank','右すね'],['lank','ltoe','左足'],['rank','rtoe','右足']];
const api={R,sag,m3,swing3,stand,swing,walk,armSide,BONES,len,leg};if(isNode)module.exports=api;else root.Rig3D=api;
})(globalThis);
