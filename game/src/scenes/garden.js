// Level 3 — "The Night Garden". A moonlit garden with a fountain, an old
// tree and fireflies. Seeded decoration keeps the panels identical except
// for the ten planted differences.

import { makeRng } from '../random.js';
import { circle, ellipse, rect, roundRect, poly, line, fill, stroke } from '../draw.js';

export const differences = [
  { id: 'owl', x: 110, y: 120, r: 24, kind: 'missing', label: 'The owl left its branch' },
  { id: 'fountain-water', x: 310, y: 232, r: 30, kind: 'color', label: 'The fountain water changed colour' },
  { id: 'mushrooms', x: 490, y: 355, r: 20, kind: 'added', label: 'Mushrooms sprouted by the pond' },
  { id: 'moon', x: 520, y: 70, r: 28, kind: 'changed', label: 'The moon waned to a crescent' },
  { id: 'lantern', x: 192, y: 205, r: 18, kind: 'missing', label: 'A lantern went out' },
  { id: 'bench', x: 400, y: 320, x2: 440, y2: 320, r: 30, kind: 'moved', label: 'The bench slid sideways' },
  { id: 'flowers', x: 240, y: 350, r: 26, kind: 'color', label: 'The flower bed changed colour' },
  { id: 'bright-star', x: 350, y: 60, r: 20, kind: 'missing', label: 'A bright star faded' },
  { id: 'fireflies', x: 90, y: 280, r: 22, kind: 'missing', label: 'A cluster of fireflies flew off' },
  { id: 'frog', x: 540, y: 300, r: 20, kind: 'added', label: 'A stone frog appeared by the pond' },
];

const SEED = 4242;

function flower(ctx, x, y, petal, center) {
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    circle(ctx, x + Math.cos(a) * 5, y + Math.sin(a) * 5, 4);
    fill(ctx, petal);
  }
  circle(ctx, x, y, 3);
  fill(ctx, center);
}

function firefly(ctx, x, y) {
  circle(ctx, x, y, 7);
  fill(ctx, 'rgba(220,255,120,0.25)');
  circle(ctx, x, y, 2.5);
  fill(ctx, '#DCFF78');
}

function drawTree(ctx, variant) {
  // Trunk
  poly(ctx, [
    [78, 330],
    [102, 330],
    [96, 180],
    [84, 180],
  ]);
  fill(ctx, '#5A3A28');
  line(ctx, 90, 210, 130, 150);
  stroke(ctx, '#5A3A28', 8);
  line(ctx, 90, 240, 60, 190);
  stroke(ctx, '#5A3A28', 6);
  // Canopy blobs
  ellipse(ctx, 110, 90, 78, 52, 0);
  fill(ctx, '#2E5A32');
  ellipse(ctx, 60, 120, 44, 34, 0);
  fill(ctx, '#356B3A');
  ellipse(ctx, 160, 118, 40, 30, 0);
  fill(ctx, '#356B3A');
  ellipse(ctx, 110, 70, 40, 24, 0);
  fill(ctx, '#3E7A44');
  // The owl: perched on the branch in A only
  if (variant === 'A') {
    ellipse(ctx, 110, 120, 13, 17, 0);
    fill(ctx, '#8A6A4A');
    circle(ctx, 106, 114, 5);
    fill(ctx, '#F5F0E6');
    circle(ctx, 114, 114, 5);
    fill(ctx, '#F5F0E6');
    circle(ctx, 106, 114, 2.5);
    fill(ctx, '#1E2A4A');
    circle(ctx, 114, 114, 2.5);
    fill(ctx, '#1E2A4A');
    poly(ctx, [
      [108, 120],
      [112, 120],
      [110, 124],
    ]);
    fill(ctx, '#E8A87C');
  }
}

function drawFountain(ctx, variant) {
  // Basin
  ellipse(ctx, 310, 252, 74, 22, 0);
  fill(ctx, '#9A9A9A');
  ellipse(ctx, 310, 250, 62, 17, 0);
  fill(ctx, variant === 'A' ? '#6FB7D9' : '#B48BE0');
  // Centre column and top bowl
  rect(ctx, 304, 196, 12, 52);
  fill(ctx, '#8A8A8A');
  ellipse(ctx, 310, 196, 26, 8, 0);
  fill(ctx, '#9A9A9A');
  ellipse(ctx, 310, 194, 20, 5, 0);
  fill(ctx, variant === 'A' ? '#6FB7D9' : '#B48BE0');
  // Jets
  ctx.strokeStyle = variant === 'A' ? '#A8D8F0' : '#D0B0F0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(310, 196, 14, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  line(ctx, 296, 200, 288, 236);
  stroke(ctx, variant === 'A' ? '#A8D8F0' : '#D0B0F0', 2);
  line(ctx, 324, 200, 332, 236);
  stroke(ctx, variant === 'A' ? '#A8D8F0' : '#D0B0F0', 2);
  // Wet stones around the rim
  for (let i = 0; i < 5; i++) {
    circle(ctx, 250 + i * 30, 268, 4);
    fill(ctx, '#7A7A7A');
  }
}

function drawBench(ctx, x, y) {
  rect(ctx, x - 34, y - 18, 68, 8);
  fill(ctx, '#7A4E2D');
  rect(ctx, x - 34, y - 4, 68, 8);
  fill(ctx, '#8A5A33');
  rect(ctx, x - 30, y + 4, 6, 22);
  fill(ctx, '#5A3A28');
  rect(ctx, x + 24, y + 4, 6, 22);
  fill(ctx, '#5A3A28');
  rect(ctx, x - 34, y - 26, 6, 30);
  fill(ctx, '#5A3A28');
  rect(ctx, x + 28, y - 26, 6, 30);
  fill(ctx, '#5A3A28');
}

