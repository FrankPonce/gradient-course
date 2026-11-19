/* Gradient — concept animations for lessons: self-running, looping SVG explainers with a caption.
   GR.anim(host, id, opts) mounts one; it stops itself when the host leaves the page. */
(function () {
  const NS = "http://www.w3.org/2000/svg", W = 640;
  const el = (t, a = {}, p, txt) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (txt !== undefined) e.textContent = txt; if (p) p.appendChild(e); return e; };
  const reduced = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = (v) => (v >= 1e9 ? (v / 1e9).toFixed(1) + " billion" : v >= 1e6 ? (v / 1e6).toFixed(1) + " million" : Math.round(v).toLocaleString("en-US"));
  const C = { ink: "var(--ink)", mute: "var(--mute)", rule: "var(--rule)", or: "var(--or)", gold: "#C9933A", navy: "var(--navy)", green: "var(--green)", pink: "var(--pink)", blue: "var(--blue)", bad: "var(--bad)" };

  /* a loop helper: step(t) is called each frame with t in [0, 1); a pause sits at the end of each cycle */
  const loop = (host, ms, step, hold = 1800) => { let t0 = null, raf = 0;
    const tick = (now) => { if (!host.isConnected) return cancelAnimationFrame(raf); if (t0 === null) t0 = now; const e = now - t0; if (e >= ms + hold) t0 = now; step(Math.min(1, e / ms)); raf = requestAnimationFrame(tick); };
    if (reduced()) step(1); else raf = requestAnimationFrame(tick); };
  const frame = (host, h) => { host.innerHTML = `<div class="anim"><svg viewBox="0 0 ${W} ${h}" role="img"></svg><p class="anim-cap"></p></div>`; return { svg: host.querySelector("svg"), cap: host.querySelector(".anim-cap") }; };

  const A = {};
  /* Big-O growth: six curves race as n grows; the y-axis rescales to the biggest curve still on screen */
  A.growth = (host) => {
    const { svg, cap } = frame(host, 300), x0 = 52, x1 = 520, y0 = 262, y1 = 18, N = 40;
    const F = [["O(1)", () => 1, C.green], ["O(log n)", (n) => Math.log2(n), C.blue], ["O(n)", (n) => n, C.navy], ["O(n log n)", (n) => n * Math.log2(n), C.gold], ["O(n²)", (n) => n * n, C.or], ["O(2ⁿ)", (n) => 2 ** n, C.bad]];
    el("line", { x1: x0, x2: x1, y1: y0, y2: y0, stroke: C.mute }, svg); el("line", { x1: x0, x2: x0, y1: y0, y2: y1, stroke: C.mute }, svg);
    el("text", { x: x1, y: y0 + 22, "text-anchor": "end", "font-size": 12, fill: C.mute }, svg, "input size n →"); el("text", { x: x0 - 8, y: y1 + 4, "text-anchor": "end", "font-size": 12, fill: C.mute }, svg, "steps");
    const paths = F.map(([l, , c]) => ({ p: el("path", { fill: "none", stroke: c, "stroke-width": 3, "stroke-linecap": "round" }, svg), t: el("text", { "font-size": 13, "font-weight": 700, fill: c }, svg, l) }));
    const ymaxT = el("text", { x: x0 + 6, y: y1 + 14, "font-size": 11, fill: C.mute }, svg);
    loop(host, 7000, (k) => { const n = Math.max(2, 2 + k * (N - 2)), cap0 = 4 * n * n, ymax = Math.max(n * Math.log2(n), cap0);
      const X = (v) => x0 + ((v - 1) / (N - 1)) * (x1 - x0), Y = (v) => y0 - Math.min(1, v / ymax) * (y0 - y1);
      F.forEach(([, f], i) => { let d = ""; for (let v = 1; v <= n; v += 0.25) d += `${d ? "L" : "M"}${X(v).toFixed(1)},${Y(f(v)).toFixed(1)}`; paths[i].p.setAttribute("d", d); const yy = Y(f(n)); paths[i].t.setAttribute("x", X(n) + 8); paths[i].t.setAttribute("y", Math.max(y1 + 10, yy + 4) + (i === 5 && f(n) > ymax ? 0 : 0)); });
      ymaxT.textContent = `top of chart = ${fmt(ymax)} steps`;
      const m = Math.round(n); cap.innerHTML = `n = <b>${m}</b> · O(n) = ${fmt(m)} · O(n²) = ${fmt(m * m)} · O(2ⁿ) = <b class="bad">${fmt(2 ** m)}</b>`; });
  };
  /* drop the constants: 3n + 5 against n and n²; the ratio to n settles at 3 while n² keeps pulling away */
  A.constants = (host) => {
    const { svg, cap } = frame(host, 280), x0 = 52, x1 = 560, y0 = 240, y1 = 20, N = 60;
    el("line", { x1: x0, x2: x1, y1: y0, y2: y0, stroke: C.mute }, svg); el("line", { x1: x0, x2: x0, y1: y0, y2: y1, stroke: C.mute }, svg);
    const L = [["3n + 5", (n) => 3 * n + 5, C.or], ["n", (n) => n, C.navy], ["n²", (n) => n * n, C.bad]].map(([l, f, c]) => ({ f, p: el("path", { fill: "none", stroke: c, "stroke-width": 3 }, svg), t: el("text", { "font-size": 13, "font-weight": 700, fill: c }, svg, l) }));
    loop(host, 6000, (k) => { const n = 1 + k * (N - 1), ymax = Math.max(3 * n + 5, Math.min(n * n, 12 * n)) * 1.1, X = (v) => x0 + ((v - 1) / (N - 1)) * (x1 - x0), Y = (v) => y0 - Math.min(1, v / ymax) * (y0 - y1);
      L.forEach((o) => { let d = ""; for (let v = 1; v <= n; v += 0.5) d += `${d ? "L" : "M"}${X(v).toFixed(1)},${Y(o.f(v)).toFixed(1)}`; o.p.setAttribute("d", d); o.t.setAttribute("x", Math.min(X(n) + 6, x1 - 30)); o.t.setAttribute("y", Math.max(y1 + 12, Y(o.f(n)) - 6)); });
      cap.innerHTML = `n = <b>${Math.round(n)}</b> · (3n + 5) ÷ n = <b>${((3 * n + 5) / n).toFixed(2)}</b>, settling at 3: a constant, so it's still <b>O(n)</b> · n² ÷ n = <b class="bad">${Math.round(n)}</b> and climbing`; });
  };
  /* one loop vs a loop inside a loop: n cells vs an n × n grid filling up */
  A.nested = (host) => {
    const { svg, cap } = frame(host, 300), n = 10, cs = 22, gx = 330, gy = 40;
    el("text", { x: 20, y: 24, "font-size": 13, "font-weight": 700, fill: C.navy }, svg, "for x in nums:  (n steps)"); el("text", { x: gx, y: 24, "font-size": 13, "font-weight": 700, fill: C.or }, svg, "for i … for j …  (n × n steps)");
    const row = Array.from({ length: n }, (_, i) => el("rect", { x: 20 + i * (cs + 3), y: 40, width: cs, height: cs, rx: 4, fill: "var(--card)", stroke: C.rule }, svg));
    const grid = Array.from({ length: n * n }, (_, i) => el("rect", { x: gx + (i % n) * (cs + 3), y: gy + Math.floor(i / n) * (cs + 3), width: cs, height: cs, rx: 4, fill: "var(--card)", stroke: C.rule }, svg));
    loop(host, 6500, (k) => { const g = Math.floor(k * n * n), r = Math.min(n, Math.floor(k * n * n));
      row.forEach((c, i) => c.setAttribute("fill", i < r ? C.navy : "var(--card)")); grid.forEach((c, i) => c.setAttribute("fill", i < g ? C.or : "var(--card)"));
      cap.innerHTML = `Same n = ${n}. One loop: <b>${r}</b> / ${n} steps. Nested loops: <b class="bad">${g}</b> / ${n * n} steps. Double n and the grid quadruples.`; }, 2200);
  };
  /* halving: a range of 64 cells shrinks by half each step; log₂ 64 = 6 */
  A.halving = (host) => {
    const { svg, cap } = frame(host, 150), n = 64, cw = 8.6, x0 = 26;
    const cells = Array.from({ length: n }, (_, i) => el("rect", { x: x0 + i * cw, y: 40, width: cw - 1.4, height: 40, rx: 1.5, fill: C.or }, svg));
    const lab = el("text", { x: x0, y: 112, "font-size": 13, fill: C.mute }, svg);
    loop(host, 6000, (k) => { const s = Math.min(6, Math.floor(k * 7)), lo = 0, hi = n >> s; cells.forEach((c, i) => c.setAttribute("fill", i >= lo && i < hi ? C.or : "var(--card)")); lab.textContent = `step ${s}: ${hi} left`;
      cap.innerHTML = s < 6 ? `Each step throws away half: 64 → 32 → 16 → 8 → 4 → 2 → 1. That's <b>log₂ 64 = 6</b> steps.` : `Done in <b>6</b> steps. A billion items would take only <b>30</b>. That's <b>O(log n)</b>.`; });
  };
  /* hashing: a key goes through the hash function straight to its bucket, while a list scan walks every slot */
  A.hashing = (host) => {
    const { svg, cap } = frame(host, 260), keys = ["ana", "bo", "cy", "di", "eve", "fay"], B = 6, bx = 360;
    el("text", { x: 20, y: 22, "font-size": 13, "font-weight": 700, fill: C.navy }, svg, "list: check one by one"); el("text", { x: bx, y: 22, "font-size": 13, "font-weight": 700, fill: C.or }, svg, "hash map: jump to the bucket");
    const list = keys.map((k, i) => { const r = el("rect", { x: 20, y: 36 + i * 34, width: 120, height: 28, rx: 5, fill: "var(--card)", stroke: C.rule }, svg); el("text", { x: 34, y: 55 + i * 34, "font-size": 13, fill: C.ink, "font-family": "JetBrains Mono, monospace" }, svg, k); return r; });
    const buckets = Array.from({ length: B }, (_, i) => { const r = el("rect", { x: bx + 150, y: 36 + i * 34, width: 110, height: 28, rx: 5, fill: "var(--card)", stroke: C.rule }, svg); el("text", { x: bx + 140, y: 55 + i * 34, "font-size": 11, fill: C.mute, "text-anchor": "end" }, svg, String(i)); return r; });
    const hb = el("rect", { x: bx, y: 100, width: 96, height: 40, rx: 6, fill: "none", stroke: C.or, "stroke-width": 2 }, svg); el("text", { x: bx + 48, y: 125, "font-size": 12, fill: C.or, "text-anchor": "middle", "font-weight": 700 }, svg, "hash(key)");
    const arrow = el("path", { fill: "none", stroke: C.or, "stroke-width": 2.5 }, svg), hit = (k) => [...k].reduce((a, c) => a + c.charCodeAt(0), 0) % B;
    loop(host, 5200, (k) => { const want = "eve", scan = Math.min(keys.length, Math.floor(k * 1.4 * keys.length)), found = keys.indexOf(want);
      list.forEach((r, i) => r.setAttribute("fill", i < scan ? (i === found ? C.green : "color-mix(in srgb, var(--navy) 30%, var(--card))") : "var(--card)"));
      const b = hit(want); buckets.forEach((r, i) => r.setAttribute("fill", i === b && k > 0.2 ? C.green : "var(--card)")); arrow.setAttribute("d", k > 0.1 ? `M${bx + 96} 120 C ${bx + 125} 120, ${bx + 125} ${50 + b * 34}, ${bx + 150} ${50 + b * 34}` : "");
      cap.innerHTML = `Looking for "${want}". The list needed <b>${Math.min(scan, found + 1)}</b> checks (O(n)); the hash map needed <b>1</b> (O(1) on average).`; });
  };

  GR.anims = A;
  GR.anim = (host, id) => { if (A[id]) A[id](host); };
})();
