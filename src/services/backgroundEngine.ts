import { SceneBackground, Character, Scene } from '../types/studio';

// ============================================================
//  Background Engine
//  Generates vivid cartoon backgrounds on a canvas
// ============================================================

export type BackgroundTheme = SceneBackground['type'];

interface GradStop { stop: number; color: string }

const themes: Record<BackgroundTheme, {
  sky: GradStop[];
  ground: string;
  accent: string;
  elements: string;
}> = {
  'forest-path': {
    sky: [{ stop: 0, color: '#87CEEB' }, { stop: 1, color: '#e0f7fa' }],
    ground: '#558B2F',
    accent: '#2E7D32',
    elements: 'trees',
  },
  'forest-cottage': {
    sky: [{ stop: 0, color: '#FFF9C4' }, { stop: 0.5, color: '#AED6F1' }, { stop: 1, color: '#87CEEB' }],
    ground: '#66BB6A',
    accent: '#388E3C',
    elements: 'cottage',
  },
  'river-stream': {
    sky: [{ stop: 0, color: '#90CAF9' }, { stop: 1, color: '#BBDEFB' }],
    ground: '#558B2F',
    accent: '#1565C0',
    elements: 'river',
  },
  'open-meadow': {
    sky: [{ stop: 0, color: '#FFF176' }, { stop: 0.4, color: '#81D4FA' }, { stop: 1, color: '#B3E5FC' }],
    ground: '#8BC34A',
    accent: '#558B2F',
    elements: 'flowers',
  },
  'sunset-hill': {
    sky: [{ stop: 0, color: '#FF6F00' }, { stop: 0.4, color: '#FF8F00' }, { stop: 0.7, color: '#FFB300' }, { stop: 1, color: '#FFF9C4' }],
    ground: '#4CAF50',
    accent: '#2E7D32',
    elements: 'hills',
  },
  'night-sky': {
    sky: [{ stop: 0, color: '#0D1B2A' }, { stop: 0.6, color: '#1B2838' }, { stop: 1, color: '#263238' }],
    ground: '#1B5E20',
    accent: '#0D47A1',
    elements: 'stars',
  },
  'indoor-room': {
    sky: [{ stop: 0, color: '#FFCCBC' }, { stop: 1, color: '#FFAB91' }],
    ground: '#8D6E63',
    accent: '#6D4C41',
    elements: 'room',
  },
  'custom': {
    sky: [{ stop: 0, color: '#B3E5FC' }, { stop: 1, color: '#E1F5FE' }],
    ground: '#66BB6A',
    accent: '#388E3C',
    elements: 'trees',
  },
};

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  type: BackgroundTheme,
  time: number
): void {
  const theme = themes[type] || themes['forest-path'];

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.65);
  for (const stop of theme.sky) skyGrad.addColorStop(stop.stop, stop.color);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height * 0.65);

  // Draw theme-specific elements
  switch (theme.elements) {
    case 'stars': drawStars(ctx, width, height, time); break;
    case 'cottage': drawCottage(ctx, width, height, time); break;
    case 'river': drawRiver(ctx, width, height, time); break;
    case 'flowers': drawFlowers(ctx, width, height, time); break;
    case 'hills': drawHills(ctx, width, height, time); break;
    case 'room': drawRoom(ctx, width, height, time); break;
    default: drawTrees(ctx, width, height, time); break;
  }

  // Ground base
  const groundGrad = ctx.createLinearGradient(0, height * 0.6, 0, height);
  groundGrad.addColorStop(0, theme.ground);
  groundGrad.addColorStop(1, shadeHex(theme.ground, -40));
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, height * 0.6, width, height * 0.4);

  // Foreground grass edge
  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.ellipse(width / 2, height * 0.62, width * 0.55, height * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();

  // Animated butterflies for warm daytime scenes
  if (!['night-sky', 'indoor-room'].includes(type)) {
    drawButterflies(ctx, width, height, time);
  }
}

