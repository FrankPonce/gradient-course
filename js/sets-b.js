/* Case sets — Data Science & Statistics, Business & Data Analytics */
(function () {
  const S = GR.S, N = GR.nopts, T = GR.tbl, C = GR.code, V = GR.viz;
  const f1 = (x) => x.toFixed(1), f2 = (x) => x.toFixed(2), pc = (x) => (x * 100).toFixed(1) + "%", usd = (x) => "$" + Math.round(x).toLocaleString();
  const sum = (a) => a.reduce((x, y) => x + y, 0);

  /* ================= DATA SCIENCE & STATISTICS ================= */

  S("ds.wrangling", "Working with an orders DataFrame", (r) => {
    const regs = ["North", "South", "East"], units = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 6), rows = units.map((u, i) => ({ region: i < 3 ? regs[i] : r.pick(regs), product: i === 0 ? "A" : i === 1 ? "B" : r.pick(["A", "B"]), units: u, price: r.pick([10, 20, 25]) }));
    const reg = r.pick(regs), rs = sum(rows.filter((x) => x.region === reg).map((x) => x.units)), t = r.int(3, 6), cnt = rows.filter((x) => x.units > t).length;
    const revA = sum(rows.filter((x) => x.product === "A").map((x) => x.units * x.price)), top = rows.slice().sort((a, b) => b.units - a.units)[0];
    return { stim: `<p>A pandas DataFrame <code>df</code>:</p>` + T(["", "region", "product", "units", "price"], rows.map((x, i) => [i, x.region, x.product, x.units, x.price])),
      parts: [
        ["ds.wrangling", 2, `What does <code>df.groupby('region')['units'].sum()['${reg}']</code> return?`, N(rs, [sum(units), rows.filter((x) => x.region === reg).length, rs + t, Math.max(...units)].filter((x) => x !== rs)), `Rows with region ${reg} have units ${rows.filter((x) => x.region === reg).map((x) => x.units).join(" + ")} = ${rs}.`],
        ["ds.wrangling", 1, `What does <code>len(df[df['units'] > ${t}])</code> return?`, N(cnt, [rows.filter((x) => x.units >= t).length, 6 - cnt, 6, cnt + 2].filter((x) => x !== cnt)), `The boolean mask keeps rows whose units exceed ${t}: ${rows.filter((x) => x.units > t).map((x) => x.units).join(", ") || "none"}. That is ${cnt} row${cnt === 1 ? "" : "s"}.`],
        ["ds.wrangling", 3, "Which expression gives total revenue (units × price) per product?", ["<code>df.assign(rev=df.units * df.price).groupby('product')['rev'].sum()</code>", "<code>df.groupby('product')['units'].sum() * df['price']</code>", "<code>df.groupby('product').sum()['price']</code>", "<code>df['units'].sum() * df['price'].sum()</code>"], "Revenue must be computed row by row before aggregating. Multiplying a per-product total by the row-level price column misaligns the indexes."],
        ["ds.wrangling", 2, "Using the correct expression, what is the revenue for product A?", N(revA, [sum(rows.filter((x) => x.product === "A").map((x) => x.units)) * 10, sum(rows.map((x) => x.units * x.price)), revA + 25, sum(rows.filter((x) => x.product === "B").map((x) => x.units * x.price))].filter((x) => x !== revA)), `Product A rows: ${rows.filter((x) => x.product === "A").map((x) => `${x.units}×${x.price}`).join(" + ")} = ${revA}.`],
        ["ds.wrangling", 2, "What does <code>df.sort_values('units', ascending=False).iloc[0]['region']</code> return?", [top.region, ...regs.filter((x) => x !== top.region), "units"], `Sorting descending puts the row with ${top.units} units first; its region is ${top.region}. iloc[0] is positional, so it is the first row after sorting.`],
      ] };
  });

  S("ds.wrangling", "A DataFrame with missing values", (r) => {
    const names = ["Ana", "Ben", "Cal", "Dee", "Eli", "Fay"], age = Array.from({ length: 6 }, () => r.int(22, 58)), inc = Array.from({ length: 6 }, () => r.int(3, 9) * 10);
    const a = r.int(0, 5), b = r.int(0, 5), c = (b + r.int(1, 5)) % 6, miss = new Set([a, b, c]), ages = age.filter((_, i) => i !== a), mean = sum(ages) / 5;
    return { stim: `<p>A DataFrame <code>df</code> of survey responses:</p>` + T(["", "name", "age", "income_k"], names.map((n, i) => [i, n, i === a ? "NaN" : age[i], i === b || i === c ? "NaN" : inc[i]])),
      parts: [
        ["ds.wrangling", 1, "What does <code>df.dropna().shape[0]</code> return?", N(6 - miss.size, [6, 3, miss.size, 6 - miss.size + 1].filter((x) => x !== 6 - miss.size)), `dropna() removes every row containing at least one NaN. ${miss.size} row${miss.size > 1 ? "s have" : " has"} a missing value, leaving ${6 - miss.size}.`],
        ["ds.wrangling", 1, "What does <code>df['income_k'].isna().sum()</code> return?", ["2", "1", "3", "4"], "Two cells in income_k are NaN."],
        ["ds.wrangling", 2, "What value does <code>df['age'].fillna(df['age'].mean())</code> put in the missing age?", N(mean, [sum(ages) / 6, ages.slice().sort((x, y) => x - y)[2], 0, mean + 3], f1), `mean() skips NaN, so it averages the 5 known ages: ${sum(ages)} / 5 = ${f1(mean)}.`],
        ["ds.wrangling", 3, "Income is missing mostly for the highest earners, who declined to answer. Filling with the mean will:", ["Bias the average income downward and understate its spread", "Have no effect on any statistic", "Bias the average upward", "Correctly recover the true values"], "The missing values are systematically high (missing not at random), so the observed mean is too low, and inserting it repeatedly also shrinks the variance."],
        ["ds.features", 2, "Before training a model on this table, what often preserves useful signal?", ["Add an 'income_missing' indicator column alongside the imputed value", "Delete the income column", "Replace NaN with the string 'unknown' in the numeric column", "Duplicate the complete rows"], "The fact that a value is missing can itself be predictive.", ["ds.wrangling"]],
      ] };
  });

  S("ds.descriptive", "Summarising salaries with an outlier", (r) => {
    const v = r.shuffle([32, 35, 38, 41, 44, 47, 50, 53, 56, 59, 62]).slice(0, 8).sort((a, b) => a - b), out = r.pick([180, 220, 260]), all = [...v, out], mean = sum(all) / 9, med = all[4], med2 = (v[3] + v[4]) / 2, mean2 = sum(v) / 8;
    return { stim: `<p>Annual salaries (in $k) of the nine people in a small team:</p>` + V.bars({ labels: all.map((_, i) => "P" + (i + 1)), vals: all, w: 480, h: 200, color: all.map((x) => (x === out ? "var(--pink)" : "var(--navy)")) }),
      parts: [
        ["ds.descriptive", 1, "What is the median salary?", N(med, [mean, all[3], all[5], out], (x) => "$" + f1(x) + "k"), `Sorted, the 5th of 9 values is ${med}.`],
        ["ds.descriptive", 1, "What is the mean salary?", N(mean, [med, mean2, sum(all) / 8, out / 2], (x) => "$" + f1(x) + "k"), `Sum = ${sum(all)}; divided by 9 = ${f1(mean)}.`],
        ["ds.descriptive", 2, "Which number better represents a typical team member's salary?", ["The median: one extreme value pulls the mean far above eight of the nine salaries", "The mean: it uses all the data", "The maximum", "The range"], `The mean (${f1(mean)}) exceeds every salary except the outlier. The median (${med}) sits in the middle of the group.`],
        ["ds.descriptive", 2, `If the ${out}k salary is removed, what is the new median?`, N(med2, [med, v[3], v[4], mean2].filter((x) => x !== med2), (x) => "$" + f1(x) + "k"), `With 8 values, the median is the average of the 4th and 5th: (${v[3]} + ${v[4]}) / 2 = ${f1(med2)}. It barely moves, while the mean drops to ${f1(mean2)}.`],
        ["ds.descriptive", 3, `Should the ${out}k value be deleted from an analysis of pay?`, ["Not automatically: check whether it is an error or a real salary, and report robust statistics", "Yes, outliers must always be removed", "Yes, because it exceeds the mean", "No, and the mean should be reported alone"], "An outlier may be a typo or the most informative row. Investigate first, then choose statistics that suit the distribution."],
      ] };
  });

  S("ds.corr", "Two hospitals", {
    stim: `<p>Survival after a surgical procedure at two hospitals, split by the severity of the patient's condition on arrival.</p>` + T(["", "Hospital A survived / treated", "Hospital A rate", "Hospital B survived / treated", "Hospital B rate"], [["Mild cases", "870 / 900", "96.7%", "590 / 600", "98.3%"], ["Severe cases", "30 / 100", "30.0%", "210 / 400", "52.5%"], ["<b>All patients</b>", "<b>900 / 1,000</b>", "<b>90.0%</b>", "<b>800 / 1,000</b>", "<b>80.0%</b>"]]),
    parts: [
      ["ds.corr", 1, "Looking only at the bottom row, which hospital appears better?", ["Hospital A", "Hospital B", "They are equal", "It cannot be read from the row"], "A's overall survival is 90% against B's 80%."],
      ["ds.corr", 2, "Which hospital has the better survival rate for severe cases, and for mild cases?", ["Hospital B for both", "Hospital A for both", "A for mild, B for severe", "B for mild, A for severe"], "B wins 98.3% to 96.7% on mild cases and 52.5% to 30.0% on severe ones."],
      ["ds.corr", 2, "What is this reversal called?", ["Simpson's paradox", "Regression to the mean", "Survivorship bias", "The base-rate fallacy"], "A trend present in every subgroup reverses when the groups are pooled."],
      ["ds.corr", 3, "Why does it happen here?", ["Hospital B treats four times as many severe cases, which drag down its overall rate", "Hospital A has better surgeons", "The samples are too small", "Survival was measured differently"], "Case mix is a confounder: severity affects both which hospital a patient goes to and whether they survive."],
      ["ds.corr", 3, "You need this procedure and your case is severe. Which hospital do the data favour?", ["Hospital B", "Hospital A", "Either; the overall rates decide", "Neither can be compared"], "Compare like with like. For severe cases B's survival is 52.5% against A's 30.0%."],
      ["ba.pitfalls", 3, "An A/B test shows the same pattern: treatment wins overall but loses within mobile and within desktop. What should you check first?", ["Whether the two arms received different device mixes, which indicates broken randomisation", "Whether the test ran long enough", "Whether the metric is a ratio", "Nothing; ship the treatment"], "With proper randomisation the arms have the same mix, and Simpson's paradox cannot arise between them.", ["ds.corr"]],
    ],
  });

  S("ds.dist", "Delivery times", (r) => {
    const mu = r.pick([30, 40, 50]), sd = r.pick([4, 5, 10]), k = r.pick([-1, 1, 1.5, 2]), x = mu + k * sd, n = r.pick([25, 100]), se = sd / Math.sqrt(n), m = mu + r.pick([1, 2]), me = 1.96 * se;
    return { stim: `<p>Delivery times for a courier are approximately normally distributed with mean <b>${mu} minutes</b> and standard deviation <b>${sd} minutes</b>.</p>`,
      parts: [
        ["ds.dist", 1, `What is the z-score of a ${x}-minute delivery?`, N(k, [-k, x / sd, k * 2, (x - mu) / mu], f2), `z = (${x} − ${mu}) / ${sd} = ${f2(k)}.`],
        ["ds.dist", 2, `Roughly what share of deliveries take between ${mu - 2 * sd} and ${mu + 2 * sd} minutes?`, ["95%", "68%", "99.7%", "50%"], "That interval is the mean ± 2 standard deviations, which holds about 95% of a normal distribution."],
        ["ds.dist", 3, `Roughly what share of deliveries take longer than ${mu + sd} minutes?`, ["16%", "32%", "5%", "50%"], "About 68% lie within one standard deviation, leaving 32% outside, split evenly: 16% in the upper tail."],
        ["ds.clt", 2, `What is the standard error of the mean of ${n} randomly chosen deliveries?`, N(se, [sd / n, sd, sd * Math.sqrt(n) / 10, se * 2], (v) => f2(v) + " min"), `SE = σ / √n = ${sd} / ${Math.sqrt(n)} = ${f2(se)}.`],
        ["ds.ci", 3, `A new routing system is tried on ${n} deliveries and the sample mean is ${m} minutes. What is the 95% confidence interval for the mean (using σ = ${sd})?`, [`${f2(m - me)} to ${f2(m + me)}`, `${f2(m - 1.96 * sd)} to ${f2(m + 1.96 * sd)}`, `${f2(m - se)} to ${f2(m + se)}`, `${f2(mu - me)} to ${f2(mu + me)}`], `${m} ± 1.96 × ${f2(se)} = ${m} ± ${f2(me)}.`],
      ] };
  });

  S("ds.timeseries", "Two years of monthly sales", (() => {
    const mo = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"], y = Array.from({ length: 24 }, (_, t) => 100 + 2 * t + (t % 12 === 11 ? 40 : 0));
    return { stim: `<p>Monthly unit sales over two years (January of year 1 to December of year 2). Selected values: Jan Y1 = 100, Dec Y1 = 162, Jan Y2 = 124, Nov Y2 = 144, Dec Y2 = 186.</p>` + V.line({ series: [{ name: "units sold", pts: y }], labels: y.map((_, t) => mo[t % 12] + (t < 12 ? "1" : "2")), ymin: 80, ymax: 200, w: 560, h: 220 }),
      parts: [
        ["ds.timeseries", 1, "Which components are visible in this series?", ["An upward trend and yearly seasonality", "Seasonality only", "Trend only", "Pure noise"], "The baseline rises by about 2 units a month, with a spike every December."],
        ["ds.timeseries", 2, "What is the naive forecast for January of year 3?", ["186", "124", "148", "162"], "The naive forecast repeats the last observed value, December Y2 = 186. It will be far too high, because it ignores seasonality."],
        ["ds.timeseries", 2, "What is the seasonal naive forecast for January of year 3?", ["124", "186", "100", "148"], "It repeats the value from the same month a year earlier: January Y2 = 124."],
        ["ds.timeseries", 3, "The underlying trend is +2 units per month. A forecast that combines last January with one more year of trend gives:", ["148", "124", "126", "186"], "124 + 12 × 2 = 148. Seasonal naive (124) misses a year of growth."],
        ["ds.timeseries", 2, "At which lag would the autocorrelation show a seasonal peak?", ["12", "1", "6", "24 only"], "Values resemble those from 12 months earlier."],
        ["ml.cv", 2, "How should a forecasting model for this series be validated?", ["Train on year 1 and test on year 2 (or roll forward month by month)", "Randomly assign months to train and test", "Train on year 2 and test on year 1", "Use all 24 months for both"], "Validation must mimic forecasting: fit on the past, score on the future.", ["ds.timeseries"]],
      ] };
  })());

  S("ds.bayes", "A spam filter's word counts", (r) => {
    const spam = r.pick([200, 300, 400]), ham = 1000 - spam, ws = Math.round(spam * r.pick([0.5, 0.6, 0.8])), wh = Math.round(ham * r.pick([0.05, 0.1])), post = ws / (ws + wh);
    return { stim: `<p>1,000 labelled emails, counted by whether they contain the word “winner”.</p>` + T(["", "Contains “winner”", "Does not", "Total"], [["Spam", ws, spam - ws, spam], ["Not spam", wh, ham - wh, ham], ["Total", ws + wh, 1000 - ws - wh, 1000]]),
      parts: [
        ["ds.prob", 1, "What is the prior probability that an email is spam?", N(spam / 1000, [ws / 1000, post, ws / spam, ham / 1000], pc), `${spam} of 1,000 emails are spam: ${pc(spam / 1000)}.`],
        ["ds.prob", 2, "What is P(“winner” | spam)?", N(ws / spam, [post, ws / 1000, (ws + wh) / 1000, wh / ham], pc), `Of ${spam} spam emails, ${ws} contain the word: ${pc(ws / spam)}.`],
        ["ds.bayes", 2, "What is P(spam | “winner”)?", N(post, [ws / spam, spam / 1000, ws / 1000, wh / (ws + wh)], pc), `Of the ${ws + wh} emails containing the word, ${ws} are spam: ${pc(post)}. Note this is not the same as P(“winner” | spam).`],
        ["ds.prob", 3, "Are “contains winner” and “is spam” independent?", [`No: P(“winner”) is ${pc((ws + wh) / 1000)} overall but ${pc(ws / spam)} among spam`, "Yes: the table has four cells", "Yes: both are binary", "It cannot be determined from counts"], "Independence would require P(word | spam) = P(word). They differ greatly, which is exactly why the word is useful evidence."],
        ["ds.bayes", 3, "If spam became much rarer in the inbox while the word frequencies stayed the same, P(spam | “winner”) would:", ["Fall, because the prior is lower", "Rise", "Stay the same", "Become 50%"], "The posterior depends on the base rate as well as the likelihoods."],
      ] };
  });

  S("ds.hypo", "Reading a t-test printout", {
    stim: `<p>A team tests whether a new onboarding flow changes the time (in minutes) users take to complete setup. Output of a two-sample t-test:</p>` + C(
`group        n     mean    std
old flow     40    27.5    7.8
new flow     40    24.0    7.1

difference in means (old − new):   3.5
t statistic:                       2.10
p-value (two-sided):               0.039
95% CI for the difference:         [0.18, 6.82]`),
    parts: [
      ["ds.hypo", 1, "At a significance level of 0.05, what is the conclusion?", ["Reject the null hypothesis of no difference", "Fail to reject the null hypothesis", "Accept the null hypothesis", "The test is invalid"], "p = 0.039 is below 0.05."],
      ["ds.hypo", 2, "At a significance level of 0.01, what is the conclusion?", ["Fail to reject the null hypothesis", "Reject the null hypothesis", "The new flow is slower", "The p-value becomes 0.01"], "0.039 is above 0.01. The conclusion depends on the threshold chosen in advance."],
      ["ds.hypo", 2, "Which statement about p = 0.039 is correct?", ["If the flows were truly equal, a difference this large would occur about 3.9% of the time", "There is a 3.9% chance the flows are equal", "There is a 96.1% chance the new flow is better", "The new flow is 3.9% faster"], "A p-value is computed assuming the null hypothesis is true. It is not the probability of a hypothesis."],
      ["ds.ci", 2, "How does the confidence interval agree with the test at the 5% level?", ["It excludes 0, which matches p < 0.05", "It includes 3.5, which proves significance", "It is wider than 1, which matches p < 0.05", "It does not relate to the test"], "A 95% interval for a difference excludes zero exactly when the two-sided test rejects at 5%."],
      ["ds.ci", 3, "What does the interval say about practical importance?", ["The true saving could be anywhere from negligible (0.2 min) to substantial (6.8 min)", "The saving is exactly 3.5 minutes", "The saving is at least 3.5 minutes", "The saving is certainly important"], "Significance says the effect is probably not zero. The interval shows how imprecisely its size is known."],
      ["ds.hypo", 3, "The team ran this same comparison on 20 different metrics and this was the only one below 0.05. How should that change the reading?", ["One in twenty is what chance alone would produce; treat it as a hypothesis to confirm", "It makes the result stronger", "It has no bearing", "It proves the other 19 are equal"], "With 20 tests at 5%, about one false positive is expected even when nothing has changed.", ["ba.pitfalls"]],
    ],
  });

  S("ds.features", "Preparing a feature table", {
    stim: `<p>A dataset for predicting whether a customer will churn. A logistic regression with L2 regularisation will be trained on it.</p>` + T(["customer_id", "plan", "city", "monthly_spend", "tenure_days", "satisfaction", "churned"], [["10482", "basic", "Lyon", "12.50", "40", "low", "1"], ["10483", "pro", "Paris", "89.00", "1,210", "high", "0"], ["10484", "basic", "Nice", "9.99", "365", "medium", "0"], ["10485", "enterprise", "Paris", "2,400.00", "880", "high", "0"], ["…", "…", "… (4,000 distinct cities)", "…", "…", "…", "…"]]),
    parts: [
      ["ds.features", 1, "How should <code>plan</code> (basic / pro / enterprise, no natural numeric meaning assumed) be encoded?", ["One-hot encoding", "As 1, 2, 3 and treated as a quantity", "As the row number", "Dropped, because it is text"], "One-hot avoids imposing a spacing between categories."],
      ["ds.features", 2, "How should <code>satisfaction</code> (low / medium / high) be encoded?", ["As ordered integers, since the levels have a natural order", "One-hot only; order must never be used", "As random integers", "As customer_id"], "Ordinal categories can keep their order as 0, 1, 2. One-hot would also work but discards the ordering."],
      ["ds.features", 3, "What is the problem with one-hot encoding <code>city</code>?", ["4,000 sparse columns, most with very few rows each", "Cities cannot be encoded", "It would leak the target", "It makes the model non-linear"], "High-cardinality categories explode the feature space. Options: group rare cities, target-encode out-of-fold, or hash."],
      ["ds.features", 2, "Why must <code>monthly_spend</code> and <code>tenure_days</code> be scaled for this model?", ["The L2 penalty and the optimiser both depend on feature scale", "Logistic regression rejects values above 1", "To make them categorical", "Scaling is only for trees"], "Without scaling, the penalty treats coefficients of differently scaled features unequally, and gradient descent converges slowly."],
      ["ds.features", 2, "<code>monthly_spend</code> ranges from about 10 to 2,400 and is heavily right-skewed. A useful transform is:", ["Taking the logarithm", "Squaring it", "Rounding to the nearest thousand", "Reversing its sign"], "A log compresses the long right tail so one enterprise customer does not dominate."],
      ["ml.cv", 2, "Should <code>customer_id</code> be used as a feature?", ["No: it is an arbitrary identifier that a model can only memorise", "Yes, as a numeric feature", "Yes, one-hot encoded", "Yes, after scaling"], "Identifiers carry no generalisable signal and invite overfitting or leakage.", ["ds.features"]],
    ],
  });

  /* ================= BUSINESS & DATA ANALYTICS ================= */

  S("ba.joins", "Querying customers and orders", (r) => {
    const names = ["Ana", "Ben", "Cal", "Dee"], cust = [1, 1, r.pick([1, 2]), 2, r.pick([2, 3]), 3].slice(0, r.pick([5, 6])), ord = cust.map((c, i) => ({ id: 101 + i, c, amt: r.int(2, 9) * 10 }));
    const tot = (c) => sum(ord.filter((o) => o.c === c).map((o) => o.amt)), withO = new Set(cust).size, th = r.pick([60, 80, 100]), hav = [1, 2, 3].filter((c) => tot(c) > th).length;
    return { stim: `<div class="sflex">` + T(["id", "name"], names.map((n, i) => [i + 1, n]), "customers") + T(["id", "customer_id", "amount"], ord.map((o) => [o.id, o.c, o.amt]), "orders") + `</div>` + C(
`SELECT c.name, COUNT(o.id) AS n, SUM(o.amount) AS total
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.name;`),
      parts: [
        ["ba.joins", 2, "How many rows does the query return?", N(withO, [4, ord.length, withO + 2, 1].filter((x) => x !== withO)), `The inner join keeps only customers with at least one order (${withO} of them), and GROUP BY returns one row each. Dee has no orders and disappears.`],
        ["ba.sql", 1, "What is <code>total</code> in Ana's row?", N(tot(1), [sum(ord.map((o) => o.amt)), ord.filter((o) => o.c === 1)[0].amt, tot(2), tot(1) + 10].filter((x) => x !== tot(1))), `Ana (id 1) has orders of ${ord.filter((o) => o.c === 1).map((o) => o.amt).join(" + ")} = ${tot(1)}.`],
        ["ba.joins", 3, "If <code>JOIN</code> is changed to <code>LEFT JOIN</code>, what are <code>n</code> and <code>total</code> for Dee?", ["0 and NULL", "1 and 0", "0 and 0", "Dee still does not appear"], "Dee now appears with NULLs in the order columns. COUNT(o.id) ignores NULL, giving 0. SUM over only NULLs is NULL; wrap it in COALESCE for a zero."],
        ["ba.joins", 3, "With the LEFT JOIN, what would <code>COUNT(*)</code> return for Dee instead of <code>COUNT(o.id)</code>?", ["1", "0", "NULL", "4"], "COUNT(*) counts rows, and the left join produced one row for Dee. This is a classic way to report a customer with no orders as having one."],
        ["ba.sql", 2, `Adding <code>HAVING SUM(o.amount) > ${th}</code> to the original query returns how many rows?`, N(hav, [withO, hav + 1, 4, 0].filter((x) => x !== hav)), `Totals: ${[1, 2, 3].filter((c) => tot(c)).map((c) => `${names[c - 1]} ${tot(c)}`).join(", ")}. ${hav} exceed${hav === 1 ? "s" : ""} ${th}.`],
        ["ba.joins", 2, "Which query lists customers who have never ordered?", ["<code>SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL</code>", "<code>SELECT c.name FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL</code>", "<code>SELECT c.name FROM customers c WHERE c.id = NULL</code>", "<code>SELECT name FROM orders WHERE customer_id IS NULL</code>"], "The anti-join: keep all customers, then keep only those with no matching order. An inner join has already discarded them."],
      ] };
  });

  S("ba.window", "Window functions over monthly sales", (r) => {
    const amt = r.shuffle([120, 150, 180, 210, 240, 270, 300, 90]).slice(0, 6), reps = ["Kim", "Lee"], rows = amt.map((a, i) => ({ rep: reps[i < 3 ? 0 : 1], m: (i % 3) + 1, a })), who = r.pick(reps), mine = rows.filter((x) => x.rep === who), top = rows.slice().sort((a, b) => b.a - a.a)[0];
    return { stim: T(["rep", "month", "amount"], rows.map((x) => [x.rep, x.m, x.a]), "sales"),
      parts: [
        ["ba.window", 2, `What does <code>SUM(amount) OVER (PARTITION BY rep ORDER BY month)</code> return on ${who}'s month 3 row?`, N(sum(mine.map((x) => x.a)), [mine[2].a, sum(amt), mine[1].a + mine[2].a, mine[0].a + mine[1].a].filter((x) => x !== sum(mine.map((x) => x.a)))), `A running total within the rep's partition: ${mine.map((x) => x.a).join(" + ")} = ${sum(mine.map((x) => x.a))}.`],
        ["ba.window", 2, `What does <code>amount - LAG(amount) OVER (PARTITION BY rep ORDER BY month)</code> return on ${who}'s month 2 row?`, N(mine[1].a - mine[0].a, [mine[0].a - mine[1].a, mine[2].a - mine[1].a, mine[1].a, mine[1].a + mine[0].a].filter((x) => x !== mine[1].a - mine[0].a)), `LAG fetches the previous month's amount for the same rep: ${mine[1].a} − ${mine[0].a} = ${mine[1].a - mine[0].a}.`],
        ["ba.window", 2, "What does that same LAG expression return on each rep's month 1 row?", ["NULL", "0", "The month 1 amount", "An error"], "There is no previous row in the partition, so LAG returns NULL, and anything minus NULL is NULL."],
        ["ba.window", 2, "Which row gets 1 from <code>RANK() OVER (ORDER BY amount DESC)</code>?", [`${top.rep}, month ${top.m}`, ...rows.filter((x) => x !== top).slice(0, 3).map((x) => `${x.rep}, month ${x.m}`)], `With no PARTITION BY, the whole table is one window. The largest amount is ${top.a}.`],
        ["ba.window", 3, "How do you return only each rep's best month?", ["Compute <code>ROW_NUMBER() OVER (PARTITION BY rep ORDER BY amount DESC)</code> in a CTE, then filter to 1 outside it", "Add <code>WHERE ROW_NUMBER() = 1</code> to the same SELECT", "<code>GROUP BY rep</code> and select month", "<code>ORDER BY amount DESC LIMIT 1</code>"], "Window functions are evaluated after WHERE, so the filter must sit in an outer query. LIMIT 1 would return one row in total, not one per rep."],
      ] };
  });

  S("ba.cohort", "A cohort retention table", (r) => {
    const sz = [r.pick([200, 400, 500]), r.pick([400, 500, 1000]), r.pick([500, 800])], r1 = r.shuffle([0.4, 0.5, 0.6]).slice(0, 2), r2 = r.pick([0.2, 0.25, 0.3]);
    const j1 = Math.round(sz[0] * r1[0]), j2 = Math.round(sz[0] * r2), f1c = Math.round(sz[1] * r1[1]), better = r1[0] > r1[1] ? "January" : "February", act = j2 + f1c + sz[2];
    return { stim: `<p>Users active in each month after sign-up, by sign-up cohort. Month 0 is the sign-up month.</p>` + T(["Cohort", "Month 0", "Month 1", "Month 2"], [["January", sz[0], j1, j2], ["February", sz[1], f1c, "–"], ["March", sz[2], "–", "–"]]),
      parts: [
        ["ba.cohort", 1, "What is the January cohort's month-2 retention?", N(j2 / sz[0], [j2 / j1, j1 / sz[0], 1 - j2 / sz[0], j2 / sz[1]], pc), `${j2} of the original ${sz[0]} are still active: ${pc(j2 / sz[0])}. Retention is measured against the cohort's starting size.`],
        ["ba.cohort", 2, "Which cohort has the better month-1 retention?", [better, better === "January" ? "February" : "January", "They are equal", "March"], `January: ${j1}/${sz[0]} = ${pc(r1[0])}. February: ${f1c}/${sz[1]} = ${pc(r1[1])}. Compare cohorts at the same age, not by raw counts.`],
        ["ba.cohort", 2, "Of the January users who were active in month 1, what share was lost by month 2?", N(1 - j2 / j1, [j2 / j1, 1 - j2 / sz[0], (j1 - j2) / sz[0], r2], pc), `(${j1} − ${j2}) / ${j1} = ${pc(1 - j2 / j1)}.`],
        ["ba.cohort", 2, "How many users from these three cohorts were active in March?", N(act, [sz[0] + sz[1] + sz[2], j2 + f1c, sz[2], j1 + f1c + sz[2]].filter((x) => x !== act)), `March is month 2 for January (${j2}), month 1 for February (${f1c}) and month 0 for March (${sz[2]}): ${act}. Read along the diagonal.`],
        ["ba.cohort", 3, "March's active-user total is the highest yet. Why is that weak evidence that the product is healthy?", ["Most of it is brand-new sign-ups; the cohort rows show how quickly users leave", "Active users cannot be measured", "March is a seasonal month", "The table has too few columns"], "Growth in sign-ups can mask poor retention. The cohort view separates the two."],
      ] };
  });

  S("ba.kpi", "A funnel by acquisition channel", (r) => {
    const v = [r.pick([10000, 20000]), r.pick([40000, 50000])], sr = [r.pick([0.1, 0.2]), r.pick([0.04, 0.05])], pr = [r.pick([0.25, 0.3, 0.4]), r.pick([0.1, 0.2, 0.5])], aov = r.pick([40, 50, 80]);
    const s = v.map((x, i) => Math.round(x * sr[i])), p = s.map((x, i) => Math.round(x * pr[i])), cv = p.map((x, i) => x / v[i]), blended = sum(p) / sum(v), bestP = pr[0] > pr[1] ? "Search" : "Social";
    return { stim: `<p>Last month's funnel for two acquisition channels. Average order value is $${aov}.</p>` + T(["Channel", "Visits", "Sign-ups", "Purchases"], [["Search", v[0].toLocaleString(), s[0].toLocaleString(), p[0].toLocaleString()], ["Social", v[1].toLocaleString(), s[1].toLocaleString(), p[1].toLocaleString()]]),
      parts: [
        ["ba.kpi", 1, "What is the visit → purchase conversion rate for Search?", N(cv[0], [sr[0], pr[0], cv[1], blended], (x) => (x * 100).toFixed(2) + "%"), `${p[0]} / ${v[0].toLocaleString()} = ${(cv[0] * 100).toFixed(2)}%. Equivalently ${sr[0] * 100}% × ${pr[0] * 100}%.`],
        ["ba.kpi", 2, "Which channel converts sign-ups to purchases at the higher rate?", [bestP, bestP === "Search" ? "Social" : "Search", "They are equal", "It cannot be computed"], `Search: ${p[0]}/${s[0]} = ${pc(pr[0])}. Social: ${p[1]}/${s[1]} = ${pc(pr[1])}.`],
        ["ba.kpi", 2, "What is the blended visit → purchase conversion across both channels?", N(blended, [(cv[0] + cv[1]) / 2, cv[0], cv[1], sum(s) / sum(v)], (x) => (x * 100).toFixed(2) + "%"), `Total purchases / total visits = ${sum(p).toLocaleString()} / ${sum(v).toLocaleString()} = ${(blended * 100).toFixed(2)}%. It is not the simple average of the two rates, because the channels differ in volume.`],
        ["ba.unit", 2, "What is revenue per visit for Social?", N(cv[1] * aov, [cv[0] * aov, aov, p[1] * aov / s[1], cv[1] * aov * 10], (x) => "$" + x.toFixed(2)), `${p[1].toLocaleString()} purchases × $${aov} = ${usd(p[1] * aov)}; divided by ${v[1].toLocaleString()} visits = $${(cv[1] * aov).toFixed(2)}.`],
        ["ba.cases", 3, "Next month the blended conversion rate falls, but each channel's own rate is unchanged. What happened?", ["The traffic mix shifted toward the lower-converting channel", "Checkout broke for everyone", "Order value fell", "The data must be wrong"], "A blended ratio moves with composition. Always check segment rates before concluding behaviour changed."],
      ] };
  });

  S("ba.ab", "Reading an experiment dashboard", {
    stim: `<p>A checkout redesign is being A/B tested. The experiment was planned to run 14 days with 25,000 users per arm. The product manager sends this snapshot on <b>day 4</b> and asks to ship.</p>` + T(["Metric", "Control", "Treatment", "p-value"], [["Users", "10,000", "10,000", ""], ["Purchases", "500", "560", ""], ["Conversion rate (primary)", "5.00%", "5.60%", "0.058"], ["Refund rate (guardrail)", "2.0%", "2.9%", "0.001"], ["Avg. page load (guardrail)", "1.21 s", "1.22 s", "0.64"]]),
    parts: [
      ["ba.ab", 1, "What is the relative lift in conversion?", ["12%", "0.6%", "5.6%", "10.7%"], "(5.60 − 5.00) / 5.00 = 12%. The absolute lift is 0.6 percentage points."],
      ["ds.hypo", 2, "Is the conversion difference statistically significant at the 5% level?", ["No: p = 0.058 is above 0.05", "Yes: the lift is 12%", "Yes: p is close enough", "It cannot be determined"], "The pre-set threshold is the threshold. 'Almost significant' is not a category."],
      ["ba.pitfalls", 2, "Why is deciding on day 4 a problem even if p were below 0.05?", ["Stopping early when results look good inflates false positives, and four days do not cover a full week", "Four days is always enough", "The sample is too large", "p-values improve with fewer days"], "Peeking and unrepresentative weekdays both bias the read. The planned sample was 25,000 per arm."],
      ["ba.kpi", 2, "What does the refund-rate row indicate?", ["A significant harm to a guardrail metric that could offset the conversion gain", "Nothing; it is not the primary metric", "A measurement error", "That refunds cause purchases"], "Refunds rose from 2.0% to 2.9% with p = 0.001. Guardrails exist precisely to catch this."],
      ["ba.cases", 3, "Net of refunds, how many kept purchases does each arm have?", ["Control 490, treatment about 544", "Control 500, treatment 560", "Control 490, treatment 560", "Control 480, treatment 531"], "Control: 500 × 0.98 = 490. Treatment: 560 × 0.971 ≈ 544. A gain remains, but smaller, and each refund also carries handling cost."],
      ["ba.ab", 3, "What is the best recommendation?", ["Run to the planned sample, and investigate why refunds rise before any launch", "Ship now; conversion is up", "Stop and discard the redesign", "Restart with a higher significance level"], "The primary result is inconclusive and a guardrail is significantly worse. Finish the test and understand the harm."],
    ],
  });

  S("ba.unit", "Comparing two subscription plans", (r) => {
    const A = { p: r.pick([10, 20]), m: 0.8, c: r.pick([0.05, 0.1]), cac: r.pick([60, 80, 120]) }, B = { p: r.pick([50, 100]), m: 0.8, c: r.pick([0.02, 0.04]), cac: r.pick([400, 600, 800]) };
    const ltv = (x) => (x.p * x.m) / x.c, ra = ltv(A) / A.cac, rb = ltv(B) / B.cac, pay = A.cac / (A.p * A.m), better = ra > rb ? "Basic" : "Pro";
    return { stim: T(["Plan", "Price / month", "Gross margin", "Monthly churn", "CAC"], [["Basic", "$" + A.p, "80%", A.c * 100 + "%", "$" + A.cac], ["Pro", "$" + B.p, "80%", B.c * 100 + "%", "$" + B.cac]]),
      parts: [
        ["ba.unit", 2, "What is the lifetime value of a Basic customer?", N(ltv(A), [A.p / A.c, A.p * A.m * 12, ltv(B), A.p * A.m], usd), `LTV = price × margin ÷ churn = ${A.p} × 0.8 ÷ ${A.c} = ${usd(ltv(A))}.`],
        ["ba.cohort", 1, "What is the expected lifetime of a Pro customer?", N(1 / B.c, [1 / A.c, B.c * 100, 12, 1 / B.c / 2].filter((x) => x !== 1 / B.c), (x) => +x.toFixed(1) + " months"), `Lifetime ≈ 1 / churn = 1 / ${B.c} = ${1 / B.c} months.`],
        ["ba.unit", 2, "What is the LTV:CAC ratio for Pro?", N(rb, [ra, B.cac / ltv(B), B.p / B.c / B.cac, rb / 2].filter((x) => Math.abs(x - rb) > 0.01), (x) => x.toFixed(1) + " : 1"), `LTV = ${B.p} × 0.8 ÷ ${B.c} = ${usd(ltv(B))}. Divided by CAC $${B.cac} = ${rb.toFixed(1)}.`],
        ["ba.unit", 2, "How many months does Basic take to pay back its CAC?", N(pay, [A.cac / A.p, pay * 2, 1 / A.c, pay / 2].filter((x) => Math.abs(x - pay) > 0.01), (x) => x.toFixed(1) + " months"), `Monthly gross profit = ${A.p} × 0.8 = $${A.p * 0.8}. Payback = ${A.cac} ÷ ${A.p * 0.8} = ${pay.toFixed(1)} months.`],
        ["ba.unit", 3, "On LTV:CAC alone, which plan has the healthier unit economics?", [better, better === "Basic" ? "Pro" : "Basic", "They are identical", "Neither can be assessed"], `Basic ${ra.toFixed(1)} : 1 against Pro ${rb.toFixed(1)} : 1. Price alone does not decide it; churn and acquisition cost matter as much.`],
      ] };
  });

  S("ba.viz", "A misleading chart", {
    stim: `<p>A slide shown at a quarterly review, titled “Customer satisfaction soars after redesign”. Satisfaction is a 0–100 score.</p>` + V.bars({ labels: ["Q1", "Q2", "Q3 (redesign)", "Q4"], vals: [78, 78.4, 79.6, 80.2], ymin: 77.5, ymax: 80.5, w: 440, h: 220, color: ["var(--mute)", "var(--mute)", "var(--or)", "var(--or)"], title: "Customer satisfaction score" }),
    parts: [
      ["ba.viz", 1, "What makes this chart misleading?", ["The value axis starts at 77.5, so small differences look enormous", "It uses bars", "It has four categories", "It has a title"], "Bar length is read as magnitude. Truncating the axis makes Q4's bar look many times taller than Q1's."],
      ["ba.viz", 2, "By how much did the score actually rise from Q1 to Q4?", ["About 2.8%", "About 28%", "About 80%", "It more than tripled"], "(80.2 − 78) / 78 = 2.8%. The bars suggest a multiple, not a few percent."],
      ["ba.viz", 2, "What is the simplest honest fix?", ["Start the axis at zero, or use a line/dot chart with the scale clearly labelled", "Use a 3-D bar chart", "Remove the axis labels", "Switch to a pie chart"], "Bars must start at zero. If small changes matter, a line or dot plot can use a narrower range without implying magnitude through length."],
      ["ds.corr", 3, "Even drawn honestly, does the chart show that the redesign caused the increase?", ["No: the score was already rising, and there is no control group", "Yes: the rise follows the redesign", "Yes: the colours prove it", "Yes: four quarters are enough"], "A before/after comparison cannot separate the redesign from the existing trend, seasonality or other changes.", ["ba.viz"]],
      ["ba.viz", 2, "Which title would be more accurate?", ["“Satisfaction up 2 points over the year (78 → 80)”", "“Satisfaction soars”", "“Redesign triples satisfaction”", "“Chart 4”"], "State the finding with its real size. Let the reader judge whether it is impressive."],
    ],
  });

  S("ba.cases", "Investigating a drop in daily active users", {
    stim: `<p>Daily active users (DAU) fell this week. Two breakdowns:</p><div class="sflex">` + T(["Platform", "Last week", "This week"], [["iOS", "50,000", "50,500"], ["Android", "40,000", "31,000"], ["Web", "10,000", "10,100"], ["<b>Total</b>", "<b>100,000</b>", "<b>91,600</b>"]], "DAU by platform") + T(["Android app version", "Last week", "This week"], [["8.1", "30,000", "29,800"], ["8.2 (released Monday)", "10,000", "1,200"]], "Android DAU by version") + `</div>`,
    parts: [
      ["ba.cases", 1, "By what percentage did total DAU change?", ["−8.4%", "−22.5%", "−9.2%", "−0.84%"], "(91,600 − 100,000) / 100,000 = −8.4%."],
      ["ba.cases", 2, "Where is the drop concentrated?", ["Android, which lost 9,000 users while iOS and Web grew slightly", "All platforms equally", "Web", "iOS"], "Android fell 22.5%. The other platforms are up about 1%."],
      ["ba.cases", 2, "Within Android, what does the version breakdown show?", ["Version 8.2 collapsed by 88% while 8.1 is flat", "Both versions fell equally", "8.1 caused the drop", "Nothing conclusive"], "8.2 went from 10,000 to 1,200. 8.1 lost only 200."],
      ["ba.cases", 2, "What is the most likely cause?", ["A defect in the 8.2 release, such as a crash on launch or broken login", "A competitor's launch", "Seasonality", "A marketing budget cut"], "An external cause would not be confined to one version of one platform, and would not coincide with Monday's release."],
      ["ba.cases", 3, "Before concluding that users are affected, what alternative must be ruled out?", ["That 8.2 broke event logging, so users are active but not counted", "That iOS users switched to Android", "That the week had fewer days", "That DAU is a vanity metric"], "First ask whether the data is real. Check crash reports, server-side sessions and revenue for the same users."],
      ["ba.cases", 2, "What is the right immediate action?", ["Check crash and error rates for 8.2 and, if confirmed, halt the rollout or ship a fix", "Wait another week for more data", "Increase Android ad spend", "Change the DAU definition"], "The evidence points at a specific release. Verify quickly and stop the damage."],
    ],
  });

  S("ba.modeling", "A retail star schema", {
    stim: `<p>A retailer's warehouse model:</p>` + C(
`fact_sales          (one row per product per order)
  order_id, date_key, product_key, customer_key, store_key,
  quantity, unit_price, discount_amount

dim_date            date_key, date, weekday, month, quarter, year
dim_product         product_key, name, category, brand
dim_customer        customer_key, name, city, segment,
                    valid_from, valid_to, is_current
dim_store           store_key, name, region`),
    parts: [
      ["ba.modeling", 1, "What is the grain of <code>fact_sales</code>?", ["One row per product per order (an order line)", "One row per order", "One row per customer", "One row per day"], "The grain is stated beside the table. An order with three products has three rows."],
      ["ba.modeling", 2, "What would <code>COUNT(*)</code> on fact_sales return?", ["The number of order lines, not the number of orders", "The number of orders", "The number of customers", "Total revenue"], "To count orders at this grain you need COUNT(DISTINCT order_id)."],
      ["ba.joins", 2, "Which join is needed to report revenue by product category?", ["fact_sales to dim_product on product_key", "fact_sales to dim_date on date_key", "dim_product to dim_customer", "No join; category is in the fact table"], "Category is a descriptive attribute stored in the product dimension.", ["ba.modeling"]],
      ["ba.modeling", 2, "Which columns are measures rather than keys or attributes?", ["quantity, unit_price, discount_amount", "order_id, date_key", "category, brand", "valid_from, valid_to"], "Measures are the numeric facts you aggregate. Keys link to dimensions; attributes describe."],
      ["ba.modeling", 3, "What do <code>valid_from</code>, <code>valid_to</code> and <code>is_current</code> on dim_customer tell you?", ["It is a type 2 slowly changing dimension that keeps history of attribute changes", "Customers expire after a fixed period", "It is a fact table", "The table is partitioned by date"], "When a customer moves city, a new row is added with new validity dates, so old sales still report under the old city."],
      ["ba.modeling", 3, "Why is a pre-joined, denormalised version of this model common in warehouses?", ["Analytical queries scan and aggregate; fewer joins and columnar storage make that fast", "It reduces storage", "It guarantees data integrity", "Warehouses cannot perform joins"], "Read speed is the priority in OLAP. Redundancy is cheap and updates are rare."],
    ],
  });

  S("ba.sql", "Tracing a query step by step", {
    stim: T(["id", "dept", "salary", "bonus"], [[1, "Eng", 120, 10], [2, "Eng", 100, "NULL"], [3, "Ops", 70, 5], [4, "Ops", 90, "NULL"], [5, "Ops", 80, 15], [6, "Sales", 60, "NULL"]], "employees (salary and bonus in $k)") + C(
`SELECT dept, COUNT(*) AS n, AVG(salary) AS avg_sal, AVG(bonus) AS avg_bonus
FROM employees
WHERE salary >= 70
GROUP BY dept
HAVING COUNT(*) >= 2
ORDER BY avg_sal DESC;`),
    parts: [
      ["ba.sql", 1, "How many rows remain after the WHERE clause?", ["5", "6", "4", "3"], "Only employee 6 (salary 60) is removed."],
      ["ba.sql", 2, "How many rows does the full query return?", ["2", "3", "1", "5"], "After WHERE the groups are Eng (2 rows) and Ops (3 rows). Sales has no rows left, so it forms no group. Both remaining groups pass HAVING."],
      ["ba.sql", 2, "What is <code>avg_sal</code> for Ops?", ["80", "75", "240", "70"], "(70 + 90 + 80) / 3 = 80."],
      ["ba.sql", 3, "What is <code>avg_bonus</code> for Ops?", ["10", "6.67", "20", "NULL"], "AVG ignores NULL: (5 + 15) / 2 = 10. It does not divide by 3."],
      ["ba.sql", 3, "What is <code>avg_bonus</code> for Eng if you wanted missing bonuses counted as zero, and how?", ["5, using AVG(COALESCE(bonus, 0))", "10, using AVG(bonus)", "5, using AVG(bonus)", "0, using SUM(bonus)"], "AVG(bonus) gives 10 (one non-null value). COALESCE replaces NULL with 0 first: (10 + 0) / 2 = 5."],
      ["ba.sql", 2, "Which department is listed first?", ["Eng", "Ops", "Sales", "The order is undefined"], "Eng's average salary is 110, Ops's is 80, and the sort is descending."],
    ],
  });
})();
