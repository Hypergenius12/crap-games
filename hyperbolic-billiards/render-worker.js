/* Allocation-free, tiled final-resolution outer-billiards rasterizer. */
const scratchU = new Float64Array(2), scratchA = new Float64Array(2), scratchB = new Float64Array(2), scratchRGB = new Uint8Array(3);
const hash = n => { n = (n ^ 61) ^ (n >>> 16); n += n << 3; n ^= n >>> 4; n = Math.imul(n, 0x27d4eb2d); return (n ^ (n >>> 15)) >>> 0; };
function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360; s /= 100; l /= 100;
  const hue = n => { const k = (n + h * 12) % 12; return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
  scratchRGB[0] = 255 * hue(0); scratchRGB[1] = 255 * hue(8); scratchRGB[2] = 255 * hue(4);
}
function colorFor(period, signature, local, radial, wave, hue, palette, contrast, texture) {
  const contrastAmount = contrast / 100, textureAmount = texture / 100;
  const signal = (hash(signature) % 120) + wave * (12 + textureAmount * 28);
  const light = 28 + contrastAmount * (18 + local * 34) - radial * (4 + contrastAmount * 8);
  if (palette === 'aurora') return hslToRgb(138 + period * 16 + signal * .56 + hue, 62 + contrastAmount * 31, light + 4);
  if (palette === 'ocean') return hslToRgb(187 + period * 8 + signal * .34 + hue, 58 + contrastAmount * 33, light - 2);
  if (palette === 'ember') return hslToRgb(8 + period * 6 + signal * .19 + hue, 66 + contrastAmount * 31, light + 2);
  if (palette === 'violet') return hslToRgb(248 + period * 11 + signal * .45 + hue, 54 + contrastAmount * 39, light + 1);
  return hslToRgb(hue + period * 43 + signal, 62 + contrastAmount * 34, light + 3);
}
function inside(x, y, v) {
  for (let i = 0, n = v.length; i < n; i++) { const a = v[i], b = v[(i + 1) % n]; if ((b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x) < -1e-9) return false; }
  return true;
}
function toZero(x, y, ax, ay, out) {
  const nx = x - ax, ny = y - ay, dx = 1 - ax * x - ay * y, dy = ay * x - ax * y, q = dx * dx + dy * dy;
  out[0] = (nx * dx + ny * dy) / q; out[1] = (ny * dx - nx * dy) / q;
}
function fromZero(x, y, ax, ay, out) {
  const nx = x + ax, ny = y + ay, dx = 1 + ax * x + ay * y, dy = ax * y - ay * x, q = dx * dx + dy * dy;
  out[0] = (nx * dx + ny * dy) / q; out[1] = (ny * dx - nx * dy) / q;
}
function euclideanPivot(x, y, v) {
  for (let i = 0, n = v.length; i < n; i++) {
    const p = v[i], before = v[(i + n - 1) % n], after = v[(i + 1) % n], dx = p.x - x, dy = p.y - y;
    if (dx * (before.y - y) - dy * (before.x - x) <= 1e-9 && dx * (after.y - y) - dy * (after.x - x) <= 1e-9) return i;
  }
  return -1;
}
function hyperbolicPivot(x, y, v) {
  for (let i = 0, n = v.length; i < n; i++) {
    const p = v[i], before = v[(i + n - 1) % n], after = v[(i + 1) % n];
    toZero(x, y, p.x, p.y, scratchU); toZero(before.x, before.y, p.x, p.y, scratchA); toZero(after.x, after.y, p.x, p.y, scratchB);
    const dx = -scratchU[0], dy = -scratchU[1];
    if (dx * (scratchA[1] - scratchU[1]) - dy * (scratchA[0] - scratchU[0]) <= 1e-8 && dx * (scratchB[1] - scratchU[1]) - dy * (scratchB[0] - scratchU[0]) <= 1e-8) return i;
  }
  return -1;
}
function classify(sx, sy, v, mode, limit) {
  let x = sx, y = sy, signature = 19;
  for (let step = 1; step <= limit; step++) {
    const index = mode === 'hyperbolic' ? hyperbolicPivot(x, y, v) : euclideanPivot(x, y, v);
    if (index < 0) return [0, signature, true];
    signature = Math.imul(signature ^ (index + step * 17), 16777619) >>> 0;
    const pivot = v[index];
    if (mode === 'hyperbolic') { toZero(x, y, pivot.x, pivot.y, scratchU); fromZero(-scratchU[0], -scratchU[1], pivot.x, pivot.y, scratchA); x = scratchA[0]; y = scratchA[1]; }
    else { x = 2 * pivot.x - x; y = 2 * pivot.y - y; }
    if (mode === 'hyperbolic' ? x * x + y * y >= .99700225 : x * x + y * y > 484) return [-1, signature, false];
    const dx = x - sx, dy = y - sy; if (step > 1 && dx * dx + dy * dy < 1e-13) return [step, signature, false];
  }
  return [limit + 1, signature, false];
}
self.onmessage = event => {
  const { version, width, height, startY = 0, endY = height, rx, ry, viewX, viewY, mode, vertices, limit, hue, gradient, palette, contrast, texture, web, seams } = event.data;
  const tileHeight = endY - startY, image = new ImageData(width, tileHeight), labels = new Int32Array(width * tileHeight), found = new Map(), intensity = gradient / 100, webStrength = web / 100;
  for (let y = startY; y < endY; y++) for (let x = 0; x < width; x++) {
    const localY = y - startY, px = viewX + ((x + .5) / width - .5) * 2 * rx, py = viewY + (.5 - (y + .5) / height) * 2 * ry, id = localY * width + x, o = id * 4, radiusSquared = px * px + py * py;
    if (mode === 'hyperbolic' && radiusSquared >= .996004) { image.data[o] = 4; image.data[o + 1] = 8; image.data[o + 2] = 31; image.data[o + 3] = 255; labels[id] = -4; continue; }
    if (inside(px, py, vertices)) { image.data[o] = 12; image.data[o + 1] = 64; image.data[o + 2] = 40; image.data[o + 3] = 255; labels[id] = -3; continue; }
    const result = classify(px, py, vertices, mode, limit), period = result[0], signature = result[1];
    if (result[2]) { image.data[o] = 236; image.data[o + 1] = 243; image.data[o + 2] = 255; image.data[o + 3] = 255; labels[id] = -2; continue; }
    if (period < 0) { image.data[o] = 12; image.data[o + 1] = 28; image.data[o + 2] = 67; image.data[o + 3] = 255; labels[id] = -1; continue; }
    const s = Math.sin(px * 2.4 + py) + Math.cos(py * 1.7 - px * .7), local = (s + 2) * .25, radial = mode === 'hyperbolic' ? Math.sqrt(radiusSquared) : 0;
    colorFor(period, signature, local, radial, s * intensity, hue, palette, contrast, texture);
    image.data[o] = scratchRGB[0]; image.data[o + 1] = scratchRGB[1]; image.data[o + 2] = scratchRGB[2]; image.data[o + 3] = 255;
    labels[id] = ((period & 1023) << 20) | (hash(signature) & 1048575);
    if (period <= limit) found.set(period, (found.get(period) || 0) + 1);
  }
  if (seams) for (let y = 1; y < tileHeight - 1; y++) for (let x = 1; x < width - 1; x++) { const id = y * width + x; if (labels[id] >= 0 && (labels[id] !== labels[id - 1] || labels[id] !== labels[id + 1] || labels[id] !== labels[id - width] || labels[id] !== labels[id + width])) { const o = id * 4; image.data[o] = image.data[o] * (1 - webStrength) + 235 * webStrength; image.data[o + 1] = image.data[o + 1] * (1 - webStrength) + 244 * webStrength; image.data[o + 2] = image.data[o + 2] * (1 - webStrength) + 255 * webStrength; } }
  const surface = new OffscreenCanvas(width, tileHeight); surface.getContext('2d').putImageData(image, 0, 0); const bitmap = surface.transferToImageBitmap();
  self.postMessage({ version, width, startY, height: tileHeight, bitmap, common: [...found.entries()] }, [bitmap]);
};