export function draw(ctx, variant) {
  const rng = makeRng(SEED);
  // Night sky
  rect(ctx, 0, 0, 620, 300);
  fill(ctx, '#1E2A4A');
  rect(ctx, 0, 300, 620, 120);
  fill(ctx, '#2C4A2E');
  rect(ctx, 0, 300, 620, 10);
  fill(ctx, '#356B3A');
  // Stars (seeded, identical in both)
  for (let i = 0; i < 42; i++) {
    const sx = rng.int(10, 610);
    const sy = rng.int(10, 250);
    if (Math.hypot(sx - 520, sy - 70) < 46) continue; // keep the moon clear
    if (Math.hypot(sx - 350, sy - 60) < 30) continue; // keep the bright star clear
    circle(ctx, sx, sy, rng.int(1, 2));
    fill(ctx, 'rgba(255,255,255,0.8)');
  }
  // The bright star: a four-point sparkle in A, gone in B
  if (variant === 'A') {
    poly(ctx, [
      [350, 44],
      [354, 56],
      [366, 60],
      [354, 64],
      [350, 76],
      [346, 64],
      [334, 60],
      [346, 56],
    ]);
    fill(ctx, '#FFF3B0');
  }
  // Moon: full in A, crescent in B
  circle(ctx, 520, 70, 24);
  fill(ctx, '#F5E9C8');
  circle(ctx, 512, 64, 4);
  fill(ctx, '#E0D2A8');
  circle(ctx, 528, 78, 3);
  fill(ctx, '#E0D2A8');
  if (variant === 'B') {
    circle(ctx, 530, 64, 20);
    fill(ctx, '#1E2A4A');
  }

  drawTree(ctx, variant);

  // Lantern post: two lanterns in A, the lower one gone in B
  line(ctx, 180, 300, 180, 168);
  stroke(ctx, '#3A2A1A', 5);
  line(ctx, 168, 168, 204, 168);
  stroke(ctx, '#3A2A1A', 4);
  roundRect(ctx, 160, 180, 16, 20, 4);
  fill(ctx, '#F2C94C');
  circle(ctx, 168, 190, 12);
  fill(ctx, 'rgba(242,201,76,0.25)');
  if (variant === 'A') {
    roundRect(ctx, 184, 196, 16, 20, 4);
    fill(ctx, '#F2A65A');
    circle(ctx, 192, 206, 12);
    fill(ctx, 'rgba(242,166,90,0.25)');
  }

  // Stone path to the fountain
  for (let i = 0; i < 5; i++) {
    ellipse(ctx, 310, 402 - i * 26, 26, 9, 0);
    fill(ctx, '#B8B0A0');
  }

  drawFountain(ctx, variant);
  drawBench(ctx, variant === 'A' ? 400 : 440, 320);

  // Pond with lily pads
  ellipse(ctx, 530, 332, 76, 30, 0);
  fill(ctx, '#2E5A6B');
  ellipse(ctx, 510, 328, 14, 6, 0);
  fill(ctx, '#4E9A51');
  ellipse(ctx, 548, 340, 12, 5, 0);
  fill(ctx, '#4E9A51');
  flower(ctx, 528, 322, '#E8A0C0', '#F2C94C');
  // Stone frog on the pond edge: B only
  if (variant === 'B') {
    ellipse(ctx, 540, 302, 12, 9, 0);
    fill(ctx, '#7FB069');
    circle(ctx, 535, 294, 4);
    fill(ctx, '#7FB069');
    circle(ctx, 545, 294, 4);
    fill(ctx, '#7FB069');
    circle(ctx, 535, 294, 1.5);
    fill(ctx, '#1E2A4A');
    circle(ctx, 545, 294, 1.5);
    fill(ctx, '#1E2A4A');
  }

  // Flower beds: the big one changes colour, the small one stays blue
  ellipse(ctx, 240, 352, 62, 18, 0);
  fill(ctx, '#3A2A1A');
  const petal = variant === 'A' ? '#E87EA0' : '#F2C94C';
  flower(ctx, 208, 348, petal, '#F2C94C');
  flower(ctx, 228, 356, petal, '#F2C94C');
  flower(ctx, 248, 346, petal, '#F2C94C');
  flower(ctx, 268, 354, petal, '#F2C94C');
  ellipse(ctx, 130, 372, 44, 13, 0);
  fill(ctx, '#3A2A1A');
  flower(ctx, 116, 370, '#7FB3D5', '#F2C94C');
  flower(ctx, 136, 374, '#7FB3D5', '#F2C94C');
  flower(ctx, 152, 368, '#7FB3D5', '#F2C94C');

  // Mushrooms by the pond: B only
  if (variant === 'B') {
    rect(ctx, 484, 352, 6, 12);
    fill(ctx, '#E8E0CC');
    ellipse(ctx, 487, 352, 10, 6, 0);
    fill(ctx, '#C0392B');
    circle(ctx, 484, 350, 1.5);
    fill(ctx, '#F5F0E6');
    rect(ctx, 498, 356, 5, 9);
    fill(ctx, '#E8E0CC');
    ellipse(ctx, 500, 356, 8, 5, 0);
    fill(ctx, '#C0392B');
  }

  // Fireflies: scattered ones in both, plus a cluster in A only
  for (let i = 0; i < 8; i++) {
    firefly(ctx, rng.int(200, 600), rng.int(260, 400));
  }
  if (variant === 'A') {
    firefly(ctx, 82, 272);
    firefly(ctx, 96, 284);
    firefly(ctx, 88, 292);
  }

  // Bushes
  ellipse(ctx, 40, 392, 44, 22, 0);
  fill(ctx, '#2E5A32');
  ellipse(ctx, 590, 392, 40, 20, 0);
  fill(ctx, '#2E5A32');
}
