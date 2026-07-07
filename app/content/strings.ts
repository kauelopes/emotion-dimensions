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
      "98 canonical emotion words, embedded by BGE-M3 and projected to their first three principal components. Orange = negative valence, blue = positive.",
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
    title: "The witnesses: 102 canonical emotion words",
    text: "We took the union of the emotion vocabularies psychology itself considers canonical — Scherer's GALC and GEW, the 80 terms of the GRID study, Cowen & Keltner's 27 categories, Ekman's basic six, Plutchik's wheel. The union is 102 English words, from admiration to worry. Each word also carries decades of human judgment: normative ratings of valence, arousal and dominance (NRC-VAD lexicon, shown below) and, for the GRID terms, ratings on four dimensions from 34 cultures. Hover a word to see them.",
    hint: "color = human valence rating · hover for V/A/D",
  },
  pipeline: {
    step: "03",
    title: "The experiment",
    text: "We embedded every word with twelve pretrained models spanning four generations — static vectors (word2vec, GloVe, fastText), contextual encoders (BERT, RoBERTa), sentence encoders (MiniLM, mpnet, BGE-M3, Qwen3), and a commercial API (OpenAI text-embedding-3-large). That gives twelve point clouds of the same 102 words, in spaces of 300 to 3072 nominal dimensions. Then we asked each cloud three questions:",
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
    steps: [
      {
        n: "1",
        title: "102 emotion words",
        text: "union of six canonical vocabularies from psychology",
      },
      {
        n: "2",
        title: "12 embedding models",
        text: "static, contextual, sentence encoders and a commercial API",
      },
      {
        n: "3",
        title: "12 point clouds",
        text: "the same words in spaces of 300–3072 nominal dimensions",
      },
      {
        n: "4",
        title: "3 questions",
        text: "dimensionality · meaning of the axes · clusters vs gradients",
      },
    ],
    caption: "The full pipeline, from word lists to answers.",
  },
  dimensionality: {
    step: "04",
    title: "The answer is ten-ish — not two, not twenty-seven",
    text: "Across all twelve models, three independent estimators agree: the emotion subspace has an intrinsic dimensionality of roughly 10–15. That is far below the hundreds of nominal dimensions the models could use — the emotion lexicon occupies a thin slice of embedding space. But it is also clearly above the 2–4 dimensions of classical psychometric theories. The geometry that language learns is richer than core affect, leaner than a category per emotion. The last row is the machine consensus — the part all twelve models agree on, introduced later in the story: distilled to 4 dimensions by construction, it effectively uses about 3 of them, right back at psychometric scale.",
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
      "This is the emotion cloud again (BERT with a template sentence this time) — each word colored by its human-rated valence, floating in its first three principal components.",
      "Now we hand the embedding to a simple linear probe and ask it to place every word on a single line: how pleasant is this feeling? The probe is scored out-of-sample — it never sees the ratings of the words it places.",
      "Look at the colors: they arrive sorted. The probe's line-up agrees with human valence ratings almost perfectly (R² = 0.85 in this model, up to 0.88 across the twelve). Pleasantness is written into the geometry.",
    ],
    axisNeg: "unpleasant",
    axisPos: "pleasant",
  },
  morphArousal: {
    step: "06",
    title: "Arousal: a tale of two instruments",
    stages: [
      "Same cloud, same model. Now the second classical axis: arousal, from calm to activated. Psychology has more than one way of measuring it — and that turns out to matter.",
      "First instrument: NRC-VAD, crowdsourced ratings of words in isolation. The probe manages only a middling line-up — R² = 0.39 on these 77 terms, far below what it just did for valence. Readouts like this once looked like \"embeddings don't know arousal\".",
      "Now watch: same words, same model, same probe — we only switch the instrument to the GRID's arousal, derived from how 34 cultures describe emotional episodes. The line tightens sharply (R² = 0.70). The colors follow the new ruler.",
      "So how much arousal the geometry carries depends on which human measurement you ask the model to match. The GRID's semantically grounded arousal is clearly legible in language; crowdsourced subjective ratings much less so — and a third instrument (Warriner) is barely legible at all, even though its ratings are reliable enough to be. The instrument, not noise, is the difference.",
    ],
    axisNeg: "calm",
    axisPos: "activated",
  },
  stability: {
    step: "08",
    title: "Twelve witnesses, one geometry",
    stages: [
      "Does this structure depend on which model we ask? Here is the cloud drawn by word2vec — a 2013-era model trained by counting word co-occurrences.",
      "Morph it into BERT, a 2018 contextual transformer… the words shuffle locally, but joy stays far from hate, and the valence gradient survives.",
      "…into BGE-M3, a modern sentence encoder… same overall shape.",
      "…and into OpenAI's commercial embedding API. Four architectures, four training recipes, one decade apart — and one shared geometry of emotion. That agreement is what makes the finding trustworthy.",
    ],
    caption: "drag to rotate · positions interpolate between models as you scroll",
  },
  procrustes: {
    title: "What \"Procrustes fit\" means",
    text: "A warm-up with made-up data. Two sources draw maps of the same emotion words. Here map A (filled dots) is secretly the same map as B (rings) — just rotated 135°, shrunk, and lightly perturbed. Procrustes analysis is the fairest possible overlay: it may rotate, rescale and shift one whole map onto the other, but it can never move a word on its own. Watch it undo the disguise: every dot clicks into its ring, and the score — fit = 1 − disparity — climbs to nearly 1. Whatever refuses to overlap after the best rigid motion (here, only the little noise we injected) is the disparity: genuine structural disagreement. This is the metric in the upper triangle of the real matrix below, computed between every pair of the fourteen spaces.",
    fitLabel: "fit = 1 − disparity",
    replay: "↻ replay",
    caption: "connecting lines = residual disagreement after the optimal alignment",
    mapA: "map A",
    mapB: "map B",
  },
  crossSpace: {
    step: "09",
    title: "The space of spaces",
    text: "Formally now: treat each source — the twelve models plus the two human instruments, NRC-VAD and the GRID — as a map of the same 77 emotion words, and compare every pair with rotation-invariant metrics. 82 of 91 pairs match far beyond chance; the nine that fail all involve RoBERTa without a template, a known degenerate space that works as a built-in negative control. The crucial rows are the last ones: the human norms sit inside the models' shared structure, the GRID more deeply than NRC-VAD — and between the models and the norms sits the machine consensus (dashed separator), the models' merged map, which agrees with the GRID more strongly (RSA 0.55) than any individual model does.",
    matrixHint: "lower triangle = RSA · upper = Procrustes fit · hover any cell",
    consensusTitle: "The map they agree on",
    consensusText: "Aligning all fourteen spaces at once (Generalized Procrustes) and averaging yields the consensus: a single map containing only what every source agrees on. It is not a blur — a clean valence gradient runs through it. Larger points are words the sources disagree about (hope, joy, boredom); the most stable words are the heavily lexicalized negatives (guilt, grief, despair). And measuring each space's distance to this consensus: OpenAI's embedding is the closest of all — and the GRID sits closer than half of the models (it still beats a third of them when it is held out of the consensus entirely). The geometry embeddings share is, to a good approximation, the geometry of the GRID — the machine consensus, built from the models alone, is organized axis for axis by the GRID's four dimensions (the final section shows it in full).",
    consensusHint: "color = human valence · point size = disagreement between spaces",
  },
  ceiling: {
    step: "10",
    title: "How close to human?",
    text: "Independent human instruments measuring the same words agree with each other at RSA ≈ 0.6 — that is the realistic reference level, not 1.0. Normalizing every model by that level (bootstrap over terms, 95% CIs): the best individual models reach 71–74% of human-level agreement with the GRID, and in all twelve the gap is significantly above zero. But look at the top row: the machine consensus — the twelve witnesses merged — reaches 89%, and its confidence interval crosses the human line. What no single model achieves, their agreement nearly does; the remaining gap is carried by model-specific noise, not by the shared geometry.",
    calibrationText: "And the agreement is not generic semantics: recompute the same model-to-model matrix on frequency-matched neutral words and it drops to half (median RSA 0.22 vs 0.43). Emotion is an unusually consensual domain of language.",
    legend: {
      grid: "vs GRID",
      nrc: "vs NRC-VAD",
      chance: "chance",
      ceiling: "human-human ceiling",
    },
    strips: {
      neutral: "neutral words (model×model)",
      emotion: "emotion words (model×model)",
      modelNorm: "model × human norm",
    },
  },
  walk: {
    title: "Take a semantic walk",
    text: "Pick any two emotions and walk from one to the other, always stepping to a nearby word that gets you closer. The path never has to jump: every leg is a short hop to a close neighbor. That is what \"gradients, not islands\" means — the fabric is continuous.",
    hint: "click a word to set the start, another to set the destination",
    pathLabel: "path",
    stepsLabel: "steps",
  },
  arousal: {
    step: "07",
    title: "The main test: all four GRID dimensions recover",
    text: "The instrument lesson generalizes. Against the GRID's four-dimensional structure — the study's main experiment — all four dimensions recover in every model: valence (R² 0.72–0.91), power (0.61–0.73), arousal (0.36–0.70) and novelty (0.41–0.70). Novelty is the critical test: power closely mirrors the dominance axis VAD already had, but novelty is the dimension the classic scheme genuinely lacks — and it, too, is legible in the geometry. The strongest readouts come from BERT with a template and from OpenAI's embedding. The last row is the machine consensus: just four numbers per word, and it recovers the four dimensions about as well as full models with hundreds of coordinates.",
    legend: {
      v: "valence",
      p: "power",
      a: "arousal",
      n: "novelty",
    },
    zeroNote: "0 = no better than guessing the mean",
    note: "Against NRC-VAD's three dimensions — valence 0.66–0.88, dominance 0.42–0.67, arousal 0.19–0.50 — arousal is again the weakest and the most instrument-dependent axis: the very same words score around 0.50 against the GRID's arousal (previous scene, now across all models).",
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
    text: "Every model, every word, every rating. Pick a model, color by valence, arousal or dominance, and hover the points. Notice how valence paints a clean left-to-right gradient in most models — and how the same coloring by arousal is far blurrier. The last entry in the picker is the machine consensus: the same map with everything model-specific averaged away.",
    controls: { model: "model", colorBy: "color by" },
    legend: { lo: "low", hi: "high" },
  },
  answers: {
    step: "13",
    title: "The three questions, answered",
    intro:
      "The experiment opened with three questions. Here is each one again, with its answer and the evidence behind it.",
    q1: {
      q: "How many dimensions does it really use?",
      verdict: "About 10–15.",
      text: "In every one of the twelve models the intrinsic-dimension estimators land in the same band: roughly 10–15 effective dimensions, an order of magnitude below the 300–3072 coordinates the models could use, yet clearly above the 2–4 of classical psychometrics. And the compression is not a frequency artifact: hand the very same models a set of frequency-matched neutral words and they spread over 16–32 dimensions. The emotion lexicon is packed tighter than ordinary vocabulary in all twelve — every orange dot sits left of its gray partner.",
      legendEmotion: "emotion words",
      legendNeutral: "neutral words, frequency-matched",
      bandTheories: "psychometric theories (2–4D)",
    },
    q2: {
      q: "Do its axes mean anything?",
      verdict: "Yes — they are the GRID's four axes.",
      text: "Align all fourteen spaces and average them into a consensus: its four axes match the GRID's four dimensions one to one — valence r = +0.79, power +0.82, novelty −0.73, arousal −0.64 — each axis claiming a different dimension as its best partner (the ring in each row). And this is not the GRID grading its own homework: rebuild the consensus from the twelve models alone, with no human norm in the mix — the machine consensus — and the one-to-one match survives almost unchanged (+0.74 / +0.77 / −0.68 / −0.56 — hover any cell). Arousal is the weakest pairing, and the one whose strength depends on which instrument measures it.",
      caption:
        "Pearson r between each consensus axis (rows) and each GRID dimension (columns), 77 shared terms; signs are arbitrary in a GPA. Ring = best match per axis · hover a cell for the machine-consensus (models-only) value.",
      mapLead:
        "And here is that merged model itself — we call it the machine consensus: the twelve embedding spaces aligned and averaged into one map of 77 words, no human norm involved. Its first two axes are plotted below; nobody told the consensus what they should mean, yet the words sort themselves from unpleasant to pleasant along one and from powerless to powerful along the other. Point size is how much the twelve models disagree about a word: the tight small dots (guilt, grief, despair) are where every model draws the same map.",
      mapAxisX: "axis c1 — empirically: valence (r = +0.74) →",
      mapAxisY: "↑ axis c2 — empirically: power (r = +0.77)",
      mapHint:
        "the machine consensus (models-only GPA over 77 terms) · color = human valence rating · point size = disagreement between the 12 models · hover a point",
    },
    q3: {
      q: "Clusters or gradients?",
      verdict: "Gradients.",
      text: "Silhouette scores sit between 0.04 and 0.12 in every model — nowhere near the ≥ 0.5 of genuinely separated clusters. The cloud is a continuous fabric: the best two-way split merely rediscovers the valence axis (ARI up to 0.73), and no finer partition finds hard borders anywhere. With 102 words this cannot adjudicate Cowen & Keltner's 27 fine-grained categories — but it is exactly the smooth, gradient-organized geometry their semantic-space account predicts — the reason the semantic walk two scenes back never had to jump.",
    },
  },
  about: {
    step: "14",
    title: "What it means",
    text: "Pretrained embeddings — trained only to predict words in context — converge on a shared geometry of emotion: about 10–15 dimensions, dominated by valence, organized as gradients rather than categories, and rich enough to carry all four dimensions of the GRID, including novelty, the axis classical VAD lacks. That shared geometry is where the psychometric maps live too, and it has a name in this study: the machine consensus, the twelve models merged into one map. Its axes match the GRID's four dimensions one to one; with just four numbers per word it recovers the GRID about as well as full embeddings; and while no individual model reaches the level of agreement independent human instruments have with each other, the machine consensus comes within statistical reach of it. Distributional semantics recovers most of the affective structure psychologists measure — and what it still misses lives in the models' idiosyncrasies, not in what they share.",
    note: "This site accompanies ongoing PhD research on the intrinsic dimensionality of the emotion lexicon in pretrained embedding spaces. Figures and statistics are computed from the research pipeline; the interactive views use the same data as the paper.",
    footer: "Kauê Moraes · PhD research · 2026",
  },
} as const;
