// 分野10 の追加の図。書き方は ../../FIGURE_API.md
// 特撮は「前半＝見える絵、後半＝種あかし」の2段が多い。X10.h(t)=0/1（前半/後半）、X10.u(t)=その中の進み0〜1
const X10 = {
  h: t => cutOf(t, 2),
  u: t => (t * 2) % 1,
  // 歩く小さな上下
  step: s => Math.abs(Math.sin(s * Math.PI * 8)) * .06,
  // 部屋の回転で拡大されないように打ち消す倍率
  dzr: r => 1 / (1 + Math.abs(Math.sin(r)) * .9),
};
XF('10', {
  '強制遠近法（Forced perspective）': { ref: 'forced' },
  // 低く広角＝本物の街の爆発→高く上から見るとただの模型（ミニチュアらしく見えるぼけ）
  'ミニチュア（Miniature）': { dur: 5, fn: t => { const h = X10.h(t), u = X10.u(t); if (!h) { const e = seg(u, .35, .95); return at(Cam({ y: .15, z: -4, f: 18, crowd: true, part: e > 0 ? { type: 'spark', u: e } : null, shake: e > 0 ? 5 * Math.exp(-e * 6) : 0, cap: '低く広角：本物の大きさ' }), 0, .9, 0); } const v = ease(u); return at(Cam({ y: lerp(2.5, 6, v), z: lerp(-6, -8, v), f: 30, crowd: true, tilt: v, cap: '上から見ると模型' }), 0, 0, -1); } },
  // 小さな模型に寄ると、ピントが浅く粗が出る／人の背より大きな模型なら寄ってもくっきり
  'ビガチュア（Bigature）': { dur: 5, fn: t => { const h = X10.h(t), v = ease(X10.u(t)), z = lerp(-6, -2, v); return aimHead(Cam({ z, y: .8, f: 28, dof: h ? 0 : .9, fd: h ? -z : -z * .55, grain: h ? 0 : .45, cats: [[-1.4, 3], [1.3, 5]], cap: h ? '大きな模型：くっきり' : '小さい模型：寄ると粗い' })); } },
  // 奥の無いセット（灰色）に、カメラの前のガラスに描いた奥の景色が重なって1枚に
  'ガラス絵（マットペインティング／Matte painting）': { dur: 5, fn: t => { const u = ease(seg(t, .3, .7)), o = { z: -6, f: 30, y: .8, cats: [[-1.5, 3], [1.4, 5]] }; return Cam(Object.assign({}, o, { plain: '#8d8577', frame: u > 0 && u < 1 ? 1 : 0, tr: { B: Cam(Object.assign({ sepia: .12 }, o)), mix: u, u }, cap: u <= 0 ? 'セットは手前だけ' : u < 1 ? 'ガラスに奥を描く' : '1枚の絵に見える' })); } },
  // 左＝鏡に映った模型の街、右＝鏡を削った穴の向こうの役者→1回の撮影で合わさる
  'シュフタン法（Schüfftan process）': { dur: 5, fn: t => { const s = t * 1, A = { plain: 'none', ax: lerp(-1.2, 1.2, s), ay: X10.step(s), az: 1, sq: .5, sx: .5 }, cam = o => at(Cam(Object.assign({ z: -6, f: 28, y: 1.4 }, o)), 0, .6, 1); return t < .5 ? cam({ noA: true, crowd: true, tr: { B: cam(Object.assign({}, A, { plain: '#22252b' })), clip: 'wipe', u: .5 }, cap: '左は鏡・右は穴' }) : cam({ noA: true, crowd: true, over: cam(A), cap: '模型の街に役者' }); } },
  // カメラの1.6m前に吊った小さな模型が、11m奥の青いねこの上に乗って見える→横から見ると宙に浮いている
  '吊りミニチュア（Hanging miniature）': { dur: 5, fn: t => { const h = X10.h(t), v = ease(seg(X10.u(t), .1, .8)), c = Cam({ x: h ? lerp(0, 2.4, v) : 0, y: h ? lerp(.7, 1.3, v) : .7, z: -7, f: h ? 28 : 35, az: -5.4, ay: .7 + .5 / 11 * 1.6, sq: .3, sx: .3, cats: [[0, 4]], cap: h ? '横から：前に吊った模型' : '上の階まで続いて見える' }); return h ? at(c, 0, .8, -1) : c; } },
  // 半透明の幽霊が浮かぶ→種あかし：隠れた役者を照らすと映り、消すと消える
  "ペッパーズ・ゴースト（Pepper's ghost）": { dur: 5, fn: t => { const h = X10.h(t), u = X10.u(t), a = h ? (Math.sin(u * Math.PI * 4) > 0 ? .5 : .04) : .4; return Cam({ z: -5, f: 35, y: .8, noA: true, ax: .6, ay: .25 + .08 * Math.sin(t * 12), trail: [[0, 0, a]], cats: [[-1, 1]], tint: '25,30,70,.3', cap: h ? (a > .3 ? '照らすと映る' : '消すと消える') : '半透明の幽霊' }); } },
  'リアプロジェクション（Rear projection／スクリーン・プロセス）': { ref: 'process' },
  // 流れる背景の比べ：裏から映す＝白っぽく浅い／カメラ側から映す＝明るくくっきり
  'フロントプロジェクション（Front projection）': { dur: 5, fn: t => { const h = X10.h(t), u = X10.u(t); return Cam({ noA: true, z: lerp(8, -22, u), f: 28, y: .9, tint: h ? null : '225,220,205,.45', grade: h ? { f: 'contrast(1.15) saturate(1.2)' } : null, over: Cam({ z: -2.6, f: 40, y: .8, plain: 'none', shake: .8 }), cap: h ? 'フロント：明るくくっきり' : 'リア：浅く平たい' }); } },
  // カメラが左右に動く：ただの映像だと背景がずれない／LEDの壁はカメラに合わせて視差が合い、景色の光も乗る
  'LEDの壁（バーチャルプロダクション／Virtual production）': { dur: 6, fn: t => { const h = X10.h(t), x = 1.4 * Math.sin(X10.u(t) * Math.PI * 2), cam = o => at(Cam(Object.assign({ x, z: -4.5, y: .9, f: 32 }, o)), 0, .8, 0); return h ? cam({ tint: '255,140,60,.18', cap: '視差が合う＋光が乗る' }) : at(Cam({ z: -4.5, y: .9, f: 32, noA: true, over: cam({ plain: 'none' }), cap: 'ただの映像：ずれる' }), 0, .8, 0); } },
  // 1回目に景色→巻き戻す（黒）→2回目に大きな顔を重ねる。半分ずつのまま止まる
  '多重露光（Multiple exposure）': { dur: 5, fn: t => { const i = t < .3 ? 0 : t < .45 ? 1 : 2, m = i < 2 ? 0 : .5 * ease(seg(t, .45, .65)); return Cam({ z: -6, f: 30, y: 1, noA: true, crowd: true, sepia: .1, black: i === 1 ? .85 : 0, tr: { B: Cam({ z: -2.3, f: 35, y: .85, sepia: .1 }), mix: m, u: m }, cap: ['1回目：景色', '巻き戻す', '2回目を重ねる'][i] }); } },
  // 回す→止めて（暗く）ねこが出て、青いねこが入る→つなぐと一瞬で入れかわる
  '置き換えトリック（Substitution splice／メリエスの止め撮り）': { dur: 5, fn: t => { const i = t < .33 ? 0 : t < .7 ? 1 : 2, u = seg(t, .33, .7); return TC({ noA: i === 2, ax: i === 1 ? lerp(0, 3.5, u) : 0, ay: i === 1 ? X10.step(u) : 0, cats: i === 1 ? [[lerp(-3.5, 0, u), 0]] : i === 2 ? [[0, 0]] : null, black: i === 1 ? .55 : 0, flash: i === 2 ? clamp(1 - (t - .7) * 20) * .6 : 0, rate: i === 1 ? 0 : 1, cap: ['回す', '止めて入れかえ', 'つなぐと変身'][i] }); } },
  // 撮る：歩いてきて火花がはじける→逆に再生：火花がねこに吸いこまれ、後ろ向きに戻る
  '逆回し撮影（Reverse motion）': { dur: 5, fn: t => { const b = t >= .5, u = b ? 1 - (t - .5) * 2 : t * 2, e = seg(u, .45, 1); return TC({ ax: lerp(-1.8, 0, seg(u, 0, .4)), ay: X10.step(seg(u, 0, .4)), part: e > 0 ? { type: 'spark', u: e } : null, shake: !b && e > 0 ? 3 * Math.exp(-e * 8) : 0, scan: b ? .3 : 0, cap: b ? '逆再生：元にもどる' : '撮る：はじける' }); } },
  // 光の線が奥から流れ続けるトンネル→動くねこが、時間のずれた何枚もの細切れでゴムのようにのびる
  'スリットスキャン（Slit-scan）': { dur: 6, fn: t => { if (t < .5) return Cam({ noA: true, z: lerp(-30, 30, t * 2), y: 1, f: 20, streak: 1.2, tint: '10,12,40,.6', glow: .45, cap: '光のトンネル' }); const u = (t - .5) * 2; return Cam({ z: -6, f: 35, ax: lerp(-2, 2, u), sx: 1.5, trail: [1, 2, 3, 4, 5, 6].map(j => [-.18 * j, .05 * j * Math.sin(u * 9), .5 - .07 * j]), cap: '列ごとに時間をずらす' }); } },
  // 前半：部屋は止まり、ねこが壁から天井へ歩く／後半：本当は部屋（とカメラ）が回り、ねこは下にいるだけ
  '回転セット（Rotating set）': { dur: 6, fn: t => { const h = X10.h(t), u = X10.u(t), r = Math.PI * ease(seg(u, .1, .9)), o = { z: -4.5, f: 30, y: .9 }, A = Cam(Object.assign({ plain: 'none', ay: X10.step(u) }, o)); if (!h) return Cam(Object.assign({ noA: true, over: Object.assign(A, { roll: -r, dz: X10.dzr(r) }), cap: '壁から天井へ歩く' }, o)); return Cam(Object.assign({ noA: true, roll: r, dz: X10.dzr(r), over: A, cap: '本当は部屋が回る' }, o)); } },
  // 見上げた空に、白いもやがゆっくりふくらむ→種あかし：水槽の中で白い絵の具が広がる
  '雲のタンク（Cloud tank）': { dur: 6, fn: t => { const h = X10.h(t), u = X10.u(t), e = ease(u); return h ? Cam({ plain: '#2a4d6e', noA: true, part: { type: 'snow', u: u * .5 }, glow: .4, rate: .25, cap: '水槽に白い絵の具' }) : Cam({ y: .5, z: -7, f: 24, pitch: .35, noA: true, glow: .5 * e, dof: .5 * e, fd: 1, tint: `240,240,245,${(.4 * e).toFixed(2)}`, rate: .25, cap: '重い雲がわく' }); } },
  // 青緑の霧の中でねこがゆっくり浮き、泡が上へ→種あかし：水は無く、吊って煙と光で見せる
  '水の中に見せる（ドライ・フォー・ウェット／Dry for wet）': { dur: 6, fn: t => { const h = X10.h(t), u = X10.u(t); return Cam({ z: -4.5, f: 35, y: .9, ay: .5 + .12 * Math.sin(t * Math.PI * 4), sx: 1 + .04 * Math.sin(t * 20), tint: h ? '200,200,205,.25' : '20,110,125,.45', dof: h ? 0 : .5, fd: 4.5, part: h ? null : { type: 'snow', u: 4 - u * 1.2 }, rate: .5, cap: h ? '水なし：吊って煙' : '水の中に見える' }); } },
  // 顔の寄り：部品を1つずつ貼って形が変わり（段々）、最後に色を塗って別の生き物に
  '特殊メイク（Prosthetic makeup）': { dur: 5, fn: t => { const k = Math.min(3, Math.floor(seg(t, .12, .8) * 4)), m = ease(seg(t, .62, .8)), p = Math.min(k, 2); return Cam({ z: -2.4, y: .85, f: 35, plain: '#2b2d33', sx: 1 + .13 * p, sq: 1 - .07 * p, grade: m > 0 ? { f: `hue-rotate(${Math.round(150 * m)}deg) saturate(${(1 - .3 * m).toFixed(2)})` } : null, cap: ['元の顔', '部品を貼る', 'もう1つ貼る', '色を塗る'][k] }); } },
  // 首（横の位置）がおくれて動き、揺れ戻して止まる＋息をする→引くと裏に操作する人たち
  'アニマトロニクス（Animatronics）': { dur: 6, fn: t => { const h = X10.h(t), u = X10.u(t), v = Math.max(0, u - .3) * 10, ax = u < .3 ? -.4 : -.4 + .8 * (1 - Math.exp(-.8 * v) * Math.cos(2.2 * v)), e = ease(u), C = [[2.2, -1.5], [2.7, -.6], [1.9, -2.4]]; return at(Cam({ x: h ? lerp(0, 1.5, e) : 0, z: h ? lerp(-3.5, -7, e) : -3.5, y: h ? lerp(.9, 2.2, e) : .9, f: 35, ax, sq: 1 + .04 * Math.sin(t * Math.PI * 6), cats: C, cap: h ? '裏で数人が遠隔操作' : '息をして揺れ戻す' }), h ? .8 : 0, .8, h ? -.8 : 0); } },
  // 黒帯の中では人形だけが小さく動く→引くと、人形の下に人（青いねこ）が隠れている
  '操り人形（Puppetry）': { dur: 6, fn: t => { const h = X10.h(t), e = ease(seg(X10.u(t), .1, .7)), w = { ax: .15 * Math.sin(t * 9), sx: 1 + .05 * Math.sin(t * 14), sq: 1 + .04 * Math.sin(t * 11 + 1), ay: 1.5 + .08 * Math.abs(Math.sin(t * 7)), cats: [[0, .3]] }; return h ? at(Cam(Object.assign({ z: lerp(-4, -6, e), y: lerp(2.2, 1.4, e), f: 35, cap: '下に人が隠れて動かす' }, w)), 0, 1.3, 0) : Cam(Object.assign({ z: -4, y: 2.2, f: 40, aspect: 2.3, cap: '人形が生きて見える' }, w)); } },
  // 低く見上げた巨大なねこが、街（青いねこ）の中をゆっくり重く歩く→実際はふつうの速さで動く人
  '着ぐるみ（Suit acting）': { dur: 6, fn: t => { const h = X10.h(t), u = X10.u(t), C = [[-2, -2.2], [1.9, -3], [-1.4, 2], [2.1, 1.5], [.3, 3.5]]; if (!h) return at(Cam({ y: .3, z: -7, f: 24, ax: lerp(-1, 1, u), sq: 3, sx: 3, cats: C, shake: 2.5 * Math.exp(-((u * 4) % 1) * 8), rate: .5, cap: '低く見上げ＋ゆっくり' }), 0, 1.6, 0); return Cam({ z: -7, y: 1.2, f: 30, ax: Math.sin(u * Math.PI * 4), ay: Math.abs(Math.sin(u * Math.PI * 16)) * .08, cats: C, rate: 1, cap: '本当は人がふつうに' }); } },
  // 通った道を残像で：ふつうのジャンプ（とがった山）→ワイヤー（てっぺんで長く止まる平らな山）
  'ワイヤーアクション（Wire work／Wire-fu）': { dur: 6, fn: t => { const h = X10.h(t), u = X10.u(t), Y = s => h ? 2 * Math.pow(Math.sin(Math.PI * clamp(s)), .35) : 2 * 4 * clamp(s) * (1 - clamp(s)), X = s => lerp(-2.5, 2.5, clamp(s)); return Cam({ z: -7.5, f: 28, y: 1.2, ax: X(u), ay: Y(u), trail: [1, 2, 3, 4, 5, 6].map(j => { const s = u - j * .07; return s > 0 ? [X(s) - X(u), Y(s) - Y(u), .4 - .05 * j] : [0, 0, 0]; }), props: h ? [{ t: 'line', x: X(u), y: Y(u) + 1.15, z: 0, x2: X(u) * .4, y2: 9, z2: 0, w: .045, col: '#22252b' }] : null, cap: h ? 'ワイヤー：頂点で止まる' : 'ふつうの放物線' }); } },
  // 仕掛けた所が爆発：最初の1〜2コマだけ周りが強く照らされ、橙の光がひいていく
  '火薬（Pyrotechnics）': { dur: 4, fn: t => { const on = t > .35, d = t - .35; return Cam({ z: -7, f: 28, y: .9, noA: true, cats: [[-1.6, -1], [1.5, -.5]], part: on ? { type: 'spark', u: seg(t, .35, .9) } : null, flash: on ? .6 * Math.exp(-d * 40) : 0, glow: on ? .3 * Math.exp(-d * 6) : 0, shake: on ? 6 * Math.exp(-d * 10) : 0, tint: on ? `255,120,40,${(.35 * Math.exp(-d * 5)).toFixed(2)}` : null, cap: on ? '周りも本当に光る' : '仕掛ける' }); } },
  // 当たった所が一瞬弾け、体がはねる→スロー：服の下の袋が破れる様子
  '血のり（スクイブ／Squib）': { dur: 5, fn: t => { const h = X10.h(t), u = X10.u(t), e = h ? seg(u, .15, 1) * .5 : seg(u, .4, .75), p = e > 0 ? Math.exp(-e * 6) : 0; return TC({ ax: -.25 * ease(clamp(e * 4)), sq: 1 - .08 * p, part: e > 0 ? { type: 'spark', u: e } : null, tint: e > 0 ? `180,20,20,${(.3 * p).toFixed(2)}` : null, rate: h ? .25 : 1, cap: h ? '服の下で袋が弾ける' : '当たった所が弾ける' }); } },
  // 窓（白い枠）に向かってとびこむ→破れた瞬間に白く光ってかけらが落ちる→スロー：割れても切れない板
  '割れるガラス（Breakaway glass）': { dur: 5, fn: t => { const h = X10.h(t), u = X10.u(t), s = h ? lerp(.3, .75, u) : u, k = seg(s, .5, 1); return Cam({ z: -7, f: 30, y: .9, az: lerp(2, -4, seg(s, 0, .7)), ay: jump(seg(s, .15, .7)) * .7, frame: s < .5 ? 1 : 0, flash: k > 0 ? .5 * Math.exp(-k * 25) : 0, part: k > 0 ? { type: 'snow', u: k * 3 } : null, shake: k > 0 ? 4 * Math.exp(-k * 10) : 0, rate: h ? .25 : 1, cap: h ? 'スロー：樹脂の板' : '窓を突き破る' }); } },
  // 3つの機械：雨（後ろから照らして光らせる）／風（大きな扇風機）／煙（スモークで奥が霞む）
  '雨・風・煙の機械（Rain / Wind / Fog machines）': { dur: 6, fn: t => { const i = cutOf(t, 3), u = (t * 3) % 1, o = { z: -5, f: 32, y: .8, cats: [[-1.3, 3], [1.2, 6]] }; return Cam(Object.assign(o, [{ sun: [10, 25], glow: .35, tint: '60,70,90,.35', part: { type: 'rain', u }, cap: '雨：後ろから照らす' }, { sx: 1 + .08 * Math.sin(u * 40), ax: .08 * Math.sin(u * 25), hstreak: .2, part: { type: 'snow', u: u * 3 }, cap: '風：大きな扇風機' }, { dof: .7, fd: 5, tint: '225,225,230,.5', cap: '煙：奥が霞む' }][i])); } },
  // 吊った小さな模型が揺れながら飛ぶ→止めても糸のせいで振り子のように揺れ続ける
  '操演（そうえん）': { dur: 6, fn: t => { const h = X10.h(t), u = X10.u(t), w = Math.sin(u * Math.PI * 6); if (!h) return Cam({ z: -6, y: 1.2, f: 32, ax: lerp(-2.6, 2.6, u) + .05 * w, ay: 1.4 + .12 * w, sq: .45, sx: .45, cap: '吊った模型が飛ぶ' }); const p = .5 * Math.exp(-3 * u) * Math.sin(u * 20); return Cam({ z: -6, y: 1.2, f: 32, ax: p, ay: 1.4 + .25 * p * p, sq: .45, sx: .45, cap: '止めても糸で揺れる' }); } },
  'ストップモーション（Stop motion）': { ref: 'stopmotion' },
  // 1コマずつ形そのものを直す：太る・細るがカクカク変わりながら進む。表面に指のあと（粒）
  'クレイ（Claymation／粘土アニメ）': { dur: 5, fn: t => { const n = 24, i = Math.floor(t * n), p = i / n, m = Math.sin(p * Math.PI * 2); return Cam({ z: -5, f: 35, y: .8, ax: lerp(-1.8, 1.8, p) + (hsh(i) - .5) * .1, sx: 1 + .35 * m + (hsh(i + 3) - .5) * .1, sq: 1 - .3 * m + (hsh(i + 5) - .5) * .1, grain: .35, fps: 12, rate: 1, cap: '形を直しながら動く' }); } },
  // 同じコマ撮り：前半はぶれ無し（カクカク）／後半はシャッター中に機械が動かしてぶれる（なめらか）
  'ゴーモーション（Go motion）': { dur: 6, fn: t => { const h = X10.h(t), n = 10, i = Math.floor(X10.u(t) * n); return Cam({ z: -6, f: 35, ax: lerp(-2.2, 2.2, i / (n - 1)) + (hsh(i) - .5) * .1, ay: Math.abs(Math.sin(i * 1.3)) * .1, trail: h ? [[-.08, 0, .45], [-.16, 0, .25], [-.24, 0, .12]] : null, hstreak: h ? .15 : 0, fps: 12, rate: 1, cap: h ? 'ゴー：撮る間に動かす' : 'コマ撮り：ぶれ無し' }); } },
  // 機械で同じカメラの動きを3回：模型だけ／背景だけ／重ねるとぴったり（下の帯が回数）
  'モーションコントロール（Motion control）': { dur: 7, fn: t => { const i = cutOf(t, 3), u = ease((t * 3) % 1), tl = { v: [[0, 1 / 3, 0], [1 / 3, 2 / 3, 1], [2 / 3, 1, 2]], t }, cam = o => at(Cam(Object.assign({ x: lerp(-1.5, 1.5, u), z: -5, y: lerp(.6, 1.2, u), f: 32 }, o)), 0, .6, 0); return i === 0 ? cam({ plain: '#1d1f24', tl, cap: '1回目：模型だけ' }) : i === 1 ? cam({ noA: true, tl, cap: '2回目：背景だけ' }) : cam({ noA: true, over: cam({ plain: 'none' }), tl, cap: '同じ動きで重なる' }); } },
  // 小さな模型が落ちて火花：そのままだと軽く速い／4倍速で撮って普通に流すと重く大きい
  'ミニチュアの高速度撮影（Overcranking for scale）': { dur: 6, fn: t => { const h = X10.h(t), u = X10.u(t), k = h ? seg(u, .05, .95) : seg(u, .2, .425), f = clamp(k * 2); return at(Cam({ y: .3, z: -5, f: 24, ay: 2.2 * (1 - f * f), sq: .5, sx: .5, crowd: true, part: k > .5 ? { type: 'spark', u: (k - .5) * 2 } : null, shake: k > .5 ? 3 * Math.exp(-(k - .5) * 10) : 0, fps: h ? 96 : 24, rate: h ? .25 : 1, cap: h ? '4倍で撮ると重い' : 'そのまま：軽く速い' }), 0, .8, 0); } },
  // 座ったまま地面をすべる（8コマ/秒）→種あかし：立って1歩→座る→1枚撮る、のくり返し
  'ピクシレーション（Pixilation）': { dur: 6, fn: t => { const h = X10.h(t), u = X10.u(t); if (!h) { const n = 10, i = Math.floor(u * n); return TC({ ax: lerp(-2.4, 2.4, i / (n - 1)), sq: .7, sx: 1.1, still: true, fps: 8, rate: 1, cap: '座ったまま滑る' }); } const k = u * 3, j = Math.min(2, Math.floor(k)), f = k - j, sit = f >= .6; return TC({ ax: lerp(-2.4, 2.4, (j + (sit ? 1 : f / .6)) / 3), ay: sit ? 0 : X10.step(f), sq: sit ? .7 : 1, sx: sit ? 1.1 : 1, flash: sit ? .35 * clamp(1 - Math.abs(f - .8) * 12) : 0, cap: '動いて座って1枚' }); } },
});