function drawTrees(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const treePositions = [0.05, 0.15, 0.75, 0.88, 0.95];
  for (const xRatio of treePositions) {
    const x = w * xRatio;
    const sway = Math.sin(time * 0.8 + xRatio * 3) * 3;
    const treeH = h * 0.45;
    // Trunk
    ctx.fillStyle = '#795548';
    ctx.fillRect(x - 8, h * 0.45, 16, treeH * 0.4);
    // Foliage layers
    for (let layer = 0; layer < 3; layer++) {
      const ly = h * 0.45 - layer * treeH * 0.15;
      const lw = (3 - layer) * w * 0.06;
      ctx.save();
      ctx.translate(x + sway, ly);
      ctx.fillStyle = layer === 0 ? '#2E7D32' : layer === 1 ? '#388E3C' : '#43A047';
      ctx.beginPath();
      ctx.moveTo(0, -treeH * 0.25);
      ctx.lineTo(-lw, 0);
      ctx.lineTo(lw, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
}

function drawCottage(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  drawTrees(ctx, w, h, time);
  // House body
  const cx = w * 0.45, cy = h * 0.55;
  ctx.fillStyle = '#FFCCBC';
  ctx.fillRect(cx - w * 0.13, cy - h * 0.12, w * 0.26, h * 0.18);
  // Roof
  ctx.fillStyle = '#D32F2F';
  ctx.beginPath();
  ctx.moveTo(cx, cy - h * 0.25);
  ctx.lineTo(cx - w * 0.16, cy - h * 0.12);
  ctx.lineTo(cx + w * 0.16, cy - h * 0.12);
  ctx.closePath();
  ctx.fill();
  // Door
  ctx.fillStyle = '#795548';
  ctx.fillRect(cx - 0.02 * w, cy - 0.01 * h, 0.04 * w, 0.07 * h);
  // Windows
  ctx.fillStyle = '#FFF9C4';
  ctx.fillRect(cx - 0.1 * w, cy - 0.07 * h, 0.05 * w, 0.04 * h);
  ctx.fillRect(cx + 0.05 * w, cy - 0.07 * h, 0.05 * w, 0.04 * h);
  // Smoke
  const smokeY = cy - h * 0.25 - 10 - Math.sin(time) * 5;
  ctx.strokeStyle = 'rgba(200,200,200,0.6)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx + 0.05 * w, cy - h * 0.24);
  ctx.bezierCurveTo(cx + 0.07 * w, smokeY, cx + 0.03 * w, smokeY - 10, cx + 0.05 * w, smokeY - 20);
  ctx.stroke();
}

function drawRiver(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  drawTrees(ctx, w, h, time);
  // River
  const riverY = h * 0.58;
  const riverGrad = ctx.createLinearGradient(0, riverY, w, riverY + h * 0.08);
  riverGrad.addColorStop(0, '#1E88E5');
  riverGrad.addColorStop(0.5, '#42A5F5');
  riverGrad.addColorStop(1, '#1565C0');
  ctx.fillStyle = riverGrad;
  ctx.beginPath();
  ctx.moveTo(0, riverY);
  ctx.lineTo(w, riverY + h * 0.02);
  ctx.lineTo(w, riverY + h * 0.08);
  ctx.lineTo(0, riverY + h * 0.06);
  ctx.closePath();
  ctx.fill();
  // River ripples
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const rx = (w * 0.1 + i * w * 0.18 + time * 20) % w;
    ctx.beginPath();
    ctx.ellipse(rx, riverY + h * 0.04, w * 0.04, h * 0.008, 0, 0, Math.PI);
    ctx.stroke();
  }
}

function drawFlowers(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  // Background sky with sun
  ctx.fillStyle = '#FFD54F';
  ctx.beginPath();
  ctx.arc(w * 0.85, h * 0.12, h * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // Flowers
  const flowerColors = ['#E91E63', '#9C27B0', '#FFEB3B', '#F44336', '#FF9800'];
  for (let i = 0; i < 30; i++) {
    const fx = (i * w * 0.038 + 10) % w;
    const fy = h * 0.55 + Math.sin(i * 1.7) * h * 0.03;
    const sway = Math.sin(time + i * 0.5) * 4;
    const color = flowerColors[i % flowerColors.length];
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(fx + sway - 1, fy, 2, h * 0.06);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(fx + sway, fy, h * 0.018, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHills(ctx: CanvasRenderingContext2D, w: number, h: number, _time: number) {
  // Far hills
  ctx.fillStyle = '#81C784';
  ctx.beginPath();
  ctx.ellipse(w * 0.25, h * 0.62, w * 0.35, h * 0.15, 0, 0, Math.PI, true);
  ctx.fill();
  ctx.fillStyle = '#66BB6A';
  ctx.beginPath();
  ctx.ellipse(w * 0.75, h * 0.64, w * 0.4, h * 0.14, 0, 0, Math.PI, true);
  ctx.fill();
  // Sun / horizon glow
  const glowGrad = ctx.createRadialGradient(w * 0.5, h * 0.63, 0, w * 0.5, h * 0.63, w * 0.4);
  glowGrad.addColorStop(0, 'rgba(255,213,79,0.5)');
  glowGrad.addColorStop(1, 'rgba(255,213,79,0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, h * 0.4, w, h * 0.25);
}

function drawStars(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  for (let i = 0; i < 80; i++) {
    const sx = ((i * 173 + 37) % w);
    const sy = ((i * 97 + 13) % (h * 0.6));
    const brightness = 0.5 + 0.5 * Math.sin(time * 2 + i);
    ctx.fillStyle = `rgba(255,255,255,${brightness})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Moon
  ctx.fillStyle = '#FFF9C4';
  ctx.beginPath();
  ctx.arc(w * 0.8, h * 0.1, h * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0D1B2A';
  ctx.beginPath();
  ctx.arc(w * 0.82, h * 0.09, h * 0.05, 0, Math.PI * 2);
  ctx.fill();
}

function drawRoom(ctx: CanvasRenderingContext2D, w: number, h: number, _time: number) {
  // Wall
  ctx.fillStyle = '#FFCCBC';
  ctx.fillRect(0, 0, w, h * 0.65);
  // Floor
  ctx.fillStyle = '#8D6E63';
  // Baseboard
  ctx.fillStyle = '#D7CCC8';
  ctx.fillRect(0, h * 0.6, w, h * 0.04);
  // Window
  ctx.fillStyle = '#81D4FA';
  ctx.fillRect(w * 0.6, h * 0.1, w * 0.28, h * 0.22);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.strokeRect(w * 0.6, h * 0.1, w * 0.28, h * 0.22);
  // Cross bars
  ctx.beginPath();
  ctx.moveTo(w * 0.74, h * 0.1); ctx.lineTo(w * 0.74, h * 0.32);
  ctx.moveTo(w * 0.6, h * 0.21); ctx.lineTo(w * 0.88, h * 0.21);
  ctx.stroke();
  // Picture frame
  ctx.fillStyle = '#BCAAA4';
  ctx.fillRect(w * 0.1, h * 0.12, w * 0.2, h * 0.15);
  ctx.strokeStyle = '#8D6E63';
  ctx.lineWidth = 3;
  ctx.strokeRect(w * 0.1, h * 0.12, w * 0.2, h * 0.15);
}

function drawButterflies(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const butterflies = [
    { x: 0.3, y: 0.4, color: '#FF80AB', speed: 0.7 },
    { x: 0.6, y: 0.35, color: '#FFFF00', speed: 1.1 },
    { x: 0.8, y: 0.45, color: '#80D8FF', speed: 0.9 },
  ];
  for (const b of butterflies) {
    const bx = (b.x * w + Math.sin(time * b.speed) * 40) % w;
    const by = b.y * h + Math.cos(time * b.speed * 0.7) * 20;
    const wingFlap = Math.abs(Math.sin(time * 5 * b.speed));
    ctx.save();
    ctx.translate(bx, by);
    ctx.fillStyle = b.color;
    ctx.globalAlpha = 0.8;
    // Left wing
    ctx.beginPath();
    ctx.ellipse(-8 * wingFlap, 0, 10 * wingFlap, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Right wing
    ctx.beginPath();
    ctx.ellipse(8 * wingFlap, 0, 10 * wingFlap, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function shadeHex(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

/**
 * Draw an animated character on the canvas using their board image
 */
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  time: number,
  isTalking: boolean,
  emotion: string
): void {
  ctx.save();

  // Breathing animation
  const breathe = Math.sin(time * 1.2) * 2;
  // Talking bob
  const talkBob = isTalking ? Math.sin(time * 12) * 3 : 0;
  // Emotion-based scale
  let scaleX = 1, scaleY = 1;
  if (emotion === 'excited') { scaleX = 1 + Math.abs(Math.sin(time * 4)) * 0.04; }
  if (emotion === 'scared') { scaleX = 1 + Math.sin(time * 8) * 0.02; }

  ctx.translate(x + width / 2, y + height / 2);
  ctx.scale(scaleX, scaleY);
  ctx.translate(-(width / 2), -(height / 2));

  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 15;

  ctx.drawImage(img, 0, breathe + talkBob, width, height);

  // Emotion overlay glow
  if (emotion === 'happy' || emotion === 'excited') {
    const glow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.6);
    glow.addColorStop(0, 'rgba(255,255,100,0)');
    glow.addColorStop(1, 'rgba(255,255,100,0.08)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}
