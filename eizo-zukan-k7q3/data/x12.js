// 分野12 の追加の図。書き方は ../../FIGURE_API.md
// X12.T(型, u, 文字, 大きさ, ほか)：TX に大きさ k を足したもの。X12.lin(v)：mask の見える幅を v（0〜1）に一定の速さで合わせる u
// X12.eo：終わりだけゆるく。X12.sp：0→110%→97%→100%（オーバーシュート）
const X12 = {
  T: (type, u, s, k, o) => TX(type, u, s, Object.assign({}, o, { text: { type, u, s, k } })),
  lin: v => v < .5 ? Math.sqrt(v / 2) : 1 - Math.sqrt(2 * (1 - v)) / 2,
  eo: u => 1 - Math.pow(1 - u, 3),
  sp: u => u < .5 ? 1.1 * X12.eo(u / .5) : u < .75 ? lerp(1.1, .97, ease(seg(u, .5, .75))) : lerp(.97, 1, ease(seg(u, .75, 1))),
  D: '#1c2430',
};
XF('12', {
  // 主題の形（横線）→題名→名前を、拍ごとに切りかえ。カメラはずっと奥へゆっくり進む
  'タイトルバック（Title sequence）': { dur: 7, fn: t => { const { i, u } = seq(t, [1, 1, 1]); return X12.T(['mask', 'track', 'fade'][i], [X12.lin(seg(u, .05, .5)), seg(u, 0, .9), seg(u, .1, .35)][i], ['━━━━━━━━', 'ねこの道', '監督　オレンジ'][i], [1, 1.1, .6][i], { z: lerp(-14, -8, t), y: .6, f: 28, tint: '10,12,18,.6', cap: ['主題の形', '題名', '名前は2〜4秒'][i], snd: { rows: [{ label: '拍', amp: x => (x * 3) % 1 < .05 ? 1 : .12 }], t } }); } },
  // 一語ずつ別の動き：すべって出る→とぶのと一緒にはねる→着地でドン（文字も画面もゆれる）
  'キネティック・タイポグラフィ': { dur: 4, fn: t => { const i = cutOf(t, 3), u = (t * 3) % 1; return X12.T(['slide', 'pop', 'fade'][i], [seg(u, 0, .4), seg(u, 0, .5), 1][i], ['ねこが', 'とぶ！', 'ドン！'][i], [1.3, 1.6, lerp(2.4, 1.7, X12.eo(seg(u, 0, .3)))][i], { ay: i === 1 ? jump(seg(u, .1, 1)) : 0, shake: i === 2 ? 7 * Math.exp(-u * 10) : 0, sq: i === 2 ? 1 - .25 * Math.exp(-u * 10) : 1, cap: '言葉が動きに乗る' }); } },
  // 飾りなしの小さな文字（場所と時刻）を、7文字＝約2秒だけ。絵のじゃまをしない
  'テロップ': { dur: 4.5, fn: t => X12.T('fade', Math.min(seg(t, .1, .16), 1 - seg(t, .82, .88)), '駅前　午後3時', .55, { tint: null, ax: lerp(-1.6, -.9, t), ay: Math.abs(Math.sin(t * Math.PI * 6)) * .05, cap: '1秒4文字まで' }) },
  'ローワーサード（Lower third）': { ref: 't-lower' },
  // ねこの頭に点（4コマ）→線が伸びる（12コマ）→名前、の順に左から現れる
  '吹き出し・指し線（Callout）': { dur: 3, fn: t => { const v = t < .16 ? .11 * seg(t, .1, .16) : t < .33 ? lerp(.11, .45, seg(t, .16, .33)) : lerp(.45, 1, seg(t, .33, .45)); return X12.T('mask', X12.lin(v), '●━━━オレンジ', .6, { tint: null, ax: -1.25, cap: '点→線→文字' }); } },
  // 手持ちでカメラが動いても、ねこの頭に貼った印はずれずについてくる。歩数を数える
  '場面に張りつく文字（トラッキング文字・Tracked text）': { dur: 5, fn: t => { const ax = lerp(-1.5, 1.5, t); return at(Cam({ x: lerp(-.8, .8, t), z: -6, y: .9, f: 32, ax, ay: Math.abs(Math.sin(t * Math.PI * 8)) * .05, track: 1, shake: 1, cap: '歩数 ' + Math.floor(t * 8) + '歩' }), ax * .6, .7, 0); } },
  // 重ねる順の図解：①背景 ②大きな文字 ③ねこを上へ（ねこの所の字が隠れる）
  '人の後ろに入る文字（Text behind subject）': { dur: 5, fn: t => { const i = cutOf(t, 3); return X12.T('fade', i ? 1 : 0, i === 2 ? 'ね　道' : 'ねこ道', 2.4, { z: -2.8, tint: null, noA: i < 2, roto: i === 2 ? 1 : 0, cap: ['①背景だけ', '②文字を置く', '③ねこを上に重ねる'][i] }); } },
  // 紙の上に、1字0.3秒のペンの速さで、字ごとに書いては止まる
  '手書き風の書き出し（Write-on）': { dur: 4, fn: t => { const p = seg(t, .15, .6) * 5, i = Math.min(4, Math.floor(p)), v = (i + ease(seg(p - i, 0, .8))) / 5; return X12.T('mask', X12.lin(v), 'ありがとう', .9, { plain: '#efe8d8', noA: true, tint: null, cap: '書き順に1字0.3秒' }); } },
  // 黒地に名前が下から上へ、同じ間隔で次々に。横では小さくNG（ねこがころぶ）
  'エンドロール（End credits / crawl）': { dur: 6, fn: t => { const i = Math.min(4, Math.floor(t * 5)), u = t * 5 - i; return X12.T('slide', seg(u, 0, .5), ['撮影　みけ', '照明　くろ', '音楽　しろ', '編集　とら', '監督　オレンジ'][i], .6, { plain: '#000', tint: null, ax: -2.2, ay: jump((t * 2.5) % 1) * .5, sq: 1 - .2 * bump((t * 2.5) % 1, .98, .05), cap: '一定の速さで上へ' }); } },
  // 古いフィルムの場面→黒地・白文字・枠のカードをはさむ→場面にもどる
  '字幕カード（無声映画）（Intertitle）': { dur: 5, fn: t => { const c = t > .35 && t < .75; return X12.T('fade', c ? seg(t, .37, .42) : 0, '「おなかすいた」', .7, { plain: c ? '#0b0b0b' : '', noA: c, frame: c ? 1 : 0, tint: null, sepia: .3, scratch: .5, grain: .4, shake: .5, ay: c ? 0 : Math.abs(Math.sin(t * 24)) * .06 }); } },
  // ねこの横に、打っては消す入力中の文字→受信の文が0.2秒でぽんと出る
  '画面上のメッセージ表示（On-screen text message）': { dur: 5, fn: t => { const r = t >= .6, u = r ? seg(t, .6, .64) : t < .4 ? seg(t, .05, .35) : 1 - .4 * seg(t, .4, .5); return X12.T(r ? 'slide' : 'type', u, r ? 'ついたよ！' : 'いまどこ？', .6, { tint: null, ax: -1.4 + .1 * Math.sin(t * 6), cap: r ? 'ピコン♪ 受信' : '入力中…' }); } },
  '＋タイプライター表示（Typewriter / type-on）': { ref: 't-type' },
  '＋マスクで現れる文字（Mask reveal）': { ref: 't-mask' },
  // 丸・四角・三角だけ：少しずつずれて上がる→大きなひし形がはねて出る
  '図形のアニメ（Shape animation）': { dur: 4, fn: t => t < .5 ? X12.T('stagger', seg(t, .05, .4), '●■▲', 1.6, { plain: X12.D, noA: true, tint: null, cap: '形は単純に' }) : X12.T('pop', seg(t, .55, .75), '◆', 2.2, { plain: X12.D, noA: true, tint: null, cap: '大きさ0→100%' }) },
  // 棒が終わりをゆるく伸び、数字も同時に数える。Aを出してから、少しあとにB
  'インフォグラフィック（Infographic animation）': { dur: 5, fn: t => { const b = t >= .5, v = X12.eo(seg(t, b ? .52 : .05, b ? .77 : .3)), m = Math.round(v * (b ? 9 : 4)); return X12.T('fade', 1, (b ? 'B ' : 'A ') + '■'.repeat(m) + '　'.repeat(10 - m) + Math.round(v * (b ? 90 : 40)), .55, { plain: X12.D, noA: true, tint: null, cap: b ? 'A 40 → B 90' : '1画面に1つ' }); } },
  // 上から見た道を地図にして、線の先に合わせてゆっくり進む
  '地図の移動線（Map route line）': { dur: 4, fn: t => { const zc = lerp(-6, 4, ease(t)); return X12.T('mask', X12.lin(seg(t, .1, .85)), '●━━━━━━▶', .7, Object.assign(at(Cam({ y: 14, z: zc - 3.5, f: 28 }), 0, 0, zc), { text: null, tint: '40,60,40,.25', cap: '出発 → 到着' })); } },
  // 爆弾の残り時間：1秒ごとに減る。0で赤くゆれる
  '数字のカウント': { dur: 5, fn: t => { const p = 10 * (1 - seg(t, .05, .85)), n = Math.ceil(p); return X12.T('fade', 1, '00:' + String(n).padStart(2, '0'), 1.6 * (1 + .06 * (p - Math.floor(p))), { plain: X12.D, noA: true, tint: n ? null : '200,30,30,.35', shake: n ? 0 : 2, cap: '桁の幅を変えない' }); } },
  // 動画（3章）の進みに合わせ、棒が一定の速さで伸びる。章の切れ目つき
  '進み具合の棒（Progress bar）': { dur: 6, fn: t => { const q = seq(t, [3, 4, 3]); return X12.T('mask', X12.lin(t), '━━━━━━━━━━', .5, { y: 1.4, tint: null, ax: [-1.5, 0, 1.5][q.i], f: [30, 45, 30][q.i], tl: q.tl, cap: Math.round(t * 100) + '%' }); } },
  // 水色の照準と十字、流れる数字。ねこを0.1秒おくれて追い、ときどきちらつく
  'HUD（機械の画面）（Heads-up display）': { dur: 4, fn: t => { const ax = 1.2 * Math.sin(t * 6.283), lag = 1.2 * Math.sin((t - .025) * 6.283); return X12.T('fade', hsh(Math.floor(t * 40)) < .08 ? .3 : .9, '［　◎　］', 1.6, Object.assign(at(Cam({ z: -5, y: .9, f: 45, ax }), lag, .85, 0), { text: null, tint: '0,90,110,.35', glow: .25, grid: 'center', cap: 'X ' + lag.toFixed(2) + ' 距離5.0m' })); } },
  // 部品が集まる→少し大きく行きすぎて戻る→光が1回→止まる。決まる所に低い一打
  'ロゴの決め（Logo sting / reveal）': { dur: 4, fn: t => { const g = t < .4, u = seg(t, .4, .6); return X12.T(g ? 'stagger' : 'fade', g ? seg(t, .05, .4) : 1, 'ねこ屋', 1.5 * (u < .5 ? lerp(1, 1.12, ease(u * 2)) : lerp(1.12, 1, ease(u * 2 - 1))), { plain: X12.D, noA: true, tint: null, flash: .35 * bump(t, .68, .03), glow: .3 * seg(t, .62, .7) * (1 - seg(t, .75, .9)), cap: g ? '部品が集まる' : t < .62 ? '行きすぎて戻る' : t < .8 ? '光が横切る' : '決まり', snd: { rows: [{ label: '音', amp: x => x < .4 ? .03 : bump(x, .42, .02) + .6 * bump(x, .68, .015) }], t } }); } },
  // 白い板：線がねこの形をなぞる→ねこが描き上がる→横に言葉を書き出す（早回し）
  'ホワイトボード風（Whiteboard animation）': { dur: 5, fn: t => X12.T('mask', X12.lin(seg(t, .58, .88)), 'ねこは歩く', .6, { plain: '#f2f2ec', tint: null, ax: -1.4, roto: seg(t, .05, .42), sq: lerp(.05, 1, ease(seg(t, .4, .55))), cap: '×6 早回し' }) },
  // 線の終わりが伸びて矢印になる→少しおくれて始まりも追いかけ、通りすぎて消える
  '＋線が伸びる（トリムパス）（Trim path）': { dur: 3, fn: t => { const e = seg(t, .15, .33), a = Math.floor(seg(t, .45, .62) * 10); return X12.T('mask', X12.lin(e), '　'.repeat(a) + '━'.repeat(Math.max(0, 9 - a)) + (a < 10 ? '▶' : ''), .7, { plain: X12.D, noA: true, tint: null, cap: a ? '始まりも追う' : '終わりが伸びる' }); } },
  // 同じ移動を、一定の速さ→ゆるく始めてゆるく止める。残像の間かくで速さが見える
  'イージング': { dur: 5, fn: t => { const i = cutOf(t, 2), u = seg((t * 2) % 1, .1, .8), P = v => lerp(-2, 2, i ? ease(v) : v), ax = P(u); return Cam({ z: -7, f: 32, ax, trail: [1, 2, 3, 4].map(j => [P(Math.max(0, u - .07 * j)) - ax, 0, .45 - .09 * j]), cap: i ? 'ゆるく始めて止める' : '一定の速さ' }); } },
  // 同じとび移り：原則なし（まっすぐ・かたい）→ため・伸び縮み・弧
  'アニメの12原則の応用（12 principles of animation）': { dur: 5, fn: t => { const i = cutOf(t, 2), u = (t * 2) % 1, a = seg(u, .1, .25), j = seg(u, i ? .25 : .1, .7), l = seg(u, .7, .9), sq = i ? (u < .25 ? 1 - .25 * a : u < .7 ? 1 + .2 * Math.sin(j * Math.PI) : 1 - .25 * Math.sin(l * Math.PI)) : 1; return Cam({ z: -7, f: 32, ax: lerp(-1.8, 1.8, j), ay: i ? jump(j) : (1 - Math.abs(2 * j - 1)) * 1.3, sq, sx: 1 / sq, cap: i ? 'ため・伸び縮み・弧' : '原則なし（かたい）' }); } },
  // 文字の大きさも、ねこの止まる場所も 0→110%→97%→100%（12コマ）
  'オーバーシュート（Overshoot）': { dur: 3, fn: t => { const u = seg(t, .15, .32), s = X12.sp(u); return X12.T('fade', u > 0 ? 1 : 0, '決まり！', Math.max(.01, 1.4 * s), { tint: null, ax: -2.5 * (1 - s), cap: '110%→97%→100%' }); } },
  // ねこが水あめのように前へ伸び→ちぎれて（後ろにしずくが残って消える）→ぷるんとゆれる
  '液体のような動き（Liquid motion）': { dur: 4, fn: t => { const u = ease(seg(t, .1, .5)), s = seg(t, .5, .58), w = t > .58 ? .18 * Math.sin((t - .58) * 40) * Math.exp(-(t - .58) * 7) : 0, sx = t < .5 ? 1 + .7 * u : lerp(1.7, 1, s), ax = t < .5 ? -1.2 + .5 * u : lerp(-.7, .8, ease(s)); return Cam({ z: -6, f: 32, ax, sx: sx / (1 + w), sq: (t < .5 ? 1 - .2 * u : lerp(.8, 1, s)) * (1 + w), trail: t > .5 && t < .85 ? [[-1.2 - ax, 0, .5 * (1 - seg(t, .5, .85))]] : null, glow: .2, cap: '伸びて、ちぎれて、ぷるん' }); } },
  // 三角→（一度小さな丸を通って）→四角へ。切れ目で小さくしぼむ
  '形のモーフ（Shape morph）': { dur: 4, fn: t => { const i = cutOf(t, 3), d = bump(t, 1 / 3, .07) + bump(t, 2 / 3, .07); return X12.T('fade', 1, ['▲', '●', '■'][i], 2.4 * (1 - .7 * d), { plain: X12.D, noA: true, tint: null, cap: ['三角', '丸を通る', '四角になる'][i] }); } },
  // 止めた写真：1枚のままずらす（どこも同じ速さ）→層に分けて動かす（手前が速い）
  '視差スライド（Parallax slide）': { dur: 6, fn: t => { const i = cutOf(t, 2), u = ease((t * 2) % 1); return Cam({ z: -7, f: 32, still: true, cats: [[.8, -4.5]], x: i ? lerp(-1, 1, u) : 0, dz: i ? 1 : 1.15, ox: i ? 0 : lerp(-.05, .05, u), cap: i ? '層ごとに速さが違う' : '1枚の絵をずらす' }); } },
  '＋ずらし出し（スタッガー）（Stagger）': { ref: 't-stagger' },
  // 同じ速い往復：ぶれ無し（くっきり飛ぶ）→動く向きに流れる（速い時だけ長く）
  '＋動きぶれ（モーションブラー）（Motion blur）': { dur: 4, fn: t => { const i = cutOf(t, 2), u = (t * 2) % 1, P = v => v < .5 ? lerp(-2.2, 2.2, ease(seg(v, .15, .35))) : lerp(2.2, -2.2, ease(seg(v, .6, .8))), ax = P(u); return Cam({ z: -7, f: 32, ax, trail: i ? [1, 2, 3, 4, 5].map(j => [P(Math.max(0, u - .008 * j)) - ax, 0, .4 - .07 * j]) : null, cap: i ? 'ぶれ あり' : 'ぶれ なし' }); } },
});
