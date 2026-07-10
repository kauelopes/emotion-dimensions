"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  Dim4,
  EmotionPoints,
  GridDim,
  RdmAxes,
  RdmCommittees,
  RdmFactorial,
  RdmFingerprints,
  RdmModel,
  RdmSpectrum,
} from "@/lib/types";
import { GRID_DIMS } from "@/lib/types";
import { divergingRgb } from "@/lib/colors";
import { strings } from "@/content/strings";

const DIM_LABEL: Record<GridDim, string> = {
  valence: "valence",
  power: "power",
  arousal: "arousal",
  novelty: "novelty",
};

/* ================================================================== */
/* 1. One fingerprint per model — small-multiple RDM heatmaps          */
/* ================================================================== */

/** Condensed (pdist) index for the pair (i, j), i < j, over n items. */
function condensedIndex(i: number, j: number, n: number): number {
  return n * i - (i * (i + 1)) / 2 + (j - i - 1);
}

function FingerprintCanvas({
  model,
  order,
  n,
  size,
}: {
  model: RdmModel;
  order: number[];
  n: number;
  size: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(n, n);
    for (let a = 0; a < n; a++) {
      for (let b = 0; b < n; b++) {
        const i = order[a];
        const j = order[b];
        // similarity = 1 − rank-distance -> diverging scale reads
        // "warm = near, blue-dark = far" like the paper's fingerprints
        let d = 0;
        if (i !== j) {
          d =
            model.rdmLower[
              i < j ? condensedIndex(i, j, n) : condensedIndex(j, i, n)
            ];
        }
        const [r, g, bch] = divergingRgb(d);
        const k = (a * n + b) * 4;
        img.data[k] = r;
        img.data[k + 1] = g;
        img.data[k + 2] = bch;
        img.data[k + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [model, order, n]);

  return (
    <canvas
      ref={ref}
      width={n}
      height={n}
      style={{ width: size, height: size, imageRendering: "pixelated" }}
      className="rounded-md"
    >
      <title>{model.pretty}</title>
    </canvas>
  );
}

export function RdmFingerprintWall({
  data,
  points,
}: {
  data: RdmFingerprints;
  points: EmotionPoints | null;
}) {
  const n = data.terms.length;

  // sort terms by human valence so every fingerprint shows the same
  // block structure (negative block, positive block)
  const order = useMemo(() => {
    const val = new Map<string, number>();
    if (points) {
      points.terms.forEach((t, i) => val.set(t, points.vad[i][0]));
    }
    return data.terms
      .map((t, i) => ({ i, v: val.get(t) ?? 0.5 }))
      .sort((a, b) => a.v - b.v)
      .map((x) => x.i);
  }, [data, points]);

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
        {data.models.map((m) => (
          <figure key={m.id} className="flex flex-col items-center gap-1">
            <FingerprintCanvas model={m} order={order} n={n} size={92} />
            <figcaption className="max-w-[92px] truncate text-center text-[10px] text-zinc-500">
              {m.pretty}
            </figcaption>
          </figure>
        ))}
        <figure className="col-span-2 row-span-2 flex flex-col items-center justify-start gap-1">
          <div className="rounded-lg p-0.5" style={{ boxShadow: "0 0 0 2px var(--accent)" }}>
            <FingerprintCanvas
              model={data.consensus}
              order={order}
              n={n}
              size={196}
            />
          </div>
          <figcaption
            className="text-center text-[11px] font-semibold"
            style={{ color: "var(--accent)" }}
          >
            {data.consensus.pretty}
          </figcaption>
        </figure>
      </div>
      <p className="mt-3 text-xs text-zinc-600">{strings.rdm.fingerprints.caption}</p>
    </div>
  );
}

/* ================================================================== */
/* 2. 25 ways to build one consensus — the construction factorial      */
/* ================================================================== */

const METRICS = ["cosine", "correlation", "euclid-z", "spearman-dist", "cosine-rank"];
const METHODS = ["mean", "distatis", "median", "rank-mean", "logeuclid-gram"];
const METRIC_SHORT: Record<string, string> = {
  cosine: "cosine",
  correlation: "correlation",
  "euclid-z": "euclid (z)",
  "spearman-dist": "spearman",
  "cosine-rank": "cosine rank",
};
const METHOD_SHORT: Record<string, string> = {
  mean: "mean",
  distatis: "DISTATIS",
  median: "median",
  "rank-mean": "rank mean",
  "logeuclid-gram": "log-Euclid",
};

export function RdmFactorialHeat({ data }: { data: RdmFactorial }) {
  const [hover, setHover] = useState<string | null>(null);
  const byKey = useMemo(() => {
    const m = new Map<string, RdmFactorial["cells"][number]>();
    data.cells.forEach((c) => m.set(`${c.metric}|${c.consensus}`, c));
    return m;
  }, [data]);

  const lo = 0.38;
  const hi = 0.58;
  const cell = 64;
  const left = 86;
  const top = 24;
  const W = left + METHODS.length * cell + 8;
  const H = top + METRICS.length * cell + 30;

  const hovered = hover ? byKey.get(hover) : null;

  return (
    <div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[480px]">
          {METHODS.map((mth, j) => (
            <text
              key={mth}
              x={left + j * cell + cell / 2}
              y={top - 8}
              textAnchor="middle"
              fontSize="9"
              fill="#a1a1aa"
            >
              {METHOD_SHORT[mth]}
            </text>
          ))}
          {METRICS.map((met, i) => (
            <text
              key={met}
              x={left - 8}
              y={top + i * cell + cell / 2 + 3}
              textAnchor="end"
              fontSize="9"
              fill="#a1a1aa"
            >
              {METRIC_SHORT[met]}
            </text>
          ))}
          {METRICS.map((met, i) =>
            METHODS.map((mth, j) => {
              const c = byKey.get(`${met}|${mth}`);
              if (!c) return null;
              const t = Math.min(1, Math.max(0, (c.rsaGrid - lo) / (hi - lo)));
              // sequential ramp: zinc-900 -> accent
              const r = Math.round(24 + t * (201 - 24));
              const g = Math.round(24 + t * (131 - 24));
              const b = Math.round(27 + t * (78 - 27));
              const key = `${met}|${mth}`;
              return (
                <g key={key}>
                  <rect
                    x={left + j * cell + 2}
                    y={top + i * cell + 2}
                    width={cell - 4}
                    height={cell - 4}
                    rx={7}
                    fill={`rgb(${r},${g},${b})`}
                    stroke={c.official ? "var(--mid)" : "#27272a"}
                    strokeWidth={c.official ? 2.5 : 1}
                    onMouseEnter={() => setHover(key)}
                    onMouseLeave={() => setHover(null)}
                  >
                    <title>
                      {`${METRIC_SHORT[met]} × ${METHOD_SHORT[mth]} — RSA vs GRID ${c.rsaGrid.toFixed(2)} · split-half ${c.splithalf.toFixed(2)} · centrality ${c.centrality.toFixed(2)}`}
                    </title>
                  </rect>
                  <text
                    x={left + j * cell + cell / 2}
                    y={top + i * cell + cell / 2 + 3.5}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight={c.official ? 700 : 400}
                    fill={t > 0.55 ? "#fafafa" : "#d4d4d8"}
                    pointerEvents="none"
                  >
                    {c.rsaGrid.toFixed(2)}
                  </text>
                  {c.official && (
                    <text
                      x={left + j * cell + cell / 2}
                      y={top + i * cell + cell - 8}
                      textAnchor="middle"
                      fontSize="7.5"
                      fill="var(--mid)"
                      pointerEvents="none"
                    >
                      official (blind)
                    </text>
                  )}
                </g>
              );
            }),
          )}
          <text x={left} y={H - 8} fontSize="9" fill="#71717a">
            {strings.rdm.factorial.axisLabel}
          </text>
        </svg>
      </div>
      <div className="mt-2 min-h-[2.5rem] rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 font-mono text-[11px] text-zinc-400">
        {hovered
          ? `${METRIC_SHORT[hovered.metric]} × ${METHOD_SHORT[hovered.consensus]} — RSA vs GRID ${hovered.rsaGrid.toFixed(2)} · valence k-NN R² ${hovered.knnR2.valence.toFixed(2)} · split-half ${hovered.splithalf.toFixed(2)} · centrality ${hovered.centrality.toFixed(2)} · GRID rank ${hovered.gridRank}/12 · FDR ${hovered.fdrSig ? "✓" : "✗"}`
          : strings.rdm.factorial.hoverHint}
      </div>
    </div>
  );
}

/* ================================================================== */
/* 3. The four axes, two readings — and the R7 resolution              */
/* ================================================================== */

function TwoReadingBars({ axes }: { axes: RdmAxes }) {
  const W = 640;
  const H = 190;
  const left = 66;
  const bw = 16;
  const group = (W - left - 20) / 4;
  const y0 = H - 36;
  const scale = (v: number) => v * (y0 - 24);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[480px]">
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line
            x1={left - 4}
            y1={y0 - scale(t)}
            x2={W - 16}
            y2={y0 - scale(t)}
            stroke="#27272a"
            strokeWidth="1"
          />
          <text x={left - 8} y={y0 - scale(t) + 3} textAnchor="end" fontSize="8.5" fill="#71717a">
            {t.toFixed(2)}
          </text>
        </g>
      ))}
      {GRID_DIMS.map((d, i) => {
        const cx = left + i * group + group / 2;
        const gpa = axes.frames.gpa.phi[d];
        const rdm = axes.frames.rdm.axisR[d];
        return (
          <g key={d}>
            <rect
              x={cx - bw - 3}
              y={y0 - scale(gpa)}
              width={bw}
              height={scale(gpa)}
              rx={3}
              fill="#7f8fa6"
            >
              <title>{`${DIM_LABEL[d]} — aligned-coordinate reading |φ| = ${gpa.toFixed(2)}`}</title>
            </rect>
            <rect
              x={cx + 3}
              y={y0 - scale(rdm)}
              width={bw}
              height={scale(rdm)}
              rx={3}
              fill="var(--accent)"
            >
              <title>{`${DIM_LABEL[d]} — raw relational reading |r| = ${rdm.toFixed(2)}`}</title>
            </rect>
            <text x={cx} y={y0 + 14} textAnchor="middle" fontSize="10" fill="#d4d4d8">
              {DIM_LABEL[d]}
            </text>
          </g>
        );
      })}
      <line
        x1={left - 4}
        y1={y0 - scale(axes.null95MinAxisR)}
        x2={W - 16}
        y2={y0 - scale(axes.null95MinAxisR)}
        stroke="var(--mid)"
        strokeWidth="1"
        strokeDasharray="4 3"
        opacity="0.6"
      />
      <text x={W - 16} y={y0 - scale(axes.null95MinAxisR) - 4} textAnchor="end" fontSize="8.5" fill="#a1a1aa">
        permutation null (95%)
      </text>
      <g transform={`translate(${left}, 12)`}>
        <rect x={0} y={-7} width={10} height={10} rx={2} fill="#7f8fa6" />
        <text x={14} y={2} fontSize="9" fill="#a1a1aa">
          aligned-coordinate reading (GPA frame)
        </text>
        <rect x={210} y={-7} width={10} height={10} rx={2} fill="var(--accent)" />
        <text x={224} y={2} fontSize="9" fill="#a1a1aa">
          raw relational reading (RDM frame)
        </text>
      </g>
    </svg>
  );
}

