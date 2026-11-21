// Pointer input: maps a click on a panel canvas to panel coordinates,
// whatever size the canvas is displayed at.

import { PANEL } from './config.js';

export function canvasCoords(canvas, clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((clientX - r.left) / r.width) * PANEL.w,
    y: ((clientY - r.top) / r.height) * PANEL.h,
  };
}
