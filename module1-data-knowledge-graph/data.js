/* MODULE 1 — Data & Knowledge Graph: seed subjects, topics, prerequisites, quiz bank. */
/* ===================================================================
   data.js — curated Knowledge Graphs for multiple subjects.
   Each subject is an independent domain: its own topics, its own
   prerequisite edges, its own quiz bank. Picking a subject on the
   goal-select screen decides which graph the rest of the app (roadmap,
   graph explorer, assessment, dashboard) is built from.
   The Java subject mirrors learndna.util.DataSeeder from the original
   Java codebase (same topic ids T1..T9, same edges).
   =================================================================== */

const PASS_THRESHOLD = 70;

const SEED_SUBJECTS = [
  // ------------------------------------------------------------ JAVA
  {
    id: "JAVA",
    title: "Java (Backend Track)",
    description: "Build server-side applications using Java, Spring Boot and databases.",
    topics: [
      { id: "T1", title: "Java Basics",        domain: "Java",     difficulty: "EASY",   minutes: 90,  resources: [
          { id: "R1", type: "VIDEO",   title: "Java Basics Crash Course", ref: "video://java-basics" },
          { id: "R1b", type: "PROJECT", title: "Print & Loop Mini-Drills", ref: "proj://java-basics-drills" } ] },
      { id: "T2", title: "OOP Concepts",       domain: "Java",     difficulty: "EASY",   minutes: 120, resources: [
          { id: "R2", type: "PDF",     title: "OOP Concepts Notes", ref: "res/oop-notes.pdf" },
          { id: "R2b", type: "VIDEO",  title: "Inheritance & Polymorphism Explained", ref: "video://oop-concepts" } ] },
      { id: "T3", title: "Collections",        domain: "Java",     difficulty: "MEDIUM", minutes: 100, resources: [
          { id: "R3", type: "QUIZ",    title: "Collections Quiz", ref: "quiz://collections" },
          { id: "R3b", type: "VIDEO",  title: "List, Set, Map Deep Dive", ref: "video://collections" } ] },
      { id: "T4", title: "Exception Handling", domain: "Java",     difficulty: "MEDIUM", minutes: 60,  resources: [
          { id: "R4a", type: "PDF",    title: "Checked vs Unchecked Exceptions", ref: "res/exceptions-notes.pdf" } ] },
      { id: "T5", title: "Multithreading",     domain: "Java",     difficulty: "HARD",   minutes: 150, resources: [
          { id: "R5a", type: "VIDEO",  title: "Threads, Runnable & Synchronization", ref: "video://multithreading" } ] },
      { id: "T6", title: "JDBC",               domain: "Java",     difficulty: "MEDIUM", minutes: 100, resources: [
          { id: "R6a", type: "VIDEO",  title: "Connecting Java to a Database", ref: "video://jdbc" } ] },
      { id: "T7", title: "SQL Basics",         domain: "Java",     difficulty: "EASY",   minutes: 80,  resources: [
          { id: "R7a", type: "PDF",    title: "SELECT, JOIN & GROUP BY Cheatsheet", ref: "res/sql-notes.pdf" } ] },
      { id: "T8", title: "Spring Boot",        domain: "Java",     difficulty: "HARD",   minutes: 200, resources: [
          { id: "R4", type: "PROJECT", title: "Spring Boot Mini Project", ref: "proj://springboot-demo" } ] },
      { id: "T9", title: "REST APIs",          domain: "Java",     difficulty: "MEDIUM", minutes: 90,  resources: [
          { id: "R9a", type: "VIDEO",  title: "Designing REST Endpoints", ref: "video://rest-apis" } ] },
    ],
    edges: [
      ["T1", "T2"], ["T2", "T3"], ["T2", "T4"], ["T3", "T5"],
      ["T1", "T7"], ["T7", "T6"], ["T4", "T6"], ["T4", "T9"],
      ["T6", "T8"], ["T9", "T8"],
    ],
  },

  // --------------------------------------------------------------- C
  {
    id: "C",
    title: "C Programming",
    description: "Procedural fundamentals — memory, control flow and pointers from the ground up.",
    topics: [
      { id: "C1", title: "C Basics",              domain: "C", difficulty: "EASY",   minutes: 60, resources: [
          { id: "CR1", type: "VIDEO", title: "Variables, Data Types & I/O", ref: "video://c-basics" } ] },
      { id: "C2", title: "Control Statements",     domain: "C", difficulty: "EASY",   minutes: 50, resources: [
          { id: "CR2", type: "PDF",   title: "if/else, switch & loops", ref: "res/c-control.pdf" } ] },
      { id: "C3", title: "Functions",              domain: "C", difficulty: "EASY",   minutes: 60, resources: [
          { id: "CR3", type: "VIDEO", title: "Functions & Recursion Basics", ref: "video://c-functions" } ] },
      { id: "C4", title: "Arrays & Strings",       domain: "C", difficulty: "MEDIUM", minutes: 80, resources: [
          { id: "CR4", type: "QUIZ",  title: "Arrays & Strings Quiz", ref: "quiz://c-arrays" } ] },
      { id: "C5", title: "Pointers",                domain: "C", difficulty: "MEDIUM", minutes: 90, resources: [
          { id: "CR5", type: "VIDEO", title: "Pointers & Address Arithmetic", ref: "video://c-pointers" } ] },
      { id: "C6", title: "Structures & Unions",     domain: "C", difficulty: "MEDIUM", minutes: 70, resources: [
          { id: "CR6", type: "PDF",   title: "struct vs union", ref: "res/c-structs.pdf" } ] },
      { id: "C7", title: "File Handling in C",      domain: "C", difficulty: "MEDIUM", minutes: 60, resources: [
          { id: "CR7", type: "PROJECT", title: "Mini Student-Record File Store", ref: "proj://c-file-handling" } ] },
    ],
    edges: [
      ["C1", "C2"], ["C2", "C3"], ["C2", "C4"], ["C3", "C5"], ["C4", "C5"], ["C5", "C6"], ["C6", "C7"],
    ],
  },

  // ------------------------------------------------------------- C++
  {
    id: "CPP",
    title: "C++ & OOP",
    description: "Object-oriented programming with C++ — classes through STL.",
    topics: [
      { id: "P1", title: "C++ Basics",              domain: "C++", difficulty: "EASY",   minutes: 60,  resources: [
          { id: "PR1", type: "VIDEO", title: "C++ Syntax & I/O Streams", ref: "video://cpp-basics" } ] },
      { id: "P2", title: "Classes & Objects",        domain: "C++", difficulty: "EASY",   minutes: 90,  resources: [
          { id: "PR2", type: "PDF",   title: "Classes, Objects & Access Specifiers", ref: "res/cpp-classes.pdf" } ] },
      { id: "P3", title: "Constructors & Destructors", domain: "C++", difficulty: "MEDIUM", minutes: 60, resources: [
          { id: "PR3", type: "VIDEO", title: "Constructor Overloading & RAII", ref: "video://cpp-ctor" } ] },
      { id: "P4", title: "Inheritance",              domain: "C++", difficulty: "MEDIUM", minutes: 90,  resources: [
          { id: "PR4", type: "PDF",   title: "Single, Multiple & Multilevel Inheritance", ref: "res/cpp-inheritance.pdf" } ] },
      { id: "P5", title: "Polymorphism",             domain: "C++", difficulty: "MEDIUM", minutes: 90,  resources: [
          { id: "PR5", type: "VIDEO", title: "Virtual Functions & Overriding", ref: "video://cpp-polymorphism" } ] },
      { id: "P6", title: "Operator Overloading",     domain: "C++", difficulty: "MEDIUM", minutes: 70,  resources: [
          { id: "PR6", type: "QUIZ",  title: "Operator Overloading Quiz", ref: "quiz://cpp-operators" } ] },
      { id: "P7", title: "STL (Standard Template Library)", domain: "C++", difficulty: "HARD", minutes: 120, resources: [
          { id: "PR7", type: "PROJECT", title: "STL Containers Mini Project", ref: "proj://cpp-stl-demo" } ] },
    ],
    edges: [
      ["P1", "P2"], ["P2", "P3"], ["P2", "P4"], ["P4", "P5"], ["P3", "P6"], ["P5", "P7"],
    ],
  },

  // ---------------------------------------------------------- PYTHON
  {
    id: "PYTHON",
    title: "Python",
    description: "From syntax basics to OOP and lightweight data tooling.",
    topics: [
      { id: "PY1", title: "Python Basics",           domain: "Python", difficulty: "EASY",   minutes: 50, resources: [
          { id: "YR1", type: "VIDEO", title: "Python Syntax & Variables", ref: "video://python-basics" } ] },
      { id: "PY2", title: "Control Flow & Loops",     domain: "Python", difficulty: "EASY",   minutes: 50, resources: [
          { id: "YR2", type: "PDF",   title: "Conditionals, for & while", ref: "res/python-control.pdf" } ] },
      { id: "PY3", title: "Data Structures (List/Dict/Tuple)", domain: "Python", difficulty: "EASY", minutes: 70, resources: [
          { id: "YR3", type: "QUIZ",  title: "Lists, Tuples & Dicts Quiz", ref: "quiz://python-datastructs" } ] },
      { id: "PY4", title: "Functions & Modules",      domain: "Python", difficulty: "MEDIUM", minutes: 60, resources: [
          { id: "YR4", type: "VIDEO", title: "Functions, Args & Imports", ref: "video://python-functions" } ] },
      { id: "PY5", title: "OOP in Python",            domain: "Python", difficulty: "MEDIUM", minutes: 90, resources: [
          { id: "YR5", type: "PDF",   title: "Classes & self in Python", ref: "res/python-oop.pdf" } ] },
      { id: "PY6", title: "File Handling & Exceptions", domain: "Python", difficulty: "MEDIUM", minutes: 60, resources: [
          { id: "YR6", type: "VIDEO", title: "try/except & File I/O", ref: "video://python-exceptions" } ] },
      { id: "PY7", title: "NumPy & Pandas Basics",     domain: "Python", difficulty: "HARD", minutes: 100, resources: [
          { id: "YR7", type: "PROJECT", title: "CSV Analysis Mini Project", ref: "proj://python-pandas-demo" } ] },
    ],
    edges: [
      ["PY1", "PY2"], ["PY2", "PY3"], ["PY2", "PY4"], ["PY4", "PY5"], ["PY4", "PY6"], ["PY3", "PY7"], ["PY6", "PY7"],
    ],
  },

  // -------------------------------------------------------------- DSA
  {
    id: "DSA",
    title: "Data Structures & Algorithms",
    description: "Core structures and algorithmic thinking for interviews and problem-solving.",
    topics: [
      { id: "D1", title: "Arrays & Strings",   domain: "DSA", difficulty: "EASY",   minutes: 80,  resources: [
          { id: "DR1", type: "VIDEO", title: "Array & String Fundamentals", ref: "video://dsa-arrays" } ] },
      { id: "D2", title: "Linked Lists",       domain: "DSA", difficulty: "MEDIUM", minutes: 90,  resources: [
          { id: "DR2", type: "PDF",   title: "Singly vs Doubly Linked Lists", ref: "res/dsa-linkedlist.pdf" } ] },
      { id: "D3", title: "Stacks & Queues",    domain: "DSA", difficulty: "MEDIUM", minutes: 80,  resources: [
          { id: "DR3", type: "QUIZ",  title: "Stacks & Queues Quiz", ref: "quiz://dsa-stackqueue" } ] },
      { id: "D4", title: "Recursion",          domain: "DSA", difficulty: "MEDIUM", minutes: 70,  resources: [
          { id: "DR4", type: "VIDEO", title: "Recursion & the Call Stack", ref: "video://dsa-recursion" } ] },
      { id: "D5", title: "Trees",              domain: "DSA", difficulty: "MEDIUM", minutes: 100, resources: [
          { id: "DR5", type: "PDF",   title: "Binary Trees & Traversals", ref: "res/dsa-trees.pdf" } ] },
      { id: "D6", title: "Graphs",             domain: "DSA", difficulty: "HARD",   minutes: 120, resources: [
          { id: "DR6", type: "VIDEO", title: "Graph Representations, BFS & DFS", ref: "video://dsa-graphs" } ] },
      { id: "D7", title: "Sorting & Searching", domain: "DSA", difficulty: "MEDIUM", minutes: 90, resources: [
          { id: "DR7", type: "PDF",   title: "Merge Sort, Quick Sort & Binary Search", ref: "res/dsa-sorting.pdf" } ] },
      { id: "D8", title: "Dynamic Programming", domain: "DSA", difficulty: "HARD",  minutes: 150, resources: [
          { id: "DR8", type: "PROJECT", title: "Classic DP Problem Set", ref: "proj://dsa-dp-demo" } ] },
    ],
    edges: [
      ["D1", "D2"], ["D2", "D3"], ["D1", "D4"], ["D3", "D5"], ["D4", "D5"], ["D5", "D6"], ["D1", "D7"], ["D4", "D8"], ["D7", "D8"],
    ],
  },

  // ------------------------------------------------------------- DBMS
  {
    id: "DBMS",
    title: "DBMS",
    description: "Relational database design, SQL and transaction fundamentals.",
    topics: [
      { id: "B1", title: "ER Model & Design",         domain: "DBMS", difficulty: "EASY",   minutes: 70, resources: [
          { id: "BR1", type: "PDF",   title: "Entities, Attributes & Relationships", ref: "res/dbms-ermodel.pdf" } ] },
      { id: "B2", title: "Relational Model",           domain: "DBMS", difficulty: "EASY",   minutes: 60, resources: [
          { id: "BR2", type: "VIDEO", title: "Tables, Keys & Constraints", ref: "video://dbms-relational" } ] },
      { id: "B3", title: "SQL Basics",                 domain: "DBMS", difficulty: "EASY",   minutes: 80, resources: [
          { id: "BR3", type: "QUIZ",  title: "SELECT & WHERE Quiz", ref: "quiz://dbms-sql-basics" } ] },
      { id: "B4", title: "Joins & Subqueries",         domain: "DBMS", difficulty: "MEDIUM", minutes: 80, resources: [
          { id: "BR4", type: "PDF",   title: "INNER/OUTER Joins & Nested Queries", ref: "res/dbms-joins.pdf" } ] },
      { id: "B5", title: "Normalization",              domain: "DBMS", difficulty: "MEDIUM", minutes: 90, resources: [
          { id: "BR5", type: "VIDEO", title: "1NF to BCNF Explained", ref: "video://dbms-normalization" } ] },
      { id: "B6", title: "Transactions & Concurrency",  domain: "DBMS", difficulty: "HARD",   minutes: 100, resources: [
          { id: "BR6", type: "PDF",   title: "ACID Properties & Locking", ref: "res/dbms-transactions.pdf" } ] },
      { id: "B7", title: "Indexing & Query Optimization", domain: "DBMS", difficulty: "HARD", minutes: 90, resources: [
          { id: "BR7", type: "PROJECT", title: "Query Tuning Mini Project", ref: "proj://dbms-indexing-demo" } ] },
    ],
    edges: [
      ["B1", "B2"], ["B2", "B3"], ["B3", "B4"], ["B2", "B5"], ["B4", "B6"], ["B4", "B7"],
    ],
  },

  // -------------------------------------------------------------- OOP
  {
    id: "OOP",
    title: "OOP Fundamentals",
    description: "Language-agnostic object-oriented design principles.",
    topics: [
      { id: "O1", title: "Classes & Objects",          domain: "OOP", difficulty: "EASY",   minutes: 60, resources: [
          { id: "OR1", type: "VIDEO", title: "What Is a Class, What Is an Object", ref: "video://oop-classes" } ] },
      { id: "O2", title: "Encapsulation",               domain: "OOP", difficulty: "EASY",   minutes: 50, resources: [
          { id: "OR2", type: "PDF",   title: "Data Hiding & Access Control", ref: "res/oop-encapsulation.pdf" } ] },
      { id: "O3", title: "Constructors & Destructors",   domain: "OOP", difficulty: "MEDIUM", minutes: 50, resources: [
          { id: "OR3", type: "QUIZ",  title: "Constructors Quiz", ref: "quiz://oop-constructors" } ] },
      { id: "O4", title: "Inheritance",                  domain: "OOP", difficulty: "MEDIUM", minutes: 80, resources: [
          { id: "OR4", type: "VIDEO", title: "Reusing Behaviour Through Inheritance", ref: "video://oop-inheritance" } ] },
      { id: "O5", title: "Polymorphism",                 domain: "OOP", difficulty: "MEDIUM", minutes: 80, resources: [
          { id: "OR5", type: "PDF",   title: "Compile-time vs Runtime Polymorphism", ref: "res/oop-polymorphism.pdf" } ] },
      { id: "O6", title: "Abstraction",                  domain: "OOP", difficulty: "MEDIUM", minutes: 60, resources: [
          { id: "OR6", type: "PROJECT", title: "Interface-Driven Design Exercise", ref: "proj://oop-abstraction-demo" } ] },
    ],
    edges: [
      ["O1", "O2"], ["O1", "O3"], ["O1", "O4"], ["O4", "O5"], ["O2", "O6"],
    ],
  },
];