function ResolutionStrip({ axes }: { axes: RdmAxes }) {
  const res = axes.resolution;
  const W = 640;
  const H = 210;
  const left = 66;
  const bw = 13;
  const group = (W - left - 20) / 4;
  const y0 = H - 56;
  const scale = (v: number) => Math.max(0, v) * (y0 - 20);
  const levels: { key: "knn" | "olsOof" | "axis"; label: string; color: string }[] = [
    { key: "knn", label: "k-NN decoding", color: "#5c8aa8" },
    { key: "olsOof", label: "unrotated regression (held-out)", color: "#66a68b" },
    { key: "axis", label: "raw matched axis", color: "var(--accent)" },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[480px]">
      {GRID_DIMS.map((d, i) => {
        const cx = left + i * group + group / 2;
        return (
          <g key={d}>
            {levels.map((lv, k) => {
              const v = res.levels[d][lv.key];
              return (
                <rect
                  key={lv.key}
                  x={cx - 1.5 * bw - 4 + k * (bw + 4)}
                  y={y0 - scale(v)}
                  width={bw}
                  height={scale(v)}
                  rx={3}
                  fill={lv.color}
                >
                  <title>{`${DIM_LABEL[d]} — ${lv.label}: ${v.toFixed(2)}`}</title>
                </rect>
              );
            })}
            {/* same raw reading applied to the GRID's own RDM */}
            <line
              x1={cx - 1.5 * bw - 8}
              y1={y0 - scale(res.gridSelfAxis[d])}
              x2={cx + 1.5 * bw + 8}
              y2={y0 - scale(res.gridSelfAxis[d])}
              stroke="#fafafa"
              strokeWidth="1.6"
              strokeDasharray="5 3"
            >
              <title>{`${DIM_LABEL[d]} — same raw reading on the GRID's own RDM: ${res.gridSelfAxis[d].toFixed(2)}`}</title>
            </line>
            <text x={cx} y={y0 + 14} textAnchor="middle" fontSize="10" fill="#d4d4d8">
              {DIM_LABEL[d]}
            </text>
          </g>
        );
      })}
      <g transform={`translate(${left}, 12)`}>
        {levels.map((lv, k) => (
          <g key={lv.key} transform={`translate(${k * 205}, 0)`}>
            <rect x={0} y={-7} width={10} height={10} rx={2} fill={lv.color} />
            <text x={14} y={2} fontSize="9" fill="#a1a1aa">
              {lv.label}
            </text>
          </g>
        ))}
      </g>
      <text x={left} y={28} fontSize="9" fill="#71717a">
        dashes = same raw reading applied to the GRID&apos;s own distances
      </text>
      <text x={left} y={H - 26} fontSize="10" fill="#d4d4d8">
        {strings.rdm.axes.convergence
          .replace("{rdm}", res.heldout.rdm.toFixed(2))
          .replace("{gpa}", res.heldout.gpa.toFixed(2))
          .replace("{null}", res.heldout.null95.toFixed(2))}
      </text>
      <text x={left} y={H - 12} fontSize="9" fill="#71717a">
        {strings.rdm.axes.convergenceNote
          .replace("{pRdm}", res.heldout.powerRdm.toFixed(2))
          .replace("{pGpa}", res.heldout.powerGpa.toFixed(2))}
      </text>
    </svg>
  );
}

