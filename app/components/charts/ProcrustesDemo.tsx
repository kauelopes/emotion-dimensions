"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { divergingCss } from "@/lib/colors";
import type { EmotionPoints } from "@/lib/types";
import { strings } from "@/content/strings";

const W = 700;
const H = 420;
const CX = W / 2;
const CY = H / 2 - 10;
const R_SCALE = 168; // toy config units -> pixels

// the disguise applied to map A: rotation + shrink (+ a whisper of noise)
const THETA = 2.35; // ~135°
const SHRINK = 0.62;
const NOISE = 0.055;

const N_WORDS = 22;
const LABELED = new Set([
  "joy", "hate", "fear", "love", "sadness", "anger", "calmness", "hope",
]);

function smoothstep(t: number) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

// deterministic pseudo-random in [-0.5, 0.5]
function hash(i: number, salt: number) {
  let x = (i + 1) * 0x9e3779b1 + salt * 0x85ebca6b;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return ((x >>> 0) % 100000) / 100000 - 0.5;
}

/** A toy Procrustes exercise: map B is literally map A rotated, shrunk and
    lightly perturbed. The animation undoes the disguise — rotate + rescale
    the whole map, never moving a word on its own — and the points click
    into place; the tiny noise is all that remains as disparity. */
export function ProcrustesDemo({ points }: { points: EmotionPoints }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const [t, setT] = useState(0);
  const run = useRef(0);

  const play = () => {
    const id = ++run.current;
    const t0 = performance.now();
    const DURATION = 2600;
    const tick = (now: number) => {
      if (id !== run.current) return; // superseded by a newer run
      const raw = Math.min(1, (now - t0) / DURATION);
      setT(raw);
      if (raw < 1) requestAnimationFrame(tick);
    };
    setT(0);
    requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (inView) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const { pts, fit } = useMemo(() => {
    // pick words with a spread of valences; lay the target map out with a
    // gentle valence gradient so the colors read left-to-right
    const order = points.terms
      .map((term, i) => ({ term, v: points.vad[i][0] }))
      .sort((a, b) => a.v - b.v);
    const step = Math.max(1, Math.floor(order.length / N_WORDS));
    const chosen = order
      .filter((_, i) => i % step === 0 || LABELED.has(order[i].term))
      .slice(0, N_WORDS + LABELED.size);

    const cosB = Math.cos(-THETA);
    const sinB = Math.sin(-THETA);
    const rows = chosen.map((w, i) => {
      const tx = (w.v - 0.5) * 2.4 + hash(i, 1) * 0.9;
      const ty = hash(i, 2) * 2.0;
      // map A = target rotated by −θ, inflated by 1/s, plus light noise
      const ax = (tx * cosB - ty * sinB) / SHRINK + hash(i, 3) * NOISE * 2;
      const ay = (tx * sinB + ty * cosB) / SHRINK + hash(i, 4) * NOISE * 2;
      return { term: w.term, color: divergingCss(w.v), tx, ty, ax, ay };
    });

    // honest fit for the toy data (scipy convention: unit-norm configs)
    const cosF = Math.cos(THETA);
    const sinF = Math.sin(THETA);
    let ss = 0;
    let tt = 0;
    rows.forEach((p) => {
      const fx = (p.ax * cosF - p.ay * sinF) * SHRINK;
      const fy = (p.ax * sinF + p.ay * cosF) * SHRINK;
      ss += (fx - p.tx) ** 2 + (fy - p.ty) ** 2;
      tt += p.tx ** 2 + p.ty ** 2;
    });
    return { pts: rows, fit: 1 - ss / tt };
  }, [points]);

  const e = smoothstep(t);
  const angle = THETA * e;
  const scale = 1 + (SHRINK - 1) * e;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return (
    <div ref={ref}>
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-[#111113]">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          {pts.map((p) => {
            // rigid transform of map A: rotation + uniform scale
            const rx = (p.ax * cos - p.ay * sin) * scale;
            const ry = (p.ax * sin + p.ay * cos) * scale;
            const mx = CX + rx * R_SCALE;
            const my = CY - ry * R_SCALE;
            const tx = CX + p.tx * R_SCALE;
            const ty = CY - p.ty * R_SCALE;
            return (
              <g key={p.term}>
                {/* residual line: what alignment cannot remove */}
                <line x1={mx} y1={my} x2={tx} y2={ty}
                  stroke={p.color} strokeWidth="0.9" opacity={0.2 + 0.4 * e} />
                <circle cx={tx} cy={ty} r="4.6" fill="none"
                  stroke={p.color} strokeWidth="1.6" opacity="0.95">
                  <title>{`${p.term} — ${strings.procrustes.mapB}`}</title>
                </circle>
                <circle cx={mx} cy={my} r="3.2" fill={p.color}
                  stroke="#09090b" strokeWidth="0.8" opacity="0.95">
                  <title>{`${p.term} — ${strings.procrustes.mapA}`}</title>
                </circle>
                {LABELED.has(p.term) && (
                  <text x={tx + 7} y={ty - 6} fontSize="9.5" fill="#a1a1aa">
                    {p.term}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <div className="absolute top-3 right-3 rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-right">
          <div className="font-mono text-xs text-zinc-500">
            {strings.procrustes.fitLabel}
          </div>
          <div className="font-mono text-lg text-zinc-50 tabular-nums">
            {(fit * e).toFixed(2)}
          </div>
        </div>
        <button
          onClick={play}
          className="absolute bottom-3 right-3 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300 hover:text-zinc-50"
        >
          {strings.procrustes.replay}
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-5 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-zinc-300" />
          {strings.procrustes.mapA}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-zinc-300" />
          {strings.procrustes.mapB}
        </span>
        <span className="ml-auto">{strings.procrustes.caption}</span>
      </div>
    </div>
  );
}
