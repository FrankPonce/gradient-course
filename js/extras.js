/* Gap-fillers: extra lessons slotted into existing tracks (with their questions), one more diagram and a few coding problems. */
(function () {
  const L = (skill, title, mins, body, keys, extra = {}) => Object.assign({ skill, title, mins, body, keys }, extra);
  const Q = GR.Q, G = GR.G, N = GR.nopts, S = GR.S, T = GR.tbl, f2 = (x) => x.toFixed(2);

  GR.extend("ml", "Core models", "Boosting and messy reality", [
    L("ml.boosting", "Gradient boosting", 9,
      `<p>A random forest trains many trees <b>independently</b> and averages them (bagging), which mainly cuts variance. <b>Boosting</b> trains trees <b>one after another</b>, each new small tree fitting the errors the current ensemble still makes, which mainly cuts bias. <b>Gradient boosting</b> makes "the errors" precise: each tree fits the negative gradient of the loss.</p>
       <p>The main dials: <b>number of trees</b>, <b>learning rate</b> (how much each tree contributes; smaller needs more trees but generalizes better), <b>tree depth</b> (usually shallow, 3 to 8) and row/column <b>subsampling</b>. Unlike a random forest, adding trees eventually <b>overfits</b>, so use <b>early stopping</b> on a validation set.</p>
       <p>Libraries such as <b>XGBoost</b>, <b>LightGBM</b> and <b>CatBoost</b> are the default winners on tabular data: they handle mixed feature types, missing values and non-linear interactions with little preprocessing, and need no feature scaling.</p>`,
      ["Bagging: parallel trees, cuts variance. Boosting: sequential trees, cuts bias.", "Lower learning rate + more trees + early stopping.", "The default strong baseline for tabular data."], { related: ["ml.trees", "ml.biasvar"] }),
    L("ml.imbalance", "Imbalanced classes", 8,
      `<p>When positives are rare (fraud, disease, churn), a model can score 99% accuracy by predicting "negative" every time. Switch to metrics that look at the rare class: <b>precision</b>, <b>recall</b>, <b>F1</b> and the <b>precision-recall curve</b> (PR-AUC), which is more informative than ROC-AUC when positives are scarce.</p>
       <p>Fixes, roughly in the order to try them: <b>move the decision threshold</b> (0.5 is arbitrary; pick it from the costs of each error); use <b>class weights</b> so mistakes on the rare class cost more in the loss; <b>resample</b> the training set (undersample the majority, oversample the minority, or synthesize with SMOTE).</p>
       <p>Two rules: resample <b>only the training data</b>, never validation or test, which must keep the real class balance; and use <b>stratified</b> splits so every fold contains positives. Resampling distorts predicted probabilities, so recalibrate if you need them.</p>`,
      ["Accuracy misleads; use precision, recall, PR-AUC.", "Threshold first, then class weights, then resampling.", "Resample only the training set; stratify splits."], { related: ["ml.metrics", "ml.roc"] }),
  ]);

  GR.extend("ai", "Large language models", "Adapting models", [
    L("ai.finetune", "Fine-tuning, LoRA and when to use them", 9,
      `<p>Try things in order of cost: a better <b>prompt</b>, then <b>few-shot examples</b>, then <b>retrieval</b> for missing knowledge, and only then <b>fine-tuning</b>, which changes the model's weights. Fine-tune to change <b>behavior</b> (a consistent style or format, a narrow task done reliably, a smaller model matching a larger one), not to add facts that change often: retrieval does that better.</p>
       <p><b>Full fine-tuning</b> updates every weight: expensive, and each task needs its own full copy. <b>LoRA</b> (low-rank adaptation) freezes the model and trains small low-rank matrices added to some layers, typically well under 1% of the parameters. Adapters are megabytes instead of gigabytes, cheap to train and swappable. <b>QLoRA</b> does this on a quantized model to fit modest GPUs.</p>
       <p>Risks: <b>overfitting</b> a small dataset, and <b>catastrophic forgetting</b> of general ability. You need a few hundred to a few thousand high-quality examples and an eval set held out from them. Chat models are also aligned with <b>preference-based</b> methods (RLHF, DPO) that train on which of two answers humans prefer.</p>`,
      ["Prompt → few-shot → RAG → fine-tune, in that order.", "Fine-tune for behavior; retrieve for knowledge.", "LoRA trains tiny low-rank adapters on a frozen model."], { related: ["ai.llm", "ai.rag"] }),
  ]);

  GR.extend("ds", "Relationships and time", "Causal thinking", [
    L("ds.causal", "Causal inference: when you can't run an A/B test", 10,
      `<p>The gold standard for "did X cause Y?" is a randomized experiment, because randomization makes the groups alike in everything except the treatment. When you can't randomize, a <b>confounder</b> (something that drives both the treatment and the outcome) can fake or hide an effect: premium users buy more, but they were bigger spenders before they upgraded.</p>
       <p>Tools for observational data. <b>Difference-in-differences</b>: compare the before-and-after change in a treated group with the change in an untreated group; it relies on the <b>parallel trends</b> assumption (both would have moved alike without treatment). <b>Matching / propensity scores</b>: compare treated units with untreated ones that had a similar probability of treatment. <b>Regression discontinuity</b>: compare units just above and just below an arbitrary cutoff. <b>Instrumental variables</b>: use something that shifts the treatment but affects the outcome no other way.</p>
       <p>Every method swaps randomization for an assumption you must defend. Say the assumption out loud, and check it where you can.</p>`,
      ["Confounders drive both treatment and outcome.", "Diff-in-diff needs parallel trends.", "Each method trades randomization for a stated assumption."], { related: ["ds.corr", "ba.ab"] }),
  ]);

  GR.extend("ba", "Communicating and modeling", "Thinking on your feet", [
    L("ba.estimate", "Estimation and structured problem solving", 8,
      `<p>"How many pizzas are sold in Chicago each day?" Nobody expects the right number. Interviewers are checking whether you can <b>structure</b> an unknown. Break the quantity into factors you can reason about, state each assumption, compute, then <b>sanity-check</b>.</p>
       <p>Example: 2.7 million people; say a person eats pizza twice a month; that is 5.4 million servings a month, about 180,000 a day; at roughly 3 servings per pizza, about 60,000 pizzas a day. Round aggressively: the goal is the right <b>order of magnitude</b>.</p>
       <p>The same skeleton handles product questions ("why did sign-ups drop 10%?"): <b>clarify</b> the metric and time frame; <b>segment</b> (platform, region, new vs returning, channel); separate <b>internal</b> causes (releases, tracking bugs, pricing) from <b>external</b> ones (seasonality, competitors, outages); form hypotheses and say what data would confirm each. Top-down (population × rate) and bottom-up (units × capacity) estimates should roughly agree.</p>`,
      ["Decompose, state assumptions, compute, sanity-check.", "Aim for the right order of magnitude.", "For metric drops: clarify, segment, internal vs external."], { related: ["ba.cases", "fnd.interview"] }),
  ]);

  /* ---- ml.boosting ---- */
  Q("ml.boosting", 1, "In boosting, each new tree is trained to:", ["Correct the errors of the trees before it", "Be independent of all other trees", "Memorize the training set", "Predict a random target"], "Trees are added sequentially, each fitting what the ensemble still gets wrong.");
  Q("ml.boosting", 2, "How does boosting differ from bagging (random forests)?", ["Boosting builds trees sequentially; bagging builds them independently", "Boosting uses no trees", "Bagging always overfits", "They are identical"], "Bagging averages independent trees to cut variance; boosting adds trees to cut bias.");
  Q("ml.boosting", 2, "Lowering the learning rate in gradient boosting generally requires:", ["More trees", "Fewer trees", "Deeper trees only", "No other change"], "Each tree contributes less, so more are needed, usually with better generalization.");
  Q("ml.boosting", 2, "Unlike a random forest, adding more and more trees to a boosted model can:", ["Overfit, so early stopping is used", "Never change the result", "Only reduce accuracy on training data", "Remove the need for validation"], "Boosting keeps fitting residuals, eventually fitting noise.");
  Q("ml.boosting", 2, "Do gradient-boosted trees need feature scaling?", ["No: tree splits depend on the order of values, not their scale", "Yes, always standardize", "Only for binary features", "Only with XGBoost"], "Splits are thresholds, so monotonic rescaling changes nothing.");
  Q("ml.boosting", 3, "On a medium-sized tabular dataset with mixed feature types, a strong first model is usually:", ["Gradient-boosted trees", "A deep convolutional network", "k-means", "A transformer trained from scratch"], "XGBoost and LightGBM remain the default strong baseline for tabular data.");

  /* ---- ml.imbalance ---- */
  Q("ml.imbalance", 1, "1% of transactions are fraud. A model that always predicts 'not fraud' has an accuracy of:", ["99%", "1%", "50%", "0%"], "Which is exactly why accuracy is the wrong metric here.");
  Q("ml.imbalance", 2, "With rare positives, which curve is usually more informative than ROC?", ["The precision-recall curve", "The learning curve", "The loss curve", "The calibration curve only"], "ROC-AUC can look excellent while precision is poor; PR focuses on the rare class.");
  Q("ml.imbalance", 2, "The cheapest first response to class imbalance is to:", ["Choose a decision threshold other than 0.5 based on error costs", "Collect ten times more data", "Delete the majority class", "Switch to a neural network"], "The threshold is free to change and often enough.");
  Q("ml.imbalance", 2, "Class weights address imbalance by:", ["Making errors on the rare class cost more in the loss", "Deleting majority examples", "Creating synthetic features", "Changing the test set"], "The optimizer then pays more attention to the minority class.");
  Q("ml.imbalance", 3, "You oversample the minority class before splitting into train and test. What goes wrong?", ["Copies of the same example land in both sets, inflating test scores", "Nothing", "The model underfits", "Training becomes slower only"], "Split first; resample only the training portion.");
  Q("ml.imbalance", 3, "Why should the test set keep the real class balance?", ["So the metrics reflect what will happen in production", "To make training faster", "Because resampling is illegal", "To increase recall"], "A rebalanced test set measures performance on a world that doesn't exist.");
  G("ml.imbalance", 2, (r) => { const tp = r.int(30, 60), fp = r.int(20, 90), fn = r.int(10, 40); const p = tp / (tp + fp), rc = tp / (tp + fn), v = (2 * p * rc) / (p + rc); return { stem: `A fraud model has ${tp} true positives, ${fp} false positives and ${fn} false negatives. What is its F1 score?`, opts: N(v, [p, rc, (p + rc) / 2 + 0.07], f2), expl: `Precision ${f2(p)}, recall ${f2(rc)}. F1 = 2PR / (P + R) = ${f2(v)}.` }; });

  /* ---- ai.finetune ---- */
  Q("ai.finetune", 1, "Before fine-tuning a model you should usually first try:", ["Better prompts, few-shot examples and retrieval", "Training a new model from scratch", "A larger GPU", "Deleting the system prompt"], "They are cheaper, faster to iterate and often enough.");
  Q("ai.finetune", 2, "Fine-tuning is best suited to:", ["Teaching a consistent behavior, style or narrow task", "Adding facts that change every week", "Reducing the context window", "Fixing a slow network"], "For changing knowledge, retrieval is cheaper and stays current.");
  Q("ai.finetune", 2, "LoRA works by:", ["Freezing the model and training small low-rank matrices added to its layers", "Retraining every weight", "Deleting attention heads", "Quantizing the tokenizer"], "Only a tiny fraction of parameters is trained.");
  Q("ai.finetune", 2, "A practical advantage of LoRA adapters is that they:", ["Are small and can be swapped on one shared base model", "Make the base model larger", "Remove the need for data", "Guarantee no overfitting"], "One base model can serve many tasks, each with its own megabyte-scale adapter.");
  Q("ai.finetune", 3, "Catastrophic forgetting means a fine-tuned model:", ["Loses general abilities it had before", "Forgets its tokenizer", "Refuses all prompts", "Deletes its training data"], "Narrow training can overwrite broad capabilities.");
  Q("ai.finetune", 3, "QLoRA makes fine-tuning cheaper by:", ["Training adapters on top of a quantized (for example 4-bit) base model", "Skipping backpropagation", "Using a smaller dataset only", "Training the embedding layer alone"], "Quantization cuts memory so large models fit on modest GPUs.");
  G("ai.finetune", 2, (r) => { const d = r.pick([1024, 2048, 4096]), rank = r.pick([4, 8, 16]); const full = d * d, lora = 2 * d * rank; return { stem: `A weight matrix is ${d} × ${d}. LoRA replaces its update with two matrices of rank ${rank} (${d} × ${rank} and ${rank} × ${d}). How many trainable parameters is that, compared with the full matrix?`, opts: [`${lora.toLocaleString("en-US")} vs ${full.toLocaleString("en-US")} (${((lora / full) * 100).toFixed(1)}%)`, `${full.toLocaleString("en-US")} vs ${full.toLocaleString("en-US")} (100%)`, `${(d * rank).toLocaleString("en-US")} vs ${full.toLocaleString("en-US")} (${((d * rank / full) * 100).toFixed(1)}%)`, `${(rank * rank).toLocaleString("en-US")} vs ${full.toLocaleString("en-US")}`], expl: `2 × ${d} × ${rank} = ${lora.toLocaleString("en-US")}, against ${d}² = ${full.toLocaleString("en-US")}.` }; });

  /* ---- ds.causal ---- */
  Q("ds.causal", 1, "Why does randomization allow causal conclusions?", ["It makes the groups alike on average in everything except the treatment", "It increases the sample size", "It removes noise", "It guarantees significance"], "Known and unknown confounders are balanced by chance.");
  Q("ds.causal", 2, "Users who enable notifications are more active. Before claiming notifications cause activity, the main worry is:", ["Confounding: already-engaged users are the ones who enable notifications", "The sample is too large", "Activity can't be measured", "Notifications are free"], "Engagement may drive both the choice and the outcome.");
  Q("ds.causal", 2, "Difference-in-differences compares:", ["The change over time in a treated group with the change in an untreated group", "Two groups at one point in time", "One group before and after only", "Two different metrics"], "Subtracting the control group's change removes shared trends.");
  Q("ds.causal", 2, "The key assumption of difference-in-differences is:", ["Parallel trends: both groups would have changed alike without the treatment", "Equal group sizes", "Normally distributed outcomes", "No missing data"], "Check it by comparing the groups' trends before the treatment.");
  Q("ds.causal", 3, "A scholarship goes to students scoring 80 or above. Comparing students who scored 79 with those who scored 80 is:", ["Regression discontinuity", "Difference-in-differences", "An A/B test", "Propensity matching"], "Just around the cutoff, assignment is nearly as good as random.");
  Q("ds.causal", 3, "Propensity score matching pairs treated units with untreated units that have:", ["A similar estimated probability of receiving the treatment", "The same outcome", "The same ID", "Opposite characteristics"], "It balances observed confounders; unobserved ones remain a risk.");
  G("ds.causal", 2, (r) => { const tb = r.int(40, 60), ta = tb + r.int(8, 20), cb = r.int(40, 60), ca = cb + r.int(1, 7); const v = ta - tb - (ca - cb); return { stem: `A feature launched in Region A only. Weekly orders per 1,000 users: Region A went from ${tb} to ${ta}; Region B (no launch) went from ${cb} to ${ca}. What is the difference-in-differences estimate of the feature's effect?`, opts: N(v, [ta - tb, ta - ca, ca - cb]), expl: `(${ta} − ${tb}) − (${ca} − ${cb}) = ${ta - tb} − ${ca - cb} = ${v}. Region B's change estimates what would have happened anyway.` }; });

  /* ---- ba.estimate ---- */
  Q("ba.estimate", 1, "In a market-sizing question, interviewers mainly evaluate:", ["How you structure the problem and justify assumptions", "Whether you know the exact number", "How fast you answer", "Your memory of statistics"], "The method is the answer.");
  Q("ba.estimate", 2, "What should you do right after computing an estimate?", ["Sanity-check it against something you know", "Add more decimal places", "Stop talking", "Start over"], "A quick reasonableness check catches order-of-magnitude slips.");
  Q("ba.estimate", 2, "Sign-ups fell 10% week over week. A good first step is to:", ["Clarify the metric and segment it by platform, channel and region", "Blame marketing", "Launch a new feature", "Wait a month"], "Segmenting shows whether the drop is broad or concentrated.");
  Q("ba.estimate", 2, "Which is an internal cause of a metric drop?", ["A tracking bug introduced in last week's release", "A competitor's launch", "A public holiday", "Bad weather"], "Releases, pricing and tracking changes are internal; seasonality and competitors are external.");
  Q("ba.estimate", 3, "Your top-down estimate is 50,000 and your bottom-up estimate is 5 million. You should:", ["Revisit the assumptions: a 100× gap means one of them is badly off", "Average them", "Report the larger one", "Report the smaller one"], "The two approaches should land in the same order of magnitude.");
  G("ba.estimate", 2, (r) => { const pop = r.pick([1, 2, 5]), share = r.pick([0.2, 0.5]), per = r.pick([2, 4, 6]); const v = (pop * 1e6 * share * per) / 12; return { stem: `A city has ${pop} million people. You assume ${share * 100}% of them get haircuts, ${per} times a year each. About how many haircuts happen per month?`, opts: N(v, [pop * 1e6 * share * per, v / 10, pop * 1e6 * share], (x) => Math.round(x).toLocaleString("en-US")), expl: `${pop}M × ${share} × ${per} ÷ 12 ≈ ${Math.round(v).toLocaleString("en-US")}.` }; });

  S("ds.causal", "Did the loyalty program work?", (r) => {
    const mb = r.int(52, 58), ma = mb + r.int(10, 16), nb = r.int(30, 36), na = nb + r.int(3, 7);
    return {
      stim: `<p>A retailer launched a loyalty program. Customers chose whether to join. Average monthly spend:</p>` + T(["Group", "3 months before", "3 months after"], [["Joined the program", "$" + mb, "$" + ma], ["Did not join", "$" + nb, "$" + na]], "Average spend per customer"),
      parts: [
        ["ds.causal", 1, `The marketing team says: "Members spend $${ma - na} more than non-members, so the program adds $${ma - na}." What is wrong?`, ["Members already spent more before joining, so the gap is not caused by the program", "The sample is too small", "Spend can't be averaged", "Nothing is wrong"], `Before the launch, joiners already spent $${mb - nb} more. Self-selection confounds the comparison.`],
        ["ds.causal", 2, "What is the difference-in-differences estimate?", N(ma - mb - (na - nb), [ma - na, ma - mb, na - nb], (x) => "$" + x), `($${ma} − $${mb}) − ($${na} − $${nb}) = $${ma - mb - (na - nb)}.`],
        ["ds.causal", 2, "That estimate is valid only if:", ["Joiners' and non-joiners' spending would have followed parallel trends without the program", "Both groups are the same size", "Spend is normally distributed", "Everyone joined on the same day"], "If joiners were already on a steeper upward trend, the estimate overstates the effect."],
        ["ds.causal", 3, "How could the retailer measure the effect most credibly next time?", ["Randomly offer the program to some customers and not others", "Survey members about satisfaction", "Compare with last year", "Only analyze the biggest spenders"], "Randomizing the offer removes self-selection."],
      ],
    };
  });

  /* ---------- diagram: compounding, contributions and fees ---------- */
  const { S: SV, T: TX, K, frame, slider, chips, sc, line, axis } = GR.dg;
  GR.diagrams.compound = { title: "Compounding and the cost of fees", blurb: "Monthly contributions growing at a steady return. Add a fee and watch how much of the final balance it quietly eats.", skills: ["fin.tvm", "fin.costs"],
    tasks: ["Set the return to 7% and the horizon to 40 years. How much of the final balance is growth rather than contributions?", "Raise the fee from 0.1% to 2%. What share of the no-fee balance is lost?", "Compare 20 years with 40 years at the same settings. Why is the second half worth so much more than the first?"],
    mount(host) {
      const { ctl, svg, read } = frame(host, 720, 340); let m = 300, ret = 7, fee = 1, yrs = 30;
      const path = (rate) => { const o = [0]; let v = 0; for (let y = 1; y <= yrs; y++) { v = (v + m * 12) * (1 + rate / 100); o.push(v); } return o; };
      slider(ctl, "Monthly contribution $", 50, 1000, 50, m, (v) => { m = v; draw(); }); slider(ctl, "Annual return %", 1, 12, 0.5, ret, (v) => { ret = v; draw(); }, (v) => v.toFixed(1));
      slider(ctl, "Annual fee %", 0, 2.5, 0.1, fee, (v) => { fee = v; draw(); }, (v) => v.toFixed(1)); slider(ctl, "Years", 5, 45, 1, yrs, (v) => { yrs = v; draw(); });
      const draw = () => { svg.innerHTML = ""; const a = path(ret), b = path(ret - fee), c = a.map((_, y) => m * 12 * y), top = a[yrs] * 1.05, x = sc(0, yrs, 70, 700), y = sc(0, top, 296, 26), g = SV("g", {}, svg), k = (v) => (v >= 1e6 ? (v / 1e6).toFixed(1) + "M" : Math.round(v / 1000) + "k");
        axis(g, x, y, [0, Math.round(yrs / 4), Math.round(yrs / 2), Math.round((3 * yrs) / 4), yrs], [0, top / 4, top / 2, (3 * top) / 4, top].map((v) => "$" + k(v)).map((s, i) => ({ toString: () => s, valueOf: () => [0, top / 4, top / 2, (3 * top) / 4, top][i] })), "years", "balance");
        const P = (arr) => line(arr.map((v, i) => [x(i), y(v)]));
        SV("path", { d: P(c) + `L${x(yrs)},${y(0)}L${x(0)},${y(0)}Z`, fill: K.card }, g); SV("path", { d: P(c), fill: "none", stroke: K.mute, "stroke-width": 2, "stroke-dasharray": "5 5" }, g);
        SV("path", { d: P(a), fill: "none", stroke: K.navy, "stroke-width": 3 }, g); SV("path", { d: P(b), fill: "none", stroke: K.or, "stroke-width": 3 }, g);
        TX(g, x(yrs) - 6, y(a[yrs]) - 8, "no fee", { "text-anchor": "end", fill: K.navy, "font-weight": 700 }); TX(g, x(yrs) - 6, y(b[yrs]) + 16, "after fee", { "text-anchor": "end", fill: K.or, "font-weight": 700 }); TX(g, x(yrs) - 6, y(c[yrs]) + 16, "contributions", { "text-anchor": "end", fill: K.mute });
        const usd = (v) => "$" + Math.round(v).toLocaleString("en-US");
        chips(read, [["you put in", usd(c[yrs])], ["balance, no fee", usd(a[yrs]), K.navy], ["balance after fee", usd(b[yrs]), K.or], ["lost to fees", usd(a[yrs] - b[yrs]) + ` (${((1 - b[yrs] / a[yrs]) * 100).toFixed(0)}%)`]], "Contributions are added at the start of each year and returns are constant, which real markets never are. The shape is the lesson: growth accelerates, and so does the drag from fees."); };
      draw();
    } };

  /* ---------- a few more coding problems ---------- */
  const P = (id, title, diff, skill, o) => GR.problems.push(Object.assign({ id, title, diff, skill, cmp: "exact" }, o));
  P("dot-product", "Dot Product", 1, "fnd.vectors", {
    desc: "Return the dot product of two equal-length lists of numbers: multiply matching positions and add the results. The dot product of two empty lists is 0.<br><br><b>Example:</b> a = [1, 2, 3], b = [4, 5, 6] → 32",
    js: ["dot", "function dot(a, b) {\n  // your code here\n}\n"], py: ["dot", "def dot(a, b):\n    # your code here\n    pass\n"], cmp: "approx",
    tests: [[[[1, 2, 3], [4, 5, 6]], 32], [[[1, 0], [0, 1]], 0], [[[], []], 0], [[[2], [-3]], -6], [[[0.5, 0.5], [4, 6]], 5]],
    hint: "Loop over the indexes, or zip the two lists together, and keep a running sum.", approach: "One pass, accumulating a[i] × b[i]. O(n).",
    sol: "function dot(a, b) {\n  let s = 0;\n  for (let i = 0; i < a.length; i++) s += a[i] * b[i];\n  return s;\n}" });
  P("word-count", "Count the Words", 1, "fnd.python", {
    desc: "Given a list of words, return the word that appears most often. If several words tie, return the one that comes first alphabetically.<br><br><b>Example:</b> [\"b\", \"a\", \"b\", \"a\", \"c\"] → \"a\"",
    js: ["mostCommon", "function mostCommon(words) {\n  // your code here\n}\n"], py: ["most_common", "def most_common(words):\n    # your code here\n    pass\n"],
    tests: [[[["b", "a", "b", "a", "c"]], "a"], [[["x"]], "x"], [[["cat", "dog", "dog"]], "dog"], [[["z", "y", "z", "y", "z"]], "z"], [[["b", "a"]], "a"]],
    hint: "Count occurrences in a dictionary first. Then pick the best key: highest count, and alphabetical among ties.", approach: "Build a count map in one pass, then scan it keeping the best (count, word) pair. O(n).",
    sol: "function mostCommon(words) {\n  const c = {};\n  for (const w of words) c[w] = (c[w] || 0) + 1;\n  let best = null;\n  for (const w of Object.keys(c)) if (best === null || c[w] > c[best] || (c[w] === c[best] && w < best)) best = w;\n  return best;\n}" });
  P("max-drawdown", "Maximum Drawdown", 2, "fin.riskmgmt", {
    desc: "Given a list of portfolio values over time, return the maximum drawdown: the largest fall from a peak to a later low, as a fraction of that peak. Return 0 if the value never falls.<br><br><b>Example:</b> [100, 120, 90, 110, 80] → 0.3333 (from 120 down to 80)",
    js: ["maxDrawdown", "function maxDrawdown(values) {\n  // your code here\n}\n"], py: ["max_drawdown", "def max_drawdown(values):\n    # your code here\n    pass\n"], cmp: "approx",
    tests: [[[[100, 120, 90, 110, 80]], 1 / 3], [[[1, 2, 3, 4]], 0], [[[100, 50, 100, 25]], 0.75], [[[50]], 0], [[[10, 9, 8, 12, 6]], 0.5], [[[100, 80, 120, 108]], 0.2]],
    hint: "Track the highest value seen so far. At each point, how far below that peak are you?", approach: "One pass: update the running peak, compute (peak − value) / peak, keep the maximum. O(n) time, O(1) space.",
    sol: "function maxDrawdown(values) {\n  let peak = -Infinity, worst = 0;\n  for (const v of values) {\n    if (v > peak) peak = v;\n    worst = Math.max(worst, (peak - v) / peak);\n  }\n  return worst;\n}" });
  P("sma-crossover", "Moving-Average Crossover", 2, "fin.strategies", {
    desc: "Given daily <code>prices</code> and window sizes <code>fast</code> &lt; <code>slow</code>, return the indexes of days where the fast simple moving average crosses <b>above</b> the slow one: on that day fast SMA &gt; slow SMA, and on the previous day fast SMA ≤ slow SMA. Only consider days where both averages (and the previous day's) exist.<br><br><b>Example:</b> prices = [5, 4, 3, 4, 6, 8], fast = 2, slow = 3 → [4]",
    js: ["crossovers", "function crossovers(prices, fast, slow) {\n  // your code here\n}\n"], py: ["crossovers", "def crossovers(prices, fast, slow):\n    # your code here\n    pass\n"],
    tests: [[[[5, 4, 3, 4, 6, 8], 2, 3], [4]], [[[1, 2, 3, 4, 5], 2, 3], []], [[[5, 4, 3, 2, 1], 1, 2], []], [[[3, 2, 1, 2, 1, 2, 3], 1, 2], [3, 5]], [[[1, 1], 1, 2], []], [[[10, 9, 8, 9, 10, 9, 8, 9, 10], 2, 4], [4, 8]]],
    hint: "Write a helper sma(i, w) that averages the w prices ending at index i. The first day you can check is index slow (so that the previous day's slow average exists).", approach: "For each day from index slow onward, compare fast and slow averages today and yesterday. Running sums make it O(n); recomputing each window is O(n·slow) and fine here.",
    sol: "function crossovers(prices, fast, slow) {\n  const sma = (i, w) => { let s = 0; for (let k = i - w + 1; k <= i; k++) s += prices[k]; return s / w; };\n  const out = [];\n  for (let i = slow; i < prices.length; i++) {\n    if (sma(i, fast) > sma(i, slow) && sma(i - 1, fast) <= sma(i - 1, slow)) out.push(i);\n  }\n  return out;\n}" });
  P("percentile", "p99 Latency", 2, "sd.serving", {
    desc: "Given a list of request latencies in milliseconds and a percentile <code>p</code> (0 &lt; p ≤ 100), return the nearest-rank percentile: sort the values and return the one at position <code>ceil(p / 100 × n)</code> (1-based).<br><br><b>Example:</b> latencies = [10, 20, 30, 40, 50], p = 50 → 30",
    js: ["percentile", "function percentile(latencies, p) {\n  // your code here\n}\n"], py: ["percentile", "def percentile(latencies, p):\n    # your code here\n    pass\n"],
    tests: [[[[10, 20, 30, 40, 50], 50], 30], [[[50, 10, 40, 20, 30], 99], 50], [[[7], 99], 7], [[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 90], 9], [[[100, 5, 5, 5], 75], 5], [[[3, 1, 2], 100], 3]],
    hint: "Sort a copy (numerically, not as strings). Convert the 1-based rank to a 0-based index.", approach: "Sort ascending, compute rank = ceil(p/100 × n), return sorted[rank − 1]. O(n log n).",
    sol: "function percentile(latencies, p) {\n  const s = latencies.slice().sort((a, b) => a - b);\n  return s[Math.ceil((p / 100) * s.length) - 1];\n}" });
})();
