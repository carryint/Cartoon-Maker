export class LivingBackgroundEngine {
  /**
   * Render living multi-layer animated forest environment
   */
  public static renderLivingForest(
    ctx: CanvasRenderingContext2D,
    bgImg: HTMLImageElement | null,
    width: number,
    height: number,
    time: number,
    environmentType: 'forest-cottage' | 'river-stream' | 'deep-woods' | 'wildflower-clearing' = 'forest-cottage'
  ): void {
    // 1. Draw Base Static / High-Res Forest Environment
    if (bgImg && bgImg.complete) {
      ctx.drawImage(bgImg, 0, 0, width, height);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#064e3b');
      grad.addColorStop(0.5, '#047857');
      grad.addColorStop(1, '#022c22');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Volumetric Animated Sunbeams (God Rays)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const numRays = 4;
    for (let i = 0; i < numRays; i++) {
      const rayAngle = 0.25 + Math.sin(time * 0.4 + i) * 0.03;
      const rayAlpha = 0.12 + Math.sin(time * 0.8 + i * 1.5) * 0.05;
      const rayX = width * (0.2 + (i * 0.22));

      const rayGrad = ctx.createLinearGradient(rayX, 0, rayX + (height * Math.tan(rayAngle)), height);
      rayGrad.addColorStop(0, `rgba(254, 240, 138, ${rayAlpha * 1.5})`);
      rayGrad.addColorStop(0.6, `rgba(254, 240, 138, ${rayAlpha})`);
      rayGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(rayX - 30, 0);
      ctx.lineTo(rayX + 90, 0);
      ctx.lineTo(rayX + (height * Math.tan(rayAngle)) + 160, height);
      ctx.lineTo(rayX + (height * Math.tan(rayAngle)) - 80, height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 3. Animated Chimney Smoke from the Cottage
    if (environmentType === 'forest-cottage') {
      ctx.save();
      const chimneyX = width * 0.68;
      const chimneyY = height * 0.22;
      const smokePuffs = 5;

      for (let i = 0; i < smokePuffs; i++) {
        const puffAge = (time * 0.6 + i * 0.8) % 4.0; // 0 to 4s
        const puffProgress = puffAge / 4.0;
        const puffY = chimneyY - (puffProgress * height * 0.18);
        const puffX = chimneyX + Math.sin(time * 1.2 + i) * (width * 0.02) + (puffProgress * width * 0.04);
        const puffRadius = (width * 0.012) + (puffProgress * width * 0.025);
        const puffAlpha = Math.max(0, (1 - puffProgress) * 0.28);

        ctx.beginPath();
        ctx.arc(puffX, puffY, puffRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${puffAlpha})`;
        ctx.fill();
      }
      ctx.restore();
    }

    // 4. Animated River / Stream Currents & Glinting Water
    if (environmentType === 'river-stream') {
      ctx.save();
      const riverY = height * 0.72;
      const riverHeight = height * 0.28;

      // Water body
      ctx.fillStyle = 'rgba(14, 165, 233, 0.35)';
      ctx.fillRect(0, riverY, width, riverHeight);

      // Moving Wave Ripples
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 2.5;

      for (let r = 0; r < 4; r++) {
        const wy = riverY + 20 + (r * 28);
        ctx.beginPath();
        ctx.moveTo(0, wy);
        for (let x = 0; x < width; x += 30) {
          const wave = Math.sin((x * 0.02) + (time * 4.0) + (r * 1.5)) * 6;
          ctx.lineTo(x, wy + wave);
        }
        ctx.stroke();
      }

      // Water sparkle glints
      for (let g = 0; g < 6; g++) {
        const gx = ((g * 220 + time * 60) % width);
        const gy = riverY + 15 + ((g * 35) % (riverHeight - 30));
        const sparkleSize = (Math.sin(time * 6 + g) + 1) * 3;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(gx, gy, sparkleSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 5. Living Forest Butterflies & Birds
    ctx.save();
    const butterflyColors = ['#f43f5e', '#38bdf8', '#fbbf24', '#c084fc'];
    for (let b = 0; b < 4; b++) {
      const bColor = butterflyColors[b % butterflyColors.length];
      const bTime = time * 0.8 + b * 2.0;
      // Organic Lissajous / Bezier flight path
      const bx = width * 0.2 + (Math.sin(bTime * 0.7) * width * 0.35) + (b * width * 0.15);
      const by = height * 0.45 + (Math.cos(bTime * 1.1) * height * 0.18);
      const wingFlap = Math.abs(Math.sin(time * 18.0 + b));

      ctx.save();
      ctx.translate(bx, by);
      ctx.fillStyle = bColor;

      // Left wing
      ctx.beginPath();
      ctx.ellipse(-8 * wingFlap, 0, 10 * wingFlap, 6, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Right wing
      ctx.beginPath();
      ctx.ellipse(8 * wingFlap, 0, 10 * wingFlap, 6, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Tiny antenna
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -4);
      ctx.stroke();

      ctx.restore();
    }
    ctx.restore();

    // 6. Foreground Wind-Swayed Wildflower Stems & Grass
    ctx.save();
    const numStems = 14;
    const stemWidth = width / numStems;

    for (let s = 0; s < numStems; s++) {
      const rootX = s * stemWidth + (stemWidth * 0.5);
      const rootY = height;
      const stemHeight = height * (0.12 + Math.sin(s * 1.5) * 0.04);
      const windSway = Math.sin(time * 2.4 + s * 0.8) * (width * 0.015);
      const tipX = rootX + windSway;
      const tipY = rootY - stemHeight;

      // Stem
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(rootX, rootY);
      ctx.quadraticCurveTo(rootX + (windSway * 0.5), rootY - (stemHeight * 0.5), tipX, tipY);
      ctx.stroke();

      // Flower Blossom / Chamomile on top
      if (s % 2 === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(tipX, tipY, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(tipX, tipY, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}
