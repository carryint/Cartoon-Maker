import { LocationDNA, LightingMood, WeatherType } from '../../types/lilo';

// ============================================================
//  Location Engine — Environment & Multi-Layered Atmosphere
// ============================================================

export function drawLocationEnvironment(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  location: LocationDNA | undefined,
  lighting: LightingMood = 'morning-sunlight',
  weather: WeatherType = 'sunny',
  time: number = 0
) {
  const locType = location?.type || 'forest';

  // 1. Sky & Atmosphere Base Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.7);

  if (lighting === 'moonlit-night') {
    skyGrad.addColorStop(0, '#0a0f1d');
    skyGrad.addColorStop(0.6, '#131b2e');
    skyGrad.addColorStop(1, '#1e293b');
  } else if (lighting === 'warm-sunset') {
    skyGrad.addColorStop(0, '#ea580c');
    skyGrad.addColorStop(0.4, '#f97316');
    skyGrad.addColorStop(0.7, '#fbbf24');
    skyGrad.addColorStop(1, '#fde68a');
  } else if (lighting === 'mystical-glow') {
    skyGrad.addColorStop(0, '#312e81');
    skyGrad.addColorStop(0.5, '#4338ca');
    skyGrad.addColorStop(1, '#67e8f9');
  } else {
    // Sunny morning
    skyGrad.addColorStop(0, '#38bdf8');
    skyGrad.addColorStop(0.5, '#7dd3fc');
    skyGrad.addColorStop(1, '#e0f2fe');
  }

  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height * 0.75);

  // 2. Celestial Body (Sun / Moon)
  if (lighting === 'moonlit-night') {
    ctx.save();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(width * 0.82, height * 0.16, width * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Subtle craters / moon shadow
    ctx.fillStyle = 'rgba(10, 15, 30, 0.2)';
    ctx.beginPath();
    ctx.arc(width * 0.835, height * 0.155, width * 0.045, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Stars
    for (let i = 0; i < 60; i++) {
      const sx = (i * 137) % width;
      const sy = (i * 89) % (height * 0.45);
      const twinkle = 0.4 + 0.6 * Math.sin(time * 2 + i);
      ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
      ctx.fillRect(sx, sy, 2, 2);
    }
  } else {
    // Sun & Rays
    ctx.save();
    const sunGrad = ctx.createRadialGradient(
      width * 0.85, height * 0.18, 5,
      width * 0.85, height * 0.18, width * 0.14
    );
    sunGrad.addColorStop(0, '#fef08a');
    sunGrad.addColorStop(0.3, 'rgba(251, 191, 36, 0.6)');
    sunGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.18, width * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 3. Far Background Hills / Mountain Layer
  ctx.save();
  const hillGrad = ctx.createLinearGradient(0, height * 0.35, 0, height * 0.7);
  hillGrad.addColorStop(0, lighting === 'moonlit-night' ? '#1e293b' : '#64748b');
  hillGrad.addColorStop(1, lighting === 'moonlit-night' ? '#0f172a' : '#475569');
  ctx.fillStyle = hillGrad;
  ctx.beginPath();
  ctx.moveTo(0, height * 0.6);
  ctx.bezierCurveTo(width * 0.25, height * 0.4, width * 0.45, height * 0.55, width * 0.7, height * 0.42);
  ctx.bezierCurveTo(width * 0.85, height * 0.35, width * 0.95, height * 0.48, width, height * 0.52);
  ctx.lineTo(width, height * 0.75);
  ctx.lineTo(0, height * 0.75);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 4. Ground Layer (Grass / Cottage / Lake / Beach)
  const groundGrad = ctx.createLinearGradient(0, height * 0.6, 0, height);
  if (locType === 'lake' || locType === 'river') {
    // Water ground
    groundGrad.addColorStop(0, '#0284c7');
    groundGrad.addColorStop(0.4, '#0369a1');
    groundGrad.addColorStop(1, '#075985');
  } else if (locType === 'beach') {
    groundGrad.addColorStop(0, '#fde047');
    groundGrad.addColorStop(1, '#ca8a04');
  } else {
    // Lush green meadow / forest
    groundGrad.addColorStop(0, lighting === 'moonlit-night' ? '#14532d' : '#4ade80');
    groundGrad.addColorStop(1, lighting === 'moonlit-night' ? '#052e16' : '#15803d');
  }

  ctx.fillStyle = groundGrad;
  ctx.beginPath();
  ctx.moveTo(0, height * 0.6);
  ctx.bezierCurveTo(width * 0.3, height * 0.57, width * 0.7, height * 0.63, width, height * 0.59);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // 5. Animated Environment Elements (Trees swaying, River ripples, Fireflies)
  if (locType === 'lake' || locType === 'river' || locType === 'ocean') {
    // Water Ripples
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2.5;
    for (let r = 0; r < 6; r++) {
      const rx = (width * 0.15 + r * width * 0.16 + Math.sin(time * 2 + r) * 20) % width;
      const ry = height * 0.68 + r * (height * 0.05);
      ctx.beginPath();
      ctx.ellipse(rx, ry, width * 0.06, height * 0.012, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else {
    // Stylized Storybook Pine Trees
    for (let t = 0; t < 6; t++) {
      const tx = (t * width * 0.2 + width * 0.05);
      const ty = height * 0.58;
      const treeScale = 0.7 + (t % 3) * 0.25;
      const sway = Math.sin(time * 1.5 + t) * 5;

      ctx.save();
      ctx.translate(tx + sway, ty);
      ctx.scale(treeScale, treeScale);

      // Trunk
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-8, 0, 16, height * 0.18);

      // Foliage layers
      const foliageColors = lighting === 'moonlit-night' 
        ? ['#064e3b', '#065f46', '#047857']
        : ['#166534', '#15803d', '#22c55e'];

      for (let l = 0; l < 3; l++) {
        ctx.fillStyle = foliageColors[l];
        ctx.beginPath();
        const ly = -l * 40;
        const lw = 48 - l * 8;
        ctx.moveTo(0, ly - 50);
        ctx.lineTo(-lw, ly);
        ctx.lineTo(lw, ly);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // 6. Magic Particles / Weather
  if (weather === 'rainy') {
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.6)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 40; i++) {
      const rx = (i * 37 + time * 120) % width;
      const ry = (i * 59 + time * 600) % height;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 4, ry + 16);
      ctx.stroke();
    }
  } else if (lighting === 'mystical-glow' || location?.backgroundElements.includes('fireflies')) {
    // Glowing Fireflies / Magic Sparkles
    for (let i = 0; i < 12; i++) {
      const fx = (Math.sin(time * 0.8 + i) * width * 0.4 + width * 0.5);
      const fy = height * 0.5 + Math.cos(time * 1.1 + i * 2) * height * 0.25;
      const glow = 0.5 + 0.5 * Math.sin(time * 3 + i);

      ctx.save();
      ctx.fillStyle = `rgba(253, 224, 71, ${glow})`;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(fx, fy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
