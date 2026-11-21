// Level 1 — "The Old Bookshop". A cozy bookshop interior, drawn with flat
// Canvas shapes. All decorative randomness comes from a fixed seed so the
// two panels match exactly except for the six planted differences.

import { makeRng } from '../random.js';
import { circle, ellipse, rect, roundRect, poly, line, fill, stroke, text } from '../draw.js';

export const differences = [
  { id: 'cat', x: 470, y: 240, r: 30, kind: 'missing', label: 'The sleeping cat is gone' },
  { id: 'rug', x: 310, y: 355, r: 34, kind: 'color', label: 'The rug changed colour' },
  { id: 'red-book', x: 120, y: 188, r: 18, kind: 'missing', label: 'A tall red book is missing' },
  { id: 'clock', x: 540, y: 75, r: 26, kind: 'changed', label: 'The clock shows another time' },
  { id: 'cactus', x: 430, y: 192, r: 20, kind: 'added', label: 'A cactus appeared on the sill' },
  { id: 'globe', x: 540, y: 225, x2: 580, y2: 225, r: 26, kind: 'moved', label: 'The globe moved along the counter' },
];

const SEED = 20261121;
const BOOK_COLORS = ['#C0392B', '#2E7D6B', '#D9A441', '#4A6FA5', '#7D5BA6', '#B85C38', '#3E7CB1', '#8A9A5B'];

function drawBookshelf(ctx, rng, variant) {
  // Frame and back
  rect(ctx, 28, 36, 180, 304);
  fill(ctx, '#7A4E2D');
  rect(ctx, 36, 44, 164, 288);
  fill(ctx, '#8A5A33');
  // Shelves
  const shelfYs = [120, 205, 290];
  for (const y of shelfYs) {
    rect(ctx, 36, y, 164, 8);
    fill(ctx, '#6E4525');
  }
  // Books: three rows, seeded colours and widths. The middle row leaves a
  // slot for the tall red book (drawn only in variant A).
  const rows = [
    { y: 62, h: 58, x0: 44, x1: 196 },
    { y: 140, h: 65, x0: 44, x1: 196 },
    { y: 225, h: 65, x0: 44, x1: 196 },
  ];
  rows.forEach((row, ri) => {
    let x = row.x0;
    while (x < row.x1 - 10) {
      const w = rng.int(9, 15);
      const h = row.h - rng.int(0, 10);
      // Middle row: keep the red book's slot (x 106–134) clear in both
      // variants; variant A fills it, variant B leaves a clean gap.
      const overlapsSlot = ri === 1 && x < 134 && x + w > 106;
      if (!overlapsSlot) {
        rect(ctx, x, row.y + row.h - h, w, h);
        fill(ctx, rng.pick(BOOK_COLORS));
        line(ctx, x + 2, row.y + row.h - h + 6, x + 2, row.y + row.h - 4);
        stroke(ctx, 'rgba(255,255,255,0.25)', 1);
      }
      x += w + 2;
    }
  });
  if (variant === 'A') {
    rect(ctx, 108, 160, 24, 45);
    fill(ctx, '#C0392B');
    line(ctx, 112, 168, 112, 200);
    stroke(ctx, 'rgba(255,255,255,0.35)', 1);
    rect(ctx, 108, 160, 24, 6);
    fill(ctx, '#96281B');
  }
}

function drawWindow(ctx, variant) {
  rect(ctx, 250, 55, 220, 160);
  fill(ctx, '#7A4E2D');
  rect(ctx, 258, 63, 204, 144);
  fill(ctx, '#BFE3F0');
  // Sun and rooftops outside
  circle(ctx, 292, 92, 14);
  fill(ctx, '#F7D154');
  poly(ctx, [
    [258, 207],
    [300, 165],
    [342, 207],
  ]);
  fill(ctx, '#8A6A8A');
  poly(ctx, [
    [330, 207],
    [380, 150],
    [430, 207],
  ]);
  fill(ctx, '#6E5570');
  rect(ctx, 258, 195, 204, 12);
  fill(ctx, '#7A9A6B');
  // Cross bars
  rect(ctx, 356, 63, 8, 144);
  fill(ctx, '#7A4E2D');
  rect(ctx, 258, 128, 204, 8);
  fill(ctx, '#7A4E2D');
  // Sill
  rect(ctx, 244, 215, 232, 11);
  fill(ctx, '#8A5A33');
  if (variant === 'B') {
    // Cactus in a terracotta pot on the sill
    poly(ctx, [
      [418, 196],
      [442, 196],
      [438, 215],
      [422, 215],
    ]);
    fill(ctx, '#B85C38');
    roundRect(ctx, 426, 172, 9, 26, 4);
    fill(ctx, '#4E9A51');
    roundRect(ctx, 417, 180, 9, 14, 4);
    fill(ctx, '#4E9A51');
    roundRect(ctx, 434, 178, 9, 16, 4);
    fill(ctx, '#5FAE62');
  }
}

function drawClock(ctx, variant) {
  circle(ctx, 540, 75, 26);
  fill(ctx, '#F7EFD8');
  circle(ctx, 540, 75, 26);
  stroke(ctx, '#5A3A28', 4);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    line(ctx, 540 + Math.sin(a) * 20, 75 - Math.cos(a) * 20, 540 + Math.sin(a) * 23, 75 - Math.cos(a) * 23);
    stroke(ctx, '#5A3A28', 2);
  }
  // A: 3:00 (hour right, minute up). B: 7:30 (hour down-left, minute down).
  const [hx, hy, mx, my] =
    variant === 'A' ? [556, 75, 540, 58] : [530, 88, 540, 92];
  line(ctx, 540, 75, hx, hy);
  stroke(ctx, '#2B2B2B', 4);
  line(ctx, 540, 75, mx, my);
  stroke(ctx, '#2B2B2B', 2);
  circle(ctx, 540, 75, 3);
  fill(ctx, '#2B2B2B');
}

