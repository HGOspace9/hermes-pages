// 画面の組み立て：図鑑・くわしい画面・クイズ・覚えた記録
const ALL = FIELDS.flatMap(f => f.items.map(t => (t.field = f, t)));
const byId = id => ALL.find(t => t.id === id);
const $ = s => document.querySelector(s);
const HOLD0 = .7, HOLD1 = 1.0;
const deg = r => Math.round(r * 57.3) + '度';
// つまみ：[くわしい画面の名前, 値の読み方, カードの札の名前]
const SL = {
  f: ['レンズ（焦点距離）', c => [Math.log(c.f / 14) / Math.log(10), Math.round(c.f) + 'mm'], 'レンズ'],
  z: ['カメラから主役まで', c => { const d = Math.hypot(c.x - c.ax, c.z - c.az); return [d / 12, d.toFixed(1) + 'm']; }, 'カメラの距離'],
  dz: ['後から拡大', c => [(c.dz - 1) / 1.2, c.dz.toFixed(2) + '倍'], '後から拡大'],
  yaw: ['左右の向き', c => [.5 + c.yaw / 1.6, deg(c.yaw)], '左右の向き'],
  pitch: ['上下の向き', c => [.5 + c.pitch / 1.6, deg(c.pitch)], '上下の向き'],
  roll: ['傾き', c => [.5 + c.roll / .8, deg(c.roll)], '傾き'],
  x: ['カメラの左右の位置', c => [.5 + c.x / 10, c.x.toFixed(1) + 'm'], 'カメラの位置'],
  y: ['カメラの高さ', c => [c.y / 8, c.y.toFixed(1) + 'm'], 'カメラの高さ'],
  fd: ['ピントを合わせる距離', c => [c.fd / 10, c.fd.toFixed(1) + 'm'], 'ピントの位置'],
  dof: ['ぼけの強さ（絞り）', c => [c.dof, c.dof < .1 ? 'なし' : c.dof < .6 ? '弱い' : '強い'], 'ぼけ'],
  rate: ['時間の速さ', c => [Math.log2(c.rate * 8 + 1) / 8, c.rate > 5 ? '数百倍' : Math.round(c.rate * 100) + '%'], '時間の速さ'],
  fps: ['見せる絵の枚数', c => [c.fps / 24, c.fps + '枚/秒'], 'コマとシャッター'],
  laz: ['光の向き（左右）', c => { const L = c.L && c.L.find(l => l.p > 0); return L ? [.5 + L.az / 400, Math.abs(Math.round(L.az)) + '度' + (L.az < -5 ? '左' : L.az > 5 ? '右' : '')] : [.5, '—']; }, '光の向き'],
  lel: ['光の高さ', c => { const L = c.L && c.L.find(l => l.p > 0); return L ? [.5 + L.el / 140, Math.round(L.el) + '度'] : [.5, '—']; }, '光の高さ'],
  soft: ['光のやわらかさ', c => { const L = c.L && c.L.find(l => l.p > 0); return L ? [L.soft, L.soft < .35 ? 'かたい' : L.soft < .7 ? '中くらい' : 'やわらかい'] : [.5, '—']; }, 'やわらかさ'],
  amb: ['影の明るさ', c => c.mode === 'light' ? [c.amb / .6, c.amb < .1 ? '真っ暗' : '明るい'] : [.5, '—'], '明暗の差'],
  sat: ['彩度（色のこさ）', c => c.gv ? [c.gv.sat / 2, Math.round(c.gv.sat * 100) + '%'] : [.5, '100%'], '彩度'],
  con: ['コントラスト', c => c.gv ? [c.gv.con / 2, Math.round(c.gv.con * 100) + '%'] : [.5, '100%'], 'コントラスト'],
  temp: ['色あい', c => c.gv ? [.5 + c.gv.temp / 2, c.gv.temp > .1 ? 'あたたかい' : c.gv.temp < -.1 ? 'つめたい' : 'そのまま'] : [.5, 'そのまま'], '色あい'],
  shot: ['いまのカット', c => [c.tl ? c.tl.t : 0, c.shot + '番目'], 'カット'],
  tu: ['切り替えの進み', c => [c.tr ? c.tr.u : 0, Math.round((c.tr ? c.tr.u : 0) * 100) + '%'], '進み'],
  mix: ['', null, '明るさで混ぜる'], shape: ['', null, '形で入れかえる'], blurk: ['', null, 'ぶれで隠す'], warp: ['', null, '絵を動かす・変形'],
  txu: ['文字の出かたの進み', c => [c.text ? c.text.u : 0, Math.round((c.text ? c.text.u : 0) * 100) + '%'], '進み'],
  vol: ['いまの音の大きさ', c => { const r = c.snd && c.snd.rows[c.snd.rows.length - 1], v = r ? clamp(r.amp(c.snd.t)) : 0; return [v, Math.round(v * 100) + '%']; }, '大きさ'],
  sqv: ['縦ののび・つぶれ', c => [c.sq / 2, Math.round(c.sq * 100) + '%'], 'つぶし伸ばし'],
  trick: ['', null, '大きさと距離をだます'], layer: ['', null, '2枚を重ねる'], timek: ['', null, '時間をいじる'],
  cutout: ['', null, '切り分ける'], trackk: ['', null, '追いかける'], gen: ['', null, '作って足す'], blend: ['', null, 'なじませる'],
  tpos: ['', null, '位置'], tsize: ['', null, '大きさ'], talpha: ['', null, '透明度'], treveal: ['', null, '見せる範囲'], tstag: ['', null, 'ずらし'],
  what: ['', null, '何の音か'], when: ['', null, '先か後か'], tone: ['', null, '高低の削り'], echo: ['', null, '響き'],
  spacing: ['', null, '絵の間隔'], deform: ['', null, '形を崩す'], hold: ['', null, '止め絵'], satsuei: ['', null, '撮影処理'],
  asp: ['画面の比率', c => { const a = c.aspect || 16 / 9; return [a / 2.6, a > 2 ? '2.39:1' : a > 1.5 ? '16:9' : a > 1 ? '4:3' : '9:16']; }, '画面の比率'],
  who: ['', null, '誰の目で'], order: ['', null, 'どの順で'], style: ['', null, '型（同じ操作のくり返し）'],
  hook: ['', null, '最初の1〜3秒'], change: ['', null, '数秒ごとに変える'], loop: ['', null, '終わりを最初へ'], flaw: ['', null, '道具の欠点を足す'],
  cut: ['', null, 'カット']
};

