// 図の型の追加：光（スタジオ）、色（前と後を線で比べる）、カット（下に時間の帯）、場面転換（2つの絵を混ぜる）
const OFF = {};
function off(W, H, slot) {
  const k = slot + W + 'x' + H; let c = OFF[k];
  if (!c) { c = OFF[k] = document.createElement('canvas'); c.width = W; c.height = H; }
  return c;
}
const rgb = (c, p) => `rgb(${c.map(v => Math.round(v * p)).join(',')})`;
const WHITE = [255, 244, 225];

// ---- 光：暗いスタジオで、ねこに当たる光を計算して描く ----
function renderLight(ctx, W, H, c, time) {
  const bg = ctx.createRadialGradient(W / 2, H * .45, 0, W / 2, H * .45, W * .7);
  const bc = c.bgc || [200, 205, 215];
  bg.addColorStop(0, rgb(bc, c.bgl)); bg.addColorStop(1, rgb(bc, c.bgl * .3));
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const k = H * .84, px = W / 2, py = H * 1.12, hx = px, hy = py - .8 * k, R = .3 * k;
  const S = off(W, H, 's'), s = S.getContext('2d'); s.clearRect(0, 0, W, H); const co = (c.face || c.mouth || c.eye !== 1 || c.hl) ? c : undefined; drawCat(s, px, py, k, '#ee8a3a', time, 0, co);
  const M = off(W, H, 'm'), m = M.getContext('2d');
  m.globalCompositeOperation = 'source-over'; m.fillStyle = rgb([255, 255, 255], c.amb); m.fillRect(0, 0, W, H);
  for (const L of c.L || []) {
    if (L.p <= 0) continue;
    const az = L.az / 57.3, el = L.el / 57.3, lx = Math.sin(az), up = Math.sin(el), lz = Math.cos(az) * Math.cos(el), col = L.col || WHITE;
    if (lz > -.2) { // 前や横からの光：光の側に明るい円
      const cx = hx + lx * Math.cos(el) * R * 1.15, cy = hy - up * R * 1.15 + (py - hy) * .25, g = m.createRadialGradient(cx, cy, 0, cx, cy, R * 3.4);
      const e0 = .46 - .3 * L.soft, e1 = .5 + .4 * L.soft;
      g.addColorStop(0, rgb(col, L.p)); g.addColorStop(e0, rgb(col, L.p)); g.addColorStop(e1, '#000'); g.addColorStop(1, '#000');
      m.globalCompositeOperation = 'lighter'; m.fillStyle = g; m.fillRect(0, 0, W, H);
    } else { // 後ろからの光：ふちだけ光る
      const Rm = off(W, H, 'r'), r = Rm.getContext('2d'); r.globalCompositeOperation = 'source-over'; r.clearRect(0, 0, W, H);
      drawCat(r, px, py, k, '#fff', 1.3, 0, co); r.fillStyle = '#fff'; r.globalCompositeOperation = 'source-in'; r.fillRect(0, 0, W, H);
      r.globalCompositeOperation = 'destination-out'; const w = k * .045;
      r.drawImage(S, -lx * w * 1.6, (up + .5) * w);
      r.globalCompositeOperation = 'source-in'; r.fillStyle = rgb(col, L.p); r.fillRect(0, 0, W, H);
      m.globalCompositeOperation = 'lighter'; m.drawImage(Rm, 0, 0);
    }
  }
  const A = off(W, H, 'a'), a = A.getContext('2d'); a.globalCompositeOperation = 'source-over'; a.clearRect(0, 0, W, H);
  a.drawImage(S, 0, 0); a.globalCompositeOperation = 'multiply'; a.drawImage(M, 0, 0);
  a.globalCompositeOperation = 'destination-in'; a.drawImage(S, 0, 0);
  ctx.drawImage(A, 0, 0);
}
function renderLightMap(ctx, W, H, c) {
  ctx.fillStyle = '#191c21'; ctx.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H * .45, r = Math.min(W, H) * .36;
  ctx.fillStyle = '#f2b33d'; ctx.fillRect(cx - 6, cy + r + 8, 12, 9); // カメラ
  for (const L of c.L || []) {
    if (L.p <= 0) continue;
    const az = L.az / 57.3, x = cx + Math.sin(az) * r, y = cy + Math.cos(az) * r, col = rgb(L.col || WHITE, 1);
    ctx.strokeStyle = col; ctx.globalAlpha = .25 + .75 * Math.min(1, L.p); ctx.lineWidth = 1.5 + 5 * L.soft;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(cx + Math.sin(az) * 9, cy + Math.cos(az) * 9); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  }
  ctx.fillStyle = '#ee8a3a'; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, 7); ctx.fill();
}

