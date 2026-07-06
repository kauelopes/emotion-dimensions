// The project's CVD-safe diverging valence scale (orange -> cream -> blue),
// same stops as figstyle.VALENCE_CMAP / figure_interactive.py.
export const NEG: [number, number, number] = [179, 88, 6]; // #b35806
export const MID: [number, number, number] = [240, 231, 216]; // #f0e7d8
export const POS: [number, number, number] = [33, 102, 172]; // #2166ac

function lerp(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/** t in [0,1] -> rgb triplet on the diverging scale. */
export function divergingRgb(t: number): [number, number, number] {
  const c = Math.min(1, Math.max(0, t));
  return c < 0.5 ? lerp(NEG, MID, c * 2) : lerp(MID, POS, (c - 0.5) * 2);
}

/** t in [0,1] -> CSS color string. */
export function divergingCss(t: number): string {
  const [r, g, b] = divergingRgb(t);
  return `rgb(${r},${g},${b})`;
}

/** t in [0,1] -> normalized [r,g,b] in 0..1 (for three.js vertex colors). */
export function divergingGl(t: number): [number, number, number] {
  const [r, g, b] = divergingRgb(t);
  return [r / 255, g / 255, b / 255];
}
