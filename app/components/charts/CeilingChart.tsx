"use client";

import { useMemo } from "react";
import type { CrossSpace } from "@/lib/types";
import { strings } from "@/content/strings";

const W = 700;
const LEFT = 130;
const TOP = 26;
const ROW_H = 30;
const XMIN = -0.05;
const XMAX = 1.1;

export function CeilingChart({ cross }: { cross: CrossSpace }) {
  const rows = useMemo(
    () => [...cross.ceiling].sort((a, b) => b.ratioGrid - a.ratioGrid),
    [cross],
  );
  const H = TOP + rows.length * ROW_H + 34;
  const sx = (v: number) =>
    LEFT + ((Math.max(XMIN, Math.min(XMAX, v)) - XMIN) / (XMAX - XMIN)) * (W - LEFT - 16);
  const L = strings.ceiling.legend;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[560px]">
        {/* reference lines: chance (0) and the human-human ceiling (1) */}
        {[
          { v: 0, label: L.chance, color: "#71717a" },
          { v: 1, label: L.ceiling, color: "#e4e4e7" },
        ].map((ref) => (
          <g key={ref.v}>
            <line x1={sx(ref.v)} y1={TOP - 12} x2={sx(ref.v)} y2={TOP + rows.length * ROW_H}
              stroke={ref.color} strokeWidth="1" strokeDasharray={ref.v === 1 ? "5 3" : "none"} />
            <text x={sx(ref.v)} y={TOP - 16} textAnchor="middle" fontSize="9" fill={ref.color}>
              {ref.label}
            </text>
          </g>
        ))}
        {[0.25, 0.5, 0.75].map((t) => (
          <g key={t}>
            <line x1={sx(t)} y1={TOP - 6} x2={sx(t)} y2={TOP + rows.length * ROW_H}
              stroke="#27272a" strokeWidth="0.6" />
            <text x={sx(t)} y={TOP + rows.length * ROW_H + 14} textAnchor="middle"
              fontSize="9" fill="#71717a">{t}</text>
          </g>
        ))}
        <text x={W - 16} y={TOP + rows.length * ROW_H + 30} textAnchor="end"
          fontSize="9" fill="#71717a">fraction of human-human agreement (bootstrap 95% CI) →</text>

        {rows.map((r, i) => {
          const y = TOP + i * ROW_H + ROW_H / 2;
          const isConsensus = r.model === "machine-consensus";
          return (
            <g key={r.model}>
              {isConsensus && (
                <rect x={12} y={y - ROW_H / 2 + 2} width={W - 24} height={ROW_H - 4}
                  fill="var(--accent)" opacity="0.07" rx="4" />
              )}
              <text x={LEFT - 8} y={y + 3} textAnchor="end" fontSize="10"
                fill={isConsensus ? "var(--accent)" : "#d4d4d8"}
                fontWeight={isConsensus ? 600 : 400}>
                {r.pretty}
              </text>
              {/* vs NRC-VAD: gray square */}
              <line x1={sx(r.loNrc)} y1={y + 6} x2={sx(r.hiNrc)} y2={y + 6}
                stroke="#52525b" strokeWidth="1.2" />
              <rect x={sx(r.ratioNrc) - 3} y={y + 3} width="6" height="6" fill="#71717a">
                <title>{`${r.pretty} vs NRC-VAD: ${r.ratioNrc} (${r.loNrc}–${r.hiNrc})`}</title>
              </rect>
              {/* vs GRID: accent circle */}
              <line x1={sx(r.loGrid)} y1={y - 4} x2={sx(r.hiGrid)} y2={y - 4}
                stroke="var(--accent)" strokeWidth="1.4" />
              <circle cx={sx(r.ratioGrid)} cy={y - 4} r="4.2" fill="var(--accent)">
                <title>{`${r.pretty} vs GRID: ${r.ratioGrid} (${r.loGrid}–${r.hiGrid})`}</title>
              </circle>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-5 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "var(--accent)" }} />
          {L.grid}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 bg-zinc-500" />
          {L.nrc}
        </span>
      </div>
    </div>
  );
}

// deterministic jitter for the strip rows
function hash01(i: number) {
  let x = (i + 1) * 0x9e3779b1;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return ((x >>> 0) % 100000) / 100000;
}

export function CalibrationStrip({ cross }: { cross: CrossSpace }) {
  const { calibration: c } = cross;
  const SW = 700;
  const SH = 170;
  const SLEFT = 190;
  const rows = [
    { label: strings.ceiling.strips.neutral, values: c.neutral, color: "#71717a" },
    { label: strings.ceiling.strips.emotion, values: c.emotion, color: "var(--accent)" },
    { label: strings.ceiling.strips.modelNorm, values: c.modelNorm, color: "#56B4E9" },
  ];
  const sx = (v: number) => SLEFT + (Math.max(0, v) / 0.95) * (SW - SLEFT - 16);

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${SW} ${SH}`} className="h-auto w-full min-w-[560px]">
        {/* chance band */}
        <rect x={sx(0)} y={14} width={sx(c.chance) - sx(0)} height={SH - 46}
          fill="#3f3f46" opacity="0.35" />
        <text x={(sx(0) + sx(c.chance)) / 2} y={SH - 24} textAnchor="middle"
          fontSize="8.5" fill="#71717a">{strings.ceiling.legend.chance}</text>
        {/* human-human ceiling */}
        <line x1={sx(c.humanHuman)} y1={12} x2={sx(c.humanHuman)} y2={SH - 32}
          stroke="#e4e4e7" strokeWidth="1" strokeDasharray="5 3" />
        <text x={sx(c.humanHuman)} y={SH - 22} textAnchor="middle" fontSize="8.5"
          fill="#e4e4e7">{strings.ceiling.legend.ceiling} ({c.humanHuman})</text>
        {[0.2, 0.4, 0.6, 0.8].map((t) => (
          <text key={t} x={sx(t)} y={SH - 6} textAnchor="middle" fontSize="9" fill="#71717a">
            {t}
          </text>
        ))}
        {rows.map((row, ri) => {
          const y = 30 + ri * 38;
          // values arrive sorted from the export, so the median is direct
          const n = row.values.length;
          const median =
            n % 2 ? row.values[(n - 1) / 2]
              : (row.values[n / 2 - 1] + row.values[n / 2]) / 2;
          return (
            <g key={row.label}>
              <text x={SLEFT - 8} y={y + 3} textAnchor="end" fontSize="9.5" fill="#a1a1aa">
                {row.label}
              </text>
              {row.values.map((v, i) => (
                <circle key={i} cx={sx(v)} cy={y + (hash01(i + ri * 97) - 0.5) * 16}
                  r="3.2" fill={row.color} opacity="0.45">
                  <title>{`RSA = ${v}`}</title>
                </circle>
              ))}
              <line x1={sx(median)} y1={y - 13} x2={sx(median)} y2={y + 13}
                stroke={row.color} strokeWidth="2.5">
                <title>{`median RSA = ${median.toFixed(2)}`}</title>
              </line>
              <text x={sx(median)} y={y - 17} textAnchor="middle" fontSize="8.5"
                fill={row.color} className="tabular-nums" fontWeight="600">
                {median.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
