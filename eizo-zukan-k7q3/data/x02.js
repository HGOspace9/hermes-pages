// 分野02 の追加の図。書き方は ../../FIGURE_API.md
// 手伝い：ねこAが歩くときの小さな上下（u=0〜1、n歩）
const X02 = { bob: (u, n, h) => Math.abs(Math.sin(u * Math.PI * n)) * (h || .06) };
XF('02', {
  'パン（Pan）': { ref: 'pan' },
  'ティルト（Tilt）': { ref: 'tilt' },
  'ロール（ダッチロール／Roll）': { ref: 'roll' },
  'ウィップパン': { ref: 'whip' },
  // カメラは動かず首だけで横切るねこを追う。少し遅れて、進む先を広く空ける
  'つけパン（人を追う／Follow pan）': { dur: 4, fn: t => { const ax = lerp(-2.6, 2.6, t), lag = lerp(-2.6, 2.6, Math.max(0, t - .05)); return Cam({ z: -8, f: 50, ax, ay: X02.bob(t, 14), yaw: Math.atan2(lag + .9, 8), cap: '進む先を空ける' }); } },
  // 台車で前へ進んで止まり、また後ろへ下がる（向きもレンズも変えない）
  'ドリー（Dolly）': { dur: 5, fn: t => { const u = ease(seg(t, 0, .45)), v = ease(seg(t, .55, 1)); return Cam({ z: -9 + 5 * u - 5 * v, f: 35, cap: t < .5 ? '台車で前へ' : '台車で後ろへ' }); } },
  'トラック（横移動／Tracking shot, Truck）': { ref: 'truck' },
  // 向きは水平のまま高さだけ上がる（中心の十字が地平線の上にずっと水平）
  'ペデスタル（上下／Pedestal, Boom up/down）': { dur: 3.4, fn: t => Cam({ z: -9, f: 28, y: lerp(.4, 2, ease(t)), grid: 'center', cap: '向きは水平のまま' }) },
  // 高い所から大きな弧で降りてきて、ねこに向け続ける（等速に近い）
  'クレーン・ジブ（Crane, Jib）': { dur: 6, fn: t => { const u = lerp(t, ease(t), .4), a = u * Math.PI / 2; return at(Cam({ x: .4, z: -3.5 - 6.5 * Math.cos(a), y: .8 + 4.6 * Math.cos(a), f: 30 }), 0, .7, 0); } },
  'アーク（回り込み／Arc shot）': { ref: 'arc' },
  // 半径2.5mで1周、ねこを見続ける
  '360度まわり込み（360 arc, Hero shot）': { dur: 7, fn: t => { const a = t * Math.PI * 2; return at(Cam({ x: Math.sin(a) * 2.5, z: -Math.cos(a) * 2.5, y: .9, f: 24, cap: '1周まわる' }), 0, .65, 0); } },
  'フォロー（後ろから／Follow shot）': { ref: 'follow' },
  // 歩いてくるねこの前を、同じ距離のまま後ろ向きに下がる
  'リード（前から引く／Leading shot）': { dur: 4, fn: t => { const az = lerp(6, -6, t); return at(Cam({ az, ay: X02.bob(t, 14), z: az - 3.2, y: .8, f: 35, cap: '前を下がって映す' }), 0, .7, az); } },
  // 走るねこの真横を同じ速さで（背景の柱が速く流れる）
  '横並走（Side tracking）': { dur: 3, fn: t => { const az = lerp(-8, 10, t); return at(Cam({ az, ay: X02.bob(t, 18, .1), x: 2.6, z: az, y: .7, f: 24, hstreak: .12 }), 0, .6, az); } },
  // 画面はまったく動かず、ねこだけが跳ぶ
  '三脚の固定（Tripod, Locked-off）': { dur: 3, fn: t => Cam({ ay: jump(seg(t, .3, .7)), grid: 'thirds', cap: '三脚で固定' }) },
  '手持ち（Handheld）': { ref: 'handheld' },
  'ステディカム（Steadicam）': { ref: 'steadicam' },
  // 前へ進む。回転の揺れは0、歩みの小さな上下（1秒に2回）だけ残る
  'ジンバル（Gimbal）': { dur: 4, fn: t => Cam({ z: lerp(-11, -4, t), f: 30, y: .8 + X02.bob(t, 8, .03), cap: '歩みの上下だけ' }) },
  // 80cmだけ等速でゆっくり横へ。手前の青いねこで小さな視差
  'スライダー（Slider）': { dur: 7, fn: t => Cam({ x: lerp(-.4, .4, t), f: 40, cats: [[.7, -4.6]], cap: 'スライダー 80cm' }) },
  // 手持ちより遅く小さい重い揺れ＋呼吸のゆっくりした上下
  'ショルダー（Shoulder rig）': { dur: 5, fn: t => Cam({ z: -5, y: .9 + .025 * Math.sin(t * Math.PI * 3), f: 35, yaw: .01 * Math.sin(t * 7) + .005 * Math.sin(t * 13 + 1), pitch: .007 * Math.sin(t * 5 + 2), roll: .006 * Math.sin(t * 4), cap: '肩のせ：重い揺れ' }) },
  // ボンネットに固定して運転するねこを見る。ねこは止まり、景色だけが後ろへ流れる
  '車載（Car mount）': { dur: 4, fn: t => { const az = lerp(-10, 30, t); return at(Cam({ az, z: az + 2.2, y: .75 + .012 * Math.sin(t * 260), f: 30, cap: '車に固定' }), 0, .7, az); } },
  // 高い所の直線を一定の速さで、真上を速くすべる
  'ケーブルカム（Cable cam）': { dur: 3.5, fn: t => Cam({ z: lerp(-16, 10, t), y: 5, f: 24, pitch: -.45, cap: '張った綱の上を' }) },
  // 空からゆっくり上がりながら進む、広角・等速
  'ドローン（Drone）': { dur: 7, fn: t => at(Cam({ x: lerp(-1.4, 0, t), z: lerp(-16, -10, t), y: lerp(5, 12, t), f: 24, cap: 'ドローン：空から' }), 0, 0, 4) },
  // 急降下→柱の間を左右にくねり、曲がるたびに傾く（超広角14mm）。ねこの上は飛び越す
  'FPVドローン（FPV drone）': { dur: 4, fn: t => { const z = lerp(-26, 14, t), x = 1.3 * Math.sin(t * Math.PI * 3), y = .8 + 5 * Math.pow(1 - seg(t, 0, .35), 2) + 1.6 * Math.exp(-z * z / 6); return Cam({ x, z, y, f: 14, yaw: Math.atan2(1.3 * 3 * Math.PI * Math.cos(t * Math.PI * 3), 40), pitch: -.6 * (1 - seg(t, 0, .4)), roll: .45 * Math.sin(t * Math.PI * 3), cap: 'FPV：すき間を抜ける' }); } },
  // 同じ動きを2回くり返し、2回分を重ねるとねこが2匹に（合成）
  'モーションコントロール（Motion control）': { dur: 6, fn: t => { const i = cutOf(t, 3), u = ease((t * 3) % 1), C = o => at(Cam(Object.assign({ x: lerp(-1.2, 1.2, u), z: -6.5, f: 32 }, o)), 0, .7, 0); return i < 2 ? C({ ax: i ? 1 : -1, cap: i ? '2回目（同じ動き）' : '1回目' }) : C({ ax: 1, over: C({ plain: 'none', ax: -1 }), cap: '重ねると2匹' }); } },
  // 胸に固定したカメラが顔を見上げる。顔は真ん中のまま、背景だけがぐらぐら
  'スノーリカム（体に固定／SnorriCam）': { dur: 4, fn: t => { const az = lerp(4, -4, t), w = Math.sin(t * Math.PI * 10), ax = .3 * w; const c = at(Cam({ ax, az, x: ax, z: az - 1.2, y: .45, f: 24, cap: '体に固定' }), ax, .85, az); c.roll = .1 * w; return c; } },
  // 跳ぶ体にカメラを付ける：ねこは画面の同じ所、景色だけが上下する
  'ボディマウント（Body mount）': { dur: 3.5, fn: t => { const ay = jump((t * 2) % 1); return at(Cam({ ay, x: 1.3, z: -.9, y: .8 + ay, f: 28, cap: '跳ぶ体にカメラ' }), 0, .7 + ay, 0); } },
  '長回し（ワンカット／Long take, Oner）': { ref: 'longtake' },
  // 速い流れの中に継ぎ目を隠す。1カットに見えて、時間の帯では2カット
  '見せかけのワンカット（Hidden cut oner）': { dur: 4, fn: t => { const tl = { v: [[0, .5, 0], [.5, 1, 1]], t }; if (t < .5) { const u = seg(t, .3, .5); return Cam({ x: lerp(-1.5, -.2, t / .5), yaw: lerp(0, .9, u * u), hstreak: 1.2 * u, tl, cap: '1カット…？' }); } const v = seg(t, .5, .7); return Cam({ x: lerp(-.2, 1.2, seg(t, .5, 1)), y: 1.2, yaw: lerp(-.9, 0, ease(v)), hstreak: 1.2 * (1 - v), crowd: true, tint: '30,45,120,.4', tl, cap: '継ぎ目は流れの中' }); } },
  'POV（主観／Point of view）': { ref: 'pov' },
  'バレットタイム（Bullet time）': { ref: 'bullet' },
  // 鍵穴（丸い穴）ごしに進み、穴を抜けると向こうの部屋が広がる
  'カメラが物を通り抜ける（Impossible camera move）': { dur: 4, fn: t => { const u = seg(t, .35, .6); return aimHeadBy(Cam({ z: lerp(-14, -2.6, ease(t)), y: .8, f: 30, iris: lerp(.22, 1, u * u), cap: u < 1 ? '鍵穴の向こうへ' : '抜けた' }), seg(t, .5, 1)); } },
  // 手前のねこの陰に青いねこを隠し、横へ動くと現れる
  'リビール（隠して見せる／Reveal）': { dur: 3.5, fn: t => { const u = ease(seg(t, .25, .8)); return Cam({ x: lerp(0, 1.5, u), z: -2.5, y: .55, f: 35, cats: [[0, 6], [-.5, 7], [.5, 7.5]], cap: u >= 1 ? '隠れていた！' : '' }); } },
  'カメラの揺れ（地震・衝撃）': { ref: 'shake' },
  // ねことカメラを同じ台車に。ねこは足を動かさず（上下なし）すーっと前へ
  'ダブルドリー（人も台車に乗せる／Double dolly）': { dur: 4, fn: t => { const az = lerp(6, -6, t); return at(Cam({ az, z: az - 3.5, y: .8, f: 40, cap: '歩かずにすべる' }), 0, .7, az); } },
  // 部屋とカメラは止まって見え、ねこだけが回って壁へ（重力が横向きに）
  '回転する部屋（Rotating set）': { dur: 4, fn: t => { const r = -Math.PI / 2 * ease(seg(t, .15, .85)); return Cam({ z: -6, noA: true, over: Cam({ z: -6, plain: 'none', roll: r, dz: 1 / (1 + Math.abs(Math.sin(r)) * .9) }), cap: '部屋ごと回す' }); } },
  // カメラは動かず、手前・中・奥で別々の動きが長く続く
  'フィックスの長回し（Static long take）': { dur: 7, fn: t => Cam({ f: 32, ax: lerp(-.8, .8, ease(t)), ay: X02.bob(t, 10, .04), cats: [[lerp(-4, 4, t), 8], [lerp(2.5, -2.5, t), -3.5]], tl: { v: [[0, 1, 0]], t }, cap: '動かず長く' }) },
  // ねこが左から入って止まり、右へ出る。奥から青いねこ。最後は空の画面を残す
  '人の出入りだけで語る（Staging in a fixed frame）': { dur: 6, fn: t => { const a = seg(t, 0, .25), b = seg(t, .45, .65), ax = b > 0 ? lerp(0, 5, b) : lerp(-5, 0, a), walk = (a > 0 && a < 1) || (b > 0 && b < 1); return Cam({ ax, ay: walk ? X02.bob(t, 30) : 0, cats: [[1.2, lerp(20, 4, seg(t, .2, .65))]], cap: t > .75 ? '誰もいない…' : '' }); } },
  // 前半：ねこが跳ぶのに少し遅れてカメラも上を向く（気づかない）。後半：何も動かないのにカメラだけ動く（不気味）
  '動機のある動き／ない動き（追加／Motivated camera movement）': { dur: 6, fn: t => { if (t < .5) { const u = seg(t, .1, .45), ay = jump(u); return Cam({ z: -4, f: 40, ay, pitch: Math.atan((.6 + jump(Math.max(0, u - .06))) / 4) - .03, cap: '動きに合わせる' }); } const v = seg(t, .5, 1); return Cam({ z: lerp(-6, -5, v), x: lerp(-1, -.5, v), f: 40, still: true, tint: '20,25,60,.3', vig: .5, cap: '理由なし＝不気味' }); } },
  // 7秒でごくわずか横へ流れる。三分割の線とくらべるとやっと分かる
  '微速の漂い（ドリフト）（追加／Drift）': { dur: 7, fn: t => Cam({ x: lerp(-.12, .12, t), z: lerp(-7, -6.85, t), grid: 'thirds', cap: '止まって見えるほど' }) },
  // 早回しで道を長く進む。人（青いねこ）はコマごとに場所が変わり、太陽も動く
  'ハイパーラプス（追加／Hyperlapse）': { dur: 4, fn: t => { const k = Math.floor(t * 40); return Cam({ x: 1.4, z: lerp(-20, 60, t), y: 1 + .01 * hsh(k), f: 24, sun: [lerp(-60, 80, t), 40 - 20 * Math.abs(t - .5)], cats: [0, 1, 2, 3, 4, 5].map(i => [-2 + 4 * hsh(i * 7 + k), 8 + i * 9]), rate: 20, cap: '早回しで遠くへ' }); } },
  // 2m・5m・20mの3匹。横に動くと動く量が10：4：1
  '視差の計算（追加／Parallax）': { dur: 4, fn: t => Cam({ x: lerp(-1, 1, ease(t)), f: 35, ax: .3, az: -2, cats: [[-.9, -5], [-1.5, 13]], track: 1, cap: '近10：中4：遠1' }) },
});
