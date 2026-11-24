// ⚡ 形を変える（複数形・女性形）— パッと出す練習
// 行: [男性・単数, 女性・単数(なし=null), 男性・複数, 女性・複数, 日本語, ルール]
const KR={
 o:"o で終わる → 女性は o を a に、複数は ＋s",
 cons:"子音で終わる → 女性は ＋a、複数は ＋es",
 acc:"子音で終わる → 女性は ＋a、複数は ＋es。最後の á・é・ó のアクセント記号は、形が変わると消える",
 e:"e で終わる → 男女同じ形。複数は ＋s",
 ista:"-ista で終わる → 男女同じ形。複数は ＋s",
 a:"a で終わる国籍 → 男女同じ形。複数は ＋s",
 inv:"子音で終わる色・形容詞 → 男女同じ形。複数は ＋es",
 invacc:"子音で終わる → 男女同じ形、複数は ＋es。ó のアクセント記号は複数で消える",
 i:"í で終わる → 男女同じ形。複数は ＋es",
 joven:"joven → 男女同じ形。複数は jóvenes（アクセント記号がつく！）",
 actor:"例外：女性は actriz。z で終わるので複数は z を c にして actrices",
 vow:"母音で終わる → 複数は ＋s",
 consp:"子音で終わる → 複数は ＋es",
 conspacc:"子音で終わる → 複数は ＋es。最後の ó・ú のアクセント記号は複数で消える",
 z:"z で終わる → 複数は z を c にして ＋es",
 ma:"a で終わるけど男性名詞（el）。複数は ＋s",
 mano:"o で終わるけど女性名詞（la）。複数は ＋s",
 lunes:"最後の音節にアクセントがなく s で終わる → 複数でも同じ形（冠詞だけ los に）",
 art:"el→los, la→las / un→unos, una→unas / este→estos, esta→estas（estes ではない！）"
};
const KG=[
 ["hito","👤 人・職業","el chico → la chica / los chicos",[
  ["el chico","la chica","los chicos","las chicas","男の子・女の子","o"],
  ["el amigo","la amiga","los amigos","las amigas","友だち","o"],
  ["el hermano","la hermana","los hermanos","las hermanas","兄弟・姉妹","o"],
  ["el hijo","la hija","los hijos","las hijas","息子・娘","o"],
  ["el camarero","la camarera","los camareros","las camareras","ウェイター","o"],
  ["el médico","la médica","los médicos","las médicas","医者","o"],
  ["el abogado","la abogada","los abogados","las abogadas","弁護士","o"],
  ["el cocinero","la cocinera","los cocineros","las cocineras","料理人","o"],
  ["el profesor","la profesora","los profesores","las profesoras","先生","cons"],
  ["el estudiante","la estudiante","los estudiantes","las estudiantes","学生","e"],
  ["el cantante","la cantante","los cantantes","las cantantes","歌手","e"],
  ["el periodista","la periodista","los periodistas","las periodistas","ジャーナリスト","ista"],
  ["el dentista","la dentista","los dentistas","las dentistas","歯医者","ista"],
  ["el actor","la actriz","los actores","las actrices","俳優・女優","actor"]]],
 ["kuni","🌍 国籍","español → española / españoles",[
  ["español","española","españoles","españolas","スペイン人","cons"],
  ["francés","francesa","franceses","francesas","フランス人","acc"],
  ["alemán","alemana","alemanes","alemanas","ドイツ人","acc"],
  ["inglés","inglesa","ingleses","inglesas","イギリス人","acc"],
  ["japonés","japonesa","japoneses","japonesas","日本人","acc"],
  ["portugués","portuguesa","portugueses","portuguesas","ポルトガル人","acc"],
  ["italiano","italiana","italianos","italianas","イタリア人","o"],
  ["mexicano","mexicana","mexicanos","mexicanas","メキシコ人","o"],
  ["chino","china","chinos","chinas","中国人","o"],
  ["argentino","argentina","argentinos","argentinas","アルゼンチン人","o"],
  ["brasileño","brasileña","brasileños","brasileñas","ブラジル人","o"],
  ["estadounidense","estadounidense","estadounidenses","estadounidenses","アメリカ人","e"],
  ["canadiense","canadiense","canadienses","canadienses","カナダ人","e"],
  ["belga","belga","belgas","belgas","ベルギー人","a"],
  ["marroquí","marroquí","marroquíes","marroquíes","モロッコ人","i"]]],
 ["iro","🎨 色・形容詞","rojo → roja / verde → verdes",[
  ["rojo","roja","rojos","rojas","赤い","o"],
  ["blanco","blanca","blancos","blancas","白い","o"],
  ["negro","negra","negros","negras","黒い","o"],
  ["amarillo","amarilla","amarillos","amarillas","黄色い","o"],
  ["morado","morada","morados","moradas","紫の","o"],
  ["verde","verde","verdes","verdes","緑の","e"],
  ["azul","azul","azules","azules","青い","inv"],
  ["gris","gris","grises","grises","灰色の","inv"],
  ["marrón","marrón","marrones","marrones","茶色の","invacc"],
  ["grande","grande","grandes","grandes","大きい","e"],
  ["pequeño","pequeña","pequeños","pequeñas","小さい","o"],
  ["bonito","bonita","bonitos","bonitas","きれいな","o"],
  ["caro","cara","caros","caras","高い（値段）","o"],
  ["barato","barata","baratos","baratas","安い","o"],
  ["nuevo","nueva","nuevos","nuevas","新しい","o"],
  ["alto","alta","altos","altas","背が高い","o"],
  ["simpático","simpática","simpáticos","simpáticas","感じがいい","o"],
  ["joven","joven","jóvenes","jóvenes","若い","joven"]]],
 ["mono","📦 もの（複数形だけ）","el libro → los libros",[
  ["el libro",null,"los libros",null,"本","vow"],
  ["la casa",null,"las casas",null,"家","vow"],
  ["el bolso",null,"los bolsos",null,"バッグ","vow"],
  ["la camiseta",null,"las camisetas",null,"Tシャツ","vow"],
  ["el zapato",null,"los zapatos",null,"くつ","vow"],
  ["el euro",null,"los euros",null,"ユーロ","vow"],
  ["la ciudad",null,"las ciudades",null,"都市","consp"],
  ["el país",null,"los países",null,"国","consp"],
  ["el mes",null,"los meses",null,"月（1か月）","consp"],
  ["el móvil",null,"los móviles",null,"スマホ","consp"],
  ["la flor",null,"las flores",null,"花","consp"],
  ["el pantalón",null,"los pantalones",null,"ズボン","conspacc"],
  ["el autobús",null,"los autobuses",null,"バス","conspacc"],
  ["el lápiz",null,"los lápices",null,"えんぴつ","z"],
  ["la luz",null,"las luces",null,"光・電気","z"],
  ["el idioma",null,"los idiomas",null,"言語","ma"],
  ["el día",null,"los días",null,"日","ma"],
  ["el problema",null,"los problemas",null,"問題","ma"],
  ["la mano",null,"las manos",null,"手","mano"],
  ["el lunes",null,"los lunes",null,"月曜日","lunes"]]],
 ["kan","🔤 冠詞・この","el → los / este → estos",[
  ["el","la","los","las","その（定冠詞）","art"],
  ["un","una","unos","unas","ある・1つの（不定冠詞）","art"],
  ["este","esta","estos","estas","この","art"]]]
];
const KF=["男性・単数","女性・単数","男性・複数","女性・複数"];
const KASK=[null,"女性形に","複数形に","女性の複数形に"];
// 問題の一覧: {g, r(行), t(1=女性,2=複数,3=女性複数)}
const KQ=[];KG.forEach(g=>g[3].forEach(r=>{for(const t of [1,2,3])if(r[t]!==null)KQ.push({g:g[0],r,t})}));
const kdeacc=s=>s.normalize("NFD").replace(/[́]/g,"").normalize("NFC");
function kWrongs(q){const r=q.r,ans=r[q.t];
 const real=[...new Set(r.filter((x,i)=>x!==null&&i<4&&x!==ans))];
 if(q.g==="kan")return shuffle(real).slice(0,3);
 const sp=s=>{const m=s.match(/^(el|la|los|las) (.+)$/);return m?[m[1],m[2]]:["",s]};
 const [art,ansW]=sp(ans),[,b]=sp(r[0]);const cut=b.replace(/[aeo]$/,"");
 const plural=q.t>=2,cv=/[^aeiouáéíóú]$/.test(b),inv=r[1]===r[0];
 let gen=[kdeacc(ansW)];
 if(q.t===1&&!cv&&!/o$/.test(b))gen.push(cut+"a");            // estudianta・granda
 if(q.t===1&&cv&&inv)gen.push(b+"a");                         // azula
 if(q.t===1&&/ista$/.test(b))gen.push(b.replace(/a$/,"o"));   // 男性→periodisto 的なまちがい
 if(plural&&(cv||/í$/.test(b))&&!/s$/.test(b))gen.push(b+"s");                               // profesors・azuls・lápizs
 if(plural&&/z$/.test(b))gen.push(b+"es");                    // lápizes
 if(plural&&/s$/.test(b)&&ansW===b)gen.push(b+"es");          // luneses
 if(plural&&/[áéíóú]/.test(b)&&!/[áéíóú]/.test(ansW))gen.push(ansW.replace(/([aeiou])([nsl])(es|as)$/,(m,v,c,e)=>({a:"á",e:"é",i:"í",o:"ó",u:"ú"})[v]+c+e)); // alemánes
 if(q.t===3&&inv)gen.push(cv?b+"as":cut+"as");                // azulas・grandas
 if(q.t===3&&!inv&&r[1])gen.push(r[1].split(" ").pop()+"es"); // españolaes 的は除く
 if(q.t===2&&/e$/.test(b))gen.push(cut+"os");                // estudiantos
 if(plural&&/ista$/.test(b))gen.push(b.replace(/a$/,"os"));   // periodistos
 gen=gen.filter(x=>x&&x!==ansW&&!/(aes|oes|ees)$/.test(x));
 gen=gen.map(x=>art?art+" "+x:x);
 if(art){const other={el:"los",los:"el",la:"las",las:"la"}[art];gen.push(other+" "+ansW)}
 const pool=[...new Set([...shuffle(gen),...shuffle(real)])].filter(x=>x!==ans);
 // 本物の形を1つ、作った間違いを2つ（足りなければ残りで埋める）
 const out=[];const pr=shuffle(real.filter(x=>x!==ans));if(pr[0])out.push(pr[0]);
 for(const x of pool){if(out.length>=3)break;if(!out.includes(x))out.push(x)}
 for(const x of [cut+"o",cut+"os",b+"os"].map(x=>art?art+" "+x:x)){if(out.length>=2)break;if(x!==ans&&!out.includes(x))out.push(x)} // 足りない時の予備（belgo・grisos）
 return out}
