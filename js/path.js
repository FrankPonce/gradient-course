/* Gradient — Duolingo-style courses: a winding path of small lessons that unlock in order.
   GR.course(id, {title, blurb, color, units:[{title, sub, guide, lessons:[{title, skill, kind, cards}]}]})
   Card kinds:
     learn {text, viz:{id, input, code}}      read or watch, then Continue
     mcq   {prompt, opts:[correct, ...], code, why}
     fill  {prompt, code with ___ blanks, answers:[...], extra:[...], why}
     ord   {prompt, lines:[in order], extra:[...], why}   tap the lines into the right order
   Routes: #/path/<course>   #/learn/<course>/<nodeId> */
(function () {
  const E = GR.esc, $ = (s, r = document) => r.querySelector(s);
  const C = (GR.courses = GR.courses || {});
  const HEARTS = 5, REFILL = 20, GOAL = 50;
  const shuffle = (a) => GR.rng(Date.now() ^ (Math.random() * 1e9)).shuffle(a);
  const praise = ["Nice!", "Correct!", "Exactly.", "Clean.", "You got it.", "Sharp.", "Yes!"];
  const pickOne = (a) => a[Math.floor(Math.random() * a.length)];

  GR.course = (id, def) => {
    const nodes = [];
    def.units.forEach((u, ui) => {
      u.i = ui;
      u.lessons.forEach((l, li) => { l.id = l.id || `${id}-${ui + 1}-${li + 1}`; l.unit = ui; l.kind = l.kind || "lesson"; nodes.push(l); });
      nodes.push({ id: `${id}-${ui + 1}-review`, title: `Unit ${ui + 1} review`, kind: "review", unit: ui, skill: u.lessons[0].skill });
      nodes.push({ id: `${id}-${ui + 1}-chest`, title: "Treasure", kind: "chest", unit: ui });
    });
    C[id] = Object.assign(def, { id, nodes });
  };
  const ps = (cid) => { const p = (GR.state.path = GR.state.path || {}); return (p[cid] = p[cid] || { done: {} }); };
  const curIdx = (c) => { const d = ps(c.id).done, k = c.nodes.findIndex((n) => !d[n.id]); return k < 0 ? c.nodes.length : k; };
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const todayXp = () => (GR.game.state().days || {})[today()] || 0;
  GR.pathNext = (cid) => { const c = C[cid]; if (!c) return null; const k = curIdx(c); return k < c.nodes.length ? { node: c.nodes[k], unit: c.units[c.nodes[k].unit], k, total: c.nodes.length } : null; };

  /* ---------- the path ---------- */
  const ICON = { lesson: `<svg viewBox="0 0 24 24"><path d="M12 1.5L14 10l8.5 2-8.5 2-2 8.5-2-8.5L1.5 12 10 10z" fill="currentColor"/></svg>`, problem: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16"/></svg>`, review: `<svg viewBox="0 0 24 24"><path d="M3 18h18l-1.5-10-5 4L12 5l-2.5 7-5-4z" fill="currentColor"/></svg>`, chest: `<svg viewBox="0 0 24 24"><path d="M3 10a5 5 0 015-5h8a5 5 0 015 5v2H3z" fill="currentColor" opacity=".75"/><rect x="3" y="12" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="10.5" y="10.5" width="3" height="4" rx="1" fill="var(--bg)"/></svg>`, done: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`, lock: `<svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 10.5V8a4 4 0 018 0v2.5" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>` };
  const WAVE = [0, 44, 72, 44, 0, -44, -72, -44];
  let justDone = null;
  const pathView = (main, cid) => {
    const c = C[cid]; if (!c) { main.innerHTML = `<p class="muted">No such course.</p>`; return; }
    const d = ps(cid).done, k = curIdx(c), g = GR.game.state(), tx = todayXp(), doneUnits = c.units.filter((u) => c.nodes.filter((n) => n.unit === u.i).every((n) => d[n.id])).length;
    let n = 0;
    main.innerHTML = `<div class="pth" style="--pc:${c.color}">
      <header class="pth-head"><div><div class="cap">Course</div><h1>${E(c.title)}</h1><p class="lead">${E(c.blurb)}</p></div>
        <div class="pth-stats"><div class="pth-goal" title="Daily goal: ${GOAL} XP"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" fill="none" stroke="var(--rule)" stroke-width="5"/><circle cx="22" cy="22" r="18" fill="none" stroke="var(--or)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(Math.min(1, tx / GOAL) * 113.1).toFixed(1)} 113.1" transform="rotate(-90 22 22)"/></svg><span><b>${Math.min(tx, 999)}</b>/${GOAL} XP today</span></div>
          <div><b>${g.streak || 0}</b><span>day streak</span></div><div><b>${doneUnits}/${c.units.length}</b><span>units</span></div><div><b>${Math.min(k, c.nodes.length)}/${c.nodes.length}</b><span>steps</span></div></div></header>
      ${c.units.map((u) => { const un = c.nodes.filter((x) => x.unit === u.i), ud = un.filter((x) => d[x.id]).length, locked = c.nodes.indexOf(un[0]) > k;
        return `<section class="unit ${locked ? "locked" : ""}" style="--uc:${u.color || c.color}"><div class="unit-b"><div><span class="cap">Unit ${u.i + 1} · ${ud}/${un.length}</span><h2>${E(u.title)}</h2><p>${E(u.sub)}</p></div>${u.guide ? `<a class="btn sm" href="#/lesson/${u.guide}" title="The full written lesson for this unit">Guidebook</a>` : ""}</div>
          <div class="pnodes">${un.map((x) => { const i = c.nodes.indexOf(x), st = d[x.id] ? "done" : i === k ? "cur" : "locked", off = WAVE[n++ % WAVE.length];
            return `<div class="pn-w" style="--x:${off}px">${st === "cur" ? `<div class="pn-tip">${x.kind === "chest" ? "OPEN" : "START"}<small>${E(x.title)}</small></div>` : ""}<button class="pn ${st} k-${x.kind} ${justDone === x.id ? "just" : ""}" data-pa="go" data-c="${cid}" data-id="${x.id}" title="${E(x.title)}" aria-label="${E(x.title)}${st === "locked" ? " (locked)" : ""}">${st === "done" && x.kind !== "chest" ? ICON.done : st === "locked" && x.kind !== "chest" ? ICON.lock : ICON[x.kind] || ICON.lesson}</button><span class="pn-l">${E(x.title)}</span></div>`; }).join("")}</div></section>`; }).join("")}
      <div class="pth-end">${k >= c.nodes.length ? `<h2>Course complete.</h2><p class="muted">Every unit, every review. Revisit any lesson for practice XP.</p>` : `<p class="muted">More units unlock as you go.</p>`}</div></div>`;
    const cur = main.querySelector(".pn.cur"); if (cur) setTimeout(() => cur.scrollIntoView({ behavior: justDone ? "smooth" : "auto", block: "center" }), justDone ? 450 : 30);
    justDone = null;
  };

  /* ---------- lesson runner ---------- */
  let R = null;
  const cardsFor = (c, node) => {
    if (node.kind !== "review") return node.cards.slice();
    const pool = c.units[node.unit].lessons.flatMap((l) => l.cards.filter((x) => x.k !== "learn").map((x) => Object.assign({ skill: l.skill }, x)));
    return shuffle(pool).slice(0, 8);
  };
  const start = (cid, id) => {
    const c = C[cid], node = c && c.nodes.find((x) => x.id === id); if (!node) return (location.hash = "#/path/" + cid);
    const cards = cardsFor(c, node);
    R = { c, node, items: cards.map((card, i) => ({ card, i })), pos: 0, total: cards.length, cleared: new Set(), hearts: HEARTS, graded: 0, firstOk: 0, missed: new Set(), start: Date.now(), streak: 0, st: null };
    GR.game.sessionStart(); render();
  };
  const host = () => $("#main");
  const bar = () => `<div class="ln-top"><button class="ln-x" data-pa="quit" aria-label="Quit lesson">✕</button><div class="ln-bar"><i style="width:${(R.cleared.size / R.total) * 100}%"></i>${R.streak >= 3 ? `<span class="ln-hot">${R.streak} in a row</span>` : ""}</div>${hearts()}</div>`;
  const hearts = () => `<span class="ln-hearts ${R.hearts <= 1 ? "low" : ""}"><svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z" fill="currentColor"/></svg>${R.hearts}</span>`;
  const codeHtml = (code) => `<pre class="ln-code">${E(code)}</pre>`;
  const render = () => {
    const it = R.items[R.pos], c = it.card, h = host(); R.st = { sel: null, slots: [], seq: [], answered: false };
    const kick = { learn: R.node.kind === "problem" && it.i === 0 ? "The problem" : "New concept", mcq: c.code ? "Read the code" : "Choose the answer", fill: "Fill in the blanks", ord: "Put the lines in order" }[c.k];
    let body = "";
    if (c.k === "learn") body = `<div class="ln-learn">${c.title ? `<h2>${E(c.title)}</h2>` : ""}<div class="ln-text">${c.text}</div>${c.viz ? `<div class="ln-viz"></div>` : ""}${c.code ? codeHtml(c.code) : ""}</div>`;
    else if (c.k === "mcq") { const order = shuffle(c.opts.map((_, i) => i)); R.st.order = order;
      body = `<div class="ln-prompt">${c.prompt}</div>${c.code ? codeHtml(c.code) : ""}<div class="ln-opts ${c.opts.some((o) => o.length > 34) ? "long" : ""}">${order.map((oi, j) => `<button class="ln-opt" data-pa="sel" data-j="${j}"><kbd>${j + 1}</kbd><span>${c.opts[oi]}</span></button>`).join("")}</div>`; }
    else if (c.k === "fill") { const chips = shuffle(c.answers.concat(c.extra || []).map((t, i) => ({ t, i }))); R.st.chips = chips; R.st.slots = c.answers.map(() => null);
      let si = 0; const code = E(c.code).replace(/___/g, () => `<button class="slot" data-pa="unslot" data-s="${si}" data-n="${si++}"></button>`);
      body = `<div class="ln-prompt">${c.prompt}</div><pre class="ln-code fill">${code}</pre><div class="ln-chips">${chips.map((ch, j) => `<button class="chip-b" data-pa="chip" data-j="${j}">${E(ch.t)}</button>`).join("")}</div>`; }
    else if (c.k === "ord") { const bank = shuffle(c.lines.concat(c.extra || []).map((t, i) => ({ t, i }))); R.st.bank = bank;
      body = `<div class="ln-prompt">${c.prompt}</div><div class="ord-ans" aria-label="Your answer"></div><div class="ord-bank">${bank.map((b, j) => `<button class="ord-line" data-pa="pick" data-j="${j}">${E(b.t)}</button>`).join("")}</div>`; }
    h.innerHTML = `<div class="ln" data-kind="${c.k}">${bar()}<div class="ln-body" key="${R.pos}"><div class="cap ln-kick">${kick}</div>${body}</div>
      <div class="ln-foot"><div class="ln-msg"></div><button class="btn primary ln-go" data-pa="go2" ${c.k === "learn" ? "" : "disabled"}>${c.k === "learn" ? "Continue" : "Check"}</button></div></div>`;
    if (c.k === "learn" && c.viz) GR.vizPlay($(".ln-viz", h), c.viz.id, c.viz.input || {}, { code: !!c.viz.code });
    if (c.k === "ord") drawOrd();
    window.scrollTo(0, 0);
  };
  const drawOrd = () => { const c = R.items[R.pos].card, h = host();
    $(".ord-ans", h).innerHTML = R.st.seq.length ? R.st.seq.map((j, k) => `<button class="ord-line in" data-pa="unpick" data-k="${k}">${E(R.st.bank[j].t)}</button>`).join("") : `<span class="muted">Tap the lines below in order.</span>`;
    h.querySelectorAll(".ord-bank .ord-line").forEach((b) => (b.disabled = R.st.seq.includes(+b.dataset.j) || R.st.answered));
    $(".ln-go", h).disabled = R.st.seq.length !== c.lines.length; };
  const drawFill = () => { const h = host(); h.querySelectorAll(".slot").forEach((s, k) => { const j = R.st.slots[k]; s.textContent = j === null ? "" : R.st.chips[j].t; s.classList.toggle("on", j !== null); });
    h.querySelectorAll(".chip-b").forEach((b) => (b.disabled = R.st.slots.includes(+b.dataset.j) || R.st.answered)); $(".ln-go", h).disabled = R.st.slots.includes(null); };
  const grade = () => { const c = R.items[R.pos].card;
    if (c.k === "mcq") return R.st.order[R.st.sel] === 0;
    if (c.k === "fill") return R.st.slots.every((j, k) => R.st.chips[j].t === c.answers[k]);
    if (c.k === "ord") return R.st.seq.length === c.lines.length && R.st.seq.every((j, k) => R.st.bank[j].t === c.lines[k]);
    return true; };
  const answerText = (c) => c.k === "mcq" ? c.opts[0] : c.k === "fill" ? c.answers.map((a) => `<code>${E(a)}</code>`).join(" , ") : c.k === "ord" ? `<pre class="ln-code sm">${E(c.lines.join("\n"))}</pre>` : "";
  const check = () => {
    const it = R.items[R.pos], c = it.card, ok = grade(), h = host(); R.st.answered = true;
    const first = !R.missed.has(it.i) && !R.cleared.has(it.i); R.graded += first ? 1 : 0;
    if (ok) { R.cleared.add(it.i); R.streak++; if (first) R.firstOk++; } else { R.missed.add(it.i); R.streak = 0; R.hearts--; R.items.push({ card: c, i: it.i }); }
    const sk = c.skill || R.node.skill; if (sk && GR.skills[sk]) { GR.record({ skill: sk, diff: c.d || 2, also: [], gen: true }, ok); GR.game.answer({ skill: sk, diff: c.d || 2 }, ok); } GR.save();
    if (c.k === "mcq") h.querySelectorAll(".ln-opt").forEach((b, j) => { b.disabled = true; if (R.st.order[j] === 0) b.classList.add("right"); else if (j === R.st.sel) b.classList.add("wrong"); });
    if (c.k === "fill") { drawFill(); h.querySelectorAll(".slot").forEach((s, k) => { s.disabled = true; s.classList.add(R.st.chips[R.st.slots[k]].t === c.answers[k] ? "right" : "wrong"); }); }
    if (c.k === "ord") { drawOrd(); h.querySelectorAll(".ord-ans .ord-line").forEach((b, k) => { b.disabled = true; b.classList.add(R.st.bank[R.st.seq[k]].t === c.lines[k] ? "right" : "wrong"); }); }
    const foot = $(".ln-foot", h); foot.classList.add(ok ? "ok" : "bad");
    $(".ln-msg", h).innerHTML = ok ? `<b>${pickOne(praise)}</b>${c.why ? `<span>${c.why}</span>` : ""}` : `<b>Correct answer:</b><div>${answerText(c)}</div>${c.why ? `<span>${c.why}</span>` : ""}`;
    $(".ln-bar i", h).style.width = (R.cleared.size / R.total) * 100 + "%"; const hs = $(".ln-hearts", h); hs.outerHTML = hearts(); if (!ok) { const n = $(".ln-hearts", h); n.classList.add("hit"); }
    const go = $(".ln-go", h); go.disabled = false; go.textContent = "Continue"; go.focus({ preventScroll: true });
  };
  const next = () => {
    if (R.hearts <= 0) return outOfHearts();
    if (R.items[R.pos].card.k === "learn") R.cleared.add(R.items[R.pos].i);
    R.pos++; if (R.pos >= R.items.length) return finish(); render();
  };
  const outOfHearts = () => { const g = GR.game.state();
    host().innerHTML = `<div class="ln ln-end">${bar()}<div class="ln-res"><div class="ln-big bad">Out of hearts</div><p class="lead">Five mistakes in one lesson. Every one of them is coming back, so it's worth a refill, or start the lesson fresh.</p>
      <div class="row ln-res-b"><button class="btn primary" data-pa="refill" ${g.coins < REFILL ? "disabled" : ""}>Refill hearts · ${REFILL} coins</button><button class="btn" data-pa="retry">Start over</button><button class="btn" data-pa="quit">Back to the path</button></div>${g.coins < REFILL ? `<p class="muted">You have ${g.coins} coins.</p>` : ""}</div></div>`; };
  const finish = () => {
    const c = R.c, node = R.node, d = ps(c.id).done, firstTime = !d[node.id], acc = R.graded ? R.firstOk / R.graded : 1, secs = Math.round((Date.now() - R.start) / 1000);
    const rec = { type: "lesson", total: R.graded, score: R.firstOk, scaled: null }; if (R.graded) GR.game.sessionEnd(rec);
    const bonus = firstTime ? 10 : 3; GR.game.reward(bonus, firstTime ? 3 : 1, null);
    d[node.id] = { ts: Date.now(), acc, secs }; justDone = firstTime ? node.id : null; GR.save();
    const xp = ((rec.loot && rec.loot.xp) || 0) + bonus, coins = ((rec.loot && rec.loot.coins) || 0) + (firstTime ? 3 : 1), perfect = R.graded && R.firstOk === R.graded;
    if (perfect || node.kind === "review") GR.game.confetti(120); else GR.game.confetti(60);
    const nx = GR.pathNext(c.id);
    host().innerHTML = `<div class="ln ln-end"><div class="ln-res"><div class="ln-big">${node.kind === "review" ? "Unit reviewed!" : perfect ? "Perfect lesson!" : "Lesson complete!"}</div><p class="lead">${E(node.title)}</p>
      <div class="ln-stats"><div class="xp"><span>Total XP</span><b data-count="${xp}">0</b></div><div class="acc"><span>${perfect ? "Flawless" : "Accuracy"}</span><b>${Math.round(acc * 100)}%</b></div><div class="tm"><span>Time</span><b>${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}</b></div><div class="co"><span>Coins</span><b>+${coins}</b></div></div>
      <div class="row ln-res-b"><button class="btn primary" data-pa="topath">Continue</button>${nx && nx.node.kind !== "chest" ? `<button class="btn" data-pa="go" data-c="${c.id}" data-id="${nx.node.id}">Next: ${E(nx.node.title)}</button>` : ""}</div></div></div>`;
    const el = $("[data-count]", host()); let v = 0; const step = () => { v = Math.min(xp, v + Math.max(1, Math.ceil(xp / 25))); el.textContent = "+" + v; if (v < xp) requestAnimationFrame(step); }; requestAnimationFrame(step);
    R = null; setTimeout(() => GR.game.flushLevel(), 1400);
  };
  const openChest = (c, node) => { const d = ps(c.id).done; if (d[node.id]) return; const coins = 25 + 5 * node.unit; d[node.id] = { ts: Date.now() }; justDone = node.id; GR.save();
    const ov = document.createElement("div"); ov.className = "chest-ov"; ov.innerHTML = `<div class="chest-in"><div class="chest-ic">${ICON.chest}</div><b>+${coins} coins</b><small>Unit ${node.unit + 1} cleared</small><button class="btn primary">Collect</button></div>`;
    ov.addEventListener("click", () => { ov.remove(); pathView(host(), c.id); }); document.body.appendChild(ov); GR.game.reward(15, coins, null); GR.game.confetti(90); };

  /* ---------- events ---------- */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-pa]"); if (!b || b.disabled) return; const a = b.dataset.pa; e.preventDefault();
    if (a === "go") { const c = C[b.dataset.c], node = c.nodes.find((x) => x.id === b.dataset.id), i = c.nodes.indexOf(node), k = curIdx(c);
      if (i > k) { b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); GR.game.toast("Finish the steps before this one first."); return; }
      if (node.kind === "chest") return openChest(c, node);
      location.hash = `#/learn/${c.id}/${node.id}`; return; }
    if (!R) { if (a === "topath" || a === "quit") location.hash = "#/path/" + (b.dataset.c || "lc"); return; }
    if (a === "quit") { if (R.cleared.size && !confirm("Quit this lesson? Progress in it won't be saved.")) return; const cid = R.c.id; R = null; location.hash = "#/path/" + cid; return; }
    if (a === "topath") { location.hash = "#/path/" + R.c.id; return; }
    if (a === "retry") return start(R.c.id, R.node.id);
    if (a === "refill") { const g = GR.game.state(); if (g.coins < REFILL) return; g.coins -= REFILL; R.hearts = HEARTS; GR.save(); GR.game.toast(`Hearts refilled. <em>−${REFILL} coins</em>`, "gold"); R.pos++; if (R.pos >= R.items.length) return finish(); return render(); }
    if (a === "go2") { if (R.st.answered || R.items[R.pos].card.k === "learn") return next(); return check(); }
    if (R.st.answered) return;
    if (a === "sel") { R.st.sel = +b.dataset.j; host().querySelectorAll(".ln-opt").forEach((x, j) => x.classList.toggle("sel", j === R.st.sel)); $(".ln-go", host()).disabled = false; }
    if (a === "chip") { const k = R.st.slots.indexOf(null); if (k < 0) return; R.st.slots[k] = +b.dataset.j; drawFill(); }
    if (a === "unslot") { R.st.slots[+b.dataset.s] = null; drawFill(); }
    if (a === "pick") { R.st.seq.push(+b.dataset.j); drawOrd(); }
    if (a === "unpick") { R.st.seq.splice(+b.dataset.k, 1); drawOrd(); }
  });
  document.addEventListener("keydown", (e) => { if (!R || !location.hash.startsWith("#/learn") || e.target.tagName === "INPUT") return; const h = host();
    if (e.key === "Enter") { const go = $(".ln-go", h) || $(".ln-res-b .btn.primary", h); if (go && !go.disabled) { e.preventDefault(); go.click(); } }
    else if (/^[1-9]$/.test(e.key)) { const opts = h.querySelectorAll(".ln-opt, .chip-b:not(:disabled), .ord-bank .ord-line:not(:disabled)"), b = opts[+e.key - 1]; if (b && !b.disabled) b.click(); } });

  GR.pathDebug = () => R;   // read-only handle for automated tests
  GR.routes = GR.routes || {};
  GR.routes.path = (main, cid) => pathView(main, cid || "lc");
  GR.routes.learn = (main, cid) => { const id = location.hash.split("/")[3]; if (R && R.node.id === id) return render(); start(cid, id); };

  /* lessons take over the screen, Duolingo-style */
  GR.hooks = GR.hooks || [];
  GR.hooks.push((a) => document.body.classList.toggle("focus", a === "learn"));

  /* dashboard: a big "continue" card */
  GR.hooks = GR.hooks || [];
  GR.hooks.push((a) => { if (a) return; const hero = $(".hero"); if (!hero) return; Object.keys(C).forEach((cid) => { const nx = GR.pathNext(cid), c = C[cid], done = c.nodes.length - (nx ? c.nodes.length - nx.k : 0);
    hero.insertAdjacentHTML("afterend", `<a class="cont" href="${nx ? (nx.node.kind === "chest" ? "#/path/" + cid : `#/learn/${cid}/${nx.node.id}`) : "#/path/" + cid}" style="--pc:${c.color}"><span class="cont-ic">${ICON[nx ? nx.node.kind : "review"]}</span><div><span class="cap">${E(c.title)} · Unit ${nx ? nx.node.unit + 1 : c.units.length} · ${E(nx ? nx.unit.title : "complete")}</span><b>${nx ? (nx.node.kind === "chest" ? "Open your treasure chest" : "Continue: " + E(nx.node.title)) : "Course complete. Practice any lesson."}</b><span class="mbar"><i style="width:${(done / c.nodes.length) * 100}%;background:var(--pc)"></i></span></div><span class="btn primary">${done ? "Continue" : "Start"}</span></a>`); }); });
})();
