/* Track — ML System Design (with the data-engineering pieces it depends on). Lessons, questions and cases in one file. */
(function () {
  const L = (skill, title, mins, body, keys, extra = {}) => Object.assign({ skill, title, mins, body, keys }, extra);
  const Q = GR.Q, G = GR.G, N = GR.nopts, S = GR.S, T = GR.tbl, C = GR.code, f2 = (x) => x.toFixed(2), num = (x) => Math.round(x).toLocaleString("en-US");

  GR.track({
    id: "sd", name: "ML System Design", color: "var(--t-sd)", icon: "MSD",
    blurb: "The design round: turn a vague product goal into data, features, models, serving and monitoring that hold up at scale.",
    modules: [
      { name: "Framing and data", topics: [
        { name: "Start from the product", lessons: [
          L("sd.framing", "Framing the problem and choosing metrics", 10,
            `<p>Design interviews start vague on purpose: "design a feed", "detect fraud". Before any model, pin down the <b>business goal</b>, who the users are, the scale (users, items, requests per second), and the constraints (latency, freshness, cost, privacy). Then translate the goal into an <b>ML task</b>: what is the input, what is predicted, and where do labels come from?</p>
             <p>Keep three kinds of metric apart. <b>Offline metrics</b> (AUC, NDCG, log loss) are computed on held-out data and guide model iteration. <b>Online metrics</b> (click-through, conversion, retention) are measured in A/B tests and are what the business cares about. <b>Guardrail metrics</b> (latency, complaints, revenue) must not get worse. A model can win offline and lose online, so the online test decides.</p>
             <p>Always propose a <b>simple baseline</b> first (popularity, rules, logistic regression). It gives you something to beat and often gets you most of the way.</p>`,
            ["Clarify goal, scale and constraints before modeling.", "Offline metrics guide; online metrics decide; guardrails protect.", "Start with a baseline."], { related: ["ba.kpi", "ml.metrics"] }),
          L("sd.data", "Data, labels and feedback loops", 9,
            `<p>Labels come from three places: <b>explicit</b> feedback (ratings, reports), <b>implicit</b> feedback (clicks, watch time, purchases) and <b>human annotation</b>. Implicit labels are plentiful but biased: users can only click what they were shown (<b>position and exposure bias</b>), and no click does not mean dislike.</p>
             <p>Some labels arrive late: a fraud chargeback can take weeks. <b>Delayed labels</b> force you to choose a waiting window and to be careful about treating "not yet fraud" as "not fraud".</p>
             <p>Deployed models create <b>feedback loops</b>: the model decides what users see, their reactions become training data, and the model reinforces its own choices. Counter it with a little <b>exploration</b> (showing some items at random) and by logging what was shown, not only what was clicked. Split data <b>by time</b> for evaluation, since production always predicts the future from the past.</p>`,
            ["Implicit labels are abundant and biased.", "Delayed labels need a waiting window.", "Break feedback loops with exploration; split by time."], { related: ["ml.cv", "sd.monitoring"] }),
          L("sd.features", "Features and feature stores", 9,
            `<p>Features fall into families: <b>user</b> (history, preferences), <b>item</b> (category, price, age), <b>context</b> (time, device, location) and <b>interaction</b> features that cross them (how often this user bought this category). Some are computed in <b>batch</b> (30-day purchase count, refreshed nightly), others in <b>real time</b> (items viewed in this session).</p>
             <p>The classic production bug is <b>training-serving skew</b>: a feature computed one way in the training pipeline and another way in the live service, or training on values that would not have been known yet. A <b>feature store</b> addresses both: one definition feeds an offline store for training and an online store for low-latency lookup, and it does <b>point-in-time correct</b> joins so each training row sees only features available at that moment.</p>
             <p>Represent high-cardinality IDs (users, products) with <b>embeddings</b> rather than one-hot vectors.</p>`,
            ["User, item, context and cross features; batch or real time.", "Training-serving skew is the classic bug.", "Feature stores: one definition, point-in-time correct."], { related: ["ds.features", "ml.cv"] }),
        ]},
      ]},
      { name: "Data systems", topics: [
        { name: "Moving and storing data", lessons: [
          L("sd.pipelines", "Batch and streaming pipelines", 10,
            `<p><b>Batch</b> pipelines process a bounded chunk on a schedule (last night's orders); they are simple, cheap and fine when hours-old data is acceptable. <b>Streaming</b> pipelines process events as they arrive, usually from a durable log like <b>Kafka</b>, giving seconds-old data at the price of more complexity (ordering, late events, exactly-once concerns).</p>
             <p><b>ETL</b> transforms data before loading it into the warehouse; <b>ELT</b> loads raw data first and transforms inside the warehouse with SQL (the dbt style), which keeps the raw data for reprocessing. An <b>orchestrator</b> such as Airflow runs tasks as a dependency graph (a DAG) with retries and alerts.</p>
             <p>Good pipelines are <b>idempotent</b>: rerunning a day produces the same result instead of duplicates, which makes <b>backfills</b> (recomputing history after a fix) safe. Add <b>data quality checks</b> (row counts, null rates, schema, freshness) so bad data stops at the door.</p>`,
            ["Batch: simple and cheap. Streaming: fresh and harder.", "ELT keeps raw data and transforms in the warehouse.", "Idempotent tasks make reruns and backfills safe."], { related: ["ba.modeling", "ag.automation"] }),
          L("sd.storage", "Lakes, warehouses and file formats", 8,
            `<p>A <b>data warehouse</b> stores structured, modeled tables for fast SQL analytics. A <b>data lake</b> stores raw files of any shape cheaply in object storage. A <b>lakehouse</b> adds table features (transactions, schema, time travel) on top of lake files, aiming for both.</p>
             <p>Format matters. <b>Row</b> formats (CSV, JSON, Avro) store each record together: good for writing and for reading whole rows. <b>Columnar</b> formats (<b>Parquet</b>, ORC) store each column together: analytics that touch 3 of 200 columns read only those, and similar values compress well.</p>
             <p><b>Partitioning</b> splits a table into folders by a column, usually date, so a query for one day skips the rest (<b>partition pruning</b>). Partition on what you filter by, and avoid high-cardinality keys that create millions of tiny files.</p>`,
            ["Warehouse: modeled SQL tables. Lake: raw files. Lakehouse: both.", "Parquet is columnar: read fewer columns, compress better.", "Partition by the filter column, usually date."], { related: ["ba.modeling", "swe.db"] }),
        ]},
      ]},
      { name: "Modeling and serving", topics: [
        { name: "From model to service", lessons: [
          L("sd.retrieval", "Candidate generation and ranking", 10,
            `<p>You cannot score a billion items per request with a heavy model. Large recommenders and search systems use a <b>funnel</b>. <b>Candidate generation</b> (retrieval) cheaply narrows millions of items to a few hundred, optimizing <b>recall</b>. <b>Ranking</b> scores those with a richer model and many features, optimizing <b>precision</b> at the top. A final <b>re-ranking</b> step applies business rules: diversity, freshness, removing items already seen.</p>
             <p>A common retriever is the <b>two-tower model</b>: one network embeds the user, another embeds the item, trained so that matching pairs are close. Item embeddings are precomputed and stored in an <b>approximate nearest neighbor (ANN)</b> index, so finding the closest items to a user embedding takes milliseconds.</p>
             <p>Run several retrievers in parallel (collaborative, content-based, popular, recent) and merge their candidates.</p>`,
            ["Retrieve (recall, cheap) → rank (precision, heavy) → re-rank (rules).", "Two towers + ANN index for fast retrieval.", "Merge several candidate sources."], { related: ["ai.tokens", "sd.recsys"] }),
          L("sd.training", "Training pipelines and reproducibility", 8,
            `<p>A model in production is the output of a <b>pipeline</b>: pull data, validate it, build features, train, evaluate, register. Automating it means retraining is one command or a schedule, not an afternoon of notebook cells.</p>
             <p>Reproducibility needs three versions pinned together: the <b>code</b>, the <b>data</b> snapshot and the <b>configuration</b> (hyperparameters, seeds). An <b>experiment tracker</b> logs each run's parameters and metrics; a <b>model registry</b> stores trained artifacts with their lineage and a stage (staging, production), so you can roll back.</p>
             <p>Before a new model is promoted, gate it: it must beat the current model on a fixed evaluation set, pass checks on important <b>slices</b> (new users, each country), and meet latency and size limits.</p>`,
            ["Automate the pipeline end to end.", "Version code + data + config together.", "Registry and promotion gates enable safe rollback."], { related: ["swe.practices", "ai.deploy"] }),
          L("sd.serving", "Serving: batch, online and latency", 10,
            `<p><b>Batch prediction</b> scores everything ahead of time and stores the results (nightly churn scores); it is cheap and simple, but stale and wasteful when most predictions are never used. <b>Online prediction</b> computes on request, using fresh context, and must fit a <b>latency budget</b>.</p>
             <p>Measure latency at the tail: <b>p99</b> is the time under which 99% of requests finish. Averages hide the slow requests your users feel. Levers to cut latency: <b>precompute</b> and <b>cache</b> embeddings and features, use a smaller or <b>distilled/quantized</b> model, <b>batch</b> requests on the GPU, and keep heavy models for the ranking stage only.</p>
             <p>Capacity is arithmetic: servers needed ≈ peak requests per second ÷ requests one server handles, plus headroom. Scale <b>horizontally</b> behind a load balancer, and plan a <b>fallback</b> (cached or popular results) for when the model service is slow or down.</p>`,
            ["Batch: cheap but stale. Online: fresh but latency-bound.", "Watch p99, not the average.", "Cache, precompute, shrink the model; always have a fallback."], { related: ["swe.sysdesign", "ai.deploy"] }),
        ]},
      ]},
      { name: "Operating in production", topics: [
        { name: "Keeping it healthy", lessons: [
          L("sd.monitoring", "Monitoring, drift and retraining", 9,
            `<p>ML systems fail quietly: the service returns 200 OK while predictions get worse. Monitor four layers: <b>system</b> health (latency, errors), <b>data</b> quality (missing values, schema changes, feature distributions), <b>predictions</b> (score distribution, share of positives) and, when labels arrive, <b>model performance</b>.</p>
             <p><b>Data drift</b> is the inputs changing; <b>concept drift</b> is the relationship between inputs and outcome changing (fraudsters adapt). Because labels are often delayed, drift in inputs and predictions is your early warning. Compare today's distributions with a reference window using a statistic such as PSI or a KS test.</p>
             <p>Retrain on a <b>schedule</b> (weekly), on a <b>trigger</b> (drift or performance drop), or continuously. Whatever you choose, evaluate the new model before it replaces the old one.</p>`,
            ["Monitor system, data, predictions and performance.", "Data drift: inputs change. Concept drift: the mapping changes.", "Retrain on schedule or trigger, and gate promotion."], { related: ["ai.deploy", "sd.data"] }),
          L("sd.rollout", "Experiments and safe rollout", 9,
            `<p>Offline wins are hypotheses. Ship in stages. <b>Shadow mode</b>: the new model receives real traffic and logs predictions, but users still see the old one, which tests correctness and latency with zero user risk. <b>Canary</b>: send 1 to 5% of traffic and watch guardrails. <b>A/B test</b>: split users randomly and compare the business metric with proper statistics.</p>
             <p>For ranking, <b>interleaving</b> mixes results from two rankers in one list and counts which ranker's results get clicked; it needs far less traffic than an A/B test to detect a preference.</p>
             <p>Define the decision rule before the test: the primary metric, the guardrails, the sample size and the duration (cover full weekly cycles). Keep a quick <b>rollback</b> path, and consider a long-term <b>holdout</b> group to measure cumulative impact.</p>`,
            ["Shadow → canary → A/B test.", "Interleaving compares rankers with less traffic.", "Fix the decision rule first; keep rollback ready."], { diagram: "abtest", related: ["ba.ab", "ba.pitfalls"] }),
        ]},
      ]},
      { name: "Design case studies", topics: [
        { name: "Putting it together", lessons: [
          L("sd.recsys", "Design: a recommendation feed", 10,
            `<p><b>Frame it.</b> Goal: long-term engagement, not just clicks (clickbait wins clicks). Scale: millions of users and items, feed in under 200 ms. Labels: implicit (clicks, watch time, likes, hides).</p>
             <p><b>Architecture.</b> Candidate generation from several sources: two-tower embeddings with ANN lookup, items from followed accounts, trending items. Ranking with a model that predicts several outcomes (click, long watch, like, hide) and combines them into one score with tuned weights. Re-ranking for diversity, freshness and already-seen items.</p>
             <p><b>Hard parts.</b> <b>Cold start</b>: new users get popular and onboarding-interest items; new items get content-based embeddings and a small exploration budget. <b>Feedback loops and position bias</b>: log impressions and positions, explore a little. <b>Evaluation</b>: offline NDCG and recall@k, then A/B tests on retention with guardrails.</p>`,
            ["Optimize long-term value, not raw clicks.", "Multi-source retrieval → multi-objective ranking → re-rank.", "Handle cold start, bias and feedback loops explicitly."], { related: ["sd.retrieval", "sd.data"] }),
          L("sd.fraud", "Design: fraud detection", 10,
            `<p><b>Frame it.</b> Decide in under 100 ms whether to approve, decline or review a transaction. Fraud is rare (well under 1%), labels arrive late (chargebacks take weeks), and adversaries adapt.</p>
             <p><b>Metrics.</b> Accuracy is useless with this imbalance. Use precision and recall at the operating threshold, <b>PR-AUC</b>, and above all <b>cost</b>: a missed fraud costs the amount; a false decline costs a sale and a customer. Choose the threshold that minimizes expected cost, with a middle band sent to <b>manual review</b>.</p>
             <p><b>System.</b> Real-time features are the heart of it: transactions in the last 10 minutes for this card, distance from the last location, new device, merchant risk. Combine <b>rules</b> (fast, explainable, block known patterns) with a <b>model</b> (gradient-boosted trees are the workhorse). Retrain often, monitor drift closely, and feed reviewer decisions back as labels.</p>`,
            ["Rare positives, delayed labels, adaptive adversaries.", "Pick the threshold by cost; add a manual-review band.", "Real-time velocity features + rules + boosted trees."], { related: ["ml.metrics", "ml.imbalance"] }),
          L("sd.search", "Design: search ranking", 10,
            `<p><b>Frame it.</b> Given a query, return the most relevant results in about 200 ms. Measure with <b>NDCG</b> or MRR offline, and click-through, reformulation rate and "zero result" rate online.</p>
             <p><b>Pipeline.</b> <b>Query understanding</b>: spelling correction, tokenization, intent, synonyms. <b>Retrieval</b>: an inverted index with <b>BM25</b> for keyword match, plus embedding-based ANN retrieval for meaning; merge both (hybrid). <b>Ranking</b>: a learning-to-rank model (often gradient-boosted trees, or a cross-encoder for the top few) over text match, popularity, freshness and personalization features.</p>
             <p><b>Labels.</b> Human relevance judgments are clean but costly; clicks are plentiful but position-biased, so correct for position or use interleaving. Cache popular queries; the head of the query distribution is small and repeats constantly.</p>`,
            ["Query understanding → hybrid retrieval → learning to rank.", "BM25 for keywords, embeddings for meaning.", "Clicks are position-biased; correct or interleave."], { related: ["sd.retrieval", "ai.rag"] }),
        ]},
      ]},
    ],
  });

  /* ---- sd.framing ---- */
  Q("sd.framing", 1, "In an ML design interview, what should you do first?", ["Clarify the goal, users, scale and constraints", "Pick a neural architecture", "Write the training loop", "Choose a cloud provider"], "The problem is vague on purpose. Framing it is the first thing being graded.");
  Q("sd.framing", 1, "Which is an online metric?", ["Click-through rate measured in an A/B test", "AUC on a held-out set", "Validation log loss", "Training accuracy"], "Online metrics come from real users; the others are offline.");
  Q("sd.framing", 2, "A new ranking model improves offline NDCG but lowers engagement in an A/B test. You should:", ["Trust the online result and investigate the gap", "Ship it; offline metrics are more reliable", "Rerun offline evaluation until it agrees", "Remove the A/B test"], "Offline metrics are proxies. The online test measures what you actually care about.");
  Q("sd.framing", 2, "A guardrail metric is one that:", ["Must not get worse, even if the primary metric improves", "Is the main metric to maximize", "Is only measured offline", "Is ignored after launch"], "Latency, crashes, complaints and revenue are typical guardrails.");
  Q("sd.framing", 2, "Why propose a simple baseline before a complex model?", ["It sets a bar to beat and often captures most of the value", "Interviewers dislike neural networks", "Baselines never need data", "It avoids having to define metrics"], "A popularity or logistic-regression baseline tells you whether complexity is paying for itself.");
  Q("sd.framing", 3, "A video app optimizes purely for clicks and fills with clickbait. The underlying mistake was:", ["Choosing a proxy metric that diverges from the real goal", "Using too little data", "Too small a model", "Serving latency"], "Clicks are easy to measure but are not the same as satisfaction or retention.");

  /* ---- sd.data ---- */
  Q("sd.data", 1, "Clicks and watch time are examples of:", ["Implicit feedback", "Explicit feedback", "Human annotation", "Synthetic labels"], "The user never states a preference; you infer it from behavior.");
  Q("sd.data", 2, "Position bias means:", ["Items shown higher get more clicks regardless of relevance", "Models prefer the first feature", "Training data is sorted", "Labels arrive late"], "Rank affects clicks, so raw click counts overstate top results.");
  Q("sd.data", 2, "A chargeback confirming fraud can arrive 6 weeks after the transaction. This is a problem of:", ["Delayed labels", "Position bias", "Overfitting", "High cardinality"], "Recent transactions look clean simply because their labels have not arrived yet.");
  Q("sd.data", 2, "Why split data by time when evaluating a production model?", ["In production the model always predicts the future from the past", "Random splits are slower", "Time splits need less data", "It removes outliers"], "A random split leaks future information into training and overstates performance.");
  Q("sd.data", 3, "A recommender only learns from items it chose to show. Which technique fights this feedback loop?", ["Showing a small share of items at random (exploration)", "Training for more epochs", "Using a larger model", "Removing the logging"], "Exploration gathers unbiased data about items the model would not otherwise show.");
  Q("sd.data", 3, "For implicit feedback, 'no click' is a weak negative because:", ["The user may never have seen or noticed the item", "Clicks are always accidental", "Negative labels are illegal", "It increases latency"], "Absence of a click mixes dislike with lack of exposure.");

  /* ---- sd.features ---- */
  Q("sd.features", 1, "'Number of purchases by this user in this category' is which kind of feature?", ["A user-item interaction (cross) feature", "A pure item feature", "A context feature", "A label"], "It combines the user with an attribute of the item.");
  Q("sd.features", 2, "Training-serving skew is:", ["A feature computed differently in training than in production", "A model that is too large to serve", "An imbalanced dataset", "A slow feature store"], "The model sees one distribution in training and another live, and quietly degrades.");
  Q("sd.features", 2, "A point-in-time correct join ensures that each training example uses:", ["Only feature values that were available at that example's timestamp", "The latest feature values", "Average feature values", "Features from the test set"], "Using later values leaks the future into training.");
  Q("sd.features", 2, "What is the main purpose of a feature store?", ["One feature definition served consistently to training and to online inference", "Storing model weights", "Running A/B tests", "Replacing the data warehouse"], "It keeps offline and online features consistent and reusable.");
  Q("sd.features", 2, "How should a model usually represent 50 million product IDs?", ["Learned embeddings", "One-hot vectors", "Raw integers as a numeric feature", "Drop the feature"], "Embeddings give dense, learnable representations; one-hot is enormous and raw integers imply a false order.");
  Q("sd.features", 3, "'Items viewed in the current session' must be computed:", ["In real time, from the event stream", "In a nightly batch job", "Once at signup", "Only during training"], "Session features change within seconds, so a nightly batch is far too stale.");

  /* ---- sd.pipelines ---- */
  Q("sd.pipelines", 1, "Which workload suits a batch pipeline?", ["A nightly sales report", "Blocking a fraudulent card payment", "Updating a live leaderboard every second", "Typing suggestions"], "Hours-old data is fine for a daily report.");
  Q("sd.pipelines", 1, "In ELT, the transformation happens:", ["Inside the warehouse, after the raw data is loaded", "Before the data leaves the source", "In the dashboard", "Never"], "Extract, Load, then Transform with SQL, keeping the raw data.");
  Q("sd.pipelines", 2, "A pipeline task is idempotent if:", ["Running it twice produces the same result as running it once", "It never fails", "It runs in under a second", "It has no inputs"], "Idempotence makes retries and backfills safe from duplicates.");
  Q("sd.pipelines", 2, "Apache Kafka is best described as:", ["A durable, replayable log of events that many consumers can read", "A SQL warehouse", "A dashboard tool", "A model-training library"], "Producers append events; consumers read at their own pace and can replay.");
  Q("sd.pipelines", 2, "What does an orchestrator like Airflow do?", ["Runs tasks in dependency order with scheduling, retries and alerts", "Stores the data", "Trains models faster", "Compresses files"], "It manages the DAG of tasks, not the data itself.");
  Q("sd.pipelines", 3, "A bug corrupted three weeks of a derived table. After fixing the code you:", ["Backfill: rerun the pipeline for the affected dates", "Wait for the data to age out", "Delete the source data", "Manually edit rows"], "With idempotent, date-partitioned tasks a backfill is a safe rerun.");
  Q("sd.pipelines", 3, "Which check would catch an upstream team silently renaming a column?", ["A schema validation check", "A row-count check", "A latency alert", "A model accuracy alert weeks later"], "Schema checks fail fast at ingestion, before bad data spreads.");

  /* ---- sd.storage ---- */
  Q("sd.storage", 1, "Parquet is a:", ["Columnar file format", "Row-oriented text format", "Message queue", "Dashboard tool"], "It stores each column together, with compression and statistics.");
  Q("sd.storage", 2, "A query reads 3 columns from a 200-column table. Why is Parquet faster than CSV here?", ["It reads only the needed columns from disk", "It has no header", "It stores fewer rows", "It is written in Rust"], "Columnar layout lets the engine skip the other 197 columns.");
  Q("sd.storage", 2, "A table partitioned by date is queried for one day. Partition pruning means:", ["Only that day's files are scanned", "The table is deleted and rebuilt", "Rows are sampled", "The query is cached"], "The engine skips every partition the filter rules out.");
  Q("sd.storage", 2, "Which is the best partition column for an events table usually filtered by day?", ["event_date", "event_id", "user_id with 80 million values", "A random number"], "Partition on what you filter by. High-cardinality keys create a flood of tiny files.");
  Q("sd.storage", 2, "A data lake differs from a warehouse mainly in that it:", ["Stores raw files of any format cheaply, with structure applied later", "Only supports SQL", "Cannot store images", "Is always faster"], "Lakes are cheap and flexible; warehouses are modeled and fast for SQL.");
  Q("sd.storage", 3, "A lakehouse adds what to a plain data lake?", ["Table features such as transactions, schema enforcement and time travel", "A GPU", "A message queue", "Row-level encryption only"], "Table formats like Delta and Iceberg bring warehouse reliability to lake files.");

  /* ---- sd.retrieval ---- */
  Q("sd.retrieval", 1, "Why do large recommenders use a retrieval stage before ranking?", ["Scoring every item with a heavy model per request is too slow", "Ranking models can't use features", "Retrieval is more accurate than ranking", "To avoid storing items"], "Retrieval cheaply narrows millions of items to hundreds.");
  Q("sd.retrieval", 2, "Candidate generation should mainly optimize:", ["Recall: don't miss good items", "Precision at rank 1", "Latency only", "Diversity only"], "Anything retrieval misses can never be ranked. Precision is the ranker's job.");
  Q("sd.retrieval", 2, "In a two-tower model, the two towers encode:", ["The user (or query) and the item, into the same embedding space", "Training and test data", "Positive and negative labels", "Text and images only"], "Matching user and item embeddings end up close together.");
  Q("sd.retrieval", 2, "An ANN index trades:", ["A little accuracy for much faster nearest-neighbor search", "Speed for exactness", "Storage for labels", "Recall for training time"], "Approximate search finds nearly-nearest neighbors in milliseconds over millions of vectors.");
  Q("sd.retrieval", 3, "Why can item embeddings be precomputed in a two-tower model but not in a cross-encoder?", ["The towers don't see each other's input, so item vectors don't depend on the user", "Cross-encoders have no weights", "Two-tower models are smaller", "Items never change"], "A cross-encoder processes user and item together, so nothing can be cached per item.");
  Q("sd.retrieval", 3, "Removing items the user has already seen and enforcing variety belongs in:", ["Re-ranking", "Candidate generation only", "The loss function", "The tokenizer"], "Business rules and diversity are applied after scoring.");
  G("sd.retrieval", 2, (r) => { const items = r.pick([2, 5, 10, 50]), ms = r.pick([0.5, 1, 2]), k = r.pick([200, 500, 1000]); const all = items * 1e6 * ms / 1000, two = k * ms; return { stem: `A ranking model takes ${ms} ms per item. There are ${items} million items. How long would scoring everything for one request take, compared with scoring ${k} retrieved candidates?`, opts: [`About ${num(all)} seconds vs ${num(two)} ms`, `About ${num(all)} ms vs ${num(two)} ms`, `About ${num(two)} seconds vs ${num(all)} ms`, `Both about ${num(two)} ms`], expl: `${items}M × ${ms} ms = ${num(all)} s. ${k} × ${ms} ms = ${num(two)} ms. That gap is why the funnel exists.` }; });

  /* ---- sd.training ---- */
  Q("sd.training", 1, "To reproduce a model exactly you need the same:", ["Code, data snapshot and configuration", "Laptop", "Dashboard", "Cloud region"], "All three must be versioned together.");
  Q("sd.training", 2, "A model registry stores:", ["Trained model artifacts with versions, lineage and stage", "Raw training data", "Feature definitions only", "User passwords"], "It is the source of truth for which model is in staging or production.");
  Q("sd.training", 2, "A new model has better overall AUC but is much worse for new users. A good promotion gate would:", ["Check metrics on important slices, not only the average", "Promote it; the average is what counts", "Ignore new users", "Retrain with a different seed until it passes"], "Averages hide regressions in segments that matter.");
  Q("sd.training", 2, "An experiment tracker is used to:", ["Log each run's parameters, metrics and artifacts for comparison", "Schedule cron jobs", "Serve predictions", "Label data"], "It answers 'what did I change and what happened?'");
  Q("sd.training", 3, "Why automate the training pipeline instead of training from a notebook?", ["Retraining becomes repeatable, testable and schedulable", "Notebooks cannot train models", "Pipelines always produce better models", "It removes the need for evaluation"], "Manual steps are where irreproducibility and mistakes creep in.");

  /* ---- sd.serving ---- */
  Q("sd.serving", 1, "Batch prediction means:", ["Scoring in advance and storing results for later lookup", "Scoring on each request", "Training in mini-batches", "Batching GPU requests"], "Predictions are precomputed, such as nightly churn scores.");
  Q("sd.serving", 2, "p99 latency is 800 ms. That means:", ["99% of requests finish within 800 ms", "The average is 800 ms", "99% of requests take longer than 800 ms", "The fastest request took 800 ms"], "One in a hundred requests is slower than this.");
  Q("sd.serving", 2, "Why watch p99 rather than average latency?", ["Averages hide the slow tail that users actually feel", "p99 is easier to compute", "Averages are always wrong", "p99 is lower"], "A fine average can coexist with a painful tail.");
  Q("sd.serving", 2, "Which is NOT a way to reduce serving latency?", ["Adding more features that need live database joins", "Caching precomputed embeddings", "Quantizing or distilling the model", "Using the heavy model only on the top candidates"], "Each live join adds a network hop to the request path.");
  Q("sd.serving", 3, "The model service times out during a traffic spike. A well-designed system:", ["Falls back to cached or popular results", "Returns an error page", "Retries forever", "Blocks all users"], "Degrade gracefully instead of failing.");
  Q("sd.serving", 3, "Online prediction is preferred over batch when:", ["Predictions depend on fresh context, like the current session", "Predictions change once a month", "Latency doesn't matter", "There are only 100 users"], "If the inputs change within a session, precomputed scores are stale.");
  G("sd.serving", 2, (r) => { const qps = r.pick([1200, 3000, 4500, 9000]), per = r.pick([150, 250, 300]), head = r.pick([1.25, 1.5]); const v = Math.ceil((qps * head) / per); return { stem: `Peak traffic is ${num(qps)} requests per second. One server handles ${per} per second, and you want ${Math.round((head - 1) * 100)}% headroom. How many servers do you need?`, opts: N(v, [Math.ceil(qps / per), Math.ceil(qps / per / head), v * 2]), expl: `${num(qps)} × ${head} ÷ ${per} = ${((qps * head) / per).toFixed(1)}, rounded up to ${v}.` }; });
  G("sd.serving", 2, (r) => { const a = r.pick([20, 30, 40]), b = r.pick([15, 25]), c = r.pick([60, 80, 120]), d = r.pick([10, 20]); return { stem: `A request runs four steps in sequence: feature lookup ${a} ms, retrieval ${b} ms, ranking ${c} ms, re-ranking ${d} ms. The budget is 150 ms. What is the total, and is it within budget?`, opts: [`${a + b + c + d} ms, ${a + b + c + d <= 150 ? "within" : "over"} budget`, `${c} ms, within budget`, `${a + b + c + d} ms, ${a + b + c + d <= 150 ? "over" : "within"} budget`, `${(a + b + c + d) / 4} ms, within budget`], expl: `Sequential steps add: ${a} + ${b} + ${c} + ${d} = ${a + b + c + d} ms.` }; });

  /* ---- sd.monitoring ---- */
  Q("sd.monitoring", 1, "Why is monitoring an ML service harder than monitoring a normal web service?", ["It can return healthy responses while its predictions get worse", "ML services never crash", "Latency can't be measured", "Logs are not allowed"], "Model quality degrades silently; HTTP status codes don't show it.");
  Q("sd.monitoring", 2, "Labels arrive 30 days late. What is the earliest warning sign of trouble?", ["A shift in input feature or prediction distributions", "A drop in measured accuracy", "The monthly review", "User complaints only"], "Inputs and predictions are available immediately; accuracy has to wait for labels.");
  Q("sd.monitoring", 2, "Fraudsters change tactics so the same transaction pattern now means something different. This is:", ["Concept drift", "Data drift only", "Label noise", "Underfitting"], "The relationship between inputs and outcome changed.");
  Q("sd.monitoring", 2, "A feature that is normally 2% null jumps to 60% null overnight. The most likely cause is:", ["An upstream data pipeline or schema change", "Concept drift", "The model overfitting", "A holiday"], "Sudden data-quality changes usually come from upstream breakage.");
  Q("sd.monitoring", 3, "Triggered retraining (as opposed to scheduled) starts when:", ["A drift or performance threshold is crossed", "The calendar says so", "A developer remembers", "Traffic is low"], "It reacts to evidence that the model has gone stale.");
  Q("sd.monitoring", 3, "After automatic retraining, the new model should:", ["Be evaluated against the current one before replacing it", "Replace the old one immediately", "Be discarded", "Skip validation to save time"], "Automation without a gate can ship a worse model.");

  /* ---- sd.rollout ---- */
  Q("sd.rollout", 1, "In shadow mode, the new model's predictions are:", ["Logged but not shown to users", "Shown to all users", "Shown to 50% of users", "Never computed"], "It tests correctness and latency on live traffic with no user risk.");
  Q("sd.rollout", 2, "A canary release sends the new model:", ["A small share of traffic first, watching guardrails", "All traffic at once", "No traffic", "Only internal test data"], "If guardrails hold at 1 to 5%, you ramp up.");
  Q("sd.rollout", 2, "Interleaving two rankers is useful because it:", ["Detects which ranker users prefer with far less traffic than an A/B test", "Removes the need for metrics", "Trains both models together", "Guarantees higher revenue"], "Each user sees a mix, so every session contributes a direct comparison.");
  Q("sd.rollout", 2, "Why should an A/B test usually run for whole weeks?", ["Behavior differs by day of week", "Statistics need 7 samples", "Servers restart weekly", "To use more budget"], "Stopping mid-week biases the comparison toward whichever days were covered.");
  Q("sd.rollout", 3, "The primary metric improved 1%, but p99 latency doubled past the guardrail. You should:", ["Not ship as is; fix latency or reject", "Ship; the primary metric won", "Remove the guardrail", "Rerun until latency looks fine"], "Guardrails exist to veto exactly this trade.");
  Q("sd.rollout", 3, "A long-term holdout group is kept on the old experience in order to:", ["Measure the cumulative effect of many launches over time", "Save compute", "Punish some users", "Speed up A/B tests"], "Individual tests miss long-run and combined effects.");

  /* ---- sd.recsys ---- */
  Q("sd.recsys", 1, "The cold-start problem refers to:", ["New users or items with little or no interaction data", "Servers that take long to boot", "Low winter traffic", "Slow model training"], "With no history, collaborative signals have nothing to work with.");
  Q("sd.recsys", 2, "A reasonable first feed for a brand-new user is:", ["Popular items plus interests picked during onboarding", "Random items", "An empty feed", "Items the model scores lowest"], "Popularity and stated interests are the best signals before any behavior exists.");
  Q("sd.recsys", 2, "How do new items get shown when they have no clicks yet?", ["Content-based embeddings plus a small exploration budget", "They wait until someone searches for them", "They are never shown", "By copying the most popular item's score"], "Content features place them near similar items, and exploration gathers first feedback.");
  Q("sd.recsys", 2, "A ranker that predicts click, long watch, like and hide, then combines them, is doing:", ["Multi-objective ranking", "Candidate generation", "Clustering", "Tokenization"], "Combining several predicted outcomes steers toward satisfaction rather than raw clicks.");
  Q("sd.recsys", 3, "Recall@k for a retriever measures:", ["The share of relevant items that appear in the top k retrieved", "The precision of the top result", "Latency at k requests", "The number of users"], "It tells you how much the retrieval stage is missing.");
  Q("sd.recsys", 3, "Why log impressions (what was shown) and not only clicks?", ["Without them you can't tell 'not clicked' from 'never shown'", "Impressions are cheaper to store", "Clicks are unreliable", "To increase latency"], "Impressions provide the negatives and let you correct for position bias.");

  /* ---- sd.fraud ---- */
  Q("sd.fraud", 1, "Why is accuracy a poor metric for fraud detection?", ["Fraud is so rare that predicting 'never fraud' scores above 99%", "Accuracy is hard to compute", "Fraud labels are text", "Accuracy ignores latency"], "With extreme class imbalance, accuracy says nothing about catching fraud.");
  Q("sd.fraud", 2, "A false decline (blocking a legitimate payment) costs:", ["A lost sale and possibly the customer", "Nothing", "The chargeback amount", "Only compute"], "False positives have real cost, which is why thresholds are set by cost, not by habit.");
  Q("sd.fraud", 2, "'Number of transactions on this card in the last 10 minutes' is a:", ["Real-time velocity feature", "Static demographic feature", "Label", "Batch-only feature"], "Bursts of activity are among the strongest fraud signals and must be computed live.");
  Q("sd.fraud", 2, "Why combine hand-written rules with a model?", ["Rules block known patterns instantly and explainably; the model generalizes to new ones", "Rules are always more accurate", "Models can't run in real time", "Regulators forbid models"], "The two cover different failure modes.");
  Q("sd.fraud", 3, "Transactions with a middling fraud score are best:", ["Sent to manual review", "Always approved", "Always declined", "Ignored"], "A review band puts human attention where the model is least sure.");
  Q("sd.fraud", 3, "Why must a fraud model be retrained more often than, say, a churn model?", ["Adversaries adapt to it, so patterns shift quickly", "Fraud data is smaller", "Churn never changes", "Fraud models are simpler"], "An adaptive opponent creates fast concept drift.");
  G("sd.fraud", 3, (r) => { const amt = r.pick([80, 120, 200]), fd = r.pick([10, 15, 25]), p = r.pick([0.05, 0.1, 0.2, 0.3]); const block = (1 - p) * fd, allow = p * amt; return { stem: `A transaction has a ${p * 100}% chance of being fraud. Approving a fraud costs $${amt}; declining a legitimate one costs $${fd}. Which action has the lower expected cost?`, opts: [`${block < allow ? "Decline" : "Approve"}: expected cost $${f2(Math.min(block, allow))} vs $${f2(Math.max(block, allow))}`, `${block < allow ? "Approve" : "Decline"}: expected cost $${f2(Math.min(block, allow))} vs $${f2(Math.max(block, allow))}`, "They are equal", `Approve: fraud probability is under 50%`], expl: `Approve: ${p} × $${amt} = $${f2(allow)}. Decline: ${f2(1 - p)} × $${fd} = $${f2(block)}. The break-even is far below 50%.` }; });

  /* ---- sd.search ---- */
  Q("sd.search", 1, "BM25 scores documents by:", ["Keyword match, weighting rare terms higher and normalizing for length", "Embedding similarity", "Click counts", "Document age"], "It is the standard lexical ranking function behind inverted-index search.");
  Q("sd.search", 2, "Hybrid retrieval combines:", ["Keyword search and embedding-based semantic search", "Two A/B tests", "Batch and streaming", "SQL and NoSQL"], "Keywords catch exact terms and names; embeddings catch meaning and paraphrases.");
  Q("sd.search", 2, "NDCG rewards a ranker for:", ["Placing the most relevant results nearest the top", "Returning more results", "Being faster", "Using fewer features"], "Gains are discounted by position, so order matters.");
  Q("sd.search", 2, "Spelling correction and synonym expansion belong to:", ["Query understanding", "Re-ranking", "Index compaction", "Model distillation"], "They rewrite the query before retrieval.");
  Q("sd.search", 3, "Why are raw clicks biased as relevance labels for search?", ["Users click top results more, whatever their relevance", "Clicks are rare", "Clicks are too slow to log", "Users never click"], "Position bias inflates the apparent relevance of whatever was ranked first.");
  Q("sd.search", 3, "Caching results helps search a lot because:", ["A small set of popular queries makes up a large share of traffic", "Every query is unique", "Caches improve relevance", "Indexes can't be updated"], "The head of the query distribution repeats constantly.");

  S("sd.framing", "Designing 'People you may know'", {
    stim: `<p>You are asked to design a friend-suggestion feature for a social app with 200 million users. The product manager says the goal is "more connections". Suggestions appear in a list of 10 on the home screen.</p>`,
    parts: [
      ["sd.framing", 2, "Which is the best primary online metric?", ["Accepted connection requests per user that lead to later interaction", "Number of suggestions shown", "Clicks on the suggestion list", "Offline AUC"], "Shown and clicked are easy to inflate. Accepted requests that lead to real interaction track the goal."],
      ["sd.retrieval", 2, "Scoring all 200 million users as candidates for each user is infeasible. A sensible candidate source is:", ["Friends of friends, plus contacts and shared groups", "A random sample of all users", "The 100 most-followed accounts for everyone", "Users sorted by signup date"], "Graph neighbors cut candidates from 200M to a few thousand with high recall."],
      ["sd.data", 2, "What is the label for training the ranker?", ["Whether a shown suggestion led to an accepted request", "Whether two users have the same name", "Whether the user opened the app", "The user's age"], "Impressions with their outcomes give positives and negatives."],
      ["sd.framing", 3, "Which guardrail matters most here?", ["Rate of blocks, reports and declined requests", "Average session length only", "Number of servers", "Model file size"], "Unwanted suggestions cause real harm. Blocks and reports are the safety signal."],
      ["sd.serving", 3, "Suggestions don't need to change within a session. The cheapest serving design is:", ["Precompute suggestions in batch daily and serve from a key-value store", "Run the full model on every page load", "Compute on the phone", "Ask users to refresh manually"], "Batch precompute plus lookup is cheap and fast when freshness needs are low."],
    ],
  });
  S("sd.monitoring", "A silent failure in production", (r) => {
    const base = r.pick([4.1, 4.4, 4.8]), now = +(base * r.pick([0.55, 0.6, 0.65])).toFixed(1), nulls = r.pick([38, 46, 61]);
    return {
      stim: `<p>A conversion-prediction model has run for months. This morning's dashboard:</p>` + T(["Signal", "Last week", "Today"], [["Service error rate", "0.1%", "0.1%"], ["p99 latency", "85 ms", "84 ms"], ["Mean predicted conversion", base + "%", now + "%"], ["Feature <code>days_since_last_visit</code> null rate", "2%", nulls + "%"], ["Measured conversion (labels lag 7 days)", "4.3%", "not yet available"]], "Model health"),
      parts: [
        ["sd.monitoring", 2, "Is the system healthy?", ["No: service metrics look fine, but the data and predictions have shifted sharply", "Yes: errors and latency are normal", "Yes: predictions are just lower", "Unknown until labels arrive next week"], "System health and model health are different layers. The prediction mean and null rate are alarming."],
        ["sd.monitoring", 2, "What is the most likely root cause?", ["An upstream change broke the days_since_last_visit feature", "Concept drift in user behavior", "The model was retrained", "A seasonal dip"], `A null rate jumping from 2% to ${nulls}% overnight points to a pipeline or schema change, not a gradual behavior shift.`],
        ["sd.pipelines", 3, "Which control would have caught this before it reached the model?", ["A data-quality check on null rate that fails the pipeline", "A weekly accuracy report", "A larger model", "More training epochs"], "Validate inputs at the pipeline boundary and stop bad data at the door."],
        ["sd.serving", 3, "What should the service do while the feature is broken?", ["Fall back to a safe default (last good model inputs or a simpler model) and alert", "Keep serving the degraded predictions silently", "Shut down entirely", "Double the traffic"], "Graceful degradation plus an alert limits the damage."],
        ["sd.features", 3, "Training fills missing values with the median, but the online service fills them with 0. This is an example of:", ["Training-serving skew", "Concept drift", "Position bias", "Cold start"], "The same feature is computed differently in the two paths."],
      ],
    };
  });
  S("sd.storage", "Why is this query slow?", (r) => {
    const days = r.pick([365, 730]), gb = r.pick([2, 4, 5]), cols = r.pick([120, 200]);
    return {
      stim: `<p>An <code>events</code> table holds ${days} days of data, about ${gb} GB per day, with ${cols} columns, stored as one large set of CSV files with no partitioning. This query takes 40 minutes:</p>` + C(`SELECT country, COUNT(*)\nFROM events\nWHERE event_date = '2026-11-01'\nGROUP BY country;`),
      parts: [
        ["sd.storage", 2, "Roughly how much data does the engine scan today?", N(days * gb, [gb, days * gb / cols, gb * cols], (x) => num(x) + " GB"), `No partitioning and a row format mean a full scan: ${days} × ${gb} GB = ${num(days * gb)} GB.`],
        ["sd.storage", 2, "After partitioning by <code>event_date</code>, how much is scanned?", N(gb, [days * gb, gb / 2, days], (x) => num(x) + " GB"), `Partition pruning reads only the matching day: about ${gb} GB.`],
        ["sd.storage", 3, `The query uses 2 of ${cols} columns. Converting to Parquet as well cuts the scan to roughly:`, N((gb * 2 / cols) * 1000, [gb * 1000, gb * 1000 / 2, days * gb], (x) => num(x) + " MB"), `Only the two needed columns are read: about ${gb} GB × 2/${cols} ≈ ${num((gb * 2 / cols) * 1000)} MB before compression.`],
        ["sd.storage", 2, "Why would partitioning by <code>user_id</code> be a bad choice here?", ["Millions of tiny partitions, and this query doesn't filter by user", "user_id is not a number", "Partitions must be dates", "It would duplicate the data"], "Partition on the filter column, and keep the number of partitions manageable."],
      ],
    };
  });
  S("sd.fraud", "Choosing a fraud threshold", (r) => {
    const rows = [[0.9, r.int(60, 75), r.int(10, 20)], [0.7, r.int(110, 130), r.int(80, 120)], [0.5, r.int(150, 170), r.int(400, 600)]], total = 200, amt = r.pick([100, 150]), fd = r.pick([10, 20]);
    const cost = (x) => (total - x[1]) * amt + x[2] * fd, best = rows.slice().sort((a, b) => cost(a) - cost(b))[0];
    return {
      stim: `<p>Out of 100,000 test transactions, ${total} are fraud. Blocking at different score thresholds gives:</p>` + T(["Block if score ≥", "Fraud caught", "Legitimate blocked"], rows.map((x) => [x[0], x[1], x[2]]), "Threshold options") + `<p>A missed fraud costs $${amt}; a blocked legitimate transaction costs $${fd}.</p>`,
      parts: [
        ["sd.fraud", 2, `What is recall at threshold ${rows[1][0]}?`, N(rows[1][1] / total, [rows[1][1] / (rows[1][1] + rows[1][2]), rows[0][1] / total, 1 - rows[1][1] / total], (x) => (x * 100).toFixed(1) + "%"), `${rows[1][1]} of ${total} frauds caught = ${((rows[1][1] / total) * 100).toFixed(1)}%.`],
        ["sd.fraud", 2, `What is precision at threshold ${rows[1][0]}?`, N(rows[1][1] / (rows[1][1] + rows[1][2]), [rows[1][1] / total, rows[1][2] / (rows[1][1] + rows[1][2]), 0.99], (x) => (x * 100).toFixed(1) + "%"), `${rows[1][1]} / (${rows[1][1]} + ${rows[1][2]}) = ${((rows[1][1] / (rows[1][1] + rows[1][2])) * 100).toFixed(1)}%.`],
        ["sd.fraud", 3, "Which threshold has the lowest total cost?", [String(best[0]), ...rows.filter((x) => x !== best).map((x) => String(x[0])), "They all cost the same"], rows.map((x) => `${x[0]}: ${total - x[1]} missed × $${amt} + ${x[2]} blocked × $${fd} = $${num(cost(x))}`).join("; ") + "."],
        ["sd.fraud", 3, "Why not simply use the threshold with the highest recall?", ["Blocking many legitimate customers has its own cost, which can outweigh the fraud saved", "Recall is not a real metric", "High recall always lowers revenue to zero", "Regulators cap recall at 80%"], "The operating point is a cost trade-off, not a contest on one metric."],
      ],
    };
  });
})();
