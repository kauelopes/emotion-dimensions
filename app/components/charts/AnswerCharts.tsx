"use client";

import type { ConsensusAxisRow, GridDim, NeutralControlRow } from "@/lib/types";
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
   4×4 axis-match grid: Pearson r between each GPA consensus axis and each
   GRID dimension. The ring marks the best match per axis. */

const DIMS: GridDim[] = ["valence", "power", "arousal", "novelty"];
const CELL = 92;
const GRID_LEFT = 56;
const GRID_TOP = 30;

export function AxisMatchGrid({
  rows,
  modelsOnly,
}: {
  rows: ConsensusAxisRow[];
  modelsOnly: ConsensusAxisRow[];
}) {
  const w = GRID_LEFT + DIMS.length * CELL + 8;
  const h = GRID_TOP + rows.length * CELL + 8;
  const mo = new Map(modelsOnly.map((r) => [r.axis, r.r]));

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="mx-auto h-auto w-full max-w-[460px] min-w-[380px]">
        {DIMS.map((d, j) => (
          <text key={d} x={GRID_LEFT + j * CELL + CELL / 2} y={GRID_TOP - 10}
            textAnchor="middle" fontSize="10" fill="#d4d4d8">{d}</text>
        ))}
        {rows.map((row, i) => {
          const best = DIMS.reduce((a, b) =>
            Math.abs(row.r[a]) >= Math.abs(row.r[b]) ? a : b);
          return (
            <g key={row.axis}>
              <text x={GRID_LEFT - 10} y={GRID_TOP + i * CELL + CELL / 2 + 3}
                textAnchor="end" fontSize="10" fill="#d4d4d8">{row.axis}</text>
              {DIMS.map((d, j) => {
                const r = row.r[d];
                const a = Math.abs(r);
                const x = GRID_LEFT + j * CELL;
                const y = GRID_TOP + i * CELL;
                const rMo = mo.get(row.axis)?.[d];
                return (
                  <g key={d}>
                    <rect x={x + 2} y={y + 2} width={CELL - 4} height={CELL - 4}
                      rx="6" fill="var(--accent)"
                      opacity={0.06 + a * 0.85}
                      stroke={d === best ? "#e4e4e7" : "none"}
                      strokeWidth={d === best ? 2 : 0}>
                      <title>
                        {`${row.axis} × ${d}: r = ${r > 0 ? "+" : ""}${r.toFixed(2)}` +
                          (rMo !== undefined
                            ? `\nmodels-only consensus: ${rMo > 0 ? "+" : ""}${rMo.toFixed(2)}`
                            : "")}
                      </title>
                    </rect>
                    <text x={x + CELL / 2} y={y + CELL / 2 + 4} textAnchor="middle"
                      fontSize="12" pointerEvents="none"
                      fill={a > 0.5 ? "#09090b" : "#e4e4e7"}>
                      {r > 0 ? "+" : "−"}{Math.abs(r).toFixed(2).replace("0.", ".")}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-xs leading-relaxed text-zinc-600">
        {strings.answers.q2.caption}
      </p>
    </div>
  );
}
