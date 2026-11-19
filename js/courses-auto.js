/* Every track becomes a training program built from its existing content:
   - each written lesson becomes a Learn session: its paragraphs as short cards (with its diagram to try),
     the key points, then quick checks from that skill's questions;
   - each topic gets a Drill session that mixes the topic's whole question bank and fresh generator numbers;
   - each multi-part case becomes a PR attempt;
   - each week (module) ends with a test (added by GR.course). */
(function () {
  const K = GR.pathKit, SHORT = { fnd: "Foundations", ml: "Machine Learning", ai: "Deep Learning", ag: "Agentic AI", ds: "Data Science", ba: "Analytics", swe: "Software Eng.", sd: "ML Sys. Design", fin: "Investing", lc: "Coding Interviews" };
  const { chunks, lessonSession } = K;

  GR.tracks.forEach((t) => { if (t.id === "lc" || (GR.courses && GR.courses[t.id])) return;
    const units = t.modules.map((m) => { const lessons = [];
      m.topics.forEach((tp) => { const sids = tp.lessons.map((l) => l.skill);
        tp.lessons.forEach((l) => lessons.push({ title: l.title, skill: l.skill, kind: "learn", cards: lessonSession(l.skill), n: chunks(l.body).length + 4 }));
        if (K.bankFor(sids).length >= 4) lessons.push({ title: `Drill: ${tp.name}`, skill: sids[0], kind: "drill", cards: K.drill(sids, 8) });
      });
      GR.sets.filter((s) => m.skills.includes(s.skill)).forEach((s) => lessons.push({ title: s.title, skill: s.skill, kind: "pr", cards: K.caseCards(s) }));
      return { title: m.name, sub: m.topics.map((tp) => tp.name).join(" · "), guide: m.skills[0], lessons };
    });
    GR.course(t.id, { title: t.name, short: SHORT[t.id] || t.name, color: t.color, blurb: t.blurb, units,
      testPool: (u, rng) => K.drill(u.lessons.map((l) => l.skill).filter((v, i, a) => a.indexOf(v) === i), 6)(rng) });
  });

  /* keep the sidebar order of programs the same as the tracks */
  const order = GR.tracks.map((t) => t.id), C = GR.courses, sorted = {};
  order.forEach((id) => { if (C[id]) sorted[id] = C[id]; }); Object.keys(C).forEach((id) => { if (!sorted[id]) sorted[id] = C[id]; });
  Object.keys(C).forEach((id) => delete C[id]); Object.assign(C, sorted);
  if (C.lc) C.lc.short = SHORT.lc;
})();
