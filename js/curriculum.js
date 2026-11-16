/* Gradient — curriculum: Track > Module > Topic > Lesson. Each lesson teaches exactly one skill. */
(function () {
  const L = (skill, title, mins, body, keys, extra = {}) => Object.assign({ skill, title, mins, body, keys }, extra);

  /* ============================== MACHINE LEARNING ============================== */
  GR.track({
    id: "ml", name: "Machine Learning", color: "var(--t-ml)", icon: "ML",
    blurb: "Classical ML end to end: how models learn, how to choose them, and how to tell whether they work.",
    modules: [
      { name: "Foundations of learning", topics: [
        { name: "The learning setup", lessons: [
          L("ml.supervised", "Supervised, unsupervised and the data split", 8,
            `<p>Machine learning is fitting a function to data so it generalizes to cases it has not seen. In <b>supervised</b> learning every example has a label: predicting a number is <b>regression</b>, predicting a category is <b>classification</b>. In <b>unsupervised</b> learning there are no labels and the goal is structure: clusters, low-dimensional representations, anomalies. <b>Reinforcement</b> learning learns from reward obtained by acting.</p>
             <p>Because we care about unseen data, we never judge a model on what it trained on. The standard split is <b>train</b> (fit parameters), <b>validation</b> (choose hyperparameters and models) and <b>test</b> (touch once, at the end, for an honest estimate). Every time you make a decision using the test set, it quietly becomes a second validation set and your estimate turns optimistic.</p>
             <p>A <b>parameter</b> is learned from data (a weight). A <b>hyperparameter</b> is set by you before training (learning rate, tree depth, k).</p>`,
            ["Labels present → supervised; absent → unsupervised.", "Validation is for choosing, test is for reporting.", "Parameters are learned; hyperparameters are chosen."], { related: ["ml.cv", "ds.wrangling"] }),
          L("ml.biasvar", "Bias, variance and overfitting", 10,
            `<p>Expected test error decomposes into <b>bias²</b> + <b>variance</b> + irreducible noise. Bias is error from a model too simple to capture the pattern (underfitting). Variance is error from a model so flexible it chases the noise in one particular sample (overfitting).</p>
             <p>The fingerprints are easy to read. <b>High bias</b>: training error is high and validation error is about the same. <b>High variance</b>: training error is low and validation error is much higher. More data helps variance, not bias. More capacity or better features helps bias, not variance.</p>
             <p>Use the diagram: raise the polynomial degree and watch training error only ever fall while test error falls, bottoms out, then climbs.</p>`,
            ["Train ≈ val, both bad → underfitting (bias).", "Train ≪ val → overfitting (variance).", "Complexity trades one for the other; pick it on validation data."], { diagram: "polyfit", related: ["ml.regularization", "ml.cv"] }),
        ]},
        { name: "Optimization", lessons: [
          L("ml.gd", "Gradient descent", 10,
            `<p>Training means minimizing a <b>loss</b>. Gradient descent does this iteratively: compute the gradient of the loss with respect to the parameters, then step the opposite way: <code>w ← w − η·∇L(w)</code>. The <b>learning rate</b> η sets the step size.</p>
             <p>Too small and training crawls. Too large and each step overshoots the minimum; past a threshold the loss diverges. On non-convex losses the start point matters, because descent only finds a nearby minimum.</p>
             <p><b>Batch</b> GD uses all data per step (stable, slow). <b>Stochastic</b> GD uses one example (noisy, cheap). <b>Mini-batch</b> is the practical middle. One pass through the dataset is an <b>epoch</b>. Feature scaling matters: unscaled features make the loss surface a narrow valley and descent zig-zags.</p>`,
            ["Step against the gradient, scaled by the learning rate.", "Too high a learning rate diverges; too low wastes compute.", "Mini-batches trade gradient noise for speed."], { diagram: "gd", related: ["ai.training", "ai.backprop"] }),
          L("ml.regularization", "Regularization: L1 and L2", 8,
            `<p>Regularization adds a penalty on model complexity to the loss so the model prefers simpler explanations: <code>loss + λ·penalty(w)</code>. Larger λ means a stronger pull toward small weights: more bias, less variance.</p>
             <p><b>L2 (ridge)</b> penalizes the sum of squared weights. It shrinks all weights smoothly and handles correlated features gracefully. <b>L1 (lasso)</b> penalizes the sum of absolute weights and drives some weights to exactly zero, so it performs feature selection. <b>Elastic net</b> mixes both.</p>
             <p>Always standardize features first, otherwise the penalty depends on units. Other regularizers follow the same idea: early stopping, dropout, limiting tree depth, data augmentation.</p>`,
            ["λ up → simpler model, more bias, less variance.", "L1 gives sparse weights; L2 gives small weights.", "Scale features before penalizing."], { related: ["ml.biasvar", "ai.training"] }),
        ]},
      ]},
      { name: "Core models", topics: [
        { name: "Linear models", lessons: [
          L("ml.linreg", "Linear regression", 9,
            `<p>Linear regression predicts <code>ŷ = w·x + b</code> and chooses the weights that minimize <b>mean squared error</b>. The fitted line always passes through the point of means, and because errors are squared, a single far-away point has outsized pull. Drag a point in the diagram to feel that.</p>
             <p><b>R²</b> is the fraction of variance in y explained by the model: 1 is perfect, 0 is no better than predicting the mean. <b>RMSE</b> is in the units of y; <b>MAE</b> is less sensitive to outliers.</p>
             <p>A closed-form solution exists (the normal equation), but it costs roughly O(d³) in the number of features, so large problems use gradient descent. "Linear" means linear in the weights: adding x² as a feature is still linear regression.</p>`,
            ["Least squares minimizes squared residuals; outliers dominate.", "R² = share of variance explained.", "Polynomial features keep the model linear in its weights."], { diagram: "regression", related: ["ds.regression", "ds.corr"] }),
          L("ml.logreg", "Logistic regression", 9,
            `<p>For a yes/no target, logistic regression passes a linear score through the <b>sigmoid</b> <code>σ(z) = 1/(1+e⁻ᶻ)</code> to get a probability. It is trained with <b>log loss</b> (cross-entropy), which punishes confident wrong predictions severely.</p>
             <p>The decision boundary is where z = 0, a straight line or hyperplane, so the model is a linear classifier. Each weight is a change in <b>log-odds</b> per unit of its feature; <code>e^w</code> is an odds ratio.</p>
             <p>For more than two classes, use <b>softmax</b> (multinomial) regression. The default 0.5 threshold is a choice, not a law: move it to trade precision against recall.</p>`,
            ["Sigmoid turns a linear score into a probability.", "Trained with cross-entropy, not squared error.", "Weights are log-odds effects; boundary is linear."], { related: ["ml.metrics", "ai.neuron"] }),
        ]},
        { name: "Non-linear models", lessons: [
          L("ml.trees", "Decision trees and ensembles", 11,
            `<p>A decision tree splits the data on one feature at a time, choosing the split that most reduces impurity (<b>Gini</b> or <b>entropy</b> for classification, variance for regression). Trees need no feature scaling and capture interactions, but a deep tree memorizes its training set.</p>
             <p><b>Bagging</b> trains many trees on bootstrap samples and averages them, which cuts variance. A <b>random forest</b> is bagging plus a random subset of features at each split, which decorrelates the trees. <b>Boosting</b> (gradient boosting, XGBoost, LightGBM) builds trees sequentially, each fitting the errors of the ensemble so far, which cuts bias; it is powerful but can overfit without a small learning rate and early stopping.</p>`,
            ["Splits maximize impurity reduction.", "Bagging/forests reduce variance; boosting reduces bias.", "Trees ignore feature scale."], { related: ["ml.biasvar"] }),
          L("ml.knnsvm", "k-nearest neighbors and SVMs", 9,
            `<p><b>kNN</b> stores the training set and predicts from the k closest points. There is no training step, but prediction costs a search through the data. Small k is flexible and noisy (high variance); large k is smooth (high bias). Distances are only meaningful if features are scaled, and in very high dimensions all points become roughly equidistant (the <b>curse of dimensionality</b>).</p>
             <p>A <b>support vector machine</b> finds the boundary with the largest <b>margin</b> between classes; only the points on the margin (support vectors) determine it. The parameter C trades margin width against training mistakes. The <b>kernel trick</b> (RBF, polynomial) computes similarities as if data were mapped to a higher-dimensional space, giving non-linear boundaries without building that space.</p>`,
            ["kNN: small k overfits, large k underfits; scale features.", "SVM maximizes the margin; support vectors define it.", "Kernels buy non-linear boundaries."], { related: ["swe.bigo", "ds.features"] }),
        ]},
      ]},
      { name: "Evaluation", topics: [
        { name: "Classification metrics", lessons: [
          L("ml.metrics", "Confusion matrix, precision and recall", 10,
            `<p>Every prediction of a binary classifier lands in one of four cells: true positive, false positive, true negative, false negative. <b>Accuracy</b> = (TP+TN)/all is misleading on imbalanced data: predicting "no fraud" always is 99.9% accurate and useless.</p>
             <p><b>Precision</b> = TP/(TP+FP): of what I flagged, how much was right. <b>Recall</b> = TP/(TP+FN): of what was truly positive, how much I caught. They pull against each other as the threshold moves. <b>F1</b> is their harmonic mean and is only high when both are.</p>
             <p>Choose by cost. Missing a cancer (FN) is worse than a false alarm, so favor recall. Sending a good email to spam (FP) is worse than letting one spam through, so favor precision.</p>`,
            ["Precision: quality of positive predictions. Recall: coverage of actual positives.", "Accuracy fails under class imbalance.", "Pick the metric from the cost of each error."], { diagram: "threshold", related: ["ml.roc", "ds.bayes"] }),
          L("ml.roc", "Thresholds, ROC and AUC", 9,
            `<p>A classifier outputs a score; a <b>threshold</b> turns it into a decision. Sweeping the threshold from high to low traces the <b>ROC curve</b>: true positive rate (recall) against false positive rate (FP/(FP+TN)).</p>
             <p><b>AUC</b> is the area under it: the probability that a random positive scores higher than a random negative. 0.5 is coin-flipping, 1.0 is perfect ranking. AUC is threshold-independent and unaffected by class balance, which is also its weakness: on heavily imbalanced problems a <b>precision-recall curve</b> is more informative, because FPR stays tiny even when false positives swamp true positives.</p>
             <p>A model can have a good AUC and still be badly <b>calibrated</b>: AUC measures ranking, not whether "0.8" means 80%.</p>`,
            ["ROC = TPR vs FPR across all thresholds.", "AUC = P(random positive outranks random negative).", "Use PR curves when positives are rare."], { diagram: "threshold", related: ["ml.metrics"] }),
        ]},
        { name: "Validation", lessons: [
          L("ml.cv", "Cross-validation and data leakage", 9,
            `<p><b>k-fold cross-validation</b> splits the training data into k parts, trains on k−1 and validates on the remaining one, rotating k times. Averaging gives a steadier estimate than one split and uses all the data. Use <b>stratified</b> folds for imbalanced classes, <b>grouped</b> folds when rows from one user or patient must stay together, and <b>forward-chaining</b> splits for time series: never validate on the past.</p>
             <p><b>Leakage</b> is information reaching the model in training that will not be available at prediction time. Classic cases: scaling or imputing with statistics computed on the full dataset before splitting, features recorded after the outcome, duplicates across train and test. The symptom is a validation score too good to be true. The cure is to fit every preprocessing step inside each training fold (a pipeline).</p>`,
            ["k-fold averages k train/validate rotations.", "Time series: train on past, validate on future.", "Fit preprocessing on training folds only."], { related: ["ml.supervised", "ds.timeseries", "ds.wrangling"] }),
        ]},
      ]},
      { name: "Unsupervised learning", topics: [
        { name: "Structure without labels", lessons: [
          L("ml.kmeans", "Clustering with k-means", 9,
            `<p>k-means partitions points into k clusters by repeating two steps: <b>assign</b> each point to its nearest centroid, then <b>update</b> each centroid to the mean of its points. Each step can only lower the within-cluster sum of squares (<b>inertia</b>), so it always converges, but only to a local optimum that depends on the starting centroids. Run it several times or use k-means++ initialization.</p>
             <p>You must choose k. Inertia always falls as k grows, so look for the <b>elbow</b> or use the silhouette score. k-means assumes roughly round, similar-sized clusters and is sensitive to scale and outliers. Alternatives: <b>DBSCAN</b> finds arbitrary shapes and marks noise; <b>hierarchical</b> clustering gives a tree of merges; <b>Gaussian mixtures</b> give soft assignments.</p>`,
            ["Alternate assign and update until nothing moves.", "Result depends on initialization; k is your choice.", "Assumes spherical clusters; scale features first."], { diagram: "kmeans", related: ["ml.pca"] }),
          L("ml.pca", "Dimensionality reduction and PCA", 9,
            `<p><b>Principal component analysis</b> finds new axes, ordered by how much variance of the data each one captures. The components are orthogonal directions (eigenvectors of the covariance matrix); projecting onto the first few keeps most of the information in far fewer dimensions.</p>
             <p>Standardize first, or the feature with the largest units wins. Choose the number of components from the cumulative <b>explained variance</b> (for example, enough to keep 95%). PCA is linear and unsupervised: it knows nothing about your target, so the highest-variance direction is not necessarily the most predictive.</p>
             <p>For visualizing non-linear structure in 2-D, <b>t-SNE</b> and <b>UMAP</b> preserve local neighbourhoods, but distances between far-apart clusters in those plots are not meaningful.</p>`,
            ["Components are orthogonal directions of maximal variance.", "Scale before PCA; pick components by explained variance.", "t-SNE/UMAP are for visualization, not distances."], { related: ["ml.kmeans", "ds.features"] }),
        ]},
      ]},
    ],
  });

  /* ============================== AI / DEEP LEARNING ============================== */
  GR.track({
    id: "ai", name: "Deep Learning & Generative AI", color: "var(--t-ai)", icon: "AI",
    blurb: "Neural networks from a single neuron to transformers, LLMs, retrieval and agents.",
    modules: [
      { name: "Neural network fundamentals", topics: [
        { name: "Building blocks", lessons: [
          L("ai.neuron", "Neurons, layers and activations", 9,
            `<p>A neuron computes a weighted sum of its inputs plus a bias and passes it through a non-linear <b>activation</b>. Stack neurons into layers and layers into a network. Without the non-linearity, any stack of layers collapses into a single linear map, so the activation is what gives depth its power.</p>
             <p><b>ReLU</b> <code>max(0, z)</code> is the default in hidden layers: cheap and it does not saturate for positive inputs. <b>Sigmoid</b> squashes to (0,1) and <b>tanh</b> to (−1,1); both saturate, which shrinks gradients. Output layers match the task: sigmoid for binary, <b>softmax</b> for multi-class, none for regression.</p>
             <p>In the diagram, click an edge and change its weight to see the signal re-route through the network.</p>`,
            ["Neuron = weighted sum + bias + non-linearity.", "No activation → the whole network is linear.", "ReLU for hidden layers; softmax/sigmoid at the output."], { diagram: "nn", related: ["ml.logreg", "ai.backprop"] }),
          L("ai.backprop", "Backpropagation", 10,
            `<p>Training needs the gradient of the loss with respect to every weight. <b>Backpropagation</b> gets all of them in one backward sweep by applying the <b>chain rule</b> layer by layer and reusing intermediate results: a forward pass computes and caches activations, a backward pass propagates the error signal from the output to the input.</p>
             <p>Because the gradient at an early layer is a product of many local derivatives, it can shrink toward zero (<b>vanishing gradients</b>, typical with sigmoid/tanh in deep nets) or blow up (<b>exploding gradients</b>, typical in RNNs). Remedies: ReLU-family activations, careful initialization, normalization layers, residual connections and gradient clipping.</p>
             <p>Frameworks implement this as automatic differentiation over a computation graph; you write the forward pass and call <code>loss.backward()</code>.</p>`,
            ["Backprop = chain rule applied backward with cached values.", "Products of small derivatives vanish; large ones explode.", "Residual connections and normalization keep gradients healthy."], { related: ["ml.gd", "ai.training"] }),
          L("ai.training", "Training deep networks", 10,
            `<p><b>Optimizers</b>: SGD with <b>momentum</b> smooths the path by accumulating past gradients. <b>Adam</b> additionally adapts the step size per parameter and is the usual default; AdamW decouples weight decay. Learning-rate <b>schedules</b> (warm-up, cosine decay) often matter as much as the optimizer.</p>
             <p><b>Initialization</b> (Xavier, He) keeps the variance of activations stable across layers. Initializing all weights to the same value means every neuron in a layer learns the same thing.</p>
             <p><b>Batch normalization</b> standardizes activations within a mini-batch, enabling higher learning rates; layer norm does the same per example and is standard in transformers. <b>Dropout</b> randomly zeroes activations in training and is switched off at inference. <b>Early stopping</b> halts when validation loss stops improving.</p>`,
            ["Adam = momentum + per-parameter step sizes.", "Dropout and batch norm behave differently in train vs eval mode.", "Watch validation loss; stop when it turns."], { related: ["ml.gd", "ml.regularization"] }),
        ]},
      ]},
      { name: "Architectures", topics: [
        { name: "Vision and sequences", lessons: [
          L("ai.cnn", "Convolutional networks", 9,
            `<p>A <b>convolution</b> slides a small learnable filter across the image. The same weights are used at every position (<b>parameter sharing</b>), so the layer needs far fewer parameters than a dense layer and detects a feature wherever it appears.</p>
             <p>Output size along one dimension is <code>⌊(n + 2p − k)/s⌋ + 1</code> for input n, kernel k, padding p, stride s. The number of filters sets the output channels. <b>Pooling</b> downsamples, adding tolerance to small shifts. Early layers learn edges and textures; deeper layers have larger <b>receptive fields</b> and learn parts and objects.</p>
             <p><b>ResNets</b> add skip connections so very deep stacks train. Starting from a pretrained network and fine-tuning (<b>transfer learning</b>) is the default when data is limited.</p>`,
            ["Filters share weights across positions.", "Output size: (n + 2p − k)/s + 1.", "Skip connections make depth trainable; reuse pretrained backbones."], { related: ["ai.neuron"] }),
          L("ai.rnn", "Sequence models: RNNs and LSTMs", 8,
            `<p>A <b>recurrent network</b> reads a sequence one step at a time, updating a hidden state that summarizes everything so far. The same weights are reused at every step. Training unrolls the network through time, which multiplies many Jacobians together, so plain RNNs suffer vanishing gradients and forget long-range context.</p>
             <p><b>LSTMs</b> and <b>GRUs</b> add gates that control what to keep, write and expose, giving gradients a more direct path across many steps. They were the standard for language and time series until transformers.</p>
             <p>The structural limits remain: computation is sequential, so it cannot be parallelized across positions, and all context must squeeze through a fixed-size state. Attention removes both.</p>`,
            ["Hidden state carries context forward; weights are shared over time.", "LSTM/GRU gates fight vanishing gradients.", "Sequential processing limits parallelism."], { related: ["ai.attention", "ds.timeseries"] }),
        ]},
        { name: "Transformers", lessons: [
          L("ai.attention", "Attention and the transformer", 12,
            `<p><b>Self-attention</b> lets every token look directly at every other token. Each token emits a <b>query</b>, a <b>key</b> and a <b>value</b>. The score between token i and j is the dot product of i's query with j's key, scaled by √d; a softmax over the scores gives weights, and the output for i is the weighted sum of values. <b>Multi-head</b> attention runs several of these in parallel so different heads can track different relations.</p>
             <p>Attention has no notion of order, so <b>positional encodings</b> are added. A transformer block is attention plus a feed-forward layer, each wrapped in a residual connection and layer norm. <b>Encoders</b> (BERT) see both directions; <b>decoders</b> (GPT) use a causal mask so a token attends only to earlier ones.</p>
             <p>Cost grows as O(n²) in sequence length, which is why context length is expensive.</p>`,
            ["Weights = softmax(q·k / √d); output = weighted sum of values.", "Positional information must be added explicitly.", "Decoder-only models mask the future; cost is quadratic in length."], { diagram: "attention", related: ["ai.rnn", "ai.llm"] }),
        ]},
      ]},
      { name: "Large language models", topics: [
        { name: "How LLMs work", lessons: [
          L("ai.tokens", "Tokens and embeddings", 8,
            `<p>Models do not read characters or words; they read <b>tokens</b>, sub-word pieces produced by an algorithm such as byte-pair encoding. Common words are one token, rare words split into several. Token counts determine cost, speed and whether text fits in the <b>context window</b>.</p>
             <p>Each token id indexes a row of an <b>embedding</b> matrix: a dense vector learned so that tokens used in similar contexts end up near each other. Similarity is usually measured with <b>cosine similarity</b>, the cosine of the angle between two vectors, which ignores magnitude.</p>
             <p>Sentence or document embeddings map whole passages to one vector; these power semantic search, clustering and retrieval.</p>`,
            ["Tokens are sub-word units; limits and pricing are in tokens.", "Embeddings place similar meanings near each other.", "Cosine similarity compares direction, not length."], { related: ["ai.rag", "ml.pca"] }),
          L("ai.llm", "Pretraining, fine-tuning and sampling", 11,
            `<p>An LLM is <b>pretrained</b> on huge text corpora with a self-supervised objective: predict the next token. That one objective forces it to learn grammar, facts and reasoning patterns. It can then be adapted: <b>fine-tuning</b> updates weights on task data; <b>LoRA</b> trains small low-rank adapters while the base model stays frozen; <b>in-context learning</b> changes behavior with instructions and examples in the prompt and no weight updates at all.</p>
             <p>At each step the model outputs a probability distribution over the vocabulary. <b>Temperature</b> divides the logits before the softmax: below 1 sharpens toward the top token, above 1 flattens. <b>Top-k</b> keeps the k most likely tokens; <b>top-p</b> keeps the smallest set whose probability sums to p. Temperature 0 is greedy decoding.</p>`,
            ["Pretraining objective: next-token prediction.", "Fine-tune weights, add adapters, or just prompt.", "Temperature reshapes the distribution; top-k/top-p truncate it."], { diagram: "temperature", related: ["ai.attention", "ai.tokens"] }),
        ]},
        { name: "Building with LLMs", lessons: [
          L("ai.rag", "Prompting and retrieval-augmented generation", 10,
            `<p>Good prompts are specific about the task, the audience and the output format, give examples when the pattern matters (<b>few-shot</b>), and give the model room to reason before answering. A <b>system prompt</b> sets persistent behavior.</p>
             <p><b>RAG</b> grounds answers in your own data. Offline: split documents into <b>chunks</b>, embed each, store in a vector index. Online: embed the question, retrieve the nearest chunks (often combined with keyword search, then <b>reranked</b>), put them in the prompt and ask the model to answer from them with citations.</p>
             <p>RAG beats fine-tuning when knowledge changes often or must be traceable. Most RAG failures are retrieval failures: wrong chunk size, missing metadata filters, or the answer never being retrieved.</p>`,
            ["Be explicit; show examples; ask for a format.", "RAG = retrieve relevant chunks, then generate from them.", "Debug retrieval before blaming the model."], { related: ["ai.tokens", "ai.eval"] }),
          L("ai.agents", "Tool use and agents", 9,
            `<p>With <b>tool use</b> (function calling) you describe functions and their JSON schemas to the model. Instead of text it can return a structured request to call one; your code executes it and returns the result, and the model continues. The model never runs anything itself.</p>
             <p>An <b>agent</b> is this in a loop: the model plans, calls a tool, observes the result and decides the next step until the task is done. Agents suit open-ended, multi-step work; a fixed <b>workflow</b> of prompts is cheaper and more predictable when the steps are known in advance.</p>
             <p>Risks grow with autonomy: errors compound across steps, and <b>prompt injection</b> (instructions hidden in retrieved content) can hijack the agent. Mitigate with least-privilege tools, human confirmation for irreversible actions and treating tool output as data.</p>`,
            ["The model requests tool calls; your code executes them.", "Agent = model + tools + loop.", "Treat retrieved content as untrusted."], { related: ["ai.rag", "swe.practices"] }),
        ]},
      ]},
      { name: "Shipping AI systems", topics: [
        { name: "Quality and operations", lessons: [
          L("ai.eval", "Evaluating generative models", 9,
            `<p>A <b>hallucination</b> is fluent output that is not supported by the source or by fact. It follows from the objective: the model produces probable text, not verified text. Grounding, citations and letting the model say "I don't know" reduce it.</p>
             <p>You cannot improve what you do not measure. Build an <b>eval set</b> of representative inputs with expected properties, and score automatically where possible: exact match or code execution for closed tasks, rubric-based <b>LLM-as-judge</b> for open ones (validated against human labels). Overlap metrics like BLEU and ROUGE correlate weakly with quality for open-ended text. <b>Perplexity</b> measures how well a model predicts held-out text, not whether it is useful.</p>
             <p>Evaluate for bias, safety and robustness too, and re-run the suite on every prompt or model change.</p>`,
            ["Hallucination is a consequence of next-token prediction.", "Keep a fixed eval set; re-run on every change.", "Validate LLM judges against humans."], { related: ["ml.metrics", "ai.rag"] }),
          L("ai.deploy", "Serving, cost and monitoring", 9,
            `<p>Inference cost and latency scale with tokens in and out and with model size. Levers: choose the smallest model that passes your evals, <b>cache</b> repeated prompt prefixes, <b>batch</b> offline work, stream output so users see the first token quickly, and cap output length.</p>
             <p>To shrink models: <b>quantization</b> stores weights in fewer bits (for example 8-bit instead of 32-bit float) with small accuracy loss; <b>distillation</b> trains a small student to imitate a large teacher; <b>pruning</b> removes weights.</p>
             <p>In production, models degrade silently. <b>Data drift</b> is the input distribution changing; <b>concept drift</b> is the relationship between input and label changing. Monitor inputs, outputs, latency and business metrics, version data and models together, and roll out behind canaries or shadow traffic.</p>`,
            ["Cost ∝ tokens × model size; cache, batch and right-size.", "Quantize, distill or prune to shrink.", "Monitor for data and concept drift."], { related: ["swe.sysdesign", "ml.cv"] }),
        ]},
      ]},
    ],
  });

  /* ============================== AGENTIC AI & AUTOMATION ============================== */
  GR.track({
    id: "ag", name: "Agentic AI & Automation", color: "var(--t-ag)", icon: "AG",
    blurb: "Building LLM systems that act: workflows, tools, context, multi-agent setups and automations you can trust in production.",
    modules: [
      { name: "Agent foundations", topics: [
        { name: "From prompts to agents", lessons: [
          L("ag.patterns", "Workflows vs agents: the core patterns", 10,
            `<p>Most useful LLM systems are <b>workflows</b>: code decides the path, and the model fills in each step. An <b>agent</b> is different: the model decides the path itself, choosing which tool to call next until the task is done. Start with the simplest thing that works and add autonomy only when the steps cannot be known in advance.</p>
             <p>The standard workflow patterns: <b>prompt chaining</b> (step 2 consumes step 1's output, with checks between), <b>routing</b> (classify the input, then send it to a specialized prompt or a cheaper model), <b>parallelization</b> (split independent subtasks, or run the same task several times and vote), <b>orchestrator-workers</b> (one call plans subtasks at run time and delegates them) and <b>evaluator-optimizer</b> (one call drafts, another critiques, repeat until it passes).</p>
             <p>Agents earn their cost on open-ended problems: debugging, research, multi-system operations. They pay for it with latency, tokens and unpredictability, so they need clear stopping conditions and good tools.</p>`,
            ["Workflow: code controls the path. Agent: the model does.", "Chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer.", "Add autonomy only when the steps can't be scripted."], { related: ["ai.agents", "ag.loop"] }),
          L("ag.loop", "The agent loop, planning and stopping", 10,
            `<p>Every agent is a loop: the model reads the context, either answers or emits a tool call, your code executes the call, the result is appended to the context, and the loop repeats. <b>ReAct</b> (reason + act) interleaves short reasoning with each action so the model can adjust to what it observes.</p>
             <p>Two planning styles: <b>reactive</b> agents pick one step at a time, while <b>plan-and-execute</b> agents draft a full plan first and revise it when a step fails. Explicit plans make long tasks easier to follow and to audit. <b>Reflection</b> (asking the model to check its own result against the goal) catches some errors cheaply.</p>
             <p>Agents need hard limits because they will not always stop on their own: a maximum number of steps, a token or cost budget, a wall-clock timeout, and a clear definition of done. Detect loops (the same call with the same arguments) and fail loudly instead of burning budget.</p>`,
            ["Loop: think → call tool → observe → repeat.", "Plan-and-execute for long tasks; reactive for short ones.", "Always cap steps, tokens and time."], { diagram: "agentloop", related: ["ag.patterns", "ag.ops"] }),
        ]},
        { name: "Tools", lessons: [
          L("ag.tools", "Designing tools and function calling", 10,
            `<p>A tool is a name, a description and a <b>JSON Schema</b> for its arguments. The model only sees that text, so write tools the way you would document an API for a new colleague: say what the tool does, when to use it, what each parameter means and what it returns. Ambiguous or overlapping tools are the most common cause of wrong tool choices.</p>
             <p>Good tools are <b>coarse enough</b> to finish a meaningful step (<code>schedule_meeting</code>, not three calls to list, check and create), return <b>concise, relevant</b> output instead of raw dumps, and turn failures into <b>actionable error messages</b> ("date must be YYYY-MM-DD") so the model can correct itself. Validate arguments against the schema before executing; use <b>structured outputs</b> when you need guaranteed-valid JSON.</p>
             <p>Make side-effecting tools <b>idempotent</b> where possible (an idempotency key means a retried call doesn't create a second order). Keep the toolset small: every extra tool costs context and adds a chance to pick the wrong one.</p>`,
            ["The description is the interface: write it for the model.", "Return concise results and actionable errors.", "Validate arguments; make side effects idempotent."], { related: ["ai.agents", "ag.mcp"] }),
          L("ag.mcp", "Model Context Protocol and integrations", 9,
            `<p>The <b>Model Context Protocol (MCP)</b> is an open standard for connecting AI applications to tools and data. Instead of writing a custom integration for every pair of app and service, a service ships one <b>MCP server</b> and any MCP-capable <b>client</b> (a chat app, an IDE, an agent framework) can use it.</p>
             <p>A server exposes three kinds of capability: <b>tools</b> (functions the model can call), <b>resources</b> (data the application can read into context, like files or records) and <b>prompts</b> (reusable templates). Servers run locally over <b>stdio</b> or remotely over <b>HTTP</b>; remote servers typically use OAuth so the user grants scoped access.</p>
             <p>An MCP server is code you are trusting with your agent's context and actions. Install servers only from sources you trust, grant the minimum scopes, and remember that tool descriptions and tool results are both text the model reads, so a malicious server can attempt prompt injection.</p>`,
            ["MCP: one server per service, usable by any client.", "Capabilities: tools, resources, prompts.", "Treat third-party servers as untrusted code and content."], { related: ["ag.tools", "ag.safety"] }),
        ]},
      ]},
      { name: "Context and memory", topics: [
        { name: "Managing what the model sees", lessons: [
          L("ag.context", "Context engineering", 10,
            `<p>An agent's context window holds the system prompt, tool definitions, retrieved material and the whole history of calls and results. It is a <b>budget</b>, not a bucket: as it fills, cost and latency rise, and models attend less reliably to details buried in the middle of long contexts.</p>
             <p>Techniques: keep the <b>stable prefix</b> (system prompt and tools) unchanged so it can be <b>prompt-cached</b>; load information <b>just in time</b> with search or file tools instead of stuffing everything up front; <b>compact</b> long histories by summarizing old turns and dropping raw tool output once it has been used; and give large subtasks to a <b>subagent</b> with a fresh context that returns only a short result.</p>
             <p>Structure helps too: clear sections, consistent formats for tool results, and a running notes or to-do file the agent can re-read let it stay on track over long tasks.</p>`,
            ["Context is a budget; long contexts cost more and dilute attention.", "Cache the stable prefix; retrieve just in time.", "Compact history and isolate big subtasks."], { related: ["ag.memory", "ai.tokens"] }),
          L("ag.memory", "Memory and state", 9,
            `<p>Models are stateless: anything an agent "remembers" is something your system stores and puts back into context. <b>Short-term memory</b> is the current conversation and scratchpad. <b>Long-term memory</b> persists across sessions in a database, vector store or plain files.</p>
             <p>Useful distinctions: <b>semantic</b> memory (facts about the user or domain), <b>episodic</b> memory (what happened in past runs) and <b>procedural</b> memory (learned instructions or skills). Each needs a <b>write policy</b> (what is worth saving), a <b>read policy</b> (when to retrieve it) and a way to <b>update or forget</b> stale facts, or the agent will act on outdated information.</p>
             <p>For long-running automations, persist the agent's <b>state</b> too: checkpoint after each step so a crash or a human pause can resume from where it stopped instead of starting over.</p>`,
            ["Memory is storage you manage, not something the model has.", "Semantic, episodic, procedural; each needs write and read rules.", "Checkpoint state so runs can resume."], { related: ["ag.context", "ag.automation"] }),
          L("ag.agenticrag", "Agentic retrieval", 9,
            `<p>Classic RAG retrieves once, before the model answers. <b>Agentic retrieval</b> gives the model search as a tool: it decides whether to search, rewrites the query, reads results, and searches again when the first pass is not enough. This handles <b>multi-hop</b> questions ("Which of our vendors had an outage in the same quarter their contract renewed?") that a single retrieval cannot.</p>
             <p>Good practice: let the agent <b>rewrite</b> vague questions into specific queries, combine keyword and semantic search, <b>grade</b> retrieved chunks for relevance before using them, and require <b>citations</b> so every claim can be traced to a source.</p>
             <p>The trade-off is cost and latency: more searches, more tokens. Cap the number of retrieval rounds and fall back to "I could not find this" rather than letting the model fill gaps from memory.</p>`,
            ["Search becomes a tool the model calls repeatedly.", "Rewrite queries, grade results, cite sources.", "Cap retrieval rounds; allow 'not found'."], { related: ["ai.rag", "ag.context"] }),
        ]},
      ]},
      { name: "Multi-agent systems and automation", topics: [
        { name: "Coordination", lessons: [
          L("ag.multi", "Multi-agent systems", 10,
            `<p>In an <b>orchestrator-subagent</b> setup, a lead agent breaks the task down and sends pieces to subagents that work in parallel, each with its own clean context, then combines their findings. It shines on broad tasks with independent parts, such as researching ten companies at once. Other designs use <b>handoffs</b>, where control passes from one specialized agent to another (triage to billing to refunds).</p>
             <p>The costs are real: every agent re-reads instructions and context, so token use multiplies, and coordination introduces new failures: duplicated work, subagents misunderstanding vague assignments, and conflicting results. Give each subagent a precise objective, output format and boundaries.</p>
             <p>Use multiple agents when the work is <b>parallel</b> or a single context would overflow. For tightly coupled, sequential work, one capable agent with good tools is usually more reliable.</p>`,
            ["Orchestrator plans; subagents work in parallel with clean contexts.", "Multi-agent multiplies tokens and coordination errors.", "Use it for parallel, broad work, not coupled steps."], { related: ["ag.patterns", "ag.context"] }),
          L("ag.automation", "Workflow automation and orchestration", 10,
            `<p>Automations start from a <b>trigger</b>: a schedule (cron), a <b>webhook</b> from another service, or an event such as a new row or email. They then run a graph of steps, some deterministic (API calls, transforms) and some LLM-powered (classify, extract, draft). Tools like n8n, Zapier and Make, or orchestrators like Airflow and Temporal, run these graphs.</p>
             <p>Production automations need the same discipline as any distributed system: <b>retries with exponential backoff and jitter</b> for transient failures, <b>idempotency</b> so a retried step doesn't double-charge or double-send, a <b>dead-letter queue</b> for items that keep failing, and <b>durable execution</b> so long workflows survive restarts.</p>
             <p>Put <b>human-in-the-loop</b> approval steps before irreversible or high-stakes actions, and prefer official APIs over screen-scraping (RPA): APIs are faster and break far less often.</p>`,
            ["Trigger → steps (deterministic + LLM) → outputs.", "Retries with backoff, idempotency, dead-letter queues.", "Human approval before irreversible actions."], { related: ["ag.memory", "swe.sysdesign"] }),
          L("ag.computer", "Coding and computer-use agents", 9,
            `<p><b>Coding agents</b> read a repository, edit files and run commands. Their superpower is <b>verification</b>: tests, type checkers and linters tell the agent objectively whether its change worked, so it can iterate. Clear instructions (a project guide file, the commands to run tests) and small, reviewable diffs make them far more effective.</p>
             <p><b>Computer-use agents</b> operate graphical interfaces by looking at screenshots and issuing clicks and keystrokes. They can automate tools that have no API, but they are slower, more expensive per step and more brittle than API calls, so use them when nothing better exists.</p>
             <p>Both should run in a <b>sandbox</b> (a container or VM with limited network and file access) with credentials scoped to the task, and a human should review changes before they reach production.</p>`,
            ["Coding agents improve fastest with tests to verify against.", "Computer use: screenshots in, clicks out; use when no API exists.", "Sandbox everything; review before production."], { related: ["swe.practices", "ag.safety"] }),
        ]},
      ]},
      { name: "Agents in production", topics: [
        { name: "Quality, safety and operations", lessons: [
          L("ag.eval", "Evaluating agents", 10,
            `<p>Agents are evaluated on <b>tasks</b>, not single answers. Build a suite of realistic tasks in a reproducible environment (a sandbox with seeded data) and grade the <b>outcome</b>: did the ticket get resolved, do the tests pass, is the database in the right state? Also inspect the <b>trajectory</b> (the sequence of calls) for wasted steps, unsafe actions and lucky guesses.</p>
             <p>Agents are non-deterministic, so run each task several times. <b>pass@k</b> is the chance that at least one of k attempts succeeds (fine when a human picks the best); <b>pass^k</b> is the chance that all k succeed, which matters when users expect consistency. With per-attempt success p, pass^k = p<sup>k</sup>, which falls fast.</p>
             <p>Track success rate together with <b>cost and latency per task</b>, and log full <b>traces</b> so failures can be replayed. Re-run the suite on every prompt, tool or model change.</p>`,
            ["Grade outcomes in a sandbox; review trajectories too.", "pass@k = any success; pass^k = all succeed = pᵏ.", "Track success, cost and latency together."], { related: ["ai.eval", "ag.ops"] }),
          L("ag.safety", "Guardrails, security and human oversight", 10,
            `<p><b>Prompt injection</b> is the defining security problem of agents: instructions hidden in a web page, email, document or tool result can redirect the model. It is most dangerous when an agent combines three things: access to <b>private data</b>, exposure to <b>untrusted content</b>, and a way to <b>send data out</b> (email, HTTP requests, even image URLs). Remove any one leg and the attack gets much harder.</p>
             <p>Defenses are layered: <b>least-privilege</b> tools and credentials, <b>allowlists</b> for domains and recipients, <b>sandboxing</b>, <b>human confirmation</b> for irreversible or external actions, validation of tool arguments and outputs, and treating everything a tool returns as data, never as instructions. A system prompt that says "ignore malicious instructions" is not a control.</p>
             <p>Also guard the basics: never put secrets in prompts, log every action for audit, and rate-limit what an agent can do in a period of time.</p>`,
            ["Injection risk peaks with private data + untrusted input + an exit.", "Least privilege, allowlists, sandboxes, human approval.", "Tool output is data, never instructions."], { related: ["ai.agents", "ag.mcp"] }),
          L("ag.ops", "Cost, latency and reliability in production", 9,
            `<p>An agent re-sends its growing context on every step, so total input tokens grow roughly with the <b>square</b> of the number of steps. Prompt caching of the stable prefix, compaction and fewer, more capable tool calls are the main levers. <b>Model routing</b> sends easy steps to a small, cheap model and hard ones to a large model.</p>
             <p>Latency adds up across sequential calls; run independent tool calls in <b>parallel</b>, stream progress to the user, and set <b>timeouts</b> on every external call. Reliability needs <b>retries</b> for transient errors, <b>fallbacks</b> (another model or a simpler path) and graceful failure messages.</p>
             <p>Make it observable: trace every run as a tree of spans (model calls, tool calls, tokens, latency, cost), alert on cost per task and error rates, and enforce per-run and per-user budgets.</p>`,
            ["Context re-sent each step: cost grows ~quadratically.", "Cache, compact, route to smaller models, parallelize.", "Trace every run; enforce budgets and timeouts."], { related: ["ai.deploy", "ag.eval"] }),
        ]},
      ]},
    ],
  });

  /* ============================== DATA SCIENCE & STATISTICS ============================== */
  GR.track({
    id: "ds", name: "Data Science & Statistics", color: "var(--t-ds)", icon: "DS",
    blurb: "Probability, inference and the practical craft of turning raw data into defensible conclusions.",
    modules: [
      { name: "Probability", topics: [
        { name: "Reasoning under uncertainty", lessons: [
          L("ds.prob", "Probability rules", 9,
            `<p>Probabilities are numbers between 0 and 1 that sum to 1 over all outcomes. Three rules do most of the work. <b>Complement</b>: P(not A) = 1 − P(A); "at least one" problems are easiest as 1 − P(none). <b>Addition</b>: P(A or B) = P(A) + P(B) − P(A and B). <b>Multiplication</b>: P(A and B) = P(A)·P(B|A).</p>
             <p>Events are <b>independent</b> when knowing one tells you nothing about the other, so P(A and B) = P(A)·P(B). <b>Mutually exclusive</b> events cannot both happen, which makes them strongly dependent, not independent.</p>
             <p><b>Conditional probability</b> P(A|B) = P(A and B)/P(B) restricts attention to the world where B happened. Counting: n! orderings; C(n,k) = n!/(k!(n−k)!) ways to choose k from n when order is irrelevant.</p>`,
            ["At least one = 1 − P(none).", "Independent: multiply. Exclusive: add.", "Conditioning shrinks the sample space."], { related: ["ds.bayes"] }),
          L("ds.bayes", "Bayes' theorem", 10,
            `<p>Bayes' theorem reverses a conditional: <code>P(H|E) = P(E|H)·P(H) / P(E)</code>. The <b>prior</b> P(H) is what you believed before the evidence; the <b>likelihood</b> P(E|H) is how expected the evidence is if H is true; the <b>posterior</b> is the updated belief.</p>
             <p>The classic trap is <b>base-rate neglect</b>. A test that is 95% sensitive and 95% specific for a disease with 1% prevalence gives mostly false positives: out of 1000 people, about 10 are sick (9.5 test positive) and 990 are healthy (49.5 test positive), so a positive result means only about a 16% chance of disease.</p>
             <p>Use the diagram to move prevalence and watch the positive predictive value collapse as the condition gets rarer. Thinking in whole-number counts rather than formulas makes these problems far easier.</p>`,
            ["Posterior ∝ likelihood × prior.", "Rare conditions make most positives false.", "Convert to counts of people to stay honest."], { diagram: "bayes", related: ["ml.metrics", "ds.prob"] }),
          L("ds.dist", "Distributions and expectation", 10,
            `<p>A <b>random variable</b> assigns numbers to outcomes. Its <b>expected value</b> is the probability-weighted average, and expectation is linear: E[X+Y] = E[X] + E[Y] always. <b>Variance</b> is the expected squared deviation from the mean; for independent variables variances add, and Var(aX) = a²Var(X).</p>
             <p>Know these by sight. <b>Bernoulli(p)</b>: one yes/no trial, mean p, variance p(1−p). <b>Binomial(n,p)</b>: successes in n trials, mean np, variance np(1−p). <b>Poisson(λ)</b>: counts of rare events per interval, mean = variance = λ. <b>Normal(μ,σ)</b>: the bell curve; about 68/95/99.7% of mass lies within 1/2/3 σ. <b>Exponential</b>: waiting time between Poisson events, memoryless.</p>
             <p>A <b>z-score</b> (x − μ)/σ says how many standard deviations a value is from the mean.</p>`,
            ["Expectation is linear; independent variances add.", "Binomial: np and np(1−p). Poisson: mean = variance.", "68–95–99.7 rule for the normal."], { related: ["ds.clt", "ds.prob"] }),
        ]},
      ]},
      { name: "Statistical inference", topics: [
        { name: "From sample to population", lessons: [
          L("ds.clt", "Sampling and the central limit theorem", 9,
            `<p>A statistic computed from a sample (like the mean) varies from sample to sample; its distribution is the <b>sampling distribution</b>, and its standard deviation is the <b>standard error</b>. For a mean, SE = σ/√n: to halve the error you need four times the data.</p>
             <p>The <b>central limit theorem</b> says that the mean of n independent draws from almost any distribution with finite variance is approximately normal for large n, centered on the population mean. That is why normal-based intervals and tests work on non-normal data. The more skewed the population, the larger n needs to be.</p>
             <p>The <b>law of large numbers</b> is the related statement that the sample mean converges to the true mean. Neither rescues a <b>biased</b> sample: more data from the wrong population gives a precise wrong answer.</p>`,
            ["Standard error of a mean = σ/√n.", "Sample means are ~normal regardless of the population's shape.", "Bias does not shrink with n."], { diagram: "clt", related: ["ds.ci", "ds.dist"] }),
          L("ds.ci", "Confidence intervals", 9,
            `<p>A confidence interval is <code>estimate ± critical value × standard error</code>. For 95% with a normal approximation the critical value is 1.96; for small samples of a mean use the t-distribution, which is wider.</p>
             <p>The interpretation is about the procedure: if you repeated the study many times, 95% of the intervals built this way would contain the true value. It does <b>not</b> say 95% of the data fall in the interval, and strictly it is not a 95% probability about this one interval.</p>
             <p>Width shrinks with √n and grows with variability and with the confidence level. For a proportion, SE = √(p(1−p)/n), largest at p = 0.5. When no formula applies, the <b>bootstrap</b> resamples the data with replacement to approximate the sampling distribution.</p>`,
            ["CI = estimate ± z × SE.", "95% describes the method's long-run coverage.", "Quadruple n to halve the width."], { related: ["ds.clt", "ds.hypo", "ba.ab"] }),
          L("ds.hypo", "Hypothesis tests and p-values", 11,
            `<p>A test starts from a <b>null hypothesis</b> H₀ (no effect) and asks how surprising the data would be if it were true. The <b>p-value</b> is the probability of a result at least as extreme as the one observed, assuming H₀. If p is below the pre-chosen significance level α (often 0.05), reject H₀.</p>
             <p>A p-value is not the probability that H₀ is true, and 1 − p is not the probability your effect is real. <b>Type I error</b>: rejecting a true null (rate α). <b>Type II error</b>: missing a real effect (rate β). <b>Power</b> = 1 − β rises with sample size, effect size and α.</p>
             <p>Statistical significance is not practical significance: with enough data a trivial effect becomes "significant". Testing many hypotheses inflates false positives; correct with Bonferroni or control the false discovery rate. Common tests: t-test (means), chi-square (categorical counts), ANOVA (several means).</p>`,
            ["p = P(data this extreme | H₀), not P(H₀ | data).", "α = false positive rate; power = 1 − β.", "Many tests → correct for multiplicity."], { diagram: "abtest", related: ["ba.ab", "ds.ci", "ba.pitfalls"] }),
        ]},
      ]},
      { name: "Working with data", topics: [
        { name: "Describe, clean, engineer", lessons: [
          L("ds.descriptive", "Descriptive statistics and outliers", 8,
            `<p>Summarize a variable by its <b>center</b> and <b>spread</b>. The mean uses every value and is dragged by extremes; the <b>median</b> is the middle value and is robust. In a right-skewed distribution (incomes, session lengths) the mean sits above the median, so report the median.</p>
             <p>Spread: <b>standard deviation</b> pairs with the mean; the <b>interquartile range</b> (Q3 − Q1) pairs with the median. A common outlier rule flags points beyond 1.5 × IQR from the quartiles; it is a prompt to investigate, not a license to delete.</p>
             <p>Always plot. Histograms show shape, box plots compare groups, scatter plots show relationships. Summary statistics can be identical for wildly different datasets (Anscombe's quartet).</p>`,
            ["Skewed data → median and IQR.", "Mean > median signals right skew.", "Look at the distribution before trusting a summary."], { related: ["ba.viz", "ds.dist"] }),
          L("ds.wrangling", "Cleaning data and handling missing values", 10,
            `<p>Most of the work is making data fit for analysis: fix types, standardize categories and units, remove exact duplicates, and validate ranges. In pandas the core verbs are filter (boolean masks), <code>groupby</code>-aggregate, <code>merge</code>, and reshape (<code>pivot</code>/<code>melt</code>). Check row counts before and after every join: an unexpected increase means duplicate keys.</p>
             <p>For missing data, first ask why it is missing. <b>MCAR</b>: unrelated to anything, safe to drop. <b>MAR</b>: related to observed columns, impute using them. <b>MNAR</b>: related to the missing value itself (high earners hiding income), which no imputation fully fixes.</p>
             <p>Simple imputation with the mean or median preserves row count but shrinks variance; adding an "is missing" indicator often carries real signal. Fit imputers on training data only.</p>`,
            ["Check row counts around joins.", "Why data is missing decides how to treat it.", "Mean imputation understates variance; add indicators."], { related: ["ba.joins", "ml.cv", "ds.features"] }),
          L("ds.features", "Feature engineering and encoding", 9,
            `<p>Models need numbers. For <b>nominal</b> categories use <b>one-hot</b> encoding (drop one level for linear models to avoid perfect collinearity). For <b>ordinal</b> ones, integers that respect the order are fine. High-cardinality categories blow up one-hot; use target encoding (computed out-of-fold to avoid leakage), hashing or learned embeddings.</p>
             <p><b>Scaling</b>: standardization (zero mean, unit variance) or min-max. Distance- and gradient-based models (kNN, SVM, neural nets, regularized regression) need it; tree models do not. A <b>log transform</b> tames right-skewed positive variables.</p>
             <p>Useful constructions: ratios, date parts, lags and rolling aggregates, interaction terms, text counts. For imbalanced targets, prefer class weights or resampling the training set only, and never evaluate on resampled data.</p>`,
            ["One-hot nominal, integer-code ordinal.", "Scale for distance/gradient models; trees don't care.", "Compute target encodings out-of-fold."], { related: ["ml.knnsvm", "ds.wrangling", "ml.pca"] }),
        ]},
      ]},
      { name: "Relationships and time", topics: [
        { name: "Modeling relationships", lessons: [
          L("ds.corr", "Correlation and causation", 9,
            `<p><b>Pearson's r</b> measures the strength of a <em>linear</em> relationship between −1 and 1. Zero correlation does not mean no relationship (a perfect U-shape has r ≈ 0), and r is sensitive to outliers. <b>Spearman's</b> rank correlation captures any monotonic trend.</p>
             <p>Correlation alone cannot establish cause. A <b>confounder</b> drives both variables (heat raises ice-cream sales and drownings). <b>Reverse causation</b> flips the arrow. <b>Selection bias</b> creates relationships by filtering who is observed; survivorship bias is the famous case. <b>Simpson's paradox</b>: a trend in every subgroup reverses when groups are pooled, because group sizes differ.</p>
             <p>The reliable route to causation is a <b>randomized experiment</b>: random assignment balances confounders, known and unknown, on average.</p>`,
            ["r measures linear association only.", "Confounding, reverse causation and selection all mimic causation.", "Randomization is what licenses causal claims."], { related: ["ba.ab", "ba.pitfalls", "ml.linreg"] }),
          L("ds.regression", "Interpreting regression", 10,
            `<p>In a multiple regression each coefficient is the expected change in y for a one-unit change in that feature, <b>holding the others fixed</b>. With a log-transformed target, coefficients read approximately as percentage changes. A coefficient's p-value tests whether it differs from zero; its confidence interval tells you how precisely it is known.</p>
             <p>Check the assumptions with a residual plot: residuals should be patternless (linearity), of even spread (<b>homoscedasticity</b>), independent, and roughly normal for inference. <b>Multicollinearity</b> (highly correlated predictors) leaves predictions fine but makes individual coefficients unstable with inflated standard errors; detect it with the variance inflation factor.</p>
             <p><b>Adjusted R²</b> penalizes extra predictors; plain R² never decreases when you add one. Omitting a confounder biases the coefficients of what remains.</p>`,
            ["Coefficients are 'all else equal' effects.", "Read the residual plot before the summary table.", "Collinearity wrecks coefficients, not predictions."], { diagram: "regression", related: ["ml.linreg", "ds.corr"] }),
          L("ds.timeseries", "Time series basics", 9,
            `<p>Observations over time are not independent. A series decomposes into <b>trend</b>, <b>seasonality</b> and residual. <b>Autocorrelation</b> is the correlation of the series with a lagged copy of itself. A <b>stationary</b> series has constant mean and variance over time; many models require it, and <b>differencing</b> (subtracting the previous value) usually achieves it.</p>
             <p>Baselines first: the naive forecast (last value) and the seasonal naive forecast (value one season ago) are surprisingly hard to beat. Moving averages and exponential smoothing weight recent points; ARIMA combines autoregression, differencing and moving-average terms.</p>
             <p>Validation must respect time: train on the past, test on the future, and build features only from information available at forecast time. Random shuffling leaks the future.</p>`,
            ["Trend + seasonality + residual.", "Difference to make a series stationary.", "Never validate on data earlier than the training set."], { related: ["ml.cv", "ai.rnn"] }),
        ]},
      ]},
    ],
  });

  /* ============================== BUSINESS & DATA ANALYTICS ============================== */
  GR.track({
    id: "ba", name: "Business & Data Analytics", color: "var(--t-ba)", icon: "BA",
    blurb: "SQL, metrics, experimentation and communication: the analyst's toolkit for product and business decisions.",
    modules: [
      { name: "SQL", topics: [
        { name: "Querying data", lessons: [
          L("ba.sql", "SELECT, filtering and aggregation", 10,
            `<p>A query is written <code>SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY … LIMIT</code> but evaluated in a different order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT. That is why <b>WHERE</b> filters rows before grouping and cannot use aggregates, while <b>HAVING</b> filters groups after aggregation.</p>
             <p>Every selected column must be either in the GROUP BY or inside an aggregate. <code>COUNT(*)</code> counts rows; <code>COUNT(col)</code> skips NULLs; <code>COUNT(DISTINCT col)</code> counts unique values. SUM and AVG also ignore NULLs.</p>
             <p><b>NULL</b> means unknown: any comparison with it yields unknown, so <code>col = NULL</code> never matches; use <code>IS NULL</code>. <code>COALESCE(a, b)</code> returns the first non-null. <code>CASE WHEN</code> gives conditional logic, including conditional aggregation such as <code>SUM(CASE WHEN paid THEN 1 ELSE 0 END)</code>.</p>`,
            ["WHERE filters rows; HAVING filters groups.", "COUNT(col) ignores NULLs; = NULL never matches.", "Logical order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY."], { related: ["ba.joins", "swe.db"] }),
          L("ba.joins", "Joins", 10,
            `<p>A join combines rows from two tables on a condition. <b>INNER</b> keeps only matching pairs. <b>LEFT</b> keeps every row of the left table, filling NULLs where the right has no match; RIGHT is the mirror. <b>FULL OUTER</b> keeps everything from both. <b>CROSS</b> pairs every row with every row.</p>
             <p>The most common bug is <b>fan-out</b>: if the key is not unique on the joined side, rows multiply and sums double-count. Aggregate to the right grain before joining, and check row counts.</p>
             <p>In a LEFT JOIN, a filter on the right table placed in WHERE discards the NULL rows and silently turns it into an inner join; put that condition in ON. To find rows with no match (an <b>anti-join</b>), LEFT JOIN and keep <code>WHERE right.key IS NULL</code>. UNION stacks results and removes duplicates; UNION ALL keeps them and is faster.</p>`,
            ["LEFT keeps all left rows; unmatched right columns are NULL.", "Non-unique keys multiply rows.", "Right-table filters belong in ON for outer joins."], { diagram: "joins", related: ["ds.wrangling", "ba.sql"] }),
          L("ba.window", "Window functions and CTEs", 11,
            `<p>A <b>window function</b> computes across related rows without collapsing them: <code>func() OVER (PARTITION BY … ORDER BY …)</code>. PARTITION BY defines the groups, ORDER BY the sequence within each.</p>
             <p>Ranking: <b>ROW_NUMBER</b> is always 1,2,3,4; <b>RANK</b> gives ties the same rank and then skips (1,2,2,4); <b>DENSE_RANK</b> does not skip (1,2,2,3). "Latest row per user" is ROW_NUMBER partitioned by user ordered by time descending, filtered to 1. <b>LAG/LEAD</b> read the previous or next row, ideal for period-over-period change. <code>SUM(x) OVER (ORDER BY day)</code> is a running total; add a frame like <code>ROWS BETWEEN 6 PRECEDING AND CURRENT ROW</code> for a 7-day rolling value.</p>
             <p>You cannot filter on a window function in WHERE of the same query; wrap it in a <b>CTE</b> (<code>WITH name AS (…)</code>), which also makes long queries readable step by step.</p>`,
            ["Windows add columns without collapsing rows.", "ROW_NUMBER vs RANK vs DENSE_RANK differ on ties.", "Filter window results via a CTE or subquery."], { related: ["ba.cohort", "ba.sql"] }),
        ]},
      ]},
      { name: "Metrics", topics: [
        { name: "Measuring a product", lessons: [
          L("ba.kpi", "KPIs, funnels and north-star metrics", 9,
            `<p>A good metric is tied to a goal, sensitive enough to move, hard to game, and understood by the people who act on it. A <b>north-star</b> metric captures delivered customer value (weekly active teams, nights booked). <b>Input</b> metrics are the levers that drive it. <b>Guardrail</b> metrics are things you must not damage while chasing the goal (latency, refund rate, unsubscribes).</p>
             <p>A <b>funnel</b> tracks conversion through ordered steps. Overall conversion is the product of step conversions, so the leakiest step is where an absolute improvement pays most. <b>Leading</b> indicators (activation in week one) predict <b>lagging</b> ones (annual retention).</p>
             <p>Beware <b>vanity metrics</b> such as cumulative sign-ups that only go up, and ratios whose denominator shifts. Always define a metric exactly: who counts, over what window, deduplicated how.</p>`,
            ["North star = value delivered; guardrails = what must not break.", "Funnel conversion multiplies across steps.", "Write the exact definition: unit, window, filter."], { diagram: "funnel", related: ["ba.cases", "ba.cohort"] }),
          L("ba.cohort", "Retention and cohort analysis", 9,
            `<p>A <b>cohort</b> is a group that shares a start event in the same period, typically sign-up week. A cohort table tracks what fraction is still active in each later period. Reading across a row shows how one cohort decays; reading down a column shows whether newer cohorts retain better than older ones at the same age.</p>
             <p>A healthy retention curve flattens into a plateau: some users stay indefinitely. A curve heading to zero means growth is filling a leaky bucket. <b>Churn rate</b> is the share of customers lost in a period; with constant monthly churn c, expected customer lifetime is 1/c months.</p>
             <p>Blended averages mislead when the mix changes: overall retention can fall simply because a large, young cohort arrived. <b>DAU/MAU</b> ("stickiness") measures how many days a month a typical active user shows up.</p>`,
            ["Cohorts separate age effects from mix effects.", "Flattening curve = product has a retained core.", "Lifetime ≈ 1 / churn rate."], { related: ["ba.unit", "ba.window"] }),
          L("ba.unit", "Unit economics: CAC, LTV and margins", 9,
            `<p><b>CAC</b> (customer acquisition cost) is total sales and marketing spend divided by new customers acquired. <b>LTV</b> (lifetime value) is the gross profit a customer generates over their lifetime; a simple model is <code>ARPU × gross margin ÷ churn rate</code>.</p>
             <p>Rules of thumb for subscription businesses: LTV:CAC of about 3:1 or better, and a <b>payback period</b> (CAC ÷ monthly gross profit per customer) under about 12 months. Use margin, not revenue: revenue-based LTV flatters low-margin businesses.</p>
             <p><b>MRR</b> is monthly recurring revenue; ARR is 12 × MRR. <b>Net revenue retention</b> above 100% means expansion from existing customers outweighs churn. <b>Contribution margin</b> is revenue minus variable costs per unit: if it is negative, selling more loses more.</p>`,
            ["LTV ≈ ARPU × margin ÷ churn.", "Healthy: LTV:CAC ≥ 3, payback ≤ 12 months.", "Compute LTV on gross profit, not revenue."], { related: ["ba.cohort", "ba.kpi"] }),
        ]},
      ]},
      { name: "Experimentation", topics: [
        { name: "A/B testing", lessons: [
          L("ba.ab", "Designing an A/B test", 11,
            `<p>An A/B test randomly assigns units (usually users) to control or treatment, so any difference in outcome beyond chance is caused by the change. Before launch, fix: the <b>hypothesis</b>, one <b>primary metric</b>, guardrails, the unit of randomization, and the <b>sample size</b>.</p>
             <p>Sample size depends on four things: baseline rate, the <b>minimum detectable effect</b> (MDE) you care about, significance level α (usually 5%) and <b>power</b> (usually 80%). Required n grows with 1/MDE²: detecting half the effect needs four times the users. Run for whole weeks to cover weekday patterns.</p>
             <p>Analyze with a two-sample test and report the effect with a confidence interval, not just "significant". In the diagram, shrink the lift and watch how much more sample you need to keep power.</p>`,
            ["Randomization is what makes the comparison causal.", "Decide metric, MDE and sample size before starting.", "Halving the MDE quadruples the sample."], { diagram: "abtest", related: ["ds.hypo", "ds.ci", "ds.corr"] }),
          L("ba.pitfalls", "Experiment pitfalls", 10,
            `<p><b>Peeking</b>: checking results repeatedly and stopping when p dips below 0.05 inflates the false-positive rate far above 5%. Fix the sample in advance or use a sequential method built for continuous monitoring.</p>
             <p><b>Sample ratio mismatch</b>: a 50/50 split that arrives as 52/48 at scale signals a broken assignment or logging pipeline; do not trust the result. <b>Multiple comparisons</b>: with 20 metrics, one will look significant by chance. <b>Novelty effects</b> fade and <b>primacy effects</b> (users resisting change) recover, so early reads mislead.</p>
             <p><b>Interference</b>: in marketplaces and social products one user's treatment affects another's outcome, violating independence; randomize by cluster, region or time instead. <b>Simpson's paradox</b> can reverse a result when segment mix differs between arms. And randomize on the same unit you analyze.</p>`,
            ["Peeking inflates false positives.", "Check the sample ratio before reading results.", "Network effects need cluster or switchback designs."], { related: ["ds.hypo", "ds.corr", "ba.ab"] }),
        ]},
      ]},
      { name: "Communicating and modeling", topics: [
        { name: "From analysis to decision", lessons: [
          L("ba.viz", "Choosing charts and building dashboards", 8,
            `<p>Pick the chart from the question. <b>Change over time</b>: line. <b>Comparison across categories</b>: bar, sorted, with the axis starting at zero. <b>Distribution</b>: histogram or box plot. <b>Relationship between two measures</b>: scatter. <b>Part of a whole</b>: stacked bar, or a pie only for two or three slices.</p>
             <p>Position and length are read most accurately; angle, area and color least. So avoid 3-D, dual y-axes that manufacture correlations, and truncated bar axes that exaggerate differences. Use color to mean something, label directly, and put the conclusion in the title.</p>
             <p>A dashboard should answer one audience's recurring questions at a glance: the few KPIs on top with comparison to target or prior period, then trends, then breakdowns. If nobody acts on a chart, remove it.</p>`,
            ["Line = time, bar = comparison, scatter = relationship, histogram = distribution.", "Bars start at zero.", "Lead with the takeaway."], { related: ["ds.descriptive", "ba.kpi"] }),
          L("ba.cases", "Metric investigations and product sense", 10,
            `<p>"Metric X dropped 10%. Why?" Work in a fixed order. <b>1. Is it real?</b> Check logging changes, pipeline delays, definition changes and seasonality (compare to the same weekday last week and last year). <b>2. Decompose.</b> Break the metric into its factors (revenue = users × conversion × order value) and find which moved. <b>3. Segment.</b> Slice by platform, country, app version, new versus returning, channel: a drop concentrated in one slice points at a cause. <b>4. Correlate with events</b>: releases, experiments, outages, marketing, competitors, holidays. <b>5. Recommend</b> an action and what to monitor.</p>
             <p>For "how would you measure success of feature Y?", state the goal, pick a primary metric that reflects user value, add guardrails and counter-metrics, and say how you would test it.</p>
             <p>Estimation questions reward structure: break the number into factors, state assumptions, sanity-check the result.</p>`,
            ["Verify the data before explaining it.", "Decompose, then segment.", "Answer with a recommendation, not just a finding."], { related: ["ba.kpi", "ba.pitfalls"] }),
          L("ba.modeling", "Data modeling and warehouses", 9,
            `<p>Analytical data is usually organized as a <b>star schema</b>: a central <b>fact table</b> of events or transactions (one row per order line, with numeric measures and foreign keys) surrounded by <b>dimension tables</b> describing the who, what, where and when (customer, product, date). The <b>grain</b>, what one row of the fact table represents, is the first thing to decide and to state.</p>
             <p><b>OLTP</b> databases serve the application: many small reads and writes, normalized, row-oriented. <b>OLAP</b> warehouses serve analysis: few large scans and aggregations, denormalized, <b>columnar</b> storage so a query reads only the columns it needs.</p>
             <p><b>ETL</b> transforms before loading; <b>ELT</b> loads raw data and transforms inside the warehouse, which is now the norm. <b>Slowly changing dimensions</b> (type 2) keep history by adding a new row with validity dates when an attribute changes.</p>`,
            ["Facts hold measures; dimensions hold context.", "Declare the grain of every table.", "OLTP = transactions, row store; OLAP = analytics, column store."], { related: ["swe.db", "ba.joins"] }),
        ]},
      ]},
    ],
  });

  /* ============================== SOFTWARE ENGINEERING ============================== */
  GR.track({
    id: "swe", name: "Software Engineering", color: "var(--t-swe)", icon: "SWE",
    blurb: "Algorithms, data structures and system fundamentals, with hands-on coding practice.",
    modules: [
      { name: "Algorithmic foundations", topics: [
        { name: "Analysis and arrays", lessons: [
          L("swe.bigo", "Complexity and Big-O", 9,
            `<p><b>Big-O</b> describes how running time or memory grows with input size n, ignoring constants and lower-order terms: 3n² + 10n is O(n²). The common classes in order: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ), O(n!).</p>
             <p>Read it off the code. Sequential blocks add; nested loops multiply. A loop that halves its range each time is O(log n). Sorting is O(n log n). Two nested loops over the input is O(n²). Recursion that branches twice per level to depth n is O(2ⁿ).</p>
             <p>Distinguish worst case, average case, and <b>amortized</b> cost: appending to a dynamic array is O(1) amortized even though an occasional resize costs O(n). Space complexity counts extra memory, including the recursion stack. Trading space for time (a hash set, a memo table) is the most common optimization.</p>`,
            ["Drop constants and lower-order terms.", "Nested loops multiply; halving gives log n.", "Amortized O(1) ≠ every operation is O(1)."], { diagram: "bigo", related: ["swe.sorting", "ml.knnsvm"] }),
          L("swe.arrays", "Arrays, hashing and two pointers", 10,
            `<p>An array gives O(1) access by index, but inserting or deleting in the middle is O(n) because elements shift. A <b>hash map</b> gives average O(1) insert, lookup and delete by key, at the cost of memory and no ordering. Reaching for a hash map or set is the standard way to turn an O(n²) "have I seen this?" scan into O(n).</p>
             <p><b>Two pointers</b>: on a sorted array, start one index at each end and move them inward based on a comparison (pair with target sum, palindromes), or run a slow and a fast pointer in one direction (removing duplicates in place). <b>Sliding window</b>: maintain a window [left, right] and its running state, growing on the right and shrinking on the left while a condition is violated; each element enters and leaves once, so the whole pass is O(n).</p>
             <p><b>Prefix sums</b> answer any range-sum query in O(1) after O(n) setup.</p>`,
            ["Hash maps trade memory for O(1) lookups.", "Two pointers need sorted input or a clear invariant.", "Sliding window: each element enters and leaves once."], { related: ["swe.bigo", "swe.search"] }),
          L("swe.search", "Binary search", 8,
            `<p>Binary search finds a target in a <b>sorted</b> array by checking the middle and discarding the half that cannot contain it. Each step halves the range, so it takes O(log n): about 20 steps for a million elements, 30 for a billion.</p>
             <p>Keep an invariant: the answer, if present, is within [lo, hi]. Compute <code>mid = lo + (hi − lo) // 2</code>, then move <code>lo = mid + 1</code> or <code>hi = mid − 1</code>. Off-by-one errors and loops that never shrink are the usual bugs, so decide up front whether hi is inclusive.</p>
             <p>The idea generalizes to any <b>monotonic</b> yes/no question: "is capacity c enough?" flips from no to yes exactly once, so you can binary-search the smallest feasible c. This "search on the answer" pattern appears constantly in interviews. Try the diagram: you play the algorithm and pick each midpoint.</p>`,
            ["Requires sorted (or monotonic) input.", "O(log n): halve the range each step.", "Works on any monotonic predicate, not just arrays."], { diagram: "binsearch", related: ["swe.bigo", "swe.sorting"] }),
          L("swe.sorting", "Sorting algorithms", 10,
            `<p>The simple sorts, <b>bubble</b>, <b>selection</b> and <b>insertion</b>, are O(n²). Insertion sort is O(n) on nearly sorted input and is used for small arrays in practice.</p>
             <p><b>Merge sort</b> splits in half, sorts each half and merges: O(n log n) always, <b>stable</b>, but needs O(n) extra space. <b>Quicksort</b> partitions around a pivot and recurses: O(n log n) on average, in place, but O(n²) in the worst case when pivots are consistently bad (mitigated by random pivots). <b>Heapsort</b> is O(n log n) in place but not stable.</p>
             <p>A sort is <b>stable</b> if equal keys keep their original order, which matters when sorting by several fields in succession. No comparison sort can beat O(n log n); counting and radix sort do so by exploiting bounded integer keys. Library sorts (Timsort, introsort) are hybrids.</p>`,
            ["Merge: O(n log n), stable, extra space. Quick: fast average, O(n²) worst.", "Comparison sorts are bounded below by n log n.", "Stability preserves the order of equal keys."], { diagram: "sorting", related: ["swe.bigo", "swe.recursion"] }),
        ]},
      ]},
      { name: "Data structures", topics: [
        { name: "Linear and hierarchical structures", lessons: [
          L("swe.linked", "Linked lists, stacks and queues", 9,
            `<p>A <b>linked list</b> stores nodes that point to the next node. Inserting or deleting at a known node is O(1), but reaching the k-th element is O(k) and there is no random access. Standard techniques: a dummy head node to simplify edge cases, reversing by re-pointing as you walk, and slow/fast pointers to find the middle or detect a cycle.</p>
             <p>A <b>stack</b> is last-in-first-out: push and pop at one end. It models nesting and undo: bracket matching, expression evaluation, the call stack, depth-first search. A <b>queue</b> is first-in-first-out: enqueue at the back, dequeue at the front. It models waiting lines and breadth-first search. A <b>deque</b> supports both ends in O(1).</p>
             <p>A <b>monotonic stack</b> keeps its elements in sorted order and solves "next greater element" problems in O(n).</p>`,
            ["Linked list: O(1) splice, O(n) access.", "Stack = LIFO (nesting, DFS); queue = FIFO (BFS).", "Slow/fast pointers detect cycles."], { related: ["swe.graphs", "swe.arrays"] }),
          L("swe.trees", "Trees, BSTs and heaps", 10,
            `<p>A <b>binary tree</b> node has up to two children. Traversals: <b>in-order</b> (left, node, right), <b>pre-order</b> (node first), <b>post-order</b> (node last), and <b>level-order</b> (breadth-first with a queue). Most tree problems are a short recursion: solve for the children, combine at the node.</p>
             <p>A <b>binary search tree</b> keeps left subtree &lt; node &lt; right subtree, so in-order traversal yields sorted order and search, insert and delete are O(h) in the height. Balanced trees keep h = O(log n); a degenerate BST built from sorted input has h = n.</p>
             <p>A <b>heap</b> is a complete binary tree where every parent is ≤ its children (min-heap). The minimum is at the root in O(1); push and pop are O(log n). It implements a <b>priority queue</b> and solves "top k" in O(n log k). A <b>trie</b> stores strings by shared prefixes for fast prefix lookup.</p>`,
            ["BST in-order = sorted; operations are O(height).", "Heap: O(1) peek, O(log n) push/pop.", "Top-k → heap of size k."], { related: ["swe.recursion", "swe.graphs"] }),
          L("swe.graphs", "Graphs: BFS and DFS", 10,
            `<p>A graph is nodes plus edges, stored as an <b>adjacency list</b> (space O(V+E), the usual choice) or an adjacency matrix (O(V²), O(1) edge lookup). Grids are graphs whose neighbors are adjacent cells.</p>
             <p><b>Breadth-first search</b> explores in rings using a queue and finds the <b>shortest path in an unweighted graph</b>. <b>Depth-first search</b> goes as deep as possible using a stack or recursion and suits connectivity, cycle detection and <b>topological sorting</b> of a DAG. Both are O(V+E) and both need a visited set to avoid loops.</p>
             <p>For weighted graphs with non-negative edges, <b>Dijkstra's algorithm</b> with a min-heap finds shortest paths in O((V+E) log V). <b>Union-find</b> tracks connected components under edge additions. Step through both traversals in the diagram and watch the frontier structure.</p>`,
            ["BFS = queue = shortest unweighted paths.", "DFS = stack/recursion = cycles, topological order.", "Always track visited; both are O(V+E)."], { diagram: "graph", related: ["swe.linked", "swe.trees"] }),
        ]},
      ]},
      { name: "Algorithm design", topics: [
        { name: "Recursive thinking", lessons: [
          L("swe.recursion", "Recursion and backtracking", 9,
            `<p>A recursive function solves a problem by calling itself on smaller instances. It needs a <b>base case</b> that stops the recursion and a <b>recursive case</b> that makes progress toward it. Each call occupies a stack frame, so depth n costs O(n) space, and unbounded depth overflows the stack.</p>
             <p><b>Divide and conquer</b> splits the input, solves the parts independently and combines them (merge sort, binary search). <b>Backtracking</b> builds a solution one choice at a time, recursing on each option and undoing the choice when it leads nowhere: generate subsets (2ⁿ), permutations (n!), N-queens, sudoku. The template is choose, explore, un-choose, with <b>pruning</b> to cut branches that cannot succeed.</p>
             <p>If the same subproblem is solved repeatedly, cache it; that is the bridge to dynamic programming.</p>`,
            ["Base case + progress toward it.", "Backtracking: choose → explore → undo.", "Recursion depth costs stack space."], { related: ["swe.dp", "swe.trees"] }),
          L("swe.dp", "Dynamic programming", 11,
            `<p>Dynamic programming applies when a problem has <b>overlapping subproblems</b> (the same smaller question recurs) and <b>optimal substructure</b> (the best answer is built from best answers to subproblems). Naive recursive Fibonacci is O(2ⁿ); caching each result makes it O(n).</p>
             <p>The recipe: 1) define the <b>state</b>, what dp[i] (or dp[i][j]) means in words; 2) write the <b>transition</b> from smaller states; 3) set base cases; 4) pick the order. <b>Top-down</b> is recursion plus a memo; <b>bottom-up</b> fills a table iteratively and often lets you keep only the last row.</p>
             <p>Canonical shapes: climbing stairs (dp[i] = dp[i−1] + dp[i−2]), coin change (min over coins of dp[amount − coin] + 1), 0/1 knapsack, longest common subsequence (2-D over two prefixes), edit distance. Greedy algorithms are faster but only correct when a local choice is provably safe.</p>`,
            ["Overlapping subproblems + optimal substructure.", "Define the state in words before coding.", "Memoize top-down or tabulate bottom-up."], { related: ["swe.recursion", "swe.bigo"] }),
        ]},
      ]},
      { name: "Engineering systems", topics: [
        { name: "Beyond the algorithm", lessons: [
          L("swe.sysdesign", "System design fundamentals", 11,
            `<p>Scale <b>vertically</b> (a bigger machine) until it stops paying, then <b>horizontally</b> (more machines behind a <b>load balancer</b>). Horizontal scaling wants <b>stateless</b> services so any instance can serve any request, with state pushed to databases and caches.</p>
             <p>A <b>cache</b> (Redis, CDN) serves hot data from memory; the hard parts are invalidation and eviction (LRU is the common policy). <b>Replication</b> copies data for read scaling and availability; <b>sharding</b> partitions it across nodes for write scaling. <b>Message queues</b> decouple producers from consumers and absorb bursts.</p>
             <p>The <b>CAP theorem</b>: when the network partitions, a distributed store must give up either consistency or availability. Many systems choose <b>eventual consistency</b>. In an interview: clarify requirements and scale, estimate load, sketch the API and data model, draw the high-level design, then drill into bottlenecks and trade-offs.</p>`,
            ["Stateless services scale horizontally.", "Cache reads, replicate for availability, shard for writes.", "Under partition choose consistency or availability."], { related: ["swe.db", "ai.deploy"] }),
          L("swe.db", "Databases, indexes and transactions", 10,
            `<p>An <b>index</b> (usually a B-tree) lets the database find rows in O(log n) instead of scanning the table. It speeds reads on the indexed columns and slows writes, because every index must be updated. A composite index on (a, b) serves filters on a, or on a and b, but not on b alone.</p>
             <p>A <b>transaction</b> groups operations with <b>ACID</b> guarantees: <b>atomic</b> (all or nothing), <b>consistent</b> (constraints hold), <b>isolated</b> (concurrent transactions do not interfere, to a degree set by the isolation level), <b>durable</b> (committed data survives a crash).</p>
             <p><b>Normalization</b> removes redundancy so each fact lives in one place; denormalize deliberately for read speed. Relational databases suit structured data with joins and strong consistency. NoSQL stores (key-value, document, wide-column, graph) trade some of that for flexible schemas or horizontal scale. The <b>N+1 query</b> problem, one query per row of a list, is a classic performance bug.</p>`,
            ["Indexes speed reads, slow writes; column order matters.", "ACID = atomic, consistent, isolated, durable.", "Normalize for integrity, denormalize for reads."], { related: ["ba.sql", "ba.modeling", "swe.sysdesign"] }),
          L("swe.practices", "Testing, APIs and engineering practice", 9,
            `<p>The <b>test pyramid</b>: many fast <b>unit</b> tests of single functions, fewer <b>integration</b> tests across components, a handful of slow <b>end-to-end</b> tests. Tests are what make refactoring safe. Mocks isolate a unit from slow or flaky dependencies.</p>
             <p><b>REST</b> APIs model resources with HTTP verbs: GET reads and is safe; PUT and DELETE are <b>idempotent</b> (repeating them has the same effect as doing them once); POST creates and is not. Status codes: 2xx success, 4xx the client's fault (400, 401 unauthenticated, 403 forbidden, 404, 429 rate limited), 5xx the server's.</p>
             <p><b>Git</b>: commits are snapshots; branches are pointers; merge preserves history, rebase rewrites it into a line (never rebase shared branches). <b>CI/CD</b> runs tests and deploys on every change. Object-oriented design leans on encapsulation, polymorphism and composition over deep inheritance; the SOLID principles summarize the common advice.</p>`,
            ["Many unit tests, few end-to-end tests.", "GET/PUT/DELETE are idempotent; POST is not.", "401 = who are you; 403 = you may not."], { related: ["swe.sysdesign", "ai.agents"] }),
        ]},
      ]},
    ],
  });
})();
