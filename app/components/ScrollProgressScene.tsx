"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

export function ScrollProgressScene(props: {
  children: (progress: number) => React.ReactNode;
  title: string;
  description?: string;
  step?: number;
}) {
  const { children, title, description, step } = props;
  const ref = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "end 0.05"],
  });

  const [p, setP] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setP(Math.max(0, Math.min(1, Number(latest))));
  });

  return (
    <section ref={ref} className="relative min-h-[280vh] py-16">
      <div className="sticky top-20">
        <motion.div
          className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ amount: 0.25 }}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              {step !== undefined && (
                <span className="mb-2 block font-mono text-xs tracking-widest text-zinc-600">
                  {String(step).padStart(2, "0")}
                </span>
              )}
              <h2
                className="text-2xl tracking-tight"
                style={{
                  fontFamily: "var(--font-lora, serif)",
                  color: "var(--accent)",
                }}
              >
                {title}
              </h2>
              {description ? (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                  {description}
                </p>
              ) : null}
            </div>

            <div className="shrink-0 text-xs tabular-nums text-zinc-500">
              {(p * 100).toFixed(0)}%
            </div>
          </div>

          {children(p)}
        </motion.div>
      </div>
    </section>
  );
}
