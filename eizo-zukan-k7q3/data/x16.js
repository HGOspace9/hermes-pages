// 分野16 ショート動画の型の追加の図。書き方は ../../FIGURE_API.md
// X16.C：縦長9:16の画面（ねこは下寄り、文字は真ん中より上）。X16.v：声の波。X16.pk：一瞬の音の山
// 縦の画面では時間の帯 tl が黒帯に隠れるので、テンポは音の波 snd の段で見せる
const X16 = {
  C: o => Cam(Object.assign({ aspect: V, z: -5.5, f: 35, y: 1.25 }, o)),
  v: x => .35 + .5 * Math.abs(Math.sin(x * 97)),
  pk: (x, c, k) => Math.exp(-Math.abs(x - c) * (k || 60)),
};
XF('16', {
  '最初の1〜3秒のフック（Hook）': { ref: 'hook' },
  // 0秒から上から15〜25%の所に2行の大きな見出し（数字だけ黄色）。出しっぱなしのまま、下でねこが話しながら動く
  '文字のフック（Text hook）': { dur: 5, fn: t => X16.C({ ax: lerp(-.5, .5, t), ay: Math.abs(Math.sin(t * 30)) * .05, mouth: yap(t * 2), text: [{ type: 'fade', u: 1, s: 'ねこの秘密', k: .42, y: .16 }, { type: 'fade', u: 1, s: '3つ', k: .62, y: .26, col: '#ffd23a' }], cap: t < .6 ? '0秒から上に見出し' : '3〜5秒は出しっぱなし' }) },
  '数秒ごとの変化（パターン・インタラプト）（Pattern interrupt）': { ref: 'pattern' },
  'ループする終わり方（Seamless loop）': { ref: 'loop' },
  // 上のほうに進みの棒（黄色）。項目が変わるたびに「2/5」がポンと入れかわる
  '進み具合の表示（Progress indicator）': { dur: 6, fn: t => { const s = seq(t, [1, 1, 1, 1, 1]), i = s.i; return X16.C({ ax: [-.5, .4, -.2, .5, 0][i], ay: .3 * jump(seg(s.u, .3, .7)), cats: i % 2 ? [[-.9, 2]] : null, text: [{ type: 'fade', u: 1, s: '■'.repeat(i + 1) + '□'.repeat(4 - i), k: .3, y: .1, col: '#ffd23a' }, { type: 'pop', u: seg(s.u, 0, .2), s: (i + 1) + '/5', k: .45, y: .19 }], cap: 'あと' + (4 - i) + 'つ' }); } },
  // 予告「1位は最後」→3位・2位・1位の番号を毎回左上の同じ位置に同じポンで。1位だけ金色で長く、跳びも高く火花つき、目が光る
  '数え上げ（Listicle / countdown）': { dur: 6, fn: t => { const s = seq(t, [.7, 1, 1, 1.4]), i = s.i; return X16.C({ ay: [0, .2, .45, 1.1][i] * jump(seg(s.u, .3, .8)), eye: i === 3 ? 1.3 : 1, hl: i === 3 ? 1 : 0, mouth: i === 3 ? .6 * seg(s.u, .3, .5) : 0, part: i === 3 ? { type: 'spark', u: seg(s.u, .55, 1) } : null, text: i ? { type: 'pop', u: seg(s.u, 0, .2), s: (4 - i) + '位', k: .7, x: .42, y: .15, col: i === 3 ? '#ffd23a' : '#fff' } : { type: 'pop', u: seg(s.u, 0, .2), s: '1位は最後！', k: .38, y: .22 }, cap: i ? '番号は毎回同じ所に' : '一番強いのを最後に' }); } },
  // 小さなのぞき穴から少しずつ見せ、答え（ねこ）は最後の2秒まで出さない
  '＋オープンループ（答えを後回しにする）（Open loop）': { dur: 6, fn: t => { const s = seq(t, [1.3, 1, 1, 1.2]), i = s.i; return Cam({ aspect: V, z: -3, y: .85, f: 35, iris: [.08, .13, .19, 1][i], ay: i === 3 ? .5 * jump(seg(s.u, .1, .6)) : 0, text: i === 3 ? { type: 'pop', u: seg(s.u, 0, .2), s: 'ねこ！', k: .6 } : null, cap: ['問い：これは何？', '小さな答え1', '小さな答え2', '答えは最後に'][i] }); } },
  // 3回とも同じ出だし（同じ位置に「その1」）。中身だけ晴れ→雨→夜と変わる
  '＋シリーズ化（Part 2 / episodic）': { dur: 6, fn: t => { const i = cutOf(t, 3), u = (t * 3) % 1; return X16.C(Object.assign({ ax: i === 0 ? lerp(-.4, .4, u) : 0, ay: i === 1 ? .5 * jump(seg(u, .4, .9)) : 0, text: u < .45 ? { type: 'pop', u: seg(u, 0, .12), s: 'その' + (i + 1), k: .55 } : null, cap: u < .45 ? '毎回同じ出だし' : '中身だけ変える' }, [{}, { part: { type: 'rain', u }, tint: '60,80,120,.3' }, { tint: '30,45,120,.4', cats: [[-.8, 2], [.8, 2]] }][i])); } },
  // 本編（話す）のあと、上に二択の問い、2匹の頭の上に「A」「B」。1〜2秒で読める長さ
  '＋問いで終わる（コメントを誘う）（Comment bait / CTA）': { dur: 5, fn: t => { const e = t >= .6; return X16.C({ noA: e, ax: lerp(-.4, .3, seg(t, 0, .6)), mouth: yap(t * 2), cats: [[-.75, 1.5], [.75, 1.5]], text: e ? [{ type: 'pop', u: seg(t, .6, .68), s: 'どっちが好き？', k: .4, y: .2 }, { type: 'pop', u: seg(t, .66, .72), s: 'A', k: .5, x: .4, y: .4, col: '#ffb35a' }, { type: 'pop', u: seg(t, .7, .76), s: 'B', k: .5, x: .6, y: .4, col: '#8fc0ff' }] : null, cap: e ? 'コメントで答えて' : '本編' }); } },
  // 前半：言葉のあいだに0.5秒の無言（口が止まる）。後半：無言を切って言葉がつながり、切れ目でねこが少し跳ねる
  '無言を切るジャンプカット（Jump cut / silence removal）': { dur: 6, fn: t => { const B = [[.02, .12], [.2, .3], [.38, .47], [.52, .62], [.62, .72], [.72, .82], [.82, .92]], on = x => B.some(([a, b]) => x > a && x < b), j = t < .52 ? 0 : Math.min(3, Math.floor((t - .52) / .1)); return X16.C({ z: -3.6, y: 1.05, ax: t < .52 ? 0 : [0, .09, -.06, .07][j], mouth: on(t) ? yap(t * 3) : 0, snd: { rows: [{ label: '声', amp: x => on(x) ? X16.v(x) : 0 }], t }, cap: t < .5 ? '無言0.5秒が入る' : '無言を切る→少し跳ねる' }); } },
  '強調のパンチイン（自動ズーム）（Punch-in）': { ref: 'punch-in' },
  '1語ずつ出る字幕（Word-by-word captions）': { ref: 'captions' },
  // 1語ずつの字幕（話す口に合わせて）のうち、大事な語「3倍」だけ黄色にしてはねる。色は1色だけ
  '色つき強調語（Highlighted keywords）': { dur: 4.4, fn: t => { const i = cutOf(t, 4), u = (t * 4) % 1, key = i === 2; return X16.C({ z: -4.5, tint: '20,22,26,.2', mouth: yap(t * 2), text: { type: key ? 'pop' : 'fade', u: seg(u, 0, key ? .3 : .15), s: ['これで', '売上が', '3倍', 'に！'][i], k: key ? .6 : .45, y: .36, col: key ? '#ffd23a' : '#fff' }, cap: '大事な1語だけ色' }); } },
  // 言葉に合わせて★がポン（約0.2秒）→1秒ほどで消える→次は♪
  '絵文字・スタンプの飛び出し（Emoji / sticker pop）': { dur: 4, fn: t => { const a = t > .15 && t < .45, b = t > .6 && t < .85; return X16.C({ ay: b ? .25 * jump(seg(t, .6, .8)) : 0, text: a || b ? { type: 'pop', u: seg(t, a ? .15 : .6, a ? .2 : .65), s: a ? '★' : '♪', k: .8 } : null, cap: a || b ? 'ポン！（0.5〜1.5秒）' : '' }); } },
  // 文字が出る所にポン、絵が変わる所にシュッ、気づきにピン。音の頭を動きの始まりに合わせる
  '効果音（ポン・シュッ・ピン）（SFX）': { dur: 5, fn: t => { const c2 = t >= .5, w = c2 && t < .54; return X16.C(Object.assign(c2 ? { z: -3.2, y: .9 } : { z: -6, y: .6 }, { ay: t > .78 ? .4 * jump(seg(t, .78, .95)) : 0, hstreak: w ? 1.2 : 0, text: t > .2 && t < .48 ? { type: 'pop', u: seg(t, .2, .25), s: 'ねこ', k: .55 } : t > .78 ? { type: 'pop', u: seg(t, .78, .83), s: '！', k: .7 } : null, snd: { rows: [{ label: 'ポン', amp: x => X16.pk(x, .2) }, { label: 'シュッ', col: '#5b86c9', amp: x => x > .47 && x < .54 ? .7 : 0 }, { label: 'ピン', col: '#9a7fd1', amp: x => X16.pk(x, .78) }], t } })); } },
  // 声（口）は続いたまま、絵だけが話の中身（遠くの町）に2秒ほど変わり、また話す顔に戻る
  'Bロールかぶせ（B-roll overlay）': { dur: 6, fn: t => { const b = t > .38 && t < .75, rows = [{ label: '声', amp: x => x < .95 ? X16.v(x) : 0 }, { label: '絵', col: '#5b86c9', smooth: true, amp: x => x > .38 && x < .75 ? .85 : .25 }]; return b ? Object.assign(at(Cam({ aspect: V, noA: true, x: lerp(-.5, .5, seg(t, .38, .75)), y: 2.5, z: 4, f: 24, sun: [30, 30] }), 0, 3, 40), { snd: { rows, t }, cap: 'Bロール（声は続く）' }) : X16.C({ z: -3.4, y: 1.05, mouth: t < .95 ? yap(t * 2.5) : 0, snd: { rows, t }, cap: '話す顔' }); } },
  // 話す本編の途中に、1秒だけ大げさなネタの場面（口をあんぐり開けた青いねこ・寄り・ゆれ・赤・ネタの音ごと）→すぐ戻る
  'ミームの差し込み（Meme insert）': { dur: 4, fn: t => { const m = t > .45 && t < .7, rows = [{ label: '声', amp: x => x > .45 && x < .7 ? 0 : X16.v(x) }, { label: 'ネタの音', col: '#b85c4a', amp: x => x > .45 && x < .7 ? .9 : 0 }]; return m ? at(Cam({ aspect: V, noA: true, cats: [[0, 0, 0, 1]], x: .4, y: .9, z: -1.6, f: 50, dz: lerp(1, 1.4, seg(t, .45, .5)), shake: 3, tint: '200,40,40,.25', text: { type: 'pop', u: seg(t, .45, .5), s: '！？', k: .9, y: .25, col: '#ffd23a' }, snd: { rows, t }, cap: 'ネタ1秒' }), 0, .8, 0) : X16.C({ z: -3.6, y: 1.05, mouth: yap(t * 2), snd: { rows, t }, cap: '本編' }); } },
  // 操作の画面（無地）で、指し示す印（ねこ）が動いて押す→押した所へ0.5秒でなめらかに180%→戻る
  '画面録画とカーソルへの寄り（Screen recording + cursor zoom）': { dur: 5, fn: t => { const z = ease(seg(t, .32, .42)) * (1 - ease(seg(t, .72, .82))), ax = lerp(-.7, .5, ease(seg(t, .05, .3))); return Cam({ aspect: V, plain: '#e9ecf1', z: -5, y: .6, f: 35, ax, cats: [[-.5, 1.5], [.5, 1.5]], dz: 1 + .8 * z, ox: .097 * z, track: t > .3 && t < .82 ? 1 : 0, cap: z > .05 ? '押した所へ180%' : '画面録画' }); } },
  // 顔を出さず、町の映像に字幕。合成の声は同じ長さ・同じ強さの音がきっちり並ぶ
  '＋読み上げ音声（Text-to-speech voice）': { dur: 6, fn: t => { const i = cutOf(t, 3), on = x => (x * 3) % 1 > .05 && (x * 3) % 1 < .85 && (x * 30) % 1 < .7; return Object.assign(at(Cam({ aspect: V, noA: true, crowd: true, x: lerp(-.6, .6, t), y: 3, z: -8, f: 30 }), 0, .5, 0), { text: { type: 'fade', u: seg((t * 3) % 1, 0, .08), s: ['ねこの町には', '秘密がある', 'それは…'][i], k: .45 }, snd: { rows: [{ label: '合成の声', smooth: true, amp: x => on(x) ? .6 : .03 }], t }, cap: '顔も声も出さない' }); } },
  // 右から手（茶色）がレンズをふさぎ、真っ暗のコマで切る→手がどくと夜の別の場所
  '手で隠す転換（Hand cover transition）': { dur: 4, fn: t => { const a = t < .5, v = a ? ease(seg(t, .2, .5)) : 1 - ease(seg(t, .5, .8)), hand = Cam({ plain: '#6b4a36', noA: true }), base = a ? X16.C({ ax: lerp(-.3, .2, t) }) : Object.assign(SB({ x: 1 }), { aspect: V }); return Object.assign(base, { tr: { B: hand, clip: 'wipe', u: .3 + .4 * v }, black: .5 * clamp(1 - Math.abs(t - .5) * 10), cap: a ? '手でふさぐ' : '手をどける→別の場所' }); } },
  // 固定カメラ。跳んだてっぺん（体が止まるコマ）で切り、着地は雪の別の場所
  'ジャンプ転換（Jump transition）': { dur: 4, fn: t => { const p = seg(t, .15, .85), b = p >= .5; return X16.C(Object.assign({ ay: 1.1 * jump(p), cap: b ? 'てっぺんで切る→着地は別の所' : '同じ位置で跳ぶ' }, b ? { part: { type: 'snow', u: t }, tint: '200,220,255,.3', cats: [[-.9, 3]] } : {})); } },
  // 固定カメラ・同じ場所。回り始めた途中で切ると、同じ形のまま服の色（オレンジ→青）だけ変わる
  '着替え転換（Outfit change transition）': { dur: 4, fn: t => { const b = t >= .5; return X16.C(b ? { noA: true, cats: [[0, 0]], cap: '服だけ変わる' } : { sx: Math.max(.05, Math.cos(1.5708 * seg(t, .25, .5))), cap: t > .25 ? '回る（きっかけ）' : '足の位置は固定' }); } },
  // 「パチン」の音の山のコマで切る。1〜2コマの白い光と小さなゆれを足す
  '指パッチン転換（Snap transition）': { dur: 4, fn: t => { const b = t >= .5, k = b ? Math.exp(-(t - .5) * 30) : 0, c = b ? Object.assign(SB({ x: 1 }), { aspect: V }) : X16.C({ sq: 1 + .04 * Math.abs(Math.sin(t * 60)) }); return Object.assign(c, { flash: .6 * clamp(1 - Math.abs(t - .5) * 30), shake: 3 * k, snd: { rows: [{ label: 'パチン', amp: x => X16.pk(x, .5, 80) }], t }, cap: b ? '別の場所' : '音の山で切る' }); } },
  // 画面がぐるっと1回転。回る速さが一番速い（ぶれが一番強い）真ん中で次の場面に
  'スピンつなぎ（Spin / whip transition）': { dur: 4, fn: t => { const v = seg(t, .3, .7), r = Math.PI * (1 - Math.cos(Math.PI * v)), k = 1.5 * Math.sin(Math.PI * v), c = v < .5 ? X16.C({}) : Object.assign(SB({ x: 1 }), { aspect: V }); return Object.assign(c, { roll: r, hstreak: k, cap: v > 0 && v < 1 ? 'ぶれの真ん中で切る' : '' }); } },
  // 跳んだてっぺんで1秒止め、背景を暗く・ねこだけ明るく切り抜いて縁取り、名前を添える
  '止め絵＋白ふちの切り抜き': { dur: 4, fn: t => { const fz = t > .35 && t < .65, p = t < .35 ? t / .35 * .5 : fz ? .5 : .5 + (t - .65) / .35 * .5, m = o => X16.C(Object.assign({ ay: jump(p), still: fz }, o)); return fz ? m({ tint: '20,22,26,.6', over: m({ plain: 'none' }), roto: 1, flash: .5 * clamp(1 - (t - .35) * 20), text: { type: 'fade', u: seg(t, .38, .45), s: 'オレンジ', k: .45 }, cap: '止めて切り抜く' }) : m({}); } },
  // 前半：写真に寄るだけ（ずれない）。後半：人・背景を分けて動かすので、手前の青いねこと奥がずれる
  '写真の立体化': { dur: 6, fn: t => { const i = cutOf(t, 2), u = (t * 2) % 1, o = { still: true, sepia: .15, cats: [[.6, -3]], cap: i ? '人と背景を分けて動かす' : '写真のまま寄る' }; return i ? at(X16.C(Object.assign({ x: lerp(-.4, .4, u), z: lerp(-5.5, -4.8, u), dof: .4, fd: 5 }, o)), 0, .8, 0) : X16.C(Object.assign({ dz: lerp(1, 1.25, u), oy: lerp(0, -.05, u) }, o)); } },
  // ①背景に大きな題 ②ねこを文字より上に重ねる（ねこの所の字が隠れる）
  '人の後ろに入る文字（Text behind subject）': { dur: 5, fn: t => { const b = t >= .45; return Cam({ aspect: V, z: -3, y: .85, f: 35, noA: !b, ay: b ? .25 * (1 - ease(seg(t, .45, .6))) : 0, roto: b ? seg(t, .5, .75) : 0, text: { type: b ? 'fade' : 'stagger', u: b ? 1 : seg(t, .05, .35), s: b ? 'ね　道' : 'ねこ道', k: 1 }, cap: b ? '②人を文字の上に' : '①背景＋大きな題' }); } },
  '物に張りつくスタンプ（Tracked sticker）': { ref: 'tracking' },
  // まわりは灰色に、ねこ（見てほしい物）の色だけ残す
  '色だけ残す': { dur: 4, fn: t => { const on = ease(seg(t, .35, .5)), o = { ax: lerp(-.4, .4, t), ay: Math.abs(Math.sin(t * 30)) * .05 }; return X16.C(Object.assign({ cats: [[-.8, 1.5], [.9, 2.5]], keep: on, cap: on > .5 ? 'ねこの色だけ残す' : '元の絵' }, o)); } },
  // 拍ごとに「速く（拍の頭）→ゆっくり」をくり返す。下は拍と速さ
  '速度編集（ベロシティ）': { dur: 5, fn: t => { const b = Math.floor(t * 8), w = (t * 8) % 1, f = w < .3, p = (b + (f ? w / .3 * .8 : .8 + (w - .3) / .7 * .2)) / 8, ax = lerp(-.8, .8, p); return X16.C({ ax, ay: Math.abs(Math.sin(p * 40)) * .08, trail: f ? [[-.15, 0, .4], [-.3, 0, .2]] : null, rate: f ? 3 : .3, snd: { rows: [{ label: '拍', amp: x => X16.pk((x * 8) % 1, 0, 40) }, { label: '速さ', col: '#5b86c9', smooth: true, amp: x => (x * 8) % 1 < .3 ? .9 : .2 }], t }, cap: f ? '速く' : 'ゆっくり' }); } },
  // 拍ごとに1回だけ、小さく寄る・光る・ゆれる
  '拍の揺れ・光': { dur: 4, fn: t => { const k = Math.exp(-((t * 8) % 1) * 8); return X16.C({ dz: 1 + .06 * k, flash: .3 * k, shake: 1.5 * k, sq: 1 + .05 * k, snd: { rows: [{ label: '拍', amp: x => X16.pk((x * 8) % 1, 0, 40) }], t }, cap: '1拍に1回だけ' }); } },
  // 曲が盛り上がる所で、上下の黒帯が0.7秒かけて入ってくる（横長の画面で）
  '黒帯で映画風（Cinematic bars）': { dur: 5, fn: t => { const u = ease(seg(t, .5, .65)); return Object.assign(at(Cam({ x: lerp(-.6, .6, t), z: -9, y: 1.4, f: 30, ax: lerp(-.3, .3, t), sun: [20, 25], tint: '255,170,90,.12', aspect: u > 0 ? lerp(16 / 9 + .002, 2.39, u) : 0 }), 0, .9, 0), { snd: { rows: [{ label: '曲', amp: x => x < .5 ? .25 + .6 * x : .9 }], t }, cap: u > 0 ? '盛り上がりで帯が入る' : '帯なし' }); } },
  // 流行の音の決まった合図（4か所、間かくはばらばら）に、寄り・跳ぶ・振り向く・決めを1つずつ置く
  '＋音ハメ（流行の音に動きを合わせる）（Sound sync / trend audio）': { dur: 5, fn: t => { const Q = [.2, .45, .55, .8], k = Q.filter(q => t >= q).length; return X16.C(Object.assign(k >= 1 && k < 4 ? { z: -3.4, y: 1.05 } : {}, { ay: k === 2 ? .5 * jump(seg(t, .45, .55)) : 0, sx: k === 3 ? -1 : 1, text: k === 4 ? { type: 'pop', u: seg(t, .8, .85), s: 'キメ！', k: .55 } : null, snd: { rows: [{ label: '流行の音', amp: x => .2 + .75 * Math.max(...Q.map(q => X16.pk(x, q, 70))) }], t }, cap: '音の合図に動きを置く' })); } },
  // 上＝話すねこ、下＝関係のない走るゲーム（障害物が流れ続ける）。※画面の分割は音の段で代用
  '上下2画面（下にゲーム）（Split screen with gameplay）': { dur: 5, fn: t => X16.C({ plain: '#111', noA: true, cap: '上＝話／下＝ゲーム', pip: [{ cam: Cam({ z: -3, f: 40, y: .85, sq: 1 + .04 * Math.abs(Math.sin(t * 80)) }), x: 0, y: 0, w: 1, h: .5, frame: 0 }, { cam: at(Cam({ x: 0, y: 5, z: -3 + ((t * 24) % 6), f: 24, noA: true, cats: [[1.2 * Math.sin(t * 14), 3 + ((t * 24) % 6)]] }), 0, 0, 4 + ((t * 24) % 6)), x: 0, y: .5, w: 1, h: .5, frame: 0 }] }) },
  // 元の動画（大勢の青いねこ）を大きく、自分（オレンジ）を左上に小さく。見どころで自分がびっくり
  'リアクションの小窓': { dur: 5, fn: t => { const e = t > .5; return Object.assign(at(Cam({ aspect: V, noA: true, crowd: true, x: 1, y: 3.2, z: -9, f: 28, dz: e ? lerp(1, 1.3, ease(seg(t, .5, .6))) : 1 }), 0, .5, -2), { pip: [{ cam: Cam({ z: -2.6, f: 40, y: .85, plain: '#2a3550', ay: e ? .35 * jump(seg(t, .52, .7)) : 0, sq: e ? 1.1 : 1 }), x: .05, y: .08, w: .42, h: .2 }], cap: e ? '見どころで反応' : '左上に自分の顔' }); } },
  // ①緑の幕の前 ②緑を記事の画面に替え、人は下3分の1に小さく、資料を上に大きく
  'グリーンバック背景（Green screen）': { dur: 5, fn: t => { const b = t >= .4, me = Cam({ plain: 'none', z: -4.5, y: 1.9, f: 35, sq: 1 + .04 * Math.abs(Math.sin(t * 80)) }); return Cam({ aspect: V, noA: true, plain: b ? '#f4f1ea' : '#2fbf4a', over: me, text: b ? { type: 'fade', u: seg(t, .4, .48), s: 'ねこ町に新駅', k: .42 } : null, cap: b ? '人を下に・資料を大きく' : '緑の前で撮る' }); } },
  '縦型の安全枠（Safe zone）': { ref: 'safezone' },
  // 上にコメントの吹き出し（白地に黒い字の札）がすべって貼られ、読み上げ（口が動く）たあと、ねこが跳んで動画で答える
  '＋コメント返信の貼り付け（Reply to comment）': { dur: 5, fn: t => X16.C({ ay: t > .5 ? .9 * jump(seg(t, .5, .8)) : 0, mouth: t < .45 ? yap(t * 2) : 0, eye: t > .5 ? 1.2 : 1, text: [{ type: 'slide', u: seg(t, .02, .12), s: 'コメント', k: .2, y: .09, col: '#ffd23a' }, { type: 'slide', u: seg(t, .02, .12), s: '「本当に跳べる？」', k: .3, y: .15, col: '#14161a', edge: '#ffffff' }], cap: t < .45 ? 'コメントを読み上げ' : '動画で答える' }) },
  // 前半ステッチ：人の動画（青）の冒頭を引用→自分の続き。後半デュエット：左に人の動画、右に自分
  '＋デュエット・ステッチ（Duet / Stitch）': { dur: 6, fn: t => { const O = o => Cam(Object.assign({ aspect: V, noA: true, cats: [[0, 0]], z: -4.5, y: .9, ay: .3 * jump((t * 3) % 1) }, o)), M = o => Cam(Object.assign({ aspect: V, z: -4.5, y: .9, ay: .3 * jump((t * 3) % 1) }, o)); return t < .25 ? O({ cap: 'ステッチ：人の冒頭' }) : t < .5 ? M({ sq: 1 + .04 * Math.abs(Math.sin(t * 80)), cap: '→自分の続き' }) : Cam({ aspect: V, plain: '#111', noA: true, pip: [{ cam: O({ aspect: 0 }), x: 0, y: .2, w: .5, h: .6 }, { cam: M({ aspect: 0 }), x: .5, y: .2, w: .5, h: .6 }], cap: 'デュエット：横に並ぶ' }); } },
  // 状況は文字1行。見る人が相手役で、ねこがレンズに向かって話しかける
  '＋POV形式（POV video）': { dur: 5, fn: t => aimHead(X16.C({ z: -2.2, y: .85, shake: .8, sq: 1 + .05 * Math.abs(Math.sin(t * 80)), ay: t > .6 ? .15 * jump(seg(t, .6, .75)) : 0, text: { type: 'fade', u: seg(t, 0, .1), s: 'POV：遅刻した朝', k: .38 }, cap: '見る人＝相手役' })) },
  // 横長の1枚：驚いた顔→赤い玉1つ→左上に文字2行、の3つだけ。最後に一覧の中の小さな1枚にして、小さくても分かるか見る
  '＋サムネと題名（YouTubeの長い動画）（Thumbnail and title）': { dur: 5, fn: t => { const i = t < .3 ? 0 : t < .55 ? 1 : 2, T = j => aimHead(Cam({ still: true, x: .5, z: -2.6, y: .85, f: 45, sq: 1.08, eye: 1.6, mouth: .9, hl: 1, props: j ? [{ t: 'ball', x: .6, y: .35, z: 0, s: .6 }] : null, text: j === 2 ? [{ type: 'pop', u: seg(t, .55, .62), s: 'まさかの', k: .7, x: .2, y: .2, col: '#ffd23a' }, { type: 'pop', u: seg(t, .58, .65), s: '結末', k: .9, x: .2, y: .36, col: '#ffd23a' }] : null })); return t > .78 ? Cam({ plain: '#f1f2f4', noA: true, pip: [{ cam: T(2), x: .05, y: .1, w: .4, h: .4 }, { cam: Cam({ plain: '#c9ccd2', noA: true }), x: .05, y: .56, w: .4, h: .4, frame: 0 }], text: [{ type: 'fade', u: 1, s: 'ねこが見たもの', k: .3, x: .66, y: .22, col: '#22252b', edge: 0 }, { type: 'fade', u: 1, s: '再生 1.2万回', k: .2, x: .62, y: .32, col: '#777b84', edge: 0 }], cap: '小さくても分かる？' }) : Object.assign(T(i), { cap: ['顔の表情', '＋物1つ', '＋文字3〜4語'][i] }); } },
});
