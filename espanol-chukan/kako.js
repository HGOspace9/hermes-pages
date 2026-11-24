// 過去問（先輩の春学期の答案の写真から）。[大問id, 種類, 前の会話, 問題文, ヒント, 正解, 解説, 訳, まちがい説明, 点]
const KAKO_SEC=[
 {id:"k_mid",name:"春学期 中間テスト",d:"写真に写っていた4つの大問（80点分）。本番と同じ順番",kako:true},
 {id:"k_mt2",name:"小テスト U2（Minitest 2）",d:"a/al/de・男女・活用・単数・por/para/porque（10点）",kako:true},
 {id:"k_mt3",name:"小テスト U3（Minitest 3）",d:"es/está/hay/son/tiene・天気・季節（10点）",kako:true}
];
const COL={
 mp:["blancos","negros","rojos","amarillos","azules","verdes","grises","marrones","naranjas","rosas","lilas","beis"],
 fp:["blancas","negras","rojas","amarillas","azules","verdes","grises","marrones","naranjas","rosas","lilas","beis"],
 fs:["blanca","negra","roja","amarilla","azul","verde","gris","marrón","naranja","rosa","lila","beis"]
};
const SERU_OPT=["son","es","está","están","hay","tiene"];
const KAKO=[
// ===== 中間テスト 1.（2点×13）=====
["k_mid","t","大問1① IRATI と AKARI・MIHO の会話","IRATI: Hola, ___ Irati, ¿y vosotras?","（名前を名乗る・2語）",["me llamo"],"「私の名前は」＝ me llamo。","イラティ：こんにちは、私はイラティ。あなたたちは？",null,2],
["k_mid","t","AKARI: Yo, Akari.／MIHO: Y yo, Miho.","IRATI: ¿De ___ sois (vosotras)?","（どこ）",["dónde"],"¿De dónde…? ＝ どこの出身？","あなたたちはどこの出身？",null,2],
["k_mid","t","","AKARI: ___ (nosotras) japonesas, de Sendai.","（ser）",["somos"],"ser の nosotras は somos。","私たちは日本人です、仙台出身です。",null,2],
["k_mid","t","","IRATI: Yo ___ la profesora de euskera.","（ser）",["soy"],"ser の yo は soy。","私はバスク語の先生です。",null,2],
["k_mid","t","大問1② YICHENG・JEHYE と MIKE の会話","Hola, ¿qué tal? Nosotros ___ Yicheng y Jehye.","（ser）",["somos"],"nosotros → somos。","こんにちは、元気？ 私たちはイーチェンとジェヘです。",null,2],
["k_mid","t","","¿Y tú, cómo ___?","（llamarse・2語）",["te llamas"],"tú → te llamas。","で、あなたの名前は？",null,2],
["k_mid","t","MIKE: Mike.","YICHENG: ¿De dónde ___ (tú)?","（ser）",["eres"],"tú → eres。","あなたはどこの出身？",null,2],
["k_mid","t","大問1③ ANNE: ¿Y tú, Yusuf, por qué estudias español?","YUSUF: ___ mi trabajo. En Marruecos tengo muchos clientes de España.","（理由）",["por"],"後ろが mi trabajo（名詞）→ por。","仕事のためです。モロッコにはスペインのお客さんがたくさんいます。",{"porque":"porque の後ろは文（動詞のある形）。mi trabajo は名詞なので por。","para":"para の後ろは動詞の原形。mi trabajo は名詞なので por。"},2],
["k_mid","t","YUSUF: ¿Y tú, por qué estudias español, Anne?","ANNE: Estudio español ___ quiero estudiar en América del Sur.","（理由）",["porque"],"後ろが quiero estudiar…（文）→ porque。","南米で勉強したいので、スペイン語を勉強しています。",{"por":"por の後ろは名詞。quiero…は文なので porque。","para":"para の後ろは動詞の原形。quiero は活用した形なので porque。"},2],
["k_mid","t","大問1④ NADIA と YANG の会話","NADIA: ¿___, Yang?　YANG: Soy empresario.","（仕事を聞く・3語）",["a qué te dedicas","en qué trabajas"],"¿A qué te dedicas?（¿En qué trabajas? でも可）","ヤン、お仕事は何？ — 経営者です。",null,2],
["k_mid","t","NADIA: Yo soy periodista.","YANG: ¿___?　NADIA: Tengo treinta y dos años.","（年齢を聞く・3語）",["cuántos años tienes"],"¿Cuántos años tienes?","何歳？ — 32歳です。",null,2],
["k_mid","t","大問1⑤ LEOPOLD: ¿Qué quieres hacer en este curso de español?","SIDSEL: Yo quiero ___ las películas de Almodóvar en español.","（見る）",["ver"],"querer ＋ 原形。見る＝ver。","アルモドバルの映画をスペイン語で見たい。",null,2],
["k_mid","t","SIDSEL: Y tú, ¿qué quieres hacer?","LEOPOLD: Yo quiero ___ a cocinar los platos tradicionales del País Vasco.","（学ぶ）",["aprender"],"aprender a ＋ 原形 ＝ 〜を習う。","バスク地方の伝統料理の作り方を習いたい。",null,2],
// ===== 中間テスト 2.（2点×12）=====
["k_mid","c","大問2① HANS: ¿Qué quieres hacer este fin de semana?","OLGA: Quiero ir ___ la playa.","",["a","de","al"],"後ろが la playa → a のまま。","海に行きたい。",{"de":"「海**から**行きたい」になってしまう。","al":"al は a＋el。playa は la なので a la のまま。"},2],
["k_mid","c","OLGA: ¿Y tú, qué quieres hacer?","HANS: Yo quiero ir ___ compras.","",["de","a las","a"],"ir de compras は決まり文句。","僕は買い物に行きたい。",{"a las":"ir de compras が決まり文句。","a":"ir de compras が決まり文句。「買い物へ」と直訳しない。"},2],
["k_mid","c","大問2② HIKARI: ¿Cómo es tu ciudad, Fatimah?","FATIMAH: El Cairo ___ grande.","",["es","está","hay"],"どんな町か（性質）→ es。","カイロは大きいです。",{"está":"está は場所を言うとき。「大きい」は性質なので es。","hay":"hay は前に主語（El Cairo）を置けない。"},2],
["k_mid","c","（つづき：El Cairo のこと）","___ en el norte de Egipto.","",["Está","Hay","Es"],"（カイロは）エジプトの北にある → 場所なので está。","エジプトの北にあります。",{"Hay":"hay は「〜がある」と新しいものを紹介する形。カイロ（決まったもの）の場所は está。","Es":"「北**です**」＝カイロが北そのもの、という意味に。"},2],
["k_mid","c","（つづき：El Cairo には…）","___ muchos museos y monumentos famosos: las pirámides de Gizah, la Esfinge, el Museo Arqueológico, etc.","",["Hay","Está","Es"],"「たくさんの美術館がある」と紹介 → hay。","有名な美術館や記念碑がたくさんあります。ギザのピラミッド、スフィンクス、考古学博物館など。",{"Está":"está は決まったもの1つの場所。muchos museos は初めて紹介 → hay。","Es":"「たくさんの美術館**です**」という変な文に。"},2],
["k_mid","c","HIKARI: ¿Y cómo es el clima en El Cairo?","FATIMAH: En invierno, no ___,","",["nieva","nubes","viento"],"雪が降る＝nieva（動詞）。","冬は雪は降らないけれど、",{"nubes":"nubes は名詞「雲」。no の後ろには動詞が要る。","viento":"viento は名詞「風」。no の後ろには動詞が要る。"},2],
["k_mid","c","","pero ___ frío.","",["hace","hay","está"],"天気の寒さ → hace frío。","寒いです。",{"hay":"「寒さ**がある**」になってしまう。天気は hace。","está":"está frío は「（物が）冷たい」。天気は hace frío。"},2],
["k_mid","c","","En verano, el clima es bueno y no ___ mucho.","",["llueve","llover","lluvia"],"雨が降る＝llueve。","夏は気候が良くて、雨はあまり降りません。",{"llover":"llover は原形。活用していない。","lluvia":"lluvia は名詞「雨」。動詞がない文になる。"},2],
["k_mid","c","大問2③","PAOLO: Arthi, ¿___ lenguas hablas?","",["cuántas","cuántos","cuán"],"lengua は女性 → cuántas。","アルティ、何か国語話すの？",{"cuántos":"cuántos は男性用。lengua は女性。","cuán":"cuán は「どれほど」。数は聞けない。"},2],
["k_mid","c","ARTHI: Tres, hindú, inglés, y un poco de español.","PAOLO: ¡Eres ___!","",["plurilingüe","plurilingual","plurilenguas"],"何か国語も話す人＝plurilingüe。","多言語話者だね！",{"plurilingual":"これは英語。","plurilenguas":"「複数の言語たち」という名詞。人を表せない。"},2],
["k_mid","c","大問2④","ZHANG WEI: ___ película de Pedro Almodóvar es buena.","",["Esta","Esto","Este"],"película は女性 → esta。","このペドロ・アルモドバルの映画は良いね。",{"Esto":"esto は「これ」。後ろに名詞を置けない。","Este":"este は男性用。película は女性。"},2],
["k_mid","c","大問2⑤ HYUN-MI: ¿Cómo es Hokkaido, Yusuke?","YUSUKE: Es ___ bonito.","",["muy","mucho","mucha"],"形容詞（bonito）の前は muy。","とてもきれいだよ。",{"mucho":"mucho は動詞・名詞と。形容詞の前は muy。","mucha":"mucha は女性名詞に付く「たくさんの」。"},2],
// ===== 中間テスト 3.（2点×10）=====
...[["Mike y yo ___ 20 años, ¿y tú?","（tener, nosotros）","tenemos","マイクと私は20歳です。あなたは？"],["¿Qué ___ hacer ustedes en el curso de español?","（querer）","quieren","あなたたちはスペイン語の講座で何をしたいですか？"],["Los estudiantes ___ bien en español.","（comprender）","comprenden","学生たちはスペイン語でよく理解しています。"],["¿Dónde ___ (tú)?","（trabajar）","trabajas","あなたはどこで働いていますか？"],["Él ___ muchos libros, especialmente novelas.","（leer）","lee","彼はたくさん本を読みます、特に小説を。"],["¿___ ustedes en el aeropuerto?","（estar・大文字で始める）","están","あなたたちは空港にいますか？"],["¿Cuánto ___ estos pantalones?","（costar）","cuestan","このズボンはいくらですか？"],["La profesora ___ María.","（llamarse）","se llama","先生の名前はマリアです。"],["Nosotros ___ en Barcelona, cerca de la Sagrada Familia.","（vivir）","vivimos","私たちはサグラダ・ファミリアの近く、バルセロナに住んでいます。"],["Ellas ___ un diccionario de español.","（tener）","tienen","彼女たちはスペイン語の辞書を持っています。"]].map(([q,h,a,j],i)=>["k_mid","t",i===0?"大問3 動詞の活用（主語に合わせる）":"",q,h,[a],"主語に合わせて活用。",j,null,2]),
// ===== 中間テスト 4.（2点×5）絵は白黒なので色は自由・形を名詞に合わせる =====
["k_mid","t","大問4 色（絵は白黒。好きな色でよいが、名詞の性・数に合わせる）","👖 Unos pantalones ___.","（男性・複数）",COL.mp,"pantalones は男性・複数 → -os / -es（blancos, negros, azules…）。","ズボン（何色か）",null,2],
["k_mid","t","","👟 Unos zapatos ___.","（男性・複数）",COL.mp,"zapatos は男性・複数 → negros, azules など。","靴（何色か）",null,2],
["k_mid","t","","🧥 Una chaqueta ___.","（女性・1つ）",COL.fs,"chaqueta は女性・1つ → negra, gris, verde など。","ジャケット（何色か）",null,2],
["k_mid","t","","🩴 Unas sandalias ___.","（女性・複数）",COL.fp,"sandalias は女性・複数 → negras, rojas など。","サンダル（何色か）",null,2],
["k_mid","t","","👕 Una camiseta ___.","（女性・1つ）",COL.fs,"camiseta は女性・1つ → negra, roja など。","Tシャツ（何色か）",null,2],

// ===== 小テスト U2（0.5点×20）=====
["k_mt2","c","1. a / al / de を入れる（入らなければ ×）","¿Quieres ir ___ bailar esta noche?","",["a","de","al","×"],"ir a ＋ 原形。","今夜、踊りに行きたい？",{"de":"「踊り**から**行く」になってしまう。","al":"al は a＋el。bailar は動詞なので el はない。","×":"ir の後ろに動詞を続けるときは a が要る。"},0.5],
["k_mt2","c","","¡Yo quiero ir ___ teatro!","",["al","a","de","×"],"a＋el teatro → al。","劇場に行きたい！",{"a":"a＋el は必ず al にくっつける。","de":"「劇場**から**行きたい」になってしまう。","×":"行き先には a（ここでは al）が要る。"},0.5],
["k_mt2","c","","Yo quiero hacer ___ un curso de cocina.","",["×","a","de","al"],"hacer un curso。何も入らない。","料理の講座を受けたい。",{"a":"「講座**へ**する」になってしまう。","de":"「講座**から**する」になってしまう。","al":"al は a＋el。後ろは un curso なので使えない。"},0.5],
["k_mt2","c","","Yo no quiero salir ___ noche. ¡Ahora quiero ir de compras!","",["de","a","al","×"],"salir de noche ＝ 夜に出かける。","夜は出かけたくない。今は買い物に行きたい！",{"a":"「夜**へ**出かける」になってしまう。","al":"noche は la なので al にもならない。","×":"salir de noche で1つの言い方。"},0.5],
["k_mt2","c","2. 男性名詞（m）か女性名詞（f）か","curso",  "",["m","f"],"el curso",  "講座",{"f":"-o で終わるので男性：el curso。"},0.5],
["k_mt2","c","","clase","",["f","m"],"la clase","授業",{"m":"-e は男女どちらもある。clase は女性。"},0.5],
["k_mt2","c","","coche","",["m","f"],"el coche","車",{"f":"coche は男性：el coche。"},0.5],
["k_mt2","c","","día","",["m","f"],"el día（-a なのに男性）","日",{"f":"-a で終わるのに男性：el día。"},0.5],
...[["hablar, ella","habla","彼女は話す"],["comprender, tú","comprendes","あなたは理解する"],["aprender, ellas","aprenden","彼女たちは学ぶ"],["leer, yo","leo","私は読む"],["querer, yo","quiero","私は欲しい・〜したい"],["bailar, tú","bailas","あなたは踊る"]].map(([q,a,j],i)=>["k_mt2","t",i===0?"3. 主語に合わせて活用":"",q,"",[a],"主語に合わせて活用。",j,null,0.5]),
["k_mt2","t","4. 単数の形にする","los libros → ","",["el libro"],"los → el。","本",null,0.5],
["k_mt2","t","","unas revistas → ","",["una revista"],"unas → una。","雑誌",null,0.5],
["k_mt2","c","5. por / para / porque","Aprendo castellano ___ mi trabajo. Trabajo en una agencia de viajes.","",["por","para","porque"],"後ろが mi trabajo（名詞）→ por。","仕事のためにスペイン語を学んでいます。旅行代理店で働いています。",{"para":"para の後ろは動詞の原形。","porque":"porque の後ろは文。"},0.5],
["k_mt2","c","","Estudio español ___ quiero viajar a Bolivia y visitar el Salar de Uyuni.","",["porque","por","para"],"後ろが quiero…（文）→ porque。","ボリビアに旅行してウユニ塩湖を訪れたいので、スペイン語を勉強しています。",{"por":"por の後ろは名詞。","para":"para の後ろは原形。quiero は活用した形。"},0.5],
["k_mt2","c","","Aprendo español ___ hablar con mis compañeras latinas en los Estados Unidos.","",["para","porque","por"],"後ろが hablar（原形）→ para。先輩が porque にして✕。","アメリカでラテン系の仲間と話すために、スペイン語を学んでいます。",{"porque":"porque の後ろは文。hablar は原形なので para。","por":"por の後ろは名詞。"},0.5],
["k_mt2","c","","Estudio euskera ___ soy profesora de una escuela primaria.","",["porque","por","para"],"後ろが soy…（文）→ porque。先輩が por にして✕。","小学校の先生なので、バスク語を勉強しています。",{"por":"por の後ろは名詞。soy は動詞なので porque。","para":"para の後ろは原形。"},0.5],

// ===== 小テスト U3（0.5点×20）=====
...[["El español y el inglés ___ las lenguas oficiales de Puerto Rico.","son","スペイン語と英語はプエルトリコの公用語です。","2つ（español と inglés）が「〜です」→ son。"],["Venezuela ___ en América Latina.","está","ベネズエラはラテンアメリカにあります。","決まった国の場所 → está。"],["Buenos Aires ___ la capital de Argentina.","es","ブエノスアイレスはアルゼンチンの首都です。","「A は B です」（1つ）→ es。"],["En México ___ muchos volcanes activos.","hay","メキシコにはたくさんの活火山があります。","「En 場所, ___ muchos〜」→ hay。"],["Las islas Galápagos ___ en Ecuador.","están","ガラパゴス諸島はエクアドルにあります。","決まったもの（複数）の場所 → están。"],["En Chile ___ vinos muy buenos.","hay","チリにはとても良いワインがあります。","「En 場所, ___ もの」→ hay。"],["Las playas de Cuba ___ muy bonitas.","son","キューバのビーチはとてもきれいです。","性質（複数）→ son。"],["En España no ___ petróleo.","hay","スペインには石油がありません。","ない も no hay。"],["Japón ___ una población de 123,7 millones.","tiene","日本の人口は1億2370万人です。","人口は tener → tiene。"],["El ceviche, el adobo y la causa ___ los platos típicos del Perú.","son","セビーチェ、アドボ、カウサはペルーの代表的な料理です。","3つが「〜です」→ son。"]].map(([q,a,j,x],i)=>["k_mt3","c",i===0?"1. 四角の中から選ぶ（están・es・hay×3・son×3・está・tiene）":"",q,"",[a,...SERU_OPT.filter(o=>o!==a)],x,j,"SERU",0.5]),
...[["☀️ En Sídney, ___.",["hace calor","hace sol"],"シドニーは暑いです。"],["❄️ En Montreal, ___.",["nieva"],"モントリオールは雪が降っています。"],["🌬️ En Manila, ___.",["hace viento","hay viento"],"マニラは風が吹いています。"],["☁️ En Osaka, ___.",["está nublado","hay nubes"],"大阪は曇っています。"],["🌧️ En Santiago de Chile, ___.",["llueve"],"サンティアゴは雨が降っています。"],["🌡️ En La Paz, ___.",["hace frío"],"ラパスは寒いです。"]].map(([q,a,j],i)=>["k_mt3","t",i===0?"2. 絵の天気を書く":"",q,"",a,"天気：hace calor / nieva / hace viento / está nublado / llueve / hace frío。「hay nieva」「hay nublado」は✕（先輩が間違えた所）。",j,null,0.5]),
...[["🌸 春","la primavera"],["☀️ 夏","el verano"],["🍂 秋","el otoño"],["❄️ 冬","el invierno"]].map(([q,a],i)=>["k_mt3","t",i===0?"3. 四季をスペイン語で":"",q+" =","",[a,a.split(" ")[1]],"冠詞もいっしょに覚える。",a+" ＝ "+q.slice(-1),null,0.5])
];
