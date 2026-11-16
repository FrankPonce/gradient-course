/* Gradient — views: router, dashboard, track, lesson, session runner, results, tests, progress, lab, coding */
(function () {
  const E = GR.esc, $ = (s, r = document) => r.querySelector(s), pct = (v) => Math.round(v * 100);
  const LCOL = ["var(--lv0)", "var(--lv1)", "var(--lv2)", "var(--lv3)", "var(--lv4)"];
  const main = () => $("#main");
  let timer = null;

  /* ---------- small components ---------- */
  const ring = (v, color, size = 64, label) => { const r = size / 2 - 6, c = 2 * Math.PI * r, m = size / 2; return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${m}" cy="${m}" r="${r}" fill="none" stroke="var(--rule)" stroke-width="7"/><circle class="ringv" cx="${m}" cy="${m}" r="${r}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(c * v).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${m} ${m})"/><text x="50%" y="50%" dy=".35em" text-anchor="middle" font-size="${size * 0.26}" font-weight="800" fill="var(--ink)">${label === undefined ? pct(v) : label}</text></svg>`; };
  const bar = (v, color) => `<span class="mbar"><i style="width:${pct(v)}%;background:${color}"></i></span>`;
  const trendTag = (sid) => { const t = GR.trend(sid); return t === null ? "" : t >= 0.2 ? `<span class="tr up" title="Accuracy rising over recent attempts">▲</span>` : t <= -0.2 ? `<span class="tr dn" title="Accuracy falling over recent attempts">▼</span>` : ""; };
  const skillRow = (sid, sub) => { const s = GR.skills[sid], lv = GR.level(sid), st = GR.state.skills[sid]; return `<a class="srow" href="#/lesson/${sid}"><span class="dot" style="background:${LCOL[lv]}"></span><span class="st"><b>${E(s.name)}</b>${sub ? `<small>${sub}</small>` : ""}</span>${trendTag(sid)}${bar(GR.mastery(sid), LCOL[lv])}<span class="lvl">${GR.LEVELS[lv]}${st && st.n ? ` · ${Math.round(st.c)}/${Math.round(st.n)}` : ""}</span></a>`; };
  const diffTag = (d) => `<span class="tag d${d}">${["", "Easy", "Medium", "Hard"][d]}</span>`;
  const crumb = (...parts) => `<div class="crumb">${parts.map(([t, h]) => (h ? `<a href="${h}">${E(t)}</a>` : `<span>${E(t)}</span>`)).join(" / ")}</div>`;
  const totals = () => { let n = 0, c = 0, started = 0, mastered = 0; Object.keys(GR.skills).forEach((sid) => { const s = GR.state.skills[sid]; if (s && s.n) { n += s.h.length; c += s.h.reduce((a, e) => a + e[1], 0); started++; if (GR.level(sid) === 4) mastered++; } }); return { n, c, started, mastered, all: Object.keys(GR.skills).length }; };

  /* ---------- sessions ---------- */
  const start = (cfg) => {
    const items = GR.draw({ skills: cfg.skills, n: cfg.n, seed: cfg.seed, weights: cfg.weights, genShare: cfg.genShare });
    if (!items.length) return alert("No questions available for this selection yet.");
    const before = {}; items.forEach((q) => (before[q.skill] = GR.mastery(q.skill)));
    GR.session = Object.assign({}, cfg, { items, picks: items.map(() => null), flags: {}, i: 0, start: Date.now(), before });
    if (location.hash === "#/session") route(); else location.hash = "#/session";
  };
  const practiceSkill = (sid, n = 7) => start({ type: "practice", title: "Practice: " + GR.skills[sid].name, track: GR.skills[sid].track, ref: sid, skills: [sid], n, genShare: 0.35 });
  const smart = (tid) => { const rec = GR.recommend(tid, 8); if (!rec.length) return practiceSkill((tid ? GR.trackOf(tid) : GR.tracks[0]).skills[0]); const w = {}; rec.forEach((r, i) => (w[r.sid] = i < 2 ? 3 : i < 5 ? 2 : 1)); start({ type: "practice", title: tid ? `Targeted practice: ${GR.trackOf(tid).name}` : "Targeted practice: your weakest skills", track: tid || "mix", ref: "smart", skills: rec.map((r) => r.sid), weights: w, n: 12 }); };
  const moduleQuiz = (mid) => { const m = GR.moduleOf(mid); start({ type: "quiz", title: `Module quiz: ${m.name}`, track: m.track, ref: mid, skills: m.skills, n: 20, genShare: 0.3 }); };
  GR.MOCKS = [];
  const defineMocks = () => {
    GR.tracks.forEach((t) => ["A", "B", "C"].forEach((f) => GR.MOCKS.push({ id: `${t.id}-${f}`, track: t.id, title: `${t.name}: mock test ${f}`, skills: t.skills, n: 40, minutes: 60 })));
    GR.MOCKS.push({ id: "mix-data", track: "mix", title: "Data & AI interview mix", skills: ["ml", "ai", "ds"].flatMap((t) => GR.trackOf(t).skills), n: 45, minutes: 60 });
    GR.MOCKS.push({ id: "mix-analyst", track: "mix", title: "Analyst interview mix (stats, SQL, metrics)", skills: ["ds", "ba"].flatMap((t) => GR.trackOf(t).skills), n: 45, minutes: 60 });
    GR.MOCKS.push({ id: "mix-all", track: "mix", title: "Full-stack mix: all five tracks", skills: Object.keys(GR.skills), n: 60, minutes: 75 });
  };
  const startMock = (id) => { const m = GR.MOCKS.find((x) => x.id === id), tries = GR.state.sessions.filter((s) => s.ref === id).length; start({ type: "mock", title: m.title, track: m.track, ref: id, skills: m.skills, n: m.n, minutes: m.minutes, seed: (GR.hashNum(id) + tries * 7919) & 0x7fffffff, genShare: 0.28 }); };
  const diagnostic = () => start({ type: "quiz", title: "Placement diagnostic", track: "mix", ref: "diagnostic", skills: Object.keys(GR.skills), n: 30, genShare: 0.15 });

  const finish = () => {
    const s = GR.session; if (!s) return; clearInterval(timer);
    const bySkill = {}; let score = 0;
    s.items.forEach((q, i) => { const ok = s.picks[i] === q.answer; if (ok) score++; const b = bySkill[q.skill] || (bySkill[q.skill] = [0, 0]); b[1]++; if (ok) b[0]++; if (s.type === "mock") GR.record(q, ok); });
    const delta = {}; Object.keys(bySkill).forEach((sid) => (delta[sid] = [s.before[sid], GR.mastery(sid)]));
    const answered = s.type === "mock" ? s.items.length : s.picks.filter((p) => p !== null).length;
    const rec = { id: Date.now().toString(36), type: s.type, title: s.title, track: s.track, ref: s.ref, ts: Date.now(), dur: (Date.now() - s.start) / 1000, score, total: answered, scaled: s.type === "mock" ? GR.scaled(s.items, s.picks) : null, bySkill, delta,
      items: s.items.map((q, i) => ({ skill: q.skill, diff: q.diff, stem: q.stem, options: q.options, answer: q.answer, pick: s.picks[i], expl: q.expl, stim: q.stim, setTitle: q.setTitle, part: q.part, parts: q.parts })).filter((q) => s.type === "mock" || q.pick !== null) };
    GR.session = null;
    if (!answered) { location.hash = "#/"; return; }
    GR.state.sessions.push(rec); GR.save(); location.hash = "#/results/" + rec.id;
  };

  const vSession = () => {
    const s = GR.session; if (!s) { location.hash = "#/"; return; }
    const q = s.items[s.i], mock = s.type === "mock", pick = s.picks[s.i], shown = !mock && pick !== null, last = s.i === s.items.length - 1;
    const left = () => Math.max(0, s.minutes * 60 - (Date.now() - s.start) / 1000), clock = (t) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
    const done = s.picks.filter((p) => p !== null).length;
    main().innerHTML = `<div class="sess">
      <div class="sess-top"><div><div class="cap">${mock ? "Mock test · answers revealed at the end" : s.type === "quiz" ? "Quiz" : "Practice"}</div><h2>${E(s.title)}</h2></div>
        <div class="sess-meta">${mock ? `<span class="clock" id="clock">${clock(left())}</span>` : `<span class="chip"><i>correct</i><b>${s.items.filter((x, i) => s.picks[i] === x.answer).length} / ${done}</b></span>`}<button class="btn sm" data-act="quit">${mock ? "Submit test" : "End session"}</button></div></div>
      <div class="pbar"><i style="width:${((mock ? done : s.i + (shown ? 1 : 0)) / s.items.length) * 100}%"></i></div>
      ${mock ? `<div class="qnav">${s.items.map((_, i) => `<button data-act="goto" data-i="${i}" class="${i === s.i ? "cur " : ""}${s.picks[i] !== null ? "ans " : ""}${s.flags[i] ? "flag" : ""}">${i + 1}</button>`).join("")}</div>` : ""}
      <div class="qcard">
        <div class="qhead"><span>Question ${s.i + 1} of ${s.items.length}</span><span><a class="tag skill" ${mock ? "" : `href="#/lesson/${q.skill}"`}>${E(GR.skills[q.skill].name)}</a> ${diffTag(q.diff)}</span></div>
        ${q.stim ? `<div class="stim"><div class="cap">Case · ${E(q.setTitle)} · part ${q.part} of ${q.parts}</div>${q.stim}</div>` : ""}
        <div class="stem">${q.stem}</div>
        <div class="opts">${q.options.map((o, i) => `<button class="opt ${shown ? (i === q.answer ? "right" : i === pick ? "wrong" : "dim") : i === pick ? "sel" : ""}" data-act="pick" data-i="${i}" ${shown ? "disabled" : ""}><span class="key">${"ABCD"[i]}</span><span>${o}</span></button>`).join("")}</div>
        ${shown ? `<div class="expl ${pick === q.answer ? "ok" : "no"}"><b>${pick === q.answer ? "Correct." : "Not quite."}</b> ${q.expl}</div>` : ""}
        <div class="qfoot">${mock ? `<button class="btn sm" data-act="flag">${s.flags[s.i] ? "Unflag" : "Flag for review"}</button><span class="grow"></span><button class="btn" data-act="prev" ${s.i ? "" : "disabled"}>Previous</button><button class="btn primary" data-act="${last ? "quit" : "next"}">${last ? "Submit test" : "Next"}</button>`
          : `<span class="hintk">Keys: 1–4 to answer, Enter for next</span><span class="grow"></span>${shown ? `<button class="btn primary" data-act="${last ? "finish" : "next"}">${last ? "See results" : "Next question"}</button>` : `<button class="btn" data-act="skip">Skip</button>`}`}</div>
      </div></div>`;
    clearInterval(timer);
    if (mock) timer = setInterval(() => { const c = $("#clock"); if (!GR.session || !c) return clearInterval(timer); const t = left(); c.textContent = clock(t); c.classList.toggle("low", t < 300); if (t <= 0) { alert("Time is up. Your test is being submitted."); finish(); } }, 500);
  };
  const sessAct = {
    pick(d) { const s = GR.session, q = s.items[s.i]; if (s.type === "mock") { s.picks[s.i] = s.picks[s.i] === +d.i ? null : +d.i; } else { if (s.picks[s.i] !== null) return; s.picks[s.i] = +d.i; GR.record(q, +d.i === q.answer); GR.save(); } vSession(); },
    next() { const s = GR.session; if (s.i < s.items.length - 1) { s.i++; vSession(); } },
    prev() { const s = GR.session; if (s.i > 0) { s.i--; vSession(); } },
    skip() { const s = GR.session; if (s.i < s.items.length - 1) { s.i++; vSession(); } else finish(); },
    goto(d) { GR.session.i = +d.i; vSession(); },
    flag() { const s = GR.session; s.flags[s.i] = !s.flags[s.i]; vSession(); },
    finish,
    quit() { const s = GR.session, open = s.picks.filter((p) => p === null).length; if (s.type === "mock" ? confirm(open ? `Submit with ${open} unanswered question${open > 1 ? "s" : ""}? Unanswered questions count as incorrect.` : "Submit your test?") : true) finish(); },
  };

  /* ---------- dashboard ---------- */
  const recList = (tid, limit) => { const rec = GR.recommend(tid, limit); return rec.length ? rec.map((r) => { const s = GR.skills[r.sid], t = GR.trackOf(s.track), lv = GR.level(r.sid); return `<div class="rec"><span class="tk" style="background:${t.color}">${t.icon}</span><div class="rb"><b>${E(s.name)}</b><small>${r.kind === "new" ? "New" : GR.LEVELS[lv] + " · " + pct(GR.mastery(r.sid)) + "%"} · ${E(r.why)}</small></div><a class="btn sm" href="#/lesson/${r.sid}">Lesson</a><button class="btn sm primary" data-act="practice" data-sid="${r.sid}">Practice</button></div>`; }).join("") : `<p class="muted">Nothing urgent: every started skill is proficient and fresh. Take a mock test to find new gaps.</p>`; };
  const vDash = () => {
    const t = totals(), tests = GR.state.sessions.filter((s) => s.type === "mock"), recent = GR.state.sessions.slice(-5).reverse();
    main().innerHTML = `
      <header class="hero"><div><div class="cap"><b>G</b>ot <b>R</b>ejected <b>A</b>gain. <b>D</b>ecided <b>I</b>’m (an) <b>E</b>x-larper <b>N</b>ow. <b>T</b>raining.</div><h1>AI, data and engineering,<br>one skill at a time.</h1><p class="lead">${Object.keys(GR.skills).length} skills across five tracks. Every answer updates a mastery estimate per skill, and the course steers you to whatever needs work next.</p></div>
        <div class="stats"><div><b>${t.n}</b><span>questions answered</span></div><div><b>${t.n ? pct(t.c / t.n) + "%" : "–"}</b><span>accuracy</span></div><div><b>${t.started}<small>/${t.all}</small></b><span>skills started</span></div><div><b>${t.mastered}</b><span>mastered</span></div><div><b>${tests.length}</b><span>mock tests</span></div></div></header>
      ${t.n ? "" : `<div class="callout"><div><b>New here? Start with the placement diagnostic.</b><br><span class="muted">30 questions across all five tracks. It seeds your skill map so recommendations are useful from the first day.</span></div><button class="btn primary" data-act="diagnostic">Take the diagnostic</button></div>`}
      <div class="grid2">
        <section class="card"><div class="ch"><h3>Recommended next</h3><button class="btn sm primary" data-act="smart">Targeted practice (12 questions)</button></div>${recList(null, 6)}</section>
        <section class="card"><div class="ch"><h3>Recent activity</h3><a class="btn sm" href="#/progress">All progress</a></div>${recent.length ? recent.map((s) => `<a class="srow" href="#/results/${s.id}"><span class="dot" style="background:${(GR.trackOf(s.track) || { color: "var(--ink)" }).color}"></span><span class="st"><b>${E(s.title)}</b><small>${GR.fmtDate(s.ts)} · ${GR.fmtDur(s.dur)}</small></span><span class="lvl"><b>${s.score}/${s.total}</b>${s.scaled ? ` · ${s.scaled}` : ""}</span></a>`).join("") : `<p class="muted">Sessions you complete will appear here with scores and a full review.</p>`}</section>
      </div>
      <h3 class="sec">Tracks</h3>
      <div class="tracks">${GR.tracks.map((tr) => { const lv = [0, 0, 0, 0, 0]; tr.skills.forEach((s) => lv[GR.level(s)]++); return `<a class="tcard" href="#/track/${tr.id}" style="--tc:${tr.color}">${ring(GR.trackMastery(tr.id), tr.color, 72)}<div><h4>${E(tr.name)}</h4><p>${E(tr.blurb)}</p><div class="lvbar">${lv.map((n, i) => (n ? `<i style="flex:${n};background:${LCOL[i]}" title="${n} ${GR.LEVELS[i]}"></i>` : "")).join("")}</div><small>${tr.modules.length} modules · ${tr.skills.length} lessons · ${lv[4]} mastered</small></div></a>`; }).join("")}</div>
      <div class="legend">${GR.LEVELS.map((l, i) => `<span><i style="background:${LCOL[i]}"></i>${l}</span>`).join("")}</div>`;
  };

  /* ---------- track ---------- */
  const vTrack = (tid) => {
    const t = GR.trackOf(tid); if (!t) return vDash(); const ps = GR.poolSize(t.skills);
    main().innerHTML = `${crumb(["Dashboard", "#/"], [t.name])}
      <header class="thead" style="--tc:${t.color}">${ring(GR.trackMastery(tid), t.color, 96)}<div><h1>${E(t.name)}</h1><p class="lead">${E(t.blurb)}</p><div class="row"><button class="btn primary" data-act="smart" data-tid="${tid}">Targeted practice</button><a class="btn" href="#/tests">Mock tests</a><span class="muted">${ps.fixed} written questions · ${ps.sets} multi-part cases · ${ps.gens} generators that produce new numbers every time</span></div></div></header>
      <section class="card"><div class="ch"><h3>What to work on in this track</h3></div>${recList(tid, 3)}</section>
      ${t.modules.map((m, mi) => `<section class="card mod"><div class="ch"><div><div class="cap">Module ${mi + 1}</div><h3>${E(m.name)}</h3></div><div class="row">${bar(GR.groupMastery(m.skills), t.color)}<b>${pct(GR.groupMastery(m.skills))}%</b><button class="btn sm primary" data-act="mquiz" data-mid="${m.id}">Module quiz · 20 questions</button></div></div>
        ${m.topics.map((tp) => `<div class="topic"><div class="tname">${E(tp.name)}</div>${tp.lessons.map((l) => skillRow(l.skill, `${l.mins} min read${l.diagram ? " · interactive diagram" : ""}${GR.state.lessons[l.skill] ? " · read" : ""}`)).join("")}</div>`).join("")}</section>`).join("")}`;
  };

  /* ---------- lesson ---------- */
  const mountDiagram = (id, host) => { const d = GR.diagrams[id]; if (!d || !host) return; host.innerHTML = `<div class="dg-head"><div><div class="cap">Interactive diagram</div><h3>${E(d.title)}</h3><p>${E(d.blurb)}</p></div></div><div class="dg-body"></div><div class="dg-tasks"><b>Try it</b><ol>${d.tasks.map((x) => `<li>${E(x)}</li>`).join("")}</ol></div>`; try { d.mount($(".dg-body", host)); } catch (e) { console.error(e); $(".dg-body", host).innerHTML = `<p class="muted">This diagram failed to load: ${E(e.message)}</p>`; } };
  const vLesson = (sid) => {
    const s = GR.skills[sid]; if (!s) return vDash(); const t = GR.trackOf(s.track), l = s.lesson, i = t.skills.indexOf(sid), lv = GR.level(sid), st = GR.state.skills[sid], ps = GR.poolSize([sid]);
    if (!GR.state.lessons[sid]) { GR.state.lessons[sid] = Date.now(); GR.save(); }
    main().innerHTML = `${crumb(["Dashboard", "#/"], [t.name, "#/track/" + t.id], [GR.moduleOf(s.module).name], [s.topic])}
      <article class="lesson"><div class="lh"><div><div class="cap" style="color:${t.color}">${E(s.topic)} · ${l.mins} min</div><h1>${E(l.title)}</h1></div><div class="mast">${ring(GR.mastery(sid), LCOL[lv], 72)}<div><b>${GR.LEVELS[lv]}</b><small>${st && st.n ? `${Math.round(st.c)} of ${Math.round(st.n)} correct` : "No attempts yet"}</small></div></div></div>
        <div class="prose">${l.body}</div>
        ${l.diagram ? `<div class="dg" id="dg"></div>` : ""}
        <div class="keys"><b>Key takeaways</b><ul>${l.keys.map((k) => `<li>${E(k)}</li>`).join("")}</ul></div>
        <div class="callout"><div><b>Practise this skill</b><br><span class="muted">7 questions with instant explanations, drawn from ${ps.fixed} written questions${ps.sets ? `, ${ps.sets} multi-part case${ps.sets > 1 ? "s" : ""}` : ""}${ps.gens ? ` and ${ps.gens} generator${ps.gens > 1 ? "s" : ""}` : ""}. Least-seen questions come first.</span></div><button class="btn primary" data-act="practice" data-sid="${sid}">Start practice</button></div>
        ${GR.problems.some((p) => p.skill === sid) ? `<div class="rel"><b>Code it</b>${GR.problems.filter((p) => p.skill === sid).map((p) => `<a class="pill" href="#/code/${p.id}">${E(p.title)}</a>`).join("")}</div>` : ""}
        ${s.related.length ? `<div class="rel"><b>Connected skills</b>${s.related.filter((r) => GR.skills[r]).map((r) => `<a class="pill" href="#/lesson/${r}"><i style="background:${GR.trackOf(GR.skills[r].track).color}"></i>${E(GR.skills[r].name)}</a>`).join("")}</div>` : ""}
        <div class="lnav">${i > 0 ? `<a class="btn" href="#/lesson/${t.skills[i - 1]}">← ${E(GR.skills[t.skills[i - 1]].name)}</a>` : "<span></span>"}${i < t.skills.length - 1 ? `<a class="btn" href="#/lesson/${t.skills[i + 1]}">${E(GR.skills[t.skills[i + 1]].name)} →</a>` : ""}</div>
      </article>`;
    if (l.diagram) mountDiagram(l.diagram, $("#dg"));
  };

  /* ---------- results ---------- */
  const vResults = (id) => {
    const r = GR.state.sessions.find((s) => s.id === id); if (!r) return vDash(); const p = r.total ? r.score / r.total : 0;
    const rows = Object.entries(r.bySkill).map(([sid, [c, n]]) => ({ sid, c, n, a: c / n })).sort((a, b) => a.a - b.a), weak = rows.filter((x) => x.a < 0.7).map((x) => x.sid);
    const prev = GR.state.sessions.filter((s) => s.ref === r.ref && s.ts < r.ts && s.total).slice(-1)[0];
    main().innerHTML = `${crumb(["Dashboard", "#/"], ["Results"])}
      <header class="thead">${ring(p, p >= 0.8 ? LCOL[4] : p >= 0.6 ? LCOL[3] : p >= 0.4 ? LCOL[2] : LCOL[1], 110)}<div><div class="cap">${GR.fmtDate(r.ts)} · ${GR.fmtDur(r.dur)}${r.total ? ` · ${Math.round(r.dur / r.total)} s per question` : ""}</div><h1>${E(r.title)}</h1>
        <div class="stats in"><div><b>${r.score}<small>/${r.total}</small></b><span>correct</span></div>${r.scaled ? `<div><b>${r.scaled}</b><span>scaled score (200–800)</span></div>` : ""}${prev ? `<div><b class="${r.score / r.total >= prev.score / prev.total ? "pos" : "neg"}">${r.score / r.total >= prev.score / prev.total ? "+" : ""}${pct(r.score / r.total - prev.score / prev.total)} pts</b><span>vs previous attempt</span></div>` : ""}</div>
        <div class="row">${weak.length ? `<button class="btn primary" data-act="drill" data-s="${weak.join(",")}">Drill the ${weak.length} weakest skill${weak.length > 1 ? "s" : ""} from this session</button>` : ""}<a class="btn" href="#/progress">View progress</a></div></div></header>
      <section class="card"><div class="ch"><h3>Breakdown by skill</h3><span class="muted">sorted weakest first · mastery change from this session</span></div>
        <table class="tbl"><tr><th>Skill</th><th>Track</th><th>Score</th><th></th><th>Mastery</th></tr>${rows.map((x) => { const s = GR.skills[x.sid], d = r.delta && r.delta[x.sid]; return `<tr><td><a href="#/lesson/${x.sid}">${E(s.name)}</a></td><td><span class="tk sm" style="background:${GR.trackOf(s.track).color}">${GR.trackOf(s.track).icon}</span></td><td><b>${x.c}/${x.n}</b></td><td>${bar(x.a, x.a >= 0.8 ? LCOL[4] : x.a >= 0.5 ? LCOL[2] : LCOL[1])}</td><td>${d ? `${pct(d[0])}% → <b>${pct(d[1])}%</b> <span class="${d[1] >= d[0] ? "pos" : "neg"}">${d[1] >= d[0] ? "+" : ""}${pct(d[1] - d[0])}</span>` : "–"}</td></tr>`; }).join("")}</table></section>
      ${r.items ? `<section class="card"><div class="ch"><h3>Question review</h3><div class="row"><button class="btn sm" data-act="rfilter" data-f="all">All</button><button class="btn sm" data-act="rfilter" data-f="wrong">Incorrect only</button></div></div><div id="review">${r.items.map((q, i) => { const ok = q.pick === q.answer; return `<details class="rev ${ok ? "ok" : "no"}" ${ok ? "" : "open"}><summary><span class="mk">${ok ? "✓" : q.pick === null ? "–" : "✗"}</span><span class="rs">${i + 1}. ${q.stem.replace(/<pre>[\s\S]*?<\/pre>/g, " […code]").replace(/<[^>]+>/g, "").slice(0, 110)}</span><span class="tag skill">${E(GR.skills[q.skill].name)}</span>${diffTag(q.diff)}</summary>${q.stim ? `<div class="stim"><div class="cap">Case · ${E(q.setTitle)} · part ${q.part} of ${q.parts}</div>${q.stim}</div>` : ""}<div class="stem">${q.stem}</div><div class="opts">${q.options.map((o, k) => `<div class="opt ${k === q.answer ? "right" : k === q.pick ? "wrong" : "dim"}"><span class="key">${"ABCD"[k]}</span><span>${o}</span>${k === q.pick ? `<em>your answer</em>` : ""}</div>`).join("")}</div><div class="expl ${ok ? "ok" : "no"}">${q.pick === null ? "<b>Not answered.</b> " : ""}${q.expl}</div></details>`; }).join("")}</div></section>` : `<p class="muted">The question-by-question review is kept for your 40 most recent sessions.</p>`}`;
  };

  /* ---------- tests ---------- */
  const vTests = () => {
    const hist = GR.state.sessions.filter((s) => s.type === "mock").reverse();
    const row = (m) => { const at = GR.state.sessions.filter((s) => s.ref === m.id), best = at.reduce((b, s) => Math.max(b, s.scaled || 0), 0), ps = GR.poolSize(m.skills); return `<div class="rec"><div class="rb"><b>${E(m.title)}</b><small>${m.n} questions · ${m.minutes} minutes · drawn from ${ps.fixed} written questions, ${ps.sets} cases and ${ps.gens} generators${at.length ? ` · ${at.length} attempt${at.length > 1 ? "s" : ""}` : ""}</small></div>${best ? `<span class="chip"><i>best</i><b>${best}</b></span>` : ""}<button class="btn sm primary" data-act="mock" data-id="${m.id}">${at.length ? "Retake" : "Start"}</button></div>`; };
    main().innerHTML = `${crumb(["Dashboard", "#/"], ["Mock tests"])}<header class="thead"><div><h1>Mock tests</h1><p class="lead">Timed, one hour, no feedback until you submit. Each test balances questions across every skill in its track, mixes difficulty, prefers questions you have seen least, and regenerates the numeric ones, so a retake is a different paper. Scores are difficulty-weighted on a 200–800 scale.</p></div></header>
      ${GR.tracks.map((t) => `<section class="card"><div class="ch"><h3><span class="tk" style="background:${t.color}">${t.icon}</span> ${E(t.name)}</h3></div>${GR.MOCKS.filter((m) => m.track === t.id).map(row).join("")}</section>`).join("")}
      <section class="card"><div class="ch"><h3>Cross-track interview mixes</h3></div>${GR.MOCKS.filter((m) => m.track === "mix").map(row).join("")}</section>
      <section class="card"><div class="ch"><h3>Test history</h3></div>${hist.length ? `<table class="tbl"><tr><th>Date</th><th>Test</th><th>Correct</th><th>Scaled</th><th>Time</th><th></th></tr>${hist.map((s) => `<tr><td>${GR.fmtDate(s.ts)}</td><td>${E(s.title)}</td><td>${s.score}/${s.total}</td><td><b>${s.scaled}</b></td><td>${GR.fmtDur(s.dur)}</td><td><a href="#/results/${s.id}">Review</a></td></tr>`).join("")}</table>` : `<p class="muted">No tests taken yet.</p>`}</section>`;
  };

  /* ---------- progress ---------- */
  const chart = (series, { w = 640, h = 230, xl = [] } = {}) => { const x0 = 36, x1 = w - 14, y0 = h - 26, y1 = 12, n = Math.max(2, ...series.map((s) => s.pts.reduce((m, p) => Math.max(m, p[0] + 1), 0))), X = (i) => x0 + (i / (n - 1)) * (x1 - x0), Y = (v) => y0 - (v / 100) * (y0 - y1); let g = "";
    [0, 25, 50, 75, 100].forEach((v) => (g += `<line x1="${x0}" x2="${x1}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--rule)"/><text x="${x0 - 6}" y="${Y(v) + 4}" text-anchor="end" class="ax">${v}</text>`));
    series.forEach((s) => { if (!s.pts.length) return; if (s.pts.length > 1) g += `<path d="${s.pts.map((p, i) => `${i ? "L" : "M"}${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join("")}" fill="none" stroke="${s.color}" stroke-width="2.5" pathLength="1" class="draw"/>`; s.pts.forEach((p) => (g += `<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="4" fill="${s.color}" stroke="var(--bg)" stroke-width="1.5"><title>${E(s.name)}: ${p[1]}%${p[2] ? " · " + E(p[2]) : ""}</title></circle>`)); });
    xl.forEach(([i, t]) => (g += `<text x="${X(i)}" y="${h - 6}" text-anchor="middle" class="ax">${t}</text>`));
    return `<div class="legend">${series.filter((s) => s.pts.length).map((s) => `<span><i style="background:${s.color}"></i>${E(s.name)}</span>`).join("")}</div><svg viewBox="0 0 ${w} ${h}" class="chart">${g}</svg>`; };
  const vProgress = () => {
    const t = totals(), days = Object.keys(GR.state.snap).sort().slice(-30), ids = Object.keys(GR.skills), act = ids.filter((s) => (GR.state.skills[s] || {}).n >= 3);
    const byM = act.slice().sort((a, b) => GR.mastery(b) - GR.mastery(a)), up = ids.filter((s) => GR.trend(s) >= 0.2), dn = ids.filter((s) => GR.trend(s) !== null && GR.trend(s) <= -0.2);
    const scored = GR.state.sessions.filter((s) => s.total >= 5 && s.type !== "practice").slice(-30);
    const sSeries = [...GR.tracks.map((tr) => ({ name: tr.name, color: tr.color, id: tr.id })), { name: "Cross-track", color: "var(--ink)", id: "mix" }].map((tr) => ({ name: tr.name, color: tr.color, pts: scored.map((s, i) => [i, pct(s.score / s.total), s.title, s.track]).filter((p) => p[3] === tr.id) }));
    const list = (arr, empty) => (arr.length ? arr.map((s) => skillRow(s, GR.trackOf(GR.skills[s].track).name)).join("") : `<p class="muted">${empty}</p>`);
    const first = days.length ? GR.state.snap[days[0]] : null;
    main().innerHTML = `${crumb(["Dashboard", "#/"], ["Progress"])}<header class="thead"><div><h1>Progress</h1><p class="lead">Mastery is estimated per skill from every answer, weighted by question difficulty. Harder questions answered correctly move it more.</p>
      <div class="stats in"><div><b>${t.n}</b><span>questions answered</span></div><div><b>${t.n ? pct(t.c / t.n) + "%" : "–"}</b><span>overall accuracy</span></div><div><b>${t.started}<small>/${t.all}</small></b><span>skills started</span></div><div><b>${t.mastered}</b><span>mastered</span></div><div><b>${GR.state.sessions.length}</b><span>sessions</span></div></div></div></header>
      <div class="grid2">
        <section class="card"><div class="ch"><h3>Mastery by track over time</h3><span class="muted">average mastery across all skills in the track, last ${days.length || 0} active day${days.length === 1 ? "" : "s"}</span></div>${days.length ? chart(GR.tracks.map((tr) => ({ name: tr.name, color: tr.color, pts: days.map((d, i) => [i, Math.round(GR.state.snap[d][tr.id] || 0)]) })), { xl: days.length > 1 ? [[0, days[0].slice(5)], [days.length - 1, days[days.length - 1].slice(5)]] : [[0, days[0].slice(5)]] }) : `<p class="muted">Answer some questions to start the chart.</p>`}</section>
        <section class="card"><div class="ch"><h3>Quiz and test scores</h3><span class="muted">percentage correct, most recent 30 scored sessions</span></div>${scored.length ? chart(sSeries, { xl: [[0, GR.fmtDate(scored[0].ts)], ...(scored.length > 1 ? [[scored.length - 1, GR.fmtDate(scored[scored.length - 1].ts)]] : [])] }) : `<p class="muted">Take a module quiz or mock test to start the chart.</p>`}</section>
      </div>
      <section class="card"><div class="ch"><h3>By area</h3><span class="muted">change is measured against your first recorded day in the last 30</span></div><table class="tbl"><tr><th>Track / module</th><th>Mastery</th><th></th><th>Accuracy</th><th>Attempts</th><th>Change</th></tr>${GR.tracks.map((tr) => { const agg = (sids) => { let n = 0, c = 0; sids.forEach((s) => { const st = GR.state.skills[s]; if (st) { n += st.n; c += st.c; } }); return [n, c]; }; const [n, c] = agg(tr.skills), now = GR.trackMastery(tr.id) * 100, ch = first ? now - (first[tr.id] || 0) : 0;
        return `<tr class="trow"><td><span class="tk sm" style="background:${tr.color}">${tr.icon}</span> <a href="#/track/${tr.id}"><b>${E(tr.name)}</b></a></td><td><b>${Math.round(now)}%</b></td><td>${bar(now / 100, tr.color)}</td><td>${n ? pct(c / n) + "%" : "–"}</td><td>${Math.round(n)}</td><td class="${ch >= 0 ? "pos" : "neg"}">${Math.abs(ch) < 0.5 ? "–" : (ch > 0 ? "+" : "") + ch.toFixed(0) + " pts"}</td></tr>` + tr.modules.map((m) => { const [mn, mc] = agg(m.skills); return `<tr><td class="ind">${E(m.name)}</td><td>${pct(GR.groupMastery(m.skills))}%</td><td>${bar(GR.groupMastery(m.skills), tr.color)}</td><td>${mn ? pct(mc / mn) + "%" : "–"}</td><td>${Math.round(mn)}</td><td></td></tr>`; }).join(""); }).join("")}</table></section>
      <div class="grid2">
        <section class="card"><div class="ch"><h3>Key strengths</h3></div>${list(byM.slice(0, 5), "Needs at least three attempts on a skill.")}</section>
        <section class="card"><div class="ch"><h3>Key weaknesses</h3><button class="btn sm primary" data-act="smart">Practise these</button></div>${list(byM.slice(-5).reverse().filter((s) => GR.level(s) < 4), "Needs at least three attempts on a skill.")}</section>
        <section class="card"><div class="ch"><h3>Improving <span class="tr up">▲</span></h3></div>${list(up, "Skills whose accuracy over your last five attempts beats the five before.")}</section>
        <section class="card"><div class="ch"><h3>Slipping <span class="tr dn">▼</span></h3></div>${list(dn, "Skills whose recent accuracy has dropped will be flagged here and pushed up your recommendations.")}</section>
      </div>
      <section class="card"><div class="ch"><h3>Skill map</h3><span class="muted">every skill, grouped by module. Click a cell to open its lesson.</span></div>${GR.tracks.map((tr) => `<div class="smap"><div class="smt"><span class="tk sm" style="background:${tr.color}">${tr.icon}</span> ${E(tr.name)}</div>${tr.modules.map((m) => `<div class="smm"><small>${E(m.name)}</small><div>${m.skills.map((s) => `<a href="#/lesson/${s}" class="cell" style="background:${LCOL[GR.level(s)]}" title="${E(GR.skills[s].name)} — ${GR.LEVELS[GR.level(s)]} (${pct(GR.mastery(s))}%)">${pct(GR.mastery(s)) || ""}</a>`).join("")}</div></div>`).join("")}</div>`).join("")}<div class="legend">${GR.LEVELS.map((l, i) => `<span><i style="background:${LCOL[i]}"></i>${l}</span>`).join("")}</div></section>
      <section class="card"><div class="ch"><h3>All sessions</h3></div>${GR.state.sessions.length ? `<table class="tbl"><tr><th>Date</th><th>Session</th><th>Type</th><th>Score</th><th>Time</th><th></th></tr>${GR.state.sessions.slice().reverse().slice(0, 60).map((s) => `<tr><td>${GR.fmtDate(s.ts)}</td><td>${E(s.title)}</td><td>${s.type}</td><td><b>${s.score}/${s.total}</b>${s.scaled ? ` (${s.scaled})` : ""}</td><td>${GR.fmtDur(s.dur)}</td><td><a href="#/results/${s.id}">Review</a></td></tr>`).join("")}</table>` : `<p class="muted">No sessions yet.</p>`}</section>
      <section class="card"><div class="ch"><h3>Your data</h3></div><p class="muted">Progress is stored in this browser only (localStorage). Export a backup to move it to another machine or browser.</p><div class="row"><button class="btn" data-act="export">Export progress</button><label class="btn">Import progress<input type="file" id="imp" accept="application/json" hidden></label><button class="btn danger" data-act="reset">Reset all progress</button></div></section>`;
    $("#imp").addEventListener("change", (e) => { const f = e.target.files[0]; if (!f) return; f.text().then((txt) => { try { GR.importData(txt); route(); } catch (err) { alert("Import failed: " + err.message); } }); });
  };

  /* ---------- lab ---------- */
  const vLab = (id) => {
    if (id && GR.diagrams[id]) { const d = GR.diagrams[id]; main().innerHTML = `${crumb(["Dashboard", "#/"], ["Interactive lab", "#/lab"], [d.title])}<div class="dg" id="dg"></div><div class="rel"><b>Lessons that use this</b>${d.skills.map((s) => `<a class="pill" href="#/lesson/${s}"><i style="background:${GR.trackOf(GR.skills[s].track).color}"></i>${E(GR.skills[s].name)}</a>`).join("")}</div>`; return mountDiagram(id, $("#dg")); }
    main().innerHTML = `${crumb(["Dashboard", "#/"], ["Interactive lab"])}<header class="thead"><div><h1>Interactive lab</h1><p class="lead">${Object.keys(GR.diagrams).length} hands-on diagrams. Each one is a small simulation you can break: change a parameter, predict what happens, then check.</p></div></header>
      <div class="labgrid">${Object.entries(GR.diagrams).map(([k, d]) => { const t = GR.trackOf(GR.skills[d.skills[0]].track); return `<a class="lcard" href="#/lab/${k}" style="--tc:${t.color}"><span class="tk" style="background:${t.color}">${t.icon}</span><h4>${E(d.title)}</h4><p>${E(d.blurb)}</p></a>`; }).join("")}</div>`;
  };

  /* ---------- coding ---------- */
  const cst = (id) => GR.state.code[id] || (GR.state.code[id] = { solved: false, tries: 0, src: {} });
  const vCodeList = () => {
    const solved = GR.problems.filter((p) => (GR.state.code[p.id] || {}).solved).length;
    main().innerHTML = `${crumb(["Dashboard", "#/"], ["Coding practice"])}<header class="thead">${ring(solved / GR.problems.length, LCOL[4], 96, `${solved}/${GR.problems.length}`)}<div><h1>Coding practice</h1><p class="lead">Write and run real code in the browser, in JavaScript or Python, against hidden-style test cases. Submissions feed the same skill mastery as quizzes. Problems cover classic interview patterns plus implement-it-yourself ML and analytics building blocks.</p></div></header>
      <section class="card"><table class="tbl"><tr><th></th><th>Problem</th><th>Difficulty</th><th>Skill</th><th>Attempts</th></tr>${GR.problems.map((p) => { const c = GR.state.code[p.id] || {}, s = GR.skills[p.skill], t = GR.trackOf(s.track); return `<tr><td>${c.solved ? `<span class="pos">✓</span>` : ""}</td><td><a href="#/code/${p.id}"><b>${E(p.title)}</b></a></td><td>${diffTag(p.diff)}</td><td><span class="tk sm" style="background:${t.color}">${t.icon}</span> <a href="#/lesson/${p.skill}">${E(s.name)}</a></td><td>${c.tries || 0}</td></tr>`; }).join("")}</table></section>`;
  };
  let lang = localStorage.getItem("gradient.lang") || "py";
  const fmtV = (v) => { const s = JSON.stringify(v); return s.length > 120 ? s.slice(0, 117) + "…" : s; };
  const vCode = (id) => {
    const p = GR.problems.find((x) => x.id === id); if (!p) return vCodeList(); const c = cst(id), s = GR.skills[p.skill], i = GR.problems.indexOf(p);
    main().innerHTML = `${crumb(["Dashboard", "#/"], ["Coding practice", "#/code"], [p.title])}
      <div class="code"><div class="cleft"><h1>${E(p.title)} ${c.solved ? `<span class="pos">✓</span>` : ""}</h1><div class="row">${diffTag(p.diff)}<a class="tag skill" href="#/lesson/${p.skill}">${E(s.name)}</a></div><div class="prose">${p.desc}</div>
          <details class="hint"><summary>Hint</summary><p>${E(p.hint)}</p></details>
          <details class="hint"><summary>Approach and complexity</summary><p>${E(p.approach)}</p></details>
          <details class="hint"><summary>Reference solution (JavaScript)</summary><pre>${E(p.sol)}</pre></details>
          <div class="lnav">${i > 0 ? `<a class="btn sm" href="#/code/${GR.problems[i - 1].id}">← Previous</a>` : "<span></span>"}${i < GR.problems.length - 1 ? `<a class="btn sm" href="#/code/${GR.problems[i + 1].id}">Next →</a>` : ""}</div></div>
        <div class="cright"><div class="ebar"><div class="seg"><button data-act="lang" data-l="py" class="${lang === "py" ? "on" : ""}">Python</button><button data-act="lang" data-l="js" class="${lang === "js" ? "on" : ""}">JavaScript</button></div><span class="grow"></span><button class="btn sm" data-act="creset">Reset code</button><button class="btn sm" data-act="crun" data-id="${id}">Run examples</button><button class="btn sm primary" data-act="csubmit" data-id="${id}">Submit</button></div>
          <textarea id="ed" spellcheck="false" autocapitalize="off" autocomplete="off">${E(c.src[lang] || p[lang][1])}</textarea><div id="out" class="out"><p class="muted">“Run examples” executes the first two test cases. “Submit” runs all ${p.tests.length} and updates your mastery of ${E(s.name)}.${lang === "py" ? " Python runs locally via Pyodide, downloaded once from a CDN." : ""}</p></div></div></div>`;
    const ed = $("#ed");
    ed.addEventListener("input", () => { c.src[lang] = ed.value; });
    ed.addEventListener("keydown", (e) => { const ins = (t) => { const a = ed.selectionStart; ed.setRangeText(t, a, ed.selectionEnd, "end"); c.src[lang] = ed.value; };
      if (e.key === "Tab") { e.preventDefault(); ins(lang === "py" ? "    " : "  "); }
      else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); runCode(id, true); }
      else if (e.key === "Enter") { e.preventDefault(); const before = ed.value.slice(0, ed.selectionStart), ln = before.slice(before.lastIndexOf("\n") + 1), ind = ln.match(/^\s*/)[0] + (/[:{([]\s*$/.test(ln) ? (lang === "py" ? "    " : "  ") : ""); ins("\n" + ind); } });
  };
  let running = false;
  const runCode = (id, submit) => {
    if (running) return; const p = GR.problems.find((x) => x.id === id), c = cst(id), out = $("#out"), code = $("#ed").value; c.src[lang] = code; running = true;
    out.innerHTML = `<p class="muted">Running…</p>`;
    const prob = submit ? p : Object.assign({}, p, { tests: p.tests.slice(0, 2) });
    GR.runCode(prob, lang, code, (msg) => (out.innerHTML = `<p class="muted">${E(msg)}</p>`)).then((d) => {
      running = false; if (!out.isConnected) return;
      if (d.error) { out.innerHTML = `<div class="expl no"><b>Error.</b> <code>${E(d.error)}</code></div>`; if (submit) { c.tries++; GR.save(); } return; }
      const ok = d.results.every((r) => r.pass), np = d.results.filter((r) => r.pass).length;
      if (submit) { c.tries++; const first = ok && !c.solved; if (ok) c.solved = true; if (first || !ok) GR.record({ skill: p.skill, diff: p.diff, also: [], gen: true }, ok, ok ? 2 : 1); GR.save(); }
      out.innerHTML = `<div class="expl ${ok ? "ok" : "no"}"><b>${ok ? (submit ? "Accepted." : "Examples pass.") : `${np} of ${d.results.length} passed.`}</b> ${ok && submit ? `All ${d.results.length} tests passed. Mastery of ${E(GR.skills[p.skill].name)} is now ${pct(GR.mastery(p.skill))}%.` : ok ? "Now submit to run the full test set." : ""}</div>` +
        d.results.map((r, i) => `<details class="tc ${r.pass ? "ok" : "no"}" ${r.pass ? "" : "open"}><summary>${r.pass ? "✓" : "✗"} Test ${i + 1}</summary><div class="kv"><span>input</span><code>${E(r.args.map(fmtV).join(", "))}</code><span>expected</span><code>${E(fmtV(r.exp))}</code><span>${r.err ? "error" : "got"}</span><code>${E(r.err || fmtV(r.got))}</code>${r.logs && r.logs.length ? `<span>stdout</span><code>${E(r.logs.join("\n"))}</code>` : ""}</div></details>`).join("");
    });
  };

  /* ---------- router ---------- */
  const nav = () => { const h = location.hash || "#/"; $("#nav").innerHTML = `
      <a class="brand" href="#/"><svg class="mark" width="34" height="34" viewBox="-2 -2 36 36" aria-hidden="true"><path d="M3 24 C10 24 10 10 16 10 S22 20 26 8" fill="none" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round"/><path d="M26 0 L27.3 6.7 L34 8 L27.3 9.3 L26 16 L24.7 9.3 L18 8 L24.7 6.7 Z" fill="var(--or)"/><circle cx="26" cy="8" r="1.3" fill="var(--bg)"/></svg><span class="bn"><b>GRADIENT</b><small>Got Rejected Again. Decided I’m (an) Ex-larper Now. Training.</small></span></a>
      ${GR.session ? `<a class="resume" href="#/session">Resume: ${E(GR.session.title)}</a>` : ""}
      <a href="#/" class="${h === "#/" ? "on" : ""}">Dashboard</a>
      <div class="ng">Tracks</div>${GR.tracks.map((t) => `<a href="#/track/${t.id}" class="${h === "#/track/" + t.id || (h.startsWith("#/lesson/" + t.id + ".")) ? "on" : ""}"><span class="tk sm" style="background:${t.color}">${t.icon}</span><span class="nt">${E(t.name)}</span><em>${pct(GR.trackMastery(t.id))}%</em></a>`).join("")}
      <div class="ng">Practice</div><a href="#/tests" class="${h === "#/tests" ? "on" : ""}">Mock tests</a><a href="#/code" class="${h.startsWith("#/code") ? "on" : ""}">Coding practice</a><a href="#/lab" class="${h.startsWith("#/lab") ? "on" : ""}">Interactive lab</a>
      <div class="ng">You</div><a href="#/progress" class="${h === "#/progress" ? "on" : ""}">Progress</a>
      <button class="theme" data-act="theme" aria-label="Switch to ${dark() ? "light" : "dark"} mode">${dark() ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>` : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z"/></svg>`}<span>${dark() ? "Light mode" : "Dark mode"}</span></button>`; };
  const dark = () => document.documentElement.dataset.theme !== "light";
  const route = () => {
    clearInterval(timer); const [, a, b] = (location.hash || "#/").split("/");
    ({ track: () => vTrack(b), lesson: () => vLesson(b), session: vSession, results: () => vResults(b), tests: vTests, progress: vProgress, lab: () => vLab(b), code: () => (b ? vCode(b) : vCodeList()) }[a] || vDash)();
    nav(); if (a !== "session" || !GR.session || GR.session.i === 0) window.scrollTo(0, 0);
  };

  const acts = Object.assign({
    theme: () => { const t = dark() ? "light" : "dark"; document.documentElement.dataset.theme = t; localStorage.setItem("gradient.theme", t); nav(); },
    practice: (d) => practiceSkill(d.sid), smart: (d) => smart(d.tid), mquiz: (d) => moduleQuiz(d.mid), mock: (d) => startMock(d.id), diagnostic,
    drill: (d) => { const sk = d.s.split(","); start({ type: "practice", title: "Drill: weakest skills from your last session", track: "mix", ref: "drill", skills: sk, n: Math.min(15, sk.length * 4) }); },
    rfilter: (d) => document.querySelectorAll("#review .rev").forEach((e) => (e.style.display = d.f === "wrong" && e.classList.contains("ok") ? "none" : "")),
    export: () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([GR.exportData()], { type: "application/json" })); a.download = `gradient-progress-${new Date().toISOString().slice(0, 10)}.json`; a.click(); },
    reset: () => { if (confirm("Delete all progress, scores and saved code in this browser? This cannot be undone.")) { GR.reset(); route(); } },
    lang: (d) => { lang = d.l; localStorage.setItem("gradient.lang", lang); GR.save(); route(); },
    creset: () => { const id = location.hash.split("/")[2], p = GR.problems.find((x) => x.id === id); if (p && confirm("Replace your code with the starter template?")) { cst(id).src[lang] = p[lang][1]; $("#ed").value = p[lang][1]; } },
    crun: (d) => runCode(d.id, false), csubmit: (d) => runCode(d.id, true),
  }, sessAct);
  document.addEventListener("click", (e) => { const el = e.target.closest("[data-act]"); if (!el || el.disabled) return; const f = acts[el.dataset.act]; if (f) { e.preventDefault(); f(el.dataset); } });
  document.addEventListener("keydown", (e) => { const s = GR.session; if (!s || !location.hash.startsWith("#/session") || e.target.tagName === "TEXTAREA") return;
    if (e.key >= "1" && e.key <= "4" && +e.key <= s.items[s.i].options.length) sessAct.pick({ i: +e.key - 1 });
    else if (e.key === "Enter" || e.key === "ArrowRight") { e.preventDefault(); if (s.type === "mock") sessAct.next(); else if (s.picks[s.i] !== null) (s.i === s.items.length - 1 ? finish : sessAct.next)(); }
    else if (e.key === "ArrowLeft" && s.type === "mock") sessAct.prev(); });
  window.addEventListener("hashchange", route);
  window.addEventListener("beforeunload", (e) => { if (GR.session && GR.session.type === "mock") { e.preventDefault(); e.returnValue = ""; } });
  window.addEventListener("DOMContentLoaded", () => { defineMocks(); route(); });
})();
