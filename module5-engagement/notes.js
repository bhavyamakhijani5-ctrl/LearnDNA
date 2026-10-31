/* ===================================================================
   MODULE 5 -- Revision Notes
   Every topic gets: a definition + key points (hand-written bank below),
   quick Q&A taken from the quiz bank, prerequisites + resource links,
   optional AI-generated notes (Gemini/Claude) and the student's own notes.
   Everything is saved on student.engage (notes / aiNotes).
   =================================================================== */

const DEFS = {
  T1: ["Java is a class-based, object-oriented, platform-independent language: source code compiles to bytecode that runs on the JVM.", ["Entry point: public static void main(String[] args)", "Primitive types: byte, short, int, long, float, double, char, boolean"]],
  T2: ["OOP is a paradigm that organises code into objects bundling data and behaviour.", ["4 pillars: encapsulation, inheritance, polymorphism, abstraction", "Class = blueprint, object = instance of that class"]],
  T3: ["The Collections Framework provides interfaces and classes (List, Set, Map, Queue) to store and process groups of objects.", ["List: ordered, allows duplicates; Set: no duplicates; Map: key-value pairs", "ArrayList = fast random access; LinkedList = fast insert/delete"]],
  T4: ["Exception handling deals with runtime errors using try, catch, finally, throw and throws so the program does not crash.", ["Checked exceptions are verified at compile time; unchecked (RuntimeException) are not", "finally always runs (cleanup); try-with-resources closes resources automatically"]],
  T5: ["Multithreading runs several threads concurrently inside one process to use the CPU efficiently.", ["Create threads by extending Thread or implementing Runnable", "synchronized prevents race conditions; deadlock = threads waiting on each other forever"]],
  T6: ["JDBC (Java Database Connectivity) is the API to connect Java to a database, run SQL and process results.", ["Flow: load driver, get Connection, create Statement/PreparedStatement, read ResultSet, close", "PreparedStatement is faster and prevents SQL injection"]],
  T7: ["SQL is the standard language to create, query and modify relational databases.", ["Core: SELECT, INSERT, UPDATE, DELETE; filter with WHERE, sort with ORDER BY, group with GROUP BY", "JOIN combines rows from two tables using a related column"]],
  T8: ["Spring Boot builds production-ready Spring applications quickly using auto-configuration and embedded servers.", ["@SpringBootApplication = @Configuration + @EnableAutoConfiguration + @ComponentScan", "Dependency Injection: Spring creates and wires beans for you"]],
  T9: ["REST is an architectural style for web services using HTTP methods on resources identified by URLs.", ["GET read, POST create, PUT/PATCH update, DELETE remove", "Stateless; data usually exchanged as JSON; common status codes 200, 201, 400, 404, 500"]],
  C1: ["C is a procedural, compiled, low-level language; every program starts execution at main().", ["Structure: #include, main(), statements ending with ;", "Data types: int, float, double, char; printf/scanf for I/O"]],
  C2: ["Control statements decide the flow of execution through decisions and loops.", ["if / else / switch for decisions", "for, while, do-while for loops; break and continue alter loops"]],
  C3: ["A function is a reusable named block of code that can take parameters and return a value.", ["Declaration (prototype), definition and call", "C passes arguments by value; use pointers to modify the original"]],
  C4: ["An array is a fixed-size collection of same-type elements in contiguous memory; a C string is a char array ending with the null character (\\0).", ["Index starts at 0; access by index is O(1)", "string.h: strlen, strcpy, strcmp, strcat"]],
  C5: ["A pointer is a variable that stores the memory address of another variable.", ["& gives the address, * dereferences", "Array name acts as a pointer to its first element; NULL points to nothing"]],
  C6: ["A structure groups different data types under one name; a union shares a single memory block among its members.", ["struct size = sum of members (plus padding)", "union size = largest member; only one member holds a value at a time"]],
  C7: ["File handling reads and writes files using FILE pointers and functions from stdio.h.", ["fopen modes: r, w, a, r+, w+", "Use fprintf/fscanf/fgets/fputs and always fclose"]],
  P1: ["C++ extends C with object-oriented features; console I/O uses cin and cout from iostream.", ["References (&), function overloading, namespaces", "new/delete for dynamic memory instead of malloc/free"]],
  P2: ["A class defines data members and member functions; an object is an instance of a class.", ["Access specifiers: private, protected, public", "Members accessed with . (object) or -> (pointer)"]],
  P3: ["A constructor initialises an object when it is created; a destructor cleans up when it is destroyed.", ["Constructor has the class name, no return type, can be overloaded", "Destructor has ~ prefix, takes no arguments, cannot be overloaded"]],
  P4: ["Inheritance lets a derived class reuse and extend a base class.", ["Types: single, multilevel, multiple, hierarchical, hybrid", "Diamond problem is solved with a virtual base class"]],
  P5: ["Polymorphism = one interface, many behaviours: compile-time (overloading) and run-time (overriding via virtual functions).", ["Virtual function + base-class pointer = run-time dispatch", "A pure virtual function makes the class abstract"]],
  P6: ["Operator overloading gives operators like +, == and << a custom meaning for user-defined types.", ["Written as operator+ etc.; member or friend function", "Cannot overload :: . .* ?: sizeof"]],
  P7: ["The STL is a template library of containers, iterators and algorithms.", ["Containers: vector, list, map, set, stack, queue", "Algorithms (sort, find, reverse) work on containers through iterators"]],
  PY1: ["Python is an interpreted, dynamically typed, high-level language that uses indentation for blocks.", ["Types: int, float, str, bool, list, tuple, dict, set", "No variable declaration needed; print() and input() for I/O"]],
  PY2: ["Control flow uses if/elif/else for decisions and for/while loops for repetition.", ["range() generates number sequences", "break, continue, pass; a loop's else runs only if no break happened"]],
  PY3: ["Built-in containers: list (mutable, ordered), tuple (immutable), dict (key-value), set (unique items).", ["List comprehension: [x*2 for x in a]", "Dict lookup is O(1) on average; set removes duplicates"]],
  PY4: ["Functions are defined with def; modules are .py files you import for reuse.", ["Default, keyword, *args and **kwargs parameters", "lambda = small anonymous function; import / from ... import"]],
  PY5: ["Python supports classes with the __init__ constructor and an explicit self reference.", ["Inheritance: class B(A); super() calls the parent", "Dunder methods like __str__ and __len__ customise behaviour"]],
  PY6: ["open() reads/writes files and try/except handles errors.", ["with open(...) closes the file automatically", "Modes r, w, a; except ValueError, finally, raise"]],
  PY7: ["NumPy provides fast n-dimensional arrays; Pandas provides DataFrames for tabular data.", ["NumPy operations are vectorised (no explicit loops)", "Pandas: read_csv, head(), groupby(), fillna()"]],
  D1: ["An array stores same-type elements contiguously with O(1) index access; a string is an array of characters.", ["Insert/delete in the middle is O(n)", "Common patterns: two pointers, sliding window; a palindrome reads the same forwards and backwards"]],
  D2: ["A linked list is a linear structure where each node holds data and a pointer to the next node.", ["Insert/delete at head O(1); search O(n)", "Types: singly, doubly, circular"]],
  D3: ["A stack is LIFO (push/pop); a queue is FIFO (enqueue/dequeue).", ["Stack uses: undo, recursion, expression evaluation", "Queue uses: scheduling, BFS; a deque works at both ends"]],
  D4: ["Recursion is when a function calls itself on a smaller input until it reaches a base case.", ["Needs a base case and a recursive case, else stack overflow", "Examples: factorial, Fibonacci, tree traversal"]],
  D5: ["A tree is a hierarchical structure of nodes with one root and no cycles.", ["Binary tree: at most 2 children; BST keeps left < root < right", "Traversals: inorder, preorder, postorder, level-order"]],
  D6: ["A graph is a set of vertices connected by edges (directed/undirected, weighted/unweighted).", ["Representations: adjacency matrix, adjacency list", "BFS uses a queue, DFS uses a stack/recursion; Dijkstra finds shortest paths"]],
  D7: ["Sorting orders data and searching finds elements efficiently.", ["Binary search is O(log n) and needs sorted data", "Merge/Quick/Heap sort O(n log n); Bubble/Insertion O(n^2)"]],
  D8: ["Dynamic programming solves a problem by splitting it into overlapping subproblems and storing their results.", ["Needs optimal substructure + overlapping subproblems", "Memoisation (top-down) or tabulation (bottom-up); e.g. knapsack, LCS"]],
  B1: ["The ER model designs a database using entities, attributes and relationships.", ["Cardinality: 1:1, 1:N, M:N", "Primary key uniquely identifies a row; a weak entity depends on another entity"]],
  B2: ["The relational model stores data as relations (tables) of tuples (rows) and attributes (columns).", ["Keys: primary, candidate, foreign, super", "Relational algebra: select, project, union, join"]],
  B3: ["SQL defines (DDL), manipulates (DML) and queries data in relational databases.", ["DDL: CREATE, ALTER, DROP; DML: INSERT, UPDATE, DELETE; query: SELECT", "Aggregates COUNT, SUM, AVG, MIN, MAX with GROUP BY / HAVING"]],
  B4: ["Joins combine rows from multiple tables; a subquery is a query nested inside another query.", ["INNER, LEFT, RIGHT and FULL joins", "A correlated subquery runs once per outer row"]],
  B5: ["Normalization organises tables to reduce redundancy and update anomalies.", ["1NF atomic values; 2NF no partial dependency; 3NF no transitive dependency", "BCNF: every determinant is a candidate key"]],
  B6: ["A transaction is a logical unit of work that must follow the ACID properties.", ["ACID: Atomicity, Consistency, Isolation, Durability", "Problems: dirty read, lost update; solved with locking and isolation levels"]],
  B7: ["An index is a data structure (usually a B+ tree) that speeds up data lookups.", ["Faster reads, slower writes, extra storage", "Index columns used in WHERE/JOIN; check plans with EXPLAIN"]],
  O1: ["A class is a blueprint; an object is a real instance with its own state.", ["State = attributes, behaviour = methods", "Creating an object allocates memory and calls the constructor"]],
  O2: ["Encapsulation bundles data and methods together and hides internal details.", ["Make fields private, expose getters/setters", "Gives data security and easier maintenance"]],
  O3: ["A constructor initialises an object; a destructor (or finalizer) releases resources.", ["Default, parameterised and copy constructors", "Java has no destructors (garbage collector); C++ has ~ClassName()"]],
  O4: ["Inheritance lets a child class acquire the properties and methods of a parent class (IS-A relation).", ["Promotes code reuse and enables method overriding", "Java: single inheritance for classes, multiple via interfaces"]],
  O5: ["Polymorphism means one interface with many forms: overloading (compile-time) and overriding (run-time).", ["Overloading = same name, different parameters", "Overriding = child redefines the parent method; dynamic binding"]],
  O6: ["Abstraction shows only essential features and hides implementation details.", ["Achieved with abstract classes and interfaces", "An abstract class cannot be instantiated; an interface is a pure contract"]],
};

