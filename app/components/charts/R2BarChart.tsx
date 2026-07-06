"use client";

import type { InterpretationRow } from "@/lib/types";
import { strings } from "@/content/strings";

const W = 700;
const GROUP_H = 46;
const BAR_H = 11;
const LEFT = 130;
const TOP = 20;
const XMIN = -0.45;
const XMAX = 1.0;

const DIMS = [
  { key: "r2Valence" as const, label: "v" as const, color: "var(--pos)" },
  { key: "r2Dominance" as const, label: "d" as const, color: "#71717a" },
  { key: "r2Arousal" as const, label: "a" as const, color: "var(--neg)" },
];

export function R2BarChart({ rows }: { rows: InterpretationRow[] }) {
  const H = TOP + rows.length * GROUP_H + 36;
  const sx = (v: number) =>
    LEFT + ((Math.max(XMIN, Math.min(XMAX, v)) - XMIN) / (XMAX - XMIN)) * (W - LEFT - 16);
  const zero = sx(0);
  const L = strings.arousal.legend;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[560px]">
        {[-0.25, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={sx(t)} y1={TOP - 6} x2={sx(t)} y2={TOP + rows.length * GROUP_H}
              stroke="#27272a" strokeWidth="0.6" />
            <text x={sx(t)} y={TOP + rows.length * GROUP_H + 14} textAnchor="middle"
              fontSize="9" fill="#71717a">{t}</text>
          </g>
        ))}
        {/* zero baseline — negative R² lives to the left of this line */}
        <line x1={zero} y1={TOP - 6} x2={zero} y2={TOP + rows.length * GROUP_H}
          stroke="#e4e4e7" strokeWidth="1" />
        <text x={zero} y={TOP + rows.length * GROUP_H + 14} textAnchor="middle"
          fontSize="9" fill="#e4e4e7">0</text>
        <text x={W - 16} y={TOP + rows.length * GROUP_H + 30} textAnchor="end"
          fontSize="9" fill="#71717a">R² (ridge, human ratings) → · {strings.arousal.zeroNote}</text>

        {rows.map((r, gi) => {
          const gy = TOP + gi * GROUP_H;
          return (
            <g key={r.model}>
              <text x={LEFT - 8} y={gy + GROUP_H / 2 + 1} textAnchor="end"
                fontSize="10" fill="#d4d4d8">{r.pretty}</text>
              {DIMS.map((d, di) => {
                const v = r[d.key];
                const y = gy + 4 + di * (BAR_H + 2);
                const x0 = Math.min(zero, sx(v));
                const w = Math.abs(sx(v) - zero);
                return (
                  <g key={d.key}>
                    <rect x={x0} y={y} width={Math.max(w, 0.5)} height={BAR_H}
                      fill={d.color} opacity={v < 0 ? 0.85 : 0.9} rx="1.5">
                      <title>{`${r.pretty} — ${L[d.label]}: R² = ${v}`}</title>
                    </rect>
                    <text x={v >= 0 ? sx(v) + 4 : sx(v) - 4} y={y + BAR_H - 2.5}
                      textAnchor={v >= 0 ? "start" : "end"} fontSize="8"
                      fill="#71717a" className="tabular-nums">
                      {v.toFixed(2)}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-5 text-xs text-zinc-500">
        {DIMS.map((d) => (
          <span key={d.key} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
            {L[d.label]}
          </span>
        ))}
      </div>
    </div>
  );
}
