"use client";

import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Text } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { divergingGl } from "@/lib/colors";
import type { EmotionPoints } from "@/lib/types";
import { strings } from "@/content/strings";

const SCALE = 1.5;
const RULER = 3.4;

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
  model?: string;
  progress: number; // 0..1 (scroll-driven)
  height?: number;
}) {
  const { data, model = "bge-m3", progress, height = 480 } = props;
  const t = smoothstep(progress);

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
        <MorphPoints data={data} model={model} t={t} />
        <ValenceAxis t={t} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.08} enableZoom={false} />
      </Canvas>
    </div>
  );
}

function ValenceAxis({ t }: { t: number }) {
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
        {strings.morph.axisNeg}
      </Text>
      <Text
        position={[RULER / 2 + 0.15, 0, 0]}
        fontSize={0.1}
        color="#5c9fd6"
        fillOpacity={alpha}
        anchorX="left"
      >
        {strings.morph.axisPos}
      </Text>
    </group>
  );
}

function MorphPoints({
  data,
  model,
  t,
}: {
  data: EmotionPoints;
  model: string;
  t: number;
}) {
  const geomRef = useRef<THREE.BufferGeometry>(null);

  const { basePos, rulerPos, colors, geometry } = useMemo(() => {
    const m = data.models[model];
    const rows: { xyz: [number, number, number]; v: number }[] = [];
    m.xyz.forEach((row, i) => {
      if (!row) return;
      rows.push({ xyz: row, v: data.vad[i][0] });
    });
    const n = rows.length;
    const pos0 = new Float32Array(n * 3);
    const pos1 = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    rows.forEach((r, i) => {
      pos0[i * 3] = r.xyz[0] * SCALE;
      pos0[i * 3 + 1] = r.xyz[1] * SCALE;
      pos0[i * 3 + 2] = r.xyz[2] * SCALE;
      // target: valence ruler, with slight jitter for thickness
      pos1[i * 3] = (r.v - 0.5) * RULER;
      pos1[i * 3 + 1] = (hash01(i) - 0.5) * 0.16;
      pos1[i * 3 + 2] = (hash01(i * 7 + 3) - 0.5) * 0.1;
      const [cr, cg, cb] = divergingGl(r.v);
      col[i * 3] = cr;
      col[i * 3 + 1] = cg;
      col[i * 3 + 2] = cb;
    });
    const g = new THREE.BufferGeometry();
    const cur = new Float32Array(pos0);
    g.setAttribute("position", new THREE.BufferAttribute(cur, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.computeBoundingSphere();
    return { basePos: pos0, rulerPos: pos1, colors: col, geometry: g };
  }, [data, model]);

  void colors;

  useFrame(() => {
    const g = geomRef.current;
    if (!g) return;
    const attr = g.getAttribute("position") as THREE.BufferAttribute;
    const cur = attr.array as Float32Array;
    for (let i = 0; i < cur.length; i++) {
      cur[i] = (1 - t) * basePos[i] + t * rulerPos[i];
    }
    attr.needsUpdate = true;
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
