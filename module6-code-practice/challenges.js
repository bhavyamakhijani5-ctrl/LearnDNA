/* ===================================================================
   MODULE 6 -- Code Practice (part 1 of 3): challenge bank.
   Every challenge is plain data: a statement, a starter file, a model
   solution and a list of test cases. Programs read their input from the
   global string `input` (lines separated by \n) and print the answer with
   console.log -- a test passes when the printed text equals `expected`.
   =================================================================== */

const PRACTICE_XP = { Easy: 20, Medium: 40, Hard: 70 };

// small shared helpers that appear inside starter files
const _LIST_HELPERS = `class ListNode { constructor(val, next = null) { this.val = val; this.next = next; } }
const fromArray = (a) => a.reduceRight((next, val) => new ListNode(val, next), null);
const toArray = (n) => { const a = []; for (; n; n = n.next) a.push(n.val); return a; };`;

const _TREE_HELPERS = `class TreeNode { constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
function buildTree(a) {            // level-order array, null = missing child
  if (!a.length || a[0] === null) return null;
  const root = new TreeNode(a[0]), q = [root]; let i = 1;
  while (q.length && i < a.length) {
    const n = q.shift();
    if (i < a.length && a[i] !== null) { n.left = new TreeNode(a[i]); q.push(n.left); } i++;
    if (i < a.length && a[i] !== null) { n.right = new TreeNode(a[i]); q.push(n.right); } i++;
  }
  return root;
}`;

