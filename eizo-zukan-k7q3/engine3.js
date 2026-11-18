// 図の型の追加：光る・粒・乱れ（VFX）、切り抜きの線と追跡の印、文字の出し方、音の波
const hsh = i => { const v = Math.sin(i * 12.9898) * 43758.5453; return v - Math.floor(v); };

function drawFx(ctx, W, H, c, time) {
  if (c.glow > 0) { // 明るい所だけをぼかして重ねる
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, c.glow) * .85;
    ctx.filter = `brightness(.55) contrast(3) blur(${(W * .022).toFixed(1)}px)`; ctx.drawImage(ctx.canvas, 0, 0); ctx.restore();
  }
  if (c.part) { // 粒：雪・雨・火花
    const { type, u } = c.part; ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
    if (type === 'spark') {
      const [sx, sy] = c._a ? [c._a[0], c._a[1]] : [W / 2, H * .8]; ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 46; i++) {
        const a = hsh(i) * 3.1416 + 3.1416, v = (.25 + hsh(i + 50) * .5) * W, x = sx + Math.cos(a) * v * u, y = sy + Math.sin(a) * v * u + u * u * H * .9;
        ctx.fillStyle = `rgba(255,${150 + Math.round(hsh(i + 9) * 90)},60,${Math.max(0, 1 - u * 1.1)})`; ctx.beginPath(); ctx.arc(x, y, W * .006, 0, 7); ctx.fill();
      }
    } else for (let i = 0; i < 70; i++) {
      const depth = .4 + hsh(i + 7) * .6, x = (hsh(i) + (type === 'rain' ? 0 : Math.sin(u * 6 + i) * .01)) * W, y = ((hsh(i + 31) + u * (type === 'rain' ? 5 : 1.4) * depth) % 1) * H;
      if (type === 'rain') { ctx.strokeStyle = 'rgba(225,235,255,.55)'; ctx.lineWidth = W * .0025 * depth; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - W * .008, y + H * .07 * depth); ctx.stroke(); }
      else { ctx.fillStyle = `rgba(255,255,255,${.5 + .5 * depth})`; ctx.beginPath(); ctx.arc(x, y, W * .007 * depth, 0, 7); ctx.fill(); }
    }
    ctx.restore();
  }
  if (c.glitch > 0) { // 乱れ：横の帯をずらす
    const f = Math.floor(time * 14);
    for (let j = 0; j < 7; j++) {
      const y = Math.floor(hsh(f * 7 + j) * H * .9), h = Math.floor(H * (.03 + hsh(f + j * 3) * .07)), dx = (hsh(f * 3 + j * 11) - .5) * W * .22 * c.glitch;
      ctx.drawImage(ctx.canvas, 0, y, W, h, dx, y, W, h);
      ctx.fillStyle = j % 2 ? 'rgba(0,255,255,.22)' : 'rgba(255,0,120,.22)'; ctx.fillRect(dx > 0 ? 0 : W + dx, y, Math.abs(dx), h);
    }
  }
}

function drawTop(ctx, W, H, c, time) {
  drawFormat(ctx, W, H, c, time);
  const A = c._a;
  if (c.roto > 0 && A) { // 切り抜きの線（マスク）
    const [px, py, k] = A, u = Math.min(1, c.roto); ctx.save();
    ctx.strokeStyle = '#4fb3a5'; ctx.lineWidth = Math.max(1.5, W * .005); ctx.setLineDash([W * .015, W * .01]);
    ctx.beginPath(); ctx.ellipse(px + .06 * k, py - .34 * k, .46 * k, .4 * k, 0, -1.57, -1.57 + 6.283 * u); ctx.stroke();
    ctx.beginPath(); ctx.arc(px, py - .9 * k, .37 * k, -1.57, -1.57 + 6.283 * u); ctx.stroke();
    ctx.setLineDash([]); ctx.fillStyle = '#fff';
    for (let i = 0; i <= 8 * u; i++) { const a = -1.57 + i / 8 * 6.283; ctx.fillRect(px + Math.cos(a) * .37 * k - 3, py - .9 * k + Math.sin(a) * .37 * k - 3, 6, 6); }
    ctx.restore();
  }
  if (c.track > 0 && A) { // 追跡の印と、貼りつけた帽子
    const [px, py, k] = A, hx = px, hy = py - .86 * k, r = .16 * k;
    ctx.fillStyle = '#4fb3a5'; ctx.beginPath(); ctx.moveTo(hx - .2 * k, hy - .22 * k); ctx.lineTo(hx + .2 * k, hy - .22 * k); ctx.lineTo(hx, hy - .75 * k); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hx, hy - .75 * k, .06 * k, 0, 7); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1, W * .004); ctx.strokeRect(hx - r, hy - r, r * 2, r * 2);
    ctx.beginPath(); ctx.moveTo(hx - r * 1.5, hy); ctx.lineTo(hx + r * 1.5, hy); ctx.moveTo(hx, hy - r * 1.5); ctx.lineTo(hx, hy + r * 1.5); ctx.stroke();
  }
  if (c.text) for (const T of [].concat(c.text)) drawText(ctx, W, H, T);
  if (c.snd) drawSnd(ctx, W, H, c.snd);
}

