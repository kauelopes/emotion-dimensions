"use client";

import type { DimensionalityRow } from "@/lib/types";
import { strings } from "@/content/strings";

const W = 700;
const ROW_H = 28;
const LEFT = 130;
const TOP = 28;
const XMAX = 24;

export function DimensionalityChart({ rows }: { rows: DimensionalityRow[] }) {
  const H = TOP + rows.length * ROW_H + 34;
  const sx = (v: number) => LEFT + (Math.min(v, XMAX) / XMAX) * (W - LEFT - 20);
  const L = strings.dimensionality.legend;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[560px]">
        {/* theory bands */}
        <rect x={sx(2)} y={TOP - 10} width={sx(4) - sx(2)} height={rows.length * ROW_H + 14}
          fill="var(--mid)" opacity="0.08" />
        <rect x={sx(10)} y={TOP - 10} width={sx(15) - sx(10)} height={rows.length * ROW_H + 14}
          fill="var(--accent)" opacity="0.1" />
        <text x={(sx(2) + sx(4)) / 2} y={TOP - 14} textAnchor="middle" fontSize="9"
          fill="#a1a1aa" className="font-mono">{L.band24}</text>
        <text x={(sx(10) + sx(15)) / 2} y={TOP - 14} textAnchor="middle" fontSize="9"
          fill="var(--accent)" className="font-mono">{L.band1015}</text>

        {/* x axis ticks */}
        {[0, 5, 10, 15, 20].map((t) => (
          <g key={t}>
            <line x1={sx(t)} y1={TOP - 8} x2={sx(t)} y2={TOP + rows.length * ROW_H}
              stroke="#27272a" strokeWidth="0.6" />
            <text x={sx(t)} y={TOP + rows.length * ROW_H + 14} textAnchor="middle"
              fontSize="9" fill="#71717a">{t}</text>
          </g>
        ))}
        <text x={W - 20} y={TOP + rows.length * ROW_H + 30} textAnchor="end"
          fontSize="9" fill="#71717a">intrinsic dimension estimate →</text>

        {rows.map((r, i) => {
          const y = TOP + i * ROW_H + ROW_H / 2;
          const lo = Math.min(r.twonn, r.mle);
          const hi = Math.max(r.twonn, r.mle);
          const isConsensus = r.family === "consensus";
          return (
            <g key={r.model}>
              {isConsensus && (
                <line x1={16} y1={y - ROW_H / 2} x2={W - 16} y2={y - ROW_H / 2}
                  stroke="#3f3f46" strokeWidth="1" strokeDasharray="4 3" />
              )}
              <text x={LEFT - 8} y={y + 3} textAnchor="end" fontSize="10"
                fill={isConsensus ? "var(--accent)" : "#d4d4d8"}
                fontWeight={isConsensus ? 600 : 400}>
                {r.pretty}
              </text>
              <line x1={sx(lo)} y1={y} x2={sx(hi)} y2={y} stroke="#52525b" strokeWidth="1" />
              {/* TwoNN: open diamond */}
              <rect x={sx(r.twonn) - 3.6} y={y - 3.6} width="7.2" height="7.2"
                transform={`rotate(45 ${sx(r.twonn)} ${y})`}
                fill="none" stroke="var(--pos)" strokeWidth="1.6">
                <title>{`${r.pretty} — TwoNN: ${r.twonn}`}</title>
              </rect>
              {/* MLE: open square */}
              <rect x={sx(r.mle) - 3.2} y={y - 3.2} width="6.4" height="6.4"
                fill="none" stroke="#a1a1aa" strokeWidth="1.6">
                <title>{`${r.pretty} — MLE: ${r.mle}`}</title>
              </rect>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-5 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rotate-45 border-2" style={{ borderColor: "var(--pos)" }} />
          {L.twonn}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 border-2 border-zinc-400" />
          {L.mle}
        </span>
      </div>
    </div>
  );
}
