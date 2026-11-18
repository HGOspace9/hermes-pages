// 分野14 の追加の図。書き方は ../../FIGURE_API.md
// X14.q(u,n): 0〜1 を n 段に（コマ打ち）。X14.cut(t,n): n等分の {i, u}。X14.sil: 白地で影絵にする色
const X14 = {
  q: (u, n) => Math.floor(clamp(u) * n) / n,
  cut: (t, n) => ({ i: cutOf(t, n), u: (t * n) % 1 }),
  sil: { f: 'grayscale(1) brightness(.75) contrast(10)' },
  sq: (s, o) => Object.assign({ sq: s, sx: 1 / Math.sqrt(s) }, o),
};
XF('14', {
  'つぶしと伸ばし（Squash and stretch）': { ref: 'squash' },
  '予備動作（Anticipation）': { ref: 'antic' },
  // ごちゃごちゃ（青ねこに隠れる）→ 1つに絞る → 白地の影絵にしても動きが読める
  '見せ場の構図（Staging）': { dur: 6, fn: t => { const { i, u } = X14.cut(t, 3), ay = jump(seg(u, .2, .8)), s = u > .2 && u < .8 ? 1.12 : 1; if (!i) return at(AC({ x: 1.2, z: -6, f: 26, ay, cats: [[.5, -3], [-.5, -1.2], [.7, 1.2], [-1, 1.6], [.2, 3]], cap: 'ごちゃごちゃ' }), 0, .7, 0); return AC(X14.sq(s, { f: 40, ay, plain: i === 2 ? '#ffffff' : '', grade: i === 2 ? X14.sil : null, cap: i === 2 ? '影だけでも読める' : '1つに絞る' })); } },
  // ポーズ描き：原画3枚（うすい影）を先に置き、間を埋める。流し描き：1枚ずつ先へ描き進め、道が読めない
  '流し描きとポーズ描き（Straight ahead／Pose to pose）': { dur: 6, fn: t => { const pose = t < .5, u = X14.q((t * 2) % 1, 18);
    if (pose) { const ax = lerp(-2.2, 2.2, ease(u)), ay = jump(ease(u)); return AC({ z: -7, ax, ay, trail: [[-2.2, 0], [0, 1.3], [2.2, 0]].map(([x, y]) => [x - ax, y - ay, .3]), cap: '原画3枚→間を埋める' }); }
    const p = v => [-2.2 + 4.4 * v + .35 * Math.sin(v * 13), .7 * Math.abs(Math.sin(v * 8)) * (1 + .5 * Math.sin(v * 5))], [ax, ay] = p(u);
    return AC({ z: -7, ax, ay, trail: [1, 2, 3, 4].map(k => { const [x, y] = p(Math.max(0, u - k / 18)); return [x - ax, y - ay, .4 - .08 * k]; }), cap: '1枚目から順に（勢い）' }); } },
  // からだが止まっても、うすい「しっぽ・髪」が2〜4コマ遅れて追いつき、行きすぎて戻る
  'あとから付いてくる動き（Follow through／Overlapping action）': { dur: 5, fn: t => { const on = t >= .5, v = (t * 2) % 1, b = w => lerp(-2.2, 1.6, ease(seg(w, .05, .55))), o = w => w > .55 ? .55 * Math.exp(-8 * (w - .55)) * Math.sin(20 * (w - .55)) : 0, ax = b(v), st = v > .55 ? Math.exp(-8 * (v - .55)) * Math.sin(20 * (v - .55)) : 0;
    return AC({ z: -7, ax, sx: on ? 1 + .12 * st : 1, sq: on ? 1 - .06 * st : 1, trail: on ? [1, 2].map(k => [b(v - .06 * k) + o(v - .06 * k) - ax, 0, .42 - .12 * k]) : null, cap: on ? '遅れて揺れて止まる' : '全部いっしょに止まる' }); } },
  'ゆっくり入りゆっくり出る（Slow in and slow out）': { ref: 'easing' },
  // 同じ速さで、通り道だけ変える：まっすぐの山（固い）→ 放物線の弧（自然）。うすい点は通った道
  '弧（Arcs）': { dur: 6, fn: t => { const arc = t >= .5, u = seg((t * 2) % 1, .05, .85), p = v => [lerp(-2.4, 2.4, v), arc ? jump(v) : 2.6 * (.5 - Math.abs(v - .5))], [ax, ay] = p(u);
    return AC({ z: -7.5, f: 32, ax, ay, trail: [1, 2, 3, 4, 5, 6].map(k => { const [x, y] = p(Math.max(0, u - k * .07)); return [x - ax, y - ay, .25]; }), cap: arc ? '弧を描く（自然）' : 'まっすぐ（固い）' }); } },
  // 主な動き（歩き）はそのまま、小さなはずみと体のゆれを足す（うきうきが伝わる）
  '副次的な動き（Secondary action）': { dur: 6, fn: t => { const on = t >= .5, v = (t * 2) % 1, w = on ? Math.sin(v * Math.PI * 12) : 0; return AC({ z: -7, ax: lerp(-2.4, 2.4, v), ay: Math.abs(Math.sin(v * Math.PI * 8)) * .08 + (on ? .35 * bump(v, .5, .05) : 0), sx: 1 + .07 * w, sq: 1 - .05 * w, cap: on ? '歩き＋小さなはずみ' : '歩くだけ' }); } },
  // 同じジャンプを 6枚／12枚／24枚（2コマ打ち）で。枚数が多いほど重く、ゆっくり
  'タイミング（Timing）': { dur: 6, fn: t => { const { i, u } = X14.cut(t, 3), n = [6, 12, 24][i], v = X14.q(seg(u, .02, .02 + [.25, .5, .96][i]), n); return AC({ ay: jump(v), fps: 12, rate: 1, cap: ['12コマ＝軽い', '24コマ＝ふつう', '48コマ＝重い'][i] }); } },
  // 同じジャンプの、高さ・しゃがみ・伸びを1.8倍に
  '誇張（Exaggeration）': { dur: 5, fn: t => { const on = t >= .5, v = (t * 2) % 1, cr = seg(v, .1, .3), u = seg(v, .3, .8), land = seg(v, .8, .95), k = on ? 1.8 : 1, s = u > 0 && u < 1 ? 1 + .12 * k * Math.pow(Math.cos(u * Math.PI), 2) : u <= 0 ? 1 - .12 * k * Math.sin(cr * Math.PI) : 1 - .14 * k * Math.sin(land * Math.PI); return AC(X14.sq(s, { ay: jump(u) * (on ? 1.6 : .8), cap: on ? '誇張（1.8倍）' : '本物どおり' })); } },
  // 体を球と筒（点線の当たり）で考え、上から・下から見ても厚みが保てるか確かめる
  '立体感（Solid drawing）': { dur: 5, fn: t => at(AC({ x: .9 * Math.sin(t * Math.PI * 2), y: lerp(.3, 2.2, (1 - Math.cos(t * Math.PI * 2)) / 2), z: -4.5, f: 35, roto: 1, cap: '球と筒で考える' }), 0, .6, 0) },
  // 同じ大きさが並ぶ平らな絵 → 手前に大きく・奥に小さく、ゆれと間に緩急
  '魅力（Appeal）': { dur: 6, fn: t => { const v = (t * 2) % 1; if (t < .5) return AC({ z: -7, still: true, cats: [[-1.2, 0], [1.2, 0]], grade: { f: 'saturate(.5)' }, cap: '同じ形が並ぶ' }); const s = 1 + .08 * Math.sin(v * Math.PI * 4); return aimHead(AC(X14.sq(s, { z: -3.5, f: 45, ay: jump(seg(v, .55, .8)) * .5, cats: [[-1.6, 3], [1.4, 4]], grade: { f: 'saturate(1.3)' }, cap: '大小と緩急の差' }))); } },
  'コマ打ち（1コマ・2コマ・3コマ）': { ref: 'step' },
  // フル：毎コマ形が変わる。リミテッド：止め絵（しっぽも止まる）を8枚/秒で引き、2枚の絵を入れかえるだけ
  'リミテッド（Limited animation）': { dur: 6, fn: t => { const v = (t * 2) % 1; if (t < .5) { const u = seg(v, .1, .9), s = 1 + .15 * Math.sin(u * Math.PI * 2); return AC(X14.sq(s, { ax: lerp(-1.5, 1.5, u), ay: jump(u) * .6, fps: 24, rate: 1, cap: 'フル（毎コマ描く）' })); } return AC({ ax: lerp(-1.5, 1.5, X14.q(seg(v, .1, .9), 20)), still: true, sq: Math.floor(v * 12) % 2 ? 1.04 : 1, fps: 8, rate: 1, cap: '止め絵を引くだけ' }); } },
  'オバケ（スミア／Smear）': { ref: 'smear' },
  // 着地の瞬間だけ、白黒と白黒反転を1コマずつ交互に（約7コマ）＋強い揺れ
  'インパクトフレーム': { dur: 3.6, fn: t => { const hit = t > .45 && t < .53, k = Math.floor(t * 86) % 2; return AC(X14.sq(t > .45 ? 1 - .35 * Math.exp(-(t - .45) * 14) : 1.15, { z: -5, ay: t < .45 ? jump(.5 + seg(t, .1, .45) * .5) : 0, shake: t > .45 ? 9 * Math.exp(-(t - .45) * 10) : 0, grade: hit ? { f: k ? 'grayscale(1) invert(1) contrast(4)' : 'grayscale(1) contrast(4)' } : null, streak: hit ? 1.2 : 0, cap: hit ? 'ドン！（白黒反転）' : '' })); } },
  // 15mmで足もとすれすれから。ポーズは中割りなしでパッ、パッと切りかわる
  '金田パース（かなだパース）': { dur: 4, fn: t => { const i = Math.min(3, Math.floor(t * 4)), P = [[0, 1, 1, 0], [-.4, 1.3, .8, .12], [.4, .75, 1.35, -.15], [0, 1.25, .85, .05]][i]; return at(AC({ x: .3, y: .25, z: -1.6, f: 15, ax: P[0], sq: P[1], sx: P[2], roll: P[3], shake: t % .25 < .03 ? 3 : 0, cap: '広角で極端な遠近' }), 0, .9, 0); } },
  // 光の玉と輪が、1コマ（12枚/秒）ごとに形と場所を変えて飛び散る
  '金田光り（かなだびかり）': { dur: 3.6, fn: t => { const k = Math.floor(t * 43), on = t > .25; return AC({ z: -6, f: 30, pitch: .12, sun: [lerp(-25, 25, hsh(k + 3)), 18 + 20 * hsh(k + 7)], flare: on ? .5 + .2 * hsh(k) : 0, glow: on ? .1 : 0, flash: t > .25 && t < .3 ? .2 : 0, part: on ? { type: 'spark', u: seg(t, .25, .9) } : null, fps: 12, cap: on ? '形の決まった光' : '' }); } },
  // 飛ぶねこが曲がった煙の糸を引き、青ねこ（ミサイル役）がうねりながら追う。カメラも傾いて一緒に飛ぶ
  '板野サーカス（いたのサーカス）': { dur: 5, fn: t => { const z = lerp(-14, 22, t), X = s => Math.sin(s * 9) * 1.1, w = X(t), c = at(Cam({ x: .5 * Math.sin(t * 5), y: 2.1, z: z - 5, f: 24, ax: w, az: z, ay: 1.4 + .4 * Math.sin(t * 13), cats: [0, 1, 2, 3, 4, 5].map(j => [1.9 * Math.sin(t * (7 + j) + j * 2), z + 1 + j * .8 + Math.sin(t * 11 + j)]), trail: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(k => [X(t - k * .012) - w, .4 * (Math.sin((t - k * .012) * 13) - Math.sin(t * 13)), .2]), hstreak: .25, cap: '曲がる煙をすり抜ける' }), w * .6, 1.3, z + 3); c.roll = .35 * Math.sin(t * 6); return c; } },
  // ふつう：1枚の背景を横に引くだけ → 背動：地面すれすれを飛び、角を曲がる背景をコマごとに描く（12枚/秒）
  '背動（はいどう／背景動画）': { dur: 6, fn: t => { const bd = t >= .5, v = X14.q((t * 2) % 1, 36), cat = AC({ z: -6, plain: 'none', ay: Math.abs(Math.sin(v * Math.PI * 12)) * .1 }); return bd ? Cam({ noA: true, x: 1.2 * Math.sin(v * 3), y: .35, z: lerp(-20, 25, v), f: 22, yaw: .6 * Math.sin(v * Math.PI * 2), grade: { f: 'contrast(1.3) saturate(1.3)' }, fps: 12, rate: 1, over: cat, cap: '背景ごと描いて動かす' }) : AC({ z: -9, y: .5, f: 30, noA: true, ox: lerp(-.15, .15, v), fps: 12, rate: 1, over: cat, cap: 'ふつう：1枚を引く' }); } },
  // ねこの周りを半周。角度の違う絵を1枚ずつ描く（8枚/秒）
  '回り込み作画（まわりこみ）': { dur: 5, fn: t => { const a = lerp(-1.6, 1.6, ease(X14.q(t, 40))); return at(AC({ x: 2.5 * Math.sin(a), z: -2.5 * Math.cos(a), y: 1, f: 30, fps: 8, rate: 1, cap: '角度ごとに1枚ずつ' }), 0, .7, 0); } },
  // 形は大胆にくずし（横に3倍・ぺちゃんこ）、止め→一気→ぷるん、の間で気持ちよく見せる
  'ウェブ系作画（Web系）': { dur: 4, fn: t => { let ax = -2.2, ay = 0, sq = 1, sx = 1, trail = null; const G = { f: 'saturate(1.4) contrast(1.2)' };
    if (t < .2) sq = 1 - .3 * seg(t, .1, .2), sx = 1 + .3 * seg(t, .1, .2);
    else if (t < .26) { const u = seg(t, .2, .26); ax = lerp(-2.2, 1.8, u); sx = 3; sq = .7; trail = [1, 2, 3].map(k => [-.5 * k, 0, .3]); }
    else if (t < .55) { const d = t - .26; ax = 1.8 + .5 * Math.exp(-14 * d) * Math.sin(40 * d); sx = 1 + .4 * Math.exp(-14 * d) * Math.cos(40 * d); }
    else { const u = seg(t, .55, .75), l = seg(t, .75, .85); ax = lerp(1.8, 0, u); ay = jump(u) * .9; sq = u > 0 && u < 1 ? 1.4 : 1 - .45 * Math.sin(l * Math.PI); sx = 1 / Math.sqrt(sq); }
    return AC({ z: -7, ax, ay, sq, sx, trail, grade: G, cap: '形より間の気持ちよさ' }); } },
  '止め絵・ハーモニー（出崎統）': { ref: 'harmony' },
  '3回パン（さんかいパン／繰り返しショット）': { ref: 'sankai' },
  // 声の大きさを3段に分け、口の絵（閉じ・中・開き）を3コマごとに入れかえる。体は止め絵
  '口パク（くちパク）': { dur: 4, fn: t => { const vol = x => (x % .33 < .25 ? 1 : 0) * Math.abs(Math.sin(x * 23)), v = vol(X14.q(t, 32)), m = v < .3 ? 0 : v < .7 ? 1 : 2; return aimHead(AC({ z: -3, f: 40, still: true, mouth: [0, .5, 1][m], cap: '口の絵：' + ['閉じ', '中', '開き'][m], snd: { rows: [{ label: '声', amp: vol }], t } })); } },
  // ふつうの場面（灰）の間に、まったく同じ変身の映像（橙）が毎回はさまる
  'バンク（使い回し）': { dur: 6, fn: t => { const s = seq(t, [1, 1, 1, 1], [2, 0, 2, 0]), u = s.u; if (s.i % 2 === 0) return AC({ z: -7, ax: s.i ? 1.5 : -1.5, cats: s.i ? [[-1, 2]] : [[1.2, 3]], tl: s.tl, cap: s.i ? '第2話' : '第1話' }); return aimHead(AC({ z: -4, f: 40, ay: jump(seg(u, .1, .7)) * .8, glow: .4 * Math.sin(u * Math.PI), part: { type: 'spark', u }, tint: '120,60,200,.25', tl: s.tl, cap: '毎回同じ変身（バンク）' })); } },
  // 実写の歩き（重心の細かいゆれ、粒）→ それをなぞった絵（10枚/秒、点線の輪郭、色はべた）
  'ロトスコープ（アニメでの意味）': { dur: 6, fn: t => { const dr = t >= .5, v = (t * 2) % 1, k = dr ? X14.q(v, 30) : v; return AC({ z: -6.5, ax: lerp(-1.8, 1.8, k) + .08 * Math.sin(k * 31), ay: Math.abs(Math.sin(k * Math.PI * 5)) * .1 + .03 * Math.sin(k * 47), sq: 1 + .04 * Math.sin(k * 63), grain: dr ? 0 : .5, roto: dr ? 1 : 0, grade: dr ? { f: 'saturate(1.5) contrast(1.3)' } : { f: 'saturate(.7)' }, fps: dr ? 10 : 24, rate: 1, cap: dr ? 'なぞった絵（10枚/秒）' : '実写の動き' }); } },
  // 背景だけを横に流して線にする（流線背景）。走るねこはくっきり
  'スピード線': { dur: 3.4, fn: t => { const on = t > .3, v = X14.q(t, 20); return Cam({ z: -7, f: 32, noA: true, yaw: on ? .4 * Math.sin(v * 31) : 0, hstreak: on ? 1.5 : 0, over: AC({ z: -7, plain: 'none', sx: on ? 1.08 : 1, ay: Math.abs(Math.sin(t * 40)) * .08 }), cap: on ? '流線背景' : '' }); } },
  '集中線': { ref: 'lines' },
  // 速い2回のダッシュ。2コマずつ前の自分が4つ、うすくなりながら残る
  '残像': { dur: 3.4, fn: t => { const p = v => v < .5 ? lerp(-2.4, 2.4, ease(seg(v, .1, .4))) : lerp(2.4, -.5, ease(seg(v, .55, .8))), ax = p(t); return AC({ z: -7, ax, ay: .25 * bump(t, .25, .06), trail: [1, 2, 3, 4].map(k => [p(t - k * .025) - ax, 0, .5 - .1 * k]), cap: '残像' }); } },
  // ドスンと着地→画面全体を、2コマずつ止めた大きなずれで揺らし、おさめる
  '画面動（揺れ）': { dur: 3.4, fn: t => { const hit = t > .45, d = hit ? Math.exp(-(t - .45) * 7) : 0, k = Math.floor(t * 41); return AC(X14.sq(hit ? 1 - .3 * Math.exp(-(t - .45) * 14) : 1, { z: -6, ay: jump(.5 + .5 * seg(t, .1, .45)), ox: .05 * d * (hsh(k) - .5) * 2, oy: .06 * d * (hsh(k + 40) - .5) * 2, cap: hit ? 'ドスン（2コマずつ）' : '' })); } },
  // 引きの場面に、顔のアップの板が右から半分だけすべりこみ、少し止まって去る
  'カットイン': { dur: 4, fn: t => { const u = t < .3 ? 0 : t < .38 ? ease(seg(t, .3, .38)) * .5 : t < .8 ? .5 : .5 * (1 - ease(seg(t, .8, .88))); return AC({ z: -8, f: 28, ax: -1, cats: [[-1.5, 2], [1.4, 3]], tr: u > 0 ? { B: aimHead(AC({ z: -2.2, f: 70, plain: '#3a4a8a', ox: -.25, streak: .8 })), clip: 'wipe', u } : null, cap: u ? 'カットイン' : '' }); } },
  // 気持ちが動いた瞬間、町が消えて桃色の背景と光の粒になる
  'イメージ背景': { dur: 4.5, fn: t => { const on = t > .35, u = seg(t, .35, 1); return on ? AC({ z: -4, plain: `hsl(${Math.round(330 - 40 * u)},70%,72%)`, part: { type: 'snow', u: u * .6 }, glow: .3, flash: .4 * clamp(1 - (t - .35) * 12), cap: '気持ちの模様に' }) : AC({ z: -4, cats: [[1.2, 3]], cap: 'ふつうの背景' }); } },
  // 同じ下からのアップが、急に色がぬけ、明暗が強く、ざらついた濃い絵になる
  '劇画タッチ': { dur: 4, fn: t => { const on = t >= .5; return at(AC({ x: .4, y: .35, z: -3, f: 45, grade: on ? { f: 'grayscale(.7) contrast(2.4) brightness(.8)' } : null, grain: on ? .9 : 0, vig: on ? .6 : 0, shake: on ? .4 : 0, cap: on ? '線が太く影が濃い' : 'ふつうの絵' }), 0, .8, 0); } },
  // 顔のアップ：瞳の白い点 あり → 消す（うつろ）→ 小きざみに揺らす（動揺）
  '目のハイライト': { dur: 6, fn: t => { const i = cutOf(t, 3), k = Math.floor(t * 72); return Cam({ y: .88, z: -2.5, f: 50, still: true, ox: i === 2 ? (hsh(k) - .5) * .008 : 0, oy: i === 2 ? (hsh(k + 9) - .5) * .006 : 0, text: i === 1 ? null : { type: 'fade', u: 1, s: '●　　　●', k: .327 }, cap: ['ハイライトあり', '消す＝うつろ', '揺らす＝動揺'][i] }); } },
  // 下から見上げ、首を大きくかしげて止まる（斜めの決めポーズ）
  'シャフ度（シャフト角度）': { dur: 4, fn: t => { const u = ease(seg(t, .25, .6)); return at(AC({ x: .6, y: .3, z: -2.6, f: 50, roll: -.5 * u, still: u >= 1, sx: 1 - .1 * u, cap: u > .5 ? '首を大きくかしげて' : '' }), 0, .85, 0); } },
  // 暗い場面の光の玉：絵の具の黄色（光らない）→ 透過光（芯が白く、まわりへ光があふれて脈打つ）
  '透過光（とうかこう／T光）': { dur: 4.5, fn: t => { const on = t >= .4, p = .5 + .5 * Math.sin(t * 30); return AC({ z: -6, f: 30, pitch: .12, sun: [0, 30], tint: '10,15,50,.6', flare: on ? .45 + .1 * p : 0, glow: on ? .35 : 0, cap: on ? '透過光（本当に光る）' : '絵の具の黄色' }); } },
  // 画面の外（左上）から、光の帯が斜めに差し込み、ゆっくり動く
  '入射光（にゅうしゃこう）': { dur: 5, fn: t => { const u = ease(seg(t, .15, .9)); return AC({ z: -6, f: 30, pitch: .05, sun: [lerp(-150, -110, u), lerp(70, 40, u)], flare: .75 * seg(t, .1, .4), glow: .15, tint: '255,170,90,.12', cap: '斜めに差し込む光' }); } },
  // 色の紙を画面の端からすべりこませる：暗い場面は青むらさき、夕方はだいだい
  'パラ（色のかぶせ／パラフィン）': { dur: 5, fn: t => { const ev = t >= .5, w = ease(seg((t * 2) % 1, .1, .6)) * .55; return AC({ z: -6, grade: { ov: [[ev ? 'rgba(255,110,40,.55)' : 'rgba(60,30,140,.6)', 'multiply']] }, wipe: w, vig: .3, cap: ev ? '夕方：だいだい' : '暗い場面：青むらさき' }); } },
  'フレア（Lens flare）': { ref: 'flare' },
  // 全体にやわらかな光のにじみをかける（明るく、コントラストは弱く）
  'ディフュージョン（ふんわり）': { dur: 4, fn: t => { const on = t >= .5; return aimHead(AC({ z: -4, f: 40, cats: [[-1.2, 3]], glow: on ? .55 : 0, grade: on ? { f: 'brightness(1.08) contrast(.85) saturate(.9)' } : null, dof: on ? .15 : 0, fd: 4, cap: on ? 'ふんわり' : 'そのまま' })); } },
  // 代わりの図解：画面が小さくゆれ、ねこの形が波打ち、ぼけが脈打つ（陽炎）
  '波ガラス（なみガラス）': { dur: 4, fn: t => { const w = t >= .4 ? 1 : 0; return AC({ z: -6, f: 40, yaw: w * .012 * Math.sin(t * 40), pitch: w * .01 * Math.sin(t * 33), sx: 1 + w * .06 * Math.sin(t * 50), sq: 1 + w * .04 * Math.sin(t * 37 + 1), dof: w * .25 * (1 + Math.sin(t * 25)) / 2, fd: 6, tint: w ? '255,150,60,.1' : null, hstreak: w * .1, cap: w ? 'ゆらゆら（陽炎）' : '' }); } },
  // マルチ：横に動き、手前の青ねこはぼけて速く、奥はゆっくり → 密着：ぼけずに層ごと別の速さですべる
  'マルチプレーン・密着マルチ': { dur: 6, fn: t => { const u = ease((t * 2) % 1); if (t < .5) return AC({ z: -6, f: 40, x: lerp(-1.4, 1.4, u), cats: [[-.4, -3.6], [.9, -3.3]], dof: .8, fd: 6, cap: 'マルチ：段ごとにぼける' }); return AC({ z: -6, f: 40, noA: true, ox: lerp(-.05, .05, u), over: AC({ z: -6, f: 40, plain: 'none', cats: [[lerp(1.8, -1.8, u), -3.5], [lerp(3.4, -.2, u), -3.3]] }), cap: '密着：ぼけずに別の速さ' }); } },
  // 横から見る。手前の柱（ブック）がねこの前を速く横切る。ねこと奥はほぼ止まって見える
  'ブックの引き': { dur: 4, fn: t => { const z = lerp(-12, 12, t); return at(AC({ x: 1.5, z, y: 1, f: 30, ax: 6, az: z, ay: Math.abs(Math.sin(t * 40)) * .06, cap: '手前のブックが横切る' }), 6, .7, z); } },
  // 横から見る。ねこは画面の同じ所で足ぶみ（2コマ打ち）、奥の柱が後ろへ流れる
  'Follow（フォロー）': { dur: 4, fn: t => { const z = lerp(-15, 25, t), k = X14.q(t, 48); return at(AC({ x: 1.5, z, y: .8, f: 32, ax: -.5, az: z, ay: Math.abs(Math.sin(k * Math.PI * 16)) * .12, sx: 1.05, fps: 12, rate: 1, cap: '足ぶみ＋背景を引く' }), -.5, .6, z); } },
  // ねこが画面の中を横切り、カメラが少し遅れて追って振られる
  'つけPAN（つけパン）': { dur: 5, fn: t => { const X = v => lerp(-6, 6, ease(seg(v, .05, .95))), ax = X(t); return Cam({ z: -8, y: .8, f: 35, ax, ay: Math.abs(Math.sin(t * 50)) * .06, yaw: Math.atan2(X(t - .07), 8), cap: '追って振る（少し遅れる）' }); } },
  // 絵全体を拡大（T.U）→ 縮小（T.B）。手前と奥のずれは出ない
  'T.U・T.B（トラックアップ／トラックバック）': { dur: 5, fn: t => { const up = t < .5, u = ease(seg((t * 2) % 1, .1, .9)), k = up ? u : 1 - u; return AC({ z: -7, dz: 1 + 1.2 * k, oy: .012 * k, cap: up ? 'T.U（絵を拡大）' : 'T.B（絵を縮小）' }); } },
  // 動く層だけ進む向きに流れてぼける → 画面全体に小さな揺れ
  '撮影ブレ': { dur: 5, fn: t => { const v = (t * 2) % 1; if (t < .5) { const w = seg(v, .15, .85), ax = lerp(-3, 3, ease(w)), sp = Math.sin(w * Math.PI); return AC({ z: -7, ax, trail: [1, 2, 3, 4, 5, 6, 7, 8].map(j => [-.09 * j * sp, 0, .28 - .03 * j]), cap: '動く層に流れるぶれ' }); } const k = Math.floor(v * 30); return AC({ z: -6, ox: (hsh(k) - .5) * .012, oy: (hsh(k + 50) - .5) * .012, cap: '画面に小さな揺れ' }); } },
  // 全部くっきり → 手前と奥の層をぼかす → ピントを奥の青ねこへ移す
  '被写界深度のぼかし': { dur: 6, fn: t => { const on = t >= .35; return AC({ x: .3, z: -6, f: 50, cats: [[-.5, -3.4], [.9, 8]], dof: on ? .9 : 0, fd: t < .65 ? 6 : lerp(6, 14, ease(seg(t, .65, .9))), cap: !on ? 'ぼかしなし' : t < .65 ? '層ごとにぼかす' : 'ピントを奥へ' }); } },
  // 1枚絵を拡大するだけ（奥行きなし）→ 絵を立体に貼り、カメラが中へ入って少し回る
  'カメラマップ（3D背景）': { dur: 6, fn: t => { const u = ease((t * 2) % 1), G = { f: 'saturate(1.35) contrast(1.15)' }; return t >= .5 ? at(AC({ x: lerp(-.8, .8, u), z: lerp(-8, -4.5, u), f: 32, noA: true, cats: [[0, 6]], grade: G, cap: '絵の中へ入っていく' }), 0, 1, 8) : AC({ z: -8, f: 32, noA: true, cats: [[0, 6]], dz: 1 + .3 * u, grade: G, cap: '1枚絵：拡大だけ' }); } },
  // 紙の台の上で、平らな部品が8枚/秒でカクッと折れたり傾いたりして進む
  '切り絵アニメ（Cutout animation）': { dur: 5, fn: t => { const i = Math.floor(t * 40), P = i % 4; return AC({ z: -6, plain: '#e8d9b5', still: true, ax: lerp(-2, 2, i / 39), ay: [0, .12, .2, .12][P], sq: [1, .92, 1.05, .96][P], sx: [1, 1.08, .95, 1.04][P], roll: [0, .07, 0, -.07][P], sepia: .12, fps: 8, rate: 1, cap: '紙の部品で動かす' }); } },
  'コマ撮り（Stop motion）': { ref: 'stopmotion' },
  // 光の台の上で8枚/秒ずつ描き変え、前の絵のあとがうすく残る。最後は形が溶けて別のねこへ
  '砂・油絵アニメ': { dur: 6, fn: t => { const k = X14.q(t, 48), m = seg(k, .55, .85), p = v => [lerp(-1.6, 0, seg(v, 0, .5)), jump(seg(v, .1, .45)) * .6], [ax, ay] = p(k); return AC({ z: -4.2, plain: '#f3e2b8', still: true, ax, ay, sx: 1 + .25 * Math.sin(m * Math.PI), sq: 1 - .15 * Math.sin(m * Math.PI), trail: [1, 2, 3].map(j => { const [x, y] = p(Math.max(0, k - j / 24)); return [x - ax, y - ay, .2 / j]; }), tr: m > 0 ? { B: AC({ z: -4.2, plain: '#f3e2b8', noA: true, still: true, cats: [[1.2, 0]] }), mix: m, u: m } : null, grade: { f: 'grayscale(1) sepia(.8) contrast(1.1)' }, fps: 8, rate: 1, cap: m > 0 ? '溶けて次の絵へ' : '少しずつ描き変える' }); } },
  // 白枠の漫画のコマ：止め絵のままゆっくり寄り、手前の層が少しずれ、効果音の文字が出る
  'モーションコミック': { dur: 5, fn: t => { const u = ease(t), pop = seg(t, .55, .75); return AC({ z: -6, f: 40, still: true, dz: 1 + .12 * u, ox: .02 * u, frame: 1, grade: { f: 'contrast(1.2) saturate(1.2)' }, cats: [[lerp(-1.3, -1.6, u), -2.6]], text: pop > 0 ? { type: 'pop', u: pop, s: 'ドン', k: 1.2 } : null, cap: 'コマがゆっくり動く' }); } },
  // 1枚絵のアップが、息をするように少しふくらみ、少しだけ角度が変わる（奥はぼけて少しずれる）
  'Live2D': { dur: 5, fn: t => { const b = Math.sin(t * Math.PI * 4); return aimHead(AC({ z: -3, f: 40, x: .12 * Math.sin(t * Math.PI * 2), sq: 1 + .025 * b, sx: 1 - .012 * b, cats: [[-1.5, 4], [1.6, 6]], dof: .5, fd: 3, cap: '1枚絵が息をする' })); } },
  // うすい影＝絵の置き場所（間隔）。等間隔 → タメ（同じ所に何枚も）、ツメ（一気に広く、止まり際はつまる）
  'タメとツメ': { dur: 6, fn: t => { const on = t >= .5, v = (t * 2) % 1, N = 12, f = on ? w => w < .45 ? 0 : 1 - Math.pow(1 - seg(w, .45, 1), 3) : w => w, X = w => lerp(-2.6, 2.6, f(w)), n = X14.q(seg(v, .1, .9), N), ax = X(n), s = on && n > .15 && n < .45 ? .82 : 1; return AC(X14.sq(s, { z: -7.5, f: 32, ax, trail: Array.from({ length: N + 1 }, (_, j) => [X(j / N) - ax, 0, .13]), fps: 12, rate: 1, cap: on ? 'タメて一気→すっと止まる' : '等間隔（ツメなし）' })); } },
  // 4枚の歩きの絵を3コマずつ、くり返す。下の帯の色の並びがくり返し
  'リピート（くり返し）・なびき': { dur: 4.5, fn: t => { const n = Math.min(35, Math.floor(t * 36)), p = n % 4; return AC({ z: -6, ay: [0, .1, .04, .1][p], sq: [.95, 1.05, 1, 1.05][p], sx: [1.05, .97, 1, .97][p], fps: 8, rate: 1, tl: { v: Array.from({ length: 36 }, (_, j) => [j / 36, (j + 1) / 36, j % 4]), t }, cap: `4枚で1周（${p + 1}枚目）` }); } },
  // 着地の火花を、2コマ打ち（12枚/秒）の段々の絵で描く
  'エフェクト作画': { dur: 4, fn: t => { const on = t > .3, u = X14.q(seg(t, .3, .95), 32); return AC({ z: -6, f: 32, ay: t < .3 ? jump(.5 + seg(t, .05, .3) * .5) : 0, sq: on ? 1 - .3 * Math.exp(-(t - .3) * 14) : 1, part: on ? { type: 'spark', u } : null, glow: on ? .3 * (1 - u) : 0, flash: t > .3 && t < .33 ? .3 : 0, tint: on ? `255,140,40,${(.15 * (1 - u)).toFixed(2)}` : null, shake: on ? 3 * (1 - u) : 0, fps: 12, rate: 1, cap: on ? '火花を2コマで描く' : '' }); } },
  // 同じ回り込み：ふつうの3D（ぬるぬる、やわらかい色）→ セルルック（2コマ打ち、色の段がくっきり）
  'セルルックCG（手描き風の3D）': { dur: 6, fn: t => { const cel = t >= .5, v = (t * 2) % 1, a = lerp(-.9, .9, ease(cel ? X14.q(v, 36) : v)); return at(AC({ x: 2.5 * Math.sin(a), z: -2.5 * Math.cos(a), y: 1, f: 30, grade: cel ? { f: 'contrast(1.7) saturate(1.5)' } : { f: 'contrast(.9) saturate(.8)' }, fps: cel ? 12 : 24, rate: 1, cap: cel ? 'セルルック（2コマ）' : 'ふつうの3D' }), 0, .7, 0); } },
});