const DSA_CHALLENGES = [
  {
    id: "two-sum", title: "Two Sum", category: "Arrays", difficulty: "Easy",
    statement: "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`. Exactly one solution exists and you may not use the same element twice.",
    format: "Line 1: the array as JSON. Line 2: the target. Print the two indices as a JSON array, e.g. [0,1].",
    hint: "Store every number you have seen in a Map (value → index). For each x, check whether target − x is already in the Map.",
    fn: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    // your code
  }
  return [];
}`,
    solution: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}`,
    harness: `const [a, b] = input.split("\\n");
console.log(JSON.stringify(twoSum(JSON.parse(a), +b)));`,
    tests: [["[2,7,11,15]\n9", "[0,1]"], ["[3,2,4]\n6", "[1,2]"], ["[3,3]\n6", "[0,1]"], ["[1,5,9,14]\n23", "[2,3]"]],
  },
  {
    id: "valid-parentheses", title: "Valid Parentheses", category: "Stacks", difficulty: "Easy",
    statement: "Given a string made only of the characters ( ) [ ] { }, decide whether it is valid: every bracket must be closed by the same type of bracket, in the correct order.",
    format: "One line: the bracket string. Print true or false.",
    hint: "Push opening brackets on a stack. On a closing bracket, the top of the stack must be its matching opener.",
    fn: `function isValid(s) {
  const stack = [];
  // your code
  return stack.length === 0;
}`,
    solution: `function isValid(s) {
  const stack = [], pair = { ")": "(", "]": "[", "}": "{" };
  for (const ch of s) {
    if (ch in pair) { if (stack.pop() !== pair[ch]) return false; }
    else stack.push(ch);
  }
  return stack.length === 0;
}`,
    harness: `console.log(isValid(input.trim()));`,
    tests: [["()[]{}", "true"], ["(]", "false"], ["{[]}", "true"], ["((", "false"], ["([)]", "false"]],
  },
  {
    id: "max-subarray", title: "Maximum Subarray Sum", category: "Dynamic Programming", difficulty: "Medium",
    statement: "Find the contiguous, non-empty subarray with the largest sum and return that sum.",
    format: "One line: the array as JSON. Print the maximum sum.",
    hint: "Kadane's algorithm: best ending here = max(x, bestEndingHere + x). Keep the global maximum as you go.",
    fn: `function maxSubArray(nums) {
  let best = nums[0];
  // your code
  return best;
}`,
    solution: `function maxSubArray(nums) {
  let best = nums[0], cur = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}`,
    harness: `console.log(maxSubArray(JSON.parse(input)));`,
    tests: [["[-2,1,-3,4,-1,2,1,-5,4]", "6"], ["[1]", "1"], ["[5,4,-1,7,8]", "23"], ["[-3,-2,-5]", "-2"]],
  },
  {
    id: "reverse-linked-list", title: "Reverse a Linked List", category: "Linked Lists", difficulty: "Easy",
    statement: "Reverse a singly linked list and return the new head. The helpers below convert between arrays and lists so you can focus on the pointers.",
    format: "One line: the list values as a JSON array. Print the reversed list as a JSON array.",
    hint: "Walk the list keeping `prev`. For each node: save next, point node.next at prev, then move both pointers forward.",
    fn: `${_LIST_HELPERS}

function reverseList(head) {
  let prev = null;
  // your code
  return prev;
}`,
    solution: `${_LIST_HELPERS}

function reverseList(head) {
  let prev = null;
  while (head) { const next = head.next; head.next = prev; prev = head; head = next; }
  return prev;
}`,
    harness: `console.log(JSON.stringify(toArray(reverseList(fromArray(JSON.parse(input))))));`,
    tests: [["[1,2,3,4,5]", "[5,4,3,2,1]"], ["[1,2]", "[2,1]"], ["[]", "[]"], ["[7]", "[7]"]],
  },
  {
    id: "binary-search", title: "Binary Search", category: "Arrays", difficulty: "Easy",
    statement: "Given a sorted array of distinct integers and a target, return the index of the target or -1 if it is not present. Your solution must run in O(log n).",
    format: "Line 1: the sorted array as JSON. Line 2: the target. Print the index.",
    hint: "Keep lo and hi. Compare the middle element with the target and discard the half that cannot contain it.",
    fn: `function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  // your code
  return -1;
}`,
    solution: `function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
  }
  return -1;
}`,
    harness: `const [a, b] = input.split("\\n");
console.log(search(JSON.parse(a), +b));`,
    tests: [["[-1,0,3,5,9,12]\n9", "4"], ["[-1,0,3,5,9,12]\n2", "-1"], ["[5]\n5", "0"], ["[1,3,5,7,9,11]\n11", "5"]],
  },
  {
    id: "valid-anagram", title: "Valid Anagram", category: "Hash Maps", difficulty: "Easy",
    statement: "Given two strings s and t, return true if t is an anagram of s (same letters, same counts, any order).",
    format: "Line 1: s. Line 2: t. Print true or false.",
    hint: "Count the letters of s in a Map, subtract the letters of t, and check that every count ends at zero.",
    fn: `function isAnagram(s, t) {
  const count = new Map();
  // your code
  return false;
}`,
    solution: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = new Map();
  for (const c of s) count.set(c, (count.get(c) || 0) + 1);
  for (const c of t) {
    if (!count.get(c)) return false;
    count.set(c, count.get(c) - 1);
  }
  return true;
}`,
    harness: `const [s, t] = input.split("\\n");
