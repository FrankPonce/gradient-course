// Runs the Python variant of every `code` card against its tests with the local `python`: node tools/verify_code.js .
const fs = require("fs"), path = require("path"), vm = require("vm"), cp = require("child_process");
const root = process.argv[2], store = {};
const ctx = { URL, Blob: function () {}, Worker: function () {}, matchMedia: () => ({ matches: true }), console, Math, JSON, Date, Set, Map, Array, Object, String, Number, Promise, setTimeout, clearTimeout,
  localStorage: { getItem: (k) => store[k] ?? null, setItem: (k, v) => (store[k] = String(v)), removeItem: (k) => delete store[k] },
  document: { addEventListener() {}, querySelector() { return null; }, body: { classList: { toggle() {} } }, documentElement: { dataset: {} } }, addEventListener() {}, location: { hash: "" } };
ctx.window = ctx; vm.createContext(ctx);
const files = ["core", "curriculum", "track-fnd", "track-sd", "track-fin", "track-lc", "bank-ml", "bank-ai", "bank-ag", "bank-ds", "bank-ba", "bank-swe", "bank-lc", "sets-a", "sets-b", "sets-c", "sets-d", "diagrams-a", "diagrams-b", "diagrams-c", "diagrams-lc", "extras", "coding", "coding-lc", "anim", "path", "path-lc", "courses-auto", "iv-a", "iv-b", "iv-c"].concat(fs.readdirSync(path.join(root, "js")).filter((f) => /^lcx-/.test(f)).map((f) => f.replace(/\.js$/, "")));
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, "js", f + ".js"), "utf8"), ctx, { filename: f });
const GR = ctx.GR; let n = 0, bad = 0;
for (const [cid, c] of Object.entries(GR.courses)) for (const node of c.nodes) { if (node.kind === "test") continue;
  let cards = []; try { cards = GR.pathCards(cid, node.id); } catch (e) { continue; }
  cards.filter((x) => x.k === "code" && x.v.py).forEach((x, i) => { n++;
    const prog = `import json,sys\n${x.v.py.sol}\ncmp=${JSON.stringify(x.cmp || "exact")}\ntests=json.loads(sys.stdin.read())\nfail=[]\nfor i,(a,e) in enumerate(tests):\n    try: g=${x.v.py.fn}(*a)\n    except Exception as ex: g="ERR "+str(ex)\n    if cmp=="set": ok=sorted(g)==sorted(e)\n    elif cmp=="set2": ok=sorted(sorted(r) for r in g)==sorted(sorted(r) for r in e)\n    elif cmp=="approx": ok=abs(g-e)<1e-6\n    else: ok=g==e\n    if not ok: fail.append([i+1,g,e])\nprint(json.dumps(fail))`;
    const r = cp.spawnSync("python", ["-c", prog], { input: JSON.stringify(x.tests), encoding: "utf8" });
    if (r.status !== 0) { bad++; console.log(`${node.id} card ${i + 1}: python error ${String(r.stderr).split("\n").slice(-3).join(" ")}`); }
    else if (r.stdout.trim() !== "[]") { bad++; console.log(`${node.id} card ${i + 1}: py sol fails ${r.stdout.trim().slice(0, 200)}`); } }); }
console.log(`${n} python solutions checked, ${bad} problems`);
