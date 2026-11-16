/* Case sets — Software Engineering */
(function () {
  const S = GR.S, N = GR.nopts, T = GR.tbl, C = GR.code, V = GR.viz;

  S("swe.arrays", "What does this function do?", {
    stim: C(
`def f(nums):
    seen = set()
    out = []
    for x in nums:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out`),
    parts: [
      ["swe.arrays", 1, "What does <code>f([3, 1, 3, 2, 1])</code> return?", ["[3, 1, 2]", "[1, 2, 3]", "[3, 1, 3, 2, 1]", "[3, 2]"], "Each value is kept the first time it appears, in original order."],
      ["swe.arrays", 2, "Which description fits the function best?", ["Removes duplicates while preserving first-occurrence order", "Sorts the list", "Returns the values that appear exactly once", "Reverses the list"], "It is an order-preserving de-duplication. Values appearing twice are kept once, not dropped."],
      ["swe.bigo", 2, "What is its time complexity for a list of n items?", ["O(n) on average", "O(n²)", "O(n log n)", "O(1)"], "One pass, with average O(1) set lookups and inserts."],
      ["swe.bigo", 3, "If <code>seen</code> were a list instead of a set, the time complexity would become:", ["O(n²)", "O(n)", "O(n log n)", "O(log n)"], "<code>x not in list</code> scans the list, costing O(n) per element."],
      ["swe.bigo", 2, "What is its extra space complexity?", ["O(n)", "O(1)", "O(log n)", "O(n²)"], "Both the set and the output can grow to n elements."],
      ["swe.arrays", 3, "<code>list(set(nums))</code> also removes duplicates. What does it NOT guarantee?", ["The original order of elements", "That duplicates are removed", "That it runs in O(n)", "That the result is a list"], "Sets are unordered. In modern Python, <code>list(dict.fromkeys(nums))</code> keeps order in one line."],
    ],
  });

  S("swe.dp", "Counting grid paths", {
    stim: `<p>A robot starts in the top-left of a grid and can move only right or down. <code>paths(r, c)</code> counts the routes to a cell r rows down and c columns right.</p>` + C(
`def paths(r, c):
    if r == 0 or c == 0:
        return 1
    return paths(r - 1, c) + paths(r, c - 1)`),
    parts: [
      ["swe.recursion", 1, "What is the base case, and why is it 1?", ["On the top row or left column there is exactly one route: straight along the edge", "At (0, 0) there are no routes", "It prevents division by zero", "It counts the starting cell twice"], "If r or c is zero the robot can only move in one direction, so there is a single path."],
      ["swe.recursion", 2, "What does <code>paths(1, 3)</code> return?", ["4", "3", "6", "1"], "paths(1,3) = paths(0,3) + paths(1,2) = 1 + 3 = 4. Equivalently, choose which of 4 moves is the single 'down': C(4,1)."],
      ["swe.dp", 2, "What does <code>paths(2, 2)</code> return?", ["6", "4", "8", "2"], "paths(2,2) = paths(1,2) + paths(2,1) = 3 + 3 = 6. It is C(4,2)."],
      ["swe.bigo", 3, "Without caching, how does the running time grow?", ["Exponentially, because the same cells are recomputed many times", "Linearly in r + c", "As r × c", "Logarithmically"], "The call tree branches in two at every step down to depth r + c, and subproblems overlap heavily."],
      ["swe.dp", 2, "With memoization (or a table), the time complexity becomes:", ["O(r × c)", "O(2^(r+c))", "O(r + c)", "O(1)"], "There are only (r+1)(c+1) distinct subproblems, each computed once in O(1)."],
      ["swe.dp", 3, "In a bottom-up table, what is the rule for filling a cell not on the top row or left column?", ["dp[r][c] = dp[r−1][c] + dp[r][c−1]", "dp[r][c] = dp[r−1][c−1] + 1", "dp[r][c] = max(dp[r−1][c], dp[r][c−1])", "dp[r][c] = dp[r−1][c] × dp[r][c−1]"], "Every route arrives either from above or from the left, and those two sets do not overlap."],
    ],
  });

  S("swe.search", "A broken binary search", {
    stim: `<p>A colleague's binary search hangs on some inputs.</p>` + C(
`def search(a, t):
    lo, hi = 0, len(a) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] < t:
            lo = mid          # line 6
        else:
            hi = mid
    return lo if a[lo] == t else -1`),
    parts: [
      ["swe.search", 2, "What happens on <code>search([1, 3], 3)</code>?", ["It loops forever", "It returns 1", "It returns -1", "It raises IndexError"], "lo = 0, hi = 1, mid = 0. a[0] < 3, so lo = mid = 0. Nothing changed, so the loop never ends."],
      ["swe.search", 2, "What is the fix on line 6?", ["<code>lo = mid + 1</code>", "<code>lo = mid - 1</code>", "<code>hi = mid + 1</code>", "<code>lo = hi</code>"], "a[mid] is already known to be too small, so it can be excluded. That guarantees the range shrinks."],
      ["swe.search", 2, "After the fix, what does <code>search([1, 3, 5, 7], 5)</code> return?", ["2", "1", "3", "-1"], "lo=0, hi=3 → mid=1 (3 < 5) → lo=2 → mid=2 (5 is not < 5) → hi=2. Loop ends with lo=2 and a[2] == 5."],
      ["swe.search", 3, "After the fix, what does <code>search([2, 2, 2], 2)</code> return?", ["0, the leftmost match", "1, the middle match", "2, the rightmost match", "-1"], "Because equal values send hi leftward, the search converges on the first occurrence. This is the 'lower bound' variant."],
      ["swe.practices", 3, "After the fix, what does <code>search([], 5)</code> do, and what does that suggest?", ["Raises IndexError on a[lo]; edge cases need tests", "Returns -1 correctly", "Loops forever", "Returns 0"], "With an empty list the loop is skipped and a[0] is read. Empty input, one element and absent targets are the standard edge cases to test.", ["swe.search"]],
      ["swe.search", 2, "Why does <code>hi = mid</code> (not mid − 1) work here without hanging?", ["Integer division rounds mid down, so mid < hi whenever lo < hi", "It does hang", "Because hi is never updated", "Because the array is sorted"], "mid is always strictly less than hi inside the loop, so assigning hi = mid shrinks the range."],
    ],
  });

  S("swe.graphs", "Shortest paths in a weighted graph", {
    stim: `<p>An undirected graph. Numbers on edges are travel costs.</p>` + V.graph({ nodes: { A: [50, 110], B: [200, 45], C: [200, 175], D: [350, 110], E: [430, 110] }, edges: [["A", "B", 4], ["A", "C", 1], ["C", "B", 2], ["B", "D", 5], ["C", "D", 8], ["D", "E", 3]], w: 480, h: 220 }),
    parts: [
      ["swe.graphs", 2, "What is the cost of the cheapest path from A to B?", ["3", "4", "1", "6"], "A → C → B costs 1 + 2 = 3, beating the direct edge of 4."],
      ["swe.graphs", 2, "What is the cost of the cheapest path from A to D?", ["8", "9", "13", "5"], "A → C → B → D = 1 + 2 + 5 = 8. A → C → D costs 9 and A → B → D costs 9."],
      ["swe.graphs", 3, "In what order does Dijkstra's algorithm, started at A, finalize the nodes?", ["A, C, B, D, E", "A, B, C, D, E", "A, C, D, B, E", "A, B, D, C, E"], "It always finalizes the closest unfinalized node: A (0), C (1), B (3), D (8), E (11)."],
      ["swe.graphs", 2, "Ignoring weights, how many edges are on a shortest A-to-D path found by BFS?", ["2", "3", "1", "4"], "A–B–D or A–C–D, two edges. Note the fewest-edges path is not the cheapest path."],
      ["swe.graphs", 3, "Why can BFS not be used to find the cheapest path here?", ["BFS minimizes the number of edges and ignores their weights", "BFS only works on trees", "BFS cannot handle cycles", "BFS needs a directed graph"], "BFS is correct for unweighted graphs, where every edge costs the same."],
      ["swe.trees", 2, "Which data structure makes Dijkstra efficient at picking the next closest node?", ["A min-heap (priority queue)", "A stack", "A hash set", "A linked list"], "The heap returns the smallest tentative distance in O(log n).", ["swe.graphs"]],
    ],
  });

  S("swe.db", "Reviewing an API endpoint", {
    stim: `<p>A pull request adds this endpoint. The <code>orders</code> table has 40 million rows and is indexed only on its primary key <code>id</code>.</p>` + C(
`@app.get("/users/{user_id}/orders")
def list_orders(user_id: str):
    orders = db.query(
        "SELECT * FROM orders WHERE user_id = " + user_id)
    for o in orders:
        o.items = db.query(
            "SELECT * FROM items WHERE order_id = " + str(o.id))
    return orders`),
    parts: [
      ["swe.practices", 2, "What is the most serious problem?", ["SQL injection: user input is concatenated into the query", "The function name is too long", "It returns JSON", "It uses a for loop"], "A user_id of <code>1 OR 1=1</code> returns every user's orders, and worse is possible."],
      ["swe.practices", 2, "How should that be fixed?", ["Use parameterized queries so the driver passes values separately from SQL", "Remove spaces from the input", "Wrap the input in quotes", "Convert the input to upper case"], "Parameters are never interpreted as SQL. Hand-rolled escaping is fragile.", ["swe.db"]],
      ["swe.db", 2, "A user has 200 orders. How many queries does one request run?", ["201", "200", "2", "1"], "One query for the orders, then one per order for its items: the N+1 problem."],
      ["swe.db", 2, "How do you fix that?", ["Fetch all items in one query with <code>WHERE order_id IN (...)</code> or a join", "Add a sleep between queries", "Cache each query forever", "Use a faster loop"], "Two queries (or one join) replace 201 round trips."],
      ["swe.db", 3, "The first query is slow even for users with few orders. Why, and what fixes it?", ["It scans all 40M rows; add an index on orders(user_id)", "The table is too wide; add more columns", "SELECT * is always slow; nothing can fix it", "The primary key is wrong; drop it"], "With no index on user_id the database must check every row. An index makes the lookup logarithmic."],
      ["swe.practices", 2, "A logged-in user requests another user's orders. Which status code should the endpoint return?", ["403 Forbidden", "401 Unauthorized", "200 OK with an empty list", "500 Internal Server Error"], "The caller is authenticated but not permitted. The endpoint as written performs no such check at all."],
      ["swe.sysdesign", 3, "A user has 50,000 orders. What should the endpoint add?", ["Pagination with a limit and a cursor", "A longer timeout", "Compression only", "A second copy of the table"], "Returning unbounded result sets is slow for the client and dangerous for the server."],
    ],
  });

  S("swe.sysdesign", "Back-of-envelope capacity planning", (r) => {
    const dau = r.pick([1, 5, 10]), per = r.pick([20, 50]), peak = r.pick([3, 5]), cap = r.pick([500, 1000]), avg = (dau * 1e6 * per) / 86400, pk = avg * peak, servers = Math.ceil(pk / cap), gb = (dau * 1e6 * per * 0.1 * 2) / 1e6;
    return { stim: T(["Assumption", "Value"], [["Daily active users", dau + " million"], ["Requests per user per day", per], ["Peak-to-average traffic ratio", peak + "×"], ["Capacity of one app server", cap.toLocaleString("en-US") + " requests/s"], ["Share of requests that write data", "10%"], ["Size of each write", "2 KB"]], "Design inputs") + `<p>Use 86,400 seconds per day.</p>`,
      parts: [
        ["swe.sysdesign", 2, "What is the average request rate?", N(avg, [(dau * 1e6 * per) / 3600, (dau * 1e6) / 86400, avg * 10, avg / 10], (x) => "≈ " + Math.round(x).toLocaleString("en-US") + " requests/s"), `${dau}M × ${per} = ${(dau * per).toLocaleString("en-US")}M requests/day ÷ 86,400 ≈ ${Math.round(avg).toLocaleString("en-US")} per second.`],
        ["swe.sysdesign", 2, "What request rate should the system be sized for?", N(pk, [avg, avg * peak * peak, avg + peak, pk / 2], (x) => "≈ " + Math.round(x).toLocaleString("en-US") + " requests/s"), `Size for the peak: ${Math.round(avg).toLocaleString("en-US")} × ${peak} ≈ ${Math.round(pk).toLocaleString("en-US")} per second.`],
        ["swe.sysdesign", 2, "How many app servers are needed to carry the peak (before any redundancy)?", N(servers, [Math.ceil(avg / cap), servers * 2, servers + 3, Math.max(1, servers - 1)].filter((x) => x !== servers)), `${Math.round(pk).toLocaleString("en-US")} ÷ ${cap.toLocaleString("en-US")} = ${(pk / cap).toFixed(1)}, rounded up to ${servers}.`],
        ["swe.sysdesign", 3, "Roughly how much new data is written per day?", N(gb, [gb * 10, gb / 10, gb * 1000, gb / 2], (x) => (x >= 1 ? +x.toFixed(1) : +x.toFixed(2)) + " GB"), `${(dau * per).toLocaleString("en-US")}M requests × 10% × 2 KB = ${(dau * per * 0.2).toLocaleString("en-US")}M KB = ${+gb.toFixed(1)} GB per day.`],
        ["swe.sysdesign", 2, "Why would you provision more servers than the previous answer?", ["To survive instance failures and deployments without dropping below peak capacity", "Servers run faster in larger groups", "Load balancers require an even number", "To increase latency"], "With exactly enough servers, losing one during peak means overload. N+1 or N+2 redundancy is standard."],
        ["swe.sysdesign", 3, "90% of requests are reads of data that rarely changes. What reduces load on the database most?", ["A cache in front of the database, plus read replicas", "Sharding by write key", "A message queue for reads", "More app servers"], "Caching and replicas scale reads. Sharding and queues address write volume."],
      ] };
  });

  S("swe.sorting", "Identify the algorithm from its passes", {
    stim: `<p>An algorithm sorts <code>[5, 2, 4, 6, 1, 3]</code>. The array after each pass of its outer loop:</p>` + T(["After pass", "Array"], [[1, "[2, 5, 4, 6, 1, 3]"], [2, "[2, 4, 5, 6, 1, 3]"], [3, "[2, 4, 5, 6, 1, 3]"], [4, "[1, 2, 4, 5, 6, 3]"], [5, "[1, 2, 3, 4, 5, 6]"]]),
    parts: [
      ["swe.sorting", 2, "Which algorithm is this?", ["Insertion sort", "Selection sort", "Bubble sort", "Merge sort"], "After pass k the first k+1 elements are sorted among themselves, and each pass slides one new element left into place."],
      ["swe.sorting", 2, "Why did pass 3 change nothing?", ["The next element, 6, was already larger than everything in the sorted prefix", "The algorithm skipped a step", "6 is the maximum, so it was removed", "A swap failed"], "Insertion sort does a single comparison when the new element is already in position."],
      ["swe.sorting", 2, "What would selection sort produce after its FIRST pass on the same input?", ["[1, 2, 4, 6, 5, 3]", "[2, 5, 4, 6, 1, 3]", "[2, 4, 5, 1, 3, 6]", "[1, 5, 2, 4, 6, 3]"], "Selection sort finds the minimum (1) and swaps it with the first element (5)."],
      ["swe.sorting", 2, "What would bubble sort produce after its FIRST pass on the same input?", ["[2, 4, 5, 1, 3, 6]", "[1, 2, 4, 6, 5, 3]", "[2, 5, 4, 6, 1, 3]", "[5, 2, 4, 1, 3, 6]"], "Adjacent swaps carry the largest value, 6, to the end: 5↔2, 5↔4, (5,6 stay), 6↔1, 6↔3."],
      ["swe.bigo", 2, "How many comparisons does insertion sort make on an already sorted array of n elements?", ["n − 1", "n²", "n log n", "n(n − 1)/2"], "Each new element is compared once with its left neighbor and stays put, giving O(n)."],
      ["swe.sorting", 2, "Is insertion sort stable?", ["Yes: an element only moves past strictly larger ones", "No", "Only for integers", "Only when the input is sorted"], "Equal elements never overtake each other, so their original order is preserved."],
    ],
  });

  S("swe.dp", "Filling a coin-change table", {
    stim: `<p>Coins of value 1, 3 and 4 are available in unlimited supply. <code>dp[a]</code> is the fewest coins needed to make amount <code>a</code>.</p>` + T(["a", 0, 1, 2, 3, 4, 5, 6, 7], [["dp[a]", 0, 1, 2, 1, 1, 2, "?", "?"]]),
    parts: [
      ["swe.dp", 2, "What is the recurrence?", ["dp[a] = 1 + min(dp[a−1], dp[a−3], dp[a−4])", "dp[a] = dp[a−1] + dp[a−3] + dp[a−4]", "dp[a] = 1 + dp[a−4]", "dp[a] = max(dp[a−1], dp[a−3], dp[a−4])"], "Try each coin as the last one used and keep the best. (Skip coins larger than a.)"],
      ["swe.dp", 2, "What is dp[6]?", ["2", "3", "1", "4"], "1 + min(dp[5], dp[3], dp[2]) = 1 + min(2, 1, 2) = 2, using 3 + 3."],
      ["swe.dp", 2, "What is dp[7]?", ["2", "3", "4", "1"], "1 + min(dp[6], dp[4], dp[3]) = 1 + min(2, 1, 1) = 2, using 4 + 3."],
      ["swe.dp", 3, "How many coins does the greedy strategy (largest coin first) use for 6?", ["3 (4 + 1 + 1), which is not optimal", "2 (3 + 3)", "1", "6"], "Greedy grabs the 4 and is then forced into two 1s. This coin system is one where greedy fails."],
      ["swe.bigo", 2, "What is the time complexity for amount A with k coin types?", ["O(A × k)", "O(k^A)", "O(A + k)", "O(A²)"], "Each of the A table entries looks at k coins."],
      ["swe.dp", 3, "The table gives the number of coins. How do you recover WHICH coins were used?", ["Store, for each amount, the coin that achieved the minimum, then walk back from A", "It is impossible", "Run greedy afterward", "Sort the dp array"], "Keeping a parent pointer per state is the standard way to reconstruct a DP solution."],
    ],
  });

  S("swe.sysdesign", "Tracing an LRU cache", {
    stim: `<p>An LRU (least recently used) cache with <b>capacity 2</b>. Both <code>get</code> and <code>put</code> count as a use. <code>get</code> returns −1 on a miss.</p>` + C(
`cache = LRUCache(2)
cache.put(1, "a")     # step 1
cache.put(2, "b")     # step 2
cache.get(1)          # step 3
cache.put(3, "c")     # step 4
cache.get(2)          # step 5
cache.put(4, "d")     # step 6
cache.get(1)          # step 7
cache.get(3)          # step 8`),
    parts: [
      ["swe.sysdesign", 2, "Which key is evicted at step 4?", ["2", "1", "3", "None"], "After step 3, key 1 was used most recently, so key 2 is the least recently used and is evicted to make room for 3."],
      ["swe.sysdesign", 1, "What does step 5 return?", ["−1", "\"b\"", "\"a\"", "\"c\""], "Key 2 was evicted at step 4, so this is a miss."],
      ["swe.sysdesign", 3, "Which key is evicted at step 6?", ["1", "3", "2", "4"], "The cache holds 1 and 3. Key 3 was written at step 4, after key 1's last use at step 3. The miss at step 5 touches nothing. So 1 is the least recently used."],
      ["swe.sysdesign", 2, "What do steps 7 and 8 return?", ["−1 and \"c\"", "\"a\" and \"c\"", "\"a\" and −1", "−1 and −1"], "Key 1 was evicted at step 6. Key 3 is still present."],
      ["swe.linked", 3, "Which pair of data structures gives O(1) get and put?", ["A hash map plus a doubly linked list", "Two arrays", "A binary search tree", "A single stack"], "The map finds a node instantly; the linked list moves it to the front and removes the tail in O(1).", ["swe.sysdesign"]],
      ["swe.sysdesign", 2, "For which access pattern is LRU a poor choice?", ["A one-off scan over many cold keys, which flushes the genuinely hot ones", "A few keys requested over and over", "Recently used keys being requested again", "A cache larger than the data"], "LRU bets on recency. A large sequential scan makes everything look recent and evicts useful entries."],
    ],
  });

  S("swe.linked", "A mystery linked-list function", {
    stim: C(
`class Node:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def mystery(head):
    prev = None
    while head:
        nxt = head.next       # line A
        head.next = prev      # line B
        prev = head
        head = nxt
    return prev`),
    parts: [
      ["swe.linked", 2, "Called on the list 1 → 2 → 3, what does <code>mystery</code> return?", ["3 → 2 → 1", "1 → 2 → 3", "Just the node 3", "None"], "Each node's pointer is flipped to point at its predecessor. prev ends on the old tail, now the head."],
      ["swe.linked", 1, "What does the function do?", ["Reverses the list in place", "Deletes the list", "Finds the middle node", "Detects a cycle"], "It is the standard iterative reversal."],
      ["swe.bigo", 2, "What are its time and extra space complexity?", ["O(n) time, O(1) space", "O(n) time, O(n) space", "O(n²) time, O(1) space", "O(1) time, O(1) space"], "One pass with three pointers. No new nodes are created."],
      ["swe.linked", 3, "What goes wrong if line A is deleted and the last line of the loop becomes <code>head = head.next</code>?", ["The rest of the list is lost, because head.next was already overwritten", "Nothing changes", "The list is sorted instead", "It raises a syntax error"], "After line B, head.next points backward. The original next node must be saved first."],
      ["swe.linked", 2, "What does it return for an empty list (<code>head = None</code>)?", ["None", "An error", "An empty Node", "0"], "The loop body never runs and prev is still None, which is the correct reversal of an empty list."],
      ["swe.recursion", 3, "A recursive version of this function uses how much extra space?", ["O(n), for the call stack", "O(1)", "O(log n)", "O(n²)"], "One stack frame per node. For very long lists the iterative version avoids hitting the recursion limit.", ["swe.linked"]],
    ],
  });

  S("swe.trees", "A binary search tree", {
    stim: `<p>A binary search tree:</p>` + C(
`            50
          /    \\
        30      70
       /  \\    /  \\
     20    40 60    80
            \\
             45`),
    parts: [
      ["swe.trees", 1, "What is the in-order traversal?", ["20, 30, 40, 45, 50, 60, 70, 80", "50, 30, 20, 40, 45, 70, 60, 80", "20, 45, 40, 30, 60, 80, 70, 50", "50, 30, 70, 20, 40, 60, 80, 45"], "Left, node, right. For a BST this is always sorted order."],
      ["swe.trees", 2, "What is the pre-order traversal?", ["50, 30, 20, 40, 45, 70, 60, 80", "20, 30, 40, 45, 50, 60, 70, 80", "50, 30, 70, 20, 40, 60, 80, 45", "20, 45, 40, 30, 60, 80, 70, 50"], "Node, left, right."],
      ["swe.trees", 2, "What is the level-order (breadth-first) traversal?", ["50, 30, 70, 20, 40, 60, 80, 45", "50, 30, 20, 40, 45, 70, 60, 80", "20, 30, 40, 45, 50, 60, 70, 80", "45, 20, 40, 60, 80, 30, 70, 50"], "Visit each depth from left to right, using a queue."],
      ["swe.trees", 2, "Searching for 45, which nodes are compared, in order?", ["50, 30, 40, 45", "50, 70, 60, 45", "50, 30, 20, 40, 45", "45 only"], "45 < 50 go left; 45 > 30 go right; 45 > 40 go right; found."],
      ["swe.trees", 2, "Where would 65 be inserted?", ["As the right child of 60", "As the left child of 70", "As the left child of 80", "As the right child of 45"], "65 > 50 right; 65 < 70 left; 65 > 60 and 60 has no right child, so it goes there."],
      ["swe.trees", 3, "What is the in-order successor of 45?", ["50", "40", "60", "30"], "45 has no right subtree, so its successor is the nearest ancestor for which 45 lies in the left subtree: 50."],
    ],
  });

  S("swe.practices", "A failing test and a git history", {
    stim: `<p>CI on the <code>main</code> branch turned red. Recent history, newest first:</p>` + C(
`* 9f3c1a2  (HEAD -> main)  Merge branch 'feature/discounts'
|\\
| * 7b21e90  Apply discount before tax
| * 4d8f0c3  Add discount field to Order
* | c5a9e11  Bump tax rate to 21%
|/
* 2e6d7f8  Release 4.2            <- last green build

FAILED tests/test_order.py::test_total_with_discount_and_tax
  assert order.total() == 108.90
  AssertionError: 114.95 != 108.90`),
    parts: [
      ["swe.practices", 2, "Both branches passed CI on their own. Why can the merge still fail?", ["The changes interact: one branch's tests assumed the other's behavior had not changed", "Merge commits always fail", "CI was misconfigured", "Git lost a commit"], "A textually clean merge is not a semantically clean one. The tax-rate change and the discount logic meet only on main."],
      ["swe.practices", 2, "Which command finds the first bad commit by binary search?", ["<code>git bisect</code>", "<code>git blame</code>", "<code>git stash</code>", "<code>git cherry-pick</code>"], "bisect checks out midpoints between a known good and a known bad commit until it isolates the culprit."],
      ["swe.practices", 3, "The fastest safe way to make main green while the cause is investigated is:", ["Revert the merge commit with a new commit", "Force-push main back to 2e6d7f8", "Delete the failing test", "Rebase main onto the feature branch"], "A revert preserves history and is safe on a shared branch. Force-pushing rewrites history that others have already pulled."],
      ["swe.practices", 2, "What kind of test caught this?", ["A test spanning discount and tax logic together, closer to an integration test", "A load test", "A snapshot of the UI", "A linter"], "Unit tests of each piece passed. Only a test that exercises both together sees the interaction."],
      ["swe.practices", 3, "Which practice would have caught this before the merge reached main?", ["Running CI on the feature branch merged with the latest main before allowing the merge", "Larger pull requests", "Skipping tests on feature branches", "Committing directly to main"], "Testing the would-be merge result (a merge queue or 'require branch up to date') exposes interaction failures in advance."],
    ],
  });

  S("swe.recursion", "Generating subsets with backtracking", {
    stim: C(
`def subsets(nums):
    out, path = [], []
    def go(i):
        if i == len(nums):
            out.append(path[:])      # line A
            return
        go(i + 1)                    # skip nums[i]
        path.append(nums[i])         # choose
        go(i + 1)                    # explore
        path.pop()                   # un-choose
    go(0)
    return out`),
    parts: [
      ["swe.recursion", 2, "How many lists does <code>subsets([1, 2, 3])</code> return?", ["8", "6", "3", "7"], "Each element is in or out: 2³ = 8, including the empty set."],
      ["swe.recursion", 3, "What is the FIRST list appended to <code>out</code>?", ["[]", "[1, 2, 3]", "[1]", "[3]"], "The code always tries 'skip' first, so the first leaf reached has skipped every element."],
      ["swe.recursion", 3, "What is the SECOND list appended?", ["[3]", "[1]", "[1, 2]", "[2]"], "Backtracking from the deepest call, the last decision (about 3) is flipped first."],
      ["swe.recursion", 3, "What happens if line A is changed to <code>out.append(path)</code>?", ["Every entry in out is the same list object, which ends up empty", "Nothing changes", "It raises an error", "Only the first subset is stored"], "<code>path</code> is mutated throughout. Without the copy, out holds 8 references to one list, which is empty once all the pops have run."],
      ["swe.recursion", 2, "What is the purpose of <code>path.pop()</code>?", ["To undo the choice so the caller's state is restored", "To remove the largest element", "To end the recursion early", "To copy the path"], "Choose, explore, un-choose. Without it, elements would leak into sibling branches."],
      ["swe.bigo", 3, "What is the time complexity for n elements?", ["O(n · 2ⁿ)", "O(n²)", "O(2ⁿ) exactly, with no extra factor", "O(n!)"], "There are 2ⁿ subsets and copying each costs up to O(n)."],
    ],
  });
})();
