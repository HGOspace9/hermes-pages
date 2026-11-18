// 分野04 の追加の図。書き方は ../../FIGURE_API.md
// 主役だけを上に重ねる時の、同じカメラを2回作る道具（下の絵と上のねこをぴったり重ねる）
const X04 = { two: (base, top) => Cam(Object.assign({}, base, top || {}, { over: Cam(Object.assign({}, base, { plain: 'none', noA: false })) })) };
XF('04', {
  // 50mmで遠くから→16mmで近くへ寄る。ねこは大きくなり、背景は遠く小さく流れる
  '広角レンズ（Wide-Angle、ゆがみ・広さ）': { dur: 4, fn: t => t < .4 ? Cam({ z: -5, f: 50, y: .8, cap: '50mm' }) : aimHead(Cam({ z: lerp(-2.6, -1.2, ease(seg(t, .45, .95))), f: 16, y: .7, cap: '16mm・近くから' })) },
  // 50mmのまま、ねこが歩いてくる。ゆがみも圧縮もない「見たまま」
  '標準レンズ（Normal Lens）': { dur: 4, fn: t => Cam({ z: -5, f: 50, y: .85, az: lerp(1, -1, t), cap: '50mm・目で見たまま' }) },
  // 200mmで30m先から。ねこが4m走っても、ほとんど大きくならない
  '望遠レンズ（Telephoto、圧縮）': { dur: 4, fn: t => { const az = lerp(0, -4, t); return Cam({ z: -30, f: 200, y: .8, az, ay: .15 * Math.abs(Math.sin(t * Math.PI * 8)), dof: .5, fd: 30 + az, cap: '走っても近づかない' }); } },
  // 魚眼の代わり：14mmで1.2mまで寄り、丸い穴と周辺の暗さで「丸い画」に
  '魚眼レンズ（Fisheye）': { dur: 4, fn: t => at(Cam({ x: lerp(-.6, .6, ease(t)), z: -1.2, y: .9, f: 14, iris: .8, vig: .4, cap: '魚眼の代わり：14mm' }), 0, .7, 0) },
  // 0.85mまで寄って顔が画面いっぱい。ピントは紙1枚、背景はとろける
  'マクロレンズ（Macro）': { dur: 4, fn: t => { const c = aimHead(Cam({ z: lerp(-1.8, -.85, ease(seg(t, 0, .7))), y: .85, f: 100, dof: 1 })); c.fd = -c.z; c.cap = 'ピントは紙1枚'; return c; } },
  // 低い広角カメラが、2匹の青いねこのすき間を抜けて進む。手前から奥まで全部くっきり
  'プローブレンズ（Probe Lens）': { dur: 4, fn: t => at(Cam({ z: lerp(-6, -1.6, ease(t)), y: .3, f: 20, cats: [[-1.1, -3.5], [1.1, -3.2]], cap: '低く・すき間を抜ける' }), 0, .5, 0) },
  // ふつう→横長2.39＋光のすじ＋少し青いかすみ（横長のぼけ・青い横すじは字幕で）
  'アナモルフィックレンズ（Anamorphic）': { dur: 4, fn: t => { const on = t > .4, u = ease(seg(t, .4, .7)); return Cam({ z: -5, f: 35, y: .7, yaw: .15, pitch: .08, dof: .5, fd: 5, aspect: on ? lerp(16 / 9 + .002, 2.39, u) : 0, flare: on ? .65 * u : 0, grade: on ? { ov: [[`rgba(60,120,255,${(.14 * u).toFixed(2)})`, 'screen']] } : null, cap: on ? '横長・青いすじ' : 'ふつうのレンズ' }); } },
  'ティルトシフトレンズ（Tilt-Shift、ミニチュア風）': { ref: 'tiltshift' },
  // 左半分は手前の青いねこに、右半分は奥のねこにピント。真ん中の線がつなぎ目
  'スプリットディオプター（Split Diopter）': { dur: 4.4, fn: t => { const B = { y: .8, z: -6, f: 50, ax: .8, cats: [[-.5, -3.8]], dof: 1 }; return t < .4 ? Cam(Object.assign({ fd: 2.2, cap: 'ふつう：片方だけ' }, B)) : Cam(Object.assign({ fd: 2.2, cap: '両方くっきり', tr: { B: Cam(Object.assign({ fd: 6 }, B)), clip: 'wipe', u: .5 } }, B)); } },
  // 周りはぼけて放射状に流れ、くっきりの点（ねこ）だけが左右に動く
  'レンズベビー（Lensbaby）': { dur: 5, fn: t => { const ax = .9 * Math.sin(t * Math.PI * 2), roll = .03 * Math.sin(t * Math.PI * 4); return X04.two({ z: -5, f: 50, y: .8, ax, roll }, { noA: true, dof: 1, fd: .6, streak: .25, vig: .5, cap: '一点だけ合う' }); } },
  // ピントがふらふら前後し、ときどき橙の光漏れがさっと入る
  'フリーレンズ（Freelensing / Lens Whacking、外して振る）': { dur: 5, fn: t => { const a = .5 * bump(t, .35, .05) + .4 * bump(t, .78, .04); return Cam({ z: -5, f: 50, y: .8, dof: 1, fd: 5 * (1 + .35 * Math.sin(t * Math.PI * 3)), roll: .05 * Math.sin(t * Math.PI * 2), grade: { ov: [[`rgba(255,140,50,${a.toFixed(2)})`, 'screen']] }, cap: '外して振る・光漏れ' }); } },
  // ねこはそのまま、ぼけた周りだけがゆっくり回る（うず）。古い色と周辺の暗さ
  'オールドレンズ・改造レンズ（ぐるぐるボケ / Swirly Bokeh）【足した技法】': { dur: 5, fn: t => { const roll = .06 * Math.sin(t * Math.PI * 2); return Cam({ z: -4.5, f: 58, y: .8, noA: true, dof: .8, fd: 4.5, roll, vig: .5, grade: { f: 'sepia(.25) contrast(.95)' }, over: Cam({ plain: 'none', z: -4.5, f: 58, y: .8 }), cap: 'ふちがうずを巻く' }); } },
  // 代わりの図解：真ん中（ねこ）だけ大きく＝樽型、周りだけ大きく＝糸巻き型
  '歪曲収差（Lens Distortion、樽型・糸巻き型）【足した技法】': { dur: 6, fn: t => { const i = cutOf(t, 3), k = [0, .15, -.12][i] * ease(seg((t * 3) % 1, .1, .6)), B = { z: -3, f: 24, y: .8 }; return Cam(Object.assign({ noA: true, dz: 1 + Math.max(0, -k), over: Cam(Object.assign({ plain: 'none', dz: 1 + Math.max(0, k) }, B)), cap: ['ゆがみなし', '樽型：真ん中ふくらむ', '糸巻き型：真ん中へこむ'][i] }, B)); } },
  '浅い被写界深度（Shallow Depth of Field）': { ref: 'shallow' },
  // 広角で、手前の青いねこにも奥のねこにもピント。開放（奥だけ）→絞る（全部）
  'パンフォーカス（Deep Focus）': { dur: 4, fn: t => { const u = ease(seg(t, .3, .7)); return Cam({ z: -6, y: .8, f: 28, ax: .4, az: 3, cats: [[-.7, -4.2]], dof: 1 - u, fd: 9, cap: u < .5 ? 'F2（奥だけ）' : 'F11（全部くっきり）' }); } },
  'ラックフォーカス（Rack Focus / Pull Focus、ピント送り）': { ref: 'rack' },
  // 顔のアップ。ピントは合ったまま、光だけがふんわりにじむ
  'ソフトフォーカス（Soft Focus）': { dur: 4, fn: t => { const on = t > .45; return aimHead(Cam({ z: -2.5, f: 50, y: .85, glow: on ? .55 : 0, grade: on ? { ov: [['rgba(255,235,225,.14)', 'screen']] } : null, cap: on ? 'ふんわり（合ったまま）' : 'ふつう' })); } },
  // 全部ぼけたまま→ゆっくりピントが合う（目覚め）
  'わざとピンぼけ（Intentional Defocus）': { dur: 4, fn: t => { const u = ease(seg(t, .45, .85)); return Cam({ z: -5, f: 50, y: .8, dof: 1, fd: lerp(.4, 5, u), cap: u < 1 ? 'わざとぼかす' : '目覚め：合う' }); } },
  // 代わりの図解：夜に浮かぶ光の粒をにじませて「玉ぼけ」に。形の違いは字幕で
  'ボケの形（Bokeh Shape）': { dur: 6, fn: t => { const i = cutOf(t, 3); return aimHead(Cam({ z: -2.5, f: 85, y: .85, dof: 1, fd: 2.5, tint: '20,25,60,.5', part: { type: 'snow', u: t * .4 }, glow: .5, aspect: i === 2 ? 2.39 : 0, cap: ['丸い玉ぼけ', '羽根の数で角ばる', '横長レンズは楕円'][i] })); } },
  // ラックフォーカスと同じ送りで、画面の広さが少し変わる（三分割の線と比べる）
  'フォーカスブリージング（Focus Breathing）【足した技法】': { dur: 3.6, fn: t => { const u = ease(seg(t, .3, .7)); return Cam({ x: .35, y: .8, z: -6, f: 50, cats: [[-.45, -3.5]], dof: 1, fd: lerp(2.5, 6, u), dz: 1 + .05 * u, grid: 'thirds', cap: 'ピントで画角も動く' }); } },
  'レンズフレア（Lens Flare）': { ref: 'flare' },
  // カメラは止めて太陽だけ動かす。光の玉は画面の真ん中をはさんで反対へ動く
  'ゴースト（Ghosting）': { dur: 4, fn: t => Cam({ z: -5, f: 24, y: .7, yaw: .2, pitch: .15, sun: [lerp(35, 85, ease(t)), 44], flare: .7, grid: 'center', cap: '玉は反対側へ動く' }) },
  '周辺減光': { ref: 'vignette' },
  // 代わりの図解：少し大きい赤い絵を重ね、端ほど色がずれる（衝撃でふくらむ）
  '色収差': { dur: 4, fn: t => { const u = t < .4 ? 0 : 1 - .6 * seg(t, .45, .9), B = { z: -4.5, f: 30, y: .8 }; return Cam(Object.assign({ tint: u ? '0,190,255,.1' : null, tr: { B: Cam(Object.assign({ dz: 1 + .03 * u, tint: '255,40,90,.3' }, B)), mix: .4 * u }, cap: u ? '端で色がずれる' : 'ふつう' }, B)); } },
  // 逆光の明るい空のふちに、赤橙のにじみ（フィルムの粒も少し）
  'ハレーション（Halation）': { dur: 4, fn: t => { const u = ease(seg(t, .3, .7)); return Cam({ z: -5, f: 28, y: .6, yaw: .22, pitch: .14, glow: .4 * u, grain: .3 * u, grade: { ov: [[`rgba(255,70,30,${(.3 * u).toFixed(2)})`, 'overlay']] }, cap: u < .5 ? 'ふつう' : '光のふちが赤い' }); } },
  // 低い所から太陽の方を見上げ、明るい空が白くあふれて輪郭をとかす
  'ブルーミング（Blooming）': { dur: 4, fn: t => { const u = ease(seg(t, .2, .75)); return Cam({ z: -4, f: 24, y: .35, yaw: .2, pitch: .2, glow: .5 * u, cap: u < .5 ? 'ふつう' : '白くあふれる' }); } },
  // 昼の外：F16は全部くっきり／F1.4だけだと白とび／ND＋F1.4でぼけてちょうど
  'NDフィルター（Neutral Density）': { dur: 6, fn: t => { const i = cutOf(t, 3); return Cam({ z: -4, f: 70, y: .8, dof: i ? 1 : 0, fd: 4, flash: i === 1 ? .55 : 0, cap: ['F16：全部くっきり', 'F1.4だけ：白とび', 'ND＋F1.4：ちょうど'][i] }); } },
  // 左からPLをかける。空の青と色が濃く、少し暗く（反射が消えるのは字幕で）
  '偏光フィルター（Polarizer / PL）': { dur: 4, fn: t => Cam({ z: -5, f: 24, y: .6, pitch: .12, grade: { f: 'saturate(1.6) contrast(1.1) brightness(.92)', ov: [['rgba(40,90,200,.18)', 'multiply']] }, wipe: ease(seg(t, .12, .7)), cap: 'PL：空が濃く' }) },
  // 顔のアップに、ミストを弱→強。明暗の差が下がり、黒が浮き、光がにじむ
  '拡散フィルター（Diffusion / ミスト）': { dur: 5, fn: t => { const u = ease(seg(t, .1, .85)); return aimHead(Cam({ z: -2.8, f: 45, y: .85, glow: .3 * u, grade: { f: `contrast(${(1 - .22 * u).toFixed(2)})`, ov: [[`rgba(80,80,90,${(.18 * u).toFixed(2)})`, 'lighten']] }, cap: u < .1 ? 'ミストなし' : u < .6 ? 'ミスト 1/4' : 'ミスト 1' })); } },
  // 代わりの図解：太陽を真ん中に置き、光からすじを伸ばす（本当は十字）
  'スターフィルター（Star / Cross Filter、十字の光）': { dur: 4, fn: t => { const u = ease(seg(t, .2, .7)); return at(Cam({ z: -5, f: 35, y: .7, glow: .4 * u, flare: .3 * u, streak: .9 * u, cap: '光からすじが伸びる' }), 59, 44, 220); } },
  // レンズの前に色ガラス（掛け算で色がのる）：なし／黄／青
  '色フィルター（Color Filter）': { dur: 6, fn: t => { const i = cutOf(t, 3); return Cam({ z: -4.6, f: 32, y: .85, grade: i ? { ov: [[i === 1 ? 'rgb(255,200,90)' : 'rgb(130,170,255)', 'multiply']] } : null, cap: ['フィルターなし', '黄：暑い・砂', '青：寒い・夜'][i] }); } },
  // ねこはくっきり残し、周りだけ横に流れてにじむ
  'ワセリン塗り（Vaseline on Lens）': { dur: 4, fn: t => { const u = ease(seg(t, .15, .6)); return X04.two({ z: -4, f: 40, y: .8 }, { noA: true, hstreak: .6 * u, glow: .3 * u, vig: .3 * u, cap: u < .5 ? 'ふつう' : 'ふちだけ流れる' }); } },
});
