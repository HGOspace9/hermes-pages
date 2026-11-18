// 分野14 アニメの作画と撮影
const AC = o => Cam(Object.assign({ z: -6, f: 35, y: .9 }, o));
FIELDS.push({
  id: 'anime', no: '14', title: 'アニメの作画と撮影', sl: ['sqv', 'x'],
  lead: 'つまみは4つです。絵と絵の間隔（速さ）／形を崩す（つぶす・伸ばす）／止め絵で節約する／撮影で仕上げる（光・ぶれ・線）。',
  items: [
    {
      id: 'squash', n: 'つぶしと伸ばし', en: 'Squash and stretch', knob: ['deform'], dur: 5, vs: 'antic',
      one: '速い時は伸ばし、ぶつかった時はつぶす',
      look: '形が変わらないジャンプは固い置物のよう。伸びてつぶれると、やわらかく、重さがあるように見えます。',
      how: '上がる時・落ちる時は縦に120%（横は細く）。着地の2〜3コマは縦に65%（横は太く）。体積は変えない。',
      use: '生き物、ボール、顔の表情。アニメらしさの土台。',
      diff: '予備動作は動く「前」のため。つぶしと伸ばしは動いている「間」と「後」の形です。',
      memo: '縦に伸びたら横は細く。かさは同じ。',
      fn: t => {
        const on = t >= .5, v = (t * 2) % 1, u = seg(v, .05, .7), land = seg(v, .7, .95);
        let sq = 1; if (on) sq = u < 1 ? 1 + .22 * Math.abs(Math.cos(u * 3.1416)) * (u > 0 ? 1 : 0) : 1 - .38 * Math.sin(land * 3.1416);
        return AC({ ay: jump(u), sq, sx: 1 / Math.sqrt(sq), cap: on ? 'つぶしと伸ばし あり' : 'なし（固い）' });
      }
    },
    {
      id: 'antic', n: '予備動作（アンティシペーション）', en: 'Anticipation', knob: ['deform', 'spacing'], dur: 5, vs: 'squash',
      one: '動く前に、逆の向きへ小さく動く',
      look: 'とぶ前に一度しゃがむと、「とぶぞ」と分かり、とぶ力も強く見えます。',
      how: '本番の動きの前に、逆向きへ4〜8コマ。大きな動きほど、ためを長く。',
      use: 'ジャンプ、パンチ、走り出し、振り向き。',
      diff: 'ためが無いと、動きがいきなりで、見る人がついていけません。',
      memo: 'とぶ前にしゃがむ、投げる前に引く。',
      fn: t => {
        const on = t >= .5, v = (t * 2) % 1;
        if (!on) return AC({ ay: jump(seg(v, .3, .8)), cap: 'ためなし' });
        const cr = seg(v, .1, .4), u = seg(v, .4, .85), sq = u > 0 ? 1 : 1 - .35 * Math.sin(cr * 1.5708);
        return AC({ ay: jump(u) * 1.15, sq, sx: 1 / Math.sqrt(sq), cap: 'ためあり（しゃがんでから）' });
      }
    },
    {
      id: 'easing', n: 'ゆるく始めてゆるく止める（イーズ）', en: 'Ease in / Ease out', knob: ['spacing'], dur: 5, vs: 'overshoot',
      one: '動き出しと止まり際は絵の間をつめ、真ん中は広げる',
      look: '同じ速さの動きは機械のよう。ゆっくり出てゆっくり止まると、重さのある自然な動きになります。',
      how: '動き出しと止まり際に絵を多く（間をつめる）、真ん中は少なく（間を広げる）。',
      use: 'ほとんどすべての動き。カメラ、文字、キャラクター。',
      diff: '行きすぎて戻る（オーバーシュート）は、止まり際にさらに一工夫を足したものです。',
      memo: '車は急に走らず、急に止まらない。',
      fn: t => { const on = t >= .5, v = seg((t * 2) % 1, .1, .85); return AC({ z: -7, ax: lerp(-2.6, 2.6, on ? ease(ease(v)) : v), cap: on ? 'ゆるく出て、ゆるく止まる' : '同じ速さ（機械っぽい）' }); }
    },
    {
      id: 'overshoot', n: '行きすぎて戻る（オーバーシュート）', en: 'Overshoot / Follow through', knob: ['spacing', 'deform'], dur: 3.4, vs: 'easing',
      one: '止まる所を少し通りすぎてから、戻って止まる',
      look: 'ぴたっと止まらず、ぷるんと揺れてから落ち着きます。',
      how: '止まる位置を10〜20%通りすぎ、2〜3回小さく行き来して止める。しっぽや髪は、体よりおくれて揺れる。',
      use: '元気な動き、やわらかい物、文字やボタンの登場。',
      diff: 'イーズはなめらかに止まります。オーバーシュートは勢いが余ります。',
      memo: '急に止まれない。',
      fn: t => { const u = seg(t, .15, .9), w = Math.exp(-7 * u) * Math.cos(16 * u); return AC({ z: -7, ax: -2.4 + 4.4 * (1 - w), sx: 1 + .25 * Math.exp(-7 * u) * Math.sin(16 * u), sq: 1 }); }
    },
    {
      id: 'smear', n: 'オバケ（スミア）', en: 'Smear frame', knob: ['deform', 'spacing'], dur: 3, vs: 'mblur',
      one: '速い動きの途中に、びよーんと伸びた絵を1枚はさむ',
      look: '左にいたねこが、一瞬だけ横に長くのびた形になり、次のコマでは右にいます。',
      how: '始めの絵と終わりの絵の間に、2つをつなぐように引きのばした絵を1〜2コマだけ入れる。',
      use: 'すばやい振り向き、パンチ、ギャグ。',
      diff: 'シャッターのぶれはカメラが作ります。オバケは絵描きが「ぶれを絵にして」描きます。',
      memo: '1コマだけのびる。止めて見ると変な絵。',
      fn: t => { const u = seg(t, .46, .56), mid = u > 0 && u < 1; return AC({ z: -7, ax: mid ? 0 : u <= 0 ? -2.4 : 2.4, sx: mid ? 5 : 1, cap: mid ? 'オバケ（のびた絵）' : '' }); }
    },
    {
      id: 'sankai', n: '3回パン', en: 'Triple pan (Dezaki)', knob: ['satsuei'], dur: 3.6, vs: 'axial',
      one: '同じ絵へのパンを、3回くり返す',
      look: 'サッ、サッ、サッと3回、同じ主役へカメラが流れこみます。くり返すたびに強く印象に残ります。',
      how: '同じ絵に向かう速いパンを3回、だんだん大きくしながら続ける。1回8〜12コマ。',
      use: '衝撃の登場、決めの瞬間、驚き。出﨑統監督の作品で有名です。',
      diff: '3段寄りはカットでパッと寄ります。3回パンは、流れる動きを3回見せます。',
      memo: '大事なことは3回言う。',
      fn: t => { const i = cutOf(t, 3), u = seg((t * 3) % 1, 0, .45); return at(Cam({ z: -6, y: .85, f: [35, 60, 100][i], hstreak: u < 1 ? 1 - u : 0 }), lerp(2.6, 0, ease(u)), .8, 0); }
    },
    {
      id: 'harmony', n: '止め絵（ハーモニー）', en: 'Freeze with painted look', knob: ['hold', 'satsuei'], dur: 3.6, vs: 'freeze',
      one: '動きを止めて、絵画のような1枚の絵にする',
      look: 'とび上がったてっぺんで動きが止まり、色がこく、絵画のようになります。',
      how: '決めの1コマで動きを止め、その絵だけ色をこく、影を強く、絵の具でぬったように仕上げる。1〜3秒見せる。',
      use: '決めポーズ、話の終わり、強い感情。',
      diff: 'フリーズフレームは同じ絵をただ止めます。ハーモニーは止めた絵を「特別な1枚」にぬり直します。',
      memo: '止めて、ぬり直す。',
      fn: t => { const fz = t > .45; return AC({ ay: jump(fz ? .5 : t / .9), still: fz, grade: fz ? { f: 'contrast(1.25) saturate(1.9)' } : null, flash: clamp(1 - Math.abs(t - .47) * 20) * .7, frame: fz ? 1 : 0, cap: fz ? '止め絵' : '' }); }
    },
    {
      id: 'lines', n: '集中線', en: 'Speed lines / Focus lines', knob: ['satsuei'], dur: 3, vs: 'crash-zoom',
      one: '主役に向かう放射状の線を重ねる',
      look: '画面のふちから真ん中へ線が集まり、目が主役に吸いよせられます。',
      how: '画面の外から主役へ向かう線をたくさん引く。真ん中はあける。2〜3コマごとに線を引き直すと、ビリビリ動く。',
      use: '驚き、気合、スピード、決めの一言。',
      diff: '急ズームはカメラで寄ります。集中線はカメラを動かさず、線で「寄った気持ち」にさせます。',
      memo: '線はぜんぶ主役を指す。',
      fn: t => { const on = t > .35; return at(Cam({ z: -2.4, y: .85, f: 40, streak: on ? 1.6 + Math.sin(t * 90) * .4 : 0, dz: on ? 1.06 + Math.sin(t * 60) * .01 : 1 }), 0, .85, 0); }
    }
  ]
});