let ks={};
const LK="chukan_kata_v1";
function kGetLog(){try{return JSON.parse(localStorage.getItem(LK)||"[]")}catch(e){return[]}}
function kLog(q,pick,ok){const l=kGetLog();l.push({w:q.r[0],t:q.t,in:pick,ok:ok?1:0,ms:Date.now()-ks.t0});try{localStorage.setItem(LK,JSON.stringify(l))}catch(e){}}
function kataHome(){
 const rules=["o → a（chico → chica）","子音 → ＋a（profesor → profesora、español → española）","e・-ista・色の子音 → 男女同じ（estudiante、azul）","複数：母音 → ＋s／子音 → ＋es／z → ces","á・é・ó のついた語尾は形が変わると記号が消える（alemán → alemanes）"];
 let h=`<div class="top"><button class="btn ghost" onclick="home()">← ホーム</button></div><h1>⚡ 形を変える</h1><div class="sub">複数形・女性形をパッと出す練習。正解ならすぐ次へ進みます。最後にかかった時間が出ます。</div>
 <div class="card pt" style="margin-top:12px"><b>まずこの5つ</b><ul>${rules.map(x=>`<li>${x}</li>`).join("")}</ul></div><div class="tiles">
 <button class="tile main" onclick="kStart('all')"><b>全部まぜて 20問</b><div class="d">5つのグループからランダムに</div></button>`;
 for(const g of KG){const n=KQ.filter(q=>q.g===g[0]).length;h+=`<button class="tile" onclick="kStart('${g[0]}')"><b>${g[1]}</b>（${n}問から20問）<div class="d">${g[2]}</div></button>`}
 $("#app").innerHTML=h+`</div>`;scrollTo(0,0)}
