/* Gradient — interactive motion diagrams, part C: agentic AI. Uses the toolkit from diagrams-a (GR.dg). */
(function () {
  const { S, T, K, frame, slider, select, chips, sc, line, axis } = GR.dg;
  const D = GR.diagrams;

  /* ============ agent reliability and cost ============ */
  D.agentloop = { title: "Agent reliability and cost", blurb: "Small per-step error rates compound over long runs, and every step re-sends a growing context. Tune the agent and watch success and cost move.", skills: ["ag.loop", "ag.ops"],
    tasks: ["With p = 0.95, how many steps can the agent take before its chance of a clean run drops below 50%?", "Turn on verify-and-retry. How much does success improve at 30 steps, and what happens to cost?", "Turn on prompt caching at 40 steps. Which part of the cost does it remove, and which part keeps growing?"],
    mount(host) {
      const { ctl, svg, read } = frame(host, 720, 340);
      const SYS = 4000, PER = 1200, PRICE = 3, MAXN = 50;
      let p = 0.95, n = 20, mode = "none", cache = "off";
      const eff = () => (mode === "retry" ? 1 - (1 - p) ** 2 : p);
      /* expected input tokens billed for a run of k steps; retries re-send the context of the failed step */
      const cost = (k, m = mode, c = cache) => { let tok = 0; for (let t = 0; t < k; t++) { const calls = 1 + (m === "retry" ? 1 - p : 0), pre = c === "on" && t > 0 ? SYS * 0.1 : SYS; tok += calls * (pre + PER * t); } return (tok / 1e6) * PRICE; };
      slider(ctl, "Per-step success p", 0.8, 0.999, 0.001, p, (v) => { p = v; draw(); }, (v) => v.toFixed(3));
      slider(ctl, "Steps in the run", 1, MAXN, 1, n, (v) => { n = v; draw(); });
      select(ctl, "Recovery", [["none", "None"], ["retry", "Verify each step, retry once"]], (v) => { mode = v; draw(); });
      select(ctl, "Prompt caching", [["off", "Off"], ["on", "On (prefix at 10%)"]], (v) => { cache = v; draw(); });
      const draw = () => {
        svg.innerHTML = "";
        /* left: success probability */
        const g1 = S("g", {}, svg), x1 = sc(1, MAXN, 56, 330), y1 = sc(0, 1, 290, 56);
        axis(g1, x1, y1, [1, 10, 20, 30, 40, 50], [0, 0.25, 0.5, 0.75, 1], "steps", "P(run succeeds)");
        S("line", { x1: x1.r0, x2: x1.r1, y1: y1(0.5), y2: y1(0.5), stroke: K.mute, "stroke-dasharray": "3 4" }, g1);
        const curve = (q) => line(Array.from({ length: MAXN }, (_, i) => [x1(i + 1), y1(q ** (i + 1))]));
        if (mode === "retry") S("path", { d: curve(p), fill: "none", stroke: K.mute, "stroke-width": 2, "stroke-dasharray": "5 5" }, g1);
        S("path", { d: curve(eff()), fill: "none", stroke: K.or, "stroke-width": 3 }, g1);
        const sN = eff() ** n;
        S("line", { x1: x1(n), x2: x1(n), y1: y1(0), y2: y1(sN), stroke: K.or, "stroke-width": 1, opacity: 0.5 }, g1);
        S("circle", { cx: x1(n), cy: y1(sN), r: 7, fill: K.or, stroke: "var(--paper)", "stroke-width": 2 }, g1);
        T(g1, x1.r0 - 40, 18, "Chance of a clean run", { "font-size": 13, "font-weight": 700, fill: K.ink });
        /* right: expected cost */
        const top = Math.max(cost(MAXN, "retry", "off"), 0.01), g2 = S("g", {}, svg), x2 = sc(1, MAXN, 420, 700), y2 = sc(0, top, 290, 56);
        const yt = [0, top / 4, top / 2, (3 * top) / 4, top].map((v) => +v.toFixed(2));
        axis(g2, x2, y2, [1, 10, 20, 30, 40, 50], yt, "steps", "input cost ($)");
        const cpath = (m, c) => line(Array.from({ length: MAXN }, (_, i) => [x2(i + 1), y2(cost(i + 1, m, c))]));
        S("path", { d: cpath("none", "off"), fill: "none", stroke: K.mute, "stroke-width": 2, "stroke-dasharray": "5 5" }, g2);
        S("path", { d: cpath(mode, cache), fill: "none", stroke: K.navy, "stroke-width": 3 }, g2);
        const cN = cost(n);
        S("circle", { cx: x2(n), cy: y2(cN), r: 7, fill: K.navy, stroke: "var(--paper)", "stroke-width": 2 }, g2);
        T(g2, x2.r0 - 40, 18, "Expected input cost per run", { "font-size": 13, "font-weight": 700, fill: K.ink });
        const half = Math.floor(Math.log(0.5) / Math.log(eff()));
        chips(read, [["clean run at " + n + " steps", (sN * 100).toFixed(1) + "%", K.or], ["steps before < 50%", half >= 1 ? half : "under 1"], ["expected cost", "$" + cN.toFixed(3), K.navy], ["cost per successful run", sN > 0.001 ? "$" + (cN / sN).toFixed(3) : "–"]],
          `Each call re-sends a ${SYS.toLocaleString("en-US")}-token prefix plus ${PER.toLocaleString("en-US")} tokens of history per earlier step, at $${PRICE} per million input tokens. The dashed lines show the baseline with no recovery and no caching. Verify-and-retry assumes failures are detected; real checks catch fewer.`);
      };
      draw();
    } };
})();
