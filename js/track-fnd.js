/* Track — Foundations: the gentle on-ramp. Lessons, questions and cases in one file. */
(function () {
  const L = (skill, title, mins, body, keys, extra = {}) => Object.assign({ skill, title, mins, body, keys }, extra);
  const Q = GR.Q, G = GR.G, N = GR.nopts, S = GR.S, T = GR.tbl, C = GR.code, f2 = (x) => x.toFixed(2);

  GR.track({
    id: "fnd", name: "Foundations", color: "var(--t-fnd)", icon: "FND",
    blurb: "Start here if the other tracks feel steep: the math, Python and data vocabulary that everything else quietly assumes.",
    modules: [
      { name: "The math you actually need", topics: [
        { name: "Numbers and functions", lessons: [
          L("fnd.algebra", "Functions, exponents and logs", 8,
            `<p>A <b>function</b> is a rule that turns an input into an output: <code>f(x) = 2x + 1</code> turns 3 into 7. Machine learning is mostly about finding a function that turns data into good predictions.</p>
             <p><b>Exponents</b> describe repeated multiplication: 2³ = 2 × 2 × 2 = 8. Things that grow by a percentage (money, users, viruses) grow exponentially. A <b>logarithm</b> undoes an exponent: log₂(8) = 3 because 2³ = 8. Logs turn multiplication into addition, <code>log(a·b) = log(a) + log(b)</code>, which is why they show up everywhere from loss functions to charts with huge ranges.</p>
             <p>Two functions to recognize on sight: the <b>line</b> <code>y = mx + b</code> (m is the slope, b is where it crosses the y-axis) and the <b>sigmoid</b>, an S-shaped curve that squashes any number into the range 0 to 1, handy for probabilities.</p>`,
            ["A function maps inputs to outputs.", "log undoes exponent: log₂(8) = 3.", "Slope m = change in y per unit change in x."], { related: ["ml.linreg", "ml.logreg"] }),
          L("fnd.calculus", "Derivatives: slopes that tell you which way to go", 8,
            `<p>The <b>derivative</b> of a function at a point is its slope there: how fast the output changes when you nudge the input. For <code>f(x) = x²</code> the derivative is <code>2x</code>: at x = 3 the curve rises 6 units per unit of x; at x = 0 it is flat.</p>
             <p>Where the derivative is <b>zero</b>, the function is flat: a candidate minimum or maximum. Training a model means finding the bottom of a loss function, and the derivative tells you which direction is downhill. That is all gradient descent is: step opposite to the slope, repeat.</p>
             <p>With many inputs you get one slope per input, a <b>partial derivative</b>. Stack them into a vector and you have the <b>gradient</b>, which points in the direction of steepest increase. The <b>chain rule</b> (multiply the slopes of nested functions) is what backpropagation uses to push slopes through a neural network's layers.</p>`,
            ["Derivative = slope = rate of change.", "Slope zero → flat → possible minimum.", "Gradient = vector of partial derivatives; step against it to descend."], { diagram: "gd", related: ["ml.gd", "ai.backprop"] }),
        ]},
        { name: "Vectors and chance", lessons: [
          L("fnd.vectors", "Vectors and matrices", 9,
            `<p>A <b>vector</b> is a list of numbers: <code>[height, weight, age]</code> describes a person as a point in 3-dimensional space. A <b>matrix</b> is a table of numbers: a dataset with 1,000 rows and 20 columns is a 1000 × 20 matrix.</p>
             <p>The <b>dot product</b> multiplies two vectors position by position and adds the results: <code>[1, 2, 3] · [4, 5, 6] = 4 + 10 + 18 = 32</code>. It measures how much two vectors point the same way, and it is the core operation of every neuron and every linear model (weights · inputs).</p>
             <p><b>Matrix multiplication</b> is many dot products at once: an (m × n) matrix times an (n × p) matrix gives an (m × p) matrix, and the inner sizes must match. The <b>length</b> (norm) of a vector is <code>√(x₁² + x₂² + …)</code>; distance between two points is the length of their difference.</p>`,
            ["Vector = list of numbers; matrix = table of numbers.", "Dot product: multiply pairwise, then sum.", "(m × n)(n × p) → (m × p); inner sizes must match."], { related: ["ai.neuron", "ai.tokens"] }),
          L("fnd.stats", "Averages, spread and chance", 8,
            `<p>The <b>mean</b> is the sum divided by the count. The <b>median</b> is the middle value when sorted. They differ when data is lopsided: five salaries of 40k, 45k, 50k, 55k and 1M have a mean of 238k and a median of 50k. The median describes the typical person better.</p>
             <p><b>Standard deviation</b> measures spread: roughly, the typical distance from the mean. Small means values cluster tightly; large means they are scattered. <b>Variance</b> is its square.</p>
             <p><b>Probability</b> is a number from 0 (impossible) to 1 (certain). For independent events you <b>multiply</b> to get "both happen" (two heads: 0.5 × 0.5 = 0.25). For "at least one", it is easier to compute 1 minus the chance that none happen.</p>`,
            ["Mean chases outliers; median doesn't.", "Standard deviation = typical distance from the mean.", "Independent 'and' → multiply. 'At least one' → 1 − P(none)."], { diagram: "clt", related: ["ds.prob", "ds.descriptive"] }),
        ]},
      ]},
      { name: "Python for data", topics: [
        { name: "The language", lessons: [
          L("fnd.python", "Python essentials", 10,
            `<p>Four containers do most of the work. A <b>list</b> <code>[3, 1, 2]</code> is ordered and changeable. A <b>dict</b> <code>{"ada": 36}</code> maps keys to values with instant lookup. A <b>set</b> <code>{1, 2}</code> holds unique items. A <b>tuple</b> <code>(x, y)</code> is a fixed-size, unchangeable group.</p>
             <p>Loops walk through them: <code>for x in items:</code>. A <b>list comprehension</b> builds a list in one line: <code>[x * 2 for x in items if x > 0]</code>. <b>Functions</b> package steps behind a name: <code>def area(w, h): return w * h</code>.</p>
             <p>Gotchas interviewers love: indexing starts at <b>0</b>; <code>items[-1]</code> is the last element; slices <code>a[1:3]</code> include the start but not the end; <code>==</code> compares values while <code>=</code> assigns; and integer division is <code>//</code>.</p>`,
            ["list, dict, set, tuple: know when to use each.", "Comprehension: [expr for x in items if cond].", "Indexes start at 0; slices exclude the end."], { related: ["swe.arrays", "swe.bigo"] }),
        ]},
        { name: "The data stack", lessons: [
          L("fnd.numpy", "NumPy and thinking in arrays", 8,
            `<p><b>NumPy</b> gives Python fast arrays. Instead of looping over a million numbers, you write the operation once and it applies to the whole array: <code>prices * 1.1</code> raises every price by 10%. This is <b>vectorization</b>, and it is 10 to 100 times faster than a Python loop because the work happens in compiled code.</p>
             <p>Arrays have a <b>shape</b>: <code>(1000, 20)</code> means 1,000 rows and 20 columns. Operations take an <b>axis</b>: <code>X.mean(axis=0)</code> averages down the rows, giving one mean per column. <b>Broadcasting</b> stretches smaller arrays to fit: subtracting a row of 20 column means from a (1000, 20) array centers every column in one line.</p>
             <p><b>Boolean masks</b> filter without loops: <code>x[x > 0]</code> keeps the positive values.</p>`,
            ["Vectorize: operate on whole arrays, not elements.", "axis=0 goes down rows (per-column result).", "Masks filter: x[x > 0]."], { related: ["fnd.vectors", "fnd.pandas"] }),
          L("fnd.pandas", "pandas: tables in Python", 10,
            `<p>A <b>DataFrame</b> is a table with named columns; one column is a <b>Series</b>. You load one with <code>pd.read_csv("file.csv")</code> and look at it with <code>df.head()</code>, <code>df.info()</code> and <code>df.describe()</code>.</p>
             <p>The everyday verbs: <b>select</b> columns <code>df[["name", "salary"]]</code>; <b>filter</b> rows <code>df[df.salary > 50000]</code>; <b>add a column</b> <code>df["tax"] = df.salary * 0.3</code>; <b>group and summarize</b> <code>df.groupby("dept").salary.mean()</code>; <b>sort</b> <code>df.sort_values("salary")</code>; and <b>join</b> two tables <code>df.merge(other, on="id", how="left")</code>.</p>
             <p>These map one-to-one onto SQL: filter is WHERE, groupby is GROUP BY, merge is JOIN. Learn one and the other comes almost free. Missing values appear as <b>NaN</b>; count them with <code>df.isna().sum()</code>.</p>`,
            ["DataFrame = table; Series = column.", "filter, groupby, merge ≈ WHERE, GROUP BY, JOIN.", "Always check missing values first."], { related: ["ba.sql", "ds.wrangling"] }),
        ]},
      ]},
      { name: "How the pieces fit", topics: [
        { name: "The big picture", lessons: [
          L("fnd.data", "Kinds of data and how tables work", 7,
            `<p>A dataset is a table: each <b>row</b> is one thing (a customer, an order, a day) and each <b>column</b> is one attribute. Deciding what one row represents, the table's <b>grain</b>, is the first question to ask of any dataset.</p>
             <p>Columns come in types. <b>Numeric</b>: continuous (price, temperature) or counts. <b>Categorical</b>: unordered labels (country) or <b>ordinal</b> ones with an order (small, medium, large). Plus dates, free text and true/false flags. The type decides what you can do: you can average prices, but not countries.</p>
             <p>A <b>primary key</b> is a column that uniquely identifies each row (customer_id). A <b>foreign key</b> is a column that points at another table's primary key (orders.customer_id), which is how tables link together.</p>`,
            ["Ask first: what does one row represent?", "Numeric vs categorical vs ordinal decides the math.", "Primary key identifies a row; foreign key links tables."], { related: ["ba.joins", "ds.features"] }),
          L("fnd.workflow", "The life of a data project", 8,
            `<p>Almost every project follows the same loop. <b>1. Question</b>: what decision will this inform, and what would success look like? <b>2. Data</b>: find it, pull it, understand how it was collected. <b>3. Clean</b>: fix types, missing values and duplicates (usually most of the time). <b>4. Explore</b>: plot it, summarize it, look for surprises. <b>5. Model</b> or analyze. <b>6. Evaluate</b> honestly on data the model has not seen. <b>7. Communicate</b>: a clear answer, not a notebook.</p>
             <p>The roles split along it. A <b>data analyst</b> lives in steps 1, 4 and 7 with SQL and dashboards. A <b>data scientist</b> adds statistics and modeling. An <b>ML engineer</b> turns models into reliable software. A <b>data engineer</b> builds the pipelines that feed everyone.</p>
             <p>The most common failure is not a bad model. It is answering the wrong question well.</p>`,
            ["Question → data → clean → explore → model → evaluate → communicate.", "Cleaning takes most of the time.", "Start from the decision, not the data."], { related: ["ba.cases", "ml.supervised"] }),
          L("fnd.interview", "How interviews work (and how to practice)", 8,
            `<p>Data and AI interview loops mix a few formats: a <b>recruiter screen</b>; a <b>technical screen</b> (SQL or coding, live); a <b>take-home</b> or case; <b>theory</b> questions (statistics, ML); <b>system or product design</b>; and <b>behavioral</b> rounds.</p>
             <p>For behavioral questions use <b>STAR</b>: the <b>S</b>ituation, the <b>T</b>ask you owned, the <b>A</b>ction you took (most of your answer), and the <b>R</b>esult, with a number if you have one. For technical questions, <b>think out loud</b>: restate the problem, ask clarifying questions, state assumptions, start simple, then improve. Interviewers grade the reasoning, not just the answer.</p>
             <p>Practice the way memory works: <b>retrieve</b> answers before looking (that is what the quizzes here force), <b>space</b> sessions across days instead of cramming, and <b>explain concepts out loud</b> as if teaching. If you can't explain it simply, you have found what to study next.</p>`,
            ["STAR: Situation, Task, Action, Result.", "Think out loud; clarify before solving.", "Retrieval + spacing beats rereading."], { related: ["ba.cases", "fnd.workflow"] }),
        ]},
      ]},
    ],
  });
  GR.tracks.unshift(GR.tracks.pop());   // Foundations goes first in the sidebar
  GR.tracks[0].skills.forEach((sid, i) => (GR.skills[sid].order = -1000 + i));   // and first in the recommended learning order

  /* ---- fnd.algebra ---- */
  Q("fnd.algebra", 1, "If f(x) = 2x + 1, what is f(3)?", ["7", "6", "5", "9"], "2 × 3 + 1 = 7.");
  Q("fnd.algebra", 1, "What is log₂(8)?", ["3", "4", "2", "16"], "2³ = 8, so the exponent is 3.");
  Q("fnd.algebra", 1, "In y = mx + b, what does m represent?", ["The slope: how much y changes when x increases by 1", "Where the line crosses the y-axis", "The largest value of y", "The number of data points"], "m is the slope; b is the intercept.");
  Q("fnd.algebra", 2, "Which statement about logarithms is true?", ["log(a × b) = log(a) + log(b)", "log(a + b) = log(a) × log(b)", "log(a × b) = log(a) × log(b)", "log(a) is always larger than a"], "Logs turn products into sums, which is why log-likelihoods are added.");
  Q("fnd.algebra", 2, "Something that grows by 10% every year is growing:", ["Exponentially", "Linearly", "Logarithmically", "Not at all"], "A constant percentage rate compounds: value × 1.1 each year.");
  Q("fnd.algebra", 2, "The sigmoid function is useful for probabilities because it:", ["Squashes any number into the range 0 to 1", "Always outputs whole numbers", "Is a straight line", "Outputs only negative values"], "Any input maps to a value between 0 and 1.");
  G("fnd.algebra", 1, (r) => { const m = r.int(2, 6), b = r.int(-5, 9), x = r.int(2, 7); return { stem: `If f(x) = ${m}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}, what is f(${x})?`, opts: N(m * x + b, [m * x, m + x + b, m * (x + b)]), expl: `${m} × ${x} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${m * x + b}.` }; });

  /* ---- fnd.calculus ---- */
  Q("fnd.calculus", 1, "The derivative of a function at a point tells you:", ["Its slope there: how fast the output changes", "Its largest value", "The area under it", "Where it crosses zero"], "Derivative = rate of change = slope of the tangent line.");
  Q("fnd.calculus", 1, "The derivative of f(x) = x² is:", ["2x", "x", "x³", "2"], "Bring the exponent down and reduce it by one.");
  Q("fnd.calculus", 2, "At the bottom of a smooth valley-shaped curve, the derivative is:", ["Zero", "Very large and positive", "Very large and negative", "Undefined"], "At a minimum the curve is flat, so the slope is zero.");
  Q("fnd.calculus", 2, "The slope at your current position is positive (uphill to the right). To go downhill you should move:", ["Left, opposite to the slope", "Right, with the slope", "Nowhere", "Up"], "Gradient descent steps against the derivative.");
  Q("fnd.calculus", 2, "A gradient is:", ["A vector with one partial derivative per input", "A single number that is always positive", "The second derivative", "The value of the function at zero"], "It collects the slope along every input direction.");
  Q("fnd.calculus", 3, "The chain rule is essential to neural networks because it:", ["Lets you compute slopes through layers of nested functions", "Removes the need for derivatives", "Makes every function linear", "Chooses the learning rate"], "Backpropagation is the chain rule applied layer by layer.");
  G("fnd.calculus", 2, (r) => { const a = r.int(2, 5), x = r.int(1, 6); return { stem: `For f(x) = ${a}x², what is the slope at x = ${x}?`, opts: N(2 * a * x, [a * x * x, a * x, 2 * a]), expl: `f′(x) = ${2 * a}x, so at x = ${x} the slope is ${2 * a * x}.` }; });

  /* ---- fnd.vectors ---- */
  Q("fnd.vectors", 1, "What is the dot product of [1, 2, 3] and [4, 5, 6]?", ["32", "15", "90", "[4, 10, 18]"], "1×4 + 2×5 + 3×6 = 4 + 10 + 18 = 32.");
  Q("fnd.vectors", 1, "A dataset with 500 rows and 12 columns is a matrix of shape:", ["500 × 12", "12 × 500", "512", "6,000 × 1"], "Rows first, then columns.");
  Q("fnd.vectors", 2, "You can multiply a (3 × 4) matrix by a matrix of which shape?", ["4 × 2", "3 × 4", "2 × 3", "3 × 3"], "The inner dimensions must match: (3 × 4)(4 × 2) → (3 × 2).");
  Q("fnd.vectors", 2, "The length (norm) of the vector [3, 4] is:", ["5", "7", "12", "25"], "√(3² + 4²) = √25 = 5.");
  Q("fnd.vectors", 2, "A single neuron computes weights · inputs + bias. The '·' is a:", ["Dot product", "Matrix inverse", "Division", "Sort"], "Multiply each input by its weight and add them up.");
  Q("fnd.vectors", 3, "Two vectors have a dot product of 0. They are:", ["Perpendicular (they share no direction)", "Identical", "Pointing in opposite directions", "Both zero"], "A zero dot product means the vectors are orthogonal.");
  G("fnd.vectors", 1, (r) => { const a = [r.int(1, 5), r.int(1, 5)], b = [r.int(1, 5), r.int(-3, 5)], v = a[0] * b[0] + a[1] * b[1]; return { stem: `What is [${a}] · [${b}]?`, opts: N(v, [a[0] + a[1] + b[0] + b[1], a[0] * b[1] + a[1] * b[0] + 1, a[0] * b[0] * a[1] * b[1]]), expl: `${a[0]}×${b[0]} + ${a[1]}×${b[1]} = ${v}.` }; });

  /* ---- fnd.stats ---- */
  Q("fnd.stats", 1, "What is the median of 2, 9, 4, 7, 100?", ["7", "24.4", "4", "100"], "Sorted: 2, 4, 7, 9, 100. The middle value is 7.");
  Q("fnd.stats", 1, "One billionaire walks into a small café. Which statistic of the customers' wealth barely changes?", ["The median", "The mean", "The maximum", "The sum"], "The median ignores how extreme the outlier is.");
  Q("fnd.stats", 2, "A small standard deviation means the values are:", ["Clustered close to the mean", "Spread far apart", "All negative", "Missing"], "Standard deviation is the typical distance from the mean.");
  Q("fnd.stats", 2, "You flip a fair coin twice. What is the probability of two heads?", ["0.25", "0.5", "1", "0.75"], "Independent events multiply: 0.5 × 0.5.");
  Q("fnd.stats", 2, "What is the probability of at least one head in two fair flips?", ["0.75", "0.5", "0.25", "1"], "1 − P(no heads) = 1 − 0.25.");
  Q("fnd.stats", 1, "A probability must be:", ["Between 0 and 1", "Greater than 1", "A whole number", "Negative for unlikely events"], "0 means impossible, 1 means certain.");
  G("fnd.stats", 1, (r) => { const a = r.shuffle([r.int(1, 9), r.int(10, 19), r.int(20, 29), r.int(30, 39), r.int(40, 49)]), s = a.reduce((x, y) => x + y, 0); return { stem: `What is the mean of ${a.join(", ")}?`, opts: N(s / 5, [a.slice().sort((x, y) => x - y)[2], s / 4, s], (x) => (x % 1 ? x.toFixed(1) : String(x))), expl: `Sum ${s} ÷ 5 = ${s / 5}.` }; });

  /* ---- fnd.python ---- */
  Q("fnd.python", 1, "What does <code>[10, 20, 30][0]</code> return?", ["10", "20", "30", "An error"], "Indexing starts at 0.");
  Q("fnd.python", 1, "Which structure gives the fastest lookup of a value by a key like a username?", ["A dict", "A list", "A tuple", "A string"], "Dictionaries use hashing for near-instant lookup by key.");
  Q("fnd.python", 2, "What does <code>[x * 2 for x in [1, 2, 3] if x > 1]</code> produce?", ["[4, 6]", "[2, 4, 6]", "[1, 2, 3]", "[2, 3]"], "It keeps 2 and 3, then doubles them.");
  Q("fnd.python", 2, "What does <code>\"python\"[1:4]</code> return?", ["\"yth\"", "\"pyth\"", "\"ytho\"", "\"pyt\""], "Slices include the start index and exclude the end: indexes 1, 2, 3.");
  Q("fnd.python", 2, "What does <code>len(set([1, 1, 2, 3, 3]))</code> return?", ["3", "5", "2", "1"], "A set keeps only unique items: {1, 2, 3}.");
  Q("fnd.python", 1, "What does <code>items[-1]</code> return?", ["The last element", "The first element", "An error", "The list reversed"], "Negative indexes count from the end.");
  Q("fnd.python", 3, "What does <code>7 // 2</code> evaluate to in Python 3?", ["3", "3.5", "4", "1"], "// is floor division. / would give 3.5 and % would give the remainder 1.");

  /* ---- fnd.numpy ---- */
  Q("fnd.numpy", 1, "With NumPy array <code>a = np.array([1, 2, 3])</code>, what is <code>a * 2</code>?", ["array([2, 4, 6])", "array([1, 2, 3, 1, 2, 3])", "An error", "6"], "Arithmetic applies element by element. (A Python list would repeat instead.)");
  Q("fnd.numpy", 2, "Why is vectorized NumPy code faster than a Python loop?", ["The loop runs in compiled code over contiguous memory", "NumPy skips some elements", "Python loops are run twice", "It uses less precise numbers"], "The per-element work happens in optimized C, not the Python interpreter.");
  Q("fnd.numpy", 2, "X has shape (1000, 20). What is the shape of <code>X.mean(axis=0)</code>?", ["(20,)", "(1000,)", "(1000, 20)", "()"], "axis=0 collapses the rows, leaving one mean per column.");
  Q("fnd.numpy", 2, "What does <code>x[x > 0]</code> do?", ["Keeps only the positive elements", "Sets negatives to zero", "Returns True or False", "Sorts the array"], "A boolean mask selects the elements where the condition is true.");
  Q("fnd.numpy", 3, "Subtracting an array of 20 column means from a (1000, 20) array works because of:", ["Broadcasting", "Recursion", "Garbage collection", "Slicing"], "The smaller array is stretched along the missing dimension.");

  /* ---- fnd.pandas ---- */
  Q("fnd.pandas", 1, "Which pandas call shows the first rows of a DataFrame?", ["df.head()", "df.first()", "df.top()", "df.show()"], "head() returns the first five rows by default.");
  Q("fnd.pandas", 1, "<code>df[df.salary > 50000]</code> is the pandas version of SQL's:", ["WHERE", "GROUP BY", "JOIN", "ORDER BY"], "It filters rows by a condition.");
  Q("fnd.pandas", 2, "<code>df.groupby(\"dept\").salary.mean()</code> returns:", ["The average salary for each department", "The total salary", "The number of departments", "The departments sorted by name only"], "Split by dept, apply mean, combine.");
  Q("fnd.pandas", 2, "Which call counts missing values in each column?", ["df.isna().sum()", "df.count_nulls()", "df.missing()", "df.dropna()"], "isna() marks missing cells; sum() counts them per column. dropna() would remove rows.");
  Q("fnd.pandas", 2, "<code>a.merge(b, on=\"id\", how=\"left\")</code> keeps:", ["Every row of a, with b's columns where an id matches", "Only ids present in both", "Every row of b", "Only unmatched rows"], "A left join keeps the left table whole and fills non-matches with NaN.");
  Q("fnd.pandas", 1, "A single column of a DataFrame is a:", ["Series", "Dict", "Tuple", "Matrix"], "A DataFrame is a collection of Series sharing an index.");

  /* ---- fnd.data ---- */
  Q("fnd.data", 1, "In a table of orders, each row most likely represents:", ["One order", "One customer", "One column", "One database"], "The grain of an orders table is one row per order.");
  Q("fnd.data", 1, "Which of these is a categorical variable?", ["Country", "Temperature", "Revenue", "Height"], "Country is a label, not a quantity.");
  Q("fnd.data", 2, "T-shirt size (S, M, L) is best described as:", ["Ordinal: categories with a meaningful order", "Continuous", "A primary key", "Free text"], "The sizes have an order, but the gaps between them are not numeric.");
  Q("fnd.data", 2, "A primary key is a column that:", ["Uniquely identifies each row", "Holds the largest values", "Must be text", "Is always the first column"], "No two rows share the same primary key.");
  Q("fnd.data", 2, "orders.customer_id pointing at customers.id is a:", ["Foreign key", "Primary key of orders", "Duplicate", "Index error"], "A foreign key references another table's primary key.");
  Q("fnd.data", 3, "Why is taking the average of ZIP codes meaningless?", ["They are labels that happen to be written with digits", "They are too large", "They contain missing values", "Averages need at least 100 rows"], "A ZIP code is categorical; arithmetic on it has no meaning.");

  /* ---- fnd.workflow ---- */
  Q("fnd.workflow", 1, "What should come first in a data project?", ["A clear question tied to a decision", "Training a model", "Building a dashboard", "Collecting as much data as possible"], "Without a question you can't tell which data or analysis matters.");
  Q("fnd.workflow", 1, "Which step usually takes the most time in practice?", ["Getting and cleaning the data", "Choosing a model", "Writing the final slide", "Picking chart colors"], "Real data is messy; cleaning commonly dominates the schedule.");
  Q("fnd.workflow", 2, "Which role mainly builds the pipelines that deliver data to everyone else?", ["Data engineer", "Data analyst", "Product manager", "UX designer"], "Data engineers own ingestion, storage and pipelines.");
  Q("fnd.workflow", 2, "Why evaluate a model on data it has not seen?", ["Performance on training data overstates how it will do in the real world", "Unseen data is cleaner", "It is faster", "Regulations require it"], "A model can memorize its training data. Only held-out data shows whether it generalizes.");
  Q("fnd.workflow", 2, "A technically excellent analysis that answers a question nobody asked is:", ["A failure of step one: framing the question", "A modeling success", "Good exploratory practice", "An engineering problem"], "The most common failure is answering the wrong question well.");

  /* ---- fnd.interview ---- */
  Q("fnd.interview", 1, "In the STAR method, the largest part of your answer should be the:", ["Action: what you specifically did", "Situation", "Task", "Small talk"], "Interviewers want your contribution. Keep the setup brief.");
  Q("fnd.interview", 1, "You get a vague technical question. The best first move is to:", ["Ask clarifying questions and state your assumptions", "Start coding immediately", "Say you don't know", "Change the subject"], "Clarifying shows structured thinking and avoids solving the wrong problem.");
  Q("fnd.interview", 2, "Which study habit is best supported by learning research?", ["Testing yourself and spacing sessions over days", "Rereading notes the night before", "Highlighting every line", "Watching videos at 3× speed"], "Retrieval practice and spacing beat passive review.");
  Q("fnd.interview", 2, "Why do interviewers ask you to think out loud?", ["They are grading your reasoning, not just the final answer", "To slow you down", "To fill time", "Because silence is rude"], "A clear path with a small mistake often beats a silent correct answer.");
  Q("fnd.interview", 2, "A strong 'Result' in a STAR answer includes:", ["A concrete outcome, ideally with a number", "A list of everyone on the team", "An apology", "A new, unrelated story"], "Quantified results are memorable and credible: 'cut load time by 40%'.");

  S("fnd.pandas", "Reading a small DataFrame", {
    stim: `<p>Output of <code>print(df)</code>:</p>` + C(`   name   dept        salary
0  Ana    Sales       50000
1  Ben    Sales       70000
2  Cy     Data        90000
3  Di     Data        NaN
4  Eve    Data        110000`),
    parts: [
      ["fnd.pandas", 1, "What does <code>len(df)</code> return?", ["5", "3", "4", "15"], "There are five rows (index 0 to 4)."],
      ["fnd.pandas", 2, "What does <code>df[df.dept == \"Sales\"].salary.mean()</code> return?", ["60000", "50000", "70000", "80000"], "(50000 + 70000) / 2."],
      ["fnd.pandas", 2, "<code>df.groupby(\"dept\").salary.mean()</code> gives Data an average of:", ["100000, because NaN is skipped", "66666.67, counting NaN as 0", "NaN", "90000"], "pandas skips missing values in mean by default: (90000 + 110000) / 2."],
      ["fnd.stats", 2, "Which is larger for the four known salaries (50k, 70k, 90k, 110k): mean or median?", ["They are equal: both 80,000", "The mean", "The median", "Cannot be computed"], "The values are symmetric, so mean = median = 80,000."],
      ["fnd.data", 1, "What does one row of this table represent?", ["One employee", "One department", "One salary band", "One company"], "The grain is one row per employee."],
    ],
  });
  S("fnd.python", "Tracing a short function", {
    stim: C(`def mystery(words):
    counts = {}
    for w in words:
        counts[w] = counts.get(w, 0) + 1
    return counts

result = mystery(["a", "b", "a", "c", "a"])`),
    parts: [
      ["fnd.python", 1, "What type is <code>result</code>?", ["A dict", "A list", "A set", "A string"], "The function builds and returns a dictionary."],
      ["fnd.python", 2, "What is <code>result[\"a\"]</code>?", ["3", "1", "5", "0"], "\"a\" appears three times."],
      ["fnd.python", 2, "What does <code>counts.get(w, 0)</code> do?", ["Returns the current count, or 0 if w isn't in the dict yet", "Deletes w", "Always returns 0", "Raises an error for new words"], "get with a default avoids a KeyError on the first sighting."],
      ["swe.bigo", 2, "If the list has n words, how many steps does the function take?", ["About n: one pass, with O(1) dict updates", "About n²", "About log n", "A constant number"], "One loop over the list with constant-time dictionary operations is O(n)."],
    ],
  });
})();
