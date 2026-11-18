// 分野05 の追加の図。書き方は ../../FIGURE_API.md
// X05.run(s): 走るねこの横の位置と、足どりの小さな上下（s=0〜1で左→右）
const X05 = {
  run: s => ({ ax: lerp(-3, 3, s), ay: Math.abs(Math.sin(s * Math.PI * 9)) * .1 }),
  hop: s => ({ ax: lerp(-2.5, 2.5, s), ay: jump((s * 2) % 1) * .8 }),
  // 2つの '#rrggbb' を u で混ぜて 'rgb(..)' に（空の色の移り変わり用）
  mix: (a, b, u) => { const h = (s, i) => parseInt(s.slice(1 + 2 * i, 3 + 2 * i), 16); return `rgb(${[0, 1, 2].map(i => Math.round(lerp(h(a, i), h(b, i), u))).join(',')})`; },
  sky: (u, A, B) => [0, 1, 2].map(i => X05.mix(A[i], B[i], u)),
};
XF('05', {
  // 同じ走りを 24→30→60コマで。24は段々が粗く少しぶれ、60はなめらかでぶれ無し
  '24・30・60コマの違い（Frame Rate / fps）': { dur: 6, fn: t => { const i = cutOf(t, 3), u = (t * 3) % 1, n = [12, 15, 30][i], k = Math.floor(u * n) / n; return Cam(Object.assign({ z: -7.5, f: 32, trail: [[[-.15, 0, .35], [-.3, 0, .15]], [[-.12, 0, .25]], null][i], fps: [24, 30, 60][i], rate: 1, cap: ['24コマ 映画', '30コマ テレビ', '60コマ 生中継'][i] }, X05.run(k))); } },
  'ハイスピード撮影（High Speed / Slow Motion、スローモーション）': { ref: 'slow' },
  // ふつうの歩き→同じ歩きを4倍に早回し（青いねこも速く通る、少しせかせか揺れる）
  'コマ落とし（早回し）': { dur: 4, fn: t => { const fast = t >= .4, s = fast ? .4 + (t - .4) * 4 : t; return Cam({ z: -7, f: 32, ax: 2.4 * Math.sin(s * Math.PI * .9), ay: Math.abs(Math.sin(s * Math.PI * 6)) * .08, cats: [[lerp(-6, 6, (s * .4) % 1), 4]], shake: fast ? .5 : 0, rate: fast ? 4 : 1, cap: fast ? '早回し ×4' : 'ふつう' }); } },
  'タイムラプス（Time-Lapse）': { ref: 'lapse' },
  // 道を長い距離すーっと進みながら（1枚ごとに一歩）、空は昼→夕焼けへ、雲は速く流れる。いつも奥の同じ1点に向ける
  'ハイパーラプス（Hyperlapse）': { dur: 5, fn: t => { const k = Math.floor(t * 40) / 40; return at(Cam({ noA: true, x: 0, y: 1.6, z: lerp(-28, 28, k), f: 28, sun: [lerp(70, -50, k), 44 - 30 * k], sky: X05.sky(ease(k), ['#6fa6dc', '#eadfc8', '#a5b9c9'], ['#2a2f6b', '#f08a5a', '#6a5a7a']), props: [[-14, 9, 60, 5], [6, 11, 75, 6], [22, 8, 90, 5]].map(([x, y, z, s]) => ({ t: 'cloud', x: x + 40 * k, y, z, s, a: .85 })), still: true, rate: 300, fps: 24, cap: '進みながら早回し' }), 0, 6, 45); } },
  // ジャンプを24コマ（粗い段々＋縦のぶれ）→120コマ（なめらか、ぶれ無し、くっきり）
  'HFR（High Frame Rate、高コマ数上映）': { dur: 5, fn: t => { const hi = t >= .5, u = (t * 2) % 1, k = hi ? u : Math.floor(u * 12) / 12; return TC({ f: 45, ay: jump(k), trail: hi ? null : [[0, .08, .35], [0, .16, .15]], grade: hi ? { f: 'contrast(1.15) saturate(1.1)' } : null, fps: hi ? 120 : 24, rate: 1, cap: hi ? 'HFR 120コマ' : 'ふつう 24コマ' }); } },
  'コマ打ち（2コマ打ち・3コマ打ち / On Twos, On Threes）【足した技法】': { ref: 'step' },
  'シャッター角度（Shutter Angle、180度が普通）': { ref: 'mblur' },
  // 戦場風：手持ちの強いゆれ、ぶれ無しの走り、飛び散る粒が1コマずつ止まって見える
  '狭いシャッター（Narrow Shutter、パラパラした戦場）': { dur: 3, fn: t => { const k = Math.floor(t * 36) / 36; return Cam(Object.assign({ z: -6.5, f: 30, shake: 2, sepia: .15, part: { type: 'spark', u: (k * 3) % 1 }, fps: 24, rate: 1, cap: '45度 ぶれ無し' }, X05.run(k))); } },
  // 360度：走るねこが長い尾を引いて流れ、少しにじむ
  '開けたシャッター（Open Shutter、流れる）': { dur: 3, fn: t => Cam(Object.assign({ z: -7.5, f: 32, trail: [1, 2, 3, 4, 5, 6, 7, 8].map(j => [-.11 * j, 0, .5 - .055 * j]), hstreak: .4, glow: .15, fps: 24, rate: 1, cap: '360度 流れる' }, X05.run(t))) },
  // 6枚/秒で段々に進むのに、1枚ごとに長いぶれ（にじんだ残像が飛び飛びに進む）
  'ステッププリント（Step Printing、残像の流し）': { dur: 4, fn: t => { const k = Math.floor(t * 12) / 12; return Cam(Object.assign({ z: -7.5, f: 32, trail: [1, 2, 3, 4, 5, 6].map(j => [-.08 * j, 0, .5 - .07 * j]), hstreak: .3, fps: 6, rate: 1, cap: '6コマ×4回くり返し' }, X05.run(k))); } },
  // 夜、開けっぱなし：奥を通る車のライト（白と赤）が光の線として残り、止まったねこたちはくっきり
  '長時間露光（Long Exposure）': { dur: 5, fn: t => { const x = lerp(-5, 5, t); return Cam({ z: -7.5, f: 32, still: true, cats: [[-1.7, 1.2], [1.8, 1.6]], sky: ['#04061a', '#1c2550', '#0d1226'], tint: '10,15,45,.2', props: [{ t: 'line', x: -5.5, y: .3, z: -1.6, x2: x, y2: .3, z2: -1.6, w: .09, col: 'rgba(255,245,210,.95)' }, { t: 'line', x: 5.5, y: .42, z: -1, x2: -x, y2: .42, z2: -1, w: .08, col: 'rgba(255,50,40,.9)' }, { t: 'glow', x, y: .3, z: -1.6, s: .5 }, { t: 'glow', x: -x, y: .42, z: -1, s: .4, col: '255,70,60' }], glow: .2, cap: '30秒あけたまま' }); } },
  // 速く左右に振る：振る速さに合わせて、まっすぐな棒が斜めに倒れ、ねこが横にゆがむ（こんにゃく）。止まる所ではまっすぐ
  'ローリングシャッターのゆがみ（Rolling Shutter）【足した技法】': { dur: 3, fn: t => { const v = Math.cos(t * Math.PI * 6); return Cam({ z: -7, f: 35, yaw: .3 * Math.sin(t * Math.PI * 6), roll: .03 * v, sx: 1 + .3 * v, props: [-2.4, -1.2, 1.2, 2.4].map(x => ({ t: 'line', x, y: 0, z: 1, x2: x - .9 * v, y2: 2.6, z2: 1, w: .07, col: '#3a3f48' })), cap: Math.abs(v) > .5 ? '速く振ると棒が倒れる' : '止まるとまっすぐ' }); } },
  // 6匹の青ねこの輪を回す。1コマ8度＝本当の回り、60度＝止まって見える、56度＝逆回りに見える
  'ワゴンホイール効果（Wagon-Wheel Effect）【足した技法】': { dur: 6, fn: t => { const i = cutOf(t, 3), k = Math.floor(t * 72), a = k * [8, 60, 56][i] * Math.PI / 180; return at(Cam({ z: -6, y: 4.5, f: 35, cats: [0, 1, 2, 3, 4, 5].map(j => [2.2 * Math.cos(a + j * Math.PI / 3), 2.2 * Math.sin(a + j * Math.PI / 3)]), fps: 12, rate: 1, cap: ['ゆっくり回す', '速い→止まって見える', 'もっと速い→逆回り'][i] }), 0, 0, 0); } },
  'スピードランプ': { ref: 'ramp' },
  '止め絵（フリーズ）': { ref: 'freeze' },
  // 歩いてジャンプ→同じ動きを後ろから再生（着地から浮き上がり、後ろ向きに歩く）
  // 煙突の煙も一緒に：ふつうは昇る→逆再生では煙が下へ吸いこまれる（ありえない動きで逆と分かる）
  '逆再生': { dur: 4, fn: t => { const back = t >= .5, u = back ? 1 - (t - .5) * 2 : t * 2; return TC({ ax: lerp(-2, 1, seg(u, 0, .6)), ay: jump(seg(u, .6, 1)), props: [{ t: 'box', x: 2.3, z: 1.5, w: .45, h: .8, col: '#8a6a52' }, { t: 'smoke', x: 2.3, y: .85, z: 1.5, s: .8, u: (u * 1.5) % 1 }], scan: back ? .3 : 0, rate: 1, cap: back ? '◀◀ 煙が吸いこまれる' : '▶ ふつう' }); } },
  // 少し前の自分が3つ、うすくなりながら同じ道を遅れてついてくる（とびとびのコピー）
  '残像（エコー）': { dur: 3.5, fn: t => { const p = X05.hop(t); return Cam(Object.assign({ z: -7.5, f: 32, trail: [1, 2, 3].map(k => { const q = X05.hop(Math.max(0, t - k * .06)); return [q.ax - p.ax, q.ay - p.ay, .5 - .13 * k]; }), cap: 'エコー' }, p)); } },
  // とび上がりの短い一片を4回くり返して（ダダダダッ）から続きへ。下に拍
  'スタッター': { dur: 3.5, fn: t => { const r = t > .3 && t < .62, u = t <= .3 ? t : r ? .3 + (t - .3) % .08 : lerp(.38, 1, seg(t, .62, 1)); return TC({ ax: lerp(-1.5, 1.5, u), ay: jump(u), cap: r ? 'ダダダダッ' : '', snd: { rows: [{ label: '拍', amp: x => x > .3 && x < .62 ? Math.exp(-30 * ((x - .3) % .08)) : 0 }], t } }); } },
  'バレットタイム（Bullet Time）': { ref: 'bullet' },
  // 全部が同時に止まる：空中のねこも水しぶきの玉も固まったまま、カメラだけがまっすぐ横へ（玉の前後が入れかわる）
  'タイムスライス（Time Slice / Frozen Moment）': { dur: 4, fn: t => at(Cam({ x: lerp(-1.8, 1.8, ease(t)), z: -4, y: 1, f: 30, ay: jump(.45), still: true, props: [[-.7, 1.7, -.6], [.6, 2, .4], [-.3, 2.3, .8], [.9, 1.3, -.8], [-1, 1.1, .5], [.2, 2.5, -.3]].map(([x, y, z]) => ({ t: 'ball', x, y, z, s: .16, col: '#6fb7e8' })), part: { type: 'spark', u: .35 }, rate: 0, cap: '全部同時に止まる' }), 0, 1.4, 0) },
  // 4分の1のスロー：のばしただけ（段々）→補間でなめらか（てっぺんで少しにじむ）
  'オプティカルフローの補間（Optical Flow Interpolation）': { dur: 6, fn: t => { const ip = t >= .5, u = (t * 2) % 1, k = ip ? u : Math.floor(u * 8) / 8, m = ip ? bump(u, .5, .1) : 0; return TC({ ay: jump(k), sx: 1 + .3 * m, trail: m > .05 ? [[.12, 0, .3 * m], [-.12, 0, .3 * m]] : null, rate: .25, fps: ip ? 96 : 24, cap: ip ? '補間（にじみ注意）' : 'のばしただけ' }); } },
  'ストップモーション（Stop Motion）': { ref: 'stopmotion' },
  // 毎回ジャンプのてっぺんで撮る：歩かずに宙に浮いたまま、段々にすべって進む
  'ピクシレーション（Pixilation、人のコマ撮り）': { dur: 4, fn: t => { const n = 12, i = Math.floor(t * n); return TC({ ax: lerp(-2.5, 2.5, i / (n - 1)), ay: .9 + (hsh(i) - .5) * .12, still: true, fps: 8, rate: 1, cap: '浮いたまま進む' }); } },
  // 同じコマ撮りの動き：前半はぶれ無し（カクカク）、後半は1枚ごとにぶれ（生き物らしい）
  'ゴーモーション（Go Motion）': { dur: 5, fn: t => { const go = t >= .5, u = (t * 2) % 1, n = 9, i = Math.floor(u * n); return Cam({ z: -6, f: 35, ax: lerp(-2.2, 2.2, i / (n - 1)) + (hsh(i) - .5) * .12, sq: 1 + (hsh(i + 9) - .5) * .1, trail: go ? [[-.1, 0, .4], [-.2, 0, .2], [-.3, 0, .1]] : null, fps: 12, rate: 1, cap: go ? 'ゴーモーション（ぶれ）' : 'コマ撮り（ぶれ無し）' }); } },
  // 止めて入れかえ：ねこ→ぱっと消える→同じ場所に青いねこ（背景は動かない）
  '置き換え（Substitution Splice / Stop Trick、消える手品）': { dur: 3.5, fn: t => { const i = t < .35 ? 0 : t < .65 ? 1 : 2; return TC({ noA: i > 0, cats: i === 2 ? [[0, 0]] : null, flash: (clamp(1 - Math.abs(t - .35) * 25) + clamp(1 - Math.abs(t - .65) * 25)) * .6, part: i === 1 ? { type: 'spark', u: seg(t, .35, .55) } : null, cap: ['ねこがいる', 'ぱっ！消えた', '別のねこに'][i] }); } },
});
