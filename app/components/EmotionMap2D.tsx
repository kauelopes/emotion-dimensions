"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { divergingCss } from "@/lib/colors";
import { VAD_INDEX, VAD_LABEL, type EmotionPoints, type VadDim } from "@/lib/types";
import { strings } from "@/content/strings";

const W = 700;
const H = 520;
const PAD = 40;

export function EmotionMap2D({ data }: { data: EmotionPoints }) {
  const modelKeys = Object.keys(data.models);
  const [model, setModel] = useState(
    modelKeys.includes("bge-m3") ? "bge-m3" : modelKeys[0],
  );
  const [dim, setDim] = useState<VadDim>("v");
  const [hover, setHover] = useState<number | null>(null);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const chartRef = useRef<HTMLDivElement | null>(null);

  const pts = useMemo(() => {
    const m = data.models[model];
    const rows: { i: number; t: string; x: number; y: number }[] = [];
    m.xyz.forEach((row, i) => {
      if (!row) return;
      rows.push({ i, t: data.terms[i], x: row[0], y: row[1] });
    });
    const xs = rows.map((r) => r.x);
    const ys = rows.map((r) => r.y);
    const [xmin, xmax] = [Math.min(...xs), Math.max(...xs)];
    const [ymin, ymax] = [Math.min(...ys), Math.max(...ys)];
    const sx = (v: number) => PAD + ((v - xmin) / (xmax - xmin)) * (W - 2 * PAD);
    const sy = (v: number) =>
      H - PAD - ((v - ymin) / (ymax - ymin)) * (H - 2 * PAD);
    return rows.map((r) => ({ ...r, px: sx(r.x), py: sy(r.y) }));
  }, [data, model]);

  const di = VAD_INDEX[dim];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-5 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-zinc-500">{strings.explore.controls.model}</span>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100"
          >
            {modelKeys.map((k) => (
              <option key={k} value={k}>
                {data.models[k].pretty}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">{strings.explore.controls.colorBy}</span>
          <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/60 p-0.5">
            {(Object.keys(VAD_LABEL) as VadDim[]).map((k) => (
              <button
                key={k}
                onClick={() => setDim(k)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  dim === k ? "text-zinc-950" : "text-zinc-500 hover:text-zinc-300"
                }`}
                style={dim === k ? { backgroundColor: "var(--mid)" } : {}}
              >
                {VAD_LABEL[k]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={chartRef}
        className="relative overflow-hidden rounded-xl border border-zinc-800 bg-[#111113]"
        onMouseMove={(e) => {
          const r = chartRef.current?.getBoundingClientRect();
          if (r) setTipPos({ x: e.clientX - r.left, y: e.clientY - r.top });
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <line x1={W / 2} y1={PAD} x2={W / 2} y2={H - PAD} stroke="#3f3f46" strokeWidth="0.6" />
          <line x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} stroke="#3f3f46" strokeWidth="0.6" />
          {pts.map((p) => (
            <motion.text
              key={`t-${p.i}`}
              animate={{ x: p.px + 8, y: p.py + 3 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              fontSize="9"
              fill="#a1a1aa"
              opacity={hover === null || hover === p.i ? 0.85 : 0.25}
              style={{ pointerEvents: "none" }}
            >
              {p.t}
            </motion.text>
          ))}
          {pts.map((p) => (
            <motion.circle
              key={`c-${p.i}`}
              animate={{ cx: p.px, cy: p.py }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              r={hover === p.i ? 8 : 6}
              fill={divergingCss(data.vad[p.i][di])}
              stroke="#09090b"
              strokeWidth="1"
              onMouseEnter={() => setHover(p.i)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </svg>
        {hover !== null && (
          <div
            className="pointer-events-none absolute z-10 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-zinc-200"
            style={{ left: tipPos.x + 14, top: tipPos.y + 10 }}
          >
            <b className="text-zinc-50">{data.terms[hover]}</b>
            <br />
            valence {data.vad[hover][0]} · arousal {data.vad[hover][1]} ·
            dominance {data.vad[hover][2]}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
        <span>
          {VAD_LABEL[dim]}: {strings.explore.legend.lo}
        </span>
        <span
          className="h-3 w-44 rounded-sm"
          style={{
            background: "linear-gradient(90deg, var(--neg), var(--mid), var(--pos))",
          }}
        />
        <span>{strings.explore.legend.hi}</span>
        <span className="ml-auto font-mono">
          PC1 × PC2 · {data.models[model].pretty}
        </span>
      </div>
    </div>
  );
}