const Notes = {
  store() { const e = Engage.get(); e.notes = e.notes || {}; e.aiNotes = e.aiNotes || {}; return e; },
  qa(id) { return (SEED_QUIZZES[id] || []).map(q => `${q.q.replace(/\?$/, "")} → ${q.options[q.answer]}`); },

  // plain-text/markdown version of one topic (used by export)
  md(t) {
    const e = this.store(), d = DEFS[t.id], pre = currentGraph().dfsPrerequisiteChain(t.id).map(p => p.title);
    return [`## ${t.title}  (${t.difficulty.toLowerCase()}, mastery ${CURRENT.dna.getMastery(t.id)}%)`,
      d ? `**Definition:** ${d[0]}\n\n**Key points:**\n${d[1].map(p => "- " + p).join("\n")}` : "",
      this.qa(t.id).length ? `**Quick Q&A:**\n${this.qa(t.id).map(x => "- " + x).join("\n")}` : "",
      pre.length ? `**Prerequisites:** ${pre.join(", ")}` : "",
      e.aiNotes[t.id] ? `**AI notes:**\n${e.aiNotes[t.id]}` : "",
      e.notes[t.id] ? `**My notes:**\n${e.notes[t.id]}` : ""].filter(Boolean).join("\n\n");
  },

  card(t, due) {
    const e = this.store(), d = DEFS[t.id], m = CURRENT.dna.getMastery(t.id), g = currentGraph();
    const pre = g.dfsPrerequisiteChain(t.id);
    return `<details class="note-card" data-note="${t.id}" ${due ? "open" : ""}>
      <summary><span>${esc(t.title)}</span>${due ? `<span class="badge building">due</span>` : ""}${m >= PASS_THRESHOLD ? `<span class="badge neutral">mastered</span>` : ""}<span class="mono hint" style="margin-left:auto;">${m}%</span></summary>
      <div class="note-body">
        ${d ? `<p><strong>Definition:</strong> ${esc(d[0])}</p><ul>${d[1].map(p => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
        ${this.qa(t.id).length ? `<div class="hint" style="margin-top:8px;">Quick Q&amp;A (quiz bank)</div><ul>${this.qa(t.id).map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
        ${pre.length ? `<p class="hint">Prerequisites: ${pre.map(p => `<a href="#/topic/${p.id}">${esc(p.title)}</a>`).join(", ")}</p>` : ""}
        <div class="chips">${chips(t, false)}</div>
        <div class="ai-notes" id="ain-${t.id}">${e.aiNotes[t.id] ? `<div class="msg assistant" style="max-width:100%;margin-top:10px;">${Tutor.fmt(e.aiNotes[t.id])}</div>` : ""}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0;">
          <button class="btn small" data-ainote="${t.id}">✨ ${e.aiNotes[t.id] ? "Regenerate" : "Generate"} AI notes</button>
          <a class="btn ghost small" href="#/quiz/${t.id}">Quick quiz</a><a class="btn ghost small" href="#/tutor/${t.id}">Ask tutor</a>
        </div>
        <label class="hint">My notes (auto-saved)</label>
        <textarea class="note-ta" data-mynote="${t.id}" rows="4" placeholder="Write your own points, formulas and mnemonics here…">${esc(e.notes[t.id] || "")}</textarea>
      </div></details>`;
  },

  html(dueIds) {
    const g = currentGraph(), list = g.getAllTopics().slice().sort((a, b) => (dueIds.has(b.id) - dueIds.has(a.id)) || (CURRENT.dna.getMastery(a.id) - CURRENT.dna.getMastery(b.id)));
    return `<div class="divider"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
        <div class="section-title" style="margin:0;">revision notes · ${list.length} topics</div>
        <div style="display:flex;gap:8px;"><input id="note-filter" class="mini-select" placeholder="Search notes…"><button class="btn small" id="note-dl">⬇ Download all (.md)</button></div></div>
      <div id="note-list">${list.map(t => this.card(t, dueIds.has(t.id))).join("")}</div>`;
  },

  bind() {
    const e = this.store(), g = currentGraph();
    root.querySelectorAll("[data-mynote]").forEach(ta => { let tm; ta.addEventListener("input", () => { clearTimeout(tm); tm = setTimeout(() => { e.notes[ta.dataset.mynote] = ta.value; persist(); }, 400); }); });
    const f = document.getElementById("note-filter");
    if (f) f.addEventListener("input", () => root.querySelectorAll(".note-card").forEach(c => { c.style.display = c.textContent.toLowerCase().includes(f.value.toLowerCase()) ? "" : "none"; }));
    const dl = document.getElementById("note-dl");
    if (dl) dl.addEventListener("click", () => {
      const txt = `# ${GOALS.get(CURRENT.activeGoalId).title} — Revision Notes\n_${CURRENT.name}, ${new Date().toLocaleDateString()}_\n\n` + g.getAllTopics().map(t => this.md(t)).join("\n\n---\n\n");
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/markdown" })); a.download = `revision-notes-${CURRENT.activeGoalId}.md`; a.click(); URL.revokeObjectURL(a.href);
    });
    root.querySelectorAll("[data-ainote]").forEach(b => b.addEventListener("click", async () => {
      const t = g.getTopic(b.dataset.ainote), box = document.getElementById("ain-" + t.id);
      if (!Tutor.hasKey()) { box.innerHTML = `<p class="hint" style="margin-top:8px;">To generate AI notes, add a Gemini API key in <a href="#/tutor">AI Tutor → AI settings</a>.</p>`; return; }
      b.disabled = true; box.innerHTML = `<p class="hint" style="margin-top:8px;">Generating notes…</p>`;
      try {
        const out = await Tutor.askModel(Tutor.context(), [{ role: "user", content: `Write concise exam-revision notes for the topic "${t.title}" (${GOALS.get(CURRENT.activeGoalId).title}). Use bullet points with these headings: Definition, Key concepts, Syntax/formula or tiny code example, Common exam questions, Common mistakes. Max 220 words.` }]);
        e.aiNotes[t.id] = out; persist(); box.innerHTML = `<div class="msg assistant" style="max-width:100%;margin-top:10px;">${Tutor.fmt(out)}</div>`;
      } catch (ex) { box.innerHTML = `<div class="error-msg">${esc(ex.message)}</div>`; }
      b.disabled = false;
    }));
  },
};
