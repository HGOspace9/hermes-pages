// 分野11 の追加の図。書き方は ../../FIGURE_API.md
// X11.V: 基本の構図（VB と同じ）。X11.L: 主役だけの層（over 用）。X11.D: 暗いスタジオ（キャプチャの場）
const X11 = {
  V: o => Cam(Object.assign({ z: -4.5, f: 40, y: .8 }, o)),
  L: o => Cam(Object.assign({ z: -4.5, f: 40, y: .8, plain: 'none' }, o)),
  D: '#2a2e35',
  hand: t => at(Cam({ x: .6 * Math.sin(t * 9), y: .8 + .12 * Math.sin(t * 13), z: -4.5, f: 40, shake: 1 }), 0, .5, 0),
  W: '255,150,70,.28',
};
XF('11', {
  'グリーンバック（キー抜き／Chroma key）': { ref: 'chroma' },
  'ロトスコープ（Rotoscoping／手で切り抜き）': { ref: 'roto' },
  // 線で囲む→白黒の型（黒地に主役だけ）→型の外だけ暗く直す（背景は入れかえない）
  'マスク（Mask／Matte）': { dur: 5, fn: t => { const i = cutOf(t, 3); return i === 0 ? X11.V({ roto: seg(t, .05, .3), cap: '範囲を線で決める' }) : X11.V({ noA: true, plain: i === 1 ? '#111' : '', tint: i === 2 ? '10,15,40,.55' : null, over: X11.L(), roto: 1, cap: i === 1 ? '白黒の型（マット）' : '外だけ暗く直す' }); } },
  // 同じ絵に、通常→加算（光と火花を足す）→乗算（暗く重ねる）
  '合成モード（Blend mode）': { dur: 5, fn: t => { const i = cutOf(t, 3), ov = [null, [['rgba(255,150,60,.5)', 'screen']], [['rgba(70,40,110,.6)', 'multiply']]][i]; return X11.V({ pitch: .06, yaw: .1, glow: i === 1 ? .35 : 0, part: i === 1 ? { type: 'spark', u: (t * 3) % 1 } : null, grade: ov ? { ov } : null, cap: ['通常：そのまま重ねる', '加算：明るく足す', '乗算：暗く重ねる'][i] }); } },
  // 1枚の絵が 色・影・奥行き の成分に分かれていて、最後に足し直す
  'レンダーパス（Render passes／AOV）': { dur: 5.6, fn: t => { const i = cutOf(t, 4); return X11.V({ grade: i < 3 ? { f: ['saturate(1.6) contrast(.6) brightness(1.15)', 'grayscale(1) contrast(2.4) brightness(.9)', 'grayscale(1) invert(1) contrast(1.4)'][i] } : null, cap: ['色のパス', '影のパス', '奥行き（Z）のパス', '足して1枚に'][i] }); } },
  // 層を重ねるだけ＝奥のねこが手前の青いねこの上に出る。奥行きで合わせる＝ちゃんと後ろを通る
  'ディープ合成（Deep compositing）': { dur: 6, fn: t => { const s = ease(seg((t % .5) * 2, .1, .9)), ax = lerp(-2, 2, s), C = [[0, -1.2]]; return t < .5 ? X11.V({ noA: true, cats: C, over: X11.L({ ax, az: 1.5 }), cap: '層だけ：前後が逆' }) : X11.V({ ax, az: 1.5, cats: C, cap: '奥行きで正しく重なる' }); } },
  // 手持ちの揺れる絵に、置いた青いねこが すべる（合わせない）→ 床に張り付く（カメラを割り出す）
  'マッチムーブ（Matchmoving／カメラ追跡）': { dur: 6, fn: t => { const c = X11.hand(t), C = [[1.2, .5]]; return t < .5 ? Object.assign(c, { over: at(X11.L({ noA: true, cats: C }), 0, .5, 0), cap: '合わせない：すべる' }) : Object.assign(c, { cats: C, cap: 'カメラを割り出し張り付く' }); } },
  // 代わりの図解：カメラが回りこみ、面（顔）が向きを変えても、四角い印と貼った物がついていく
  '平面トラッキング（Planar tracking）': { dur: 5, fn: t => { const a = Math.sin(t * 6.283) * .42; return at(X11.V({ x: Math.sin(a) * 4, z: -Math.cos(a) * 4, sx: .8 + .2 * Math.cos(a * 3), roll: a * .08, track: 1, cap: t < .5 ? '面の模様ごと追う' : '面に絵を貼る' }), 0, .6, 0); } },
  // 同じ横移動：前半はガタガタ、後半はなめらか（はみ出しを隠すため少し拡大）
  '手ブレ補正（Stabilization）': { dur: 5, fn: t => { const on = t >= .5; return at(X11.V({ x: lerp(-1, 1, t), z: -5, shake: on ? 0 : 3, dz: on ? 1.12 : 1, cap: on ? '補正後：少し拡大' : '補正前：ゆれる' }), 0, .6, 0); } },
  // 縦長の画面（緑＋十字の目印）→中身がはまる→薄い反射を戻す
  '画面の差し替え（Screen replacement）': { dur: 5, fn: t => { const u = ease(seg(t, .3, .65)), r = t > .75; return Cam({ aspect: 9 / 16, z: -4.5, f: 40, y: .8, plain: '#2fbf4a', noA: true, grid: t < .3 ? 'center' : '', tr: { B: SB({ x: 1 }), clip: 'wipe', u }, grade: r ? { ov: [['rgba(255,255,255,.14)', 'screen']] } : null, cap: t < .3 ? '画面は緑で撮る' : r ? '反射を戻して完成' : '中身をはめる' }); } },
  // 見上げた絵：白く飛んだ空→線が通ったあとは夕焼けの空（地面も空の色に合わせる）
  '空の差し替え（Sky replacement）': { dur: 5, fn: t => { const u = ease(seg(t, .35, .75)), S = o => X11.V(Object.assign({ pitch: .22, y: .6 }, o)); return S({ grade: { f: 'brightness(1.45) contrast(.75)' }, tr: { B: S({ sun: [40, 8], tint: '255,110,50,.3' }), clip: 'wipe', u }, flare: u > .9 ? .3 : 0, cap: u < .5 ? '空が白く飛んだ' : '夕焼けの空に' }); } },
  // 灰色の前で撮った手前の主役→奥に描いた町と山（絵らしい色）を敷き、ゆっくり寄る
  'デジタルの背景画（Digital matte painting）': { dur: 5, fn: t => { const c = o => at(Cam(Object.assign({ y: 1.6, z: lerp(-9, -8, t), f: 24 }, o)), 0, 1.2, 8); return t < .35 ? c({ plain: '#8a8f96', cap: '実写は手前だけ' }) : c({ noA: true, sepia: .18, tint: '255,190,140,.15', over: c({ plain: 'none' }), cap: '奥に描いた絵を敷く' }); } },
  // 低いセット（無地）から見上げると、上と奥の柱・建物・空がCGで足されていく
  'セットの延長（Set extension）': { dur: 5, fn: t => { const u = ease(seg(t, .2, .8)), m = seg(t, .35, .65), c = o => Cam(Object.assign({ z: -6, y: .6, f: 28, pitch: lerp(0, .35, u), cats: [[-1.3, 1], [1.4, 1.5]] }, o)); return c({ plain: '#cdc5b3', tr: { B: c({}), mix: m, u: m }, cap: m < .5 ? '本物は下だけ' : '上と奥をCGで足す' }); } },
  // 誰もいない実写→置いただけ（足が浮く）→床を踏んで、同じ光の中で動く
  'CGキャラクター（CG character）': { dur: 6, fn: t => { const i = cutOf(t, 3), h = jump((t * 3) % 1) * .4, B = { z: -5.5, f: 35, cats: [[1.6, 1.5]] }; return i === 0 ? X11.V(Object.assign({ noA: true, cap: '実写：だれもいない' }, B)) : i === 1 ? X11.V(Object.assign({ noA: true, over: X11.L(Object.assign({ ay: .25 }, B)), cap: '足が浮くとばれる' }, B)) : X11.V(Object.assign({ ay: h, sq: h < .05 ? .88 : 1, tint: '255,190,120,.12', cap: '床を踏み、光を合わせる' }, B)); } },
  // 本人が歩く→危ない大ジャンプの間だけ半透明の写し（ぶれの中）→着地からまた本人
  'デジタルダブル（Digital double）': { dur: 5, fn: t => { const i = t < .35 ? 0 : t < .7 ? 1 : 2, u = seg(t, .35, .7), c = X11.V({ z: -6.5, f: 30, ax: i === 0 ? lerp(-2.2, -1.2, seg(t, 0, .35)) : i === 1 ? lerp(-1.2, 1.5, u) : 1.5, ay: i === 1 ? jump(u) * 1.6 : 0 }); return Object.assign(c, i === 1 ? { noA: true, trail: [[0, 0, .55]], hstreak: .25, cap: '危ない所だけCGの写し' } : { cap: i ? '着地からまた本人' : '本人が演じる' }); } },
  // 上から見た24匹：前半は全員同じ動き（ばれる）、後半は一人ずつ速さ・始まりをずらす
  '群衆（Crowd simulation）': { dur: 6, fn: t => { const sy = t < .5, u = (t * 2) % 1, cats = []; for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) { const i = r * 6 + k, ph = sy ? 0 : hsh(i) * 6.28, sp = sy ? 1 : .7 + hsh(i + 40) * .6, a = u * 6.28 * sp + ph; cats.push([-2.5 + k + .3 * Math.sin(a) + (sy ? 0 : (hsh(i + 9) - .5) * .4), 1 + r * 1.6 + .2 * Math.cos(a)]); } return at(Cam({ y: 4.5, z: -6, f: 30, noA: true, cats, cap: sy ? '全員同じ＝ばれる' : '一人ずつずらす' }), 0, 0, 4); } },
  // 火：ねこの足もとから火の粉が上がり、暖色で光る → 煙：灰色が広がって奥がかすむ
  '粒子（火・煙・水／Particles・Fluid simulation）': { dur: 6, fn: t => { const u = seg(t, .5, .9); return t < .5 ? X11.V({ part: { type: 'spark', u: (t * 4) % 1 }, glow: .35, tint: '20,10,10,.4', grade: { ov: [['rgba(255,120,40,.35)', 'screen']] }, cap: '火：粒を上へ散らす' }) : X11.V({ dof: .6 * u, tint: `150,150,155,${(.55 * u).toFixed(2)}`, cap: '煙：流れでかすむ' }); } },
  // かたまりが割れて、大きなかけら（青いねこ）が飛ぶ→小さな破片→ほこり、の3段。衝撃で揺れる
  '破壊（Destruction／Rigid body）': { dur: 5, fn: t => { const u = seg(t, .2, 1), e = 1 - Math.pow(1 - u, 2), cats = [0, 1, 2, 3, 4, 5].map(j => { const a = j / 6 * 6.283 + .3; return [Math.cos(a) * e * 2.6, 3 + Math.sin(a) * e * 1.5]; }); return at(X11.V({ z: -6, y: 1.2, noA: true, cats, shake: u > 0 ? 4 * Math.exp(-u * 5) : 0, part: u > .1 && u < .7 ? { type: 'spark', u: seg(u, .1, .7) } : null, tint: `150,130,110,${(.45 * seg(u, .4, 1)).toFixed(2)}`, cap: u < .1 ? 'ひとかたまり' : u < .4 ? '大きなかけら' : u < .7 ? '小さな破片' : 'ほこりを足す' }), 0, .4, 3); } },
  // 3回、1〜2コマだけ白く暖かく光る（周りも明るくなる）。下の帯で光ったコマ
  '銃口の光（Muzzle flash）': { dur: 3, fn: t => { const F = [18, 19, 40, 41, 58], on = F.includes(Math.floor(t * 72)); return X11.V({ flash: on ? .35 : 0, glow: on ? .4 : 0, grade: on ? { ov: [['rgba(255,150,60,.35)', 'screen']] } : null, snd: { rows: [{ label: '光', amp: x => F.some(f => Math.abs(x * 72 - f - .5) < 1) ? 1 : 0 }], t }, cap: '1〜2コマだけ光る' }); } },
  // 晴れ→雨の粒→色を青く・霧で奥をかすませる→稲妻
  '天気（Weather FX）': { dur: 6, fn: t => { const i = cutOf(t, 4), u = (t * 3) % 1, fl = (t > .82 && t < .84) || (t > .9 && t < .91); return X11.V({ part: i > 0 ? { type: 'rain', u } : null, grade: i > 1 ? { f: 'saturate(.55) brightness(.92)', ov: [['rgba(70,95,140,.35)', 'soft-light']] } : null, tint: i > 1 ? '150,165,185,.25' : null, dof: i > 1 ? .3 : 0, flash: i === 3 && fl ? .5 : 0, cap: ['晴れの素材', '雨の粒を足す', '青く・霧で遠く', '稲妻を光らせる'][i] }); } },
  // 代わりの図解：宙に浮くねこの真ん中に白い縦線（吊りの綱）→背景で埋めて消える
  'ワイヤー消し（Wire removal）': { dur: 5, fn: t => { const ay = .7 + .08 * Math.sin(t * 12), u = ease(seg(t, .4, .8)), W = { z: -7, y: 1.4 }; return X11.V({ z: -7, y: 1.4, ay, props: [{ t: 'line', x: 0, y: ay + 1.15, z: 0, x2: 0, y2: 9, z2: 0, w: .04, col: '#22252b' }], tr: u > 0 ? { B: X11.V({ z: -7, y: 1.4, ay }), clip: 'wipe', u } : null, cap: u >= 1 ? '綱を消した' : u > 0 ? '1コマずつ消していく' : '吊りの綱が見える' }); } },
  // 奥を通りがかる青いねこ（映り込み）。線が通った所から、何も無い背景で埋まる
  'ごみ消し（Cleanup／Paint-out）': { dur: 5, fn: t => { const s = (t * 1.3) % 1, w = ease(seg(t, .4, .75)); return X11.V({ cats: [[lerp(-3, 3, s), 4]], tr: { B: X11.V({}), clip: 'wipe', u: w }, cap: w < .05 ? '通りがかりが映る' : w > .95 ? 'きれいな背景で埋めた' : '何も無いコマで消す' }); } },
  // 顔の寄り。線の左だけ色のむらをならす（粒＝毛穴は両方に残す）
  '肌の修正（Beauty work／Digital makeup）': { dur: 4, fn: t => Object.assign(aimHead(Cam({ z: -3.2, f: 85, y: .85 })), { grain: .3, grade: { f: 'contrast(.85) brightness(1.06) saturate(.92) blur(.6px)', ov: [['rgba(255,200,190,.12)', 'soft-light']] }, wipe: ease(seg(t, .15, .7)), cap: '色のむらだけならす' }) },
  // 今の顔（くすんだ色）→顔を追いかける→少し小さく丸い、明るい若い顔へ
  '若返り（De-aging）': { dur: 5, fn: t => { const i = cutOf(t, 3); return Object.assign(aimHead(Cam({ z: -3.5, f: 70, y: .8 })), { sepia: i < 2 ? .15 : 0, grade: { f: i < 2 ? 'saturate(.7) contrast(.9)' : 'saturate(1.25) brightness(1.06)' }, track: i === 1 ? 1 : 0, sq: i === 2 ? .9 : 1, sx: i === 2 ? .92 : 1, cap: ['今の顔', '顔を追いかける', '若い顔に直す'][i] }); } },
  // 代わりの図解：代役の体（色うすい）→顔の向きを追う→顔の輪郭を囲んで別の顔を貼る
  '顔の差し替え（Face replacement）': { dur: 5, fn: t => { const i = cutOf(t, 3); return Object.assign(aimHead(Cam({ z: -3.6, f: 70, y: .8, ax: .15 * Math.sin(t * 6.283) })), { grade: i < 2 ? { f: 'saturate(.25) brightness(.9)' } : null, track: i >= 1 ? 1 : 0, roto: i === 2 ? 1 : 0, cap: ['代役の体で撮る', '顔の向きを追う', '別の顔を貼る'][i] }); } },
  // 暗いスタジオ：印をつけた役者（橙）の動きを、少し遅れてCGの体（青）がまねる
  'モーションキャプチャ（Motion capture）': { dur: 5, fn: t => { const m = Math.sin(t * 12.566), hop = Math.abs(m); return Cam({ z: -6, f: 32, y: .9, plain: X11.D, ax: -1.4 + .5 * m, ay: hop * .25, sq: 1 - .1 * hop, track: 1, cats: [[1.4 + .5 * Math.sin((t - .03) * 12.566), 0]], cap: '体の動きをCGへ写す' }); } },
  // 相手役と同じ場で演じ、体・顔・声の3本を同時に記録
  '演技キャプチャ（Performance capture）': { dur: 5, fn: t => { const m = Math.sin(t * 9.42); return Cam({ z: -5.5, f: 32, y: .9, plain: X11.D, ax: -.8 + .3 * m, ay: Math.abs(m) * .12, track: 1, cats: [[1.2, .5]], snd: { rows: [{ label: '体', amp: x => .4 + .4 * Math.abs(Math.sin(x * 9.42)) }, { label: '顔', amp: x => .3 + .5 * bump(x, .4, .08) + .5 * bump(x, .75, .06) }, { label: '声', amp: x => (x > .15 && x < .5) || (x > .6 && x < .9) ? .8 : .05 }], t }, cap: '体・顔・声を一緒に' }); } },
  // 顔の寄りに印。口の開き・まばたきが数字の波になる
  '顔のキャプチャ（Facial capture）': { dur: 4, fn: t => Object.assign(aimHead(Cam({ z: -3, f: 85, y: .85, plain: X11.D, sq: 1 + .04 * Math.sin(t * 18.85), track: 1 })), { snd: { rows: [{ label: '口', amp: x => .5 + .5 * Math.sin(x * 18.85), smooth: true }, { label: '目', amp: x => bump(x, .3, .03) + bump(x, .7, .03), smooth: true }], t }, cap: '表情を数字にする' }) },
  'バレットタイム（Bullet time）': { ref: 'bullet' },
  // 橙のねこが横にゆがみながら、同じ位置の青いねこへ溶けていく
  'モーフィング（Morphing）': { dur: 4, fn: t => { const u = ease(seg(t, .25, .75)), w = Math.sin(u * Math.PI); return X11.V({ sx: 1 + .35 * w, sq: 1 - .2 * w, tr: { B: X11.V({ noA: true, cats: [[0, 0]] }), mix: u, u }, cap: u > 0 && u < 1 ? '形をゆがめて溶かす' : u ? '別の姿に' : '元の姿' }); } },
  '1人2役（分身／Twinning・Split screen）': { ref: 'twin' },
  // 止めた1枚の写真を2層に切り、手前（ねこ）は大きく、奥は少しだけずらす
  '2.5次元の視差（Parallax／2.5D）': { dur: 5, fn: t => { const s = ease(t) * 2 - 1; return X11.V({ noA: true, still: true, sepia: .15, ox: .02 * s, over: X11.L({ still: true, ox: .09 * s }), cap: '手前は大きく、奥は少し' }); } },
  // 写真の中へカメラが入っていく（本当の遠近）→回りすぎると絵が伸びてにじむ
  'カメラ投影（Camera projection／Camera mapping）': { dur: 5, fn: t => { const u = ease(seg(t, .05, .6)), v = seg(t, .65, 1); return at(Cam({ x: lerp(0, .8, u) + v * 1.2, y: .8, z: lerp(-7, -4.8, u), f: 35, still: true, sepia: .12, sx: 1 + .5 * v, grade: v > 0 ? { f: `blur(${(v * 2).toFixed(1)}px)` } : null, cap: v > 0 ? '回りすぎると伸びる' : '写真の中へ入る' }), 0, .7, 0); } },
  // 左目・右目の絵を交互に（近い物ほど大きくずれる）→2つを重ねると近い物だけ二重
  '立体視（Stereoscopic 3D）': { dur: 5, fn: t => { const C = [[1.3, -1.5]]; if (t < .45) { const L = Math.floor(t * 14) % 2 === 0; return X11.V({ x: L ? -.15 : .15, cats: C, cap: L ? '左目の絵' : '右目の絵' }); } return X11.V({ x: -.15, cats: C, over: X11.L({ x: .15, cats: C }), cap: '近い物ほどずれる' }); } },
  // 文を打つ→ざらざら・ぼやけた所から、夕日を歩くねこの数秒が出てくる
  'AIの動画生成（Generative video）': { dur: 6, fn: t => { if (t < .4) return Cam({ z: -5, f: 30, y: .85, noA: true, tint: '20,22,26,.85', text: { type: 'type', u: seg(t, .05, .35), s: '夕日を歩くねこ', k: .8 }, cap: '文を入れる' }); const u = seg(t, .4, .8); return X11.V({ ax: lerp(-1, 1, seg(t, .4, 1)), ay: Math.abs(Math.sin(t * 40)) * .05, sun: [50, 10], tint: '255,130,60,.25', dof: .9 * (1 - u), fd: .3, grain: 1 - u * .8, cap: '数秒の動画が出る' }); } },
  // 切り抜きの線が一瞬で全部引かれる（手で1コマずつではない）→いらない青ねこが消えて跡が埋まる
  'AIの切り抜き・穴埋め（AI matting／Inpainting）': { dur: 5, fn: t => { const C = [[1.5, 2]]; if (t < .5) { const on = t > .15; return X11.V({ cats: C, roto: on ? 1 : 0, cap: on ? 'AIが一瞬で切り抜く' : '緑の幕なし' }); } const m = ease(seg(t, .6, .8)); return X11.V({ cats: C, tr: { B: X11.V({}), mix: m, u: m }, cap: m < .5 ? 'いらない物を消す' : '跡を自然に埋める' }); } },
  // 6コマ/秒のカクカク→前後のコマ（うすい影）の間に新しい絵を作る→なめらか
  'コマの補間（Frame interpolation）': { dur: 6, fn: t => { const i = cutOf(t, 3), u = (t * 3) % 1, k = i === 0 ? Math.floor(u * 6) / 6 : i === 1 ? 5 / 12 : u, d = 4 / 6 / 2; return TC({ ax: lerp(-2, 2, k), trail: i === 1 ? [[-d, 0, .35], [d, 0, .35]] : null, still: i === 1, fps: i === 0 ? 6 : 24, rate: 1, cap: ['元：カクカク', '前後から間の絵', '間を足してなめらか'][i] }); } },
  // 拡大した顔：ぼやけた絵→線が通った所からくっきり
  '高画質化（Upscaling／Super resolution）': { dur: 4.5, fn: t => { const w = ease(seg(t, .35, .75)), c = o => aimHead(Cam(Object.assign({ z: -4.5, f: 40, y: .8, dz: 1.6 }, o))); return c({ dof: 1, fd: .25, tr: { B: c({}), clip: 'wipe', u: w }, cap: w < .5 ? '小さい絵を拡大' : 'AIで細部を足す' }); } },
  // まわりから何十枚も撮る（パシャ）→ぼんやりした粒から形が出て、高さも向きも自由に飛ぶ
  'NeRF・ガウシアンスプラット（NeRF／3D Gaussian Splatting）': { dur: 6, fn: t => { if (t < .4) { const k = Math.floor(t * 20), a = k / 8 * 3.1416 - 1.5; return at(Cam({ x: Math.sin(a) * 3, z: -Math.cos(a) * 3, y: .8 + hsh(k) * .6, f: 35, still: true, flash: (t * 20) % 1 < .25 ? .3 : 0, cap: '何十枚も撮る' }), 0, .5, 0); } const u = seg(t, .4, 1), a = lerp(-1.2, 1.3, ease(u)); return at(Cam({ x: Math.sin(a) * 3, z: -Math.cos(a) * 3, y: lerp(2.5, .6, u) + .6 * Math.sin(u * 6), f: 28, dof: .7 * (1 - seg(u, 0, .35)), fd: 3, cap: '中を自由に飛ぶ' }), 0, .5, 0); } },
  // 上から：カメラ（青）の輪で囲む→動き続ける役者の周りを、どの角度からでも
  '立体の撮影（Volumetric capture）': { dur: 6, fn: t => { if (t < .35) return at(Cam({ y: 6, z: -4, f: 30, plain: X11.D, cats: [0, 1, 2, 3, 4, 5, 6, 7].map(j => [1.8 * Math.cos(j * .785), 1.8 * Math.sin(j * .785)]), ay: jump((t * 3) % 1) * .3, cap: 'まわりをカメラで囲む' }), 0, 0, 0); const a = seg(t, .35, 1) * 6.283; return at(Cam({ x: Math.sin(a) * 3.5, z: -Math.cos(a) * 3.5, y: 1.1, f: 32, plain: X11.D, ay: jump((t * 4) % 1) * .4, cap: '動いたまま好きな角度' }), 0, .5, 0); } },
  // 置いただけ（主役だけ色がちがい、くっきり浮く）→色・粒・ぼけを背景にそろえる
  'なじませ（Integration：色・粒・ぶれ・ライトラップ）': { dur: 5, fn: t => t < .5 ? X11.V({ noA: true, tint: X11.W, dof: .25, fd: 4.5, over: X11.L({}), cap: '置いただけ：浮く' }) : X11.V({ tint: X11.W, grain: .45, dof: .25, fd: 4.5, glow: .1, cap: '色・粒・ぼけをそろえる' }) },
  // まわりの写真（背景の色）を変えると、ねこに当たる光の色と向きも同じに変わる
  'HDRIで光を写す（Image-based lighting）': { dur: 6, fn: t => { const i = cutOf(t, 3); return LC(Object.assign([{ bgc: [180, 205, 235], bgl: .5, amb: .1, L: [KEY({ az: -40, el: 50 }), { az: 60, el: 30, p: .4, soft: 1, col: [150, 180, 255] }] }, { bgc: [255, 150, 80], bgl: .45, amb: .06, L: [KEY({ az: -80, el: 8, col: [255, 150, 70] }), { az: 60, el: 30, p: .2, soft: 1, col: [120, 140, 220] }] }, { bgc: [60, 70, 140], bgl: .3, amb: .03, L: [{ az: 70, el: 10, p: .8, soft: .6, col: [255, 80, 160] }, { az: -60, el: 20, p: .6, soft: .5, col: [80, 160, 255] }] }][i], { cap: ['昼の写真で照らす', '夕方の写真で', '夜の町の写真で'][i] })); } },
  // 灰色の仮の絵で3カットの長さと撮り方を決める（下に帯）→色のついた本番
  'プリビズ（Previsualization／事前の動画コンテ）': { dur: 6, fn: t => { const s = seq(t, [1, 1, 1, 1.4], [2, 2, 2, 0]), P = s.i < 3, c = [() => Cam({ z: -9, f: 24, y: 2, pitch: -.1 }), () => aimHead(Cam({ x: -1.2, z: -3, f: 50, y: .6 })), () => Cam({ z: -6, f: 35, y: .4, ay: jump(s.u) })][P ? s.i : 2](); return Object.assign(c, { grade: P ? { f: 'grayscale(1) contrast(.75) brightness(1.1)' } : null, tint: P ? null : '255,150,70,.15', tl: s.tl, cap: P ? '箱人形で仮の動画' : '見て決めて本番' }); } },
});