export function RdmTwoReadings({ axes }: { axes: RdmAxes }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-1 font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
          {strings.rdm.axes.panelA}
        </div>
        <TwoReadingBars axes={axes} />
      </div>
      <div>
        <div className="mb-1 font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
          {strings.rdm.axes.panelB}
        </div>
        <ResolutionStrip axes={axes} />
      </div>
    </div>
  );
}

/* ================================================================== */
/* 4. 4,017 committees + the shared spectrum                           */
/* ================================================================== */

export function RdmCommitteeSweep({ data }: { data: RdmCommittees }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const W = 680;
  const H = 300;
  const left = 46;
  const bottom = 34;
  const xOf = (nm: number, jit: number) =>
    left + ((nm - 2.4) / (12.6 - 2.4)) * (W - left - 16) + jit * 14;
  const yOf = (v: number) => (H - bottom) - Math.max(0, Math.min(0.85, v)) / 0.85 * (H - bottom - 12);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    // axes
    ctx.strokeStyle = "#3f3f46";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, 12);
    ctx.lineTo(left, H - bottom);
    ctx.lineTo(W - 16, H - bottom);
    ctx.stroke();
    ctx.fillStyle = "#71717a";
    ctx.font = "9px ui-monospace, monospace";
    for (let nm = 3; nm <= 12; nm++) {
      ctx.fillText(String(nm), xOf(nm, 0) - 3, H - bottom + 14);
    }
    for (const t of [0, 0.2, 0.4, 0.6, 0.8]) {
      ctx.fillText(t.toFixed(1), left - 26, yOf(t) + 3);
      ctx.strokeStyle = "#1f1f23";
      ctx.beginPath();
      ctx.moveTo(left, yOf(t));
      ctx.lineTo(W - 16, yOf(t));
      ctx.stroke();
    }

    // all committees (deterministic jitter from index)
    ctx.fillStyle = "rgba(161,161,170,0.22)";
    data.committees.forEach((c, i) => {
      const jit = (((i * 2654435761) % 1000) / 1000 - 0.5) * 2 * 0.9;
      ctx.beginPath();
      ctx.arc(xOf(c.nModels, jit), yOf(c.minAxisR), 1.6, 0, Math.PI * 2);
      ctx.fill();
    });

    // median trajectories: real vs shuffled
    const draw = (arm: "real" | "shuffled", color: string, dash: number[]) => {
      const rows = data.nullBySize
        .filter((r) => r.arm === arm)
        .sort((a, b) => a.nModels - b.nModels);
      ctx.strokeStyle = color;
      ctx.setLineDash(dash);
      ctx.lineWidth = 2;
      ctx.beginPath();
      rows.forEach((r, i) => {
        const x = xOf(r.nModels, 0);
        const y = yOf(r.median);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      rows.forEach((r) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(xOf(r.nModels, 0), yOf(r.median), 3, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    draw("real", "#c9834e", []);
    draw("shuffled", "#7f8fa6", [5, 4]);
  }, [data]);

  return (
    <div>
      <canvas ref={ref} style={{ width: "100%", height: "auto", aspectRatio: `${W}/${H}` }} />
      <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-[10px] text-zinc-500">
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-zinc-500/40" />
          {strings.rdm.committees.legendAll}
        </span>
        <span>
          <span className="mr-1 inline-block h-0.5 w-4 align-middle" style={{ backgroundColor: "#c9834e" }} />
          {strings.rdm.committees.legendReal}
        </span>
        <span>
          <span className="mr-1 inline-block h-0.5 w-4 border-t-2 border-dashed align-middle" style={{ borderColor: "#7f8fa6" }} />
          {strings.rdm.committees.legendShuffled}
        </span>
      </div>
    </div>
  );
}

export function RdmSpectrumStrip({ data }: { data: RdmSpectrum }) {
  const ranks = data.ranks.slice(0, 20);
  const W = 640;
  const H = 170;
  const left = 44;
  const bottom = 28;
  const maxEig = Math.max(...ranks.map((r) => r.eigObs));
  const xOf = (rank: number) => left + ((rank - 0.5) / 20) * (W - left - 14);
  const yOf = (v: number) => (H - bottom) - (Math.max(0, v) / maxEig) * (H - bottom - 16);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[480px]">
      {/* shared region + interpretable core */}
      <rect
        x={xOf(0.5)}
        y={10}
        width={xOf(data.sharedDims + 0.5) - xOf(0.5)}
        height={H - bottom - 10}
        fill="var(--accent)"
        opacity="0.07"
      />
      <rect
        x={xOf(0.5)}
        y={10}
        width={xOf(data.coreDims + 0.5) - xOf(0.5)}
        height={H - bottom - 10}
        fill="var(--accent)"
        opacity="0.1"
      />
      {ranks.map((r) => (
        <g key={r.rank}>
          <circle cx={xOf(r.rank)} cy={yOf(r.eigObs)} r="3.4"
            fill={r.aboveNull ? "var(--accent)" : "#52525b"}>
            <title>{`rank ${r.rank}: eigenvalue ${r.eigObs.toFixed(2)} vs null 95% ${r.eigNull95.toFixed(2)}`}</title>
          </circle>
        </g>
      ))}
      <path
        d={ranks
          .map((r, i) => `${i === 0 ? "M" : "L"}${xOf(r.rank)},${yOf(r.eigNull95)}`)
          .join(" ")}
        fill="none"
        stroke="var(--mid)"
        strokeWidth="1.2"
        strokeDasharray="4 3"
        opacity="0.7"
      />
      {[1, 4, 11, 20].map((t) => (
        <text key={t} x={xOf(t)} y={H - bottom + 14} textAnchor="middle" fontSize="9" fill="#71717a">
          {t}
        </text>
      ))}
      <text x={xOf(data.coreDims / 2 + 0.5)} y={22} textAnchor="middle" fontSize="8.5" fill="var(--accent)">
        {strings.rdm.committees.coreLabel}
      </text>
      <text
        x={xOf((data.coreDims + data.sharedDims) / 2 + 0.5)}
        y={22}
        textAnchor="middle"
        fontSize="8.5"
        fill="#a1a1aa"
      >
        {strings.rdm.committees.sharedLabel.replace("{n}", String(data.sharedDims))}
      </text>
      <text x={W - 16} y={yOf(ranks[14].eigNull95) - 6} textAnchor="end" fontSize="8.5" fill="#a1a1aa">
        permutation null (95%)
      </text>
      <text x={left} y={H - 6} fontSize="9" fill="#71717a">
        {strings.rdm.committees.spectrumAxis}
      </text>
    </svg>
  );
}