function drawCounter(ctx, rng, variant) {
  rect(ctx, 425, 250, 175, 90);
  fill(ctx, '#8A5A33');
  rect(ctx, 425, 250, 175, 10);
  fill(ctx, '#6E4525');
  for (let i = 0; i < 3; i++) {
    rect(ctx, 440 + i * 52, 272, 38, 52);
    fill(ctx, '#7A4E2D');
  }
  // A stack of books and a mug on the counter (same in both)
  rect(ctx, 436, 232, 34, 8);
  fill(ctx, '#4A6FA5');
  rect(ctx, 440, 224, 28, 8);
  fill(ctx, '#D9A441');
  rect(ctx, 500, 228, 16, 22);
  fill(ctx, '#E8E8E8');
  circle(ctx, 516, 239, 5);
  stroke(ctx, '#E8E8E8', 3);
  // The globe: same height, 40 px further right in B
  const gx = variant === 'A' ? 540 : 580;
  line(ctx, gx, 240, gx, 250);
  stroke(ctx, '#5A3A28', 4);
  circle(ctx, gx, 225, 16);
  fill(ctx, '#7FB3D5');
  ellipse(ctx, gx - 4, 220, 7, 10, 0.5);
  fill(ctx, '#7FB069');
  ellipse(ctx, gx + 6, 231, 5, 7, -0.4);
  fill(ctx, '#7FB069');
  circle(ctx, gx, 225, 16);
  stroke(ctx, '#5A3A28', 2);
  if (variant === 'A') {
    // Sleeping cat, curled on the counter
    ellipse(ctx, 470, 242, 26, 11, 0);
    fill(ctx, '#E8A87C');
    circle(ctx, 492, 235, 9);
    fill(ctx, '#E8A87C');
    poly(ctx, [
      [486, 228],
      [489, 220],
      [492, 228],
    ]);
    fill(ctx, '#E8A87C');
    poly(ctx, [
      [493, 227],
      [498, 221],
      [500, 229],
    ]);
    fill(ctx, '#E8A87C');
    ellipse(ctx, 447, 246, 12, 5, 0.5);
    fill(ctx, '#D99A6C');
    line(ctx, 488, 236, 496, 236);
    stroke(ctx, '#5A3A28', 1);
  }
}

export function draw(ctx, variant) {
  const rng = makeRng(SEED);
  // Wall and floor
  rect(ctx, 0, 0, 620, 340);
  fill(ctx, '#F3E3C2');
  rect(ctx, 0, 340, 620, 80);
  fill(ctx, '#A9713F');
  for (let x = 0; x < 620; x += 78) {
    line(ctx, x, 340, x - 12, 420);
    stroke(ctx, 'rgba(0,0,0,0.12)', 2);
  }
  // Subtle wall texture dots (seeded, identical in both variants)
  for (let i = 0; i < 24; i++) {
    circle(ctx, rng.int(220, 600), rng.int(20, 320), rng.int(1, 2));
    fill(ctx, 'rgba(120,90,50,0.10)');
  }
  // Hanging BOOKS sign
  line(ctx, 360, 0, 360, 22);
  stroke(ctx, '#5A3A28', 2);
  roundRect(ctx, 322, 22, 76, 26, 6);
  fill(ctx, '#2E4A3A');
  text(ctx, 'BOOKS', 360, 36, 'bold 15px Georgia, serif', '#F7EFD8', 'center');
  // Framed poster between shelf and window
  rect(ctx, 216, 62, 30, 40);
  fill(ctx, '#5A3A28');
  rect(ctx, 220, 66, 22, 32);
  fill(ctx, '#D9A441');
  circle(ctx, 231, 82, 6);
  fill(ctx, '#C0392B');

  drawBookshelf(ctx, rng, variant);
  drawWindow(ctx, variant);
  drawClock(ctx, variant);

  // Reading chair and floor lamp
  rect(ctx, 222, 300, 46, 10);
  fill(ctx, '#7A4E2D');
  rect(ctx, 226, 268, 8, 34);
  fill(ctx, '#7A4E2D');
  rect(ctx, 256, 268, 8, 34);
  fill(ctx, '#7A4E2D');
  rect(ctx, 222, 240, 8, 34);
  fill(ctx, '#7A4E2D');
  roundRect(ctx, 218, 292, 54, 14, 5);
  fill(ctx, '#B85C38');
  line(ctx, 196, 340, 196, 252);
  stroke(ctx, '#5A3A28', 4);
  poly(ctx, [
    [182, 252],
    [210, 252],
    [203, 232],
    [189, 232],
  ]);
  fill(ctx, '#F2C94C');
  circle(ctx, 196, 258, 10);
  fill(ctx, 'rgba(242,201,76,0.35)');

  // Rug: terracotta in A, teal in B
  ellipse(ctx, 310, 362, 115, 24, 0);
  fill(ctx, variant === 'A' ? '#C96F4A' : '#4A9A8F');
  ellipse(ctx, 310, 362, 88, 17, 0);
  fill(ctx, variant === 'A' ? '#D98A68' : '#63B3A8');
  ellipse(ctx, 310, 362, 52, 10, 0);
  fill(ctx, variant === 'A' ? '#C96F4A' : '#4A9A8F');

  drawCounter(ctx, rng, variant);

  // Books stacked on the floor by the shelf
  rect(ctx, 52, 372, 44, 10);
  fill(ctx, '#2E7D6B');
  rect(ctx, 56, 362, 38, 10);
  fill(ctx, '#7D5BA6');
  rect(ctx, 60, 352, 32, 10);
  fill(ctx, '#C0392B');
}
