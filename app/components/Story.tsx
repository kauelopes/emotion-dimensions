"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { Scene } from "@/components/Scene";
import { ScrollProgressScene } from "@/components/ScrollProgressScene";
import { TheoryCards } from "@/components/TheoryCards";
import { VocabularyWall } from "@/components/VocabularyWall";
import { EmotionMap2D } from "@/components/EmotionMap2D";
import { PipelineStepper } from "@/components/PipelineStepper";
import { SemanticWalk } from "@/components/SemanticWalk";
import { DimensionalityChart } from "@/components/charts/DimensionalityChart";
import { GridRecoveryChart } from "@/components/charts/GridRecoveryChart";
import { CrossSpaceMatrix } from "@/components/charts/CrossSpaceMatrix";
import { GpaConsensus } from "@/components/charts/GpaConsensus";
import { CeilingChart, CalibrationStrip } from "@/components/charts/CeilingChart";
import { ProcrustesDemo } from "@/components/charts/ProcrustesDemo";
import { SilhouetteStrip } from "@/components/charts/SilhouetteStrip";
import {
  AxisMatchGrid,
  DimensionPairStrip,
  ModelsConsensusMap,
} from "@/components/charts/AnswerCharts";
import { withBase } from "@/lib/paths";
import type { CrossSpace, EmotionPoints, Neighbors, Stats } from "@/lib/types";
import { strings } from "@/content/strings";

const EmotionCloud3D = dynamic(() => import("@/components/EmotionCloud3D"), {
  ssr: false,
  loading: () => <Placeholder3D height={420} />,
});
const ValenceMorph3D = dynamic(() => import("@/components/ValenceMorph3D"), {
  ssr: false,
  loading: () => <Placeholder3D height={480} />,
});
const ModelMorph3D = dynamic(() => import("@/components/ModelMorph3D"), {
  ssr: false,
  loading: () => <Placeholder3D height={480} />,
});

const STABILITY_MODELS = [
  "word2vec",
  "bert-base-template",
  "bge-m3",
  "openai-3-large",
];

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

/** Keeps at most the nearby WebGL canvases alive. Browsers cap the number of
    concurrent WebGL contexts (and evict the oldest — the hero — silently),
    so each 3D scene mounts only when close to the viewport and remounts
    itself if its context is ever lost. */
