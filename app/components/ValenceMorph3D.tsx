"use client";

import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Text } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { divergingGl } from "@/lib/colors";
import type { EmotionPoints } from "@/lib/types";

const SCALE = 1.5;
const RULER = 3.4;

/** One collapse stage: where the probe places each word on the ruler, and
    which human rating colors it (both in [0,1], index-aligned with terms). */
export interface MorphStage {
  target: (number | null)[];
  color: (number | null)[];
}

function smoothstep(t: number) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

// deterministic per-index jitter to give the collapsed ruler some thickness
function hash01(i: number) {
  let x = (i + 1) * 0x9e3779b1;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return ((x >>> 0) % 100000) / 100000;
}

export default function ValenceMorph3D(props: {
  data: EmotionPoints;
  model: string;
  progress: number; // 0..1 (scroll-driven)
  stages: MorphStage[]; // 1 stage: cloud->ruler; 2: cloud->ruler1->ruler2
  height?: number;
  axisNeg?: string;
  axisPos?: string;
}) {
  const {
    data,
    model,
    progress,
    stages,
    height = 480,
    axisNeg = "negative",
    axisPos = "positive",
  } = props;

  // with 2 stages the first collapse finishes at p=0.5
  const p = Math.max(0, Math.min(1, progress));
  const t1 = stages.length > 1 ? smoothstep(p / 0.5) : smoothstep(p);
  const t2 = stages.length > 1 ? smoothstep((p - 0.5) / 0.5) : 0;

  return (
    <div className="w-full overflow-hidden rounded-2xl" style={{ height }}>
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 50 }}
        gl={{
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.NoToneMapping,
        }}
      >
        <color attach="background" args={["#111113"]} />
        <ambientLight intensity={1.2} />
        <MorphPoints data={data} model={model} stages={stages} t1={t1} t2={t2} />
        <RulerAxis t={t1} axisNeg={axisNeg} axisPos={axisPos} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.08} enableZoom={false} />
      </Canvas>
    </div>
  );
}

function RulerAxis({
  t,
  axisNeg,
  axisPos,
}: {
  t: number;
  axisNeg: string;
  axisPos: string;
}) {
  const alpha = Math.max(0, (t - 0.6) / 0.4);
  const linePts = useMemo(
    () => [new THREE.Vector3(-RULER / 2, 0, 0), new THREE.Vector3(RULER / 2, 0, 0)],
    [],
  );
  if (alpha <= 0.01) return null;
  return (
    <group>
      <Line points={linePts} lineWidth={2} transparent opacity={0.35 * alpha} color="#e4e4e7" />
      <Text
        position={[-RULER / 2 - 0.15, 0, 0]}
        fontSize={0.1}
        color="#b35806"
        fillOpacity={alpha}
        anchorX="right"
      >
        {axisNeg}
      </Text>
      <Text
        position={[RULER / 2 + 0.15, 0, 0]}
        fontSize={0.1}
        color="#5c9fd6"
        fillOpacity={alpha}
        anchorX="left"
      >
        {axisPos}
      </Text>
    </group>
  );
}

function MorphPoints({
  data,
  model,
  stages,
  t1,
  t2,
}: {
  data: EmotionPoints;
  model: string;
  stages: MorphStage[];
  t1: number;
  t2: number;
}) {
  const geomRef = useRef<THREE.BufferGeometry>(null);

  const { basePos, stagePos, stageCol, geometry } = useMemo(() => {
    const m = data.models[model];
    // keep only terms with coordinates and complete stage data
    const idx = data.terms
      .map((_, i) => i)
      .filter(
        (i) =>
          m.xyz[i] !== null &&
          stages.every((s) => s.target[i] != null && s.color[i] != null),
      );
    const n = idx.length;
    const pos0 = new Float32Array(n * 3);
    idx.forEach((ti, k) => {
      const row = m.xyz[ti]!;
      pos0[k * 3] = row[0] * SCALE;
      pos0[k * 3 + 1] = row[1] * SCALE;
      pos0[k * 3 + 2] = row[2] * SCALE;
    });
    const sPos = stages.map((s) => {
      const pos = new Float32Array(n * 3);
      idx.forEach((ti, k) => {
        pos[k * 3] = (s.target[ti]! - 0.5) * RULER;
        pos[k * 3 + 1] = (hash01(k) - 0.5) * 0.16;
        pos[k * 3 + 2] = (hash01(k * 7 + 3) - 0.5) * 0.1;
      });
      return pos;
    });
    const sCol = stages.map((s) => {
      const col = new Float32Array(n * 3);
      idx.forEach((ti, k) => {
        const [r, g, b] = divergingGl(s.color[ti]!);
        col[k * 3] = r;
        col[k * 3 + 1] = g;
        col[k * 3 + 2] = b;
      });
      return col;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos0), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(sCol[0]), 3));
    g.computeBoundingSphere();
    return { basePos: pos0, stagePos: sPos, stageCol: sCol, geometry: g };
  }, [data, model, stages]);

  // free GPU buffers when the geometry is replaced or the scene unmounts
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    const g = geomRef.current;
    if (!g) return;
    const posAttr = g.getAttribute("position") as THREE.BufferAttribute;
    const cur = posAttr.array as Float32Array;
    const two = stagePos.length > 1;
    for (let i = 0; i < cur.length; i++) {
      // cloud -> first ruler, then (optionally) first -> second ruler
      const onRuler = two
        ? (1 - t2) * stagePos[0][i] + t2 * stagePos[1][i]
        : stagePos[0][i];
      cur[i] = (1 - t1) * basePos[i] + t1 * onRuler;
    }
    posAttr.needsUpdate = true;
    if (two) {
      const colAttr = g.getAttribute("color") as THREE.BufferAttribute;
      const col = colAttr.array as Float32Array;
      for (let i = 0; i < col.length; i++) {
        col[i] = (1 - t2) * stageCol[0][i] + t2 * stageCol[1][i];
      }
      colAttr.needsUpdate = true;
    }
    g.computeBoundingSphere();
  });

  return (
    <points frustumCulled={false}>
      <primitive object={geometry} ref={geomRef} attach="geometry" />
      <pointsMaterial
        size={0.09}
        vertexColors
        transparent
        depthWrite={false}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  );
}