// ---- 覚えた記録（このブラウザの中だけ）。正解するたびに、次に出るまでの間が長くなる ----
const GAP = [0, 10, 60 * 24, 60 * 24 * 3, 60 * 24 * 7, 60 * 24 * 21]; // 箱0〜5：次に出るまでの分
let mem = {};
try { mem = JSON.parse(localStorage.getItem('film-mem') || '{}'); } catch (e) { }
const save = () => { try { localStorage.setItem('film-mem', JSON.stringify(mem)); } catch (e) { } };
const box = id => (mem[id] && mem[id].box) || 0;
const seen = id => !!mem[id];
const due = id => (mem[id] && mem[id].due) || 0;
const known = id => box(id) >= 2;
function setBox(id, b) { b = clamp(b, 0, 5); mem[id] = { box: b, due: Date.now() + GAP[b] * 60000 }; save(); refreshProgress(); }
function refreshProgress() {
  $('#pn').textContent = ALL.filter(t => known(t.id)).length; $('#pt').textContent = ALL.length;
  document.querySelectorAll('.card').forEach(c => c.querySelector('.done').hidden = !known(c.dataset.id));
  for (const f of FIELDS) {
    const k = f.items.filter(t => known(t.id)).length, el = document.getElementById('pg-' + f.id);
    if (el) { el.querySelector('i').style.width = (k / f.items.length * 100) + '%'; el.querySelector('span').textContent = `覚えた ${k} / ${f.items.length}`; }
  }
}

