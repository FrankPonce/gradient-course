# Test tooling

- `node tools/check.js .` loads every script in a `vm` and validates questions, generators (300 seeds), cases, coding solutions, visualizers and every program node. It prints seven known false positives ("undefined"/"NaN" as legitimate text in JS and pandas questions).
- `prg.js` is the puppeteer run. Install deps once (`cd tools && npm i`), serve the site with `python -m http.server 5190 --bind 127.0.0.1`, then `node tools/prg.js`. Screenshots go to `$SHOTS/gshots` (default: the OS temp dir). Needs Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`.
- Do not use headless `--virtual-time-budget` for timing tests.