// legacy alias kept for anything still referencing the old single-domain names
const SEED_TOPICS = SEED_SUBJECTS[0].topics;
const SEED_EDGES = SEED_SUBJECTS[0].edges;
const SEED_GOALS = SEED_SUBJECTS.map(s => ({ id: s.id, title: s.title, description: s.description, requiredTopicIds: s.topics.map(t => t.id) }));

// -------------------------------------------------------- quiz bank
// 3 questions per topic, keyed by topic id (unique across all subjects).
const SEED_QUIZZES = {
  // ---- Java
  T1: [
    { q: "Which keyword is used to define a class in Java?", options: ["class", "struct", "define", "object"], answer: 0 },
    { q: "What is the entry point method of a Java application?", options: ["start()", "run()", "main()", "init()"], answer: 2 },
    { q: "Which of these is a primitive type in Java?", options: ["String", "Integer", "int", "ArrayList"], answer: 2 },
  ],
  T2: [
    { q: "Which OOP pillar lets a subclass override a parent's method?", options: ["Encapsulation", "Polymorphism", "Abstraction", "Composition"], answer: 1 },
    { q: "What does encapsulation primarily achieve?", options: ["Faster execution", "Hiding internal state behind methods", "Multiple inheritance", "Static typing"], answer: 1 },
    { q: "Which keyword allows a class to reuse another class's members?", options: ["implements", "extends", "import", "super"], answer: 1 },
  ],
  T3: [
    { q: "Which collection avoids duplicate elements?", options: ["ArrayList", "HashSet", "LinkedList", "Stack"], answer: 1 },
    { q: "Which interface represents a key-value mapping?", options: ["List", "Set", "Map", "Queue"], answer: 2 },
    { q: "Which data structure follows FIFO order?", options: ["Stack", "Queue", "Tree", "Graph"], answer: 1 },
  ],
  T4: [
    { q: "Which keyword is used to handle exceptions in Java?", options: ["try", "loop", "switch", "goto"], answer: 0 },
    { q: "Which block always executes, exception or not?", options: ["catch", "throw", "finally", "assert"], answer: 2 },
    { q: "Which exception type must be declared or caught at compile time?", options: ["Unchecked exception", "RuntimeException", "Checked exception", "Error"], answer: 2 },
  ],
  T5: [
    { q: "Which class represents a unit of execution in Java concurrency?", options: ["Thread", "Process", "Runnable only", "Loop"], answer: 0 },
    { q: "Which keyword prevents two threads from executing a block simultaneously?", options: ["volatile", "synchronized", "static", "final"], answer: 1 },
    { q: "What is a common bug caused by unsynchronized shared state?", options: ["Compile error", "Race condition", "Memory leak only", "Null pointer only"], answer: 1 },
  ],
  T6: [
    { q: "What does JDBC stand for?", options: ["Java Database Connectivity", "Java Data Binding Class", "Java Direct Bytecode Compiler", "Joined Database Cursor"], answer: 0 },
    { q: "Which object is used to execute a SQL query in JDBC?", options: ["Connection", "Statement", "ResultSet", "Driver"], answer: 1 },
    { q: "Which object holds the results of a SQL query in JDBC?", options: ["ResultSet", "Statement", "Connection", "DataSource"], answer: 0 },
  ],
  T7: [
    { q: "Which SQL clause filters rows before grouping?", options: ["HAVING", "WHERE", "GROUP BY", "ORDER BY"], answer: 1 },
    { q: "Which SQL keyword combines rows from two tables on a related column?", options: ["MERGE", "JOIN", "UNION", "LINK"], answer: 1 },
    { q: "Which clause sorts the result set?", options: ["SORT BY", "ORDER BY", "GROUP BY", "ARRANGE BY"], answer: 1 },
  ],
  T8: [
    { q: "Which annotation marks a class as a Spring Boot REST controller?", options: ["@Controller", "@RestController", "@Service", "@Component"], answer: 1 },
    { q: "What does Spring Boot's auto-configuration primarily reduce?", options: ["Runtime memory", "Manual boilerplate configuration", "Network latency", "Database size"], answer: 1 },
    { q: "Which file commonly stores Spring Boot application configuration?", options: ["pom.xml only", "application.properties", "web.xml", "Main.java"], answer: 1 },
  ],
  T9: [
    { q: "Which HTTP method is typically used to create a new resource?", options: ["GET", "POST", "DELETE", "OPTIONS"], answer: 1 },
    { q: "Which HTTP status code means 'Not Found'?", options: ["200", "301", "404", "500"], answer: 2 },
    { q: "REST APIs typically exchange data in which lightweight format?", options: ["JSON", "DOCX", "EXE", "ISO"], answer: 0 },
  ],

  // ---- C
  C1: [
    { q: "Which function is used to print output in C?", options: ["print()", "printf()", "echo()", "console.log()"], answer: 1 },
    { q: "Which symbol marks the end of a statement in C?", options: [":", ";", ".", ","], answer: 1 },
    { q: "Which data type stores a single character in C?", options: ["char", "string", "int", "byte"], answer: 0 },
  ],
  C2: [
    { q: "Which statement is used for multi-way branching in C?", options: ["if", "switch", "while", "for"], answer: 1 },
    { q: "Which loop guarantees at least one execution?", options: ["for", "while", "do-while", "foreach"], answer: 2 },
    { q: "Which keyword exits a loop immediately?", options: ["continue", "break", "return", "exit"], answer: 1 },
  ],
  C3: [
    { q: "What does a function need to call itself?", options: ["A loop", "A base case (recursion)", "A pointer", "A macro"], answer: 1 },
    { q: "Which keyword indicates a function returns nothing?", options: ["null", "void", "empty", "none"], answer: 1 },
    { q: "What is passed by default when calling a C function with normal variables?", options: ["Reference", "Address", "Value (copy)", "Pointer only"], answer: 2 },
  ],
  C4: [
    { q: "In C, an array index starts from which number?", options: ["0", "1", "-1", "depends on compiler"], answer: 0 },
    { q: "How are strings terminated in C?", options: ["With a length prefix", "With a null character '\\0'", "With a newline", "They aren't terminated"], answer: 1 },
    { q: "Which function copies one string into another in C?", options: ["strcpy()", "strlen()", "strcmp()", "strcat() only"], answer: 0 },
  ],
  C5: [
    { q: "What does a pointer variable store?", options: ["A copy of a value", "The memory address of a variable", "A function name", "A data type"], answer: 1 },
    { q: "Which operator gets the address of a variable in C?", options: ["*", "&", "%", "#"], answer: 1 },
    { q: "What does the '*' operator do when applied to a pointer?", options: ["Multiplies it", "Dereferences it to get the value", "Deletes it", "Declares a new pointer"], answer: 1 },
  ],
  C6: [
    { q: "What is the key difference between a struct and a union in C?", options: ["Structs can't hold numbers", "Union members share the same memory location", "Unions can't be nested", "Structs are faster always"], answer: 1 },
    { q: "How do you access a struct member through a pointer?", options: [".", "->", "::", "&"], answer: 1 },
    { q: "Can a struct in C contain another struct as a member?", options: ["No, never", "Yes, this is called nesting", "Only with pointers", "Only in C++"], answer: 1 },
  ],
  C7: [
    { q: "Which mode opens a file for both reading and appending in C?", options: ["\"r\"", "\"w\"", "\"a+\"", "\"x\""], answer: 2 },
    { q: "Which function closes an open file in C?", options: ["fclose()", "close()", "fexit()", "endfile()"], answer: 0 },
    { q: "Which function reads formatted input from a file in C?", options: ["fscanf()", "scanf()", "fread() only", "getline()"], answer: 0 },
  ],

  // ---- C++
  P1: [
    { q: "Which header is commonly included for input/output in C++?", options: ["<stdio.h>", "<iostream>", "<io.h>", "<system>"], answer: 1 },
    { q: "Which operator is used for console output in C++?", options: [">>", "<<", "::", "->"], answer: 1 },
    { q: "Which keyword declares a constant in C++?", options: ["final", "const", "static", "fixed"], answer: 1 },
  ],
  P2: [
    { q: "What is an object in OOP terms?", options: ["A blueprint for a class", "An instance of a class", "A function name", "A loop construct"], answer: 1 },
    { q: "Which access specifier makes members visible only within the class?", options: ["public", "protected", "private", "external"], answer: 2 },
    { q: "Which keyword is used to define a class in C++?", options: ["class", "struct only", "object", "type"], answer: 0 },
  ],
  P3: [
    { q: "When is a constructor automatically called?", options: ["When the program ends", "When an object is created", "Only when named explicitly", "Never automatically"], answer: 1 },
    { q: "What is the purpose of a destructor?", options: ["To create objects", "To clean up resources when an object is destroyed", "To overload operators", "To copy objects"], answer: 1 },
    { q: "Can a class have more than one constructor in C++?", options: ["No", "Yes, via constructor overloading", "Only with templates", "Only in Java"], answer: 1 },
  ],
  P4: [
    { q: "Which keyword lets a class inherit from another in C++?", options: ["extends", ": (colon)", "implements", "inherits"], answer: 1 },
    { q: "What is the class being inherited from called?", options: ["Child class", "Base class", "Derived class", "Sub class"], answer: 1 },
    { q: "What does 'multiple inheritance' mean?", options: ["A class inheriting from more than one base class", "A class with many objects", "Multiple constructors", "Inheriting twice from the same class"], answer: 0 },
  ],
  P5: [
    { q: "Which keyword enables runtime polymorphism in C++?", options: ["virtual", "static", "const", "inline"], answer: 0 },
    { q: "What is method overriding?", options: ["Same method name with different parameters", "A derived class redefining a base class method", "Declaring two variables with the same name", "Calling a method twice"], answer: 1 },
    { q: "What is the difference between overloading and overriding?", options: ["They are the same thing", "Overloading is compile-time, overriding is runtime", "Overriding is compile-time, overloading is runtime", "Neither applies to C++"], answer: 1 },
  ],
  P6: [
    { q: "What does operator overloading let you do?", options: ["Change how built-in operators work for custom types", "Overload function names", "Create new operators from scratch", "Skip using operators entirely"], answer: 0 },
    { q: "Which symbol is used to define operator overloading in C++?", options: ["overload", "operator", "define", "op"], answer: 1 },
    { q: "Which operator is commonly overloaded to print custom objects?", options: ["<<", "%", "&&", "!"], answer: 0 },
  ],
  P7: [
    { q: "Which STL container stores unique sorted elements?", options: ["vector", "set", "list", "map"], answer: 1 },
    { q: "Which STL container provides dynamic array behaviour?", options: ["vector", "queue", "stack", "set"], answer: 0 },
    { q: "What does STL stand for?", options: ["Standard Template Library", "System Type Language", "Structured Template Logic", "Static Type List"], answer: 0 },
  ],

  // ---- Python
  PY1: [
    { q: "Which symbol is used for comments in Python?", options: ["//", "#", "--", "/*"], answer: 1 },
    { q: "Python variables need which of the following before use?", options: ["Explicit type declaration", "No declaration — just assignment", "A semicolon", "A pointer"], answer: 1 },
    { q: "Which function displays output in Python?", options: ["echo()", "print()", "printf()", "display()"], answer: 1 },
  ],
  PY2: [
    { q: "Which keyword starts a conditional block in Python?", options: ["if", "when", "check", "cond"], answer: 0 },
    { q: "How does Python define a block instead of using braces?", options: ["Semicolons", "Indentation", "Parentheses", "Tabs are ignored"], answer: 1 },
    { q: "Which loop iterates over a sequence in Python?", options: ["for", "repeat", "do", "loop"], answer: 0 },
  ],
  PY3: [
    { q: "Which data structure in Python is immutable?", options: ["List", "Dictionary", "Tuple", "Set (mutable)"], answer: 2 },
    { q: "Which structure stores key-value pairs in Python?", options: ["list", "dict", "tuple", "set"], answer: 1 },
    { q: "How do you add an item to a Python list?", options: [".push()", ".append()", ".add()", ".insertAt()"], answer: 1 },
  ],
  PY4: [
    { q: "Which keyword defines a function in Python?", options: ["func", "def", "function", "lambda only"], answer: 1 },
    { q: "How do you import a module in Python?", options: ["include module", "import module", "using module", "require module"], answer: 1 },
    { q: "What does a function without a return statement return in Python?", options: ["0", "an error", "None", "empty string"], answer: 2 },
  ],
  PY5: [
    { q: "Which keyword defines a class in Python?", options: ["class", "def", "object", "struct"], answer: 0 },
    { q: "What does 'self' refer to in a Python class method?", options: ["The class itself", "The current instance of the object", "A global variable", "The parent class"], answer: 1 },
    { q: "Which method is Python's constructor?", options: ["__init__", "__new__ only", "constructor()", "__start__"], answer: 0 },
  ],
  PY6: [
    { q: "Which block catches exceptions in Python?", options: ["catch", "except", "rescue", "handle"], answer: 1 },
    { q: "Which function opens a file in Python?", options: ["open()", "file()", "load()", "read()"], answer: 0 },
    { q: "Which block always runs whether an exception occurs or not?", options: ["else", "finally", "except", "end"], answer: 1 },
  ],
  PY7: [
    { q: "What is the core data structure provided by NumPy?", options: ["DataFrame", "ndarray", "Series", "List"], answer: 1 },
    { q: "Which Pandas structure represents a labeled 2D table?", options: ["ndarray", "Series", "DataFrame", "Matrix"], answer: 2 },
    { q: "Which Pandas function reads a CSV file into a DataFrame?", options: ["read_csv()", "load_csv()", "import_csv()", "open_csv()"], answer: 0 },
  ],

  // ---- DSA
  D1: [
    { q: "What is the time complexity of accessing an array element by index?", options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], answer: 0 },
    { q: "What is a common operation that is expensive on arrays but cheap on linked lists?", options: ["Random access", "Insertion at the beginning", "Sequential read", "Indexing"], answer: 1 },
    { q: "Which term describes a string that reads the same forwards and backwards?", options: ["Anagram", "Palindrome", "Substring", "Permutation"], answer: 1 },
  ],
  D2: [
    { q: "In a singly linked list, each node points to which node?", options: ["The previous node", "The next node", "The head node", "Itself"], answer: 1 },
    { q: "What is the time complexity of inserting at the head of a linked list?", options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], answer: 0 },
    { q: "What does a doubly linked list have that a singly linked list doesn't?", options: ["A head pointer", "A pointer to the previous node", "A value field", "A tail"], answer: 1 },
  ],
  D3: [
    { q: "Which principle does a stack follow?", options: ["FIFO", "LIFO", "Random access", "Priority based"], answer: 1 },
    { q: "Which principle does a queue follow?", options: ["LIFO", "FIFO", "Random", "Sorted order"], answer: 1 },
    { q: "Which operation removes an element from the top of a stack?", options: ["push", "pop", "peek", "enqueue"], answer: 1 },
  ],
  D4: [
    { q: "What must every recursive function have to avoid infinite recursion?", options: ["A loop", "A base case", "A pointer", "A global variable"], answer: 1 },
    { q: "What data structure implicitly supports recursive function calls?", options: ["Queue", "Call stack", "Heap (data structure)", "Array"], answer: 1 },
    { q: "What is the risk of recursion without a proper base case?", options: ["Slow compilation", "Stack overflow", "Syntax error", "Memory leak in Python only"], answer: 1 },
  ],
  D5: [
    { q: "Which traversal visits left subtree, root, then right subtree?", options: ["Preorder", "Inorder", "Postorder", "Level order"], answer: 1 },
    { q: "In a Binary Search Tree, where are smaller values placed relative to a node?", options: ["Right subtree", "Left subtree", "Root only", "Anywhere"], answer: 1 },
    { q: "What is the maximum number of children a node has in a binary tree?", options: ["1", "2", "3", "Unlimited"], answer: 1 },
  ],
  D6: [
    { q: "Which traversal uses a queue and explores neighbors level by level?", options: ["DFS", "BFS", "Inorder", "Postorder"], answer: 1 },
    { q: "Which data structure is commonly used to implement DFS?", options: ["Queue", "Stack (or recursion)", "Heap", "Array only"], answer: 1 },
    { q: "What is a 'weighted' graph?", options: ["A graph with directions only", "A graph where edges have associated costs", "A graph with no cycles", "A graph with one node"], answer: 1 },
  ],
  D7: [
    { q: "What is the average time complexity of Quick Sort?", options: ["O(n)", "O(n log n)", "O(n^2) always", "O(log n)"], answer: 1 },
    { q: "Binary search requires the input to be in what state?", options: ["Sorted", "Reversed", "Random", "Unique values only"], answer: 0 },
    { q: "Which sorting algorithm repeatedly divides the array in half and merges?", options: ["Bubble Sort", "Merge Sort", "Insertion Sort", "Selection Sort"], answer: 1 },
  ],
  D8: [
    { q: "Dynamic Programming is most useful for problems with which property?", options: ["No repeated subproblems", "Overlapping subproblems", "Only sorting", "Only graphs"], answer: 1 },
    { q: "What technique stores results of subproblems to avoid recomputation?", options: ["Recursion only", "Memoization", "Backtracking", "Greedy selection"], answer: 1 },
    { q: "Which classic problem is commonly solved with DP?", options: ["Fibonacci sequence", "Printing 'Hello World'", "Sorting a list", "Reading a file"], answer: 0 },
  ],

  // ---- DBMS
  B1: [
    { q: "What does an ER diagram primarily model?", options: ["Network topology", "Entities and their relationships", "Source code structure", "User interfaces"], answer: 1 },
    { q: "In ER modeling, what represents a real-world object?", options: ["Attribute", "Entity", "Relationship", "Tuple"], answer: 1 },
    { q: "What is a 'primary key' conceptually used for at the ER stage?", options: ["Styling", "Uniquely identifying an entity instance", "Formatting output", "Connecting to the internet"], answer: 1 },
  ],
  B2: [
    { q: "In the relational model, data is organized into what structure?", options: ["Trees", "Tables (relations)", "Graphs", "Linked lists"], answer: 1 },
    { q: "What is a foreign key used for?", options: ["Encrypting data", "Linking a table to a primary key in another table", "Sorting rows", "Deleting tables"], answer: 1 },
    { q: "What must be true of a primary key's values?", options: ["They can repeat", "They must be unique and not null", "They must be text", "They must be foreign keys too"], answer: 1 },
  ],
  B3: [
    { q: "Which SQL statement retrieves data from a table?", options: ["GET", "SELECT", "FETCH", "SHOW"], answer: 1 },
    { q: "Which clause filters rows based on a condition?", options: ["WHERE", "ORDER BY", "GROUP BY", "HAVING only"], answer: 0 },
    { q: "Which SQL command adds a new row to a table?", options: ["ADD", "INSERT INTO", "CREATE", "APPEND"], answer: 1 },
  ],
  B4: [
    { q: "Which JOIN returns only matching rows from both tables?", options: ["LEFT JOIN", "INNER JOIN", "FULL JOIN", "CROSS JOIN"], answer: 1 },
    { q: "Which JOIN returns all rows from the left table plus matches from the right?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "CROSS JOIN"], answer: 1 },
    { q: "What is a subquery?", options: ["A query inside another query", "A query with no WHERE clause", "A backup query", "A query on multiple databases"], answer: 0 },
  ],
  B5: [
    { q: "What is the main goal of normalization?", options: ["Speed up hardware", "Reduce data redundancy and improve integrity", "Add more tables randomly", "Encrypt data"], answer: 1 },
    { q: "Which normal form removes repeating groups?", options: ["1NF", "4NF", "5NF", "0NF"], answer: 0 },
    { q: "What does BCNF stand for?", options: ["Basic Column Normal Form", "Boyce-Codd Normal Form", "Binary Class Normal Form", "Bulk Content Normal Form"], answer: 1 },
  ],
  B6: [
    { q: "What does the 'A' in ACID stand for?", options: ["Availability", "Atomicity", "Authentication", "Aggregation"], answer: 1 },
    { q: "What problem does locking primarily prevent?", options: ["Slow queries", "Concurrent transactions corrupting shared data", "Disk failure", "Syntax errors"], answer: 1 },
    { q: "What is a 'deadlock' in the context of transactions?", options: ["A crashed server", "Two transactions waiting on each other's locks forever", "A missing index", "A failed login"], answer: 1 },
  ],
  B7: [
    { q: "What is the main purpose of a database index?", options: ["Encrypt data", "Speed up data retrieval", "Reduce storage size to zero", "Format query output"], answer: 1 },
    { q: "What is a common trade-off of adding more indexes?", options: ["Faster writes", "Slower writes/updates due to index maintenance", "No trade-off", "Slower reads"], answer: 1 },
    { q: "Which structure is commonly used internally to implement indexes?", options: ["Linked list", "B-Tree", "Stack", "Queue"], answer: 1 },
  ],

  // ---- OOP Fundamentals
  O1: [
    { q: "What is a class in OOP?", options: ["A running instance of data", "A blueprint that defines properties and behaviours", "A type of loop", "A database table"], answer: 1 },
    { q: "What is an object?", options: ["A blueprint", "An instance of a class", "A function", "A variable type"], answer: 1 },
    { q: "What do we call the variables that belong to an object?", options: ["Methods", "Attributes/fields", "Loops", "Pointers"], answer: 1 },
  ],
  O2: [
    { q: "What is encapsulation primarily about?", options: ["Speed optimization", "Bundling data and methods, restricting direct access", "Creating many objects", "Writing loops"], answer: 1 },
    { q: "Which access level typically hides a field from outside the class?", options: ["public", "private", "global", "external"], answer: 1 },
    { q: "What is commonly used to control access to a private field?", options: ["Getters and setters", "Loops", "Interfaces only", "Constructors only"], answer: 0 },
  ],
  O3: [
    { q: "When does a constructor typically run?", options: ["When the object is destroyed", "When the object is created", "Randomly at runtime", "Only when called manually"], answer: 1 },
    { q: "What is the purpose of a destructor?", options: ["To initialize fields", "To release resources when an object is no longer needed", "To overload operators", "To sort data"], answer: 1 },
    { q: "Can a class have multiple constructors with different parameters?", options: ["No, never", "Yes — this is constructor overloading", "Only in one specific language", "Only for static classes"], answer: 1 },
  ],
  O4: [
    { q: "What does inheritance let a class do?", options: ["Delete another class", "Reuse and extend another class's behaviour", "Run faster", "Skip constructors"], answer: 1 },
    { q: "What is the class being inherited from usually called?", options: ["Derived class", "Base/parent class", "Interface", "Object"], answer: 1 },
    { q: "What is a common risk of deep inheritance hierarchies?", options: ["Improved performance always", "Increased coupling and complexity", "Less code reuse", "No risk at all"], answer: 1 },
  ],
  O5: [
    { q: "What does polymorphism allow?", options: ["Only one implementation per method name", "The same interface to behave differently for different types", "Classes to have no methods", "Variables to change type at random"], answer: 1 },
    { q: "What is method overriding an example of?", options: ["Compile-time polymorphism", "Runtime polymorphism", "Encapsulation", "Abstraction"], answer: 1 },
    { q: "What is method overloading an example of?", options: ["Runtime polymorphism", "Compile-time polymorphism", "Inheritance", "Encapsulation"], answer: 1 },
  ],
  O6: [
    { q: "What does abstraction focus on?", options: ["Showing all implementation details", "Exposing only essential features and hiding complexity", "Removing all classes", "Increasing code duplication"], answer: 1 },
    { q: "Which construct is commonly used to achieve abstraction?", options: ["Abstract classes/interfaces", "Global variables", "Infinite loops", "Static constants only"], answer: 0 },
    { q: "Why is abstraction useful in large systems?", options: ["It hides bugs permanently", "It lets developers work with simple interfaces without knowing internal details", "It removes the need for testing", "It prevents all errors"], answer: 1 },
  ],
};
