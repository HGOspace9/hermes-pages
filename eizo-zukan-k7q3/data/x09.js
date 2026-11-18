// 分野09 の追加の図。書き方は ../../FIGURE_API.md
// X09.N: 前の場面（SA）と同じ構図の「夜」。X09.B: ふつうの次の場面。X09.wx(ax,d): 距離dの物の横位置→ワイプの進み
const X09 = {
  N: o => Cam(Object.assign({ z: -4.5, f: 40, y: .8, cats: [[-1.4, 2], [1.3, 3], [-.6, 6]], tint: '30,45,120,.4' }, o)),
  B: o => SB(Object.assign({ x: 1 }, o)),
  wx: (ax, d) => clamp(.5 - ax / d * 40 / 36),
  pk: u => u > 0 && u < 1 ? Math.sin(u * Math.PI) : 0,
  // 2つの色 '#rrggbb' の間の色
  mx: (a, b, u) => '#' + [1, 3, 5].map(i => Math.round(lerp(parseInt(a.substr(i, 2), 16), parseInt(b.substr(i, 2), 16), u)).toString(16).padStart(2, '0')).join(''),
};
XF('09', {
  'フェードイン・アウト（Fade in / Fade out）': { ref: 'fade' },
  'ディゾルブ（重ね）（Dissolve / Cross dissolve）': { ref: 'dissolve' },
  // 同じ位置のねこ（昼・橙）→ねこ（夜・青）へ重ねる。形がそろっているので「変わった」ように見える
  'マッチディゾルブ（Match dissolve）': { dur: 4, fn: t => { const u = ease(seg(t, .3, .7)); return SA({ tr: { B: X09.N({ noA: true, cats: [[0, 0], [-1.4, 2], [1.3, 3]] }), mix: u, u }, cap: u > 0 && u < 1 ? '同じ位置で重ねる' : u ? '昼のねこ→夜のねこ' : '形の位置をそろえる' }); } },
  'ワイプ': { ref: 'wipe' },
  'アイリス（丸く閉じる）（Iris in / Iris out）': { ref: 'iris' },
  // 代わりの図解：中心に十字、右半分（12→6時）→左半分（6→12時）と2段で回る（24コマ）
  '時計ワイプ（Clock wipe）': { dur: 4, fn: t => { const u = seg(t, .3, .72); return SA({ tr: u > 0 ? { B: X09.B(), clip: 'clock', u: ease(u) } : null, cap: '針が中心を一周' }); } },
  '押し出し（Push）': { ref: 'push' },
  // 左上の角からななめの線でめくれ、下の絵（最初は影で暗い）が出る（19コマ）
  'ページめくり（Page turn / Page peel）': { dur: 4, fn: t => { const u = ease(seg(t, .35, .55)); return SA({ tr: u > 0 ? { B: X09.B({ tint: `20,30,80,${(.4 + .3 * (1 - u)).toFixed(2)}` }), clip: 'diag', u } : null, cap: u > 0 && u < 1 ? '角からめくれる' : u ? '下から次の絵' : 'ページの角' }); } },
  'ウィップパン': { ref: 'whip-tr' },
  'ズーム': { ref: 'zoom-tr' },
  // 画面が半回転しながら次へ。回る向きは前後で同じ、真ん中で放射状のぶれ（12コマ）
  'スピン': { dur: 3, fn: t => { const u = seg(t, .38, .62), a = u < .5, s = X09.pk(u); return SA({ roll: a ? Math.PI * ease(u * 2) : 0, streak: s, tr: { B: X09.B({ roll: a ? 0 : -Math.PI * (1 - ease(u * 2 - 1)) }), mix: a ? 0 : 1, u }, cap: '回して入れかえ' }); } },
  // 手前1.3mを太い柱（幅1m）が右→左に横切り画面をほぼおおう。柱の後ろのふちが境目
  '物が横切るワイプ（Wipe-by cut / Natural wipe）': { dur: 3.6, fn: t => { const s = seg(t, .3, .62), cx = lerp(1.9, -1.9, s), P = [{ t: 'box', x: cx, z: -3.2, w: 1, h: 3, col: '#5a4a3a' }], w = X09.wx(cx + .62, 1.3); return SA({ props: P, tr: w > 0 ? { B: X09.N({ props: P }), clip: 'wipe', u: w } : null, cap: '前を横切る柱で' }); } },
  // ねこがレンズへ歩いてきて真っ黒（3コマ）→次は青いねこがレンズから離れていく
  '体で隠す（Body wipe / Block the lens）': { dur: 4, fn: t => t < .5 ? SA({ az: lerp(0, -3.3, ease(seg(t, .1, .5))), black: seg(t, .36, .49), cap: 'レンズに近づく' }) : X09.N({ noA: true, cats: [[0, lerp(-3.3, 0, ease(seg(t, .53, .9)))], [-1.4, 2], [1.3, 3]], black: 1 - ease(seg(t, .53, .7)), cap: '離れて次の場面' }) },
  // 歩くねこの切り抜き（点線）が境目。ねこが通った所から順に夜になる（20コマ）
  'マスクでつなぐ（シームレス）（Masking transition）': { dur: 3.6, fn: t => { const s = ease(seg(t, .3, .7)), ax = lerp(2.4, -2.4, s), ay = Math.abs(Math.sin(s * Math.PI * 6)) * .06, w = X09.wx(ax, 4.5); return SA({ ax, ay, roto: s > 0 && s < 1 ? 1 : 0, tr: w > 0 ? { B: X09.N({ ax, ay }), clip: 'wipe', u: w } : null, cap: 'ぬき型が境目' }); } },
  // 前の絵がぼけきった所で、同じぼけの次の絵へ。そこからピントが戻る（各10コマ）
  'ピンぼけでつなぐ（Focus pull transition / Blur transition）': { dur: 3.4, fn: t => { const u = seg(t, .3, .7), dA = ease(clamp(u * 2)), dB = ease(clamp(2 - u * 2)); return SA({ dof: dA, fd: .3, tr: { B: X09.B({ dof: dB, fd: .3 }), mix: clamp((u - .45) / .1), u }, cap: dA > .5 && dB > .5 ? 'ぼけた所で入れかえ' : '' }); } },
  // 戸（箱）の窓の中に次の場面。カメラが進むと窓が大きくなり、画面いっぱいで向こう側へ
  '通り抜ける（ドア・窓・鍵穴・画面の中へ）（Pass-through transition）※追加': { dur: 4.5, fn: t => { const v = ease(seg(t, .1, .75)), z = lerp(-4.5, 1.2, v), w = .8 / (2 - z); if (v >= 1) return X09.B({ z: lerp(-9, -8.4, seg(t, .75, 1)), cap: '窓の向こうへ抜けた' }); return SA({ z, ax: -1.3, props: [{ t: 'box', x: 0, z: 2, w: 1.4, h: 2.2, col: '#6b4a33' }], pip: [{ cam: X09.B(), x: .5 - w / 2, y: .5 - w / 2, w, h: w, col: '#3b2a1f' }], cap: '戸の窓へ進む' }); } },
  // 白へ0.5秒かけてとび、白を少し置いて、白から次の場面（フラッシュよりゆっくり）
  '白とばし': { dur: 4, fn: t => { const up = seg(t, .25, .5), w = t < .58 ? ease(up) : 1 - ease(seg(t, .58, .8)); return SA({ glow: t < .58 ? .3 * up : 0, tr: { B: X09.B(), mix: t < .54 ? 0 : 1, u: seg(t, .25, .8), white: w }, cap: t > .4 && t < .7 ? '白に包まれて' : '' }); } },
  // とび上がりの途中で1コマで黒。音も同じコマでゼロ。黒を2秒置く
  '黒落ち（Cut to black）': { dur: 5, fn: t => { const snd = { rows: [{ label: '音', amp: x => x < .35 ? .7 : x < .8 ? 0 : .5 }], t }; return t < .35 ? SA({ pitch: -.1, ay: jump(seg(t, .12, .5)), snd }) : t < .8 ? SA({ black: 1, snd, cap: '1コマで真っ黒' }) : X09.B({ snd }); } },
  'フラッシュ': { ref: 'flash-tr' },
  // 橙と赤の光の玉が画面の右上・左下の端から入って広がり、一番強い所で入れかわる（光は切れ目の上に残る）
  '光もれ（Light leak）': { dur: 3.4, fn: t => { const u = seg(t, .3, .7), a = X09.pk(u), L = a > 0 ? [{ t: 'glow', x: lerp(1.9, .3, u), y: 1.2, z: -2, s: .3 + 1.4 * a, col: '255,140,50', a }, { t: 'glow', x: lerp(-1.9, -.5, u), y: .4, z: -2.2, s: .2 + 1 * a, col: '255,70,40', a: .8 * a }] : []; return SA({ glow: .3 * a, grade: { ov: [[`rgba(255,120,40,${(.45 * a).toFixed(2)})`, 'screen']] }, wipe: a > 0 ? 1 : 0, tr: { B: X09.B(), mix: u < .5 ? 0 : 1, u }, top: SA({ plain: 'none', noA: true, props: L }), cap: '端から橙の光' }); } },
  // 傷とちらつき＋橙のむら→真っ白にとんだ2〜3コマで切る（16コマ）
  'フィルムバーン（Film burn）': { dur: 3, fn: t => { const u = seg(t, .38, .62), a = X09.pk(u), fl = .7 + .3 * hsh(Math.floor(t * 60)); return SA({ scratch: a > 0 ? 1 : 0, sepia: .15 * a, grade: { ov: [[`rgba(255,110,30,${(a * fl).toFixed(2)})`, 'screen'], [`rgba(200,30,10,${(.4 * a).toFixed(2)})`, 'multiply']] }, wipe: a > 0 ? 1 : 0, tr: { B: X09.B(), mix: u < .5 ? 0 : 1, u, white: clamp((a - .6) * 2.5) * fl }, cap: '焼けて白く→次へ' }); } },
  // 明るさの順に入れかわる：一番明るい空→山→（暗い）地面とねこ、の順に次の場面（夜）の色へ
  'ルマワイプ': { dur: 4, fn: t => { const u = seg(t, .3, .75), s1 = ease(clamp(u / .45)), s2 = ease(clamp((u - .2) / .45)), m = ease(clamp((u - .5) / .5)), a = X09.pk(u); return SA({ sky: [X09.mx('#9cc3e4', '#6a87b9', s1), X09.mx('#f1e4cc', '#9d9baa', s1), X09.mx('#a5b9c9', '#6f81a9', s2)], grade: { f: `brightness(${(1 + .25 * a).toFixed(2)})` }, wipe: a > 0 ? 1 : 0, tr: { B: X09.B(), mix: m, u }, cap: m > 0 ? '暗い所は最後に' : u > 0 ? '明るい空から先に' : '' }); } },
  // 黒いインクのかたまり（ぼけた雲5つ）が順にふくらんで画面をおおう（38コマ）→その中心から丸く次の場面
  'インクにじみ（Ink bleed / Ink transition）': { dur: 4.5, fn: t => { const I = [[0, .8], [-.5, .55], [.5, 1.05], [.45, .5], [-.45, 1.1]].map(([x, y], j) => ({ t: 'cloud', x, y, z: -2.5, g: ease(seg(t, .12 + j * .05, .5 + j * .04)), col: '#16182a' })).filter(o => o.g > 0).map(o => Object.assign(o, { s: .05 + 1.5 * o.g })), v = ease(seg(t, .52, .9)); return SA({ props: I, dof: .5, fd: 4.5, tr: v > 0 ? { B: X09.B(), clip: 'circle', u: v } : null, cap: v > 0 ? 'にじみの中から次へ' : 'インクが広がる' }); } },
  // 4筆で画面をぬる。1筆9コマ、筆と筆の間に少し間（ワイプはひと息に動く）
  '筆のマスク（Brush stroke mask）': { dur: 4, fn: t => { const u = seg(t, .25, .8) * 4, k = Math.min(3, Math.floor(u)), w = (k + ease(clamp((u - k) / .7))) / 4; return SA({ tr: w > 0 ? { B: X09.B(), clip: 'wipe', u: w } : null, cap: w > 0 && w < 1 ? `筆で${k + 1}本目` : '筆でぬって次へ' }); } },
  // 帯がずれ、走査線が出た10コマの間に入れかえる
  'グリッチ': { dur: 3, fn: t => { const u = seg(t, .43, .57), a = X09.pk(u); return SA({ glitch: 1.2 * a, scan: a > .3 ? .6 : 0, tr: { B: X09.B(), mix: u < .5 ? 0 : 1, u }, cap: '乱れて入れかえ' }); } },
  // 代わりの図解：段々に粗く（ぼけ＋色の段）→一番粗い所で入れかえ→段々に細かく
  'モザイク': { dur: 3.6, fn: t => { const u = seg(t, .25, .75), s = Math.ceil((u < .5 ? u * 2 : 2 - u * 2) * 4) / 4; return SA({ pixel: s > 0 ? [0, 90, 48, 26, 14][s * 4] : 0, tr: { B: X09.B(), mix: u < .5 ? 0 : 1, u }, cap: '粗く→入れかえ→細かく' }); } },
  // 背景は同じまま、橙のねこが横にのびながら、同じ所の青いねこへとけていく
  'モーフ（Morph）': { dur: 4, fn: t => { const u = ease(seg(t, .25, .75)), m = Math.sin(u * Math.PI); return SA({ sx: 1 + .35 * m, sq: 1 - .2 * m, tr: { B: Cam({ z: -4.5, f: 40, y: .8, noA: true, cats: [[0, 0]] }), mix: u, u }, cap: '形がなめらかに変わる' }); } },
  // 切れ目のあと、次の絵の「動き（パン）」だけが前の絵にかかり、どろどろ流れる→遅れて次の絵
  'データモッシュ（Datamosh）': { dur: 4.4, fn: t => { if (t < .35) return SA({ cap: '前の場面' }); const u = seg(t, .35, .85); return SA({ yaw: -.5 * ease(u), hstreak: 1.2 * Math.min(1, u * 3), glitch: .3 * u, trail: [1, 2, 3, 4, 5].map(j => [.25 * j * u, 0, .4 - .06 * j]), tr: { B: X09.B(), mix: ease(seg(u, .7, 1)), u }, cap: '前の絵が流れる' }); } },
  // 代わりの図解：すぼまって閉じた所に星がはねて出て、はね返るように開く
  '形ワイプ': { dur: 4, fn: t => { const u = seg(t, .28, .75); return SA({ tr: u > 0 ? { B: X09.B(), clip: 'star', u: ease(u) * .75 + u * .25 } : null, cap: '星の形が広がって次へ' }); } },
  // 絵が変わる1.2秒前から、次の場面の音（青）が小さく入って大きくなる
  '音の橋わたし（Sound bridge）': { dur: 5, fn: t => { const snd = { rows: [{ label: '前の音', amp: x => x < .6 ? .7 : 0 }, { label: '次の音', col: '#5b86c9', amp: x => x < .36 ? 0 : x < .6 ? .7 * seg(x, .36, .6) : .7 }], t }; return t < .6 ? SA({ pitch: -.12, snd, cap: t > .36 ? '次の音が先に' : '' }) : X09.B({ snd }); } },
  // 前の場面の音の山と、そっくりな形の次の場面の音の山を、切れ目で少し重ねてつなぐ
  '音のマッチ（Match on sound / Sound match cut）': { dur: 4.4, fn: t => { const snd = { rows: [{ label: '前の音', amp: x => x < .53 ? .1 + .8 * bump(x, .45, .03) : 0 }, { label: '次の音', col: '#5b86c9', amp: x => x > .47 ? .1 + .8 * bump(x, .55, .03) : 0 }], t }; return t < .5 ? SA({ pitch: -.12, ay: jump(seg(t, .3, .45)), snd }) : X09.B({ snd, cap: '似た音どうしで' }); } },
  // 速い押し出しに、切れ目が山になる0.5秒の風切り音
  'フーッという風切り音（Whoosh）': { dur: 3, fn: t => { const u = ease(seg(t, .42, .58)), k = X09.pk(u) * 1.2; return SA({ pitch: -.12, hstreak: k, tr: { B: X09.B({ hstreak: k }), clip: 'slide', u }, snd: { rows: [{ label: 'シュッ', amp: x => bump(x, .5, .06), smooth: true }], t }, cap: '切れ目に風切り音' }); } },
  // 前の場面→黒地に「3年後」を2秒→次の場面
  '字幕カード（「3年後」など）（Title card / Intertitle）※追加': { dur: 5, fn: t => t < .3 ? SA() : t < .75 ? SA({ black: 1, text: { type: 'fade', u: clamp(seg(t, .3, .75) * 3), s: '3年後' } }) : X09.B() },
  // 同じ構図のまま、空の色が昼→夕焼け→夜→冬の白へ、雲が速く流れ、青いねこが速く行き来する（早回し）
  '時間の経過を1つの絵で見せる（季節の移り・早回し）（Time-passage transition）※追加': { dur: 6, fn: t => { const k = Math.floor(t * 48) / 48, i = Math.min(3, Math.floor(k * 4)), CC = ['#ffffff', '#f2a27a', '#3a4060', '#f4f6f8']; return SA({ still: true, sun: [lerp(80, -40, k), 44 - 34 * k], sky: [null, ['#2a2f6b', '#f08a5a', '#6a5a7a'], ['#0b1030', '#26305a', '#1e2440'], ['#c9d3df', '#eef1f5', '#dfe5ee']][i], tint: [null, '255,120,50,.18', '20,30,90,.45', '200,210,235,.25'][i], props: [0, 1, 2].map(j => ({ t: 'cloud', x: lerp(-30, 30, (k * 4 + j * .37) % 1), y: 7 + j * 2, z: 40 + j * 8, s: 5 + j, col: CC[i] })), part: i === 3 ? { type: 'snow', u: t * .6 } : null, cats: [[lerp(-4, 4, (k * 6) % 1), 3], [lerp(4, -4, (k * 5 + .3) % 1), 5]], rate: 600, cap: ['昼', '夕方', '夜', '冬'][i] }); } },
});
