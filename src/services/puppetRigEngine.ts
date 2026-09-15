import { CharacterEmotion, Character } from '../types/cartoon';

export type PuppetPose = 
  | 'idle' 
  | 'walk' 
  | 'run' 
  | 'wave' 
  | 'inspect' 
  | 'jump' 
  | 'celebrate' 
  | 'talk' 
  | 'sit';

export interface PuppetTransform {
  x: number;          // 0 to 1 normalized canvas X
  y: number;          // 0 to 1 normalized canvas Y
  scale: number;      // 0.5 to 2.0
  depthLayer: number; // 0 (background) to 1 (midground) to 2 (foreground)
  facing: 'left' | 'right';
  currentPose: PuppetPose;
}

export interface BoneJoint {
  x: number;
  y: number;
  angle: number;
  length: number;
}

export interface PuppetRigState {
  headAngle: number;
  bodyBob: number;
  leftArmAngle: number;
  rightArmAngle: number;
  leftLegAngle: number;
  rightLegAngle: number;
  tailAngle: number;
  mouthOpen: number; // 0 to 1
  blink: number;     // 0 (open) to 1 (closed)
  earTwitch: number;
}

class PuppetRigEngine {
  /**
   * Computes dynamic procedural IK bone state based on time, pose, and talking status
   */
  public computePuppetState(
    pose: PuppetPose,
    time: number,
    isTalking: boolean = false,
    emotion: CharacterEmotion = 'happy'
  ): PuppetRigState {
    const t = time * 3.5;
    let headAngle = Math.sin(t * 0.8) * 0.05;
    let bodyBob = Math.sin(t * 1.5) * 3;
    let leftArmAngle = 0.1;
    let rightArmAngle = -0.1;
    let leftLegAngle = 0;
    let rightLegAngle = 0;
    let tailAngle = Math.sin(t * 2) * 0.35;
    let mouthOpen = 0;
    let blink = Math.sin(time * 0.8) > 0.94 ? 1 : 0;
    let earTwitch = Math.sin(time * 4) > 0.88 ? 0.2 : 0;

    // Talking mouth oscillation
    if (isTalking) {
      mouthOpen = Math.abs(Math.sin(time * 16)) * 0.8 + 0.2;
      headAngle += Math.sin(time * 10) * 0.08;
    }

    switch (pose) {
      case 'walk': {
        const walkCycle = time * 5;
        bodyBob = Math.abs(Math.sin(walkCycle)) * 6;
        leftLegAngle = Math.sin(walkCycle) * 0.6;
        rightLegAngle = -Math.sin(walkCycle) * 0.6;
        leftArmAngle = -Math.sin(walkCycle) * 0.5;
        rightArmAngle = Math.sin(walkCycle) * 0.5;
        headAngle = Math.sin(walkCycle * 0.5) * 0.08;
        tailAngle = Math.sin(walkCycle * 1.5) * 0.5;
        break;
      }

      case 'run': {
        const runCycle = time * 8;
        bodyBob = Math.abs(Math.sin(runCycle)) * 10;
        leftLegAngle = Math.sin(runCycle) * 0.9;
        rightLegAngle = -Math.sin(runCycle) * 0.9;
        leftArmAngle = -Math.sin(runCycle) * 0.8;
        rightArmAngle = Math.sin(runCycle) * 0.8;
        headAngle = Math.sin(runCycle) * 0.12;
        tailAngle = Math.sin(runCycle * 2) * 0.8;
        break;
      }

      case 'wave': {
        leftArmAngle = 0.2;
        rightArmAngle = -2.0 + Math.sin(time * 9) * 0.5;
        headAngle = 0.15;
        bodyBob = Math.sin(time * 3) * 2;
        break;
      }

      case 'inspect': {
        headAngle = 0.35;
        bodyBob = 12;
        leftLegAngle = -0.3;
        rightLegAngle = 0.3;
        leftArmAngle = 0.4;
        rightArmAngle = 0.6;
        break;
      }

      case 'jump': {
        const jumpPhase = (time * 2.5) % 1;
        const jumpHeight = Math.sin(jumpPhase * Math.PI) * 35;
        bodyBob = -jumpHeight;
        leftLegAngle = -0.4;
        rightLegAngle = 0.4;
        leftArmAngle = -1.2;
        rightArmAngle = 1.2;
        break;
      }

      case 'celebrate': {
        const cheer = Math.sin(time * 6);
        bodyBob = Math.abs(cheer) * 8;
        leftArmAngle = -2.2 + cheer * 0.3;
        rightArmAngle = 2.2 - cheer * 0.3;
        headAngle = cheer * 0.1;
        break;
      }

      case 'talk': {
        bodyBob = Math.sin(time * 3) * 3;
        rightArmAngle = -0.6 + Math.sin(time * 4) * 0.3;
        leftArmAngle = 0.2;
        break;
      }

      case 'sit': {
        bodyBob = 16;
        leftLegAngle = 1.2;
        rightLegAngle = 1.2;
        leftArmAngle = 0.2;
        rightArmAngle = -0.2;
        break;
      }

      case 'idle':
      default: {
        bodyBob = Math.sin(t) * 2;
        headAngle = Math.sin(t * 0.5) * 0.04;
        leftArmAngle = Math.sin(t * 0.7) * 0.08;
        rightArmAngle = -Math.sin(t * 0.7) * 0.08;
        break;
      }
    }

    return {
      headAngle,
      bodyBob,
      leftArmAngle,
      rightArmAngle,
      leftLegAngle,
      rightLegAngle,
      tailAngle,
      mouthOpen,
      blink,
      earTwitch,
    };
  }

