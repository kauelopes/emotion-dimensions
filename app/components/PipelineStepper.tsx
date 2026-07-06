"use client";

import { strings } from "@/content/strings";

export function PipelineStepper() {
  const steps = strings.pipeline.steps;
  return (
    <div className="flex flex-col gap-0">
      {steps.map((s, i) => (
        <div key={s.n} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs"
              style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
            >
              {s.n}
            </div>
            {i < steps.length - 1 && (
              <div className="w-px flex-1 bg-zinc-800" style={{ minHeight: 24 }} />
            )}
          </div>
          <div className={i < steps.length - 1 ? "pb-6" : ""}>
            <div className="text-sm font-semibold text-zinc-50">{s.title}</div>
            <div className="mt-0.5 text-sm text-zinc-400">{s.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
