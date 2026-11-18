// 動く図の仕組み：カメラの位置・向き・焦点距離・ピントを数字で受け取り、遠近を計算して描く
const FIELDS = [];
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (t, a, b) => clamp((t - a) / (b - a)); // tのうち a〜b の区間を 0〜1 に
const jump = u => 4 * u * (1 - u) * 1.3;           // とび上がる高さ（u=0〜1）

function Cam(o) {
  return Object.assign({
    x: 0, y: .7, z: -7, f: 35, yaw: 0, pitch: 0, roll: 0,
    dz: 1, ox: 0, oy: 0, shake: 0, streak: 0, hstreak: 0, sepia: 0, still: false, crowd: false,
    ax: 0, ay: 0, az: 0, cats: null, trail: null,
    grain: 0, scratch: 0, scan: 0, vig: 0, aspect: 0, safe: false,
    plain: '', noA: false, sq: 1, sx: 1, over: null, glow: 0, glitch: 0, part: null, roto: 0, track: 0, text: null, snd: null,
    mode: '', L: null, amb: .06, bgl: .18, grade: null, wipe: 1, gv: null, tr: null, black: 0, iris: 1, tl: null, axis: false, shot: 1,
    dof: 0, fd: 7, cap: '', grid: '', flare: 0, tilt: 0, sun: [59, 44], tint: null, frame: 0, flash: 0,
    rate: 1, fps: 24, face: 0, mouth: 0, eye: 1, hl: 0, props: null, sky: null, keep: 0
  }, o);
}
// カメラを (tx,ty,tz) に向ける
function at(c, tx, ty, tz) {
  c.yaw = Math.atan2(tx - c.x, tz - c.z);
  c.pitch = Math.atan2(ty - c.y, Math.hypot(tx - c.x, tz - c.z)); return c;
}
const aimHead = c => at(c, c.ax, .85, c.az);
function aimHeadBy(c, u) { c.pitch = Math.atan((.85 - c.y) / -c.z) * clamp(u); return c; }

const PILLARS = [];
for (let i = -4; i < 6; i++) for (const sx of [-1, 1]) PILLARS.push({ x: sx * 3.2, z: 3 + i * 6 });
const BUILD = [[-17, 5, 7], [-10, 4, 11], [-4.5, 3.5, 6], [1, 4, 13], [6.5, 5, 8], [13, 4, 11], [18, 5, 6]];
const MOUNT = [[-130, 170, 48], [40, 210, 64], [170, 150, 36]];
const CROWD = [[-1.6, .5], [1.5, .3], [-2.8, .2], [2.9, .6], [-1.3, -2.5], [1.4, -3], [-2.6, -4.5], [2.5, -5.5], [-1.8, -6.5], [1.9, -7.5]];

