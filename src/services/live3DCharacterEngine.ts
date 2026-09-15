// ============================================================
//  Live 3D Character Engine
//  Auto-converts uploaded 3D character images into living,
//  expressive, rigged characters with 3D parallax, lip-sync,
//  breathing, blinking, emotion aura, and walking animations.
// ============================================================

export interface LiveCharacterRig {
  id: string;
  sourceImage: HTMLImageElement;
  cutoutCanvas?: HTMLCanvasElement;
  hasTransparentBg: boolean;
  aspectRatio: number;
  // Rig parameters
  headCenterRatio: { x: number; y: number };
  bodyCenterRatio: { x: number; y: number };
  eyeLevelRatio: number;
  mouthLevelRatio: number;
}

export interface AnimationState {
  time: number;
  isTalking: boolean;
  emotion: string;
  action?: 'idle' | 'walk' | 'talk' | 'wave' | 'celebrate' | 'think';
  gazeX?: number; // -1 to 1
  gazeY?: number; // -1 to 1
  walkProgress?: number;
  customScale?: number;
}

// Memory cache for processed cutout canvases
const rigCache = new Map<string, LiveCharacterRig>();

/**
 * Automatically processes an uploaded image:
 * - Detects background color from corner patches
 * - Creates a clean transparent cutout if solid/near-solid background exists
 * - Computes 3D structural rig points
 */
export async function createLiveRig(imageUrl: string, charId: string): Promise<LiveCharacterRig> {
  if (rigCache.has(charId)) {
    const cached = rigCache.get(charId)!;
    if (cached.sourceImage.src === imageUrl) return cached;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => resolve(); // continue even if offline error
    img.src = imageUrl;
  });

  const aspect = (img.naturalWidth && img.naturalHeight) ? img.naturalWidth / img.naturalHeight : 0.8;

  // Process image for intelligent cutout and edge enhancement
  const canvas = document.createElement('canvas');
  const w = img.naturalWidth || 400;
  const h = img.naturalHeight || 500;
  canvas.width = Math.min(w, 800);
  canvas.height = Math.min(h, 1000);
  const ctx = canvas.getContext('2d');

  let hasTransparent = false;

  if (ctx && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Sample 4 corners to check background color
      const sampleIndices = [
        0, // top-left
        (canvas.width - 1) * 4, // top-right
        ((canvas.height - 1) * canvas.width) * 4, // bottom-left
        ((canvas.height - 1) * canvas.width + (canvas.width - 1)) * 4 // bottom-right
      ];

      // Check if image already has transparency
      for (let i = 3; i < data.length; i += 40) {
        if (data[i] < 200) {
          hasTransparent = true;
          break;
        }
      }

      // If opaque background, perform smart color-distance cutout for plain/studio backgrounds
      if (!hasTransparent) {
        const bgR = (data[sampleIndices[0]] + data[sampleIndices[1]]) / 2;
        const bgG = (data[sampleIndices[0] + 1] + data[sampleIndices[1] + 1]) / 2;
        const bgB = (data[sampleIndices[0] + 2] + data[sampleIndices[1] + 2]) / 2;

        const isNearWhite = bgR > 220 && bgG > 220 && bgB > 220;
        const isNearBlack = bgR < 35 && bgG < 35 && bgB < 35;
        const isStudioBg = isNearWhite || isNearBlack || (Math.abs(bgR - bgG) < 15 && Math.abs(bgG - bgB) < 15);

        if (isStudioBg) {
          const threshold = isNearWhite ? 45 : isNearBlack ? 35 : 40;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
            if (dist < threshold) {
              data[i + 3] = Math.max(0, Math.min(255, (dist / threshold) * 255 - 40));
            }
          }
          ctx.putImageData(imgData, 0, 0);
          hasTransparent = true;
        }
      }
    } catch {
      // Ignore cross-origin image data restrictions if any
    }
  }

  const rig: LiveCharacterRig = {
    id: charId,
    sourceImage: img,
    cutoutCanvas: hasTransparent ? canvas : undefined,
    hasTransparentBg: hasTransparent,
    aspectRatio: aspect,
    headCenterRatio: { x: 0.5, y: 0.28 },
    bodyCenterRatio: { x: 0.5, y: 0.65 },
    eyeLevelRatio: 0.26,
    mouthLevelRatio: 0.36,
  };

  rigCache.set(charId, rig);
  return rig;
}

