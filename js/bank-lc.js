/* Question bank + cases — Coding Interviews (LeetCode & HackerRank) */
(function () {
  const Q = GR.Q, G = GR.G, N = GR.nopts, S = GR.S, C = GR.code, T = GR.tbl;

  /* ---- pattern recognition drill: describe a problem, name the pattern ---- */
  const PAT = ["Two pointers", "Sliding window", "Prefix sums + hash map", "Hash map / set", "Binary search", "Monotonic stack", "Fast & slow pointers", "Heap", "Intervals (sort + sweep)", "Tree DFS", "BFS", "Topological sort", "Union-find", "Dijkstra", "Trie", "Backtracking", "Dynamic programming", "Greedy"];
  const SCEN = [
    ["Given a sorted array, find two numbers that add up to a target using O(1) extra space.", 0], ["Check whether a string is a palindrome, ignoring non-letters.", 0], ["Find all unique triplets in an array that sum to zero.", 0], ["Pick two vertical lines that hold the most water between them.", 0],
    ["Find the length of the longest substring with at most k distinct characters.", 1], ["Find the smallest contiguous subarray whose sum is at least s (all values positive).", 1], ["Return the maximum of every window of size k as it slides across the array.", 1], ["Find the longest substring you can make all one letter by replacing at most k characters.", 1],
    ["Count subarrays whose sum equals k; the array contains negative numbers.", 2], ["Answer 100,000 queries asking for the sum of a[l..r].", 2], ["Find the longest subarray with equal numbers of 0s and 1s.", 2],
    ["Decide whether any value appears twice in an unsorted array, in O(n).", 3], ["Group words that are anagrams of each other.", 3], ["Find the length of the longest run of consecutive integers in an unsorted array, in O(n).", 3],
    ["Find the minimum eating speed that finishes all banana piles within h hours.", 4], ["Find a target in a sorted array that was rotated at an unknown pivot, in O(log n).", 4], ["Find the smallest ship capacity that delivers all packages within d days.", 4], ["Find the first bad version among n versions with as few API calls as possible.", 4],
    ["For each day, find how many days until a warmer temperature.", 5], ["Find the largest rectangle that fits under a histogram.", 5], ["For each element, find the next element to its right that is larger.", 5],
    ["Detect whether a linked list has a cycle using O(1) extra memory.", 6], ["Find the middle node of a linked list in one pass.", 6], ["Find the duplicate number in an array of n+1 values from 1..n without modifying it and with O(1) space.", 6],
    ["Return the k most frequent elements.", 7], ["Merge k sorted linked lists into one.", 7], ["Keep reporting the median of a stream of numbers.", 7], ["Return the k points closest to the origin.", 7],
    ["Find the minimum number of meeting rooms needed for a list of meetings.", 8], ["Merge all overlapping time ranges.", 8], ["Remove the fewest intervals so the rest don't overlap.", 8],
    ["Find the maximum path sum between any two nodes of a binary tree.", 9], ["Check whether a binary tree is height-balanced.", 9], ["Find the lowest common ancestor of two nodes in a binary tree.", 9],
    ["Find the minimum number of steps for a knight to reach a square on a chessboard.", 10], ["Find how many minutes until every orange in a grid has rotted.", 10], ["Transform one word into another changing one letter at a time, in the fewest steps.", 10], ["Return the values of a binary tree level by level.", 10],
    ["Given course prerequisites, return an order in which all courses can be taken.", 11], ["Derive the letter order of an alien language from a sorted list of words.", 11],
    ["Edges arrive one by one; return the first edge that creates a cycle in an undirected graph.", 12], ["Count connected components as friendships are added.", 12], ["Merge user accounts that share any email address.", 12],
    ["Find the time for a signal to reach every node of a network with weighted edges.", 13], ["Find the cheapest route between two cities with positive ticket prices.", 13],
    ["Implement autocomplete: return all stored words starting with a prefix.", 14], ["Find every dictionary word that can be traced in a letter grid.", 14],
    ["Generate all valid combinations of n pairs of parentheses.", 15], ["Place n queens on an n×n board so none attack each other.", 15], ["List every way to partition a string into palindromes.", 15], ["Find all combinations of candidates that sum to a target, reusing numbers.", 15],
    ["Count the distinct ways to climb n stairs taking 1 or 2 steps.", 16], ["Find the fewest coins that make an amount.", 16], ["Compute the minimum number of edits to turn one word into another.", 16], ["Decide whether a string can be split into dictionary words.", 16], ["Find the length of the longest increasing subsequence.", 16],
    ["Decide whether you can reach the last index when each value is your maximum jump.", 17], ["Find the starting gas station that lets you drive around the whole circuit.", 17], ["Split a string into as many parts as possible so each letter appears in only one part.", 17], ["Find the maximum sum of a contiguous subarray.", 17],
  ];
  for (let d = 1; d <= 3; d++) G("lc.patterns", d, (r) => { const pool = SCEN.filter((_, i) => i % 3 === d - 1), [txt, p] = r.pick(pool), others = r.shuffle(PAT.map((_, i) => i).filter((i) => i !== p)).slice(0, 3);
    return { stem: `Which pattern fits best? <i>"${txt}"</i>`, opts: [PAT[p], ...others.map((i) => PAT[i])], expl: `${PAT[p]}. ${txt.length > 0 ? "Look for the signal words in the pattern map." : ""}` }; });

  /* ---- lc.approach ---- */
  Q("lc.approach", 1, "What should you do first when given a coding problem in an interview?", ["Restate it and ask clarifying questions about inputs and edge cases", "Start typing the solution", "Write the optimal algorithm from memory", "Ask for the answer"], "Clarifying prevents solving the wrong problem and shows structured thinking.");
  Q("lc.approach", 2, "Why describe the brute-force solution before optimizing?", ["It shows you can solve it, gives a baseline complexity, and often reveals the repeated work to remove", "Interviewers want the slowest solution", "It is always the final answer", "It saves time to skip it"], "Optimizations usually come from spotting what the brute force recomputes.");
  Q("lc.approach", 2, "You've finished coding. Before saying you're done, you should:", ["Trace a small example through the code line by line and check edge cases", "Ask if you passed", "Rewrite it in another language", "Stop talking"], "Self-testing catches bugs and is part of what's being graded.");
  Q("lc.approach", 2, "You're stuck with no idea. A productive move is to:", ["Work a few more examples by hand and look for structure, or solve a smaller version", "Stay silent and think for ten minutes", "Guess a data structure at random", "Give up"], "Concrete examples and simpler cases often expose the pattern.");
  Q("lc.approach", 3, "Which question matters most before choosing an algorithm?", ["How large can the input be?", "What language is preferred?", "What is the interviewer's name?", "Is recursion allowed?"], "Input size sets the complexity budget, which points to the right family of solutions.");

  /* ---- lc.complexity ---- */
  Q("lc.complexity", 1, "n ≤ 20. Which complexity is usually acceptable?", ["O(2ⁿ)", "Only O(n)", "Only O(log n)", "O(n!) for n = 20"], "2²⁰ ≈ 10⁶ is fine; 20! is astronomically large.");
  Q("lc.complexity", 2, "n is up to 10⁵. Which approach will most likely time out?", ["A double loop over all pairs, O(n²)", "Sorting, O(n log n)", "One pass with a hash map, O(n)", "Binary search per element, O(n log n)"], "(10⁵)² = 10¹⁰ operations, far beyond a typical time limit.");
  Q("lc.complexity", 2, "In Python, which check is O(1) on average?", ["x in a_set", "x in a_list", "a_list.index(x)", "a_list.count(x)"], "Sets and dicts hash; lists scan.");
  Q("lc.complexity", 2, "Inside a loop you take <code>s[i:]</code> for each i of an n-character string. The hidden cost is:", ["O(n²) total, because each slice copies", "O(n) total", "O(1)", "O(log n)"], "Slicing creates a new string of length n − i every time.");
  Q("lc.complexity", 3, "BFS over a graph with V vertices and E edges costs:", ["O(V + E)", "O(V × E)", "O(V²) always", "O(log V)"], "Each vertex is enqueued once and each edge is examined a constant number of times.");
  G("lc.complexity", 2, (r) => { const opts = [[10, "O(n!)"], [20, "O(2ⁿ)"], [400, "O(n³)"], [3000, "O(n²)"], [200000, "O(n log n)"], [1e8, "O(n) or better"]], k = r.int(0, opts.length - 1), [n, c] = opts[k], wrong = opts.filter((_, i) => i !== k).map((x) => x[1]);
    return { stem: `The constraint is n ≤ ${n.toLocaleString("en-US")}. What's the slowest complexity you can safely aim for (about 10⁸ simple operations per second)?`, opts: [c, ...r.shuffle(wrong).slice(0, 3)], expl: `For n ≤ ${n.toLocaleString("en-US")}, ${c} keeps the work within roughly 10⁸ operations.` }; });

  /* ---- lc.hashing ---- */
  Q("lc.hashing", 1, "Two Sum in O(n) uses a hash map from:", ["value → index of numbers seen so far", "index → value of every number", "sum → pair", "value → count of pairs"], "For each x, check whether target − x is already in the map.");
  Q("lc.hashing", 2, "A good key for grouping anagrams is:", ["The word's letters sorted, or a tuple of 26 letter counts", "The word's length", "The first letter", "The word itself"], "All anagrams share the same sorted letters and the same counts.");
  Q("lc.hashing", 2, "Why can't a Python list be a dictionary key?", ["Lists are mutable, so their hash could change", "Lists are too long", "Lists are slower than tuples", "Keys must be strings"], "Use a tuple instead.");
  Q("lc.hashing", 2, "Longest Consecutive Sequence in O(n): put all numbers in a set, then:", ["Start counting only from numbers whose predecessor (x − 1) isn't in the set", "Sort the set", "Check every pair", "Count from every number"], "Starting only at sequence beginnings makes each number get visited a constant number of times.");
  Q("lc.hashing", 3, "Hash map operations are O(1) on average but O(n) in the worst case because:", ["Many keys can collide into the same bucket", "Maps are sorted", "Keys are copied", "Python caches results"], "Pathological collisions degrade lookups; in practice they're rare.");

  /* ---- lc.twoptr ---- */
  Q("lc.twoptr", 1, "Two pointers from both ends is the natural approach when the input is:", ["Sorted", "A hash map", "A tree", "Random and unsorted with no sorting allowed"], "Sorted order is what lets each move rule out candidates.");
  Q("lc.twoptr", 2, "In Container With Most Water, which pointer should move?", ["The one at the shorter wall", "The one at the taller wall", "Both, always", "Neither; use a heap"], "The area is limited by the shorter wall; moving the taller one can't increase it.");
  Q("lc.twoptr", 2, "3Sum's time complexity with sorting plus two pointers is:", ["O(n²)", "O(n³)", "O(n log n)", "O(n)"], "Fix each element (n) and run a linear two-pointer scan (n).");
  Q("lc.twoptr", 2, "How does 3Sum avoid duplicate triplets?", ["After sorting, skip an element equal to the previous one at the same position", "Store every triplet in a set of lists", "It can't avoid them", "Shuffle first"], "Skipping equal neighbors at each level prevents repeats without extra memory.");
  Q("lc.twoptr", 3, "Move Zeroes keeps a write pointer and a read pointer. Its extra space is:", ["O(1)", "O(n)", "O(log n)", "O(n²)"], "It rearranges in place.");
  G("lc.twoptr", 2, (r) => { const a = Array.from({ length: 7 }, () => r.int(1, 15)).sort((x, y) => x - y), t = a[1] + a[5]; let l = 0, rr = 6, steps = 0; while (l < rr) { steps++; const s = a[l] + a[rr]; if (s === t) break; if (s < t) l++; else rr--; }
    return { stem: `Two pointers on [${a.join(", ")}] looking for target ${t}. How many pairs does it check before finding one?`, opts: N(steps, [steps + 2, 21, Math.max(1, steps - 1)]), expl: `Start at both ends and move inward; it finds ${a[l]} + ${a[rr]} after ${steps} check${steps > 1 ? "s" : ""}, versus 21 pairs for a nested loop.` }; });

  /* ---- lc.window ---- */
  Q("lc.window", 1, "A sliding window is used for problems about:", ["Contiguous subarrays or substrings", "Any subset of elements", "Tree paths", "Sorting"], "The window is always a contiguous range.");
  Q("lc.window", 2, "Why is the variable sliding window O(n) even though it has a nested while loop?", ["left only moves forward, so each element is removed at most once", "The inner loop runs once", "It uses binary search", "It isn't O(n)"], "Total pointer moves are at most 2n.");
  Q("lc.window", 2, "Smallest subarray with sum ≥ s fails with a sliding window when:", ["The array contains negative numbers", "The array is long", "s is large", "Values repeat"], "With negatives, shrinking can increase the sum, so validity isn't monotonic. Use prefix sums.");
  Q("lc.window", 2, "For 'longest substring with at most k distinct characters', what does the window track?", ["Counts of each character inside it", "The sorted characters", "Every substring", "Only the first character"], "When the number of keys exceeds k, shrink from the left, decrementing counts.");
  Q("lc.window", 3, "Sliding Window Maximum in O(n) uses:", ["A deque of indexes with decreasing values", "A sorted list", "A min-heap of size n", "Recursion"], "The deque front is always the window's maximum; smaller values behind a new one can never matter again.");

  /* ---- lc.prefix ---- */
  Q("lc.prefix", 1, "With prefix sums P (P[0] = 0), the sum of a[l..r] is:", ["P[r + 1] − P[l]", "P[r] − P[l]", "P[r] + P[l]", "P[r + 1] − P[l + 1]"], "P[i] holds the sum of the first i elements.");
  Q("lc.prefix", 2, "In Subarray Sum Equals K, why initialize the count map with {0: 1}?", ["So subarrays starting at index 0 are counted", "To avoid division by zero", "Because k is never 0", "It's optional"], "If the prefix itself equals k, you need prefix − k = 0 to have been 'seen' once.");
  Q("lc.prefix", 2, "Product of Array Except Self without division uses:", ["A prefix-product pass and a suffix-product pass", "Sorting", "A heap", "Two nested loops"], "answer[i] = (product of everything left of i) × (product of everything right of i).");
  Q("lc.prefix", 3, "A difference array lets you:", ["Apply many range additions in O(1) each, then rebuild with one prefix sum", "Sort faster", "Find duplicates", "Reverse an array"], "d[l] += v and d[r + 1] −= v; a prefix sum recovers the final values.");
  G("lc.prefix", 2, (r) => { const a = Array.from({ length: 6 }, () => r.int(-3, 9)), l = r.int(0, 2), rr = r.int(3, 5), P = [0]; a.forEach((x) => P.push(P[P.length - 1] + x)); const v = P[rr + 1] - P[l];
    return { stem: `a = [${a.join(", ")}]. The prefix sums are P = [${P.join(", ")}]. What is the sum of a[${l}..${rr}]?`, opts: N(v, [P[rr] - P[l], P[rr + 1] - P[l + 1], P[rr + 1]]), expl: `P[${rr + 1}] − P[${l}] = ${P[rr + 1]} − ${P[l]} = ${v}.` }; });

  /* ---- lc.bsearch ---- */
  Q("lc.bsearch", 1, "Binary search requires the search space to be:", ["Monotonic: sorted, or a condition that flips from false to true once", "Small", "Unique values only", "A power of two in size"], "That's what lets you discard half each step.");
  Q("lc.bsearch", 2, "In 'binary search on the answer', you search over:", ["Possible answer values, testing each guess with a feasibility check", "The input array's indexes only", "All subsets", "The recursion depth"], "Koko Eating Bananas searches speeds, not indexes.");
  Q("lc.bsearch", 2, "Why compute mid as lo + (hi − lo) // 2 in languages like Java or C++?", ["(lo + hi) can overflow a 32-bit integer", "It's faster", "It rounds up", "It avoids negative numbers"], "Python ints don't overflow, but interviewers like to hear you know this.");
  Q("lc.bsearch", 2, "In a rotated sorted array, after computing mid you know that:", ["At least one of the two halves is sorted", "Both halves are sorted", "Neither half is sorted", "The pivot is at mid"], "Check whether the target lies inside the sorted half to choose a side.");
  Q("lc.bsearch", 3, "An infinite loop in binary search is most often caused by:", ["An update that doesn't shrink the range, like lo = mid when mid can equal lo", "Using integer division", "Sorting first", "Returning lo"], "Every iteration must make the range strictly smaller.");
  G("lc.bsearch", 1, (r) => { const n = r.pick([100, 1000, 1e6, 1e9]); const v = Math.ceil(Math.log2(n + 1)); return { stem: `About how many steps does binary search need, at most, for ${n.toLocaleString("en-US")} sorted items?`, opts: N(v, [Math.round(n / 2), Math.round(Math.sqrt(n)), v * 3]), expl: `log₂(${n.toLocaleString("en-US")}) ≈ ${v}. Each step halves the range.` }; });

  /* ---- lc.stack ---- */
  Q("lc.stack", 1, "Valid Parentheses uses a stack because:", ["The most recently opened bracket must close first", "Brackets are sorted", "It needs random access", "Queues are slower"], "Last in, first out matches nesting.");
  Q("lc.stack", 2, "A monotonic stack solution for Next Greater Element is O(n) because:", ["Each index is pushed once and popped at most once", "The stack has at most two items", "It uses binary search", "The inner loop runs once per element"], "Amortized, the while loop does n pops total.");
  Q("lc.stack", 2, "Min Stack gets the minimum in O(1) by:", ["Storing alongside each element the minimum at that point", "Sorting on every push", "Scanning the stack", "Using a heap"], "Pairs of (value, current min) make min() a peek.");
  Q("lc.stack", 2, "In Daily Temperatures, when an index is popped because a warmer day i arrives, its answer is:", ["i − popped index", "The temperature difference", "1", "The stack size"], "The number of days waited.");
  Q("lc.stack", 3, "Evaluating Reverse Polish Notation '2 1 + 3 *' gives:", ["9", "5", "7", "6"], "(2 + 1) × 3 = 9: push numbers, pop two on each operator.");

  /* ---- lc.linked ---- */
  Q("lc.linked", 1, "What does a dummy (sentinel) head node simplify?", ["Edge cases where the real head changes, like merging or deleting the first node", "Memory usage", "Sorting", "Cycle detection"], "The answer is dummy.next, with no special case for the first node.");
  Q("lc.linked", 2, "To remove the n-th node from the end in one pass:", ["Move a fast pointer n steps ahead, then move both until fast reaches the end", "Reverse the list twice", "Count with a hash map", "Use binary search"], "When fast hits the end, slow is just before the target.");
  Q("lc.linked", 2, "Floyd's cycle detection uses O(1) extra space because:", ["It needs only two pointers", "It stores visited nodes in a set", "It modifies the list", "It recurses"], "A visited set would be O(n).");
  Q("lc.linked", 2, "Reversing a linked list in place needs which pointers?", ["prev, cur and next", "Only head", "A stack of all nodes", "Two dummy nodes"], "Save next, point cur back to prev, advance.");
  Q("lc.linked", 3, "LRU Cache with O(1) get and put combines:", ["A hash map and a doubly linked list", "Two stacks", "A heap and a set", "A sorted array"], "The map finds nodes; the list orders them by recency for O(1) moves and evictions.");

  /* ---- lc.heap ---- */
  Q("lc.heap", 1, "Python's heapq implements a:", ["Min-heap", "Max-heap", "Sorted list", "Balanced BST"], "Push negated values to simulate a max-heap.");
  Q("lc.heap", 2, "To find the k largest of n numbers efficiently, keep:", ["A min-heap of size k", "A max-heap of size n, popped k times only", "A sorted copy", "A stack"], "Both work, but the size-k min-heap is O(n log k) time and O(k) space.");
  Q("lc.heap", 2, "Finding the running median uses:", ["A max-heap for the lower half and a min-heap for the upper half", "One sorted list", "Two stacks", "A trie"], "Tops of the two heaps give the middle value(s).");
  Q("lc.heap", 2, "Merging k sorted lists with a heap costs:", ["O(N log k) for N total elements", "O(N k)", "O(N²)", "O(k log N)"], "The heap holds one candidate per list.");
  Q("lc.heap", 3, "Building a heap from n items with heapify costs:", ["O(n)", "O(n log n)", "O(log n)", "O(n²)"], "Bottom-up heapify is linear, cheaper than n pushes.");

  /* ---- lc.intervals ---- */
  Q("lc.intervals", 1, "The first step in most interval problems is:", ["Sort the intervals (usually by start)", "Build a hash map", "Reverse them", "Use recursion"], "Sorting lets one pass compare each interval with the previous group.");
  Q("lc.intervals", 2, "Intervals [a, b] and [c, d] overlap when:", ["a < d and c < b", "a < c", "b < c", "a = c"], "Neither one ends before the other starts.");
  Q("lc.intervals", 2, "Minimum number of intervals to remove so the rest don't overlap: sort by:", ["End time, and greedily keep the earliest-ending interval", "Start time only", "Length", "Random order"], "Finishing early leaves the most room for the rest.");
  Q("lc.intervals", 3, "Meeting Rooms II (rooms needed) can be solved with:", ["A min-heap of end times, or sorted start and end events", "A stack", "Union-find", "Binary search only"], "The answer is the maximum number of overlapping meetings.");
  G("lc.intervals", 2, (r) => { const iv = Array.from({ length: 5 }, () => { const s = r.int(0, 12); return [s, s + r.int(1, 4)]; }).sort((a, b) => a[0] - b[0]), out = [iv[0].slice()]; iv.slice(1).forEach(([s, e]) => { const l = out[out.length - 1]; if (s <= l[1]) l[1] = Math.max(l[1], e); else out.push([s, e]); });
    return { stem: `How many intervals remain after merging ${iv.map((x) => `[${x}]`).join(", ")} (touching counts as overlapping)?`, opts: N(out.length, [5, Math.max(1, out.length - 1), out.length + 1]), expl: `Merged: ${out.map((x) => `[${x}]`).join(", ")}.` }; });

  /* ---- lc.trees ---- */
  Q("lc.trees", 1, "Which traversal visits a binary search tree's values in sorted order?", ["In-order", "Pre-order", "Post-order", "Level-order"], "Left subtree, node, right subtree.");
  Q("lc.trees", 2, "In Diameter of Binary Tree, the recursive function returns the height, while the diameter is:", ["Tracked in a variable outside, updated with left + right at every node", "Returned directly", "Always the root's height", "Computed by BFS"], "The longest path may not pass through the root.");
  Q("lc.trees", 2, "To process a tree level by level you use:", ["BFS with a queue, taking len(queue) nodes per level", "In-order DFS", "A stack only", "Binary search"], "Snapshot the queue length at the start of each level.");
  Q("lc.trees", 2, "Recursion on a skewed tree with n nodes uses call-stack space of:", ["O(n)", "O(log n)", "O(1)", "O(n²)"], "Stack depth equals tree height, which is n for a linked-list-shaped tree.");
  Q("lc.trees", 3, "Which traversal is natural when a node needs its children's results first (heights, sums)?", ["Post-order", "Pre-order", "In-order", "Level-order"], "Children are processed before the parent combines them.");

  /* ---- lc.bst ---- */
  Q("lc.bst", 1, "In a valid BST:", ["Every value in a node's left subtree is less than it, and every value in the right subtree is greater", "Each node is greater than its left child only", "The tree is balanced", "Leaves are sorted"], "The rule applies to whole subtrees, not just children.");
  Q("lc.bst", 2, "Why does checking only node.left.val < node.val < node.right.val fail to validate a BST?", ["A deeper node can violate an ancestor's bound", "It's too slow", "BSTs can't have children", "It works fine"], "Pass (low, high) bounds down the recursion.");
  Q("lc.bst", 2, "Search in a balanced BST takes:", ["O(log n)", "O(n)", "O(1)", "O(n log n)"], "Each step discards half; a skewed tree degrades to O(n).");
  Q("lc.bst", 3, "The lowest common ancestor of p and q in a BST is the first node (from the root) whose value:", ["Lies between p and q", "Equals p", "Is the largest", "Is a leaf"], "Above it both are on one side; at it they split.");

  /* ---- lc.trie ---- */
  Q("lc.trie", 1, "Inserting a word of length L into a trie costs:", ["O(L)", "O(n) for n stored words", "O(L log n)", "O(1)"], "You walk one node per character.");
  Q("lc.trie", 2, "Why does a trie node need an end-of-word marker?", ["To distinguish a stored word from a prefix of a longer word", "To save memory", "To sort children", "It doesn't"], "Storing 'card' passes through 'car', which may not be a word itself.");
  Q("lc.trie", 2, "Word Search II is much faster with a trie because:", ["One grid DFS checks all words at once, pruning paths that aren't prefixes", "Tries sort the grid", "It avoids recursion", "Words become numbers"], "Searching each word separately repeats the grid traversal many times.");
  Q("lc.trie", 3, "A trie node's children are usually stored in:", ["A dict or a 26-element array", "A linked list of all words", "A heap", "A set of strings"], "Arrays are faster for fixed alphabets; dicts save space.");

  /* ---- lc.graphs ---- */
  Q("lc.graphs", 1, "Which algorithm finds the shortest path when every edge has the same cost?", ["BFS", "DFS", "Dijkstra is required", "Union-find"], "BFS reaches nodes in order of distance.");
  Q("lc.graphs", 2, "Rotting Oranges starts BFS from:", ["Every rotten orange at once (multi-source BFS)", "The top-left cell", "A random orange", "Each rotten orange separately"], "All sources at distance 0 spread simultaneously, giving minutes directly.");
  Q("lc.graphs", 2, "Number of Islands counts:", ["How many times you start a new DFS/BFS from an unvisited land cell", "All land cells", "Water cells", "Edges"], "Each traversal floods one whole island.");
  Q("lc.graphs", 2, "Forgetting the visited set in graph traversal causes:", ["Infinite loops or exponential repeated work on cycles", "A faster search", "A sorted output", "Nothing"], "Graphs can loop back; trees can't.");
  Q("lc.graphs", 3, "Why might a recursive DFS crash on a 1000 × 1000 grid in Python?", ["The recursion depth limit (about 1,000) is exceeded", "Grids can't be searched with DFS", "Python lacks lists", "It's too fast"], "Use an explicit stack, BFS, or raise the limit with care.");

  /* ---- lc.graphadv ---- */
  Q("lc.graphadv", 1, "Topological sort applies to:", ["Directed acyclic graphs", "Undirected graphs", "Any graph with cycles", "Trees only"], "A cycle makes a valid order impossible.");
  Q("lc.graphadv", 2, "In Kahn's algorithm, a cycle is detected when:", ["Fewer than all nodes are output", "The queue starts empty", "A node has in-degree 1", "There are no edges"], "Nodes on a cycle never reach in-degree 0.");
  Q("lc.graphadv", 2, "In Redundant Connection, union-find reports the extra edge when:", ["Both endpoints already have the same root", "Both nodes are new", "The edge is the longest", "The graph is directed"], "Joining two already-connected nodes closes a cycle.");
  Q("lc.graphadv", 2, "Path compression in union-find:", ["Points nodes closer to the root during find, flattening the tree", "Removes edges", "Sorts the parent array", "Compresses memory"], "Later finds become nearly O(1).");
  Q("lc.graphadv", 2, "Dijkstra's algorithm fails when the graph has:", ["Negative edge weights", "Cycles", "More than 100 nodes", "Undirected edges"], "A settled node could later be reached more cheaply; use Bellman-Ford.");
  Q("lc.graphadv", 3, "In Dijkstra, why skip a popped (d, v) when d > dist[v]?", ["It's a stale entry; v was already settled with a shorter distance", "To save memory", "Because v has no neighbors", "It's a negative edge"], "Lazy deletion leaves outdated entries in the heap.");

  /* ---- lc.backtrack ---- */
  Q("lc.backtrack", 1, "The backtracking template is:", ["Choose, explore, un-choose", "Sort, search, return", "Push, pop, peek", "Divide, conquer, merge"], "Undoing the choice restores state for the next branch.");
  Q("lc.backtrack", 2, "How many subsets does a set of n elements have?", ["2ⁿ", "n²", "n!", "n"], "Each element is either in or out.");
  Q("lc.backtrack", 2, "How many permutations do n distinct elements have?", ["n!", "2ⁿ", "n²", "n"], "n choices for the first position, n − 1 for the next, and so on.");
  Q("lc.backtrack", 2, "In Combination Sum (reuse allowed), the recursive call passes:", ["i, so the same number can be chosen again", "i + 1", "0", "The target only"], "Passing i + 1 would forbid reuse (Combination Sum II).");
  Q("lc.backtrack", 3, "Why sort the candidates first in many backtracking problems?", ["To skip duplicates and to stop early once values exceed the remaining target", "Backtracking requires sorted input", "To make it O(n)", "To reverse the output"], "Pruning is what makes exponential search fast enough.");
  G("lc.backtrack", 1, (r) => { const n = r.int(3, 7), kind = r.pick(["subsets", "permutations"]); const v = kind === "subsets" ? 2 ** n : [1, 1, 2, 6, 24, 120, 720, 5040][n];
    return { stem: `How many ${kind} does a list of ${n} distinct elements have?`, opts: N(v, [kind === "subsets" ? [1, 1, 2, 6, 24, 120, 720, 5040][n] : 2 ** n, n * n, n * (n - 1)]), expl: kind === "subsets" ? `2^${n} = ${v}.` : `${n}! = ${v}.` }; });

  /* ---- lc.dp1 ---- */
  Q("lc.dp1", 1, "Dynamic programming applies when a problem has:", ["Overlapping subproblems and optimal substructure", "Sorted input", "No recursion", "Only one possible answer"], "The same smaller problems recur, and best answers combine.");
  Q("lc.dp1", 2, "Memoization means:", ["Caching the results of recursive calls so each subproblem is solved once", "Sorting the input", "Using a stack", "Iterating backward"], "It turns exponential recursion into polynomial time.");
  Q("lc.dp1", 2, "In Coin Change (fewest coins), dp[a] is:", ["1 + min(dp[a − c]) over coins c ≤ a", "dp[a − 1] + 1", "The number of ways", "max over coins"], "Try every last coin; the rest is a smaller amount.");
  Q("lc.dp1", 2, "Word Break: dp[i] is true when:", ["Some j < i has dp[j] true and s[j:i] is a dictionary word", "s[i] is a letter", "i is even", "The word count is i"], "Split the prefix into a valid prefix plus one word.");
  Q("lc.dp1", 3, "Longest Increasing Subsequence can be solved in:", ["O(n log n) with binary search over the smallest possible tails", "O(log n)", "O(n) always", "Only O(2ⁿ)"], "Patience sorting: keep tails[k] = smallest ending of an increasing subsequence of length k + 1.");
  G("lc.dp1", 2, (r) => { const n = r.int(4, 12), f = [1, 1]; for (let i = 2; i <= n; i++) f.push(f[i - 1] + f[i - 2]); return { stem: `How many distinct ways are there to climb ${n} stairs taking 1 or 2 steps at a time?`, opts: N(f[n], [f[n - 1], 2 ** (n - 1), n * 2]), expl: `ways(n) = ways(n − 1) + ways(n − 2), Fibonacci: ways(${n}) = ${f[n]}.` }; });
  G("lc.dp1", 3, (r) => { const a = Array.from({ length: 6 }, () => r.int(1, 12)); let p2 = 0, p1 = 0; a.forEach((x) => { [p2, p1] = [p1, Math.max(p1, p2 + x)]; }); const alt = a.filter((_, i) => i % 2 === 0).reduce((s, x) => s + x, 0);
    return { stem: `House Robber: values [${a.join(", ")}]. What is the most you can take without robbing two adjacent houses?`, opts: N(p1, [alt === p1 ? p1 - 2 : alt, a.reduce((s, x) => s + x, 0), Math.max(...a)]), expl: `dp[i] = max(dp[i−1], dp[i−2] + a[i]) gives ${p1}.` }; });

  /* ---- lc.dp2 ---- */
  Q("lc.dp2", 1, "In Unique Paths on a grid (moves right or down), dp[r][c] equals:", ["dp[r − 1][c] + dp[r][c − 1]", "dp[r − 1][c − 1] + 1", "r × c", "max of neighbors"], "You arrive from above or from the left.");
  Q("lc.dp2", 2, "In LCS, when A[i − 1] == B[j − 1], dp[i][j] is:", ["dp[i − 1][j − 1] + 1", "max(dp[i − 1][j], dp[i][j − 1])", "0", "dp[i][j − 1] + 1"], "A match extends the best answer for both shorter prefixes.");
  Q("lc.dp2", 2, "Edit distance's three operations correspond to which neighboring cells?", ["Insert, delete, replace → left, up, diagonal", "Only the diagonal", "Only up", "Rows only"], "Take 1 + the minimum of the three when characters differ.");
  Q("lc.dp2", 2, "In 0/1 knapsack with a 1-D array, capacity is iterated:", ["Downward, so each item is used at most once", "Upward", "Randomly", "Twice"], "Going upward would let the same item be reused (unbounded knapsack).");
  Q("lc.dp2", 3, "Partition Equal Subset Sum reduces to:", ["Can a subset sum to total / 2? (0/1 knapsack on booleans)", "Sorting", "Two pointers", "BFS"], "If the total is odd, the answer is immediately false.");
  G("lc.dp2", 2, (r) => { const m = r.int(2, 5), n = r.int(2, 5), c = (a, b) => { let x = 1; for (let i = 1; i <= b; i++) x = (x * (a - b + i)) / i; return Math.round(x); }, v = c(m + n - 2, m - 1);
    return { stem: `Unique Paths: how many paths from the top-left to the bottom-right of a ${m} × ${n} grid, moving only right or down?`, opts: N(v, [m * n, m + n, 2 ** (m + n - 2)]), expl: `dp fills the grid with sums of up and left; equivalently C(${m + n - 2}, ${m - 1}) = ${v}.` }; });

  /* ---- lc.greedy ---- */
  Q("lc.greedy", 1, "A greedy algorithm:", ["Makes the locally best choice at each step without revisiting it", "Tries every option", "Always uses a heap", "Needs sorted input"], "It's fast, but only correct when a local choice can't hurt the global answer.");
  Q("lc.greedy", 2, "Jump Game can be solved greedily by tracking:", ["The farthest index reachable so far", "Every path", "A DP table of all jumps", "The smallest jump"], "If the current index ever exceeds that reach, you're stuck.");
  Q("lc.greedy", 2, "Coins [1, 3, 4], amount 6. What does 'always take the largest coin' give, and what's optimal?", ["Greedy uses 3 coins (4+1+1); optimal is 2 (3+3)", "Both give 2", "Greedy gives 2", "Both give 3"], "A counterexample means the problem needs DP.");
  Q("lc.greedy", 2, "Gas Station: if total gas ≥ total cost, a valid start is:", ["The station right after the point where the running tank was lowest", "Always station 0", "The station with the most gas", "There is never one"], "Restart the candidate whenever the tank goes negative.");
  Q("lc.greedy", 3, "How do you justify a greedy algorithm?", ["An exchange argument: swapping any optimal choice for the greedy one doesn't make it worse", "It passed one example", "Greedy is always optimal", "By complexity alone"], "Without a proof, test against brute force on small cases.");

  /* ---- lc.bits ---- */
  Q("lc.bits", 1, "What is x XOR x?", ["0", "x", "1", "2x"], "XOR-ing a value with itself cancels it.");
  Q("lc.bits", 2, "Single Number (every element appears twice except one) is solved in O(1) space by:", ["XOR-ing all elements", "Sorting", "A hash set", "Summing"], "Pairs cancel, leaving the single one.");
  Q("lc.bits", 2, "n & (n − 1) == 0 (for n > 0) means n is:", ["A power of two", "Odd", "Prime", "Zero"], "Powers of two have exactly one set bit.");
  Q("lc.bits", 2, "Computing xⁿ by repeated squaring takes:", ["O(log n) multiplications", "O(n)", "O(n²)", "O(1)"], "Halve the exponent each step.");
  Q("lc.bits", 3, "Missing Number (0..n with one missing) can be found by:", ["n(n + 1)/2 minus the sum of the array, or XOR of indexes and values", "Sorting and binary search only", "A heap", "Backtracking"], "Both are O(n) time and O(1) space.");
  G("lc.bits", 1, (r) => { const n = r.int(5, 255), v = n.toString(2).split("").filter((b) => b === "1").length; return { stem: `How many 1 bits are in ${n} (binary ${n.toString(2)})?`, opts: N(v, [v + 1, Math.max(0, v - 1), n.toString(2).length]), expl: `${n} = ${n.toString(2)} has ${v} set bits. n & (n − 1) removes one per step.` }; });

  /* ---- lc.oa ---- */
  Q("lc.oa", 1, "An online assessment (OA) on HackerRank or CodeSignal is usually:", ["A timed, auto-graded test scored by hidden test cases", "A live chat with an engineer", "A take-home project with no time limit", "A personality quiz"], "It's the automated first screen many companies use.");
  Q("lc.oa", 2, "With 20 minutes left, you have a correct O(n²) solution and an unfinished O(n) idea. You should:", ["Submit the O(n²) first for partial credit, then try to optimize", "Keep working on O(n) without submitting", "Submit nothing", "Rewrite in another language"], "Scoring is often per test case; banking passing tests is free points.");
  Q("lc.oa", 2, "A safe way to read input in a stdin-style problem in Python is:", ["Read everything with sys.stdin.read().split() and parse tokens", "Call input() for every number", "Hard-code the sample", "Read only the first line"], "Token-based parsing survives numbers split across lines.");
  Q("lc.oa", 2, "Your solution passes the sample but fails hidden tests. The most likely causes are:", ["Edge cases (empty, one element, large values) or exceeding the time limit", "The judge is broken", "Too many comments", "Using Python"], "Check constraints and boundaries before blaming the platform.");
  Q("lc.oa", 3, "Why do OAs often flag copied solutions?", ["Similar code across candidates is detected and proctoring logs tab switches and pastes", "They can't", "Only for Python", "Copying is encouraged"], "Prepare honestly; the live rounds test the same skills.");

  /* ---- lc.live ---- */
  Q("lc.live", 1, "In a live coding interview, the interviewer mainly evaluates:", ["Problem solving, code quality, communication and testing", "Typing speed", "Memorized solutions only", "Your IDE shortcuts"], "How you get there counts as much as the answer.");
  Q("lc.live", 2, "When the interviewer gives you a hint, you should:", ["Acknowledge it and build on it", "Ignore it to show independence", "Argue", "Start over"], "Using hints well is part of the evaluation.");
  Q("lc.live", 2, "You notice a bug while tracing your code. Best response:", ["Say so, explain the fix, and correct it calmly", "Hope they didn't notice", "Delete everything", "Blame the editor"], "Finding your own bugs is a strong signal.");
  Q("lc.live", 2, "Roughly how should a 45-minute coding interview be spent?", ["Clarify and plan ~10 min, code ~20 min, test and discuss ~10 min, questions ~5 min", "Code for 45 minutes straight", "Discuss for 40 minutes, code for 5", "Ask questions the whole time"], "Agree on the approach before coding; leave time to test.");
  Q("lc.live", 3, "Which habit most hurts candidates who know the algorithm?", ["Coding silently without explaining or confirming the approach", "Asking about edge cases", "Writing helper functions", "Stating complexity"], "The interviewer can't give credit for reasoning they can't see.");

  /* ---- lc.behavioral ---- */
  Q("lc.behavioral", 1, "STAR stands for:", ["Situation, Task, Action, Result", "Skills, Training, Attitude, Results", "Start, Think, Answer, Repeat", "Story, Theme, Arc, Resolution"], "Spend most of the answer on your Actions.");
  Q("lc.behavioral", 2, "A story bank is:", ["6 to 8 prepared real experiences you can adapt to many questions", "A list of company facts", "Memorized scripts for every possible question", "A portfolio website"], "One good conflict story can answer several differently worded questions.");
  Q("lc.behavioral", 2, "In 'tell me about a time you failed', the strongest answers:", ["Own the mistake, explain what you did about it and what changed afterward", "Pick a fake failure like 'I work too hard'", "Blame teammates", "Avoid the question"], "Interviewers look for accountability and learning.");
  Q("lc.behavioral", 3, "Why use 'I' rather than 'we' in the Action part?", ["The interviewer is evaluating your contribution", "'We' is grammatically wrong", "It's shorter", "Teams don't matter"], "Mention the team, but be specific about what you did.");

  /* ---- lc.studyplan ---- */
  Q("lc.studyplan", 1, "Which practice approach builds interview skill fastest?", ["Learning one pattern at a time with several problems each", "Solving random problems in any order", "Reading solutions without attempting", "Only hard problems"], "Grouping by pattern trains recognition.");
  Q("lc.studyplan", 2, "You're stuck after 35 minutes. Best next step:", ["Read the solution, understand the missed insight, then re-solve it yourself later", "Keep trying for three more hours", "Skip it forever", "Copy the code and move on"], "Then re-solve after a few days to make it stick.");
  Q("lc.studyplan", 2, "Why re-solve problems days later?", ["Spaced retrieval moves solutions into long-term memory", "To inflate your solved count", "Problems change", "It's required by LeetCode"], "If it doesn't come back, it wasn't really learned.");
  Q("lc.studyplan", 2, "Most interview questions are rated:", ["Medium", "Easy", "Hard", "Expert"], "Make mediums the core of your practice.");

  /* ---- lc.offer ---- */
  Q("lc.offer", 1, "Which parts of an offer are often easiest to negotiate?", ["Equity and sign-on bonus", "The job title only", "Office location", "Nothing is negotiable"], "Base salary bands are stricter at many companies.");
  Q("lc.offer", 2, "Your strongest negotiation leverage is usually:", ["A competing offer or active interview process", "Threatening to decline", "Saying you need the money", "Asking for double"], "Be honest about it; recruiters often verify.");
  Q("lc.offer", 2, "Total compensation includes:", ["Base, bonus, equity and sign-on", "Base only", "Base and vacation", "Equity only"], "Compare offers on the full package and vesting.");
  Q("lc.offer", 3, "After a rejection, a good move is to:", ["Ask for feedback and stay in touch; reapply later if appropriate", "Never apply again", "Argue with the recruiter", "Post about it angrily"], "Many companies allow reapplying after 6 to 12 months.");

  /* ---- cases ---- */
  S("lc.window", "Debug this sliding window", {
    stim: `<p>A candidate's solution for "longest substring without repeating characters":</p>` + C(`def longest(s):
    seen = {}
    left = best = 0
    for right, ch in enumerate(s):
        if ch in seen:
            left = seen[ch] + 1
        seen[ch] = right
        best = max(best, right - left + 1)
    return best`),
    parts: [
      ["lc.window", 2, "What does it return for \"abba\"? (The correct answer is 2.)", ["3", "2", "4", "1"], "At the final 'a', seen['a'] = 0, so left jumps back from 2 to 1, and the window 'bba' of length 3 is counted."],
      ["lc.window", 2, "What's the bug?", ["left can move backward when the old copy is outside the window", "seen should be a set", "best starts at 0", "It should use two loops"], "The repeat at index 0 is already left of the window, but the code still moves left to it."],
      ["lc.window", 2, "Which fix is correct?", ["left = max(left, seen[ch] + 1)", "left = seen[ch]", "left += 1", "Reset seen to {} on a repeat"], "Equivalent to checking seen[ch] >= left before jumping."],
      ["lc.complexity", 1, "What is the fixed solution's time complexity?", ["O(n)", "O(n²)", "O(n log n)", "O(2ⁿ)"], "One pass with O(1) dictionary operations."],
    ],
  });
  S("lc.bsearch", "Why does this binary search hang?", {
    stim: C(`def first_at_least(a, target):
    lo, hi = 0, len(a) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] < target:
            lo = mid
        else:
            hi = mid
    return lo`) + `<p>Called with <code>a = [1, 3, 5, 7]</code> and <code>target = 4</code>.</p>`,
    parts: [
      ["lc.bsearch", 2, "What happens?", ["It loops forever when lo = 1, hi = 2", "It returns 2", "It returns 1", "It raises IndexError"], "mid = 1, a[1] = 3 < 4, so lo = mid = 1 again: the range never shrinks."],
      ["lc.bsearch", 2, "Which change fixes the loop?", ["lo = mid + 1", "hi = mid - 1", "mid = (lo + hi + 1) // 2 everywhere", "while lo <= hi"], "mid is known to be too small, so it can be excluded."],
      ["lc.bsearch", 3, "After that fix, what's still wrong for target = 10 (larger than everything)?", ["It returns 3 instead of 4 (the 'past the end' index) because hi starts at len(a) − 1", "It loops forever", "It returns 0", "Nothing"], "Start with hi = len(a) so 'insert at the end' is a possible answer."],
      ["lc.bsearch", 1, "With both fixes, the result for target = 4 is:", ["2", "1", "3", "4"], "a[2] = 5 is the first value ≥ 4."],
    ],
  });
  S("lc.dp1", "From brute force to DP", {
    stim: C(`def ways(n):              # count ways to climb n stairs, 1 or 2 steps
    if n <= 1:
        return 1
    return ways(n - 1) + ways(n - 2)`),
    parts: [
      ["lc.dp1", 2, "What is the time complexity of this recursion?", ["Exponential, about O(1.6ⁿ)", "O(n)", "O(n²)", "O(log n)"], "Each call branches twice and the same arguments recur many times."],
      ["lc.dp1", 2, "How many times is ways(2) computed when calling ways(6)?", ["5", "1", "2", "6"], "The call tree recomputes it 5 times (a Fibonacci number)."],
      ["lc.dp1", 2, "Adding @functools.cache makes the time:", ["O(n)", "O(1)", "O(n²)", "Still exponential"], "Each n from 0 to N is computed once."],
      ["lc.dp1", 3, "The bottom-up version can use how much extra space?", ["O(1): keep only the last two values", "O(n) at least", "O(n²)", "O(2ⁿ)"], "Each step only reads the two previous answers."],
    ],
  });
  S("lc.graphadv", "Can you finish all the courses?", {
    stim: `<p>numCourses = 5, prerequisites as [course, needs]:</p>` + T(["course", "needs"], [[1, 0], [2, 1], [3, 1], [4, 3], [2, 4]], "Prerequisite pairs"),
    parts: [
      ["lc.graphadv", 1, "Which course has in-degree 0 (no prerequisites)?", ["0", "1", "2", "4"], "Only course 0 needs nothing."],
      ["lc.graphadv", 2, "What is a valid order?", ["0, 1, 3, 4, 2", "0, 2, 1, 3, 4", "1, 0, 3, 4, 2", "0, 1, 2, 3, 4"], "2 needs both 1 and 4, and 4 needs 3, so 2 must come last."],
      ["lc.graphadv", 2, "If we add the pair [0, 2] (course 0 needs 2), what happens?", ["A cycle 0 → 1 → 3 → 4 → 2 → 0 appears, so not all courses can be finished", "Nothing changes", "Course 2 becomes first", "Only course 0 is skipped"], "Kahn's algorithm would output fewer than 5 courses."],
      ["lc.complexity", 2, "What is the complexity of Kahn's algorithm here?", ["O(V + E)", "O(V²)", "O(E log V)", "O(2ⁿ)"], "Each node and edge is processed once."],
    ],
  });
  S("lc.oa", "A HackerRank-style problem", {
    stim: `<p><b>Problem.</b> The first line contains n and q. The second line has n integers. Each of the next q lines has l and r (0-based, inclusive). Print the sum of a[l..r] for each query, one per line. Constraints: 1 ≤ n, q ≤ 2 × 10⁵; |a[i]| ≤ 10⁹.</p>` + C(`5 3
4 -2 7 1 3
0 2
1 3
4 4`),
    parts: [
      ["lc.oa", 1, "What is the expected output?", ["9, 6, 3 (one per line)", "9 6 3 on one line", "13", "4, -2, 7"], "4 − 2 + 7 = 9; −2 + 7 + 1 = 6; 3."],
      ["lc.complexity", 2, "Why does a loop that sums a[l..r] for each query risk a timeout?", ["Worst case q × n = 4 × 10¹⁰ operations", "Sums are slow in Python", "It uses too much memory", "It doesn't"], "Each query could cover the whole array."],
      ["lc.prefix", 2, "What makes each query O(1)?", ["Precomputed prefix sums: answer = P[r + 1] − P[l]", "Sorting the array", "A heap", "Binary search"], "O(n) preprocessing plus O(1) per query."],
      ["lc.oa", 2, "What's the safest way to read this input in Python?", ["Read all tokens with sys.stdin.read().split() and walk through them", "Use input() in nested loops", "Hard-code n = 5", "Read only the first two lines"], "Fast and robust to line formatting; with 2 × 10⁵ queries, input() is slow too."],
      ["lc.oa", 3, "Sums can reach 2 × 10⁵ × 10⁹ = 2 × 10¹⁴. In Java or C++ you'd need:", ["64-bit integers (long / long long)", "32-bit int", "Floating point", "Strings"], "This exceeds the 32-bit range (about 2.1 × 10⁹). Python's ints are arbitrary precision."],
    ],
  });
  S("lc.patterns", "Name that pattern", (r) => {
    const pick = r.shuffle(SCEN.map((_, i) => i)).slice(0, 5);
    return { stim: `<p>Five problems an interviewer might give you. For each, name the pattern before thinking about code.</p>`,
      parts: pick.map((i) => { const [txt, p] = SCEN[i]; const others = r.shuffle(PAT.map((_, k) => k).filter((k) => k !== p)).slice(0, 3); return ["lc.patterns", 2, `<i>"${txt}"</i>`, [PAT[p], ...others.map((k) => PAT[k])], `${PAT[p]}.`]; }) };
  });
  S("lc.heap", "Top K Frequent, three ways", {
    stim: `<p>Return the k most frequent elements of nums (n elements, m distinct values).</p>` + T(["Approach", "Idea"], [["A", "Count with a hash map, sort the (value, count) pairs by count"], ["B", "Count, then keep a min-heap of size k keyed on count"], ["C", "Count, then bucket values by count (index = frequency), read buckets from high to low"]], "Three solutions"),
    parts: [
      ["lc.heap", 2, "Approach A costs:", ["O(n + m log m)", "O(n)", "O(n²)", "O(k)"], "Counting is O(n); sorting the m distinct values is O(m log m)."],
      ["lc.heap", 2, "Approach B costs:", ["O(n + m log k)", "O(n log n) always", "O(k²)", "O(1)"], "Each of m pushes costs O(log k)."],
      ["lc.hashing", 3, "Approach C runs in O(n) because:", ["A frequency is at most n, so there are at most n + 1 buckets", "It uses a heap", "It sorts in place", "It skips counting"], "Bucket sort on bounded keys avoids comparison sorting."],
      ["lc.live", 2, "In an interview, the best way to present these is:", ["Start with A, mention B's improvement for small k, then C if asked for O(n)", "Only write C, without explanation", "Refuse to choose", "Write all three silently"], "Show the progression and the trade-offs out loud."],
    ],
  });
})();