  /**
   * Render LiLo Rigged 2.5D Puppet on Canvas
   */
  public renderLiLoPuppet(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    facing: 'left' | 'right',
    rigState: PuppetRigState,
    emotion: CharacterEmotion = 'happy',
    spriteImg?: HTMLImageElement | null
  ): void {
    ctx.save();
    ctx.translate(x, y + rigState.bodyBob);
    if (facing === 'left') {
      ctx.scale(-scale, scale);
    } else {
      ctx.scale(scale, scale);
    }

    // Dynamic Ground Shadow
    ctx.save();
    ctx.scale(1, 0.25);
    ctx.beginPath();
    ctx.arc(0, 160, 45, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 25, 15, 0.35)';
    ctx.fill();
    ctx.restore();

    // If sprite image is loaded, render with procedural IK transform & squash/stretch
    if (spriteImg && spriteImg.complete && spriteImg.naturalWidth > 0) {
      ctx.save();
      ctx.rotate(rigState.headAngle * 0.4);
      const w = 150;
      const h = 200;
      ctx.drawImage(spriteImg, -w / 2, -h + 20, w, h);

      // Render living eyes blink overlay
      if (rigState.blink > 0.5) {
        ctx.fillStyle = '#4a2c11';
        ctx.beginPath();
        ctx.arc(-18, -110, 5, 0, Math.PI, false);
        ctx.arc(18, -110, 5, 0, Math.PI, false);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#3e2008';
        ctx.stroke();
      }

      // Render animated talking mouth mesh
      if (rigState.mouthOpen > 0.1) {
        ctx.fillStyle = '#d946ef';
        ctx.beginPath();
        ctx.ellipse(0, -88, 7 * rigState.mouthOpen + 2, 8 * rigState.mouthOpen + 1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#86198f';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();
    } else {
      // High-Definition Vector Puppet Fallback for LiLo
      // 1. Legs
      ctx.strokeStyle = '#f8d5be';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';

      // Left Leg
      ctx.save();
      ctx.translate(-15, -20);
      ctx.rotate(rigState.leftLegAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 45);
      ctx.stroke();
      // Shoe
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.ellipse(4, 45, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Right Leg
      ctx.save();
      ctx.translate(15, -20);
      ctx.rotate(rigState.rightLegAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 45);
      ctx.stroke();
      // Shoe
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.ellipse(4, 45, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Torso / Denim Dress
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(-25, -25);
      ctx.lineTo(25, -25);
      ctx.lineTo(32, 10);
      ctx.lineTo(-32, 10);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#1d4ed8';
      ctx.stroke();

      // Cozy Cardigan
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(-28, -55, 56, 35);

      // 3. Arms & Hands
      // Left Arm
      ctx.save();
      ctx.translate(-24, -48);
      ctx.rotate(rigState.leftArmAngle);
      ctx.strokeStyle = '#f8d5be';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-12, 35);
      ctx.stroke();
      // Hand
      ctx.fillStyle = '#f8d5be';
      ctx.beginPath();
      ctx.arc(-12, 38, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Right Arm
      ctx.save();
      ctx.translate(24, -48);
      ctx.rotate(rigState.rightArmAngle);
      ctx.strokeStyle = '#f8d5be';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(12, 35);
      ctx.stroke();
      // Hand
      ctx.fillStyle = '#f8d5be';
      ctx.beginPath();
      ctx.arc(12, 38, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. Head & Face
      ctx.save();
      ctx.translate(0, -65);
      ctx.rotate(rigState.headAngle);

      // Hair Back
      ctx.fillStyle = '#4a2c11';
      ctx.beginPath();
      ctx.arc(0, -5, 36, 0, Math.PI * 2);
      ctx.fill();

      // Pigtails
      ctx.beginPath();
      ctx.arc(-34, -10, 16, 0, Math.PI * 2);
      ctx.arc(34, -10, 16, 0, Math.PI * 2);
      ctx.fill();

      // Face
      ctx.fillStyle = '#f8d5be';
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fill();

      // Flower Hair Clips
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(-24, -22, 6, 0, Math.PI * 2);
      ctx.arc(24, -22, 6, 0, Math.PI * 2);
      ctx.fill();

      // Big Sparkly Pixar Eyes
      if (rigState.blink > 0.5) {
        ctx.strokeStyle = '#4a2c11';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-10, -2, 5, 0, Math.PI, false);
        ctx.arc(10, -2, 5, 0, Math.PI, false);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-10, -2, 7, 0, Math.PI * 2);
        ctx.arc(10, -2, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(-10, -2, 4.5, 0, Math.PI * 2);
        ctx.arc(10, -2, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Eye sparkle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-11, -4, 1.8, 0, Math.PI * 2);
        ctx.arc(9, -4, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Rosy Cheeks
      ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
      ctx.beginPath();
      ctx.arc(-16, 8, 6, 0, Math.PI * 2);
      ctx.arc(16, 8, 6, 0, Math.PI * 2);
      ctx.fill();

      // Mouth
      if (rigState.mouthOpen > 0.1) {
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.ellipse(0, 14, 6 * rigState.mouthOpen + 2, 7 * rigState.mouthOpen + 1, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = '#9d174d';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 10, 6, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }

      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Render Mozz Rigged 2.5D Cat Puppet on Canvas
   */
  public renderMozzPuppet(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    facing: 'left' | 'right',
    rigState: PuppetRigState,
    emotion: CharacterEmotion = 'happy',
    portraitImg?: HTMLImageElement | null
  ): void {
    ctx.save();
    ctx.translate(x, y + rigState.bodyBob);
    if (facing === 'left') {
      ctx.scale(-scale, scale);
    } else {
      ctx.scale(scale, scale);
    }

    // Dynamic Shadow
    ctx.save();
    ctx.scale(1, 0.25);
    ctx.beginPath();
    ctx.arc(0, 100, 35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 25, 15, 0.35)';
    ctx.fill();
    ctx.restore();

    // 1. Multi-Segment Sine Wave Tail
    ctx.save();
    ctx.translate(-25, -15);
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const cp1x = -15 + Math.sin(rigState.tailAngle) * 10;
    const cp1y = -20;
    const cp2x = -25 - Math.sin(rigState.tailAngle) * 12;
    const cp2y = -40;
    const endX = -18 + Math.cos(rigState.tailAngle) * 8;
    const endY = -55;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    ctx.stroke();
    // Tail tip (white)
    ctx.fillStyle = '#fff7ed';
    ctx.beginPath();
    ctx.arc(endX, endY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Paws
    ctx.fillStyle = '#fff7ed';
    ctx.beginPath();
    ctx.ellipse(-18, 12, 9, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(18, 12, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Body (Ginger Tabby)
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.ellipse(0, -10, 28, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // White chest fluff
    ctx.fillStyle = '#fff7ed';
    ctx.beginPath();
    ctx.ellipse(0, -12, 14, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Turquoise Bowtie Collar
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.moveTo(-10, -28);
    ctx.lineTo(0, -24);
    ctx.lineTo(10, -28);
    ctx.lineTo(0, -20);
    ctx.closePath();
    ctx.fill();
    // Bell
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(0, -22, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Head & Ears
    ctx.save();
    ctx.translate(0, -42);
    ctx.rotate(rigState.headAngle);

    // Ears with twitch
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(-18, -12);
    ctx.lineTo(-26 - rigState.earTwitch * 15, -34);
    ctx.lineTo(-6, -24);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(18, -12);
    ctx.lineTo(26 + rigState.earTwitch * 15, -34);
    ctx.lineTo(6, -24);
    ctx.closePath();
    ctx.fill();

    // Inner ear pink
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.moveTo(-16, -14);
    ctx.lineTo(-22, -28);
    ctx.lineTo(-8, -22);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(16, -14);
    ctx.lineTo(22, -28);
    ctx.lineTo(8, -22);
    ctx.closePath();
    ctx.fill();

    // Cat Face
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();

    // Tabby Stripes
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-6, -18);
    ctx.lineTo(0, -12);
    ctx.lineTo(6, -18);
    ctx.stroke();

    // Whiskers
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-8, 4);
    ctx.lineTo(-24, 2);
    ctx.moveTo(-8, 8);
    ctx.lineTo(-23, 10);
    ctx.moveTo(8, 4);
    ctx.lineTo(24, 2);
    ctx.moveTo(8, 8);
    ctx.lineTo(23, 10);
    ctx.stroke();

    // Big Cartoon Cat Eyes
    if (rigState.blink > 0.5) {
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-8, -2, 4, 0, Math.PI, false);
      ctx.arc(8, -2, 4, 0, Math.PI, false);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#10b981'; // Emerald cat eyes
      ctx.beginPath();
      ctx.ellipse(-8, -2, 6, 7.5, 0, 0, Math.PI * 2);
      ctx.ellipse(8, -2, 6, 7.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Slit pupil
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(-8, -2, 2.5, 6, 0, 0, Math.PI * 2);
      ctx.ellipse(8, -2, 2.5, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eye glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-9, -4, 1.8, 0, Math.PI * 2);
      ctx.arc(7, -4, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pink Button Nose
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(-3, 4);
    ctx.lineTo(3, 4);
    ctx.lineTo(0, 7);
    ctx.closePath();
    ctx.fill();

    // Mouth / Meow opening
    if (rigState.mouthOpen > 0.1) {
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(0, 10, 5 * rigState.mouthOpen + 1, 0, Math.PI);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(-3, 8, 3, 0, Math.PI);
      ctx.arc(3, 8, 3, 0, Math.PI);
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();
  }
}

export const puppetRigEngine = new PuppetRigEngine();
