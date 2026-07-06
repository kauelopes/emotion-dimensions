"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export function Scene(props: {
  id: string;
  step?: number;
  title: string;
  children: React.ReactNode;
}) {
  const { id, step, title, children } = props;
  const ref = useRef<HTMLDivElement | null>(null);

  const inView = useInView(ref, { amount: 0.35 });

  return (
    <section
      id={id}
      ref={ref}
      className="relative flex min-h-[80vh] items-center py-16"
    >
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          animate={
            inView
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0.15, y: 0, filter: "blur(0px)" }
          }
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
        >
          <div className="mb-5">
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
          </div>
          {children}
        </motion.div>
      </div>
    </section>
  );
}
