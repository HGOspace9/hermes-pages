// 分野03 の追加の図。書き方は ../../FIGURE_API.md
// ねこは高さ約1.2m（体0〜0.66、頭の中心0.85、目0.88、耳の先1.22）。画面の縦に写る高さ＝距離×20.25÷焦点距離
// X03.yaw(p, f)：真正面の物を画面の横 p（0=左端、1=右端）に置くためのカメラの向き
const X03 = { yaw: (p, f) => -Math.atan((p - .5) * 36 / f) };
XF('03', {
  // 20mmで32m先から。ねこは画面の高さの4%ほど、ゆっくり降りる
  '超ロングショット（Extreme Long Shot / ELS、遠景）': { dur: 4, fn: t => at(Cam({ z: -32, y: lerp(5, 3, ease(t)), f: 20, cap: '人は豆つぶ' }), 0, 1.5, 6) },
  // ねこが画面の高さの3分の1ほど。跳ねながら横へ動き、場所との関係が分かる
  'ロングショット（Long Shot / LS）': { dur: 3.6, fn: t => at(Cam({ z: -6, y: 1.1, f: 35, ax: lerp(-1.6, 1.6, ease(t)), ay: .25 * jump((t * 4) % 1), cap: '全身と場所' }), 0, .9, 0) },
  // 50mmで胸の高さから3.7mまで下がり、頭の上と足の下に少しあきを残して止まる
  'フルショット（Full Shot / FS）': { dur: 3.4, fn: t => { const u = ease(seg(t, .1, .7)); return at(Cam({ z: lerp(-2.3, -3.7, u), y: .7, f: 50, cap: u > .9 ? '頭から足まで' : '' }), 0, .62, 0); } },
  // 少し低い位置から足元→ひざ上へティルトして止まる（西部劇の立ち姿）
  'カウボーイショット（Cowboy Shot、ひざ上）【足した技法】': { dur: 3.4, fn: t => { const u = ease(seg(t, .1, .7)); return at(Cam({ z: -2.85, y: .55, f: 50, cap: u > .9 ? 'ひざから上' : '' }), 0, lerp(.35, .77, u), 0); } },
  // 腰から上。話しているように小さく体がゆれる（いちばんふつうの大きさ）
  'ミディアムショット（Medium Shot / MS）': { dur: 3.4, fn: t => at(Cam({ z: lerp(-2.7, -2.4, ease(t)), y: .85, f: 50, sq: 1 + .015 * Math.sin(t * 40), cap: '腰から上（基準）' }), 0, .83, 0) },
  // 同じ大きさで下の切れ目だけ比べる：関節ちょうど × → ベルトの少し下 ○
  'ウエストショット（Waist Shot）': { dur: 4, fn: t => { const i = cutOf(t, 2); return at(Cam({ z: -2.4, y: .85, f: 50, cap: ['腰骨ちょうど ×', 'ベルトの少し下 ○'][i] }), 0, [.9, .8][i], 0); } },
  // 60mmでミディアムから胸の上まで寄って止まる
  'バストショット（Bust Shot / Medium Close-Up）': { dur: 3.4, fn: t => at(Cam({ z: lerp(-2.8, -2.2, ease(seg(t, .1, .7))), y: .9, f: 60, cap: '胸から上' }), 0, .86, 0) },
  // 2.3mから望遠へズーム（60→85mm）して顔で画面を埋める。背景はぼかす
  'クローズアップ（Close-Up / CU）': { dur: 3.4, fn: t => at(Cam({ z: -2.3, y: .88, f: lerp(60, 85, ease(seg(t, .1, .7))), dof: .6, fd: 2.3, cap: '顔でいっぱい' }), 0, .88, 0) },
  // 1.4m離れたまま200mmまでズームして目だけにする（写る高さ約14cm）
  '超クローズアップ（Extreme Close-Up / ECU）': { dur: 3.4, fn: t => at(Cam({ z: -1.4, y: .88, f: lerp(85, 200, ease(seg(t, .1, .65))), dof: .4, fd: 1.4, cap: '目だけ' }), 0, .88, 0) },
  // ねこ→柱の飾りだけのアップ（1秒ほど）→ねこ。物だけを見せる
  'インサート（Insert、物のアップ）': { dur: 4, fn: t => { const s = seq(t, [1.2, 1, 1.2], [0, 2, 0]); return withTl(s.i === 1 ? at(Cam({ x: 1, y: 2.6, z: -1, f: 135 }), 3.2, 3.3, 3) : at(Cam({ z: -2.6, y: .85, f: 45 }), 0, .8, 0), s, { cap: ['見ている', 'インサート（物だけ）', '続き'][s.i] }); } },
  // 高い所から夕方の町をゆっくり横に流して見せ、それから人物へ
  'エスタブリッシングショット（Establishing Shot、場所の紹介）': { dur: 5, fn: t => { const s = seq(t, [2.2, 1], [1, 0]); return withTl(s.i ? at(Cam({ z: -3, y: .85, f: 45, tint: '255,170,90,.12' }), 0, .8, 0) : at(Cam({ x: lerp(-1.5, 1.5, s.u), y: 7, z: -24, f: 22, tint: '255,170,90,.15' }), 0, 2, 25), s, { cap: s.i ? 'それから人物' : '場所と時刻（夕方）' }); } },
  // 2人と場所が全部入る引きの画が土台。寄りを挟んでもまた引きへ戻る
  'マスターショット（Master Shot）': { dur: 5, fn: t => { const s = seq(t, [1.6, 1, 1.6], [0, 1, 0]); return withTl(s.i === 1 ? camA() : camM({ z: -7.5, f: 26 }), s, { cap: ['マスター（全員と場所）', '寄りを挟む', '迷ったら引きへ'][s.i] }); } },
  // 2人いる場面から、相手を入れない1人だけの画へ
  'シングル（Single）': { dur: 4, fn: t => { const s = seq(t, [1, 1.4], [0, 1]); return withTl(s.i ? camA({ f: 50 }) : camM(), s, { cap: s.i ? 'シングル（1人だけ）' : '2人いる' }); } },
  // 相手（青）の肩が画面の右端に1割ほどぼけて入ってくる。主役は左の3分の1
  'ダーティシングル（Dirty Single）【足した技法】': { dur: 3.4, fn: t => { const u = ease(seg(t, .1, .6)), c = Cam(Object.assign({ x: 1.7, y: .95, z: -3.5, f: 40, dof: .9, fd: 4.55 }, TALK)); c.yaw = lerp(-.62, -.525, u); c.pitch = -.033; c.cap = u > .9 ? '相手が端に少しだけ' : ''; return c; } },
  // 横並びの2人のすき間がせばまる（近いほど仲が近い）→前後に置く形
  'ツーショット（Two Shot）': { dur: 5, fn: t => { const i = cutOf(t, 2), u = ease(seg(t, .08, .42)); return at(Cam(i ? { z: -6.5, y: 1, f: 35, ax: -.6, az: -1.5, cats: [[.9, 2.5]], cap: '前後に置く' } : { z: -6.5, y: 1, f: 35, ax: lerp(-1.6, -.45, u), cats: [[lerp(1.6, .45, u), 0]], cap: '近いほど仲が近い' }), 0, .7, 0); } },
  // 3人の置き方：横一列（平等）→三角形（前の頂点の人が中心）
  'スリーショット（Three Shot）': { dur: 5, fn: t => { const i = cutOf(t, 2); return at(Cam(Object.assign({ z: -6.5, y: 1.4, f: 35 }, i ? { az: -1.3, cats: [[-1.3, 1.3], [1.3, 1.3]], cap: '三角＝頂点が中心' } : { cats: [[-1.4, 0], [1.4, 0]], cap: '横一列＝平等' })), 0, .6, 0); } },
  '肩ごし（Over The Shoulder / OTS）': { ref: 'ots' },
  '切り返し（Shot / Reverse Shot）': { ref: 'reverse' },
  '主観ショット（Point of View / POV）': { ref: 'pov' },
  // 見ている青いねこの顔を先に→出来事（オレンジが跳ぶ）→もう一度顔へ少し寄る
  'リアクションショット（Reaction Shot）': { dur: 5, fn: t => { const s = seq(t, [1.3, 1.2, 1.3], [0, 2, 0]), B = [[2, 3]]; return withTl(s.i === 1 ? at(Cam({ z: -6, y: 1, f: 30, cats: B, ay: jump(s.u) }), 0, .8, 1) : at(Cam({ x: 1.6, y: .95, z: -1.5, f: 85, cats: [[2, 3, s.i ? 0 : -.8, s.i ? .8 * seg(s.u, 0, .15) : 0]], dz: s.i ? lerp(1, 1.12, ease(seg(s.u, 0, .3))) : 1 }), 2, .85, 3), s, { cap: ['先に見ている顔', '出来事', 'その反応'][s.i] }); } },
  // 上から降りてきて、目の高さ（0.88m）・傾き0で止まる。地平線が目を通る
  '目の高さ（Eye Level）': { dur: 3.4, fn: t => { const u = ease(seg(t, .1, .7)); return Cam({ z: -3.2, y: lerp(1.7, .88, u), f: 45, pitch: lerp(-.25, 0, u), cap: u > .9 ? '目と同じ高さ・水平' : '' }); } },
  'ローアングル（Low Angle）': { ref: 'low' },
  'ハイアングル（High Angle）': { ref: 'high' },
  // 上がりながら真下へ向いていく（pitch -1.3まで）。大勢が模様のように見える
  '俯瞰（真上）（Overhead / Bird\'s-Eye View / God\'s Eye）': { dur: 4, fn: t => { const u = ease(t), y = lerp(1.6, 9, u), p = lerp(.35, 1.3, u); return Cam({ y, z: -(y - .3) / Math.tan(p), f: 28, pitch: -p, crowd: true, cap: u > .8 ? '真上から（神の目）' : '' }); } },
  // 地面（0.1m）に置いた16mmの広角を真上近く（約63度）まで上へ向ける。柱が中へ倒れこむ
  'あおり（真下から）（Worm\'s-Eye View）': { dur: 3.4, fn: t => { const u = ease(seg(t, .1, .75)); return Cam({ z: -1.3, y: .1, f: 16, pitch: lerp(.25, 1.1, u), cap: u > .9 ? '真下から見上げる' : '' }); } },
  'ダッチアングル（Dutch Angle / Canted Angle、斜め）': { ref: 'dutch' },
  // 決闘の2人。目の高さから腰の高さ（0.45m）へ下がり、水平のまま止まる
  '腰の高さ（Hip Level）': { dur: 3.6, fn: t => { const u = ease(seg(t, .1, .6)); return Cam({ z: -5, y: lerp(.88, .45, u), f: 35, ax: -1.6, cats: [[1.6, 0]], pitch: 0, cap: u > .9 ? '腰の高さ・水平' : '' }); } },
  // 高さ0.12mで走るねこを追う。地面の線と柱が速く流れる
  '地面すれすれ（Ground Level）': { dur: 3, fn: t => Cam({ z: lerp(-14, -3.2, t), y: .12, f: 24, pitch: .05, az: lerp(-8, 2.4, t), ay: .15 * jump((t * 6) % 1), cap: '低いほど地面が速い' }) },
  // ローアングル（見上げ）と比べる：畳の高さは0.4mで水平・50mm・動かさない
  '畳の高さ（小津のローポジション / Tatami Shot）': { dur: 4.4, fn: t => cutOf(t, 2) ? Cam({ z: -3.6, y: .4, f: 50, pitch: 0, still: true, cap: '畳の高さ＝低く水平' }) : at(Cam({ z: -2.6, y: .12, f: 26, cap: 'ローアングル＝見上げ' }), 0, .8, 0) },
  '三分割（Rule of Thirds）': { ref: 'thirds' },
  // 横にずれた位置から真正面へ動き、左右の青いねこと柱がぴたりと対称になる
  '中心構図・シンメトリー（Center Framing / Symmetry）': { dur: 3.6, fn: t => { const u = ease(seg(t, .1, .7)); return at(Cam({ x: lerp(1.3, 0, u), z: -6, y: .9, f: 30, cats: [[-1.5, 1.2], [1.5, 1.2]], grid: 'center', cap: u > .9 ? 'ど真ん中・左右対称' : 'ずれている' }), 0, .7, 0); } },
  '一点透視（One-Point Perspective）': { ref: 'center' },
  // まっすぐ正面（静か）→斜め上から、道の線が角から角へ。ねこも斜めに走る
  '対角線構図（Diagonal Composition）': { dur: 4.4, fn: t => { const i = cutOf(t, 2), u = seg(t, .5, 1); return i ? at(Cam({ x: -4.5, y: 4.5, z: -6, f: 30, az: lerp(-2, 3, u), ay: .2 * jump((u * 4) % 1), cap: '斜めの線＝勢い' }), 0, .4, .5) : at(Cam({ z: -6, y: 1, f: 30, cap: 'まっすぐ＝静か' }), 0, .6, 0); } },
  // 道のふち・柱の列が、遠くのオレンジのねこへ集まる。まわりに青いねこ（ごちゃごちゃ）
  '導線（Leading Lines）': { dur: 4, fn: t => at(Cam({ x: .9, y: .55, z: lerp(-7, -5.5, ease(t)), f: 28, az: 14, cats: [[-2.6, 2], [2.6, 5.5], [-2.5, 9.5], [2.7, 12.5], [-2.6, 17]], cap: '線の先に主役' }), 0, .7, 14) },
  // 下がると、手前の柱2本が左右のふちに入り、ねこを囲む枠になる（ふちを暗く）
  '額縁（Frame within a Frame）': { dur: 3.6, fn: t => { const u = ease(seg(t, .05, .7)); return Cam({ z: lerp(-12.5, -16.5, u), y: 1, f: 35, pitch: .02, vig: .7 * u, cap: u > .9 ? '柱の枠で囲む' : '' }); } },
  // 層が1つ（紙のよう）→手前の青いねこ・真ん中のねこ・奥の町。横に動くと層ごとにずれる
  '前景・中景・背景の層（Foreground / Middleground / Background）': { dur: 5, fn: t => { const s = seq(t, [1, 1.6], [2, 0]); return withTl(s.i ? at(Cam({ x: lerp(.6, -.4, ease(s.u)), z: -6, y: .85, f: 40, cats: [[-.7, -3.8]], dof: .5, fd: 6 }), 0, .75, 0) : Cam({ z: -6, y: .8, f: 40, plain: '#cdc5b3', still: true }), s, { cap: s.i ? '手前・真ん中・奥' : '層が1つ＝紙みたい' }); } },
  // 上へ向いていき、空が画面の大部分に。ねこは右下の隅に小さく残る
  'ネガティブスペース（Negative Space、余白）': { dur: 4, fn: t => { const u = ease(seg(t, .1, .75)); return Cam({ z: -9, y: .3, f: 24, ax: 2.2, yaw: -.18, pitch: lerp(0, .38, u), cap: u > .9 ? '空が大部分' : '' }); } },
  // 右へ進むねこを左の3分の1に置いて追う（進む先が空く）。目は上の線
  'ヘッドルームとリードルーム（Headroom / Lead Room）': { dur: 3.6, fn: t => { const ax = lerp(-2, 2, t); return Cam({ x: ax, z: -5, y: .7, f: 35, ax, ay: .12 * jump((t * 5) % 1), yaw: X03.yaw(1 / 3, 35), pitch: -.06, grid: 'thirds', cap: '進む先を空ける' }); } },
  // 同じく右へ進むのに右端へ寄せる（進む先が狭く、背中側が広い）
  'ショートサイディング（Short-Siding）【足した技法】': { dur: 4, fn: t => { const ax = lerp(-2, 2, t); return Cam({ x: ax, z: -5, y: .7, f: 35, ax, ay: .12 * jump((t * 5) % 1), yaw: X03.yaw(.84, 35), pitch: -.06, vig: .35, cap: '進む先が狭い' }); } },
  // 三分割の線（33%）から黄金比の位置（38%）へ、少し中央寄りに動く
  '黄金比（Golden Ratio）': { dur: 4, fn: t => Cam({ z: -4.2, y: .95, f: 35, yaw: lerp(X03.yaw(1 / 3, 35), X03.yaw(.382, 35), ease(seg(t, .4, .6))), grid: 'thirds', cap: t < .5 ? '三分割 33%' : '黄金比 38%（少し中へ）' }) },
  // 手前1.5mの青いねこと8m奥のねこ、両方くっきり。奥で出来事（跳ぶ）
  '奥行きの演出（ディープステージング / Deep Staging）': { dur: 4, fn: t => at(Cam({ z: -6, y: 1.1, f: 22, cats: [[-.6, -4.6]], ax: .6, az: 2, ay: .8 * jump(seg(t, .45, .75)), cap: t < .45 ? '手前も奥もくっきり' : '奥で事件が起きる' }), 0, .8, 0) },
  'シルエット（Silhouette）': { ref: 'silhouette' },
  // 足元を画面の真ん中にし、上下さかさまのうすい写しを下に重ねる（水面の映り）
  '鏡・反射（Mirror / Reflection）': { dur: 4, fn: t => { const o = { z: -7, y: lerp(.95, .7, ease(t)), f: 35 }; return at(Cam(Object.assign({ cap: '水面に映るもう1人', over: at(Cam(Object.assign({ plain: 'none', roll: Math.PI, noA: true, trail: [[0, 0, .4]] }, o)), 0, 0, 0) }, o)), 0, 0, 0); } },
  // カメラは動かさず、話の変わり目ごとにねこが立ち位置を変える（奥→近づく→手前の真ん中）
  'ブロッキング（Blocking、人の配置と動き）': { dur: 5, fn: t => { const s = seq(t, [1, 1, 1], [0, 1, 2]), P = [[-1.6, 3], [-.5, .5], [.4, -2]], a = P[Math.max(0, s.i - 1)], b = P[s.i], u = ease(seg(s.u, 0, .5)); return withTl(at(Cam({ z: -8, y: 1.6, f: 30, ax: lerp(a[0], b[0], u), az: lerp(a[1], b[1], u), cats: [[1.4, 1]] }), 0, .5, 0), s, { cap: ['奥に立つ（弱い）', '近づく', '手前の真ん中（強い）'][s.i] }); } },
  // 田の字の線。オレンジは左上のマス（奥）、青は右下のマス（手前）
  '四分割の使い分け（クアドラント / Quadrant Framing）【足した技法】': { dur: 4, fn: t => at(Cam({ z: lerp(-6.5, -6, ease(t)), y: 2.6, f: 35, ax: -1.5, az: 4, cats: [[1.3, -1.5]], grid: 'center', cap: '別々のマスにいる' }), 0, .4, 1) },
  // 見上げられた方が強く、見下ろされた方が弱い。後半で上下が入れかわる（逆転）
  '力関係（上下）': { dur: 6, fn: t => { const s = seq(t, [1, 1, 1, 1], [0, 1, 0, 1]), low = s.i === 0 || s.i === 3, A = s.i % 2 === 0, c = Cam(Object.assign({ x: A ? 1 : -1, y: low ? .2 : 2.4, z: -2.4, f: 35 }, TALK)); return withTl(at(c, A ? -1.2 : 1.2, low ? .9 : .5, 0), s, { cap: ['A 見上げ＝強い', 'B 見下ろし＝弱い', 'A 見下ろし（逆転）', 'B 見上げ（逆転）'][s.i] }); } },
  // 青いねこの群れから離れて1人。引いて上がるほど離れているのが分かる
  '孤立（余白）': { dur: 5, fn: t => { const u = ease(seg(t, .05, .8)); return at(Cam({ z: lerp(-5, -11, u), y: lerp(1, 2.2, u), f: 30, ax: 1.8, cats: [[-1.8, 3], [-1.2, 3.6], [-2.2, 4.3], [-1.5, 4.9], [-.9, 4.1], [-2, 5.6]], tint: '40,50,90,.15', cap: u > .8 ? 'みんなと離れて1人' : '' }), 0, .5, 2); } },
  // 水平でゆるい画から、傾き・望遠で詰める・黒帯でせまくする・ふちを暗く、を重ねる
  '緊張（傾き・狭さ）': { dur: 4.4, fn: t => { const u = ease(seg(t, .1, .8)); return aimHead(Cam({ z: lerp(-4.5, -3, u), f: lerp(35, 85, u), y: .85, roll: .28 * u, aspect: u > 0 ? lerp(16 / 9 + .002, 2.39, u) : 0, vig: .6 * u, cap: u < .5 ? 'ゆるい・水平' : '傾き＋狭さ' })); } },
  // 手前でねこが跳ねて目を引く間に、奥の右隅へ小さな青いねこが歩いて入ってくる
  '伏線（画面の隅）': { dur: 4.4, fn: t => Cam({ z: -5, y: .9, f: 35, pitch: -.02, ax: -.6, ay: .6 * jump((t * 3) % 1), cats: [[lerp(13, 8.5, ease(seg(t, .15, .7))), 16]], cap: t > .78 ? '隅に手がかり' : '' }) },
});
