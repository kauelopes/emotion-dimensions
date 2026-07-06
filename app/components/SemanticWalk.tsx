"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { divergingCss } from "@/lib/colors";
import type { EmotionPoints, Neighbors } from "@/lib/types";
import { strings } from "@/content/strings";

const W = 700;
const H = 480;
const PAD = 44;

/** Greedy walk: always hop to a nearby unvisited word that is strictly
    closer to the destination. Short hops = the fabric is continuous. */
function walkPath(D: number[][], from: number, to: number): number[] {
  const path = [from];
  const visited = new Set([from]);
  let cur = from;
  while (cur !== to && path.length < 20) {
    let best = -1;
    let bestHop = Infinity;
    for (let c = 0; c < D.length; c++) {
      if (visited.has(c)) continue;
      if (D[c][to] < D[cur][to] && D[cur][c] < bestHop) {
        bestHop = D[cur][c];
        best = c;
      }
    }
    if (best === -1) best = to;
    path.push(best);
    visited.add(best);
    cur = best;
  }
  return path;
}

export function SemanticWalk({
  data,
  neighbors,
}: {
  data: EmotionPoints;
  neighbors: Neighbors;
}) {
  const [from, setFrom] = useState(() => data.terms.indexOf("anger"));
  const [to, setTo] = useState(() => data.terms.indexOf("joy"));
  const [picking, setPicking] = useState<"from" | "to">("from");

  const pts = useMemo(() => {
    const m = data.models[neighbors.model];
    const rows = data.terms.map((t, i) => {
      const row = m.xyz[i];
      return row ? { i, t, x: row[0], y: row[1] } : null;
    });
    const valid = rows.filter((r) => r !== null);
    const xs = valid.map((r) => r.x);
    const ys = valid.map((r) => r.y);
    const [xmin, xmax] = [Math.min(...xs), Math.max(...xs)];
    const [ymin, ymax] = [Math.min(...ys), Math.max(...ys)];
    return rows.map((r) =>
      r
        ? {
            ...r,
            px: PAD + ((r.x - xmin) / (xmax - xmin)) * (W - 2 * PAD),
            py: H - PAD - ((r.y - ymin) / (ymax - ymin)) * (H - 2 * PAD),
          }
        : null,
    );
  }, [data, neighbors.model]);

  const path = useMemo(
    () => walkPath(neighbors.distance, from, to),
    [neighbors, from, to],
  );
  const onPath = useMemo(() => new Set(path), [path]);

  const d = useMemo(() => {
    const coords = path
      .map((i) => pts[i])
      .filter((p) => p !== null)
      .map((p) => `${p.px},${p.py}`);
    return coords.length > 1 ? `M ${coords.join(" L ")}` : "";
  }, [path, pts]);

  const pick = (i: number) => {
    if (picking === "from") {
      setFrom(i);
      setPicking("to");
    } else {
      setTo(i);
      setPicking("from");
    }
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
        <span>{strings.walk.hint}</span>
        <span className="font-mono">
          {strings.walk.pathLabel}: {path.map((i) => data.terms[i]).join(" → ")}{" "}
          · {path.length - 1} {strings.walk.stepsLabel}
        </span>
      </div>
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#111113]">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          {d && (
            <motion.path
              key={d}
              d={d}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.6"
              strokeDasharray="1 0"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
            />
          )}
          {pts.map(
            (p) =>
              p && (
                <g key={p.i} className="cursor-pointer" onClick={() => pick(p.i)}>
                  <circle
                    cx={p.px}
                    cy={p.py}
                    r={onPath.has(p.i) ? 6.5 : 4}
                    fill={divergingCss(data.vad[p.i][0])}
                    stroke={
                      p.i === from || p.i === to ? "#fafafa" : "#09090b"
                    }
                    strokeWidth={p.i === from || p.i === to ? 2 : 1}
                    opacity={onPath.has(p.i) ? 1 : 0.55}
                  />
                  <text
                    x={p.px + 8}
                    y={p.py + 3}
                    fontSize="9"
                    fill={onPath.has(p.i) ? "#fafafa" : "#71717a"}
                    fontWeight={onPath.has(p.i) ? 600 : 400}
                    opacity={onPath.has(p.i) ? 1 : 0.6}
                    style={{ pointerEvents: "none" }}
                  >
                    {p.t}
                  </text>
                </g>
              ),
          )}
        </svg>
      </div>
    </div>
  );
}
