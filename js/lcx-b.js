/* LeetCode program units 5 to 9 (binary search, stacks, linked lists, trees, heaps): a "Code it" and a "Say it" session each. */
(function () {
  const { Q, L, SAY, CODE, CH } = GR.ivKit;

  /* shared helpers handed to the learner in the starter and repeated in the solution */
  const LIST_JS = `class ListNode {
  constructor(val, next = null) { this.val = val; this.next = next; }
}
function fromArray(a) { let head = null; for (let i = a.length - 1; i >= 0; i--) head = new ListNode(a[i], head); return head; }
function toArray(head) { const out = []; for (let n = head; n; n = n.next) out.push(n.val); return out; }
`;
  const LIST_PY = `class ListNode:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

def from_array(a):
    head = None
    for v in reversed(a):
        head = ListNode(v, head)
    return head

def to_array(head):
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out
`;
  const TREE_JS = `class TreeNode {
  constructor(val) { this.val = val; this.left = null; this.right = null; }
}
function buildTree(a) {
  if (!a.length || a[0] === null) return null;
  const root = new TreeNode(a[0]), q = [root];
  let i = 1;
  while (q.length && i < a.length) {
    const n = q.shift();
    if (i < a.length && a[i] !== null) { n.left = new TreeNode(a[i]); q.push(n.left); }
    i++;
    if (i < a.length && a[i] !== null) { n.right = new TreeNode(a[i]); q.push(n.right); }
    i++;
  }
  return root;
}
`;
  const TREE_PY = `class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def build_tree(a):
    if not a or a[0] is None:
        return None
    root = TreeNode(a[0])
    q = [root]
    i = 1
    while q and i < len(a):
        n = q.pop(0)
        if i < len(a) and a[i] is not None:
            n.left = TreeNode(a[i])
            q.append(n.left)
        i += 1
        if i < len(a) and a[i] is not None:
            n.right = TreeNode(a[i])
            q.append(n.right)
        i += 1
    return root
`;
  const HEAP_JS = `class Heap {
  constructor(less) { this.a = []; this.less = less; }
  get size() { return this.a.length; }
  peek() { return this.a[0]; }
  push(x) {
    const a = this.a; a.push(x);
    let i = a.length - 1;
    while (i > 0) { const p = (i - 1) >> 1; if (!this.less(a[i], a[p])) break; [a[i], a[p]] = [a[p], a[i]]; i = p; }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last; let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1; let m = i;
        if (l < a.length && this.less(a[l], a[m])) m = l;
        if (r < a.length && this.less(a[r], a[m])) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]]; i = m;
      }
    }
    return top;
  }
}
`;

  /* ============================== 5: Binary search ============================== */
  GR.courseAddLessons("lc", 5, [
    L("Code it: binary search in four forms", "lc.bsearch", [
      CODE(`<p>Given a sorted array <code>nums</code> (ascending, duplicates allowed) and a <code>target</code>, return the index of the <b>first element that is greater than or equal to</b> the target. If every element is smaller, return <code>nums.length</code>.</p><p>Example: nums = [1, 3, 5, 7], target = 4 gives 2, because 5 is the first value that is at least 4. This is the building block behind insert-position and range questions. Aim for O(log n).</p>`, {
        js: ["lowerBound", `function lowerBound(nums, target) {\n  // your code here\n}\n`, `function lowerBound(nums, target) {\n  let lo = 0, hi = nums.length;\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (nums[mid] < target) lo = mid + 1;\n    else hi = mid;\n  }\n  return lo;\n}`],
        py: ["lower_bound", `def lower_bound(nums, target):\n    # your code here\n    pass\n`, `def lower_bound(nums, target):\n    lo, hi = 0, len(nums)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid\n    return lo\n`]
      }, [[[[1, 3, 5, 7], 5], 2], [[[1, 3, 5, 7], 4], 2], [[[1, 3, 5, 7], 0], 0], [[[1, 3, 5, 7], 8], 4], [[[], 3], 0], [[[2, 2, 2, 2], 2], 0], [[[2, 2, 2, 2], 3], 4], [[[1, 2, 4, 4, 4, 9], 4], 2], [[[5], 5], 0]], "exact",
      "Keep a half-open window [lo, hi). If the middle value is too small, the answer lies strictly to its right (lo = mid + 1); otherwise the middle could itself be the answer (hi = mid). When the window is empty, lo is the answer. O(log n) time, O(1) space."),

      CODE(`<p>Given an ascending array <code>nums</code> that may contain duplicates, return <code>[first, last]</code>: the first and last index where <code>target</code> appears. If it never appears, return <code>[-1, -1]</code>.</p><p>Example: nums = [5, 7, 7, 8, 8, 10], target = 8 gives [3, 4]. A linear scan is too slow for the intended O(log n) answer.</p>`, {
        js: ["searchRange", `function searchRange(nums, target) {\n  // your code here\n}\n`, `function searchRange(nums, target) {\n  const bound = (x) => {\n    let lo = 0, hi = nums.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (nums[mid] < x) lo = mid + 1;\n      else hi = mid;\n    }\n    return lo;\n  };\n  const first = bound(target);\n  if (first === nums.length || nums[first] !== target) return [-1, -1];\n  return [first, bound(target + 1) - 1];\n}`],
        py: ["search_range", `def search_range(nums, target):\n    # your code here\n    pass\n`, `def search_range(nums, target):\n    def bound(x):\n        lo, hi = 0, len(nums)\n        while lo < hi:\n            mid = (lo + hi) // 2\n            if nums[mid] < x:\n                lo = mid + 1\n            else:\n                hi = mid\n        return lo\n    first = bound(target)\n    if first == len(nums) or nums[first] != target:\n        return [-1, -1]\n    return [first, bound(target + 1) - 1]\n`]
      }, [[[[5, 7, 7, 8, 8, 10], 8], [3, 4]], [[[5, 7, 7, 8, 8, 10], 6], [-1, -1]], [[[], 0], [-1, -1]], [[[1], 1], [0, 0]], [[[2, 2, 2], 2], [0, 2]], [[[1, 2, 3], 3], [2, 2]], [[[1, 2, 3], 1], [0, 0]], [[[1, 1, 2, 3, 3, 3], 3], [3, 5]], [[[1, 3], 2], [-1, -1]]], "exact",
      "Run the lower-bound search twice: once for the target (first position) and once for target + 1 (one past the last position). Check the first position actually holds the target. Two O(log n) searches, O(1) space."),

      CODE(`<p>An array <code>nums</code> of distinct-neighbor integers rises strictly to a single peak and then falls strictly (the rising part or the falling part may be empty). Return the index of the peak value.</p><p>Example: [1, 3, 5, 4, 2] gives 2. The array is not sorted, yet you can still halve the search space each step. Aim for O(log n).</p>`, {
        js: ["peakIndex", `function peakIndex(nums) {\n  // your code here\n}\n`, `function peakIndex(nums) {\n  let lo = 0, hi = nums.length - 1;\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (nums[mid] < nums[mid + 1]) lo = mid + 1;\n    else hi = mid;\n  }\n  return lo;\n}`],
        py: ["peak_index", `def peak_index(nums):\n    # your code here\n    pass\n`, `def peak_index(nums):\n    lo, hi = 0, len(nums) - 1\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if nums[mid] < nums[mid + 1]:\n            lo = mid + 1\n        else:\n            hi = mid\n    return lo\n`]
      }, [[[[0, 2, 1, 0]], 1], [[[1, 3, 5, 4, 2]], 2], [[[0, 10, 5, 2]], 1], [[[3, 4, 5, 1]], 2], [[[1, 2, 3, 9]], 3], [[[9, 5, 1]], 0], [[[7]], 0], [[[1, 5, 4]], 1], [[[2, 4, 6, 8, 10, 9, 3, 1]], 4]], "exact",
      "Compare the middle with its right neighbor. If it is smaller, you are on the rising slope and the peak is to the right; otherwise the middle is the peak or the peak lies to its left. The window always contains the peak. O(log n) time, O(1) space."),

      CODE(`<p>Packages with weights <code>weights</code> must be shipped in the given order, and each day the ship carries a consecutive group whose total weight is at most its capacity. Return the smallest capacity that gets everything shipped within <code>days</code> days.</p><p>Example: weights = [7, 2, 5, 10, 8], days = 2 gives 18 (groups [7, 2, 5] and [10, 8]). Searching over the answer, not over an array, is the key idea.</p>`, {
        js: ["minShipCapacity", `function minShipCapacity(weights, days) {\n  // your code here\n}\n`, `function minShipCapacity(weights, days) {\n  const fits = (cap) => {\n    let used = 1, load = 0;\n    for (const w of weights) {\n      if (load + w > cap) { used++; load = 0; }\n      load += w;\n    }\n    return used <= days;\n  };\n  let lo = Math.max(...weights), hi = weights.reduce((a, b) => a + b, 0);\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (fits(mid)) hi = mid;\n    else lo = mid + 1;\n  }\n  return lo;\n}`],
        py: ["min_ship_capacity", `def min_ship_capacity(weights, days):\n    # your code here\n    pass\n`, `def min_ship_capacity(weights, days):\n    def fits(cap):\n        used, load = 1, 0\n        for w in weights:\n            if load + w > cap:\n                used += 1\n                load = 0\n            load += w\n        return used <= days\n    lo, hi = max(weights), sum(weights)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if fits(mid):\n            hi = mid\n        else:\n            lo = mid + 1\n    return lo\n`]
      }, [[[[7, 2, 5, 10, 8], 2], 18], [[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5], 15], [[[3, 2, 2, 4, 1, 4], 3], 6], [[[1, 2, 3, 1, 1], 4], 3], [[[5], 1], 5], [[[4, 4, 4], 3], 4], [[[4, 4, 4], 1], 12], [[[1, 2, 3, 4, 5], 2], 9]], "exact",
      "A capacity works exactly when a greedy pass needs at most `days` groups, and if c works then every larger capacity works, so feasibility is monotonic. Binary search between the heaviest package and the total weight. O(n log S) time where S is the total weight, O(1) space.")
    ], "problem"),

    L("Say it: binary search out loud", "lc.bsearch", [
      SAY("Walk me through how you would find the first element that is at least a target in a sorted array, and give the complexity.",
        "<p>I keep a half-open window from <code>lo = 0</code> to <code>hi = n</code>. Each step I look at the middle. If the middle value is smaller than the target, the answer must be to its right, so <code>lo = mid + 1</code>. Otherwise the middle might be the answer, so I keep it with <code>hi = mid</code>. When <code>lo == hi</code> the window is empty and that index is the answer, which can be <code>n</code> if everything is smaller.</p><p>Each step halves the window, so it is O(log n) time and O(1) space.</p>",
        ["States the window and what lo and hi mean", "Explains why one branch uses mid + 1 and the other keeps mid", "Says the result can be n when every element is smaller", "Gives O(log n) time and O(1) space"]),
      SAY("In the peak-in-a-mountain problem the array is not sorted. Why is binary search still correct?",
        "<p>Binary search only needs a yes or no question that splits the range so one side can be thrown away safely. Here the question is whether <code>nums[mid] &lt; nums[mid + 1]</code>. If true, we are on the rising slope, and everything up to mid is smaller than a later value, so the peak must be to the right. If false, we are on the peak or the falling slope, so the peak is at mid or to its left.</p><p>The window always contains the peak, so the loop ends on it. The structure matters, not full sortedness.</p>",
        ["Names the comparison with the right neighbor", "Explains what each outcome says about where the peak is", "States the invariant that the peak stays inside the window", "Connects it to the idea that a monotonic yes/no split is all you need"]),
      SAY("What edge cases would you test for a search that returns the first and last position of a target?",
        "<p>Empty array. A single element that matches and one that does not. The target smaller than everything and larger than everything. A target that sits between two values but is not present. All elements equal to the target, so first is 0 and last is n minus 1. The target at the very start and at the very end. Long runs of duplicates, to confirm the search does not stop at the first hit.</p><p>I would also check that my second search for target + 1 cannot read past the end of the array.</p>",
        ["Covers empty and single-element inputs", "Covers target absent, both below and above the range", "Covers all-equal arrays and duplicates at the ends", "Mentions an out-of-bounds risk in the implementation"]),
      SAY("How do you recognize a problem that wants binary search on the answer? Use minimum ship capacity as your example and state the complexity.",
        "<p>I look for a question of the form smallest value that works, where I can write a fast check that says whether a given value works, and where working is monotonic: if capacity c is enough, any larger capacity is too. Ship capacity fits. The check is a greedy pass that counts how many days the packages need at capacity c.</p><p>The answer lies between the heaviest single package and the total weight. I binary search that range, calling the check at each middle. With n packages and total weight S, that is O(n log S) time and O(1) extra space.</p>",
        ["Identifies the smallest-value-that-works shape", "Explains the monotonic feasibility check", "Gives sensible lower and upper bounds for the search", "States O(n log S) time"]),
      ...CH(
        Q("You write <code>lo = 0, hi = n</code> with <code>while (lo &lt; hi)</code> instead of <code>hi = n - 1</code> with <code>lo &lt;= hi</code>. When is the first form the better fit?",
          ["When the answer may be position n itself, such as an insertion point past the last element", "When the array is sorted in descending order and the midpoint must round up", "When you want to avoid integer overflow when computing the midpoint", "When duplicates exist, because the half-open window skips repeated values"],
          "Reaching n is only possible if hi can equal n; the closed form cannot represent that answer without a special case."),
        Q("With the half-open window, how do you move the bounds to find the first index whose value is at least target?",
          ["If nums[mid] &lt; target then lo = mid + 1, otherwise hi = mid", "If nums[mid] &lt; target then lo = mid, otherwise hi = mid - 1", "If nums[mid] &lt;= target then lo = mid + 1, otherwise hi = mid", "If nums[mid] &gt; target then hi = mid - 1, otherwise lo = mid + 1"],
          "A too-small middle is ruled out, so skip past it; a big-enough middle might still be the first, so keep it. The third option finds the first element strictly greater instead."),
        Q("A variant sets <code>lo = mid</code> and <code>hi = mid - 1</code>-style updates and hangs on [1, 2] with target 2. What is the cause?",
          ["mid rounds down, so with two elements it equals lo and the window never shrinks", "The array has an even length, which binary search cannot handle", "The target is the last element, which a loop never reaches", "The comparison should use equality, which would end the loop early"],
          "If lo = mid and mid == lo, nothing changes. Use mid + 1 for the left bound, or round the midpoint up when you must keep lo = mid.")),
      ...CH(
        Q("Which problem is a good fit for binary search on the answer?",
          ["Smallest speed that finishes a job in time, where a faster speed always also works", "Largest sum of any contiguous block, where every block must be checked once", "Count the distinct values in an unsorted array of integers", "Find the median of a stream while values keep arriving"],
          "You need a monotonic yes/no check over a range of candidate answers."),
        Q("For minimum ship capacity, what bounds do you search between?",
          ["The heaviest single package up to the total weight of all packages", "1 up to the number of days allowed for shipping", "0 up to the heaviest single package in the list", "The average package weight up to the total weight"],
          "Capacity below the heaviest package can never carry it; the total weight always works in one day."),
        Q("With n packages and total weight S, what is the running time of the whole solution?",
          ["O(n log S): about log S feasibility checks, each a pass over n packages", "O(n log n): sorting the packages dominates the work", "O(S log n): each candidate is tested against every weight value", "O(n * S): every capacity from small to large is tried in order"],
          "The search range has size about S, so it takes log S steps, each costing O(n)."))
    ], "drill")
  ]);

  /* ============================== 6: Stacks ============================== */
  GR.courseAddLessons("lc", 6, [
    L("Code it: stacks at work", "lc.stack", [
      CODE(`<p>Given a lowercase string <code>s</code>, repeatedly delete any two adjacent equal characters until none remain, then return the result.</p><p>Example: "abbaca" becomes "aaca" (remove "bb") and then "ca" (remove "aa"), so the answer is "ca". Deleting one pair can create a new adjacent pair, so a single left-to-right pass needs the right bookkeeping.</p>`, {
        js: ["removeAdjacentDuplicates", `function removeAdjacentDuplicates(s) {\n  // your code here\n}\n`, `function removeAdjacentDuplicates(s) {\n  const st = [];\n  for (const ch of s) {\n    if (st.length && st[st.length - 1] === ch) st.pop();\n    else st.push(ch);\n  }\n  return st.join("");\n}`],
        py: ["remove_adjacent_duplicates", `def remove_adjacent_duplicates(s):\n    # your code here\n    pass\n`, `def remove_adjacent_duplicates(s):\n    st = []\n    for ch in s:\n        if st and st[-1] == ch:\n            st.pop()\n        else:\n            st.append(ch)\n    return "".join(st)\n`]
      }, [[["abbaca"], "ca"], [["azxxzy"], "ay"], [[""], ""], [["aa"], ""], [["abc"], "abc"], [["abba"], ""], [["aaa"], "a"], [["aabccba"], "a"], [["mississippi"], "m"]], "exact",
      "The stack holds the characters kept so far, so its top is always the character a new one would touch. A match cancels the top; otherwise push. A removal naturally exposes the next candidate. O(n) time, O(n) space."),

      CODE(`<p>Evaluate an arithmetic expression written in Reverse Polish Notation. <code>tokens</code> is an array of strings; each is either an integer (possibly negative, such as "-11") or one of the operators "+", "-", "*", "/". Division truncates toward zero. Return the integer result. Inputs are always valid.</p><p>Example: ["2", "1", "+", "3", "*"] gives 9, since (2 + 1) * 3 = 9.</p>`, {
        js: ["evalRPN", `function evalRPN(tokens) {\n  // your code here\n}\n`, `function evalRPN(tokens) {\n  const st = [];\n  for (const t of tokens) {\n    if (t === "+" || t === "-" || t === "*" || t === "/") {\n      const b = st.pop(), a = st.pop();\n      if (t === "+") st.push(a + b);\n      else if (t === "-") st.push(a - b);\n      else if (t === "*") st.push(a * b);\n      else st.push(Math.trunc(a / b) + 0);\n    } else st.push(Number(t));\n  }\n  return st[0];\n}`],
        py: ["eval_rpn", `def eval_rpn(tokens):\n    # your code here\n    pass\n`, `def eval_rpn(tokens):\n    st = []\n    for t in tokens:\n        if t in ("+", "-", "*", "/"):\n            b = st.pop()\n            a = st.pop()\n            if t == "+":\n                st.append(a + b)\n            elif t == "-":\n                st.append(a - b)\n            elif t == "*":\n                st.append(a * b)\n            else:\n                st.append(int(a / b))\n        else:\n            st.append(int(t))\n    return st[0]\n`]
      }, [[[["2", "1", "+", "3", "*"]], 9], [[["4", "13", "5", "/", "+"]], 6], [[["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]], 22], [[["7"]], 7], [[["3", "-4", "/"]], 0], [[["-7", "2", "/"]], -3], [[["5", "1", "2", "+", "4", "*", "+", "3", "-"]], 14], [[["2", "3", "-"]], -1]], "exact",
      "Push numbers; on an operator pop the right operand first, then the left, apply it, and push the result. Truncate division toward zero rather than flooring. One pass, O(n) time, O(n) space."),

      CODE(`<p>A string <code>s</code> is encoded as <code>k[chunk]</code>, meaning the chunk repeats k times. Chunks can contain plain letters and further encoded pieces, nested to any depth. Decode and return the full string. Counts can have several digits, and the input is always well formed.</p><p>Example: "3[a2[c]]" decodes to "accaccacc", since the inner 2[c] is "cc", the chunk is "acc", and it repeats three times.</p>`, {
        js: ["decodeString", `function decodeString(s) {\n  // your code here\n}\n`, `function decodeString(s) {\n  const st = [];\n  let cur = "", num = 0;\n  for (const ch of s) {\n    if (ch >= "0" && ch <= "9") num = num * 10 + Number(ch);\n    else if (ch === "[") { st.push([cur, num]); cur = ""; num = 0; }\n    else if (ch === "]") { const [prev, k] = st.pop(); cur = prev + cur.repeat(k); }\n    else cur += ch;\n  }\n  return cur;\n}`],
        py: ["decode_string", `def decode_string(s):\n    # your code here\n    pass\n`, `def decode_string(s):\n    st = []\n    cur, num = "", 0\n    for ch in s:\n        if ch.isdigit():\n            num = num * 10 + int(ch)\n        elif ch == "[":\n            st.append((cur, num))\n            cur, num = "", 0\n        elif ch == "]":\n            prev, k = st.pop()\n            cur = prev + cur * k\n        else:\n            cur += ch\n    return cur\n`]
      }, [[["3[a]2[bc]"], "aaabcbc"], [["3[a2[c]]"], "accaccacc"], [["2[abc]3[cd]ef"], "abcabccdcdcdef"], [["abc"], "abc"], [[""], ""], [["10[a]"], "aaaaaaaaaa"], [["2[2[2[x]]]"], "xxxxxxxx"], [["a2[b]c"], "abbc"]], "exact",
      "On '[' save the text built so far and the pending count, then start fresh; on ']' pop them and append the current chunk repeated count times to the saved text. Time is proportional to the output length, space to the nesting depth plus the output."),

      CODE(`<p>Given an array <code>heights</code> of non-negative bar heights (each bar has width 1) forming a histogram, return the area of the largest rectangle that fits entirely inside the bars.</p><p>Example: [2, 1, 5, 6, 2, 3] gives 10 (the bars of height 5 and 6 form a 5 by 2 rectangle). Checking every pair of bars is O(n²); a stack gets it to O(n).</p>`, {
        js: ["largestRectangle", `function largestRectangle(heights) {\n  // your code here\n}\n`, `function largestRectangle(heights) {\n  const st = [];\n  let best = 0;\n  for (let i = 0; i <= heights.length; i++) {\n    const h = i === heights.length ? 0 : heights[i];\n    while (st.length && heights[st[st.length - 1]] >= h) {\n      const height = heights[st.pop()];\n      const left = st.length ? st[st.length - 1] : -1;\n      best = Math.max(best, height * (i - left - 1));\n    }\n    st.push(i);\n  }\n  return best;\n}`],
        py: ["largest_rectangle", `def largest_rectangle(heights):\n    # your code here\n    pass\n`, `def largest_rectangle(heights):\n    st = []\n    best = 0\n    n = len(heights)\n    for i in range(n + 1):\n        h = 0 if i == n else heights[i]\n        while st and heights[st[-1]] >= h:\n            height = heights[st.pop()]\n            left = st[-1] if st else -1\n            best = max(best, height * (i - left - 1))\n        st.append(i)\n    return best\n`]
      }, [[[[2, 1, 5, 6, 2, 3]], 10], [[[2, 4]], 4], [[[1]], 1], [[[5, 5, 5, 5]], 20], [[[6, 5, 4, 3, 2, 1]], 12], [[[1, 2, 3, 4, 5]], 9], [[[0, 0]], 0], [[[2, 1, 2]], 3], [[[]], 0], [[[3, 6, 5, 7, 4, 8, 1, 0]], 20]], "exact",
      "Keep a stack of indices with increasing heights. When a shorter bar arrives, each taller bar on top can no longer extend right, so pop it and compute its rectangle: its height times the span between the new top of the stack and the current index. A sentinel height of 0 at the end flushes the stack. Every index is pushed and popped once: O(n) time, O(n) space.")
    ], "problem"),

    L("Say it: stacks out loud", "lc.stack", [
      SAY("Walk me through evaluating a Reverse Polish expression with a stack. What is the complexity and what is the common mistake?",
        "<p>I scan the tokens left to right. A number goes on the stack. An operator pops two values, applies the operation, and pushes the result back. At the end the stack holds the single answer.</p><p>The classic mistake is the pop order. The first pop is the right operand and the second is the left, which only matters for minus and divide. The other trap is division: the problem says truncate toward zero, so in Python I use <code>int(a / b)</code> rather than floor division. It is O(n) time and O(n) space.</p>",
        ["Describes pushing numbers and reducing on operators", "Calls out right operand popped first", "Mentions truncation versus floor division", "Gives O(n) time and space"]),
      SAY("Explain the monotonic stack solution to the largest rectangle in a histogram, and why it is correct.",
        "<p>I keep a stack of indices whose bar heights are increasing. When a new bar is shorter than the one on top, the top bar cannot extend any further to the right, so I pop it and finalize its best rectangle. Its height is that bar, its right edge is just before the current index, and its left edge is just after the new top of the stack, because everything between was at least as tall.</p><p>It is correct because every bar is popped exactly once, at the moment its right limit is discovered, and its left limit is already encoded by the stack. A final zero-height sentinel flushes whatever remains. Each index is pushed and popped once, so it is O(n).</p>",
        ["Explains why bars on the stack have increasing heights", "Says a pop happens when a shorter bar shows the right limit", "Explains how the left limit comes from the stack", "Argues O(n) because each index enters and leaves once"]),
      SAY("What edge cases would you test for a decode-string function like 3[a2[c]]?",
        "<p>A string with no brackets at all. The empty string. A count with more than one digit, like 10[a]. Deep nesting such as 2[2[2[x]]]. Letters before, between, and after bracket groups, such as a2[b]c. Two groups side by side. A count of 1. I would also think about output size, because small input can expand to something huge, which affects memory.</p>",
        ["Covers no brackets and empty input", "Covers multi-digit counts", "Covers nested and adjacent groups with surrounding letters", "Mentions that the output can be much larger than the input"]),
      SAY("For decoding nested strings, compare the stack approach with recursion. When would you pick each?",
        "<p>Both follow the same structure: a bracket opens a sub-problem and its close returns a result to the caller. With an explicit stack I push the text built so far and the repeat count at each open bracket and restore them at the close. With recursion the call stack does that bookkeeping and the code reads closer to the grammar.</p><p>I would use the explicit stack when the nesting can be very deep, because recursion might overflow the call stack, and recursion when I want the clearest code for a shallow structure. The time is the same, proportional to the output length.</p>",
        ["Names what is saved at an open bracket", "Notes recursion hides the same bookkeeping in the call stack", "Gives the depth and overflow trade-off", "States the time cost is tied to the output length"]),
      ...CH(
        Q("Why does a stack suit removing adjacent duplicate characters?",
          ["A removal exposes a new neighbor, and the latest kept character is always the top of the stack", "The stack sorts the characters, so equal ones end up next to each other", "It lets you remember every character ever seen so repeats can be counted", "Pushing and popping is faster than reading the string by index"],
          "Cancelling a pair can create a new adjacent pair; the most recent survivor is exactly the stack top."),
        Q("In the histogram solution, when do you pop a bar and compute its area?",
          ["When the incoming bar is shorter, since that bar can no longer extend to the right", "When the incoming bar is taller, since it can now extend farther to the right", "When the stack grows past the number of bars already processed", "When the incoming bar has exactly the same height as the top bar"],
          "A shorter bar caps the rectangle of any taller bars waiting on the stack."),
        Q("The histogram code has a while loop inside a for loop. Why is it still O(n) overall?",
          ["Each index is pushed once and popped at most once, so total pops are at most n", "The inner loop never runs more than twice for each outer iteration", "The stack never holds more than a constant number of bars at once", "Bars that are popped are skipped by later iterations of the outer loop"],
          "Count total work over the whole run: n pushes plus at most n pops.")),
      ...CH(
        Q("In Reverse Polish evaluation you reach the token minus with 2 and 3 on the stack (3 on top). What happens?",
          ["Pop 3 as the right operand, then 2 as the left, and push 2 - 3 = -1", "Pop 2 as the right operand, then 3 as the left, and push 3 - 2 = 1", "Pop both and push their absolute difference, which is 1", "Leave the stack unchanged until the end of the expression"],
          "The most recently pushed value is the right-hand operand of the operator."),
        Q("Truncating division toward zero is required. What does Python give for -7 and 2?",
          ["<code>-7 // 2</code> is -4, so use <code>int(-7 / 2)</code> to get -3", "<code>-7 // 2</code> is -3, so floor division is already correct", "<code>-7 / 2</code> is -4.0, which must then be rounded up", "<code>-7 // 2</code> is -3.5, which truncates cleanly to -3"],
          "Floor division rounds toward negative infinity; int() on the true quotient truncates toward zero."),
        Q("In decode-string, what do you do when you read an opening bracket?",
          ["Push the text built so far and the pending count, then reset both", "Push only the count and keep appending letters to the same text", "Pop the last count and repeat the text built so far", "Start a new empty stack and discard the previous one"],
          "You need the outer text and repeat count later, when the matching close bracket arrives."))
    ], "drill")
  ]);

  /* ============================== 7: Linked lists ============================== */
  GR.courseAddLessons("lc", 7, [
    L("Code it: linked list moves", "lc.linked", [
      CODE(`<p>A singly linked list is passed to you as a plain array of its node values, head first. Reverse the list and return the reversed values as an array.</p><p>Example: [1, 2, 3, 4, 5] gives [5, 4, 3, 2, 1]. The starter includes <code>ListNode</code>, <code>fromArray</code> and <code>toArray</code> helpers so you can build real nodes, rewire the <code>next</code> pointers, and convert back. Do the reversal in place by relinking, in O(1) extra space.</p>`, {
        js: ["reverseList", `${LIST_JS}\nfunction reverseList(values) {\n  const head = fromArray(values);\n  // reverse the nodes, then return toArray(newHead)\n}\n`, `${LIST_JS}\nfunction reverseList(values) {\n  let prev = null, cur = fromArray(values);\n  while (cur) {\n    const next = cur.next;\n    cur.next = prev;\n    prev = cur;\n    cur = next;\n  }\n  return toArray(prev);\n}`],
        py: ["reverse_list", `${LIST_PY}\ndef reverse_list(values):\n    head = from_array(values)\n    # reverse the nodes, then return to_array(new_head)\n    pass\n`, `${LIST_PY}\ndef reverse_list(values):\n    prev, cur = None, from_array(values)\n    while cur:\n        nxt = cur.next\n        cur.next = prev\n        prev = cur\n        cur = nxt\n    return to_array(prev)\n`]
      }, [[[[1, 2, 3, 4, 5]], [5, 4, 3, 2, 1]], [[[]], []], [[[7]], [7]], [[[1, 2]], [2, 1]], [[[3, 3, 1]], [1, 3, 3]], [[[0, -1, 5]], [5, -1, 0]], [[[9, 8, 7, 6]], [6, 7, 8, 9]]], "exact",
      "Walk the list with three references: previous, current, and the saved next. At each node save next, point current backwards at previous, then step both forward. When current falls off the end, previous is the new head. O(n) time, O(1) space."),

      CODE(`<p>A linked list is given as an array of node values (head first), along with an integer <code>n</code>. Remove the n-th node counted from the end (n = 1 is the last node) and return the remaining values as an array. n is always between 1 and the list length.</p><p>Example: [1, 2, 3, 4, 5] with n = 2 gives [1, 2, 3, 5]. Try to do it in a single pass over the nodes. The starter includes <code>ListNode</code>, <code>fromArray</code> and <code>toArray</code>.</p>`, {
        js: ["removeNthFromEnd", `${LIST_JS}\nfunction removeNthFromEnd(values, n) {\n  const head = fromArray(values);\n  // remove the node, then return toArray(newHead)\n}\n`, `${LIST_JS}\nfunction removeNthFromEnd(values, n) {\n  const dummy = new ListNode(0, fromArray(values));\n  let fast = dummy, slow = dummy;\n  for (let i = 0; i < n; i++) fast = fast.next;\n  while (fast.next) { fast = fast.next; slow = slow.next; }\n  slow.next = slow.next.next;\n  return toArray(dummy.next);\n}`],
        py: ["remove_nth_from_end", `${LIST_PY}\ndef remove_nth_from_end(values, n):\n    head = from_array(values)\n    # remove the node, then return to_array(new_head)\n    pass\n`, `${LIST_PY}\ndef remove_nth_from_end(values, n):\n    dummy = ListNode(0, from_array(values))\n    fast = slow = dummy\n    for _ in range(n):\n        fast = fast.next\n    while fast.next:\n        fast = fast.next\n        slow = slow.next\n    slow.next = slow.next.next\n    return to_array(dummy.next)\n`]
      }, [[[[1, 2, 3, 4, 5], 2], [1, 2, 3, 5]], [[[1], 1], []], [[[1, 2], 1], [1]], [[[1, 2], 2], [2]], [[[5, 6, 7], 3], [6, 7]], [[[1, 2, 3], 1], [1, 2]], [[[4, 4, 4, 4], 2], [4, 4, 4]], [[[10, 20, 30, 40], 4], [20, 30, 40]]], "exact",
      "Put a dummy node before the head, send a fast pointer n steps ahead, then move fast and slow together until fast sits on the last node. Slow is now right before the target and can skip it. The dummy node handles removing the head with no special case. O(L) time in one pass, O(1) space."),

      CODE(`<p>Two non-negative integers are stored as linked lists of digits in <b>reverse order</b>: the head holds the ones digit, the next node the tens digit, and so on. They are passed as arrays, for example [2, 4, 3] means 342. Add the two numbers and return the sum in the same reversed-digit array form.</p><p>Example: [2, 4, 3] and [5, 6, 4] (342 + 465) gives [7, 0, 8] (807). The lists can have different lengths, and a final carry can add a new digit. The starter includes <code>ListNode</code>, <code>fromArray</code> and <code>toArray</code>.</p>`, {
        js: ["addTwoNumbers", `${LIST_JS}\nfunction addTwoNumbers(a, b) {\n  const l1 = fromArray(a), l2 = fromArray(b);\n  // build the sum list, then return toArray(sumHead)\n}\n`, `${LIST_JS}\nfunction addTwoNumbers(a, b) {\n  let p = fromArray(a), q = fromArray(b);\n  const dummy = new ListNode(0);\n  let tail = dummy, carry = 0;\n  while (p || q || carry) {\n    const sum = (p ? p.val : 0) + (q ? q.val : 0) + carry;\n    tail.next = new ListNode(sum % 10);\n    tail = tail.next;\n    carry = Math.floor(sum / 10);\n    p = p ? p.next : null;\n    q = q ? q.next : null;\n  }\n  return toArray(dummy.next);\n}`],
        py: ["add_two_numbers", `${LIST_PY}\ndef add_two_numbers(a, b):\n    l1, l2 = from_array(a), from_array(b)\n    # build the sum list, then return to_array(sum_head)\n    pass\n`, `${LIST_PY}\ndef add_two_numbers(a, b):\n    p, q = from_array(a), from_array(b)\n    dummy = ListNode(0)\n    tail = dummy\n    carry = 0\n    while p or q or carry:\n        total = (p.val if p else 0) + (q.val if q else 0) + carry\n        tail.next = ListNode(total % 10)\n        tail = tail.next\n        carry = total // 10\n        p = p.next if p else None\n        q = q.next if q else None\n    return to_array(dummy.next)\n`]
      }, [[[[2, 4, 3], [5, 6, 4]], [7, 0, 8]], [[[0], [0]], [0]], [[[9, 9, 9, 9], [1]], [0, 0, 0, 0, 1]], [[[5], [5]], [0, 1]], [[[1, 8], [0]], [1, 8]], [[[9, 9], [9, 9]], [8, 9, 1]], [[[2, 4], [5, 6, 4]], [7, 0, 5]], [[[1], [9, 9, 9]], [0, 0, 0, 1]]], "exact",
      "Because the ones digit comes first, you can add as you walk: digit from each list (zero when one has ended) plus the carry, keep sum mod 10, carry sum div 10. Keep looping while either list or the carry remains. A dummy head simplifies building the result. O(max(m, n)) time and space."),

      CODE(`<p>A linked list L0 → L1 → ... → Ln is given as an array of values (head first). Reorder it to L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → ... and return the new values as an array. You may not change the node values, only the links, and an O(1) extra space solution is the goal.</p><p>Example: [1, 2, 3, 4, 5] gives [1, 5, 2, 4, 3]. The starter includes <code>ListNode</code>, <code>fromArray</code> and <code>toArray</code>.</p>`, {
        js: ["reorderList", `${LIST_JS}\nfunction reorderList(values) {\n  const head = fromArray(values);\n  // rewire the nodes in place, then return toArray(head)\n}\n`, `${LIST_JS}\nfunction reorderList(values) {\n  const head = fromArray(values);\n  if (!head || !head.next) return toArray(head);\n  let slow = head, fast = head;\n  while (fast.next && fast.next.next) { slow = slow.next; fast = fast.next.next; }\n  let prev = null, cur = slow.next;\n  slow.next = null;\n  while (cur) { const nx = cur.next; cur.next = prev; prev = cur; cur = nx; }\n  let a = head, b = prev;\n  while (b) {\n    const an = a.next, bn = b.next;\n    a.next = b;\n    b.next = an;\n    a = an;\n    b = bn;\n  }\n  return toArray(head);\n}`],
        py: ["reorder_list", `${LIST_PY}\ndef reorder_list(values):\n    head = from_array(values)\n    # rewire the nodes in place, then return to_array(head)\n    pass\n`, `${LIST_PY}\ndef reorder_list(values):\n    head = from_array(values)\n    if not head or not head.next:\n        return to_array(head)\n    slow = fast = head\n    while fast.next and fast.next.next:\n        slow = slow.next\n        fast = fast.next.next\n    prev, cur = None, slow.next\n    slow.next = None\n    while cur:\n        nx = cur.next\n        cur.next = prev\n        prev = cur\n        cur = nx\n    a, b = head, prev\n    while b:\n        an, bn = a.next, b.next\n        a.next = b\n        b.next = an\n        a, b = an, bn\n    return to_array(head)\n`]
      }, [[[[1, 2, 3, 4]], [1, 4, 2, 3]], [[[1, 2, 3, 4, 5]], [1, 5, 2, 4, 3]], [[[1]], [1]], [[[1, 2]], [1, 2]], [[[1, 2, 3]], [1, 3, 2]], [[[]], []], [[[1, 2, 3, 4, 5, 6]], [1, 6, 2, 5, 3, 4]], [[[5, 4, 3, 2, 1, 0, 9]], [5, 9, 4, 0, 3, 1, 2]]], "exact",
      "Three classic moves in sequence: find the middle with slow and fast pointers, reverse the second half in place, then weave the two halves together one node at a time. Each step is a single pass, so O(n) time and O(1) space.")
    ], "problem"),

    L("Say it: linked lists out loud", "lc.linked", [
      SAY("Walk me through reversing a singly linked list in place. State the complexity and what can go wrong.",
        "<p>I use two references, <code>prev</code> starting at null and <code>cur</code> at the head. For each node I first save <code>cur.next</code>, because the next step overwrites it. Then I point <code>cur.next</code> back at <code>prev</code>, move <code>prev</code> to <code>cur</code>, and move <code>cur</code> to the saved next. When <code>cur</code> becomes null, <code>prev</code> is the new head.</p><p>It is O(n) time and O(1) space. The usual bug is overwriting <code>next</code> before saving it and losing the rest of the list. I would test the empty list, one node, and two nodes.</p>",
        ["Names prev, cur and the saved next", "Gives the order of the rewiring steps", "States O(n) time and O(1) space", "Mentions the lost-next bug and small test cases"]),
      SAY("How do you detect a cycle in a linked list, and why does the fast pointer always catch the slow one?",
        "<p>I run two pointers from the head. Slow moves one step and fast moves two. If there is no cycle, fast reaches the end and I return false. If there is a cycle, both end up inside it, and each step the gap between them, measured around the loop, shrinks by exactly one. A gap that shrinks by one each step must reach zero, so they meet and I return true.</p><p>It uses O(n) time and O(1) space, versus a hash set of visited nodes that also takes O(n) time but O(n) space.</p>",
        ["Describes slow and fast moving at different speeds", "Explains the gap inside the cycle shrinks by one per step", "Handles the no-cycle exit when fast hits null", "Compares with the visited-set approach on space"]),
      SAY("What edge cases would you test when adding two numbers stored as reversed digit lists?",
        "<p>Lists of different lengths. Both lists being just zero. A carry that survives past the last digit, like 9 9 plus 1, which must create a new node. A carry that ripples through every digit. One list being a single digit and the other long. Inputs with trailing zeros in the result, like 5 plus 5 giving 0 then 1. I would also confirm I never read next on a null pointer when one list ends first.</p>",
        ["Covers lists of different lengths", "Covers a final carry that creates a new digit", "Covers the zero plus zero case", "Mentions null handling when one list is shorter"]),
      SAY("Explain how to reorder a list as first, last, second, second-last, and so on, in O(1) extra space.",
        "<p>It is three well-known steps stitched together. First, find the middle with slow and fast pointers and cut the list there. Second, reverse the second half in place. Third, merge the two halves by alternating one node from the front half and one from the reversed half.</p><p>Each step is a single pass, so the total is O(n) time. Only a fixed number of pointers are used, so the extra space is O(1). I would test an odd length, an even length, and lists of one or two nodes, where the merge must not create a loop.</p>",
        ["Finds the middle with slow and fast pointers", "Reverses the second half in place", "Merges by alternating nodes", "States O(n) time and O(1) space with small test cases"]),
      ...CH(
        Q("In an iterative reversal, which sequence is correct inside the loop?",
          ["Save cur.next, point cur.next at prev, move prev to cur, move cur to the saved node", "Point cur.next at prev, save cur.next, move prev to cur, move cur forward", "Move cur forward, point prev.next at cur, then save cur.next for later", "Move prev to cur, point cur.next at prev, then read the saved next"],
          "The original next pointer must be saved before it is overwritten, or the rest of the list is lost."),
        Q("What is the space complexity of the iterative and the recursive reversal?",
          ["Iterative is O(1); recursive is O(n) because of the call stack", "Both are O(1) because no new nodes are allocated in either version", "Iterative is O(n) because of the saved pointers; recursive is O(1)", "Both are O(n) because every node is touched at least once"],
          "Recursion uses one stack frame per node, which can overflow on a long list."),
        Q("The interviewer asks you to reverse nodes in groups of k. What extra care does the loop need?",
          ["Confirm k nodes remain before reversing, then reconnect the previous group's tail to the new group head", "Reverse the whole list first and then split it into chunks of size k", "Copy the values into an array, reverse each group, and write them back", "Run the plain reversal k times in a row on the same list"],
          "A short last group stays as it is, and every reversed group must be linked back into the chain.")),
      ...CH(
        Q("How do you remove the n-th node from the end in a single pass?",
          ["Advance one pointer n nodes ahead, then move both until the lead reaches the last node", "Count the list length first, then walk to the node at length minus n", "Reverse the list, remove the n-th node, and reverse it back again", "Store every node in an array so the target can be indexed directly"],
          "The gap of n between the two pointers puts the trailing one right before the node to remove. The length-count approach works but takes two passes."),
        Q("Why add a dummy node in front of the head?",
          ["Removing or inserting at the head then needs no special case, because every node has a predecessor", "It makes the list circular, so the traversal never ends early", "It stores the length, which saves the first pass over the list", "It lets the fast pointer start one step ahead of the slow pointer"],
          "The dummy gives the real head a predecessor, so the same pointer update works everywhere."),
        Q("To check whether a list is a palindrome in O(1) space, what is the plan?",
          ["Find the middle, reverse the second half, compare both halves, and optionally restore it", "Push every value on a stack and compare it with the original list order", "Compare the head with the tail, then drop both ends and repeat the check", "Sort the values and check that the first and last halves match"],
          "Reversing half the list in place avoids the O(n) extra space of a stack or array."))
    ], "drill")
  ]);

  /* ============================== 8: Trees ============================== */
  GR.courseAddLessons("lc", 8, [
    L("Code it: tree walks", "lc.trees", [
      CODE(`<p>A binary tree is given as a level-order array: root first, then each node's left and right child, left to right, level by level, with <code>null</code> for a missing child (a missing node's own children are not listed). So [1, 2, 2, null, 3, null, 3] is a root 1 with two children 2, each having only a right child 3. An empty tree is [].</p><p>Return <code>true</code> if the tree is a mirror image of itself around its center. Example: [1, 2, 2, 3, 4, 4, 3] is symmetric. The starter includes a <code>buildTree</code> helper that returns the root node with <code>val</code>, <code>left</code> and <code>right</code> fields.</p>`, {
        js: ["isSymmetric", `${TREE_JS}\nfunction isSymmetric(tree) {\n  const root = buildTree(tree);\n  // your code here\n}\n`, `${TREE_JS}\nfunction isSymmetric(tree) {\n  const root = buildTree(tree);\n  const mirror = (a, b) => {\n    if (!a && !b) return true;\n    if (!a || !b || a.val !== b.val) return false;\n    return mirror(a.left, b.right) && mirror(a.right, b.left);\n  };\n  return root ? mirror(root.left, root.right) : true;\n}`],
        py: ["is_symmetric", `${TREE_PY}\ndef is_symmetric(tree):\n    root = build_tree(tree)\n    # your code here\n    pass\n`, `${TREE_PY}\ndef is_symmetric(tree):\n    root = build_tree(tree)\n    def mirror(a, b):\n        if not a and not b:\n            return True\n        if not a or not b or a.val != b.val:\n            return False\n        return mirror(a.left, b.right) and mirror(a.right, b.left)\n    return mirror(root.left, root.right) if root else True\n`]
      }, [[[[1, 2, 2, 3, 4, 4, 3]], true], [[[1, 2, 2, null, 3, null, 3]], false], [[[1]], true], [[[]], true], [[[1, 2, 3]], false], [[[1, 2, 2]], true], [[[1, 2, 2, null, 3, 3]], true], [[[1, 2, 2, 3, null, null, 3]], true], [[[1, 2, 2, 3, null, 3, null]], false]], "exact",
      "Compare two subtrees at once: the left child of one must mirror the right child of the other, and vice versa, with equal values at each pair. Two nulls match, one null does not. O(n) time, O(h) space for the recursion depth h."),

      CODE(`<p>A binary tree is given as a level-order array with <code>null</code> for missing children (the root first, then children left to right level by level; a missing node's own children are not listed). Imagine standing on the right side of the tree looking at it. Return the values you can see, from top to bottom: the rightmost node of each level.</p><p>Example: [1, 2, 3, null, 5, null, 4] gives [1, 3, 4]. An empty tree [] gives []. The starter includes a <code>buildTree</code> helper that returns the root node (<code>val</code>, <code>left</code>, <code>right</code>).</p>`, {
        js: ["rightSideView", `${TREE_JS}\nfunction rightSideView(tree) {\n  const root = buildTree(tree);\n  // your code here\n}\n`, `${TREE_JS}\nfunction rightSideView(tree) {\n  const root = buildTree(tree);\n  if (!root) return [];\n  const out = [];\n  let level = [root];\n  while (level.length) {\n    out.push(level[level.length - 1].val);\n    const next = [];\n    for (const n of level) {\n      if (n.left) next.push(n.left);\n      if (n.right) next.push(n.right);\n    }\n    level = next;\n  }\n  return out;\n}`],
        py: ["right_side_view", `${TREE_PY}\ndef right_side_view(tree):\n    root = build_tree(tree)\n    # your code here\n    pass\n`, `${TREE_PY}\ndef right_side_view(tree):\n    root = build_tree(tree)\n    if not root:\n        return []\n    out = []\n    level = [root]\n    while level:\n        out.append(level[-1].val)\n        nxt = []\n        for n in level:\n            if n.left:\n                nxt.append(n.left)\n            if n.right:\n                nxt.append(n.right)\n        level = nxt\n    return out\n`]
      }, [[[[1, 2, 3, null, 5, null, 4]], [1, 3, 4]], [[[1, null, 3]], [1, 3]], [[[]], []], [[[1]], [1]], [[[1, 2]], [1, 2]], [[[1, 2, 3, 4]], [1, 3, 4]], [[[1, 2, 3, 4, 5, 6, 7]], [1, 3, 7]], [[[5, 3, null, 2, null, 1]], [5, 3, 2, 1]]], "exact",
      "Process the tree one level at a time (breadth-first). The last node of each level is the one visible from the right. A depth-first walk that visits the right child first and records the first node seen at each depth also works. O(n) time, O(w) space for the widest level w."),

      CODE(`<p>A binary tree is given as a level-order array with <code>null</code> for missing children (root first, children left to right by level, a missing node's children not listed). Return <code>true</code> if it is a valid binary search tree: for every node, all values in its left subtree are strictly smaller and all values in its right subtree are strictly larger. An empty tree is valid.</p><p>Example: [5, 1, 4, null, null, 3, 6] is not valid, because 3 sits in the right subtree of 5. The starter includes a <code>buildTree</code> helper that returns the root node (<code>val</code>, <code>left</code>, <code>right</code>).</p>`, {
        js: ["isValidBST", `${TREE_JS}\nfunction isValidBST(tree) {\n  const root = buildTree(tree);\n  // your code here\n}\n`, `${TREE_JS}\nfunction isValidBST(tree) {\n  const root = buildTree(tree);\n  const ok = (n, lo, hi) => {\n    if (!n) return true;\n    if (n.val <= lo || n.val >= hi) return false;\n    return ok(n.left, lo, n.val) && ok(n.right, n.val, hi);\n  };\n  return ok(root, -Infinity, Infinity);\n}`],
        py: ["is_valid_bst", `${TREE_PY}\ndef is_valid_bst(tree):\n    root = build_tree(tree)\n    # your code here\n    pass\n`, `${TREE_PY}\ndef is_valid_bst(tree):\n    root = build_tree(tree)\n    def ok(n, lo, hi):\n        if not n:\n            return True\n        if n.val <= lo or n.val >= hi:\n            return False\n        return ok(n.left, lo, n.val) and ok(n.right, n.val, hi)\n    return ok(root, float("-inf"), float("inf"))\n`]
      }, [[[[2, 1, 3]], true], [[[5, 1, 4, null, null, 3, 6]], false], [[[1]], true], [[[]], true], [[[2, 2, 2]], false], [[[5, 4, 6, null, null, 3, 7]], false], [[[10, 5, 15, null, null, 6, 20]], false], [[[3, 1, 5, 0, 2, 4, 6]], true], [[[1, 1]], false]], "exact",
      "Passing a (low, high) window down the recursion enforces the rule against every ancestor, not just the parent. Going left tightens the upper bound to the node; going right tightens the lower bound. Checking an in-order walk for strictly increasing values is an equivalent alternative. O(n) time, O(h) space."),

      CODE(`<p>A binary tree is given as a level-order array with <code>null</code> for missing children (root first, then children left to right by level, a missing node's children not listed). Node values can be negative. A path is any sequence of connected nodes that goes through each node at most once; it does not need to pass through the root or end at a leaf, and it must contain at least one node. Return the largest possible sum of values along a path.</p><p>Example: [-10, 9, 20, null, null, 15, 7] gives 42 (the path 15, 20, 7). The starter includes a <code>buildTree</code> helper that returns the root node (<code>val</code>, <code>left</code>, <code>right</code>).</p>`, {
        js: ["maxPathSum", `${TREE_JS}\nfunction maxPathSum(tree) {\n  const root = buildTree(tree);\n  // your code here\n}\n`, `${TREE_JS}\nfunction maxPathSum(tree) {\n  const root = buildTree(tree);\n  let best = -Infinity;\n  const gain = (n) => {\n    if (!n) return 0;\n    const l = Math.max(0, gain(n.left)), r = Math.max(0, gain(n.right));\n    best = Math.max(best, n.val + l + r);\n    return n.val + Math.max(l, r);\n  };\n  gain(root);\n  return best;\n}`],
        py: ["max_path_sum", `${TREE_PY}\ndef max_path_sum(tree):\n    root = build_tree(tree)\n    # your code here\n    pass\n`, `${TREE_PY}\ndef max_path_sum(tree):\n    root = build_tree(tree)\n    best = [float("-inf")]\n    def gain(n):\n        if not n:\n            return 0\n        l = max(0, gain(n.left))\n        r = max(0, gain(n.right))\n        best[0] = max(best[0], n.val + l + r)\n        return n.val + max(l, r)\n    gain(root)\n    return best[0]\n`]
      }, [[[[1, 2, 3]], 6], [[[-10, 9, 20, null, null, 15, 7]], 42], [[[-3]], -3], [[[2, -1]], 2], [[[-1, -2, -3]], -1], [[[1, -2, 3]], 4], [[[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]], 48], [[[1]], 1], [[[-2, null, -3]], -2]], "exact",
      "For each node compute the best downward gain it can offer its parent: its value plus the better child gain, with negative gains clamped to zero. At the same moment, the best path that bends at this node is its value plus both clamped gains; keep the global maximum of that. O(n) time, O(h) space.")
    ], "problem"),

    L("Say it: trees out loud", "lc.trees", [
      SAY("Walk me through checking whether a binary tree is symmetric. What is the complexity?",
        "<p>A tree is symmetric if its left subtree is the mirror of its right subtree. I write a helper that takes two nodes. If both are null they match. If only one is null, or their values differ, they do not. Otherwise they mirror each other when the left child of the first mirrors the right child of the second, and the right child of the first mirrors the left child of the second.</p><p>I call the helper on the root's two children. Every node is visited once, so it is O(n) time, and the space is O(h) for the recursion, which is O(n) for a skewed tree and O(log n) for a balanced one.</p>",
        ["Defines a two-node helper", "Handles the null cases before comparing values", "Cross-pairs outer with outer and inner with inner children", "States O(n) time and O(h) space"]),
      SAY("Why does comparing each node only with its direct children not prove a tree is a valid binary search tree, and what do you do instead?",
        "<p>The rule is about whole subtrees, not just parents. A node deep in the right subtree must still be larger than every ancestor it descends from on the right. For example, a 3 placed under the 4 on the right side of a 5 passes the local check against 4, but breaks the rule against 5.</p><p>I pass down a window of allowed values. Going left, the current value becomes the new upper bound; going right, it becomes the new lower bound. Any node outside its window fails. An in-order traversal that must be strictly increasing is the alternative. Both are O(n) time and O(h) space.</p>",
        ["Gives a counterexample where only the child check passes", "Explains the rule applies to the whole subtree", "Describes the low and high bounds updating per direction", "Mentions the in-order strictly increasing alternative"]),
      SAY("Explain the maximum path sum problem. What does the recursion return, and what does it record?",
        "<p>A path may bend at one node, using a downward arm on each side. For each node I compute two things. What I return to the parent is the best downward gain: the node's value plus the better of its two child gains, where a negative child gain is treated as zero because I can just stop there. What I record in a global best is the best path that bends at this node: its value plus both clamped child gains.</p><p>The answer is the largest recorded value, which handles all-negative trees as well, since the node alone is always a candidate. It is O(n) time and O(h) space.</p>",
        ["Separates the value returned upward from the value recorded", "Clamps negative child gains to zero", "Notes the path may bend at a node using both arms", "Handles all-negative trees and states O(n) time"]),
      SAY("What test cases would you run on any tree function that takes a level-order array?",
        "<p>The empty tree. A single node. A completely skewed tree to the left and another to the right, which stress recursion depth. A perfect tree, where every level is full. A tree where one subtree is empty and the other deep. Negative values and duplicate values where they matter, such as for binary search trees. I would also include an asymmetric tree where a naive check on only the top levels would pass.</p>",
        ["Covers empty and single-node trees", "Covers skewed trees and the recursion depth concern", "Covers full or perfect trees", "Mentions negatives or duplicates where they change the answer"]),
      ...CH(
        Q("To get the right side view of a tree, which traversal fits most directly?",
          ["Level-order, taking the last node of each level", "Pre-order, taking the first node that is a right child", "In-order, keeping every node that has no right child", "Post-order, keeping the root of every subtree"],
          "Each level contributes exactly one visible node, and the last one on that level is the rightmost."),
        Q("What is the space cost of the level-order approach?",
          ["O(w), where w is the widest level, up to about n/2 for a complete tree", "O(1), since only the current node is ever kept in memory", "O(h), where h is the height, because only one path is held", "O(log n) in every case, since each level halves the nodes"],
          "The queue holds a whole level at once, and the bottom level of a full tree has about half of the nodes."),
        Q("A tree has 100,000 nodes in one long chain, and your recursive solution crashes. What is the cause and the fix?",
          ["Recursion depth reaches n and overflows the call stack; use an explicit stack or a queue", "The tree is too wide for the queue; switch to a depth-first walk", "Integer overflow in the node values; use a wider number type", "Memory for the nodes themselves is too large; build the tree lazily"],
          "A chain makes the height equal to n, so the recursion depth equals n.")),
      ...CH(
        Q("Why is checking each node only against its parent not enough to validate a binary search tree?",
          ["A deep node must also respect every ancestor, so bounds must be passed down", "Parents may hold duplicates, which the local check cannot detect", "The local check is too slow, needing quadratic time overall", "Children are not always stored in left-then-right order"],
          "A value can be fine next to its parent and still violate a rule set by a higher ancestor."),
        Q("What is the in-order alternative for validating a binary search tree?",
          ["Walk in order and require each value to be strictly greater than the previous one", "Walk in order and require the values to match a sorted copy of themselves, allowing ties", "Walk pre-order and require every parent to be smaller than its children", "Walk in order and require the first value to be the minimum of the tree"],
          "An in-order walk of a valid search tree yields strictly increasing values; equal neighbors mean duplicates, which break the rule."),
        Q("In maximum path sum, why is a child's negative gain replaced by zero?",
          ["The path can simply not extend into that child, which is always allowed", "A negative number cannot be added to a node value in the recursion", "Zero keeps the total non-negative, as the problem requires", "The child could be reached from the other side of the tree instead"],
          "Extending into a negative arm only lowers the sum, so skipping it is always at least as good."))
    ], "drill")
  ]);

  /* ============================== 9: Heaps ============================== */
  GR.courseAddLessons("lc", 9, [
    L("Code it: heaps in action", "lc.heap", [
      CODE(`<p>You have a pile of stones with positive integer weights in <code>stones</code>. Each round, take the two heaviest stones and smash them together. If they weigh the same, both are destroyed. Otherwise the lighter is destroyed and the heavier is replaced by a stone whose weight is the difference. Continue until at most one stone is left, and return its weight (0 if none remain).</p><p>Example: [2, 7, 4, 1, 8, 1] ends with a single stone of weight 1. JavaScript has no built-in heap, so the starter includes a small <code>Heap</code> class that takes a "goes first" comparison function. In Python use <code>heapq</code> with negated values.</p>`, {
        js: ["lastStoneWeight", `${HEAP_JS}\nfunction lastStoneWeight(stones) {\n  // e.g. const h = new Heap((a, b) => a > b); for a max-heap\n}\n`, `${HEAP_JS}\nfunction lastStoneWeight(stones) {\n  const h = new Heap((a, b) => a > b);\n  for (const s of stones) h.push(s);\n  while (h.size > 1) {\n    const a = h.pop(), b = h.pop();\n    if (a !== b) h.push(a - b);\n  }\n  return h.size ? h.peek() : 0;\n}`],
        py: ["last_stone_weight", `import heapq\n\ndef last_stone_weight(stones):\n    # heapq is a min-heap: store negated weights for a max-heap\n    pass\n`, `import heapq\n\ndef last_stone_weight(stones):\n    h = [-s for s in stones]\n    heapq.heapify(h)\n    while len(h) > 1:\n        a = -heapq.heappop(h)\n        b = -heapq.heappop(h)\n        if a != b:\n            heapq.heappush(h, -(a - b))\n    return -h[0] if h else 0\n`]
      }, [[[[2, 7, 4, 1, 8, 1]], 1], [[[1]], 1], [[[2, 2]], 0], [[[3, 7, 2]], 2], [[[]], 0], [[[10, 4, 2, 10]], 2], [[[5, 5, 5]], 5], [[[9, 3, 2, 10]], 0], [[[1, 2, 3, 4, 5]], 1]], "exact",
      "You repeatedly need the two largest items and then to insert a new one, which is exactly what a max-heap does in O(log n) each. At most n rounds of two pops and one push give O(n log n) time and O(n) space."),

      CODE(`<p>Given an integer array <code>nums</code> and an integer <code>k</code>, return the <code>k</code> values that appear most often. The answer may be returned in any order, and the input is built so the answer is unique (no ties at the cutoff). Aim for better than sorting all distinct values: O(n log k).</p><p>Example: nums = [1, 1, 1, 2, 2, 3], k = 2 gives [1, 2]. The starter includes a small <code>Heap</code> class (JavaScript) and <code>heapq</code> is imported for Python.</p>`, {
        js: ["topKFrequent", `${HEAP_JS}\nfunction topKFrequent(nums, k) {\n  // your code here\n}\n`, `${HEAP_JS}\nfunction topKFrequent(nums, k) {\n  const count = new Map();\n  for (const x of nums) count.set(x, (count.get(x) || 0) + 1);\n  const h = new Heap((a, b) => a[0] < b[0]);\n  for (const [x, c] of count) {\n    h.push([c, x]);\n    if (h.size > k) h.pop();\n  }\n  const out = [];\n  while (h.size) out.push(h.pop()[1]);\n  return out;\n}`],
        py: ["top_k_frequent", `import heapq\n\ndef top_k_frequent(nums, k):\n    # your code here\n    pass\n`, `import heapq\n\ndef top_k_frequent(nums, k):\n    count = {}\n    for x in nums:\n        count[x] = count.get(x, 0) + 1\n    h = []\n    for x, c in count.items():\n        heapq.heappush(h, (c, x))\n        if len(h) > k:\n            heapq.heappop(h)\n    return [x for c, x in h]\n`]
      }, [[[[1, 1, 1, 2, 2, 3], 2], [1, 2]], [[[1], 1], [1]], [[[4, 4, 4, 4, 5, 5, 5, 6, 6, 7], 3], [4, 5, 6]], [[[-1, -1, 2, 2, 2, 3], 1], [2]], [[[9, 8, 8, 7, 7, 7], 2], [7, 8]], [[[5, 5, 5, 5], 1], [5]], [[[1, 2, 3, 3, 2, 3], 2], [3, 2]], [[[0, 0, 0, -5, -5, 8], 2], [0, -5]]], "set",
      "Count occurrences, then keep a min-heap of size k keyed by count: when it grows past k, evict the least frequent. What remains are the k most frequent. O(n) to count plus O(m log k) for the heap, where m is the number of distinct values; O(m) space."),

      CODE(`<p>A CPU must run a list of unit-length <code>tasks</code>, each labeled with a letter (an array of one-character strings). It runs one task per time slot or sits idle. Two runs of the <b>same</b> label need at least <code>n</code> slots between them. Tasks can run in any order. Return the minimum number of slots needed to finish everything.</p><p>Example: tasks = ["A", "A", "A", "B", "B", "B"], n = 2 gives 8 (A B _ A B _ A B). The starter includes a small <code>Heap</code> class (JavaScript); use <code>heapq</code> and <code>collections.deque</code> in Python.</p>`, {
        js: ["leastInterval", `${HEAP_JS}\nfunction leastInterval(tasks, n) {\n  // your code here\n}\n`, `${HEAP_JS}\nfunction leastInterval(tasks, n) {\n  const count = new Map();\n  for (const t of tasks) count.set(t, (count.get(t) || 0) + 1);\n  const h = new Heap((a, b) => a > b);\n  for (const c of count.values()) h.push(c);\n  const wait = [];\n  let time = 0;\n  while (h.size || wait.length) {\n    time++;\n    if (h.size) {\n      const c = h.pop() - 1;\n      if (c > 0) wait.push([c, time + n]);\n    }\n    if (wait.length && wait[0][1] === time) h.push(wait.shift()[0]);\n  }\n  return time;\n}`],
        py: ["least_interval", `import heapq\nfrom collections import deque\n\ndef least_interval(tasks, n):\n    # your code here\n    pass\n`, `import heapq\nfrom collections import deque\n\ndef least_interval(tasks, n):\n    count = {}\n    for t in tasks:\n        count[t] = count.get(t, 0) + 1\n    h = [-c for c in count.values()]\n    heapq.heapify(h)\n    wait = deque()\n    time = 0\n    while h or wait:\n        time += 1\n        if h:\n            c = -heapq.heappop(h) - 1\n            if c > 0:\n                wait.append((c, time + n))\n        if wait and wait[0][1] == time:\n            heapq.heappush(h, -wait.popleft()[0])\n    return time\n`]
      }, [[[["A", "A", "A", "B", "B", "B"], 2], 8], [[["A", "A", "A", "B", "B", "B"], 0], 6], [[["A", "A", "A", "A", "A", "A", "B", "C", "D", "E", "F", "G"], 2], 16], [[["A"], 5], 1], [[["A", "A"], 3], 5], [[["A", "B", "C"], 2], 3], [[["A", "A", "B", "B"], 1], 4], [[["A", "A", "A", "B", "B", "C"], 1], 6], [[["A", "A", "A", "B"], 2], 7]], "exact",
      "Always run the task with the most copies left, because it is the hardest to space out. A max-heap holds ready counts, and a queue holds tasks cooling down with the slot at which they become ready again. If nothing is ready the slot is idle. O(T log k) time for T slots and k distinct labels, O(k) space."),

      CODE(`<p>Numbers arrive one at a time in the array <code>nums</code>. After each arrival, record the median of everything seen so far (the middle value, or the average of the two middle values when the count is even). Return the list of medians.</p><p>Example: [2, 1, 5, 7, 2, 0, 5] gives [2, 1.5, 2, 3.5, 2, 2, 2]. Re-sorting after every number is too slow; aim for O(n log n) total with two heaps. The starter includes a small <code>Heap</code> class (JavaScript); use <code>heapq</code> in Python.</p>`, {
        js: ["runningMedian", `${HEAP_JS}\nfunction runningMedian(nums) {\n  // your code here\n}\n`, `${HEAP_JS}\nfunction runningMedian(nums) {\n  const low = new Heap((a, b) => a > b), high = new Heap((a, b) => a < b);\n  const out = [];\n  for (const x of nums) {\n    if (!low.size || x <= low.peek()) low.push(x);\n    else high.push(x);\n    if (low.size > high.size + 1) high.push(low.pop());\n    else if (high.size > low.size) low.push(high.pop());\n    out.push(low.size > high.size ? low.peek() : (low.peek() + high.peek()) / 2);\n  }\n  return out;\n}`],
        py: ["running_median", `import heapq\n\ndef running_median(nums):\n    # your code here\n    pass\n`, `import heapq\n\ndef running_median(nums):\n    low, high = [], []\n    out = []\n    for x in nums:\n        if not low or x <= -low[0]:\n            heapq.heappush(low, -x)\n        else:\n            heapq.heappush(high, x)\n        if len(low) > len(high) + 1:\n            heapq.heappush(high, -heapq.heappop(low))\n        elif len(high) > len(low):\n            heapq.heappush(low, -heapq.heappop(high))\n        if len(low) > len(high):\n            out.append(-low[0])\n        else:\n            out.append((-low[0] + high[0]) / 2)\n    return out\n`]
      }, [[[[5]], [5]], [[[1, 2]], [1, 1.5]], [[[2, 1, 5, 7, 2, 0, 5]], [2, 1.5, 2, 3.5, 2, 2, 2]], [[[]], []], [[[3, 3, 3]], [3, 3, 3]], [[[10, -10]], [10, 0]], [[[1, 2, 3, 4]], [1, 1.5, 2, 2.5]], [[[4, 3, 2, 1]], [4, 3.5, 3, 2.5]], [[[-1, -2, -3]], [-1, -1.5, -2]]], "exact",
      "Keep the smaller half in a max-heap and the larger half in a min-heap, sizes differing by at most one (the lower half may have the extra element). The median is the top of the larger heap, or the average of both tops when sizes are equal. Each number costs O(log n), so O(n log n) total, O(n) space.")
    ], "problem"),

    L("Say it: heaps out loud", "lc.heap", [
      SAY("Walk me through the last stone weight problem. Why a heap, and what is the complexity?",
        "<p>Each round I need the two heaviest stones, and then I insert the leftover back. That is a repeated largest-first access with insertions, which is what a max-heap is for. I load all stones into the heap, then loop: pop two, and if they differ push the difference. When fewer than two remain, I return the one left or zero.</p><p>Building the heap is O(n), and each of at most n rounds does two pops and a push at O(log n) each, so the total is O(n log n) time and O(n) space. Sorting after every round would cost O(n log n) per round, which is much worse. In Python I store negated values because heapq is a min-heap.</p>",
        ["Identifies the need for repeated largest access plus insertion", "Describes pop two and push the difference", "States O(n log n) time and O(n) space", "Mentions the negation trick for a max-heap in Python"]),
      SAY("Explain the two-heap method for a running median and why it works.",
        "<p>I split the numbers seen so far into a lower half and an upper half. The lower half lives in a max-heap, so its top is the largest of the small numbers. The upper half lives in a min-heap, so its top is the smallest of the large numbers. I keep the sizes equal, or let the lower half have one extra.</p><p>For each new number I put it in the correct half, then rebalance by moving one top across if the sizes drift. The median is then the lower top when the count is odd, or the average of the two tops when even. Reading it is O(1) and each insertion is O(log n), so n numbers cost O(n log n).</p>",
        ["Describes a max-heap for the lower half and a min-heap for the upper half", "Explains the size invariant", "Explains rebalancing after an insert", "States O(log n) per insert and O(1) to read the median"]),
      SAY("Walk me through the task scheduler with a cooldown. What is your greedy rule and why does it work?",
        "<p>The tasks that appear most often are the hardest to space out, so at each slot I run the available task with the most copies left. I keep a max-heap of counts for tasks that are ready, and a queue of tasks that are cooling down with the slot at which each becomes ready again. Each slot I pop the best ready task, decrement its count, and if copies remain, put it in the cooldown queue. If the heap is empty the slot is idle.</p><p>Running the largest count first avoids ending with one dominant task that must wait alone. Time is O(T log k) for T slots and k distinct labels, and space is O(k).</p>",
        ["States the greedy rule of running the largest remaining count", "Describes the ready heap and the cooldown queue", "Says an empty heap means an idle slot", "Gives time and space in terms of slots and distinct labels"]),
      SAY("When would you reach for a heap instead of sorting, and what edge cases would you check?",
        "<p>A heap wins when I need only the top few items, or when data arrives over time and I keep asking for the current best. Sorting is fine when everything is available at once and I need the full order. For the k largest of n items a size-k heap costs O(n log k) and O(k) space, versus O(n log n) to sort.</p><p>Edge cases I would test: an empty input, k equal to 1, k equal to n, all values equal, negative numbers, and ties at the cutoff, where I need to ask whether any tie-break is acceptable or required.</p>",
        ["Names the streaming or top-k situation where a heap fits", "Compares O(n log k) with O(n log n)", "Covers empty input and k at both extremes", "Raises ties at the cutoff as a question to ask"]),
      ...CH(
        Q("For last stone weight, why use a heap instead of sorting the list again every round?",
          ["Each round needs the two largest stones and one insertion, which a heap does in O(log n)", "A heap keeps the whole list fully sorted at all times, so no search is needed", "Sorting cannot work, because the stone weights change after every round", "A heap uses no extra memory, while sorting must copy the whole list"],
          "A heap gives fast access to the maximum and fast inserts without maintaining a complete sorted order."),
        Q("Python's heapq only offers a min-heap. How do you get largest-first behavior?",
          ["Push negated values and negate them again after popping", "Reverse the list after each push so the largest value comes first", "Call heapify with a flag that flips the ordering of the comparisons", "Pop from the end of the heap list instead of the front"],
          "The smallest negated value is the largest original value."),
        Q("You already have all n values in a list. How do you compare heapify with n separate pushes?",
          ["heapify builds the heap in O(n), while n pushes cost O(n log n)", "Both cost O(n log n), since each element must be sifted a full level", "heapify costs O(n log n) while n pushes cost O(n) in total", "Both cost O(n), because a heap never moves an element more than once"],
          "Bottom-up building does little work for most nodes, since most sit near the leaves.")),
      ...CH(
        Q("For the top k frequent values, how does a heap beat sorting all the distinct values?",
          ["A size-k min-heap makes the selection O(m log k) rather than O(m log m)", "A heap needs no counting step, so a whole pass over the data is saved", "Sorting must compare strings, while a heap compares integers directly", "A heap returns the values already in order of first appearance"],
          "With k much smaller than m, log k is a smaller factor than log m."),
        Q("In that size-k heap, why is it a min-heap on the counts rather than a max-heap?",
          ["The weakest kept item sits on top, so it can be evicted when a better one arrives", "The strongest item must be on top so it can be returned first at the end", "A min-heap needs fewer comparisons per push than a max-heap does", "A max-heap would let the heap grow beyond k items without any check"],
          "Eviction needs fast access to the smallest of the current top-k candidates."),
        Q("The interviewer asks whether you can beat n log k. What do you say?",
          ["Yes: bucket values by frequency, since counts are at most n, for O(n) time", "No: n log k is a proven lower bound for any selection problem", "Yes: sort the array first and take the last k groups for O(n) time", "No: counting alone already costs O(n log n) in the worst case"],
          "Frequencies are bounded integers, so a bucket array indexed by count avoids comparisons entirely."))
    ], "drill")
  ]);
})();