// 形のワイプ（tr.clip）: clock 時計 / circle 丸 / star 星 / diag ななめ / blinds すだれ / heart ハート
const WIPES = {
  clock: (x, W, H, u, cx, cy) => { x.moveTo(cx, cy); x.arc(cx, cy, W + H, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * u); x.closePath(); },
  circle: (x, W, H, u, cx, cy) => { x.arc(cx, cy, Math.hypot(W, H) * u, 0, 7); },
  star: (x, W, H, u, cx, cy) => { const R = Math.hypot(W, H) * 1.5 * u; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R * .42 : R; x[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r); } x.closePath(); },
  diag: (x, W, H, u) => { const d = (W + H) * u; x.moveTo(0, 0); x.lineTo(d, 0); x.lineTo(0, d); x.closePath(); },
  blinds: (x, W, H, u) => { for (let i = 0; i < 8; i++) x.rect(0, H / 8 * i, W, H / 8 * u + .5); },
  heart: (x, W, H, u, cx, cy) => { const R = Math.hypot(W, H) * .075 * u; for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2, px = 16 * Math.pow(Math.sin(a), 3), py = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); x[i ? 'lineTo' : 'moveTo'](cx + px * R, cy + py * R); } x.closePath(); }
};
// ---- まとめ役：型を選び、色・転換・帯・枠を重ねる ----
function renderScene(ctx, W, H, c, time) {
  const core = (x, cam) => cam.mode === 'light' ? renderLight(x, W, H, cam, time) : renderCore(x, W, H, cam, time);
  const tr = c.tr;
  if (tr && tr.clip === 'slide') c.ox = tr.u;
  core(ctx, c);
  if (c.keep > 0) { selfDraw(ctx, W, H, `grayscale(${clamp(c.keep)})`); const K = off(W, H, 'k'), q = K.getContext('2d'); q.clearRect(0, 0, W, H); core(q, Object.assign({}, c, { plain: 'none', keep: 0, cats: c.keepAll ? c.cats : null, crowd: c.keepAll ? c.crowd : false, props: (c.props || []).filter(p => p.keep), tint: null, sepia: 0 })); ctx.drawImage(K, 0, 0); }
  if (c.over) { const O = off(W, H, 'o'), o = O.getContext('2d'); o.clearRect(0, 0, W, H); core(o, c.over); ctx.drawImage(O, 0, 0); if (c.over._a) c._a = c.over._a; }
  if (tr && (tr.mix > 0 || tr.clip)) { // 場面転換：次の絵を別に描いて重ねる
    const B = off(W, H, 'b'), b = B.getContext('2d'); b.clearRect(0, 0, W, H); core(b, tr.B);
    ctx.save();
    if (tr.clip === 'wipe') { ctx.beginPath(); ctx.rect(W * (1 - tr.u), 0, W * tr.u, H); ctx.clip(); ctx.drawImage(B, 0, 0); ctx.fillStyle = '#fff'; ctx.fillRect(W * (1 - tr.u) - 1, 0, 2, H); }
    else if (tr.clip === 'slide') ctx.drawImage(B, W * (1 - tr.u), 0);
    else if (WIPES[tr.clip]) { ctx.beginPath(); WIPES[tr.clip](ctx, W, H, clamp(tr.u), W * (tr.cx == null ? .5 : tr.cx), H * (tr.cy == null ? .5 : tr.cy)); ctx.clip(); ctx.drawImage(B, 0, 0); }
    else { ctx.globalAlpha = tr.mix; ctx.drawImage(B, 0, 0); }
    ctx.restore();
  }
  if (c.grade && c.wipe > 0) { // 色：線の左だけ色を変える
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W * c.wipe, H); ctx.clip();
    if (c.grade.f) { ctx.filter = c.grade.f; ctx.drawImage(ctx.canvas, 0, 0); ctx.filter = 'none'; }
    for (const [col, op] of c.grade.ov || []) { ctx.globalCompositeOperation = op; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
    if (c.wipe < 1) {
      ctx.fillStyle = '#fff'; ctx.fillRect(W * c.wipe - 1, 0, 2, H);
      const fs = Math.max(10, W * .034); ctx.font = `700 ${fs}px "Hiragino Sans",sans-serif`; ctx.textBaseline = 'top';
      ctx.fillStyle = 'rgba(20,22,26,.8)'; ctx.fillRect(W * c.wipe + 6, H * .07, fs * 3.6, fs * 1.5); ctx.fillStyle = '#fff'; ctx.fillText('元の絵', W * c.wipe + 6 + fs * .3, H * .07 + fs * .25);
    }
  }
  drawFx(ctx, W, H, c, time);
  if (c.pixel > 1) { // ドット絵・モザイク：横に pixel 個の升にする
    const n = Math.max(4, Math.round(c.pixel)), m = Math.max(2, Math.round(n * H / W)), P = off(W, H, 'p'), q = P.getContext('2d'); q.imageSmoothingEnabled = true; q.clearRect(0, 0, W, H); q.drawImage(ctx.canvas, 0, 0, W, H, 0, 0, n, m);
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(P, 0, 0, n, m, 0, 0, W, H); ctx.restore();
  }
  if (c.pip) { // 小さな窓：画面の中（縦長ならその中）に別の絵をはめる。{cam,x,y,w,h} は 0〜1
    const as = c.aspect && c.aspect < W / H ? c.aspect : 0, vw = as ? H * as : W, vx = (W - vw) / 2;
    c.pip.forEach((p, i) => {
      if (!(p.w > 0 && p.h > 0)) return;
      const P = off(W, H, 'pip' + i + '_'), q = P.getContext('2d'); q.clearRect(0, 0, W, H); core(q, p.cam);
      const dx = vx + p.x * vw, dy = p.y * H, dw = p.w * vw, dh = p.h * H, k = Math.max(dw / W, dh / H), sw = dw / k, sh = dh / k;
      ctx.drawImage(P, (W - sw) / 2 + (p.cx || 0) * W, (H - sh) / 2 + (p.cy || 0) * H, sw, sh, dx, dy, dw, dh);
      if (p.frame !== 0) { ctx.strokeStyle = p.col || '#fff'; ctx.lineWidth = Math.max(1.5, W * .005); ctx.strokeRect(dx, dy, dw, dh); }
    });
  }
  if (c.iris < 1) { ctx.fillStyle = '#000'; ctx.beginPath(); ctx.rect(0, 0, W, H); const ir = Math.max(0, c.iris) * W * .6; ctx.moveTo(W / 2 + ir, H / 2); ctx.arc(W / 2, H / 2, ir, 0, 6.2832, true); ctx.closePath(); ctx.fill('evenodd'); }
  if (c.black > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.min(1, c.black)})`; ctx.fillRect(0, 0, W, H); }
  if (tr && tr.white > 0) { ctx.fillStyle = `rgba(255,255,255,${Math.min(1, tr.white)})`; ctx.fillRect(0, 0, W, H); }
  if (c.tl) { // カット：下に時間の帯（上＝絵、下＝音）
    const COL = ['#ee8a3a', '#5b86c9', '#9aa0aa', '#b85c4a'], vw = c.aspect && c.aspect < W / H ? H * c.aspect : W, x0 = (W - vw) / 2 + vw * .06, w = vw * .88, rows = c.tl.a ? 2 : 1, rh = H * (rows === 2 ? .045 : .06), y0 = H * .97 - rh * rows - (rows - 1) * 2;
    ctx.fillStyle = 'rgba(20,22,26,.85)'; ctx.fillRect(x0 - 4, y0 - 4, w + 8, rh * rows + (rows - 1) * 2 + 8);
    [c.tl.v, c.tl.a].forEach((row, j) => { if (row) for (const [a, b, i] of row) { ctx.fillStyle = COL[i]; ctx.globalAlpha = j ? .6 : 1; ctx.fillRect(x0 + a * w + 1, y0 + j * (rh + 2), (b - a) * w - 2, rh); } });
    ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; ctx.fillRect(x0 + c.tl.t * w - 1, y0 - 4, 2, rh * rows + 10);
  }
  drawTop(ctx, W, H, c, time);
  if (c.top) { const T = off(W, H, 't'), o = T.getContext('2d'); o.clearRect(0, 0, W, H); core(o, c.top); ctx.drawImage(T, 0, 0); } // 黒帯よりも上に重ねる層
  drawOverlay(ctx, W, H, c);
}
function renderMap(ctx, W, H, c) {
  if (c.mode === 'light') return renderLightMap(ctx, W, H, c);
  renderMapCore(ctx, W, H, c);
  if (c.axis) { // 2人を結ぶ線（180度の決まり）
    const zmin = Math.min(-12, c.z - 2), sc = (H - 16) / (18 - zmin), X = x => W / 2 + x * sc, Z = z => H - 8 - (z - zmin) * sc;
    ctx.strokeStyle = '#fff'; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, Z(0)); ctx.lineTo(W, Z(0)); ctx.stroke(); ctx.setLineDash([]);
  }
}
// カットの並び：長さの配列から、いま何番目か・その中の進み・帯の形を出す
function seq(t, lens, cols) {
  const sum = lens.reduce((a, b) => a + b, 0); let acc = 0, i = 0, u = 0; const v = [];
  lens.forEach((l, j) => { const a = acc / sum, b = (acc + l) / sum; v.push([a, b, cols ? cols[j % cols.length] : j % 2]); if (t >= a && (t < b || j === lens.length - 1)) { i = j; u = (t - a) / (b - a); } acc += l; });
  return { i, u, tl: { v, t } };
}
