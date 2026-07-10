"use client";

import { useMemo, useState } from "react";
import { divergingCss } from "@/lib/colors";
import type {
  ConsensusPoint,
  EmotionPoints,
  GridDim,
  NeutralControlRow,
} from "@/lib/types";
import { strings } from "@/content/strings";

/* ------------------------------------------------------------------ Q1 —
   dumbbell strip: intrinsic dimension (TwoNN) of the emotion subspace vs the
   frequency-matched neutral control, one row per model. */

const W = 700;
const LEFT = 130;
const RIGHT = 24;
const ROW_H = 24;
const TOP = 46;
const XMAX = 35;

export function DimensionPairStrip({ rows }: { rows: NeutralControlRow[] }) {
  const H = TOP + rows.length * ROW_H + 34;
  const sx = (v: number) =>
    LEFT + (Math.min(v, XMAX) / XMAX) * (W - LEFT - RIGHT);
  const t = strings.answers.q1;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[560px]">
        {/* psychometric band 2–4D */}
        <rect x={sx(2)} y={TOP - 8} width={sx(4) - sx(2)}
          height={rows.length * ROW_H + 8} fill="#d4d4d8" opacity="0.08" />
        <text x={sx(3)} y={TOP - 14} textAnchor="middle" fontSize="9" fill="#a1a1aa">
          {t.bandTheories}
        </text>
        {/* x axis */}
        {[0, 5, 10, 15, 20, 25, 30, 35].map((v) => (
          <g key={v}>
            <line x1={sx(v)} y1={TOP - 4} x2={sx(v)} y2={TOP + rows.length * ROW_H}
              stroke="#27272a" strokeWidth="0.6" />
            <text x={sx(v)} y={TOP + rows.length * ROW_H + 14} textAnchor="middle"
              fontSize="9" fill="#71717a">{v}</text>
          </g>
        ))}
        {/* legend */}
        <g fontSize="9">
          <circle cx={LEFT + 6} cy={16} r="5" fill="var(--accent)" />
          <text x={LEFT + 16} y={19} fill="#d4d4d8">{t.legendEmotion}</text>
          <circle cx={LEFT + 176} cy={16} r="5" fill="#a1a1aa" />
          <text x={LEFT + 186} y={19} fill="#d4d4d8">{t.legendNeutral}</text>
        </g>
        {rows.map((r, i) => {
          const cy = TOP + i * ROW_H + ROW_H / 2 - 4;
          const xe = sx(r.twonnEmotion);
          const xn = sx(r.twonnNeutral);
          return (
            <g key={r.model}>
              <text x={LEFT - 8} y={cy + 3} textAnchor="end" fontSize="10" fill="#d4d4d8">
                {r.pretty}
              </text>
              <line x1={xe} y1={cy} x2={xn} y2={cy}
                stroke="#52525b" strokeWidth="1.5" />
              <circle cx={xn} cy={cy} r="5" fill="#a1a1aa"
                stroke="#09090b" strokeWidth="1">
                <title>{`${r.pretty} — neutral words: TwoNN ${r.twonnNeutral}`}</title>
              </circle>
              <circle cx={xe} cy={cy} r="5" fill="var(--accent)"
                stroke="#09090b" strokeWidth="1">
                <title>{`${r.pretty} — emotion words: TwoNN ${r.twonnEmotion}`}</title>
              </circle>
            </g>
          );
        })}
        <text x={LEFT} y={H - 6} fontSize="9" fill="#71717a">
          intrinsic dimension (TwoNN) → · one row per model (hover the dots)
        </text>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ Q2 —
   (the former 4x4 axis-match grid was removed with the relational rewrite;
   GRID dimension. The ring marks the best match per axis. */

const DIMS: GridDim[] = ["valence", "power", "arousal", "novelty"];
const CELL = 92;
const GRID_LEFT = 56;
const GRID_TOP = 30;

const MW = 700;
const MH = 430;
const MPAD = 52;

export function ModelsConsensusMap({
  rows,
  points,
}: {
  rows: ConsensusPoint[];
  points: EmotionPoints;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const t = strings.answers.q2;

  const { pts, labeled } = useMemo(() => {
    const xs = rows.map((c) => c.x);
    const ys = rows.map((c) => c.y);
    const ds = rows.map((c) => c.disp);
    const [xmin, xmax] = [Math.min(...xs), Math.max(...xs)];
    const [ymin, ymax] = [Math.min(...ys), Math.max(...ys)];
    const [dmin, dmax] = [Math.min(...ds), Math.max(...ds)];
    const vIdx = new Map(points.terms.map((tm, i) => [tm, i]));
    const out = rows.map((c) => ({
      t: c.t,
      px: MPAD + ((c.x - xmin) / (xmax - xmin)) * (MW - 2 * MPAD),
      py: MH - MPAD - ((c.y - ymin) / (ymax - ymin)) * (MH - 2 * MPAD),
      r: 3.5 + ((c.disp - dmin) / (dmax - dmin)) * 7,
      v: vIdx.has(c.t) ? points.vad[vIdx.get(c.t)!][0] : 0.5,
      disp: c.disp,
    }));
    // annotate the extremes of the two labeled axes, skipping labels that
    // would land on top of one another
    const byX = [...out].sort((a, b) => a.px - b.px);
    const byY = [...out].sort((a, b) => a.py - b.py);
    const candidates = [
      ...byX.slice(0, 3), ...byX.slice(-3),
      ...byY.slice(0, 3), ...byY.slice(-3),
    ];
    const placed: { px: number; py: number }[] = [];
    const labeled = new Set<string>();
    for (const p of candidates) {
      if (placed.some((q) => Math.abs(q.py - p.py) < 14 &&
                             Math.abs(q.px - p.px) < 110)) continue;
      placed.push(p);
      labeled.add(p.t);
    }
    return { pts: out, labeled };
  }, [rows, points]);

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#111113]">
        <svg viewBox={`0 0 ${MW} ${MH}`} className="h-auto w-full">
          {/* axis annotations: what the consensus axes turned out to mean */}
          <text x={MW - 14} y={MH - 14} textAnchor="end" fontSize="10" fill="#a1a1aa">
            {t.mapAxisX}
          </text>
          <text x={14} y={16} fontSize="10" fill="#a1a1aa">
            {t.mapAxisY}
          </text>
          {pts.map((p) => (
            <g key={p.t}>
              <circle
                cx={p.px}
                cy={p.py}
                r={p.r}
                fill={divergingCss(p.v)}
                stroke="#09090b"
                strokeWidth="1"
                opacity={hover === null || hover === p.t ? 0.9 : 0.35}
                onMouseEnter={() => setHover(p.t)}
                onMouseLeave={() => setHover(null)}
              >
                <title>{`${p.t} — disagreement ${p.disp}`}</title>
              </circle>
              {(labeled.has(p.t) || hover === p.t) && (
                <text
                  x={p.px > MW - 100 ? p.px - p.r - 3 : p.px + p.r + 3}
                  y={p.py + 3}
                  textAnchor={p.px > MW - 100 ? "end" : "start"}
                  fontSize="9.5"
                  fill={hover === p.t ? "#fafafa" : "#a1a1aa"}
                  style={{ pointerEvents: "none" }}
                >
                  {p.t}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-2 text-xs text-zinc-500">{t.mapHint}</div>
    </div>
  );
}