/**
 * Render a living, 3D animated character on any canvas
 */
export function drawLive3DCharacter(
  ctx: CanvasRenderingContext2D,
  rig: LiveCharacterRig,
  x: number,
  y: number,
  width: number,
  height: number,
  state: AnimationState
): void {
  const { time, isTalking, emotion, action = 'idle' } = state;

  ctx.save();

  // 1. DYNAMIC GROUND SHADOW (3D ambient occlusion)
  const shadowBob = Math.sin(time * 3) * (width * 0.02);
  const shadowScale = 1 + (action === 'walk' ? Math.sin(time * 8) * 0.08 : Math.sin(time * 1.5) * 0.03);
  const shadowY = y + height * 0.96;
  const shadowX = x + width / 2;

  ctx.save();
  ctx.fillStyle = 'rgba(10, 15, 30, 0.45)';
  ctx.beginPath();
  ctx.ellipse(
    shadowX,
    shadowY,
    (width * 0.38) * shadowScale,
    (height * 0.05) * shadowScale,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  // 2. KINEMATIC MOTION PARAMETERS
  // Natural breathing curve (slow sine)
  const breathY = Math.sin(time * 2.2) * (height * 0.015);
  const breathScaleY = 1 + Math.sin(time * 2.2) * 0.012;
  const breathScaleX = 1 - Math.sin(time * 2.2) * 0.008;

  // 3D Parallax yaw/pitch (subtle head and body turn)
  const swayAngle = Math.sin(time * 1.4) * 0.03 + (action === 'walk' ? Math.sin(time * 6) * 0.07 : 0);
  const walkBobY = action === 'walk' ? Math.abs(Math.sin(time * 6)) * (height * 0.04) : 0;
  const talkBobY = isTalking ? Math.sin(time * 14) * (height * 0.012) : 0;

  // Emotional posture modifiers
  let emotionScaleX = 1;
  let emotionScaleY = 1;
  let emotionTilt = 0;
  let glowColor = '';

  switch (emotion) {
    case 'excited':
      emotionScaleX = 1 + Math.abs(Math.sin(time * 8)) * 0.04;
      emotionScaleY = 1 + Math.sin(time * 8) * 0.03;
      glowColor = 'rgba(251, 191, 36, 0.25)';
      break;
    case 'happy':
      emotionScaleY = 1 + Math.sin(time * 3) * 0.02;
      glowColor = 'rgba(244, 114, 182, 0.2)';
      break;
    case 'sad':
      emotionTilt = 0.06;
      emotionScaleY = 0.96;
      break;
    case 'scared':
      emotionScaleX = 1 + (Math.random() - 0.5) * 0.03;
      emotionTilt = Math.sin(time * 20) * 0.02;
      break;
    case 'thinking':
      emotionTilt = -0.07;
      glowColor = 'rgba(96, 165, 250, 0.2)';
      break;
    case 'angry':
      glowColor = 'rgba(239, 68, 68, 0.25)';
      emotionScaleX = 1.05;
      break;
  }

  // 3. TRANSFORM HIERARCHY (Root at character feet center)
  const rootX = x + width / 2;
  const rootY = y + height * 0.92;

  ctx.translate(rootX, rootY);
  ctx.rotate(swayAngle + emotionTilt);
  ctx.scale(breathScaleX * emotionScaleX, breathScaleY * emotionScaleY);
  ctx.translate(-rootX, -rootY);

  // Position with bobbing
  const drawX = x;
  const drawY = y - breathY - walkBobY - talkBobY;

  // 4. DRAW 3D EMOTION GLOW / AURA
  if (glowColor) {
    ctx.save();
    const auraGrad = ctx.createRadialGradient(
      drawX + width / 2,
      drawY + height * 0.45,
      width * 0.2,
      drawX + width / 2,
      drawY + height * 0.45,
      width * 0.7
    );
    auraGrad.addColorStop(0, glowColor);
    auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(drawX + width / 2, drawY + height * 0.45, width * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 5. DRAW LIVE CHARACTER SPRITE WITH 3D DEPTH
  const renderSource = rig.cutoutCanvas || rig.sourceImage;

  if (renderSource) {
    ctx.save();
    // 3D Soft Rim Lighting and Drop Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 12;

    ctx.drawImage(renderSource, drawX, drawY, width, height);
    ctx.restore();

    // 6. 3D SPECULAR HIGHLIGHT (Simulates directional 3D light across body surface)
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    const lightGrad = ctx.createLinearGradient(drawX, drawY, drawX + width * 0.8, drawY + height);
    lightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    lightGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.03)');
    lightGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
    lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
    ctx.fillStyle = lightGrad;
    ctx.fillRect(drawX, drawY, width, height);
    ctx.restore();
  }

  // 7. DYNAMIC 3D BLINKING & LIP-SYNC OVERLAYS
  // Natural random blinking cycle
  const blinkCycle = time % 3.8;
  const isBlinking = blinkCycle > 3.65 && blinkCycle < 3.8;

  const headX = drawX + width * rig.headCenterRatio.x;
  const headY = drawY + height * rig.headCenterRatio.y;
  const eyeY = drawY + height * rig.eyeLevelRatio;
  const mouthY = drawY + height * rig.mouthLevelRatio;

  if (isBlinking) {
    // Draw cute stylized blink curves
    ctx.save();
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.75)';
    ctx.lineWidth = Math.max(2.5, width * 0.018);
    ctx.lineCap = 'round';
    const eyeSpread = width * 0.12;

    // Left eye blink arc
    ctx.beginPath();
    ctx.arc(headX - eyeSpread, eyeY, width * 0.04, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Right eye blink arc
    ctx.beginPath();
    ctx.arc(headX + eyeSpread, eyeY, width * 0.04, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.restore();
  }

  // Phoneme Lip-Sync (when speaking)
  if (isTalking) {
    const talkShape = Math.sin(time * 16);
    const mouthW = width * (0.05 + Math.abs(talkShape) * 0.03);
    const mouthH = height * (0.01 + Math.max(0, talkShape) * 0.025);

    ctx.save();
    ctx.fillStyle = '#C2410C';
    ctx.strokeStyle = '#7C2D12';
    ctx.lineWidth = Math.max(1.5, width * 0.01);
    ctx.beginPath();
    ctx.ellipse(headX, mouthY, mouthW, mouthH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Little inner mouth depth
    ctx.fillStyle = '#7F1D1D';
    ctx.beginPath();
    ctx.ellipse(headX, mouthY + mouthH * 0.2, mouthW * 0.7, mouthH * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 8. EMOTION FLOATING PARTICLES
  drawEmotionEffects(ctx, emotion, headX, headY, width, height, time);

  ctx.restore();
}

function drawEmotionEffects(
  ctx: CanvasRenderingContext2D,
  emotion: string,
  hx: number,
  hy: number,
  w: number,
  _h: number,
  time: number
): void {
  ctx.save();
  if (emotion === 'excited' || emotion === 'happy') {
    // Floating sparkles
    for (let i = 0; i < 3; i++) {
      const sparkX = hx + Math.sin(time * 2 + i * 2) * (w * 0.35);
      const sparkY = hy - w * 0.25 - (time * 20 + i * 25) % (w * 0.5);
      const size = Math.max(3, (w * 0.03) * (1 + Math.sin(time * 6 + i)));

      ctx.fillStyle = i % 2 === 0 ? '#FBBF24' : '#F472B6';
      ctx.beginPath();
      // 4-point sparkle star
      ctx.moveTo(sparkX, sparkY - size);
      ctx.lineTo(sparkX + size * 0.3, sparkY - size * 0.3);
      ctx.lineTo(sparkX + size, sparkY);
      ctx.lineTo(sparkX + size * 0.3, sparkY + size * 0.3);
      ctx.lineTo(sparkX, sparkY + size);
      ctx.lineTo(sparkX - size * 0.3, sparkY + size * 0.3);
      ctx.lineTo(sparkX - size, sparkY);
      ctx.lineTo(sparkX - size * 0.3, sparkY - size * 0.3);
      ctx.closePath();
      ctx.fill();
    }
  } else if (emotion === 'thinking') {
    // Animated question bubble
    const qy = hy - w * 0.35 + Math.sin(time * 3) * 6;
    ctx.fillStyle = '#60A5FA';
    ctx.font = `bold ${w * 0.12}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('💡', hx + w * 0.25, qy);
  } else if (emotion === 'scared') {
    // Sweat drop
    const dropY = hy - w * 0.1 + ((time * 30) % (w * 0.2));
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(hx + w * 0.28, dropY, w * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
