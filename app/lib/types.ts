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
  /** Out-of-fold ridge-probe readings (minmax [0,1]), aligned with terms.
      predA = arousal vs NRC-VAD; predAGrid = arousal vs GRID; gridA = the
      human GRID arousal rating itself (for coloring). */
  probe: {
    model: string;
    predV: (number | null)[];
    predA: (number | null)[];
    predAGrid: (number | null)[];
    gridA: (number | null)[];
  };
}

export interface Neighbors {
  model: string;
  /** Cosine distance matrix, index-aligned with EmotionPoints.terms. */
  distance: number[][];
}

export interface GridRecoveryRow {
  model: string;
  pretty: string;
  family: string;
  r2Valence: number;
  r2Power: number;
  r2Arousal: number;
  r2Novelty: number;
  rsaSpearman: number;
  procrustes: number;
}

export interface SpaceInfo {
  id: string;
  pretty: string;
  family: string;
}

export interface CrossSpace {
  spaces: SpaceInfo[];
  pairs: {
    a: string;
    b: string;
    rsa: number;
    proc: number;
    cka: number;
    p: number;
  }[];
  residuals: Record<string, number>;
  consensus: { t: string; x: number; y: number; disp: number }[];
  ceiling: {
    model: string;
    pretty: string;
    ratioGrid: number;
    loGrid: number;
    hiGrid: number;
    ratioNrc: number;
    loNrc: number;
    hiNrc: number;
  }[];
  calibration: {
    emotion: number[];
    modelNorm: number[];
    neutral: number[];
    humanHuman: number;
    chance: number;
  };
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

export interface NeutralControlRow {
  model: string;
  pretty: string;
  family: string;
  twonnEmotion: number;
  twonnNeutral: number;
}

export type GridDim = "valence" | "power" | "arousal" | "novelty";

export interface ConsensusAxisRow {
  axis: string;
  /** Pearson r between this GPA consensus axis and each GRID dimension. */
  r: Record<GridDim, number>;
}

export interface ConsensusPoint {
  t: string;
  /** GPA consensus coordinates: x = axis c1, y = axis c2. */
  x: number;
  y: number;
  /** Mean per-term distance to consensus across spaces (disagreement). */
  disp: number;
}

export interface Stats {
  /** The models-only GPA consensus as a first-class 4-feature "model". */
  machineConsensus: {
    dimensionality: DimensionalityRow;
    gridRecovery: GridRecoveryRow;
  };
  neutralControl: NeutralControlRow[];
  consensusAxes: ConsensusAxisRow[];
  consensusAxesModelsOnly: ConsensusAxisRow[];
  consensusModelsOnly: ConsensusPoint[];
  dimensionality: DimensionalityRow[];
  interpretation: InterpretationRow[];
  clustering: ClusteringRow[];
  gridRecovery: GridRecoveryRow[];
}

export type VadDim = "v" | "a" | "d";
export const VAD_INDEX: Record<VadDim, number> = { v: 0, a: 1, d: 2 };
export const VAD_LABEL: Record<VadDim, string> = {
  v: "valence",
  a: "arousal",
  d: "dominance",
};
