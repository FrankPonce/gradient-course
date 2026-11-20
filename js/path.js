/* Gradient — courses as training programs with a speedrun log.
   A course is weeks (units) of sessions (lessons). Finished sessions are stamped; each keeps a split
   (best time, accuracy) that turns gold when a replay beats it.
   GR.course(id, {title, short, blurb, color, units:[{title, sub, guide, lessons:[{title, skill, kind, cards}]}], testPool})
     lesson.kind: learn | drill | problem | pr | test      lesson.cards: an array, or (rng) => array
   Card kinds:
     learn {text, title, viz:{id,input,code}, anim, try}   mcq {prompt, opts:[correct,...], code, stim, why}
     fill  {prompt, code with ___, answers, extra, why}    ord {prompt, lines, extra, why}
     rank  {prompt, items:[in correct order], why}          match {prompt, pairs:[[a,b],...], why}
     bins  {prompt, bins:[names], items:[[text,binIndex]], why}
     bug   {prompt, lines:[...], bug: lineIndex, why}       num {prompt, answer, tol, unit, code, why}
   Routes: #/path/<course>  #/learn/<course>/<nodeId> */
(function () {
  const E = GR.esc, $ = (s, r = document) => r.querySelector(s);
  const C = (GR.courses = GR.courses || {});
  const LIVES = 5, REFILL = 20, GOAL = 50;
  const rngNow = () => GR.rng((Date.now() ^ (Math.random() * 1e9)) >>> 0);
  const shuffle = (a) => rngNow().shuffle(a);
  const pickOne = (a) => a[Math.floor(Math.random() * a.length)];
  const PRAISE = ["Clean rep.", "Correct.", "That's the one.", "Nailed it.", "Good lift.", "Right."];
  const KIND = { learn: "Learn", drill: "Drill", problem: "Problem", pr: "PR attempt", test: "Test", skip: "Skip-ahead exam" };
  const SKIP_PASS = 0.8;
  const ROLES = [["Data analyst", ["fnd", "ba", "ds"]], ["Data scientist", ["fnd", "ds", "ml", "ba", "sd"]], ["ML engineer", ["fnd", "ml", "ai", "sd", "lc"]], ["AI engineer", ["fnd", "ai", "ag", "sd"]], ["Business analyst", ["fnd", "ba", "fin"]], ["Software engineer", ["lc", "swe", "sd"]]];
  const KIND_EX = { mcq: "Multiple choice", fill: "Fill the blanks", ord: "Order the lines", rank: "Rank", match: "Match pairs", bins: "Sort into groups", bug: "Find the bug", num: "Work it out", learn: "Watch and read" };
  const fmtT = (s) => (s === undefined || s === null ? "–" : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`);

  const slug = (t) => String(t).toLowerCase().replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  GR.course = (id, def) => {
    const nodes = [], used = new Set();
    def.units.forEach((u, ui) => { u.i = ui;
      u.lessons.forEach((l) => { if (!l.id) { const base = `${id}-${slug(u.title)}-${slug(l.title)}`; let k = base, n = 2; while (used.has(k)) k = `${base}-${n++}`; l.id = k; } used.add(l.id); l.unit = ui; l.kind = l.kind || "learn"; nodes.push(l); });
      if (!u.noTest) nodes.push({ id: `${id}-${slug(u.title)}-test`, title: `Week ${ui + 1} test`, kind: "test", unit: ui, skill: u.lessons[0] && u.lessons[0].skill, auto: true });
    });
    C[id] = Object.assign(def, { id, nodes });
  };
  /* skip-ahead exam: a virtual node (never stored in c.nodes) that covers every week before unit t */
  const skipN = (t) => Math.min(40, 14 + 6 * t);
  const findNode = (c, id) => { const n = c.nodes.find((x) => x.id === id); if (n) return n; const m = /-skip-(\d+)$/.exec(id || ""), t = m ? +m[1] : 0; return t >= 1 && t < c.units.length && id === `${c.id}-skip-${t}` ? { id, title: `Skip-ahead exam: Week ${t + 1}`, kind: "skip", unit: t, n: skipN(t), skill: c.units[0].lessons[0] && c.units[0].lessons[0].skill } : null; };
  /* append a hand-authored week to an existing program (used by the interview-loop weeks); ids are stable slugs, so saved progress never shifts */
  GR.courseAddUnit = (id, u) => { const c = C[id]; if (!c) return; const ui = c.units.length; u.i = ui; const used = new Set(c.nodes.map((n) => n.id));
    u.lessons.forEach((l) => { if (!l.id) { const base = `${id}-${slug(u.title)}-${slug(l.title)}`; let k = base, n = 2; while (used.has(k)) k = `${base}-${n++}`; l.id = k; } used.add(l.id); l.unit = ui; l.kind = l.kind || "learn"; c.nodes.push(l); });
    c.nodes.push({ id: `${id}-${slug(u.title)}-test`, title: `Week ${ui + 1} test`, kind: "test", unit: ui, skill: u.lessons[0] && u.lessons[0].skill, auto: true }); c.units.push(u); };
  GR.courseAddLessons = (id, unitIndex, lessons) => { const c = C[id]; if (!c || !c.units[unitIndex]) return; const u = c.units[unitIndex], used = new Set(c.nodes.map((n) => n.id));
    const ti = c.nodes.findIndex((n) => n.unit === unitIndex && n.kind === "test"), at = ti < 0 ? c.nodes.length : ti;
    lessons.forEach((l, k) => { if (!l.id) { const base = `${id}-${slug(u.title)}-${slug(l.title)}`; let key = base, n = 2; while (used.has(key)) key = `${base}-${n++}`; l.id = key; } used.add(l.id); l.unit = unitIndex; l.kind = l.kind || "problem"; c.nodes.splice(at + k, 0, l); u.lessons.push(l); }); };
  GR.ivKit = { T: (text, viz, title) => ({ k: "learn", text, viz, title }), Q: (prompt, opts, why, code) => ({ k: "mcq", prompt, opts, why, code }), F: (prompt, code, answers, extra, why) => ({ k: "fill", prompt, code, answers, extra, why }), O: (prompt, lines, why, extra) => ({ k: "ord", prompt, lines, why, extra }), RK: (prompt, items, why) => ({ k: "rank", prompt, items, why }), M: (prompt, pairs, why) => ({ k: "match", prompt, pairs, why }), BN: (prompt, bins, items, why) => ({ k: "bins", prompt, bins, items, why }), BUG: (prompt, lines, bug, why) => ({ k: "bug", prompt, lines, bug, why }), NUM: (prompt, answer, why, code, tol, unit) => ({ k: "num", prompt, answer, why, code, tol, unit }),
    L: (title, skill, cards, kind) => ({ title, skill, cards, kind }),
    SAY: (prompt, model, checks) => ({ k: "say", prompt, model, checks }),
    /* v = { js: [fn, starter, sol], py: [fn, starter, sol] }: both languages share the same tests */
    CODE: (prompt, v, tests, cmp, why) => { const o = {}; Object.keys(v).forEach((l) => { o[l] = { fn: v[l][0], starter: v[l][1], sol: v[l][2] }; }); return { k: "code", prompt, v: o, tests, cmp, why }; },
    /* an interviewer's escalating follow-ups: each is a multiple-choice card labeled with its step */
    CH: (...qs) => qs.map((q, i) => (i ? Object.assign({}, q, { prompt: `<span class="ch-tag">Follow-up ${i}</span> ${q.prompt}` }) : q)) };
  const ps = (cid) => { const p = (GR.state.path = GR.state.path || {}); return (p[cid] = p[cid] || { done: {} }); };
  const curIdx = (c) => { const d = ps(c.id).done, k = c.nodes.findIndex((n) => !d[n.id]); return k < 0 ? c.nodes.length : k; };
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const todayXp = () => (GR.game.state().days || {})[today()] || 0;
  GR.pathNext = (cid) => { const c = C[cid]; if (!c) return null; const k = curIdx(c); return k < c.nodes.length ? { node: c.nodes[k], unit: c.units[c.nodes[k].unit], k, total: c.nodes.length } : null; };

  /* ---------- building a session's cards ---------- */
  const resolve = (node, rng) => (typeof node.cards === "function" ? node.cards(rng) : (node.cards || []).slice());
  const cardsFor = (c, node) => {
    const rng = rngNow();
    if (node.kind === "skip") { const pool = [];
      c.units.slice(0, node.unit).forEach((u) => { u.lessons.forEach((l) => resolve(l, rng).filter((x) => x.k !== "learn").forEach((x) => pool.push(Object.assign({ skill: l.skill }, x)))); if (c.testPool) c.testPool(u, rng).forEach((x) => pool.push(x)); });
      const hard = rng.shuffle(pool).sort((a, b) => (b.d || 2) - (a.d || 2)).slice(0, Math.ceil(skipN(node.unit) * 1.6)); return rng.shuffle(hard).slice(0, skipN(node.unit)); }
    if (node.kind !== "test") return resolve(node, rng);
    const ls = c.units[node.unit].lessons, pool = ls.flatMap((l) => resolve(l, rng).filter((x) => x.k !== "learn").map((x) => Object.assign({ skill: l.skill }, x)));
    const extra = c.testPool ? c.testPool(c.units[node.unit], rng) : [];
    return rng.shuffle(pool.concat(extra)).slice(0, 10);
  };
  GR.pathCards = (cid, id) => { const c = C[cid], n = c && findNode(c, id); return n ? cardsFor(c, n) : []; };

  /* ---------- icons (authored, one stroke weight) ---------- */
  const I = {
    bolt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>`,
    x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
    book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 5v16M8 7h7"/></svg>`,
    grip: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>`,
    up: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>`,
    down: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`,
  };

  /* ---------- the program sheet ---------- */
  let justDone = null;
  const est = (node) => { const n = node.n || (Array.isArray(node.cards) ? node.cards.length : node.kind === "test" ? 10 : 8); return Math.max(2, Math.round(n * 0.6)); };
  const breakdown = (node) => { if (!Array.isArray(node.cards) && node.kind === "learn") return [["Read and watch", Math.max(1, (node.n || 7) - 4)], ["Key points", 1], ["Quick checks", 3]]; if (!Array.isArray(node.cards) && node.kind === "pr") return [["Case questions on one scenario", "4–5"]]; const cards = Array.isArray(node.cards) ? node.cards : null; if (!cards) return node.kind === "test" ? [["Mixed exercises from the week", 10]] : [["Fresh exercises each time", 8]]; const m = {}; cards.forEach((x) => (m[x.k] = (m[x.k] || 0) + 1)); return Object.entries(m).map(([k, v]) => [KIND_EX[k] || k, v]); };
  const pathView = (main, cid) => {
    const c = C[cid]; if (!c) { main.innerHTML = `<p class="muted">No such course.</p>`; return; }
    GR.state.pathLast = cid;
    const d = ps(cid).done, k = curIdx(c), g = GR.game.state(), tx = todayXp(), golds = c.nodes.filter((n) => d[n.id] && d[n.id].gold).length, sob = c.nodes.reduce((a, n) => a + ((d[n.id] && d[n.id].best) || 0), 0), nx = k < c.nodes.length ? c.nodes[k] : null;
    const weekBar = c.units.map((u) => { const un = c.nodes.filter((x) => x.unit === u.i), f = un.filter((x) => d[x.id]).length; return `<i title="Week ${u.i + 1}: ${E(u.title)} (${f}/${un.length})"><b style="width:${(f / un.length) * 100}%"></b></i>`; }).join("");
    const cell = (x) => { const i = c.nodes.indexOf(x), r = d[x.id], st = r ? "done" : i === k ? "now" : "locked";
      return `<button class="ses ${st} k-${x.kind} ${justDone === x.id ? "just" : ""} ${r && r.gold ? "gold" : ""}" data-pa="go" data-c="${cid}" data-id="${x.id}" ${st === "locked" ? `aria-disabled="true"` : ""}>
        <span class="ses-k">${KIND[x.kind] || "Session"}</span><span class="ses-t">${E(x.title)}</span>
        ${r ? `<span class="ses-stamp">${r.gold ? "Gold" : x.kind === "pr" ? "PR" : x.kind === "test" ? Math.round((r.bestAcc ?? r.acc) * 100) + "%" : "Done"}</span><span class="ses-split num"><span>${fmtT(r.best)}</span><span>${Math.round((r.bestAcc ?? r.acc) * 100)}%</span></span>` : st === "now" ? `<span class="ses-now">Up next</span>` : `<span class="ses-lock">${I.lock}</span>`}</button>`; };
    const panel = nx ? (() => { const u = c.units[nx.unit], r = d[nx.id]; return `<aside class="today"><h2>${E(nx.title)}</h2><p class="today-sub">${KIND[nx.kind]} · Week ${nx.unit + 1}, ${E(u.title)} · about ${est(nx)} min</p>
        <ul class="today-ex">${breakdown(nx).map(([l, n]) => `<li><span>${E(l)}</span><span class="num">×${n}</span></li>`).join("")}</ul>
        ${nx.kind === "pr" ? `<p class="today-note">${I.bolt}<span>The hardest problem of the week. Take your time: there's no clock to race on a first attempt.</span></p>` : ""}
        <button class="btn primary today-go" data-pa="go" data-c="${cid}" data-id="${nx.id}">${r ? "Run it again" : k ? "Begin session" : "Start the program"}</button>
        ${u.guide ? `<a class="today-guide" href="#/lesson/${u.guide}">${I.book}<span>Read this week's guidebook</span></a>` : ""}</aside>`; })() : `<aside class="today"><h2>Program complete</h2><p class="today-sub">Every session is stamped. Replay any of them to chase gold splits.</p></aside>`;
    main.innerHTML = `<div class="prg" style="--pc:${c.color}">
      <header class="prg-head"><h1>${E(c.title)}</h1><p class="lead">${E(c.blurb)}</p>
        <div class="prg-bar" aria-label="Progress by week">${weekBar}</div>
        <dl class="prg-stats"><div><dt>Sessions</dt><dd class="num">${Math.min(k, c.nodes.length)}<small>/${c.nodes.length}</small></dd></div><div><dt>Today</dt><dd class="num">${Math.min(tx, 999)}<small>/${GOAL} XP</small></dd></div><div><dt>Streak</dt><dd class="num">${g.streak || 0}<small> days</small></dd></div><div><dt>Gold splits</dt><dd class="num gold">${golds}</dd></div><div><dt>Sum of best</dt><dd class="num">${sob ? fmtT(sob) : "–"}</dd></div></dl></header>
      <div class="prg-body"><div class="sheet">${c.units.map((u) => { const un = c.nodes.filter((x) => x.unit === u.i), f = un.filter((x) => d[x.id]).length;
          return `<section class="wk ${f === un.length ? "wk-done" : ""}"><div class="wk-l"><span class="wk-n num">W${u.i + 1}</span><h2>${E(u.title)}</h2><p>${E(u.sub || "")}</p><span class="wk-c num">${f}/${un.length}</span>${u.i >= 1 && c.nodes.some((x) => x.unit < u.i && !d[x.id]) ? `<button class="btn wk-skip" data-pa="go" data-c="${cid}" data-id="${cid}-skip-${u.i}">Skip ahead to here</button>` : ""}</div><div class="wk-s">${un.map(cell).join("")}</div></section>`; }).join("")}</div>${panel}</div></div>`;
    const now = main.querySelector(".ses.now"); const rm = matchMedia("(prefers-reduced-motion:reduce)").matches;
    if (now && (justDone || !matchMedia("(max-width:980px)").matches)) setTimeout(() => now.scrollIntoView({ behavior: justDone && !rm ? "smooth" : "auto", block: "center" }), justDone ? 500 : 30);
    justDone = null;
  };

  /* ---------- the session runner ---------- */
  let R = null;
  const start = (cid, id) => {
    const c = C[cid], node = c && findNode(c, id); if (!node) return (location.hash = "#/path/" + cid);
    const cards = cardsFor(c, node), prev = ps(cid).done[id];
    if (!cards.length) { GR.game.toast("This session has no exercises yet."); return (location.hash = "#/path/" + cid); }
    R = { c, node, items: cards.map((card, i) => ({ card, i })), pos: 0, total: cards.length, cleared: new Set(), lives: LIVES, graded: 0, firstOk: 0, missed: new Set(), start: Date.now(), streak: 0, st: null, prev };
    GR.state.pathLast = cid; GR.game.sessionStart(); render();
  };
  const host = () => $("#main");
  const pips = () => `<span class="lives" aria-label="${R.lives} lives left">${Array.from({ length: LIVES }, (_, i) => `<i class="${i < R.lives ? "on" : ""}"></i>`).join("")}</span>`;
  const top = () => `<div class="ln-top"><button class="ln-x" data-pa="quit" aria-label="End session">${I.x}</button><div class="ln-rule" aria-label="Progress">${Array.from({ length: R.total }, (_, i) => `<i class="${R.cleared.has(i) ? "on" : ""}"></i>`).join("")}</div>${R.prev && R.prev.best ? `<span class="ln-pb num" title="Your best split">${I.clock}${fmtT(R.prev.best)}</span>` : ""}${pips()}</div>`;
  const codeHtml = (code) => `<pre class="ln-code">${E(code)}</pre>`;
  const render = () => {
    const it = R.items[R.pos], c = it.card, h = host(); R.st = { sel: null, slots: [], seq: [], answered: false, miss: 0 };
    let body = "", needCheck = true;
    if (c.k === "learn") { needCheck = false;
      body = `${c.title ? `<h2 class="ln-h">${E(c.title)}</h2>` : ""}<div class="ln-text">${c.text}</div>${c.anim ? `<div class="ln-viz" data-anim="${c.anim}"></div>` : ""}${c.viz ? `<div class="ln-viz"></div>` : ""}${c.code ? codeHtml(c.code) : ""}${c.try ? `<details class="ln-try"><summary>Try it yourself (optional)</summary><div class="ln-tryhost"></div></details>` : ""}`; }
    else if (c.k === "mcq") { const order = shuffle(c.opts.map((_, i) => i)); R.st.order = order;
      body = `<p class="ln-prompt">${c.prompt}</p>${c.stim ? `<div class="ln-stim">${c.stim}</div>` : ""}${c.code ? codeHtml(c.code) : ""}<div class="ln-opts ${c.opts.some((o) => String(o).length > 34) ? "long" : ""}" role="radiogroup">${order.map((oi, j) => `<button class="ln-opt" role="radio" aria-checked="false" data-pa="sel" data-j="${j}"><span class="key">${j + 1}</span><span>${c.opts[oi]}</span></button>`).join("")}</div>`; }
    else if (c.k === "fill") { const chips = shuffle(c.answers.concat(c.extra || []).map((t, i) => ({ t, i }))); R.st.chips = chips; R.st.slots = c.answers.map(() => null); let si = 0;
      body = `<p class="ln-prompt">${c.prompt}</p><pre class="ln-code fill">${E(c.code).replace(/___/g, () => { const n = si++; return `<button class="slot" data-pa="unslot" data-s="${n}" aria-label="Blank ${n + 1}"></button>`; })}</pre><div class="ln-chips">${chips.map((ch, j) => `<button class="tok" data-pa="chip" data-j="${j}">${E(ch.t)}</button>`).join("")}</div>`; }
    else if (c.k === "ord") { const bank = shuffle(c.lines.concat(c.extra || []).map((t, i) => ({ t, i }))); R.st.bank = bank;
      body = `<p class="ln-prompt">${c.prompt}</p><div class="ord-ans" data-drop="ans"></div><div class="ord-bank">${bank.map((b, j) => `<button class="tok line" data-pa="pick" data-drag="b" data-j="${j}">${E(b.t)}</button>`).join("")}</div>`; }
    else if (c.k === "rank") { let o = shuffle(c.items.map((_, i) => i)); if (o.every((v, i) => v === i)) o = o.reverse(); R.st.seq = o; needCheck = false;
      body = `<p class="ln-prompt">${c.prompt}</p><ol class="rank" aria-label="Drag, or use the arrow buttons, to reorder"></ol>`; }
    else if (c.k === "match") { const L = shuffle(c.pairs.map((_, i) => i)), Rr = shuffle(c.pairs.map((_, i) => i)); R.st.L = L; R.st.R = Rr; R.st.done = new Set(); needCheck = false;
      body = `<p class="ln-prompt">${c.prompt}</p><div class="match"><div class="match-col">${L.map((i) => `<button class="tok mt" data-pa="ml" data-drag="m" data-i="${i}">${c.pairs[i][0]}</button>`).join("")}</div><div class="match-col">${Rr.map((i) => `<button class="tok mt" data-pa="mr" data-drop="m" data-i="${i}">${c.pairs[i][1]}</button>`).join("")}</div></div>`; }
    else if (c.k === "bins") { const its = shuffle(c.items.map((_, i) => i)); R.st.its = its; R.st.where = {};
      body = `<p class="ln-prompt">${c.prompt}</p><div class="bins-pool" data-drop="pool"></div><div class="bins" style="--n:${c.bins.length}">${c.bins.map((b, j) => `<div class="bin" data-pa="bin" data-drop="bin" data-b="${j}"><span class="bin-h">${E(b)}</span><div class="bin-in"></div></div>`).join("")}</div>`; }
    else if (c.k === "bug") { body = `<p class="ln-prompt">${c.prompt}</p><div class="bugcode" role="radiogroup">${c.lines.map((l, j) => `<button class="bugline" role="radio" aria-checked="false" data-pa="bsel" data-j="${j}"><span class="ln-no">${j + 1}</span><code>${E(l) || " "}</code></button>`).join("")}</div>`; }
    else if (c.k === "num") { body = `<p class="ln-prompt">${c.prompt}</p>${c.code ? codeHtml(c.code) : ""}<label class="numin"><input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="Your answer" placeholder="Your answer">${c.unit ? `<span>${E(c.unit)}</span>` : ""}</label>`; }
    else if (c.k === "say") { body = `<p class="ln-prompt">${c.prompt}</p><p class="say-tip">Answer out loud first, or type a few lines. Then compare.</p><textarea class="say-box" rows="4" spellcheck="false" aria-label="Your answer (optional)" placeholder="Your answer…"></textarea><button class="btn" data-pa="reveal">Reveal the model answer</button><div class="say-rev" hidden><div class="say-model">${c.model}</div><p class="say-q">Tick what you covered:</p>${c.checks.map((t, j) => `<label class="say-c"><input type="checkbox" data-j="${j}"><span>${t}</span></label>`).join("")}</div>`; }
    else if (c.k === "code") { const lang = codeLang(c); R.st.lang = lang; R.st.buf = {}; const v = c.v[lang];
      body = `<p class="ln-prompt">${c.prompt}</p><div class="code-lang" role="group" aria-label="Language">${["py", "js"].filter((l) => c.v[l]).map((l) => `<button class="btn sm ${l === lang ? "on" : ""}" data-pa="lang" data-l="${l}">${l === "py" ? "Python" : "JavaScript"}</button>`).join("")}</div><textarea class="code-box" rows="${Math.min(18, (v.starter.match(/\n/g) || []).length + 3)}" spellcheck="false" autocapitalize="off" aria-label="Your code">${E(v.starter)}</textarea><div class="code-row"><button class="btn" data-pa="runcode">Run tests</button><button class="btn" data-pa="giveup">Show the solution</button></div><div class="code-out" aria-live="polite"></div>`; }
    const label = c.k === "learn" ? "Continue" : c.k === "match" ? "Match all pairs" : c.k === "rank" ? "Check order" : "Check";
    h.innerHTML = `<div class="ln" data-kind="${c.k}">${top()}<div class="ln-body">${body}</div>
      <div class="ln-foot"><div class="ln-verdict" aria-live="polite"></div><button class="btn primary ln-go" data-pa="go2" ${c.k === "learn" || c.k === "rank" ? "" : "disabled"}>${label}</button></div></div>`;
    if (c.k === "learn") { if (c.viz) GR.vizPlay($(".ln-viz", h), c.viz.id, c.viz.input || {}, { code: !!c.viz.code }); if (c.anim) GR.anim($(".ln-viz", h), c.anim);
      if (c.try) { const d = $(".ln-try", h); d.addEventListener("toggle", () => { const th = $(".ln-tryhost", h); if (d.open && !th.childElementCount && GR.diagrams[c.try]) GR.diagrams[c.try].mount(th); }); } }
    if (c.k === "ord") drawOrd(); if (c.k === "rank") drawRank(); if (c.k === "bins") drawBins();
    if (c.k === "code") { const ta = $(".code-box", h); ta.addEventListener("keydown", (e) => { if (e.key === "Tab") { e.preventDefault(); const a = ta.selectionStart; ta.setRangeText("  ", a, ta.selectionEnd, "end"); } }); }
    if (c.k === "num") { const inp = $(".numin input", h); inp.addEventListener("input", () => (go().disabled = !inp.value.trim())); setTimeout(() => inp.focus(), 60); }
    window.scrollTo(0, 0);
  };
  const codeLang = (c) => { const pref = localStorage.getItem("gradient.codelang") || "py"; return c.v[pref] ? pref : c.v.py ? "py" : "js"; };
  const go = () => $(".ln-go", host());
  const drawOrd = () => { const c = R.items[R.pos].card, h = host();
    $(".ord-ans", h).innerHTML = R.st.seq.length ? R.st.seq.map((j, k) => `<button class="tok line in" data-pa="unpick" data-k="${k}">${E(R.st.bank[j].t)}</button>`).join("") : `<span class="hint">Tap or drag the lines into order.</span>`;
    h.querySelectorAll(".ord-bank .tok").forEach((b) => (b.disabled = R.st.seq.includes(+b.dataset.j) || R.st.answered)); go().disabled = R.st.seq.length !== c.lines.length; };
  const drawFill = () => { const h = host(); h.querySelectorAll(".slot").forEach((s, k) => { const j = R.st.slots[k]; s.textContent = j === null ? "" : R.st.chips[j].t; s.classList.toggle("on", j !== null); });
    h.querySelectorAll(".ln-chips .tok").forEach((b) => (b.disabled = R.st.slots.includes(+b.dataset.j) || R.st.answered)); go().disabled = R.st.slots.includes(null); };
  const drawRank = () => { const c = R.items[R.pos].card, h = host(), n = R.st.seq.length;
    $(".rank", h).innerHTML = R.st.seq.map((i, pos) => `<li class="tok rk ${R.st.sel === pos ? "sel" : ""}" data-pa="rsel" data-drag="r" data-drop="r" data-pos="${pos}" tabindex="0"><span class="grip">${I.grip}</span><span class="rk-t">${c.items[i]}</span><span class="rk-b"><button class="rk-mv" data-pa="rup" data-pos="${pos}" aria-label="Move up" ${pos === 0 || R.st.answered ? "disabled" : ""}>${I.up}</button><button class="rk-mv" data-pa="rdn" data-pos="${pos}" aria-label="Move down" ${pos === n - 1 || R.st.answered ? "disabled" : ""}>${I.down}</button></span></li>`).join(""); };
  const drawBins = () => { const c = R.items[R.pos].card, h = host(), chip = (i) => `<button class="tok bchip ${R.st.sel === i ? "sel" : ""}" data-pa="bpick" data-drag="c" data-i="${i}">${c.items[i][0]}</button>`;
    $(".bins-pool", h).innerHTML = R.st.its.filter((i) => R.st.where[i] === undefined).map(chip).join("") || `<span class="hint">All sorted. Check when ready.</span>`;
    h.querySelectorAll(".bin").forEach((b) => (b.querySelector(".bin-in").innerHTML = R.st.its.filter((i) => R.st.where[i] === +b.dataset.b).map(chip).join("")));
    go().disabled = R.st.its.some((i) => R.st.where[i] === undefined); };
  const grade = () => { const c = R.items[R.pos].card, h = host();
    if (c.k === "mcq") return R.st.order[R.st.sel] === 0;
    if (c.k === "fill") return R.st.slots.every((j, k) => R.st.chips[j].t === c.answers[k]);
    if (c.k === "ord") return R.st.seq.length === c.lines.length && R.st.seq.every((j, k) => R.st.bank[j].t === c.lines[k]);
    if (c.k === "rank") return R.st.seq.every((v, i) => v === i);
    if (c.k === "match") return R.st.miss === 0;
    if (c.k === "bins") return c.items.every((it, i) => R.st.where[i] === it[1]);
    if (c.k === "bug") return R.st.sel === c.bug;
    if (c.k === "say") return Array.from(h.querySelectorAll(".say-c input")).filter((x) => x.checked).length >= Math.ceil(c.checks.length * 0.6);
    if (c.k === "code") return !!R.st.passed;
    if (c.k === "num") { const v = parseFloat(String($(".numin input", h).value).replace(/[, ]/g, "")); return Number.isFinite(v) && Math.abs(v - c.answer) <= (c.tol || 0); }
    return true; };
  const answerText = (c) => ({ mcq: () => c.opts[0], fill: () => c.answers.map((a) => `<code>${E(a)}</code>`).join(", "), ord: () => `<pre class="ln-code sm">${E(c.lines.join("\n"))}</pre>`, rank: () => c.items.join(" → "), match: () => "", bins: () => c.bins.map((b, j) => `<b>${E(b)}</b>: ${c.items.filter((it) => it[1] === j).map((it) => it[0]).join(", ")}`).join("<br>"), say: () => `<div class="say-model">${c.model}</div>`, code: () => `<pre class="ln-code sm">${E(c.v[R.st.lang || codeLang(c)].sol || "")}</pre>`, bug: () => `Line ${c.bug + 1}: <code>${E(c.lines[c.bug].trim())}</code>`, num: () => `<b>${c.answer.toLocaleString("en-US")}</b>${c.unit ? " " + E(c.unit) : ""}` }[c.k] || (() => ""))();
  const check = () => {
    const it = R.items[R.pos], c = it.card, ok = grade(), h = host(); R.st.answered = true;
    const first = !R.missed.has(it.i) && !R.cleared.has(it.i); if (first) R.graded++;
    if (ok) { R.cleared.add(it.i); R.streak++; if (first) R.firstOk++; } else { R.missed.add(it.i); R.streak = 0; if (c.k !== "say") R.lives--; R.items.push({ card: c, i: it.i }); }
    const sk = c.skill || R.node.skill; if (sk && GR.skills[sk]) { GR.record({ skill: sk, diff: c.d || 2, also: [], gen: true }, ok); GR.game.answer({ skill: sk, diff: c.d || 2 }, ok); } GR.save();
    if (c.k === "mcq") h.querySelectorAll(".ln-opt").forEach((b, j) => { b.disabled = true; if (R.st.order[j] === 0) b.classList.add("right"); else if (j === R.st.sel) b.classList.add("wrong"); });
    if (c.k === "fill") { drawFill(); h.querySelectorAll(".slot").forEach((s, k) => { s.disabled = true; s.classList.add(R.st.chips[R.st.slots[k]].t === c.answers[k] ? "right" : "wrong"); }); }
    if (c.k === "ord") { drawOrd(); h.querySelectorAll(".ord-ans .tok").forEach((b, k) => { b.disabled = true; b.classList.add(R.st.bank[R.st.seq[k]].t === c.lines[k] ? "right" : "wrong"); }); }
    if (c.k === "rank") { drawRank(); h.querySelectorAll(".rank .rk").forEach((b, k) => b.classList.add(R.st.seq[k] === k ? "right" : "wrong")); }
    if (c.k === "bins") h.querySelectorAll(".bin .tok").forEach((b) => { b.disabled = true; b.classList.add(R.st.where[+b.dataset.i] === c.items[+b.dataset.i][1] ? "right" : "wrong"); });
    if (c.k === "bug") h.querySelectorAll(".bugline").forEach((b, j) => { b.disabled = true; if (j === c.bug) b.classList.add("right"); else if (j === R.st.sel) b.classList.add("wrong"); });
    if (c.k === "num") { const inp = $(".numin input", h); inp.disabled = true; inp.parentElement.classList.add(ok ? "right" : "wrong"); }
    const foot = $(".ln-foot", h); foot.classList.add(ok ? "ok" : "bad");
    $(".ln-verdict", h).innerHTML = `<span class="vstamp">${ok ? "Correct" : "Missed"}</span><div class="vtext">${ok ? `<b>${pickOne(PRAISE)}</b>` : c.k === "match" ? "<b>Mismatched pairs cost a life.</b>" : `<b>Answer:</b> ${answerText(c)}`}${c.why ? `<span>${c.why}</span>` : ""}</div>`;
    $(".ln-top", h).outerHTML = top(); if (!ok) $(".lives", h).classList.add("hit");
    const b = go(); b.disabled = false; b.textContent = "Continue"; b.focus({ preventScroll: true });
  };
  const next = () => {
    if (R.lives <= 0) return outOfLives();
    if (R.items[R.pos].card.k === "learn") R.cleared.add(R.items[R.pos].i);
    R.pos++; if (R.pos >= R.items.length) return finish(); render();
  };
  const outOfLives = () => { const g = GR.game.state();
    host().innerHTML = `<div class="ln ln-end">${top()}<div class="log"><span class="log-stamp bad">Failed set</span><h2>Out of lives</h2><p class="lead">Five misses in one session. They're queued up again, so a refill lets you finish strong, or start the session fresh.</p>
      <div class="row log-b"><button class="btn primary" data-pa="refill" ${g.coins < REFILL ? "disabled" : ""}>Refill lives · ${REFILL} coins</button><button class="btn" data-pa="retry">Start over</button><button class="btn" data-pa="quit">Back to the program</button></div>${g.coins < REFILL ? `<p class="muted">You have ${g.coins} coins.</p>` : ""}</div></div>`; };
  const finishSkip = (c, node, acc, secs, rec) => {
    const d = ps(c.id).done, pass = acc >= SKIP_PASS, skipped = pass ? c.nodes.filter((n) => n.unit < node.unit && !d[n.id]) : [];
    skipped.forEach((n) => { d[n.id] = { ts: Date.now(), acc, secs: 0, runs: 1, skipped: true }; });
    if (skipped.length) GR.game.reward(25, 10, null); GR.save(); if (pass) GR.game.confetti(80);
    const nx = GR.pathNext(c.id);
    host().innerHTML = `<div class="ln ln-end"><div class="log"><span class="log-stamp ${pass ? "gold" : "bad"}">${pass ? "Skipped ahead" : "Not yet"}</span><h2>${E(node.title)}</h2><p class="lead">${pass ? (skipped.length ? `${skipped.length} sessions before Week ${node.unit + 1} are stamped done.` : "Those weeks were already done.") : `You need ${Math.round(SKIP_PASS * 100)}% to skip. Review the weeks or try again.`}</p>
      <table class="log-t"><tr><th>Time</th><td class="num">${fmtT(secs)}</td></tr><tr><th>Accuracy</th><td class="num">${Math.round(acc * 100)}%</td></tr>${skipped.length ? `<tr><th>XP</th><td class="num">+25</td></tr>` : ""}</table>
      <div class="row log-b">${pass && nx ? `<button class="btn primary" data-pa="go" data-c="${c.id}" data-id="${nx.node.id}">Next: ${E(nx.node.title)}</button>` : `<button class="btn primary" data-pa="retry">Try again</button>`}<button class="btn" data-pa="topath">Back to the program</button></div></div></div>`;
    R = null; setTimeout(() => GR.game.flushLevel(), 1300);
  };
  const finish = () => {
    const c = R.c, node = R.node, d = ps(c.id).done, prev = d[node.id], acc = R.graded ? R.firstOk / R.graded : 1, secs = Math.max(1, Math.round((Date.now() - R.start) / 1000));
    const rec = { type: "lesson", total: R.graded, score: R.firstOk, scaled: null }; if (R.graded) GR.game.sessionEnd(rec);
    if (node.kind === "skip") return finishSkip(c, node, acc, secs, rec);
    const isGold = !!prev && !!prev.best && secs < prev.best && acc >= (prev.bestAcc ?? prev.acc ?? 0) && acc > 0;
    const bonus = !prev ? (node.kind === "pr" ? 30 : node.kind === "test" ? 20 : 10) : isGold ? 15 : 3, coinB = !prev ? (node.kind === "pr" ? 12 : node.kind === "test" ? 10 : 3) : isGold ? 6 : 1; GR.game.reward(bonus, coinB, null);
    const best = prev && prev.best ? Math.min(prev.best, secs) : secs, bestAcc = Math.max(acc, prev ? prev.bestAcc ?? prev.acc ?? 0 : 0);
    d[node.id] = { ts: Date.now(), acc, secs, best, bestAcc, gold: (prev && prev.gold) || isGold, runs: ((prev && prev.runs) || 0) + 1 }; justDone = !prev || isGold ? node.id : null; GR.save();
    const xp = ((rec.loot && rec.loot.xp) || 0) + bonus, coins = ((rec.loot && rec.loot.coins) || 0) + coinB, perfect = R.graded && R.firstOk === R.graded;
    if (isGold || (!prev && node.kind === "pr")) GR.game.confetti(140); else if (perfect) GR.game.confetti(60);
    const nx = GR.pathNext(c.id), stamp = isGold ? "Gold split" : !prev && node.kind === "pr" ? "New PR" : !prev ? "Done" : "Logged";
    host().innerHTML = `<div class="ln ln-end"><div class="log"><span class="log-stamp ${isGold || stamp === "New PR" ? "gold" : ""}">${stamp}</span><h2>${E(node.title)}</h2><p class="lead">${KIND[node.kind]} · Week ${node.unit + 1}${prev ? ` · run ${(prev.runs || 1) + 1}` : ""}</p>
      <table class="log-t"><tr><th>Time</th><td class="num">${fmtT(secs)}${prev && prev.best ? ` <small class="${secs < prev.best ? "pos" : ""}">best ${fmtT(prev.best)}</small>` : ""}</td></tr><tr><th>Accuracy</th><td class="num">${Math.round(acc * 100)}%${perfect ? ` <small class="pos">flawless</small>` : ""}</td></tr><tr><th>XP</th><td class="num" data-count="${xp}">+0</td></tr><tr><th>Coins</th><td class="num">+${coins}</td></tr></table>
      <div class="row log-b">${nx ? `<button class="btn primary" data-pa="go" data-c="${c.id}" data-id="${nx.node.id}">Next: ${E(nx.node.title)}</button>` : ""}<button class="btn ${nx ? "" : "primary"}" data-pa="topath">Back to the program</button></div></div></div>`;
    const el = $("[data-count]", host()); let v = 0; if (matchMedia("(prefers-reduced-motion:reduce)").matches) { el.textContent = "+" + xp; } else { const step = () => { v = Math.min(xp, v + Math.max(1, Math.ceil(xp / 25))); el.textContent = "+" + v; if (v < xp) requestAnimationFrame(step); }; requestAnimationFrame(step); }
    R = null; setTimeout(() => GR.game.flushLevel(), 1300);
  };

  /* ---------- match logic ---------- */
  const tryMatch = (li, ri) => { const c = R.items[R.pos].card, h = host(), L = h.querySelector(`.mt[data-pa=ml][data-i="${li}"]`), Rb = h.querySelector(`.mt[data-pa=mr][data-i="${ri}"]`);
    if (li === ri) { R.st.done.add(li); [L, Rb].forEach((b) => { b.classList.remove("sel"); b.classList.add("right"); b.disabled = true; }); R.st.sel = null; if (R.st.done.size === c.pairs.length) check(); }
    else { R.st.miss++; [L, Rb].forEach((b) => { b.classList.add("wrong"); setTimeout(() => b.classList.remove("wrong", "sel"), 450); }); R.st.sel = null; } };

  /* ---------- pointer drag with tap fallback ---------- */
  let drag = null, suppress = false;
  document.addEventListener("pointerdown", (e) => { if (!R || !R.st || R.st.answered) return; const src = e.target.closest("[data-drag]"); if (!src || src.disabled || e.target.closest(".rk-mv")) return;
    drag = { src, x: e.clientX, y: e.clientY, ghost: null, id: e.pointerId }; });
  document.addEventListener("pointermove", (e) => { if (!drag || e.pointerId !== drag.id) return;
    if (!drag.ghost) { if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 8) return; const r = drag.src.getBoundingClientRect(); drag.ghost = drag.src.cloneNode(true); drag.ghost.classList.add("ghost"); Object.assign(drag.ghost.style, { width: r.width + "px", left: r.left + "px", top: r.top + "px" }); drag.dx = e.clientX - r.left; drag.dy = e.clientY - r.top; document.body.appendChild(drag.ghost); drag.src.classList.add("lifted"); }
    drag.ghost.style.left = e.clientX - drag.dx + "px"; drag.ghost.style.top = e.clientY - drag.dy + "px";
    document.querySelectorAll(".drop-hot").forEach((x) => x.classList.remove("drop-hot")); drag.ghost.style.visibility = "hidden"; const t = document.elementFromPoint(e.clientX, e.clientY); drag.ghost.style.visibility = ""; const dz = t && t.closest("[data-drop]"); if (dz) dz.classList.add("drop-hot"); e.preventDefault(); }, { passive: false });
  document.addEventListener("pointerup", (e) => { if (!drag || e.pointerId !== drag.id) return; const d0 = drag; drag = null; if (!d0.ghost) return;
    d0.ghost.style.visibility = "hidden"; const t = document.elementFromPoint(e.clientX, e.clientY); d0.ghost.remove(); d0.src.classList.remove("lifted"); document.querySelectorAll(".drop-hot").forEach((x) => x.classList.remove("drop-hot"));
    suppress = true; setTimeout(() => (suppress = false), 60); const dz = t && t.closest("[data-drop]"); if (!dz || !R) return; const s = d0.src.dataset;
    if (s.drag === "r" && dz.dataset.drop === "r") { const a = +s.pos, b = +dz.dataset.pos; const v = R.st.seq.splice(a, 1)[0]; R.st.seq.splice(b, 0, v); R.st.sel = null; drawRank(); }
    else if (s.drag === "c" && dz.dataset.drop === "bin") { R.st.where[+s.i] = +dz.dataset.b; R.st.sel = null; drawBins(); }
    else if (s.drag === "c" && dz.dataset.drop === "pool") { delete R.st.where[+s.i]; drawBins(); }
    else if (s.drag === "m" && dz.dataset.drop === "m" && !dz.disabled) tryMatch(+s.i, +dz.dataset.i);
    else if (s.drag === "b" && dz.dataset.drop === "ans") { R.st.seq.push(+s.j); drawOrd(); } });
  document.addEventListener("pointercancel", () => { if (drag && drag.ghost) { drag.ghost.remove(); drag.src.classList.remove("lifted"); } drag = null; });

  /* ---------- clicks ---------- */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-pa]"); if (!b || b.disabled || suppress) return;
    const a = b.dataset.pa;
    if (a === "go") { e.preventDefault(); const c = C[b.dataset.c], node = findNode(c, b.dataset.id), i = c.nodes.indexOf(node), k = curIdx(c);
      if (i > k) { b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); GR.game.toast("Finish the sessions before this one first."); return; }
      location.hash = `#/learn/${c.id}/${node.id}`; return; }
    if (!R) { if (a === "topath" || a === "quit") { e.preventDefault(); location.hash = "#/path/" + (GR.state.pathLast || "lc"); } return; }
    e.preventDefault();
    if (a === "quit") { if (R.cleared.size && !confirm("End this session? Progress in it won't be saved.")) return; const cid = R.c.id; R = null; location.hash = "#/path/" + cid; return; }
    if (a === "topath") { location.hash = "#/path/" + R.c.id; return; }
    if (a === "retry") return start(R.c.id, R.node.id);
    if (a === "refill") { const g = GR.game.state(); if (g.coins < REFILL) return; g.coins -= REFILL; R.lives = LIVES; GR.save(); GR.game.toast(`Lives refilled. <em>−${REFILL} coins</em>`, "gold"); R.pos++; if (R.pos >= R.items.length) return finish(); return render(); }
    if (a === "go2") { const c = R.items[R.pos].card; if (R.st.answered || c.k === "learn") return next(); return check(); }
    if (R.st.answered) return;
    const h = host();
    if (a === "lang") { const c = R.items[R.pos].card, l = b.dataset.l, ta = $(".code-box", h); if (l === R.st.lang) return; R.st.buf[R.st.lang] = ta.value; R.st.lang = l; localStorage.setItem("gradient.codelang", l); ta.value = R.st.buf[l] !== undefined ? R.st.buf[l] : c.v[l].starter; R.st.passed = false; go().disabled = true; $(".code-out", h).innerHTML = ""; h.querySelectorAll(".code-lang .btn").forEach((x) => x.classList.toggle("on", x.dataset.l === l)); return; }
    if (a === "reveal") { $(".say-rev", h).hidden = false; b.hidden = true; go().disabled = false; return; }
    if (a === "giveup") { R.st.passed = false; R.st.gaveUp = true; go().disabled = false; $(".code-out", h).innerHTML = `<p class="muted">Press Check to see the solution. This one comes back later in the session.</p>`; return; }
    if (a === "runcode") { const c = R.items[R.pos].card, out = $(".code-out", h), code = $(".code-box", h).value, lang = R.st.lang, p = { tests: c.tests, cmp: c.cmp || "exact", [lang]: [c.v[lang].fn] }; b.disabled = true; out.innerHTML = `<p class="muted">Running…</p>`;
      GR.runCode(p, lang, code, (m) => (out.innerHTML = `<p class="muted">${E(m)}</p>`)).then((d) => { b.disabled = false; if (!R || R.items[R.pos].card !== c) return;
        if (d.error) { R.st.passed = false; out.innerHTML = `<p class="code-err">${E(d.error)}</p>`; return; }
        const ok = d.results.filter((r) => r.pass).length; R.st.passed = ok === d.results.length; go().disabled = !R.st.passed;
        const bad = d.results.find((r) => !r.pass);
        out.innerHTML = `<p class="${R.st.passed ? "code-ok" : "code-err"}"><b>${ok}/${d.results.length}</b> tests pass.${R.st.passed ? " Press Check." : ""}</p>${bad ? `<pre class="ln-code sm">input: ${E(JSON.stringify(bad.args))}\nexpected: ${E(JSON.stringify(bad.exp))}\n${bad.err ? "error: " + E(bad.err) : "got: " + E(JSON.stringify(bad.got))}</pre>` : ""}`; }); return; }
    if (a === "sel") { R.st.sel = +b.dataset.j; h.querySelectorAll(".ln-opt").forEach((x, j) => { x.classList.toggle("sel", j === R.st.sel); x.setAttribute("aria-checked", j === R.st.sel); }); go().disabled = false; }
    if (a === "bsel") { R.st.sel = +b.dataset.j; h.querySelectorAll(".bugline").forEach((x, j) => { x.classList.toggle("sel", j === R.st.sel); x.setAttribute("aria-checked", j === R.st.sel); }); go().disabled = false; }
    if (a === "chip") { const k = R.st.slots.indexOf(null); if (k < 0) return; R.st.slots[k] = +b.dataset.j; drawFill(); }
    if (a === "unslot") { R.st.slots[+b.dataset.s] = null; drawFill(); }
    if (a === "pick") { R.st.seq.push(+b.dataset.j); drawOrd(); }
    if (a === "unpick") { R.st.seq.splice(+b.dataset.k, 1); drawOrd(); }
    if (a === "rup" || a === "rdn") { e.stopPropagation(); const p = +b.dataset.pos, q = a === "rup" ? p - 1 : p + 1; [R.st.seq[p], R.st.seq[q]] = [R.st.seq[q], R.st.seq[p]]; R.st.sel = null; drawRank(); const f = h.querySelector(`.rk[data-pos="${q}"]`); if (f) f.focus(); return; }
    if (a === "rsel") { const p = +b.dataset.pos; if (R.st.sel === null) R.st.sel = p; else { const v = R.st.seq.splice(R.st.sel, 1)[0]; R.st.seq.splice(p, 0, v); R.st.sel = null; } drawRank(); }
    if (a === "bpick") { e.stopPropagation(); const i = +b.dataset.i; if (R.st.where[i] !== undefined) { delete R.st.where[i]; R.st.sel = null; } else R.st.sel = R.st.sel === i ? null : i; drawBins(); return; }
    if (a === "bin" && R.st.sel !== null) { R.st.where[R.st.sel] = +b.dataset.b; R.st.sel = null; drawBins(); }
    if (a === "ml") { R.st.sel = +b.dataset.i; h.querySelectorAll(".mt[data-pa=ml]").forEach((x) => x.classList.toggle("sel", +x.dataset.i === R.st.sel)); }
    if (a === "mr" && R.st.sel !== null) tryMatch(R.st.sel, +b.dataset.i);
  });
  document.addEventListener("keydown", (e) => { if (!R || !location.hash.startsWith("#/learn")) return; const h = host();
    if (e.target.tagName === "TEXTAREA") return;
    if (e.target.tagName === "INPUT") { if (e.key === "Enter") { const g = go(); if (g && !g.disabled) { e.preventDefault(); g.click(); } } return; }
    const onItem = e.target.closest && e.target.closest(".rk, .tok, .ln-opt, .bugline, .rk-mv");
    if (e.key === "Enter" && !onItem) { const g = go() || $(".log-b .btn.primary", h); if (g && !g.disabled) { e.preventDefault(); g.click(); } }
    else if (/^[1-9]$/.test(e.key)) { const opts = h.querySelectorAll(".ln-opt, .bugline, .ln-chips .tok:not(:disabled), .ord-bank .tok:not(:disabled)"), b = opts[+e.key - 1]; if (b && !b.disabled) b.click(); }
    else if ((e.key === "ArrowUp" || e.key === "ArrowDown") && e.target.classList && e.target.classList.contains("rk")) { e.preventDefault(); const btn = e.target.querySelector(e.key === "ArrowUp" ? "[data-pa=rup]" : "[data-pa=rdn]"); if (btn && !btn.disabled) btn.click(); } });

  /* ---------- kit: turn the question bank, generators and cases into session cards ---------- */
  const numParse = (t) => { const m = String(t).replace(/<[^>]+>/g, "").trim().match(/^([−-]?)\$?([\d,]*\.?\d+)\s*(%|ms|s|GB|MB|k|x|×)?$/); if (!m) return null; const v = parseFloat((m[1] ? "-" : "") + m[2].replace(/,/g, "")); if (!Number.isFinite(v)) return null; const dec = (m[2].split(".")[1] || "").length; return { v, unit: (String(t).includes("$") ? "$ " : "") + (m[3] || ""), tol: dec ? 0.5 * 10 ** -dec + 1e-9 : 0 }; };
  const fromItem = (item, rng, allowNum = true) => { const q = GR.inst(item, rng), correct = q.options[q.answer], opts = [correct].concat(q.options.filter((_, i) => i !== q.answer));
    const n = item.gen && allowNum && rng() < 0.55 ? numParse(correct) : null;
    if (n) return { k: "num", prompt: q.stem, answer: n.v, tol: n.tol, unit: n.unit.trim(), why: q.expl, skill: item.skill, d: item.diff };
    return { k: "mcq", prompt: q.stem, opts, why: q.expl, skill: item.skill, d: item.diff }; };
  const bankFor = (skills) => GR.bank.filter((b) => skills.includes(b.skill));
  const drill = (skills, n = 8) => (rng) => { const b = bankFor(skills), seen = (x) => (GR.state.seen[x.id] ? GR.state.seen[x.id].n : 0);
    const fixed = rng.shuffle(b.filter((x) => !x.gen)).sort((x, y) => seen(x) - seen(y)), gens = rng.shuffle(b.filter((x) => x.gen));
    const take = []; while (take.length < n && (fixed.length || gens.length)) { const useGen = gens.length && (!fixed.length || rng() < 0.35); take.push(useGen ? gens.shift() : fixed.shift()); }
    return take.map((it) => fromItem(it, rng)); };
  const caseCards = (set) => (rng) => GR.instSet(set, rng).map((p, i) => ({ k: "mcq", prompt: p.stem, stim: (i === 0 ? `<b>${E(set.title)}</b>` : "") + p.stim, opts: [p.options[p.answer]].concat(p.options.filter((_, j) => j !== p.answer)), why: p.expl, skill: p.skill, d: p.diff }));
  /* split lesson HTML into paragraph-sized cards; tables and code stay with the paragraph before them */
  const chunks = (html) => { const parts = html.split(/(?<=<\/p>)/).map((x) => x.trim()).filter(Boolean), out = [];
    parts.forEach((p) => { const isP = /^<p[\s>]/.test(p); if (!isP && out.length) out[out.length - 1] += p; else if (out.length && out[out.length - 1].replace(/<[^>]+>/g, "").length < 140 && isP) out[out.length - 1] += p; else out.push(p); });
    return out; };
  const learnCards = (sid) => { const s = GR.skills[sid], l = s.lesson, ch = chunks(l.body), cards = [];
    ch.forEach((html, i) => { cards.push({ k: "learn", title: i === 0 ? l.title : null, text: html, try: i === ch.length - 1 && l.diagram && GR.diagrams[l.diagram] && !(GR.diagrams[l.diagram].def) ? l.diagram : null, viz: i === ch.length - 1 && l.diagram && GR.diagrams[l.diagram] && GR.diagrams[l.diagram].def ? { id: l.diagram } : null }); });
    if (l.keys && l.keys.length) cards.push({ k: "learn", title: "Remember", text: `<ul>${l.keys.map((k) => `<li>${k}</li>`).join("")}</ul>` });
    return cards; };
  const lessonSession = (sid) => (rng) => { const cards = learnCards(sid), qs = drill([sid], 3)(rng);
    /* interleave: a check after roughly every two reading cards, the rest at the end */
    const out = []; let qi = 0; cards.forEach((c, i) => { out.push(c); if (i % 2 === 1 && qi < qs.length - 1 && i < cards.length - 1) out.push(qs[qi++]); }); return out.concat(qs.slice(qi)); };

  GR.pathKit = { fromItem, drill, caseCards, bankFor, numParse, chunks, learnCards, lessonSession };

  GR.pathDebug = () => R;   // read-only handle for automated tests
  GR.routes = GR.routes || {};
  GR.routes.path = (main, cid) => pathView(main, cid || GR.state.pathLast || "lc");
  GR.routes.learn = (main, cid) => { const id = location.hash.split("/")[3]; if (R && R.node.id === id) return render(); start(cid, id); };

  GR.hooks = GR.hooks || [];
  GR.hooks.push((a) => document.body.classList.toggle("focus", a === "learn"));
  /* dashboard: continue where you left off, plus every program's progress */
  GR.hooks.push((a) => { if (a) return; const hero = $(".hero"); if (!hero) return; const ids = Object.keys(C); if (!ids.length) return; const cur = C[GR.state.pathLast] ? GR.state.pathLast : ids[0], c = C[cur], nx = GR.pathNext(cur), d = ps(cur).done, done = c.nodes.filter((n) => d[n.id]).length;
    hero.insertAdjacentHTML("afterend", `<section class="cont" style="--pc:${c.color}"><a class="cont-main" href="${nx ? `#/learn/${cur}/${nx.node.id}` : "#/path/" + cur}"><div><span class="cont-k">${E(c.title)} · Week ${nx ? nx.node.unit + 1 : c.units.length}</span><b>${nx ? E(nx.node.title) : "Program complete"}</b><span class="cont-meta">${nx ? `${KIND[nx.node.kind]} · about ${est(nx.node)} min · ${done}/${c.nodes.length} sessions` : "Replay sessions to chase gold splits"}</span></div><span class="btn primary">${done ? "Continue" : "Start"}</span></a>
</section>`); });
  /* programs page: role paths above the program cards */
  GR.hooks.push((a) => { if (a !== "programs") return; const m = $("#main"), h = m && m.querySelector(".hero"); if (!h || !Object.keys(C).length) return;
    h.insertAdjacentHTML("afterend", `<section class="cont roles-only"><div class="cont-roles"><h2>Role paths</h2>${ROLES.map(([name, tr]) => { const ts = tr.filter((t) => C[t]), pct = (t) => { const dd = ps(t).done; return C[t].nodes.filter((n) => dd[n.id]).length / C[t].nodes.length; }, nextT = ts.find((t) => pct(t) < 1) || ts[0]; return `<a href="#/path/${nextT}" class="role"><b>${E(name)}</b><span class="role-steps">${ts.map((t) => `<span class="${pct(t) >= 1 ? "on" : t === nextT ? "now" : ""}">${E(C[t].short || C[t].title)}</span>`).join("")}</span></a>`; }).join("")}</div></section>`); });
})();
