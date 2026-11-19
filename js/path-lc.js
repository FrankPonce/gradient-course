/* The LeetCode path: 15 units of small lessons. First option in every multiple choice is the correct one (shuffled at runtime). */
(function () {
  const T = (text, viz, title) => ({ k: "learn", text, viz, title });
  const Q = (prompt, opts, why, code) => ({ k: "mcq", prompt, opts, why, code });
  const F = (prompt, code, answers, extra, why) => ({ k: "fill", prompt, code, answers, extra, why });
  const O = (prompt, lines, why, extra) => ({ k: "ord", prompt, lines, why, extra });
  const L = (title, skill, cards, kind) => ({ title, skill, cards, kind });
  const P = (title, skill, cards) => L(title, skill, cards, "problem");
  const V = (id, input, code) => ({ id, input, code });

  const DEF = {
    title: "LeetCode, one step at a time", color: "var(--t-lc)",
    blurb: "From Big-O to dynamic programming in bite-sized lessons. Watch each idea animate, then solve classic interview problems block by block.",
    units: [
      { title: "Big-O basics", sub: "How fast is fast enough?", guide: "lc.complexity", lessons: [
        L("What Big-O measures", "lc.complexity", [
          T("<p><b>Big-O</b> describes how an algorithm's work grows as the input grows.</p><p>We drop constants and keep only the fastest-growing term: <code>3n + 5</code> is <b>O(n)</b>, and <code>2n² + 100n</code> is <b>O(n²)</b>.</p>"),
          Q("Simplify <code>5n² + 3n + 10</code>.", ["O(n²)", "O(5n²)", "O(n)", "O(n² + n)"], "Drop constants and lower-order terms."),
          T("<p>The usual suspects, from best to worst:</p><p><b>O(1)</b> constant · <b>O(log n)</b> · <b>O(n)</b> · <b>O(n log n)</b> · <b>O(n²)</b> · <b>O(2ⁿ)</b></p><p>Double the input: O(n) work doubles, O(n²) work quadruples.</p>"),
          Q("The input doubles. An O(n²) algorithm now does about…", ["4× the work", "2× the work", "the same work", "8× the work"], "(2n)² = 4n²."),
          Q("For a huge n, which is fastest?", ["O(log n)", "O(n)", "O(n log n)", "O(n²)"], "log n barely grows: log₂ of a billion is about 30."),
          Q("<code>x in nums</code> where nums is a Python list is…", ["O(n)", "O(1)", "O(log n)", "O(n²)"], "A list is scanned element by element."),
        ]),
        L("Counting loops", "lc.complexity", [
          T("<p>One loop over n items: <b>O(n)</b>. A loop inside a loop over the same items: <b>O(n²)</b>.</p><p>Loops one <i>after</i> another add up, and O(n) + O(n) is still O(n).</p>"),
          Q("What's the complexity?", ["O(n²)", "O(n)", "O(2n)", "O(log n)"], "n iterations, each doing n iterations.", "for i in range(n):\n    for j in range(n):\n        total += 1"),
          Q("And this one?", ["O(n)", "O(n²)", "O(2n)", "O(1)"], "Two separate passes: 2n, which is O(n).", "for x in nums:\n    total += x\nfor x in nums:\n    biggest = max(biggest, x)"),
          Q("How about halving?", ["O(log n)", "O(n)", "O(n / 2)", "O(1)"], "Halving n repeatedly takes about log₂ n steps.", "i = n\nwhile i > 1:\n    i = i // 2"),
          Q("Inner loop starts at i. Complexity?", ["O(n²)", "O(n)", "O(n log n)", "O(log n)"], "About n²/2 iterations, still O(n²).", "for i in range(n):\n    for j in range(i, n):\n        check(i, j)"),
          Q("Sort, then one loop. Complexity?", ["O(n log n)", "O(n)", "O(n²)", "O(log n)"], "The sort dominates.", "nums.sort()\nfor x in nums:\n    print(x)"),
        ]),
        L("Reading the constraints", "lc.complexity", [
          T("<p>A judge runs roughly <b>10⁸ simple steps per second</b>.</p><p>So the input limit hints at the intended solution: n ≤ 20 allows O(2ⁿ); n ≤ 5,000 allows O(n²); n ≤ 10⁵ needs O(n log n) or better.</p>"),
          Q("n ≤ 10⁵. Which will probably time out?", ["O(n²)", "O(n log n)", "O(n)", "O(log n)"], "(10⁵)² = 10¹⁰ steps."),
          Q("n ≤ 20. Trying every subset (2ⁿ) is…", ["Fine: about a million", "Far too slow", "Impossible to code", "Only OK in C++"], "2²⁰ ≈ 1,000,000."),
          Q("Which is a hidden O(n) cost in Python?", ["<code>s[1:]</code> slicing copies the string", "<code>len(nums)</code>", "<code>d[key]</code> lookup", "<code>nums.append(x)</code>"], "Slicing builds a new copy."),
          Q("n ≤ 10⁹ and the input is a sorted range. Aim for…", ["O(log n)", "O(n)", "O(n log n)", "O(n²)"], "You can't even read 10⁹ items in time. Binary search."),
        ]),
      ]},
      { title: "Hash maps", sub: "Remember what you've seen", guide: "lc.hashing", lessons: [
        L("Instant lookups", "lc.hashing", [
          T("<p>A <b>set</b> or <b>dict</b> finds an item in <b>O(1)</b> on average.</p><p>That turns \"search the whole list\" into a single step, and many O(n²) solutions into O(n).</p>"),
          Q("Which membership check is fastest?", ["<code>x in a_set</code>", "<code>x in a_list</code>", "<code>a_list.index(x)</code>", "<code>sorted(a_list)</code>"], "Sets hash; lists scan."),
          T("<p><b>Contains Duplicate:</b> does any value appear twice?</p><p>Walk the list once, remembering everything you've seen in a set. Seen it already? Duplicate.</p>", null, "Problem warm-up"),
          F("Complete <b>Contains Duplicate</b>.", "def has_dup(nums):\n    seen = ___\n    for x in nums:\n        if x ___ seen:\n            return True\n        seen.___(x)\n    return False", ["set()", "in", "add"], ["[]", "not in", "append"], "An empty set, a membership test, then add."),
          Q("Its time complexity?", ["O(n)", "O(n²)", "O(n log n)", "O(1)"], "One pass with O(1) set operations."),
        ]),
        L("Counting things", "lc.hashing", [
          T("<p>A dict can <b>count</b>: <code>counts[x] = counts.get(x, 0) + 1</code>.</p><p>Python's <code>Counter</code> does it in one line.</p>"),
          Q("What does this print?", ["3", "2", "1", "6"], "'banana' has three a's.", "from collections import Counter\nprint(Counter('banana')['a'])"),
          T("<p><b>Valid Anagram:</b> two strings are anagrams if every letter appears the same number of times. 'listen' and 'silent' are.</p>"),
          O("Order the lines of <b>Valid Anagram</b> (the body of the function).", ["counts = {}", "for ch in s:", "    counts[ch] = counts.get(ch, 0) + 1", "for ch in t:", "    counts[ch] = counts.get(ch, 0) - 1", "return all(v == 0 for v in counts.values())"], "Count up for s, down for t; anagrams cancel to all zeros."),
          Q("Which key groups anagrams together?", ["<code>''.join(sorted(word))</code>", "<code>len(word)</code>", "<code>word[0]</code>", "<code>word</code>"], "All anagrams share the same sorted letters."),
        ]),
        P("Two Sum", "lc.hashing", [
          T("<p><b>Two Sum.</b> Given a list <code>nums</code> and a <code>target</code>, return the indexes of the two numbers that add up to target. There's exactly one answer.</p><p>nums = [2, 7, 11, 15], target = 9 → <b>[0, 1]</b>.</p>"),
          Q("Checking every pair costs…", ["O(n²)", "O(n)", "O(n log n)", "O(2ⁿ)"], "n · (n − 1) / 2 pairs."),
          Q("You're at a number x. Which partner do you need?", ["target − x", "target + x", "x − target", "target / x"], "x + partner = target."),
          T("<p>So keep a dict of <b>value → index</b> for everything seen so far. At each x, ask: is <code>target − x</code> already in it?</p><p>One pass, O(n).</p>"),
          F("Fill in <b>Two Sum</b>.", "def two_sum(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        need = ___\n        if need in seen:\n            return [___, i]\n        seen[x] = ___", ["target - x", "seen[need]", "i"], ["x - target", "need", "x"], "Look up the partner's index, else store yours."),
          Q("nums = [3, 2, 4], target = 6. What's returned?", ["[1, 2]", "[0, 0]", "[0, 2]", "[2, 1]"], "3 can't pair with itself: we check before storing. 2 + 4 = 6."),
        ]),
        P("Group Anagrams", "lc.hashing", [
          T("<p><b>Group Anagrams.</b> Given a list of words, group the anagrams together.</p><p>[\"eat\", \"tea\", \"tan\", \"ate\", \"nat\", \"bat\"] → [[\"eat\",\"tea\",\"ate\"], [\"tan\",\"nat\"], [\"bat\"]]</p>"),
          Q("What should the dictionary key be?", ["The word's letters, sorted", "The word's length", "The first letter", "A random number"], "'eat', 'tea' and 'ate' all sort to 'aet'."),
          O("Put the solution in order.", ["groups = defaultdict(list)", "for w in words:", "    key = ''.join(sorted(w))", "    groups[key].append(w)", "return list(groups.values())"], "Key each word, append to its group, return the groups."),
          Q("n words of length k. Complexity?", ["O(n · k log k)", "O(n²)", "O(n)", "O(k²)"], "Each word is sorted once."),
          Q("A key that avoids sorting?", ["A tuple of 26 letter counts", "The word reversed", "The word's length", "The last letter"], "Counting letters is O(k)."),
        ]),
      ]},
      { title: "Two pointers", sub: "Walk in from both ends", guide: "lc.twoptr", lessons: [
        L("Pointers from both ends", "lc.twoptr", [
          T("<p>On a <b>sorted</b> array, put one pointer at each end. Sum too small? Move <b>left</b> right. Too big? Move <b>right</b> left.</p><p>Watch it hunt for 13:</p>", V("lc-twoptr", { a: "1, 2, 4, 6, 8, 9, 14, 15", t: "13" })),
          Q("The sum is too small. Which pointer moves?", ["left, to the right", "right, to the left", "both", "neither"], "Moving left right makes the sum bigger."),
          Q("Why is it safe to drop a[l] when a[l] + a[r] is too small?", ["Every other partner for a[l] is even smaller", "a[l] is negative", "The array is reversed", "It isn't safe"], "a[r] is the biggest partner a[l] could have."),
          F("Complete the loop.", "l, r = 0, len(a) - 1\nwhile ___:\n    s = a[l] + a[r]\n    if s == target:\n        return [l, r]\n    if s < target:\n        ___\n    else:\n        ___", ["l < r", "l += 1", "r -= 1"], ["l != 0", "l -= 1", "r += 1"], "Stop when the pointers meet."),
          Q("Complexity of the scan?", ["O(n)", "O(n²)", "O(log n)", "O(n log n)"], "Each step moves one pointer inward."),
        ]),
        P("Valid Palindrome", "lc.twoptr", [
          T("<p><b>Valid Palindrome.</b> Ignoring case and anything that isn't a letter or digit, does the string read the same both ways?</p><p>\"A man, a plan, a canal: Panama\" → <b>True</b></p>"),
          Q("Where do the two pointers start?", ["At both ends", "Both at the start", "In the middle", "Anywhere"], "Compare outside in."),
          O("Order the loop.", ["l, r = 0, len(s) - 1", "while l < r:", "    if not s[l].isalnum(): l += 1; continue", "    if not s[r].isalnum(): r -= 1; continue", "    if s[l].lower() != s[r].lower(): return False", "    l += 1; r -= 1", "return True"], "Skip junk, compare, step inward."),
          Q("Extra space used?", ["O(1)", "O(n)", "O(n²)", "O(log n)"], "Building a cleaned copy would cost O(n); pointers don't."),
        ]),
        P("Container With Most Water", "lc.twoptr", [
          T("<p><b>Container With Most Water.</b> Vertical lines of the given heights stand at x = 0, 1, 2… Pick two lines; the water they hold is <code>min(h[l], h[r]) × (r − l)</code>. Find the most.</p><p>heights = [1, 8, 6, 2, 5, 4, 8, 3, 7] → <b>49</b></p>"),
          Q("Area between height 8 at x = 1 and height 7 at x = 8?", ["49", "56", "63", "15"], "min(8, 7) × (8 − 1) = 49."),
          Q("Start with the widest pair. Then move…", ["The shorter wall inward", "The taller wall inward", "Both walls", "The middle"], "The shorter wall limits the area."),
          Q("Why is moving the taller wall pointless?", ["Width shrinks and the height is still capped by the shorter wall", "It's illegal", "The taller wall is always in the answer", "It's slower"], "The area can only go down."),
        ]),
        P("3Sum", "lc.twoptr", [
          T("<p><b>3Sum.</b> Find all <i>unique</i> triplets that sum to zero.</p><p>[-1, 0, 1, 2, -1, -4] → [[-1, -1, 2], [-1, 0, 1]]</p>"),
          Q("First step?", ["Sort the array", "Build a trie", "Use a heap", "Reverse it"], "Sorting enables two pointers and easy duplicate skipping."),
          Q("After fixing nums[i], the rest is…", ["Two Sum on a sorted array: two pointers", "A binary search for one value", "A DP problem", "A graph"], "Find two numbers summing to −nums[i]."),
          Q("Total complexity?", ["O(n²)", "O(n³)", "O(n log n)", "O(n)"], "n choices of i, each with a linear scan."),
          Q("How are duplicate triplets avoided?", ["Skip a value equal to the one before it at the same position", "Store triplets in a set of lists", "Shuffle the input", "They can't be"], "Equal neighbors would produce the same triplet."),
        ]),
      ]},
      { title: "Sliding window", sub: "Grow, shrink, repeat", guide: "lc.window", lessons: [
        L("Grow and shrink", "lc.window", [
          T("<p>A <b>window</b> is a contiguous slice [left, right]. Move <b>right</b> to grow it. When it breaks the rule, move <b>left</b> to shrink it.</p><p>Here, the rule is \"no repeated letters\":</p>", V("lc-window", { s: "abcabcbb" })),
          Q("Sliding windows work on…", ["Contiguous subarrays or substrings", "Any subset", "Trees", "Sorted pairs only"], "The window is always one unbroken slice."),
          Q("Why is it O(n) even with a loop inside a loop?", ["left only moves forward, so each item leaves once", "The inner loop runs once", "Hashing", "It's actually O(n²)"], "At most 2n pointer moves in total."),
        ]),
        L("Fixed-size windows", "lc.window", [
          T("<p>For a window of exactly <b>k</b> items, slide it: add the new item, subtract the one that fell off. No re-summing.</p>"),
          F("Max sum of any k consecutive numbers.", "s = sum(a[:k])\nbest = s\nfor i in range(k, len(a)):\n    s += a[i] - ___\n    best = ___(best, s)", ["a[i - k]", "max"], ["a[k]", "min", "a[i - 1]"], "The item leaving is k steps behind."),
          Q("a = [2, 1, 5, 1, 3, 2], k = 3. Best window sum?", ["9", "8", "6", "11"], "Windows: 8, 7, 9, 6."),
          Q("Window statistics with negatives in a <i>variable</i> window are a problem because…", ["Shrinking can make the sum bigger", "Negatives can't be added", "Windows must be sorted", "They aren't"], "The window needs a monotonic rule; use prefix sums instead."),
        ]),
        P("Longest Substring Without Repeating Characters", "lc.window", [
          T("<p><b>Longest Substring Without Repeating Characters.</b> Return the length of the longest substring with all-different characters.</p><p>\"abcabcbb\" → <b>3</b> (\"abc\")</p>"),
          Q("For \"pwwkew\", the answer is…", ["3 (\"wke\")", "4 (\"pwke\")", "2", "6"], "\"pwke\" isn't contiguous."),
          F("Complete it.", "seen = {}\nleft = best = 0\nfor right, ch in enumerate(s):\n    if ch in seen and seen[ch] >= ___:\n        left = seen[ch] + 1\n    seen[ch] = ___\n    best = max(best, right - left + 1)", ["left", "right"], ["0", "best", "ch"], "Only jump if the old copy is inside the window."),
          Q("Why the <code>seen[ch] >= left</code> check?", ["The old copy might already be outside the window", "To save memory", "Strings are immutable", "It isn't needed"], "Without it, \"abba\" gives 3 instead of 2."),
        ]),
        P("Best Time to Buy and Sell Stock", "lc.window", [
          T("<p><b>Best Time to Buy and Sell Stock.</b> Buy one day, sell on a later day. Max profit?</p><p>[7, 1, 5, 3, 6, 4] → <b>5</b> (buy at 1, sell at 6)</p>"),
          Q("While scanning left to right, track…", ["The lowest price so far", "The highest price so far", "Every pair of days", "The average"], "Each day, the best sale is today's price minus the lowest before it."),
          F("Fill it in.", "low = float('inf')\nbest = 0\nfor p in prices:\n    low = ___(low, p)\n    best = max(best, p - ___)", ["min", "low"], ["max", "best", "p"], "Update the low, then the profit."),
          Q("Prices [7, 6, 4, 3, 1]. Profit?", ["0", "6", "-6", "1"], "Prices only fall, so don't trade."),
        ]),
      ]},
      { title: "Prefix sums", sub: "Range sums in O(1)", guide: "lc.prefix", lessons: [
        L("Running totals", "lc.prefix", [
          T("<p>Precompute <code>P[i]</code> = sum of the first i items. Then any range sum is one subtraction: <code>sum(a[l..r]) = P[r+1] − P[l]</code>.</p>"),
          Q("a = [3, 1, 4, 1, 5]. P (starting with 0) is…", ["[0, 3, 4, 8, 9, 14]", "[3, 4, 8, 9, 14]", "[0, 3, 1, 4, 1, 5]", "[14, 11, 10, 6, 5]"], "Running totals with a leading 0."),
          Q("Using P, sum of a[1..3] is…", ["P[4] − P[1] = 6", "P[3] − P[1] = 5", "P[4] − P[0] = 9", "P[3] = 8"], "1 + 4 + 1 = 6."),
          T("<p>Store how often each prefix sum appears and you can count subarrays with a target sum in one pass, negatives included:</p>", V("lc-prefix", { a: "1, 2, 1, -1, 2, 3", k: "3" })),
        ]),
        P("Subarray Sum Equals K", "lc.prefix", [
          T("<p><b>Subarray Sum Equals K.</b> Count contiguous subarrays summing to k. Numbers can be negative.</p><p>nums = [1, 1, 1], k = 2 → <b>2</b></p>"),
          Q("Why not a sliding window?", ["Negatives break the grow/shrink logic", "Windows can't count", "k could be zero", "It's too fast"], "Shrinking may increase the sum."),
          F("Complete it.", "count = {0: 1}\npre = ans = 0\nfor x in nums:\n    pre += x\n    ans += count.get(___, 0)\n    count[pre] = count.get(pre, 0) + ___", ["pre - k", "1"], ["pre + k", "k", "0"], "A subarray ending here sums to k when an earlier prefix equals pre − k."),
          Q("Why start with <code>{0: 1}</code>?", ["So subarrays starting at index 0 count", "To avoid division by zero", "k is never 0", "It's optional"], "The empty prefix has sum 0."),
        ]),
        P("Product of Array Except Self", "lc.prefix", [
          T("<p><b>Product of Array Except Self.</b> For each i, the product of every other element. No division allowed.</p><p>[1, 2, 3, 4] → <b>[24, 12, 8, 6]</b></p>"),
          Q("answer[i] equals…", ["product of everything left of i × product of everything right of i", "total product / nums[i]", "nums[i] squared", "sum of the others"], "Two passes: prefix products, then suffix products."),
          Q("[2, 3, 5] → ?", ["[15, 10, 6]", "[30, 30, 30]", "[6, 10, 15]", "[3, 5, 2]"], "3·5, 2·5, 2·3."),
          Q("Time complexity?", ["O(n)", "O(n²)", "O(n log n)", "O(1)"], "Two linear passes."),
        ]),
      ]},
      { title: "Binary search", sub: "Halve the problem", guide: "lc.bsearch", lessons: [
        L("Halving the range", "lc.bsearch", [
          T("<p>On sorted data, check the middle and throw away the half that can't hold the answer. Every step halves the range.</p>", V("lc-bsearch", { a: "2, 3, 3, 5, 7, 7, 7, 10, 12, 15", t: "7" })),
          Q("At most how many steps for 1,000,000 sorted items?", ["About 20", "About 1,000", "About 500,000", "About 100"], "2²⁰ ≈ 1,000,000."),
          Q("Binary search needs…", ["A monotonic condition, like sorted data", "Unique values", "A power-of-two size", "A hash map"], "False…false, true…true is enough."),
        ]),
        L("The safe template", "lc.bsearch", [
          T("<p>Use one template everywhere: a half-open range <code>[lo, hi)</code>, and find the <b>first index where a condition is true</b>.</p>"),
          F("Finish the lower-bound template.", "lo, hi = 0, len(a)\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if a[mid] >= target:\n        hi = ___\n    else:\n        lo = ___\nreturn lo", ["mid", "mid + 1"], ["mid - 1", "lo + 1"], "mid might be the answer; anything ≤ mid that fails is out."),
          Q("<code>lo = mid</code> (instead of mid + 1) can cause…", ["An infinite loop", "A wrong answer only for odd n", "Faster search", "Nothing"], "When hi = lo + 1, mid = lo and the range never shrinks."),
          Q("Target bigger than everything. The template returns…", ["len(a): one past the end", "-1", "0", "It crashes"], "That's where it would be inserted."),
        ]),
        P("Koko Eating Bananas", "lc.bsearch", [
          T("<p><b>Koko Eating Bananas.</b> Koko eats k bananas per hour, one pile at a time (a small pile still takes a full hour). Find the smallest k that finishes all piles within h hours.</p><p>piles = [3, 6, 7, 11], h = 8 → <b>4</b></p>"),
          Q("If speed k finishes in time, then…", ["Every faster speed does too", "Every slower speed does too", "Nothing else is known", "Only k works"], "That monotonic yes/no is what makes binary search work."),
          Q("What range do we search?", ["Speeds from 1 to max(piles)", "Indexes of piles", "Hours 1 to h", "Every subset"], "Search over answers, not positions."),
          F("Hours needed at speed k.", "hours = sum(___ for p in piles)", ["(p + k - 1) // k"], ["p // k", "p * k"], "Ceiling division: a partial hour counts as a full one."),
        ]),
        P("Search in Rotated Sorted Array", "lc.bsearch", [
          T("<p><b>Search in Rotated Sorted Array.</b> A sorted array was rotated: [4, 5, 6, 7, 0, 1, 2]. Find a target's index in O(log n).</p>"),
          Q("At any mid, what is always true?", ["At least one half is sorted", "Both halves are sorted", "The pivot is at mid", "Nothing"], "Compare nums[lo] with nums[mid] to see which."),
          Q("Left half [4, 5, 6, 7] is sorted; target is 1. Go…", ["Right: 1 isn't between 4 and 7", "Left", "Stop: not found", "Both ways"], "It can only be in the other half."),
          Q("Complexity?", ["O(log n)", "O(n)", "O(n log n)", "O(1)"], "Still halving each step."),
        ]),
      ]},
      { title: "Stacks", sub: "Last in, first out", guide: "lc.stack", lessons: [
        P("Valid Parentheses", "lc.stack", [
          T("<p>A <b>stack</b> hands back the most recent item first. That's exactly how brackets nest: the last one opened must close first.</p><p><b>Valid Parentheses:</b> \"([]{})\" → True, \"(]\" → False.</p>"),
          O("Order the loop.", ["stack = []", "for c in s:", "    if c in '([{':", "        stack.append(c)", "    elif not stack or stack.pop() != pairs[c]:", "        return False", "return not stack"], "Push openers; each closer must match the top."),
          Q("\"((\" ends with a non-empty stack. Valid?", ["No: brackets left open", "Yes", "Only if even length", "Crash"], "That's why we return <code>not stack</code>."),
        ]),
        L("Monotonic stacks", "lc.stack", [
          T("<p>Keep a stack of items still waiting for a bigger value. Each new value pops everyone it beats. That's the <b>next greater element</b>:</p>", V("lc-monostack", { a: "2, 7, 3, 5, 4, 6, 8, 1" })),
          Q("Why is this O(n)?", ["Each index is pushed and popped at most once", "The stack has 2 items", "Binary search", "It's O(n²)"], "n pushes, at most n pops."),
          Q("[2, 7, 3, 5]: next greater element of 3?", ["5", "7", "-1", "2"], "The first larger value to its right."),
        ]),
        P("Daily Temperatures", "lc.stack", [
          T("<p><b>Daily Temperatures.</b> For each day, how many days until it's warmer? 0 if never.</p><p>[73, 74, 75, 71, 69, 72, 76, 73] → [1, 1, 4, 2, 1, 1, 0, 0]</p>"),
          F("Fill it in.", "res = [0] * len(t)\nstack = []\nfor i in range(len(t)):\n    while stack and t[stack[-1]] < ___:\n        j = stack.pop()\n        res[j] = ___\n    stack.append(i)", ["t[i]", "i - j"], ["t[j]", "j - i", "i"], "Today's warmth resolves everyone waiting who was colder."),
          Q("[30, 60, 90] → ?", ["[1, 1, 0]", "[2, 1, 0]", "[0, 0, 0]", "[1, 1, 1]"], "Each day is beaten the next day; the last never is."),
        ]),
      ]},
      { title: "Linked lists", sub: "Follow the arrows", guide: "lc.linked", lessons: [
        P("Reverse Linked List", "lc.linked", [
          T("<p>Each node points to the next. To reverse a list, flip every arrow using three pointers: <code>prev</code>, <code>cur</code> and the saved <code>nxt</code>.</p>"),
          O("Order the reversal.", ["prev, cur = None, head", "while cur:", "    nxt = cur.next", "    cur.next = prev", "    prev = cur", "    cur = nxt", "return prev"], "Save next, flip, advance both."),
          Q("What's returned?", ["The new head (old tail)", "The old head", "None", "The middle node"], "prev ends on the last node."),
          Q("Extra space?", ["O(1)", "O(n)", "O(log n)", "O(n²)"], "Just three pointers."),
        ]),
        L("Fast and slow pointers", "lc.linked", [
          T("<p>Send a <b>slow</b> pointer one step at a time and a <b>fast</b> one two steps. If the list loops, fast laps slow and they meet:</p>", V("lc-fastslow", { a: "3, 1, 4, 1, 5, 9, 2, 6", c: "2" })),
          Q("When fast reaches the end (no cycle), slow is at…", ["The middle", "The head", "The end", "A random node"], "Half the speed, half the distance."),
          Q("Cycle detection this way uses how much memory?", ["O(1)", "O(n)", "O(log n)", "O(n²)"], "A visited set would cost O(n)."),
        ]),
        P("Merge Two Sorted Lists", "lc.linked", [
          T("<p><b>Merge Two Sorted Lists.</b> Splice two sorted lists into one sorted list.</p><p>1→2→4 and 1→3→4 → 1→1→2→3→4→4</p>"),
          Q("Why start with a dummy node?", ["No special case for picking the first node", "It saves memory", "It sorts the lists", "It's required by Python"], "Return dummy.next at the end."),
          F("Fill in the merge.", "dummy = tail = ListNode()\nwhile a and b:\n    if a.val <= b.val:\n        tail.next, a = a, ___\n    else:\n        tail.next, b = b, b.next\n    tail = ___\ntail.next = a or b\nreturn dummy.next", ["a.next", "tail.next"], ["b.next", "a", "dummy"], "Advance whichever list gave its node, then the tail."),
        ]),
      ]},
      { title: "Trees", sub: "Recursion's home turf", guide: "lc.trees", lessons: [
        L("Recursion on trees", "lc.trees", [
          T("<p>Most tree problems are one recursive function: solve the left subtree, solve the right, combine. Watch <b>max depth</b> answers flow back up:</p>", V("lc-treedfs", { t: "3, 9, 20, null, null, 15, 7" })),
          Q("depth(None) should return…", ["0", "1", "-1", "None"], "An empty tree has no levels."),
          F("Finish max depth.", "def depth(node):\n    if not node:\n        return 0\n    return 1 + ___(depth(node.left), depth(node.right))", ["max"], ["min", "sum"], "The deeper side decides."),
        ]),
        P("Invert Binary Tree", "lc.trees", [
          T("<p><b>Invert Binary Tree.</b> Mirror the tree: swap every node's left and right children.</p>"),
          O("Order the solution.", ["def invert(node):", "    if not node:", "        return None", "    node.left, node.right = node.right, node.left", "    invert(node.left)", "    invert(node.right)", "    return node"], "Swap here, then let recursion handle the subtrees."),
          Q("Complexity for n nodes?", ["O(n)", "O(log n)", "O(n²)", "O(1)"], "Each node is visited once."),
        ]),
        L("Level by level", "lc.trees", [
          T("<p>For \"per level\" questions use <b>BFS</b> with a queue. Freeze <code>len(queue)</code> at the start of each level, and pop exactly that many.</p>"),
          F("Process one level at a time.", "q = deque([root])\nwhile q:\n    level = []\n    for _ in range(___):\n        node = q.___()\n        level.append(node.val)\n        if node.left: q.append(node.left)\n        if node.right: q.append(node.right)", ["len(q)", "popleft"], ["len(level)", "pop"], "popleft makes it a queue, oldest first."),
          Q("Binary Tree Right Side View is BFS where you keep…", ["The last node of each level", "The first node of each level", "Every leaf", "The root only"], "The rightmost node is what you'd see."),
        ]),
        P("Validate Binary Search Tree", "lc.bst", [
          T("<p><b>Validate BST.</b> Every node must be greater than <i>everything</i> in its left subtree and smaller than everything in its right.</p>"),
          Q("Why isn't checking each node against its two children enough?", ["A deeper node can break an ancestor's rule", "It's too slow", "BSTs have no children", "It is enough"], "5 → left 3 → right 6 breaks the root's rule."),
          F("Pass bounds down.", "def ok(node, lo, hi):\n    if not node:\n        return True\n    if not (lo < node.val < hi):\n        return False\n    return ok(node.left, lo, ___) and ok(node.right, ___, hi)", ["node.val", "node.val"], ["hi", "lo"], "Left children must be below this node; right ones above."),
        ]),
      ]},
      { title: "Heaps", sub: "Always the smallest on top", guide: "lc.heap", lessons: [
        L("How a heap works", "lc.heap", [
          T("<p>A <b>min-heap</b> keeps the smallest item at the top. Push and pop cost <b>O(log n)</b>. To keep the <b>k largest</b>, use a size-k min-heap and pop whenever it overflows:</p>", V("lc-heap", { a: "5, 1, 9, 3, 7, 2, 8, 6", k: "3" })),
          Q("Python's <code>heapq</code> is a…", ["Min-heap", "Max-heap", "Sorted list", "Stack"], "Negate values for a max-heap."),
          Q("Peeking at the smallest costs…", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], "It's always at index 0."),
        ]),
        P("Kth Largest Element", "lc.heap", [
          T("<p><b>Kth Largest Element in an Array.</b> [3, 2, 1, 5, 6, 4], k = 2 → <b>5</b>.</p>"),
          F("Fill it in.", "h = []\nfor x in nums:\n    heapq.heappush(h, x)\n    if len(h) > ___:\n        heapq.___(h)\nreturn h[0]", ["k", "heappop"], ["k - 1", "heappush", "heapify"], "Never keep more than k; the top is then the k-th largest."),
          Q("Complexity?", ["O(n log k)", "O(n²)", "O(k)", "O(log n)"], "n pushes on a heap of size k."),
        ]),
        P("Top K Frequent Elements", "lc.heap", [
          T("<p><b>Top K Frequent Elements.</b> [1, 1, 1, 2, 2, 3], k = 2 → <b>[1, 2]</b>.</p>"),
          O("Order the steps.", ["counts = Counter(nums)", "h = []", "for x, c in counts.items():", "    heapq.heappush(h, (c, x))", "    if len(h) > k: heapq.heappop(h)", "return [x for c, x in h]"], "Count, then keep the k highest counts."),
          Q("An O(n) alternative?", ["Bucket values by their count", "Sort by value", "Binary search", "A stack"], "A count is at most n, so buckets 0..n work."),
        ]),
      ]},
      { title: "Graphs", sub: "Nodes, edges, and grids", guide: "lc.graphs", lessons: [
        L("BFS on a grid", "lc.graphs", [
          T("<p>A grid is a graph: each cell links to its neighbors. <b>BFS</b> spreads in rings, so the first time it reaches a cell is along a shortest path:</p>", V("lc-gridbfs", { m: "maze" })),
          Q("BFS uses a…", ["Queue", "Stack", "Heap", "Trie"], "First in, first out keeps the rings in order."),
          Q("Shortest path when every step costs the same?", ["BFS", "DFS", "Sorting", "Backtracking"], "DFS can wander far before finding the target."),
        ]),
        P("Number of Islands", "lc.graphs", [
          T("<p><b>Number of Islands.</b> In a grid of '1' (land) and '0' (water), count the islands: groups of land connected up, down, left or right.</p>"),
          Q("The answer equals…", ["How many times you start a new flood fill on unvisited land", "The number of land cells", "The number of water cells", "The grid's width"], "Each flood fill sinks one whole island."),
          F("Sink an island with DFS.", "def sink(r, c):\n    if r < 0 or c < 0 or r >= R or c >= C or grid[r][c] != '1':\n        return\n    grid[r][c] = ___\n    for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:\n        sink(r + ___, c + dc)", ["'0'", "dr"], ["'1'", "dc", "1"], "Mark it visited, then spread."),
        ]),
        P("Course Schedule", "lc.graphadv", [
          T("<p><b>Course Schedule.</b> Some courses need others first. Can you take them all? Peel off courses with no remaining prerequisites; leftovers mean a cycle:</p>", V("lc-topo", { cyc: "dag" })),
          Q("Which courses can be taken first?", ["Those with in-degree 0", "Those with the most prerequisites", "The alphabetically first", "Any"], "Nothing must come before them."),
          Q("If some courses never reach in-degree 0…", ["There's a cycle: you can't finish", "Take them last", "The graph is a tree", "Restart"], "They wait on each other forever."),
        ]),
        L("Union-find", "lc.graphadv", [
          T("<p><b>Union-find</b> tracks groups as edges arrive. Each node points toward a group leader; merging links two leaders:</p>", V("lc-unionfind", { e: "0-1, 2-3, 1-3, 4-5, 6-7, 5-7, 0-2, 4-6" })),
          Q("An edge joins two nodes that already share a leader. That edge…", ["Closes a cycle", "Splits the group", "Is ignored by graphs", "Creates two leaders"], "That's Redundant Connection."),
          F("Find with path compression.", "def find(x):\n    while parent[x] != x:\n        parent[x] = parent[___]\n        x = ___\n    return x", ["parent[x]", "parent[x]"], ["x", "0"], "Point at your grandparent, then step up."),
        ]),
      ]},
      { title: "Backtracking", sub: "Choose, explore, un-choose", guide: "lc.backtrack", lessons: [
        L("The decision tree", "lc.backtrack", [
          T("<p>Backtracking makes one choice at a time and undoes it to try the next. For subsets, each level decides: take this number or skip it.</p>", V("lc-backtrack", { a: "1, 2, 3" })),
          Q("How many subsets does a set of 4 items have?", ["16", "8", "24", "4"], "2⁴: each item is in or out."),
          Q("What does <code>path.pop()</code> do?", ["Un-chooses, so the next branch starts clean", "Ends the recursion", "Saves the answer", "Sorts the path"], "Choose, explore, un-choose."),
        ]),
        P("Permutations", "lc.backtrack", [
          T("<p><b>Permutations.</b> [1, 2, 3] → all 6 orderings.</p>"),
          O("Order the backtracking.", ["def dfs(path):", "    if len(path) == len(nums):", "        res.append(path[:]); return", "    for x in nums:", "        if x in path: continue", "        path.append(x)", "        dfs(path)", "        path.pop()"], "Stop at full length; try each unused number."),
          Q("How many permutations of 5 distinct items?", ["120", "25", "32", "60"], "5! = 120."),
        ]),
        P("Combination Sum", "lc.backtrack", [
          T("<p><b>Combination Sum.</b> Using numbers from [2, 3, 6, 7] as often as you like, list every combination summing to 7.</p><p>→ [[2, 2, 3], [7]]</p>"),
          Q("To allow reusing a number, recurse with…", ["the same index i", "i + 1", "0", "the target"], "i + 1 would forbid reuse."),
          Q("Why sort the candidates first?", ["So you can stop once a number exceeds what's left", "Backtracking requires it", "To remove duplicates", "It doesn't help"], "Pruning saves huge amounts of work."),
        ]),
      ]},
      { title: "Dynamic programming", sub: "Never solve the same thing twice", guide: "lc.dp1", lessons: [
        L("Stop recomputing", "lc.dp1", [
          T("<p>Naive recursion for Fibonacci recomputes the same values over and over: <b>exponential</b> time. Remember each answer the first time (<b>memoization</b>) and it becomes O(n).</p>"),
          Q("Naive <code>fib(n) = fib(n-1) + fib(n-2)</code> is roughly…", ["O(2ⁿ)", "O(n)", "O(n²)", "O(log n)"], "The call tree doubles at every level."),
          F("Memoize it.", "from functools import ___\n\n@cache\ndef fib(n):\n    if n < 2:\n        return ___\n    return fib(n - 1) + fib(n - 2)", ["cache", "n"], ["lru", "1", "0"], "fib(0) = 0, fib(1) = 1."),
          Q("Ways to climb 5 stairs taking 1 or 2 steps?", ["8", "5", "10", "16"], "1, 2, 3, 5, 8: Fibonacci again."),
        ]),
        L("1-D DP: House Robber", "lc.dp1", [
          T("<p><b>House Robber:</b> you can't rob two neighbors. At each house: skip it, or rob it plus the best from two houses back.</p>", V("lc-dp1", { a: "2, 7, 9, 3, 1" })),
          F("The transition.", "dp[i] = max(dp[i - 1], dp[i - 2] + ___)", ["a[i]"], ["a[i - 1]", "dp[i]"], "Skip house i, or rob it."),
          Q("Houses [2, 7, 9, 3, 1]. Best haul?", ["12", "11", "10", "22"], "2 + 9 + 1 = 12."),
        ]),
        P("Coin Change", "lc.dp1", [
          T("<p><b>Coin Change.</b> Fewest coins to make an amount. coins = [1, 2, 5], amount = 11 → <b>3</b> (5 + 5 + 1).</p>"),
          Q("Coins [1, 3, 4], amount 6. Does 'take the biggest coin first' work?", ["No: it uses 3 coins (4+1+1); 3+3 uses 2", "Yes", "Only for odd amounts", "It crashes"], "That's why this needs DP, not greed."),
          F("Fill the table.", "dp = [0] + [float('inf')] * amount\nfor a in range(1, amount + 1):\n    for c in coins:\n        if c <= a:\n            dp[a] = ___(dp[a], dp[a - c] + ___)", ["min", "1"], ["max", "c", "0"], "Try every last coin."),
        ]),
        L("2-D DP: comparing strings", "lc.dp2", [
          T("<p>Comparing two strings? Use a table where <code>dp[i][j]</code> is the answer for the first i letters of A and the first j of B. Here's longest common subsequence:</p>", V("lc-lcs", { a: "ABCBDAB", b: "BDCABA" })),
          Q("When A[i−1] equals B[j−1], LCS takes…", ["The diagonal + 1", "The max of up and left", "0", "The row total"], "A match extends both shorter prefixes."),
          Q("Edit distance's three moves are…", ["Insert, delete, replace", "Swap, sort, split", "Push, pop, peek", "Add, multiply, divide"], "Each maps to a neighboring cell."),
        ]),
      ]},
      { title: "Greedy and intervals", sub: "When the obvious choice works", guide: "lc.intervals", lessons: [
        L("Merging intervals", "lc.intervals", [
          T("<p>Sort intervals by start. Then each one either overlaps the last merged group (extend it) or starts a new one:</p>", V("lc-intervals", { a: "1-3, 8-10, 2-6, 15-18, 9-12" })),
          O("Order the merge.", ["intervals.sort()", "out = [intervals[0]]", "for s, e in intervals[1:]:", "    if s <= out[-1][1]: out[-1][1] = max(out[-1][1], e)", "    else: out.append([s, e])", "return out"], "Sort, then extend or append."),
          Q("[1, 3], [2, 6], [8, 10] merge to…", ["[1, 6], [8, 10]", "[1, 10]", "[1, 3], [2, 6], [8, 10]", "[2, 6]"], "1–3 and 2–6 overlap."),
        ]),
        P("Jump Game", "lc.greedy", [
          T("<p><b>Jump Game.</b> Each value is your maximum jump from that spot. Can you reach the end?</p><p>[2, 3, 1, 1, 4] → True. [3, 2, 1, 0, 4] → False.</p>"),
          F("Track the farthest reach.", "reach = 0\nfor i, step in enumerate(nums):\n    if i > ___:\n        return False\n    reach = max(reach, i + ___)\nreturn True", ["reach", "step"], ["i", "nums", "0"], "Standing beyond your reach means you're stuck."),
          Q("Why does [3, 2, 1, 0, 4] fail?", ["Every path lands on the 0 at index 3", "It's too long", "4 is too big", "It doesn't"], "Reach never passes index 3."),
        ]),
        L("Kadane's algorithm", "lc.greedy", [
          T("<p><b>Maximum Subarray:</b> keep a running sum; if it ever drops below the current number alone, start fresh there.</p>", V("lc-kadane", { a: "-2, 1, -3, 4, -1, 2, 1, -5, 4" })),
          F("One line does the work.", "cur = max(___, cur + x)\nbest = max(best, cur)", ["x"], ["0", "cur", "best"], "Extend, or start over at x."),
          Q("[-2, 1, -3, 4, -1, 2, 1, -5, 4] → ?", ["6", "4", "7", "5"], "4 − 1 + 2 + 1 = 6."),
        ]),
      ]},
      { title: "Interview day", sub: "Putting it to work", guide: "lc.live", lessons: [
        L("The first five minutes", "lc.live", [
          T("<p>Strong candidates don't start typing. They <b>clarify</b> (input size, edge cases), say a <b>brute force</b> out loud, improve it, <b>agree on the plan</b>, then code while talking.</p>"),
          O("Put the steps in order.", ["Ask clarifying questions", "Work an example by hand", "Describe the brute force", "Improve it and state the complexity", "Code while explaining", "Test with your example and edge cases"], "Understand, plan, implement, review."),
          Q("You're stuck. Best move?", ["Think out loud and try a smaller example", "Go silent", "Start over in another language", "Ask to skip"], "Interviewers give hints to people they can follow."),
          Q("You spot a bug while testing. You should…", ["Say so and fix it calmly", "Hope they missed it", "Delete everything", "Blame the editor"], "Catching your own bugs is a good signal."),
        ]),
        L("Online assessments", "lc.oa", [
          T("<p>Many companies screen with a timed test on <b>HackerRank</b> or <b>CodeSignal</b>, graded by hidden test cases. Some problems make you read raw input and print output.</p>"),
          Q("20 minutes left: a working O(n²) or an unfinished O(n)?", ["Submit the O(n²) for partial credit, then optimize", "Keep going on O(n) without submitting", "Submit nothing", "Switch problems"], "Points are usually per test case."),
          Q("Safest way to read input in Python?", ["<code>sys.stdin.read().split()</code>, then walk the tokens", "<code>input()</code> for every number", "Hard-code the example", "Read only the first line"], "Robust to however the numbers are split across lines."),
          Q("Passes the samples, fails hidden tests. Usually…", ["Edge cases or too slow", "The judge is broken", "Too many comments", "Wrong font"], "Empty input, one element, maximum size."),
        ]),
        L("Behavioral rounds", "lc.behavioral", [
          T("<p>Answer \"tell me about a time…\" questions with <b>STAR</b>: Situation, Task, Action, Result. Spend most of it on <b>your</b> actions, and end with a measurable result.</p>"),
          O("Order a STAR answer.", ["Situation: two sentences of context", "Task: what you owned", "Action: what you did, and why", "Result: the outcome, with a number"], "Keep it to about two minutes."),
          Q("Which phrasing is strongest?", ["\"I rewrote the cache, cutting load time 40%.\"", "\"We kind of fixed things.\"", "\"The team handled it.\"", "\"It worked out.\""], "Specific, first person, measurable."),
          Q("\"Tell me about a failure.\" Best approach?", ["Own it, say what you did next, and what changed", "Pick a fake weakness", "Blame others", "Say you never fail"], "They're testing accountability and learning."),
        ]),
      ]},
    ],
  };

  /* ---------- additions: concept animations, new exercise types, drills, and a Hard PR attempt per week ---------- */
  const A = (anim, text, title) => ({ k: "learn", anim, text, title });
  const RK = (prompt, items, why) => ({ k: "rank", prompt, items, why });
  const M = (prompt, pairs, why) => ({ k: "match", prompt, pairs, why });
  const BN = (prompt, bins, items, why) => ({ k: "bins", prompt, bins, items, why });
  const BUG = (prompt, lines, bug, why) => ({ k: "bug", prompt, lines, bug, why });
  const NUM = (prompt, answer, why, code, tol, unit) => ({ k: "num", prompt, answer, why, code, tol, unit });
  const U = DEF.units, ins = (ui, li, at, ...cards) => U[ui].lessons[li].cards.splice(at, 0, ...cards), add = (ui, li, ...cards) => U[ui].lessons[li].cards.push(...cards);
  DEF.units.forEach((u) => u.lessons.forEach((l) => { if (l.kind === "lesson") l.kind = "learn"; }));

  // Week 1: Big-O
  ins(0, 0, 1, A("constants", "<p>Why do we get to drop constants? Divide <code>3n + 5</code> by <code>n</code>: the ratio settles at 3, a fixed number. <code>n²</code> divided by <code>n</code> just keeps growing.</p>"));
  ins(0, 0, 4, A("growth", "<p>Here are the six growth rates racing as <b>n</b> grows. The chart keeps rescaling, and the exponential one still escapes it.</p>"));
  add(0, 0, RK("Rank these from slowest-growing to fastest-growing.", ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"], "Constant, logarithmic, linear, linearithmic, quadratic, exponential."));
  ins(0, 1, 1, A("nested", "<p>Same n, very different work. One loop touches n cells; a loop inside a loop fills an n × n grid.</p>"));
  add(0, 1, M("Match each snippet to its complexity.", [["<code>for x in nums: total += x</code>", "O(n)"], ["<code>for i in a: for j in a: …</code>", "O(n²)"], ["<code>while n > 1: n //= 2</code>", "O(log n)"], ["<code>nums.sort()</code>", "O(n log n)"]], "One pass, nested passes, halving, sorting."));
  ins(0, 2, 1, A("halving", "<p>Algorithms that throw away half the input each step finish in <b>log₂ n</b> steps. That's why binary search is so fast.</p>"));
  add(0, 2, NUM("Halving each time, how many steps take 1,024 items down to 1?", 10, "2¹⁰ = 1,024, so log₂ 1,024 = 10."),
    BN("Sort these Python operations by cost.", ["O(1) on average", "O(n)"], [["<code>d[key]</code>", 0], ["<code>x in a_set</code>", 0], ["<code>nums.append(x)</code>", 0], ["<code>x in a_list</code>", 1], ["<code>sum(nums)</code>", 1], ["<code>nums.index(x)</code>", 1]], "Hashing and appends are constant; anything that scans a list is linear."));
  // Week 2: hash maps
  ins(1, 0, 1, A("hashing", "<p>A list makes you check items one by one. A hash map runs the key through a hash function and jumps straight to its bucket.</p>"));
  add(1, 1, M("Match the tool to the job.", [["Have I seen this before?", "set"], ["How many times does each item appear?", "Counter"], ["Group items by a shared key", "defaultdict(list)"], ["Value → its index", "dict"]], "Sets for membership, counters for frequency, defaultdict for grouping, dicts for lookups."));
  // Week 6: binary search
  add(5, 1, BUG("This search sometimes never finishes. Tap the buggy line.", ["def search(a, target):", "    lo, hi = 0, len(a) - 1", "    while lo <= hi:", "        mid = (lo + hi) // 2", "        if a[mid] == target:", "            return mid", "        if a[mid] < target:", "            lo = mid", "        else:", "            hi = mid - 1", "    return -1"], 7, "mid is already known to be too small, so it must be excluded: lo = mid + 1. With lo = mid, the range can stop shrinking."));
  // Week 7: stacks
  add(6, 0, BUG("This crashes on the input <code>\")(\"</code>. Which line?", ["def is_valid(s):", "    stack = []", "    for c in s:", "        if c in '([{':", "            stack.append(c)", "        elif stack.pop() != pairs[c]:", "            return False", "    return not stack"], 5, "Popping an empty list raises an error. Check <code>not stack</code> first."));
  // Week 8: linked lists
  add(7, 0, BUG("This reversal loops forever. Which line is wrong?", ["prev, cur = None, head", "while cur:", "    nxt = cur.next", "    cur.next = prev", "    prev = cur", "    cur = cur.next", "return prev"], 5, "cur.next was just pointed back at prev. Advance with the saved nxt."));
  // Week 9: trees
  add(8, 0, M("Match each traversal to its order.", [["Pre-order", "node, left, right"], ["In-order", "left, node, right"], ["Post-order", "left, right, node"], ["Level-order", "row by row, with a queue"]], "In-order on a BST gives sorted output."));
  // Week 10: heaps
  add(9, 0, NUM("A heap holds 1,000,000 items. About how many swaps can a single push need, at most?", 20, "One swap per level: log₂ 1,000,000 ≈ 20.", null, 1));
  // Week 11: graphs
  add(10, 0, M("Match the problem to the algorithm.", [["Fewest moves, every move costs 1", "BFS"], ["Cheapest route, positive prices", "Dijkstra"], ["Order tasks with prerequisites", "Topological sort"], ["Are a and b connected yet?", "Union-find"]], "Unit weights → BFS; weights → Dijkstra; dependencies → topo sort; dynamic connectivity → union-find."));
  // Week 12: backtracking
  add(11, 0, NUM("How many subsets does a set of 10 items have?", 1024, "2¹⁰ = 1,024."));
  // Week 13: DP
  add(12, 0, RK("Put the DP recipe in order.", ["Define the state in words", "Write the transition", "Set the base cases", "Fill in dependency order and read the answer"], "State, transition, base cases, order."), NUM("Ways to climb 6 stairs taking 1 or 2 steps?", 13, "1, 2, 3, 5, 8, 13."));
  // Week 14: greedy
  add(13, 1, BN("Greedy, or does it need DP?", ["Greedy works", "Needs DP"], [["Jump Game", 0], ["Merge intervals", 0], ["Maximum subarray (Kadane)", 0], ["Coin Change with coins 1, 3, 4", 1], ["Longest increasing subsequence", 1], ["Edit distance", 1]], "If a local choice can be proven safe, greedy; if choices interact, DP."));
  // Week 15: interview day
  add(14, 2, M("Match each STAR part to an example line.", [["Situation", "Our nightly report took 40 minutes."], ["Task", "I owned making it run before standup."], ["Action", "I added an index and cached the joins."], ["Result", "It now runs in 3 minutes."]], "Context, ownership, your action, a measured outcome."));

  // a drill after each week's first lesson: fresh questions from the bank every time
  const DRILL = [["lc.complexity", "lc.approach"], ["lc.hashing"], ["lc.twoptr"], ["lc.window"], ["lc.prefix"], ["lc.bsearch"], ["lc.stack"], ["lc.linked"], ["lc.trees", "lc.bst", "lc.trie"], ["lc.heap"], ["lc.graphs", "lc.graphadv"], ["lc.backtrack"], ["lc.dp1", "lc.dp2"], ["lc.greedy", "lc.intervals", "lc.bits"], ["lc.patterns", "lc.oa", "lc.live", "lc.behavioral"]];
  DRILL.forEach((sk, ui) => U[ui].lessons.splice(1, 0, { title: `Drill: ${U[ui].title}`, skill: sk[0], kind: "drill", cards: GR.pathKit.drill(sk, 8) }));

  // the Hard PR attempt of each week (classic problems, explained in our own words)
  const PR = (ui, title, skill, cards) => U[ui].lessons.push({ title, skill, kind: "pr", cards });
  PR(1, "Longest Consecutive Sequence", "lc.hashing", [
    T("<p><b>Longest Consecutive Sequence.</b> In an unsorted array, find the length of the longest run of consecutive integers, in O(n).</p><p>[100, 4, 200, 1, 3, 2] → <b>4</b> (1, 2, 3, 4)</p>"),
    Q("Sorting first would cost…", ["O(n log n): too slow for the O(n) requirement", "O(n)", "O(1)", "O(n²)"], "The point is to beat sorting."),
    Q("Put every number in a set. Where should a count start?", ["Only at numbers whose predecessor (x − 1) isn't in the set", "At every number", "At the smallest number only", "At even numbers"], "Starting only at run beginnings keeps the total work linear."),
    F("Fill it in.", "s = set(nums)\nbest = 0\nfor x in s:\n    if ___ not in s:\n        y = x\n        while ___ in s:\n            y += 1\n        best = max(best, y - x + 1)", ["x - 1", "y + 1"], ["x + 1", "y - 1"], "Begin a run only at its start, then walk forward."),
    NUM("[9, 1, 4, 7, 3, -1, 0, 5, 8, -1, 6] → longest run length?", 7, "3, 4, 5, 6, 7, 8, 9."),
  ]);
  PR(2, "Trapping Rain Water", "lc.twoptr", [
    T("<p><b>Trapping Rain Water.</b> Bars of the given heights stand side by side. How much rain gets trapped between them?</p><p>[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] → <b>6</b></p>"),
    Q("Water above bar i equals…", ["min(tallest bar to its left, tallest to its right) − height[i]", "max(tallest left, tallest right) − height[i]", "height[i] − the shorter neighbor", "the next taller bar's height"], "Water rises to the lower of the two walls around it."),
    NUM("Heights [3, 0, 2, 0, 4]. Total trapped water?", 7, "3 + 1 + 3: each gap fills to min(3, 4) = 3."),
    T("<p>Two pointers make it O(n) with O(1) space. Track the tallest bar seen from each side. Whichever side has the <b>smaller</b> max is the one whose water level you already know, so process that side and move inward.</p>"),
    F("Complete the two-pointer version.", "l, r = 0, len(h) - 1\nlmax = rmax = water = 0\nwhile l < r:\n    if h[l] < h[r]:\n        lmax = max(lmax, h[l])\n        water += ___ - h[l]\n        l += 1\n    else:\n        rmax = max(rmax, h[r])\n        water += rmax - h[r]\n        ___\nreturn water", ["lmax", "r -= 1"], ["rmax", "l += 1", "h[r]"], "Each side fills up to its own running max."),
    Q("Complexity?", ["O(n) time, O(1) space", "O(n²) time", "O(n log n) time", "O(n) time, O(n) space only"], "One pass, a few variables."),
  ]);
  PR(3, "Minimum Window Substring", "lc.window", [
    T("<p><b>Minimum Window Substring.</b> Find the shortest substring of s that contains every character of t (with repeats).</p><p>s = \"ADOBECODEBANC\", t = \"ABC\" → <b>\"BANC\"</b></p>"),
    Q("Which pattern?", ["A variable sliding window: find the shortest valid window", "Binary search", "Backtracking", "A heap"], "Contiguous, shortest, with a validity rule."),
    RK("Put the window's moves in order.", ["Expand right until the window contains all of t", "Record the window if it's the shortest so far", "Shrink from the left while it stays valid", "Repeat until right reaches the end"], "Grow until valid, then squeeze."),
    F("Fill in the shrink loop.", "while missing ___ 0:\n    if r - l + 1 < best_len:\n        best_len, best_l = r - l + 1, l\n    need[s[l]] += 1\n    if need[s[l]] > 0:\n        missing ___ 1\n    l += 1", ["==", "+="], ["!=", "-="], "Shrink while nothing is missing; dropping a needed char makes one missing."),
    Q("Complexity?", ["O(|s| + |t|)", "O(|s|²)", "O(|s| · |t|)", "O(2ⁿ)"], "Each index enters and leaves the window once."),
  ]);
  PR(5, "Split Array Largest Sum", "lc.bsearch", [
    T("<p><b>Split Array Largest Sum.</b> Split nums into k contiguous parts so the <b>largest part sum is as small as possible</b>.</p><p>[7, 2, 5, 10, 8], k = 2 → <b>18</b> ([7, 2, 5] and [10, 8])</p>"),
    Q("This is binary search on the answer. Search the cap between…", ["max(nums) and sum(nums)", "0 and len(nums)", "1 and k", "min(nums) and max(nums)"], "No part can be smaller than the biggest number; one part holds the total."),
    NUM("Cap = 15 on [7, 2, 5, 10, 8]. Packing greedily left to right, how many parts?", 3, "[7, 2, 5] = 14, then [10], then [8]: 10 + 8 would exceed 15."),
    F("Binary search the smallest workable cap.", "lo, hi = max(nums), sum(nums)\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if parts_needed(mid) <= k:\n        hi = ___\n    else:\n        lo = ___\nreturn lo", ["mid", "mid + 1"], ["mid - 1", "lo"], "Feasible caps keep mid; infeasible ones are excluded."),
    Q("Complexity?", ["O(n · log(sum))", "O(n²)", "O(2ⁿ)", "O(k)"], "A linear feasibility check per binary-search step."),
  ]);
  PR(6, "Largest Rectangle in Histogram", "lc.stack", [
    T("<p><b>Largest Rectangle in Histogram.</b> Find the largest rectangle that fits under the bars.</p><p>[2, 1, 5, 6, 2, 3] → <b>10</b> (height 5, width 2)</p>"),
    Q("If bar i is the shortest bar in the rectangle, the rectangle stretches…", ["Out to the nearest shorter bar on each side", "Across the whole array", "Only over bar i", "To the tallest bar"], "Anything shorter would cap the height."),
    NUM("In [2, 1, 5, 6, 2, 3], what area does the height-5 bar give as the shortest bar?", 10, "It spans the 5 and the 6: width 2 × height 5."),
    F("Pop bars when a shorter one arrives.", "stack, best = [], 0\nfor i, h in enumerate(heights + [0]):\n    while stack and heights[stack[-1]] ___ h:\n        top = stack.pop()\n        width = i if not stack else i - stack[-1] - 1\n        best = max(best, heights[top] * width)\n    stack.append(i)", [">"], ["<", "=="], "A shorter bar ends every taller bar's rectangle."),
    Q("Complexity?", ["O(n)", "O(n²)", "O(n log n)", "O(log n)"], "Each index is pushed and popped once."),
  ]);
  PR(7, "Merge K Sorted Lists", "lc.heap", [
    T("<p><b>Merge K Sorted Lists.</b> Merge k sorted linked lists (N nodes in total) into one sorted list.</p>"),
    Q("Merging them one by one into a growing result costs about…", ["O(k · N)", "O(N log k)", "O(N)", "O(k)"], "Each merge re-walks the growing result."),
    O("Order the heap solution.", ["h = [(node.val, i, node) for i, node in enumerate(lists) if node]", "heapq.heapify(h)", "dummy = tail = ListNode()", "while h:", "    val, i, node = heapq.heappop(h)", "    tail.next = node; tail = node", "    if node.next: heapq.heappush(h, (node.next.val, i, node.next))", "return dummy.next"], "One candidate per list in the heap; always take the smallest."),
    Q("Why keep i in the heap tuples?", ["It breaks ties so Python never compares two nodes", "It sorts the lists", "It saves memory", "It's the answer's index"], "Equal values would otherwise compare ListNode objects and crash."),
    Q("Complexity?", ["O(N log k)", "O(N log N)", "O(k log N)", "O(N k)"], "N pops and pushes on a heap of size k."),
  ]);
  PR(8, "Binary Tree Maximum Path Sum", "lc.trees", [
    T("<p><b>Binary Tree Maximum Path Sum.</b> A path can start and end at any nodes. Find the largest sum of values along any path.</p><p>Tree [-10, 9, 20, null, null, 15, 7] → <b>42</b> (15 → 20 → 7)</p>"),
    Q("What should the recursive function return to its parent?", ["The best sum of a path going down one side from this node", "The best path anywhere in the subtree", "The subtree's total", "The node's depth"], "A parent can extend only one branch."),
    Q("What do you compare against the global best at each node?", ["node.val + left gain + right gain", "node.val alone", "The left gain only", "The tree's height"], "That's the path that bends at this node."),
    F("Complete the gain function.", "def gain(node):\n    if not node:\n        return 0\n    l = max(gain(node.left), ___)\n    r = max(gain(node.right), 0)\n    best[0] = max(best[0], node.val + l + r)\n    return node.val + ___(l, r)", ["0", "max"], ["1", "min", "node.val"], "Ignore negative branches; return the better one."),
  ]);
  PR(9, "Find Median from Data Stream", "lc.heap", [
    T("<p><b>Find Median from Data Stream.</b> Numbers arrive one at a time; at any moment report the median.</p>"),
    Q("The standard design uses…", ["A max-heap for the lower half and a min-heap for the upper half", "A sorted list re-sorted on every insert", "One min-heap", "A stack"], "The two tops sit right at the middle."),
    BN("After 5, 15, 1, 3 and 8 arrive, which heap holds what?", ["Lower half (max-heap)", "Upper half (min-heap)"], [["1", 0], ["3", 0], ["5", 0], ["8", 1], ["15", 1]], "Lower half 1, 3, 5; upper half 8, 15; the lower half may hold one extra."),
    NUM("What's the median now?", 5, "The top of the larger (lower) heap."),
    Q("Costs?", ["addNum O(log n), findMedian O(1)", "Both O(n)", "Both O(1)", "addNum O(1), findMedian O(n log n)"], "Heap pushes are logarithmic; the median is a peek."),
  ]);
  PR(10, "Word Ladder", "lc.graphs", [
    T("<p><b>Word Ladder.</b> Change one letter at a time, each step a real word from the list, from beginWord to endWord. How many words in the shortest sequence?</p><p>hit → hot → dot → dog → cog: <b>5</b></p>"),
    Q("Which search finds the shortest sequence?", ["BFS: every step costs the same", "DFS", "Dijkstra with weights", "Backtracking over all sequences"], "Unweighted shortest path."),
    Q("How do you find a word's neighbors quickly?", ["Try each position with each letter a–z and check a set", "Compare against every word in the list", "Sort the list", "Use a heap"], "L × 26 lookups per word instead of scanning the whole list."),
    NUM("hit → hot → dot → dog → cog: how many words is that?", 5, "Count the words, not the steps."),
    Q("A common speed-up is…", ["Searching from both ends at once (bidirectional BFS)", "Using DFS instead", "Sorting the word list", "Removing the end word"], "Two small frontiers meet long before one big one finishes."),
  ]);
  PR(11, "N-Queens", "lc.backtrack", [
    T("<p><b>N-Queens.</b> Place n queens on an n × n board so none attack each other (same row, column or diagonal). Count the solutions. For n = 4 there are <b>2</b>.</p>"),
    Q("Placing one queen per row, what must you track to check attacks in O(1)?", ["Used columns, r − c diagonals and r + c anti-diagonals", "Every queen's position, checked pairwise", "Only the columns", "The board as a string"], "Each diagonal has a constant r − c or r + c."),
    F("Fill in the backtracking.", "def place(r):\n    if r == n:\n        count[0] += 1\n        return\n    for c in range(n):\n        if c in cols or r - c in d1 or ___ in d2:\n            continue\n        cols.add(c); d1.add(r - c); d2.add(r + c)\n        place(r + 1)\n        cols.remove(c); d1.remove(r - c); d2.___(r + c)", ["r + c", "remove"], ["c - r", "add"], "Check the anti-diagonal; undo every choice."),
    NUM("How many solutions does 4-queens have?", 2, "Two mirror-image placements."),
  ]);
  PR(12, "Edit Distance", "lc.dp2", [
    T("<p><b>Edit Distance.</b> The fewest inserts, deletes and replacements to turn one word into another.</p><p>\"horse\" → \"ros\": <b>3</b></p>"),
    Q("dp[i][0] (turning the first i letters into an empty string) is…", ["i deletions", "0", "1", "j"], "Delete every letter."),
    F("The transition.", "if a[i-1] == b[j-1]:\n    dp[i][j] = ___\nelse:\n    dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])", ["dp[i-1][j-1]"], ["dp[i][j-1]", "0"], "Matching letters cost nothing: take the diagonal."),
    NUM("Edit distance from \"kitten\" to \"sitting\"?", 3, "k→s, e→i, insert g."),
    Q("Complexity for words of length m and n?", ["O(m · n)", "O(m + n)", "O(2ⁿ)", "O(n log n)"], "One table cell each."),
  ]);
  PR(13, "Candy", "lc.greedy", [
    T("<p><b>Candy.</b> Children stand in a line with ratings. Each gets at least one candy, and a child rated higher than a neighbor gets more than that neighbor. Minimum total?</p><p>[1, 0, 2] → <b>5</b> (2, 1, 2)</p>"),
    Q("The classic solution makes…", ["Two passes: left-to-right, then right-to-left, keeping the max", "One pass", "A sort by rating", "A DP over all distributions"], "Each pass enforces one neighbor rule."),
    F("Fill in both passes.", "c = [1] * n\nfor i in range(1, n):\n    if r[i] > r[i - 1]:\n        c[i] = ___\nfor i in range(n - 2, -1, -1):\n    if r[i] > r[i + 1]:\n        c[i] = ___(c[i], c[i + 1] + 1)", ["c[i - 1] + 1", "max"], ["c[i + 1] + 1", "min"], "Left pass handles left neighbors; right pass keeps both rules."),
    NUM("Ratings [1, 2, 2]. Minimum total?", 4, "1, 2, 1: equal neighbors don't need more."),
  ]);
  // the rest of the track's lessons and its case studies, so the program covers everything
  const LS = (ui, sid, at) => { const l = GR.skills[sid].lesson, node = { title: l.title, skill: sid, kind: "learn", cards: GR.pathKit.lessonSession(sid), n: GR.pathKit.chunks(l.body).length + 4 }; if (at === undefined) U[ui].lessons.push(node); else U[ui].lessons.splice(at, 0, node); };
  LS(0, "lc.approach", 0); LS(8, "lc.trie"); LS(13, "lc.bits"); LS(14, "lc.studyplan"); LS(14, "lc.offer");
  const CASE = { "Debug this sliding window": 3, "Why does this binary search hang?": 5, "Top K Frequent, three ways": 9, "Can you finish all the courses?": 10, "From brute force to DP": 12, "A HackerRank-style problem": 14, "Name that pattern": 14 };
  GR.sets.filter((st) => CASE[st.title] !== undefined).forEach((st) => { const ui = CASE[st.title], i = U[ui].lessons.findIndex((l) => l.kind === "pr"); const node = { title: st.title, skill: st.skill, kind: "problem", cards: GR.pathKit.caseCards(st) }; if (i < 0) U[ui].lessons.push(node); else U[ui].lessons.splice(i, 0, node); });
  DEF.testPool = (u, rng) => { const sk = DRILL[u.i] || []; return GR.pathKit.drill(sk, 4)(rng); };
  GR.course("lc", DEF);
})();
