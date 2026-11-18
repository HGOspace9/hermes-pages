// 分野01 の追加の図。書き方は ../../FIGURE_API.md
// 顔を画面の真ん中に持ってくる「後から拡大」のずらし量（カメラ z=-7・35mm・16:9 のとき）
const X01 = { fy: -.037, px: x => x / 7 * 35 / 36 };
XF('01', {
  'ズームイン（Zoom in）': { ref: 'zoom-in' },
  'ズームアウト（Zoom out）': { ref: 'zoom-out' },
  // 等速に近い遅いズーム（レンズだけ、1.4倍）。始めと終わりだけ少しゆるい
  'ゆっくりズーム（スローズーム／Slow zoom）': { dur: 7, fn: t => Cam({ f: lerp(35, 50, lerp(t, ease(t), .3)) }) },
  '急ズーム（クラッシュズーム／スナップズーム／Crash zoom）': { ref: 'crash-zoom' },
  // 寄る→止める→少し遅く戻る（1.0→1.4→1.0）。二度見
  'ズームの往復（寄って戻る）': { dur: 2.6, fn: t => { const a = seg(t, .22, .32), b = seg(t, .58, .74); return Cam({ f: 35 * (1 + .4 * ease(a) - .4 * ease(b)), cap: a >= 1 && b <= 0 ? 'ん？' : '' }); } },
  'ドキュメンタリー風の探りズーム（Documentary zoom／Mockumentary zoom）': { ref: 'snap-zoom' },
  // 横移動と同じ曲線・同じ区間でこっそりズーム（28→50mm）
  '移動に隠したズーム（追加）': { dur: 3.5, fn: t => { const e = ease(t); return at(Cam({ x: lerp(-2.2, 2.2, e), f: lerp(28, 50, e) }), 0, .7, 0); } },
  'ドリーイン（プッシュイン／Dolly in, Push in）': { ref: 'dolly-in' },
  'ドリーアウト（プルアウト／Dolly out, Pull out）': { ref: 'dolly-out' },
  'ゆっくり寄り続ける（クリープ／Creep in, Slow push）': { ref: 'creep' },
  // 広角で走って近づく。歩幅の上下ゆれと小さな傾き
  '手持ちで駆け寄る（Handheld rush）': { dur: 2.4, fn: t => { const w = Math.sin(t * Math.PI * 6); return Cam({ z: lerp(-10, -2.2, t), f: 24, y: .9 + .07 * Math.abs(w), roll: .035 * w, shake: 1.2 }); } },
  'ドリーズーム（めまいショット／Dolly zoom, Vertigo effect）': { ref: 'dolly-zoom' },
  // 今ある図の逆向き：下がりながらズームイン。ねこはそのまま、背景が迫ってくる
  '逆ドリーズーム（Reverse dolly zoom）': { dur: 3, fn: t => { const d = lerp(2.5, 8, ease(t)); return Cam({ z: -d, f: 35 * d / 5, cap: t > .3 ? '背景が迫る' : '' }); } },
  'パンチイン（Punch in）': { ref: 'punch-in' },
  '3段寄り（軸上のカット）': { ref: 'axial' },
  // 拍ごとに1.18倍へ跳ねてすぐ戻る（4拍）。下に拍の波
  '拍ズーム': { dur: 3, fn: t => { const w = (t * 4) % 1, k = Math.exp(-7 * w); return Cam({ dz: 1 + .18 * k, oy: X01.fy * k, flash: .25 * Math.exp(-25 * w), snd: { rows: [{ label: '拍', amp: x => Math.exp(-14 * ((x * 4) % 1)) }], t } }); } },
  'ケン・バーンズ（写真にゆっくり寄る／Ken Burns effect）': { ref: 'ken-burns' },
  // スローで寄り（20%）、急に速く（300%）戻る。ねこの跳びも同じ時間で伸び縮み
  '速度つきズーム（スピードランプ／Speed ramp zoom）': { dur: 4, fn: t => { const a = seg(t, 0, .6), b = seg(t, .6, .7), s = b > 0 ? lerp(1.5, 1, ease(b)) : lerp(1, 1.5, ease(a)), fast = b > 0 && b < 1; return Cam({ dz: s, oy: X01.fy * (s - 1) * 2, ay: jump(t < .6 ? a * .55 : .55 + .45 * b), rate: t < .6 ? .2 : fast ? 3 : 1, streak: fast ? .7 : 0, cap: t < .6 ? 'スロー 20%' : fast ? '300%' : '' }); } },
  // 左右に動くねこを画面の真ん中に固定したまま拡大（追跡の印つき）
  '追いかけズーム（顔や物に張りつく／Tracking zoom, Lock-on）': { dur: 4, fn: t => { const ax = 1.4 * Math.sin(t * Math.PI * 2), u = ease(seg(t, 0, .45)); return Cam({ ax, dz: 1 + .8 * u, ox: X01.px(ax) * u, oy: X01.fy * u, track: 1 }); } },
  // 画面の右端にいるねこへ向かって拡大。絵の外が出ないよう中心を内側へ寄せる
  '中心をずらしたズーム（Off-center zoom）': { dur: 2.8, fn: t => { const u = ease(t), dz = 1 + 1.2 * u; return Cam({ ax: 2.2, dz, ox: Math.min(X01.px(2.2) * u, .5 - .5 / dz), oy: Math.max(X01.fy * u, -(.5 - .5 / dz)) }); } },
  // 寄る間だけ放射状のぶれ線を強く（ぶれが主役）
  'ズームぼかし（放射ブラー）': { dur: 2.4, fn: t => { const u = seg(t, .3, .55), on = u > 0 && u < 1; return aimHeadBy(Cam({ f: lerp(30, 60, ease(u)), streak: on ? 1.5 * Math.sin(Math.PI * u) + .3 : 0, cap: on ? '放射ブラー' : '' }), u); } },
  'ズーム転換': { ref: 'zoom-tr' },
  // 顔へ加速して寄り、黒で埋まった瞬間に夜の場面へ。次の絵は黒から引いて始まる
  '物の中へ入るズーム（目・画面・鍵穴）': { dur: 3, fn: t => { if (t < .55) { const u = seg(t, .1, .55); return aimHead(Cam({ f: 35 + 165 * u * u * u, black: seg(t, .42, .55), cap: '目の中へ' })); } const v = seg(t, .55, .85); return SB({ x: 1, dz: lerp(2.5, 1, ease(v)), black: 1 - seg(t, .55, .68), cap: '中が次の場面' }); } },
  // 仕組みの図解：毎回2倍に拡大し、終わりに次の絵（昼と夜を交互）へ溶かす。終わらない
  '無限ズーム（Infinite zoom）': { dur: 6, fn: t => { const k = t * 3, i = Math.floor(k), u = k % 1, S = j => j % 2 ? { tint: '30,45,120,.4', crowd: true } : {}; return Cam(Object.assign({ dz: Math.pow(2, u), oy: X01.fy * u, cap: ['絵A', 'Aの中の絵B', 'Bの中の絵C'][i] || '絵C', tr: { B: Cam(Object.assign({ dz: Math.pow(2, u - 1) }, S(i + 1))), mix: seg(u, .7, 1) } }, S(i))); } },
  // 仕組みの図解：真上の150mから等比で降りる（1段10倍）。字幕で今の縮尺
  '地球から街へ（宇宙ズーム／Cosmic zoom）': { dur: 6, fn: t => { const y = 150 * Math.pow(2 / 150, ease(t)); return at(Cam({ y, z: -2 - y * .25, f: 30, tint: `10,12,40,${(.8 * (1 - seg(t, 0, .4))).toFixed(2)}`, cap: y > 40 ? '宇宙' : y > 8 ? '町' : 'ねこ' }), 0, .6, 0); } },
  // 仕組みの図解：10倍ごとに絵を差し替え、倍率の数字を出す（ねこ→毛→細胞→分子）
  '顕微鏡ズーム（Powers of Ten型）': { dur: 6, fn: t => { const i = cutOf(t, 4), u = (t * 4) % 1, o = [{}, { f: 150 }, { plain: '#e7b49f', noA: true, grain: .9 }, { plain: '#1d2550', noA: true, part: { type: 'spark', u } }][i]; return aimHead(Cam(Object.assign({ dz: 1 + 1.5 * u, cap: ['×1', '×10', '×100', '×1000'][i] }, o))); } },
  // 仕組みの図解：縦長の画面（スマホ）へ寄ると枠が広がって消え、中の映像が本編になる
  '画面の中の画面へ（Screen in screen）': { dur: 3.2, fn: t => { const u = ease(seg(t, .15, .8)); return SB({ x: 1, aspect: u >= 1 ? 0 : lerp(9 / 16, 16 / 9, u), dz: lerp(1, 1.3, u), scan: 1 - seg(t, .6, .85), cap: u < .5 ? 'スマホの画面へ' : '中が本編に' }); } },
  // 仕組みの図解：止まった写真を層に分け、手前（ねこ1.2倍）ほど大きく拡大して視差を出す
  '2.5次元の視差ズーム（写真を層に分ける／Parallax zoom）': { dur: 5, fn: t => { const u = lerp(t, ease(t), .5); return Cam({ still: true, noA: true, dz: lerp(1, 1.05, u), over: Cam({ still: true, plain: 'none', dz: lerp(1, 1.22, u), oy: X01.fy * u, ox: lerp(0, -.02, u) }), cap: '手前ほど大きく拡大' }); } },
  // 3Dでは同じ3倍でも2通り：前半はズーム（レンズ）、後半はドリー（位置）
  '3Dカメラのズーム（3D camera zoom）': { dur: 5, fn: t => { const i = cutOf(t, 2), u = ease(seg((t * 2) % 1, .1, .8)); return i === 0 ? Cam({ f: lerp(24, 72, u), cap: 'ズーム（レンズ）' }) : Cam({ f: 24, z: lerp(-7, -2.33, u), cap: 'ドリー（位置）' }); } },
  // 仕組みの図解：止まった写真を立体に貼り、カメラを少し動かす（本当の視差、しっぽは止まったまま）
  'カメラマップ（カメラプロジェクション／Camera projection）': { dur: 5, fn: t => { const u = ease(t); return at(Cam({ still: true, sepia: .1, x: lerp(-.8, .8, u), z: lerp(-7, -5, u), f: 35, cap: '写真を立体に貼る' }), 0, .7, 0); } },
  // アニメの撮影：画を後から拡大（T.U）
  'T.U（トラックアップ）': { dur: 3, fn: t => { const u = ease(t); return AC({ dz: lerp(1, 1.7, u), oy: X01.fy * 1.4 * u, cap: 'T.U 画を拡大' }); } },
  // T.Uの逆：画を縮めて周りを見せる（T.B）
  'T.B（トラックバック）': { dur: 3, fn: t => { const u = ease(t); return AC({ dz: lerp(1.7, 1, u), oy: X01.fy * 1.4 * (1 - u), cap: 'T.B 画を縮小' }); } },
  // 2〜6コマで一気に拡大、途中だけぶれ線（行きすぎなし）
  'Q.T.U（急な寄り／クイックT.U）': { dur: 2, fn: t => { const u = seg(t, .4, .5), on = u > 0 && u < 1; return AC({ dz: 1 + 1.1 * (1 - Math.pow(1 - u, 3)), oy: X01.fy * 2 * u, streak: on ? 1.3 : 0, cap: u >= 1 ? 'Q.T.U' : '' }); } },
  // 3層を別々の倍率で拡大：奥1.05・ねこ1.15・手前の青ねこ1.3
  '密着マルチの寄り': { dur: 4, fn: t => { const u = ease(t), fg = { plain: 'none', noA: true, cats: [[-1.3, -4.3], [1.4, -4.4]] }; return AC({ noA: true, dz: lerp(1, 1.05, u), over: AC({ plain: 'none', dz: lerp(1, 1.15, u) }), tr: { B: AC(Object.assign({ dz: lerp(1, 1.3, u) }, fg)), mix: 1 }, cap: '手前ほど速く大きく' }); } },
  // 胸から上→顔へ寄って止まり、止まった所で表情が変わる（はっ）。音は少し絞る
  '気づき・決意の寄り': { dur: 4, fn: t => { const u = ease(seg(t, 0, .7)), on = t > .78; return aimHead(Cam({ z: lerp(-4.2, -1.8, u), y: .8, f: 40, sq: on ? 1.06 : 1, cap: on ? 'はっ' : '', snd: { rows: [{ label: '音', amp: x => .8 - .5 * seg(x, .1, .6) }], t } })); } },
  // 下から見上げる顔へ寄る（目に光）→後から、見ていた物（空の光）を見せる
  '驚きの顔への寄り（スピルバーグ・フェイス）（追加）': { dur: 4, fn: t => t < .62 ? aimHead(Cam({ y: .4, z: lerp(-4, -1.8, ease(seg(t, 0, .55))), f: 45, glow: .35, flare: .3, cap: '見上げる顔' })) : at(Cam({ z: -7, y: .8, f: 22, flare: 1, glow: .5, sun: [0, 40], cap: '見ていた物は後で' }), 0, 30, 60) },
  // とても遅い寄り＋低い持続音、暗い色。クリープより暗く、音が鳴り続ける
  '恐怖の寄り': { dur: 7, fn: t => Cam({ z: lerp(-6, -4.6, t), f: 45, tint: '20,25,60,.35', vig: .6, snd: { rows: [{ label: '低い音', col: '#b85c4a', amp: x => .35 + .05 * Math.sin(x * 60) }], t } }) },
  // 3〜6コマで顔へ急ズーム＋効果音、そのあと黙って長く止める
  '笑いの寄り（急ズーム）': { dur: 3, fn: t => { const u = seg(t, .22, .29), on = u > 0 && u < 1; return aimHeadBy(Cam({ f: lerp(30, 110, 1 - Math.pow(1 - u, 3)), streak: on ? 1 : 0, cap: u >= 1 ? '……' : '', snd: { rows: [{ label: '効果音', amp: x => x > .22 && x < .32 ? .9 : 0 }], t } }), u); } },
  // 長く下がって広い場所に小さく残す（高さの1/5以下）、終わってから止めて見せる
  '孤独の引き': { dur: 7, fn: t => { const u = ease(seg(t, 0, .72)); const c = Cam({ z: lerp(-3, -16, u), y: lerp(.8, 1.6, u), f: 35, tint: '40,50,90,.25', cap: t > .75 ? '一人きり' : '' }); c.pitch = Math.atan((.6 - c.y) / -c.z); return c; } },
  // 始めはゆっくり、見せたい物が入る直前から速く引く。囲む青ねこと赤い色が現れる
  '秘密を明かす引き': { dur: 4, fn: t => { const u = t < .55 ? .15 * t / .55 : .15 + .85 * ease(seg(t, .55, .9)), ring = [[-1.3, -.4], [1.3, -.3], [-2, 1], [2, 1.1], [-.8, 1.8], [.8, 2], [-2.3, -1.8], [2.3, -1.9]]; return aimHeadBy(Cam({ z: lerp(-1.6, -11, u), y: lerp(.8, 2, u), f: 45, cats: ring, tint: `170,40,40,${(.25 * seg(t, .6, .9)).toFixed(2)}`, cap: t < .55 ? '何も問題なし' : '実は…' }), 1 - u); } },
  // 仕組みの図解：同じ2倍の寄りを4つの曲線で（等速・なめらか・出だし速い・行きすぎて戻る）
  '寄りの速さの曲線と倍率の計算（追加）': { dur: 7, fn: t => { const s = seq(t, [1, 1, 1, 1], [2, 0, 1, 3]), u = seg(s.u, .1, .75), k = [u, u * u * (3 - 2 * u), 1 - Math.pow(1 - u, 3), 1 + 2.7 * Math.pow(u - 1, 3) + 1.7 * Math.pow(u - 1, 2)][s.i]; return Cam({ dz: 1 + k, oy: X01.fy * 2 * k, tl: s.tl, cap: ['等速＝機械的', 'なめらか＝自然', '出だし速い＝衝撃', '行きすぎて戻る'][s.i] }); } },
});