function kStart(g,list){const pool=g==="all"?KQ:KQ.filter(q=>q.g===g);
 ks={g,list:list||shuffle(pool).slice(0,20),i:0,ok:0,ng:[],t0:Date.now(),start:Date.now()};kShow()}
function kShow(){const q=ks.list[ks.i];if(!q)return kEnd();
 ks.opts=shuffle([q.r[q.t],...kWrongs(q)]);ks.done=false;ks.t0=Date.now();
 const g=KG.find(x=>x[0]===q.g);
 $("#app").innerHTML=`<div class="top"><button class="btn ghost" onclick="kataHome()">← もどる</button><span class="prog">${ks.i+1} / ${ks.list.length}　○ ${ks.ok}</span></div>
 <div class="card"><span class="tag">${g[1]}</span>
 <div class="fes" style="text-align:center">${q.r[0]}</div><div class="hint" style="text-align:center">${q.r[4]}</div>
 <div class="q" style="text-align:center;font-weight:700">➡ ${KASK[q.t]}</div>
 <div class="choices">${ks.opts.map((o,j)=>`<button data-j="${j}" onclick="kPick(${j})">${o}</button>`).join("")}</div><div id="kres"></div></div>`;scrollTo(0,0)}
function kWhat(q,o){const i=q.r.indexOf(o);if(i>=0)return `「${o}」は <b>${KF[i]}</b> の形です`;
 if(kdeacc(o)===kdeacc(q.r[q.t]))return `「${o}」はアクセント記号の付け方がちがいます`;
 if(/^(el|la|los|las) /.test(o)&&o.split(" ")[1]===q.r[q.t].split(" ")[1])return `「${o}」は冠詞（el/la/los/las）がちがいます`;
 return `「${o}」という形はありません`}
