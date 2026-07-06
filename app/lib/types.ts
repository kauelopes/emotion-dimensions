// Schemas of the JSONs produced by src/export_site_data.py (research repo).

export type Vec3 = [number, number, number];

export interface ModelPoints {
  pretty: string;
  family: "static" | "contextual" | "sentence" | "API" | "other";
  nominalDim: number;
  /** PC1-3 variance ratios. */
  explained: number[];
  /** Index-aligned with `terms`; null where the model lacks the term. */
  xyz: (Vec3 | null)[];
  missing: number[];
}

export interface EmotionPoints {
  terms: string[];
  /** [valence, arousal, dominance] in [0,1], index-aligned with terms. */
  vad: Vec3[];
  models: Record<string, ModelPoints>;
  /** Out-of-fold ridge-probe readings (minmax [0,1]), aligned with terms. */
  probe: {
    model: string;
    predV: (number | null)[];
    predA: (number | null)[];
  };
}

export interface Neighbors {
  model: string;
  /** Cosine distance matrix, index-aligned with EmotionPoints.terms. */
  distance: number[][];
}

export interface DimensionalityRow {
  model: string;
  pretty: string;
  family: string;
  nTerms: number;
  nominalDim: number;
  parallelAnalysis: number;
  pca80: number;
  pca90: number;
  twonn: number;
  mle: number;
}

export interface InterpretationRow {
  model: string;
  pretty: string;
  family: string;
  r2Valence: number;
  r2Arousal: number;
  r2Dominance: number;
  rsaSpearman: number;
  bestPcValence: number;
  bestPcValenceR: number;
}

export interface ClusteringRow {
  model: string;
  pretty: string;
  family: string;
  bestK: number;
  silhouetteBest: number;
  silhouetteK2: number;
  ari: number;
}

export interface Stats {
  dimensionality: DimensionalityRow[];
  interpretation: InterpretationRow[];
  clustering: ClusteringRow[];
}

export type VadDim = "v" | "a" | "d";
export const VAD_INDEX: Record<VadDim, number> = { v: 0, a: 1, d: 2 };
export const VAD_LABEL: Record<VadDim, string> = {
  v: "valence",
  a: "arousal",
  d: "dominance",
};
