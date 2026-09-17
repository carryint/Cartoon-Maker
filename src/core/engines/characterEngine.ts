import { CharacterDNA, EmotionType, PoseType } from '../../types/lilo';

// ============================================================
//  Character Engine — 2.5D/3D Rigging & Expressive Puppetry
// ============================================================

export interface RenderState {
  time: number;
  isTalking: boolean;
  emotion: EmotionType;
  pose: PoseType;
  viseme?: string; // 'open' | 'smile' | 'round' | 'closed'
}

export function drawRiggedCharacter(
  ctx: CanvasRenderingContext2D,
  char: CharacterDNA,
  x: number,
  y: number,
  width: number,
  height: number,
  state: RenderState
) {
  const { time, isTalking, emotion, pose } = state;

  ctx.save();

  // 1. Dynamic Ground Shadow
  const shadowScale = 1 + Math.sin(time * 2) * 0.04;
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
  ctx.beginPath();
  ctx.ellipse(x + width / 2, y + height * 0.94, (width * 0.35) * shadowScale, height * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Kinematics (Breathing & Head/Body Sway)
  const breathY = Math.sin(time * 2.5) * (height * 0.015);
  const breathScaleY = 1 + Math.sin(time * 2.5) * 0.012;
  const swayAngle = Math.sin(time * 1.5) * 0.025 + (pose === 'walking' ? Math.sin(time * 7) * 0.05 : 0);
  const walkBob = pose === 'walking' || pose === 'running' ? Math.abs(Math.sin(time * 7)) * (height * 0.03) : 0;
  const talkBob = isTalking ? Math.sin(time * 16) * (height * 0.01) : 0;

  const rootX = x + width / 2;
  const rootY = y + height * 0.9;

  ctx.translate(rootX, rootY);
  ctx.rotate(swayAngle);
  ctx.scale(1, breathScaleY);
  ctx.translate(-rootX, -rootY);

  const drawX = x;
  const drawY = y - breathY - walkBob - talkBob;

  // 3. Render Mode: If custom reference image uploaded, render with 3D overlay, else render stylized vector rig
  if (char.references.frontUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = char.references.frontUrl;

    if (img.complete && img.naturalWidth > 0) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 8;
      ctx.drawImage(img, drawX, drawY, width, height);
      ctx.restore();
    } else {
      drawVectorRig(ctx, char, drawX, drawY, width, height, state);
    }
  } else {
    drawVectorRig(ctx, char, drawX, drawY, width, height, state);
  }

  // 4. Emotion Halo / Sparkles
  if (emotion === 'excited' || emotion === 'happy' || emotion === 'laughing') {
    ctx.save();
    const auraGrad = ctx.createRadialGradient(
      drawX + width / 2, drawY + height * 0.35, width * 0.15,
      drawX + width / 2, drawY + height * 0.35, width * 0.55
    );
    auraGrad.addColorStop(0, emotion === 'excited' ? 'rgba(251, 191, 36, 0.25)' : 'rgba(244, 114, 182, 0.2)');
    auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(drawX + width / 2, drawY + height * 0.35, width * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

function drawVectorRig(
  ctx: CanvasRenderingContext2D,
  char: CharacterDNA,
  x: number,
  y: number,
  w: number,
  h: number,
  state: RenderState
) {
  const { time, isTalking, emotion, pose } = state;
  const cx = x + w / 2;

  // Body Dimensions
  const headRadius = w * 0.26;
  const headY = y + h * 0.25;
  const bodyY = headY + headRadius * 0.8;
  const bodyWidth = w * 0.44;
  const bodyHeight = h * 0.38;

  // 1. Legs
  ctx.save();
  ctx.fillStyle = char.clothing.bottomColor || '#1e3a8a';
  const legW = w * 0.1;
  const legH = h * 0.22;
  const legSway = pose === 'walking' ? Math.sin(time * 7) * 15 : 0;

  // Left Leg
  ctx.fillRect(cx - bodyWidth * 0.35 + legSway, bodyY + bodyHeight * 0.8, legW, legH);
  // Right Leg
  ctx.fillRect(cx + bodyWidth * 0.35 - legW - legSway, bodyY + bodyHeight * 0.8, legW, legH);

  // Shoes
  ctx.fillStyle = char.clothing.footwear ? '#dc2626' : '#1e293b';
  ctx.beginPath();
  ctx.roundRect(cx - bodyWidth * 0.4 + legSway, bodyY + bodyHeight * 0.8 + legH - 8, legW * 1.4, 12, 6);
  ctx.roundRect(cx + bodyWidth * 0.35 - legW - legSway, bodyY + bodyHeight * 0.8 + legH - 8, legW * 1.4, 12, 6);
  ctx.fill();
  ctx.restore();

  // 2. Torso & Clothing
  ctx.save();
  ctx.fillStyle = char.clothing.topColor || char.primaryColor || '#ec4899';
  ctx.beginPath();
  ctx.roundRect(cx - bodyWidth / 2, bodyY, bodyWidth, bodyHeight, 18);
  ctx.fill();
  ctx.restore();

  // 3. Arms & Poses
  ctx.save();
  ctx.fillStyle = char.appearance.skinTone || '#fed7aa';
  ctx.lineWidth = w * 0.05;
  ctx.lineCap = 'round';
  ctx.strokeStyle = char.clothing.topColor || char.primaryColor;

  if (pose === 'waving') {
    // Left arm down
    ctx.beginPath();
    ctx.moveTo(cx - bodyWidth / 2, bodyY + 15);
    ctx.lineTo(cx - bodyWidth / 2 - 15, bodyY + 50);
    ctx.stroke();

    // Right arm waving
    const waveAngle = Math.sin(time * 8) * 0.3;
    ctx.save();
    ctx.translate(cx + bodyWidth / 2, bodyY + 15);
    ctx.rotate(waveAngle - 0.7);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(25, -25);
    ctx.stroke();
    ctx.restore();
  } else {
    // Idle / Talking Arms
    const armBob = isTalking ? Math.sin(time * 12) * 6 : 0;
    ctx.beginPath();
    ctx.moveTo(cx - bodyWidth / 2, bodyY + 15);
    ctx.lineTo(cx - bodyWidth / 2 - 12, bodyY + 45 + armBob);
    ctx.moveTo(cx + bodyWidth / 2, bodyY + 15);
    ctx.lineTo(cx + bodyWidth / 2 + 12, bodyY + 45 - armBob);
    ctx.stroke();
  }
  ctx.restore();

  // 4. Head & Face
  ctx.save();
  ctx.fillStyle = char.appearance.skinTone || '#fed7aa';
  ctx.beginPath();
  ctx.arc(cx, headY, headRadius, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = char.appearance.hairColor || '#78350f';
  ctx.beginPath();
  ctx.arc(cx, headY - headRadius * 0.2, headRadius * 1.05, Math.PI, Math.PI * 2);
  ctx.lineTo(cx + headRadius, headY + headRadius * 0.3);
  ctx.lineTo(cx + headRadius * 0.6, headY);
  ctx.lineTo(cx - headRadius * 0.6, headY);
  ctx.lineTo(cx - headRadius, headY + headRadius * 0.3);
  ctx.closePath();
  ctx.fill();

  // Eyes (with natural blink cycle)
  const isBlinking = (time % 3.5) > 3.35;
  const eyeOffset = headRadius * 0.35;
  const eyeY = headY;

  if (isBlinking) {
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx - eyeOffset, eyeY, 6, 0.2, Math.PI - 0.2);
    ctx.arc(cx + eyeOffset, eyeY, 6, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else {
    // Big expressive cartoon eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx - eyeOffset, eyeY, 9, 12, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + eyeOffset, eyeY, 9, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = char.appearance.eyeColor || '#0284c7';
    ctx.beginPath();
    ctx.arc(cx - eyeOffset + (isTalking ? 1 : 0), eyeY, 5.5, 0, Math.PI * 2);
    ctx.arc(cx + eyeOffset + (isTalking ? 1 : 0), eyeY, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Eye catch-light (Sparkle)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - eyeOffset - 2, eyeY - 3, 2.2, 0, Math.PI * 2);
    ctx.arc(cx + eyeOffset - 2, eyeY - 3, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth & Lip Sync
  const mouthY = headY + headRadius * 0.45;
  if (isTalking) {
    const mouthHeight = 4 + Math.abs(Math.sin(time * 16)) * 9;
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(cx, mouthY, 8, mouthHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else {
    // Cute smile
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (emotion === 'sad' || emotion === 'crying') {
      ctx.arc(cx, mouthY + 8, 8, Math.PI + 0.3, Math.PI * 2 - 0.3);
    } else {
      ctx.arc(cx, mouthY, 8, 0.2, Math.PI - 0.2);
    }
    ctx.stroke();
  }

  // Name Tag
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.beginPath();
  ctx.roundRect(cx - w * 0.35, y + h * 0.94, w * 0.7, 18, 6);
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.font = `bold ${Math.max(10, w * 0.08)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(char.name, cx, y + h * 0.94 + 13);

  ctx.restore();
}
