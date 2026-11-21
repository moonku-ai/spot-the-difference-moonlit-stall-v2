// Difference definitions: hit-testing and level validation.
// A difference is { id, x, y, r, kind, label } and, for kind 'moved',
// also { x2, y2 } — the object's position in panel B. A click counts when
// it lands within r of either point.

export const KINDS = ['missing', 'added', 'color', 'moved', 'changed'];

function pointsOf(d) {
  const pts = [{ x: d.x, y: d.y }];
  if (d.x2 !== undefined && d.y2 !== undefined) pts.push({ x: d.x2, y: d.y2 });
  return pts;
}

function within(d, x, y) {
  return pointsOf(d).some((p) => Math.hypot(x - p.x, y - p.y) <= d.r);
}

/** The first unfound difference covering (x, y), or null. */
export function findDifferenceAt(list, foundIds, x, y) {
  for (const d of list) {
    if (foundIds.includes(d.id)) continue;
    if (within(d, x, y)) return d;
  }
  return null;
}

/** Every difference a click at (x, y) would hit, found or not. */
export function differencesAt(list, x, y) {
  return list.filter((d) => within(d, x, y));
}

const MIN_GAP = 8; // extra px between two zones so a click is never ambiguous

/** Returns a list of problems; empty means the set is playable. */
export function validateDifferences(list, panel) {
  const problems = [];
  const ids = new Set();
  for (const d of list) {
    if (ids.has(d.id)) problems.push(`duplicate id ${d.id}`);
    ids.add(d.id);
    if (!KINDS.includes(d.kind)) problems.push(`${d.id}: bad kind ${d.kind}`);
    if (typeof d.label !== 'string' || d.label.length < 3) problems.push(`${d.id}: label missing`);
    if (!(d.r >= 10 && d.r <= 60)) problems.push(`${d.id}: radius ${d.r} out of range`);
    for (const p of pointsOf(d)) {
      if (p.x - d.r < 0 || p.x + d.r > panel.w || p.y - d.r < 0 || p.y + d.r > panel.h) {
        problems.push(`${d.id}: zone (${p.x},${p.y}) r${d.r} leaves the panel`);
      }
    }
  }
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i];
      const b = list[j];
      let minDist = Infinity;
      for (const pa of pointsOf(a)) {
        for (const pb of pointsOf(b)) {
          minDist = Math.min(minDist, Math.hypot(pa.x - pb.x, pa.y - pb.y));
        }
      }
      if (minDist < a.r + b.r + MIN_GAP) {
        problems.push(`${a.id} and ${b.id} overlap (gap ${minDist.toFixed(1)} < ${a.r + b.r + MIN_GAP})`);
      }
    }
  }
  return problems;
}
