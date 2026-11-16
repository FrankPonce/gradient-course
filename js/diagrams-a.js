/* Gradient — interactive motion diagrams, part A: toolkit + ML and AI diagrams.
   Each diagram: GR.diagrams[id] = { title, blurb, skills, tasks, mount(host) }. */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const K = { or: "var(--or)", navy: "var(--navy)", blue: "var(--blue)", pink: "var(--pink)", green: "var(--green)", ink: "var(--ink)", ink2: "var(--ink2)", mute: "var(--mute)", rule: "var(--rule)", card: "var(--card)", bg: "var(--bg)" };
  const S = (t, a = {}, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const T = (p, x, y, s, a = {}) => { const e = S("text", Object.assign({ x, y, "font-size": 12, fill: K.ink2 }, a), p); e.textContent = s; return e; };
  const frame = (host, w = 720, h = 360) => { host.innerHTML = `<div class="dg-ctl"></div><svg class="dg-svg" viewBox="0 0 ${w} ${h}" role="img"></svg><div class="dg-read"></div>`; return { ctl: host.children[0], svg: host.children[1], read: host.children[2], w, h }; };
  const slider = (ctl, label, min, max, step, val, cb, fmt = (v) => v) => {
    const w = document.createElement("label"); w.className = "dg-sl";
    w.innerHTML = `<span>${label} <b></b></span><input type="range" min="${min}" max="${max}" step="${step}" value="${val}">`;
    const i = w.querySelector("input"), b = w.querySelector("b"), up = () => (b.textContent = fmt(+i.value));
    i.addEventListener("input", () => { up(); cb(+i.value); }); up(); ctl.appendChild(w);
    i.set = (v) => { i.value = v; up(); }; return i;
  };
  const button = (ctl, label, cb, primary) => { const b = document.createElement("button"); b.className = "btn sm" + (primary ? " primary" : ""); b.textContent = label; b.addEventListener("click", cb); ctl.appendChild(b); return b; };
  const select = (ctl, label, opts, cb) => { const w = document.createElement("label"); w.className = "dg-sel"; w.innerHTML = `<span>${label}</span><select>${opts.map(([v, l]) => `<option value="${v}">${l}</option>`).join("")}</select>`; const s = w.querySelector("select"); s.addEventListener("change", () => cb(s.value)); ctl.appendChild(w); return s; };
  const chips = (read, pairs, note) => { read.innerHTML = pairs.map(([k, v, c]) => `<span class="chip"><i>${k}</i><b${c ? ` style="color:${c}"` : ""}>${v}</b></span>`).join("") + (note ? `<div class="dg-note">${note}</div>` : ""); };
  const pt = (svg, e) => { const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal; return [((e.clientX - r.left) / r.width) * vb.width, ((e.clientY - r.top) / r.height) * vb.height]; };
  const scale = (d0, d1, r0, r1) => { const f = (v) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0); f.inv = (p) => d0 + ((p - r0) / (r1 - r0)) * (d1 - d0); return f; };
  const line = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  /* a Run/Pause controller that stops itself when the diagram leaves the page */
  const runner = (host, btn, step, delay = () => 350) => {
    let id = null; const stop = () => { clearTimeout(id); id = null; btn.textContent = "Run"; };
    const tick = () => { if (!host.isConnected) return stop(); if (step() === false) return stop(); id = setTimeout(tick, delay()); };
    btn.addEventListener("click", () => { if (id) stop(); else { btn.textContent = "Pause"; tick(); } });
    return { stop };
  };
  const axis = (g, x, y, xt, yt, xl, yl) => {
    yt.forEach((v) => { S("line", { x1: x.r0, x2: x.r1, y1: y(v), y2: y(v), stroke: K.rule }, g); T(g, x.r0 - 6, y(v) + 4, v, { "text-anchor": "end", "font-size": 11, fill: K.mute }); });
    xt.forEach((v) => T(g, x(v), y.r0 + 16, v, { "text-anchor": "middle", "font-size": 11, fill: K.mute }));
    S("line", { x1: x.r0, x2: x.r1, y1: y.r0, y2: y.r0, stroke: K.mute }, g);
    if (xl) T(g, (x.r0 + x.r1) / 2, y.r0 + 32, xl, { "text-anchor": "middle", "font-size": 11, "font-weight": 600, fill: K.mute });
    if (yl) T(g, x.r0, y.r1 - 8, yl, { "font-size": 11, "font-weight": 600, fill: K.mute });
  };
  const sc = (d0, d1, r0, r1) => Object.assign(scale(d0, d1, r0, r1), { r0, r1 });
  const erf = (x) => { const s = x < 0 ? -1 : 1; x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x); return s * (1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)); };
  const Phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2));
  const npdf = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
  GR.dg = { S, T, K, frame, slider, button, select, chips, pt, scale, sc, line, clamp, runner, axis, Phi, npdf };
  const D = GR.diagrams;

  /* ============ gradient descent ============ */
  D.gd = { title: "Gradient descent", blurb: "Watch a parameter roll down a loss curve. The learning rate decides whether it crawls, converges or explodes.", skills: ["ml.gd"],
    tasks: ["On the bowl, find the largest learning rate that still converges. (Hint: the step multiplies w by 1 − 2η.)", "Set η = 1.0 on the bowl. Why does w bounce forever between two values?", "Switch to the bumpy surface and click different start points. Which minimum does each end in?"],
    mount(host) {
      const { ctl, svg, read } = frame(host);
      const F = { bowl: { f: (w) => w * w, g: (w) => 2 * w, ymax: 17 }, bumpy: { f: (w) => 0.3 * w * w + 2 * Math.sin(2 * w) + 2, g: (w) => 0.6 * w + 4 * Math.cos(2 * w), ymax: 10 } };
      let fn = F.bowl, lr = 0.1, w = 3.6, trail = [w], x, y;
      const gS = S("g", {}, svg), gT = S("g", {}, svg);
      const tan = S("line", { stroke: K.pink, "stroke-width": 2, "stroke-dasharray": "5 4" }, svg);
      const ball = S("circle", { r: 9, fill: K.or, stroke: "var(--paper)", "stroke-width": 2, style: "transition:cx .28s,cy .28s" }, svg);
      const stat = () => { gS.innerHTML = ""; x = sc(-4, 4, 50, 690); y = sc(0, fn.ymax, 310, 20); axis(gS, x, y, [-4, -2, 0, 2, 4], [0, fn.ymax / 2, fn.ymax].map((v) => +v.toFixed(1)), "parameter w", "loss L(w)");
        const pts = []; for (let i = 0; i <= 200; i++) { const v = -4 + i * 0.04; pts.push([x(v), y(Math.min(fn.ymax, fn.f(v)))]); } S("path", { d: line(pts), fill: "none", stroke: K.navy, "stroke-width": 3 }, gS); };
      const draw = () => {
        gT.innerHTML = ""; const P = (v) => [x(clamp(v, -4, 4)), y(clamp(fn.f(v), 0, fn.ymax))];
        S("path", { d: line(trail.map(P)), fill: "none", stroke: K.or, "stroke-width": 1.5, opacity: 0.6 }, gT);
        trail.slice(0, -1).forEach((v) => S("circle", { cx: P(v)[0], cy: P(v)[1], r: 3.5, fill: K.or, opacity: 0.5 }, gT));
        const [cx, cy] = P(w), g = fn.g(w), dx = 0.7; ball.setAttribute("cx", cx); ball.setAttribute("cy", cy);
        const inR = Math.abs(w) <= 4; tan.setAttribute("opacity", inR ? 1 : 0);
        if (inR) { tan.setAttribute("x1", x(w - dx)); tan.setAttribute("x2", x(w + dx)); tan.setAttribute("y1", y(fn.f(w) - g * dx)); tan.setAttribute("y2", y(fn.f(w) + g * dx)); }
        const div = Math.abs(w) > 50;
        chips(read, [["step", trail.length - 1], ["w", w.toFixed(3)], ["loss", fn.f(w).toFixed(3)], ["gradient", g.toFixed(3)], ["next step", (-lr * g).toFixed(3), K.or]], div ? "Diverged: every step overshoots by more than the last. Lower the learning rate." : Math.abs(g) < 0.01 ? "Converged: the gradient is essentially zero." : "Click anywhere on the plot to choose a new starting point.");
      };
      const step = () => { if (Math.abs(w) > 50) return false; w = w - lr * fn.g(w); trail.push(w); if (trail.length > 80) trail.shift(); draw(); return Math.abs(fn.g(w)) > 1e-3; };
      const reset = (nw = 3.6) => { w = nw; trail = [w]; draw(); };
      select(ctl, "Loss surface", [["bowl", "Bowl: w²"], ["bumpy", "Bumpy (non-convex)"]], (v) => { fn = F[v]; stat(); reset(); });
      slider(ctl, "Learning rate η", 0.01, 1.2, 0.01, lr, (v) => (lr = v), (v) => v.toFixed(2));
      button(ctl, "Step", step, true); const rb = button(ctl, "Run", () => {}); const R = runner(host, rb, step); button(ctl, "Reset", () => { R.stop(); reset(); });
      svg.addEventListener("click", (e) => { R.stop(); reset(clamp(x.inv(pt(svg, e)[0]), -4, 4)); });
      stat(); draw();
    } };

  /* ============ bias–variance / polynomial fit ============ */
  D.polyfit = { title: "Underfitting and overfitting", blurb: "Fit polynomials of rising degree to noisy data and compare error on the training points with error on unseen points.", skills: ["ml.biasvar", "ml.regularization"],
    tasks: ["Find the degree with the lowest test error. Is it the one with the lowest training error?", "At degree 9, press “New sample” several times. How much does the curve change? That instability is variance.", "At degree 1, press “New sample”. The line barely moves but is always wrong: that is bias."],
    mount(host) {
      const { ctl, svg, read } = frame(host); let deg = 3, seed = 7, tr, te, errs;
      const f = (v) => Math.sin(2.6 * v), x = sc(-1, 1, 40, 440), y = sc(-2, 2, 310, 20);
      const solve = (A, b) => { const n = b.length; for (let i = 0; i < n; i++) { let m = i; for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[m][i])) m = r; [A[i], A[m]] = [A[m], A[i]]; [b[i], b[m]] = [b[m], b[i]]; for (let r = i + 1; r < n; r++) { const k = A[r][i] / A[i][i]; for (let c = i; c < n; c++) A[r][c] -= k * A[i][c]; b[r] -= k * b[i]; } } const s = Array(n).fill(0); for (let i = n - 1; i >= 0; i--) { let v = b[i]; for (let c = i + 1; c < n; c++) v -= A[i][c] * s[c]; s[i] = v / A[i][i]; } return s; };
      const fit = (d) => { const n = d + 1, A = Array.from({ length: n }, () => Array(n).fill(0)), b = Array(n).fill(0); tr.forEach(([px, py]) => { for (let i = 0; i < n; i++) { b[i] += px ** i * py; for (let j = 0; j < n; j++) A[i][j] += px ** (i + j); } }); for (let i = 0; i < n; i++) A[i][i] += 1e-9; return solve(A, b); };
      const ev = (c, v) => c.reduce((a, k, i) => a + k * v ** i, 0), mse = (c, d) => d.reduce((a, [px, py]) => a + (ev(c, px) - py) ** 2, 0) / d.length;
      const gen = () => { const r = GR.rng(seed); const mk = (n) => Array.from({ length: n }, () => { const v = r() * 2 - 1; return [v, f(v) + r.gauss() * 0.3]; }); tr = mk(14); te = mk(60); errs = []; for (let d = 1; d <= 9; d++) { const c = fit(d); errs[d] = [mse(c, tr), mse(c, te), c]; } };
      const draw = () => {
        svg.innerHTML = ""; axis(svg, x, y, [-1, 0, 1], [-2, 0, 2], "x", "y");
        const tp = [], fp = []; for (let i = 0; i <= 120; i++) { const v = -1 + i / 60; tp.push([x(v), y(f(v))]); fp.push([x(v), y(clamp(ev(errs[deg][2], v), -2.2, 2.2))]); }
        S("path", { d: line(tp), fill: "none", stroke: K.mute, "stroke-width": 2, "stroke-dasharray": "5 5" }, svg);
        te.forEach(([a, b]) => S("circle", { cx: x(a), cy: y(clamp(b, -2, 2)), r: 2.5, fill: K.blue, opacity: 0.5 }, svg));
        S("path", { d: line(fp), fill: "none", stroke: K.or, "stroke-width": 3.5 }, svg);
        tr.forEach(([a, b]) => S("circle", { cx: x(a), cy: y(clamp(b, -2, 2)), r: 5, fill: K.navy, stroke: "var(--paper)", "stroke-width": 1.5 }, svg));
        // error-vs-degree panel
        const ex = sc(1, 9, 500, 700), top = Math.min(1.2, Math.max(...errs.slice(1).map((e) => e[1]))) * 1.05, ey = sc(0, top, 310, 60); axis(svg, ex, ey, [1, 3, 5, 7, 9], [0, +(top / 2).toFixed(2), +top.toFixed(2)], "polynomial degree", "mean squared error");
        [[0, K.navy, "train"], [1, K.blue, "test"]].forEach(([i, c, l]) => { S("path", { d: line(errs.slice(1).map((e, k) => [ex(k + 1), ey(Math.min(top, e[i]))])), fill: "none", stroke: c, "stroke-width": 2.5 }, svg); T(svg, 704, ey(Math.min(top, errs[9][i])) + (i ? -6 : 12), l, { "text-anchor": "end", fill: c, "font-weight": 700 }); });
        S("line", { x1: ex(deg), x2: ex(deg), y1: 60, y2: 310, stroke: K.or, "stroke-width": 2 }, svg);
        const best = errs.slice(1).reduce((b, e, k) => (e[1] < errs[b][1] ? k + 1 : b), 1);
        chips(read, [["degree", deg], ["train MSE", errs[deg][0].toFixed(3), K.navy], ["test MSE", errs[deg][1].toFixed(3), K.blue], ["best test degree", best]], deg < best - 1 ? "Underfitting: too rigid to follow the curve. Both errors are high." : deg > best + 2 ? "Overfitting: the curve threads the training points and swings wildly between them. Training error keeps falling while test error rises." : "Near the sweet spot: flexible enough for the signal, not for the noise.");
      };
      slider(ctl, "Polynomial degree", 1, 9, 1, deg, (v) => { deg = v; draw(); });
      button(ctl, "New sample", () => { seed++; gen(); draw(); }, true);
      const lg = document.createElement("span"); lg.className = "dg-legend"; lg.innerHTML = `<i style="background:${K.navy}"></i>training points <i style="background:${K.blue}"></i>unseen test points <i style="background:${K.or}"></i>fitted curve <i style="background:${K.mute}"></i>true function`; ctl.appendChild(lg);
      gen(); draw();
    } };

  /* ============ linear regression ============ */
  D.regression = { title: "Least-squares regression", blurb: "Drag points and watch the fitted line, residuals and R² respond. Click empty space to add a point; double-click a point to remove it.", skills: ["ml.linreg", "ds.regression", "ds.corr"],
    tasks: ["Drag one point far above the others. How much does the slope change? That is the pull of squared error.", "Arrange the points so R² is above 0.95, then below 0.05.", "Add an outlier far to the right. Compare its effect with an outlier in the middle (leverage)."],
    mount(host) {
      const { ctl, svg, read } = frame(host); const x = sc(0, 10, 50, 690), y = sc(0, 10, 310, 20);
      const init = () => [[1, 2.2], [2, 2.6], [3, 4.1], [4, 3.9], [5, 5.6], [6, 5.4], [7, 7.2], [8, 7.1], [9, 8.4]];
      let P = init(), drag = -1;
      const draw = () => {
        svg.innerHTML = ""; axis(svg, x, y, [0, 2, 4, 6, 8, 10], [0, 5, 10], "x", "y");
        const n = P.length, mx = P.reduce((a, p) => a + p[0], 0) / n, my = P.reduce((a, p) => a + p[1], 0) / n;
        const sxx = P.reduce((a, p) => a + (p[0] - mx) ** 2, 0), sxy = P.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0), syy = P.reduce((a, p) => a + (p[1] - my) ** 2, 0);
        const b = sxx ? sxy / sxx : 0, a = my - b * mx, sse = P.reduce((s, p) => s + (p[1] - a - b * p[0]) ** 2, 0), r2 = syy ? 1 - sse / syy : 0;
        if (n > 1) { P.forEach((p) => S("line", { x1: x(p[0]), x2: x(p[0]), y1: y(p[1]), y2: y(clamp(a + b * p[0], -5, 15)), stroke: K.pink, "stroke-width": 2, opacity: 0.7 }, svg));
          S("line", { x1: x(0), x2: x(10), y1: y(a), y2: y(a + 10 * b), stroke: K.or, "stroke-width": 3.5, "clip-path": "none" }, svg);
          S("circle", { cx: x(mx), cy: y(my), r: 5, fill: "none", stroke: K.or, "stroke-width": 2 }, svg); }
        P.forEach((p, i) => S("circle", { cx: x(p[0]), cy: y(p[1]), r: 8, fill: K.navy, stroke: "var(--paper)", "stroke-width": 2, "data-i": i, style: "cursor:grab" }, svg));
        chips(read, [["points", n], ["slope", b.toFixed(3)], ["intercept", a.toFixed(3)], ["R²", r2.toFixed(3), K.or], ["MSE", (sse / n).toFixed(3), K.pink], ["correlation r", (Math.sign(b) * Math.sqrt(Math.max(0, r2))).toFixed(3)]], "Pink segments are residuals. The line always passes through the ring at (mean x, mean y).");
      };
      svg.style.touchAction = "none";
      svg.addEventListener("pointerdown", (e) => { const i = e.target.dataset && e.target.dataset.i; if (i !== undefined) drag = +i; else { const [px, py] = pt(svg, e); P.push([clamp(x.inv(px), 0, 10), clamp(y.inv(py), 0, 10)]); drag = P.length - 1; draw(); } svg.setPointerCapture(e.pointerId); });
      svg.addEventListener("pointermove", (e) => { if (drag < 0) return; const [px, py] = pt(svg, e); P[drag] = [clamp(x.inv(px), 0, 10), clamp(y.inv(py), 0, 10)]; draw(); });
      svg.addEventListener("pointerup", () => (drag = -1));
      svg.addEventListener("dblclick", (e) => { const i = e.target.dataset && e.target.dataset.i; if (i !== undefined && P.length > 2) { P.splice(+i, 1); draw(); } });
      button(ctl, "Add outlier", () => { P.push([9.3, 1]); draw(); }, true); button(ctl, "Reset", () => { P = init(); draw(); });
      draw();
    } };

  /* ============ classification threshold, confusion matrix, ROC ============ */
  D.threshold = { title: "Threshold, confusion matrix and ROC", blurb: "Two score distributions overlap. Slide the decision threshold and watch precision, recall and the ROC operating point move together.", skills: ["ml.metrics", "ml.roc"],
    tasks: ["Set prevalence to 2%. Find a threshold with recall above 90%. What happened to precision?", "Move the threshold from 0 to 1 and watch the dot trace the whole ROC curve.", "Increase class separation. What happens to AUC, and how much easier is the precision/recall trade-off?"],
    mount(host) {
      const { ctl, svg, read } = frame(host, 720, 340); let t = 0.5, sep = 0.3, prev = 0.3; const sd = 0.12;
      const x = sc(0, 1, 40, 430), rx = sc(0, 1, 500, 700), ry = sc(0, 1, 290, 90);
      const draw = () => {
        svg.innerHTML = ""; const m0 = 0.5 - sep / 2, m1 = 0.5 + sep / 2, top = npdf(0, 0, sd), y = sc(0, top * 1.05, 290, 52);
        axis(svg, x, y, [0, 0.25, 0.5, 0.75, 1], [], "model score", "");
        const area = (m, a, b, c, o) => { const p = [[x(a), y(0)]]; for (let i = 0; i <= 80; i++) { const v = a + ((b - a) * i) / 80; p.push([x(v), y(npdf(v, m, sd))]); } p.push([x(b), y(0)]); S("path", { d: line(p) + "Z", fill: c, opacity: o }, svg); };
        area(m0, 0, t, K.mute, 0.25); area(m1, t, 1, K.green, 0.5); area(m1, 0, t, K.navy, 0.45); area(m0, t, 1, K.pink, 0.7);
        [[m0, K.ink2, "negatives"], [m1, K.green, "positives"]].forEach(([m, c, l]) => { const p = []; for (let i = 0; i <= 100; i++) p.push([x(i / 100), y(npdf(i / 100, m, sd))]); S("path", { d: line(p), fill: "none", stroke: c, "stroke-width": 2 }, svg); T(svg, x(m), y(top) - 6, l, { "text-anchor": "middle", fill: c, "font-weight": 700 }); });
        S("line", { x1: x(t), x2: x(t), y1: 12, y2: 290, stroke: K.or, "stroke-width": 3 }, svg); T(svg, x(t) + (t > 0.8 ? -6 : 6), 22, "threshold", { fill: K.or, "font-weight": 700, "text-anchor": t > 0.8 ? "end" : "start" });
        const tpr = (v) => 1 - Phi((v - m1) / sd), fpr = (v) => 1 - Phi((v - m0) / sd);
        axis(svg, rx, ry, [0, 0.5, 1], [0, 0.5, 1], "false positive rate", "ROC: true positive rate");
        S("line", { x1: rx(0), y1: ry(0), x2: rx(1), y2: ry(1), stroke: K.rule, "stroke-dasharray": "4 4" }, svg);
        const roc = []; for (let i = 0; i <= 100; i++) { const v = 1.2 - (1.4 * i) / 100; roc.push([rx(fpr(v)), ry(tpr(v))]); } S("path", { d: line(roc), fill: "none", stroke: K.navy, "stroke-width": 2.5 }, svg);
        S("circle", { cx: rx(fpr(t)), cy: ry(tpr(t)), r: 7, fill: K.or, stroke: "var(--paper)", "stroke-width": 2 }, svg);
        const auc = Phi(sep / (sd * Math.SQRT2)), N = 1000, pos = N * prev, neg = N - pos, TP = pos * tpr(t), FN = pos - TP, FP = neg * fpr(t), TN = neg - FP, pr = TP + FP ? TP / (TP + FP) : 1, rc = tpr(t);
        T(svg, 600, 60, "AUC " + auc.toFixed(3), { "text-anchor": "middle", "font-size": 15, "font-weight": 800, fill: K.navy });
        chips(read, [["TP", Math.round(TP), K.green], ["FP", Math.round(FP), K.pink], ["FN", Math.round(FN), K.navy], ["TN", Math.round(TN)], ["precision", (pr * 100).toFixed(1) + "%", K.or], ["recall", (rc * 100).toFixed(1) + "%", K.or], ["F1", ((2 * pr * rc) / (pr + rc || 1)).toFixed(3)], ["accuracy", (((TP + TN) / N) * 100).toFixed(1) + "%"]], "Counts are per 1,000 cases. Green = caught positives, pink = false alarms, navy = missed positives.");
      };
      slider(ctl, "Threshold", 0, 1, 0.01, t, (v) => { t = v; draw(); }, (v) => v.toFixed(2));
      slider(ctl, "Class separation", 0.05, 0.6, 0.01, sep, (v) => { sep = v; draw(); }, (v) => v.toFixed(2));
      slider(ctl, "Prevalence of positives", 0.01, 0.5, 0.01, prev, (v) => { prev = v; draw(); }, (v) => Math.round(v * 100) + "%");
      draw();
    } };

  /* ============ k-means ============ */
  D.kmeans = { title: "k-means clustering", blurb: "Step through the assign and update phases. Click the canvas to add points and see how the clusters reorganise.", skills: ["ml.kmeans"],
    tasks: ["Press “New centroids” several times with k = 3. Does it always find the same clusters?", "Set k = 5 on three blobs. What does k-means do with the extra centroids?", "Add a far-away outlier by clicking in a corner. What happens to the nearest centroid?"],
    mount(host) {
      const { ctl, svg, read } = frame(host); const cols = [K.or, K.navy, K.pink, K.green, K.blue]; let k = 3, seed = 3, P, C, A, phase, it, r;
      const gL = S("g", {}, svg), gP = S("g", {}, svg), gC = S("g", {}, svg);
      const data = () => { r = GR.rng(seed * 101); P = []; [[180, 110], [520, 130], [350, 270]].forEach(([cx, cy]) => { for (let i = 0; i < 22; i++) P.push([clamp(cx + r.gauss() * 55, 15, 705), clamp(cy + r.gauss() * 42, 15, 345)]); }); };
      const cents = () => { C = r.shuffle(P).slice(0, k).map((p) => p.slice()); A = P.map(() => -1); phase = "assign"; it = 0; build(); };
      const build = () => { gP.innerHTML = ""; gC.innerHTML = ""; P.forEach((p) => S("circle", { cx: p[0], cy: p[1], r: 5.5, fill: K.mute, style: "transition:fill .4s" }, gP)); C.forEach((c, i) => S("rect", { width: 20, height: 20, x: -10, y: -10, rx: 4, fill: cols[i], stroke: K.ink, "stroke-width": 2.5, style: `transition:transform .5s cubic-bezier(.22,.9,.24,1);transform:translate(${c[0]}px,${c[1]}px) rotate(45deg)` }, gC)); draw(); };
      const draw = () => {
        [...gP.children].forEach((e, i) => e.setAttribute("fill", A[i] < 0 ? K.mute : cols[A[i]]));
        [...gC.children].forEach((e, i) => (e.style.transform = `translate(${C[i][0]}px,${C[i][1]}px) rotate(45deg)`));
        gL.innerHTML = ""; if (phase === "update") P.forEach((p, i) => S("line", { x1: p[0], y1: p[1], x2: C[A[i]][0], y2: C[A[i]][1], stroke: cols[A[i]], opacity: 0.25 }, gL));
        const inertia = A[0] < 0 ? null : P.reduce((s, p, i) => s + (p[0] - C[A[i]][0]) ** 2 + (p[1] - C[A[i]][1]) ** 2, 0);
        chips(read, [["iteration", it], ["next phase", phase === "done" ? "converged" : phase, K.or], ["inertia", inertia === null ? "–" : Math.round(inertia).toLocaleString()], ["points", P.length]], phase === "assign" ? "Assign: each point takes the colour of its nearest centroid (diamond)." : phase === "update" ? "Update: each centroid moves to the mean of its points." : "Converged: no assignment changed. This is a local optimum for these starting centroids.");
      };
      const step = () => {
        if (phase === "done") return false;
        if (phase === "assign") { let ch = 0; P.forEach((p, i) => { let b = 0, bd = 1e18; C.forEach((c, j) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2; if (d < bd) { bd = d; b = j; } }); if (A[i] !== b) ch++; A[i] = b; }); phase = ch ? "update" : "done"; }
        else { C.forEach((c, j) => { const m = P.filter((_, i) => A[i] === j); if (m.length) { c[0] = m.reduce((s, p) => s + p[0], 0) / m.length; c[1] = m.reduce((s, p) => s + p[1], 0) / m.length; } }); phase = "assign"; it++; }
        draw(); return phase !== "done";
      };
      select(ctl, "k", [[3, "3 clusters"], [2, "2 clusters"], [4, "4 clusters"], [5, "5 clusters"]], (v) => { k = +v; cents(); });
      button(ctl, "Step", step, true); const rb = button(ctl, "Run", () => {}); const R = runner(host, rb, step, () => 650);
      button(ctl, "New centroids", () => { R.stop(); cents(); }); button(ctl, "New data", () => { R.stop(); seed++; data(); cents(); });
      svg.addEventListener("click", (e) => { P.push(pt(svg, e)); A.push(-1); if (phase === "done") phase = "assign"; build(); });
      data(); cents();
    } };

  /* ============ neural network forward pass ============ */
  D.nn = { title: "A tiny neural network", blurb: "A 2-3-1 network. Move the inputs, click any connection to select it and change its weight, and watch the signal flow forward.", skills: ["ai.neuron", "ai.backprop"],
    tasks: ["With ReLU, make the output greater than 0.9, then less than 0.1, by changing weights only.", "Switch the hidden activation to “none (linear)”. Can the hidden layer still do anything a single neuron could not?", "Find a hidden neuron that is ‘dead’ (outputs 0 for these inputs). Which weight revives it?"],
    mount(host) {
      const { ctl, svg, read } = frame(host, 720, 340); const r = GR.rng(11);
      let X = [0.6, -0.4], W1, b1, W2, b2, act = "relu", sel = 0, wS;
      const rand = () => { W1 = [0, 1, 2].map(() => [0, 1].map(() => +(r() * 4 - 2).toFixed(1))); b1 = [0, 1, 2].map(() => +(r() - 0.5).toFixed(1)); W2 = [0, 1, 2].map(() => +(r() * 4 - 2).toFixed(1)); b2 = 0; };
      const fa = { relu: (z) => Math.max(0, z), tanh: Math.tanh, sigmoid: GR.sig, linear: (z) => z };
      const pi = [[110, 110], [110, 230]], ph = [[360, 70], [360, 170], [360, 270]], po = [610, 170];
      const edges = []; ph.forEach((h, j) => pi.forEach((p, i) => edges.push({ a: p, b: h, get: () => W1[j][i], set: (v) => (W1[j][i] = v), n: `x${i + 1} → h${j + 1}` }))); ph.forEach((h, j) => edges.push({ a: h, b: po, get: () => W2[j], set: (v) => (W2[j] = v), n: `h${j + 1} → output` }));
      const gE = S("g", {}, svg), gN = S("g", {}, svg), gPulse = S("g", {}, svg);
      const fill = (v) => { const a = clamp(Math.abs(v), 0, 1); return v >= 0 ? `color-mix(in srgb, var(--or) ${Math.round((0.12 + a * 0.88) * 100)}%, transparent)` : `color-mix(in srgb, var(--pink) ${Math.round((0.12 + a * 0.88) * 100)}%, transparent)`; };
      const draw = (pulse) => {
        const H = W1.map((w, j) => fa[act](w[0] * X[0] + w[1] * X[1] + b1[j])), z = H.reduce((s, h, j) => s + h * W2[j], b2), out = GR.sig(z);
        gE.innerHTML = ""; gN.innerHTML = "";
        edges.forEach((e, i) => { const w = e.get(); S("line", { x1: e.a[0], y1: e.a[1], x2: e.b[0], y2: e.b[1], stroke: w >= 0 ? K.navy : K.pink, "stroke-width": 1 + Math.abs(w) * 2.4, opacity: i === sel ? 1 : 0.45, "stroke-linecap": "round" }, gE); S("line", { x1: e.a[0], y1: e.a[1], x2: e.b[0], y2: e.b[1], stroke: "transparent", "stroke-width": 16, "data-e": i, style: "cursor:pointer" }, gE);
          if (i === sel) T(gE, (e.a[0] + e.b[0]) / 2, (e.a[1] + e.b[1]) / 2 - 8, "w = " + w.toFixed(1), { "text-anchor": "middle", "font-weight": 800, fill: K.ink, "font-size": 13 }); });
        const node = (p, v, l) => { S("circle", { cx: p[0], cy: p[1], r: 30, fill: "var(--paper)", stroke: K.ink, "stroke-width": 2 }, gN); S("circle", { cx: p[0], cy: p[1], r: 30, fill: fill(v) }, gN); T(gN, p[0], p[1] + 5, v.toFixed(2), { "text-anchor": "middle", "font-size": 14, "font-weight": 800, fill: K.ink }); T(gN, p[0], p[1] - 38, l, { "text-anchor": "middle", fill: K.mute, "font-weight": 600 }); };
        pi.forEach((p, i) => node(p, X[i], "input x" + (i + 1))); ph.forEach((p, j) => node(p, H[j], "hidden h" + (j + 1))); node(po, out, "output (sigmoid)");
        chips(read, [["selected", edges[sel].n, K.or], ["h₁, h₂, h₃", H.map((h) => h.toFixed(2)).join(", ")], ["pre-activation z", z.toFixed(3)], ["output σ(z)", out.toFixed(3), K.or]], "Navy connections carry positive weights, pink negative; thickness shows magnitude. Node colour shows activation.");
        if (pulse) { gPulse.innerHTML = ""; edges.forEach((e, i) => { const c = S("circle", { r: 4, fill: K.or, cx: e.a[0], cy: e.a[1], opacity: 0 }, gPulse); const delay = i < 6 ? 0 : 420; c.animate([{ transform: "translate(0,0)", opacity: 1 }, { transform: `translate(${e.b[0] - e.a[0]}px,${e.b[1] - e.a[1]}px)`, opacity: 1 }], { duration: 420, delay, easing: "ease-in-out" }); }); }
      };
      svg.addEventListener("click", (e) => { const i = e.target.dataset && e.target.dataset.e; if (i !== undefined) { sel = +i; wS.set(edges[sel].get()); draw(); } });
      slider(ctl, "x₁", -1, 1, 0.05, X[0], (v) => { X[0] = v; draw(true); }, (v) => v.toFixed(2));
      slider(ctl, "x₂", -1, 1, 0.05, X[1], (v) => { X[1] = v; draw(true); }, (v) => v.toFixed(2));
      rand(); wS = slider(ctl, "Selected weight", -3, 3, 0.1, edges[0].get(), (v) => { edges[sel].set(v); draw(true); }, (v) => v.toFixed(1));
      select(ctl, "Hidden activation", [["relu", "ReLU"], ["tanh", "tanh"], ["sigmoid", "sigmoid"], ["linear", "none (linear)"]], (v) => { act = v; draw(true); });
      button(ctl, "Randomise weights", () => { rand(); wS.set(edges[sel].get()); draw(true); });
      draw(true);
    } };

  /* ============ attention ============ */
  D.attention = { title: "Self-attention weights", blurb: "Click a word to make it the query and see how strongly it attends to every other word. Temperature controls how sharp the softmax is.", skills: ["ai.attention"],
    tasks: ["Click “it”. Which noun does it attend to most? That is coreference resolved by attention.", "Lower the temperature to 0.3, then raise it to 3. When does attention become nearly uniform?", "Compare the queries “cross” and “tired”. Different words pull in different context."],
    mount(host) {
      const { ctl, svg, read } = frame(host, 720, 320); const tok = ["The", "animal", "did", "not", "cross", "the", "street", "because", "it", "was", "tired"]; let q = 8, temp = 1;
      const boost = { 8: { 1: 4.6, 6: 1.6, 10: 1.4 }, 10: { 1: 2, 8: 2.2, 9: 1 }, 4: { 1: 2, 6: 2.2, 3: 1.2 }, 6: { 4: 1.5, 5: 1.2 }, 1: { 0: 1.5, 4: 1 }, 9: { 8: 1.8, 10: 1.5 }, 7: { 4: 1.2, 10: 1 }, 3: { 2: 1.8, 4: 1.6 }, 2: { 1: 1.4, 3: 1.2 }, 0: { 1: 2 }, 5: { 6: 2 } };
      const weights = () => { const s = tok.map((_, j) => ((boost[q] || {})[j] || 0) - Math.abs(q - j) * 0.3 + (j === q ? 0.4 : 0)), e = s.map((v) => Math.exp(v / temp)), z = e.reduce((a, b) => a + b); return e.map((v) => v / z); };
      const bw = 720 / tok.length, cx = (i) => bw * (i + 0.5), ty = 210;
      const draw = () => {
        svg.innerHTML = ""; const w = weights(), mx = Math.max(...w);
        tok.forEach((t, j) => { if (j !== q) { const mid = (cx(q) + cx(j)) / 2, lift = 30 + Math.abs(q - j) * 16; S("path", { d: `M${cx(q)},${ty - 16} Q${mid},${ty - 16 - lift * 1.6} ${cx(j)},${ty - 16}`, fill: "none", stroke: K.pink, "stroke-width": 0.6 + w[j] * 22, opacity: 0.15 + (w[j] / mx) * 0.8, "stroke-linecap": "round" }, svg); }
          S("rect", { x: cx(j) - bw / 2 + 3, y: ty - 16, width: bw - 6, height: 32, rx: 8, fill: j === q ? K.ink : "var(--paper)", stroke: j === q ? K.ink : K.rule, "stroke-width": 1.5, "data-j": j, style: "cursor:pointer" }, svg);
          T(svg, cx(j), ty + 5, t, { "text-anchor": "middle", "font-size": 13, "font-weight": 700, fill: j === q ? "var(--on-ink)" : K.ink, style: "pointer-events:none" });
          const bh = (w[j] / Math.max(0.5, mx)) * 60; S("rect", { x: cx(j) - 14, y: ty + 28, width: 28, height: bh, rx: 4, fill: j === q ? K.mute : K.pink, opacity: 0.85 }, svg);
          T(svg, cx(j), ty + 42 + bh, (w[j] * 100).toFixed(0) + "%", { "text-anchor": "middle", "font-size": 11, "font-weight": 700, fill: K.ink2 }); });
        const top = w.map((v, j) => [v, j]).filter((p) => p[1] !== q).sort((a, b) => b[0] - a[0]).slice(0, 3), H = -w.reduce((a, v) => a + v * Math.log2(v), 0);
        chips(read, [["query", "“" + tok[q] + "”", K.pink], ["attends most to", top.map(([v, j]) => `${tok[j]} ${(v * 100).toFixed(0)}%`).join(" · ")], ["entropy", H.toFixed(2) + " bits"]], "Weights are softmax(score ÷ temperature) and always sum to 100%. The scores here are hand-set to illustrate the mechanism; a real model learns them.");
      };
      svg.addEventListener("click", (e) => { const j = e.target.dataset && e.target.dataset.j; if (j !== undefined) { q = +j; draw(); } });
      slider(ctl, "Softmax temperature", 0.3, 3, 0.1, temp, (v) => { temp = v; draw(); }, (v) => v.toFixed(1));
      draw();
    } };

  /* ============ sampling temperature ============ */
  D.temperature = { title: "Temperature and top-k sampling", blurb: "A model's next-token distribution for “The cat sat on the ___”. Reshape it with temperature, truncate it with top-k, then sample.", skills: ["ai.llm"],
    tasks: ["At temperature 0.1, sample 100 times. How many distinct tokens appear?", "At temperature 2.5, how likely is “moon”? Now set top-k to 3 and sample again.", "Find settings where the top token has almost exactly 50% probability."],
    mount(host) {
      const { ctl, svg, read } = frame(host, 720, 320); const tok = ["mat", "sofa", "floor", "roof", "table", "moon", "keyboard"], logit = [3.2, 2.4, 2.0, 1.1, 0.6, -0.5, -1.2]; let temp = 1, topk = 7, cnt = tok.map(() => 0), last = -1;
      const rows = tok.map((t, i) => { const y = 24 + i * 40; T(svg, 96, y + 19, t, { "text-anchor": "end", "font-size": 15, "font-weight": 700, fill: K.ink }); S("rect", { x: 110, y: y, width: 480, height: 28, rx: 6, fill: K.card }, svg);
        return { bar: S("rect", { x: 110, y: y, width: 0, height: 28, rx: 6, fill: K.pink, style: "transition:width .45s cubic-bezier(.22,.9,.24,1),fill .3s" }, svg), pct: T(svg, 600, y + 19, "", { "font-size": 14, "font-weight": 700, fill: K.ink }), n: T(svg, 712, y + 19, "", { "text-anchor": "end", "font-size": 12, fill: K.mute }) }; });
      const probs = () => { const e = logit.map((l, i) => (i < topk ? Math.exp(l / temp) : 0)), z = e.reduce((a, b) => a + b); return e.map((v) => v / z); };
      const draw = () => { const p = probs(), n = cnt.reduce((a, b) => a + b);
        rows.forEach((r, i) => { r.bar.style.width = p[i] * 480 + "px"; r.bar.setAttribute("fill", i === last ? K.or : i < topk ? K.pink : K.rule); r.pct.textContent = (p[i] * 100).toFixed(1) + "%"; r.n.textContent = n ? `sampled ${cnt[i]}` : ""; });
        const H = -p.reduce((a, v) => a + (v ? v * Math.log2(v) : 0), 0);
        chips(read, [["P(top token)", (p[0] * 100).toFixed(1) + "%", K.pink], ["entropy", H.toFixed(2) + " bits"], ["candidates", topk], ["samples drawn", n], ["distinct tokens sampled", cnt.filter((c) => c).length]], "Probabilities = softmax(logit ÷ temperature) over the top-k tokens. Low temperature concentrates mass; high temperature spreads it.");
      };
      const sample = (n) => { const p = probs(); for (let s = 0; s < n; s++) { let u = Math.random(), i = 0; while (u > p[i] && i < 6) u -= p[i++]; cnt[i]++; last = i; } draw(); };
      const clr = () => { cnt = tok.map(() => 0); last = -1; };
      slider(ctl, "Temperature", 0.1, 2.5, 0.1, temp, (v) => { temp = v; clr(); draw(); }, (v) => v.toFixed(1));
      slider(ctl, "Top-k", 1, 7, 1, topk, (v) => { topk = v; clr(); draw(); });
      button(ctl, "Sample 1", () => sample(1), true); button(ctl, "Sample 100", () => sample(100)); button(ctl, "Clear", () => { clr(); draw(); });
      draw();
    } };
})();
