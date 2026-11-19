/* Gradient — algorithm visualizers for the LeetCode track.
   One step-through player (frames + renderer + code panel) and a generator per pattern.
   A frame describes what to draw at one step:
     { line, note, arrs:[{name, vals, hl:{i:tone}, ptr:{label:i}, dim:[i], link:{from,to}}], vars:[[k,v,tone]],
       panels:[{name, items, hl:[i], top:true}], grid:{cells, hl:{"r,c":tone}, rl, cl}, tree:{nodes:[{id,label,x,d,tone,sub}], edges:[[a,b,tone]]},
       graph:{nodes:[{id,label,x,y,tone,sub}], edges:[[a,b,{tone,label,dir}]], h}, bars:{items:[{s,e,tone,label,row}], lo, hi} } */
(function () {
  const { K } = GR.dg, NS = "http://www.w3.org/2000/svg", E = GR.esc, W = 720;
  const TONE = { cur: K.or, ok: K.green, bad: "var(--bad)", win: K.navy, alt: K.pink, done: K.mute, gold: "#C9933A" };
  const tone = (t) => TONE[t] || t || K.rule;
  const mk = (t, a = {}, p, txt) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (txt !== undefined) e.textContent = txt; if (p) p.appendChild(e); return e; };
  const PTRC = [K.or, K.navy, K.pink, K.green, "#C9933A"];

  /* ---------- layout + drawing ---------- */
  const blocks = (f) => {
    const out = [];
    (f.arrs || []).forEach((a) => out.push({ k: "arr", a, h: (a.name ? 18 : 0) + 34 + 40 + 18 + (a.link ? 26 : 0) }));
    if (f.bars) out.push({ k: "bars", b: f.bars, h: 34 + (Math.max(0, ...f.bars.items.map((x) => x.row || 0)) + 1) * 30 });
    if (f.grid) { const rows = f.grid.cells.length, cols = f.grid.cells[0].length, cs = Math.min(42, (W - 80) / cols); out.push({ k: "grid", g: f.grid, cs, h: (f.grid.cl ? 22 : 0) + rows * cs + 14 }); }
    if (f.tree) { const md = Math.max(0, ...f.tree.nodes.map((n) => n.d)); out.push({ k: "tree", t: f.tree, h: 30 + md * (f.tree.dy || 62) + 40 }); }
    if (f.graph) out.push({ k: "graph", g: f.graph, h: f.graph.h || 260 });
    return out;
  };
  const measure = (f) => blocks(f).reduce((a, b) => a + b.h + 10, 10);
  const cellFill = (t) => (t ? `color-mix(in srgb, ${tone(t)} 26%, var(--paper))` : "var(--paper)");
  const draw = (svg, f, H) => {
    svg.innerHTML = ""; svg.setAttribute("viewBox", `0 0 ${W} ${H}`); let y = 10;
    mk("defs", {}, svg).innerHTML = `<marker id="avh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${K.mute}"/></marker>`;
    blocks(f).forEach((b) => {
      const g = mk("g", { transform: `translate(0 ${y})` }, svg);
      if (b.k === "arr") {
        const a = b.a, n = a.vals.length, cw = Math.min(56, (W - 40) / Math.max(1, n)), x0 = (W - cw * n) / 2; let yy = 0;
        if (a.name) { mk("text", { x: x0, y: 12, "font-size": 12, "font-weight": 700, fill: K.mute }, g, a.name); yy = 18; }
        const stack = {}; Object.entries(a.ptr || {}).forEach(([lab, i], k) => { if (i === null || i === undefined || i < 0 || i > n) return; const lvl = (stack[i] = (stack[i] || 0) + 1) - 1, cx = x0 + cw * Math.min(i, n - 0.5) + (i >= n ? 0 : cw / 2), c = PTRC[k % PTRC.length];
          mk("text", { x: cx, y: yy + 12 - lvl * 0 + (lvl ? -0 : 0), "font-size": 12, "font-weight": 800, fill: c, "text-anchor": "middle", transform: lvl ? `translate(${(lvl % 2 ? 1 : -1) * 14} 0)` : "" }, g, lab); mk("path", { d: `M${cx} ${yy + 16}L${cx} ${yy + 30}`, stroke: c, "stroke-width": 2, "marker-end": "url(#avh)" }, g); });
        yy += 34;
        a.vals.forEach((v, i) => { const t = (a.hl || {})[i], dim = (a.dim || []).includes(i), x = x0 + i * cw;
          mk("rect", { x: x + 2, y: yy, width: cw - 4, height: 38, rx: 7, fill: cellFill(t), stroke: t ? tone(t) : K.rule, "stroke-width": t ? 2 : 1, opacity: dim ? 0.32 : 1 }, g);
          const s = String(v === null || v === undefined ? "·" : v); mk("text", { x: x + cw / 2, y: yy + 24, "font-size": s.length > 4 ? 10 : s.length > 2 ? 12 : 15, "font-weight": 700, fill: K.ink, "text-anchor": "middle", opacity: dim ? 0.4 : 1 }, g, s);
          if (!a.noidx) mk("text", { x: x + cw / 2, y: yy + 52, "font-size": 10, fill: K.mute, "text-anchor": "middle" }, g, String(i)); });
        if (a.link && a.link.to >= 0) { const xf = x0 + a.link.from * cw + cw / 2, xt = x0 + a.link.to * cw + cw / 2, yl = yy + 58; mk("path", { d: `M${xf} ${yy + 40}C${xf} ${yl + 16} ${xt} ${yl + 16} ${xt} ${yy + 44}`, fill: "none", stroke: K.mute, "stroke-width": 1.6, "stroke-dasharray": "4 3", "marker-end": "url(#avh)" }, g); }
        if (a.arrows) for (let i = 0; i < n - 1; i++) mk("path", { d: `M${x0 + i * cw + cw - 3} ${yy + 19}L${x0 + (i + 1) * cw + 5} ${yy + 19}`, stroke: K.mute, "stroke-width": 1.4, "marker-end": "url(#avh)" }, g);
      } else if (b.k === "bars") {
        const { items, lo, hi } = b.b, x = (v) => 40 + ((v - lo) / (hi - lo || 1)) * (W - 80);
        for (let v = lo; v <= hi; v++) { mk("line", { x1: x(v), x2: x(v), y1: 0, y2: b.h - 18, stroke: K.rule, "stroke-dasharray": "2 4" }, g); mk("text", { x: x(v), y: b.h - 4, "font-size": 10, fill: K.mute, "text-anchor": "middle" }, g, String(v)); }
        items.forEach((it) => { const yy = 4 + (it.row || 0) * 30; mk("rect", { x: x(it.s), y: yy, width: Math.max(4, x(it.e) - x(it.s)), height: 22, rx: 6, fill: cellFill(it.tone || "win"), stroke: tone(it.tone || "win"), "stroke-width": 1.6 }, g); mk("text", { x: (x(it.s) + x(it.e)) / 2, y: yy + 15, "font-size": 11, "font-weight": 700, fill: K.ink, "text-anchor": "middle" }, g, it.label || `[${it.s},${it.e}]`); });
      } else if (b.k === "grid") {
        const { cells, hl = {}, rl, cl } = b.g, cs = b.cs, cols = cells[0].length, x0 = (W - cs * cols) / 2 + (rl ? 14 : 0), y0 = cl ? 22 : 0;
        if (cl) cl.forEach((t, c) => mk("text", { x: x0 + c * cs + cs / 2, y: 14, "font-size": 12, "font-weight": 700, fill: K.mute, "text-anchor": "middle" }, g, t));
        cells.forEach((row, r) => { if (rl) mk("text", { x: x0 - 10, y: y0 + r * cs + cs / 2 + 4, "font-size": 12, "font-weight": 700, fill: K.mute, "text-anchor": "end" }, g, rl[r]);
          row.forEach((v, c) => { const t = hl[r + "," + c], wall = v === "#"; mk("rect", { x: x0 + c * cs + 1, y: y0 + r * cs + 1, width: cs - 2, height: cs - 2, rx: 5, fill: wall ? "color-mix(in srgb, var(--mute) 30%, var(--bg))" : cellFill(t), stroke: wall ? "transparent" : t ? tone(t) : K.rule, "stroke-width": t ? 2 : 1 }, g);
            if (!wall && v !== "" && v !== null && v !== undefined) mk("text", { x: x0 + c * cs + cs / 2, y: y0 + r * cs + cs / 2 + 4, "font-size": cs < 30 ? 10 : 12.5, "font-weight": 700, fill: K.ink, "text-anchor": "middle" }, g, String(v)); }); });
      } else {
        const T = b.k === "tree" ? b.t : b.g, isT = b.k === "tree", dy = (isT && T.dy) || 62, pos = {}, r = T.r || 17;
        T.nodes.forEach((n) => (pos[n.id] = isT ? [40 + n.x * (W - 80), 22 + n.d * dy] : [30 + n.x * (W - 60), 24 + n.y * (b.h - 48)]));
        (T.edges || []).forEach(([a, c, o = {}]) => { if (!pos[a] || !pos[c]) return; const [x1, y1] = pos[a], [x2, y2] = pos[c], d = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / d, uy = (y2 - y1) / d, ot = typeof o === "string" ? { tone: o } : o;
          mk("line", { x1: x1 + ux * r, y1: y1 + uy * r, x2: x2 - ux * (r + (ot.dir ? 2 : 0)), y2: y2 - uy * (r + (ot.dir ? 2 : 0)), stroke: ot.tone ? tone(ot.tone) : K.rule, "stroke-width": ot.tone ? 2.6 : 1.6, "marker-end": ot.dir ? "url(#avh)" : "" }, g);
          if (ot.label !== undefined) { const mx = (x1 + x2) / 2 - uy * 10, my = (y1 + y2) / 2 + ux * 10; mk("rect", { x: mx - 11, y: my - 9, width: 22, height: 17, rx: 4, fill: "var(--bg)" }, g); mk("text", { x: mx, y: my + 4, "font-size": 11, "font-weight": 700, fill: K.ink2, "text-anchor": "middle" }, g, String(ot.label)); } });
        T.nodes.forEach((n) => { const [x, yy] = pos[n.id]; mk("circle", { cx: x, cy: yy, r, fill: cellFill(n.tone), stroke: n.tone ? tone(n.tone) : K.mute, "stroke-width": n.tone ? 2.4 : 1.4 }, g);
          const s = String(n.label); mk("text", { x, y: yy + 4, "font-size": s.length > 3 ? 9.5 : 12.5, "font-weight": 800, fill: K.ink, "text-anchor": "middle" }, g, s);
          if (n.sub !== undefined && n.sub !== "") mk("text", { x, y: yy + r + 13, "font-size": 10.5, "font-weight": 700, fill: n.subTone ? tone(n.subTone) : K.or, "text-anchor": "middle" }, g, String(n.sub)); });
      }
      y += b.h + 10;
    });
  };

  /* ---------- the player ---------- */
  const player = (host, def, opts = {}) => {
    host.innerHTML = `<div class="av${opts.compact ? " compact" : ""}${opts.code ? " withcode" : ""}"><div class="av-in"></div><div class="av-main"><svg class="dg-svg av-svg" role="img"></svg><pre class="av-code"></pre></div>
      <div class="av-note"></div><div class="av-state"></div>
      <div class="av-ctl"><button class="btn sm" data-k="first" title="First step">⏮</button><button class="btn sm" data-k="prev" title="Previous step (←)">◀</button><button class="btn sm primary" data-k="play">Play</button><button class="btn sm" data-k="next" title="Next step (→)">▶</button><button class="btn sm" data-k="last" title="Last step">⏭</button>
        <input type="range" class="av-scrub" min="0" value="0"><span class="av-step"></span><label class="av-spd">speed <input type="range" min="1" max="5" value="3"></label></div></div>`;
    const $ = (s) => host.querySelector(s), svg = $(".av-svg"), code = $(".av-code"), inBox = $(".av-in");
    let frames = [], i = 0, H = 200, timer = null, inp = {};
    const fields = (def.inputs || []).map((f) => { const w = document.createElement("label"); w.className = "av-f"; w.innerHTML = `<span>${E(f.label)}</span>`;
      const el = f.options ? Object.assign(document.createElement("select"), { innerHTML: f.options.map(([v, l]) => `<option value="${E(v)}">${E(l)}</option>`).join("") }) : Object.assign(document.createElement("input"), { type: "text", spellcheck: false });
      el.value = opts.input && opts.input[f.k] !== undefined ? opts.input[f.k] : f.value; if (f.w) el.style.width = f.w + "px"; w.appendChild(el); inBox.appendChild(w); return [f, el]; });
    const runB = Object.assign(document.createElement("button"), { className: "btn sm primary", textContent: "Visualize" }), rndB = Object.assign(document.createElement("button"), { className: "btn sm", textContent: "Random input" });
    if (fields.length) { inBox.append(runB); if (def.random) inBox.append(rndB); }
    const err = document.createElement("span"); err.className = "av-err"; inBox.append(err);
    code.innerHTML = def.code.map((l, k) => `<span data-l="${k}">${E(l) || " "}</span>`).join("");
    const show = () => { const f = frames[i]; if (!f) return; draw(svg, f, H); code.querySelectorAll("span").forEach((s) => s.classList.toggle("on", +s.dataset.l === f.line));
      $(".av-note").innerHTML = f.note || ""; $(".av-step").textContent = `Step ${i + 1} / ${frames.length}`; $(".av-scrub").max = frames.length - 1; $(".av-scrub").value = i;
      $(".av-state").innerHTML = (f.vars || []).map(([k, v, t]) => `<span class="chip"><i>${E(k)}</i><b${t ? ` style="color:${tone(t)}"` : ""}>${E(String(v))}</b></span>`).join("") +
        (f.panels || []).map((p) => `<div class="av-panel"><span class="cap">${E(p.name)}${p.top ? " · top →" : ""}</span><div>${p.items.length ? p.items.map((it, k) => `<b class="${(p.hl || []).includes(k) ? "on" : ""}">${E(String(it))}</b>`).join("") : `<em>empty</em>`}</div></div>`).join(""); };
    const stop = () => { clearTimeout(timer); timer = null; $("[data-k=play]").textContent = "Play"; };
    const delay = () => [0, 1500, 1000, 650, 380, 180][+$(".av-spd input").value];
    const tick = () => { if (!host.isConnected) return stop(); if (i >= frames.length - 1) { if (!opts.auto) return stop(); timer = setTimeout(() => { if (!host.isConnected) return stop(); i = 0; show(); timer = setTimeout(tick, delay()); }, 2600); return; } i++; show(); timer = setTimeout(tick, delay()); };
    const build = () => { stop(); err.textContent = "";
      fields.forEach(([f, el]) => (inp[f.k] = el.value));
      try { frames = def.frames(inp); } catch (e) { err.textContent = e.message; return; }
      if (!frames.length) { err.textContent = "Nothing to show for that input."; return; }
      H = Math.max(...frames.map(measure)); svg.style.aspectRatio = `${W} / ${H}`; i = 0; show();
      if (opts.auto) { $("[data-k=play]").textContent = "Pause"; timer = setTimeout(tick, delay() + 600); } };
    host.querySelector(".av-ctl").addEventListener("click", (e) => { const k = e.target.closest("[data-k]"); if (!k) return; const c = k.dataset.k;
      if (c === "play") { if (timer) stop(); else { if (i >= frames.length - 1) i = 0; k.textContent = "Pause"; show(); timer = setTimeout(tick, delay()); } return; }
      stop(); i = c === "first" ? 0 : c === "last" ? frames.length - 1 : c === "prev" ? Math.max(0, i - 1) : Math.min(frames.length - 1, i + 1); show(); });
    $(".av-scrub").addEventListener("input", (e) => { stop(); i = +e.target.value; show(); });
    host.tabIndex = 0; host.addEventListener("keydown", (e) => { if (e.target.tagName === "INPUT" && e.target.type === "text") return; if (e.key === "ArrowRight") { e.preventDefault(); stop(); i = Math.min(frames.length - 1, i + 1); show(); } else if (e.key === "ArrowLeft") { e.preventDefault(); stop(); i = Math.max(0, i - 1); show(); } });
    runB.addEventListener("click", build); fields.forEach(([, el]) => el.addEventListener("keydown", (e) => { if (e.key === "Enter") build(); }));
    rndB.addEventListener("click", () => { const v = def.random(GR.rng(Date.now() & 0x7fffffff)); fields.forEach(([f, el]) => { if (v[f.k] !== undefined) el.value = v[f.k]; }); build(); });
    if (opts.speed) $(".av-spd input").value = opts.speed;
    build();
  };

  /* ---------- input helpers ---------- */
  const nums = (s, lo = 1, hi = 16, name = "array") => { const a = String(s).split(/[\s,]+/).filter(Boolean).map(Number); if (a.some((x) => !Number.isFinite(x))) throw new Error(`The ${name} should be numbers separated by commas.`); if (a.length < lo || a.length > hi) throw new Error(`Use between ${lo} and ${hi} numbers for the ${name}.`); return a; };
  const int = (s, name) => { const v = Number(s); if (!Number.isInteger(v)) throw new Error(`${name} should be a whole number.`); return v; };
  const sortedRand = (r, n, lo, hi) => Array.from({ length: n }, () => r.int(lo, hi)).sort((a, b) => a - b);
  const rand = (r, n, lo, hi) => Array.from({ length: n }, () => r.int(lo, hi));
  const D = GR.diagrams, V = (id, title, blurb, skills, tasks, def) => (D[id] = { title, blurb, skills, tasks, def, mount: (host) => player(host, def) });
  const hlRange = (a, b, t) => { const o = {}; for (let k = a; k <= b; k++) o[k] = t; return o; };

  /* ===== 1. two pointers ===== */
  V("lc-twoptr", "Two pointers: pair with a target sum", "In a sorted array, two pointers walk inward from both ends. Each step rules out a whole row of pairs, so it's O(n) instead of O(n²).", ["lc.twoptr"],
    ["Run the default. How many pairs did it check, compared with the 28 a nested loop would check?", "Why is it safe to move the left pointer when the sum is too small?", "Pick a target that doesn't exist. Where do the pointers end up?"],
    { inputs: [{ k: "a", label: "Sorted array", value: "1, 2, 4, 6, 8, 9, 14, 15", w: 240 }, { k: "t", label: "Target", value: "13", w: 60 }],
      random: (r) => { const a = sortedRand(r, 8, 1, 20); return { a: a.join(", "), t: a[r.int(0, 3)] + a[r.int(4, 7)] }; },
      code: ["l, r = 0, len(a) - 1", "while l < r:", "    s = a[l] + a[r]", "    if s == target: return [l, r]", "    if s < target: l += 1   # need bigger", "    else: r -= 1            # need smaller", "return None"],
      frames: (inp) => { const a = nums(inp.a, 2, 14), t = int(inp.t, "Target"); if (a.some((x, k) => k && x < a[k - 1])) throw new Error("Two pointers needs a sorted array. Sort it first (that costs O(n log n))."); const F = []; let l = 0, r = a.length - 1, checks = 0;
        const fr = (line, note, hl = {}) => F.push({ line, note, arrs: [{ vals: a, ptr: { l, r }, hl: Object.assign({ [l]: "cur", [r]: "cur" }, hl), dim: a.map((_, k) => k).filter((k) => k < l || k > r) }], vars: [["target", t], ["l", l], ["r", r], ["pairs checked", checks]] });
        fr(0, "Start with the smallest element on the left and the largest on the right.");
        while (l < r) { const s = a[l] + a[r]; checks++; fr(2, `a[${l}] + a[${r}] = ${a[l]} + ${a[r]} = <b>${s}</b>.`);
          if (s === t) { fr(3, `<b>Found it:</b> ${a[l]} + ${a[r]} = ${t}, at indexes [${l}, ${r}]. Only ${checks} pair${checks > 1 ? "s" : ""} checked.`, { [l]: "ok", [r]: "ok" }); return F; }
          if (s < t) { fr(4, `${s} &lt; ${t}. Every pair using a[${l}] with anything left of r is even smaller, so a[${l}] can't be part of the answer. Move <b>l</b> right.`, { [l]: "bad" }); l++; }
          else { fr(5, `${s} &gt; ${t}. Every pair using a[${r}] with anything right of l is even bigger, so a[${r}] is out. Move <b>r</b> left.`, { [r]: "bad" }); r--; } }
        F.push({ line: 6, note: `The pointers met: no pair sums to ${t}. ${checks} checks instead of ${(a.length * (a.length - 1)) / 2}.`, arrs: [{ vals: a, dim: a.map((_, k) => k) }], vars: [["target", t], ["pairs checked", checks]] }); return F; } });

  /* ===== 2. sliding window ===== */
  V("lc-window", "Sliding window: longest substring without repeats", "The window [left, right] only ever moves forward. right grows it; when a repeat appears, left jumps past the earlier copy. Every character enters and leaves once: O(n).", ["lc.window"],
    ["Run 'abcabcbb'. When does left jump, and why does it jump past the old copy instead of moving one step?", "Try 'abba'. Why does the code check seen[ch] >= left?", "Try 'pwwkew'. Which substring is the answer?"],
    { inputs: [{ k: "s", label: "String", value: "abcabcbb", w: 200 }], random: (r) => ({ s: Array.from({ length: r.int(7, 12) }, () => "abcde"[r.int(0, 4)]).join("") }),
      code: ["seen = {}            # char -> last index", "left = best = 0", "for right, ch in enumerate(s):", "    if ch in seen and seen[ch] >= left:", "        left = seen[ch] + 1   # jump past the repeat", "    seen[ch] = right", "    best = max(best, right - left + 1)", "return best"],
      frames: (inp) => { const s = String(inp.s); if (!s.length || s.length > 18) throw new Error("Use a string of 1 to 18 characters."); const a = [...s], F = [], seen = {}; let left = 0, best = 0, bl = 0, br = -1;
        const fr = (line, note, right, extra = {}) => F.push({ line, note, arrs: [{ vals: a, ptr: right === undefined ? { left } : { left, right }, hl: Object.assign(right === undefined ? {} : hlRange(left, right, "win"), extra), dim: a.map((_, k) => k).filter((k) => k < left) }], vars: [["window", right === undefined ? "–" : `"${s.slice(left, right + 1)}"`], ["best", best, "ok"], ["best substring", br >= bl ? `"${s.slice(bl, br + 1)}"` : "–"]], panels: [{ name: "seen (char → last index)", items: Object.entries(seen).map(([k, v]) => `${k}→${v}`), hl: Object.keys(seen).map((k, i) => (right !== undefined && k === a[right] ? i : -1)) }] });
        fr(1, "Empty window. We will grow it to the right one character at a time.");
        a.forEach((ch, right) => { fr(2, `right = ${right}: consider '${ch}'.`, right, { [right]: "cur" });
          if (ch in seen && seen[ch] >= left) { fr(3, `'${ch}' is already in the window at index ${seen[ch]}. The window can't contain it twice.`, right, { [seen[ch]]: "bad", [right]: "bad" }); left = seen[ch] + 1; fr(4, `Jump <b>left</b> to ${left}, just past the old '${ch}'. Everything before that is gone for good.`, right, { [right]: "cur" }); }
          seen[ch] = right; if (right - left + 1 > best) { best = right - left + 1; bl = left; br = right; } fr(6, `Window "${s.slice(left, right + 1)}" has length ${right - left + 1}. Best so far: ${best}.`, right); });
        F.push({ line: 7, note: `Done. The longest substring without repeating characters is "<b>${s.slice(bl, br + 1)}</b>", length ${best}. Each character was added once and passed by left at most once: O(n).`, arrs: [{ vals: a, hl: hlRange(bl, br, "ok") }], vars: [["answer", best, "ok"]] }); return F; } });

  /* ===== 3. fast and slow pointers ===== */
  V("lc-fastslow", "Fast and slow pointers: cycle detection", "The tortoise moves one node per step and the hare moves two. If there's a cycle, the hare laps the tortoise and they meet inside it. O(n) time, O(1) memory.", ["lc.linked"],
    ["Run with the cycle back to index 2. How many steps until they meet?", "Set 'cycle to' to -1. How does the loop end?", "Why can't the hare jump over the tortoise without meeting it?"],
    { inputs: [{ k: "a", label: "List values", value: "3, 1, 4, 1, 5, 9, 2, 6", w: 220 }, { k: "c", label: "Last node points to index (-1 = no cycle)", value: "2", w: 60 }],
      random: (r) => { const n = r.int(5, 10); return { a: rand(r, n, 1, 9).join(", "), c: String(r.int(-1, n - 2)) }; },
      code: ["slow = fast = head", "while fast and fast.next:", "    slow = slow.next          # 1 step", "    fast = fast.next.next     # 2 steps", "    if slow is fast:", "        return True   # cycle!", "return False"],
      frames: (inp) => { const a = nums(inp.a, 2, 12, "list"), c = int(inp.c, "Cycle index"), n = a.length; if (c >= n || c < -1) throw new Error(`Cycle index must be between -1 and ${n - 1}.`); const nx = (k) => (k === null ? null : k + 1 < n ? k + 1 : c >= 0 ? c : null), F = []; let s = 0, f = 0, steps = 0;
        const fr = (line, note, hl) => F.push({ line, note, arrs: [{ name: "linked list (arrows = next)", vals: a, arrows: true, link: c >= 0 ? { from: n - 1, to: c } : null, ptr: Object.assign({ slow: s }, f === null ? {} : { fast: f }), hl: hl || Object.assign({ [s]: "win" }, f === null ? {} : { [f]: "cur" }) }], vars: [["steps", steps], ["slow at", s], ["fast at", f === null ? "end (null)" : f]] });
        fr(0, "Both pointers start at the head.");
        while (f !== null && nx(f) !== null) { s = nx(s); f = nx(nx(f)); steps++; fr(3, `Step ${steps}: slow moves 1 node to index ${s}; fast moves 2 to ${f === null ? "the end" : "index " + f}.`);
          if (f !== null && s === f) { fr(5, `<b>They meet at index ${s}.</b> The only way fast can catch slow is by going around a loop: there's a cycle.`, { [s]: "ok" }); return F; } }
        fr(6, "fast fell off the end of the list. A list with a cycle never ends, so there's <b>no cycle</b>."); return F; } });

  /* ===== 4. binary search (lower bound) ===== */
  V("lc-bsearch", "Binary search: first index ≥ target", "Keep a half-open range [lo, hi) that always contains the answer, and cut it in half every step. This 'lower bound' template handles duplicates and missing targets.", ["lc.bsearch"],
    ["Search for a value that appears several times. Which copy does it find?", "Search for a value larger than everything. What index comes back, and why is that useful?", "Count the steps for 16 elements. Why is it at most 5?"],
    { inputs: [{ k: "a", label: "Sorted array", value: "2, 3, 3, 5, 7, 7, 7, 10, 12, 15", w: 250 }, { k: "t", label: "Target", value: "7", w: 60 }],
      random: (r) => { const a = sortedRand(r, 12, 1, 30); return { a: a.join(", "), t: r.int(0, 32) }; },
      code: ["lo, hi = 0, len(a)          # answer is in [lo, hi]", "while lo < hi:", "    mid = (lo + hi) // 2", "    if a[mid] < target:", "        lo = mid + 1   # mid and left of it are too small", "    else:", "        hi = mid       # mid might be the answer", "return lo   # first index with a[i] >= target"],
      frames: (inp) => { const a = nums(inp.a, 1, 16), t = int(inp.t, "Target"); if (a.some((x, k) => k && x < a[k - 1])) throw new Error("Binary search needs a sorted array."); const F = []; let lo = 0, hi = a.length, st = 0;
        const fr = (line, note, mid, hl = {}) => F.push({ line, note, arrs: [{ vals: a, ptr: Object.assign({ lo }, mid !== undefined ? { mid } : {}, { hi }), hl: Object.assign(mid !== undefined ? { [mid]: "cur" } : {}, hl), dim: a.map((_, k) => k).filter((k) => k < lo || k >= hi) }], vars: [["target", t], ["range", `[${lo}, ${hi})`], ["steps", st]] });
        fr(0, `The answer is somewhere in [0, ${a.length}]. hi = ${a.length} means "past the end", the answer when every element is smaller.`);
        while (lo < hi) { const mid = (lo + hi) >> 1; st++; fr(2, `mid = (${lo} + ${hi}) // 2 = ${mid}; a[mid] = ${a[mid]}.`, mid);
          if (a[mid] < t) { fr(4, `${a[mid]} &lt; ${t}: mid and everything left of it are too small. lo = ${mid + 1}.`, mid, { [mid]: "bad" }); lo = mid + 1; }
          else { fr(6, `${a[mid]} ≥ ${t}: mid could be the answer, but maybe something to its left is too. hi = ${mid}.`, mid, { [mid]: "win" }); hi = mid; } }
        F.push({ line: 7, note: lo < a.length ? `lo = hi = ${lo}: the first index with a value ≥ ${t} (a[${lo}] = ${a[lo]})${a[lo] === t ? ". Found." : `. ${t} isn't present; ${lo} is where it would be inserted.`} ${st} steps for ${a.length} elements: O(log n).` : `Every element is smaller than ${t}, so the answer is ${lo}, one past the end.`, arrs: [{ vals: a, ptr: { ans: lo }, hl: lo < a.length ? { [lo]: "ok" } : {} }], vars: [["answer", lo, "ok"], ["steps", st]] }); return F; } });

  /* ===== 5. monotonic stack ===== */
  V("lc-monostack", "Monotonic stack: next greater element", "Keep a stack of indexes still waiting for a bigger value, with values decreasing from bottom to top. Each new value pops everyone it beats. Every index is pushed and popped once: O(n).", ["lc.stack"],
    ["Watch what happens when a big value arrives after a run of small ones.", "Why does the stack stay decreasing from bottom to top?", "Try a strictly decreasing array. What's left on the stack at the end?"],
    { inputs: [{ k: "a", label: "Array", value: "2, 7, 3, 5, 4, 6, 8, 1", w: 230 }], random: (r) => ({ a: rand(r, r.int(7, 10), 1, 12).join(", ") }),
      code: ["res = [-1] * n", "stack = []        # indexes waiting for a greater value", "for i in range(n):", "    while stack and a[stack[-1]] < a[i]:", "        res[stack.pop()] = a[i]   # a[i] is their answer", "    stack.append(i)", "return res"],
      frames: (inp) => { const a = nums(inp.a, 2, 14), res = a.map(() => -1), st = [], F = [];
        const fr = (line, note, hl = {}, rhl = {}) => F.push({ line, note, arrs: [{ name: "a", vals: a, hl: Object.assign(Object.fromEntries(st.map((k) => [k, "win"])), hl) }, { name: "res (next greater)", vals: res.slice(), hl: rhl }], panels: [{ name: "stack (indexes)", items: st.map((k) => `${k}:${a[k]}`), hl: [st.length - 1], top: true }] });
        fr(1, "Nothing waiting yet.");
        a.forEach((x, i) => { fr(2, `i = ${i}: a[i] = ${x}.`, { [i]: "cur" });
          while (st.length && a[st[st.length - 1]] < x) { const j = st[st.length - 1]; fr(3, `a[${j}] = ${a[j]} is smaller than ${x}, so ${x} is the first bigger value to its right.`, { [i]: "cur", [j]: "bad" }); st.pop(); res[j] = x; fr(4, `Pop ${j} and record res[${j}] = ${x}.`, { [i]: "cur" }, { [j]: "ok" }); }
          st.push(i); fr(5, `Push ${i}. The stack's values decrease from bottom to top, so the top is always the easiest one to beat.`, { [i]: "cur" }); });
        F.push({ line: 6, note: `Done. Indexes still on the stack (${st.join(", ") || "none"}) have no greater element to their right, so they keep -1. Each index was pushed once and popped at most once.`, arrs: [{ name: "a", vals: a }, { name: "res", vals: res, hl: Object.fromEntries(res.map((v, k) => [k, v < 0 ? "done" : "ok"])) }], panels: [{ name: "stack", items: st.map((k) => `${k}:${a[k]}`), top: true }] }); return F; } });

  /* ===== 6. prefix sums + hash map ===== */
  V("lc-prefix", "Prefix sums + hash map: subarrays that sum to k", "A subarray sum is a difference of two prefix sums. Store how often each prefix sum has appeared; at each step, count the earlier prefixes equal to (current − k). O(n), and it works with negative numbers.", ["lc.prefix"],
    ["Run the default. Which subarrays did it count?", "Add a negative number. Why does a sliding window fail here but prefix sums still work?", "Why does the map start with {0: 1}?"],
    { inputs: [{ k: "a", label: "Array", value: "1, 2, 1, -1, 2, 3", w: 220 }, { k: "k", label: "k", value: "3", w: 50 }], random: (r) => ({ a: rand(r, 8, -2, 4).join(", "), k: r.int(1, 5) }),
      code: ["count = {0: 1}     # prefix sum -> times seen", "pre = ans = 0", "for x in a:", "    pre += x", "    ans += count.get(pre - k, 0)", "    count[pre] = count.get(pre, 0) + 1", "return ans"],
      frames: (inp) => { const a = nums(inp.a, 1, 14), k = int(inp.k, "k"), F = [], count = new Map([[0, 1]]), pres = [0], P = []; let pre = 0, ans = 0;
        const fr = (line, note, i, hl = {}) => F.push({ line, note, arrs: [{ name: "a", vals: a, hl: Object.assign(i === undefined ? {} : { [i]: "cur" }, hl) }, { name: "prefix sums (P[i] = sum of first i)", vals: pres.slice(), hl: i === undefined ? {} : { [i + 1]: "cur" } }], vars: [["k", k], ["pre", pre], ["looking for pre − k", i === undefined ? "–" : pre - k], ["count", ans, "ok"]], panels: [{ name: "count (prefix → times)", items: [...count].map(([p, c]) => `${p}:${c}`), hl: [...count.keys()].map((p, j) => (i !== undefined && p === pre - k ? j : -1)) }, { name: "subarrays found", items: P }] });
        fr(0, "The empty prefix has sum 0 and has been seen once. That lets subarrays starting at index 0 be counted.");
        a.forEach((x, i) => { pre += x; pres.push(pre); fr(3, `Add a[${i}] = ${x}: prefix sum is now ${pre}.`, i);
          const c = count.get(pre - k) || 0; if (c) { pres.forEach((p, s) => { if (s <= i && p === pre - k) P.push(`[${s}..${i}]`); }); ans += c; fr(4, `${pre} − ${k} = ${pre - k} appeared ${c} time${c > 1 ? "s" : ""} before. Each one marks a subarray ending here that sums to ${k}. Total: ${ans}.`, i, hlRange(P.length ? +P[P.length - 1].slice(1).split("..")[0] : i, i, "ok")); }
          else { fr(4, `No earlier prefix equals ${pre} − ${k} = ${pre - k}, so no subarray ending at ${i} sums to ${k}.`, i); }
          count.set(pre, (count.get(pre) || 0) + 1); fr(5, `Record prefix ${pre}.`, i); });
        fr(6, `Answer: <b>${ans}</b> subarray${ans === 1 ? "" : "s"} sum to ${k}. One pass, one hash map: O(n) time and space.`); return F; } });

  /* ===== 7. Kadane ===== */
  V("lc-kadane", "Kadane's algorithm: maximum subarray", "At each element decide: extend the best run ending just before, or start fresh here? A negative running sum only hurts, so drop it. One pass, O(1) memory.", ["lc.greedy", "lc.dp1"],
    ["Find the step where the algorithm starts a fresh run. What was the running sum just before?", "Make every number negative. What does it return?", "Why is this both a greedy choice and a tiny DP?"],
    { inputs: [{ k: "a", label: "Array", value: "-2, 1, -3, 4, -1, 2, 1, -5, 4", w: 250 }], random: (r) => ({ a: rand(r, 10, -6, 6).join(", ") }),
      code: ["cur = best = a[0]", "for x in a[1:]:", "    cur = max(x, cur + x)   # extend, or start over at x", "    best = max(best, cur)", "return best"],
      frames: (inp) => { const a = nums(inp.a, 1, 16), F = []; let cur = a[0], best = a[0], st = 0, bs = 0, be = 0;
        const fr = (line, note, i, extra = {}) => F.push({ line, note, arrs: [{ vals: a, ptr: { i }, hl: Object.assign(hlRange(st, i, "win"), extra) }], vars: [["cur (best ending here)", cur], ["best", best, "ok"], ["best run", `[${bs}..${be}]`]] });
        fr(0, `Start: the best run ending at index 0 is just [${a[0]}].`, 0);
        for (let i = 1; i < a.length; i++) { const x = a[i]; if (cur + x < x) { fr(2, `cur + ${x} = ${cur + x} is less than ${x} alone. The previous run is a drag: start fresh at index ${i}.`, i, { [i]: "cur" }); cur = x; st = i; } else { cur += x; fr(2, `Extend the run: cur = ${cur}.`, i, { [i]: "cur" }); }
          if (cur > best) { best = cur; bs = st; be = i; fr(3, `New best: ${best} from index ${bs} to ${be}.`, i, hlRange(bs, be, "ok")); } }
        F.push({ line: 4, note: `Maximum subarray sum: <b>${best}</b> (indexes ${bs} to ${be}). O(n) time, O(1) space.`, arrs: [{ vals: a, hl: hlRange(bs, be, "ok") }], vars: [["answer", best, "ok"]] }); return F; } });

  /* ===== 8. heap: k largest ===== */
  const heapTree = (h, hl = {}) => ({ nodes: h.map((v, i) => { const d = Math.floor(Math.log2(i + 1)), p = i - (2 ** d - 1); return { id: i, label: v, d, x: (p + 0.5) / 2 ** d, tone: hl[i] }; }), edges: h.map((_, i) => (i ? [Math.floor((i - 1) / 2), i] : null)).filter(Boolean) });
  V("lc-heap", "Heap: keep the k largest with a min-heap", "A min-heap of size k holds the k largest values seen so far, with the smallest of them on top. Push each value; if the heap grows past k, pop the top. O(n log k).", ["lc.heap"],
    ["Watch a push sift up. Why does it stop when the parent is smaller?", "When the heap has k + 1 items, which one gets popped and why is it safe to drop?", "Why is this better than sorting when k is much smaller than n?"],
    { inputs: [{ k: "a", label: "Numbers", value: "5, 1, 9, 3, 7, 2, 8, 6", w: 220 }, { k: "k", label: "k", value: "3", w: 50 }], random: (r) => ({ a: rand(r, 9, 1, 30).join(", "), k: r.int(2, 4) }),
      code: ["heap = []", "for x in nums:", "    heappush(heap, x)        # sift up", "    if len(heap) > k:", "        heappop(heap)        # drop the smallest; sift down", "return heap    # the k largest"],
      frames: (inp) => { const a = nums(inp.a, 1, 12), k = int(inp.k, "k"); if (k < 1 || k > 7) throw new Error("Use k between 1 and 7."); const h = [], F = [];
        const fr = (line, note, hl = {}, cur) => F.push({ line, note, tree: heapTree(h, hl), arrs: [{ name: "input", vals: a, hl: cur === undefined ? {} : { [cur]: "cur" }, dim: cur === undefined ? [] : a.map((_, j) => j).filter((j) => j < cur) }, { name: "heap as an array (children of i at 2i+1, 2i+2)", vals: h.length ? h.slice() : ["·"], hl, noidx: !h.length }], vars: [["k", k], ["heap size", h.length], ["top (smallest kept)", h.length ? h[0] : "–", "cur"]] });
        fr(0, "An empty min-heap: the root is always the smallest element.");
        a.forEach((x, idx) => { h.push(x); let i = h.length - 1; fr(2, `Push ${x} at the bottom (index ${i}).`, { [i]: "cur" }, idx);
          while (i > 0) { const p = (i - 1) >> 1; if (h[p] <= h[i]) { fr(2, `Parent ${h[p]} ≤ ${h[i]}: heap order holds. Stop.`, { [i]: "ok", [p]: "ok" }, idx); break; } [h[p], h[i]] = [h[i], h[p]]; fr(2, `${h[p]} is smaller than its parent ${h[i]}: swap them (sift up).`, { [p]: "cur", [i]: "alt" }, idx); i = p; }
          if (h.length > k) { const top = h[0]; fr(3, `Heap has ${h.length} > k = ${k} items. The root ${top} is the smallest; it can't be among the k largest.`, { 0: "bad" }, idx); const last = h.pop(); if (h.length) { h[0] = last; let j = 0; fr(4, `Pop ${top}: move the last element (${last}) to the root, then sift it down.`, { 0: "cur" }, idx);
              for (;;) { const l = 2 * j + 1, r = l + 1; let m = j; if (l < h.length && h[l] < h[m]) m = l; if (r < h.length && h[r] < h[m]) m = r; if (m === j) { fr(4, `${h[j]} is no larger than its children. Heap order restored.`, { [j]: "ok" }, idx); break; } [h[m], h[j]] = [h[j], h[m]]; fr(4, `Swap ${h[m]} down with its smaller child ${h[j]}.`, { [j]: "alt", [m]: "cur" }, idx); j = m; } } } });
        F.push({ line: 5, note: `Done. The heap holds the ${k} largest values: <b>${h.slice().sort((x, y) => y - x).join(", ")}</b>. Its root (${h[0]}) is the k-th largest. Each push and pop costs O(log k).`, tree: heapTree(h, Object.fromEntries(h.map((_, i) => [i, "ok"]))), arrs: [{ name: "heap", vals: h }], vars: [["k-th largest", h[0], "ok"]] }); return F; } });

  /* ===== 9. backtracking: subsets ===== */
  V("lc-backtrack", "Backtracking: generating every subset", "Each level decides one element: take it or skip it. The recursion tree has 2ⁿ leaves, one per subset. 'Choose, explore, un-choose' is the template for subsets, permutations and combinations.", ["lc.backtrack"],
    ["Follow the path to the leaf {1, 3}. Which decisions led there?", "Where does the code 'un-choose'? What would break without path.pop()?", "How many nodes does the tree have for n = 4? Why is backtracking exponential?"],
    { inputs: [{ k: "a", label: "Numbers (1 to 4 of them)", value: "1, 2, 3", w: 140 }],
      code: ["def dfs(i, path):", "    if i == len(nums):", "        res.append(path[:])   # a complete subset", "        return", "    path.append(nums[i])      # choose: take nums[i]", "    dfs(i + 1, path)", "    path.pop()                # un-choose", "    dfs(i + 1, path)          # explore: skip nums[i]"],
      frames: (inp) => { const a = nums(inp.a, 1, 4), n = a.length, F = [], res = [], nodes = [], edges = [], vis = {}; let path = [];
        const lab = (p) => (p.length ? p.join("") : "∅");
        const id = (bits) => bits; // node id = decision string
        const addNode = (bits) => { const d = bits.length, pos = bits.split("").reduce((acc, b) => acc * 2 + (b === "1" ? 0 : 1), 0); nodes.push({ id: id(bits), d, x: (pos + 0.5) / 2 ** d, label: lab(a.filter((_, j) => bits[j] === "1")) }); if (d) edges.push([bits.slice(0, -1), bits, bits.endsWith("1") ? "win" : undefined]); };
        const all = []; const walk = (b) => { all.push(b); if (b.length < n) { walk(b + "1"); walk(b + "0"); } }; walk("");
        all.forEach(addNode);
        const tree = (cur) => ({ dy: 54, r: 15, nodes: nodes.map((x) => Object.assign({}, x, { tone: x.id === cur ? "cur" : vis[x.id] === 2 ? (x.d === n ? "ok" : "done") : vis[x.id] === 1 ? "win" : undefined })), edges: edges.map(([p, c, t]) => [p, c, vis[c] ? { tone: c.endsWith("1") ? "win" : "done" } : {}]) });
        const fr = (line, note, cur) => F.push({ line, note, tree: tree(cur), vars: [["path", "[" + path.join(", ") + "]"], ["depth i", cur.length]], panels: [{ name: "res (subsets found)", items: res.map((r) => "{" + r.join(",") + "}"), hl: [res.length - 1] }] });
        const dfs = (bits) => { vis[bits] = 1; const i = bits.length;
          if (i === n) { res.push(path.slice()); vis[bits] = 2; fr(2, `All ${n} decisions made: record {${path.join(", ")}}.`, bits); return; }
          path.push(a[i]); fr(4, `Choose: take ${a[i]}. path = [${path.join(", ")}].`, bits); dfs(bits + "1");
          path.pop(); fr(6, `Back at depth ${i}. Un-choose ${a[i]}: path = [${path.join(", ")}].`, bits); fr(7, `Explore the other branch: skip ${a[i]}.`, bits); dfs(bits + "0"); vis[bits] = 2; };
        fr(0, "Start at the root with an empty path. Left branches take the element; right branches skip it.", ""); dfs("");
        F.push({ line: 0, note: `All <b>${res.length}</b> = 2^${n} subsets generated. The tree has ${nodes.length} nodes, so the work grows as O(2ⁿ · n).`, tree: tree("~"), panels: [{ name: "res", items: res.map((r) => "{" + r.join(",") + "}") }] }); return F; } });

  /* ===== 10. BFS on a grid ===== */
  const MAPS = { maze: ["S..#....", ".#.#.##.", ".#...#..", ".####.#.", "......#G"], open: ["S.......", "........", "...##...", "........", ".......G"], walls: ["S.#.....", "..#.###.", "..#...#.", "..###.#.", "......#G"] };
  V("lc-gridbfs", "BFS on a grid: shortest path", "Breadth-first search explores in rings of equal distance, using a queue. The first time it reaches a cell is along a shortest path. O(rows × cols).", ["lc.graphs"],
    ["Watch the numbers spread. Why does every cell get the smallest possible distance?", "Switch to the maze. How does BFS handle dead ends?", "What would change with a stack instead of a queue?"],
    { inputs: [{ k: "m", label: "Map", value: "maze", options: [["maze", "Maze"], ["walls", "Walls"], ["open", "Open field"]] }],
      code: ["q = deque([start]); dist = {start: 0}", "while q:", "    r, c = q.popleft()", "    if (r, c) == goal: return dist[(r, c)]", "    for dr, dc in [(1,0), (-1,0), (0,1), (0,-1)]:", "        nr, nc = r + dr, c + dc", "        if inside and not wall and (nr, nc) not in dist:", "            dist[(nr, nc)] = dist[(r, c)] + 1", "            q.append((nr, nc))", "return -1"],
      frames: (inp) => { const M = MAPS[inp.m] || MAPS.maze, R = M.length, Cn = M[0].length, F = [], dist = {}, par = {}, q = []; let S, Gl; M.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === "S") S = [r, c]; if (ch === "G") Gl = [r, c]; }));
        const cells = (hl) => M.map((row, r) => [...row].map((ch, c) => (ch === "#" ? "#" : dist[r + "," + c] !== undefined ? dist[r + "," + c] : ch === "S" ? "S" : ch === "G" ? "G" : "")));
        const fr = (line, note, hl) => F.push({ line, note, grid: { cells: cells(), hl: Object.assign(Object.fromEntries(Object.keys(dist).map((k) => [k, "win"])), Object.fromEntries(q.map(([r, c]) => [r + "," + c, "alt"])), hl || {}) }, panels: [{ name: "queue (front → back)", items: q.map(([r, c]) => `(${r},${c})`) }], vars: [["visited", Object.keys(dist).length]] });
        dist[S.join(",")] = 0; q.push(S); fr(0, "Start in the corner with distance 0. The queue holds the frontier: cells discovered but not yet expanded.");
        while (q.length) { const [r, c] = q.shift(), key = r + "," + c;
          if (r === Gl[0] && c === Gl[1]) { const p = {}; let k = key; while (k) { p[k] = "ok"; k = par[k]; } fr(3, `Reached the goal at distance <b>${dist[key]}</b>. Following the parent links back gives one shortest path.`, p); return F; }
          const added = []; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => { const nr = r + dr, nc = c + dc, nk = nr + "," + nc; if (nr < 0 || nc < 0 || nr >= R || nc >= Cn || M[nr][nc] === "#" || dist[nk] !== undefined) return; dist[nk] = dist[key] + 1; par[nk] = key; q.push([nr, nc]); added.push(nk); });
          fr(8, `Expand (${r},${c}) at distance ${dist[key]}: ${added.length ? `discovered ${added.length} new cell${added.length > 1 ? "s" : ""} at distance ${dist[key] + 1}` : "no new neighbors (dead end or already seen)"}.`, Object.assign({ [key]: "cur" }, Object.fromEntries(added.map((k) => [k, "gold"])))); }
        fr(9, "The queue emptied without reaching the goal: it's unreachable."); return F; } });

  /* ===== 11. topological sort ===== */
  const DAG = { nodes: [["A", 0.05, 0.25], ["B", 0.05, 0.8], ["C", 0.35, 0.5], ["D", 0.6, 0.15], ["E", 0.6, 0.85], ["F", 0.95, 0.5]], edges: [["A", "C"], ["B", "C"], ["A", "D"], ["C", "D"], ["C", "E"], ["D", "F"], ["E", "F"]] };
  V("lc-topo", "Topological sort (Kahn's algorithm)", "Order tasks so every prerequisite comes first. Repeatedly take a node with no remaining prerequisites (in-degree 0). If some nodes never reach in-degree 0, there's a cycle. O(V + E).", ["lc.graphs"],
    ["Which nodes start in the queue, and why?", "Turn on the cycle. Which nodes get stuck?", "Course Schedule on LeetCode is exactly this. What does 'can finish all courses' map to?"],
    { inputs: [{ k: "cyc", label: "Graph", value: "dag", options: [["dag", "Course prerequisites (no cycle)"], ["cyc", "With a cycle F → C"]] }],
      code: ["indeg = number of incoming edges per node", "q = [v for v in nodes if indeg[v] == 0]", "order = []", "while q:", "    v = q.pop(0); order.append(v)", "    for w in adj[v]:", "        indeg[w] -= 1", "        if indeg[w] == 0: q.append(w)", "return order if len(order) == n else 'cycle!'"],
      frames: (inp) => { const edges = DAG.edges.concat(inp.cyc === "cyc" ? [["F", "C"]] : []), ind = {}, adj = {}, F = [], order = [], q = []; DAG.nodes.forEach(([v]) => { ind[v] = 0; adj[v] = []; }); edges.forEach(([a, b]) => { adj[a].push(b); ind[b]++; });
        const fr = (line, note, cur, hot = []) => F.push({ line, note, graph: { h: 250, nodes: DAG.nodes.map(([v, x, y]) => ({ id: v, label: v, x, y, sub: "in " + ind[v], subTone: ind[v] ? "done" : "ok", tone: v === cur ? "cur" : order.includes(v) ? "ok" : q.includes(v) ? "alt" : undefined })), edges: edges.map(([a, b]) => [a, b, { dir: true, tone: hot.includes(a + b) ? "cur" : order.includes(a) ? "done" : undefined }]) }, panels: [{ name: "queue (in-degree 0)", items: q.slice() }, { name: "order", items: order.slice() }] });
        fr(0, "Count prerequisites (incoming edges) for every node.");
        DAG.nodes.forEach(([v]) => ind[v] === 0 && q.push(v)); fr(1, `Nodes with no prerequisites can go first: ${q.join(", ")}.`);
        while (q.length) { const v = q.shift(); order.push(v); fr(4, `Take ${v} and append it to the order.`, v);
          adj[v].forEach((w) => { ind[w]--; fr(6, `Remove edge ${v} → ${w}: ${w} now has ${ind[w]} prerequisite${ind[w] === 1 ? "" : "s"} left.`, v, [v + w]); if (ind[w] === 0) { q.push(w); fr(7, `${w} is free: add it to the queue.`, v); } }); }
        const ok = order.length === DAG.nodes.length; fr(8, ok ? `Valid order: <b>${order.join(" → ")}</b>. Every edge points forward in it.` : `Only ${order.length} of ${DAG.nodes.length} nodes were ordered. The rest (${DAG.nodes.map(([v]) => v).filter((v) => !order.includes(v)).join(", ")}) wait on each other forever: <b>a cycle</b>.`); return F; } });

  /* ===== 12. union-find ===== */
  const UFP = Array.from({ length: 8 }, (_, i) => [i, 0.5 + 0.42 * Math.cos((i / 8) * 2 * Math.PI - Math.PI / 2), 0.5 + 0.46 * Math.sin((i / 8) * 2 * Math.PI - Math.PI / 2)]);
  V("lc-unionfind", "Union-find: merging components", "Each node points toward a representative (root). find follows pointers to the root, flattening the path as it goes; union links two roots, the smaller tree under the larger. Nearly O(1) per operation.", ["lc.graphs"],
    ["Which edge makes union return False, and what does that mean for the graph?", "Watch a find compress a path. Why does that make later finds faster?", "How would you count connected components with this?"],
    { inputs: [{ k: "e", label: "Edges (a-b pairs)", value: "0-1, 2-3, 1-3, 4-5, 6-7, 5-7, 0-2, 4-6", w: 280 }],
      random: (r) => ({ e: Array.from({ length: 8 }, () => { const a = r.int(0, 7); let b = r.int(0, 7); if (b === a) b = (a + 1) % 8; return `${a}-${b}`; }).join(", ") }),
      code: ["def find(x):", "    while parent[x] != x:", "        parent[x] = parent[parent[x]]   # path compression", "        x = parent[x]", "    return x", "def union(a, b):", "    ra, rb = find(a), find(b)", "    if ra == rb: return False   # already connected", "    if size[ra] < size[rb]: ra, rb = rb, ra", "    parent[rb] = ra; size[ra] += size[rb]", "    return True"],
      frames: (inp) => { const E2 = String(inp.e).split(/[\s,]+/).filter(Boolean).map((p) => p.split("-").map(Number)); if (!E2.length || E2.length > 12 || E2.some((p) => p.length !== 2 || p.some((x) => !Number.isInteger(x) || x < 0 || x > 7))) throw new Error("Use up to 12 pairs like 0-1 with nodes 0 to 7."); const par = [...Array(8).keys()], size = Array(8).fill(1), F = [], done = []; let comps = 8;
        const fr = (line, note, hot = {}, edge) => F.push({ line, note, graph: { h: 260, nodes: UFP.map(([i, x, y]) => ({ id: i, label: i, x, y, tone: hot[i] || (par[i] === i ? "win" : undefined), sub: par[i] === i ? "root" : "" })), edges: UFP.filter(([i]) => par[i] !== i).map(([i]) => [i, par[i], { dir: true, tone: "done" }]).concat(edge ? [[edge[0], edge[1], { tone: "cur" }]] : []) }, arrs: [{ name: "parent[i]", vals: par.slice(), hl: Object.fromEntries(Object.entries(hot).map(([k, v]) => [k, v])) }], vars: [["components", comps, "ok"]], panels: [{ name: "edges processed", items: done.slice() }] });
        const find = (x, line) => { const path = [x]; while (par[x] !== x) { const gp = par[par[x]]; if (gp !== par[x]) { fr(2, `Path compression: point ${x} at its grandparent ${gp}.`, { [x]: "cur", [gp]: "alt" }); par[x] = gp; } x = par[x]; path.push(x); } return x; };
        fr(0, "Every node starts as its own component (its own root).");
        E2.forEach(([a, b]) => { fr(6, `union(${a}, ${b}): find both roots.`, { [a]: "cur", [b]: "cur" }, [a, b]); const ra = find(a), rb = find(b);
          if (ra === rb) { done.push(`${a}-${b} ✗`); fr(7, `Both have root ${ra}: they're <b>already connected</b>. In 'Redundant Connection' or cycle detection, this edge closes a cycle.`, { [a]: "bad", [b]: "bad" }, [a, b]); return; }
          const [big, small] = size[ra] >= size[rb] ? [ra, rb] : [rb, ra]; par[small] = big; size[big] += size[small]; comps--; done.push(`${a}-${b}`); fr(9, `Roots ${ra} and ${rb} differ. Attach the smaller tree (root ${small}) under ${big}. Components: ${comps}.`, { [small]: "ok", [big]: "ok" }); });
        fr(10, `All edges processed: <b>${comps}</b> connected component${comps === 1 ? "" : "s"}. With path compression and union by size each operation is almost O(1).`); return F; } });

  /* ===== 13. 1-D DP: house robber ===== */
  V("lc-dp1", "1-D dynamic programming: house robber", "dp[i] = the most you can steal from the first i+1 houses. At each house: skip it (dp[i−1]) or rob it (dp[i−2] + value). Each answer reuses smaller answers instead of recomputing them.", ["lc.dp1"],
    ["At each step, which two earlier cells does dp[i] look at?", "Why can't the recursion without memoization handle 100 houses?", "Can you do it with two variables instead of the whole array?"],
    { inputs: [{ k: "a", label: "House values", value: "2, 7, 9, 3, 1, 5, 8", w: 220 }], random: (r) => ({ a: rand(r, r.int(6, 10), 1, 12).join(", ") }),
      code: ["dp[0] = a[0]", "dp[1] = max(a[0], a[1])", "for i in range(2, n):", "    dp[i] = max(dp[i-1],          # skip house i", "                dp[i-2] + a[i])   # rob house i", "return dp[n-1]"],
      frames: (inp) => { const a = nums(inp.a, 2, 14), n = a.length, dp = Array(n).fill(null), F = [];
        const fr = (line, note, hl = {}, ahl = {}) => F.push({ line, note, arrs: [{ name: "house values a", vals: a, hl: ahl }, { name: "dp[i] = best total using houses 0..i", vals: dp.slice(), hl }] });
        dp[0] = a[0]; fr(0, `With one house, rob it: dp[0] = ${a[0]}.`, { 0: "ok" }, { 0: "cur" });
        dp[1] = Math.max(a[0], a[1]); fr(1, `With two adjacent houses, take the better one: dp[1] = ${dp[1]}.`, { 1: "ok" }, { 0: "cur", 1: "cur" });
        for (let i = 2; i < n; i++) { const skip = dp[i - 1], rob = dp[i - 2] + a[i]; fr(3, `House ${i} (${a[i]}): skip → dp[${i - 1}] = ${skip}; rob → dp[${i - 2}] + ${a[i]} = ${rob}.`, { [i - 1]: "win", [i - 2]: "alt" }, { [i]: "cur" }); dp[i] = Math.max(skip, rob); fr(4, `dp[${i}] = max(${skip}, ${rob}) = <b>${dp[i]}</b> (${rob > skip ? "rob it" : "skip it"}).`, { [i]: "ok" }, { [i]: rob > skip ? "ok" : "done" }); }
        fr(5, `Answer: dp[${n - 1}] = <b>${dp[n - 1]}</b>. ${n} subproblems, each O(1): O(n). Only the last two cells are ever read, so two variables are enough.`, { [n - 1]: "ok" }); return F; } });

  /* ===== 14. 2-D DP: LCS ===== */
  V("lc-lcs", "2-D dynamic programming: longest common subsequence", "dp[i][j] = the LCS length of the first i letters of A and the first j of B. Matching letters extend the diagonal; otherwise take the better of dropping a letter from either string.", ["lc.dp2"],
    ["When the letters match, which cell does the value come from?", "Follow the traceback. Which letters form the LCS?", "Edit distance fills the same kind of table. What changes in the rule?"],
    { inputs: [{ k: "a", label: "String A", value: "ABCBDAB", w: 120 }, { k: "b", label: "String B", value: "BDCABA", w: 120 }], random: (r) => ({ a: Array.from({ length: 6 }, () => "ABCD"[r.int(0, 3)]).join(""), b: Array.from({ length: 6 }, () => "ABCD"[r.int(0, 3)]).join("") }),
      code: ["dp = (m+1) × (n+1) table of zeros", "for i in 1..m:", "    for j in 1..n:", "        if A[i-1] == B[j-1]:", "            dp[i][j] = dp[i-1][j-1] + 1     # extend a match", "        else:", "            dp[i][j] = max(dp[i-1][j], dp[i][j-1])", "return dp[m][n]"],
      frames: (inp) => { const A = String(inp.a).toUpperCase(), B = String(inp.b).toUpperCase(); if (!A || !B || A.length > 8 || B.length > 8) throw new Error("Use strings of 1 to 8 letters."); const m = A.length, n = B.length, dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0)), F = [], filled = {};
        const fr = (line, note, hl = {}) => F.push({ line, note, grid: { cells: dp.map((row, i) => row.map((v, j) => (i === 0 || j === 0 || filled[i + "," + j] ? v : ""))), rl: ["", ...A], cl: ["", ...B], hl } });
        fr(0, "Row 0 and column 0 are 0: an empty string has nothing in common with anything.");
        for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) { filled[i + "," + j] = 1;
          if (A[i - 1] === B[j - 1]) { dp[i][j] = dp[i - 1][j - 1] + 1; fr(4, `A[${i - 1}] = B[${j - 1}] = '${A[i - 1]}': extend the diagonal. dp[${i}][${j}] = ${dp[i - 1][j - 1]} + 1 = ${dp[i][j]}.`, { [`${i},${j}`]: "ok", [`${i - 1},${j - 1}`]: "alt" }); }
          else { dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]); fr(6, `'${A[i - 1]}' ≠ '${B[j - 1]}': take the better of above (${dp[i - 1][j]}) and left (${dp[i][j - 1]}) = ${dp[i][j]}.`, { [`${i},${j}`]: "cur", [`${i - 1},${j}`]: "win", [`${i},${j - 1}`]: "win" }); } }
        let i = m, j = n; const tr = {}, lcs = []; while (i && j) { tr[i + "," + j] = "gold"; if (A[i - 1] === B[j - 1]) { lcs.push(A[i - 1]); tr[i + "," + j] = "ok"; i--; j--; } else if (dp[i - 1][j] >= dp[i][j - 1]) i--; else j--; }
        fr(7, `LCS length = <b>${dp[m][n]}</b>. Tracing back from the corner (green = matched letters) spells "<b>${lcs.reverse().join("")}</b>". The table has (m+1)(n+1) cells, each O(1): O(m·n).`, tr); return F; } });

  /* ===== 15. intervals ===== */
  V("lc-intervals", "Intervals: merge overlapping ranges", "Sort by start time. Then a single pass works: each interval either overlaps the last merged one (extend it) or starts a new group. O(n log n) for the sort.", ["lc.intervals"],
    ["Why must the intervals be sorted by start first?", "Find an interval that's fully inside another. How does max(end, e) handle it?", "Do [1,4] and [4,5] merge with this code? Change <= to < and compare."],
    { inputs: [{ k: "a", label: "Intervals (start-end)", value: "1-3, 8-10, 2-6, 15-18, 9-12, 17-20", w: 280 }], random: (r) => ({ a: Array.from({ length: 6 }, () => { const s = r.int(0, 16); return `${s}-${s + r.int(1, 5)}`; }).join(", ") }),
      code: ["intervals.sort(key=lambda x: x[0])", "merged = [intervals[0]]", "for s, e in intervals[1:]:", "    if s <= merged[-1][1]:                 # overlaps the last group", "        merged[-1][1] = max(merged[-1][1], e)", "    else:", "        merged.append([s, e])"],
      frames: (inp) => { const iv = String(inp.a).split(/[\s,]+/).filter(Boolean).map((p) => p.split("-").map(Number)); if (!iv.length || iv.length > 10 || iv.some((p) => p.length !== 2 || p.some((x) => !Number.isFinite(x)) || p[0] > p[1])) throw new Error("Use up to 10 ranges like 1-3 (start ≤ end)."); const lo = Math.min(...iv.map((x) => x[0])), hi = Math.max(...iv.map((x) => x[1])), F = [];
        const sorted = iv.slice().sort((a, b) => a[0] - b[0]), merged = [];
        const fr = (line, note, cur) => F.push({ line, note, bars: { lo, hi, items: sorted.map((x, k) => ({ s: x[0], e: x[1], row: k, tone: k === cur ? "cur" : k < (cur === undefined ? -1 : cur) ? "done" : "win" })).concat(merged.map((x) => ({ s: x[0], e: x[1], row: sorted.length, tone: "ok", label: `[${x[0]},${x[1]}]` }))) }, panels: [{ name: "merged (bottom row)", items: merged.map((x) => `[${x[0]},${x[1]}]`), hl: [merged.length - 1] }] });
        F.push({ line: 0, note: "The input, unsorted.", bars: { lo, hi, items: iv.map((x, k) => ({ s: x[0], e: x[1], row: k })) } });
        fr(0, "Sorted by start. Now any interval that overlaps a group must overlap the <i>last</i> group.");
        merged.push(sorted[0].slice()); fr(1, `Start the first group with [${sorted[0]}].`, 0);
        sorted.slice(1).forEach(([s, e], k) => { const last = merged[merged.length - 1];
          if (s <= last[1]) { const old = last[1]; last[1] = Math.max(last[1], e); fr(4, `[${s},${e}] starts at ${s} ≤ ${old}, inside the last group. Extend its end to max(${old}, ${e}) = ${last[1]}.`, k + 1); }
          else { merged.push([s, e]); fr(6, `[${s},${e}] starts after ${last[1]}: no overlap. Start a new group.`, k + 1); } });
        fr(6, `Merged: <b>${merged.map((x) => `[${x[0]},${x[1]}]`).join(", ")}</b>.`); return F; } });

  /* ===== 16. trie ===== */
  V("lc-trie", "Trie: a tree of prefixes", "Each edge is a letter; each path from the root spells a prefix. Words that share a prefix share nodes. Insert and search cost O(word length), however many words are stored.", ["lc.trie"],
    ["Which nodes are shared between 'car' and 'cat'?", "How does the end-of-word marker tell 'car' apart from 'card'?", "Why does autocomplete use a trie instead of scanning a list?"],
    { inputs: [{ k: "w", label: "Words", value: "car, cat, cart, dog, do, card", w: 260 }],
      code: ["node = root", "for ch in word:", "    if ch not in node.children:", "        node.children[ch] = Node()   # new branch", "    node = node.children[ch]       # walk down", "node.end = True                    # mark a complete word"],
      frames: (inp) => { const words = String(inp.w).toLowerCase().split(/[\s,]+/).filter(Boolean); if (!words.length || words.length > 8 || words.some((w) => !/^[a-z]{1,6}$/.test(w))) throw new Error("Use up to 8 words of 1 to 6 letters."); const nodes = [{ id: "", ch: "·", kids: [], end: false }], by = { "": nodes[0] }, F = [];
        const layout = () => { let leaf = 0; const pos = {}; const walk = (n, d) => { if (!n.kids.length) { pos[n.id] = [leaf++, d]; return; } n.kids.forEach((k) => walk(by[k], d + 1)); const xs = n.kids.map((k) => pos[k][0]); pos[n.id] = [(Math.min(...xs) + Math.max(...xs)) / 2, d]; }; walk(nodes[0], 0); return { pos, leaves: Math.max(1, leaf) }; };
        const fr = (line, note, cur, path = []) => { const { pos, leaves } = layout(); F.push({ line, note, tree: { dy: 52, r: 15, nodes: nodes.map((n) => ({ id: n.id, label: n.ch, d: pos[n.id][1], x: leaves === 1 ? 0.5 : pos[n.id][0] / (leaves - 1), tone: n.id === cur ? "cur" : path.includes(n.id) ? "win" : undefined, sub: n.end ? "end" : "", subTone: "ok" })), edges: nodes.filter((n) => n.id).map((n) => [n.id.slice(0, -1), n.id, path.includes(n.id) ? "win" : undefined]) }, panels: [{ name: "words inserted", items: words.filter((_, k) => k < (F.done || 0)) }] }); };
        fr(0, "An empty trie: just the root.", "");
        words.forEach((w, wi) => { let id = ""; const path = [""];
          for (const ch of w) { const nid = id + ch; if (!by[nid]) { const n = { id: nid, ch, kids: [], end: false }; nodes.push(n); by[nid] = n; by[id].kids.push(nid); by[id].kids.sort(); id = nid; path.push(id); fr(3, `"${w}": no '${ch}' child here yet, so create one.`, id, path); } else { id = nid; path.push(id); fr(4, `"${w}": '${ch}' already exists (shared prefix "${id}"). Walk down.`, id, path); } }
          by[id].end = true; F.done = wi + 1; fr(5, `Mark the node for "${w}" as the end of a word.`, id, path); });
        fr(5, `${words.length} words stored in ${nodes.length - 1} letter nodes (they contain ${words.join("").length} letters in total). Shared prefixes are stored once.`, null); return F; } });

  /* ===== 17. Dijkstra ===== */
  const WG = { nodes: [["A", 0.04, 0.5], ["B", 0.3, 0.12], ["C", 0.3, 0.88], ["D", 0.62, 0.15], ["E", 0.62, 0.85], ["F", 0.95, 0.5]], edges: [["A", "B", 4], ["A", "C", 2], ["C", "B", 1], ["B", "D", 5], ["C", "E", 10], ["D", "E", 3], ["D", "F", 11], ["E", "F", 2], ["C", "D", 8]] };
  V("lc-dijkstra", "Dijkstra: shortest paths with weights", "Like BFS, but the frontier is a priority queue ordered by distance. The closest unsettled node is final when popped, because every other route to it is already longer. O((V + E) log V).", ["lc.graphs", "lc.heap"],
    ["Why does B's distance improve after C is settled?", "What does the 'stale entry' skip protect against?", "Why does Dijkstra fail with negative edge weights?"],
    { inputs: [{ k: "s", label: "Start", value: "A", options: WG.nodes.map(([v]) => [v, v]) }],
      code: ["dist = {src: 0}; pq = [(0, src)]", "while pq:", "    d, v = heappop(pq)", "    if d > dist[v]: continue        # stale entry", "    for w, cost in adj[v]:", "        if d + cost < dist.get(w, inf):", "            dist[w] = d + cost        # found a shorter way", "            heappush(pq, (dist[w], w))"],
      frames: (inp) => { const src = inp.s, adj = {}, dist = {}, done = new Set(), F = [], par = {}; let pq = []; WG.nodes.forEach(([v]) => (adj[v] = [])); WG.edges.forEach(([a, b, c]) => { adj[a].push([b, c]); adj[b].push([a, c]); });
        const fr = (line, note, cur, hot = []) => F.push({ line, note, graph: { h: 260, nodes: WG.nodes.map(([v, x, y]) => ({ id: v, label: v, x, y, sub: dist[v] === undefined ? "∞" : dist[v], subTone: done.has(v) ? "ok" : "cur", tone: v === cur ? "cur" : done.has(v) ? "ok" : dist[v] !== undefined ? "alt" : undefined })), edges: WG.edges.map(([a, b, c]) => [a, b, { label: c, tone: hot.includes(a + b) || hot.includes(b + a) ? "cur" : (par[b] === a && done.has(b)) || (par[a] === b && done.has(a)) ? "ok" : undefined }]) }, panels: [{ name: "priority queue (dist, node)", items: pq.slice().sort((x, y) => x[0] - y[0]).map(([d, v]) => `(${d},${v})`) }, { name: "settled", items: [...done] }] });
        dist[src] = 0; pq.push([0, src]); fr(0, `Distance to ${src} is 0; everything else is ∞.`);
        while (pq.length) { pq.sort((x, y) => x[0] - y[0]); const [d, v] = pq.shift();
          if (d > dist[v] || done.has(v)) { fr(3, `Pop (${d}, ${v}), but ${v} was already settled at ${dist[v]}: a stale entry. Skip it.`, v); continue; }
          done.add(v); fr(2, `Pop the closest node: ${v} at distance ${d}. It's now final.`, v);
          adj[v].forEach(([w, c]) => { if (done.has(w)) return; if (d + c < (dist[w] === undefined ? Infinity : dist[w])) { const old = dist[w]; dist[w] = d + c; par[w] = v; pq.push([dist[w], w]); fr(6, `Via ${v}: ${d} + ${c} = ${d + c} < ${old === undefined ? "∞" : old}. Update ${w}.`, v, [v + w]); } else fr(5, `Via ${v}: ${d} + ${c} = ${d + c}, no better than ${dist[w]}.`, v, [v + w]); }); }
        fr(7, `All shortest distances from ${src}: ${WG.nodes.map(([v]) => `${v}=${dist[v]}`).join(", ")}. Green edges form the shortest-path tree.`); return F; } });

  /* ===== 18. tree DFS ===== */
  const buildTree = (s) => { const t = String(s).split(/[\s,]+/).filter(Boolean).map((x) => (x === "null" || x === "#" ? null : Number(x))); if (!t.length || t[0] === null) throw new Error("Give a level-order list like 3, 9, 20, null, null, 15, 7."); if (t.length > 15) throw new Error("Use at most 15 entries.");
    const nodes = [{ i: 0, v: t[0], l: null, r: null }], q = [nodes[0]]; let k = 1; while (q.length && k < t.length) { const n = q.shift(); ["l", "r"].forEach((side) => { if (k < t.length) { if (t[k] !== null) { const c = { i: nodes.length, v: t[k], l: null, r: null }; nodes.push(c); n[side] = c; q.push(c); } k++; } }); }
    let ord = 0; const pos = (n, d) => { if (!n) return; pos(n.l, d + 1); n.x = ord++; n.d = d; pos(n.r, d + 1); }; pos(nodes[0], 0); nodes.forEach((n) => (n.x = nodes.length === 1 ? 0.5 : n.x / (nodes.length - 1))); return nodes; };
  V("lc-treedfs", "Tree recursion: maximum depth", "Most tree problems are one recursive function: solve the left subtree, solve the right, combine. Watch the call stack grow on the way down and answers flow back up.", ["lc.trees"],
    ["When does the first return happen, and what does it return?", "How deep does the call stack get? How does that relate to the tree's height?", "Change the combine step to 1 + l + r. What does it compute now?"],
    { inputs: [{ k: "t", label: "Tree (level order)", value: "3, 9, 20, null, null, 15, 7, null, null, 4", w: 280 }],
      code: ["def depth(node):", "    if not node:", "        return 0", "    l = depth(node.left)", "    r = depth(node.right)", "    return 1 + max(l, r)"],
      frames: (inp) => { const N = buildTree(inp.t), F = [], stack = [], val = {};
        const fr = (line, note, cur) => F.push({ line, note, tree: { r: 16, nodes: N.map((n) => ({ id: n.i, label: n.v, x: n.x, d: n.d, tone: n.i === cur ? "cur" : val[n.i] !== undefined ? "ok" : stack.includes(n.i) ? "win" : undefined, sub: val[n.i] !== undefined ? "h=" + val[n.i] : "" })), edges: N.flatMap((n) => [n.l, n.r].filter(Boolean).map((c) => [n.i, c.i, stack.includes(c.i) || val[c.i] !== undefined ? "win" : undefined])) }, panels: [{ name: "call stack", items: stack.map((i) => `depth(${N[i].v})`), hl: [stack.length - 1], top: true }] });
        const go = (n) => { if (!n) return 0; stack.push(n.i); fr(0, `Call depth(${n.v}).`, n.i); const l = go(n.l); fr(3, `Left subtree of ${n.v} has height ${l}.`, n.i); const r = go(n.r); fr(4, `Right subtree of ${n.v} has height ${r}.`, n.i); val[n.i] = 1 + Math.max(l, r); fr(5, `depth(${n.v}) = 1 + max(${l}, ${r}) = <b>${val[n.i]}</b>. Return it and pop the frame.`, n.i); stack.pop(); return val[n.i]; };
        const h = go(N[0]); fr(5, `Maximum depth: <b>${h}</b>. Every node is visited once (O(n)); the stack is as deep as the tree is tall (O(h)).`); return F; } });

  /* watch mode for lessons: auto-playing, looping, no inputs */
  GR.vizPlay = (host, id, input, o = {}) => { const d = D[id]; if (d && d.def) player(host, d.def, Object.assign({ input, auto: true, compact: true, speed: 2 }, o)); };

  /* all LeetCode visualizers in teaching order, for the hub */
  GR.lcViz = ["lc-twoptr", "lc-window", "lc-prefix", "lc-kadane", "lc-bsearch", "lc-monostack", "lc-fastslow", "lc-treedfs", "lc-heap", "lc-trie", "lc-backtrack", "lc-gridbfs", "lc-topo", "lc-unionfind", "lc-dijkstra", "lc-dp1", "lc-lcs", "lc-intervals"];
})();
