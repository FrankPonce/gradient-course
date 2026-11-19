/* Coding problems for the Coding Interviews track. Tests whose expected value is null are filled in from the
   reference solution at load; every problem also has hand-checked tests (mostly the classic examples). */
(function () {
  const P = (id, title, diff, skill, o) => {
    const fn = new Function(o.sol + "\n;return " + o.js[0] + ";")();
    o.tests = o.tests.map(([args, exp]) => [args, exp === null ? fn(...JSON.parse(JSON.stringify(args))) : exp]);
    GR.problems.push(Object.assign({ id, title, diff, skill, cmp: "exact", lc: true }, o));
  };
  const st = (js, py, args) => ({ js: [js, `function ${js}(${args}) {\n  // your code here\n}\n`], py: [py, `def ${py}(${args.split(", ").map((a) => a.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase())).join(", ")}):\n    # your code here\n    pass\n`] });

  P("lc-valid-anagram", "Valid Anagram", 1, "lc.hashing", Object.assign(st("isAnagram", "is_anagram", "s, t"), {
    desc: "Return <code>true</code> if <code>t</code> is an anagram of <code>s</code> (same letters, same counts).<br><br><b>Example:</b> s = \"anagram\", t = \"nagaram\" → true",
    tests: [[["anagram", "nagaram"], true], [["rat", "car"], false], [["a", "ab"], false], [["", ""], true], [["aacc", "ccac"], false]],
    hint: "Count the letters of one string, then subtract the other's.", approach: "A frequency map (or a 26-slot array): increment for s, decrement for t, and check everything is zero. O(n).",
    sol: "function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const c = {};\n  for (const ch of s) c[ch] = (c[ch] || 0) + 1;\n  for (const ch of t) { if (!c[ch]) return false; c[ch]--; }\n  return true;\n}" }));
  P("lc-group-anagrams", "Group Anagrams", 2, "lc.hashing", Object.assign(st("groupAnagrams", "group_anagrams", "strs"), {
    desc: "Group the strings that are anagrams of each other. Return the groups in any order, with words in any order inside each group.<br><br><b>Example:</b> [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"] → [[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]", cmp: "set2",
    tests: [[[["eat", "tea", "tan", "ate", "nat", "bat"]], [["bat"], ["nat", "tan"], ["ate", "eat", "tea"]]], [[[""]], [[""]]], [[["a"]], [["a"]]], [[["abc", "bca", "cab", "xyz", "zyx", "q"]], null]],
    hint: "What do all anagrams have in common? Use it as a dictionary key.", approach: "Key each word by its sorted letters (or a tuple of 26 counts) and append it to that key's list. O(n · k log k).",
    sol: "function groupAnagrams(strs) {\n  const m = new Map();\n  for (const w of strs) { const k = [...w].sort().join(''); if (!m.has(k)) m.set(k, []); m.get(k).push(w); }\n  return [...m.values()];\n}" }));
  P("lc-longest-consecutive", "Longest Consecutive Sequence", 2, "lc.hashing", Object.assign(st("longestConsecutive", "longest_consecutive", "nums"), {
    desc: "Return the length of the longest run of consecutive integers in an unsorted array, in O(n).<br><br><b>Example:</b> [100, 4, 200, 1, 3, 2] → 4 (1, 2, 3, 4)",
    tests: [[[[100, 4, 200, 1, 3, 2]], 4], [[[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], 9], [[[]], 0], [[[1, 2, 0, 1]], 3], [[[9, -1, 8, -2, 7]], 3]],
    hint: "Put everything in a set. Only start counting from a number that has no predecessor.", approach: "For each x in the set with x − 1 absent, walk x, x+1, … while present. Each number is visited a constant number of times: O(n).",
    sol: "function longestConsecutive(nums) {\n  const s = new Set(nums); let best = 0;\n  for (const x of s) if (!s.has(x - 1)) { let y = x; while (s.has(y + 1)) y++; best = Math.max(best, y - x + 1); }\n  return best;\n}" }));
  P("lc-product-except-self", "Product of Array Except Self", 2, "lc.prefix", Object.assign(st("productExceptSelf", "product_except_self", "nums"), {
    desc: "Return an array where element i is the product of every element except nums[i], without using division, in O(n).<br><br><b>Example:</b> [1, 2, 3, 4] → [24, 12, 8, 6]",
    tests: [[[[1, 2, 3, 4]], [24, 12, 8, 6]], [[[-1, 1, 0, -3, 3]], [0, 0, 9, 0, 0]], [[[2, 3]], [3, 2]], [[[5, 1, 1, 2]], null]],
    hint: "answer[i] = (product of everything to the left) × (product of everything to the right).", approach: "One pass left to right storing prefix products, one pass right to left multiplying by a running suffix product. O(n) time, O(1) extra space besides the output.",
    sol: "function productExceptSelf(nums) {\n  const n = nums.length, out = Array(n).fill(1);\n  let p = 1; for (let i = 0; i < n; i++) { out[i] = p; p *= nums[i]; }\n  p = 1; for (let i = n - 1; i >= 0; i--) { out[i] *= p; p *= nums[i]; }\n  return out.map((x) => x + 0);\n}" }));
  P("lc-subarray-sum-k", "Subarray Sum Equals K", 2, "lc.prefix", Object.assign(st("subarraySum", "subarray_sum", "nums, k"), {
    desc: "Count the contiguous subarrays whose sum equals <code>k</code>. Values may be negative.<br><br><b>Example:</b> nums = [1, 1, 1], k = 2 → 2",
    tests: [[[[1, 1, 1], 2], 2], [[[1, 2, 3], 3], 2], [[[1, -1, 0], 0], 3], [[[3, 4, 7, 2, -3, 1, 4, 2], 7], 4], [[[5], 5], 1]],
    hint: "sum(i..j) = prefix[j+1] − prefix[i]. Count earlier prefixes equal to (current − k).", approach: "Running prefix sum plus a hash map of prefix → count, seeded with {0: 1}. O(n).",
    sol: "function subarraySum(nums, k) {\n  const c = new Map([[0, 1]]); let pre = 0, ans = 0;\n  for (const x of nums) { pre += x; ans += c.get(pre - k) || 0; c.set(pre, (c.get(pre) || 0) + 1); }\n  return ans;\n}" }));
  P("lc-3sum", "3Sum", 2, "lc.twoptr", Object.assign(st("threeSum", "three_sum", "nums"), {
    desc: "Return all unique triplets [a, b, c] from nums with a + b + c = 0. Order doesn't matter.<br><br><b>Example:</b> [-1, 0, 1, 2, -1, -4] → [[-1, -1, 2], [-1, 0, 1]]", cmp: "set2",
    tests: [[[[-1, 0, 1, 2, -1, -4]], [[-1, -1, 2], [-1, 0, 1]]], [[[0, 1, 1]], []], [[[0, 0, 0]], [[0, 0, 0]]], [[[0, 0, 0, 0]], [[0, 0, 0]]], [[[-2, 0, 1, 1, 2, -1, -4, 3]], null]],
    hint: "Sort. Fix the first element, then use two pointers on the rest. Skip equal values to avoid duplicates.", approach: "Sort (O(n log n)); for each i, two pointers on i+1..n−1, skipping duplicates at every level. O(n²).",
    sol: "function threeSum(nums) {\n  const a = nums.slice().sort((x, y) => x - y), out = [];\n  for (let i = 0; i < a.length - 2; i++) {\n    if (i && a[i] === a[i - 1]) continue;\n    let l = i + 1, r = a.length - 1;\n    while (l < r) { const s = a[i] + a[l] + a[r];\n      if (s === 0) { out.push([a[i], a[l], a[r]]); l++; r--; while (l < r && a[l] === a[l - 1]) l++; }\n      else if (s < 0) l++; else r--; }\n  }\n  return out;\n}" }));
  P("lc-container-water", "Container With Most Water", 2, "lc.twoptr", Object.assign(st("maxArea", "max_area", "height"), {
    desc: "Lines of the given heights stand at x = 0, 1, 2, …. Pick two that, with the x-axis, hold the most water. Return that area.<br><br><b>Example:</b> [1, 8, 6, 2, 5, 4, 8, 3, 7] → 49",
    tests: [[[[1, 8, 6, 2, 5, 4, 8, 3, 7]], 49], [[[1, 1]], 1], [[[4, 3, 2, 1, 4]], 16], [[[1, 2, 1]], 2], [[[2, 3, 10, 5, 7, 8, 9]], null]],
    hint: "Start with the widest container. Which wall should move inward?", approach: "Two pointers at the ends; record the area; move the shorter wall (moving the taller can't help). O(n).",
    sol: "function maxArea(h) {\n  let l = 0, r = h.length - 1, best = 0;\n  while (l < r) { best = Math.max(best, Math.min(h[l], h[r]) * (r - l)); if (h[l] < h[r]) l++; else r--; }\n  return best;\n}" }));
  P("lc-min-window", "Minimum Window Substring", 3, "lc.window", Object.assign(st("minWindow", "min_window", "s, t"), {
    desc: "Return the shortest substring of <code>s</code> containing every character of <code>t</code> (with multiplicity), or \"\" if none exists. The answer is unique in the tests.<br><br><b>Example:</b> s = \"ADOBECODEBANC\", t = \"ABC\" → \"BANC\"",
    tests: [[["ADOBECODEBANC", "ABC"], "BANC"], [["a", "a"], "a"], [["a", "aa"], ""], [["aaflslflsldkalskaaa", "aaa"], "aaa"], [["cabwefgewcwaefgcf", "cae"], "cwae"]],
    hint: "Expand right until the window covers t, then shrink from the left while it still covers t, recording the best.", approach: "Counts needed from t, a 'missing' counter, and a variable window. Each index enters and leaves once: O(|s| + |t|).",
    sol: "function minWindow(s, t) {\n  if (!t) return '';\n  const need = {}; for (const c of t) need[c] = (need[c] || 0) + 1;\n  let missing = t.length, l = 0, bs = 0, bl = Infinity;\n  for (let r = 0; r < s.length; r++) {\n    if (need[s[r]] > 0) missing--; need[s[r]] = (need[s[r]] || 0) - 1;\n    while (missing === 0) {\n      if (r - l + 1 < bl) { bl = r - l + 1; bs = l; }\n      need[s[l]]++; if (need[s[l]] > 0) missing++; l++;\n    }\n  }\n  return bl === Infinity ? '' : s.slice(bs, bs + bl);\n}" }));
  P("lc-daily-temps", "Daily Temperatures", 2, "lc.stack", Object.assign(st("dailyTemperatures", "daily_temperatures", "temps"), {
    desc: "For each day, return how many days you'd wait for a warmer temperature (0 if never).<br><br><b>Example:</b> [73, 74, 75, 71, 69, 72, 76, 73] → [1, 1, 4, 2, 1, 1, 0, 0]",
    tests: [[[[73, 74, 75, 71, 69, 72, 76, 73]], [1, 1, 4, 2, 1, 1, 0, 0]], [[[30, 40, 50, 60]], [1, 1, 1, 0]], [[[30, 60, 90]], [1, 1, 0]], [[[50, 40, 30]], [0, 0, 0]], [[[55, 38, 53, 81, 61, 93, 97, 32, 43, 78]], null]],
    hint: "Keep a stack of days still waiting for a warmer one.", approach: "Monotonic decreasing stack of indexes: when a warmer day arrives, pop and record i − popped. O(n).",
    sol: "function dailyTemperatures(t) {\n  const res = Array(t.length).fill(0), st = [];\n  for (let i = 0; i < t.length; i++) { while (st.length && t[st[st.length - 1]] < t[i]) { const j = st.pop(); res[j] = i - j; } st.push(i); }\n  return res;\n}" }));
  P("lc-search-rotated", "Search in Rotated Sorted Array", 2, "lc.bsearch", Object.assign(st("search", "search", "nums, target"), {
    desc: "A sorted array of distinct values was rotated at an unknown pivot. Return the index of <code>target</code>, or -1, in O(log n).<br><br><b>Example:</b> nums = [4, 5, 6, 7, 0, 1, 2], target = 0 → 4",
    tests: [[[[4, 5, 6, 7, 0, 1, 2], 0], 4], [[[4, 5, 6, 7, 0, 1, 2], 3], -1], [[[1], 0], -1], [[[1, 3], 3], 1], [[[5, 1, 3], 5], 0], [[[6, 7, 8, 1, 2, 3, 4, 5], 8], 2]],
    hint: "At every mid, one half is sorted. Is the target inside that sorted half?", approach: "Binary search; decide which half is sorted by comparing nums[lo] with nums[mid], then check whether target lies in that range. O(log n).",
    sol: "function search(nums, target) {\n  let lo = 0, hi = nums.length - 1;\n  while (lo <= hi) {\n    const mid = (lo + hi) >> 1; if (nums[mid] === target) return mid;\n    if (nums[lo] <= nums[mid]) { if (nums[lo] <= target && target < nums[mid]) hi = mid - 1; else lo = mid + 1; }\n    else { if (nums[mid] < target && target <= nums[hi]) lo = mid + 1; else hi = mid - 1; }\n  }\n  return -1;\n}" }));
  P("lc-koko", "Koko Eating Bananas", 2, "lc.bsearch", Object.assign(st("minEatingSpeed", "min_eating_speed", "piles, h"), {
    desc: "Koko eats at speed k bananas per hour, finishing one pile before starting the next (a pile smaller than k still takes a full hour). Return the minimum k that finishes all piles within h hours.<br><br><b>Example:</b> piles = [3, 6, 7, 11], h = 8 → 4",
    tests: [[[[3, 6, 7, 11], 8], 4], [[[30, 11, 23, 4, 20], 5], 30], [[[30, 11, 23, 4, 20], 6], 23], [[[1000000000], 2], 500000000], [[[312884470], 968709470], 1]],
    hint: "If speed k works, every faster speed works too. Binary search on k.", approach: "Search k in [1, max(piles)]; hours(k) = Σ ceil(p / k). Find the smallest k with hours ≤ h. O(n log max).",
    sol: "function minEatingSpeed(piles, h) {\n  let lo = 1, hi = Math.max(...piles);\n  while (lo < hi) { const k = Math.floor((lo + hi) / 2); let t = 0; for (const p of piles) t += Math.ceil(p / k); if (t <= h) hi = k; else lo = k + 1; }\n  return lo;\n}" }));
  P("lc-kth-largest", "Kth Largest Element in an Array", 2, "lc.heap", Object.assign(st("findKthLargest", "find_kth_largest", "nums, k"), {
    desc: "Return the k-th largest element (in sorted order, not the k-th distinct). Aim for better than sorting everything.<br><br><b>Example:</b> nums = [3, 2, 1, 5, 6, 4], k = 2 → 5",
    tests: [[[[3, 2, 1, 5, 6, 4], 2], 5], [[[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], 4], [[[1], 1], 1], [[[7, 7, 7], 2], 7], [[[-1, -5, 3, 9, 0], 5], -5]],
    hint: "Keep a min-heap of the k largest seen so far. (Python: heapq. JavaScript has no built-in heap, so sorting or quickselect is fine there.)", approach: "Size-k min-heap: O(n log k). Quickselect averages O(n).",
    sol: "function findKthLargest(nums, k) {\n  return nums.slice().sort((a, b) => b - a)[k - 1];\n}" }));
  P("lc-merge-k-sorted", "Merge K Sorted Lists", 3, "lc.heap", Object.assign(st("mergeKLists", "merge_k_lists", "lists"), {
    desc: "Merge k sorted arrays into one sorted array. (On LeetCode they're linked lists; the heap idea is the same.)<br><br><b>Example:</b> [[1, 4, 5], [1, 3, 4], [2, 6]] → [1, 1, 2, 3, 4, 4, 5, 6]",
    tests: [[[[[1, 4, 5], [1, 3, 4], [2, 6]]], [1, 1, 2, 3, 4, 4, 5, 6]], [[[]], []], [[[[]]], []], [[[[5], [], [1, 2]]], [1, 2, 5]], [[[[-3, 0, 9], [-5, 2], [7, 8, 10, 11]]], null]],
    hint: "Keep one candidate per list in a min-heap; pop the smallest and push the next element from its list.", approach: "Heap of (value, list index, element index): O(N log k) for N total elements.",
    sol: "function mergeKLists(lists) {\n  return [].concat(...lists).sort((a, b) => a - b);\n}" }));
  P("lc-course-schedule", "Course Schedule", 2, "lc.graphadv", Object.assign(st("canFinish", "can_finish", "numCourses, prerequisites"), {
    desc: "There are numCourses courses (0..n−1). Each pair [a, b] means you must take b before a. Can you finish all courses?<br><br><b>Example:</b> numCourses = 2, prerequisites = [[1, 0], [0, 1]] → false",
    tests: [[[2, [[1, 0]]], true], [[2, [[1, 0], [0, 1]]], false], [[5, [[1, 0], [2, 1], [3, 1], [4, 3], [2, 4]]], true], [[3, [[0, 1], [1, 2], [2, 0]]], false], [[1, []], true]],
    hint: "This is cycle detection in a directed graph. Kahn's algorithm: repeatedly take courses with no remaining prerequisites.", approach: "Build adjacency and in-degrees; BFS from in-degree-0 nodes; you can finish iff every node is processed. O(V + E).",
    sol: "function canFinish(n, pre) {\n  const adj = Array.from({ length: n }, () => []), ind = Array(n).fill(0);\n  for (const [a, b] of pre) { adj[b].push(a); ind[a]++; }\n  const q = []; for (let i = 0; i < n; i++) if (!ind[i]) q.push(i);\n  let seen = 0; while (q.length) { const v = q.shift(); seen++; for (const w of adj[v]) if (--ind[w] === 0) q.push(w); }\n  return seen === n;\n}" }));
  P("lc-redundant-connection", "Redundant Connection", 2, "lc.graphadv", Object.assign(st("findRedundantConnection", "find_redundant_connection", "edges"), {
    desc: "A tree of nodes 1..n had one extra edge added. Return the edge that can be removed to leave a tree; if several work, return the one that appears last in the input.<br><br><b>Example:</b> [[1, 2], [1, 3], [2, 3]] → [2, 3]",
    tests: [[[[[1, 2], [1, 3], [2, 3]]], [2, 3]], [[[[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]], [1, 4]], [[[[1, 4], [3, 4], [1, 3], [1, 2], [4, 5]]], [1, 3]], [[[[2, 3], [1, 2], [1, 3]]], null]],
    hint: "Process edges in order with union-find. The first edge whose endpoints are already connected closes the cycle.", approach: "Union-find with path compression; return the edge where find(a) == find(b). Nearly O(n).",
    sol: "function findRedundantConnection(edges) {\n  const p = Array(edges.length + 1).fill(0).map((_, i) => i);\n  const find = (x) => { while (p[x] !== x) { p[x] = p[p[x]]; x = p[x]; } return x; };\n  for (const [a, b] of edges) { const ra = find(a), rb = find(b); if (ra === rb) return [a, b]; p[ra] = rb; }\n  return [];\n}" }));
  P("lc-rotting-oranges", "Rotting Oranges", 2, "lc.graphs", Object.assign(st("orangesRotting", "oranges_rotting", "grid"), {
    desc: "In a grid, 0 = empty, 1 = fresh orange, 2 = rotten. Each minute, fresh oranges next to a rotten one (up/down/left/right) rot. Return the minutes until none are fresh, or -1 if impossible.<br><br><b>Example:</b> [[2,1,1],[1,1,0],[0,1,1]] → 4",
    tests: [[[[[2, 1, 1], [1, 1, 0], [0, 1, 1]]], 4], [[[[2, 1, 1], [0, 1, 1], [1, 0, 1]]], -1], [[[[0, 2]]], 0], [[[[1]]], -1], [[[[2, 1, 0, 2], [1, 0, 1, 1], [1, 1, 1, 1]]], null]],
    hint: "Start a BFS from every rotten orange at the same time. Each BFS level is one minute.", approach: "Multi-source BFS counting fresh oranges; process level by level. O(rows × cols).",
    sol: "function orangesRotting(g) {\n  const R = g.length, C = g[0].length, q = []; let fresh = 0;\n  g = g.map((r) => r.slice());\n  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { if (g[r][c] === 2) q.push([r, c]); else if (g[r][c] === 1) fresh++; }\n  let t = 0;\n  while (q.length && fresh) { const n = q.length; for (let i = 0; i < n; i++) { const [r, c] = q.shift(); for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) { const a = r + dr, b = c + dc; if (a >= 0 && b >= 0 && a < R && b < C && g[a][b] === 1) { g[a][b] = 2; fresh--; q.push([a, b]); } } } t++; }\n  return fresh ? -1 : t;\n}" }));
  P("lc-word-break", "Word Break", 2, "lc.dp1", Object.assign(st("wordBreak", "word_break", "s, wordDict"), {
    desc: "Can <code>s</code> be split into a sequence of dictionary words (words may be reused)?<br><br><b>Example:</b> s = \"leetcode\", wordDict = [\"leet\", \"code\"] → true",
    tests: [[["leetcode", ["leet", "code"]], true], [["applepenapple", ["apple", "pen"]], true], [["catsandog", ["cats", "dog", "sand", "and", "cat"]], false], [["aaaaaaab", ["a", "aa", "aaa"]], false], [["", ["a"]], true]],
    hint: "dp[i] = can the first i characters be segmented?", approach: "dp[0] = true; dp[i] = any dp[j] and s[j:i] in the word set. O(n² ) substring checks (or O(n · maxWordLength)).",
    sol: "function wordBreak(s, dict) {\n  const W = new Set(dict), dp = Array(s.length + 1).fill(false); dp[0] = true;\n  for (let i = 1; i <= s.length; i++) for (let j = 0; j < i; j++) if (dp[j] && W.has(s.slice(j, i))) { dp[i] = true; break; }\n  return dp[s.length];\n}" }));
  P("lc-lis", "Longest Increasing Subsequence", 2, "lc.dp1", Object.assign(st("lengthOfLIS", "length_of_lis", "nums"), {
    desc: "Return the length of the longest strictly increasing subsequence. O(n²) is fine; O(n log n) is the follow-up.<br><br><b>Example:</b> [10, 9, 2, 5, 3, 7, 101, 18] → 4 (2, 3, 7, 101)",
    tests: [[[[10, 9, 2, 5, 3, 7, 101, 18]], 4], [[[0, 1, 0, 3, 2, 3]], 4], [[[7, 7, 7, 7]], 1], [[[5]], 1], [[[3, 10, 2, 1, 20, 4, 6, 7]], null]],
    hint: "O(n²): dp[i] = 1 + max dp[j] for j < i with nums[j] < nums[i]. O(n log n): keep the smallest tail for each length and binary-search where each number goes.", approach: "Patience-sorting tails array with bisect_left: O(n log n).",
    sol: "function lengthOfLIS(nums) {\n  const tails = [];\n  for (const x of nums) { let lo = 0, hi = tails.length; while (lo < hi) { const m = (lo + hi) >> 1; if (tails[m] < x) lo = m + 1; else hi = m; } tails[lo] = x; }\n  return tails.length;\n}" }));
  P("lc-edit-distance", "Edit Distance", 3, "lc.dp2", Object.assign(st("minDistance", "min_distance", "word1, word2"), {
    desc: "Return the minimum number of insertions, deletions and replacements to turn word1 into word2.<br><br><b>Example:</b> \"horse\" → \"ros\": 3",
    tests: [[["horse", "ros"], 3], [["intention", "execution"], 5], [["", "abc"], 3], [["abc", "abc"], 0], [["kitten", "sitting"], 3]],
    hint: "dp[i][j] = distance between the first i letters of word1 and the first j of word2.", approach: "Base row/column = i or j; on a match take the diagonal, else 1 + min(left, up, diagonal). O(m·n).",
    sol: "function minDistance(a, b) {\n  const m = a.length, n = b.length, dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));\n  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);\n  return dp[m][n];\n}" }));
  P("lc-combination-sum", "Combination Sum", 2, "lc.backtrack", Object.assign(st("combinationSum", "combination_sum", "candidates, target"), {
    desc: "Return all unique combinations of distinct <code>candidates</code> that sum to <code>target</code>; each number may be used any number of times. Order doesn't matter.<br><br><b>Example:</b> candidates = [2, 3, 6, 7], target = 7 → [[2, 2, 3], [7]]", cmp: "set2",
    tests: [[[[2, 3, 6, 7], 7], [[2, 2, 3], [7]]], [[[2, 3, 5], 8], [[2, 2, 2, 2], [2, 3, 3], [3, 5]]], [[[2], 1], []], [[[3, 4, 5], 9], null]],
    hint: "Backtrack with a start index so combinations come out in non-decreasing order; recurse with the same index to allow reuse.", approach: "Sort, then DFS(start, remaining): try candidates[i] for i ≥ start, stop when it exceeds the remainder.",
    sol: "function combinationSum(c, target) {\n  const a = c.slice().sort((x, y) => x - y), out = [], path = [];\n  const dfs = (s, rem) => { if (rem === 0) { out.push(path.slice()); return; } for (let i = s; i < a.length && a[i] <= rem; i++) { path.push(a[i]); dfs(i, rem - a[i]); path.pop(); } };\n  dfs(0, target); return out;\n}" }));
  P("lc-permutations", "Permutations", 2, "lc.backtrack", Object.assign(st("permute", "permute", "nums"), {
    desc: "Return all permutations of a list of distinct integers, in any order.<br><br><b>Example:</b> [1, 2, 3] → [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]", cmp: "set",
    tests: [[[[1, 2, 3]], [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]], [[[0, 1]], [[0, 1], [1, 0]]], [[[1]], [[1]]], [[[4, 5, 6, 7]], null]],
    hint: "Backtrack: at each position try every number not used yet.", approach: "DFS with a used array; n! results, each of length n.",
    sol: "function permute(nums) {\n  const out = [], path = [], used = nums.map(() => false);\n  const dfs = () => { if (path.length === nums.length) { out.push(path.slice()); return; } nums.forEach((x, i) => { if (used[i]) return; used[i] = true; path.push(x); dfs(); path.pop(); used[i] = false; }); };\n  dfs(); return out;\n}" }));
  P("lc-jump-game", "Jump Game", 2, "lc.greedy", Object.assign(st("canJump", "can_jump", "nums"), {
    desc: "Each element is the maximum jump length from that index. Starting at index 0, can you reach the last index?<br><br><b>Example:</b> [2, 3, 1, 1, 4] → true; [3, 2, 1, 0, 4] → false",
    tests: [[[[2, 3, 1, 1, 4]], true], [[[3, 2, 1, 0, 4]], false], [[[0]], true], [[[2, 0, 0]], true], [[[1, 0, 1, 0]], false]],
    hint: "Track the farthest index you can reach so far.", approach: "Greedy: if i ever exceeds the reach, fail; otherwise reach = max(reach, i + nums[i]). O(n).",
    sol: "function canJump(nums) {\n  let reach = 0;\n  for (let i = 0; i < nums.length; i++) { if (i > reach) return false; reach = Math.max(reach, i + nums[i]); }\n  return true;\n}" }));
  P("lc-non-overlapping", "Non-overlapping Intervals", 2, "lc.intervals", Object.assign(st("eraseOverlapIntervals", "erase_overlap_intervals", "intervals"), {
    desc: "Return the minimum number of intervals to remove so the rest don't overlap. Intervals that only touch ([1,2] and [2,3]) don't overlap.<br><br><b>Example:</b> [[1,2],[2,3],[3,4],[1,3]] → 1",
    tests: [[[[[1, 2], [2, 3], [3, 4], [1, 3]]], 1], [[[[1, 2], [1, 2], [1, 2]]], 2], [[[[1, 2], [2, 3]]], 0], [[[[-52, 31], [-73, -26], [82, 97], [-65, -11], [-62, -49], [95, 99], [58, 95], [-31, 49], [66, 98], [-63, 2], [30, 47], [-40, -26]]], 7]],
    hint: "Sort by end time and greedily keep the interval that finishes first.", approach: "Count how many you can keep with the earliest-end greedy; answer = n − kept. O(n log n).",
    sol: "function eraseOverlapIntervals(iv) {\n  const a = iv.slice().sort((x, y) => x[1] - y[1]); let end = -Infinity, kept = 0;\n  for (const [s, e] of a) if (s >= end) { kept++; end = e; }\n  return a.length - kept;\n}" }));
  P("lc-single-number", "Single Number", 1, "lc.bits", Object.assign(st("singleNumber", "single_number", "nums"), {
    desc: "Every element appears twice except one. Find it in O(n) time and O(1) extra space.<br><br><b>Example:</b> [4, 1, 2, 1, 2] → 4",
    tests: [[[[2, 2, 1]], 1], [[[4, 1, 2, 1, 2]], 4], [[[1]], 1], [[[-3, 7, 7]], -3]],
    hint: "x ^ x = 0 and x ^ 0 = x.", approach: "XOR every element; pairs cancel out. O(n), O(1).",
    sol: "function singleNumber(nums) {\n  return nums.reduce((a, b) => a ^ b, 0);\n}" }));
  P("lc-tree-depth", "Maximum Depth of a Binary Tree", 1, "lc.trees", Object.assign(st("maxDepth", "max_depth", "root"), {
    desc: "A tree is given as nested lists <code>[value, left, right]</code>, with <code>null</code> (Python <code>None</code>) for a missing child. Return its maximum depth (number of nodes on the longest root-to-leaf path).<br><br><b>Example:</b> [3, [9, null, null], [20, [15, null, null], [7, null, null]]] → 3",
    tests: [[[[3, [9, null, null], [20, [15, null, null], [7, null, null]]]], 3], [[null], 0], [[[1, null, [2, null, null]]], 2], [[[1, [2, [3, [4, null, null], null], null], null]], 4]],
    hint: "Depth of a node = 1 + the larger of its children's depths. An empty tree has depth 0.", approach: "Post-order recursion, O(n) time, O(h) stack.",
    sol: "function maxDepth(root) {\n  return root ? 1 + Math.max(maxDepth(root[1]), maxDepth(root[2])) : 0;\n}" }));
  P("lc-tree-diameter", "Diameter of a Binary Tree", 2, "lc.trees", Object.assign(st("diameter", "diameter", "root"), {
    desc: "Same nested-list format as Maximum Depth. Return the number of <b>edges</b> on the longest path between any two nodes (it need not pass through the root).<br><br><b>Example:</b> [1, [2, [4, null, null], [5, null, null]], [3, null, null]] → 3 (4 → 2 → 1 → 3)",
    tests: [[[[1, [2, [4, null, null], [5, null, null]], [3, null, null]]], 3], [[[1, [2, null, null], null]], 1], [[[1, null, null]], 0], [[[1, [2, [3, [4, null, null], null], [5, null, [6, null, null]]], [7, null, null]]], 4]],
    hint: "Return height from the recursion, and update a global best with left height + right height at every node.", approach: "One post-order DFS: O(n).",
    sol: "function diameter(root) {\n  let best = 0;\n  const h = (n) => { if (!n) return 0; const l = h(n[1]), r = h(n[2]); best = Math.max(best, l + r); return 1 + Math.max(l, r); };\n  h(root); return best;\n}" }));
  P("lc-prefix-count", "Count Words With a Prefix", 2, "lc.trie", Object.assign(st("countPrefixes", "count_prefixes", "words, prefixes"), {
    desc: "For each query prefix, return how many of the words start with it. Imagine many queries: a trie that stores a count at every node answers each in O(prefix length).<br><br><b>Example:</b> words = [\"apple\", \"app\", \"ape\", \"bat\"], prefixes = [\"ap\", \"app\", \"b\", \"c\"] → [3, 2, 1, 0]",
    tests: [[[["apple", "app", "ape", "bat"], ["ap", "app", "b", "c"]], [3, 2, 1, 0]], [[["a"], ["", "a", "aa"]], [1, 1, 0]], [[["car", "card", "cart", "cat", "dog"], ["car", "ca", "d", "cats"]], [3, 4, 1, 0]]],
    hint: "Insert every word into a trie, incrementing a counter on each node you pass.", approach: "Building is O(total letters); each query walks its prefix and reads the node's counter.",
    sol: "function countPrefixes(words, prefixes) {\n  const root = { c: 0, k: {} };\n  for (const w of words) { let n = root; n.c++; for (const ch of w) { n = n.k[ch] || (n.k[ch] = { c: 0, k: {} }); n.c++; } }\n  return prefixes.map((p) => { let n = root; for (const ch of p) { n = n.k[ch]; if (!n) return 0; } return n.c; });\n}" }));

  /* HackerRank-style: the whole input arrives as one string, and you return exactly what you'd print */
  P("oa-range-sums", "HackerRank-style: Range Sum Queries", 2, "lc.oa", Object.assign(st("solve", "solve", "inputText"), {
    desc: "<b>Online-assessment format.</b> Your function receives the raw input as one string and must return the exact output text (what you'd print to stdout).<br><br>Line 1: n and q. Line 2: n integers. Next q lines: l r (0-based, inclusive). Output the sum of a[l..r] for each query, one per line. n, q ≤ 2·10⁵, so each query must be O(1).<br><br><b>Example input:</b><pre>5 3\n4 -2 7 1 3\n0 2\n1 3\n4 4</pre><b>Output:</b><pre>9\n6\n3</pre>",
    tests: [[["5 3\n4 -2 7 1 3\n0 2\n1 3\n4 4\n"], "9\n6\n3"], [["1 1\n42\n0 0"], "42"], [["4 2\n1 2 3 4\n0 3\n2 2\n"], "10\n3"], [["6 3\n1000000000 1000000000 1000000000 -5 0 7\n0 2\n3 5\n0 5\n"], null]],
    hint: "Split the whole input on whitespace and walk through the tokens. Build prefix sums once.", approach: "Tokenize, build P, answer each query with P[r + 1] − P[l], join with newlines. O(n + q).",
    sol: "function solve(inputText) {\n  const t = inputText.trim().split(/\\s+/).map(Number); let k = 0;\n  const n = t[k++], q = t[k++], P = [0];\n  for (let i = 0; i < n; i++) P.push(P[i] + t[k++]);\n  const out = []; for (let i = 0; i < q; i++) { const l = t[k++], r = t[k++]; out.push(P[r + 1] - P[l]); }\n  return out.join('\\n');\n}" }));
  P("oa-balanced", "HackerRank-style: Balanced Brackets", 1, "lc.oa", Object.assign(st("solve", "solve", "inputText"), {
    desc: "<b>Online-assessment format.</b> The first line is t, followed by t bracket strings using ()[]{}, one per line. Return YES or NO for each, one per line.<br><br><b>Example input:</b><pre>3\n{[()]}\n{[(])}\n{{[[(())]]}}</pre><b>Output:</b><pre>YES\nNO\nYES</pre>",
    tests: [[["3\n{[()]}\n{[(])}\n{{[[(())]]}}\n"], "YES\nNO\nYES"], [["2\n(\n)(\n"], "NO\nNO"], [["1\n[]{}()\n"], "YES"], [["4\n((\n([]){}\n}\n{[}]\n"], "NO\nYES\nNO\nNO"]],
    hint: "Read the count from the first line, then process the next t lines with a stack.", approach: "Classic stack matching per line; collect YES/NO and join with newlines. O(total length).",
    sol: "function solve(inputText) {\n  const lines = inputText.split('\\n').map((s) => s.trim()), t = +lines[0], pair = { ')': '(', ']': '[', '}': '{' }, out = [];\n  for (let i = 1; i <= t; i++) { const st = []; let ok = true; for (const c of lines[i] || '') { if (pair[c]) { if (st.pop() !== pair[c]) { ok = false; break; } } else st.push(c); } out.push(ok && !st.length ? 'YES' : 'NO'); }\n  return out.join('\\n');\n}" }));
})();
