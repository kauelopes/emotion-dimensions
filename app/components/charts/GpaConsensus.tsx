"use client";

import { useMemo, useState } from "react";
import { divergingCss } from "@/lib/colors";
import type { CrossSpace, EmotionPoints } from "@/lib/types";
import { strings } from "@/content/strings";

const W = 700;
const H = 440;
const PAD = 48;

export function GpaConsensus({
  cross,
  points,
}: {
  cross: CrossSpace;
  points: EmotionPoints;
}) {
  const [hover, setHover] = useState<string | null>(null);

  const { pts, labeled } = useMemo(() => {
    const xs = cross.consensus.map((c) => c.x);
    const ys = cross.consensus.map((c) => c.y);
    const ds = cross.consensus.map((c) => c.disp);
    const [xmin, xmax] = [Math.min(...xs), Math.max(...xs)];
    const [ymin, ymax] = [Math.min(...ys), Math.max(...ys)];
    const [dmin, dmax] = [Math.min(...ds), Math.max(...ds)];
    const vIdx = new Map(points.terms.map((t, i) => [t, i]));
    const rows = cross.consensus.map((c) => ({
      t: c.t,
      px: PAD + ((c.x - xmin) / (xmax - xmin)) * (W - 2 * PAD),
      py: H - PAD - ((c.y - ymin) / (ymax - ymin)) * (H - 2 * PAD),
      r: 3.5 + ((c.disp - dmin) / (dmax - dmin)) * 7,
      v: vIdx.has(c.t) ? points.vad[vIdx.get(c.t)!][0] : 0.5,
      disp: c.disp,
    }));
    // annotate the extremes: most stable and most contested words
    const byDisp = [...rows].sort((a, b) => a.disp - b.disp);
    const labeled = new Set(
      [...byDisp.slice(0, 5), ...byDisp.slice(-5)].map((r) => r.t),
    );
    return { pts: rows, labeled };
  }, [cross, points]);

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#111113]">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
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
                  x={p.px + p.r + 3}
                  y={p.py + 3}
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
      <div className="mt-2 text-xs text-zinc-500">
        {strings.crossSpace.consensusHint}
      </div>
    </div>
  );
}
