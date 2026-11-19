/* Gradient — game layer: XP, levels and titles, coins, combos, streaks, daily quests, achievements,
   the shop (pets, power-ups, accents), the coin exchange (paper trading) and all the juice
   (toasts, floating XP, confetti, level-up screen, ambient embers, sound). State lives in GR.state.game. */
(function () {
  const $ = (s, r = document) => r.querySelector(s), E = GR.esc;
  const reduced = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const G = () => { const g = GR.state.game || (GR.state.game = {}); const d = { xp: 0, coins: 0, streak: 0, best: 0, lastDay: "", owned: {}, inv: {}, pet: "", accent: "", trail: false, ach: {}, quests: null, n: {}, hold: {}, cost: {}, read: {}, days: {}, tracks: {}, sfx: true, boost: 0 }; for (const k in d) if (g[k] === undefined) g[k] = d[k]; return g; };
  const day = (off = 0) => { const d = new Date(Date.now() + off * 864e5); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  const inc = (k, by = 1) => (G().n[k] = (G().n[k] || 0) + by);

  /* ---------- levels and titles ---------- */
  const need = (l) => Math.round(40 * Math.pow(l - 1, 1.75));
  const levelOf = (xp) => { let l = 1; while (l < 99 && xp >= need(l + 1)) l++; return l; };
  const TITLES = [
    [1, "Your resume is a cry for help"], [2, "Google won't even look at your resume"], [3, "Auto-rejected by an ATS in 0.3 seconds"], [4, "The recruiter left you on read"],
    [5, "You know what a p-value is. Probably."], [6, "Dangerous with a Jupyter notebook"], [7, "\"Open to Work\" banner veteran"], [8, "Got a take-home. Got ghosted after."],
    [9, "The phone screen went… okay?"], [10, "You might actually pass the 1st interview. Good luck on the 2nd round tho."], [11, "Whiteboard survivor"], [12, "Can explain bias-variance without crying"],
    [13, "Second round. The interviewer nodded once."], [14, "Onsite invite. They're paying for lunch."], [15, "Reversed a linked list AND made eye contact"], [16, "The hiring manager said \"interesting\""],
    [17, "Negotiating like you have other offers"], [18, "Offer letter pending. Don't jinx it."], [19, "Two competing offers. Insufferable."], [20, "Hired. Impostor syndrome unlocked."],
    [22, "Senior. You say \"it depends\" a lot."], [24, "Staff. Nobody knows what you do."], [26, "Principal. Your diagrams have diagrams."], [28, "Recruiters fear you"], [30, "You ARE the interview loop"],
  ];
  const titleOf = (l) => TITLES.filter((t) => t[0] <= l).pop()[1];
  const nextTitle = (l) => TITLES.find((t) => t[0] > l);
  const prog = () => { const g = G(), l = levelOf(g.xp), a = need(l), b = need(l + 1); return { l, into: g.xp - a, span: b - a, pct: Math.min(100, ((g.xp - a) / (b - a)) * 100) }; };

  /* ---------- sound (tiny WebAudio blips) ---------- */
  let ac = null;
  const tone = (f, t0, dur, type = "triangle", vol = 0.05) => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, ac.currentTime + t0); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + t0 + dur); o.connect(g).connect(ac.destination); o.start(ac.currentTime + t0); o.stop(ac.currentTime + t0 + dur + 0.02); } catch (e) { /* audio is optional */ } };
  const sfx = (k) => { if (!G().sfx) return; ({ ok: () => { tone(660, 0, 0.09); tone(990, 0.07, 0.14); }, bad: () => tone(160, 0, 0.22, "sawtooth", 0.035), coin: () => { tone(1320, 0, 0.06, "square", 0.025); tone(1760, 0.05, 0.1, "square", 0.025); }, level: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.22)), buy: () => { tone(440, 0, 0.08); tone(660, 0.06, 0.08); tone(880, 0.12, 0.16); } }[k] || (() => {}))(); };

  /* ---------- juice: toasts, floating text, confetti, embers ---------- */
  let px = innerWidth / 2, py = innerHeight / 2;
  document.addEventListener("pointerdown", (e) => { px = e.clientX; py = e.clientY; }, true);
  const layer = (id, tag = "div") => $("#" + id) || document.body.appendChild(Object.assign(document.createElement(tag), { id }));
  const toast = (html, cls = "") => { const t = document.createElement("div"); t.className = "toast " + cls; t.innerHTML = html; layer("toasts").appendChild(t); setTimeout(() => t.classList.add("out"), 3400); setTimeout(() => t.remove(), 3900); };
  const float = (txt, cls = "") => { const f = document.createElement("div"); f.className = "fx-float " + cls; f.textContent = txt; f.style.left = px + "px"; f.style.top = py + "px"; document.body.appendChild(f); setTimeout(() => f.remove(), 1100); };
  const confetti = (n = 90) => {
    if (reduced()) return; const c = layer("confetti", "canvas"), x = c.getContext("2d"); c.width = innerWidth; c.height = innerHeight;
    const cs = getComputedStyle(document.documentElement), cols = [cs.getPropertyValue("--or"), cs.getPropertyValue("--ink"), cs.getPropertyValue("--blood"), "#C9933A"].map((s) => s.trim());
    const P = Array.from({ length: n }, () => ({ x: innerWidth / 2 + (Math.random() - 0.5) * 240, y: innerHeight * 0.42, vx: (Math.random() - 0.5) * 15, vy: -Math.random() * 15 - 4, r: Math.random() * 6 + 4, a: Math.random() * 6.3, va: (Math.random() - 0.5) * 0.4, c: cols[Math.floor(Math.random() * cols.length)], star: Math.random() < 0.35 }));
    const t0 = performance.now();
    const step = (t) => { const k = (t - t0) / 2400; x.clearRect(0, 0, c.width, c.height); if (k >= 1) return;
      P.forEach((p) => { p.vy += 0.42; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.a += p.va; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.globalAlpha = 1 - k * k; x.fillStyle = p.c;
        if (p.star) { const r = p.r * 1.5; x.beginPath(); x.moveTo(0, -r); x.lineTo(r * 0.14, -r * 0.14); x.lineTo(r, 0); x.lineTo(r * 0.14, r * 0.14); x.lineTo(0, r); x.lineTo(-r * 0.14, r * 0.14); x.lineTo(-r, 0); x.lineTo(-r * 0.14, -r * 0.14); x.fill(); } else x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); x.restore(); });
      requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const embers = () => {
    if (reduced()) return; const c = layer("embers", "canvas"), x = c.getContext("2d"); let P = [], col = "#A8191F";
    const size = () => { c.width = innerWidth; c.height = innerHeight; }; size(); addEventListener("resize", size);
    const spawn = (init) => ({ x: Math.random() * c.width, y: init ? Math.random() * c.height : c.height + 10, r: Math.random() * 1.8 + 0.5, v: Math.random() * 0.35 + 0.12, w: Math.random() * 6.3, a: Math.random() * 0.4 + 0.12 });
    P = Array.from({ length: 34 }, () => spawn(true));
    setInterval(() => (col = getComputedStyle(document.documentElement).getPropertyValue("--or").trim() || col), 1500);
    const step = () => { if (!document.hidden) { x.clearRect(0, 0, c.width, c.height); P.forEach((p, i) => { p.y -= p.v; p.w += 0.012; p.x += Math.sin(p.w) * 0.25; if (p.y < -10) P[i] = spawn(false); x.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(p.w * 3)); x.fillStyle = col; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.3); x.fill(); }); } requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  let lastTrail = 0;
  document.addEventListener("pointermove", (e) => { if (!G().trail || reduced() || e.timeStamp - lastTrail < 40) return; lastTrail = e.timeStamp; const s = document.createElement("i"); s.className = "fx-trail"; s.style.left = e.clientX + "px"; s.style.top = e.clientY + "px"; document.body.appendChild(s); setTimeout(() => s.remove(), 700); });

  /* ---------- pets ---------- */
  const INK = "#141111", OUT = "var(--mute)";
  const PETS = {
    cat: { name: "Void", kind: "Black cat", price: 150, svg: `<svg viewBox="0 0 64 64"><path class="p-tail" d="M45 52C58 52 60 40 54 33" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><ellipse cx="32" cy="47" rx="16" ry="12" fill="${INK}" stroke="${OUT}"/><path d="M19 28L20 12L30 22ZM45 28L44 12L34 22Z" fill="${INK}" stroke="${OUT}" stroke-linejoin="round"/><circle cx="32" cy="30" r="14" fill="${INK}" stroke="${OUT}"/><g class="p-eyes"><ellipse cx="26" cy="29" rx="3.3" ry="4" fill="var(--or)"/><ellipse cx="38" cy="29" rx="3.3" ry="4" fill="var(--or)"/><ellipse cx="26" cy="29" rx="1" ry="3.3" fill="#000"/><ellipse cx="38" cy="29" rx="1" ry="3.3" fill="#000"/></g><path d="M30.4 34.5L32 36.4L33.6 34.5Z" fill="#E25A72"/><path d="M24 36.5h-8M24 38.5l-7 2M40 36.5h8M40 38.5l7 2" stroke="${OUT}" stroke-width=".7"/></svg>`, say: ["mrrp.", "I knocked your p-value off the table.", "Feed me coins.", "You call that a confidence interval?", "I only purr for correct answers."] },
    bat: { name: "Nyx", kind: "Bat", price: 250, svg: `<svg viewBox="0 0 64 64"><path class="p-wl" d="M26 30C16 20 8 22 3 30C9 29 11 33 12 38C16 34 20 35 24 40Z" fill="${INK}" stroke="${OUT}" stroke-linejoin="round"/><path class="p-wr" d="M38 30C48 20 56 22 61 30C55 29 53 33 52 38C48 34 44 35 40 40Z" fill="${INK}" stroke="${OUT}" stroke-linejoin="round"/><path d="M24 22L25 11L31 19ZM40 22L39 11L33 19Z" fill="${INK}" stroke="${OUT}" stroke-linejoin="round"/><ellipse cx="32" cy="31" rx="10" ry="12" fill="${INK}" stroke="${OUT}"/><g class="p-eyes"><circle cx="28" cy="28" r="2.4" fill="var(--or)"/><circle cx="36" cy="28" r="2.4" fill="var(--or)"/></g><path d="M29 35L30.5 38L32 35L33.5 38L35 35" fill="none" stroke="var(--ink)" stroke-width="1"/></svg>`, say: ["I sleep in your call stack.", "Echolocating the answer… it's not A.", "Nocturnal, like your study habits.", "screee.", "I hang around. Literally."] },
    ghost: { name: "Boo-lean", kind: "Ghost", price: 350, svg: `<svg viewBox="0 0 64 64"><path d="M14 54V30C14 18 22 10 32 10S50 18 50 30V54L44 49L38 54L32 49L26 54L20 49Z" fill="var(--ink)" opacity=".93" stroke="${OUT}" stroke-linejoin="round"/><g class="p-eyes"><ellipse cx="26" cy="29" rx="3" ry="4.5" fill="${INK}"/><ellipse cx="38" cy="29" rx="3" ry="4.5" fill="${INK}"/></g><ellipse cx="32" cy="39" rx="3" ry="4" fill="${INK}"/><circle cx="21" cy="36" r="2.2" fill="var(--or)" opacity=".5"/><circle cx="43" cy="36" r="2.2" fill="var(--or)" opacity=".5"/></svg>`, say: ["True or false? I'm both.", "I died waiting for a recruiter to reply.", "Boo. Also, check your joins.", "I haunt unindexed tables.", "You can't ghost me. I'm already one."] },
    raven: { name: "Overfit", kind: "Raven", price: 500, svg: `<svg viewBox="0 0 64 64"><path d="M40 44L56 50L44 52Z" fill="${INK}" stroke="${OUT}" stroke-linejoin="round"/><ellipse cx="32" cy="40" rx="15" ry="13" fill="${INK}" stroke="${OUT}"/><circle cx="24" cy="24" r="10" fill="${INK}" stroke="${OUT}"/><path d="M15 23L3 27L15 29Z" fill="var(--or)" stroke="${OUT}" stroke-width=".6" stroke-linejoin="round"/><g class="p-eyes"><circle cx="22" cy="22" r="2.3" fill="var(--ink)"/><circle cx="22" cy="22" r="1" fill="#000"/></g><path class="p-wing" d="M28 36C38 34 44 40 44 48C38 44 32 44 28 46Z" fill="#1c1818" stroke="${OUT}" stroke-linejoin="round"/><path d="M28 52v6M36 52v6M25 58h6M33 58h6" stroke="var(--or)" stroke-width="1.6" stroke-linecap="round"/></svg>`, say: ["Nevermore. Unless there's a retake.", "I memorized the training set. All of it.", "Quoth the raven: regularize.", "caw. (That's a hint. The hint is 'caw'.)", "Your validation loss is showing."] },
    skull: { name: "Null", kind: "Skull", price: 700, svg: `<svg viewBox="0 0 64 64"><path d="M12 28C12 15 21 8 32 8S52 15 52 28C52 35 49 39 45 42V46H19V42C15 39 12 35 12 28Z" fill="var(--ink)" stroke="${OUT}"/><g class="p-eyes"><ellipse cx="24" cy="28" rx="5.5" ry="6.5" fill="${INK}"/><ellipse cx="40" cy="28" rx="5.5" ry="6.5" fill="${INK}"/><circle cx="24" cy="29" r="2" fill="var(--or)"/><circle cx="40" cy="29" r="2" fill="var(--or)"/></g><path d="M32 33L29 40H35Z" fill="${INK}"/><g class="p-jaw"><rect x="21" y="47" width="22" height="9" rx="3" fill="var(--ink)" stroke="${OUT}"/><path d="M26 47v9M32 47v9M38 47v9" stroke="${INK}" stroke-width="1.2"/></g></svg>`, say: ["I am the value you forgot to handle.", "Segfault? In this economy?", "I was a junior dev once.", "NaN of your business.", "Memento mori. Also, memento SQL."] },
  };
  const QUIP = { ok: ["Acceptable.", "Okay, that was clean.", "Look at you, employable.", "The recruiter felt that one.", "Correct. Don't let it go to your head."], bad: ["Oof.", "We don't talk about that one.", "Bold. Wrong, but bold.", "Character development.", "The explanation is right there. Read it."], combo: ["You're on fire. Metaphorically.", "Who ARE you?", "Somebody call a recruiter."] };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  let sayT = null;
  const petSay = (txt) => { const p = $("#pet"); if (!p) return; let b = $(".pet-say", p); if (!b) { b = document.createElement("div"); b.className = "pet-say"; p.appendChild(b); } b.textContent = txt; b.classList.add("on"); clearTimeout(sayT); sayT = setTimeout(() => b.classList.remove("on"), 3200); };
  const petReact = (k) => { const p = $("#pet"); if (!p) return; p.classList.remove("happy", "sad"); void p.offsetWidth; p.classList.add(k); setTimeout(() => p.classList.remove(k), 900); };
  const mountPet = () => { const g = G(), old = $("#pet"); if (old) old.remove(); if (!g.pet || !PETS[g.pet]) return; const p = document.createElement("button"); p.id = "pet"; p.className = "pet-" + g.pet; p.title = `${PETS[g.pet].name} the ${PETS[g.pet].kind.toLowerCase()}`; p.innerHTML = PETS[g.pet].svg; p.addEventListener("click", () => { petSay(pick(PETS[g.pet].say)); petReact("happy"); }); document.body.appendChild(p); };

  /* ---------- shop catalog ---------- */
  const ACCENTS = { blood: ["Blood", "#D02A34", "#A8191F"], venom: ["Venom", "#5FBF4A", "#3E8F2F"], amethyst: ["Amethyst", "#A56BE0", "#7A44B8"], hellfire: ["Hellfire", "#F07A1F", "#C4560C"], frostbite: ["Frostbite", "#4FA9E0", "#2A78B0"], bone: ["Bone", "#CFC6B4", "#8E8674"] };
  const POWER = { fifty: { name: "50/50", desc: "Strikes two wrong answers off a practice question.", price: 30 }, boost: { name: "Double XP", desc: "2× XP on your next 20 answers.", price: 60 }, freeze: { name: "Streak freeze", desc: "Saves your streak if you miss one day. Used automatically.", price: 80 } };
  const applyLook = () => { const g = G(), r = document.documentElement; if (g.accent && g.accent !== "blood" && ACCENTS[g.accent]) { r.style.setProperty("--or", ACCENTS[g.accent][1]); r.style.setProperty("--blood", ACCENTS[g.accent][2]); } else { r.style.removeProperty("--or"); r.style.removeProperty("--blood"); } };

  /* ---------- rewards ---------- */
  let combo = 0, loot = null;
  const changed = () => { GR.save(); if (GR.game.onChange) GR.game.onChange(); };
  const touch = () => { const g = G(), t = day(); if (g.lastDay === t) return; const y = day(-1), y2 = day(-2);
    if (g.lastDay === y) g.streak++; else if (g.lastDay === y2 && g.inv.freeze > 0) { g.inv.freeze--; g.streak++; toast(`<b>Streak freeze used.</b> Your ${g.streak}-day streak lives.`, "gold"); } else g.streak = 1;
    g.best = Math.max(g.best, g.streak); g.lastDay = t; const bonus = 5 * Math.min(g.streak, 7); g.coins += bonus; toast(`<b>Day ${g.streak} streak.</b> +${bonus} coins for showing up.`, "gold"); };
  const gain = (xp, coins = 0) => { const g = G(), before = levelOf(g.xp); touch(); g.xp += xp; g.coins += coins; g.days[day()] = (g.days[day()] || 0) + xp; if (loot) { loot.xp += xp; loot.coins += coins; } quest("xp", xp);
    const after = levelOf(g.xp); if (after > before) levelUp(after); achievements(); changed(); };
  let pendingLvl = 0;
  const flushLevel = () => { if (pendingLvl) { const l = pendingLvl; pendingLvl = 0; showLevel(l, 20 + l * 5); } };
  const levelUp = (l) => { const bonus = 20 + l * 5; G().coins += bonus; if (GR.pathDebug && GR.pathDebug()) { pendingLvl = Math.max(pendingLvl, l); return; } showLevel(l, bonus); };
  const showLevel = (l, bonus) => { sfx("level"); confetti(140); const m = document.createElement("div"); m.className = "lvlup"; m.innerHTML = `<div class="lvlup-in"><div class="cap">Level up</div><div class="lvlup-n">${l}</div><i class="sigil"></i><p>“${E(titleOf(l))}”</p><small>+${bonus} coins${nextTitle(l) ? ` · next title at level ${nextTitle(l)[0]}` : ""}</small><button class="btn primary">Keep going</button></div>`; m.addEventListener("click", () => m.remove()); document.body.appendChild(m); if (G().pet) setTimeout(() => petSay("Level " + l + ". I'm almost proud."), 600); };

  /* ---------- quests ---------- */
  const QUESTS = [["answer", 10, "Answer 10 questions"], ["answer", 20, "Answer 20 questions"], ["correct", 8, "Get 8 answers right"], ["combo", 5, "Hit a 5-answer combo"], ["combo", 8, "Hit an 8-answer combo"], ["session80", 1, "Finish a session with 80% or better"], ["lesson", 1, "Read a lesson you haven't opened before"], ["code", 1, "Submit a coding or SQL solution"], ["xp", 200, "Earn 200 XP"], ["tracks", 2, "Practice in 2 different tracks"], ["hard", 3, "Get 3 hard questions right"]];
  const quests = () => { const g = G(), t = day(); if (!g.quests || g.quests.day !== t) { const r = GR.rng(GR.hashNum("q" + t)); g.quests = { day: t, bonus: false, items: r.shuffle(QUESTS.map((_, i) => i)).slice(0, 3).map((i) => ({ i, p: 0, done: false })) }; g.tracks = {}; } return g.quests; };
  const quest = (ev, v = 1) => { const qs = quests(); qs.items.forEach((q) => { const [e, goal, text] = QUESTS[q.i]; if (e !== ev || q.done) return; q.p = ev === "combo" || ev === "tracks" ? Math.max(q.p, v) : q.p + v; if (q.p >= goal) { q.done = true; G().coins += 25; sfx("coin"); toast(`<b>Quest complete:</b> ${E(text)} <em>+25 coins</em>`, "gold"); } });
    if (!qs.bonus && qs.items.every((q) => q.done)) { qs.bonus = true; G().coins += 60; inc("questDays"); confetti(60); toast(`<b>All daily quests done.</b> <em>+60 bonus coins</em>`, "gold"); } };

  /* ---------- achievements ---------- */
  const ACH = [
    ["first", "First blood", "Get your first answer right", (g) => g.n.correct >= 1], ["c5", "Warming up", "5-answer combo", (g) => g.n.maxCombo >= 5], ["c10", "On a tear", "10-answer combo", (g) => g.n.maxCombo >= 10], ["c20", "Unreasonable", "20-answer combo", (g) => g.n.maxCombo >= 20],
    ["s3", "Showing up", "3-day streak", (g) => g.best >= 3], ["s7", "A whole week", "7-day streak", (g) => g.best >= 7], ["s30", "It's a lifestyle now", "30-day streak", (g) => g.best >= 30],
    ["l5", "Not a tourist", "Reach level 5", (g) => levelOf(g.xp) >= 5], ["l10", "First-round material", "Reach level 10", (g) => levelOf(g.xp) >= 10], ["l20", "Hired", "Reach level 20", (g) => levelOf(g.xp) >= 20],
    ["perfect", "Flawless", "Finish a session of 5+ with no mistakes", (g) => g.n.perfect >= 1], ["sess10", "Regular", "Finish 10 sessions", (g) => g.n.sessions >= 10], ["sess50", "Grinder", "Finish 50 sessions", (g) => g.n.sessions >= 50],
    ["mock", "Under pressure", "Finish a mock test", (g) => g.n.mocks >= 1], ["mock650", "Offer-worthy", "Score 650+ on a mock test", (g) => g.n.bestMock >= 650],
    ["code1", "It compiles", "Solve a coding or SQL problem", (g) => g.n.solved >= 1], ["code10", "LeetCode who?", "Solve 10 problems", (g) => g.n.solved >= 10],
    ["read10", "Actually reads the docs", "Open 10 lessons", (g) => Object.keys(g.read).length >= 10], ["wrong50", "Character development", "Get 50 answers wrong. It's called learning.", (g) => g.n.wrong >= 50],
    ["pet", "Not alone anymore", "Adopt a pet", (g) => Object.keys(PETS).some((p) => g.owned[p])], ["zoo", "Cursed menagerie", "Adopt 3 pets", (g) => Object.keys(PETS).filter((p) => g.owned[p]).length >= 3],
    ["rich", "Generational wealth", "Hold 1,000 coins at once", (g) => g.coins >= 1000], ["trade", "Wolf of Turku Street", "Make your first trade", (g) => g.n.trades >= 1], ["quests7", "Completionist", "Finish all daily quests on 7 days", (g) => g.n.questDays >= 7],
    ["owl", "Night owl", "Answer a question between midnight and 5 a.m.", (g) => g.n.owl >= 1], ["answers500", "Five hundred", "Answer 500 questions", (g) => g.n.answers >= 500],
  ];
  const achievements = () => { const g = G(); ACH.forEach(([id, name, desc, test]) => { let ok = false; try { ok = test(g); } catch (e) { ok = false; } if (ok && !g.ach[id]) { g.ach[id] = Date.now(); g.coins += 15; sfx("coin"); toast(`<span class="ach-i"></span><b>Achievement: ${E(name)}</b><br>${E(desc)} <em>+15 coins</em>`, "ach"); } }); };

  /* ---------- event hooks called from the views ---------- */
  const answer = (q, ok) => { const g = G(); inc("answers"); quest("answer"); g.tracks[q.skill.split(".")[0]] = 1; quest("tracks", Object.keys(g.tracks).length); if (new Date().getHours() < 5) inc("owl");
    if (ok) { combo++; inc("correct"); g.n.maxCombo = Math.max(g.n.maxCombo || 0, combo); quest("correct"); quest("combo", combo); if (q.diff === 3) quest("hard");
      const mult = 1 + Math.min(combo - 1, 10) * 0.1, boosted = g.boost > 0, xp = Math.round([0, 10, 16, 24][q.diff] * mult * (boosted ? 2 : 1)), coins = q.diff + (combo % 5 === 0 ? 5 : 0);
      if (boosted) g.boost--; float(`+${xp} XP${boosted ? " ×2" : ""}`, "xp"); if (combo >= 3) setTimeout(() => float(`${combo}× combo`, "combo"), 140); sfx("ok"); petReact("happy"); if (g.pet && (combo === 5 || combo === 10)) petSay(pick(QUIP.combo)); else if (g.pet && Math.random() < 0.18) petSay(pick(QUIP.ok));
      if (loot) loot.best = Math.max(loot.best, combo); gain(xp, coins);
    } else { if (combo >= 3) float("combo lost", "lost"); combo = 0; inc("wrong"); sfx("bad"); petReact("sad"); if (g.pet && Math.random() < 0.3) petSay(pick(QUIP.bad)); float("+2 XP", "meh"); gain(2, 0); } };
  const sessionStart = () => { combo = 0; loot = { xp: 0, coins: 0, best: 0 }; };
  const sessionEnd = (rec) => { const g = G(); inc("sessions"); if (!loot) loot = { xp: 0, coins: 0, best: 0 }; const acc = rec.total ? rec.score / rec.total : 0;
    if (rec.type === "mock") { inc("mocks"); g.n.bestMock = Math.max(g.n.bestMock || 0, rec.scaled || 0); gain(rec.score * 9 + 40, rec.score + 10); inc("answers", rec.total); inc("correct", rec.score); } else gain(15 + Math.round(acc * 25), Math.round(acc * 6));
    if (acc >= 0.8 && rec.total >= 5) quest("session80"); if (acc === 1 && rec.total >= 5) { inc("perfect"); gain(40, 25); setTimeout(() => confetti(80), 300); }
    rec.loot = { xp: loot.xp, coins: loot.coins, best: loot.best }; loot = null; combo = 0; achievements(); changed(); };
  const lesson = (sid) => { const g = G(); if (!GR.skills[sid] || g.read[sid]) return; g.read[sid] = 1; quest("lesson"); float("+15 XP", "xp"); gain(15, 3); };
  const codeTry = (p, ok, first) => { quest("code"); if (ok && first) { inc("solved"); const xp = [0, 60, 95, 140][p.diff], c = [0, 15, 25, 40][p.diff]; float(`+${xp} XP`, "xp"); sfx("level"); confetti(70); toast(`<b>Solved: ${E(p.title)}</b> <em>+${xp} XP · +${c} coins</em>`, "gold"); petReact("happy"); gain(xp, c); } else if (!ok) { petReact("sad"); gain(3, 0); } };

  /* ---------- power-ups inside a session ---------- */
  const decorateSession = (s) => { if (!s || s.type === "mock") return; const g = G(), foot = $(".qfoot"), top = $(".sess-meta"); if (!foot) return; const cut = (s.cut && s.cut[s.i]) || [], answered = s.picks[s.i] !== null;
    document.querySelectorAll(".opts .opt").forEach((b, i) => { if (cut.includes(i) && !answered) { b.classList.add("cut"); b.disabled = true; } });
    if (!answered && !cut.length && s.items[s.i].options.length === 4) { const b = document.createElement("button"); b.className = "btn sm pw"; b.dataset.act = "fifty"; b.innerHTML = `50/50 <em>${g.inv.fifty || 0}</em>`; b.title = g.inv.fifty ? "Strike two wrong answers" : "Buy 50/50s in the shop"; foot.insertBefore(b, foot.children[1] || null); }
    if (top) { const c = document.createElement("span"); c.className = "chip combo" + (combo >= 3 ? " hot" : ""); c.innerHTML = `<i>combo</i><b>${combo}×</b>`; top.insertBefore(c, top.firstChild); if (g.boost > 0) { const x = document.createElement("span"); x.className = "chip hot"; x.innerHTML = `<i>2× XP</i><b>${g.boost}</b>`; top.insertBefore(x, top.firstChild); } } };

  /* ---------- coin exchange: a tiny deterministic market, one tick per hour ---------- */
  const TK = [["GRAD", "Gradient Index Fund", "Owns a bit of everything. Boring on purpose.", 100, 0.0005, 0.004, 1], ["BOND", "Boring Bonds", "Barely moves. That's the point.", 50, 0.00015, 0.0008, 0.05], ["NULL", "Null Pointer Bank", "A bank. What could go wrong.", 40, 0.0004, 0.009, 1.3], ["OVFT", "Overfit Inc.", "Crushed every backtest. Reality pending.", 25, 0.0003, 0.022, 1.8], ["MEOW", "MeowCoin", "A coin with a cat on it. No fundamentals. Vibes only.", 5, -0.0004, 0.06, 2.5]];
  const T0 = Math.floor(Date.UTC(2026, 9, 1) / 36e5), tickNow = () => Math.floor(Date.now() / 36e5), cache = {};
  const series = (id) => { const tk = TK.find((t) => t[0] === id), end = tickNow(), c = cache[id] || (cache[id] = { t: T0, p: [tk[3]] }); while (c.t < end) { c.t++; const mkt = GR.rng(c.t * 7919 + 13).gauss() * 0.004, own = GR.rng(GR.hashNum(id) + c.t * 104729).gauss(); c.p.push(Math.max(0.05, c.p[c.p.length - 1] * Math.exp(tk[4] + tk[6] * mkt + tk[5] * own))); } return c.p; };
  const price = (id) => { const p = series(id); return p[p.length - 1]; };
  const worth = () => TK.reduce((a, t) => a + (G().hold[t[0]] || 0) * price(t[0]), 0);
  const spark = (p, w = 150, h = 38) => { const s = p.slice(-72), lo = Math.min(...s), hi = Math.max(...s), up = s[s.length - 1] >= s[0]; return `<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><path d="${s.map((v, i) => `${i ? "L" : "M"}${((i / (s.length - 1)) * w).toFixed(1)},${(h - 3 - ((v - lo) / (hi - lo || 1)) * (h - 6)).toFixed(1)}`).join("")}" fill="none" stroke="var(--${up ? "green" : "bad"})" stroke-width="1.8"/></svg>`; };
  const trade = (id, qty) => { const g = G(), p = price(id), have = g.hold[id] || 0; if (qty > 0) { const cost = Math.ceil(qty * p * 1.01); if (cost > g.coins) return toast("Not enough coins for that order.", "bad"); g.coins -= cost; g.hold[id] = have + qty; g.cost[id] = (g.cost[id] || 0) + cost; toast(`Bought ${qty} ${id} for ${fmt(cost)} coins (1% fee included).`); } else { const q = Math.min(have, -qty); if (!q) return; const got = Math.floor(q * p * 0.99), basis = (g.cost[id] || 0) * (q / have); g.coins += got; g.hold[id] = have - q; g.cost[id] = (g.cost[id] || 0) - basis; const pl = got - basis; toast(`Sold ${q} ${id} for ${fmt(got)} coins. ${pl >= 0 ? "Profit" : "Loss"}: ${fmt(Math.abs(pl))}.`, pl >= 0 ? "gold" : "bad"); }
    inc("trades"); sfx("coin"); achievements(); changed(); if (GR.game.rerender) GR.game.rerender(); };

  /* ---------- views: HUD, dashboard strip, shop, profile, exchange ---------- */
  const coinI = `<svg class="coin" viewBox="0 0 16 16" width="13" height="13"><path d="M8 1l6 3.5v7L8 15l-6-3.5v-7z" fill="#C9933A" stroke="#7a5a1e"/><path d="M8 4.5v7M6 6.2h3.2a1.3 1.3 0 010 2.6H6.6" fill="none" stroke="#3b2a08" stroke-width="1.2"/></svg>`;
  const flameI = `<svg viewBox="0 0 16 16" width="12" height="13"><path d="M8 1c1 3 4 4 4 8a4 4 0 01-8 0c0-2 1-3 1.500-4 .5 1.500 1.500 1.500 1.500 0S7 3 8 1z" fill="var(--or)"/></svg>`;
  const hud = () => { const g = G(), p = prog(); return `<a class="hud" href="#/profile" title="Your profile and achievements"><div class="hud-top"><span class="lv">LVL ${p.l}</span><span class="hud-c">${coinI}<b id="hud-coins">${fmt(g.coins)}</b></span><span class="hud-s ${g.lastDay === day() ? "lit" : ""}">${flameI}<b>${g.streak}</b></span></div><div class="xpbar"><i style="width:${p.pct.toFixed(1)}%"></i></div><small>${E(titleOf(p.l))}</small></a>`; };
  const questCard = () => { const qs = quests(), p = prog(); return `<section class="card gstrip"><div class="gs-l"><div class="cap">Level ${p.l} · ${fmt(p.into)} / ${fmt(p.span)} XP</div><h3>“${E(titleOf(p.l))}”</h3><div class="xpbar big"><i style="width:${p.pct.toFixed(1)}%"></i></div><small class="muted">${nextTitle(p.l) ? `New title at level ${nextTitle(p.l)[0]}.` : "You have every title. Touch grass."} Streak: ${G().streak} day${G().streak === 1 ? "" : "s"}.</small></div>
      <div class="gs-r"><div class="cap">Daily quests ${qs.bonus ? "· all done" : "· +60 coins for all three"}</div>${qs.items.map((q) => { const [, goal, text] = QUESTS[q.i]; return `<div class="quest ${q.done ? "done" : ""}"><span>${q.done ? "✓" : "◇"} ${E(text)}</span><span class="mbar"><i style="width:${Math.min(100, (q.p / goal) * 100)}%;background:var(--or)"></i></span><em>${Math.min(q.p, goal)}/${goal}</em></div>`; }).join("")}</div></section>`; };
  const view = (name, main) => { const g = G(), crumb = (t) => `<div class="crumb"><a href="#/">Dashboard</a> / <span>${t}</span></div>`;
    if (name === "shop") { const petCard = ([id, p]) => `<div class="item ${g.pet === id ? "eq" : ""}"><div class="item-pv pet-${id}">${p.svg}</div><b>${E(p.name)}</b><small>${E(p.kind)}</small>${g.owned[id] ? `<button class="btn sm ${g.pet === id ? "" : "primary"}" data-act="equip" data-id="${id}">${g.pet === id ? "Send away" : "Summon"}</button>` : `<button class="btn sm primary" data-act="buy" data-id="${id}" ${g.coins < p.price ? "disabled" : ""}>${coinI} ${p.price}</button>`}</div>`;
      main.innerHTML = `${crumb("Shop")}<header class="thead"><div><h1>The shop</h1><p class="lead">Coins come from right answers, combos, quests, streaks and solved problems. Spend them on a cursed little companion, power-ups or a new accent color. You have ${coinI} <b>${fmt(g.coins)}</b>.</p></div></header>
        <h2 class="sec">Companions</h2><div class="items">${Object.entries(PETS).map(petCard).join("")}</div>
        <h2 class="sec">Power-ups</h2><div class="items">${Object.entries(POWER).map(([id, p]) => `<div class="item"><div class="item-pv pw-${id}"><span>${id === "fifty" ? "½" : id === "boost" ? "2×" : "❄"}</span></div><b>${p.name}</b><small>${p.desc}</small><small class="muted">Owned: ${id === "boost" ? (g.boost > 0 ? g.boost + " answers left" : 0) : g.inv[id] || 0}</small><button class="btn sm primary" data-act="buy" data-id="${id}" ${g.coins < p.price ? "disabled" : ""}>${coinI} ${p.price}</button></div>`).join("")}</div>
        <h2 class="sec">Accent colors</h2><div class="items">${Object.entries(ACCENTS).map(([id, a]) => { const own = id === "blood" || g.owned["a-" + id], on = (g.accent || "blood") === id; return `<div class="item ${on ? "eq" : ""}"><div class="item-pv"><i class="sw" style="background:${a[1]}"></i></div><b>${a[0]}</b>${own ? `<button class="btn sm ${on ? "" : "primary"}" data-act="accent" data-id="${id}" ${on ? "disabled" : ""}>${on ? "Active" : "Use"}</button>` : `<button class="btn sm primary" data-act="buy" data-id="a-${id}" ${g.coins < 120 ? "disabled" : ""}>${coinI} 120</button>`}</div>`; }).join("")}
          <div class="item ${g.trail ? "eq" : ""}"><div class="item-pv"><span>✦</span></div><b>Ember trail</b><small>Your cursor sheds sparks.</small>${g.owned.trail ? `<button class="btn sm" data-act="trail">${g.trail ? "Turn off" : "Turn on"}</button>` : `<button class="btn sm primary" data-act="buy" data-id="trail" ${g.coins < 200 ? "disabled" : ""}>${coinI} 200</button>`}</div></div>`; }
    else if (name === "profile") { const p = prog(), acc = g.n.answers ? Math.round(((g.n.correct || 0) / g.n.answers) * 100) + "%" : "–", days = Array.from({ length: 21 }, (_, i) => day(i - 20));
      main.innerHTML = `${crumb("Profile")}<header class="thead"><div class="lvbig">${p.l}</div><div><div class="cap">Level ${p.l} · ${fmt(g.xp)} XP total</div><h1>“${E(titleOf(p.l))}”</h1><div class="xpbar big"><i style="width:${p.pct.toFixed(1)}%"></i></div><p class="muted">${fmt(p.span - p.into)} XP to level ${p.l + 1}.${nextTitle(p.l) ? ` Next title unlocks at level ${nextTitle(p.l)[0]}.` : ""}</p></div></header>
        <div class="stats in"><div><b>${fmt(g.coins)}</b><span>coins</span></div><div><b>${g.streak}</b><span>day streak (best ${g.best})</span></div><div><b>${fmt(g.n.answers || 0)}</b><span>answers</span></div><div><b>${acc}</b><span>accuracy</span></div><div><b>${g.n.maxCombo || 0}×</b><span>best combo</span></div><div><b>${g.n.solved || 0}</b><span>problems solved</span></div></div>
        <section class="card"><div class="ch"><h3>Last 3 weeks</h3><button class="btn sm" data-act="sfx">Sound effects: ${g.sfx ? "on" : "off"}</button></div><div class="cal">${days.map((d) => { const v = g.days[d] || 0; return `<i title="${d}: ${v} XP" style="opacity:${v ? Math.min(1, 0.35 + v / 300) : 1}" class="${v ? "on" : ""}"></i>`; }).join("")}</div></section>
        <section class="card"><div class="ch"><h3>Achievements</h3><span class="muted">${Object.keys(g.ach).length} of ${ACH.length} · +15 coins each</span></div><div class="achs">${ACH.map(([id, n, d]) => `<div class="ach ${g.ach[id] ? "got" : ""}"><span class="ach-i"></span><div><b>${E(n)}</b><small>${E(d)}</small></div></div>`).join("")}</div></section>
        <section class="card"><div class="ch"><h3>Career ladder</h3><span class="muted">titles unlock as you level</span></div>${TITLES.map(([l, t]) => `<div class="rung ${l <= p.l ? "got" : ""}"><span class="lv">LVL ${l}</span><span>${l <= p.l ? E(t) : l === (nextTitle(p.l) || [0])[0] ? "??? (next up)" : "???"}</span></div>`).join("")}</section>`; }
    else { const w = worth();
      main.innerHTML = `${crumb("Coin exchange")}<header class="thead"><div><h1>Coin exchange</h1><p class="lead">Put your coins to work, or lose them educationally. Five made-up assets, one price tick per hour, a 1% fee on every trade. Fake coins, fake companies, real lessons from the <a href="#/track/fin">Investing track</a>.</p></div></header>
        <div class="stats in"><div><b>${fmt(g.coins)}</b><span>coins (cash)</span></div><div><b>${fmt(w)}</b><span>invested</span></div><div><b>${fmt(g.coins + w)}</b><span>net worth</span></div></div>
        <section class="card"><table class="tbl mkt"><tr><th>Asset</th><th>Price</th><th>24 h</th><th>Last 3 days</th><th>You hold</th><th>P/L</th><th></th></tr>${TK.map(([id, nm, blurb]) => { const s = series(id), p = s[s.length - 1], ch = p / s[Math.max(0, s.length - 25)] - 1, h = g.hold[id] || 0, pl = h ? h * p - (g.cost[id] || 0) : 0; return `<tr><td><b>${id}</b> ${E(nm)}<br><small class="muted">${E(blurb)}</small></td><td><b>${p.toFixed(2)}</b></td><td class="${ch >= 0 ? "pos" : "neg"}">${ch >= 0 ? "+" : ""}${(ch * 100).toFixed(1)}%</td><td>${spark(s)}</td><td>${h ? `${h} <small class="muted">(${fmt(h * p)})</small>` : "–"}</td><td class="${pl >= 0 ? "pos" : "neg"}">${h ? (pl >= 0 ? "+" : "") + fmt(pl) : ""}</td><td class="row"><button class="btn sm primary" data-act="trade" data-id="${id}" data-q="1">Buy 1</button><button class="btn sm" data-act="trade" data-id="${id}" data-q="10">Buy 10</button><button class="btn sm" data-act="trade" data-id="${id}" data-q="-${h}" ${h ? "" : "disabled"}>Sell all</button></td></tr>`; }).join("")}</table>
        <p class="muted">Prices are simulated random walks with different drift and volatility, plus a shared market shock, so assets move together on bad days. Nothing here is financial advice or a prediction of anything. MeowCoin especially.</p></section>`; } };

  const acts = {
    buy(d) { const g = G(), id = d.id, price = PETS[id] ? PETS[id].price : POWER[id] ? POWER[id].price : id === "trail" ? 200 : 120; if (g.coins < price) return; g.coins -= price; sfx("buy");
      if (PETS[id]) { g.owned[id] = 1; g.pet = id; mountPet(); confetti(50); setTimeout(() => petSay(pick(PETS[id].say)), 400); toast(`<b>${E(PETS[id].name)} the ${PETS[id].kind.toLowerCase()}</b> lives here now.`, "gold"); }
      else if (id === "boost") { g.boost += 20; toast("<b>Double XP</b> on your next 20 answers.", "gold"); } else if (POWER[id]) { g.inv[id] = (g.inv[id] || 0) + 1; toast(`<b>${POWER[id].name}</b> added to your inventory.`, "gold"); }
      else if (id === "trail") { g.owned.trail = 1; g.trail = true; } else { g.owned[id] = 1; g.accent = id.slice(2); applyLook(); }
      achievements(); changed(); if (GR.game.rerender) GR.game.rerender(); },
    equip(d) { const g = G(); g.pet = g.pet === d.id ? "" : d.id; mountPet(); changed(); GR.game.rerender(); },
    accent(d) { G().accent = d.id; applyLook(); changed(); GR.game.rerender(); },
    trail() { const g = G(); g.trail = !g.trail; changed(); GR.game.rerender(); },
    sfx() { const g = G(); g.sfx = !g.sfx; changed(); GR.game.rerender(); },
    trade(d) { trade(d.id, +d.q); },
    fifty() { const g = G(), s = GR.session; if (!s || s.type === "mock" || s.picks[s.i] !== null) return; if (!(g.inv.fifty > 0)) return toast(`No 50/50s left. They're 30 coins in the <a href="#/shop">shop</a>.`); const q = s.items[s.i], wrong = q.options.map((_, i) => i).filter((i) => i !== q.answer); g.inv.fifty--; s.cut = s.cut || {}; s.cut[s.i] = GR.rng(Date.now()).shuffle(wrong).slice(0, 2); sfx("coin"); changed(); GR.game.rerender(); },
  };
  const afterRoute = (a, b) => { applyLook(); document.querySelectorAll(".lvlup").forEach((m) => m.remove()); if (!a) { const h = $(".hero"); if (h) h.insertAdjacentHTML("afterend", questCard()); }
    if (a === "results") { const r = GR.state.sessions.find((x) => x.id === b), h = $(".thead"); if (r && r.loot && h) h.insertAdjacentHTML("afterend", `<div class="loot"><span class="cap">Session loot</span><b>+${fmt(r.loot.xp)} XP</b><b>${coinI} +${fmt(r.loot.coins)}</b>${r.loot.best >= 3 ? `<b>${r.loot.best}× best combo</b>` : ""}</div>`); } };
  const init = () => { applyLook(); mountPet(); embers(); quests(); };

  const reward = (xp, coins, label) => { if (label) toast(`<b>${label}</b> <em>+${xp} XP · +${coins} coins</em>`, "gold"); float(`+${xp} XP`, "xp"); sfx("coin"); gain(xp, coins); };
  GR.game = { reward, confetti, flushLevel, answer, sessionStart, sessionEnd, lesson, codeTry, decorateSession, hud, view, acts, afterRoute, init, state: G, levelOf, titleOf, need, price, PETS, TITLES, ACH, toast };
})();
