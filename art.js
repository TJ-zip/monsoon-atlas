/* Monsoon Atlas — three generative pieces, zero dependencies.
   Every frame is derived from a seed, so any image can be reproduced. */
(() => {
  const cv = document.getElementById('stage');
  const cx = cv.getContext('2d');
  const $ = id => document.getElementById(id);
  let W, H, DPR, seed, rand, piece = 'tide', state = null, paused = false, t = 0;
  const mouse = { x: -1e4, y: -1e4, down: false };

  // ---- seeded randomness + value noise ----
  const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let r = Math.imul(a ^ a >>> 15, 1 | a);
    r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r; return ((r ^ r >>> 14) >>> 0) / 4294967296; };
  let perm;
  const buildNoise = () => { perm = new Uint8Array(512); const p = [...Array(256).keys()];
    for (let i = 255; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255]; };
  const fade = x => x * x * x * (x * (x * 6 - 15) + 10);
  const grad = (h, x, y) => ((h & 1) ? -x : x) + ((h & 2) ? -y : y);
  const noise = (x, y) => { const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y); const u = fade(x), v = fade(y);
    const a = perm[X] + Y, b = perm[X + 1] + Y;
    const l1 = grad(perm[a], x, y) + u * (grad(perm[b], x - 1, y) - grad(perm[a], x, y));
    const l2 = grad(perm[a + 1], x, y - 1) + u * (grad(perm[b + 1], x - 1, y - 1) - grad(perm[a + 1], x, y - 1));
    return l1 + v * (l2 - l1); };

  const PALETTES = [
    ['#0b0a09', '#e9c46a', '#f4a261', '#e76f51', '#2a9d8f'],   // spice market
    ['#07131a', '#cdeaf0', '#7fb7be', '#d3a588', '#f2e8cf'],   // sea glass
    ['#120b0f', '#ff8fab', '#ffd6a5', '#bde0fe', '#cdb4db'],   // dusk saree
    ['#0d0f0a', '#c9d6a3', '#8aa66b', '#e8d8b0', '#d97b4a'],   // paddy field
  ];
  let pal;

  const VERSES = {
    tide: 'Ten thousand small boats,\nnone of them steering —\nthe current remembers the way.',
    loom: 'Every thread is pulled\nby the hand of the one beside it.\nThis is how cloth, and towns, are made.',
    monsoon: 'The sky keeps its promise\none drop at a time.\nTouch the water. Watch it answer.'
  };

  const resize = () => { DPR = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
    cv.width = W * DPR; cv.height = H * DPR; cx.setTransform(DPR, 0, 0, DPR, 0, 0); init(); };

  // ---------- I · TIDE: particles riding a flow field ----------
  const Tide = {
    init() { cx.fillStyle = pal[0]; cx.fillRect(0, 0, W, H);
      const n = Math.floor(Math.min(4200, W * H / 260));
      return { scale: 0.0016 + rand() * 0.0015, ps: Array.from({ length: n }, () => this.spawn()) }; },
    spawn() { return { x: rand() * W, y: rand() * H, life: 60 + rand() * 240, c: pal[1 + Math.floor(rand() * 4)] }; },
    frame(s) {
      cx.fillStyle = pal[0] + '0a'; cx.fillRect(0, 0, W, H);
      cx.globalCompositeOperation = 'lighter'; cx.lineWidth = 0.7;
      for (const p of s.ps) {
        let a = noise(p.x * s.scale, p.y * s.scale + t * 0.0006) * Math.PI * 3;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 22000) a += (mouse.down ? -1 : 1) * Math.atan2(dy, dx) * 0.9 * (1 - d2 / 22000);
        const nx = p.x + Math.cos(a) * 1.6, ny = p.y + Math.sin(a) * 1.6;
        cx.strokeStyle = p.c + '55'; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(nx, ny); cx.stroke();
        p.x = nx; p.y = ny;
        if (--p.life < 0 || nx < 0 || nx > W || ny < 0 || ny > H) Object.assign(p, this.spawn());
      }
      cx.globalCompositeOperation = 'source-over';
    }
  };

  // ---------- II · LOOM: woven warp & weft that breathe ----------
  const Loom = {
    init() { const gap = 10 + Math.floor(rand() * 8);
      return { gap, twist: 0.4 + rand() * 0.8, motif: 2 + Math.floor(rand() * 4) }; },
    frame(s) {
      cx.fillStyle = pal[0]; cx.fillRect(0, 0, W, H);
      const g = s.gap, cols = Math.ceil(W / g) + 1, rows = Math.ceil(H / g) + 1;
      cx.lineCap = 'round';
      const pass = (vertical) => {
        const count = vertical ? cols : rows, len = vertical ? rows : cols;
        for (let i = 0; i < count; i++) {
          const band = Math.floor(i / s.motif) % 4;
          cx.strokeStyle = pal[1 + band]; cx.lineWidth = g * 0.42; cx.globalAlpha = vertical ? 0.85 : 0.95;
          cx.beginPath();
          for (let j = 0; j <= len; j++) {
            const u = j * g, base = i * g;
            let off = noise(i * 0.08, j * 0.05 + t * 0.004) * g * 2.2 * s.twist;
            const px = vertical ? base + off : u, py = vertical ? u : base + off;
            const dx = px - mouse.x, dy = py - mouse.y, d = Math.hypot(dx, dy);
            let fx = px, fy = py;
            if (d < 160) { const k = (1 - d / 160) ** 2 * 40 * (mouse.down ? -1 : 1); fx += dx / (d || 1) * k; fy += dy / (d || 1) * k; }
            // over-under: weft only shows where parity says it's on top
            if (!vertical && ((i + j) % 2 === 0)) { cx.moveTo(fx, fy); continue; }
            j === 0 ? cx.moveTo(fx, fy) : cx.lineTo(fx, fy);
          }
          cx.stroke();
        }
      };
      pass(true); pass(false); cx.globalAlpha = 1;
    }
  };

  // ---------- III · MONSOON: rain, ripples and interference ----------
  const Monsoon = {
    init() { return { rings: [], drops: [], rate: 0.25 + rand() * 0.4 }; },
    frame(s) {
      const grd = cx.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, pal[0]); grd.addColorStop(1, '#000');
      cx.fillStyle = grd; cx.fillRect(0, 0, W, H);
      if (rand() < s.rate) s.drops.push({ x: rand() * W, y: -20, vy: 9 + rand() * 6, ty: H * (0.35 + rand() * 0.6), c: pal[1 + Math.floor(rand() * 4)] });
      cx.lineWidth = 1;
      s.drops = s.drops.filter(d => { d.y += d.vy;
        cx.strokeStyle = d.c + '88'; cx.beginPath(); cx.moveTo(d.x, d.y - 18); cx.lineTo(d.x, d.y); cx.stroke();
        if (d.y >= d.ty) { s.rings.push({ x: d.x, y: d.y, r: 0, c: d.c, max: 80 + rand() * 160 }); return false; } return true; });
      s.rings = s.rings.filter(r => { r.r += 1.1; const a = 1 - r.r / r.max; if (a <= 0) return false;
        for (let k = 0; k < 3; k++) { const rr = r.r - k * 9; if (rr <= 0) continue;
          cx.strokeStyle = r.c; cx.globalAlpha = a * (0.6 - k * 0.18);
          cx.beginPath(); cx.ellipse(r.x, r.y, rr, rr * 0.32, 0, 0, Math.PI * 2); cx.stroke(); }
        cx.globalAlpha = 1; return true; });
      if (s.rings.length > 400) s.rings.splice(0, s.rings.length - 400);
    },
    touch(s, x, y) { s.rings.push({ x, y, r: 0, c: pal[1 + Math.floor(rand() * 4)], max: 260 }); }
  };

  const PIECES = { tide: Tide, loom: Loom, monsoon: Monsoon };
  const TITLES = { tide: 'Tide', loom: 'Loom', monsoon: 'Monsoon' };

  function init() {
    rand = mulberry(seed); buildNoise(); pal = PALETTES[Math.floor(rand() * PALETTES.length)];
    state = PIECES[piece].init(); t = 0; $('seedval').textContent = seed;
    $('title').textContent = TITLES[piece]; $('verse').textContent = VERSES[piece];
  }
  function setSeed(s) { seed = s >>> 0; history.replaceState(null, '', `#${piece}/${seed}`); init(); }
  function loop() { if (!paused) { PIECES[piece].frame(state); t++; } requestAnimationFrame(loop); }

  // ---- controls ----
  document.querySelectorAll('[data-piece]').forEach(b => b.addEventListener('click', () => {
    piece = b.dataset.piece; document.querySelectorAll('[data-piece]').forEach(x => x.classList.toggle('on', x === b));
    setSeed(seed); }));
  $('reseed').addEventListener('click', () => setSeed(Math.random() * 1e9));
  $('save').addEventListener('click', () => { const a = document.createElement('a');
    a.download = `monsoon-atlas-${piece}-${seed}.png`; a.href = cv.toDataURL('image/png'); a.click(); });
  const pt = e => { const p = e.touches ? e.touches[0] : e; mouse.x = p.clientX; mouse.y = p.clientY; };
  cv.addEventListener('pointermove', pt);
  cv.addEventListener('pointerdown', e => { pt(e); mouse.down = true; PIECES[piece].touch?.(state, mouse.x, mouse.y); });
  addEventListener('pointerup', () => mouse.down = false);
  cv.addEventListener('pointerleave', () => { mouse.x = mouse.y = -1e4; });
  addEventListener('keydown', e => {
    if (e.key === ' ') { paused = !paused; e.preventDefault(); }
    if (e.key === 'r' || e.key === 'R') $('reseed').click();
    if (e.key === 's' || e.key === 'S') $('save').click();
    if (['1', '2', '3'].includes(e.key)) document.querySelectorAll('[data-piece]')[+e.key - 1].click();
  });
  addEventListener('resize', resize);

  // restore from URL: #loom/12345
  const [hp, hs] = location.hash.slice(1).split('/');
  if (PIECES[hp]) { piece = hp; document.querySelectorAll('[data-piece]').forEach(x => x.classList.toggle('on', x.dataset.piece === hp)); }
  seed = hs && !isNaN(+hs) ? (+hs >>> 0) : (Math.random() * 1e9) >>> 0;
  resize(); loop();
})();
