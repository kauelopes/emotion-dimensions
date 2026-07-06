"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Scene } from "@/components/Scene";
import { ScrollProgressScene } from "@/components/ScrollProgressScene";
import { TheoryCards } from "@/components/TheoryCards";
import { VocabularyWall } from "@/components/VocabularyWall";
import { EmotionMap2D } from "@/components/EmotionMap2D";
import { DimensionalityChart } from "@/components/charts/DimensionalityChart";
import { R2BarChart } from "@/components/charts/R2BarChart";
import { SilhouetteStrip } from "@/components/charts/SilhouetteStrip";
import { withBase } from "@/lib/paths";
import type { EmotionPoints, Stats } from "@/lib/types";
import { strings } from "@/content/strings";

const EmotionCloud3D = dynamic(() => import("@/components/EmotionCloud3D"), {
  ssr: false,
  loading: () => <Placeholder3D height={420} />,
});
const ValenceMorph3D = dynamic(() => import("@/components/ValenceMorph3D"), {
  ssr: false,
  loading: () => <Placeholder3D height={480} />,
});

function Placeholder3D({ height }: { height: number }) {
  return (
    <div
      className="flex w-full items-center justify-center rounded-2xl bg-[#111113] text-xs text-zinc-600"
      style={{ height }}
    >
      loading…
    </div>
  );
}

export function Story() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  const reducedMotion = useReducedMotion();

  const [points, setPoints] = useState<EmotionPoints | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(withBase("/data/emotion_points.json")).then((r) => r.json()),
      fetch(withBase("/data/stats.json")).then((r) => r.json()),
    ])
      .then(([p, s]) => {
        setPoints(p);
        setStats(s);
      })
      .catch((e) => setError(String(e)));
  }, []);

  const s = strings;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur">
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 w-full origin-left"
          style={{ scaleX, backgroundColor: "var(--accent)" }}
        />
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: "var(--accent)" }}
            />
            <div className="font-semibold tracking-tight">{s.header.title}</div>
          </div>
          <div className="font-mono text-xs tracking-widest text-zinc-600 uppercase">
            {s.header.kicker}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4">
        {/* Hero */}
        <section className="flex min-h-[92vh] flex-col items-center justify-center px-4 py-16 text-center">
          <div className="mb-4 font-mono text-xs tracking-widest text-zinc-500 uppercase">
            {s.hero.label}
          </div>
          <h1
            className="max-w-3xl text-4xl leading-tight font-medium tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-lora, serif)", color: "var(--accent)" }}
          >
            {s.hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-300">
            {s.hero.subtitle}
          </p>
          <div className="mt-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-800">
            {points ? (
              <EmotionCloud3D data={points} height={420} />
            ) : (
              <Placeholder3D height={420} />
            )}
          </div>
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-zinc-600">
            {s.hero.cloudCaption}
          </p>
          {error && (
            <p className="mt-3 text-xs text-red-400">data failed to load: {error}</p>
          )}
          <div className="mt-10 flex flex-col items-center gap-2 text-xs text-zinc-600">
            <span>{s.hero.scrollHint}</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
            >
              ↓
            </motion.div>
          </div>
        </section>

        {/* 01 — theories */}
        <Scene id="theories" step={1} title={s.theories.title}>
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-zinc-300">
            {s.theories.intro}
          </p>
          <TheoryCards />
        </Scene>

        {/* 02 — vocabulary */}
        <Scene id="vocabulary" step={2} title={s.vocabulary.title}>
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
            <p className="text-sm leading-relaxed text-zinc-300">
              {s.vocabulary.text}
            </p>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              {points ? (
                <VocabularyWall data={points} />
              ) : (
                <div className="text-xs text-zinc-600">loading…</div>
              )}
            </div>
          </div>
        </Scene>

        {/* 03 — pipeline */}
        <Scene id="pipeline" step={3} title={s.pipeline.title}>
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="text-sm leading-relaxed text-zinc-300">
                {s.pipeline.text}
              </p>
              <div className="mt-4 space-y-3">
                {s.pipeline.questions.map((q) => (
                  <div
                    key={q.q}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4 text-sm"
                  >
                    <div className="font-medium text-zinc-50">{q.q}</div>
                    <div className="mt-1 text-zinc-400">{q.a}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-white/95 p-3">
              <Image
                src="/figures/fig2_pipeline.png"
                alt="Diagram of the analysis pipeline: emotion vocabularies feed twelve embedding models, whose vectors are analyzed for dimensionality, interpretability and clustering."
                width={1200}
                height={700}
                className="h-auto w-full rounded-xl"
              />
              <div className="px-2 pt-2 pb-1 text-xs text-zinc-600">
                {s.pipeline.caption}
              </div>
            </div>
          </div>
        </Scene>

        {/* 04 — dimensionality */}
        <Scene id="dimensionality" step={4} title={s.dimensionality.title}>
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-zinc-300">
            {s.dimensionality.text}
          </p>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            {stats ? (
              <DimensionalityChart rows={stats.dimensionality} />
            ) : (
              <div className="text-xs text-zinc-600">loading…</div>
            )}
          </div>
        </Scene>

        {/* 05 — valence morph (scroll-driven) */}
        <ScrollProgressScene step={5} title={s.morph.title}>
          {(p) => {
            const progress = reducedMotion ? 1 : Math.min(1, p / 0.72);
            const stage =
              progress < 0.33 ? 0 : progress < 0.8 ? 1 : 2;
            return (
              <div className="mt-2">
                {points ? (
                  <ValenceMorph3D data={points} progress={progress} height={480} />
                ) : (
                  <Placeholder3D height={480} />
                )}
                <p className="mt-4 min-h-[3.5rem] max-w-3xl text-sm leading-relaxed text-zinc-300">
                  {s.morph.stages[stage]}
                </p>
              </div>
            );
          }}
        </ScrollProgressScene>

        {/* 06 — arousal fails */}
        <Scene id="arousal" step={6} title={s.arousal.title}>
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-zinc-300">
            {s.arousal.text}
          </p>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            {stats ? (
              <R2BarChart rows={stats.interpretation} />
            ) : (
              <div className="text-xs text-zinc-600">loading…</div>
            )}
          </div>
          <p className="mt-4 max-w-3xl text-xs leading-relaxed text-zinc-500">
            {s.arousal.note}
          </p>
        </Scene>

        {/* 07 — gradients not clusters */}
        <Scene id="gradients" step={7} title={s.gradients.title}>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <p className="text-sm leading-relaxed text-zinc-300">
              {s.gradients.text}
            </p>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              {stats ? (
                <SilhouetteStrip rows={stats.clustering} />
              ) : (
                <div className="text-xs text-zinc-600">loading…</div>
              )}
            </div>
          </div>
        </Scene>

        {/* 08 — explore */}
        <Scene id="explore" step={8} title={s.explore.title}>
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-zinc-300">
            {s.explore.text}
          </p>
          {points ? (
            <EmotionMap2D data={points} />
          ) : (
            <div className="text-xs text-zinc-600">loading…</div>
          )}
        </Scene>

        {/* 09 — about */}
        <Scene id="about" step={9} title={s.about.title}>
          <p className="max-w-3xl text-sm leading-relaxed text-zinc-300">
            {s.about.text}
          </p>
          <p className="mt-4 max-w-3xl text-xs leading-relaxed text-zinc-500">
            {s.about.note}
          </p>
        </Scene>

        <div className="border-t border-zinc-800 py-16 text-center">
          <p className="text-sm text-zinc-400">{s.about.footer}</p>
        </div>
      </main>
    </div>
  );
}
