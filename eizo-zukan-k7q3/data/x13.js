// 分野13 の追加の図。書き方は ../../FIGURE_API.md 。音は鳴らないので、波（snd）の形と絵の動きの「合い方」で見せる
// X13.pk(x,c,k): c で立ち上がり k の速さで消える山。X13.sy(x,a,b): a〜b の間の「声」の音節。X13.N(o): 夜の別の場所（波の段が入るよう少し上向き）
const X13 = {
  pk: (x, c, k) => x >= c ? Math.exp(-(x - c) * k) : 0,
  sy: (x, a, b) => x > a && x < b ? .35 + .5 * Math.abs(Math.sin((x - a) * 70)) : 0,
  N: o => Cam(Object.assign({ x: 1, y: 2.2, z: -9, f: 28, pitch: -.12, crowd: true, tint: '30,45,120,.4' }, o)),
  hops: x => jump(seg(x, .1, .4)) + jump(seg(x, .5, .85)),
  beats: (n0, n1, s) => { const b = []; let p = .05, d = n0; while (p < 1) { b.push(p); p += d; d = Math.max(n1, d * s); } return b; },
};
XF('13', {
  // 前半：ねこが曲に合わせてはずむ（中の音＝聞こえている）。後半：同じ曲が外の音になると、ねこは何も反応しない
  '物語の中の音と外の音（Diegetic / non-diegetic sound）': { dur: 5, fn: t => { const a = t < .5; return SD(t, [{ label: '中の音', amp: x => x < .5 ? .6 * Math.abs(Math.sin(x * Math.PI * 16)) : 0 }, { label: '外の音', col: '#5b86c9', amp: x => x >= .5 ? .85 : 0, smooth: true }], { ay: a ? Math.abs(Math.sin(t * Math.PI * 16)) * .12 : 0, cap: a ? '中の音：ねこにも聞こえる' : '外の音：観客だけ' }); } },
  // 歩く1歩ごと（足が着くコマ）に足音の山。高さが1歩ずつ少し違う。衣ずれは動いている間ずっと小さく
  'フォーリー（Foley）': { dur: 4, fn: t => SD(t, [{ label: '足音', amp: x => Math.max(...[1, 2, 3, 4, 5, 6, 7].map(k => (.55 + .3 * hsh(k)) * X13.pk(x, k / 8, 40))) }, { label: '衣ずれ', col: '#4fb3a5', smooth: true, amp: x => x > .1 && x < .9 ? .2 : 0 }], { ax: lerp(-2, 2, t), ay: Math.abs(Math.sin(t * Math.PI * 8)) * .08, cap: '1歩ごとに足音' }) },
  // 同じ場所の2カット：環境音は切れ目でも変わらない。3カット目で場所が変わると環境音もがらりと変わる
  '環境音・ルームトーン（Ambience / room tone）': { dur: 5, fn: t => { const i = cutOf(t, 3), snd = [{ label: '声', col: '#4fb3a5', amp: x => X13.sy(x, .08, .26) + X13.sy(x, .4, .56) }, { label: '環境音', amp: x => x < 2 / 3 ? .28 : .6, smooth: true }]; return i < 2 ? SD(t, snd, i ? { z: -3.2, f: 45, cap: '切れ目でも同じ音' } : { cap: '下にずっと敷く' }) : Object.assign(X13.N(), { snd: { rows: snd, t }, cap: '場所が変わると変わる' }); } },
  // 前半：現場の声は雑音にうもれる。後半：録り直した声はくっきり、下に小さなルームトーン。口（体の伸び）は声に合う
  'アフレコ（ADR）': { dur: 5, fn: t => { const v = x => X13.sy(x % .5, .08, .4); return SD(t, [{ label: '声', col: '#4fb3a5', smooth: t >= .5, amp: v }, { label: '雑音', amp: x => x < .5 ? .6 : .1 }], { z: -3.4, f: 45, sq: 1 + .04 * v(t), cap: t < .5 ? '現場の声（雑音）' : '録り直した声' }); } },
  // 昔の色の絵。ねこは話していない（体は動かない）のに、画面の外から語りの声。曲は語りの下で小さく
  'ナレーション（Voice-over narration）': { dur: 5, fn: t => SD(t, [{ label: '語り', col: '#4fb3a5', smooth: true, amp: x => X13.sy(x, .12, .45) + X13.sy(x, .55, .88) }, { label: '音楽', smooth: true, amp: () => .22 }], { sepia: .3, still: true, ax: lerp(-.8, .8, t), cap: t < .5 ? '語り手は画面の外' : '絵に無いことを話す' }) },
  // 大勢の青いねこ。ガヤはずっと同じ厚みのざわざわ、その上に主役の台詞だけがはっきり
  'ガヤ（Walla）': { dur: 4.4, fn: t => SD(t, [{ label: '台詞', col: '#4fb3a5', amp: x => X13.sy(x, .3, .7) }, { label: 'ガヤ', amp: x => .35 + .15 * Math.sin(x * 40) * Math.sin(x * 13) }], { z: -6.5, f: 30, crowd: true, cap: 'ざわざわ（言葉は聞こえない）' }) },
  // 画面の外で一音（こもった音）。少しおくれてねこがびくっとし、カメラが音の方へ振るが、何も映らない
  '＋画面外の音（Offscreen sound）': { dur: 4.4, fn: t => SD(t, [{ label: '画面外', smooth: true, amp: x => .9 * X13.pk(x, .4, 9) }], { z: -3.6, f: 40, ay: .3 * jump(seg(t, .43, .55)), yaw: -.45 * ease(seg(t, .6, .8)), cap: t < .4 ? '' : t < .6 ? 'いまの音は？' : '音の主は見せない' }) },
  // ねこAが電話を聞いている。Aの声はふつう、電話の相手の声は細く平たい帯（低い音も高い音も削れる）
  '＋電話・ラジオごしの声（Futz）': { dur: 5, fn: t => SD(t, [{ label: 'そばの声', col: '#4fb3a5', amp: x => X13.sy(x, .06, .4) }, { label: '電話ごし', col: '#9aa0aa', smooth: true, amp: x => X13.sy(x, .5, .92) ? .3 : 0 }], { z: -3.4, f: 45, sq: 1 + .04 * X13.sy(t, .06, .4), cap: t < .5 ? 'そばの声：ふつう' : '電話ごし：細くて小さい' }) },
  'J・Lカット（J-cut / L-cut）': { ref: 'jl' },
  // 1つの曲が3つの場面の下を切れずに流れる。場面ごとの音（下の段）は切れ目で入れかわる
  '音の橋わたし（Sound bridge）': { dur: 6, fn: t => { const i = cutOf(t, 3), snd = { rows: [{ label: '1つの曲', smooth: true, amp: () => .75 }, { label: '場の音', col: '#5b86c9', amp: x => [.2, .45, .3][cutOf(x, 3)] }], t }, cap = '曲が場面をまたぐ'; return i === 1 ? Object.assign(X13.N(), { snd, cap }) : SD(t, snd.rows, i ? { z: -9, f: 24, sun: [20, 40], tint: '255,120,50,.25', cap } : { cap: '' }); } },
  // 拍手のぱちぱち→同じ間隔・同じ形の雨音。切れ目で少し重ねて、1つの音のようにつなぐ
  '音のマッチ（Sound match / match on sound）': { dur: 4.4, fn: t => { const sp = x => .25 + .6 * hsh(Math.floor(x * 60)), rows = [{ label: '拍手', amp: x => x < .53 ? sp(x) : 0 }, { label: '雨', col: '#5b86c9', amp: x => x > .47 ? sp(x) : 0 }]; return t < .5 ? SD(t, rows, { crowd: true, z: -6.5, f: 30, cap: 'ぱちぱち（拍手）' }) : Object.assign(X13.N({ part: { type: 'rain', u: t } }), { snd: { rows, t }, cap: 'ざあざあ（雨）' }); } },
  // まだ前の場面なのに、次の場面の電話のベル（リン、リン）が大きく先に鳴る。1.2秒おくれて絵が変わる
  '音の先行（Pre-lap）': { dur: 5, fn: t => { const rows = [{ label: '前の音', smooth: true, amp: x => x < .6 ? .3 : 0 }, { label: '次のベル', col: '#5b86c9', amp: x => x > .3 && (x - .3) % .12 < .07 ? .85 : 0 }]; return t < .6 ? SD(t, rows, { cap: t > .3 ? '何の音？' : '' }) : Object.assign(X13.N(), { snd: { rows, t }, cap: 'ベルの場面へ' }); } },
  // ねこが出る時だけ、3つの音の「同じ形」が鳴る。いない場面では鳴らない。弱った時は同じ形を小さく遅く
  'ライトモチーフ（人物の主題）（Leitmotif）': { dur: 6, fn: t => { const i = cutOf(t, 3), m = (x, a, w, h) => [0, 1, 2].reduce((s, k) => s + h * (.55 + .2 * k) * bump(x, a + k * w, w * .3), 0); return SD(t, [{ label: 'ねこの主題', amp: x => m(x, .06, .05, 1.1) + m(x, .74, .07, .6) }], [{ ay: jump(seg(t, .05, .25)), cap: 'ねこ＝この形' }, { noA: true, cats: [[-1, 1], [1, 2]], cap: 'いない＝鳴らない' }, { sq: .9, tint: '30,45,120,.35', cap: '弱った時も同じ形' }][i]); } },
  // 波の形が、ねこの高さそのもの（上がる＝音階が上がる）。着地のコマに太鼓の山
  'ミッキーマウシング（動きに音楽を合わせる）（Mickey Mousing）': { dur: 4.4, fn: t => SD(t, [{ label: '音階', amp: x => .1 + .65 * X13.hops(x) }, { label: '太鼓', col: '#5b86c9', amp: x => X13.pk(x, .4, 30) + X13.pk(x, .85, 30) }], { ax: lerp(-1.5, 1.5, t), ay: X13.hops(t), cap: '動きのとおりに音' }) },
  // イントロの間は1カットで静かに。サビの頭（いちばん高い所）で絵が大きく開き、その後は拍ごとにカット
  '既成曲の使用（Needle drop）': { dur: 5.4, fn: t => { const rows = [{ label: '既成の曲', amp: x => x < .55 ? .3 : .95 }, { label: '拍', col: '#5b86c9', amp: x => x > .55 ? X13.pk((x - .55) % .1, 0, 60) : 0 }]; if (t < .55) return SD(t, rows, { z: -3.4, f: 45, ax: lerp(-.3, .3, t), cap: 'イントロ…' }); const k = Math.floor((t - .55) / .1) % 2; return SD(t, rows, k ? { z: -4, f: 35, ay: jump(seg((t - .55) % .1, 0, .1)) * .4, cap: '拍ごとにカット' } : { z: -10, f: 22, y: 1.6, flare: .3, cap: 'サビの頭＝一番の瞬間' }); } },
  // 雨の中でしょんぼりするねこ（暗い青）に、ぴょんぴょんはねる明るい曲を、大きいまま流す
  '対位法（絵と逆の音楽）（Contrapuntal music / soundtrack dissonance）': { dur: 4.4, fn: t => SD(t, [{ label: '明るい曲', col: '#f2d03d', amp: x => .45 + .5 * Math.abs(Math.sin(x * Math.PI * 12)) }], { sq: .86, still: true, tint: '30,45,120,.45', part: { type: 'rain', u: t }, cap: '悲しい絵＋陽気な曲' }) },
  // ずっと小さな音→青いねこがいきなり横に現れるコマに、短く大きい一音（白い光・ゆれも同じコマ）
  'スティンガー（驚かせる一音）（Stinger）': { dur: 4, fn: t => { const on = t >= .55, k = on ? Math.exp(-(t - .55) * 30) : 0; return SD(t, [{ label: '効果音', amp: x => x < .55 ? .06 : .05 + Math.exp(-(x - .55) * 40) }], { z: -3.6, f: 40, cats: on ? [[1.1, -.6]] : null, flash: .45 * k, shake: 7 * k, cap: on ? 'ジャン！' : '静か…' }); } },
  // 旋律の無いなめらかな低い音が、ゆっくり大きくなりながら続く。カメラもゆっくり寄り、まわりが暗くなる
  '＋ドローン（持続する低い音）（Drone）': { dur: 6, fn: t => SD(t, [{ label: '低い音', col: '#9a7fd1', smooth: true, amp: x => .3 + .5 * x + .05 * Math.sin(x * 9) }], { z: lerp(-6, -4.2, t), tint: '20,20,40,.35', vig: .3 + .5 * t, still: true, cap: 'ずっと低くうなる' }) },
  '＋ダッキング（声の時だけ曲を下げる）（Ducking）': { ref: 's-duck' },
  '無音（Silence）': { ref: 's-silence' },
  // 遠い絵：声は小さくなめらか（ぼんやり）。近い絵：同じ声が大きくギザギザ（はっきり）
  '音の遠近（Sound perspective）': { dur: 5, fn: t => { const far = t < .5, v = x => X13.sy(x % .5, .08, .42); return SD(t, [{ label: '遠い声', col: '#4fb3a5', smooth: true, amp: x => x < .5 ? .3 * v(x) : 0 }, { label: '近い声', col: '#4fb3a5', amp: x => x >= .5 ? v(x) : 0 }], far ? { z: -16, f: 24, cap: '遠い＝小さくぼんやり' } : { z: -2.8, f: 40, y: .8, cap: '近い＝大きくはっきり' }); } },
  'こもらせる（水中・壁ごし）': { ref: 's-muffle' },
  // 爆発の光とゆれ→「キーン」の細い帯だけ残り、ほかの音は小さくなる。キーンが消えるにつれ、絵のぼけと音が戻る
  '爆発後の耳鳴り（Tinnitus ringing）': { dur: 6, fn: t => { const b = seg(t, .25, .95), k = t >= .25 ? Math.exp(-(t - .25) * 20) : 0; return SD(t, [{ label: 'キーン', col: '#eceae4', smooth: true, amp: x => x < .25 ? 0 : .45 * (1 - seg(x, .25, .9)) }, { label: 'ほかの音', amp: x => x < .25 ? .7 : x < .3 ? 1 : .1 + .6 * seg(x, .45, .95) }], { flash: .6 * k, shake: 9 * k, part: t >= .25 && t < .45 ? { type: 'spark', u: seg(t, .25, .45) } : null, dof: t >= .25 ? .6 * (1 - b) : 0, fd: 1.5, cap: t < .25 ? '' : t < .7 ? 'キーン…' : '音が戻ってくる' }); } },
  // 「ドッ・ドッ」の2つの山が1拍。拍はだんだん速く、絵も拍ごとに小さく脈打つ。ほかの音は消えていく
  '心臓の音（Heartbeat）': { dur: 6, fn: t => { const B = X13.beats(.2, .08, .86), h = x => B.reduce((s, c) => s + X13.pk(x, c, 60) + .7 * X13.pk(x, c + .03, 60), 0); return SD(t, [{ label: '心臓', col: '#b85c4a', amp: h }, { label: 'ほかの音', smooth: true, amp: x => .4 * (1 - x) }], { z: -3.6, f: 42, dz: 1 + .03 * Math.min(1, h(t)), vig: .2 + .5 * t, cap: 'だんだん速く' }); } },
  // 3つの音がずれて上がっていく（波の高さ＝音の高さ）。上がりきった音は消え、下から次が入る。カメラも上がり続ける
  'シェパードトーン（上がり続ける音）（Shepard tone）': { dur: 6, fn: t => { const r = p => ({ label: ['音1', '音2', '音3'][p], col: '#9a7fd1', amp: x => { const s = (x * 1.5 + p / 3) % 1; return s * Math.sin(s * Math.PI) * 1.5; } }); return SD(t, [r(0), r(1), r(2)], { z: -6, y: lerp(.9, 2.4, t), pitch: lerp(-.17, -.3, t), vig: .4, cap: 'ずっと上がり続ける' }); } },
  // 波がだんだん高く、画面もじわじわ寄ってぶれ線がふえる→上がりきった所で一瞬の無音→「ドン」で題字
  'ライザー': { dur: 5, fn: t => { const r = seg(t, .05, .68); return SD(t, [{ label: 'ライザー', amp: x => x < .68 ? .1 + .85 * Math.pow(seg(x, .05, .68), 2) : 0 }, { label: 'ドン', col: '#b85c4a', amp: x => X13.pk(x, .74, 10) }], t < .74 ? { dz: 1 + .25 * r * r, streak: .8 * r * r, black: t > .68 ? 1 : 0, cap: t > .68 ? '（一瞬の無音）' : '上がっていく' } : { black: 1, flash: .35 * Math.exp(-(t - .74) * 25), text: { type: 'pop', u: seg(t, .74, .85), s: 'ねこ' } }); } },
  // カットの切れ目ごとに、重く尾を引く「ドン」。黒地の題字も「ドン」と同じコマで出る
  'インパクト': { dur: 5, fn: t => { const i = cutOf(t, 3), c = [0, .34, .67][i], k = Math.exp(-(t - c) * 14), rows = [{ label: 'ドン', col: '#b85c4a', amp: x => .9 * (X13.pk(x, .34, 7) + X13.pk(x, .67, 7)) }]; return SD(t, rows, [{ cap: '' }, { black: 1, shake: 6 * k, text: { type: 'fade', u: 1, s: '夏。' } }, { z: -9, f: 24, shake: 6 * k, flash: .2 * k, cap: '切れ目に「ドン」' }][i]); } },
  // 青いねこが目の前を速く横切る。大きさは通る瞬間が山。音の高さは通る瞬間に、高い→低いへ段で落ちる
  'ドップラー（Doppler effect）': { dur: 4, fn: t => { const cx = lerp(-4, 4, t); return SD(t, [{ label: '大きさ', amp: x => .15 + .8 * bump(x, .5, .14) }, { label: '音の高さ', col: '#9a7fd1', smooth: true, amp: x => x < .5 ? .8 : .45 }], { noA: true, cats: [[cx, -2]], hstreak: .5, trail: [[-.15, 0, .3], [-.3, 0, .15]], cap: t < .5 ? '近づく＝高い' : '遠ざかる＝低い' }); } },
  '残響で広さを出す': { ref: 's-reverb' },
  // ねこAが青いねこをぽかり。当たるコマに3つの段（低い重さ・本体・高い当たり）が同時に立ち、長さがちがう
  '現実より大きい音（Hyper-real sound）': { dur: 4, fn: t => { const on = t >= .5, k = on ? Math.exp(-(t - .5) * 14) : 0; return SD(t, [{ label: '低い音', col: '#9a7fd1', amp: x => X13.pk(x, .5, 5) }, { label: '本体', amp: x => X13.pk(x, .5, 14) }, { label: '高い音', col: '#eceae4', amp: x => X13.pk(x, .5, 45) }], { ax: on ? .3 : lerp(-1.4, .3, ease(seg(t, .2, .5))), cats: [[lerp(1, 3, ease(seg(t, .5, .8))), 0]], shake: 8 * k, flash: .3 * k, cap: on ? '3つ重ねて太く' : '' }); } },
  // はずむ曲の途中で「ギュッ」→同じコマで曲はゼロ、絵は止まって色がぬける
  'レコードの針が飛ぶ音（Record scratch）': { dur: 4.4, fn: t => { const st = t >= .5; return SD(t, [{ label: '曲', amp: x => x < .5 ? .5 + .4 * Math.abs(Math.sin(x * Math.PI * 12)) : 0 }, { label: 'ギュッ', col: '#b85c4a', amp: x => x >= .49 && x < .56 ? .9 : 0 }], { ax: st ? lerp(-1.5, 0, .5) : lerp(-1.5, 0, t), ay: st ? .25 : Math.abs(Math.sin(t * Math.PI * 12)) * .25, still: st, grade: st ? { f: 'saturate(.2)' } : null, wipe: st ? 1 : 0, cap: st ? 'ギュッ…（止まる）' : '' }); } },
  // ねこが左から右へ歩くと、左の段の音が小さく、右の段の音が大きくなる（音も同じ向きに動く）
  '左右に振る': { dur: 4.4, fn: t => SD(t, [{ label: '左', amp: x => .1 + .8 * (1 - ease(x)) }, { label: '右', col: '#5b86c9', amp: x => .1 + .8 * ease(x) }], { ax: lerp(-2.2, 2.2, ease(t)), ay: Math.abs(Math.sin(t * Math.PI * 8)) * .08, cap: t < .5 ? '左から聞こえる' : '右から聞こえる' }) },
  // はでな場面の大きな曲が、絵のカットと同じコマで余韻なくブツッ。次の場面は小さな環境音から
  '＋音を一気に切る（カットアウト）（Hard cut to silence）': { dur: 4.4, fn: t => { const rows = [{ label: '曲', amp: x => x < .5 ? .9 : 0 }, { label: '環境音', col: '#5b86c9', smooth: true, amp: x => x >= .5 ? .12 : 0 }]; return t < .5 ? SD(t, rows, { ay: jump((t * 4) % 1) * .6, flare: .3, glow: .2 }) : Object.assign(X13.N({ still: true, crowd: false }), { snd: { rows, t }, cap: '余韻なしでブツッ' }); } },
  // 吹き飛ぶねこに決まった悲鳴。昼の場面と夜の場面で、まったく同じ形の波が使い回される
  '＋ウィルヘルムの叫び（Wilhelm scream）': { dur: 5, fn: t => { const sc = (x, a) => { const u = seg(x, a, a + .3); return u > 0 && u < 1 ? (.5 + .4 * Math.sin(u * 30) * .3 + .4) * Math.min(1, u * 8) * (1 - seg(u, .7, 1)) : 0; }, u = seg(t % .5, .1, .4), n = t >= .5; return SD(t, [{ label: '悲鳴', col: '#b85c4a', amp: x => sc(x, .1) + sc(x, .6) }], { ax: (n ? 1 : -1) * 3 * u, ay: 1.5 * Math.sin(Math.PI * u), tint: n ? '30,45,120,.4' : null, cap: n ? 'また同じ悲鳴' : '吹き飛ぶ→決まった悲鳴' }); } },
});
