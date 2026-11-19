// Loads the course's data files outside the browser and sanity-checks every question, generator and case.
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = process.argv[2];
const store = {};
const ctx = { URL, Blob: function () {}, Worker: function () {}, matchMedia: () => ({ matches: true }), console, Math, JSON, Date, Set, Map, Array, Object, String, Number, Promise, setTimeout, clearTimeout,
  localStorage: { getItem: (k) => store[k] ?? null, setItem: (k, v) => (store[k] = String(v)), removeItem: (k) => delete store[k] },
  document: { addEventListener() {}, querySelector() { return null; }, body: { classList: { toggle() {} } }, documentElement: { dataset: {} } }, addEventListener() {}, location: { hash: "" } };
ctx.window = ctx; vm.createContext(ctx);
const files = ["core", "curriculum", "track-fnd", "track-sd", "track-fin", "track-lc", "bank-ml", "bank-ai", "bank-ag", "bank-ds", "bank-ba", "bank-swe", "bank-lc", "sets-a", "sets-b", "sets-c", "sets-d", "diagrams-a", "diagrams-b", "diagrams-c", "diagrams-lc", "extras", "coding", "coding-lc", "anim", "path", "path-lc", "courses-auto", "iv-a", "iv-b", "iv-c"];
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, "js", f + ".js"), "utf8"), ctx, { filename: f });
const seen = new Set(), GR = ctx.GR, errs = [], bad = (m) => errs.push(m);
const skills = new Set(Object.keys(GR.skills));
const txt = (s) => /NaN|undefined|Infinity|\[object/.test(String(s));
for (const sid of skills) { const s = GR.skills[sid]; (s.related || []).forEach((r) => skills.has(r) || bad(`${sid}: related skill ${r} missing`)); }
for (const it of GR.bank) {
  if (!skills.has(it.skill)) bad(`bank item ${it.id}: unknown skill ${it.skill}`);
  (it.also || []).forEach((a) => skills.has(a) || bad(`bank ${it.id}: unknown also ${a}`));
  for (let seed = 1; seed <= (it.gen ? 300 : 1); seed++) {
    let q; try { q = GR.inst(it, GR.rng(seed)); } catch (e) { bad(`${it.id} seed ${seed}: ${e.message}`); break; }
    if (q.options.length !== 4) { bad(`${it.id} (${it.skill}) seed ${seed}: ${q.options.length} options: ${q.options.join(" | ")}`); break; }
    if (it.gen && (txt(q.stem) || q.options.some(txt) || txt(q.expl))) { bad(`${it.id} (${it.skill}) seed ${seed}: bad text: ${q.stem} :: ${q.options.join(" | ")}`); break; }
  }
}
for (const set of GR.sets) {
  if (!skills.has(set.skill)) bad(`set ${set.title}: unknown skill ${set.skill}`);
  for (let seed = 1; seed <= (set.gen ? 300 : 1); seed++) {
    let ps; try { ps = GR.instSet(set, GR.rng(seed)); } catch (e) { bad(`set ${set.title} seed ${seed}: ${e.message}`); break; }
    for (const p of ps) {
      if (!skills.has(p.skill)) { bad(`set ${set.title} part ${p.part}: unknown skill ${p.skill}`); }
      if (p.options.length !== 4) { bad(`set ${set.title} part ${p.part} seed ${seed}: ${p.options.length} options: ${p.options.join(" | ")}`); }
      const key = set.title + p.part; if (set.gen && !seen.has(key)) { const all = [p.stem, p.stim, ...p.options, p.expl].join(" ~ "); const m = all.match(/.{0,50}(NaN|undefined|Infinity|\[object).{0,30}/); if (m) { seen.add(key); bad(`set ${set.title} part ${p.part} seed ${seed}: ${m[0]}`); } }
    }
  }
}
for (const p of GR.problems) if (!skills.has(p.skill)) bad(`problem ${p.id}: unknown skill ${p.skill}`);
// reference solutions must pass their own tests
for (const p of GR.problems.filter((x) => !x.sql)) {
  const fn = new Function(p.sol + "\n;return " + p.js[0] + ";")();
  p.tests.forEach(([args, exp], i) => { const got = fn(...JSON.parse(JSON.stringify(args))); if (!GR.codeEqual(p, got, exp)) bad(`problem ${p.id} test ${i}: got ${JSON.stringify(got)} expected ${JSON.stringify(exp)}`); });
}

// every LeetCode visualizer: default input, then 40 random inputs, must produce frames without throwing
for (const id of GR.lcViz) { const d = GR.diagrams[id].def; const def = {}; (d.inputs || []).forEach((f) => (def[f.k] = f.value));
  try { const fr = d.frames(def); if (!fr.length) bad(`viz ${id}: no frames`); if (fr.some((f) => f.line === undefined || !f.note)) bad(`viz ${id}: frame missing line/note`); } catch (e) { bad(`viz ${id} default: ${e.message}`); }
  if (d.random) for (let s = 1; s <= 40; s++) { const v = Object.assign({}, def, d.random(GR.rng(s))); try { d.frames(v); } catch (e) { bad(`viz ${id} random seed ${s} (${JSON.stringify(v)}): ${e.message}`); break; } }
  (d.inputs || []).filter((f) => f.options).forEach((f) => f.options.forEach(([o]) => { try { d.frames(Object.assign({}, def, { [f.k]: o })); } catch (e) { bad(`viz ${id} option ${o}: ${e.message}`); } })); }
// every classic problem's skill exists; no duplicate slugs
const slugs = new Set(); GR.lcProblems.forEach((p) => { if (!skills.has(p.skill)) bad(`lc problem ${p.slug}: unknown skill`); if (slugs.has(p.slug)) bad(`duplicate slug ${p.slug}`); slugs.add(p.slug); });

// course cards: every session of every program resolves to well-formed cards
for (const [cid, c] of Object.entries(GR.courses || {})) { let cards = 0, kinds = {};
  c.nodes.forEach((node) => { if (node.skill && !skills.has(node.skill)) bad(`course ${node.id}: unknown skill ${node.skill}`);
    for (let seed = 1; seed <= (typeof node.cards === "function" || node.kind === "test" ? 3 : 1); seed++) { let list; try { list = GR.pathCards(cid, node.id); } catch (e) { bad(`course ${node.id}: ${e.message}`); break; }
      if (!list.length) { bad(`course ${node.id}: no cards`); break; } if (node.kind !== "learn" && !list.some((x) => x.k !== "learn")) bad(`course ${node.id}: no exercises`);
      list.forEach((x, i) => { if (seed === 1) { cards++; kinds[x.k] = (kinds[x.k] || 0) + 1; } const w = `course ${node.id} card ${i + 1}`;
        if (x.k === "mcq") { if (x.opts.length < 2 || new Set(x.opts.map(String)).size !== x.opts.length) bad(`${w}: bad options ${JSON.stringify(x.opts).slice(0, 120)}`); }
        else if (x.k === "fill") { const n = (x.code.match(/___/g) || []).length; if (n !== x.answers.length) bad(`${w}: ${n} blanks vs ${x.answers.length} answers`); (x.extra || []).forEach((e) => { if (x.answers.includes(e)) bad(`${w}: extra chip equals an answer: ${e}`); }); }
        else if (x.k === "ord") { if (x.lines.length < 3 || new Set(x.lines).size !== x.lines.length) bad(`${w}: ord lines`); }
        else if (x.k === "rank") { if (x.items.length < 3 || new Set(x.items).size !== x.items.length) bad(`${w}: rank items`); }
        else if (x.k === "match") { if (x.pairs.length < 3 || new Set(x.pairs.map((p) => p[0])).size !== x.pairs.length || new Set(x.pairs.map((p) => p[1])).size !== x.pairs.length) bad(`${w}: match pairs not unique`); }
        else if (x.k === "bins") { if (x.bins.length < 2 || x.items.some((it) => !(it[1] >= 0 && it[1] < x.bins.length))) bad(`${w}: bins`); }
        else if (x.k === "bug") { if (!(x.bug >= 0 && x.bug < x.lines.length)) bad(`${w}: bug index`); }
        else if (x.k === "num") { if (!Number.isFinite(x.answer)) bad(`${w}: num answer ${x.answer} for ${x.prompt}`); }
        else if (x.k === "learn") { if (x.anim && !GR.anims[x.anim]) bad(`${w}: unknown anim ${x.anim}`); if (x.try && !GR.diagrams[x.try]) bad(`${w}: unknown try ${x.try}`);
          if (x.viz) { const d = GR.diagrams[x.viz.id]; if (!d || !d.def) bad(`${w}: unknown viz ${x.viz.id}`); else { const inp = {}; (d.def.inputs || []).forEach((f) => (inp[f.k] = f.value)); try { if (!d.def.frames(Object.assign(inp, x.viz.input || {})).length) bad(`${w}: viz gives no frames`); } catch (e) { bad(`${w}: viz ${x.viz.id}: ${e.message}`); } } } }
        else bad(`${w}: unknown kind ${x.k}`); }); } });
  console.log("program", cid.padEnd(4), "weeks", String(c.units.length).padStart(2), "sessions", String(c.nodes.length).padStart(3), "cards", String(cards).padStart(4), JSON.stringify(kinds)); }
// every lesson of every track is reachable from some program
const inPath = new Set(); Object.values(GR.courses).forEach((c) => c.nodes.forEach((n) => n.skill && inPath.add(n.skill)));
const missing = [...skills].filter((s) => !inPath.has(s)); if (missing.length) bad(`skills with no session: ${missing.join(", ")}`);
const unusedSets = GR.sets.filter((s) => !Object.values(GR.courses).some((c) => c.nodes.some((n) => n.title === s.title))); if (unusedSets.length) bad(`cases not in a program: ${unusedSets.map((s) => s.title).join("; ")}`);
const per = {}; GR.bank.forEach((b) => { const t = b.skill.split(".")[0]; per[t] = per[t] || { q: 0, g: 0 }; per[t][b.gen ? "g" : "q"]++; });
const setsPer = {}; GR.sets.forEach((s) => { const t = s.skill.split(".")[0]; setsPer[t] = (setsPer[t] || 0) + 1; });
console.log("lcProblems", GR.lcProblems.length, "viz", GR.lcViz.length); console.log(JSON.stringify({ tracks: GR.tracks.map((t) => t.id + ":" + t.skills.length), skills: skills.size, written: GR.bank.filter((b) => !b.gen).length, generators: GR.bank.filter((b) => b.gen).length, sets: GR.sets.length, dynSets: GR.sets.filter((s) => s.gen).length, setQs: GR.sets.reduce((a, s) => a + (s.gen ? s.def(GR.rng(1)) : s.def).parts.length, 0), problems: GR.problems.length, per, setsPer }));
const E2 = errs; console.log(E2.length ? E2.slice(0, 40).join("\n") + `\n${errs.length} problems` : "ALL CHECKS PASSED");