// ---- 動く図 ----
const players = new Set();
let motionOff = matchMedia('(prefers-reduced-motion:reduce)').matches;
class Player {
  constructor(tech, cv, map, knobs) {
    this.tech = tech; this.cv = cv; this.map = map; this.knobs = knobs;
    this.clock = 0; this.speed = 1; this.paused = false; this.visible = true; this.fixed = null;
    players.add(this);
  }
  get total() { return HOLD0 + this.tech.dur + HOLD1; }
  t() { return this.fixed != null ? this.fixed : clamp((this.clock % this.total - HOLD0) / this.tech.dur, 0, .9999); }
  fit(cv) {
    const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
    const w = Math.round(r.width * d), h = Math.round(r.height * d);
    if (w && (cv.width !== w || cv.height !== h)) { cv.width = w; cv.height = h; }
    return w > 0;
  }
  draw(time) {
    if (!this.fit(this.cv)) return;
    const c = this.tech.fn(this.t()); if (this.noCap) c.cap = '';
    renderScene(this.cv.getContext('2d'), this.cv.width, this.cv.height, c, time);
    if (this.map && this.fit(this.map)) renderMap(this.map.getContext('2d'), this.map.width, this.map.height, c);
    if (this.knobs) this.knobs(c);
  }
}
let last = performance.now();
function loop(now) {
  const dt = Math.min(.1, (now - last) / 1000); last = now;
  for (const p of players) {
    if (!p.visible) continue;
    if (!p.paused && !motionOff && p.fixed == null) p.clock += dt * p.speed;
    try { p.draw(now / 1000); } catch (e) { if (!p.err) { p.err = 1; console.error(p.tech.id, e); } }
  }
  requestAnimationFrame(loop);
}
const io = new IntersectionObserver(es => es.forEach(e => { if (e.target._p) e.target._p.visible = e.isIntersecting; }), { rootMargin: '80px' });

// ---- 図鑑 ----
const chips = t => t.knob.map(k => `<span class="chip on">${SL[k][2]}</span>`).join('');
function go(id) { const el = document.getElementById(id); scrollTo({ top: el.getBoundingClientRect().top + scrollY - 70, behavior: 'smooth' }); }
function buildBook() {
  let n = 0;
  for (const f of FIELDS) {
    const nb = document.createElement('button'); nb.innerHTML = `<b>${f.no}</b>${f.title}`; nb.dataset.f = f.id; nb.onclick = () => { location.hash = 'f-' + f.id; }; $('#fnav').appendChild(nb);
    const sec = document.createElement('section'); sec.className = 'field'; sec.id = 'f-' + f.id;
    sec.innerHTML = `<h2><b>${f.no}</b>${f.title}</h2><p>${f.lead}</p><div class="grid"></div>`;
    $('#sections').appendChild(sec);
    for (const t of f.items) {
      const b = document.createElement('button');
      b.className = 'card'; b.dataset.id = t.id;
      b.innerHTML = `<canvas></canvas><div class="body"><h3>${t.n}<span class="done" hidden>覚えた</span></h3><p>${t.one}</p><div class="chips">${chips(t)}</div></div>`;
      b.onclick = () => openDetail(t.id);
      sec.querySelector('.grid').appendChild(b);
      const cv = b.querySelector('canvas'), p = new Player(t, cv);
      p.clock = (n++) * .37; p.visible = false; cv._p = p; io.observe(cv);
    }
    const notes = (typeof NOTES !== 'undefined' && NOTES[f.no]) || [];
    if (notes.length) {
      const d = document.createElement('details'); d.className = 'all';
      const nx = notes.filter(o => (XFIG[f.no] || {})[o.n]).length;
      d.innerHTML = `<summary>この分野の全項目（${notes.length}個。▶ は動く図つき：${nx}個）</summary><div class="nlist"></div>`;
      let g = null;
      notes.forEach((nt, i) => {
        if (nt.g !== g) { g = nt.g; const h = document.createElement('h4'); h.textContent = g; d.lastChild.appendChild(h); }
        const b = document.createElement('button'); b.className = 'nbtn'; b.textContent = nt.n; b.dataset.q = (nt.n + ' ' + nt.b.map(x => x[1]).join(' ')).toLowerCase();
        if ((XFIG[f.no] || {})[nt.n]) b.classList.add('has');
        b.onclick = () => openNote(f, i); d.lastChild.appendChild(b);
      });
      sec.appendChild(d);
    }
  }
}
$('#search').oninput = e => {
  const q = e.target.value.trim().toLowerCase();
  document.querySelectorAll('.card').forEach(c => { const t = byId(c.dataset.id); c.hidden = q && !(t.n + t.en + t.one + t.look + t.use + t.how).toLowerCase().includes(q); });
  document.querySelectorAll('.nbtn').forEach(b => b.hidden = q && !b.dataset.q.includes(q));
  document.querySelectorAll('details.all').forEach(d => { d.open = !!q && !!d.querySelector('.nbtn:not([hidden])'); });
  applyView();
};
$('#motion').onclick = e => { motionOff = !motionOff; e.target.setAttribute('aria-pressed', motionOff); e.target.textContent = motionOff ? '動かす' : '動きを止める'; };
if (motionOff) { $('#motion').setAttribute('aria-pressed', true); $('#motion').textContent = '動かす'; }

