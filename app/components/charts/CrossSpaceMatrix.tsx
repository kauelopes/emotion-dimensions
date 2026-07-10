"use client";

import { useMemo, useRef, useState } from "react";
import type { CrossSpace } from "@/lib/types";
import { strings } from "@/content/strings";

const CELL = 30;
const LEFT = 120;
const TOP = 120;

const FAMILY_COLOR: Record<string, string> = {
  static: "#0072B2",
  contextual: "#E69F00",
  sentence: "#009E73",
  API: "#CC79A7",
  consensus: "#c9834e",
  human: "#e4e4e7",
};

// compact cividis approximation (CVD-safe, matches the paper's colormap)
const CIVIDIS: [number, number, number][] = [
  [0, 34, 78],
  [53, 69, 108],
  [102, 105, 112],
  [165, 156, 116],
  [254, 232, 56],
];

function cividis(t: number): string {
  const c = Math.max(0, Math.min(1, t)) * (CIVIDIS.length - 1);
  const i = Math.min(CIVIDIS.length - 2, Math.floor(c));
  const f = c - i;
  const [a, b] = [CIVIDIS[i], CIVIDIS[i + 1]];
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(
    a[1] + (b[1] - a[1]) * f,
  )},${Math.round(a[2] + (b[2] - a[2]) * f)})`;
}

export function CrossSpaceMatrix({ cross }: { cross: CrossSpace }) {
  const [hover, setHover] = useState<{ a: number; b: number } | null>(null);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const boxRef = useRef<HTMLDivElement | null>(null);

  const n = cross.spaces.length;
  const W = LEFT + n * CELL + 12;
  const H = TOP + n * CELL + 12;
  const nModels = cross.spaces.filter((s) => s.family !== "human").length;
  const nPure = cross.spaces.filter(
    (s) => s.family !== "human" && s.family !== "consensus",
  ).length;

  const lookup = useMemo(() => {
    const map = new Map<string, (typeof cross.pairs)[number]>();
    cross.pairs.forEach((p) => {
      map.set(`${p.a}|${p.b}`, p);
      map.set(`${p.b}|${p.a}`, p);
    });
    return map;
  }, [cross]);

  const pair = (i: number, j: number) =>
    lookup.get(`${cross.spaces[i].id}|${cross.spaces[j].id}`);

  const hovered = hover ? pair(hover.a, hover.b) : undefined;

  return (
    <div>
      <div
        ref={boxRef}
        className="relative overflow-x-auto rounded-xl border border-zinc-800 bg-[#111113] p-2"
        onMouseMove={(e) => {
          const r = boxRef.current?.getBoundingClientRect();
          if (r) setTipPos({ x: e.clientX - r.left, y: e.clientY - r.top });
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[520px]">
          {cross.spaces.map((s, i) => (
            <g key={s.id}>
              <text
                x={LEFT - 6}
                y={TOP + i * CELL + CELL / 2 + 3}
                textAnchor="end"
                fontSize="9"
                fill={FAMILY_COLOR[s.family] ?? "#a1a1aa"}
              >
                {s.pretty}
              </text>
              <text
                x={LEFT + i * CELL + CELL / 2}
                y={TOP - 6}
                textAnchor="start"
                fontSize="9"
                fill={FAMILY_COLOR[s.family] ?? "#a1a1aa"}
                transform={`rotate(-55 ${LEFT + i * CELL + CELL / 2} ${TOP - 6})`}
              >
                {s.pretty}
              </text>
            </g>
          ))}
          {cross.spaces.map((_, i) =>
            cross.spaces.map((__, j) => {
              if (i === j)
                return (
                  <rect key={`${i}-${j}`} x={LEFT + j * CELL} y={TOP + i * CELL}
                    width={CELL - 1.5} height={CELL - 1.5} fill="#1c1c1f" />
                );
              const p = pair(i, j);
              if (!p) return null;
              // lower triangle = RSA, upper = Procrustes fit (like fig F7)
              const v = i > j ? p.rsa : p.cka;
              const active = hover && ((hover.a === i && hover.b === j) || (hover.a === j && hover.b === i));
              return (
                <rect
                  key={`${i}-${j}`}
                  x={LEFT + j * CELL}
                  y={TOP + i * CELL}
                  width={CELL - 1.5}
                  height={CELL - 1.5}
                  fill={cividis(Math.max(0, v))}
                  stroke={active ? "#fafafa" : "none"}
                  strokeWidth="1.5"
                  onMouseEnter={() => setHover({ a: i, b: j })}
                  onMouseLeave={() => setHover(null)}
                />
              );
            }),
          )}
          {/* separators: before the machine consensus, before the human norms */}
          {nPure < nModels && (
            <>
              <line x1={LEFT + nPure * CELL - 0.75} y1={TOP - 2}
                x2={LEFT + nPure * CELL - 0.75} y2={TOP + n * CELL}
                stroke="#fafafa" strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1={LEFT - 2} y1={TOP + nPure * CELL - 0.75}
                x2={LEFT + n * CELL} y2={TOP + nPure * CELL - 0.75}
                stroke="#fafafa" strokeWidth="1.2" strokeDasharray="3 3" />
            </>
          )}
          <line x1={LEFT + nModels * CELL - 0.75} y1={TOP - 2}
            x2={LEFT + nModels * CELL - 0.75} y2={TOP + n * CELL} stroke="#fafafa" strokeWidth="1.2" />
          <line x1={LEFT - 2} y1={TOP + nModels * CELL - 0.75}
            x2={LEFT + n * CELL} y2={TOP + nModels * CELL - 0.75} stroke="#fafafa" strokeWidth="1.2" />
        </svg>
        {hover && hovered && (
          <div
            className="pointer-events-none absolute z-10 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-zinc-200"
            style={{ left: tipPos.x + 14, top: tipPos.y + 10 }}
          >
            <b className="text-zinc-50">
              {cross.spaces[hover.a].pretty} × {cross.spaces[hover.b].pretty}
            </b>
            <br />
            RSA {hovered.rsa} · CKA {hovered.cka} · permutation p {hovered.p}
            <br />
            Mantel p {hovered.p < 0.001 ? "< 0.001" : `= ${hovered.p}`}
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
        <span>{strings.crossSpace.matrixHint}</span>
        <span className="flex items-center gap-2">
          0
          <span
            className="h-3 w-32 rounded-sm"
            style={{
              background: `linear-gradient(90deg, ${cividis(0)}, ${cividis(0.5)}, ${cividis(1)})`,
            }}
          />
          1
        </span>
      </div>
    </div>
  );
}