function Lazy3D({
  height,
  children,
}: {
  height: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { margin: "600px 0px 600px 0px" });
  const [gen, setGen] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onLost = (e: Event) => {
      e.preventDefault();
      setTimeout(() => setGen((g) => g + 1), 400); // force a clean remount
    };
    // capture phase: webglcontextlost does not bubble
    el.addEventListener("webglcontextlost", onLost, true);
    return () => el.removeEventListener("webglcontextlost", onLost, true);
  }, []);

  return (
    <div ref={ref}>
      {inView ? (
        <div key={gen}>{children}</div>
      ) : (
        <Placeholder3D height={height} />
      )}
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
  const [neighbors, setNeighbors] = useState<Neighbors | null>(null);
  const [cross, setCross] = useState<CrossSpace | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(withBase("/data/emotion_points.json")).then((r) => r.json()),
      fetch(withBase("/data/stats.json")).then((r) => r.json()),
      fetch(withBase("/data/neighbors.json")).then((r) => r.json()),
      fetch(withBase("/data/cross_space.json")).then((r) => r.json()),
    ])
      .then(([p, s, n, c]) => {
        setPoints(p);
        setStats(s);
        setNeighbors(n);
        setCross(c);
      })
      .catch((e) => setError(String(e)));
  }, []);

  const s = strings;

  // stable identities: these feed useMemo'd BufferGeometries inside the
  // morph scenes, which re-render on every scroll tick
  const valenceStages = useMemo(
    () =>
      points
        ? [{ target: points.probe.predV, color: points.vad.map((r) => r[0]) }]
        : null,
    [points],
  );
  const arousalStages = useMemo(
    () =>
      points
        ? [
            { target: points.probe.predA, color: points.vad.map((r) => r[1]) },
            { target: points.probe.predAGrid, color: points.probe.gridA },
          ]
        : null,
    [points],
  );

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
            <Lazy3D height={420}>
              {points ? (
                <EmotionCloud3D data={points} height={420} />
              ) : (
                <Placeholder3D height={420} />
              )}
            </Lazy3D>
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
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <PipelineStepper />
              <div className="pt-4 text-xs text-zinc-600">
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
              <DimensionalityChart
                rows={[...stats.dimensionality,
                       stats.machineConsensus.dimensionality]}
              />
            ) : (
              <div className="text-xs text-zinc-600">loading…</div>
            )}
          </div>
        </Scene>

        {/* 05 — valence morph (scroll-driven, probe readout) */}
        <ScrollProgressScene step={5} title={s.morph.title}>
          {(p) => {
            const progress = reducedMotion ? 1 : Math.min(1, p / 0.72);
            const stage =
              progress < 0.33 ? 0 : progress < 0.8 ? 1 : 2;
            return (
              <div className="mt-2">
                <Lazy3D height={480}>
                  {points && valenceStages ? (
                    <ValenceMorph3D
                      data={points}
                      model={points.probe.model}
                      stages={valenceStages}
                      axisNeg={s.morph.axisNeg}
                      axisPos={s.morph.axisPos}
                      progress={progress}
                      height={480}
                    />
                  ) : (
                    <Placeholder3D height={480} />
                  )}
                </Lazy3D>
                <p className="mt-4 min-h-[3.5rem] max-w-3xl text-sm leading-relaxed text-zinc-300">
                  {s.morph.stages[stage]}
                </p>
              </div>
            );
          }}
        </ScrollProgressScene>

        {/* 06 — arousal: NRC collapse, then re-collapse onto the GRID ruler */}
        <ScrollProgressScene step={6} title={s.morphArousal.title}>
          {(p) => {
            const progress = reducedMotion ? 1 : Math.min(1, p / 0.85);
            const stage =
              progress < 0.2 ? 0 : progress < 0.5 ? 1 : progress < 0.85 ? 2 : 3;
            return (
              <div className="mt-2">
                <Lazy3D height={480}>
                  {points && arousalStages ? (
                    <ValenceMorph3D
                      data={points}
                      model={points.probe.model}
                      stages={arousalStages}
                      axisNeg={s.morphArousal.axisNeg}
                      axisPos={s.morphArousal.axisPos}
                      progress={progress}
                      height={480}
                    />
                  ) : (
                    <Placeholder3D height={480} />
                  )}
                </Lazy3D>
                <p className="mt-4 min-h-[4.5rem] max-w-3xl text-sm leading-relaxed text-zinc-300">
                  {s.morphArousal.stages[stage]}
                </p>
              </div>
            );
          }}
        </ScrollProgressScene>

        {/* 07 — main experiment: GRID 4D recovery */}
        <Scene id="grid-recovery" step={7} title={s.arousal.title}>
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-zinc-300">
            {s.arousal.text}
          </p>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            {stats ? (
              <GridRecoveryChart
                rows={[...stats.gridRecovery,
                       stats.machineConsensus.gridRecovery]}
              />
            ) : (
              <div className="text-xs text-zinc-600">loading…</div>
            )}
          </div>
          <p className="mt-4 max-w-3xl text-xs leading-relaxed text-zinc-500">
            {s.arousal.note}
          </p>
        </Scene>

        {/* 08 — stability across models */}
        <ScrollProgressScene step={8} title={s.stability.title}>
          {(p) => {
            const progress = reducedMotion ? 1 : Math.min(1, p / 0.85);
            const stage = Math.min(
              s.stability.stages.length - 1,
              Math.floor(progress * s.stability.stages.length),
            );
            return (
              <div className="mt-2">
                <Lazy3D height={480}>
                  {points ? (
                    <ModelMorph3D
                      data={points}
                      models={STABILITY_MODELS}
                      progress={progress}
                      height={480}
                    />
                  ) : (
                    <Placeholder3D height={480} />
                  )}
                </Lazy3D>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <p className="min-h-[3.5rem] max-w-3xl text-sm leading-relaxed text-zinc-300">
                    {s.stability.stages[stage]}
                  </p>
                  <span className="shrink-0 font-mono text-xs text-zinc-600">
                    {points?.models[STABILITY_MODELS[Math.min(3, Math.round(progress * 3))]]?.pretty}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-600">{s.stability.caption}</p>
              </div>
            );
          }}
        </ScrollProgressScene>

        {/* 09 — E7: the space of spaces (procrustes demo + matrix + GPA consensus) */}
        <Scene id="cross-space" step={9} title={s.crossSpace.title}>
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <h3
                className="mb-2 text-lg"
                style={{ fontFamily: "var(--font-lora, serif)", color: "var(--accent)" }}
              >
                {s.procrustes.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-300">
                {s.procrustes.text}
              </p>
            </div>
            <div>
              {points ? (
                <ProcrustesDemo points={points} />
              ) : (
                <div className="text-xs text-zinc-600">loading…</div>
              )}
            </div>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <p className="text-sm leading-relaxed text-zinc-300">
              {s.crossSpace.text}
            </p>
            <div>
              {cross ? (
                <CrossSpaceMatrix cross={cross} />
              ) : (
                <div className="text-xs text-zinc-600">loading…</div>
              )}
            </div>
          </div>
          <div className="mt-10">
            <h3
              className="text-lg"
              style={{ fontFamily: "var(--font-lora, serif)", color: "var(--accent)" }}
            >
              {s.crossSpace.consensusTitle}
            </h3>
            <p className="mt-2 mb-4 max-w-3xl text-sm leading-relaxed text-zinc-300">
              {s.crossSpace.consensusText}
            </p>
            {cross && points ? (
              <GpaConsensus cross={cross} points={points} />
            ) : (
              <div className="text-xs text-zinc-600">loading…</div>
            )}
          </div>
        </Scene>

        {/* 10 — E7: distance to the human ceiling */}
        <Scene id="ceiling" step={10} title={s.ceiling.title}>
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-zinc-300">
            {s.ceiling.text}
          </p>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            {cross ? (
              <CeilingChart cross={cross} />
            ) : (
              <div className="text-xs text-zinc-600">loading…</div>
            )}
          </div>
          <p className="mt-6 mb-4 max-w-3xl text-sm leading-relaxed text-zinc-300">
            {s.ceiling.calibrationText}
          </p>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            {cross ? (
              <CalibrationStrip cross={cross} />
            ) : (
              <div className="text-xs text-zinc-600">loading…</div>
            )}
          </div>
        </Scene>

        {/* 11 — gradients not clusters + semantic walk */}
        <Scene id="gradients" step={11} title={s.gradients.title}>
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
          <div className="mt-8">
            <h3 className="text-lg" style={{ fontFamily: "var(--font-lora, serif)", color: "var(--accent)" }}>
              {s.walk.title}
            </h3>
            <p className="mt-2 mb-4 max-w-3xl text-sm leading-relaxed text-zinc-300">
              {s.walk.text}
            </p>
            {points && neighbors ? (
              <SemanticWalk data={points} neighbors={neighbors} />
            ) : (
              <div className="text-xs text-zinc-600">loading…</div>
            )}
          </div>
        </Scene>

        {/* 12 — explore */}
        <Scene id="explore" step={12} title={s.explore.title}>
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-zinc-300">
            {s.explore.text}
          </p>
          {points ? (
            <EmotionMap2D data={points} />
          ) : (
            <div className="text-xs text-zinc-600">loading…</div>
          )}
        </Scene>

        {/* 13 — the three questions, answered */}
        <Scene id="answers" step={13} title={s.answers.title}>
          <p className="mb-10 max-w-3xl text-sm leading-relaxed text-zinc-300">
            {s.answers.intro}
          </p>
          <div className="space-y-12">
            {/* Q1 — dimensionality */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
                {s.answers.q1.q}
              </div>
              <h3
                className="mt-2 text-2xl"
                style={{ fontFamily: "var(--font-lora, serif)", color: "var(--accent)" }}
              >
                {s.answers.q1.verdict}
              </h3>
              <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
                <p className="text-sm leading-relaxed text-zinc-300">
                  {s.answers.q1.text}
                </p>
                <div>
                  {stats ? (
                    <DimensionPairStrip rows={stats.neutralControl} />
                  ) : (
                    <div className="text-xs text-zinc-600">loading…</div>
                  )}
                </div>
              </div>
            </div>
            {/* Q2 — meaning of the axes */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
                {s.answers.q2.q}
              </div>
              <h3
                className="mt-2 text-2xl"
                style={{ fontFamily: "var(--font-lora, serif)", color: "var(--accent)" }}
              >
                {s.answers.q2.verdict}
              </h3>
              <div className="mt-4 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
                <p className="text-sm leading-relaxed text-zinc-300">
                  {s.answers.q2.text}
                </p>
                <div>
                  {stats ? (
                    <AxisMatchGrid
                      rows={stats.consensusAxes}
                      modelsOnly={stats.consensusAxesModelsOnly}
                    />
                  ) : (
                    <div className="text-xs text-zinc-600">loading…</div>
                  )}
                </div>
              </div>
              <p className="mt-8 mb-4 max-w-3xl text-sm leading-relaxed text-zinc-300">
                {s.answers.q2.mapLead}
              </p>
              {stats && points ? (
                <ModelsConsensusMap
                  rows={stats.consensusModelsOnly}
                  points={points}
                />
              ) : (
                <div className="text-xs text-zinc-600">loading…</div>
              )}
            </div>
            {/* Q3 — clusters vs gradients */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
                {s.answers.q3.q}
              </div>
              <h3
                className="mt-2 text-2xl"
                style={{ fontFamily: "var(--font-lora, serif)", color: "var(--accent)" }}
              >
                {s.answers.q3.verdict}
              </h3>
              <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
                <p className="text-sm leading-relaxed text-zinc-300">
                  {s.answers.q3.text}
                </p>
                <div>
                  {stats ? (
                    <SilhouetteStrip rows={stats.clustering} />
                  ) : (
                    <div className="text-xs text-zinc-600">loading…</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Scene>

        {/* 14 — about */}
        <Scene id="about" step={14} title={s.about.title}>
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
