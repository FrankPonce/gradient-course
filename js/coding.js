/* Gradient — coding practice: problem set + in-browser runners (JavaScript in a Worker, Python via Pyodide). */
(function () {
  /* P(id, title, difficulty 1-3, skill, {desc, js:[fnName, starter], py:[fnName, starter], tests:[[args, expected]], cmp, hint, approach, sol}) */
  const P = (id, title, diff, skill, o) => GR.problems.push(Object.assign({ id, title, diff, skill, cmp: "exact" }, o));

  P("two-sum", "Two Sum", 1, "swe.arrays", {
    desc: "Given an array of integers <code>nums</code> and an integer <code>target</code>, return the indices of the two numbers that add up to <code>target</code>. Exactly one solution exists, and you may not use the same element twice. Return the indices in any order.<br><br><b>Example:</b> nums = [2, 7, 11, 15], target = 9 → [0, 1]",
    js: ["twoSum", "function twoSum(nums, target) {\n  // your code here\n}\n"], py: ["two_sum", "def two_sum(nums, target):\n    # your code here\n    pass\n"], cmp: "set",
    tests: [[[[2, 7, 11, 15], 9], [0, 1]], [[[3, 2, 4], 6], [1, 2]], [[[3, 3], 6], [0, 1]], [[[-1, -2, -3, -4, -5], -8], [2, 4]], [[[1, 5, 9, 14, 20, 3], 23], [3, 2]]],
    hint: "For each number x you need target − x. How can you check in O(1) whether you have already seen it?",
    approach: "One pass with a hash map from value to index. For each element, look up its complement; if present you are done, otherwise store the element. O(n) time, O(n) space, versus O(n²) for checking every pair.",
    sol: "function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n}" });

  P("valid-parentheses", "Valid Parentheses", 1, "swe.linked", {
    desc: "Given a string containing only the characters <code>( ) [ ] { }</code>, return <code>true</code> if every bracket is closed by the same type of bracket in the correct order.<br><br><b>Examples:</b> \"()[]{}\" → true · \"(]\" → false · \"([)]\" → false",
    js: ["isValid", "function isValid(s) {\n  // your code here\n}\n"], py: ["is_valid", "def is_valid(s):\n    # your code here\n    pass\n"],
    tests: [[["()"], true], [["()[]{}"], true], [["(]"], false], [["([)]"], false], [["{[]}"], true], [["(("], false], [["]"], false], [[""], true]],
    hint: "The most recently opened bracket must be the first one closed. Which data structure gives you 'most recent first'?",
    approach: "Use a stack. Push every opener. On a closer, the stack must be non-empty and its top must be the matching opener; pop it. At the end the stack must be empty. O(n) time and space.",
    sol: "function isValid(s) {\n  const pair = { ')': '(', ']': '[', '}': '{' }, st = [];\n  for (const c of s) {\n    if (pair[c]) { if (st.pop() !== pair[c]) return false; }\n    else st.push(c);\n  }\n  return st.length === 0;\n}" });

  P("binary-search", "Binary Search", 1, "swe.search", {
    desc: "Given a sorted array of distinct integers <code>nums</code> and a <code>target</code>, return the index of <code>target</code>, or <code>-1</code> if it is not present. Your solution must run in O(log n).<br><br><b>Example:</b> nums = [-1, 0, 3, 5, 9, 12], target = 9 → 4",
    js: ["search", "function search(nums, target) {\n  // your code here\n}\n"], py: ["search", "def search(nums, target):\n    # your code here\n    pass\n"],
    tests: [[[[-1, 0, 3, 5, 9, 12], 9], 4], [[[-1, 0, 3, 5, 9, 12], 2], -1], [[[5], 5], 0], [[[5], -5], -1], [[[1, 3], 3], 1], [[[], 1], -1], [[[2, 4, 6, 8, 10, 12, 14], 2], 0]],
    hint: "Keep an inclusive range [lo, hi]. Loop while lo ≤ hi. Make sure the range shrinks every iteration.",
    approach: "Maintain lo and hi. Compare the middle element with the target and discard the half that cannot contain it: lo = mid + 1 or hi = mid − 1. O(log n) time, O(1) space.",
    sol: "function search(nums, target) {\n  let lo = 0, hi = nums.length - 1;\n  while (lo <= hi) {\n    const mid = lo + ((hi - lo) >> 1);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;\n  }\n  return -1;\n}" });

  P("climbing-stairs", "Climbing Stairs", 1, "swe.dp", {
    desc: "You are climbing a staircase with <code>n</code> steps and can climb 1 or 2 steps at a time. Return the number of distinct ways to reach the top.<br><br><b>Example:</b> n = 3 → 3 (1+1+1, 1+2, 2+1)",
    js: ["climbStairs", "function climbStairs(n) {\n  // your code here\n}\n"], py: ["climb_stairs", "def climb_stairs(n):\n    # your code here\n    pass\n"],
    tests: [[[1], 1], [[2], 2], [[3], 3], [[5], 8], [[10], 89], [[30], 1346269]],
    hint: "How could you have arrived at step n? What does that say about ways(n) in terms of smaller steps?",
    approach: "ways(n) = ways(n−1) + ways(n−2). Iterate bottom-up keeping only the last two values: O(n) time, O(1) space. Plain recursion without a memo is O(2ⁿ) and times out for n = 30.",
    sol: "function climbStairs(n) {\n  let a = 1, b = 1;\n  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];\n  return b;\n}" });

  P("max-subarray", "Maximum Subarray", 2, "swe.dp", {
    desc: "Given an integer array <code>nums</code>, find the contiguous subarray (at least one element) with the largest sum and return that sum.<br><br><b>Example:</b> [-2, 1, -3, 4, -1, 2, 1, -5, 4] → 6 (the subarray [4, -1, 2, 1])",
    js: ["maxSubArray", "function maxSubArray(nums) {\n  // your code here\n}\n"], py: ["max_sub_array", "def max_sub_array(nums):\n    # your code here\n    pass\n"],
    tests: [[[[-2, 1, -3, 4, -1, 2, 1, -5, 4]], 6], [[[1]], 1], [[[5, 4, -1, 7, 8]], 23], [[[-3, -1, -2]], -1], [[[2, -5, 3, 3]], 6], [[[0, 0, 0]], 0]],
    hint: "Let best(i) be the largest sum of a subarray that ENDS at index i. How does best(i) relate to best(i−1)?",
    approach: "Kadane's algorithm: the best subarray ending here either extends the best one ending at the previous index or starts fresh: cur = max(x, cur + x). Track the maximum cur seen. O(n) time, O(1) space.",
    sol: "function maxSubArray(nums) {\n  let cur = nums[0], best = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    cur = Math.max(nums[i], cur + nums[i]);\n    best = Math.max(best, cur);\n  }\n  return best;\n}" });

  P("longest-unique-substring", "Longest Substring Without Repeats", 2, "swe.arrays", {
    desc: "Given a string <code>s</code>, return the length of the longest substring that contains no repeated characters.<br><br><b>Examples:</b> \"abcabcbb\" → 3 (\"abc\") · \"bbbbb\" → 1 · \"pwwkew\" → 3 (\"wke\")",
    js: ["lengthOfLongestSubstring", "function lengthOfLongestSubstring(s) {\n  // your code here\n}\n"], py: ["length_of_longest_substring", "def length_of_longest_substring(s):\n    # your code here\n    pass\n"],
    tests: [[["abcabcbb"], 3], [["bbbbb"], 1], [["pwwkew"], 3], [[""], 0], [["abba"], 2], [["dvdf"], 3], [["tmmzuxt"], 5], [[" "], 1]],
    hint: "Keep a window [left, right] with no repeats. When the character at right is already inside the window, where must left jump to?",
    approach: "Sliding window with a map from character to its last index. If the new character was last seen at or after left, move left just past it. Each index is visited once: O(n) time.",
    sol: "function lengthOfLongestSubstring(s) {\n  const last = new Map(); let left = 0, best = 0;\n  for (let i = 0; i < s.length; i++) {\n    if (last.has(s[i]) && last.get(s[i]) >= left) left = last.get(s[i]) + 1;\n    last.set(s[i], i);\n    best = Math.max(best, i - left + 1);\n  }\n  return best;\n}" });

  P("coin-change", "Coin Change", 2, "swe.dp", {
    desc: "Given coin denominations <code>coins</code> (unlimited supply of each) and a total <code>amount</code>, return the fewest coins needed to make that amount, or <code>-1</code> if it cannot be made.<br><br><b>Examples:</b> coins = [1, 2, 5], amount = 11 → 3 (5+5+1) · coins = [2], amount = 3 → -1",
    js: ["coinChange", "function coinChange(coins, amount) {\n  // your code here\n}\n"], py: ["coin_change", "def coin_change(coins, amount):\n    # your code here\n    pass\n"],
    tests: [[[[1, 2, 5], 11], 3], [[[2], 3], -1], [[[1], 0], 0], [[[1, 3, 4], 6], 2], [[[2, 5, 10, 1], 27], 4], [[[186, 419, 83, 408], 6249], 20]],
    hint: "Greedy fails (try coins [1, 3, 4] for 6). Define dp[a] = fewest coins to make amount a.",
    approach: "Bottom-up DP: dp[0] = 0 and dp[a] = 1 + min(dp[a − c]) over every coin c ≤ a. Unreachable amounts stay at infinity. O(amount × coins) time, O(amount) space.",
    sol: "function coinChange(coins, amount) {\n  const dp = Array(amount + 1).fill(Infinity); dp[0] = 0;\n  for (let a = 1; a <= amount; a++)\n    for (const c of coins) if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}" });

  P("number-of-islands", "Number of Islands", 2, "swe.graphs", {
    desc: "Given a 2-D grid of <code>1</code>s (land) and <code>0</code>s (water), return the number of islands. An island is land connected horizontally or vertically.<br><br><b>Example:</b><pre>[[1,1,0,0],\n [1,0,0,1],\n [0,0,1,1]]  → 2</pre>",
    js: ["numIslands", "function numIslands(grid) {\n  // your code here\n}\n"], py: ["num_islands", "def num_islands(grid):\n    # your code here\n    pass\n"],
    tests: [[[[[1, 1, 0, 0], [1, 0, 0, 1], [0, 0, 1, 1]]], 2], [[[[1, 1, 1], [0, 1, 0], [1, 1, 1]]], 1], [[[[1, 0, 1], [0, 1, 0], [1, 0, 1]]], 5], [[[[0, 0], [0, 0]]], 0], [[[[1]]], 1], [[[]], 0]],
    hint: "Scan every cell. When you find unvisited land, you have found a new island: now mark the whole of it as visited.",
    approach: "For each unvisited land cell, increment the count and flood-fill (DFS or BFS) to mark its entire component. Every cell is visited a constant number of times: O(rows × cols).",
    sol: "function numIslands(grid) {\n  let count = 0;\n  const sink = (r, c) => {\n    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] !== 1) return;\n    grid[r][c] = 0;\n    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);\n  };\n  for (let r = 0; r < grid.length; r++)\n    for (let c = 0; c < grid[0].length; c++)\n      if (grid[r][c] === 1) { count++; sink(r, c); }\n  return count;\n}" });

  P("merge-intervals", "Merge Intervals", 2, "swe.sorting", {
    desc: "Given a list of intervals <code>[start, end]</code>, merge all overlapping intervals and return the result sorted by start. Intervals that touch (such as [1,4] and [4,5]) count as overlapping.<br><br><b>Example:</b> [[1,3],[2,6],[8,10],[15,18]] → [[1,6],[8,10],[15,18]]",
    js: ["merge", "function merge(intervals) {\n  // your code here\n}\n"], py: ["merge", "def merge(intervals):\n    # your code here\n    pass\n"],
    tests: [[[[[1, 3], [2, 6], [8, 10], [15, 18]]], [[1, 6], [8, 10], [15, 18]]], [[[[1, 4], [4, 5]]], [[1, 5]]], [[[[1, 4], [0, 4]]], [[0, 4]]], [[[[1, 10], [2, 3], [4, 5]]], [[1, 10]]], [[[[5, 6], [1, 2]]], [[1, 2], [5, 6]]], [[[]], []]],
    hint: "If the intervals were sorted by start, which intervals could a given interval possibly overlap with?",
    approach: "Sort by start. Walk through, keeping the last merged interval: if the next one starts at or before its end, extend the end; otherwise append a new interval. O(n log n) for the sort.",
    sol: "function merge(intervals) {\n  const s = intervals.map((x) => x.slice()).sort((a, b) => a[0] - b[0]), out = [];\n  for (const iv of s) {\n    const last = out[out.length - 1];\n    if (last && iv[0] <= last[1]) last[1] = Math.max(last[1], iv[1]);\n    else out.push(iv);\n  }\n  return out;\n}" });

  P("top-k-frequent", "Top K Frequent Elements", 2, "swe.trees", {
    desc: "Given an integer array <code>nums</code> and an integer <code>k</code>, return the <code>k</code> most frequent elements, in any order. The answer is guaranteed to be unique.<br><br><b>Example:</b> nums = [1,1,1,2,2,3], k = 2 → [1, 2]",
    js: ["topKFrequent", "function topKFrequent(nums, k) {\n  // your code here\n}\n"], py: ["top_k_frequent", "def top_k_frequent(nums, k):\n    # your code here\n    pass\n"], cmp: "set",
    tests: [[[[1, 1, 1, 2, 2, 3], 2], [1, 2]], [[[1], 1], [1]], [[[4, 4, 5, 5, 5, 6, 6, 6, 6], 1], [6]], [[[7, 7, 8, 8, 8, 9], 2], [8, 7]], [[[-1, -1, 2, 2, 2, 3, 3, 3, 3], 3], [3, 2, -1]]],
    hint: "First count occurrences. Then you need the k largest counts: sorting works; a heap of size k or bucketing by count is faster.",
    approach: "Count with a hash map, then either sort the entries by count (O(n log n)), keep a min-heap of size k (O(n log k)), or bucket values by frequency (O(n)).",
    sol: "function topKFrequent(nums, k) {\n  const cnt = new Map();\n  for (const x of nums) cnt.set(x, (cnt.get(x) || 0) + 1);\n  return [...cnt.entries()].sort((a, b) => b[1] - a[1]).slice(0, k).map((e) => e[0]);\n}" });

  P("subsets", "Subsets", 2, "swe.recursion", {
    desc: "Given an array of distinct integers <code>nums</code>, return all possible subsets (the power set), in any order.<br><br><b>Example:</b> [1, 2] → [[], [1], [2], [1, 2]]",
    js: ["subsets", "function subsets(nums) {\n  // your code here\n}\n"], py: ["subsets", "def subsets(nums):\n    # your code here\n    pass\n"], cmp: "set2",
    tests: [[[[1, 2]], [[], [1], [2], [1, 2]]], [[[]], [[]]], [[[5]], [[], [5]]], [[[1, 2, 3]], [[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]]]],
    hint: "For each element you make one decision: include it or not. That is a recursion tree with 2ⁿ leaves.",
    approach: "Backtracking: at index i, recurse once without nums[i] and once with it (push, recurse, pop). When i reaches the end, record a copy of the current path. O(n · 2ⁿ).",
    sol: "function subsets(nums) {\n  const out = [], path = [];\n  const go = (i) => {\n    if (i === nums.length) { out.push(path.slice()); return; }\n    go(i + 1);\n    path.push(nums[i]); go(i + 1); path.pop();\n  };\n  go(0);\n  return out;\n}" });

  P("precision-recall", "Precision and Recall", 1, "ml.metrics", {
    desc: "Given two equal-length arrays of 0/1 labels, <code>yTrue</code> and <code>yPred</code>, return <code>[precision, recall]</code> for the positive class (1). If a denominator is zero, return 0 for that metric.<br><br><b>Example:</b> yTrue = [1,0,1,1], yPred = [1,1,0,1] → [0.6667, 0.6667]",
    js: ["precisionRecall", "function precisionRecall(yTrue, yPred) {\n  // your code here\n}\n"], py: ["precision_recall", "def precision_recall(y_true, y_pred):\n    # your code here\n    pass\n"], cmp: "approx",
    tests: [[[[1, 0, 1, 1], [1, 1, 0, 1]], [2 / 3, 2 / 3]], [[[1, 1, 0, 0], [1, 1, 0, 0]], [1, 1]], [[[0, 0, 0], [0, 0, 0]], [0, 0]], [[[1, 1, 1, 1], [1, 0, 0, 0]], [1, 0.25]], [[[0, 0, 1], [1, 1, 1]], [1 / 3, 1]], [[[1, 0], [0, 1]], [0, 0]]],
    hint: "Count TP, FP and FN in one pass. Precision = TP/(TP+FP); recall = TP/(TP+FN).",
    approach: "A single loop tallies true positives, false positives and false negatives. Guard both divisions against a zero denominator.",
    sol: "function precisionRecall(yTrue, yPred) {\n  let tp = 0, fp = 0, fn = 0;\n  for (let i = 0; i < yTrue.length; i++) {\n    if (yPred[i] === 1 && yTrue[i] === 1) tp++;\n    else if (yPred[i] === 1) fp++;\n    else if (yTrue[i] === 1) fn++;\n  }\n  return [tp + fp ? tp / (tp + fp) : 0, tp + fn ? tp / (tp + fn) : 0];\n}" });

  P("gradient-step", "One Step of Gradient Descent", 2, "ml.gd", {
    desc: "A model predicts <code>ŷ = w·x + b</code>. Given current <code>w</code>, <code>b</code>, data arrays <code>xs</code> and <code>ys</code>, and learning rate <code>lr</code>, perform ONE gradient descent step on the mean squared error and return the new <code>[w, b]</code>.<br><br>MSE = mean((w·x + b − y)²), so ∂/∂w = mean(2·(ŷ − y)·x) and ∂/∂b = mean(2·(ŷ − y)).<br><br><b>Example:</b> w = 0, b = 0, xs = [1, 2], ys = [2, 4], lr = 0.1 → [1.0, 0.6]",
    js: ["gradientStep", "function gradientStep(w, b, xs, ys, lr) {\n  // your code here\n}\n"], py: ["gradient_step", "def gradient_step(w, b, xs, ys, lr):\n    # your code here\n    pass\n"], cmp: "approx",
    tests: [[[0, 0, [1, 2], [2, 4], 0.1], [1.0, 0.6]], [[2, 0, [1, 2, 3], [2, 4, 6], 0.1], [2, 0]], [[1, 1, [0, 1], [1, 3], 0.5], [1.5, 1.5]], [[0, 0, [3], [6], 0.01], [0.36, 0.12]], [[5, -1, [1, 2, 3, 4], [1, 2, 3, 4], 0.05], [2.25, -1.9]]],
    hint: "Compute both gradients from the CURRENT w and b before updating either one.",
    approach: "Accumulate the two partial derivatives over the data, divide by n, then update both parameters simultaneously: w − lr·dw and b − lr·db. Updating w first and then using the new w to compute db is a classic bug.",
    sol: "function gradientStep(w, b, xs, ys, lr) {\n  let dw = 0, db = 0; const n = xs.length;\n  for (let i = 0; i < n; i++) {\n    const err = w * xs[i] + b - ys[i];\n    dw += 2 * err * xs[i]; db += 2 * err;\n  }\n  return [w - lr * dw / n, b - lr * db / n];\n}" });

  P("kmeans-assign", "k-means Assignment Step", 2, "ml.kmeans", {
    desc: "Given <code>points</code> and <code>centroids</code> (each a list of [x, y] pairs), return a list with the index of the nearest centroid for each point, using Euclidean distance. Break ties in favor of the lower index.<br><br><b>Example:</b> points = [[0,0],[10,10],[1,1]], centroids = [[0,0],[9,9]] → [0, 1, 0]",
    js: ["assignClusters", "function assignClusters(points, centroids) {\n  // your code here\n}\n"], py: ["assign_clusters", "def assign_clusters(points, centroids):\n    # your code here\n    pass\n"],
    tests: [[[[[0, 0], [10, 10], [1, 1]], [[0, 0], [9, 9]]], [0, 1, 0]], [[[[5, 5]], [[0, 0], [10, 10]]], [0]], [[[[1, 2], [8, 8], [9, 1], [2, 1]], [[0, 0], [10, 10], [10, 0]]], [0, 1, 2, 0]], [[[], [[0, 0]]], []], [[[[3, 4], [-3, -4]], [[0, 0]]], [0, 0]]],
    hint: "You can compare squared distances; the square root does not change which one is smallest.",
    approach: "For each point loop over the centroids, tracking the smallest squared distance with a strict '<' so earlier indices win ties. O(points × centroids).",
    sol: "function assignClusters(points, centroids) {\n  return points.map(([x, y]) => {\n    let best = 0, bd = Infinity;\n    centroids.forEach(([cx, cy], j) => { const d = (x - cx) ** 2 + (y - cy) ** 2; if (d < bd) { bd = d; best = j; } });\n    return best;\n  });\n}" });

  P("softmax", "Softmax with Temperature", 1, "ai.llm", {
    desc: "Implement <code>softmax(logits, temperature)</code>: divide each logit by the temperature, exponentiate, and normalize so the outputs sum to 1. Your implementation should not overflow for large logits such as 1000.<br><br><b>Example:</b> logits = [1, 2, 3], temperature = 1 → [0.0900, 0.2447, 0.6652]",
    js: ["softmax", "function softmax(logits, temperature) {\n  // your code here\n}\n"], py: ["softmax", "def softmax(logits, temperature):\n    # your code here\n    pass\n"], cmp: "approx",
    tests: [[[[1, 2, 3], 1], [0.09003057317038046, 0.24472847105479764, 0.6652409557748219]], [[[0, 0], 1], [0.5, 0.5]], [[[2, 0], 2], [0.7310585786300049, 0.2689414213699951]], [[[5], 0.7], [1]], [[[1000, 1000, 1000], 1], [1 / 3, 1 / 3, 1 / 3]], [[[1, 2, 3], 0.5], [0.015876239976466765, 0.11731042782619838, 0.8668133321973349]]],
    hint: "e^1000 overflows. Subtracting the same constant from every logit does not change the result: subtract the maximum first.",
    approach: "Scale by temperature, subtract the maximum scaled logit for numerical stability, exponentiate and divide by the sum.",
    sol: "function softmax(logits, temperature) {\n  const z = logits.map((l) => l / temperature), m = Math.max(...z);\n  const e = z.map((v) => Math.exp(v - m)), s = e.reduce((a, b) => a + b, 0);\n  return e.map((v) => v / s);\n}" });

  P("cosine-similarity", "Cosine Similarity", 1, "ai.tokens", {
    desc: "Return the cosine similarity of two equal-length vectors <code>a</code> and <code>b</code>: (a·b) / (|a|·|b|). If either vector has zero length, return 0.<br><br><b>Example:</b> a = [1, 0], b = [1, 1] → 0.7071",
    js: ["cosineSimilarity", "function cosineSimilarity(a, b) {\n  // your code here\n}\n"], py: ["cosine_similarity", "def cosine_similarity(a, b):\n    # your code here\n    pass\n"], cmp: "approx",
    tests: [[[[1, 0], [1, 1]], Math.SQRT1_2], [[[1, 2, 3], [1, 2, 3]], 1], [[[1, 0], [0, 1]], 0], [[[1, 2], [-1, -2]], -1], [[[0, 0], [1, 2]], 0], [[[3, 4], [4, 3]], 0.96]],
    hint: "Compute the dot product and both squared norms in one loop.",
    approach: "Accumulate a·b, |a|² and |b|², then divide the dot product by the product of the square roots, guarding against zero.",
    sol: "function cosineSimilarity(a, b) {\n  let dot = 0, na = 0, nb = 0;\n  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }\n  return na && nb ? dot / Math.sqrt(na * nb) : 0;\n}" });

  P("moving-average", "Moving Average", 1, "ds.timeseries", {
    desc: "Given an array <code>values</code> and a window size <code>k</code>, return the list of averages of every full window of <code>k</code> consecutive values. If <code>k</code> is larger than the array, return an empty list. Aim for O(n), not O(n·k).<br><br><b>Example:</b> values = [1, 2, 3, 4, 5], k = 3 → [2, 3, 4]",
    js: ["movingAverage", "function movingAverage(values, k) {\n  // your code here\n}\n"], py: ["moving_average", "def moving_average(values, k):\n    # your code here\n    pass\n"], cmp: "approx",
    tests: [[[[1, 2, 3, 4, 5], 3], [2, 3, 4]], [[[10, 20], 1], [10, 20]], [[[4, 8], 2], [6]], [[[1, 2], 5], []], [[[5, -5, 5, -5], 2], [0, 0, 0]], [[[1, 1, 4], 3], [2]]],
    hint: "When the window slides one step, one value enters and one leaves. You do not need to re-sum the window.",
    approach: "Keep a running sum: add the entering value, subtract the one that left, and emit sum / k once the window is full. O(n) time.",
    sol: "function movingAverage(values, k) {\n  const out = []; let sum = 0;\n  for (let i = 0; i < values.length; i++) {\n    sum += values[i];\n    if (i >= k) sum -= values[i - k];\n    if (i >= k - 1) out.push(sum / k);\n  }\n  return out;\n}" });

  P("dense-rank", "Dense Rank", 1, "ba.window", {
    desc: "Implement SQL's <code>DENSE_RANK() OVER (ORDER BY score DESC)</code>. Given an array <code>scores</code>, return an array of the same length where each element is the dense rank of the corresponding score: the highest score has rank 1, ties share a rank, and no ranks are skipped.<br><br><b>Example:</b> [90, 70, 90, 80] → [1, 3, 1, 2]",
    js: ["denseRank", "function denseRank(scores) {\n  // your code here\n}\n"], py: ["dense_rank", "def dense_rank(scores):\n    # your code here\n    pass\n"],
    tests: [[[[90, 70, 90, 80]], [1, 3, 1, 2]], [[[5]], [1]], [[[1, 2, 3]], [3, 2, 1]], [[[7, 7, 7]], [1, 1, 1]], [[[]], []], [[[10, 30, 20, 30, 10]], [3, 1, 2, 1, 3]]],
    hint: "What are the distinct scores in descending order? A score's dense rank is its position in that list.",
    approach: "Collect the distinct scores, sort them descending, and map each score to its 1-based position. O(n log n).",
    sol: "function denseRank(scores) {\n  const uniq = [...new Set(scores)].sort((a, b) => b - a), rank = new Map(uniq.map((s, i) => [s, i + 1]));\n  return scores.map((s) => rank.get(s));\n}" });

  P("detect-loop", "Detect an Agent Loop", 1, "ag.loop", {
    desc: "An agent harness logs each tool call as a string such as <code>search(q=\"Q3 revenue\")</code>. Return the index of the call at which the same call has appeared <code>k</code> times <b>in a row</b>, so the harness can interrupt the agent. If that never happens, return <code>-1</code>.<br><br><b>Example:</b> calls = [\"a\", \"b\", \"b\", \"b\", \"c\"], k = 3 → 3",
    js: ["detectLoop", "function detectLoop(calls, k) {\n  // your code here\n}\n"], py: ["detect_loop", "def detect_loop(calls, k):\n    # your code here\n    pass\n"],
    tests: [[[["a", "b", "b", "b", "c"], 3], 3], [[["a", "b", "a", "b"], 2], -1], [[["x", "x"], 2], 1], [[[], 2], -1], [[["s", "s", "t", "s", "s", "s", "s"], 4], 6], [[["only"], 1], 0]],
    hint: "Keep a counter of how many times the current call has repeated. Reset it when the call changes.",
    approach: "Walk the list once, tracking the length of the current run of identical calls. Return the index where the run length reaches k. O(n) time, O(1) space.",
    sol: "function detectLoop(calls, k) {\n  let run = 0;\n  for (let i = 0; i < calls.length; i++) {\n    run = i > 0 && calls[i] === calls[i - 1] ? run + 1 : 1;\n    if (run >= k) return i;\n  }\n  return -1;\n}" });

  P("backoff-schedule", "Exponential Backoff Schedule", 1, "ag.automation", {
    desc: "Return the list of wait times (in seconds) before each of <code>retries</code> retries, using exponential backoff: the i-th wait (starting at 0) is <code>base · factor<sup>i</sup></code>, but never more than <code>cap</code>.<br><br><b>Example:</b> base = 1, factor = 2, cap = 10, retries = 5 → [1, 2, 4, 8, 10]",
    js: ["backoffSchedule", "function backoffSchedule(base, factor, cap, retries) {\n  // your code here\n}\n"], py: ["backoff_schedule", "def backoff_schedule(base, factor, cap, retries):\n    # your code here\n    pass\n"], cmp: "approx",
    tests: [[[1, 2, 10, 5], [1, 2, 4, 8, 10]], [[0.5, 2, 30, 4], [0.5, 1, 2, 4]], [[2, 3, 100, 4], [2, 6, 18, 54]], [[1, 2, 5, 0], []], [[5, 2, 3, 3], [3, 3, 3]], [[1, 1.5, 100, 3], [1, 1.5, 2.25]]],
    hint: "Compute each delay from the formula and clamp it with min(). In production you'd also add random jitter.",
    approach: "For i from 0 to retries − 1, append min(cap, base × factor^i). O(retries).",
    sol: "function backoffSchedule(base, factor, cap, retries) {\n  const out = [];\n  for (let i = 0; i < retries; i++) out.push(Math.min(cap, base * factor ** i));\n  return out;\n}" });

  P("validate-tool-call", "Validate a Tool Call", 2, "ag.tools", {
    desc: "Before executing a tool call, a harness checks the model's arguments against a simple schema: <code>{ required: [names], props: { name: type } }</code>, where type is <code>\"string\"</code>, <code>\"number\"</code>, <code>\"boolean\"</code> or <code>\"array\"</code>. Return a list of error strings:<br>1. <code>\"missing: name\"</code> for each required name that is absent, in the order of <code>required</code>;<br>2. then, for each argument key in alphabetical order, <code>\"unknown: key\"</code> if it is not in <code>props</code>, or <code>\"type: key\"</code> if its value has the wrong type.<br>Return <code>[]</code> if the call is valid. Booleans are not numbers.<br><br><b>Example:</b> schema = {required: [\"city\", \"days\"], props: {city: \"string\", days: \"number\"}}, args = {city: \"Turku\", units: \"C\"} → [\"missing: days\", \"unknown: units\"]",
    js: ["validateCall", "function validateCall(schema, args) {\n  // your code here\n}\n"], py: ["validate_call", "def validate_call(schema, args):\n    # your code here\n    pass\n"],
    tests: [
      [[{ required: ["city", "days"], props: { city: "string", days: "number" } }, { city: "Turku", units: "C" }], ["missing: days", "unknown: units"]],
      [[{ required: ["q"], props: { q: "string", limit: "number" } }, { q: "agents", limit: 5 }], []],
      [[{ required: [], props: { limit: "number" } }, { limit: "5" }], ["type: limit"]],
      [[{ required: ["ids"], props: { ids: "array", dry_run: "boolean" } }, { ids: [1, 2], dry_run: "yes" }], ["type: dry_run"]],
      [[{ required: ["n"], props: { n: "number" } }, { n: true }], ["type: n"]],
      [[{ required: ["a", "b"], props: { a: "string", b: "string" } }, { z: 1, c: 2 }], ["missing: a", "missing: b", "unknown: c", "unknown: z"]],
      [[{ required: [], props: { tags: "array", name: "string" } }, { tags: "x", name: ["y"] }], ["type: name", "type: tags"]],
    ],
    hint: "Write a helper that returns the type name of a value. In Python, check bool before int, because isinstance(True, int) is True. In JavaScript, use Array.isArray for arrays.",
    approach: "First loop over schema.required and report missing names. Then sort the argument keys; for each, report unknown keys, otherwise compare the value's type with the schema's. O(r + a log a).",
    sol: "function validateCall(schema, args) {\n  const kind = (v) => Array.isArray(v) ? \"array\" : typeof v;\n  const errs = schema.required.filter((r) => !(r in args)).map((r) => \"missing: \" + r);\n  for (const k of Object.keys(args).sort()) {\n    if (!(k in schema.props)) errs.push(\"unknown: \" + k);\n    else if (kind(args[k]) !== schema.props[k]) errs.push(\"type: \" + k);\n  }\n  return errs;\n}" });

  /* ---------- SQL problems: run in SQLite (sql.js) against two datasets and compared with the reference query ---------- */
  const mkSql = (emp, cust, ord) => "CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER, manager_id INTEGER);\n" + emp.map((r) => `INSERT INTO employees VALUES (${r[0]}, '${r[1]}', '${r[2]}', ${r[3]}, ${r[4] === null ? "NULL" : r[4]});`).join("\n") +
    "\nCREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, country TEXT);\n" + cust.map((r) => `INSERT INTO customers VALUES (${r[0]}, '${r[1]}', '${r[2]}');`).join("\n") +
    "\nCREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, amount REAL, status TEXT, day TEXT);\n" + ord.map((r) => `INSERT INTO orders VALUES (${r[0]}, ${r[1]}, ${r[2]}, '${r[3]}', '${r[4]}');`).join("\n");
  const EMP_A = [[1, "Ada", "Engineering", 150000, null], [2, "Linus", "Engineering", 120000, 1], [3, "Grace", "Engineering", 125000, 1], [4, "Alan", "Engineering", 95000, 2], [5, "Edsger", "Data", 110000, null], [6, "Barbara", "Data", 115000, 5], [7, "Ken", "Data", 90000, 5], [8, "Margaret", "Sales", 70000, null], [9, "Dennis", "Sales", 82000, 8], [10, "Radia", "Marketing", 68000, null]];
  const CUST_A = [[1, "Acme", "US"], [2, "Bolt", "DE"], [3, "Cyan", "FI"], [4, "Dune", "US"], [5, "Echo", "FI"]];
  const ORD_A = [[1, 1, 120, "completed", "2026-01-05"], [2, 1, 80, "completed", "2026-01-05"], [3, 2, 200, "completed", "2026-01-07"], [4, 3, 50, "cancelled", "2026-01-07"], [5, 3, 75.5, "completed", "2026-02-02"], [6, 2, 20, "completed", "2026-02-10"], [7, 1, 300, "completed", "2026-03-01"], [8, 4, 60, "cancelled", "2026-03-03"], [9, 2, 150, "completed", "2026-03-15"]];
  const EMP_B = [[1, "Zoe", "Engineering", 140000, null], [2, "Yann", "Engineering", 101000, 1], [3, "Xena", "Engineering", 99000, 1], [4, "Will", "Data", 130000, null], [5, "Vera", "Data", 135000, 4], [6, "Uma", "Data", 88000, 4], [7, "Theo", "Data", 91000, 5], [8, "Sam", "Sales", 60000, null], [9, "Rita", "Sales", 60000, 8], [10, "Quinn", "Support", 50000, null], [11, "Pia", "Engineering", 140000, 1]];
  const CUST_B = [[1, "Nova", "US"], [2, "Onyx", "SE"], [3, "Peak", "FI"], [4, "Quay", "NO"]];
  const ORD_B = [[1, 1, 10, "completed", "2026-04-01"], [2, 3, 40, "completed", "2026-04-01"], [3, 3, 60, "completed", "2026-04-20"], [4, 1, 500, "cancelled", "2026-05-02"], [5, 1, 25, "completed", "2026-05-09"], [6, 3, 35, "completed", "2026-06-11"], [7, 1, 45, "completed", "2026-06-30"]];
  const SETUPS = [mkSql(EMP_A, CUST_A, ORD_A), mkSql(EMP_B, CUST_B, ORD_B)];
  const prev = (name, head, rows) => GR.tbl(head, rows.slice(0, 5).map((r) => r.map((v) => (v === null ? "NULL" : v))), `${name} (first rows)`);
  const T_EMP = prev("employees", ["id", "name", "dept", "salary", "manager_id"], EMP_A), T_CUST = prev("customers", ["id", "name", "country"], CUST_A), T_ORD = prev("orders", ["id", "customer_id", "amount", "status", "day"], ORD_A);
  const SQLP = (id, title, diff, skill, desc, tables, sol, o = {}) => P(id, title, diff, skill, Object.assign({ desc: desc + `<div class="sflex">${tables.join("")}</div><p class="muted">Column names in your result don't matter; the columns' order and values do${o.ordered ? ", and so does row order" : ". Row order doesn't matter here"}. Your query runs on two different datasets.</p>`, sql: ["", "-- write your query here\nSELECT\n"], setups: SETUPS, tests: SETUPS.map((_, i) => [["dataset " + (i + 1)], null]), sol, ordered: false }, o));

  SQLP("sql-high-earners", "SQL: High Earners", 1, "ba.sql", "Return the <code>name</code> and <code>salary</code> of every employee in the <b>Engineering</b> department who earns more than 100,000, highest salary first (ties by name A→Z).", [T_EMP],
    "SELECT name, salary\nFROM employees\nWHERE dept = 'Engineering' AND salary > 100000\nORDER BY salary DESC, name;", { ordered: true, hint: "Filter rows with WHERE before sorting with ORDER BY. Two conditions are joined with AND.", approach: "WHERE keeps only Engineering rows above the threshold; ORDER BY salary DESC, name sorts them." });
  SQLP("sql-dept-stats", "SQL: Department Stats", 1, "ba.sql", "For each department return <code>dept</code>, the number of employees, and the average salary.", [T_EMP],
    "SELECT dept, COUNT(*) AS headcount, AVG(salary) AS avg_salary\nFROM employees\nGROUP BY dept;", { hint: "GROUP BY collapses rows into one per department. COUNT(*) and AVG() are computed per group.", approach: "Group by dept, then aggregate. Every selected column must be either in GROUP BY or inside an aggregate." });
  SQLP("sql-big-depts", "SQL: Departments With 3+ People", 2, "ba.sql", "Return <code>dept</code> and total salary cost for departments that have <b>at least 3</b> employees.", [T_EMP],
    "SELECT dept, SUM(salary) AS total\nFROM employees\nGROUP BY dept\nHAVING COUNT(*) >= 3;", { hint: "WHERE filters rows before grouping. Which clause filters groups after aggregation?", approach: "GROUP BY dept, then HAVING COUNT(*) >= 3 keeps only large groups. WHERE cannot reference aggregates." });
  SQLP("sql-revenue-by-customer", "SQL: Revenue per Customer", 1, "ba.joins", "Return each customer's <code>name</code> and their total <b>completed</b> order amount, for customers with at least one completed order. Largest total first.", [T_CUST, T_ORD],
    "SELECT c.name, SUM(o.amount) AS revenue\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nWHERE o.status = 'completed'\nGROUP BY c.id, c.name\nORDER BY revenue DESC;", { ordered: true, hint: "Join orders to customers on the key, filter to completed orders, then group by customer.", approach: "An inner join keeps only customers with matching orders. Filter status in WHERE, aggregate with SUM, sort by the aggregate." });
  SQLP("sql-never-ordered", "SQL: Customers Who Never Ordered", 2, "ba.joins", "Return the <code>name</code> of every customer with <b>no orders at all</b> (any status).", [T_CUST, T_ORD],
    "SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.id IS NULL;", { hint: "A LEFT JOIN keeps customers without a match and fills the order columns with NULL.", approach: "The anti-join pattern: LEFT JOIN, then keep rows where the right side's key IS NULL. NOT EXISTS works too." });
  SQLP("sql-earn-more-than-manager", "SQL: Earning More Than the Boss", 2, "ba.joins", "Return the <code>name</code> of every employee whose salary is higher than their manager's. <code>manager_id</code> points to another row in the same table.", [T_EMP],
    "SELECT e.name\nFROM employees e\nJOIN employees m ON m.id = e.manager_id\nWHERE e.salary > m.salary;", { hint: "Join the table to itself: one alias for the employee, one for the manager.", approach: "A self join pairs each employee row with its manager row; then compare the two salaries." });
  SQLP("sql-second-highest", "SQL: Second-Highest Salary", 2, "ba.sql", "Return a single value: the second-highest <b>distinct</b> salary in the company.", [T_EMP],
    "SELECT MAX(salary)\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);", { hint: "What is the highest salary among those strictly below the maximum?", approach: "A scalar subquery finds the top salary; the outer MAX finds the best of the rest. DENSE_RANK() = 2 also works." });
  SQLP("sql-top2-per-dept", "SQL: Top 2 Earners per Department", 2, "ba.window", "For each department return <code>dept</code>, <code>name</code> and <code>salary</code> of the two highest-paid employees. Break salary ties by name A→Z.", [T_EMP],
    "WITH ranked AS (\n  SELECT dept, name, salary,\n         ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC, name) AS rn\n  FROM employees\n)\nSELECT dept, name, salary\nFROM ranked\nWHERE rn <= 2;", { hint: "Number the rows within each department with a window function, then filter on that number in an outer query.", approach: "ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC, name) ranks within each department. Window results can't be filtered in the same SELECT, so wrap it in a CTE." });
  SQLP("sql-running-total", "SQL: Running Revenue", 2, "ba.window", "For each <code>day</code> with completed orders return the day, that day's completed revenue, and the <b>running total</b> of completed revenue up to and including that day. Earliest day first.", [T_ORD],
    "SELECT day, SUM(amount) AS revenue,\n       SUM(SUM(amount)) OVER (ORDER BY day) AS running\nFROM orders\nWHERE status = 'completed'\nGROUP BY day\nORDER BY day;", { ordered: true, hint: "First get one row per day. A window SUM with ORDER BY and no PARTITION BY accumulates across rows.", approach: "Aggregate to daily revenue, then SUM(...) OVER (ORDER BY day) gives the cumulative total. You can nest the aggregate inside the window function or use a CTE." });
  SQLP("sql-month-over-month", "SQL: Month-over-Month Change", 3, "ba.window", "For each month (as <code>YYYY-MM</code>) with completed orders return the month, its completed revenue, and the <b>change from the previous month</b> (NULL for the first month). Earliest month first.", [T_ORD],
    "WITH m AS (\n  SELECT substr(day, 1, 7) AS month, SUM(amount) AS revenue\n  FROM orders\n  WHERE status = 'completed'\n  GROUP BY 1\n)\nSELECT month, revenue, revenue - LAG(revenue) OVER (ORDER BY month) AS change\nFROM m\nORDER BY month;", { ordered: true, hint: "Build monthly revenue in a CTE (substr(day, 1, 7) gives YYYY-MM). LAG() reads the previous row's value.", approach: "Monthly totals in a CTE, then LAG(revenue) OVER (ORDER BY month) fetches the prior month; subtract to get the change." });

  /* ---------- comparison ---------- */
  const approx = (a, b) => typeof a === "number" && typeof b === "number" ? Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b)) : Array.isArray(a) && Array.isArray(b) ? a.length === b.length && a.every((v, i) => approx(v, b[i])) : a === b;
  const canon = (v, deep) => Array.isArray(v) ? JSON.stringify(v.map((x) => (deep && Array.isArray(x) ? JSON.stringify(x.slice().sort()) : JSON.stringify(x))).sort()) : JSON.stringify(v);
  GR.codeEqual = (p, got, exp) => { try { return p.cmp === "approx" ? approx(got, exp) : p.cmp === "set" ? canon(got) === canon(exp) : p.cmp === "set2" ? canon(got, true) === canon(exp, true) : JSON.stringify(got) === JSON.stringify(exp); } catch (e) { return false; } };

  /* ---------- runners ---------- */
  const JS_WORKER = `self.onmessage = (e) => { const { code, fn, tests } = e.data; let f;
    try { f = (new Function(code + "\\n;return typeof " + fn + " !== 'undefined' ? " + fn + " : null;"))(); } catch (err) { postMessage({ error: String(err) }); return; }
    if (typeof f !== "function") { postMessage({ error: "Define a function named " + fn + "." }); return; }
    const out = [], log = console.log;
    for (const t of tests) { const logs = []; console.log = (...a) => { if (logs.length < 20) logs.push(a.map((x) => typeof x === "string" ? x : JSON.stringify(x)).join(" ")); };
      try { const got = f(...JSON.parse(JSON.stringify(t))); out.push({ got: got === undefined ? null : JSON.parse(JSON.stringify(got)), logs }); } catch (err) { out.push({ err: String(err), logs }); } }
    console.log = log; postMessage({ results: out }); };`;
  const PY_HARNESS = `
import json, io, contextlib
def __run(code, fn, tests):
    ns = {}
    try:
        exec(code, ns)
        f = ns.get(fn)
        if not callable(f):
            return json.dumps({"error": "Define a function named " + fn + "."})
    except Exception as ex:
        return json.dumps({"error": type(ex).__name__ + ": " + str(ex)})
    out = []
    for args in json.loads(tests):
        buf = io.StringIO()
        try:
            with contextlib.redirect_stdout(buf):
                got = f(*args)
            got = json.loads(json.dumps(got, default=list))
            out.append({"got": got, "logs": buf.getvalue().splitlines()[:20]})
        except Exception as ex:
            out.append({"err": type(ex).__name__ + ": " + str(ex), "logs": buf.getvalue().splitlines()[:20]})
    return json.dumps({"results": out})
`;
  const PY_WORKER = `importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");
    const ready = loadPyodide().then((py) => { py.runPython(${JSON.stringify(PY_HARNESS)}); postMessage({ ready: true }); return py; }).catch((err) => { postMessage({ fatal: String(err) }); });
    self.onmessage = async (e) => { const py = await ready; if (!py) return; const { code, fn, tests } = e.data;
      try { const run = py.globals.get("__run"); postMessage(JSON.parse(run(code, fn, JSON.stringify(tests)))); } catch (err) { postMessage({ error: String(err) }); } };`;
  /* SQL: SQLite compiled to WebAssembly (sql.js). Each dataset gets a fresh database; the reference query defines the expected rows. */
  const SQL_CDN = "https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/";
  const SQL_WORKER = `importScripts("${SQL_CDN}sql-wasm.js");
    const ready = initSqlJs({ locateFile: (f) => "${SQL_CDN}" + f }).then((S) => { postMessage({ ready: true }); return S; }).catch((err) => { postMessage({ fatal: "Could not load the SQL engine. It is downloaded from a CDN on first use, so an internet connection is required. (" + err + ")" }); });
    const run = (S, setup, q) => { const db = new S.Database(); try { db.run(setup); const r = db.exec(q), last = r[r.length - 1]; return last ? { cols: last.columns, rows: last.values } : { cols: [], rows: [] }; } finally { db.close(); } };
    self.onmessage = async (e) => { const S = await ready; if (!S) return; const { code, setups, ref } = e.data, out = [];
      for (const st of setups) { let exp; try { exp = run(S, st, ref); } catch (err) { postMessage({ error: "Reference query failed: " + err }); return; }
        try { out.push({ got: run(S, st, code), exp, logs: [] }); } catch (err) { out.push({ err: String(err.message || err), exp, logs: [] }); } }
      postMessage({ results: out }); };`;
  const sqlNorm = (v) => (typeof v === "number" ? Math.round(v * 1e6) / 1e6 : v);
  GR.sqlEqual = (got, exp, ordered) => { if (!got || !exp || got.rows.length !== exp.rows.length) return false; const key = (t) => { const r = t.rows.map((row) => JSON.stringify(row.map(sqlNorm))); return ordered ? r : r.sort(); }; const a = key(got), b = key(exp); return a.every((x, i) => x === b[i]); };
  const mk = (src) => new Worker(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
  let pyW = null, pyReady = false, pyWait = [], sqlW = null, sqlReady = false, sqlWait = [];
  const pyWorker = () => { if (pyW) return pyW; pyReady = false; pyW = mk(PY_WORKER);
    const onFirst = (e) => { if (e.data.ready) { pyReady = true; pyWait.splice(0).forEach((f) => f(null)); pyW.removeEventListener("message", onFirst); } else if (e.data.fatal) { const w = pyWait.splice(0); pyW.terminate(); pyW = null; w.forEach((f) => f(e.data.fatal)); } };
    pyW.addEventListener("message", onFirst); pyW.addEventListener("error", () => { const w = pyWait.splice(0); pyW = null; w.forEach((f) => f("Could not load the Python runtime. It is downloaded from a CDN on first use, so an internet connection is required.")); });
    return pyW; };
  /* run(problem, lang, code, onStatus) -> Promise<{error} | {results:[{got|err, logs, pass, args, exp}]}> */
  GR.runCode = (p, lang, code, onStatus = () => {}) => new Promise((resolve) => {
    const tests = p.tests.map((t) => t[0]), fn = p[lang][0];
    const finish = (d) => { if (d.results) d.results.forEach((r, i) => { r.args = p.tests[i][0]; r.exp = p.tests[i][1]; r.pass = !r.err && GR.codeEqual(p, r.got, r.exp); }); resolve(d); };
    if (lang === "sql") {
      /* the engine (about 1 MB) is loaded once and kept; the time limit only counts query execution */
      const go = () => { onStatus("Running…"); const w = sqlW;
        const to = setTimeout(() => { w.terminate(); sqlW = null; resolve({ error: "Time limit exceeded (8 s). Check for a runaway recursive query or a huge cross join." }); }, 8000);
        const h = (e) => { if (e.data.ready) return; clearTimeout(to); w.removeEventListener("message", h); const d = e.data; if (d.results) d.results.forEach((r, i) => { r.args = p.tests[i][0]; r.pass = !r.err && GR.sqlEqual(r.got, r.exp, p.ordered); }); resolve(d); };
        w.addEventListener("message", h); w.postMessage({ code, setups: p.setups.slice(0, p.tests.length), ref: p.sol }); };
      if (sqlW && sqlReady) return go();
      onStatus("Loading the SQL engine (first run only, a few seconds)…");
      if (!sqlW) { sqlReady = false; sqlW = mk(SQL_WORKER);
        const lt = setTimeout(() => { if (sqlReady) return; sqlW.terminate(); sqlW = null; sqlWait.splice(0).forEach((f) => f("The SQL engine took too long to download. Check your connection and try again.")); }, 45000);
        sqlW.addEventListener("message", (e) => { if (e.data.ready) { clearTimeout(lt); sqlReady = true; sqlWait.splice(0).forEach((f) => f(null)); } else if (e.data.fatal) { clearTimeout(lt); sqlW.terminate(); sqlW = null; sqlWait.splice(0).forEach((f) => f(e.data.fatal)); } });
        sqlW.addEventListener("error", () => { clearTimeout(lt); sqlW = null; sqlWait.splice(0).forEach((f) => f("Could not start the SQL engine.")); }); }
      sqlWait.push((err) => (err ? resolve({ error: err }) : go()));
    } else if (lang === "js") {
      const w = mk(JS_WORKER), to = setTimeout(() => { w.terminate(); resolve({ error: "Time limit exceeded (3 s). Check for an infinite loop or an exponential algorithm." }); }, 3000);
      w.onmessage = (e) => { clearTimeout(to); w.terminate(); finish(e.data); }; w.onerror = (e) => { clearTimeout(to); w.terminate(); resolve({ error: e.message || "Script error" }); };
      w.postMessage({ code, fn, tests });
    } else {
      const w = pyWorker();
      const go = (err) => { if (err) return resolve({ error: err }); onStatus("Running…");
        const to = setTimeout(() => { w.terminate(); pyW = null; resolve({ error: "Time limit exceeded (8 s). Check for an infinite loop or an exponential algorithm. The Python runtime will reload on the next run." }); }, 8000);
        const h = (e) => { if (e.data.ready) return; clearTimeout(to); w.removeEventListener("message", h); finish(e.data); }; w.addEventListener("message", h); w.postMessage({ code, fn, tests }); };
      if (pyReady) go(null); else { onStatus("Loading the Python runtime (first run only, a few seconds)…"); pyWait.push(go); }
    }
  });
})();
