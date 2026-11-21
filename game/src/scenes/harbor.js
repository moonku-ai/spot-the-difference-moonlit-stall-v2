// Level 2 — "Harbor at Dawn". Boats, a lighthouse and a pier at first
// light. Decorative randomness is seeded, so the panels match except for
// the eight planted differences.

import { makeRng } from '../random.js';
import { circle, ellipse, rect, roundRect, poly, line, fill, stroke } from '../draw.js';

export const differences = [
  { id: 'gull', x: 150, y: 70, r: 20, kind: 'missing', label: 'A gull flew away' },
  { id: 'sail', x: 312, y: 178, r: 30, kind: 'color', label: 'The sail changed colour' },
  { id: 'buoy', x: 520, y: 320, r: 18, kind: 'added', label: 'A buoy bobbed up' },
  { id: 'lamp', x: 565, y: 100, r: 30, kind: 'changed', label: 'The lighthouse lamp went dark' },
  { id: 'crate', x: 90, y: 320, r: 24, kind: 'missing', label: 'A crate vanished from the pier' },
  { id: 'rowboat', x: 200, y: 300, x2: 240, y2: 300, r: 30, kind: 'moved', label: 'The rowboat drifted' },
  { id: 'flag', x: 120, y: 150, r: 22, kind: 'changed', label: 'The flag swings the other way' },
  { id: 'hull', x: 420, y: 288, r: 28, kind: 'color', label: 'The fishing boat repainted its hull' },
];

const SEED = 777;