// ---- ページ分け：入口（分野の一覧）→ 分野ごとのページ。検索中は全分野から結果を出す ----
function buildHome() {
  const h = $('#tiles');
  FIELDS.forEach((f, i) => {
    const b = document.createElement('button'); b.className = 'tile';
    const nn = (typeof NOTES !== 'undefined' && NOTES[f.no]) ? NOTES[f.no].length : 0;
    b.innerHTML = `<canvas></canvas><div class="body"><h3><b>${f.no}</b>${f.title}</h3><p>動く図 ${f.items.length}　文 ${nn}</p><div class="pg" id="pg-${f.id}"><div><i></i></div><span></span></div></div>`;
    b.onclick = () => { location.hash = 'f-' + f.id; };
    h.appendChild(b);
    const cv = b.querySelector('canvas'), p = new Player(f.items[0], cv); p.noCap = true; p.clock = i * .5; p.visible = false; cv._p = p; io.observe(cv);
  });
}
function applyView() {
  const q = $('#search').value.trim(), id = (location.hash || '').replace('#f-', ''), f = FIELDS.find(x => x.id === id);
  const mode = q ? 'search' : f ? 'field' : 'home';
  $('#home').hidden = mode !== 'home'; $('#fnav').hidden = mode !== 'field'; $('#crumb').hidden = mode === 'home'; $('#pager').hidden = mode !== 'field';
  $('#crumbt').textContent = mode === 'search' ? `「${q}」の検索結果` : '';
  document.querySelectorAll('.field').forEach(s => {
    s.hidden = mode === 'home' || (mode === 'field' && s.id !== 'f-' + id) || (mode === 'search' && !s.querySelector('.card:not([hidden]),.nbtn:not([hidden])'));
  });
  document.querySelectorAll('#fnav button').forEach(b => b.setAttribute('aria-current', b.dataset.f === id));
  if (mode === 'field') {
    const i = FIELDS.indexOf(f), pv = FIELDS[i - 1], nx = FIELDS[i + 1];
    $('#pprev').hidden = !pv; $('#pnext').hidden = !nx;
    if (pv) { $('#pprev').textContent = `‹ ${pv.no} ${pv.title}`; $('#pprev').onclick = () => { location.hash = 'f-' + pv.id; }; }
    if (nx) { $('#pnext').textContent = `${nx.no} ${nx.title} ›`; $('#pnext').onclick = () => { location.hash = 'f-' + nx.id; }; }
    const cb = document.querySelector('#fnav button[aria-current=true]'); if (cb && cb.scrollIntoView) cb.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
  return mode;
}
addEventListener('hashchange', () => { if ($('#quiz').hidden === false) show('book'); applyView(); scrollTo(0, 0); });
$('#back').onclick = () => { $('#search').value = ''; $('#search').oninput({ target: $('#search') }); if (location.hash) location.hash = ''; else applyView(); scrollTo(0, 0); };

// ---- くわしい画面 ----
let cur = null, dps = [], cmpOn = false;
function makeView(t, tag) {
  const v = document.createElement('div'); v.className = 'view';
  const keys = [...new Set([...t.knob, ...t.field.sl])].filter(k => SL[k][1]).slice(0, 4);
  const kn = key => `<div class="knob ${t.knob.includes(key) ? 'move' : ''}"><label><span>${SL[key][0]}${t.knob.includes(key) ? '　← 動く' : ''}</span><b></b></label><div class="track"><i></i></div></div>`;
  v.innerHTML = `<div class="cap"><span>${t.n}</span><em>${tag}</em></div><canvas class="scene"></canvas>
    <div class="under${t.field.nomap ? ' nomap' : ''}">${t.field.nomap ? '' : '<canvas aria-label="上から見た図"></canvas>'}<div class="knobs">${keys.map(kn).join('')}</div></div>`;
  const els = [...v.querySelectorAll('.knob')];
  const p = new Player(t, v.querySelector('canvas.scene'), t.field.nomap ? null : v.querySelector('.under canvas'), c => {
    keys.forEach((k, i) => { const [pos, txt] = SL[k][1](c); els[i].querySelector('i').style.left = (clamp(pos) * 100) + '%'; els[i].querySelector('b').textContent = txt; });
  });
  return [v, p];
}
function openDetail(id) {
  noteAt = null; document.querySelector('.ctrl').hidden = false; $('#mark').hidden = false;
  cur = byId(id); dps.forEach(p => players.delete(p)); dps = [];
  const vs = byId(cur.vs);
  $('#dtitle').innerHTML = `${cur.n}<span>${cur.field.no} ${cur.field.title}　${cur.en}</span>`;
  const views = $('#views'); views.innerHTML = ''; views.className = 'views' + (cmpOn && vs ? ' two' : '');
  const [v1, p1] = makeView(cur, 'この技法'); views.appendChild(v1); dps.push(p1);
  if (cmpOn && vs) { const [v2, p2] = makeView(vs, '似た技法'); views.appendChild(v2); dps.push(p2); }
  $('#cmp').textContent = vs ? `「${vs.n}」と並べる` : ''; $('#cmp').hidden = !vs; $('#cmp').setAttribute('aria-pressed', cmpOn);
  const S = (h, p, w) => `<section class="${w ? 'wide' : ''}"><h3>${h}</h3><p>${p}</p></section>`;
  $('#txt').innerHTML = S('見え方', cur.look) + S('作り方（数字）', cur.how) + S('使いどころ', cur.use) + S('覚え方', cur.memo) + S(`似た技法との違い（${vs ? vs.n : ''}）`, cur.diff, 1);
  $('#mark').textContent = known(id) ? '✓ 覚えた（外す）' : '覚えた';
  setPaused(false); $('#scrub').value = 0; applySpeed();
  if (!$('#dlg').open) { document.documentElement.classList.add('lock'); $('#dlg').showModal(); }
  $('#dlg').scrollTop = 0;
}
function setPaused(v) { dps.forEach(p => { p.paused = v; if (!v) p.fixed = null; }); $('#play').textContent = v ? '▶ 動かす' : '⏸ 止める'; }
function applySpeed() { const s = $('#slow').getAttribute('aria-pressed') === 'true' ? .35 : 1; dps.forEach(p => p.speed = s); }
$('#play').onclick = () => setPaused(!dps[0].paused);
$('#slow').onclick = e => { e.target.setAttribute('aria-pressed', e.target.getAttribute('aria-pressed') !== 'true'); applySpeed(); };
$('#scrub').oninput = e => { setPaused(true); dps.forEach(p => p.fixed = Math.min(.9999, e.target.value / 1000)); };
$('#cmp').onclick = () => { cmpOn = !cmpOn; openDetail(cur.id); };
$('#dclose').onclick = () => $('#dlg').close();
$('#dlg').addEventListener('close', () => { document.documentElement.classList.remove('lock'); dps.forEach(p => players.delete(p)); dps = []; });
$('#dlg').addEventListener('click', e => { if (e.target === $('#dlg')) $('#dlg').close(); });
const step = d => { if (noteAt) return openNote(noteAt[0], (noteAt[1] + d + NOTES[noteAt[0].no].length) % NOTES[noteAt[0].no].length); const i = ALL.indexOf(cur); openDetail(ALL[(i + d + ALL.length) % ALL.length].id); };
$('#prev').onclick = () => step(-1); $('#next').onclick = () => step(1);
$('#mark').onclick = () => { if (known(cur.id)) { delete mem[cur.id]; save(); refreshProgress(); } else setBox(cur.id, 3); $('#mark').textContent = known(cur.id) ? '✓ 覚えた（外す）' : '覚えた'; };
setInterval(() => { if (dps[0] && !dps[0].paused && dps[0].fixed == null) $('#scrub').value = dps[0].t() * 1000; }, 80);

// ---- 文だけの項目（ノート638項目） ----
let noteAt = null;
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
function openNote(f, i) {
  const nt = NOTES[f.no][i]; noteAt = [f, i];
  dps.forEach(p => players.delete(p)); dps = [];
  $('#dtitle').innerHTML = `${esc(nt.n)}<span>${f.no} ${f.title}　${esc(nt.g)}（文だけの項目 ${i + 1}/${NOTES[f.no].length}）</span>`;
  $('#views').innerHTML = ''; $('#views').className = 'views'; $('#mark').hidden = true;
  const xf = (XFIG[f.no] || {})[nt.n], xt = xf ? (xf.ref ? byId(xf.ref) : { id: 'x' + f.no + '-' + i, n: nt.n, dur: xf.dur, fn: xf.fn, knob: [], field: f }) : null;
  document.querySelector('.ctrl').hidden = !xt; $('#cmp').hidden = true;
  if (xt) { const [v1, p1] = makeView(xt, xf.ref ? '同じ技法の図' : 'この項目の図'); $('#views').appendChild(v1); dps.push(p1); setPaused(false); $('#scrub').value = 0; applySpeed(); }
  const key = nt.n.split(/[（(／]/)[0], hit = xt ? null : f.items.find(t => t.n.includes(key) || key.includes(t.n.split(/[（(]/)[0]));
  $('#txt').innerHTML = nt.b.map(([l, t]) => `<section class="wide"><h3>${esc(l || '説明')}</h3><p>${esc(t)}</p></section>`).join('') +
    (hit ? `<section class="wide"><p><button class="ghost" id="tofig">動く図を見る：${hit.n}</button></p></section>` : '');
  if (hit) $('#tofig').onclick = () => openDetail(hit.id);
  if (!$('#dlg').open) { document.documentElement.classList.add('lock'); $('#dlg').showModal(); }
  $('#dlg').scrollTop = 0;
}

// ---- クイズ ----
// 出す順：復習の時間が来たもの → まだ見ていないもの。まちがえたら少し後でまた出る
let qps = [], qt = null, qright = 0, qcount = 0, qlast = null, qmode = 'name', qfield = '', qfree = false;
const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
const qpool = () => ALL.filter(t => !qfield || t.field.id === qfield);
function qcounts() {
  const p = qpool(), now = Date.now();
  return { wait: p.filter(t => seen(t.id) && due(t.id) <= now).length, fresh: p.filter(t => !seen(t.id)).length, known: p.filter(t => known(t.id)).length, all: p.length };
}
function qstatus() {
  const c = qcounts(); $('#qcount').innerHTML = `復習まち <b>${c.wait}</b>　まだ見ていない <b>${c.fresh}</b>　覚えた <b>${c.known}</b> / ${c.all}`;
}
function nextQ() {
  qps.forEach(p => players.delete(p)); qps = [];
  const now = Date.now(), p = qpool();
  let cand = p.filter(t => seen(t.id) && due(t.id) <= now && t.id !== qlast).sort((a, b) => due(a.id) - due(b.id));
  if (!cand.length) cand = p.filter(t => !seen(t.id) && t.id !== qlast);
  if (!cand.length && qfree) cand = shuffle(p.filter(t => t.id !== qlast));
  qstatus(); $('#qnext').hidden = true; $('#qch').innerHTML = ''; $('#qgrid').innerHTML = '';
  if (!cand.length) { // 今日の分は終わり
    const nx = Math.min(...p.map(t => due(t.id)).filter(d => d > now)), min = Math.round((nx - now) / 60000);
    $('#qq').textContent = '今日の復習は終わりです'; $('#qview').hidden = true; $('#qgrid').hidden = true;
    $('#qfb').innerHTML = `次の復習は <b>${min < 90 ? min + '分後' : min < 2880 ? Math.round(min / 60) + '時間後' : Math.round(min / 1440) + '日後'}</b> です。間をあけて思い出すと、長く覚えていられます。<br><button class="ghost" id="qmore" style="margin-top:8px">それでも続けて練習する</button>`;
    $('#qmore').onclick = () => { qfree = true; nextQ(); }; qt = null; return;
  }
  qt = cand[0]; qlast = qt.id;
  const vs = byId(qt.vs), same = shuffle(qt.field.items.filter(t => t !== qt && t !== vs));
  const opts = shuffle([qt, vs && vs.field === qt.field ? vs : null, ...same].filter(Boolean).slice(0, 4));
  const byName = qmode === 'name';
  $('#qview').hidden = !byName; $('#qgrid').hidden = byName;
  if (byName) {
    $('#qq').textContent = 'この動きの名前は？';
    const p0 = new Player(qt, $('#qcv')); p0.noCap = true; qps.push(p0);
    opts.forEach(o => { const b = document.createElement('button'); b.textContent = o.n; b.onclick = () => answer(o, b); $('#qch').appendChild(b); });
  } else {
    $('#qq').innerHTML = `「<b>${qt.n}</b>」はどれ？`;
    opts.forEach(o => {
      const b = document.createElement('button'); b.className = 'pick'; b.innerHTML = '<canvas class="scene"></canvas>'; b.dataset.id = o.id; b.onclick = () => answer(o, b);
      $('#qgrid').appendChild(b); const pl = new Player(o, b.firstChild); pl.noCap = true; qps.push(pl);
    });
  }
  $('#qfb').textContent = '答えを選ぶと、見分け方が出ます。';
}
function answer(o, b) {
  if (!qt || !$('#qnext').hidden) return;
  const ok = o === qt; qcount++; if (ok) qright++;
  document.querySelectorAll('#qch button').forEach(x => { x.disabled = true; if (x.textContent === qt.n) x.classList.add('ok'); });
  document.querySelectorAll('#qgrid .pick').forEach(x => { if (x.dataset.id === qt.id) x.classList.add('ok'); });
  if (!ok) b.classList.add('ng');
  setBox(qt.id, ok ? Math.max(1, box(qt.id) + 1) : 0);
  const nb = box(qt.id), when = ['少し後でもう一度出ます', '10分後にまた出ます', '明日また出ます', '3日後にまた出ます', '1週間後にまた出ます', '3週間後にまた出ます'][nb];
  $('#qfb').innerHTML = `<b>${ok ? '正解' : 'ざんねん'}：${qt.n}</b>${ok ? '' : `（選んだのは「${o.n}」）`}<br>${qt.one}。<br>見分け方：${qt.memo}<br><span style="color:var(--muted);font-size:13px">${when}</span>`;
  $('#qstat').textContent = `${qcount}問中 ${qright}問 正解`; $('#qnext').hidden = false; $('#qnext').focus(); qstatus();
}
$('#qnext').onclick = nextQ;
function buildQuizUI() {
  const sel = $('#qfield'); sel.innerHTML = '<option value="">すべての分野</option>' + FIELDS.map(f => `<option value="${f.id}">${f.no} ${f.title}</option>`).join('');
  sel.onchange = () => { qfield = sel.value; qfree = false; nextQ(); };
  document.querySelectorAll('#qmodes button').forEach(b => b.onclick = () => {
    qmode = b.dataset.m; document.querySelectorAll('#qmodes button').forEach(x => x.setAttribute('aria-pressed', x === b)); nextQ();
  });
}

// ---- 切り替え ----
function show(tab) {
  const q = tab === 'quiz';
  $('#book').hidden = q; $('#quiz').hidden = !q;
  $('#tab-book').setAttribute('aria-selected', !q); $('#tab-quiz').setAttribute('aria-selected', q);
  if (q && !qt) nextQ();
  qps.forEach(p => p.visible = q);
}
$('#tab-book').onclick = () => show('book'); $('#tab-quiz').onclick = () => show('quiz');

buildBook(); buildHome(); buildQuizUI(); refreshProgress(); applyView(); requestAnimationFrame(loop);
