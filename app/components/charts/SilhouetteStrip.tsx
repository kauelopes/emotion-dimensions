"use client";

import type { ClusteringRow } from "@/lib/types";
import { strings } from "@/content/strings";

const W = 700;
const H = 130;
const LEFT = 24;
const RIGHT = 24;
const CY = 62;
const XMAX = 0.6;

export function SilhouetteStrip({ rows }: { rows: ClusteringRow[] }) {
  const sx = (v: number) => LEFT + (Math.min(v, XMAX) / XMAX) * (W - LEFT - RIGHT);

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[560px]">
        <line x1={sx(0)} y1={CY} x2={sx(XMAX)} y2={CY} stroke="#3f3f46" strokeWidth="1" />
        {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6].map((t) => (
          <g key={t}>
            <line x1={sx(t)} y1={CY - 4} x2={sx(t)} y2={CY + 4} stroke="#52525b" strokeWidth="1" />
            <text x={sx(t)} y={CY + 20} textAnchor="middle" fontSize="9" fill="#71717a">
              {t.toFixed(1)}
            </text>
          </g>
        ))}
        {/* reference: well-separated clusters */}
        <line x1={sx(0.5)} y1={CY - 34} x2={sx(0.5)} y2={CY + 8}
          stroke="var(--mid)" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
        <text x={sx(0.5)} y={CY - 40} textAnchor="middle" fontSize="9" fill="#d4d4d8">
          {strings.gradients.refLine}
        </text>
        {rows.map((r, i) =>
          r.family === "consensus" ? (
            <g key={r.model}>
              <rect x={sx(r.silhouetteBest) - 4.6} y={CY - 15 - 4.6}
                width="9.2" height="9.2"
                transform={`rotate(45 ${sx(r.silhouetteBest)} ${CY - 15})`}
                fill="none" stroke="var(--accent)" strokeWidth="2">
                <title>{`${r.pretty} — silhouette ${r.silhouetteBest} (best k = ${r.bestK})`}</title>
              </rect>
              <text x={sx(r.silhouetteBest)} y={CY - 27} textAnchor="middle"
                fontSize="8.5" fill="var(--accent)" fontWeight="600">
                {r.pretty}
              </text>
            </g>
          ) : (
            <circle key={r.model} cx={sx(r.silhouetteBest)}
              cy={CY + (i % 2 === 0 ? -10 : -20)} r="5"
              fill="var(--accent)" opacity="0.75" stroke="#09090b" strokeWidth="1">
              <title>{`${r.pretty} — silhouette ${r.silhouetteBest} (best k = ${r.bestK})`}</title>
            </circle>
          ),
        )}
        <text x={sx(0)} y={H - 8} fontSize="9" fill="#71717a">
          {strings.gradients.axisLabel} · one dot per model (hover)
        </text>
      </svg>
    </div>
  );
}