function gull(ctx, x, y, s) {
  ctx.beginPath();
  ctx.arc(x - 6 * s, y, 6 * s, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + 6 * s, y, 6 * s, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
}

function drawLighthouse(ctx, variant) {
  // Rocks
  ellipse(ctx, 560, 268, 62, 34, 0);
  fill(ctx, '#6B7280');
  ellipse(ctx, 530, 282, 34, 20, 0);
  fill(ctx, '#5B6270');
  ellipse(ctx, 592, 284, 28, 16, 0);
  fill(ctx, '#7B8290');
  // Tower: white with red bands
  poly(ctx, [
    [548, 235],
    [582, 235],
    [578, 110],
    [552, 110],
  ]);
  fill(ctx, '#F5F0E6');
  rect(ctx, 550, 190, 30, 16);
  fill(ctx, '#C0392B');
  rect(ctx, 551, 145, 28, 16);
  fill(ctx, '#C0392B');
  // Lamp room
  rect(ctx, 550, 88, 30, 24);
  fill(ctx, '#2B2B2B');
  circle(ctx, 565, 100, 8);
  fill(ctx, variant === 'A' ? '#FFE27A' : '#5A5A5A');
  poly(ctx, [
    [548, 88],
    [582, 88],
    [565, 74],
  ]);
  fill(ctx, '#C0392B');
  if (variant === 'A') {
    // The beam, sweeping down toward the sea
    ctx.save();
    ctx.globalAlpha = 0.35;
    poly(ctx, [
      [556, 100],
      [350, 190],
      [350, 260],
    ]);
    fill(ctx, '#FFE27A');
    ctx.restore();
  }
}

function drawSailboat(ctx, variant) {
  // Hull
  poly(ctx, [
    [262, 212],
    [338, 212],
    [322, 232],
    [278, 232],
  ]);
  fill(ctx, '#7A4E2D');
  rect(ctx, 262, 208, 76, 6);
  fill(ctx, '#5A3A28');
  // Mast
  line(ctx, 300, 212, 300, 128);
  stroke(ctx, '#5A3A28', 3);
  // Sail: white in A, coral in B
  poly(ctx, [
    [302, 136],
    [302, 206],
    [338, 206],
  ]);
  fill(ctx, variant === 'A' ? '#F5F0E6' : '#E86A5A');
  poly(ctx, [
    [298, 140],
    [298, 206],
    [272, 206],
  ]);
  fill(ctx, variant === 'A' ? '#E8E0CC' : '#D95A4A');
  circle(ctx, 300, 128, 3);
  fill(ctx, '#C0392B');
}

function drawFishingBoat(ctx, variant) {
  poly(ctx, [
    [378, 282],
    [462, 282],
    [444, 306],
    [396, 306],
  ]);
  fill(ctx, variant === 'A' ? '#2E4A6B' : '#2E6B4A');
  rect(ctx, 396, 262, 30, 22);
  fill(ctx, '#E8E0CC');
  rect(ctx, 402, 268, 10, 10);
  fill(ctx, '#7FB3D5');
  line(ctx, 438, 282, 438, 248);
  stroke(ctx, '#5A3A28', 3);
  line(ctx, 438, 252, 452, 282);
  stroke(ctx, '#5A3A28', 2);
  circle(ctx, 438, 248, 3);
  fill(ctx, '#F2C94C');
}

function drawRowboat(ctx, x, y) {
  poly(ctx, [
    [x - 26, y],
    [x + 26, y],
    [x + 18, y + 12],
    [x - 18, y + 12],
  ]);
  fill(ctx, '#B85C38');
  line(ctx, x - 30, y - 6, x - 6, y + 4);
  stroke(ctx, '#7A4E2D', 3);
  line(ctx, x + 30, y - 6, x + 6, y + 4);
  stroke(ctx, '#7A4E2D', 3);
  ellipse(ctx, x, y + 2, 16, 4, 0);
  fill(ctx, '#8A5A33');
}

export function draw(ctx, variant) {
  const rng = makeRng(SEED);
  // Dawn sky in three flat bands
  rect(ctx, 0, 0, 620, 90);
  fill(ctx, '#F8D9A0');
  rect(ctx, 0, 90, 620, 80);
  fill(ctx, '#F2C6A0');
  rect(ctx, 0, 170, 620, 70);
  fill(ctx, '#D9B8D9');
  // Sun low over the water
  circle(ctx, 480, 130, 34);
  fill(ctx, 'rgba(247,183,49,0.35)');
  circle(ctx, 480, 130, 24);
  fill(ctx, '#F7B731');
  // Clouds (seeded, identical in both)
  for (let i = 0; i < 4; i++) {
    const cx = rng.int(40, 560);
    const cy = rng.int(30, 110);
    ellipse(ctx, cx, cy, rng.int(28, 46), 10, 0);
    fill(ctx, 'rgba(255,255,255,0.75)');
    ellipse(ctx, cx + 18, cy + 5, 22, 8, 0);
    fill(ctx, 'rgba(255,255,255,0.6)');
  }
  // Distant hills
  ellipse(ctx, 120, 245, 150, 26, 0);
  fill(ctx, '#7A8FA8');
  ellipse(ctx, 330, 248, 130, 20, 0);
  fill(ctx, '#8AA0B8');
  // Sea
  rect(ctx, 0, 240, 620, 180);
  fill(ctx, '#3E7CB1');
  rect(ctx, 0, 240, 620, 18);
  fill(ctx, '#5B93C4');
  // Wave strokes (seeded)
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 26; i++) {
    const wx = rng.int(10, 600);
    const wy = rng.int(262, 400);
    const wl = rng.int(12, 30);
    line(ctx, wx, wy, wx + wl, wy);
    stroke(ctx, 'rgba(255,255,255,0.35)', 2);
  }

  // Gulls: three in A, the leftmost one gone in B
  ctx.strokeStyle = '#2B2B2B';
  ctx.lineWidth = 2;
  if (variant === 'A') gull(ctx, 150, 70, 1);
  gull(ctx, 200, 55, 0.9);
  gull(ctx, 250, 85, 1.1);

  drawSailboat(ctx, variant);
  drawFishingBoat(ctx, variant);
  drawRowboat(ctx, variant === 'A' ? 200 : 240, 300);

  // Buoy: B only
  if (variant === 'B') {
    poly(ctx, [
      [512, 320],
      [528, 320],
      [524, 302],
      [516, 302],
    ]);
    fill(ctx, '#C0392B');
    rect(ctx, 514, 310, 12, 5);
    fill(ctx, '#F5F0E6');
    line(ctx, 520, 302, 520, 292);
    stroke(ctx, '#2B2B2B', 2);
    circle(ctx, 520, 290, 3);
    fill(ctx, '#F2C94C');
  }

  // Pier with flag, crates, nets and a barrel
  rect(ctx, 20, 305, 160, 12);
  fill(ctx, '#8A5A33');
  for (let x = 30; x < 180; x += 24) {
    rect(ctx, x, 317, 8, 40);
    fill(ctx, '#6E4525');
  }
  // Flag pole and flag: points right in A, left in B
  line(ctx, 120, 305, 120, 138);
  stroke(ctx, '#5A3A28', 4);
  if (variant === 'A') {
    poly(ctx, [
      [120, 140],
      [148, 148],
      [120, 158],
    ]);
  } else {
    poly(ctx, [
      [120, 140],
      [92, 148],
      [120, 158],
    ]);
  }
  fill(ctx, '#C0392B');
  // Crates: three in A (one stacked on top), two in B
  rect(ctx, 66, 322, 26, 26);
  fill(ctx, '#B98A4A');
  rect(ctx, 94, 322, 26, 26);
  fill(ctx, '#A87A3E');
  line(ctx, 66, 322, 92, 348);
  stroke(ctx, 'rgba(0,0,0,0.25)', 2);
  line(ctx, 94, 322, 120, 348);
  stroke(ctx, 'rgba(0,0,0,0.25)', 2);
  if (variant === 'A') {
    rect(ctx, 80, 296, 26, 26);
    fill(ctx, '#C89A55');
    line(ctx, 80, 296, 106, 322);
    stroke(ctx, 'rgba(0,0,0,0.25)', 2);
  }
  // Barrel and coiled rope
  roundRect(ctx, 140, 318, 26, 30, 6);
  fill(ctx, '#7A4E2D');
  line(ctx, 140, 328, 166, 328);
  stroke(ctx, '#2B2B2B', 2);
  circle(ctx, 40, 332, 12);
  stroke(ctx, '#D9C08A', 4);
  circle(ctx, 40, 332, 6);
  stroke(ctx, '#D9C08A', 3);

  drawLighthouse(ctx, variant);

  // A fish jumping near the sailboat (same in both)
  ctx.beginPath();
  ctx.arc(352, 318, 10, Math.PI, 0);
  ctx.strokeStyle = '#2E4A6B';
  ctx.lineWidth = 3;
  ctx.stroke();
  circle(ctx, 344, 308, 2);
  fill(ctx, '#2E4A6B');
}
