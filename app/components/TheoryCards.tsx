"use client";

import { strings } from "@/content/strings";

// Small inline glyphs: axes (VAD), 4-point diamond (GRID), gradient blob (C&K).
function GlyphAxes() {
  return (
    <svg viewBox="0 0 80 60" className="h-14 w-full" aria-hidden>
      <line x1="10" y1="50" x2="70" y2="50" stroke="var(--accent)" strokeWidth="1.5" />
      <line x1="14" y1="56" x2="14" y2="8" stroke="var(--accent)" strokeWidth="1.5" />
      <line x1="14" y1="50" x2="58" y2="16" stroke="var(--accent)" strokeWidth="1" opacity="0.5" strokeDasharray="3 3" />
      <circle cx="44" cy="30" r="3" fill="var(--pos)" />
    </svg>
  );
}

function GlyphGrid() {
  return (
    <svg viewBox="0 0 80 60" className="h-14 w-full" aria-hidden>
      <polygon
        points="40,8 66,30 40,52 14,30"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
      />
      {[
        [40, 8],
        [66, 30],
        [40, 52],
        [14, 30],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="var(--pos)" />
      ))}
    </svg>
  );
}

function GlyphGradient() {
  return (
    <svg viewBox="0 0 80 60" className="h-14 w-full" aria-hidden>
      <defs>
        <linearGradient id="ckgrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--neg)" />
          <stop offset="50%" stopColor="var(--mid)" />
          <stop offset="100%" stopColor="var(--pos)" />
        </linearGradient>
      </defs>
      <ellipse cx="40" cy="30" rx="30" ry="18" fill="url(#ckgrad)" opacity="0.8" />
      {[
        [22, 26],
        [34, 38],
        [46, 22],
        [58, 34],
        [40, 30],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.8" fill="#09090b" opacity="0.7" />
      ))}
    </svg>
  );
}

const GLYPHS = [GlyphAxes, GlyphGrid, GlyphGradient];

export function TheoryCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {strings.theories.cards.map((c, i) => {
        const Glyph = GLYPHS[i];
        return (
          <div
            key={c.name}
            className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-5"
          >
            <Glyph />
            <div className="mt-3 text-sm font-semibold text-zinc-50">
              {c.name}
            </div>
            <div className="mt-1 font-mono text-xs tracking-widest text-zinc-500 uppercase">
              {c.dims}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              {c.text}
            </p>
            <div className="mt-3 text-xs text-zinc-600">{c.source}</div>
          </div>
        );
      })}
    </div>
  );
}
