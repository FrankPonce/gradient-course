/* Gradient — interactive motion diagrams, part B: statistics, analytics and algorithms. */
(function () {
  const { S, T, K, frame, slider, button, select, chips, pt, sc, line, clamp, runner, axis, Phi, npdf } = GR.dg, D = GR.diagrams;

  /* ============ central limit theorem ============ */
  D.clt = { title: "Central limit theorem", blurb: "Draw samples from a population of any shape and build the distribution of their means. It turns into a bell curve whose width is σ/√n.", skills: ["ds.clt", "ds.ci"],
    tasks: ["Choose the skewed population with n = 2 and run. Is the histogram of means still skewed? Now try n = 30.", "Compare the observed SD of the means with σ/√n at n = 4, 16 and 64. What does quadrupling n do?", "With n = 1, what does the histogram of means look like, and why?"],
    mount(host) {
      const { ctl, svg, read } = frame(host, 720, 360); let pop = "skew", n = 10, means = [], lastS = [], mu, sg;
      const R = { uniform: () => Math.random(), skew: () => Math.min(1, -Math.log(1 - Math.random()) * 0.18), bimodal: () => clamp((Math.random() < 0.5 ? 0.25 : 0.75) + GR.rng((Math.random() * 1e9) | 0).gauss() * 0.07, 0, 1) };
      const x = sc(0, 1, 40, 690), B = 60; let popH;
      const setPop = () => { const d = Array.from({ length: 30000 }, R[pop]); mu = d.reduce((a, b) => a + b) / d.length; sg = Math.sqrt(d.reduce((a, b) => a + (b - mu) ** 2, 0) / d.length); popH = Array(B).fill(0); d.forEach((v) => popH[Math.min(B - 1, (v * B) | 0)]++); means = []; lastS = []; draw(); };
      const draw = () => {
        svg.innerHTML = ""; const pm = Math.max(...popH), py = sc(0, pm, 110, 30);
        T(svg, 40, 18, "POPULATION", { "font-weight": 700, fill: K.mute, "font-size": 11 }); T(svg, 40, 148, `DISTRIBUTION OF SAMPLE MEANS (n = ${n})`, { "font-weight": 700, fill: K.mute, "font-size": 11 });
        popH.forEach((c, i) => S("rect", { x: x(i / B), y: py(c), width: 650 / B - 1, height: 110 - py(c), fill: K.navy, opacity: 0.35 }, svg));
        lastS.forEach((v) => S("line", { x1: x(v), x2: x(v), y1: 112, y2: 124, stroke: K.or, "stroke-width": 2 }, svg));
        if (lastS.length) { const m = lastS.reduce((a, b) => a + b) / lastS.length; S("path", { d: `M${x(m)},126 l-6,10 h12 Z`, fill: K.pink }, svg); T(svg, x(m), 148, "sample mean", { "text-anchor": "middle", "font-size": 10, fill: K.pink, "font-weight": 700 }); }
        const h = Array(B).fill(0); means.forEach((v) => h[Math.min(B - 1, (v * B) | 0)]++); const se = sg / Math.sqrt(n), peak = means.length * (1 / B) * npdf(mu, mu, se), hm = Math.max(4, ...h, peak), hy = sc(0, hm, 320, 165);
        axis(svg, x, hy, [0, 0.25, 0.5, 0.75, 1], [], "value", "");
        h.forEach((c, i) => c && S("rect", { x: x(i / B), y: hy(c), width: 650 / B - 1, height: 320 - hy(c), fill: K.pink, opacity: 0.8 }, svg));
        if (means.length > 20) { const p = []; for (let i = 0; i <= 200; i++) { const v = i / 200; p.push([x(v), hy(Math.min(hm, means.length * (1 / B) * npdf(v, mu, se)))]); } S("path", { d: line(p), fill: "none", stroke: K.ink, "stroke-width": 2, "stroke-dasharray": "5 4" }, svg); }
        const mm = means.length ? means.reduce((a, b) => a + b) / means.length : 0, sm = means.length > 1 ? Math.sqrt(means.reduce((a, b) => a + (b - mm) ** 2, 0) / means.length) : 0;
        chips(read, [["samples drawn", means.length.toLocaleString()], ["population mean μ", mu.toFixed(3), K.navy], ["mean of sample means", means.length ? mm.toFixed(3) : "–", K.pink], ["population SD σ", sg.toFixed(3), K.navy], ["SD of sample means", means.length > 1 ? sm.toFixed(4) : "–", K.pink], ["theory σ/√n", se.toFixed(4)]], "Orange ticks are the latest sample; the pink triangle is its mean. The dashed curve is the normal distribution the theorem predicts.");
      };
      const take = (k) => { for (let s = 0; s < k; s++) { lastS = Array.from({ length: n }, R[pop]); means.push(lastS.reduce((a, b) => a + b) / n); } draw(); return means.length < 5000; };
      select(ctl, "Population", [["skew", "Skewed (exponential)"], ["uniform", "Uniform"], ["bimodal", "Bimodal"]], (v) => { pop = v; setPop(); });
      slider(ctl, "Sample size n", 1, 64, 1, n, (v) => { n = v; means = []; lastS = []; draw(); });
      button(ctl, "Draw 1 sample", () => take(1), true); button(ctl, "Draw 100", () => take(100)); const rb = button(ctl, "Run", () => {}); const run = runner(host, rb, () => take(8), () => 60);
      button(ctl, "Reset", () => { run.stop(); means = []; lastS = []; draw(); });
      setPop();
    } };

  /* ============ Bayes / base rates ============ */
  D.bayes = { title: "Bayes' theorem and base rates", blurb: "1,000 people take a diagnostic test. Change how common the condition is and how good the test is, and see who the positive results really are.", skills: ["ds.bayes", "ml.metrics"],
    tasks: ["Set prevalence 1%, sensitivity 95%, specificity 95%. What share of positives are actually sick?", "Keep the test fixed and raise prevalence to 30%. Why does the same test now look far more trustworthy?", "Which matters more for PPV at low prevalence: improving sensitivity or improving specificity?"],
    mount(host) {
      const { ctl, svg, read } = frame(host, 720, 330); let prev = 0.02, sens = 0.95, spec = 0.9;
      const dots = []; for (let i = 0; i < 1000; i++) dots.push(S("circle", { cx: 14 + (i % 50) * 14, cy: 14 + Math.floor(i / 50) * 15.5, r: 5.2, fill: K.rule, style: "transition:fill .35s" }, svg));
      const draw = () => { const sick = Math.round(1000 * prev), tp = Math.round(sick * sens), fp = Math.round((1000 - sick) * (1 - spec)), fn = sick - tp, tn = 1000 - sick - fp;
        dots.forEach((d, i) => d.setAttribute("fill", i < tp ? K.green : i < sick ? K.navy : i < sick + fp ? K.pink : K.rule));
        const ppv = tp + fp ? tp / (tp + fp) : 0, npv = tn + fn ? tn / (tn + fn) : 0;
        chips(read, [["sick, test + (TP)", tp, K.green], ["sick, test − (FN)", fn, K.navy], ["healthy, test + (FP)", fp, K.pink], ["healthy, test − (TN)", tn], ["P(sick | positive)", (ppv * 100).toFixed(1) + "%", K.or], ["P(healthy | negative)", (npv * 100).toFixed(1) + "%"]], `Of the ${tp + fp} people who test positive, ${tp} are sick and ${fp} are healthy. Posterior = TP ÷ (TP + FP) = ${tp} ÷ ${tp + fp}.`);
      };
      slider(ctl, "Prevalence (prior)", 0.005, 0.5, 0.005, prev, (v) => { prev = v; draw(); }, (v) => (v * 100).toFixed(1) + "%");
      slider(ctl, "Sensitivity", 0.5, 1, 0.01, sens, (v) => { sens = v; draw(); }, (v) => Math.round(v * 100) + "%");
      slider(ctl, "Specificity", 0.5, 1, 0.01, spec, (v) => { spec = v; draw(); }, (v) => Math.round(v * 100) + "%");
      draw();
    } };

  /* ============ A/B test power ============ */
  D.abtest = { title: "A/B test: significance and power", blurb: "Two sampling distributions, control and treatment. Their overlap is why experiments miss real effects and sometimes find fake ones.", skills: ["ba.ab", "ds.hypo", "ba.pitfalls"],
    tasks: ["Set lift to 0% and run 200 experiments. What fraction comes out ‘significant’? What should it be?", "Baseline 5%, lift 5%. How many users per arm do you need for 80% power?", "Halve the lift and find the sample size that restores the same power. How many times larger is it?"],
    mount(host) {
      const { ctl, svg, read } = frame(host, 720, 330); let p = 0.1, lift = 0.1, n = 5000, sims = [0, 0], lastObs = null;
      const draw = () => {
        svg.innerHTML = ""; const p2 = p * (1 + lift), s1 = Math.sqrt((p * (1 - p)) / n), s2 = Math.sqrt((p2 * (1 - p2)) / n), se = Math.sqrt(s1 * s1 + s2 * s2), d = p2 - p;
        const lo = Math.min(p - 4 * s1, p2 - 4 * s2), hi = Math.max(p + 4 * s1, p2 + 4 * s2), x = sc(lo, hi, 40, 690), top = Math.max(npdf(p, p, s1), npdf(p2, p2, s2)), y = sc(0, top * 1.1, 280, 30);
        const ticks = [0, 1, 2, 3, 4].map((i) => lo + ((hi - lo) * i) / 4); axis(svg, x, y, [], [], "observed conversion rate", "");
        ticks.forEach((v) => T(svg, x(v), 296, (v * 100).toFixed(2) + "%", { "text-anchor": "middle", "font-size": 11, fill: K.mute }));
        [[p, s1, K.navy, "control"], [p2, s2, K.or, "treatment"]].forEach(([m, s, c, l], k) => { const pts = []; for (let i = 0; i <= 160; i++) { const v = lo + ((hi - lo) * i) / 160; pts.push([x(v), y(npdf(v, m, s))]); } S("path", { d: line(pts) + `L${x(hi)},280 L${x(lo)},280 Z`, fill: c, opacity: 0.18 }, svg); S("path", { d: line(pts), fill: "none", stroke: c, "stroke-width": 2.5 }, svg); T(svg, x(m), y(npdf(m, m, s)) - 8 - (lift < 0.02 ? k * 14 : 0), l, { "text-anchor": "middle", fill: c, "font-weight": 700 }); });
        if (lastObs) lastObs.forEach((v, k) => { S("line", { x1: x(v), x2: x(v), y1: 250, y2: 280, stroke: k ? K.or : K.navy, "stroke-width": 4 }, svg); });
        const power = 1 - Phi(1.96 - d / se) + Phi(-1.96 - d / se), need = d > 0 ? Math.ceil((2.8 ** 2 * (p * (1 - p) + p2 * (1 - p2))) / (d * d)) : null;
        chips(read, [["absolute lift", (d * 100).toFixed(2) + " pts"], ["SE of difference", (se * 100).toFixed(3) + " pts"], ["expected z", (d / se).toFixed(2)], [lift ? "power" : "false-positive rate", (power * 100).toFixed(1) + "%", K.or], ["n per arm for 80% power", need ? need.toLocaleString() : "–"], ["simulated: significant", sims[1] ? `${sims[0]} of ${sims[1]} (${((sims[0] / sims[1]) * 100).toFixed(1)}%)` : "–", K.pink]], lastObs ? `Last experiment observed ${(lastObs[0] * 100).toFixed(2)}% vs ${(lastObs[1] * 100).toFixed(2)}%: z = ${lastObs[2].toFixed(2)}, ${Math.abs(lastObs[2]) > 1.96 ? "significant at 5%" : "not significant"}.` : "Each curve shows where an arm's measured rate would land if you repeated the experiment. Press “Run experiment”.");
      };
      const sim = (k) => { const r = GR.rng((Math.random() * 1e9) | 0), p2 = p * (1 + lift); for (let i = 0; i < k; i++) { const a = p + r.gauss() * Math.sqrt((p * (1 - p)) / n), b = p2 + r.gauss() * Math.sqrt((p2 * (1 - p2)) / n), pp = (a + b) / 2, z = (b - a) / Math.sqrt((2 * pp * (1 - pp)) / n); sims[1]++; if (Math.abs(z) > 1.96) sims[0]++; lastObs = [a, b, z]; } draw(); };
      const ch = () => { sims = [0, 0]; lastObs = null; draw(); };
      slider(ctl, "Baseline rate", 0.01, 0.3, 0.01, p, (v) => { p = v; ch(); }, (v) => Math.round(v * 100) + "%");
      slider(ctl, "True relative lift", 0, 0.3, 0.01, lift, (v) => { lift = v; ch(); }, (v) => Math.round(v * 100) + "%");
      slider(ctl, "Users per arm", 2.3, 5.3, 0.05, Math.log10(n), (v) => { n = Math.round(10 ** v / 10) * 10; ch(); }, (v) => (Math.round(10 ** v / 10) * 10).toLocaleString());
      button(ctl, "Run experiment", () => sim(1), true); button(ctl, "Run 200", () => sim(200));
      draw();
    } };

  /* ============ SQL joins ============ */
  D.joins = { title: "SQL joins", blurb: "Pick a join type and see which rows match, which survive with NULLs and which are dropped.", skills: ["ba.joins", "ds.wrangling"],
    tasks: ["Why does Ada appear twice in the INNER JOIN result? What would SUM(users.credit) do?", "Which join type reveals users who have never ordered? Which reveals orders with no known user?", "Predict the CROSS JOIN row count before selecting it."],
    mount(host) {
      const { ctl, svg, read } = frame(host, 720, 250); let type = "INNER";
      const U = [[1, "Ada"], [2, "Bo"], [3, "Cy"], [4, "Di"]], O = [[101, 1, 20], [102, 1, 35], [103, 3, 15], [104, 5, 50]];
      const uy = (i) => 62 + i * 42, lx = 40, rx = 470, w = 210;
      const draw = () => {
        svg.innerHTML = ""; const uM = U.map((u) => O.some((o) => o[1] === u[0])), oM = O.map((o) => U.some((u) => u[0] === o[1]));
        const keepU = (i) => type === "CROSS" || uM[i] || type === "LEFT" || type === "FULL", keepO = (i) => type === "CROSS" || oM[i] || type === "RIGHT" || type === "FULL";
        T(svg, lx, 22, "users", { "font-weight": 800, "font-size": 14, fill: K.navy }); T(svg, rx, 22, "orders", { "font-weight": 800, "font-size": 14, fill: K.or });
        T(svg, lx + 12, 44, "id      name", { fill: K.mute, "font-size": 11, style: "white-space:pre" }); T(svg, rx + 12, 44, "id        user_id      amount", { fill: K.mute, "font-size": 11, style: "white-space:pre" });
        U.forEach((u, i) => O.forEach((o, j) => { if (type === "CROSS" || o[1] === u[0]) S("path", { d: `M${lx + w},${uy(i)} C${lx + w + 100},${uy(i)} ${rx - 100},${uy(j)} ${rx},${uy(j)}`, fill: "none", stroke: type === "CROSS" ? K.mute : K.green, "stroke-width": type === "CROSS" ? 1 : 2.5, opacity: type === "CROSS" ? 0.5 : 0.9 }, svg); }));
        const row = (x, y, cells, keep, match, c) => { S("rect", { x, y: y - 16, width: w, height: 32, rx: 8, fill: keep ? "#fff" : K.card, stroke: keep ? (match ? K.green : c) : K.rule, "stroke-width": keep ? 2 : 1, opacity: keep ? 1 : 0.5 }, svg); cells.forEach(([t, dx]) => T(svg, x + dx, y + 5, t, { "font-size": 13, "font-weight": 600, fill: keep ? K.ink : K.mute })); if (!keep) S("line", { x1: x + 8, x2: x + w - 8, y1: y, y2: y, stroke: K.pink, "stroke-width": 1.5 }, svg); };
        U.forEach((u, i) => row(lx, uy(i), [[u[0], 14], [u[1], 60]], keepU(i), uM[i] && type !== "CROSS", K.navy)); O.forEach((o, i) => row(rx, uy(i), [[o[0], 14], [o[1], 78], ["$" + o[2], 150]], keepO(i), oM[i] && type !== "CROSS", K.or));
        const res = []; if (type === "CROSS") U.forEach((u) => O.forEach((o) => res.push([u, o]))); else { U.forEach((u, i) => { const m = O.filter((o) => o[1] === u[0]); if (m.length) m.forEach((o) => res.push([u, o])); else if (type === "LEFT" || type === "FULL") res.push([u, null]); }); if (type === "RIGHT" || type === "FULL") O.forEach((o, j) => { if (!oM[j]) res.push([null, o]); }); }
        const nul = '<td class="nul">NULL</td>'; const sql = type === "CROSS" ? "SELECT * FROM users u CROSS JOIN orders o" : `SELECT * FROM users u ${type === "FULL" ? "FULL OUTER" : type} JOIN orders o ON o.user_id = u.id`;
        read.innerHTML = `<pre class="dg-sql">${sql}</pre><div class="dg-tblwrap"><table class="dg-tbl"><tr><th>u.id</th><th>u.name</th><th>o.id</th><th>o.user_id</th><th>o.amount</th></tr>${res.slice(0, 8).map(([u, o]) => `<tr>${u ? `<td>${u[0]}</td><td>${u[1]}</td>` : nul + nul}${o ? `<td>${o[0]}</td><td>${o[1]}</td><td>$${o[2]}</td>` : nul + nul + nul}</tr>`).join("")}</table></div><div class="dg-note"><b>${res.length} rows returned.</b> ${res.length > 8 ? "First 8 shown. " : ""}${{ INNER: "Only matched pairs survive. Bo, Di and order 104 are dropped; Ada appears twice because she has two orders (fan-out).", LEFT: "Every user is kept. Bo and Di have no orders, so their order columns are NULL.", RIGHT: "Every order is kept. Order 104 points at user 5, who does not exist, so its user columns are NULL.", FULL: "Everything from both sides is kept, with NULLs wherever there is no partner.", CROSS: "No join condition: every user is paired with every order, 4 × 4 = 16 rows." }[type]}</div>`;
      };
      select(ctl, "Join type", [["INNER", "INNER JOIN"], ["LEFT", "LEFT JOIN"], ["RIGHT", "RIGHT JOIN"], ["FULL", "FULL OUTER JOIN"], ["CROSS", "CROSS JOIN"]], (v) => { type = v; draw(); });
      draw();
    } };

  /* ============ funnel ============ */
  D.funnel = { title: "Conversion funnel", blurb: "Overall conversion is the product of every step. Move the step rates to find where an improvement is worth most.", skills: ["ba.kpi", "ba.cases"],
    tasks: ["Which single step, improved by 5 percentage points, adds the most paying customers? Check your answer against the readout.", "Double the weakest step's rate. By what factor do paying customers change?", "Make two different funnels with the same overall conversion. Which would you rather own, and why?"],
    mount(host) {
      const { ctl, svg, read } = frame(host, 720, 300); const names = ["Visit", "Sign up", "Activate", "Subscribe", "Retained at month 2"], cols = [K.navy, K.blue, K.green, K.or, K.pink]; let rate = [0.3, 0.6, 0.2, 0.7]; const N = 10000;
      const rows = names.map((nm, i) => { const y = 14 + i * 56; return { bar: S("rect", { x: 360, y, width: 0, height: 40, rx: 8, fill: cols[i], style: "transition:all .5s cubic-bezier(.22,.9,.24,1)" }, svg), l: T(svg, 360, y + 25, "", { "text-anchor": "middle", "font-size": 13, "font-weight": 700, fill: "#fff", style: "transition:all .5s" }), s: T(svg, 706, y + 25, "", { "text-anchor": "end", "font-size": 12, "font-weight": 700, fill: K.ink2 }), n: T(svg, 14, y + 25, nm, { "font-size": 13, "font-weight": 700, fill: K.ink }) }; });
      const counts = (rt) => rt.reduce((a, r) => a.concat(a[a.length - 1] * r), [N]);
      const draw = () => { const c = counts(rate);
        rows.forEach((r, i) => { const w = Math.max(6, (c[i] / N) * 420); r.bar.setAttribute("x", 380 - w / 2); r.bar.setAttribute("width", w); r.l.textContent = w > 70 ? Math.round(c[i]).toLocaleString() : ""; r.l.setAttribute("x", 380); r.s.textContent = (w > 70 ? "" : Math.round(c[i]).toLocaleString() + " · ") + (i ? `${Math.round(rate[i - 1] * 100)}% of previous` : "100%"); });
        const gains = rate.map((_, i) => { const r2 = rate.slice(); r2[i] = Math.min(1, r2[i] + 0.05); return counts(r2)[4] - c[4]; }), b = gains.indexOf(Math.max(...gains));
        chips(read, [["visitors", N.toLocaleString()], ["overall conversion", ((c[4] / N) * 100).toFixed(2) + "%", K.or], ["retained customers", Math.round(c[4]).toLocaleString(), K.pink], ["biggest lever (+5 pts)", `${names[b]} → ${names[b + 1]}: +${Math.round(gains[b])}`, K.green]], `Overall = ${rate.map((r) => Math.round(r * 100) + "%").join(" × ")}. A fixed absolute gain is worth most at the step with the lowest rate, because it is the largest relative improvement.`);
      };
      rate.forEach((r, i) => slider(ctl, `${names[i]} → ${names[i + 1].split(" ")[0]}`, 0.05, 1, 0.01, r, (v) => { rate[i] = v; draw(); }, (v) => Math.round(v * 100) + "%"));
      draw();
    } };

  /* ============ sorting ============ */
  D.sorting = { title: "Sorting algorithms", blurb: "Watch five algorithms sort the same array and compare how many comparisons and writes each needs as the array grows.", skills: ["swe.sorting", "swe.bigo"],
    tasks: ["Sort 40 elements with bubble sort and with merge sort. Compare the comparison counts with n² and n·log₂n.", "Press “Nearly sorted”, then run insertion sort and selection sort. Which one benefits?", "Press “Reversed” and run quicksort (last-element pivot). Why does it degrade?"],
    mount(host) {
      const { ctl, svg, read } = frame(host, 720, 300); let n = 24, a = [], alg = "bubble", it = null, st, speed = 60;
      const A = {
        *bubble() { for (let i = 0; i < n; i++) { let sw = false; for (let j = 0; j < n - 1 - i; j++) { st.cmp++; yield [j, j + 1]; if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; st.wr += 2; sw = true; yield [j, j + 1]; } } st.done = n - 1 - i; if (!sw) break; } },
        *insertion() { for (let i = 1; i < n; i++) { let j = i; while (j > 0) { st.cmp++; yield [j - 1, j]; if (a[j - 1] <= a[j]) break; [a[j], a[j - 1]] = [a[j - 1], a[j]]; st.wr += 2; j--; } } },
        *selection() { for (let i = 0; i < n - 1; i++) { let m = i; for (let j = i + 1; j < n; j++) { st.cmp++; yield [m, j]; if (a[j] < a[m]) m = j; } if (m !== i) { [a[i], a[m]] = [a[m], a[i]]; st.wr += 2; yield [i, m]; } } },
        *quick(lo = 0, hi = n - 1) { if (lo >= hi) return; const p = a[hi]; let i = lo; for (let j = lo; j < hi; j++) { st.cmp++; yield [j, hi]; if (a[j] < p) { if (i !== j) { [a[i], a[j]] = [a[j], a[i]]; st.wr += 2; } i++; } } [a[i], a[hi]] = [a[hi], a[i]]; st.wr += 2; yield [i, hi]; yield* A.quick(lo, i - 1); yield* A.quick(i + 1, hi); },
        *merge(lo = 0, hi = n - 1) { if (lo >= hi) return; const mid = (lo + hi) >> 1; yield* A.merge(lo, mid); yield* A.merge(mid + 1, hi); const L = a.slice(lo, mid + 1), R = a.slice(mid + 1, hi + 1); let i = 0, j = 0, k = lo; while (i < L.length && j < R.length) { st.cmp++; a[k] = L[i] <= R[j] ? L[i++] : R[j++]; st.wr++; yield [k, k]; k++; } while (i < L.length) { a[k] = L[i++]; st.wr++; yield [k, k]; k++; } while (j < R.length) { a[k] = R[j++]; st.wr++; yield [k, k]; k++; } },
      };
      let bars = [];
      const build = (kind = "random") => { a = Array.from({ length: n }, (_, i) => i + 1); if (kind === "random") a = GR.rng((Math.random() * 1e9) | 0).shuffle(a); if (kind === "rev") a.reverse(); if (kind === "near") for (let k = 0; k < Math.max(1, n / 10); k++) { const i = (Math.random() * (n - 1)) | 0; [a[i], a[i + 1]] = [a[i + 1], a[i]]; } svg.innerHTML = ""; const bw = 700 / n; bars = a.map((_, i) => S("rect", { x: 10 + i * bw, width: Math.max(2, bw - 2), rx: Math.min(4, bw / 4), style: "transition:height .12s,y .12s,fill .12s" }, svg)); restart(); };
      const restart = () => { st = { cmp: 0, wr: 0, fin: false }; it = A[alg](); draw([]); };
      const draw = (hi) => { bars.forEach((b, i) => { const h = (a[i] / n) * 270; b.setAttribute("y", 290 - h); b.setAttribute("height", h); b.setAttribute("fill", st.fin ? K.green : hi.includes(i) ? K.pink : K.navy); });
        chips(read, [["n", n], ["comparisons", st.cmp.toLocaleString(), K.pink], ["array writes", st.wr.toLocaleString(), K.or], ["n²", (n * n).toLocaleString()], ["n·log₂n", Math.round(n * Math.log2(n)).toLocaleString()]], st.fin ? "Sorted. Compare the counts with n² and n·log₂n to see which growth class this run matched." : { bubble: "Bubble: swap adjacent out-of-order pairs; the largest value sinks to the end each pass.", insertion: "Insertion: grow a sorted prefix by sliding each new element left into place.", selection: "Selection: find the minimum of the unsorted part and swap it to the front.", quick: "Quicksort: partition around the last element as pivot, then recurse on each side.", merge: "Merge sort: sort each half recursively, then merge the two sorted halves." }[alg]); };
      const step = () => { if (st.fin) return false; const r = it.next(); if (r.done) { st.fin = true; draw([]); return false; } draw(r.value); return true; };
      select(ctl, "Algorithm", [["bubble", "Bubble sort"], ["insertion", "Insertion sort"], ["selection", "Selection sort"], ["quick", "Quicksort"], ["merge", "Merge sort"]], (v) => { R.stop(); alg = v; build(); });
      slider(ctl, "Array size", 6, 60, 1, n, (v) => { R.stop(); n = v; build(); });
      slider(ctl, "Delay", 5, 300, 5, speed, (v) => (speed = v), (v) => v + " ms");
      button(ctl, "Step", step, true); const rb = button(ctl, "Run", () => {}); const R = runner(host, rb, step, () => speed);
      button(ctl, "Shuffle", () => { R.stop(); build(); }); button(ctl, "Nearly sorted", () => { R.stop(); build("near"); }); button(ctl, "Reversed", () => { R.stop(); build("rev"); });
      build();
    } };

  /* ============ binary search (you play the algorithm) ============ */
  D.binsearch = { title: "Binary search: you are the algorithm", blurb: "Find the target by clicking the element binary search would check next. The diagram only accepts the true midpoint.", skills: ["swe.search"],
    tasks: ["Find five targets in a row with zero mistakes.", "What is the most steps any target can take in this 15-element array? Why?", "Try a target that is not in the array. How does the search end?"],
    mount(host) {
      const { ctl, svg, read } = frame(host, 720, 200); let a, t, lo, hi, steps, miss, msg, done, solved = 0; const cw = 44, x0 = 30;
      const fresh = (absent) => { const r = GR.rng((Math.random() * 1e9) | 0); a = []; let v = r.int(1, 6); for (let i = 0; i < 15; i++) { a.push(v); v += r.int(2, 7); } t = absent ? a[r.int(2, 12)] + 1 : r.pick(a); lo = 0; hi = 14; steps = 0; miss = 0; done = false; msg = "Click the element at the midpoint of the active range: mid = lo + (hi − lo) // 2."; draw(); };
      const draw = (flash = -1, bad = false) => {
        svg.innerHTML = ""; T(svg, 360, 30, `Target: ${t}`, { "text-anchor": "middle", "font-size": 20, "font-weight": 800, fill: K.ink });
        a.forEach((v, i) => { const inR = i >= lo && i <= hi && !done; S("rect", { x: x0 + i * cw, y: 60, width: cw - 4, height: 48, rx: 8, fill: i === flash ? (bad ? K.pink : K.green) : inR ? "#fff" : K.card, stroke: inR ? K.navy : K.rule, "stroke-width": 2, "data-i": i, style: "cursor:pointer;transition:fill .3s", opacity: inR || i === flash ? 1 : 0.55 }, svg);
          T(svg, x0 + i * cw + cw / 2 - 2, 90, v, { "text-anchor": "middle", "font-size": 15, "font-weight": 700, fill: inR || i === flash ? K.ink : K.mute, style: "pointer-events:none" }); T(svg, x0 + i * cw + cw / 2 - 2, 124, i, { "text-anchor": "middle", "font-size": 10, fill: K.mute }); });
        if (!done && lo <= hi) [[lo, "lo", K.navy], [hi, "hi", K.or]].forEach(([i, l, c], k) => { S("path", { d: `M${x0 + i * cw + cw / 2 - 2},${138} l-6,10 h12 Z`, fill: c }, svg); T(svg, x0 + i * cw + cw / 2 - 2 + (lo === hi ? (k ? 12 : -12) : 0), 164, l, { "text-anchor": "middle", "font-weight": 800, fill: c, "font-size": 13 }); });
        chips(read, [["lo", lo], ["hi", hi], ["steps", steps], ["wrong clicks", miss, miss ? K.pink : ""], ["solved this session", solved, K.green]], msg);
      };
      const act = (i) => { if (done) return; const mid = lo + ((hi - lo) >> 1);
        if (i !== mid) { miss++; msg = `Not the midpoint. With lo = ${lo} and hi = ${hi}, mid = ${lo} + (${hi} − ${lo}) // 2 = ${mid}.`; return draw(i, true); }
        steps++;
        if (a[mid] === t) { done = true; solved++; msg = `Found ${t} at index ${mid} in ${steps} step${steps > 1 ? "s" : ""}${miss ? "" : ", with no mistakes"}. A linear scan would have needed ${mid + 1}.`; return draw(mid); }
        if (a[mid] < t) { msg = `${a[mid]} < ${t}: the target can only be to the right, so lo = mid + 1 = ${mid + 1}.`; lo = mid + 1; } else { msg = `${a[mid]} > ${t}: the target can only be to the left, so hi = mid − 1 = ${mid - 1}.`; hi = mid - 1; }
        if (lo > hi) { done = true; msg += ` Now lo > hi: the range is empty, so ${t} is not in the array (${steps} steps).`; }
        draw(mid); };
      svg.addEventListener("click", (e) => { const i = e.target.dataset && e.target.dataset.i; if (i !== undefined) act(+i); });
      button(ctl, "New target", () => fresh(false), true); button(ctl, "Target not in array", () => fresh(true)); button(ctl, "Show next step", () => act(lo + ((hi - lo) >> 1)));
      fresh(false);
    } };

  /* ============ graph traversal ============ */
  D.graph = { title: "Graph traversal: BFS and DFS", blurb: "Step through breadth-first and depth-first search on the same graph. Watch how a queue and a stack produce different visiting orders. Click a node to start from it.", skills: ["swe.graphs", "swe.linked"],
    tasks: ["Predict the BFS order from A before stepping. Then do the same for DFS.", "Start BFS from H. In which ‘ring’ is A reached? That ring number is the shortest path length.", "Watch the frontier during DFS: how deep does the stack get compared with the BFS queue?"],
    mount(host) {
      const { ctl, svg, read } = frame(host, 720, 320); const N = { A: [90, 160], B: [220, 70], C: [220, 250], D: [360, 40], E: [360, 160], F: [360, 280], G: [520, 100], H: [520, 230], I: [640, 160] };
      const E = ["AB", "AC", "BD", "BE", "CE", "CF", "DG", "EG", "EH", "FH", "GI", "HI"]; const adj = {}; Object.keys(N).forEach((k) => (adj[k] = [])); E.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); }); Object.values(adj).forEach((l) => l.sort());
      let mode = "bfs", start = "A", fr, vis, order, par, cur, dist;
      const reset = () => { fr = [start]; vis = new Set(); order = []; par = {}; cur = null; dist = { [start]: 0 }; draw(); };
      const draw = () => {
        svg.innerHTML = ""; E.forEach(([a, b]) => { const tree = par[a] === b || par[b] === a; S("line", { x1: N[a][0], y1: N[a][1], x2: N[b][0], y2: N[b][1], stroke: tree ? K.navy : K.rule, "stroke-width": tree ? 4 : 2 }, svg); });
        Object.entries(N).forEach(([k, [x, y]]) => { const v = vis.has(k), f = fr.includes(k); S("circle", { cx: x, cy: y, r: 22, fill: k === cur ? K.pink : v ? K.navy : "#fff", stroke: f ? K.or : v ? K.navy : K.mute, "stroke-width": f ? 4 : 2, "data-n": k, style: "cursor:pointer;transition:fill .3s" }, svg); T(svg, x, y + 5, k, { "text-anchor": "middle", "font-size": 15, "font-weight": 800, fill: v || k === cur ? "#fff" : K.ink, style: "pointer-events:none" }); if (v) T(svg, x + 24, y - 20, "#" + (order.indexOf(k) + 1), { "font-size": 11, "font-weight": 700, fill: K.ink2 }); });
        chips(read, [["algorithm", mode === "bfs" ? "BFS (queue)" : "DFS (stack)"], ["visit order", order.join(" → ") || "–", K.navy], [mode === "bfs" ? "queue (front → back)" : "stack (bottom → top)", fr.join(" ") || "empty", K.or], ["distance of current", cur && mode === "bfs" ? dist[cur] : "–"]], !fr.length && order.length ? `Done. ${mode === "bfs" ? "BFS visited nodes in rings of increasing distance, so the tree edges (navy) are shortest paths." : "DFS dived as deep as it could before backtracking; its tree edges are not shortest paths."}` : mode === "bfs" ? "Step: take the node at the FRONT of the queue, visit it, and add its unseen neighbours to the BACK." : "Step: take the node on TOP of the stack, visit it, and push its unvisited neighbours.");
      };
      const step = () => {
        while (fr.length) { const u = mode === "bfs" ? fr.shift() : fr.pop(); if (vis.has(u)) continue; vis.add(u); order.push(u); cur = u;
          const nb = adj[u].filter((v) => !vis.has(v)); if (mode === "bfs") nb.forEach((v) => { if (!fr.includes(v)) { fr.push(v); par[v] = u; dist[v] = dist[u] + 1; } }); else nb.slice().reverse().forEach((v) => { fr = fr.filter((z) => z !== v); fr.push(v); par[v] = u; });
          draw(); return fr.length > 0; }
        cur = null; draw(); return false; };
      select(ctl, "Algorithm", [["bfs", "Breadth-first (BFS)"], ["dfs", "Depth-first (DFS)"]], (v) => { R.stop(); mode = v; reset(); });
      button(ctl, "Step", step, true); const rb = button(ctl, "Run", () => {}); const R = runner(host, rb, step, () => 700); button(ctl, "Reset", () => { R.stop(); reset(); });
      svg.addEventListener("click", (e) => { const k = e.target.dataset && e.target.dataset.n; if (k) { R.stop(); start = k; reset(); } });
      reset();
    } };

  /* ============ Big-O growth ============ */
  D.bigo = { title: "Growth of complexity classes", blurb: "Slide n and compare how many operations each complexity class needs. The gaps are the whole point of Big-O.", skills: ["swe.bigo"],
    tasks: ["At what n does 2ⁿ overtake n²? At what n does it leave the chart entirely?", "At n = 60, how many times more work is n² than n·log n?", "Switch to the log scale. Which curves become straight lines, and what does that tell you?"],
    mount(host) {
      const { ctl, svg, read } = frame(host, 720, 330); let n = 20, log = false;
      const F = [["log n", (v) => Math.log2(v), K.green], ["n", (v) => v, K.blue], ["n log n", (v) => v * Math.log2(v), K.navy], ["n²", (v) => v * v, K.or], ["2ⁿ", (v) => 2 ** v, K.pink]];
      const draw = () => { svg.innerHTML = ""; const x = sc(1, 60, 50, 620), ymax = log ? 18 : 600, tf = (v) => (log ? Math.log10(Math.max(1, v)) : v), y = sc(0, ymax, 290, 20);
        axis(svg, x, y, [1, 10, 20, 30, 40, 50, 60], log ? [0, 6, 12, 18] : [0, 200, 400, 600], "input size n", log ? "operations (log₁₀)" : "operations");
        F.forEach(([l, f, c]) => { const p = []; let end = null; for (let v = 1; v <= 60; v += 0.5) { const yy = tf(f(v)); if (yy > ymax) { end = end || [x(v), y(ymax)]; break; } p.push([x(v), y(yy)]); end = null; } S("path", { d: line(p), fill: "none", stroke: c, "stroke-width": 3 }, svg); const lp = p[p.length - 1]; T(svg, Math.min(690, lp[0] + 6), Math.max(16, lp[1] + 4), l, { fill: c, "font-weight": 800, "font-size": 13 }); const yy = tf(f(n)); if (yy <= ymax) S("circle", { cx: x(n), cy: y(yy), r: 5.5, fill: c, stroke: "#fff", "stroke-width": 2 }, svg); });
        S("line", { x1: x(n), x2: x(n), y1: 20, y2: 290, stroke: K.ink, "stroke-dasharray": "4 4", opacity: 0.5 }, svg);
        const fm = (v) => (v >= 1e15 ? v.toExponential(1) : v >= 100 ? Math.round(v).toLocaleString() : v.toFixed(1));
        chips(read, [["n", n], ...F.map(([l, f, c]) => [l, fm(f(n)), c])], `At one billion simple operations per second, 2ⁿ at n = ${n} takes ${2 ** n / 1e9 < 1 ? "under a second" : 2 ** n / 1e9 < 3600 ? Math.round(2 ** n / 1e9) + " seconds" : 2 ** n / 1e9 < 3.15e7 ? (2 ** n / 3.6e12).toFixed(1) + " hours" : Math.round(2 ** n / 3.15e16).toLocaleString() + " years"}; n² takes ${(n * n) / 1e3} microseconds.`);
      };
      slider(ctl, "n", 1, 60, 1, n, (v) => { n = v; draw(); });
      select(ctl, "Vertical scale", [["lin", "Linear"], ["log", "Logarithmic"]], (v) => { log = v === "log"; draw(); });
      draw();
    } };
})();
