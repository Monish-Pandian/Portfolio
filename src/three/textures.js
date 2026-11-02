// Procedural canvas textures: wood, board markings, coin faces, side labels.
// Generating them in code keeps the project free of image assets.
import * as THREE from 'three';

const rng = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const toTexture = (canvas, { repeat, aniso = 8 } = {}) => {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = aniso;
  if (repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(...repeat);
  }
  return tex;
};

function paintGrain(ctx, w, h, { base, dark, light, seed, lines = 220 }) {
  const rand = rng(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < lines; i++) {
    const y = rand() * h;
    const amp = 2 + rand() * 10;
    const freq = 0.002 + rand() * 0.004;
    const phase = rand() * Math.PI * 2;
    ctx.strokeStyle = rand() > 0.45 ? dark : light;
    ctx.globalAlpha = 0.04 + rand() * 0.11;
    ctx.lineWidth = 0.6 + rand() * 2.6;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 16) {
      const yy = y + Math.sin(x * freq + phase) * amp;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function makeFrameTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  paintGrain(c.getContext('2d'), 1024, 1024, { base: '#5a3419', dark: '#2e1708', light: '#8a5a30', seed: 7, lines: 260 });
  return toTexture(c, { repeat: [2, 1] });
}

/** Board face. 2048px covers the 740 x 740 playing area; k px per board unit. */
export function makeBoardTexture(pockets, baseline) {
  const size = 2048;
  const k = size / 740;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  paintGrain(ctx, size, size, { base: '#dcb87d', dark: '#a87f45', light: '#f0d6a2', seed: 21, lines: 320 });

  const X = (v) => size / 2 + v * k;
  const ink = '#3a2412';
  ctx.lineCap = 'round';
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;

  // outer playing-area line
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.75;
  ctx.strokeRect(X(-340), X(-340), 680 * k, 680 * k);

  // four baselines: two parallel lines with a circle at each end
  for (let side = 0; side < 4; side++) {
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate((side * Math.PI) / 2);
    const y1 = (baseline - 20) * k;
    const y2 = (baseline + 20) * k;
    const half = 225 * k;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-half, y1);
    ctx.lineTo(half, y1);
    ctx.moveTo(-half, y2);
    ctx.lineTo(half, y2);
    ctx.stroke();
    for (const ex of [-half, half]) {
      ctx.beginPath();
      ctx.arc(ex, baseline * k, 20 * k, 0, Math.PI * 2);
      ctx.fillStyle = '#a8392c';
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 0.75;
      ctx.stroke();
    }
    ctx.restore();
  }

  // centre rings
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = 3;
  for (const r of [88, 30]) {
    ctx.beginPath();
    ctx.arc(X(0), X(0), r * k, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(X(0), X(0), 8 * k, 0, Math.PI * 2);
  ctx.fillStyle = '#a8392c';
  ctx.fill();

  // corner arrows
  ctx.lineWidth = 2.5;
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    ctx.beginPath();
    ctx.moveTo(X(sx * 300), X(sy * 300));
    ctx.lineTo(X(sx * 150), X(sy * 150));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(X(sx * 210), X(sy * 210), 28 * k, 0, Math.PI * 2);
    ctx.stroke();
  }

  // pockets: dark recess with a soft rim
  ctx.globalAlpha = 1;
  for (const p of pockets) {
    const g = ctx.createRadialGradient(X(p.x), X(p.y), 4, X(p.x), X(p.y), 36 * k);
    g.addColorStop(0, '#060302');
    g.addColorStop(0.78, '#0d0704');
    g.addColorStop(1, 'rgba(13,7,4,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(X(p.x), X(p.y), 36 * k, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(40,22,8,0.9)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(X(p.x), X(p.y), 31 * k, 0, Math.PI * 2);
    ctx.stroke();
  }

  return toTexture(c, { aniso: 16 });
}

/** White text on transparent; tinted by the material colour. */
export function makeLabelTexture(text) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 58px "Iowan Old Style", Palatino, Georgia, serif';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '14px';
  ctx.fillText(text.toUpperCase(), 512 + 7, 68);
  return toTexture(c);
}

export function makeCoinTexture({ label, base, ink, accent }) {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, s, s);
  ctx.translate(s / 2, s / 2);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(0, 0, 104, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = ink;
  ctx.beginPath();
  ctx.arc(0, 0, 86, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${label.length > 2 ? 60 : 78}px "Iowan Old Style", Palatino, Georgia, serif`;
  ctx.fillText(label, 0, 6);
  return toTexture(c);
}

export function makeStrikerTexture() {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#b3402f';
  ctx.fillRect(0, 0, s, s);
  ctx.translate(s / 2, s / 2);
  ctx.strokeStyle = '#f1dcc0';
  ctx.lineWidth = 6;
  for (const r of [108, 74, 40]) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  return toTexture(c);
}
