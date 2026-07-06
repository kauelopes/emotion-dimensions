"use client";

import { useState } from "react";
import { divergingCss } from "@/lib/colors";
import type { EmotionPoints } from "@/lib/types";
import { strings } from "@/content/strings";

export function VocabularyWall({ data }: { data: EmotionPoints }) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {data.terms.map((t, i) => {
          const [v, a, d] = data.vad[i];
          const active = hover === i;
          return (
            <span
              key={t}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="cursor-default rounded-md border px-2 py-1 font-mono text-xs transition-colors"
              style={{
                borderColor: active ? divergingCss(v) : "#27272a",
                color: active ? "#fafafa" : "#a1a1aa",
                background: active ? "#18181b" : "transparent",
                boxShadow: `inset 0 -2px 0 ${divergingCss(v)}`,
              }}
              title={`valence ${v} · arousal ${a} · dominance ${d}`}
            >
              {t}
            </span>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
        <span>{strings.vocabulary.hint}</span>
        <span className="font-mono tabular-nums">
          {hover !== null
            ? `${data.terms[hover]} — V ${data.vad[hover][0]} · A ${data.vad[hover][1]} · D ${data.vad[hover][2]}`
            : `n = ${data.terms.length}`}
        </span>
      </div>
    </div>
  );
}
