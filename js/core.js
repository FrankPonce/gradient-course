/* Gradient — core: registry, seeded RNG, storage, mastery engine, question drawing */
(function () {
  const GR = (window.GR = { tracks: [], skills: {}, bank: [], diagrams: {}, problems: [] });

  /* ---------- utils ---------- */
  GR.hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(36); };
  GR.hashNum = (s) => parseInt(GR.hash(s), 36);
  GR.rng = (seed) => {
    let a = (seed >>> 0) || 1;
    const f = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    f.int = (lo, hi) => lo + Math.floor(f() * (hi - lo + 1));
    f.pick = (arr) => arr[Math.floor(f() * arr.length)];
    f.shuffle = (arr) => { arr = arr.slice(); for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
    f.gauss = () => { let u = 0, v = 0; while (!u) u = f(); v = f(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    return f;
  };
  GR.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  GR.sig = (x) => 1 / (1 + Math.exp(-x));
  GR.fmtDate = (ts) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  GR.fmtDur = (s) => { s = Math.round(s); const m = Math.floor(s / 60); return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m ${String(s % 60).padStart(2, "0")}s`; };

  /* ---------- curriculum registry ---------- */
  GR.track = (t) => {
    GR.tracks.push(t); t.skills = [];
    t.modules.forEach((m, mi) => {
      m.track = t.id; m.id = `${t.id}-m${mi + 1}`; m.skills = [];
      m.topics.forEach((tp) => tp.lessons.forEach((l) => {
        GR.skills[l.skill] = { id: l.skill, name: l.title, track: t.id, module: m.id, topic: tp.name, lesson: l, related: l.related || [], diagram: l.diagram, order: Object.keys(GR.skills).length };
        t.skills.push(l.skill); m.skills.push(l.skill);
      }));
    });
  };
  GR.trackOf = (id) => GR.tracks.find((t) => t.id === id);
  GR.moduleOf = (id) => { for (const t of GR.tracks) for (const m of t.modules) if (m.id === id) return m; };

  /* ---------- question bank registry ----------
     Q(skill, difficulty 1-3, stem, [correct, wrong, wrong, wrong], explanation, [cross-linked skills])
     G(skill, difficulty, rng => ({stem, opts:[correct,...], expl}), [cross-linked skills])  -- parametric, new numbers every time */
  let gn = 0;
  GR.Q = (skill, diff, stem, opts, expl, also) => GR.bank.push({ id: "q" + GR.hash(stem), skill, diff, stem, opts, expl, also: also || [] });
  GR.G = (skill, diff, gen, also) => GR.bank.push({ id: "g" + skill + "." + gn++, skill, diff, gen, also: also || [] });
  /* numeric options helper: correct value, candidate distractors, formatter -> 4 distinct strings, correct first */
  GR.nopts = (c, ws, f = (x) => String(x)) => {
    const out = [f(c)];
    for (const w of ws) { const s = f(w); if (!out.includes(s) && out.length < 4) out.push(s); }
    let k = 1;
    while (out.length < 4 && k < 60) {
      const sg = k % 2 ? 1 : -1, m = Math.ceil(k / 2);
      const v = Number.isInteger(c) ? c + sg * m : c * (1 + sg * m * 0.17) || sg * m * 0.1;
      const s = f(v); if (!out.includes(s) && (c < 0 || v >= 0)) out.push(s); k++;
    }
    return out;
  };
  GR.inst = (item, r) => {
    let q, opts;
    for (let tries = 0; tries < 10; tries++) {
      q = item.gen ? item.gen(r) : item;
      opts = q.opts.map((o) => String(o).trim());
      if (new Set(opts).size === opts.length) break;   // a generator produced two identical options: draw again
    }
    opts = opts.filter((o, i) => opts.indexOf(o) === i);
    const order = r.shuffle(opts.map((_, i) => i));
    return { id: item.id, skill: item.skill, also: item.also, diff: item.diff, gen: !!item.gen, stem: q.stem, options: order.map((i) => opts[i]), answer: order.indexOf(0), expl: q.expl };
  };

  /* ---------- case sets: several linked questions about one shared stimulus (table, code, chart, diagram) ----------
     S(skill, title, def) where def = { stim: html, parts: [[skill, diff, stem, [correct, ...wrong], expl, [cross skills]], ...] }
     or a function rng => def, which regenerates the data every time the case is drawn. */
  GR.sets = [];
  GR.S = (skill, title, def) => GR.sets.push({ id: "s" + GR.hash(title), skill, title, def, gen: typeof def === "function" });
  GR.instSet = (set, r, max = 99) => {
    let d;
    for (let tries = 0; tries < 12; tries++) { d = set.gen ? set.def(r) : set.def; if (d.parts.every((p) => new Set(p[3].map((o) => String(o).trim())).size === p[3].length)) break; }
    const parts = d.parts.slice(0, max);
    return parts.map(([skill, diff, stem, o, expl, also], i) => {
      const opts = o.map((x) => String(x).trim()).filter((x, k, a) => a.indexOf(x) === k), order = r.shuffle(opts.map((_, k) => k));
      return { id: set.id + "." + i, skill, also: also || [], diff, gen: set.gen, stem, options: order.map((k) => opts[k]), answer: order.indexOf(0), expl, stim: d.stim, setTitle: set.title, part: i + 1, parts: parts.length };
    });
  };
  /* stimulus helpers */
  GR.tbl = (head, rows, cap) => `<div class="stw"><table class="stbl">${cap ? `<caption>${cap}</caption>` : ""}<tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((rw) => `<tr>${rw.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table></div>`;
  GR.code = (s) => `<pre>${GR.esc(s)}</pre>`;
  const VC = ["var(--navy)", "var(--or)", "var(--pink)", "var(--green)", "var(--blue)"];
  GR.viz = {
    /* line chart: series = [{name, pts:[y...]}], labels = x labels */
    line({ series, labels = [], w = 520, h = 230, ymin, ymax, yl = "", title = "" }) {
      const all = series.flatMap((s) => s.pts); ymin = ymin === undefined ? Math.min(0, ...all) : ymin; ymax = ymax === undefined ? Math.max(...all) * 1.08 : ymax;
      const n = series[0].pts.length, x0 = 46, x1 = w - 12, y0 = h - 30, y1 = title ? 30 : 14, X = (i) => x0 + (i / Math.max(1, n - 1)) * (x1 - x0), Y = (v) => y0 - ((v - ymin) / (ymax - ymin)) * (y0 - y1);
      let g = title ? `<text x="${x0}" y="16" font-size="12" font-weight="700" fill="var(--ink)">${title}</text>` : "";
      for (let k = 0; k <= 4; k++) { const v = ymin + ((ymax - ymin) * k) / 4; g += `<line x1="${x0}" x2="${x1}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--rule)"/><text x="${x0 - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="10.5" fill="var(--mute)">${+v.toFixed(2)}</text>`; }
      const every = Math.ceil(n / 8); labels.forEach((l, i) => { if (i % every === 0 || i === n - 1) g += `<text x="${X(i)}" y="${h - 12}" text-anchor="middle" font-size="10.5" fill="var(--mute)">${l}</text>`; });
      series.forEach((s, k) => { const c = s.color || VC[k]; g += `<path d="${s.pts.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join("")}" fill="none" stroke="${c}" stroke-width="2.5"${s.dash ? ' stroke-dasharray="6 4"' : ""}/>` + s.pts.map((v, i) => `<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="2.8" fill="${c}"/>`).join(""); });
      if (yl) g += `<text x="4" y="${y1 - 2}" font-size="10.5" fill="var(--mute)">${yl}</text>`;
      return `<div class="vz"><svg viewBox="0 0 ${w} ${h}" style="max-width:${w}px">${g}</svg><div class="vzl">${series.map((s, k) => `<span><i style="background:${s.color || VC[k]}"></i>${s.name}</span>`).join("")}</div></div>`;
    },
    /* bar chart; ymin > 0 draws a deliberately truncated axis */
    bars({ labels, vals, w = 420, h = 220, ymin = 0, ymax, color = VC[0], fmt = (v) => v, title = "" }) {
      ymax = ymax === undefined ? Math.max(...vals) * 1.1 : ymax; const x0 = 44, x1 = w - 10, y0 = h - 30, y1 = title ? 34 : 18, bw = (x1 - x0) / vals.length, Y = (v) => y0 - ((v - ymin) / (ymax - ymin)) * (y0 - y1);
      let g = title ? `<text x="${x0}" y="16" font-size="12" font-weight="700" fill="var(--ink)">${title}</text>` : "";
      for (let k = 0; k <= 4; k++) { const v = ymin + ((ymax - ymin) * k) / 4; g += `<line x1="${x0}" x2="${x1}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--rule)"/><text x="${x0 - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="10.5" fill="var(--mute)">${+v.toFixed(1)}</text>`; }
      vals.forEach((v, i) => { g += `<rect x="${x0 + i * bw + bw * 0.18}" y="${Y(v)}" width="${bw * 0.64}" height="${Math.max(0, y0 - Y(v))}" rx="4" fill="${Array.isArray(color) ? color[i] : color}"/><text x="${x0 + i * bw + bw / 2}" y="${Y(v) - 5}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink)">${fmt(v)}</text><text x="${x0 + i * bw + bw / 2}" y="${h - 12}" text-anchor="middle" font-size="10.5" fill="var(--ink2)">${labels[i]}</text>`; });
      return `<div class="vz"><svg viewBox="0 0 ${w} ${h}" style="max-width:${w}px">${g}</svg></div>`;
    },
    /* node-link graph: nodes {A:[x,y]}, edges [[a,b,label]] */
    graph({ nodes, edges, w = 460, h = 220 }) {
      let g = ""; edges.forEach(([a, b, l]) => { const [x1, y1] = nodes[a], [x2, y2] = nodes[b]; g += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--mute)" stroke-width="2"/>`; if (l !== undefined) g += `<rect x="${(x1 + x2) / 2 - 11}" y="${(y1 + y2) / 2 - 10}" width="22" height="19" rx="5" fill="var(--bg)"/><text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 + 4}" text-anchor="middle" font-size="12" font-weight="800" fill="var(--pink)">${l}</text>`; });
      Object.entries(nodes).forEach(([k, [x, y]]) => (g += `<circle cx="${x}" cy="${y}" r="18" fill="var(--paper)" stroke="var(--navy)" stroke-width="2.5"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="var(--ink)">${k}</text>`));
      return `<div class="vz"><svg viewBox="0 0 ${w} ${h}" style="max-width:${w}px">${g}</svg></div>`;
    },
  };

  /* ---------- storage ---------- */
  const KEY = "gradient.v1";
  const blank = () => ({ skills: {}, seen: {}, sessions: [], snap: {}, code: {}, lessons: {}, created: Date.now() });
  try { GR.state = JSON.parse(localStorage.getItem(KEY)) || blank(); } catch (e) { GR.state = blank(); }
  GR.save = () => {
    const d = new Date().toISOString().slice(0, 10), snap = {};
    GR.tracks.forEach((t) => (snap[t.id] = Math.round(GR.trackMastery(t.id) * 1000) / 10));
    GR.state.snap[d] = snap;
    // keep full question review only for the 40 most recent sessions to bound storage
    GR.state.sessions.slice(0, -40).forEach((s) => delete s.items);
    try { localStorage.setItem(KEY, JSON.stringify(GR.state)); } catch (e) { console.warn("save failed", e); }
  };
  GR.reset = () => { GR.state = blank(); GR.save(); };
  GR.exportData = () => JSON.stringify(GR.state);
  GR.importData = (txt) => { const d = JSON.parse(txt); if (!d.skills || !d.sessions) throw new Error("Not a Gradient progress file"); GR.state = Object.assign(blank(), d); GR.save(); };

  /* ---------- mastery engine (Elo-style item response) ----------
     Each skill has an ability estimate th. A question of difficulty b is answered correctly with
     probability 0.25 (guessing) + 0.75*sigmoid(th - b). After each answer th moves toward the evidence,
     with a step that shrinks as attempts accumulate. Hard questions answered right move th more
     than easy ones; easy ones answered wrong cost more. */
  const B = [0, -1, 0, 1];
  const upd = (sid, correct, diff, w) => {
    if (!GR.skills[sid]) return;
    const s = GR.state.skills[sid] || (GR.state.skills[sid] = { th: -1, n: 0, c: 0, h: [], t: 0 });
    const p = 0.25 + 0.75 * GR.sig(s.th - B[diff]);
    const K = Math.max(0.3, 0.9 / Math.sqrt(1 + s.n / 3));
    s.th = Math.max(-3, Math.min(3.5, s.th + K * w * ((correct ? 1 : 0) - p)));
    s.n += w; s.c += correct ? w : 0; s.t = Date.now();
    if (w >= 1) { s.h.push([s.t, correct ? 1 : 0, diff]); if (s.h.length > 60) s.h.shift(); }
  };
  GR.record = (q, correct, w = 1) => {
    upd(q.skill, correct, q.diff, w);
    (q.also || []).forEach((a) => upd(a, correct, q.diff, w * 0.5));
    if (!q.gen) { const e = GR.state.seen[q.id] || (GR.state.seen[q.id] = { n: 0, c: 0 }); e.n++; e.c += correct ? 1 : 0; }
  };
  GR.mastery = (sid) => { const s = GR.state.skills[sid]; return s && s.n ? GR.sig(1.3 * s.th) : 0; };
  GR.LEVELS = ["Not started", "Needs work", "Familiar", "Proficient", "Mastered"];
  GR.level = (sid) => { const s = GR.state.skills[sid]; if (!s || !s.n) return 0; const m = GR.mastery(sid); return m >= 0.8 && s.n >= 5 ? 4 : m >= 0.6 ? 3 : m >= 0.4 ? 2 : 1; };
  GR.trackMastery = (tid) => { const t = GR.trackOf(tid); return t.skills.reduce((a, s) => a + GR.mastery(s), 0) / t.skills.length; };
  GR.groupMastery = (sids) => sids.reduce((a, s) => a + GR.mastery(s), 0) / (sids.length || 1);
  /* trend: accuracy over the latest 5 attempts minus the 5 before them (null if not enough history) */
  GR.trend = (sid) => {
    const s = GR.state.skills[sid]; if (!s || s.h.length < 8) return null;
    const h = s.h.slice(-10), k = Math.min(5, Math.floor(h.length / 2));
    const acc = (a) => a.reduce((x, e) => x + e[1], 0) / a.length;
    return acc(h.slice(-k)) - acc(h.slice(-2 * k, -k));
  };
  GR.recentAcc = (sid, k = 5) => { const s = GR.state.skills[sid]; if (!s || !s.h.length) return null; const h = s.h.slice(-k); return { acc: h.reduce((x, e) => x + e[1], 0) / h.length, k: h.length }; };

  /* what to study next: weak + stale + slipping skills first, then the next unstarted lesson in sequence */
  GR.recommend = (tid, limit = 6) => {
    const now = Date.now(), out = [];
    const ids = tid ? GR.trackOf(tid).skills : Object.keys(GR.skills);
    ids.forEach((sid) => {
      const sk = GR.skills[sid], s = GR.state.skills[sid], t = GR.trackOf(sk.track), i = t.skills.indexOf(sid);
      if (!s || !s.n) {
        const prev = i === 0 || (GR.state.skills[t.skills[i - 1]] || {}).n > 0;
        if (prev) out.push({ sid, score: 0.52 - i * 0.004, why: i === 0 ? "Start of the track" : "Next lesson in sequence", kind: "new" });
        return;
      }
      const m = GR.mastery(sid), days = (now - s.t) / 864e5, tr = GR.trend(sid), ra = GR.recentAcc(sid), why = [];
      let score = (1 - m) * 0.8;
      if (ra && ra.k >= 3 && ra.acc < 0.6) why.push(`${Math.round(ra.acc * 100)}% on your last ${ra.k}`);
      if (tr !== null && tr <= -0.2) { score += 0.15; why.push("slipping recently"); }
      if (days > 7) { score += Math.min(0.2, days / 70); why.push(`not practiced in ${Math.round(days)} days`); }
      if (!why.length) why.push(m < 0.6 ? "below proficient" : "keep it fresh");
      if (m < 0.8 || days > 7) out.push({ sid, score, why: why.join(" · "), kind: "review" });
    });
    return out.sort((a, b) => b.score - a.score).slice(0, limit);
  };

  /* ---------- drawing questions ----------
     Round-robins across the requested skills so coverage is balanced; within a skill it prefers
     hand-written items you have seen least, mixed with parametric items that regenerate numbers. */
  GR.poolSize = (sids) => { const b = GR.bank.filter((x) => sids.includes(x.skill)); return { fixed: b.filter((x) => !x.gen).length, gens: b.filter((x) => x.gen).length, sets: GR.sets.filter((x) => sids.includes(x.skill)).length }; };
  GR.draw = ({ skills, n, seed, genShare = 0.3, setShare = 0.25, weights }) => {
    const r = GR.rng(seed || (Date.now() & 0x7fffffff));
    const seen = (b) => (GR.state.seen[b.id] ? GR.state.seen[b.id].n : 0), setSeen = (s) => (GR.state.seen[s.id + ".0"] ? GR.state.seen[s.id + ".0"].n : 0);
    const pools = {}, genUse = {}, blocks = [];
    let count = 0, fromSets = 0;
    skills.forEach((s) => {
      const items = GR.bank.filter((b) => b.skill === s);
      pools[s] = { st: r.shuffle(items.filter((b) => !b.gen)).sort((a, b) => seen(a) - seen(b)), g: items.filter((b) => b.gen), sets: r.shuffle(GR.sets.filter((x) => x.skill === s)).sort((a, b) => setSeen(a) - setSeen(b)) };
    });
    const order = [];
    skills.forEach((s) => { const w = weights ? weights[s] || 1 : 1; for (let i = 0; i < w; i++) order.push(s); });
    let guard = 0;
    while (count < n && guard++ < 40) {
      let added = 0;
      for (const s of r.shuffle(order)) {
        if (count >= n) break;
        const p = pools[s], gOK = p.g.filter((g) => (genUse[g.id] || 0) < 2);
        // a multi-part case stays together as one block; cases make up at most about half of a session
        if (p.sets.length && n - count >= 3 && fromSets < n * 0.3 && r() < setShare) { const b = GR.instSet(p.sets.shift(), r, n - count); blocks.push(b); count += b.length; fromSets += b.length; added++; continue; }
        let item = null;
        if (gOK.length && (r() < genShare || !p.st.length)) { item = r.pick(gOK); genUse[item.id] = (genUse[item.id] || 0) + 1; }
        else if (p.st.length) item = p.st.shift();
        if (item) { blocks.push([GR.inst(item, r)]); count++; added++; }
      }
      if (!added) break;
    }
    return r.shuffle(blocks).flat();
  };

  /* scaled score for mock tests: difficulty-weighted, 200-800 like a standardized test section */
  GR.scaled = (items, picks) => {
    let got = 0, max = 0;
    items.forEach((q, i) => { const w = [0, 1, 1.5, 2][q.diff]; max += w; if (picks[i] === q.answer) got += w; });
    return Math.round((200 + 600 * (max ? got / max : 0)) / 10) * 10;
  };
})();
