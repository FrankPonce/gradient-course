/* The LeetCode hub (#/lc): pattern map, visualizers, cheat sheets, study plan, classic-problem tracker,
   in-browser practice and a timed mock coding interview. */
(function () {
  const E = GR.esc, pct = (v) => Math.round(v * 100);
  const g = () => { const s = GR.game.state(); s.lcDone = s.lcDone || {}; s.lcPaid = s.lcPaid || {}; return s; };
  const PAY = { E: [20, 5], M: [40, 10], H: [70, 20] };
  let filt = { p: "all", d: "all", todo: false };

  const VIZ_FOR = { "lc.twoptr": "lc-twoptr", "lc.window": "lc-window", "lc.prefix": "lc-prefix", "lc.bsearch": "lc-bsearch", "lc.stack": "lc-monostack", "lc.linked": "lc-fastslow", "lc.heap": "lc-heap", "lc.intervals": "lc-intervals", "lc.trees": "lc-treedfs", "lc.trie": "lc-trie", "lc.graphs": "lc-gridbfs", "lc.graphadv": "lc-topo", "lc.backtrack": "lc-backtrack", "lc.dp1": "lc-dp1", "lc.dp2": "lc-lcs", "lc.greedy": "lc-kadane" };
  const COSTS = [["Array / list", "O(1) index · O(n) search · O(1) append · O(n) insert at front"], ["Hash map / set", "O(1) average get, set, delete, membership"], ["Deque", "O(1) push and pop at both ends"], ["Heap", "O(1) peek min · O(log n) push and pop · O(n) heapify"], ["Sorted array", "O(log n) search (bisect) · O(n) insert"], ["Balanced BST", "O(log n) search, insert, delete; ordered iteration"], ["Trie", "O(L) insert and lookup for a word of length L"], ["Union-find", "≈ O(1) find and union with compression + size"]];
  const TOOLKIT = `from collections import Counter, defaultdict, deque
import heapq, bisect
from functools import cache

Counter("banana").most_common(2)     # [('a', 3), ('n', 2)]
groups = defaultdict(list)           # no KeyError on first append
q = deque([start]); q.popleft()      # O(1) queue for BFS
heapq.heappush(h, (dist, node))      # min-heap of tuples; negate for max
i = bisect.bisect_left(sorted_list, x)   # first index >= x
@cache                               # memoize a recursive DP
def f(i, j): ...
sorted(pairs, key=lambda p: (p[1], -p[0]))   # sort by end, then start desc
float('inf'), divmod(a, b), ord('c') - ord('a')`;
  const PLAN = [["Week 1", "Hashing, two pointers", ["lc.hashing", "lc.twoptr"]], ["Week 2", "Sliding window, prefix sums", ["lc.window", "lc.prefix"]], ["Week 3", "Binary search, stacks", ["lc.bsearch", "lc.stack"]], ["Week 4", "Linked lists, heaps, intervals", ["lc.linked", "lc.heap", "lc.intervals"]], ["Week 5", "Trees, BSTs, tries", ["lc.trees", "lc.bst", "lc.trie"]], ["Week 6", "Graphs", ["lc.graphs", "lc.graphadv"]], ["Week 7", "Backtracking, 1-D DP", ["lc.backtrack", "lc.dp1"]], ["Week 8", "2-D DP, greedy, bits, then mixed timed sets", ["lc.dp2", "lc.greedy", "lc.bits"]]];

  const view = (main) => {
    const t = GR.trackOf("lc"), S = g(), all = GR.lcProblems, done = all.filter((p) => S.lcDone[p.slug]).length, pats = t.modules.slice(1, 5).flatMap((m) => m.skills);
    const inb = GR.problems.filter((p) => p.lc || /^swe\./.test(p.skill)), inbDone = inb.filter((p) => (GR.state.code[p.id] || {}).solved).length;
    const byD = { E: all.filter((p) => p.d === "E"), M: all.filter((p) => p.d === "M"), H: all.filter((p) => p.d === "H") };
    const mock = S.mock && S.mock.end > Date.now() ? S.mock : null;
    const rows = all.filter((p) => (filt.p === "all" || p.skill === filt.p) && (filt.d === "all" || p.d === filt.d) && (!filt.todo || !S.lcDone[p.slug]));
    main.innerHTML = `<div class="crumb"><a href="#/">Dashboard</a> / <span>LeetCode hub</span></div>
      <header class="hero lc-hero"><div><div class="cap">LeetCode · HackerRank · live interviews</div><h1>The LeetCode hub</h1><p class="lead">Start with the <a href="#/path/lc">step-by-step path</a>; this hub is your reference shelf. Around 18 patterns cover most coding-interview problems. For each one: a lesson with a reusable template, a step-through visualizer, quiz questions, problems you can run right here, and the classic LeetCode problems to tick off. Every problem you tick earns XP and coins.</p>
        <div class="row" style="margin-top:16px"><a class="btn primary" href="#/path/lc">${GR.pathNext && GR.pathNext("lc") && GR.pathNext("lc").k ? "Continue the path" : "Start the path"}</a>${mock ? `<a class="btn primary" href="#/code/${mock.id}">Resume mock interview</a>` : `<button class="btn" data-act="lcmock">45-minute mock interview</button>`}<button class="btn" data-act="practice" data-sid="lc.patterns">Pattern-recognition drill</button><button class="btn" data-act="lcrand">Random unsolved problem</button></div></div>
        <div class="stats"><div><b>${done}<small>/${all.length}</small></b><span>classic problems ticked</span></div><div><b>${inbDone}<small>/${inb.length}</small></b><span>solved in the browser</span></div><div><b>${pct(GR.trackMastery("lc"))}%</b><span>track mastery</span></div></div></header>
      <div class="lc-diff">${["E", "M", "H"].map((d) => { const n = byD[d].length, k = byD[d].filter((p) => S.lcDone[p.slug]).length; return `<div class="d${d}"><span>${{ E: "Easy", M: "Medium", H: "Hard" }[d]}</span><b>${k} / ${n}</b><i style="width:${n ? (k / n) * 100 : 0}%"></i></div>`; }).join("")}</div>

      <h2 class="sec">The pattern map</h2>
      <div class="lc-pats">${pats.map((sid, i) => { const s = GR.skills[sid], list = all.filter((p) => p.skill === sid), k = list.filter((p) => S.lcDone[p.slug]).length, m = GR.mastery(sid), v = VIZ_FOR[sid];
        return `<div class="lc-pat"><div class="lc-pat-h"><span class="lc-n">${String(i + 1).padStart(2, "0")}</span><b>${E(s.name.replace(/:.*$/, ""))}</b></div><div class="lc-pat-bars"><span>mastery</span><span class="mbar"><i style="width:${pct(m)}%;background:var(--t-lc)"></i></span><em>${pct(m)}%</em><span>problems</span><span class="mbar"><i style="width:${list.length ? (k / list.length) * 100 : 0}%;background:var(--or)"></i></span><em>${k}/${list.length}</em></div>
          <div class="lc-pat-a"><a class="btn sm" href="#/lesson/${sid}">Lesson</a>${v ? `<a class="btn sm" href="#/lab/${v}">Visualize</a>` : ""}<button class="btn sm primary" data-act="practice" data-sid="${sid}">Quiz</button><button class="btn sm" data-act="lcfilter" data-p="${sid}">Problems</button></div></div>`; }).join("")}</div>

      <h2 class="sec">Watch the algorithms run</h2>
      <p class="muted">Every visualizer takes your own input, steps forward and backward (or use ← →), and highlights the line of code being executed.</p>
      <div class="labgrid">${GR.lcViz.map((id) => { const d = GR.diagrams[id]; return `<a class="lcard" href="#/lab/${id}" style="--tc:var(--t-lc)"><span class="tk sm" style="background:var(--t-lc)">LC</span><h4>${E(d.title)}</h4><p>${E(d.blurb.split(". ")[0])}.</p></a>`; }).join("")}</div>

      <h2 class="sec">Cheat sheets</h2>
      <div class="grid2"><section class="card"><h3>Complexity budget</h3>${GR.tbl(["Largest n", "Aim for"], [["≤ 10", "O(n!)"], ["≤ 20", "O(2ⁿ)"], ["≤ 500", "O(n³)"], ["≤ 5,000", "O(n²)"], ["≤ 10⁶", "O(n log n)"], ["bigger", "O(n), O(log n)"]])}<p class="muted">About 10⁸ simple operations per second. <a href="#/lesson/lc.complexity">More in the lesson.</a></p></section>
        <section class="card"><h3>Data structure costs</h3>${GR.tbl(["Structure", "Costs"], COSTS)}</section></div>
      <section class="card"><div class="ch"><h3>Python interview toolkit</h3><span class="muted">the standard library pieces that show up constantly</span></div>${GR.code(TOOLKIT)}</section>

      <h2 class="sec">8-week study plan</h2>
      <div class="lc-plan">${PLAN.map(([w, title, sids]) => { const list = all.filter((p) => sids.includes(p.skill)), k = list.filter((p) => S.lcDone[p.slug]).length; return `<div class="lc-week ${list.length && k === list.length ? "done" : ""}"><span class="cap">${w}</span><b>${title}</b><span class="mbar"><i style="width:${list.length ? (k / list.length) * 100 : 0}%;background:var(--or)"></i></span><small>${k}/${list.length} problems · ${sids.map((sid) => `<a href="#/lesson/${sid}">${E(GR.skills[sid].name.split(/[:,(]/)[0])}</a>`).join(", ")}</small></div>`; }).join("")}</div>
      <p class="muted">From week 4, do one timed mock interview a week. Re-solve each problem you struggled with two days and one week later. <a href="#/lesson/lc.studyplan">Why this works.</a></p>

      <h2 class="sec" id="lc-tracker">Classic problem tracker</h2>
      <p class="muted">${all.length} well-known LeetCode problems grouped by pattern (🔒 = LeetCode Premium). Links open LeetCode; tick a problem when you've solved it without looking at the answer. First ticks pay +20/40/70 XP for easy/medium/hard.</p>
      <div class="lc-filt"><button class="pill ${filt.p === "all" ? "on" : ""}" data-act="lcfilter" data-p="all">All patterns</button>${pats.map((sid) => `<button class="pill ${filt.p === sid ? "on" : ""}" data-act="lcfilter" data-p="${sid}">${E(GR.skills[sid].name.split(/[:,(]/)[0].replace(/^Dynamic programming/, "DP"))}</button>`).join("")}</div>
      <div class="lc-filt">${["all", "E", "M", "H"].map((d) => `<button class="pill ${filt.d === d ? "on" : ""}" data-act="lcdiff" data-d="${d}">${{ all: "Any difficulty", E: "Easy", M: "Medium", H: "Hard" }[d]}</button>`).join("")}<button class="pill ${filt.todo ? "on" : ""}" data-act="lctodo">Unsolved only</button></div>
      <section class="card"><table class="tbl lc-tbl"><tr><th></th><th>Problem</th><th>Difficulty</th><th>Pattern</th></tr>${rows.map((p) => `<tr class="${S.lcDone[p.slug] ? "lc-done" : ""}"><td><button class="lc-chk ${S.lcDone[p.slug] ? "on" : ""}" data-act="lctick" data-s="${p.slug}" aria-label="Mark ${E(p.title)} solved">${S.lcDone[p.slug] ? "✓" : ""}</button></td><td><a href="https://leetcode.com/problems/${p.slug}/" target="_blank" rel="noopener"><b>${E(p.title)}</b></a>${p.prem ? " 🔒" : ""}</td><td><span class="tag d${{ E: 1, M: 2, H: 3 }[p.d]}">${{ E: "Easy", M: "Medium", H: "Hard" }[p.d]}</span></td><td><a href="#/lesson/${p.skill}">${E(GR.skills[p.skill].name.split(/[:,(]/)[0])}</a></td></tr>`).join("") || `<tr><td colspan="4" class="muted">Nothing matches these filters.</td></tr>`}</table></section>

      <h2 class="sec">Solve them here</h2>
      <p class="muted">Run your code in the browser (Python or JavaScript) against test cases. Includes two HackerRank-style problems where you parse raw input and return exact output.</p>
      <section class="card"><table class="tbl"><tr><th></th><th>Problem</th><th>Difficulty</th><th>Pattern</th></tr>${inb.slice().sort((a, b) => a.diff - b.diff).map((p) => { const c = GR.state.code[p.id] || {}; return `<tr><td>${c.solved ? `<span class="pos">✓</span>` : ""}</td><td><a href="#/code/${p.id}"><b>${E(p.title)}</b></a></td><td><span class="tag d${p.diff}">${["", "Easy", "Medium", "Hard"][p.diff]}</span></td><td><a href="#/lesson/${p.skill}">${E(GR.skills[p.skill].name.split(/[:,(]/)[0])}</a></td></tr>`; }).join("")}</table></section>

      <h2 class="sec">LeetCode or HackerRank?</h2>
      <div class="grid2"><section class="card"><h3>LeetCode</h3><p>The best place to <b>practice</b> for live coding rounds: huge problem set, per-pattern discussion, and most big-tech interview questions are LeetCode-style mediums. Use the tracker above as your list. <a href="https://leetcode.com/problemset/" target="_blank" rel="noopener">leetcode.com</a></p></section>
        <section class="card"><h3>HackerRank and CodeSignal</h3><p>Where many companies run their <b>online assessments</b>: timed, proctored, graded by hidden tests, sometimes with raw stdin/stdout. Do a few problems in that format before an OA so the input parsing and time pressure aren't new. <a href="https://www.hackerrank.com/interview/interview-preparation-kit" target="_blank" rel="noopener">HackerRank Interview Prep Kit</a> · <a href="#/lesson/lc.oa">OA strategy lesson</a></p></section></div>`;
  };

  GR.routes = GR.routes || {}; GR.routes.lc = (main) => view(main);

  /* ---------- actions ---------- */
  const rerender = () => { const y = scrollY; GR.routes.lc(document.querySelector("#main")); scrollTo(0, y); };
  const acts = {
    lctick(d) { const S = g(), p = GR.lcProblems.find((x) => x.slug === d.s); if (!p) return;
      if (S.lcDone[p.slug]) delete S.lcDone[p.slug]; else { S.lcDone[p.slug] = Date.now(); if (!S.lcPaid[p.slug]) { S.lcPaid[p.slug] = 1; const [xp, c] = PAY[p.d]; GR.game.reward(xp, c, `Solved: ${E(p.title)}`); if (p.d === "H") GR.game.confetti(60); } }
      GR.save(); rerender(); },
    lcfilter(d) { filt.p = d.p; rerender(); const tr = document.getElementById("lc-tracker"); if (tr && d.p !== "all") tr.scrollIntoView({ behavior: "smooth", block: "start" }); },
    lcdiff(d) { filt.d = d.d; rerender(); }, lctodo() { filt.todo = !filt.todo; rerender(); },
    lcrand() { const S = g(), open = GR.lcProblems.filter((p) => !S.lcDone[p.slug] && !p.prem); if (!open.length) return GR.game.toast("You've ticked every problem. Impressive. Now re-solve them."); const p = open[Math.floor(Math.random() * open.length)]; window.open(`https://leetcode.com/problems/${p.slug}/`, "_blank", "noopener"); GR.game.toast(`Opened <b>${E(p.title)}</b> (${{ E: "easy", M: "medium", H: "hard" }[p.d]}, ${E(GR.skills[p.skill].name.split(/[:,(]/)[0])}). Tick it in the tracker when you're done.`); },
    lcmock() { const pool = GR.problems.filter((p) => p.lc && !/^oa-/.test(p.id) && p.diff >= 2 && !(GR.state.code[p.id] || {}).solved), from = pool.length ? pool : GR.problems.filter((p) => p.lc && p.diff >= 2), p = from[Math.floor(Math.random() * from.length)];
      g().mock = { id: p.id, start: Date.now(), end: Date.now() + 45 * 60e3 }; GR.save(); location.hash = "#/code/" + p.id; },
    lcmockend() { const S = g(), m = S.mock; if (!m) return; const ok = (GR.state.code[m.id] || {}).solved && (GR.state.code[m.id].solvedAt || Date.now()) <= m.end; S.mock = null; GR.save();
      if (ok) { GR.game.reward(120, 40, "Mock interview passed"); GR.game.confetti(120); } else GR.game.toast("Mock interview ended. Read the approach, then re-solve it from scratch in a day or two.", "bad"); location.hash = "#/lc"; },
  };
  document.addEventListener("click", (e) => { const el = e.target.closest("[data-act]"); if (!el || !acts[el.dataset.act]) return; e.preventDefault(); e.stopImmediatePropagation(); acts[el.dataset.act](el.dataset); }, true);

  /* ---------- mock interview banner on the code page ---------- */
  let tick = null;
  GR.hooks = GR.hooks || [];
  GR.hooks.push((a, b) => { clearInterval(tick); const m = g().mock; if (a !== "code" || !m || m.id !== b) return; const host = document.querySelector("#main"); if (!host) return;
    const bar = document.createElement("div"); bar.className = "lc-mock"; host.prepend(bar);
    host.querySelectorAll("details.hint").forEach((d) => (d.style.display = "none"));
    const lnav = host.querySelector(".lnav"); if (lnav) lnav.insertAdjacentHTML("beforebegin", `<p class="muted">Hints, the approach and the reference solution are hidden until you finish the mock.</p>`);
    const draw = () => { if (!bar.isConnected) return clearInterval(tick); const left = Math.max(0, m.end - Date.now()), mm = Math.floor(left / 60e3), ss = Math.floor((left % 60e3) / 1e3), solved = (GR.state.code[m.id] || {}).solved, phase = (Date.now() - m.start) / 60e3;
      bar.innerHTML = `<span class="clock ${left < 5 * 60e3 ? "low" : ""}">${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}</span><div><b>Mock interview</b> · ${solved ? "Accepted. Talk through the complexity and edge cases, then finish." : phase < 8 ? "Clarify and plan out loud before typing." : phase < 30 ? "Code while narrating your reasoning." : "Trace a test case and check edge cases."}</div><button class="btn sm ${solved ? "primary" : ""}" data-act="lcmockend">${solved ? "Finish and collect" : "End mock"}</button>`;
      if (!left && !solved) { clearInterval(tick); bar.querySelector("div").innerHTML = "<b>Time's up.</b> End the mock, then study the approach."; } };
    draw(); tick = setInterval(draw, 1000); });
})();