console.log(isAnagram(s, t));`,
    tests: [["listen\nsilent", "true"], ["rat\ncar", "false"], ["a\nab", "false"], ["anagram\nnagaram", "true"]],
  },
  {
    id: "valid-palindrome", title: "Valid Palindrome", category: "Strings", difficulty: "Easy",
    statement: "A phrase is a palindrome if, after lowercasing it and removing every non-alphanumeric character, it reads the same forwards and backwards. Return true or false.",
    format: "One line: the phrase. Print true or false.",
    hint: "Two pointers from both ends, skipping characters that are not letters or digits (or clean the string first with a regex).",
    fn: `function isPalindrome(s) {
  // your code
  return false;
}`,
    solution: `function isPalindrome(s) {
  const t = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (let i = 0, j = t.length - 1; i < j; i++, j--) if (t[i] !== t[j]) return false;
  return true;
}`,
    harness: `console.log(isPalindrome(input.split("\\n")[0]));`,
    tests: [["A man, a plan, a canal: Panama", "true"], ["race a car", "false"], ["No lemon, no melon", "true"], ["0P", "false"]],
  },
  {
    id: "climbing-stairs", title: "Climbing Stairs", category: "Dynamic Programming", difficulty: "Easy",
    statement: "You climb a staircase of n steps, taking 1 or 2 steps at a time. In how many distinct ways can you reach the top?",
    format: "One line: n. Print the number of ways.",
    hint: "ways(n) = ways(n-1) + ways(n-2). You only need the last two values, so no array is required.",
    fn: `function climbStairs(n) {
  // your code
  return 0;
}`,
    solution: `function climbStairs(n) {
  let a = 1, b = 1;
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}`,
    harness: `console.log(climbStairs(+input));`,
    tests: [["1", "1"], ["2", "2"], ["3", "3"], ["5", "8"], ["10", "89"]],
  },
  {
    id: "first-unique-char", title: "First Unique Character", category: "Hash Maps", difficulty: "Easy",
    statement: "Return the index of the first character in the string that appears exactly once, or -1 if there is none.",
    format: "One line: the string. Print the index.",
    hint: "First pass: count each character. Second pass: return the first index whose count is 1.",
    fn: `function firstUniqChar(s) {
  const count = new Map();
  // your code
  return -1;
}`,
    solution: `function firstUniqChar(s) {
  const count = new Map();
  for (const c of s) count.set(c, (count.get(c) || 0) + 1);
  for (let i = 0; i < s.length; i++) if (count.get(s[i]) === 1) return i;
  return -1;
}`,
    harness: `console.log(firstUniqChar(input.trim()));`,
    tests: [["leetcode", "0"], ["loveleetcode", "2"], ["aabb", "-1"], ["z", "0"]],
  },
  {
    id: "hot-potato", title: "Hot Potato (Josephus)", category: "Queues", difficulty: "Medium",
    statement: "n players stand in a circle numbered 1..n. Starting from player 1, count k players (counting the starter as 1); the k-th player is eliminated and counting restarts from the next player. Return the number of the last player standing.",
    format: "Line 1: n. Line 2: k. Print the winner's number.",
    hint: "Use a queue: rotate k − 1 players from the front to the back, then remove the front player. Repeat until one is left.",
    fn: `function lastStanding(n, k) {
  const queue = Array.from({ length: n }, (_, i) => i + 1);
  // your code
  return queue[0];
}`,
    solution: `function lastStanding(n, k) {
  const queue = Array.from({ length: n }, (_, i) => i + 1);
  while (queue.length > 1) {
    for (let i = 0; i < k - 1; i++) queue.push(queue.shift());
    queue.shift();
  }
  return queue[0];
}`,
    harness: `const [n, k] = input.split("\\n").map(Number);
console.log(lastStanding(n, k));`,
    tests: [["5\n2", "3"], ["7\n3", "4"], ["1\n1", "1"], ["6\n5", "1"]],
  },
  {
    id: "max-depth-tree", title: "Maximum Depth of Binary Tree", category: "Trees", difficulty: "Easy",
    statement: "Return the maximum depth of a binary tree: the number of nodes on the longest path from the root down to a leaf. An empty tree has depth 0.",
    format: "One line: the tree in level-order as JSON (null = missing child). Print the depth.",
    hint: "depth(node) = 1 + max(depth(left), depth(right)), and depth(null) = 0.",
    fn: `${_TREE_HELPERS}

function maxDepth(root) {
  // your code
  return 0;
}`,
    solution: `${_TREE_HELPERS}