function drawCat(ctx, px, py, k, col, time, seed, o) {
  // o = { face: -1〜1（左右を向く）| 'b'（後ろ姿）, mouth: 0〜1（口の開き）, eye: 0〜1.6（目の開き）, hl: 0〜1（目の光） }。省略なら正面のふつうの顔
  const back = o && o.face === 'b', f = o && !back ? clamp(+o.face || 0, -1, 1) : 0, af = Math.abs(f), m = o ? clamp(+o.mouth || 0) : 0, ey = o && o.eye != null ? clamp(+o.eye, 0, 1.6) : 1, hl = o ? clamp(+o.hl || 0) : 0;
  const wag = Math.sin(time * 3 + seed) * .08, ts = 1 - 2 * clamp(f / .5), fx = f * .13 * k;
  const tail = () => { ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, .07 * k); ctx.lineCap = 'round'; ctx.beginPath();
    if (back) { ctx.moveTo(px, py - .1 * k); ctx.quadraticCurveTo(px + .2 * k, py - .3 * k, px + (.1 + wag) * k, py - .58 * k); }
    else { ctx.moveTo(px + ts * .22 * k, py - .12 * k); ctx.quadraticCurveTo(px + ts * .5 * k, py - .15 * k, px + ts * (.48 + wag) * k, py - .5 * k); }
    ctx.stroke(); };
  if (!back) tail();
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.ellipse(px, py - .33 * k, .27 * k, .33 * k, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(px, py - .85 * k, .26 * k, 0, 7); ctx.fill();
  if (af > .3) { ctx.beginPath(); ctx.ellipse(px + f * .25 * k, py - .79 * k, .1 * k * af, .075 * k, 0, 0, 7); ctx.fill(); }
  for (const s of [-1, 1]) { const e = s * f > 0 ? 1 - .45 * af : 1, x0 = px - f * .05 * k;
    ctx.beginPath(); ctx.moveTo(x0 + s * .24 * k, py - .95 * k);
    ctx.lineTo(x0 + s * (.24 - .04 * e) * k, py - 1.22 * k); ctx.lineTo(x0 + s * (.24 - .2 * e) * k, py - 1.07 * k); ctx.fill();
  }
  if (back) { tail(); ctx.save(); ctx.strokeStyle = 'rgba(40,25,10,.28)'; ctx.lineWidth = Math.max(1, .07 * k); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(px, py - .1 * k); ctx.quadraticCurveTo(px + .2 * k, py - .3 * k, px + (.1 + wag) * k, py - .58 * k); ctx.stroke(); ctx.restore(); return; }
  ctx.fillStyle = '#fff6ea';
  ctx.beginPath(); ctx.ellipse(px + f * .1 * k, py - .3 * k, .15 * k * (1 - .4 * af), .2 * k, 0, 0, 7); ctx.fill();
  if (k > 14) {
    const blink = (time * .5 + seed) % 3 < .08 ? .1 : 1;
    ctx.fillStyle = '#2a2420';
    for (const s of [-1, 1]) { const far = s * f > 0 ? 1 - .55 * af : 1, ex = px + fx + s * .1 * k * (1 - .3 * af), eyy = py - .88 * k, rx = .035 * k * far * (1 + Math.max(0, ey - 1) * .5), ry = .05 * k * blink * ey;
      if (ey < .12) { ctx.strokeStyle = '#2a2420'; ctx.lineWidth = Math.max(1, .022 * k); ctx.beginPath(); ctx.arc(ex, eyy - .02 * k, .045 * k * far, .15 * Math.PI, .85 * Math.PI); ctx.stroke(); continue; }
      ctx.beginPath(); ctx.ellipse(ex, eyy, rx, ry, 0, 0, 7); ctx.fill();
      if (hl > 0 && blink === 1) { ctx.fillStyle = `rgba(255,255,255,${hl})`; ctx.beginPath(); ctx.arc(ex + rx * .35, eyy - ry * .4, Math.max(.8, .016 * k), 0, 7); ctx.fill(); ctx.fillStyle = '#2a2420'; } }
    const nx = px + fx * 1.25;
    ctx.beginPath(); ctx.moveTo(nx - .03 * k, py - .79 * k); ctx.lineTo(nx + .03 * k, py - .79 * k); ctx.lineTo(nx, py - .75 * k); ctx.fill();
    if (m > 0) { ctx.fillStyle = '#7a2a26'; ctx.beginPath(); ctx.ellipse(nx, py - (.725 - .03 * m) * k, .045 * k * (.7 + .3 * m), .055 * k * m, 0, 0, 7); ctx.fill(); }
  }
}
// 物（props）: box 箱 / ball 玉 / cloud 雲 / smoke 煙 / glow 光の玉。s は大きさ(m)、col は色、a は濃さ、u は煙の進み
function drawProp(ctx, px, py, k, p, g0, time) {
  const s = (p.s || .6) * k, a = p.a == null ? 1 : p.a; ctx.save(); ctx.globalAlpha *= a;
  if (p.t === 'box' || p.t === 'ball') { ctx.fillStyle = 'rgba(60,50,40,.18)'; ctx.beginPath(); ctx.ellipse(g0[0] + .1 * g0[2], g0[1], (p.w || p.s || .6) * g0[2] * .62, .07 * g0[2], 0, 0, 7); ctx.fill(); }
  if (p.t === 'box') { const w = (p.w || p.s || .6) * k, h = (p.h || p.s || .6) * k, d = Math.min(w, h) * .16;
    ctx.fillStyle = p.col || '#a9794a'; ctx.fillRect(px - w / 2, py - h, w, h);
    ctx.fillStyle = p.col || '#a9794a'; ctx.beginPath(); ctx.moveTo(px - w / 2, py - h); ctx.lineTo(px - w / 2 + d, py - h - d); ctx.lineTo(px + w / 2 + d, py - h - d); ctx.lineTo(px + w / 2 + d, py - d); ctx.lineTo(px + w / 2, py); ctx.lineTo(px + w / 2, py - h); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.moveTo(px - w / 2, py - h); ctx.lineTo(px - w / 2 + d, py - h - d); ctx.lineTo(px + w / 2 + d, py - h - d); ctx.lineTo(px + w / 2, py - h); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.moveTo(px + w / 2, py - h); ctx.lineTo(px + w / 2 + d, py - h - d); ctx.lineTo(px + w / 2 + d, py - d); ctx.lineTo(px + w / 2, py); ctx.fill();
  } else if (p.t === 'ball') { const r = s / 2; ctx.fillStyle = p.col || '#d9483b'; ctx.beginPath(); ctx.arc(px, py - r, r, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(px - r * .3, py - r * 1.35, r * .28, 0, 7); ctx.fill();
  } else if (p.t === 'glow') { const g = ctx.createRadialGradient(px, py, 0, px, py, s), col = p.col || '255,220,150'; g.addColorStop(0, `rgba(${col},.95)`); g.addColorStop(.25, `rgba(${col},.45)`); g.addColorStop(1, `rgba(${col},0)`); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(px - s, py - s, s * 2, s * 2);
  } else if (p.t === 'cloud') { ctx.fillStyle = p.col || '#ffffff'; for (const [dx, dy, r] of [[-.55, 0, .3], [-.2, -.16, .4], [.22, -.1, .36], [.58, .02, .27], [0, .08, .34]]) { ctx.beginPath(); ctx.arc(px + dx * s, py + dy * s, r * s, 0, 7); ctx.fill(); }
  } else if (p.t === 'smoke') { const col = p.col || '120,120,128', n = p.n || 9;
    for (let i = 0; i < n; i++) { const v = ((p.u == null ? time * .25 : p.u) + i / n) % 1, r = s * (.18 + .5 * v), x = px + Math.sin(i * 2.4 + v * 3) * s * .3 * v, y = py - v * s * 2.2;
      ctx.fillStyle = `rgba(${col},${(.75 * (1 - v)).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
  }
  ctx.restore();
}
// いま描いてある絵に、ぼかしなどをかけて描き直す
function selfDraw(ctx, W, H, filter, clip) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (clip) { ctx.beginPath(); for (const [y0, y1] of clip) ctx.rect(0, y0 * H, W, (y1 - y0) * H); ctx.clip(); }
  ctx.filter = filter; ctx.drawImage(ctx.canvas, 0, 0); ctx.restore();
}

function renderCore(ctx, W, H, c, time) {
  if (c.still) time = 1.3;
  let yaw = c.yaw, pitch = c.pitch;
  if (c.shake) {
    yaw += c.shake * (Math.sin(time * 9.1) + Math.sin(time * 5.3 + 1)) * .006;
    pitch += c.shake * (Math.sin(time * 7.7 + 2) + Math.sin(time * 4.1)) * .005;
  }
  const s = c.f / 36 * W, cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const P = (X, Y, Z) => {
    const dx = X - c.x, dy = Y - c.y, dz = Z - c.z;
    const x1 = dx * cy - dz * sy, z1 = dx * sy + dz * cy;
    const y2 = dy * cp - z1 * sp, d = dy * sp + z1 * cp;
    return d < .3 ? null : [W / 2 + x1 / d * s, H / 2 - y2 / d * s, s / d, d];
  };
  const blurOf = d => c.dof ? Math.min(W * .03, c.dof * Math.pow(c.f / 50, 1.5) * W * .045 * Math.abs(1 / c.fd - 1 / d)) : 0;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  ctx.translate(W / 2, H / 2); ctx.rotate(c.roll);
  const zz = c.dz * (1 + Math.abs(Math.sin(c.roll)) * .9); ctx.scale(zz, zz);
  ctx.translate(-W / 2 - c.ox * W, -H / 2 - c.oy * H);

  let sun = null; const bgOn = !c.plain;
  if (c.plain && c.plain !== 'none') { ctx.fillStyle = c.plain; ctx.fillRect(-W * 2, -H * 2, W * 5, H * 5); }
  if (bgOn) {
  const hz = H / 2 + Math.tan(clamp(pitch, -1.3, 1.3)) * s; // 地平線
  const g = ctx.createLinearGradient(0, hz - H * (c.sky ? .62 : 1), 0, hz);
  g.addColorStop(0, c.sky ? c.sky[0] : '#9cc3e4'); g.addColorStop(1, c.sky ? c.sky[1] : '#f1e4cc');
  ctx.fillStyle = g; ctx.fillRect(-W * 2, -H * 4, W * 5, hz + H * 4);
  sun = P(c.sun[0], c.sun[1], 220);
  if (sun) { ctx.fillStyle = '#fff4c8'; ctx.beginPath(); ctx.arc(sun[0], sun[1], .03 * s, 0, 7); ctx.fill(); }
  ctx.fillStyle = c.sky && c.sky[2] || '#a5b9c9';
  for (const zs of [1, -1]) for (const [x, w, h] of MOUNT) {
    const a = P(x - w / 2, 0, 220 * zs), b = P(x + w / 2, 0, 220 * zs), t = P(x, h, 220 * zs);
    if (a && b && t) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(t[0], t[1]); ctx.lineTo(b[0], b[1]); ctx.fill(); }
  }
  ctx.fillStyle = '#cdc5b3'; ctx.fillRect(-W * 2, hz, W * 5, H * 5);
  // 道
  ctx.fillStyle = '#b6ae9d';
  for (let z = -40; z < 140; z += 1) {
    const a = P(-2.2, 0, z), b = P(2.2, 0, z), e = P(2.2, 0, z + 1.05), f = P(-2.2, 0, z + 1.05);
    if (a && b && e && f) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(e[0], e[1]); ctx.lineTo(f[0], f[1]); ctx.fill(); }
  }
  ctx.strokeStyle = '#a39b8a';
  for (let z = -39; z < 70; z += 3) {
    const a = P(-2.2, 0, z), b = P(2.2, 0, z); if (!a || !b) continue;
    ctx.lineWidth = Math.max(.5, Math.min(a[2], b[2]) * .04); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  }
  // 遠い建物
  for (const zs of [1, -1]) for (const [x, w, h] of BUILD) {
    const a = P(x - w / 2, 0, 45 * zs), b = P(x + w / 2, h, 45 * zs); if (!a || !b) continue;
    const x0 = Math.min(a[0], b[0]), bw = Math.abs(b[0] - a[0]);
    ctx.fillStyle = '#8f9cab'; ctx.fillRect(x0, b[1], bw, a[1] - b[1]);
    ctx.fillStyle = '#a9b5c2';
    for (let wy = 1.2; wy < h - .6; wy += 1.6) { const q = P(x - w / 2 + .5, wy, 45 * zs), r = P(x + w / 2 - .5, wy + .6, 45 * zs); if (q && r) ctx.fillRect(Math.min(q[0], r[0]), r[1], Math.abs(r[0] - q[0]), q[1] - r[1]); }
  }
  }
  if (c.dof && bgOn) { const b = blurOf(1e6) * .8; if (b > .5) selfDraw(ctx, W, H, `blur(${b.toFixed(1)}px)`); }
  // 手前の物を奥から順に
  const list = [];
  if (bgOn) for (const p of PILLARS) { const q = P(p.x, 0, p.z); if (q) list.push({ q, t: 'p' }); }
  const addCat = (x, y, z, col, i, a) => { const q = P(x, y, z), g0 = P(x, 0, z); if (q && g0) list.push({ q, g0, t: 'c', col, i, a }); };
  if (c.trail) for (const [dx, dy, a] of c.trail) addCat(c.ax + dx, c.ay + dy, c.az + .001, '#ee8a3a', 0, a);
  if (!c.noA) { addCat(c.ax, c.ay, c.az, '#ee8a3a', 0, 1); const m = list[list.length - 1]; if (m && m.t === 'c') c._a = m.q; }
  if (c.crowd) CROWD.forEach(([x, z], i) => addCat(x, 0, z, '#5b86c9', i + 1, 1));
  if (c.cats) c.cats.forEach(([x, z, fc, mo], i) => { addCat(x, 0, z, '#5b86c9', i + 1, 1); const m = list[list.length - 1]; if (m && m.t === 'c' && (fc || mo)) m.o = { face: fc === 'b' ? fc : (fc || 0) * (cy < 0 ? -1 : 1), mouth: mo }; });
  if (c.props) for (const p of c.props) {
    if (p.t === 'line') { const a = P(p.x || 0, p.y || 0, p.z || 0), b = P(p.x2 || 0, p.y2 || 0, p.z2 || 0); if (a && b) list.push({ q: [0, 0, (a[2] + b[2]) / 2, (a[3] + b[3]) / 2], t: 'l', a, b, p }); }
    else { const q = P(p.x || 0, p.y || 0, p.z || 0), g0 = P(p.x || 0, 0, p.z || 0); if (q && g0) list.push({ q, g0, t: 'o', p }); }
  }
  list.sort((a, b) => b.q[3] - a.q[3]);
  for (const o of list) {
    const [px, py, k, d] = o.q, b = blurOf(d);
    if (c.dof) ctx.filter = b > .5 ? `blur(${b.toFixed(1)}px)` : 'none';
    if (o.t === 'p') {
      ctx.fillStyle = 'rgba(60,50,40,.18)'; ctx.beginPath(); ctx.ellipse(px + .15 * k, py, .42 * k, .09 * k, 0, 0, 7); ctx.fill();
      const L = 38 + Math.min(22, d * .7);
      ctx.fillStyle = `hsl(32,9%,${L}%)`; ctx.fillRect(px - .3 * k, py - 3.4 * k, .6 * k, 3.4 * k);
      ctx.fillStyle = `hsl(32,9%,${L - 8}%)`; ctx.fillRect(px - .38 * k, py - 3.55 * k, .76 * k, .18 * k);
    } else if (o.t === 'l') { const p = o.p;
      ctx.save(); ctx.globalAlpha = p.a == null ? 1 : p.a; ctx.strokeStyle = p.col || '#33373d'; ctx.lineWidth = Math.max(1, (p.w || .03) * k); ctx.lineCap = 'round'; if (p.dash) ctx.setLineDash([k * .12, k * .12]);
      ctx.beginPath(); ctx.moveTo(o.a[0], o.a[1]); ctx.lineTo(o.b[0], o.b[1]); ctx.stroke(); ctx.restore();
    } else if (o.t === 'o') drawProp(ctx, px, py, k, o.p, o.g0, time);
    else {
      ctx.globalAlpha = o.a;
      ctx.fillStyle = 'rgba(60,50,40,.18)'; ctx.beginPath(); ctx.ellipse(o.g0[0] + .15 * o.g0[2], o.g0[1], .42 * o.g0[2], .09 * o.g0[2], 0, 0, 7); ctx.fill();
      const co = o.i === 0 ? ((c.face || c.mouth || c.eye !== 1 || c.hl) ? { face: c.face === 'b' ? 'b' : c.face * (cy < 0 ? -1 : 1), mouth: c.mouth, eye: c.eye, hl: c.hl } : undefined) : o.o;
      if (o.i === 0 && (c.sq !== 1 || c.sx !== 1)) { ctx.save(); ctx.translate(px, py); ctx.scale(c.sx, c.sq); drawCat(ctx, 0, 0, k, o.col, time, 0, co); ctx.restore(); }
      else drawCat(ctx, px, py, k, o.col, time, o.i, co); ctx.globalAlpha = 1;
    }
  }
  ctx.filter = 'none';
  if (c.sepia) { ctx.fillStyle = `rgba(140,95,40,${c.sepia})`; ctx.fillRect(-W * 2, -H * 2, W * 5, H * 5); }
  if (c.tint) { ctx.fillStyle = `rgba(${c.tint})`; ctx.fillRect(-W * 2, -H * 2, W * 5, H * 5); }
  ctx.restore();

  if (c.tilt) { selfDraw(ctx, W, H, 'saturate(1.7)'); selfDraw(ctx, W, H, `blur(${(W * .012).toFixed(1)}px)`, [[0, .3], [.72, 1]]); selfDraw(ctx, W, H, `blur(${(W * .012).toFixed(1)}px)`, [[0, .16], [.86, 1]]); }
  if (c.hstreak > 0) { ctx.save(); ctx.globalAlpha = .22; for (let i = -4; i <= 4; i++) if (i) ctx.drawImage(ctx.canvas, i * W * .035 * c.hstreak, 0); ctx.restore(); }
  if (c.streak > 0) { // 急な動きのぶれ（放射状の線）
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
    ctx.strokeStyle = `rgba(255,255,255,${.3 * c.streak})`; ctx.lineWidth = W * .012;
    for (let i = 0; i < 36; i++) {
      const a = i / 36 * 6.283 + (i % 3) * .05, r0 = W * (.16 + (i * 7 % 5) * .03);
      ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * r0, H / 2 + Math.sin(a) * r0);
      ctx.lineTo(W / 2 + Math.cos(a) * W, H / 2 + Math.sin(a) * W); ctx.stroke();
    }
    ctx.restore();
  }
  if (c.flare > 0 && sun) { // レンズフレア：太陽と画面の真ん中を結ぶ線の上に光の輪
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
    const gl = ctx.createRadialGradient(sun[0], sun[1], 0, sun[0], sun[1], W * .5);
    gl.addColorStop(0, `rgba(255,240,200,${.4 * c.flare})`); gl.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);
    for (const [u, r, col] of [[.45, .035, '255,190,120'], [.9, .02, '160,220,255'], [1.35, .06, '255,170,150'], [1.8, .1, '170,255,210']]) {
      ctx.fillStyle = `rgba(${col},${.35 * c.flare})`; ctx.beginPath();
      ctx.arc(lerp(sun[0], W / 2, u), lerp(sun[1], H / 2, u), W * r, 0, 7); ctx.fill();
    }
    ctx.restore();
  }
  if (c.flash) { ctx.fillStyle = `rgba(255,255,255,${c.flash})`; ctx.fillRect(0, 0, W, H); }
  if (c.frame) { ctx.strokeStyle = '#fff'; ctx.lineWidth = W * .04; ctx.strokeRect(0, 0, W, H); }
  if (c.grid) {
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = Math.max(1, W * .003); ctx.beginPath();
    const L = c.grid === 'thirds' ? [1 / 3, 2 / 3] : [.5];
    for (const u of L) { ctx.moveTo(u * W, 0); ctx.lineTo(u * W, H); ctx.moveTo(0, u * H); ctx.lineTo(W, u * H); }
    ctx.stroke();
  }
}
function drawOverlay(ctx, W, H, c) {
  // ファインダーの角
  const m = W * .035, l = W * .05; ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = Math.max(1, W * .004);
  for (const [x, y, dx, dy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) {
    ctx.beginPath(); ctx.moveTo(x + dx * l, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * l); ctx.stroke();
  }
  if (c.cap) { // 絵の中の小さな説明
    const fs = Math.max(11, W * .042); ctx.font = `700 ${fs}px "Hiragino Sans",sans-serif`;
    const tw = ctx.measureText(c.cap).width, bx = W * .06, by = H - W * .06 - fs * 1.5 - (c.tl ? H * .13 : 0) - (c.snd ? H * (c.snd.rows.length > 1 ? .37 : .27) : 0);
    ctx.fillStyle = 'rgba(20,22,26,.85)'; ctx.fillRect(bx, by, tw + fs, fs * 1.6);
    ctx.fillStyle = '#f2b33d'; ctx.textBaseline = 'middle'; ctx.fillText(c.cap, bx + fs * .5, by + fs * .82);
  }
}

// 上から見た図：カメラの位置と、写る範囲（扇）
function renderMapCore(ctx, W, H, c) {
  ctx.fillStyle = '#191c21'; ctx.fillRect(0, 0, W, H);
  const zmin = Math.min(-12, c.z - 2), sc = (H - 16) / (18 - zmin), X = x => W / 2 + x * sc, Z = z => H - 8 - (z - zmin) * sc;
  ctx.fillStyle = '#2a2e35'; ctx.fillRect(X(-2.2), 0, 4.4 * sc, H);
  const half = Math.atan(18 / c.f), R = 80 * sc;
  ctx.fillStyle = 'rgba(79,179,165,.28)'; ctx.strokeStyle = '#4fb3a5'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(X(c.x), Z(c.z));
  ctx.lineTo(X(c.x) + Math.sin(c.yaw - half) * R, Z(c.z) - Math.cos(c.yaw - half) * R);
  ctx.lineTo(X(c.x) + Math.sin(c.yaw + half) * R, Z(c.z) - Math.cos(c.yaw + half) * R);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#7c776e'; for (const p of PILLARS) ctx.fillRect(X(p.x) - 2.5, Z(p.z) - 2.5, 5, 5);
  ctx.fillStyle = '#5b86c9';
  for (const [x, z] of [...(c.crowd ? CROWD : []), ...(c.cats || [])]) { ctx.beginPath(); ctx.arc(X(x), Z(z), 3, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#ee8a3a'; ctx.beginPath(); ctx.arc(X(c.ax), Z(c.az), 5, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(X(c.x), Z(c.z)); ctx.rotate(c.yaw); ctx.fillStyle = '#f2b33d'; ctx.fillRect(-6, -3, 12, 9); ctx.restore();
}

// ノートの項目ごとの追加の図。data/xNN.js が XF('NN', { '項目名': { dur, fn } | { ref: 'id' } }) で登録する
const XFIG = {};
function XF(no, o) { XFIG[no] = Object.assign(XFIG[no] || {}, o); }