// 文字の出し方。type: fade / slide / type / pop / stagger / track / mask / lower
function drawText(ctx, W, H, T) {
  const u = clamp(T.u), fs = W * .085 * (T.k || 1), font = `800 ${fs}px "Hiragino Sans","Yu Gothic",sans-serif`;
  ctx.save(); ctx.font = font; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  if (T.type === 'lower') { // 名前テロップ：帯が左から出て、名前が上がってくる
    const e = ease(seg(u, 0, .5)), e2 = ease(seg(u, .3, .9)), x = W * (T.x == null ? .08 : T.x), y = H * (T.y == null ? .68 : T.y), bw = W * .5 * e;
    ctx.fillStyle = '#f2b33d'; ctx.fillRect(x, y, W * .012, H * .2 * e);
    ctx.fillStyle = 'rgba(20,22,26,.88)'; ctx.fillRect(x + W * .012, y, bw, H * .2);
    ctx.beginPath(); ctx.rect(x, y, bw + W * .012, H * .2); ctx.clip();
    ctx.globalAlpha = e2; ctx.fillStyle = '#fff'; ctx.font = `800 ${fs * .7}px "Hiragino Sans",sans-serif`; ctx.fillText(T.s, x + W * .04, y + H * .075 + (1 - e2) * H * .05);
    ctx.fillStyle = '#f2b33d'; ctx.font = `600 ${fs * .38}px "Hiragino Sans",sans-serif`; ctx.fillText(T.sub || '', x + W * .04, y + H * .155 + (1 - e2) * H * .05);
    ctx.restore(); return;
  }
  const chars = [...T.s], sp = T.type === 'track' ? lerp(-.05, .45, ease(u)) * fs : 0;
  const ws = chars.map(ch => ctx.measureText(ch).width), total = ws.reduce((a, b) => a + b, 0) + sp * (chars.length - 1);
  const cx = W * (T.x == null ? .5 : T.x); let x = cx - total / 2; const cy = H * (T.y == null ? .46 : T.y);
  const put = (ch, xx, yy, al, sc) => {
    if (al <= 0) return; ctx.save(); ctx.globalAlpha = Math.min(1, al); ctx.translate(xx, yy); if (sc !== 1) ctx.scale(sc, sc);
    ctx.strokeStyle = '#14161a'; ctx.lineWidth = fs * .16; if (T.edge !== 0) { ctx.strokeStyle = T.edge || '#14161a'; ctx.strokeText(ch, 0, 0); } ctx.fillStyle = T.col || '#fff'; ctx.fillText(ch, 0, 0); ctx.restore();
  };
  if (T.type === 'pop') { // 全体を真ん中からはねさせる
    const sc = u < .55 ? lerp(0, 1.25, ease(u / .55)) : lerp(1.25, 1, ease(seg(u, .55, .85)));
    ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
  }
  if (T.type === 'mask') { ctx.beginPath(); ctx.rect(x - fs * .2, 0, (total + fs * .4) * ease(u), H); ctx.clip(); }
  chars.forEach((ch, i) => {
    let al = 1, dy = 0;
    if (T.type === 'fade' || T.type === 'track') al = u;
    else if (T.type === 'slide') { al = u; dy = (1 - ease(u)) * H * .16; }
    else if (T.type === 'type') al = i < Math.floor(u * (chars.length + .99)) ? 1 : 0;
    else if (T.type === 'stagger') { const v = ease(clamp(u * (1 + chars.length * .28) - i * .28)); al = v; dy = (1 - v) * H * .14; }
    put(ch, x, cy + dy, al, 1); x += ws[i] + sp;
  });
  if (T.type === 'type' && u < 1) { ctx.fillStyle = '#f2b33d'; const n = Math.floor(u * (chars.length + .99)); ctx.fillRect(cx - total / 2 + ws.slice(0, n).reduce((a, b) => a + b, 0) + 2, cy - fs * .5, fs * .08, fs); }
  ctx.restore();
}

