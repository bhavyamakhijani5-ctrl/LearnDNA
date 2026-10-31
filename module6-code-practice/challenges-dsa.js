/* MODULE 6 -- Code Practice: DSA course challenges, in roadmap order.
   Expected outputs were produced by running the model solution in a real compiler/interpreter. */
registerChallenges("DSA", [
  {
    id: "dsa-hanoi", topic: "D4", title: "Tower of Hanoi", difficulty: "Medium", lang: "javascript",
    statement: `Move n disks from peg A to peg C using peg B. Only one disk moves at a time and a bigger disk never sits on a smaller one. Print every move as \`X->Y\` using recursion: move n-1 disks to the helper, move the biggest disk, then move the n-1 disks on top of it.`,
    format: `One line: n. Print the moves, one per line (the minimum number is 2^n - 1).`,
    hint: `hanoi(n, from, to, via): if n === 0 return; hanoi(n-1, from, via, to); print from->to; hanoi(n-1, via, to, from).`,
    starter: `function hanoi(n, from, to, via, moves) {
  // your code (recursion)
}

const moves = [];
hanoi(+input, "A", "C", "B", moves);
console.log(moves.join("\\n"));`,
    solutionCode: `function hanoi(n, from, to, via, moves) {
  if (n === 0) return;
  hanoi(n - 1, from, via, to, moves);
  moves.push(\`\${from}->\${to}\`);
  hanoi(n - 1, via, to, from, moves);
}

const moves = [];
hanoi(+input, "A", "C", "B", moves);
console.log(moves.join("\\n"));`,
    tests: [
      { input: `1`, expected: `A->C` },
      { input: `2`, expected: `A->B
A->C
B->C` },
      { input: `3`, expected: `A->C
A->B
C->B
A->C
B->A
B->C
A->C` },
      { input: `4`, expected: `A->B
A->C
B->C
A->B
C->A
C->B
A->B
A->C
B->C
B->A
C->A
B->C
A->B
A->C
B->C` },
    ],
  },
  {
    id: "dsa-permutations", topic: "D4", title: "String Permutations", difficulty: "Medium", lang: "javascript",
    statement: `Print every permutation of a string of distinct lowercase letters in alphabetical order, one per line. Use recursion and backtracking.`,
    format: `One line: the string (length <= 6). Print all permutations in sorted order.`,
    hint: `Pick each unused character in turn, recurse on the rest, and sort the final list (or iterate the letters in sorted order).`,
    starter: `function permutations(s) {
  const result = [];
  // your code (recursion / backtracking)
  return result;
}

console.log(permutations(input.trim()).join("\\n"));`,
    solutionCode: `function permutations(s) {
  const result = [];
  const chars = s.split("").sort();
  const used = new Array(chars.length).fill(false);
  const cur = [];
  (function go() {
    if (cur.length === chars.length) { result.push(cur.join("")); return; }
    for (let i = 0; i < chars.length; i++) {
      if (used[i]) continue;
      used[i] = true; cur.push(chars[i]);
      go();
      cur.pop(); used[i] = false;
    }
  })();
  return result;
}

console.log(permutations(input.trim()).join("\\n"));`,
    tests: [
      { input: `abc`, expected: `abc
acb
bac
bca
cab
cba` },
      { input: `a`, expected: `a` },
      { input: `ba`, expected: `ab
ba` },
      { input: `dcab`, expected: `abcd
abdc
acbd
acdb
adbc
adcb
bacd
badc
bcad
bcda
bdac
bdca
cabd
cadb
cbad
cbda
cdab
cdba
dabc
dacb
dbac
dbca
dcab
dcba` },
    ],
  },
  {
    id: "dsa-merge-intervals", topic: "D7", title: "Merge Intervals", difficulty: "Medium", lang: "javascript",
    statement: `Given a list of intervals \`[start, end]\`, merge all overlapping intervals (intervals that touch, like [1,3] and [3,5], also merge) and return the result sorted by start.`,
    format: `One line: the intervals as JSON. Print the merged intervals as JSON.`,
    hint: `Sort by start. Walk through the list: if the next start is <= the end of the last merged interval, extend that end; otherwise push a new interval.`,
    starter: `function merge(intervals) {
  const out = [];
  // your code
  return out;
}

console.log(JSON.stringify(merge(JSON.parse(input))));`,
    solutionCode: `function merge(intervals) {
  const out = [];
  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);
  for (const iv of sorted) {
    const last = out[out.length - 1];
    if (last && iv[0] <= last[1]) last[1] = Math.max(last[1], iv[1]);
    else out.push([iv[0], iv[1]]);
  }
  return out;
}

console.log(JSON.stringify(merge(JSON.parse(input))));`,
    tests: [
      { input: `[[1,3],[2,6],[8,10],[15,18]]`, expected: `[[1,6],[8,10],[15,18]]` },
      { input: `[[1,4],[4,5]]`, expected: `[[1,5]]` },
      { input: `[[5,6],[1,2],[2,4]]`, expected: `[[1,4],[5,6]]` },
      { input: `[[1,10],[2,3],[4,5]]`, expected: `[[1,10]]` },
    ],
  },
  {
    id: "dsa-bfs-shortest-path", topic: "D6", title: "Shortest Path (BFS)", difficulty: "Medium", lang: "javascript",
    statement: `Given an undirected, unweighted graph, find the minimum number of edges on a path from node \`s\` to node \`t\`, or -1 if \`t\` cannot be reached. Use breadth-first search with a queue and a \`visited\`/distance array.`,
    format: `Line 1: \`n m\` (nodes are 0..n-1). Next m lines: \`u v\`. Last line: \`s t\`. Print the distance.`,
    hint: `Start the queue with s (dist 0). Pop a node, push each unvisited neighbour with dist + 1.`,
    starter: `const lines = input.trim().split("\\n");
const [n, m] = lines[0].split(" ").map(Number);
const adj = Array.from({ length: n }, () => []);
for (let i = 1; i <= m; i++) {
  const [u, v] = lines[i].split(" ").map(Number);
  adj[u].push(v); adj[v].push(u);
}
const [s, t] = lines[m + 1].split(" ").map(Number);

function shortest(s, t) {
  // your code (BFS)
  return -1;
}
console.log(shortest(s, t));`,
    solutionCode: `const lines = input.trim().split("\\n");
const [n, m] = lines[0].split(" ").map(Number);
const adj = Array.from({ length: n }, () => []);
for (let i = 1; i <= m; i++) {
  const [u, v] = lines[i].split(" ").map(Number);
  adj[u].push(v); adj[v].push(u);
}
const [s, t] = lines[m + 1].split(" ").map(Number);

function shortest(s, t) {
  const dist = new Array(n).fill(-1);
  dist[s] = 0;
  const q = [s];
  while (q.length) {
    const x = q.shift();
    if (x === t) return dist[x];
    for (const y of adj[x]) if (dist[y] === -1) { dist[y] = dist[x] + 1; q.push(y); }
  }
  return dist[t];
}
console.log(shortest(s, t));`,
    tests: [
      { input: `5 5
0 1
1 2
0 3
3 4
4 2
0 2`, expected: `2` },
      { input: `4 2
0 1
2 3
0 3`, expected: `-1` },
      { input: `1 0
0 0`, expected: `0` },
      { input: `6 6
0 1
1 2
2 3
3 4
4 5
0 5
0 4`, expected: `2` },
    ],
  },
]);