function kPick(j){if(ks.done)return;ks.done=true;const q=ks.list[ks.i];const ans=q.r[q.t];const ok=ks.opts[j]===ans;
 kLog(q,ks.opts[j],ok);
 document.querySelectorAll(".choices button").forEach(b=>{const k=+b.dataset.j;if(ks.opts[k]===ans)b.classList.add("ok");else if(k===j)b.classList.add("ng");b.disabled=true});
 say(ans);
 if(ok){ks.ok++;$("#kres").innerHTML=`<div class="res ok"><div class="big">○ ${ans}</div></div>`;setTimeout(()=>{if(ks.list[ks.i]===q){ks.i++;kShow()}},700);return}
 ks.ng.push(q);
 const tbl=q.r[1]===null?`${q.r[0]} → ${q.r[2]}`:`<table><tr><th></th><th>単数</th><th>複数</th></tr><tr><td>男性</td><td>${q.r[0]}</td><td>${q.r[2]}</td></tr><tr><td>女性</td><td>${q.r[1]}</td><td>${q.r[3]}</td></tr></table>`;
 $("#kres").innerHTML=`<div class="res ng"><div class="big">✕ 正解は：${ans}</div>
 <div class="ex">🙅 ${kWhat(q,ks.opts[j])}</div><div class="ex">💡 ${KR[q.r[5]]}</div><div class="seru">${tbl}</div></div>
 <div class="row"><button class="btn" id="knx" onclick="ks.i++;kShow()">次へ →</button></div>`;const b=$("#knx");if(b)b.focus()}
function kEnd(){const n=ks.list.length;const sec=Math.round((Date.now()-ks.start)/1000);
 $("#app").innerHTML=`<div class="top"><button class="btn ghost" onclick="kataHome()">← もどる</button></div><div class="card"><h1>${ks.ok} / ${n} 正解</h1>
 <p class="sub">かかった時間 ${sec}秒（1問あたり ${(sec/Math.max(n,1)).toFixed(1)}秒）。目標は1問2秒以内。</p>
 ${ks.ng.length?`<p class="sub">まちがえた形</p><ul class="wrong">${ks.ng.map(q=>`<li><b>${q.r[0]}</b> → ${KASK[q.t].replace("に","")}：<b>${q.r[q.t]}</b></li>`).join("")}</ul>`:"<p>全問正解 🎉</p>"}
 <div class="row">${ks.ng.length?`<button class="btn" onclick="kStart('${ks.g}',shuffle(ks.ng))">まちがえた形だけ</button>`:""}<button class="btn ghost" onclick="kStart('${ks.g}')">もう一回</button></div></div>`;scrollTo(0,0)}
function kReport(){const l=kGetLog();if(!l.length)return "";
 const ok=l.filter(r=>r.ok).length;const avg=(l.reduce((a,r)=>a+r.ms,0)/l.length/1000).toFixed(1);
 let s=`\n■ 形を変える（複数形・女性形）: ${ok}/${l.length}回正解・平均 ${avg}秒\n`;
 for(const r of l.filter(r=>!r.ok)){const q=KQ.find(x=>x.r[0]===r.w&&x.t===r.t);if(q)s+=`${r.w} → ${KASK[r.t]}：選んだ「${r.in}」/ 正解「${q.r[r.t]}」\n`}
 return s}
