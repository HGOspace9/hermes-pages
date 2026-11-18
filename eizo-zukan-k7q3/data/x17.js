// 分野17 の追加の図。書き方は ../../FIGURE_API.md
// X17.v: 正面4.5m・30mmのいつもの見方。X17.wv(t,n,a): フィルムのゆれ（毎コマの乱数を4コマならした値、-a〜a）
// X17.gr: 白黒にする色の型。aspect は最後に黒帯として描かれる（帯の上にはみ出せるのは text だけ）
const X17 = {
  v: o => Cam(Object.assign({ z: -4.5, f: 30, y: .85 }, o)),
  wv: (t, n, a, s) => { const f = Math.floor(t * n) + (s || 0); return ((hsh(f) + hsh(f + 1) + hsh(f + 2) + hsh(f + 3)) / 2 - 1) * a; },
  gr: 'grayscale(1) contrast(1.15)',
};
XF('17', {
  // 16:9 の左右に帯がすっと入り、4:3 に。顔と体が収まり左右が狭い
  '4:3（1.33:1、スタンダード）': { dur: 4, fn: t => { const u = ease(seg(t, .3, .6)); return X17.v({ z: lerp(-4.5, -3.8, u), f: 32, aspect: u > 0 ? lerp(16 / 9 - .002, 4 / 3, u) : 0, cap: u < .5 ? '16:9' : '4:3 左右が狭い' }); } },
  // 帯の無い全面。少しずつ寄るだけの「ふつう」の形
  '16:9（1.78:1）': { dur: 4, fn: t => X17.v({ z: lerp(-6, -5, ease(t)), f: 28, cats: [[2, 2]], cap: t < .5 ? '16:9 帯なし' : '1920×1080' }) },
  // 16:9 から、上下にごく細い帯が出るだけ（2.39 ほど細長くならない）。2人の会話の絵
  '1.85:1（アメリカンビスタ）': { dur: 4, fn: t => { const u = ease(seg(t, .3, .55)); return X17.v({ x: .4, z: -5, f: 32, cats: [[1.3, .3]], aspect: u > 0 ? lerp(16 / 9 + .002, 1.85, u) : 0, cap: u < .5 ? '16:9' : '1.85 上下に細い帯' }); } },
  // 2.39 のまま横に並ぶねこを広く流し、最後は顔の寄りで額とあごが切れる
  '2.39:1（シネマスコープ、シネスコ）': { dur: 5, fn: t => t < .62 ? X17.v({ x: lerp(-1, 1, ease(t / .62)), z: -6.5, f: 24, cats: [[-2, 1], [2, 1]], aspect: 2.39, cap: '2.39:1 横に広い' }) : aimHead(X17.v({ z: -2.1, f: 55, y: .85, aspect: 2.39, cap: '顔は額が切れる' })) },
  // ふつうの 2.39 → 見せ場で上下に画面が広がり 1.43。下から見上げて高さを見せる
  'IMAX 1.43:1': { dur: 5, fn: t => { const u = ease(seg(t, .35, .65)); return X17.v({ z: -5, y: .4, f: 24, pitch: .22 * u, aspect: lerp(2.39, 1.43, u), cap: u < .5 ? 'ふつう 2.39' : 'IMAX 上下に広がる' }); } },
  // 横の絵の真ん中を切り抜いて縦にし、上へとぶ動きで縦を使う
  '縦 9:16': { dur: 4.4, fn: t => t < .35 ? X17.v({ z: -5, cap: '横の素材' }) : X17.v({ z: -5, aspect: V, dz: 1.35, oy: -.03, ay: jump(seg(t, .5, .9)) * 1.2, cap: '9:16 中央を切抜き' }) },
  // 真四角の真ん中に主役。ゆっくり寄って近さを出す
  '正方形 1:1': { dur: 4, fn: t => X17.v({ z: lerp(-4.6, -3.4, ease(t)), y: .8, f: 32, aspect: 1, grid: 'center', cap: '1:1 真ん中に置く' }) },
  // 上下の帯（レターボックス）が0.7秒で入る→抜けて、今度は左右の帯（ピラーボックス）
  '黒帯（レターボックス・ピラーボックス）': { dur: 5.4, fn: t => { const i = cutOf(t, 2), u = (t * 2) % 1, e = ease(seg(u, .15, .45)) * (1 - ease(seg(u, .85, 1))); return X17.v({ aspect: e > 0 ? (i ? lerp(16 / 9 - .002, 4 / 3, e) : lerp(16 / 9 + .002, 2.39, e)) : 0, cap: i ? 'ピラーボックス' : 'レターボックス' }); } },
  // 時代ごとに形を決めて、カットで一気に切りかえる（昔4:3→今2.39）→最後は狭い→広いへ開く
  '途中で比率を変える（可変アスペクト比）【足した技法】': { dur: 6, fn: t => { const s = seq(t, [1, 1, 1.3], [2, 0, 1]); return X17.v([{ aspect: 4 / 3, sepia: .25, grain: .5, cap: '昔は 4:3' }, { aspect: 2.39, z: -6, f: 26, cats: [[2, 2]], cap: '今は 2.39' }, { aspect: lerp(4 / 3, 16 / 9 - .002, ease(seg(s.u, .2, .8))), cap: '心が開く 狭→広' }][s.i]); } },
  // 先に 2.39 の帯を見せ、魚が帯の上まで飛び出す（帯の上に重ねられる文字で代用）
  '黒帯からはみ出す（フレームブレイク）【足した技法】': { dur: 4.4, fn: t => { const u = seg(t, .4, .75); return X17.v({ aspect: 2.39, ay: jump(seg(t, .4, .7)) * .6 + .9 * ease(seg(t, .4, .75)), top: t > .4 ? X17.v({ plain: 'none', ay: jump(seg(t, .4, .7)) * .6 + .9 * ease(u), sq: 1 + .15 * Math.sin(u * 3.14) }) : null, cap: t < .4 ? 'まず黒帯' : '帯の上へはみ出す' }); } },
  // 2.76 の超横長に大勢→1.19 のほぼ真四角の白黒
  '変わった比率（超横長・ほぼ真四角）【足した技法】': { dur: 5, fn: t => cutOf(t, 2) ? X17.v({ z: -3.6, f: 35, aspect: 1.19, grade: { f: X17.gr }, vig: .5, cap: '1.19:1 白黒' }) : X17.v({ z: -7.5, f: 22, aspect: 2.76, cats: [[-2.2, 1], [-1.1, 2], [1.1, 2], [2.2, 1]], cap: '2.76:1 超横長' }) },
  'セーフエリア（文字が隠れない範囲）【足した技法】': { ref: 'safezone' },
  // 同じ歩きを 8→16→35→70mm で。幅が小さいほど粒が多く、絵があまく、ゆれが大きい（8mmは4:3・18コマ）
  '8mm・16mm・35mm・70mmの違い（Film Gauge）': { dur: 7, fn: t => { const i = cutOf(t, 4), u = (t * 4) % 1, n = i ? 24 : 18, k = Math.floor(u * n * 1.75) / (n * 1.75), a = [.009, .004, .0015, .0004][i]; return X17.v({ ax: lerp(-1.2, 1.2, k), ay: Math.abs(Math.sin(k * Math.PI * 6)) * .07, aspect: [4 / 3, 1.66, 1.85, 2.2][i], grain: [1.7, 1, .45, .1][i], grade: { f: `blur(${[1.6, .9, .3, 0][i]}px) saturate(${[.8, .9, 1, 1.05][i]})` }, ox: X17.wv(u * 1.75, n, a), oy: X17.wv(u * 1.75, n, a * .7, 50), fps: n, cap: ['8mm 粒×4', '16mm 粒×2', '35mm 粒×1', '70mm 粒×½'][i] }); } },
  '粒': { ref: 'grain' },
  // 止めた絵。前半はゆれなし、後半は画面全体がふわふわ左右上下にずれる（真ん中の十字と比べる）
  'ゆれ（ゲートウィーブ / Gate Weave）': { dur: 5, fn: t => { const on = t > .45, a = on ? .008 : 0; return X17.v({ still: true, dz: 1.02, grid: 'center', ox: X17.wv(t * 5, 24, a), oy: X17.wv(t * 5, 24, a * .7, 40), grain: .3, cap: on ? 'ゆれあり 0.8%' : 'ゆれなし' }); } },
  // 白黒の古い上映。傷とほこりは入れっぱなしにせず、2回ふえて消える（強弱）
  '傷とほこり': { dur: 5, fn: t => { const on = (t > .2 && t < .45) || (t > .68 && t < .86); return X17.v({ grade: { f: 'grayscale(.85) contrast(1.1)' }, scratch: on ? 1 : 0, grain: .4, vig: .4, cap: on ? '傷・ほこり' : 'きれいな所' }); } },
  'VHS': { ref: 'vhs' },
  // 4:3 のブラウン管：走査線、流れる帯、周りが暗い丸み、少し青い光
  '走査線・ブラウン管': { dur: 4.5, fn: t => { const on = t > .3; return X17.v({ aspect: 4 / 3, scan: on ? 1 : 0, vig: on ? .9 : 0, glow: on ? .25 : 0, grade: on ? { f: 'contrast(1.2) saturate(1.25)', ov: [['rgba(80,140,255,.18)', 'screen']] } : null, cap: on ? 'ブラウン管' : 'ふつうの画面' }); } },
  // 前半：暗い夜を高感度で撮ったざらつき。後半：通信の乱れで帯がずれる
  'デジタルノイズ': { dur: 5, fn: t => cutOf(t, 2) ? X17.v({ glitch: (t * 2 - 1) % .5 < .3 ? 1 : 0, cap: '通信の乱れ' }) : X17.v({ tint: '15,25,70,.5', grain: 1.8, grade: { f: 'brightness(1.3) saturate(.7)' }, cap: '高感度のざらつき' }) },
  // ぼかし＋強いコントラストを段々に強めて、色の面を大きくまとめる（四角い升は描けないので近い絵）
  'ドット絵化': { dur: 4.5, fn: t => { const s = Math.min(4, Math.floor(seg(t, .2, .8) * 5)); return X17.v({ pixel: [0, 160, 96, 56, 32][s], grade: s ? { f: 'saturate(1.25) contrast(1.1)' } : null, grain: 0, cap: s ? `横${[0, 160, 96, 56, 32][s]}マス` : 'ふつう' }); } },
  // 白黒 → 染色（白まで青＝夜）→ 調色（黒だけ赤茶、白は白のまま）
  '無声映画の色つけ（染色・調色 / Tinting・Toning）': { dur: 6, fn: t => { const i = cutOf(t, 3); return X17.v({ aspect: 4 / 3, grain: .5, grade: { f: X17.gr, ov: [null, [['rgb(90,130,255)', 'multiply']], [['rgb(150,55,30)', 'lighten']]][i] }, cap: ['白黒', '染色：夜は青', '調色：黒だけ赤茶'][i] }); } },
  // 色をうすくした世界の上に、ねこだけ色を重ね、色の縁が毎コマ少しずれてちらつく
  '手彩色・ステンシル彩色【足した技法】': { dur: 4.5, fn: t => { const f = Math.floor(t * 72), on = t > .3; return X17.v({ tint: '150,150,150,.8', grain: .5, aspect: 4 / 3, over: on ? X17.v({ plain: 'none', ax: (hsh(f) - .5) * .05, ay: (hsh(f + 9) - .5) * .03 }) : null, cap: on ? 'ねこだけ手で色' : '白黒に近い絵' }); } },
  // 8mm の絵に、橙の光が0.5秒ふわっと入り（光漏れ）、最後は巻の端が白く焼ける
  '光漏れ・フィルムの焼け・枠見せ（Light Leak / Film Burn）【足した技法】': { dur: 5, fn: t => { const a = bump(t, .35, .09), b = ease(seg(t, .75, 1)); return X17.v({ aspect: 4 / 3, grain: .8, sun: [70, 20], flare: .45 * a, glow: .2 * a, flash: .35 * b, tint: `255,${Math.round(120 + 60 * b)},40,${(.45 * Math.max(a, b)).toFixed(2)}`, cap: t < .7 ? '光漏れ' : '巻の端が焼ける' }); } },
  // 太陽の入った同じ絵：SDR は空も影も平たい／HDR は明るい所だけまぶしく、暗い所はそのまま
  'HDR（High Dynamic Range）': { dur: 5, fn: t => { const h = cutOf(t, 2); return Cam({ z: -7, y: .6, f: 24, pitch: .08, sun: [30, 28], glow: h ? .22 : 0, flare: h ? .18 : 0, grade: { f: h ? 'contrast(1.2) saturate(1.35)' : 'contrast(.8) saturate(.8) brightness(1.08)' }, cap: h ? 'HDR 1000ニト' : 'SDR 100ニト' }); } },
});
