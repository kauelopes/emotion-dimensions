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
      "The 77-word core of the study's 102 canonical emotion words (the words covered by every model and both human norms), placed by BGE-M3's own distances between them (classical multidimensional scaling of its distance table). Orange = negative valence, blue = positive.",
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
    text: "We took the union of the emotion vocabularies psychology itself considers canonical — Scherer's GALC and GEW, the 80 terms of the GRID study, Cowen & Keltner's 27 categories, Ekman's basic six, Plutchik's wheel. The union is 102 English words, from admiration to worry. Each word also carries decades of human judgment: normative ratings of valence, arousal and dominance (NRC-VAD lexicon, shown below) and, for the GRID terms, ratings on four dimensions from 34 cultures. Hover a word to see them (the wall shows the 77-word core covered by every model and both norms — the set all comparisons run on).",
    hint: "color = human valence rating · hover for V/A/D",
  },
  pipeline: {
    step: "03",
    title: "The experiment",
    text: "We embedded every word with twelve pretrained models spanning four generations — static vectors (word2vec, GloVe, fastText), contextual encoders (BERT, RoBERTa), sentence encoders (MiniLM, mpnet, BGE-M3, Qwen3), and a commercial API (OpenAI text-embedding-3-large). Then we reduced each model to the one thing every claim here is about: its distance table — which emotion words does this model consider close, and which far? A distance table has no knobs: no dimensions to choose, nothing to rotate, no regression to tune. Averaging the twelve tables rank by rank gives the machine consensus — one relational map of what heterogeneous models agree on, built without ever consulting a human rating. Then we asked three questions:",
    questions: [
      {
        q: "How many dimensions does it really use?",
        a: "TwoNN and MLE nearest-neighbour intrinsic-dimension estimators.",
      },
      {
        q: "Do its axes mean anything?",
        a: "Can a word's human ratings be read off its nearest neighbours in the table? (No fitted map — just neighbourhoods.)",
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
        title: "12 distance tables",
        text: "one 77×77 table per model — its fingerprint; no dimensions chosen, nothing rotated, nothing fitted",
      },
      {
        n: "4",
        title: "1 machine consensus",
        text: "the tables averaged rank by rank — elected blind among 25 ways of building it",
      },
      {
        n: "5",
        title: "3 questions",
        text: "dimensionality · meaning of the axes · clusters vs gradients",
      },
    ],
    caption: "The full pipeline, from word lists to answers. Human norms enter only at evaluation — never in the construction.",
  },
  dimensionality: {
    step: "05",
    title: "The answer is ten-ish — not two, not twenty-seven",
    text: "Across all twelve models, two independent nearest-neighbour estimators agree: the emotion vocabulary lives on roughly 10–15 effective dimensions. That is far below the hundreds of nominal dimensions the models could use — the emotion lexicon occupies a thin slice of embedding space. But it is also clearly above the 2–4 dimensions of classical psychometric theories. The geometry that language learns is richer than core affect, leaner than a category per emotion. How much of that structure the twelve models share with one another — about eleven dimensions, with a four-dimensional nameable core — is a later scene's question.",
    legend: {
      band24: "psychometric theories (2–4D)",
      band1015: "what embeddings show (~10–15D)",
      twonn: "TwoNN",
      mle: "MLE",
    },
  },
  morph: {
    step: "06",
    title: "One axis dominates: valence",
    stages: [
      "This is the emotion cloud again (BERT with a template sentence this time) — each word colored by its human-rated valence, shown in the three leading axes of its distance table.",
      "Now we read the table in the most literal way possible: place each word on a line by averaging the human ratings of its seven nearest neighbours — the word's own rating is never consulted, and nothing is fitted. If pleasantness is in the geometry, neighbours should carry it.",
      "Look at the colors: they arrive sorted. The neighbourhood readout agrees with human valence ratings almost perfectly (R² = 0.86 in this model). Pleasantness is written into which words sit next to which.",
    ],
    axisNeg: "unpleasant",
    axisPos: "pleasant",
  },
  morphArousal: {
    step: "07",
    title: "Arousal: a tale of two instruments",
    stages: [
      "Same cloud, same model. Now the second classical axis: arousal, from calm to activated. Psychology has more than one way of measuring it — and that turns out to matter.",
      "First instrument: NRC-VAD, crowdsourced ratings of words in isolation. The neighbourhood readout manages only a weak line-up — R² = 0.30 on these 77 terms, far below what it just did for valence. Readouts like this once looked like \"embeddings don't know arousal\".",
      "Now watch: same words, same model, same readout — we only switch the instrument to the GRID's arousal, derived from how 34 cultures describe emotional episodes. The line tightens sharply (R² = 0.50). The colors follow the new ruler.",
      "So how much arousal the geometry carries depends on which human measurement you ask the model to match. The GRID's semantically grounded arousal is clearly legible in language; crowdsourced subjective ratings much less so — and a third instrument (Warriner) is barely legible at all, even though its ratings are reliable enough to be. The instrument, not noise, is the difference.",
    ],
    axisNeg: "calm",
    axisPos: "activated",
  },
  stability: {
    step: "09",
    title: "Twelve witnesses, one geometry",
    stages: [
      "Does this structure depend on which model we ask? Here is the cloud drawn by word2vec — a 2013-era model trained by counting word co-occurrences.",
      "Morph it into BERT, a 2018 contextual transformer… the words shuffle locally, but joy stays far from hate, and the valence gradient survives.",
      "…into BGE-M3, a modern sentence encoder… same overall shape.",
      "…and into OpenAI's commercial embedding API. Four architectures, four training recipes, one decade apart — and one shared geometry of emotion. That agreement is what makes the finding trustworthy.",
    ],
    caption: "drag to rotate · positions interpolate between models as you scroll",
  },
  crossSpace: {
    step: "10",
    title: "The space of spaces",
    text: "Formally now: treat each source — the twelve models plus the two human instruments, NRC-VAD and the GRID — as a distance table over the same 77 emotion words, and correlate every pair of tables (representational similarity analysis; significance by permuting words, corrected for the 91 tests). 82 of 91 pairs match far beyond chance; the nine that fail all involve RoBERTa without a template, the built-in negative control. The crucial rows are the last ones: the human instruments correlate with nearly every model — their maps live inside the models' shared structure, the four-dimensional GRID more deeply than three-dimensional NRC-VAD.",
    matrixHint: "lower triangle = RSA · upper = CKA · hover any cell",
    consensusTitle: "The map they agree on",
    consensusText: "The machine consensus — the twelve tables averaged rank by rank — drawn as a map (classical multidimensional scaling of the consensus distances). It is not a blur: a clean valence gradient runs through it, and the second direction tracks the GRID's novelty. Larger points are words the models disagree about (hope, joy, boredom); the most stable words are the heavily lexicalized negatives (guilt, grief, despair). Because the consensus is built from models only, closeness to it measures how much of the cross-model agreement a human instrument captures — with no possibility of the instrument grading its own homework. The GRID sits closer (RSA 0.46) than NRC-VAD (0.39), and closer than all but a handful of the models themselves: the richer, four-dimensional description is the better account of what the models share (the axes scene shows it dimension by dimension).",
    consensusHint: "color = human valence · point size = disagreement between the 12 models",
  },
  ceiling: {
    step: "11",
    title: "How close to human?",
    text: "Independent human instruments measuring the same words agree with each other at RSA ≈ 0.6 — that is the realistic reference level, not 1.0. Normalizing every space by that level (bootstrap over terms, 95% CIs): the best individual models reach 71–74% of human-level agreement with the GRID, and in all twelve the gap is significantly above zero. The top row is the machine consensus — rebuilt from scratch inside every bootstrap resample, so nothing leaks: it reaches 76%, at the top of the list (its interval overlaps the best individual models' — the honest claim is \"at the top\", not \"above every member\"). A diverse committee pools twelve partially independent perspectives on the same structure; yet even the pooled agreement stops measurably short of how well two human instruments agree with each other.",
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
    step: "08",
    title: "The main test: all four GRID dimensions recover",
    text: "The neighbourhood readout generalizes to the GRID's full four-dimensional structure — the study's main test. Reading each dimension purely from each model's distance table (a held-out word gets the mean rating of its seven nearest neighbours; a permutation test supplies the chance band), all four dimensions clear chance in 11–12 of the twelve models: valence (R² 0.53–0.88), power (0.38–0.70), arousal (0.29–0.51) and novelty (0.28–0.54). The single failure is novelty under RoBERTa without a template — the pre-declared degenerate control. Novelty is the critical case: power closely mirrors the dominance axis VAD already had, but novelty is the dimension the classic scheme genuinely lacks — and it, too, is written into the neighbourhoods. The last row is the machine consensus: the rank-average of the twelve tables recovers the four dimensions at the top of the list under every metric we tried, with the sharpest novelty of any space (0.56).",
    legend: {
      v: "valence",
      p: "power",
      a: "arousal",
      n: "novelty",
    },
    axisTail: "k-NN R² vs GRID (77 terms) →",
    zeroNote: "0 = no better than guessing the mean",
    note: "Arousal is the weakest dimension in most spaces — but remember the previous scene: how weak depends on the instrument (0.30 vs 0.50 on identical words). Fine rankings among the top models are not adjudicated at n = 77; top and bottom are stable, the middle reorders with the metric.",
  },
  rdm: {
    fingerprints: {
      step: "04",
      title: "One fingerprint per model",
      text: "Here is the raw material of everything that follows. Each model is reduced to its fingerprint: a 77×77 table of distances between the emotion words — which emotions does this model consider close, and which far? A fingerprint is the whole model, as far as our questions go, and it carries no analytic choices: no dimensions to pick, nothing to rotate, nothing to fit. Sort the words by human valence and the same block structure appears in every panel — negative words near negatives, positives near positives — twelve models, four architectures, one decade apart, drawing the same relational picture. Their rank-by-rank average (the large panel) is the machine consensus: one table of relations summarizing what heterogeneous models agree on about emotion, built without ever seeing a human rating.",
      caption:
        "Each panel is one model's 77×77 distance table (rank-transformed), words sorted by human valence — warm = near, blue = far. The block structure (negative words near negatives, positives near positives) repeats in every model; the large panel is their rank-mean: the machine consensus.",
    },
    factorial: {
      step: "12",
      title: "25 ways to build one consensus — same answer",
      text: "Two choices do remain in a relational pipeline: which distance to compute, and how to average the twelve tables into one. So we treated them as an experiment: five distance metrics × five aggregation rules, every analysis run in all 25 cells. The agreement with the GRID lands in a narrow band in 22 of 25 constructions and is significant in all of them — whatever the metric, whatever the rule, the same structure comes out. The official construction is elected blind: split-half reliability and centrality only, human data never consulted. The blind criterion picked rank aggregation over correlation distances — and, tellingly, rejected the seemingly natural default (plain averaging of cosine tables) as one of the least reliable options on the menu. The only family with a personality of its own is the geometric (log-Euclidean) average, which lands closer to both human norms — a characterization, not the winner.",
      axisLabel: "cell value & color = RSA between consensus and GRID · hover any cell",
      hoverHint: "hover a cell for its full record — split-half, centrality, GRID rank, FDR",
    },
    axes: {
      step: "13",
      title: "The four axes, two readings — one geometry",
      text: "There are two natural ways to read directions out of twelve models: align the twelve clouds into shared coordinates and read the common axes, or draw the consensus distance table as a map and read its variance-ordered axes. Match either reading to the GRID's four dimensions and something odd happens: in the aligned-coordinate reading, power owns a clean axis (0.74) and arousal is the weak one — but in the raw relational reading, power collapses to 0.30 and arousal keeps a signal. Which reading is right? Both — and neither. The power information is in the distance table all along: predicting a word's power from its nearest neighbours works at R² = 0.70, and an unrotated regression on the map's coordinates reaches 0.74 — exactly the height of the coordinate-frame axis. Only the raw axis-matching loses it, because variance-ordered axes cannot give a separate axis to a dimension that correlates 0.64 with valence — and the same raw reading applied to the GRID's own distances loses power identically (0.29). Give both frames the same reading — a rotation fitted on two-thirds of the words, tested on the held-out third — and they converge to the same point: 0.75 vs 0.75. The axes were properties of the reading convention; the geometry was one all along. What remains genuinely graded is each dimension's unique share of the distances: power adds almost nothing beyond valence in the models — less than in the GRID itself.",
      panelA: "A — the puzzle: matched-axis strength per dimension, two readings",
      panelB: "B — the resolution (three levels per dimension + held-out convergence)",
      convergence:
        "held-out fitted rotation: relational reading {rdm} ≈ aligned-coordinate reading {gpa} (null {null}) — the readings converge",
      convergenceNote: "power under the fitted reading: {pRdm} relational · {pGpa} coordinates",
    },
    committees: {
      step: "14",
      title: "4,017 committees — and how much structure they share",
      text: "Could a cherry-picked committee of models have manufactured this? We swept every committee of three or more models — 4,017 of them — plus a control arm where committees grow with term-shuffled models (same geometry, zero structure). Real committees improve with size and family diversity; shuffled members dilute monotonically; and no curated subset beats the full twelve beyond resampling noise. Rank aggregation is hard to game. Finally, how big is the structure the twelve models share? Confront the consensus spectrum with its own null — each model's table term-shuffled independently before averaging — and eleven dimensions exceed chance, not four. The four GRID dimensions are the interpretable core, carrying about half the shared variance; the rest is shared too, mostly lexical (word frequency, concreteness). The right summary: models share an ~11-dimensional structure whose leading, nameable directions are the GRID's four.",
      legendAll: "one dot per committee (min matched axis |r|)",
      legendReal: "real committees (median by size)",
      legendShuffled: "term-shuffled members (median)",
      coreLabel: "GRID core (4)",
      sharedLabel: "shared above chance ({n})",
      spectrumAxis: "consensus cross-product eigenvalue by rank · dashed = permutation null (95%)",
    },
  },
  gradients: {
    step: "15",
    title: "Gradients, not islands",
    text: "If emotions were discrete categories, the cloud would break into tight clusters. It doesn't. Silhouette scores hover around 0.1 in every model — barely more structure than a continuous smear. And this is not just noise blurring the borders: the machine consensus, where model-specific noise is averaged away, scores 0.17 — a touch crisper, still nowhere near separated islands (≥ 0.5), and its best two-way split merely rediscovers the sign of valence. Words shade into one another: anger into irritation into annoyance. Of the three theories, this is the signature of Cowen & Keltner's semantic space: a smooth, low-dimensional fabric organized by gradients, with valence as its strongest thread.",
    refLine: "well-separated clusters (≥ 0.5)",
    axisLabel: "silhouette score at best k",
  },
  explore: {
    step: "16",
    title: "Explore the map yourself",
    text: "Every model, every word, every rating — each cloud drawn in the three leading axes of that model's own distance table. Pick a model, color by valence, arousal or dominance, drag to rotate, and hover the points. Notice how valence paints a clean gradient across the cloud in most models — and how the same coloring by arousal is far blurrier. The last entry in the picker is the machine consensus: the same map with everything model-specific averaged away.",
    controls: { model: "model", colorBy: "color by" },
    legend: { lo: "low", hi: "high" },
    dragHint: "drag to rotate",
  },
  answers: {
    step: "17",
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
      verdict: "Yes — a four-dimensional GRID core, with graded axis identity.",
      text: "Match the machine consensus map's directions to the GRID's four dimensions and each dimension claims a distinct one, all four far above chance — with a graded hierarchy: valence is close to identity (|r| = 0.90), novelty is the second sharpest (0.75), arousal (0.38) and power (0.30) trail in the raw reading. And the two weak ones are weak for different, now-understood reasons: power's information is fully present in the table (its neighbourhood readout is 0.70) but a dimension that correlates 0.64 with valence cannot own a raw variance-ordered axis — the same reading loses power even on the GRID's own distances, and under matched held-out readings power comes back at 0.85 (the two-readings scene). Arousal's weakness, instead, tracks the instrument that measured it. None of this is the GRID grading its own homework: the consensus never sees a human rating.",
      mapLead:
        "And here is the machine consensus itself: the twelve distance tables averaged rank by rank, drawn as one map of 77 words, no human norm involved. Nobody told the consensus what its directions should mean, yet the words sort themselves from unpleasant to pleasant along one and from expected to surprising along the other. Point size is how much the twelve models disagree about a word: the tight small dots (guilt, grief, despair) are where every model draws the same map.",
      mapAxisX: "map axis 1 — empirically: valence →",
      mapAxisY: "↑ map axis 2 — empirically: novelty",
      mapHint:
        "the machine consensus drawn from its distance table (classical MDS, 77 terms) · color = human valence rating · point size = disagreement between the 12 models · hover a point",
    },
    q3: {
      q: "Clusters or gradients?",
      verdict: "Gradients.",
      text: "Silhouette scores sit between 0.04 and 0.12 in every model — nowhere near the ≥ 0.5 of genuinely separated clusters — and the machine consensus, with model noise averaged away, still only reaches 0.17: the smear is not an artifact of noisy individual models. The cloud is a continuous fabric: the consensus's best two-way split merely rediscovers the sign of valence (ARI 0.62), and no finer partition finds hard borders anywhere. With 102 words this cannot adjudicate Cowen & Keltner's 27 fine-grained categories — but it is exactly the smooth, gradient-organized geometry their semantic-space account predicts — the reason the semantic walk two scenes back never had to jump.",
    },
  },
  about: {
    step: "18",
    title: "What it means",
    text: "Pretrained embeddings — trained only to predict words in context — converge on a shared geometry of emotion: about 10–15 dimensions per model, dominated by valence, organized as gradients rather than categories, and rich enough to carry all four dimensions of the GRID, including novelty, the axis classical VAD lacks. That shared geometry is where the psychometric maps live too, and it has a name in this study: the machine consensus, the twelve models merged into one map. The measurement has no analytic machinery for the answer to hinge on — models are compared only through their distance tables, no dimensions chosen, nothing rotated, nothing fitted, and no human data enters the construction; the conclusion is the same in all 25 ways of building the consensus. The four dimensions recover from neighbourhoods alone, the consensus sits at the top at 76% of the human-to-human agreement level (the best single models reach 71–74%), and the structure the models share spans about eleven dimensions, with the GRID's four as its nameable core. Even the one apparent disagreement — which axis is weakest — dissolved on inspection into a property of how axes are read, not of the geometry. Distributional semantics recovers most of the affective structure psychologists measure, sharpest where the models agree — and the last stretch to human-level agreement remains open.",
    note: "This site accompanies ongoing PhD research on the intrinsic dimensionality of the emotion lexicon in pretrained embedding spaces. Figures and statistics are computed from the research pipeline; the interactive views use the same data as the paper.",
    footer: "Kauê Moraes · PhD research · 2026",
  },
} as const;
