// 分野06 の追加の図。書き方は ../../FIGURE_API.md
// 光の図は LC（暗いスタジオ）と KEY（主役の光）を使う。L の col は [r,g,b]（0〜255）
// 注意：mode:'light' では tint・flash・shake・streak が効かない。色は col / bgc / grade、明滅は p と bgl で出す
const X06 = {
  // 不規則な明るさ（0〜1）。n=1秒あたりの変わる回数のつもり（t基準）
  nz: (t, n, s) => hsh(Math.floor(t * n) + (s || 0)),
  // 通りすぎる光：u=0〜1 で前から後ろへ回りこむ
  pass: (u, col) => ({ az: lerp(-15, -150, u), el: 20, p: 1.1 * Math.sin(Math.PI * u), soft: .3, col }),
};
XF('06', {
  '三点照明（Three-point lighting）': { ref: 'three-point' },
  // ふつう→ハイキー：影の中も背景も明るくなり、光は大きく正面寄りに
  'ハイキー（High-key）': { dur: 4, fn: t => { const u = ease(seg(t, .15, .75)); return LC({ amb: lerp(.05, .6, u), bgl: lerp(.16, .95, u), L: [KEY({ az: lerp(-45, -15, u), soft: lerp(.5, 1, u), p: lerp(1, .6, u) }), { az: 40, el: 15, p: .45 * u, soft: 1 }], cap: u < .5 ? 'ふつう' : 'ハイキー 影うすい' }); } },
  // ふつう→ローキー：フィルが消え、光は横へ、背景は闇に
  'ローキー（Low-key）': { dur: 4, fn: t => { const u = ease(seg(t, .15, .75)); return LC({ amb: lerp(.05, 0, u), bgl: lerp(.16, .02, u), L: [KEY({ az: lerp(-45, -85, u), soft: lerp(.5, .3, u) }), { az: 45, el: 10, p: .3 * (1 - u), soft: 1 }], cap: u < .5 ? 'ふつう' : 'ローキー 8:1' }); } },
  'ハードライトとソフトライト（Hard / Soft light）': { ref: 'hardsoft' },
  // じかに当てる（くっきり）→白い板で返す（ふんわり上から）→木の床で返す（暖かい色、下から）
  'バウンス（Bounce）': { dur: 5.4, fn: t => { const i = cutOf(t, 3); return LC({ amb: [.03, .14, .14][i], L: [[KEY({ az: -50, el: 30, soft: 0, p: 1.1 }), KEY({ az: -60, el: 55, soft: 1, p: .75 }), KEY({ az: -30, el: -35, soft: 1, p: .75, col: [255, 190, 120] })][i]], cap: ['じかに当てる', '白い板で返す', '木の床で返す'][i] }); } },
  // 白い部屋（影の側も明るく平ら）→黒い板で光を吸う（影の側が黒く深い）。背景の明るさは同じまま
  'ネガティブフィル（Negative fill）': { dur: 4, fn: t => { const i = cutOf(t, 2); return LC({ amb: i ? .02 : .3, bgl: .6, bgc: [235, 235, 230], L: [KEY({ az: -50 }), { az: 50, el: 10, p: i ? 0 : .25, soft: 1 }], cap: i ? '黒い板で吸う' : '白い部屋 平ら' }); } },
  // 配置は同じで、フィルの強さだけ半分ずつ
  '光の比（Lighting ratio）※追加': { dur: 5.4, fn: t => { const i = cutOf(t, 3); return LC({ L: [KEY({ az: -50, soft: .6 }), { az: 50, el: 10, p: [.5, .25, .12][i], soft: 1 }], cap: ['2:1 やさしい', '4:1', '8:1 劇的'][i] }); } },
  'レンブラント（Rembrandt lighting）': { ref: 'rembrandt' },
  // カメラの真上・正面から当て、あとからあごの下に白い板（下から弱い返し）
  'バタフライ（Butterfly / Paramount lighting）': { dur: 4.4, fn: t => { const u = ease(seg(t, .1, .5)), v = seg(t, .6, .75); return LC({ amb: .06, L: [KEY({ az: 0, el: lerp(0, 40, u), soft: .45 }), { az: 0, el: -40, p: .22 * v, soft: 1 }], cap: t < .6 ? 'カメラの真上から' : '＋あごの下に白板' }); } },
  // 正面上（バタフライ）→横30度・少し上（ループ）→45度・45度（レンブラント）。真ん中を長く
  'ループ（Loop lighting）': { dur: 5, fn: t => { const { i } = seq(t, [1, 2, 1]); return LC({ L: [KEY([{ az: 0, el: 40 }, { az: -35, el: 22 }, { az: -48, el: 42 }][i])], cap: ['バタフライ', 'ループ（中間）', 'レンブラント'][i] }); } },
  'スプリット（Split lighting）': { ref: 'split' },
  // ブロード＝広い面が明るい（手前側から）、ショート＝細い面だけ明るい（奥側から）
  'ブロードとショート（Broad / Short lighting）': { dur: 4.4, fn: t => { const i = cutOf(t, 2); return LC({ amb: .04, L: [i ? KEY({ az: -75, el: 30, soft: .2 }) : KEY({ az: -20, el: 25, soft: .7, p: .9 })], cap: i ? 'ショート 奥が明るい' : 'ブロード 手前が明るい' }); } },
  // カメラのすぐ横に小さく弱い光を足す。目に光が入って生きた感じ（にじみで光の点を強める）
  'アイライト（Eye light / Catchlight）': { dur: 4, fn: t => { const i = cutOf(t, 2); return LC({ amb: i ? .06 : .03, L: [KEY({ az: -50, soft: .4 }), { az: 0, el: 3, p: i ? .3 : 0, soft: 0 }], hl: i ? 1 : 0, eye: 1.15, glow: i ? .12 : 0, cap: i ? 'アイライトあり' : 'なし 冷たい目' }); } },
  // 少し前の上→真上の硬い光へ。背景も暗く、目のくぼみが黒く落ちる
  'トップライト（Top light）': { dur: 4, fn: t => { const u = ease(seg(t, .15, .7)); return LC({ amb: .02, bgl: .06, L: [KEY({ az: 0, el: lerp(40, 88, u), soft: .1, p: 1.1 })], cap: u < .5 ? '少し前の上から' : '真上 目が影に' }); } },
  '下からの光（Underlighting）': { ref: 'under' },
  'リムライト（ふちどり）（Rim light）': { ref: 'rim' },
  'シルエット（Silhouette）': { ref: 'silhouette' },
  // 闇の中に、真横の硬い光が強まって明暗の形が浮かぶ。周りは黒、絵画のような色
  'キアロスクーロ（明暗）（Chiaroscuro）': { dur: 4, fn: t => { const u = ease(seg(t, .1, .6)); return LC({ amb: 0, bgl: .02, L: [KEY({ az: -88, el: 15, soft: 0, p: lerp(.2, 1.2, u), col: [255, 225, 180] })], vig: lerp(.2, .8, u), grade: { f: 'contrast(1.35) sepia(.25)' }, wipe: 1, cap: '強い明と深い闇' }); } },
  // 理由のない向きの光→窓（青白く明るい背景）の向きと色に合わせた光
  '動機のある光（Motivated lighting）': { dur: 4.4, fn: t => { const i = cutOf(t, 2); return LC(i ? { amb: .05, bgl: .55, bgc: [150, 190, 255], L: [KEY({ az: -70, el: 30, soft: .6, col: [190, 215, 255] })], cap: '窓の向きに合わせる' } : { amb: .04, bgl: .1, L: [KEY({ az: 60, el: 10, soft: .3 })], cap: '理由のない光' }); } },
  // 夜の暗い所。画面に写るスタンド（柱＋かさ）を点けると、その電球の場所から暖かい光の輪がねこにかかる
  'プラクティカル（画面内の照明）（Practical light）': { dur: 4, fn: t => { const on = t > .35, V = { z: -4.5, y: .8, f: 35 }; return Cam(Object.assign({ still: true, sky: ['#05070f', '#141a30', '#0b0e1a'], tint: '12,15,35,.62', props: [{ t: 'box', x: 1.05, z: .3, w: .07, h: 1.05, col: '#2c2a2e' }, { t: 'box', x: 1.05, y: 1.02, z: .3, w: .42, h: .26, col: on ? '#f3c98a' : '#6b5a48' }], over: on ? Cam(Object.assign({ plain: 'none', noA: true, props: [{ t: 'glow', x: .7, y: .8, z: -.2, s: 2.4, a: .55, col: '255,165,80' }, { t: 'glow', x: 1.05, y: 1.08, z: .3, s: .45, col: '255,230,170' }] }, V)) : null, cap: on ? '写る電球が光源' : 'スタンドを点ける' }, V)); } },
  // 昼の町。太陽と空だけ。雲が太陽にかかると全体が少し暗くなり、過ぎるともどる（天気まかせ）
  '自然光だけ（Natural light only）': { dur: 5, fn: t => { const d = clamp(1 - Math.abs(t - .5) / .2); return Cam({ z: -6, f: 30, y: .8, sun: [lerp(55, 35, t), lerp(58, 42, t)], props: [{ t: 'cloud', x: lerp(-8, 22, t), y: 8.8, z: 30, s: 5, a: .95 }, { t: 'cloud', x: lerp(-20, 0, t), y: 10.5, z: 40, s: 5, a: .8 }], grade: { f: `brightness(${(1 - .3 * d).toFixed(2)}) saturate(${(1 - .25 * d).toFixed(2)})` }, wipe: 1, grain: .12, cap: d > .3 ? '雲で暗くなる' : '太陽と空だけ' }); } },
  'マジックアワー（Magic hour / Golden hour）': { ref: 'magic' },
  // 日がしずんだ後の町：太陽なし、空も地面も深い青。そこへ橙の街灯が順にともって映える
  'ブルーアワー（Blue hour）': { dur: 4.4, fn: t => { const V = { z: -6, y: .8, f: 32 }, L = [[-2.3, 2], [2.3, 2], [-2.3, 8], [2.3, 8]]; return Cam(Object.assign({ still: true, sun: [0, -30], sky: ['#14205a', '#5a78c8', '#263266'], tint: '40,70,170,.35', props: L.map(([x, z]) => ({ t: 'line', x, y: 0, z, x2: x, y2: 2.6, z2: z, w: .06, col: '#232838' })), over: Cam(Object.assign({ plain: 'none', noA: true, props: L.map(([x, z], i) => ({ t: 'glow', x, y: 2.6, z, s: .7, a: clamp((t - .3 - .08 * i) * 8), col: '255,160,70' })) }, V)), cap: t < .3 ? '影の無い青' : '＋橙の街灯' }, V)); } },
  // 高い所から青白く硬い光1つ、影は真っ黒、色うすめ。途中で雲がかかって暗くなる
  '月明かり（Moonlight）': { dur: 4.4, fn: t => LC({ amb: 0, bgl: .06, bgc: [60, 80, 140], L: [KEY({ az: -60, el: 60, soft: .05, col: [150, 185, 255], p: .95 - .6 * clamp(1 - Math.abs(t - .6) / .12) })], grade: { f: 'saturate(.6)' }, wipe: 1, cap: '青白く硬い月の光' }) },
  // 橙の光が下の方から不規則に明るさと向きを変える（規則正しい波にしない）＋火の粉
  '火のゆらぎ（Firelight flicker）': { dur: 4, fn: t => { const a = X06.nz(t, 40), b = X06.nz(t, 23, 99); return LC({ amb: .02, bgl: .05 + .03 * a, bgc: [255, 140, 60], L: [{ az: -40 + 8 * b, el: -15, p: .7 + .4 * a, soft: .4, col: [255, 140, 50] }], part: { type: 'spark', u: (t * 2) % 1 }, cap: '不規則にゆらぐ' }); } },
  // 暗い嵐の部屋に、青白い光が不規則に3回（2コマ・1コマ・3コマ）
  '雷（Lightning）': { dur: 4, fn: t => { const on = [[.2, .225], [.27, .282], [.7, .735]].some(([a, b]) => t >= a && t < b); return LC({ amb: on ? .25 : .02, bgl: on ? .75 : .04, bgc: [200, 215, 255], L: [{ az: -70, el: 35, p: on ? 1.3 : 0, soft: 0, col: [210, 225, 255] }], cap: on ? 'ピカッ' : '暗い嵐の夜' }); } },
  // 桃と水色の看板の光が左右から。にじみ＋雨。桃の管がときどきジジッとゆらぐ
  'ネオン（Neon）': { dur: 4, fn: t => { const buzz = X06.nz(t, 30, 7) < .1 ? .3 : 1; return LC({ amb: .03, bgl: .12, bgc: [120, 40, 160], L: [{ az: -75, el: 10, p: .95 * buzz, soft: .5, col: [255, 60, 190] }, { az: 75, el: 10, p: .9, soft: .5, col: [60, 220, 255] }], glow: .45, part: { type: 'rain', u: t }, cap: '桃と水色の看板' }); } },
  // ふつうの白い光→赤と青のジェル。壁まで赤く染まる（にじみ・雨は無し）
  '色つきの光（ジェル）（Colored gels）': { dur: 4.4, fn: t => { const i = cutOf(t, 2); return i ? LC({ amb: .02, bgl: .35, bgc: [200, 40, 60], L: [{ az: -80, el: 15, p: 1, soft: .3, col: [255, 30, 30] }, { az: 80, el: 15, p: .9, soft: .3, col: [40, 60, 255] }], cap: '赤と青のジェル' }) : LC({ L: [KEY(), { az: 45, el: 10, p: .3, soft: 1 }], cap: 'ふつうの白い光' }); } },
  // 少し暗い空、太陽をねこの後ろに。けむり無し→けむり有り（ただよう煙・にじみ・光の線・白っぽい空気）
  '光の筋（ヘイズ・ボリューム）（Haze / Volumetric light）': { dur: 4.4, fn: t => { const i = cutOf(t, 2); return Cam({ z: -7, f: 32, y: .6, pitch: .06, sun: [4, 14], sky: ['#3a3f55', '#c9b48e', '#5a5a66'], props: i ? [[-2, .3, 2], [1.6, .6, 3], [-.6, 1.2, 5], [2.4, .2, 6]].map(([x, y, z], j) => ({ t: 'smoke', x, y, z, s: 1.6, col: '255,235,200', a: .35, n: 6, u: (t * .6 + j * .25) % 1 })) : null, flare: i ? .22 : .1, glow: i ? .22 : 0, streak: i ? .45 : 0, tint: i ? '255,225,180,.1' : null, cap: i ? 'けむり有り 筋が出る' : 'けむり無し' }); } },
  // 硬い小さな光の斑点がいくつも重なり、葉がゆれるように少しずつ動く
  '影絵（ゴボ・クッキー）（Gobo / Cookie）': { dur: 5, fn: t => LC({ amb: .03, bgl: .1, L: [0, 1, 2, 3].map(j => ({ az: -60 + j * 25 + 6 * Math.sin(t * 6 + j), el: 40 - j * 12 + 5 * Math.cos(t * 5 + j * 2), p: .45, soft: 0, col: [255, 240, 200] })), cap: '木の葉のまだら' }) },
  // 窓の方向から硬い光を高さ違いで4本＝横の段。羽根の角度が変わると段が上下する
  'ブラインドの影（Venetian blind shadows）': { dur: 4.4, fn: t => { const d = lerp(-6, 6, ease(t)); return LC({ amb: .02, bgl: .08, L: [-10, 8, 26, 44].map(e => ({ az: -55, el: e + d, p: .4, soft: 0, col: [255, 235, 200] })), cap: 'ブラインドの縞' }); } },
  // ひと色→人には橙の光、後ろと背景は青い光
  '色温度の混ぜ（暖かい光と冷たい光）（Mixed color temperature）※追加': { dur: 4.4, fn: t => { const i = cutOf(t, 2); return i ? LC({ amb: .03, bgl: .35, bgc: [90, 130, 220], L: [KEY({ col: [255, 160, 80] }), { az: 130, el: 30, p: 1, soft: 0, col: [110, 170, 255] }], cap: '橙の人・青い外' }) : LC({ L: [KEY(), { az: 130, el: 30, p: 1, soft: 0 }], cap: 'ひと色' }); } },
  // 前半：懐中電灯の細い光が左右に探す。後半：赤と青が0.5秒ごとに入れかわる回転灯
  '動く光（懐中電灯・ヘッドライト・回転灯）（Moving light sources）※追加': { dur: 5, fn: t => { if (t < .5) return LC({ amb: .01, bgl: .03, L: [{ az: 80 * Math.sin(seg(t, 0, .5) * Math.PI * 2), el: 10, p: 1.1, soft: 0 }], cap: '懐中電灯' }); const r = Math.floor(t * 10) % 2; return LC({ amb: .01, bgl: .05, bgc: r ? [255, 60, 60] : [60, 90, 255], L: [{ az: r ? -70 : 70, el: 20, p: 1, soft: .4, col: r ? [255, 40, 40] : [50, 80, 255] }], cap: '回転灯' }); } },
  // 真っ暗な部屋で、顔の前・少し下から青白い光。明るさと色が0.5〜1秒ごとに不規則に変わる。見開いた目に画面が写りこむ
  '画面の光（テレビ・スマホ・パソコン）（Screen glow）※追加': { dur: 5, fn: t => { const a = X06.nz(t, 6, 3), b = X06.nz(t, 6, 11); return LC({ amb: 0, bgl: .02, L: [{ az: 0, el: -20, p: .55 + .4 * a, soft: .7, col: [150 + 50 * b, 190, 255] }], eye: 1.3, hl: .45 + .55 * a, cap: 'テレビの青い光' }); } },
  // 太陽を横後ろにした昼の町に、左から「暗く・青く・色うすく」をかけていく
  'デイ・フォー・ナイト（昼に夜を撮る）（Day for night）': { dur: 5, fn: t => Cam({ z: -6, f: 30, y: .8, pitch: -.03, sun: [-40, 30], grade: { f: 'brightness(.45) saturate(.55)', ov: [['rgba(50,90,200,.55)', 'multiply']] }, wipe: ease(seg(t, .15, .85)), cap: '昼の絵を夜に見せる' }) },
  // 止まったまま、暗い中を街灯の光が前から後ろへ不規則な間で通りすぎる
  'プアマンズ・プロセス（止まった車）（Poor man\'s process）': { dur: 5, fn: t => LC({ amb: .13, bgl: .1, bgc: [40, 50, 80], L: [.02, .36, .68].map(s => X06.pass(seg(t, s, s + .28), [255, 200, 130])), cap: '止まった車＋動く光' }) },
});
