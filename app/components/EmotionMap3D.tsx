"use client";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Billboard, Text } from "@react-three/drei";
import { useMemo, useState } from "react";
import { divergingCss } from "@/lib/colors";
import {
  VAD_INDEX,
  VAD_LABEL,
  type EmotionPoints,
  type VadDim,
} from "@/lib/types";
import { strings } from "@/content/strings";

const SCALE = 1.6;

/** Scene 12: the explorable map, in full PC1×PC2×PC3 — model picker,
    color by V/A/D, drag to rotate, hover for the ratings. */
export default function EmotionMap3D({
  data,
  height = 560,
}: {
  data: EmotionPoints;
  height?: number;
}) {
  const modelKeys = Object.keys(data.models);
  const [model, setModel] = useState(
    modelKeys.includes("bge-m3") ? "bge-m3" : modelKeys[0],
  );
  const [dim, setDim] = useState<VadDim>("v");
  const [hover, setHover] = useState<number | null>(null);
  const di = VAD_INDEX[dim];

  const pts = useMemo(() => {
    const m = data.models[model];
    const rows: { i: number; t: string; p: [number, number, number] }[] = [];
    m.xyz.forEach((row, i) => {
      if (!row) return;
      rows.push({
        i,
        t: data.terms[i],
        p: [row[0] * SCALE, row[1] * SCALE, row[2] * SCALE],
      });
    });
    return rows;
  }, [data, model]);

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
        className="relative overflow-hidden rounded-xl border border-zinc-800 bg-[#111113]"
        style={{ height }}
      >
        <Canvas
          camera={{ position: [0, 0, 4.4], fov: 50 }}
          gl={{
            outputColorSpace: THREE.SRGBColorSpace,
            toneMapping: THREE.NoToneMapping,
          }}
        >
          <color attach="background" args={["#111113"]} />
          <ambientLight intensity={1.2} />
          {pts.map((pt) => (
            <mesh
              key={pt.i}
              position={pt.p}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHover(pt.i);
              }}
              onPointerOut={() => setHover(null)}
            >
              <sphereGeometry args={[hover === pt.i ? 0.06 : 0.042, 16, 16]} />
              <meshBasicMaterial
                color={divergingCss(data.vad[pt.i][di])}
                toneMapped={false}
              />
            </mesh>
          ))}
          {pts.map((pt) => (
            <Billboard
              key={`l-${pt.i}`}
              position={[pt.p[0], pt.p[1] + 0.07, pt.p[2]]}
            >
              <Text
                fontSize={0.068}
                color={hover === pt.i ? "#fafafa" : "#a1a1aa"}
                fillOpacity={hover === null ? 0.6 : hover === pt.i ? 1 : 0.15}
                anchorX="center"
                anchorY="bottom"
              >
                {pt.t}
              </Text>
            </Billboard>
          ))}
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            enableZoom={false}
            enablePan={false}
          />
        </Canvas>
        {hover !== null && (
          <div className="pointer-events-none absolute top-3 left-3 z-10 rounded-md border border-zinc-700 bg-zinc-900/90 px-2.5 py-1.5 text-xs whitespace-nowrap text-zinc-200">
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
          distance-map axes 1 × 2 × 3 · {data.models[model].pretty} · {strings.explore.dragHint}
        </span>
      </div>
    </div>
  );
}
