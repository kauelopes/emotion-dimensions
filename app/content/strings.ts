// All site prose lives here so editing copy never touches components.

export const strings = {
  header: {
    title: "The Shape of Emotion",
    kicker: "a research story",
  },
  hero: {
    label: "EMBEDDINGS × PSYCHOLOGY",
    title: "How many dimensions does emotion have?",
    subtitle:
      "Psychology has argued about it for a century: two, four, or twenty-seven? We asked a different witness — the geometry that language models learn from billions of sentences. Drag the cloud. Each point is an emotion word; color is how pleasant humans rate it.",
    scrollHint: "scroll to explore",
    cloudCaption:
      "59 canonical emotion words, embedded by BGE-M3 and projected to their first three principal components. Orange = negative valence, blue = positive.",
  },
  theories: {
    step: "01",
    title: "Three theories, three geometries",
    intro:
      "Emotion research offers competing answers to what the space of feelings looks like. Each theory predicts a different geometry — and that makes the question testable.",
    cards: [
      {
        name: "Core affect (VAD)",
        dims: "2–3 dimensions",
        source: "Russell 1980; Mehrabian",
        text: "Every feeling is a point on two or three continuous axes: valence (pleasant–unpleasant), arousal (calm–activated), and sometimes dominance (in control–controlled).",
      },
      {
        name: "GRID",
        dims: "4 dimensions",
        source: "Fontaine, Scherer et al. 2007",
        text: "Cross-cultural ratings of emotion words recover four factors: valence, power, arousal — and a fourth, novelty (surprise-like unpredictability).",
      },
      {
        name: "Semantic space",
        dims: "~27 categories, gradients",
        source: "Cowen & Keltner 2017",
        text: "Self-reported experience is far richer: dozens of distinct categories like awe, nostalgia and craving, connected by smooth gradients rather than hard borders.",
      },
    ],
  },
  vocabulary: {
    step: "02",
    title: "The witnesses: 59 canonical emotion words",
    text: "We took the union of the emotion vocabularies psychology itself considers canonical — Scherer's GALC and GEW, the GRID study, Cowen & Keltner's 27 categories, Ekman's basic six, Plutchik's wheel. The union is 59 English words, from admiration to trust. Each word also carries decades of human judgment: normative ratings of its valence, arousal and dominance (NRC-VAD lexicon). Hover a word to see them.",
    hint: "color = human valence rating · hover for V/A/D",
  },
  pipeline: {
    step: "03",
    title: "The experiment",
    text: "We embedded every word with twelve pretrained models spanning four generations — static vectors (word2vec, GloVe, fastText), contextual encoders (BERT, RoBERTa), sentence encoders (MiniLM, mpnet, BGE-M3, Qwen3), and a commercial API (OpenAI text-embedding-3-large). That gives twelve point clouds of the same 59 words, in spaces of 300 to 3072 nominal dimensions. Then we asked each cloud three questions:",
    questions: [
      {
        q: "How many dimensions does it really use?",
        a: "PCA with Horn's parallel analysis, plus TwoNN and MLE intrinsic-dimension estimators.",
      },
      {
        q: "Do its axes mean anything?",
        a: "Can ridge regression recover human valence, arousal and dominance ratings from the coordinates?",
      },
      {
        q: "Is it clusters or gradients?",
        a: "Silhouette scores and clustering structure — discrete islands of emotion, or a continuous fabric?",
      },
    ],
    caption: "The full pipeline, from word lists to answers.",
  },
  dimensionality: {
    step: "04",
    title: "The answer is ten-ish — not two, not twenty-seven",
    text: "Across all twelve models, three independent estimators agree: the emotion subspace has an intrinsic dimensionality of roughly 10–15. That is far below the hundreds of nominal dimensions the models could use — the emotion lexicon occupies a thin slice of embedding space. But it is also clearly above the 2–4 dimensions of classical psychometric theories. The geometry that language learns is richer than core affect, leaner than a category per emotion.",
    legend: {
      band24: "psychometric theories (2–4D)",
      band1015: "what embeddings show (~10–15D)",
      pa: "parallel analysis",
      twonn: "TwoNN",
      mle: "MLE",
    },
  },
  morph: {
    step: "05",
    title: "One axis dominates: valence",
    stages: [
      "This is the emotion cloud again — every word from every corner of the vocabulary, floating in its first three principal components.",
      "Now watch what happens when we collapse each word onto a single line: its human-rated valence, from most negative to most positive.",
      "The cloud barely resists. Pleasantness is the principal axis of the emotion lexicon — the first component of nearly every model aligns with it, and a linear probe recovers human valence ratings with R² up to 0.85.",
    ],
    axisNeg: "negative",
    axisPos: "positive",
  },
  arousal: {
    step: "06",
    title: "…but arousal is missing",
    text: "Here is the surprise. Valence is written all over embedding space — but arousal, the second axis of every classical theory, is essentially unrecoverable. Linear probes score near zero (often below zero: worse than predicting the mean) in every model, replicating a puzzle first noted by Hollis & Westbury (2016). Dominance sits in between. Whatever the ~10–15 dimensions encode, the calm-to-activated axis is not linearly among them: language use apparently tells us how good a feeling is, but not how loud.",
    legend: { v: "valence", d: "dominance", a: "arousal" },
    zeroNote: "0 = no better than guessing the mean",
  },
  gradients: {
    step: "07",
    title: "Gradients, not islands",
    text: "If emotions were discrete categories, the cloud would break into tight clusters. It doesn't. Silhouette scores hover around 0.1 in every model — barely more structure than a continuous smear. Words shade into one another: anger into irritation into annoyance. Of the three theories, this is the signature of Cowen & Keltner's semantic space: a smooth, low-dimensional fabric organized by gradients, with valence as its strongest thread.",
    refLine: "well-separated clusters (≥ 0.5)",
    axisLabel: "silhouette score at best k",
  },
  explore: {
    step: "08",
    title: "Explore the map yourself",
    text: "Every model, every word, every rating. Pick a model, color by valence, arousal or dominance, and hover the points. Notice how valence paints a clean left-to-right gradient in most models — and how the same coloring by arousal looks like noise.",
    controls: { model: "model", colorBy: "color by" },
    legend: { lo: "low", hi: "high" },
  },
  about: {
    step: "09",
    title: "What it means",
    text: "Pretrained embeddings — trained only to predict words in context — converge on a shared geometry of emotion: about 10–15 dimensions, dominated by valence, devoid of a linear arousal axis, and organized as gradients rather than categories. Distributional semantics alone recovers much of the affective structure psychologists measure with human ratings, but not all of it — and where it fails is itself informative.",
    note: "This site accompanies ongoing PhD research on the intrinsic dimensionality of the emotion lexicon in pretrained embedding spaces. Figures and statistics are computed from the research pipeline; the interactive views use the same data as the paper.",
    footer: "Kauê Moraes · PhD research · 2026",
  },
} as const;
