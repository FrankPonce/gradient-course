const puppeteer = require("puppeteer-core"), O = require("path").join(process.env.SHOTS || require("os").tmpdir(), "gshots") + "/", wait = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new" });
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); const errs = []; p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => m.type() === "error" && !/favicon|fonts/.test(m.text()) && errs.push(m.text()));
  for (let i = 0; i < 8; i++) { try { await p.goto("http://127.0.0.1:5190/#/", { waitUntil: "networkidle0" }); break; } catch (e) { await wait(800); } }
  const clean = () => p.evaluate(() => document.querySelectorAll(".lvlup").forEach((e) => e.remove()));
  await wait(600); await p.screenshot({ path: O + "q_dash.png" });
  await p.goto("http://127.0.0.1:5190/#/path/lc"); await wait(800); await p.screenshot({ path: O + "q_path_lc.png" });
  await p.goto("http://127.0.0.1:5190/#/path/ml"); await wait(800); await p.screenshot({ path: O + "q_path_ml.png" });
  const solve = () => p.evaluate(() => { const R = GR.pathDebug(), c = R.items[R.pos].card, $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
    if (c.k === "learn") return "learn";
    if (c.k === "mcq") $$(".ln-opt")[R.st.order.indexOf(0)].click();
    if (c.k === "fill") c.answers.forEach((t) => { const j = R.st.chips.findIndex((ch, k) => ch.t === t && !R.st.slots.includes(k)); $$(".ln-chips .tok")[j].click(); });
    if (c.k === "ord") c.lines.forEach((t) => { const j = R.st.bank.findIndex((x, k) => x.t === t && !R.st.seq.includes(k)); $$(".ord-bank .tok")[j].click(); });
    if (c.k === "rank") for (let t = 0; t < c.items.length; t++) { const cur = R.st.seq.indexOf(t); if (cur === t) continue; document.querySelector(`.rk[data-pos="${cur}"]`).click(); document.querySelector(`.rk[data-pos="${t}"]`).click(); }
    if (c.k === "match") { for (let i = 0; i < c.pairs.length; i++) { document.querySelector(`.mt[data-pa=ml][data-i="${i}"]`).click(); document.querySelector(`.mt[data-pa=mr][data-i="${i}"]`).click(); } return "match"; }
    if (c.k === "bins") c.items.forEach((it, i) => { document.querySelector(`.bchip[data-i="${i}"]`).click(); document.querySelector(`.bin[data-b="${it[1]}"]`).click(); });
    if (c.k === "bug") $$(".bugline")[c.bug].click();
    if (c.k === "num") { const inp = $(".numin input"); inp.value = String(c.answer); inp.dispatchEvent(new Event("input", { bubbles: true })); }
    return c.k; });
  const play = async (tag) => { const seen = {}; let n = 0;
    while (await p.evaluate(() => !!GR.pathDebug())) { const k = await solve(); await wait(120);
      if (k !== "learn" && k !== "match") { if (!seen[k]) await p.screenshot({ path: O + `q_${tag}_${k}_a.png` }); await p.evaluate(() => document.querySelector(".ln-go").click()); await wait(350); }
      if (k !== "learn" && !seen[k]) { seen[k] = 1; await clean(); await p.screenshot({ path: O + `q_${tag}_${k}_b.png` }); }
      if (k === "learn" && !seen.learn) { seen.learn = 1; await wait(1800); await p.screenshot({ path: O + `q_${tag}_learn.png` }); }
      await p.evaluate(() => { const g = document.querySelector(".ln-go"); if (g && !g.disabled) g.click(); }); await wait(220); if (++n > 80) break; }
    return Object.keys(seen); };
  const runNode = async (cid, id, tag) => { await p.goto(`http://127.0.0.1:5190/#/learn/${cid}/${id}`); await wait(700); const k = await play(tag); await wait(500); await clean(); return k; };
  await p.evaluate(() => { GR.state.path = {}; GR.save(); });
  const c = await p.evaluate(() => GR.courses.lc.nodes.slice(0, 8).map((n) => n.id + "|" + n.title + "|" + n.kind));
  console.log("LC week 1 sessions:", c.join("  "));
  let all = [];
  for (const s of c.slice(0, 6)) { const [id] = s.split("|"); all = all.concat(await runNode("lc", id, id.replace(/-/g, ""))); if (id.includes("drill")) await p.screenshot({ path: O + "q_log.png" }); }
  console.log("kinds exercised in week 1:", [...new Set(all)].join(","));
  await p.evaluate(() => { const c = GR.courses.lc, d = GR.state.path.lc.done; c.nodes.forEach((n) => { if (n.unit < 5) d[n.id] = d[n.id] || { ts: 1, acc: 1, secs: 100, best: 100, bestAcc: 1 }; }); GR.save(); });
  const w6 = await p.evaluate(() => GR.courses.lc.nodes.filter((n) => n.unit === 5).map((n) => n.id));
  for (const id of w6.slice(0, 4)) all = all.concat(await runNode("lc", id, id.replace(/-/g, "")));
  console.log("kinds exercised:", [...new Set(all)].join(","));
  const first = await p.evaluate(() => GR.courses.lc.nodes[0].id);
  await p.evaluate((f) => { const d = GR.state.path.lc.done; d[f].best = 9999; GR.save(); }, first);
  await runNode("lc", first, "gold"); await wait(400); await p.screenshot({ path: O + "q_goldlog.png" }); console.log("gold after replay:", await p.evaluate(() => GR.state.path.lc.done[GR.courses.lc.nodes[0].id].gold));
  await p.goto("http://127.0.0.1:5190/#/path/lc"); await wait(900); await clean(); await p.screenshot({ path: O + "q_path_lc2.png" });
  const ml = await p.evaluate(() => GR.courses.ml.nodes.slice(0, 3).map((n) => n.id));
  for (const id of ml) all = all.concat(await runNode("ml", id, "ml" + id.replace(/-/g, "")));
  const rid = await p.evaluate(() => { const c = GR.courses.lc; const n = c.nodes.find((x) => Array.isArray(x.cards) && x.cards.some((cc) => cc.k === "rank")); return n.id; });
  await p.goto("http://127.0.0.1:5190/#/learn/lc/" + rid); await wait(600);
  for (let i = 0; i < 25; i++) { const k = await p.evaluate(() => GR.pathDebug().items[GR.pathDebug().pos].card.k); if (k === "rank") break; await solve(); await p.evaluate(() => { const g = document.querySelector(".ln-go"); if (g && !g.disabled) g.click(); }); await wait(250); await p.evaluate(() => { const g = document.querySelector(".ln-go"); if (g && !g.disabled && g.textContent === "Continue") g.click(); }); await wait(200); }
  await clean(); const before = await p.evaluate(() => GR.pathDebug().st.seq.join(","));
  const a = await p.$('.rk[data-pos="0"] .rk-t'), bb = await p.$('.rk[data-pos="3"] .rk-t'), ra = await a.boundingBox(), rb = await bb.boundingBox();
  await p.mouse.move(ra.x + 20, ra.y + ra.height / 2); await p.mouse.down(); await p.mouse.move(ra.x + 25, ra.y + 30, { steps: 4 }); await p.mouse.move(rb.x + 20, rb.y + rb.height / 2, { steps: 8 }); await wait(100); await p.screenshot({ path: O + "q_drag.png" }); await p.mouse.up(); await wait(150);
  console.log("drag reorder:", before, "->", await p.evaluate(() => GR.pathDebug().st.seq.join(",")));
  await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await p.goto("http://127.0.0.1:5190/#/path/lc"); await wait(900); await clean(); await p.screenshot({ path: O + "q_m_path.png" });
  await p.goto("http://127.0.0.1:5190/#/learn/lc/" + rid); await wait(900); await clean(); await p.screenshot({ path: O + "q_m_learn.png" });
  for (let i = 0; i < 16; i++) { const k = await p.evaluate(() => GR.pathDebug() && GR.pathDebug().items[GR.pathDebug().pos].card.k); if (!k) break; if (["bins", "match", "rank", "mcq"].includes(k)) await p.screenshot({ path: O + "q_m_" + k + ".png" }); await solve(); await p.evaluate(() => { const g = document.querySelector(".ln-go"); if (g && !g.disabled) g.click(); }); await wait(250); await p.evaluate(() => { const g = document.querySelector(".ln-go"); if (g && !g.disabled && g.textContent === "Continue") g.click(); }); await wait(200); }
  console.log("errors:", errs.length ? errs.slice(0, 5) : "none"); await b.close(); })().catch((e) => { console.error("FAILED", e.stack); process.exit(1); });
