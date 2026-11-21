// Canvas rendering: paints the two panels and every feedback effect.
// The game repaints both panels every animation frame, so effects are pure
// functions of their age — no incremental canvas state to get out of sync.

export function paintPanels(leftCtx, rightCtx, scene) {
  scene.draw(leftCtx, 'A');
  scene.draw(rightCtx, 'B');
}

export function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/** A gold ring that pops in with overshoot, then settles with a check. */
export function drawFoundMarker(ctx, x, y, ageMs) {
  const t = Math.min(1, ageMs / 280);
  const scale = Math.max(0.01, easeOutBack(t));
  const r = 20 * scale;
  ctx.save();
  ctx.globalAlpha = Math.min(1, ageMs / 80);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#F2C94C';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, r + 5, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(242,201,76,0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
  if (t >= 1) {
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 1);
    ctx.lineTo(x - 2, y + 7);
    ctx.lineTo(x + 9, y - 6);
    ctx.strokeStyle = '#F2C94C';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
  ctx.restore();
}

/** A red X that fades out over half a second. */
export function drawMissMark(ctx, x, y, ageMs) {
  const t = Math.min(1, ageMs / 500);
  ctx.save();
  ctx.globalAlpha = 1 - t;
  ctx.strokeStyle = '#E85A4A';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  const s = 10;
  ctx.beginPath();
  ctx.moveTo(x - s, y - s);
  ctx.lineTo(x + s, y + s);
  ctx.moveTo(x + s, y - s);
  ctx.lineTo(x - s, y + s);
  ctx.stroke();
  ctx.restore();
  return t < 1;
}

/** A dashed gold ring pulsing around a hinted difference. Returns false when expired. */
export function drawHintRing(ctx, x, y, ageMs, durationMs) {
  const t = ageMs / durationMs;
  if (t >= 1) return false;
  const pulse = 0.5 + 0.5 * Math.sin(ageMs / 160);
  const r = 22 + pulse * 8;
  ctx.save();
  ctx.globalAlpha = 0.9 * (1 - t * 0.3);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#F2A65A';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.stroke();
  ctx.restore();
  return true;
}

/** A floating "+125" that rises and fades. Returns false when expired. */
export function drawScorePop(ctx, x, y, text, ageMs) {
  const t = Math.min(1, ageMs / 900);
  ctx.save();
  ctx.globalAlpha = 1 - t * t;
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#F2C94C';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  ctx.fillText(text, x, y - 24 - easeOutCubic(t) * 26);
  ctx.restore();
  return t < 1;
}
