"use client";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Billboard, Text } from "@react-three/drei";
import { useMemo, useState } from "react";
import { divergingCss } from "@/lib/colors";
import type { EmotionPoints } from "@/lib/types";

const SCALE = 1.5;

export default function EmotionCloud3D(props: {
  data: EmotionPoints;
  model?: string;
  height?: number;
}) {
  const { data, model = "bge-m3", height = 420 } = props;
  const [hover, setHover] = useState<number | null>(null);

  const pts = useMemo(() => {
    const m = data.models[model];
    const rows: { i: number; t: string; p: [number, number, number]; v: number }[] = [];
    m.xyz.forEach((row, i) => {
      if (!row) return;
      rows.push({
        i,
        t: data.terms[i],
        p: [row[0] * SCALE, row[1] * SCALE, row[2] * SCALE],
        v: data.vad[i][0],
      });
    });
    return rows;
  }, [data, model]);

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
            <sphereGeometry args={[hover === pt.i ? 0.055 : 0.038, 16, 16]} />
            <meshBasicMaterial color={divergingCss(pt.v)} toneMapped={false} />
          </mesh>
        ))}
        {pts.map((pt) => (
          <Billboard key={`l-${pt.i}`} position={[pt.p[0], pt.p[1] + 0.07, pt.p[2]]}>
            <Text
              fontSize={0.07}
              color={hover === pt.i ? "#fafafa" : "#a1a1aa"}
              fillOpacity={hover === null ? 0.65 : hover === pt.i ? 1 : 0.2}
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
          autoRotate
          autoRotateSpeed={0.6}
          enableZoom={false}
        />
      </Canvas>
    </div>
  );
}
