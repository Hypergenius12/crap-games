(() => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const wrap = document.querySelector('.canvas-wrap');
  const busy = document.getElementById('busy');
  const status = document.getElementById('status');
  const substatus = document.getElementById('substatus');
  const tableName = document.getElementById('table-name');
  const ids = ['sides', 'irregularity', 'stretch', 'shear', 'table-scale', 'table-x', 'table-y', 'rotation', 'hyper-bend', 'table-glow', 'iterations', 'resolution', 'hue', 'gradient', 'palette', 'contrast', 'texture', 'bloom', 'web', 'orbit-ink', 'rings', 'seams', 'guides'];
  const input = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
  const output = Object.fromEntries(ids.filter(id => !['seams', 'guides', 'palette'].includes(id)).map(id => [id, document.getElementById(id + '-out')]));
  delete output.guides;

  let mode = 'hyperbolic';
  let preset = 'pentagon';
  let custom = null;
  let selected = null;
  let dragging = -1;
  let panning = false;
  let panAnchor = null;
  let timer = 0;
  let idleTimer = 0;
  let renderVersion = 0;
  let pass = 0;
  let currentPass = 0;
  let panRaf = 0;
  let lastFrame = null;
  let D = { w: 1, h: 1, scale: 1, rx: 1, ry: 1 };
  const view = { x: 0, y: 0, zoom: 1 };
  const refine = document.getElementById('refine');
  const detailValue = document.getElementById('detail-value');
  // Browsers intentionally forbid a dedicated worker from a file:// page. Keep the
  // local double-click workflow working by using the time-sliced renderer instead.
  let fieldWorkers = [];
  if (typeof Worker === 'function' && location.protocol !== 'file:') {
    try {
      const workerCount = Math.min(8, Math.max(1, (navigator.hardwareConcurrency || 2) - 1));
      fieldWorkers = Array.from({ length: workerCount }, () => new Worker('render-worker.js?v=20260923-9'));
    } catch (_) { fieldWorkers = []; }
  }
  const workerJobs = new Map();
  const engine = document.getElementById('engine');

  const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
  const cross = (a, b) => a.x * b.y - a.y * b.x;
  const norm = a => Math.hypot(a.x, a.y);
  const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const hash = n => { n = (n ^ 61) ^ (n >>> 16); n += n << 3; n ^= n >>> 4; n = Math.imul(n, 0x27d4eb2d); return (n ^ (n >>> 15)) >>> 0; };
  const hsl = (h, s, l) => {
    h = ((h % 360) + 360) % 360 / 360; s /= 100; l /= 100;
    const f = n => { const k = (n + h * 12) % 12; return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
    return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
  };
  function colorFor(period, signature, local, radial, wave) {
    const contrast = Number(input.contrast.value) / 100;
    const texture = Number(input.texture.value) / 100;
    const signal = (hash(signature) % 120) + wave * (12 + texture * 28);
    const light = 28 + contrast * (18 + local * 34) - radial * (4 + contrast * 8);
    const palette = input.palette.value;
    if (palette === 'aurora') return hsl(138 + period * 16 + signal * .56 + Number(input.hue.value), 62 + contrast * 31, light + 4);
    if (palette === 'ocean') return hsl(187 + period * 8 + signal * .34 + Number(input.hue.value), 58 + contrast * 33, light - 2);
    if (palette === 'ember') return hsl(8 + period * 6 + signal * .19 + Number(input.hue.value), 66 + contrast * 31, light + 2);
    if (palette === 'violet') return hsl(248 + period * 11 + signal * .45 + Number(input.hue.value), 54 + contrast * 39, light + 1);
    return hsl(Number(input.hue.value) + period * 43 + signal, 62 + contrast * 34, light + 3);
  }

  function updateLabels() {
    output.sides.textContent = input.sides.value;
    output.irregularity.textContent = input.irregularity.value + '%';
    output.stretch.textContent = Number(input.stretch.value).toFixed(2);
    output.shear.textContent = Number(input.shear.value).toFixed(2);
    output['table-scale'].textContent = Number(input['table-scale'].value).toFixed(2);
    output['table-x'].textContent = Number(input['table-x'].value).toFixed(2);
    output['table-y'].textContent = Number(input['table-y'].value).toFixed(2);
    output.rotation.textContent = input.rotation.value + '°';
    output['hyper-bend'].textContent = input['hyper-bend'].value + '%';
    output['table-glow'].textContent = input['table-glow'].value + '%';
    output.iterations.textContent = input.iterations.value;
    output.resolution.textContent = ['draft', 'medium', 'high', 'ultra'][Number(input.resolution.value) - 1];
    output.hue.textContent = input.hue.value + '°';
    output.gradient.textContent = input.gradient.value + '%';
    output.contrast.textContent = input.contrast.value + '%';
    output.texture.textContent = input.texture.value + '%';
    output.bloom.textContent = input.bloom.value + '%';
    output.web.textContent = input.web.value + '%';
    output['orbit-ink'].textContent = input['orbit-ink'].value + '%';
    output.rings.textContent = input.rings.value;
  }

  function vertices() {
    const tx = Number(input['table-x'].value), ty = Number(input['table-y'].value);
    const position = points => points.map(p => ({ x: p.x + tx, y: p.y + ty }));
    if (custom) return position(custom);
    const base = (mode === 'hyperbolic' ? .39 : .92) * Number(input['table-scale'].value);
    if (preset === 'kite') {
      const k = [{ x: -1.12, y: -.66 }, { x: 1.05, y: -.42 }, { x: .55, y: .86 }, { x: -.74, y: .54 }];
      return position(k.map(v => ({ x: v.x * base, y: v.y * base })));
    }
    const n = Number(input.sides.value);
    const irr = Number(input.irregularity.value) / 100 * .16;
    const stretch = Number(input.stretch.value);
    const shear = Number(input.shear.value);
    const rotation = Number(input.rotation.value) * Math.PI / 180;
    const c = Math.cos(rotation), s = Math.sin(rotation);
    return position(Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + i * Math.PI * 2 / n + irr * .19 * Math.sin(i * 4.77 + .8);
      const wobble = 1 + irr * (.86 * Math.sin(i * 2.39 + 1.7) + .42 * Math.cos(i * 5.23));
      const x = Math.cos(a) * base * wobble * stretch + Math.sin(a) * base * wobble * shear;
      const y = Math.sin(a) * base * wobble;
      return { x: x * c - y * s, y: x * s + y * c };
    }));
  }

  function inside(p, v) {
    for (let i = 0; i < v.length; i++) if (cross(sub(v[(i + 1) % v.length], v[i]), sub(p, v[i])) < -1e-9) return false;
    return true;
  }

  function convex(v) {
    for (let i = 0; i < v.length; i++) if (cross(sub(v[(i + 1) % v.length], v[i]), sub(v[(i + 2) % v.length], v[(i + 1) % v.length])) < .004) return false;
    return true;
  }

  function euclideanPivot(p, v) {
    for (let i = 0; i < v.length; i++) {
      const d = sub(v[i], p), before = v[(i - 1 + v.length) % v.length], after = v[(i + 1) % v.length];
      if (cross(d, sub(before, p)) <= 1e-9 && cross(d, sub(after, p)) <= 1e-9) return i;
    }
    return -1;
  }

  // Disk automorphisms: move a to the origin and back. A half-turn at a is the hyperbolic analogue of p → 2a − p.
  function divide(a, b) { const q = b.x * b.x + b.y * b.y; return { x: (a.x * b.x + a.y * b.y) / q, y: (a.y * b.x - a.x * b.y) / q }; }
  function toZero(z, a) { return divide({ x: z.x - a.x, y: z.y - a.y }, { x: 1 - a.x * z.x - a.y * z.y, y: a.y * z.x - a.x * z.y }); }
  function fromZero(w, a) { return divide({ x: w.x + a.x, y: w.y + a.y }, { x: 1 + a.x * w.x + a.y * w.y, y: a.x * w.y - a.y * w.x }); }
  function hyperbolicPivot(p, v) {
    for (let i = 0; i < v.length; i++) {
      const a = v[i], u = toZero(p, a), d = { x: -u.x, y: -u.y };
      const before = toZero(v[(i - 1 + v.length) % v.length], a), after = toZero(v[(i + 1) % v.length], a);
      if (cross(d, sub(before, u)) <= 1e-8 && cross(d, sub(after, u)) <= 1e-8) return i;
    }
    return -1;
  }

  function advance(p, v) {
    const i = mode === 'hyperbolic' ? hyperbolicPivot(p, v) : euclideanPivot(p, v);
    if (i < 0) return null;
    return { point: mode === 'hyperbolic' ? fromZero({ x: -toZero(p, v[i]).x, y: -toZero(p, v[i]).y }, v[i]) : { x: 2 * v[i].x - p.x, y: 2 * v[i].y - p.y }, pivot: i };
  }

  function classify(start, v, limit) {
    let p = { ...start }, signature = 19;
    for (let step = 1; step <= limit; step++) {
      const next = advance(p, v);
      if (!next) return { period: 0, signature, singular: true };
      signature = Math.imul(signature ^ (next.pivot + step * 17), 16777619) >>> 0;
      p = next.point;
      if (mode === 'hyperbolic' ? norm(p) >= .9985 : norm(p) > 22) return { period: -1, signature };
      if (step > 1 && dist2(p, start) < 1e-13) return { period: step, signature };
    }
    return { period: limit + 1, signature };
  }

  function setDimensions() {
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.max(2, Math.floor(rect.width * dpr)), h = Math.max(2, Math.floor(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const baseScale = mode === 'hyperbolic' ? Math.min(w, h) / 2.12 : Math.min(w, h) / 6.15;
    const scale = baseScale * view.zoom;
    D = { w, h, scale, rx: w / scale / 2, ry: h / scale / 2 };
  }

  const screen = p => ({ x: D.w / 2 + (p.x - view.x) * D.scale, y: D.h / 2 - (p.y - view.y) * D.scale });
  const world = p => ({ x: view.x + (p.x - D.w / 2) / D.scale, y: view.y + (D.h / 2 - p.y) / D.scale });

  function geodesic(ctx, a, b) {
    const u = toZero(b, a), r = norm(u), direction = { x: u.x / r, y: u.y / r }, bend = Number(input['hyper-bend'].value) / 100;
    for (let i = 0; i <= 22; i++) {
      const t = i / 22, arc = fromZero({ x: direction.x * Math.tanh(Math.atanh(r) * t), y: direction.y * Math.tanh(Math.atanh(r) * t) }, a);
      const line = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      const q = { x: line.x * (1 - bend) + arc.x * bend, y: line.y * (1 - bend) + arc.y * bend }, s = screen(q);
      i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y);
    }
  }

  function drawTable(v) {
    const aura = Number(input['table-glow'].value) / 100;
    if (aura) {
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = aura * .36; ctx.filter = `blur(${6 + aura * 18}px)`;
      ctx.beginPath();
      if (mode === 'hyperbolic') for (let i = 0; i < v.length; i++) geodesic(ctx, v[i], v[(i + 1) % v.length]);
      else v.forEach((p, i) => { const q = screen(p); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); });
      ctx.closePath(); ctx.fillStyle = '#20d984'; ctx.fill(); ctx.restore();
    }
    ctx.beginPath();
    if (mode === 'hyperbolic') {
      for (let i = 0; i < v.length; i++) geodesic(ctx, v[i], v[(i + 1) % v.length]);
    } else {
      v.forEach((p, i) => { const q = screen(p); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); });
    }
    ctx.closePath();
    const tableFill = ctx.createLinearGradient(0, D.h *.25, D.w, D.h *.8); tableFill.addColorStop(0, '#13764b'); tableFill.addColorStop(1, '#063b2d'); ctx.fillStyle = tableFill; ctx.fill();
    ctx.lineWidth = 1.5 * (devicePixelRatio || 1); ctx.strokeStyle = 'rgba(245,255,247,.9)'; ctx.stroke();
    v.forEach(p => { const q = screen(p); ctx.beginPath(); ctx.arc(q.x, q.y, 5.2 * (devicePixelRatio || 1), 0, Math.PI * 2); ctx.fillStyle = '#0a1020'; ctx.fill(); ctx.lineWidth = 1.2 * (devicePixelRatio || 1); ctx.strokeStyle = 'rgba(231,255,238,.86)'; ctx.stroke(); });
  }

  function drawRays(v) {
    if (!input.seams.checked) return;
    ctx.save(); ctx.strokeStyle = 'rgba(242,248,255,.42)'; ctx.lineWidth = Math.max(.8, devicePixelRatio * .72);
    for (let i = 0; i < v.length; i++) {
      const a = v[i], adjacent = [v[(i - 1 + v.length) % v.length], v[(i + 1) % v.length]];
      adjacent.forEach(b => {
        let end;
        if (mode === 'hyperbolic') { const u = toZero(b, a), l = norm(u); end = fromZero({ x: -u.x / l * .994, y: -u.y / l * .994 }, a); ctx.beginPath(); geodesic(ctx, a, end); }
        else { const d = sub(a, b), l = norm(d); end = { x: a.x + d.x / l * Math.max(D.rx, D.ry) * 1.5, y: a.y + d.y / l * Math.max(D.rx, D.ry) * 1.5 }; const x = screen(a), y = screen(end); ctx.beginPath(); ctx.moveTo(x.x, x.y); ctx.lineTo(y.x, y.y); }
        ctx.stroke();
      });
    }
    ctx.restore();
  }

  function drawTrace(start, v) {
    if (!start || inside(start, v)) return;
    let p = { ...start }, list = [p], pivots = [], period = 0;
    const ink = Number(input['orbit-ink'].value) / 100;
    const max = Math.min(72, Number(input.iterations.value));
    for (let step = 1; step <= max; step++) { const next = advance(p, v); if (!next) break; pivots.push(v[next.pivot]); p = next.point; list.push(p); if (step > 1 && dist2(p, start) < 1e-13) { period = step; break; } }
    ctx.save(); ctx.strokeStyle = `rgba(250,252,255,${.18 + ink * .64})`; ctx.lineWidth = (0.55 + ink * .9) * (devicePixelRatio || 1); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath();
    list.forEach((p, i) => { const q = screen(p); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); }); ctx.stroke();
    ctx.setLineDash([3 * (devicePixelRatio || 1), 4 * (devicePixelRatio || 1)]); ctx.strokeStyle = `rgba(255,222,177,${.08 + ink * .38})`; ctx.lineWidth = .55 * (devicePixelRatio || 1);
    pivots.forEach((pivot, i) => { if (i % 3) return; const a = screen(list[i]), b = screen(pivot); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); });
    const q = screen(list[list.length - 1]); ctx.setLineDash([]); ctx.beginPath(); ctx.arc(q.x, q.y, 5.3 * (devicePixelRatio || 1), 0, Math.PI * 2); ctx.fillStyle = '#ff486e'; ctx.fill(); ctx.strokeStyle = '#ffe2e9'; ctx.lineWidth = 1 * (devicePixelRatio || 1); ctx.stroke(); ctx.restore();
    substatus.textContent = period ? `selected orbit returns in ${period} steps` : `selected orbit drawn for ${list.length - 1} steps`;
  }

  function redrawFrame(frame) {
    const dx = (frame.view.x - view.x) * D.scale, dy = (view.y - frame.view.y) * D.scale;
    const bloom = Number(input.bloom.value) / 100;
    const backdrop = ctx.createRadialGradient(D.w * .5, D.h * .46, 0, D.w * .5, D.h * .5, Math.max(D.w, D.h) * .78);
    backdrop.addColorStop(0, '#0a1238'); backdrop.addColorStop(.55, '#050a25'); backdrop.addColorStop(1, '#02050e');
    ctx.fillStyle = backdrop; ctx.fillRect(0, 0, D.w, D.h);
    if (bloom > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .04 + bloom * .16; ctx.filter = `blur(${3 + bloom * 15}px)`;
      ctx.drawImage(frame.field, 0, 0, frame.width, frame.height, dx, dy, D.w, D.h); ctx.restore();
    }
    ctx.imageSmoothingEnabled = currentPass === 3; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(frame.field, 0, 0, frame.width, frame.height, dx, dy, D.w, D.h); ctx.imageSmoothingEnabled = true;
    if (mode === 'hyperbolic') {
      const c = screen({ x: 0, y: 0 });
      const edgeGlow = Number(input.bloom.value) / 100;
      if (edgeGlow) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .12 + edgeGlow * .22; ctx.filter = `blur(${3 + edgeGlow * 11}px)`; ctx.beginPath(); ctx.arc(c.x, c.y, D.scale, 0, Math.PI * 2); ctx.lineWidth = 2 + edgeGlow * 3; ctx.strokeStyle = '#89b7ff'; ctx.stroke(); ctx.restore(); }
      if (input.guides.checked && Number(input.rings.value)) {
        const rings = Number(input.rings.value); ctx.save(); ctx.strokeStyle = `rgba(236,244,255,${.055 + Number(input.web.value) / 1500})`; ctx.lineWidth = .55 * (devicePixelRatio || 1);
        for (let i = 1; i <= rings; i++) { const r = 1 - Math.exp(-i * 2.5 / (rings + .8)); ctx.beginPath(); ctx.arc(c.x, c.y, r * D.scale, 0, Math.PI * 2); ctx.stroke(); }
        ctx.restore();
      }
      ctx.beginPath(); ctx.arc(c.x, c.y, D.scale, 0, Math.PI * 2); ctx.lineWidth = 1.2 * (devicePixelRatio || 1); ctx.strokeStyle = 'rgba(239,245,255,.68)'; ctx.stroke();
    }
    drawRays(frame.vertices); drawTable(frame.vertices); drawTrace(selected, frame.vertices);
  }

  function presentField(field, width, height, v, common, version, passIndex) {
    if (version !== renderVersion) return;
    lastFrame = { field, width, height, vertices: v, view: { ...view } };
    redrawFrame(lastFrame);
    const name = preset === 'kite' ? 'kite' : custom ? 'custom table' : `${input.sides.value} sides`;
    tableName.textContent = name; status.textContent = `${mode === 'hyperbolic' ? 'Hyperbolic disk' : 'Euclidean plane'} · ${name} · ${Math.round(view.zoom * 100)}%`;
    if (!selected) substatus.textContent = common.length ? `common return lengths: ${common.join(', ')}` : 'No short returns in this sample';
    detailValue.textContent = `${Math.round(((passIndex + 1) / 4) * 100)}%`;
    busy.classList.remove('visible');
    if (passIndex < 3 && version === renderVersion) idleTimer = setTimeout(() => build(version, passIndex + 1), 280 + passIndex * 300);
  }

  fieldWorkers.forEach(worker => worker.onmessage = event => {
    const data = event.data, job = workerJobs.get(data.version);
    if (!job || data.version !== renderVersion) return;
    job.context.drawImage(data.bitmap, 0, 0, data.width, data.height, 0, data.startY, data.width, data.height);
    data.common.forEach(([period, count]) => job.found.set(period, (job.found.get(period) || 0) + count));
    job.pending--; engine.textContent = `renderer · workers ${job.total - job.pending}/${job.total}`;
    if (!job.pending) {
      workerJobs.delete(data.version);
      engine.textContent = job.passIndex === 3 ? `renderer · ${job.total} workers · supersample ${job.supersample}%` : `renderer · ${job.total} workers · parallel refine`;
      presentField(job.surface, job.width, job.height, job.vertices, [...job.found.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n]) => n), data.version, job.passIndex);
    }
  });

  function build(version, passIndex) {
    timer = 0;
    if (version !== renderVersion) return;
    currentPass = passIndex;
    busy.textContent = passIndex ? 'refining field' : 'building field';
    busy.classList.add('visible');
    requestAnimationFrame(() => {
      setDimensions(); const v = vertices(), limit = Number(input.iterations.value);
      if (version !== renderVersion) return;
      const resolution = Number(input.resolution.value), baseQuality = [.10, .14, .19, .23][resolution - 1];
      const quality = Math.min(resolution === 4 ? 1.7 : 1.32, baseQuality * [1, 1.42, 2.2, 6.95][passIndex]);
      const fw = Math.max(100, Math.floor(D.w * quality)), fh = Math.max(100, Math.floor(D.h * quality));
      if (passIndex >= 2 && fieldWorkers.length) {
        const surface = document.createElement('canvas'); surface.width = fw; surface.height = fh;
        const workerCount = Math.min(fieldWorkers.length, fh), job = { vertices: v, passIndex, width: fw, height: fh, surface, context: surface.getContext('2d'), found: new Map(), pending: workerCount, total: workerCount, supersample: Math.round(quality * 100) };
        workerJobs.clear(); workerJobs.set(version, job);
        engine.textContent = `renderer · dispatching ${workerCount} workers`;
        for (let i = 0; i < workerCount; i++) {
          const startY = Math.floor(i * fh / workerCount), endY = Math.floor((i + 1) * fh / workerCount);
          fieldWorkers[i].postMessage({ version, width: fw, height: fh, startY, endY, rx: D.rx, ry: D.ry, viewX: view.x, viewY: view.y, mode, vertices: v, limit, hue: Number(input.hue.value), gradient: Number(input.gradient.value), palette: input.palette.value, contrast: Number(input.contrast.value), texture: Number(input.texture.value), web: Number(input.web.value), seams: input.seams.checked });
        }
        return;
      }
      const image = ctx.createImageData(fw, fh), labels = new Int32Array(fw * fh), found = new Map();
      const intensity = Number(input.gradient.value) / 100, webStrength = Number(input.web.value) / 100;
      let row = 0;
      function paintRow(y) {
        for (let x = 0; x < fw; x++) {
          const p = { x: view.x + ((x + .5) / fw - .5) * 2 * D.rx, y: view.y + (.5 - (y + .5) / fh) * 2 * D.ry }, id = y * fw + x, o = id * 4;
          if (mode === 'hyperbolic' && norm(p) >= .998) { image.data[o] = 4; image.data[o + 1] = 8; image.data[o + 2] = 31; image.data[o + 3] = 255; labels[id] = -4; continue; }
          if (inside(p, v)) { image.data[o] = 12; image.data[o + 1] = 64; image.data[o + 2] = 40; image.data[o + 3] = 255; labels[id] = -3; continue; }
          const r = classify(p, v, limit), local = (Math.sin(p.x * 2.4 + p.y) + Math.cos(p.y * 1.7 - p.x * .7) + 2) / 4;
          let rgb;
          if (r.singular) rgb = [236, 243, 255];
          else if (r.period < 0) rgb = [12, 28, 67];
          else { const radial = mode === 'hyperbolic' ? norm(p) : 0; const colorWave = (Math.sin(p.x * 2.4 + p.y) + Math.cos(p.y * 1.7 - p.x * .7)) * intensity; rgb = colorFor(r.period, r.signature, local, radial, colorWave); }
          image.data[o] = rgb[0]; image.data[o + 1] = rgb[1]; image.data[o + 2] = rgb[2]; image.data[o + 3] = 255;
          labels[id] = r.singular ? -2 : ((r.period & 1023) << 20) | (hash(r.signature) & 1048575);
          if (r.period > 0 && r.period <= limit) found.set(r.period, (found.get(r.period) || 0) + 1);
        }
      }
      function finishField() {
        if (version !== renderVersion) return;
        if (input.seams.checked) for (let y = 1; y < fh - 1; y++) for (let x = 1; x < fw - 1; x++) {
          const id = y * fw + x; if (labels[id] >= 0 && (labels[id] !== labels[id - 1] || labels[id] !== labels[id + 1] || labels[id] !== labels[id - fw] || labels[id] !== labels[id + fw])) { const o = id * 4; image.data[o] = image.data[o] * (1 - webStrength) + 235 * webStrength; image.data[o + 1] = image.data[o + 1] * (1 - webStrength) + 244 * webStrength; image.data[o + 2] = image.data[o + 2] * (1 - webStrength) + 255 * webStrength; }
        }
        const field = document.createElement('canvas'); field.width = fw; field.height = fh; field.getContext('2d').putImageData(image, 0, 0);
        presentField(field, fw, fh, v, [...found.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n]) => n), version, passIndex);
      }
      function renderChunk() {
        if (version !== renderVersion) return;
        const frameEnd = performance.now() + 9;
        while (row < fh && performance.now() < frameEnd) paintRow(row++);
        if (row < fh) { requestAnimationFrame(renderChunk); return; }
        finishField();
      }
      requestAnimationFrame(renderChunk);
    });
  }

  function schedule() {
    renderVersion++; pass = 0; clearTimeout(timer); clearTimeout(idleTimer);
    detailValue.textContent = '0%'; busy.textContent = 'building field'; busy.classList.add('visible');
    engine.textContent = fieldWorkers.length ? `renderer · ${fieldWorkers.length} workers ready` : 'renderer · time-sliced fallback';
    const version = renderVersion; timer = setTimeout(() => build(version, 0), 90);
  }
  function zoomAt(pointer, factor) {
    setDimensions(); const before = world(pointer); view.zoom = clamp(view.zoom * factor, .45, 7);
    setDimensions(); const after = world(pointer); view.x += before.x - after.x; view.y += before.y - after.y; schedule();
  }
  function queuePanPreview() {
    if (panRaf || !lastFrame) return;
    panRaf = requestAnimationFrame(() => {
      panRaf = 0;
      redrawFrame(lastFrame);
      status.textContent = `${mode === 'hyperbolic' ? 'Hyperbolic disk' : 'Euclidean plane'} · ${Math.round(view.zoom * 100)}%`;
    });
  }
  function previewOverlay() {
    if (!lastFrame) return;
    redrawFrame(lastFrame);
  }
  function eventPoint(e) { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * canvas.width / r.width, y: (e.clientY - r.top) * canvas.height / r.height }; }

  canvas.addEventListener('pointerdown', e => {
    if (e.button === 2 || e.shiftKey) { panning = true; panAnchor = { point: eventPoint(e), x: view.x, y: view.y }; canvas.setPointerCapture(e.pointerId); return; }
    const p = world(eventPoint(e)), v = vertices(); let nearest = -1, best = .018 / view.zoom;
    v.forEach((q, i) => { const d = dist2(p, q); if (d < best) { best = d; nearest = i; } });
    if (nearest >= 0) { custom = v.map(q => ({ ...q })); preset = 'custom'; dragging = nearest; selected = null; canvas.setPointerCapture(e.pointerId); document.querySelectorAll('[data-preset]').forEach(b => b.classList.remove('active')); return; }
    if ((mode !== 'hyperbolic' || norm(p) < .996) && !inside(p, v)) {
      selected = p;
      if (lastFrame) redrawFrame(lastFrame);
      else schedule();
    }
    else substatus.textContent = mode === 'hyperbolic' && norm(p) >= .996 ? 'Pick a point inside the disk.' : 'Pick a point outside the table.';
  });
  canvas.addEventListener('pointermove', e => {
    if (panning && panAnchor) {
      const q = eventPoint(e); view.x = panAnchor.x - (q.x - panAnchor.point.x) / D.scale; view.y = panAnchor.y + (q.y - panAnchor.point.y) / D.scale; queuePanPreview(); return;
    }
    if (dragging < 0) return; const p = world(eventPoint(e)), candidate = custom.map(q => ({ ...q }));
    const bound = mode === 'hyperbolic' ? .78 : 2.25; candidate[dragging] = { x: clamp(p.x, -bound, bound), y: clamp(p.y, -bound, bound) };
    if ((mode !== 'hyperbolic' || norm(candidate[dragging]) < .78) && convex(candidate)) {
      const tx = Number(input['table-x'].value), ty = Number(input['table-y'].value);
      custom = candidate.map(q => ({ x: q.x - tx, y: q.y - ty })); schedule();
    }
  });
  const release = () => { const needsRender = panning; dragging = -1; panning = false; panAnchor = null; if (needsRender) schedule(); }; canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  canvas.addEventListener('wheel', e => {
    e.preventDefault(); zoomAt(eventPoint(e), Math.exp(-e.deltaY * .0012));
  }, { passive: false });

  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => { mode = button.dataset.mode; custom = null; selected = null; document.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('active', b === button)); schedule(); }));
  document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => { preset = button.dataset.preset; custom = null; selected = null; if (preset !== 'kite') input.sides.value = { triangle: 3, square: 4, pentagon: 5 }[preset]; document.querySelectorAll('[data-preset]').forEach(b => b.classList.toggle('active', b === button)); updateLabels(); schedule(); }));
  ['sides', 'irregularity', 'stretch', 'shear', 'table-scale', 'rotation'].forEach(id => input[id].addEventListener('input', () => { custom = null; if (preset === 'kite') preset = 'pentagon'; document.querySelectorAll('[data-preset]').forEach(b => b.classList.remove('active')); updateLabels(); schedule(); }));
  ['table-x', 'table-y'].forEach(id => input[id].addEventListener('input', () => { updateLabels(); schedule(); }));
  ['iterations', 'resolution', 'hue', 'gradient', 'contrast', 'texture', 'web'].forEach(id => input[id].addEventListener('input', () => { updateLabels(); schedule(); }));
  ['hyper-bend', 'table-glow', 'bloom', 'orbit-ink', 'rings'].forEach(id => input[id].addEventListener('input', () => { updateLabels(); previewOverlay(); }));
  input.palette.addEventListener('input', schedule);
  input.seams.addEventListener('input', schedule);
  input.guides.addEventListener('input', schedule);
  document.getElementById('randomize').addEventListener('click', () => { preset = 'pentagon'; custom = null; selected = null; input.sides.value = 3 + Math.floor(Math.random() * 10); input.irregularity.value = 38 + Math.floor(Math.random() * 55); input.stretch.value = (.68 + Math.random() * .7).toFixed(2); input.rotation.value = Math.floor(Math.random() * 360); input['hyper-bend'].value = 45 + Math.floor(Math.random() * 56); input['table-glow'].value = 24 + Math.floor(Math.random() * 68); input.hue.value = Math.floor(Math.random() * 360); input.palette.value = ['prism', 'aurora', 'ocean', 'ember', 'violet'][Math.floor(Math.random() * 5)]; input.contrast.value = 58 + Math.floor(Math.random() * 38); input.texture.value = 18 + Math.floor(Math.random() * 72); input.bloom.value = 15 + Math.floor(Math.random() * 62); input.web.value = 54 + Math.floor(Math.random() * 43); input['orbit-ink'].value = 32 + Math.floor(Math.random() * 56); document.querySelectorAll('[data-preset]').forEach(b => b.classList.remove('active')); updateLabels(); schedule(); });
  document.getElementById('reset-view').addEventListener('click', () => { view.x = 0; view.y = 0; view.zoom = 1; schedule(); });
  document.getElementById('zoom-in').addEventListener('click', () => zoomAt({ x: D.w / 2, y: D.h / 2 }, 1.35));
  document.getElementById('zoom-out').addEventListener('click', () => zoomAt({ x: D.w / 2, y: D.h / 2 }, 1 / 1.35));
  document.getElementById('export-image').addEventListener('click', () => {
    const exportCanvas = document.createElement('canvas'); exportCanvas.width = 3840; exportCanvas.height = 2160;
    const exportCtx = exportCanvas.getContext('2d'); exportCtx.imageSmoothingEnabled = true; exportCtx.fillStyle = '#060a29'; exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    exportCtx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
    exportCanvas.toBlob(blob => { if (!blob) return; const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `outer-billiards-${mode}-${Date.now()}.png`; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 5000); }, 'image/png');
  });
  new ResizeObserver(schedule).observe(wrap);
  updateLabels(); schedule();
})();