function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
    harness: `console.log(maxDepth(buildTree(JSON.parse(input))));`,
    tests: [["[3,9,20,null,null,15,7]", "3"], ["[1,null,2]", "2"], ["[]", "0"], ["[1]", "1"]],
  },
  {
    id: "number-of-islands", title: "Number of Islands", category: "Graphs", difficulty: "Medium",
    statement: "A grid of \"1\" (land) and \"0\" (water) is given. Count the islands — groups of land cells connected horizontally or vertically.",
    format: "One line: the grid as a JSON array of arrays of strings. Print the number of islands.",
    hint: "Scan the grid. When you find unvisited land, count one island and flood-fill (DFS/BFS) all its connected land cells.",
    fn: `function numIslands(grid) {
  let count = 0;
  // your code
  return count;
}`,
    solution: `function numIslands(grid) {
  let count = 0;
  const R = grid.length, C = R ? grid[0].length : 0;
  const dfs = (r, c) => {
    if (r < 0 || c < 0 || r >= R || c >= C || grid[r][c] !== "1") return;
    grid[r][c] = "0";
    dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
  };
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (grid[r][c] === "1") { count++; dfs(r, c); }
  return count;
}`,
    harness: `console.log(numIslands(JSON.parse(input)));`,
    tests: [
      ['[["1","1","0"],["0","1","0"],["0","0","1"]]', "2"],
      ['[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', "1"],
      ['[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', "3"],
      ['[["0"]]', "0"],
    ],
  },
  {
    id: "lcs", title: "Longest Common Subsequence", category: "Dynamic Programming", difficulty: "Medium",
    statement: "Return the length of the longest subsequence present in both strings. A subsequence keeps the original order but may skip characters.",
    format: "Line 1: string a. Line 2: string b. Print the length.",
    hint: "dp[i][j] = dp[i-1][j-1] + 1 when a[i-1] === b[j-1], otherwise max(dp[i-1][j], dp[i][j-1]).",
    fn: `function lcs(a, b) {
  // your code
  return 0;
}`,
    solution: `function lcs(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp[a.length][b.length];
}`,
    harness: `const [a, b] = input.split("\\n");
console.log(lcs(a, b));`,
    tests: [["abcde\nace", "3"], ["abc\nabc", "3"], ["abc\ndef", "0"], ["AGGTAB\nGXTXAYB", "4"]],
  },
  {
    id: "trapping-rain-water", title: "Trapping Rain Water", category: "Arrays", difficulty: "Hard",
    statement: "Given n non-negative integers representing an elevation map where each bar has width 1, compute how much water it can trap after raining.",
    format: "One line: the heights as JSON. Print the trapped water units.",
    hint: "Water above a bar = min(tallest bar to its left, tallest to its right) − its height. Two pointers do it in O(1) extra space.",
    fn: `function trap(height) {
  let water = 0;
  // your code
  return water;
}`,
    solution: `function trap(height) {
  let lo = 0, hi = height.length - 1, leftMax = 0, rightMax = 0, water = 0;
  while (lo < hi) {
    if (height[lo] < height[hi]) { leftMax = Math.max(leftMax, height[lo]); water += leftMax - height[lo++]; }
    else { rightMax = Math.max(rightMax, height[hi]); water += rightMax - height[hi--]; }
  }
  return water;
}`,
    harness: `console.log(trap(JSON.parse(input)));`,
    tests: [["[0,1,0,2,1,0,1,3,2,1,2,1]", "6"], ["[4,2,0,3,2,5]", "9"], ["[]", "0"], ["[3,0,3]", "3"]],
  },
];

// ---------------------------------------------------------------------------
// Registry. Every course has its own challenge files (challenges-java.js, ...) that call
// registerChallenges("<course id>", [...]). Each challenge belongs to one roadmap TOPIC of that
// course (topic = topic id from data.js), and has a language: javascript | python | java | c | cpp | sql.
// ---------------------------------------------------------------------------
const CHALLENGES = [];
function registerChallenges(subject, list) {
  list.forEach(c => {
    c.subject = subject;
    c.lang = c.lang || "javascript";
    if (!c.starter) c.starter = `${c.fn}\n${c.harness}`;
    if (!c.solutionCode) c.solutionCode = `${c.solution}\n${c.harness}`;
    c.tests = c.tests.map(t => Array.isArray(t) ? { input: t[0], expected: t[1] } : t);
    c.xp = PRACTICE_XP[c.difficulty];
    CHALLENGES.push(c);
  });
}

// the original 14 challenges belong to the DSA course; map each to its roadmap topic
const _DSA_TOPIC = {
  "two-sum": "D1", "valid-anagram": "D1", "valid-palindrome": "D1", "first-unique-char": "D1", "trapping-rain-water": "D1",
  "reverse-linked-list": "D2", "valid-parentheses": "D3", "hot-potato": "D3", "max-depth-tree": "D5",
  "number-of-islands": "D6", "binary-search": "D7", "max-subarray": "D8", "climbing-stairs": "D8", "lcs": "D8",
};
DSA_CHALLENGES.forEach(c => { c.topic = _DSA_TOPIC[c.id]; delete c.category; });
registerChallenges("DSA", DSA_CHALLENGES);
