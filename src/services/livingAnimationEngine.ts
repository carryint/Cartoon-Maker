import { Character, CharacterEmotion } from '../types/cartoon';

export interface CharacterChoreography {
  action: 'idle' | 'walking' | 'talking' | 'crouching' | 'waving' | 'excited-jump' | 'looking-around';
  facing: 'right' | 'left';
  targetX: number; // 0.0 to 1.0 (screen width fraction)
  stageY: number; // 0.0 to 1.0 (screen height fraction)
}

export class LivingAnimationEngine {
  /**
   * Draw articulated moving LiLo character onto canvas
   */
  public static drawMovingLiLo(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement | null,
    x: number,
    y: number,
    size: number,
    time: number,
    isSpeaking: boolean,
    emotion: CharacterEmotion = 'happy',
    choreography: CharacterChoreography = { action: 'idle', facing: 'right', targetX: 0.35, stageY: 0.65 }
  ): void {
    ctx.save();

    // 1. Natural Breathing & Walking Physics
    const isWalking = choreography.action === 'walking';
    const isJumping = choreography.action === 'excited-jump';
    const isCrouching = choreography.action === 'crouching';

    const breathOffset = Math.sin(time * 3.2) * (size * 0.015);
    const walkBob = isWalking ? Math.abs(Math.sin(time * 8.0)) * (size * 0.04) : 0;
    const jumpBob = isJumping ? Math.abs(Math.sin(time * 10.0)) * (size * 0.08) : 0;
    const talkBounce = isSpeaking ? Math.abs(Math.sin(time * 12.0)) * (size * 0.035) : 0;
    const crouchOffset = isCrouching ? size * 0.12 : 0;

    const finalY = y - breathOffset - walkBob - jumpBob - talkBounce + crouchOffset;

    // Body Tilt / Sway
    const walkTilt = isWalking ? Math.sin(time * 8.0) * 0.06 : Math.sin(time * 1.8) * 0.015;

    ctx.translate(x, finalY);
    if (choreography.facing === 'left') {
      ctx.scale(-1, 1);
    }
    ctx.rotate(walkTilt);

    // 2. Soft Ground Shadow (adapts to jumping/crouching)
    ctx.save();
    const shadowScale = isJumping ? 0.7 : isCrouching ? 1.2 : 1.0;
    const shadowAlpha = isJumping ? 0.2 : 0.38;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.48 - (crouchOffset * 0.5), size * 0.36 * shadowScale, 14 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.fill();
    ctx.restore();

    // 3. Render Base Character Sprite (High Res Cutout)
    if (img && img.complete) {
      // Glow if speaking
      if (isSpeaking) {
        ctx.shadowColor = 'rgba(236, 72, 153, 0.7)';
        ctx.shadowBlur = 22;
      }

      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.shadowBlur = 0;
    }

    // 4. Articulated Overlay Elements: Eye Blink & Talking Mouth
    const headCenterX = 0;
    const headCenterY = -size * 0.18;
    const eyeSpacing = size * 0.11;
    const eyeY = headCenterY - size * 0.02;

    // Eye Blink calculation (blinks every 3.8 seconds for 0.15s)
    const blinkCycle = time % 3.8;
    const isBlinking = blinkCycle < 0.16;

    if (isBlinking) {
      ctx.save();
      ctx.strokeStyle = '#4a2c11';
      ctx.lineWidth = Math.max(3, size * 0.02);
      ctx.lineCap = 'round';
      // Left eye closed arch
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, size * 0.045, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
      // Right eye closed arch
      ctx.beginPath();
      ctx.arc(eyeSpacing, eyeY, size * 0.045, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
      ctx.restore();
    } else if (emotion === 'winking') {
      ctx.save();
      ctx.strokeStyle = '#4a2c11';
      ctx.lineWidth = Math.max(3, size * 0.02);
      ctx.lineCap = 'round';
      // Right eye winking closed
      ctx.beginPath();
      ctx.arc(eyeSpacing, eyeY, size * 0.045, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }

    // 5. Dynamic Talking Mouth Movement
    if (isSpeaking) {
      ctx.save();
      const mouthY = headCenterY + size * 0.11;
      const mouthOpen = (Math.sin(time * 14.0) + 1) * 0.5; // 0 to 1
      const mouthW = size * 0.07;
      const mouthH = size * 0.03 + (mouthOpen * size * 0.035);

      ctx.beginPath();
      ctx.ellipse(headCenterX, mouthY, mouthW, mouthH, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#b91c1c';
      ctx.fill();

      // Cute little tongue
      ctx.beginPath();
      ctx.ellipse(headCenterX, mouthY + mouthH * 0.35, mouthW * 0.65, mouthH * 0.45, 0, 0, Math.PI);
      ctx.fillStyle = '#f472b6';
      ctx.fill();

      ctx.restore();
    }

    // 6. Arm Waving / Pointing Overlay Gestures
    if (choreography.action === 'waving') {
      const armWave = Math.sin(time * 10.0) * 0.35;
      ctx.save();
      ctx.translate(size * 0.26, -size * 0.05);
      ctx.rotate(armWave - 0.4);
      // Hand blossom / sparkle wave
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.035, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Draw articulated moving Mozz (Ginger Cat) character onto canvas
   */
  public static drawMovingMozz(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement | null,
    x: number,
    y: number,
    size: number,
    time: number,
    isSpeaking: boolean,
    emotion: CharacterEmotion = 'happy',
    choreography: CharacterChoreography = { action: 'idle', facing: 'left', targetX: 0.68, stageY: 0.65 }
  ): void {
    ctx.save();

    const isWalking = choreography.action === 'walking';
    const isJumping = choreography.action === 'excited-jump';

    const breathOffset = Math.sin(time * 3.5 + 1.0) * (size * 0.018);
    const walkBob = isWalking ? Math.abs(Math.sin(time * 9.0)) * (size * 0.045) : 0;
    const jumpBob = isJumping ? Math.abs(Math.sin(time * 11.0)) * (size * 0.09) : 0;
    const talkBounce = isSpeaking ? Math.abs(Math.sin(time * 13.0)) * (size * 0.03) : 0;

    const finalY = y - breathOffset - walkBob - jumpBob - talkBounce;
    const walkTilt = isWalking ? Math.sin(time * 9.0) * 0.07 : Math.sin(time * 2.0) * 0.02;

    ctx.translate(x, finalY);
    if (choreography.facing === 'left') {
      ctx.scale(-1, 1);
    }
    ctx.rotate(walkTilt);

    // 1. Soft Ground Shadow
    ctx.save();
    const shadowScale = isJumping ? 0.65 : 1.0;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.48, size * 0.38 * shadowScale, 13 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fillStyle = isJumping ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.35)';
    ctx.fill();
    ctx.restore();

    // 2. Articulated Swishing Cat Tail (Procedural Multi-Segment Sine Wave)
    ctx.save();
    const tailStartX = -size * 0.28;
    const tailStartY = size * 0.22;
    const tailSegments = 6;
    const segLen = (size * 0.42) / tailSegments;

    ctx.beginPath();
    ctx.moveTo(tailStartX, tailStartY);
    let curX = tailStartX;
    let curY = tailStartY;

    for (let i = 1; i <= tailSegments; i++) {
      const swish = Math.sin(time * 4.5 + i * 0.65) * (size * 0.04 * (i / tailSegments));
      curX -= segLen * 0.8;
      curY -= segLen * 0.7 + swish;
      ctx.lineTo(curX, curY);
    }

    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = Math.max(12, size * 0.09);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Tail Fluffy Tip (Cream/White)
    ctx.beginPath();
    ctx.arc(curX, curY, size * 0.055, 0, Math.PI * 2);
    ctx.fillStyle = '#fed7aa';
    ctx.fill();
    ctx.restore();

    // 3. Render Base Cat Portrait / Sprite
    if (img && img.complete) {
      if (isSpeaking) {
        ctx.shadowColor = 'rgba(6, 182, 212, 0.8)';
        ctx.shadowBlur = 22;
      }

      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.shadowBlur = 0;
    }

    // 4. Cat Ear Twitch Animation
    const earTwitchCycle = (time * 1.3) % 4.0;
    if (earTwitchCycle < 0.25) {
      ctx.save();
      const earX = size * 0.16;
      const earY = -size * 0.36;
      const earAngle = Math.sin(time * 30.0) * 0.18;
      ctx.translate(earX, earY);
      ctx.rotate(earAngle);
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(-size * 0.05, 0);
      ctx.lineTo(0, -size * 0.1);
      ctx.lineTo(size * 0.05, 0);
      ctx.fill();
      ctx.restore();
    }

    // 5. Cat Eye Blink Cycle
    const catBlink = (time + 1.2) % 4.2;
    if (catBlink < 0.15) {
      ctx.save();
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = Math.max(3, size * 0.022);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(-size * 0.1, -size * 0.08, size * 0.05, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(size * 0.1, -size * 0.08, size * 0.05, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }

    // 6. Cat Meow Mouth Movement when Speaking
    if (isSpeaking) {
      ctx.save();
      const mouthY = -size * 0.01;
      const mouthOpen = (Math.sin(time * 13.0) + 1) * 0.5;
      const mouthW = size * 0.055;
      const mouthH = size * 0.025 + (mouthOpen * size * 0.03);

      ctx.beginPath();
      ctx.ellipse(0, mouthY, mouthW, mouthH, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }
}