// 音の波。rows: [{label, col, amp(x)→0〜1, smooth}]、t＝いまの位置
function drawSnd(ctx, W, H, S) {
  const n = S.rows.length, y0 = H * (n > 1 ? .64 : .74), hh = H * .97 - y0, x0 = W * .2, w = W * .74, rh = hh / n, N = 60;
  ctx.fillStyle = 'rgba(20,22,26,.9)'; ctx.fillRect(W * .04, y0 - 4, W * .92, hh + 6);
  ctx.textBaseline = 'middle'; ctx.font = `700 ${Math.max(9, W * .032)}px "Hiragino Sans",sans-serif`;
  S.rows.forEach((r, j) => {
    const cy = y0 + rh * (j + .5); ctx.fillStyle = '#eceae4'; ctx.fillText(r.label, W * .055, cy);
    for (let i = 0; i < N; i++) {
      const x = i / N, a = clamp(r.amp(x)) * (r.smooth ? .85 + .15 * hsh(i + j * 100) : .45 + .55 * hsh(i + j * 100)), bh = Math.max(1, a * rh * .86);
      ctx.fillStyle = r.col || '#f2b33d'; ctx.globalAlpha = x <= S.t ? 1 : .35; ctx.fillRect(x0 + x * w, cy - bh / 2, w / N * .7, bh);
    }
    ctx.globalAlpha = 1;
  });
  ctx.fillStyle = '#fff'; ctx.fillRect(x0 + S.t * w - 1, y0 - 4, 2, hh + 6);
}

// 画面の形と質感：粒・傷・走査線・周辺の暗さ・黒帯・文字を置いてよい場所
function drawFormat(ctx, W, H, c, time) {
  const f = Math.floor(time * 12);
  if (c.grain > 0) { const sz = Math.max(1, W * .005); for (let i = 0; i < 520; i++) { ctx.fillStyle = `rgba(${i % 2 ? '255,255,255' : '0,0,0'},${.3 * c.grain})`; ctx.fillRect(hsh(f * 13 + i) * W, hsh(f * 7 + i * 3) * H, sz, sz); } }
  if (c.scratch > 0) {
    ctx.fillStyle = `rgba(0,0,0,${hsh(f) * .2})`; ctx.fillRect(0, 0, W, H);
    for (let j = 0; j < 3; j++) { ctx.fillStyle = `rgba(255,250,235,${.25 + hsh(f + j) * .4})`; ctx.fillRect(hsh(f * 3 + j * 17) * W, 0, Math.max(1, W * .003), H); }
    ctx.fillStyle = 'rgba(30,20,10,.7)'; for (let j = 0; j < 5; j++) { ctx.beginPath(); ctx.arc(hsh(f * 5 + j) * W, hsh(f * 11 + j) * H, W * (.004 + hsh(j + f) * .008), 0, 7); ctx.fill(); }
  }
  if (c.scan > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .3; ctx.drawImage(ctx.canvas, W * .012, 0); ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,.2)'; const st = Math.max(3, Math.round(H / 70)); for (let y = 0; y < H; y += st) ctx.fillRect(0, y, W, Math.max(1, st / 3));
    const by = Math.floor(((time * .22) % 1) * H), bh = Math.floor(H * .07); ctx.drawImage(ctx.canvas, 0, by, W, bh, W * .035, by, W, bh);
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(0, by, W, 2);
  }
  if (c.vig > 0) { const g = ctx.createRadialGradient(W / 2, H / 2, W * .25, W / 2, H / 2, W * .68); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${.9 * c.vig})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  if (c.aspect) {
    const R = W / H; ctx.fillStyle = '#000';
    if (c.aspect > R + .001) { const bh = (H - W / c.aspect) / 2; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh); }
    else if (c.aspect < R - .001) { const bw = (W - H * c.aspect) / 2; ctx.fillRect(0, 0, bw, H); ctx.fillRect(W - bw, 0, bw, H); }
  }
  if (c.safe) { // スマホ縦：ボタンや説明で隠れる所（赤）と、文字を置いてよい所（緑の点線）
    const w = H * 9 / 16, x0 = (W - w) / 2; ctx.fillStyle = 'rgba(184,92,74,.5)';
    ctx.fillRect(x0, 0, w, H * .12); ctx.fillRect(x0, H * .76, w, H * .24); ctx.fillRect(x0 + w * .82, H * .12, w * .18, H * .64);
    ctx.strokeStyle = '#4fb3a5'; ctx.lineWidth = Math.max(1.5, W * .004); ctx.setLineDash([W * .012, W * .008]); ctx.strokeRect(x0 + w * .05, H * .14, w * .74, H * .6); ctx.setLineDash([]);
  }
}
