"use client";

import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { divergingGl } from "@/lib/colors";
import type { EmotionPoints } from "@/lib/types";

const SCALE = 1.5;

function smoothstep(t: number) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

/** Scroll-driven morph of the emotion cloud across a sequence of models.
    Points keep their identity (and valence color); only positions move. */
export default function ModelMorph3D(props: {
  data: EmotionPoints;
  models: string[];
  progress: number; // 0..1 across the whole sequence
  height?: number;
}) {
  const { data, models, progress, height = 480 } = props;

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
        <SequencePoints data={data} models={models} progress={progress} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.08} enableZoom={false} />
      </Canvas>
    </div>
  );
}

function SequencePoints({
  data,
  models,
  progress,
}: {
  data: EmotionPoints;
  models: string[];
  progress: number;
}) {
  const geomRef = useRef<THREE.BufferGeometry>(null);

  // terms present in every model of the sequence, so identity is stable
  const { framePos, geometry } = useMemo(() => {
    const idx = data.terms
      .map((_, i) => i)
      .filter((i) => models.every((m) => data.models[m].xyz[i] !== null));
    const n = idx.length;
    const frames = models.map((m) => {
      const pos = new Float32Array(n * 3);
      idx.forEach((ti, k) => {
        const row = data.models[m].xyz[ti]!;
        pos[k * 3] = row[0] * SCALE;
        pos[k * 3 + 1] = row[1] * SCALE;
        pos[k * 3 + 2] = row[2] * SCALE;
      });
      return pos;
    });
    const col = new Float32Array(n * 3);
    idx.forEach((ti, k) => {
      const [r, g, b] = divergingGl(data.vad[ti][0]);
      col[k * 3] = r;
      col[k * 3 + 1] = g;
      col[k * 3 + 2] = b;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(frames[0]), 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.computeBoundingSphere();
    return { framePos: frames, geometry: g };
  }, [data, models]);

  // free GPU buffers when the geometry is replaced or the scene unmounts
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    const g = geomRef.current;
    if (!g) return;
    const segs = framePos.length - 1;
    const x = Math.max(0, Math.min(1, progress)) * segs;
    const s = Math.min(segs - 1, Math.floor(x));
    const t = smoothstep(x - s);
    const a = framePos[s];
    const b = framePos[s + 1];
    const attr = g.getAttribute("position") as THREE.BufferAttribute;
    const cur = attr.array as Float32Array;
    for (let i = 0; i < cur.length; i++) {
      cur[i] = (1 - t) * a[i] + t * b[i];
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
