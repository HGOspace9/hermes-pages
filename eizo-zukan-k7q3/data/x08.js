// 分野08 の追加の図。書き方は ../../FIGURE_API.md
// X08.orb(角度, 距離): ねこAのまわりの円の上にカメラを置く（0度＝正面）。run(s,幅): 横に走る位置と足どり
const X08 = {
  orb: (deg, d, o) => { const a = deg * Math.PI / 180; return at(Cam(Object.assign({ x: d * Math.sin(a), z: -d * Math.cos(a), y: .8 }, o)), 0, .6, 0); },
  run: (s, w) => ({ ax: lerp(-w, w, s), ay: Math.abs(Math.sin(s * Math.PI * 9)) * .1 }),
  face: o => aimHead(Cam(Object.assign({ z: -2.2, f: 50, y: .85 }, o))),
  dusk: '255,130,60,.22', night: '30,45,120,.45', duskSky: ['#2a2f6b', '#f08a5a', '#6a5a7a'],
};
XF('08', {
  // 効果なしで2つの絵をパッとつなぐだけ（正面の引き→斜めの寄り）
  'ストレートカット': { dur: 4, fn: t => { const s = seq(t, [1, 1]); return withTl(s.i ? at(Cam({ x: 1.6, y: .8, z: -4, f: 50 }), 0, .6, 0) : Cam({ z: -7, f: 35 }), s, { cap: s.i ? 'パッと次の絵' : '効果なしで切る' }); } },
  'ジャンプカット（Jump cut）': { ref: 'jump' },
  'マッチカット（形・動き・視線）': { ref: 'match' },
  // とび上がりの4割の所で切り、続きを別の角度で見せる（動きは途切れない）
  'アクションつなぎ（Cut on action / Match on action）': { dur: 4, fn: t => { const p = seg(t, .2, .85), s = seq(t, [.46, .54]); const c = s.i ? at(Cam({ x: 1.6, y: .5, z: -4, f: 45 }), 0, .9, 0) : Cam({ z: -7, f: 35 }); c.ay = 1.1 * jump(p); return withTl(c, s, { cap: s.i ? '続きは別の角度で' : 'とぶ途中で切る' }); } },
  // 歩く→見物人（1.4秒）→もう先まで歩いている（はさんだ間に時間を飛ばす）
  'カットアウェイ（Cutaway）': { dur: 5.5, fn: t => { const s = seq(t, [2, 1.4, 2], [0, 2, 0]); const c = s.i === 1 ? at(Cam({ y: .8, z: 11.5, f: 40, cats: [[-.8, 7.5], [.8, 7.5]] }), 0, .5, 7.5) : Cam({ z: -7, f: 32, ax: s.i ? lerp(1.2, 2.2, s.u) : lerp(-2.2, -1.2, s.u), ay: Math.abs(Math.sin(s.u * 14)) * .06 }); return withTl(c, s, { cap: ['長い道のり', 'まわりの見物人', 'もう先まで来た'][s.i] }); } },
  // 広い絵（足もとに赤い玉）の途中に、その玉のアップを1.2秒はさむ。玉の位置と光は広い絵とそろえる
  'インサート（Insert shot）': { dur: 5, fn: t => { const s = seq(t, [2, 1.2, 1.6], [0, 3, 0]), bx = .55 + .12 * seg(t, .4, .64), P = [{ t: 'ball', x: bx, z: -.55, s: .28 }]; return withTl(s.i === 1 ? at(Cam({ x: bx + .5, y: .4, z: -1.9, f: 85, face: .4, props: P }), bx, .14, -.55) : Cam({ x: .5, z: -6, f: 35, face: s.i ? .45 : .25, props: P }), s, { cap: ['広い絵', '足もとの玉のアップ', '広い絵にもどる'][s.i] }); } },
  'クロスカット（並行）（Cross-cutting / Parallel editing）': { ref: 'cross' },
  // 静かな夜（眠るねこ・小さな音）→同じコマで絵も音も最大へ（目を見開き口を開ける）
  'スマッシュカット（Smash cut）': { dur: 4, fn: t => { const k = .65, q = t >= k; const c = q ? Cam({ x: .3, z: -2.6, f: 20, y: .5, pitch: .1, ay: .5 * jump(seg(t, k, 1)), eye: 1.6, mouth: 1, shake: 3, part: { type: 'spark', u: seg(t, k, 1) }, flash: .4 * clamp(1 - (t - k) * 12) }) : Cam({ z: -7, f: 35, still: true, eye: 0, sky: ['#04061a', '#1c2550', '#0d1226'], tint: X08.night, props: [{ t: 'glow', x: -2.2, y: 2.4, z: 5, s: .5, a: .7 }] }); return Object.assign(c, { shot: q ? 2 : 1, tl: { v: [[0, k, 1], [k, 1, 3]], t }, snd: { rows: [{ label: '音', amp: x => x < k ? .06 : .95 }], t }, cap: q ? 'ドン！' : 'しずか…' }); } },
  // 次の場面の音が30コマ先に始まり、後から絵が切り替わる（下の段が音）
  'Jカット（J-cut）': { dur: 5, fn: t => { const vk = .6, ak = .35, b = t >= vk; return Object.assign(b ? SB({ x: 1 }) : Cam({ z: -5, f: 35, y: .8 }), { shot: b ? 2 : 1, tl: { v: [[0, vk, 0], [vk, 1, 1]], a: [[0, ak, 0], [ak, 1, 1]], t }, cap: t < ak ? '場面1' : b ? '絵も場面2へ' : '場面2の音が先に' }); } },
  // 絵はBの顔へ切り替わったのに、Aの声が続く（Bは口を閉じて聞いている）→音の切れ目でBの口が動き出す
  'Lカット（L-cut）': { dur: 5, fn: t => { const vk = .4, ak = .7, b = t >= vk; return Object.assign(b ? camB({ cats: [[1.2, 0, -.75, t >= ak ? yap(t) : 0]], eye: 1, hl: t < ak ? .8 : 0 }) : camA({ mouth: yap(t) }), { shot: b ? 2 : 1, tl: { v: [[0, vk, 0], [vk, 1, 1]], a: [[0, ak, 0], [ak, 1, 1]], t }, cap: !b ? 'Aが話す' : t < ak ? '声はA、顔は聞くB' : 'Bが答える' }); } },
  // カメラは同じ速さで横へ。手前を横切る青いねこで画面が暗くなる瞬間に切り、夕方の別の場所へ
  '見えないカット（Invisible cut / Hidden cut）': { dur: 5, fn: t => { const x = lerp(-1.6, 1.6, t), b = t >= .5, s = seq(t, [1, 1], [0, 0]); return withTl(Cam({ x, z: -6, f: 32, y: .8, ax: b ? 1.2 : -.6, tint: b ? X08.dusk : null, cats: [[x + lerp(-3, 3, seg(t, .36, .64)), -4.8]].concat(b ? [[2.2, 2]] : []), black: .85 * clamp(1 - Math.abs(t - .5) * 8) }), s, { cap: b ? 'じつは切れている' : '横切る影で隠す' }); } },
  '軸上のカット': { ref: 'axial' },
  // 下が拍（強い＝小節の頭）。切れ目は小節の頭だけ
  '拍カット': { dur: 4.8, fn: t => { const s = seq(t, [4, 4, 4, 4]), d = t * 16 % 1; const c = [Cam({ z: -7 }), at(Cam({ x: -1.5, y: .4, z: -4, f: 40 }), 0, .8, 0), X08.face({ z: -2, f: 60 }), at(Cam({ x: 1.5, y: 3, z: -5, f: 30 }), 0, .4, 0)][s.i]; c.ay = .12 * Math.exp(-d * 8); return withTl(c, s, { cap: '小節の頭で切る', snd: { rows: [{ label: '拍', amp: x => { const b = x * 16; return (Math.floor(b) % 4 ? .4 : 1) * Math.exp(-(b % 1) * 6); } }], t } }); } },
  '180度の決まり（180-degree rule / イマジナリーライン）': { ref: 'rule180' },
  // 同じねこを続けて：8度だけ動かす（とんで見える）→35度回って寄る（自然）
  '30度の決まり（30-degree rule）': { dur: 6, fn: t => { const s = seq(t, [1, 1, 1], [0, 0, 1]); return withTl([X08.orb(0, 6, { f: 32 }), X08.orb(8, 5.8, { f: 32 }), X08.orb(35, 2.8, { f: 45 })][s.i], s, { cap: ['はじめの絵', '8度：とんで見える', '35度＋寄る：自然'][s.i] }); } },
  '切り返し（Shot / Reverse shot）': { ref: 'reverse' },
  // 左に寄せた顔（右の外を見る）→ねこの目の高さから見た青いねこ→もう一度顔
  '視線の一致（Eyeline match）': { dur: 5, fn: t => { const s = seq(t, [1, 1.5, 1.2], [0, 1, 0]); const c = s.i === 1 ? at(Cam({ x: .6, y: .85, z: -.9, f: 50, cats: [[2, 5]] }), 2, .5, 5) : Cam({ x: s.i ? .6 : .9, z: s.i ? -2 : -3, f: s.i ? 50 : 40, y: .85, face: s.i ? .45 : .85 * ease(seg(s.u, .1, .5)), eye: s.i ? 1.3 : 1, hl: s.i ? .9 : 0 }); return withTl(c, s, { cap: ['右の外を見る', '見ている物', 'また顔：気持ち'][s.i] }); } },
  // 夕焼け空と灯りのともる町を高い所から3秒→そこにいるねこ
  'エスタブリッシング（状況を見せる絵）（Establishing shot）': { dur: 5, fn: t => { const s = seq(t, [3, 1.6], [2, 0]); const c = s.i ? Cam({ z: -3.2, f: 40, y: .8 }) : at(Cam({ x: lerp(-1, 1, s.u), y: 7, z: -22, f: 22 }), 0, 2, 10); return withTl(Object.assign(c, { sun: [40, 8], sky: X08.duskSky, tint: '255,130,60,.1', props: s.i ? null : [[-9, 40], [-5, 44], [6, 42], [11, 46], [2, 48]].map(([x, z], j) => ({ t: 'glow', x, y: 1.5 + 2 * hsh(j), z, s: 1.4, col: '255,190,110', a: .8 })) }), s, { cap: s.i ? 'そこにいるねこ' : 'どこ・いつ（夕方の町）' }); } },
  // 右へ→別の場所でも右へ→正面に向かってくる絵をはさむ→帰りは左へ（残像が向きの印）
  '動きの方向（Screen direction）': { dur: 6, fn: t => { const s = seq(t, [1, 1, .8, 1]), R = [[-.25, 0, .35], [-.5, 0, .15]], c = [Cam(Object.assign({ z: -7, f: 32, trail: R }, X08.run(s.u, 3))), Cam(Object.assign({ z: -4.5, f: 45, y: .5, cats: [[-1, 5], [1.6, 7]], trail: R }, X08.run(s.u, 1.5))), Cam({ z: -7, f: 50, az: lerp(5, -1.5, s.u), ay: Math.abs(Math.sin(s.u * 20)) * .08 }), Cam(Object.assign({ z: -7, f: 32, tint: X08.dusk, trail: R.map(([a, b, o]) => [-a, b, o]) }, X08.run(1 - s.u, 3)))][s.i]; return withTl(c, s, { cap: ['右へ走る', '次の絵も右へ', '正面をはさむ', '帰りは左へ'][s.i] }); } },
  // まったく同じ顔（止め）の間に、友だち／暗い夜道をはさむと、顔の気持ちが変わって見える
  'クレショフ効果（Kuleshov effect）': { dur: 7, fn: t => { const s = seq(t, [1, 1, 1, 1, 1, 1], [0, 1, 0, 0, 3, 0]); const c = s.i === 1 ? at(Cam({ x: .5, y: .6, z: 1.5, f: 50, cats: [[.3, 4]] }), .3, .4, 4) : s.i === 4 ? Cam({ noA: true, z: 2, y: .5, f: 28, tint: '10,10,30,.6' }) : X08.face({ still: true }); return withTl(c, s, { cap: ['いつもの顔', '友だち', 'うれしそう？', '同じ顔', '暗い夜道', 'こわそう？'][s.i] }); } },
  // 5つの型を順に：長さ／リズム／調子／倍音／知的（帯はその型の中の切れ目）
  "エイゼンシュテインの5種（Eisenstein's methods of montage）": { dur: 7, fn: t => {
    const i = cutOf(t, 5), u = (t * 5) % 1, mid = () => at(Cam({ x: 1, y: .8, z: -3.5, f: 45 }), 0, .7, 0), low = () => at(Cam({ x: -1.5, y: .4, z: -4, f: 35 }), 0, .9, 0); let s, c;
    if (i === 0) { s = seq(u, [48, 24, 12, 6, 6]); c = s.i % 2 ? mid() : Cam({ z: -7 }); }
    else if (i === 1) { s = seq(u, [1, 1, 1]); c = [Cam({ z: -7 }), low(), at(Cam({ x: 1.4, y: 2.5, z: -4.5, f: 35 }), 0, .5, 0)][s.i]; c.ay = .6 * jump(s.u); }
    else if (i === 2) { s = seq(u, [1, 1, 1], [1]); c = Object.assign([Cam({ z: -9, f: 24, y: 1 }), at(Cam({ y: .5, z: -4, f: 24 }), 0, 4, 30), Cam({ z: -3, f: 45, y: .8 })][s.i], { tint: '70,90,140,.4', still: true, glow: .25 }); }
    else if (i === 3) { s = seq(u, [3, 2, 1, 1]); c = Object.assign([Cam({ z: -7 }), mid(), X08.face({ z: -2, f: 60 }), low()][s.i], { tint: X08.dusk }); c.ay = .5 * jump(s.u); }
    else { s = seq(u, [1, 1]); c = s.i ? SB({ x: 1 }) : X08.face(); }
    return withTl(c, s, { cap: ['①長さ 48→24→12→6', '②リズム：動きで切る', '③調子：似た気分', '④倍音：全部を重ねる', '⑤知的：並べて考える'][i] });
  } },
  // 12カット：はじめは低いジャンプで失敗→だんだん高く→最初と同じ構図で大ジャンプ成功
  '特訓モンタージュ（Training montage）': { dur: 7, fn: t => { const s = seq(t, [1.2, 1, 1, .9, .9, .8, .8, .8, .7, .7, .7, 1.8]), k = s.i / 11, h = hsh(s.i + 3), ends = s.i === 0 || s.i === 11; const c = ends ? at(Cam({ x: .8, y: .3, z: -4, f: 28 }), 0, 1, 0) : at(Cam({ x: (h - .5) * 3, y: .4 + h * 1.5, z: -3.5 - h * 2, f: 30 + h * 30 }), 0, .7, 0); c.ay = jump(s.u) * (s.i === 11 ? 1.5 : .15 + k * 1.1); if (s.i < 4) c.sq = 1 - .25 * bump(s.u, .95, .08); if (s.i === 11) c.glow = .3 * seg(s.u, .3, .6); return withTl(c, s, { cap: s.i < 4 ? '失敗' : s.i < 11 ? '少しずつ上達' : '成功！' }); } },
  // 朝の青い空、右を向いて出かける→次の絵ではもう着いている（夕焼け空・低い太陽・ともった街灯が手がかり）
  '時間の省略（Ellipsis / Time compression）': { dur: 5, fn: t => { const s = seq(t, [1.6, 1.4]); const c = s.i ? at(Cam({ x: .8, y: .8, z: 20, f: 40, az: 24, face: -.4, sky: X08.duskSky, tint: '255,120,60,.12', sun: [-40, 6], props: [{ t: 'line', x: 1.8, y: 0, z: 26, x2: 1.8, y2: 2, z2: 26, w: .05, col: '#2c2a30' }, { t: 'glow', x: 1.8, y: 2, z: 26, s: .45, col: '255,180,90' }] }), 0, .7, 24) : Cam({ z: -6, f: 35, ax: lerp(0, 3.6, ease(s.u)), face: .8, sky: ['#7fb8ee', '#fbeed2'], sun: [60, 30] }); return withTl(c, s, { cap: s.i ? 'もう着いた（夕方）' : '朝、出かける' }); } },
  // 顔に寄る→白く光って、色あせた4:3の昔（小さいねこと友だち）→光って今にもどる
  '回想（Flashback）': { dur: 6, fn: t => { const s = seq(t, [1.4, 2.4, 1.2], [0, 2, 0]), fl = .7 * clamp(bump(t, 1.4 / 5, .025) + bump(t, 3.8 / 5, .025)); const c = s.i === 1 ? Cam({ z: -5, f: 35, sx: .85, sq: .85, cats: [[1.2, 0]], sepia: .3, grain: .4, vig: .5, glow: .2, aspect: 4 / 3 }) : X08.face({ z: s.i ? -2 : lerp(-3, -2, s.u) }); c.flash = fl; return withTl(c, s, { cap: ['今：思い出す', 'むかし', '今にもどる'][s.i] }); } },
  // 歩く今の中に、赤い夜の絵が5コマだけ入る→最後に同じ絵が長く出て「あれだ」
  '先取り（フラッシュフォワード）（Flash-forward）': { dur: 5, fn: t => { const s = seq(t, [1.8, .2, 1.6, 1.4], [0, 3, 0, 3]); const c = s.i % 2 ? Cam({ x: .5, z: -3, f: 24, y: .3, pitch: .1, cats: [[1, .8], [-1, 1]], tint: '120,20,30,.4', shake: 1.5 }) : Cam({ z: -7, f: 35, ax: lerp(-2, 1.5, t), ay: Math.abs(Math.sin(t * 40)) * .06 }); return withTl(c, s, { cap: ['今', '？', '今（さっきの何？）', 'あの絵がここで'][s.i] }); } },
  // 1回のジャンプ（火花）を、正面→横の下→上から、毎回頭から見せる
  '重ね編集（同じ瞬間を繰り返す）（Overlapping editing）': { dur: 5, fn: t => { const s = seq(t, [1, 1, 1], [0, 1, 3]), p = seg(s.u, .15, .85); const c = [Cam({ z: -7, f: 32 }), at(Cam({ x: -1.8, y: .3, z: -4.2, f: 35 }), 0, 1, 0), at(Cam({ x: 1.2, y: 4, z: -4, f: 35 }), 0, .5, 0)][s.i]; return withTl(Object.assign(c, { ay: jump(p), part: p > .4 ? { type: 'spark', u: seg(p, .4, 1) } : null }), s, { cap: ['跳ぶ！', '同じ瞬間を横から', 'もう一度、上から'][s.i] }); } },
  // ふつうに見る→5倍の巻きもどし（走査線）→横から50%のスローでもう一度
  'リプレイ（Replay）': { dur: 5, fn: t => { const s = seq(t, [1, .2, 2], [0, 2, 1]), p = s.i === 1 ? 1 - s.u : s.u, A = { ax: lerp(-1.5, 1.5, p), ay: .9 * jump(seg(p, .3, .8)) }; const c = s.i === 2 ? at(Cam(Object.assign({ x: 1.4, y: .5, z: -3.2, f: 30, rate: .5 }, A)), A.ax, .8, 0) : Cam(Object.assign({ z: -7, f: 32, scan: s.i ? .4 : 0, rate: s.i ? -5 : 1 }, A)); return withTl(c, s, { cap: ['ふつうに', '◀◀ 巻きもどし', 'スロー50%・横から'][s.i] }); } },
  // 長い→長い→短い6カット（走る、見る物はいつも真ん中）→また長い
  'テンポの緩急（Pacing）': { dur: 7, fn: t => { const s = seq(t, [5, 4, 1, .8, .7, .8, .7, .9, 6]), fast = s.i >= 2 && s.i <= 7, h = hsh(s.i + 7), ax = fast ? lerp(-2, 2, seg(t, .45, .65)) : s.i < 2 ? lerp(-.6, .3, t * 2) : .6; const c = fast ? at(Cam({ x: (h - .5) * 2.4, y: .3 + h, z: -2.5 - h * 2, f: 28 + h * 20, ax, ay: Math.abs(Math.sin(t * 90)) * .1, shake: 1 }), ax, .6, 0) : Cam({ z: s.i ? -4.5 : -8, f: s.i ? 40 : 28, ax }); return withTl(c, s, { cap: fast ? '速く（見る物は真ん中）' : s.i < 2 ? 'ゆっくり（長いカット）' : 'また長く' }); } },
  // Aが言い終わっても切らずに2.7秒待つ（口が止まり、音も消える＝灰色）→Bの口が動いて答える
  '間（ま）（Pause / Beat）': { dur: 6, fn: t => { const k1 = .3, k2 = .75, b = t >= k2; return Object.assign(b ? camB({ cats: [[1.2, 0, -.75, yap(t)]] }) : camA({ z: lerp(-2.5, -2.2, t), mouth: t < k1 ? yap(t) : 0, eye: t < k1 ? 1 : .8 }), { shot: b ? 2 : 1, tl: { v: [[0, k2, 0], [k2, 1, 1]], a: [[0, k1, 0], [k1, k2, 2], [k2, 1, 1]], t }, cap: t < k1 ? 'Aが言う' : !b ? '…（切らずに待つ）' : 'Bが答える' }); } },
  '切り替えの密度': { ref: 'tempo' },
  // 帯の長さが大事さの割合（51/23/10/7/5/4）。上から順に、その場面の例を見せる
  "マーチの6つの優先順位（Walter Murch's Rule of Six）": { dur: 7, fn: t => { const s = seq(t, [51, 23, 10, 7, 5, 4], [3, 0, 1, 2]); const c = [X08.face({ z: -2, f: 55 }), Cam({ z: -8, f: 28, cats: [[2, 6]] }), Cam({ z: -6, f: 35, ay: .4 * jump(s.u * 3 % 1) }), Cam({ z: -4, f: 40, y: .85, grid: 'center' }), Cam({ x: .8, z: -5, f: 35, grid: 'thirds' }), camM({ axis: true })][s.i]; return withTl(c, s, { cap: ['①気持ち 51%', '②物語 23%', '③リズム 10%', '④視線 7%', '⑤画面の平面 5%', '⑥立体の空間 4%'][s.i] }); } },
  // 下の段（声）は1本のまま、上の段（絵）だけ別の絵（流れる雲の空・箱を積む2匹）に差しかわる
  'Bロール（B-roll）': { dur: 6, fn: t => { const s = seq(t, [1.6, 1.3, 1.3, 1.2], [0, 1, 2, 0]); s.tl.a = [[0, 1, 0]]; const c = [X08.face({ x: .6, z: -2.6, f: 40, mouth: yap(t) }), at(Cam({ y: 2.5, z: 4, f: 24, sun: [30, 30], props: [{ t: 'cloud', x: -8 + 6 * s.u, y: 9, z: 40, s: 5 }, { t: 'cloud', x: 10 + 6 * s.u, y: 11, z: 55, s: 6, a: .8 }] }), 0, 3, 40), at(Cam({ x: -1, y: .6, z: 2, f: 40, cats: [[-.5, 5, .6], [.6, 5.5, -.6]], props: [{ t: 'box', x: .05, z: 5.2, w: .5, h: .4 }, { t: 'box', x: .05, y: .4 + .25 * jump((s.u * 2) % 1), z: 5.2, s: .3, col: '#c9a06a' }] }), 0, .4, 5), X08.face({ x: .6, z: -2.6, f: 40, mouth: yap(t) })][s.i]; return withTl(c, s, { cap: ['話す人（Aロール）', '声のまま別の絵', 'もう1枚（Bロール）', '話す人にもどる'][s.i] }); } },
  // 遠くで火花（出来事）→それを見た顔がびくっとする（2秒）
  'リアクションショット（Reaction shot）※追加': { dur: 4.5, fn: t => { const s = seq(t, [1.4, 2], [2, 0]); const c = s.i ? X08.face({ z: -1.7, eye: lerp(1, 1.6, seg(s.u, 0, .12)), mouth: .85 * seg(s.u, .02, .15), hl: 1, ay: .15 * jump(seg(s.u, 0, .3)), sq: 1 + .12 * bump(s.u, .15, .1), shake: .5 * (1 - s.u) }) : at(Cam({ y: 1, z: 2, f: 35, part: { type: 'spark', u: s.u }, flash: .4 * bump(s.u, .2, .08), shake: 1 }), 0, 1.5, 20); return withTl(c, s, { cap: s.i ? 'それを見た顔' : '出来事' }); } },
  // 96コマの中に、赤い絵を1コマ→4コマだけさしこむ
  'フラッシュカット（Flash cut / Subliminal cut）※追加': { dur: 4, fn: t => { const s = seq(t, [30, 1, 40, 4, 21], [0, 3, 0, 3, 0]); const c = s.i % 2 ? Cam({ noA: true, z: -4, f: 28, crowd: true, tint: '160,20,30,.45' }) : X08.face({ z: lerp(-4, -2.6, t) }); return withTl(c, s, { cap: s.i < 2 ? '' : s.i < 4 ? '何か見えた？（1コマ）' : '4コマなら少し分かる' }); } },
  // 切らずに：寄る→回りこむ→別のねこへ向く。帯は1本のまま
  '切らない（長回し）（Long take）※追加': { dur: 7, fn: t => {
    const K = [[0, 0, .8, -7, 0, .6, 0], [.35, 0, .85, -2.5, 0, .8, 0], [.65, 1.8, .85, -1.2, 0, .7, 0], [1, 1.4, .9, .8, 1.6, .5, 4.5]], j = t < .35 ? 0 : t < .65 ? 1 : 2, u = ease(seg(t, K[j][0], K[j + 1][0])), v = n => lerp(K[j][n], K[j + 1][n], u);
    return at(Cam({ x: v(1), y: v(2), z: v(3), f: 35, cats: [[1.6, 4.5]], tl: { v: [[0, 1, 0]], t }, cap: ['カットなし：寄る', '回りこむ', '別のねこへ'][j] }), v(4), v(5), v(6));
  } },
  // 電話の両側：左＝昼の町のA（右を向く）、右＝夜の青いねこ（左を向く）の窓がすべりこむ。話す方の口が交代で動く
  '分割画面': { dur: 5, fn: t => { const u = ease(seg(t, .1, .4)), a = Math.floor(t * 4) % 2, V = { z: -3.2, f: 35, y: .85 }, R = [{ cam: Cam(Object.assign({ face: .6, mouth: a ? 0 : yap(t) }, V)), x: 0, y: 0, w: 1 - .5 * u, h: 1, frame: 0 }]; if (u > .01) R.push({ cam: Cam(Object.assign({ noA: true, cats: [[0, 0, -.6, a ? yap(t) : 0]], sky: ['#04061a', '#1c2550', '#0d1226'], tint: X08.night }, V)), x: 1 - .5 * u, y: 0, w: .5 * u, h: 1 }); return Cam({ plain: '#111', noA: true, cap: u < .5 ? '' : '同時に2つの場所', pip: R }); } },
  // 代わりの図解：主の絵の右はしに、白枠の窓（相手の顔）を足す。主の絵は止めない
  '小窓（PinP）': { dur: 5, fn: t => { const u = ease(seg(t, .25, .4)); return Cam(Object.assign({ z: -7, f: 32, cap: u <= 0 ? '主の絵' : '止めずに窓を足す', pip: [{ cam: Cam({ z: -2.2, f: 50, y: .85, noA: true, cats: [[0, 0]], tint: '30,45,120,.25' }), x: .96 - .32 * u, y: .08, w: .32 * u, h: .32 * u }] }, X08.run(t * .6, 2.4))); } },
  // 代わりの図解：1つ→2つ→4つの窓（真ん中の十字で4つに分ける）。見てほしい左上を明るく
  '多画面（Multi-screen）': { dur: 6, fn: t => { const n = t < .25 ? 1 : t < .5 ? 2 : 4, j = .3 * jump((t * 4) % 1), S = [Cam({ z: -4, f: 35, y: .85, ay: j }), Cam({ z: -4, f: 35, y: .85, noA: true, cats: [[0, 0]], tint: '30,45,120,.4' }), at(Cam({ x: 2.2, y: 2.2, z: -5, f: 28, ax: lerp(-1, 1, t) }), 0, .5, 0), Cam({ z: -9, f: 85, y: .85, noA: true, crowd: true, tint: '255,150,60,.2' })], R = n === 1 ? [[0, 0, 1, 1]] : n === 2 ? [[0, 0, .5, 1], [.5, 0, .5, 1]] : [[0, 0, .5, .5], [.5, 0, .5, .5], [0, .5, .5, .5], [.5, .5, .5, .5]]; return Cam({ plain: '#111', noA: true, cap: `窓${n}つ（同時に動く）`, pip: R.map((r, i) => ({ cam: S[i], x: r[0], y: r[1], w: r[2], h: r[3] })) }); } },
});
