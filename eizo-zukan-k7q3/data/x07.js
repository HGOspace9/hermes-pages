// 分野07 の追加の図。書き方は ../../FIGURE_API.md
// X07.v: color.js の GR と同じ見方（正面4.6m・32mm）。
// X07.fix: 右から「元のずれた絵」を重ね、白い線が左→右へ進むと左が直った絵になる（tr の wipe を逆向きに使う）。
// X07.keep: 世界にだけ色を重ね、主役（と cats）は上から元の色で描き直す（肌を守る・1色だけ残す・補色など）。
const X07 = {
  v: o => Cam(Object.assign({ z: -4.6, f: 32, y: .85 }, o)),
  fix: (t, bad, o) => X07.v(Object.assign({ tr: { B: X07.v(bad), clip: 'wipe', u: 1 - ease(seg(t, .12, .6)) } }, o)),
  keep: (tint, o, top) => { const k = {}; for (const n of ['x', 'y', 'z', 'f', 'ax', 'ay']) if (n in o) k[n] = o[n]; return X07.v(Object.assign({ tint, over: X07.v(Object.assign({ plain: 'none' }, k, top || {})) }, o)); },
};
XF('07', {
  // 右＝青くかぶって暗い撮ったまま。線が進むと左は白が白・肌が自然にもどる
  '色補正（Color correction）': { dur: 4.5, fn: t => X07.fix(t, { tint: '30,70,200,.32' }, { cap: t < .12 ? '青かぶり・暗い' : '補正：白を白に' }) },
  // 補正の後 → 一次（全体を暖かく）→ 二次（影だけ青く）と、順に1枚ずつ足す
  'グレーディング（Color grading）': { dur: 6, fn: t => { const i = cutOf(t, 3), u = (t * 3) % 1, warm = ['rgba(255,140,50,.4)', 'soft-light'], blue = ['rgb(20,45,90)', 'lighten']; return X07.v({ grade: i ? { f: 'contrast(1.1)', ov: i === 1 ? [warm] : [warm, blue] } : null, wipe: i === 1 ? ease(seg(u, .1, .7)) : 1, cap: ['①補正の後', '②全体を暖かく', '③影だけ青く'][i] }); } },
  // 同じ1枚のファイルを当てる：100%（強すぎ）→ 60%に弱める
  'LUT（ラット。色の変換表）（Look-up table）': { dur: 6, fn: t => { const i = cutOf(t, 2), u = (t * 2) % 1, k = i ? .6 : 1; return GR(u, { f: `contrast(${1 + .3 * k}) saturate(${1 + .4 * k}) sepia(${.25 * k})`, ov: [[`rgba(0,120,140,${(.35 * k).toFixed(2)})`, 'soft-light']] }, { sat: 1 + .4 * k, con: 1 + .3 * k, temp: -.3 * k }, i ? 'look.cube 60%' : 'look.cube 100%'); } },
  // 緑の型を全体に→ねこ（肌）も緑に転ぶ。次は肌だけ守って橙のまま
  '肌色を守る（Protecting skin tones）': { dur: 5, fn: t => { const i = cutOf(t, 2), a = (.42 * ease(seg((t * 2) % 1, .05, .45))).toFixed(2); return i ? X07.keep('0,150,130,.42', { cap: '肌だけ守る' }) : X07.v({ tint: `0,150,130,${a}`, cap: '守らない：肌も緑' }); } },
  // 右＝Log（灰色で眠い）。線が進むと、変換で普通の明暗と色にもどる
  'Log・RAW（ログ・ロウ）': { dur: 4.5, fn: t => GR(t, { f: 'contrast(2)' }, { sat: 1, con: 2, temp: 0 }, t < .12 ? 'Log：灰色で眠い' : '変換して普通に', { tint: '128,128,128,.5' }) },
  '色温度をずらす（暖かい・冷たい）（White balance shift）※追加': { ref: 'temperature' },
  'S字カーブ（明暗の差をつける）（S-curve）※追加': { ref: 'contrast' },
  // 影だけ紫（lighten）、明るい所だけ黄（darken）。ティール＆オレンジとは別の2色
  'スプリットトーン（影と明るい所に別の色）（Split toning）※追加': { dur: 4, fn: t => GR(t, { ov: [['rgb(70,35,95)', 'lighten'], ['rgb(255,232,150)', 'darken']] }, { sat: 1, con: 1, temp: .2 }, '影＝紫 明るい所＝黄') },
  // 一番暗い所を灰色まで持ち上げ、少し青を足す（色はそのまま、黒だけ浮く）
  '黒を浮かせる（マットな黒）（Lifted blacks）※追加': { dur: 4, fn: t => GR(t, { f: 'contrast(.92)', ov: [['rgb(52,56,66)', 'lighten']] }, { sat: 1, con: .9, temp: -.1 }, '黒を灰色に浮かす') },
  'ティール＆オレンジ（Teal and orange）': { ref: 'teal-orange' },
  'ブリーチバイパス（銀残し）（Bleach bypass）': { ref: 'bleach' },
  // 濃く・強く、明るい所が黄緑、影が青紫にずれる
  'クロスプロセス（Cross processing）': { dur: 4, fn: t => GR(t, { f: 'saturate(1.4) contrast(1.3)', ov: [['rgba(190,255,60,.38)', 'overlay'], ['rgb(40,25,90)', 'lighten']] }, { sat: 1.4, con: 1.3, temp: 0 }, '明るい所が黄緑に') },
  '白黒（Black and white / Monochrome）': { ref: 'mono' },
  'セピア': { ref: 'faded' },
  // 世界と青いねこは色が抜け、橙のねこだけが元の色で残る
  '1色だけ残す': { dur: 4.5, fn: t => { const a = ease(seg(t, .15, .55)); return X07.v({ keep: a, cats: [[-1.6, 2], [1.7, 3]], cap: a > .4 ? '橙だけ残す' : '元の色' }); } },
  // 赤と青緑の2色だけ：空の青が出ず、くすんだ緑になる
  '2色': { dur: 4, fn: t => GR(t, { f: 'saturate(1.15) contrast(1.1)', ov: [['rgb(255,255,135)', 'darken'], ['rgba(255,110,80,.22)', 'soft-light']] }, { sat: 1.15, con: 1.1, temp: .3 }, '2色：空の青が出ない') },
  // 明るく、差を弱く、色うすく、少し桃色
  'パステル（Pastel）': { dur: 4, fn: t => GR(t, { f: 'brightness(1.18) contrast(.7) saturate(.55)', ov: [['rgba(255,190,215,.2)', 'screen']] }, { sat: .55, con: .7, temp: .2 }, 'パステル') },
  // 中間に緑をうっすら、影は暗い緑
  '緑がかった世界（Green tint）': { dur: 4, fn: t => GR(t, { f: 'saturate(.85) contrast(1.1)', ov: [['rgba(70,210,90,.38)', 'soft-light'], ['rgba(30,90,40,.12)', 'multiply']] }, { sat: .85, con: 1.1, temp: -.2 }, '緑がかった世界') },
  // 青いねこを並べ、赤・緑・青がにごらず濃く分かれる
  'テクニカラー風（Technicolor look）': { dur: 4, fn: t => GR(t, { f: 'saturate(1.55) contrast(1.2) brightness(1.05)' }, { sat: 1.55, con: 1.2, temp: 0 }, 'こってり原色', { cats: [[-1.5, 1.5], [1.5, 2.5]] }) },
  // きれいなデジタル → 粒・明るい所の赤いにじみ・少し黄ばむ
  'フィルム風（粒・ハレーション）': { dur: 4.5, fn: t => { const on = t > .4, u = ease(seg(t, .4, .6)); return X07.v({ grade: on ? { f: 'contrast(.95) sepia(.12)', ov: [[`rgba(255,70,30,${(.14 * u).toFixed(2)})`, 'screen']] } : null, grain: .6 * u, glow: .3 * u, vig: .3 * u, cap: on ? 'フィルム風' : 'デジタルのまま' }); } },
  // 世界を青に、主役は橙のまま。色の輪の反対どうしで主役が飛び出す
  '補色（Complementary colors）': { dur: 4.5, fn: t => { const a = .4 * ease(seg(t, .15, .55)); return X07.keep(`35,85,230,${a.toFixed(2)}`, { z: -4, f: 32, grade: { f: 'saturate(1.25)' }, cap: '青の中の橙' }); } },
  // 影＝赤茶、中間＝橙、明るい所＝黄。隣どうしの色でまとめる
  '類似色（Analogous colors）': { dur: 4, fn: t => GR(t, { ov: [['rgba(255,130,50,.4)', 'soft-light'], ['rgb(105,40,20)', 'lighten'], ['rgb(255,235,130)', 'darken']] }, { sat: 1.1, con: 1, temp: .8 }, '赤〜橙〜黄だけ') },
  // 世界＝黄（6割）、ねこ＝赤橙（3割）、青いねこ＝青（1割）
  '3色（トライアド）（Triadic colors）': { dur: 4.5, fn: t => { const a = .38 * ease(seg(t, .15, .55)), C = [[-1.4, 1.5]]; return X07.keep(`245,205,30,${a.toFixed(2)}`, { cats: C, grade: { f: 'saturate(1.3)' }, cap: '黄・赤・青' }, { cats: C }); } },
  // 色あいを橙1つにして、明るさだけ残す
  '単色（モノクロマティック）（Monochromatic）': { dur: 4, fn: t => GR(t, { f: 'contrast(1.1)', ov: [['rgb(230,125,40)', 'color']] }, { sat: .8, con: 1.1, temp: .7 }, '橙ひと色') },
  // 4つの場面を決めた色で並べる。下の帯が色の台本
  'カラースクリプト（場面ごとの色の台本）': { dur: 7, fn: t => { const s = seq(t, [1, 1, 1, 1], [0, 1, 2, 3]), G = [{ ov: [['rgba(255,150,60,.4)', 'soft-light']] }, { f: 'brightness(.85)', ov: [['rgba(40,90,230,.4)', 'soft-light']] }, { f: 'saturate(.3) brightness(.8)' }, { f: 'saturate(1.4) contrast(1.2)', ov: [['rgba(255,60,40,.3)', 'soft-light']] }]; return X07.v({ x: [-1, 1, 0, 0][s.i], z: [-5, -4.2, -6, -3.6][s.i], grade: G[s.i], tl: s.tl, cap: ['1 出会い 暖', '2 不安 青', '3 喪失 灰', '4 決戦 赤'][s.i] }); } },
  // 彩度の倍率が気持ちに合わせて 1.2→1.0→0.5→1.2 と動く。下の波が彩度
  '彩度で気持ちを語る（Saturation as emotion）': { dur: 7, fn: t => { const S = x => x < .25 ? 1.2 : x < .4 ? lerp(1.2, 1, seg(x, .25, .4)) : x < .55 ? lerp(1, .5, seg(x, .4, .55)) : x < .8 ? .5 : lerp(.5, 1.2, seg(x, .8, 1)), s = S(t); return X07.v({ grade: { f: `saturate(${s.toFixed(2)})` }, gv: { sat: s, con: 1, temp: 0 }, snd: { rows: [{ label: '彩度', amp: x => S(x) / 1.3 }], t }, cap: s > 1.1 ? '幸せ 120%' : s < .6 ? '喪失 50%' : 'ふつう' }); } },
  // 話A＝黄、話B＝青。くり返すと色だけでどちらの話か分かる
  '色の意味づけ（Color symbolism / Color coding）': { dur: 6, fn: t => { const s = seq(t, [1, 1, 1, 1], [0, 1, 0, 1]), A = s.i % 2 === 0; return X07.v({ x: A ? -.8 : 1, z: A ? -4.6 : -3.8, f: A ? 32 : 40, cats: A ? null : [[-1.2, 2]], grade: A ? { ov: [['rgba(255,200,30,.45)', 'soft-light']] } : { f: 'brightness(.9)', ov: [['rgba(40,100,240,.45)', 'soft-light']] }, tl: s.tl, cap: A ? '話A＝黄' : '話B＝青' }); } },
  // ずっと白黒→ねこがとび上がった瞬間に、1回だけ一気に色が流れこむ
  '白黒から色へ切り替え（B&W to color transition）': { dur: 5, fn: t => { const g = 1 - ease(seg(t, .55, .75)); return X07.v({ ay: jump(seg(t, .4, .8)), grade: { f: `grayscale(${g.toFixed(2)}) contrast(${(1 + .15 * g).toFixed(2)})` }, gv: { sat: 1 - g, con: 1, temp: 0 }, cap: g > .5 ? '白黒の世界' : '色がつく！' }); } },
});
