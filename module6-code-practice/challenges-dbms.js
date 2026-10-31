/* MODULE 6 -- Code Practice: DBMS course challenges, in roadmap order.
   Expected outputs were produced by running the model solution in a real compiler/interpreter. */
registerChallenges("DBMS", [
  {
    id: "db-er-to-tables", topic: "B1", title: "ER Diagram to Tables (M:N)", difficulty: "Easy", lang: "sql",
    statement: `A Student can enrol in many Courses and a Course has many Students, and every enrolment has a \`grade\`. Convert this ER design into tables: \`students(id, name)\`, \`courses(id, title)\` and the relationship table \`enrollments(student_id, course_id, grade)\`. Give each entity a primary key, make \`enrollments\` use a composite primary key (student_id, course_id) and add the two foreign keys.`,
    format: `Write only the CREATE TABLE statements. The INPUT box holds test data inserted after your tables (it includes a duplicate enrolment that your composite key must reject).`,
    hint: `\`PRIMARY KEY (student_id, course_id)\` inside enrollments, plus \`FOREIGN KEY (student_id) REFERENCES students(id)\` and the same for course_id.`,
    schema: `ER model: Student(id, name) --enrolls in (grade)-- Course(id, title)   [many-to-many]`,
    tpl: `{{USER}}
{{INPUT}}
SELECT s.name, c.title, e.grade FROM enrollments e JOIN students s ON s.id = e.student_id JOIN courses c ON c.id = e.course_id ORDER BY s.name, c.title;`,
    starter: `-- Create the three tables
CREATE TABLE students (
);`,
    solutionCode: `CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE courses (id INTEGER PRIMARY KEY, title TEXT NOT NULL);
CREATE TABLE enrollments (
  student_id INTEGER,
  course_id INTEGER,
  grade TEXT,
  PRIMARY KEY (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);`,
    tests: [
      { input: `INSERT INTO students VALUES (1,'Asha'),(2,'Ravi');
INSERT INTO courses VALUES (10,'DBMS'),(20,'DSA');
INSERT INTO enrollments VALUES (1,10,'A'),(1,20,'B'),(2,10,'C');
INSERT OR IGNORE INTO enrollments VALUES (1,10,'F');`, expected: `Asha|DBMS|A
Asha|DSA|B
Ravi|DBMS|C` },
      { input: `INSERT INTO students VALUES (1,'Meena');
INSERT INTO courses VALUES (5,'OS'),(6,'CN');
INSERT INTO enrollments VALUES (1,5,'B'),(1,6,'A');
INSERT OR IGNORE INTO enrollments VALUES (1,5,'C'),(1,6,'D');`, expected: `Meena|CN|A
Meena|OS|B` },
    ],
  },
  {
    id: "db-set-operations", topic: "B2", title: "Relational Set Operations", difficulty: "Easy", lang: "sql",
    statement: `Relations are sets, so they support union, intersection and difference. Using these operators, return every distinct student with a status: \`both\` (in DSA and DBMS), \`dsa_only\` or \`dbms_only\`. Output columns: \`name\`, \`status\`, ordered by name.`,
    format: `Write one query (it may use INTERSECT, EXCEPT and UNION ALL). Output: name|status.`,
    hint: `\`SELECT name,'both' FROM (SELECT name FROM dsa_students INTERSECT SELECT name FROM dbms_students)\` UNION ALL the EXCEPT queries (both directions), then ORDER BY name.`,
    schema: `dsa_students(name TEXT), dbms_students(name TEXT)`,
    tpl: `CREATE TABLE dsa_students(name TEXT);
CREATE TABLE dbms_students(name TEXT);
{{INPUT}}
{{USER}}`,
    starter: `-- Write your query here
SELECT`,
    solutionCode: `SELECT name, 'both' AS status FROM (SELECT name FROM dsa_students INTERSECT SELECT name FROM dbms_students)
UNION ALL
SELECT name, 'dsa_only' FROM (SELECT name FROM dsa_students EXCEPT SELECT name FROM dbms_students)
UNION ALL
SELECT name, 'dbms_only' FROM (SELECT name FROM dbms_students EXCEPT SELECT name FROM dsa_students)
ORDER BY name;`,
    tests: [
      { input: `INSERT INTO dsa_students VALUES ('Asha'),('Ravi'),('Meena'),('Asha');
INSERT INTO dbms_students VALUES ('Ravi'),('Karan'),('Meena');`, expected: `Asha|dsa_only
Karan|dbms_only
Meena|both
Ravi|both` },
      { input: `INSERT INTO dsa_students VALUES ('Zed');
INSERT INTO dbms_students VALUES ('Amy');`, expected: `Amy|dbms_only
Zed|dsa_only` },
      { input: `INSERT INTO dsa_students VALUES ('A'),('B');
INSERT INTO dbms_students VALUES ('A'),('B');`, expected: `A|both
B|both` },
    ],
  },
  {
    id: "db-dept-report", topic: "B3", title: "Department Salary Report", difficulty: "Easy", lang: "sql",
    statement: `For every department that has at least 2 employees return \`dept\`, the number of employees \`cnt\` and the average salary rounded to 1 decimal \`avg_salary\`. Order by average salary (highest first), then by dept.`,
    format: `The INPUT box holds the test data. Write one SELECT with GROUP BY and HAVING.`,
    hint: `GROUP BY dept, filter groups with \`HAVING COUNT(*) >= 2\` (WHERE cannot filter aggregates) and use \`ROUND(AVG(salary), 1)\`.`,
    schema: `employees(id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER)`,
    tpl: `CREATE TABLE employees(id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
{{INPUT}}
{{USER}}`,
    starter: `-- Write your query here
SELECT`,
    solutionCode: `SELECT dept, COUNT(*) AS cnt, ROUND(AVG(salary), 1) AS avg_salary
FROM employees
GROUP BY dept
HAVING COUNT(*) >= 2
ORDER BY avg_salary DESC, dept;`,
    tests: [
      { input: `INSERT INTO employees VALUES (1,'Asha','IT',90000),(2,'Ravi','IT',75000),(3,'Meena','HR',60000),(4,'Karan','IT',82000),(5,'Divya','HR',65000),(6,'Sam','Sales',50000);`, expected: `IT|3|82333.3
HR|2|62500` },
      { input: `INSERT INTO employees VALUES (1,'A','X',10),(2,'B','X',15),(3,'C','Y',12),(4,'D','Y',13),(5,'E','Z',99);`, expected: `X|2|12.5
Y|2|12.5` },
      { input: `INSERT INTO employees VALUES (1,'Solo','Only',1),(2,'P','Q',5),(3,'R','Q',7);`, expected: `Q|2|6` },
    ],
  },
  {
    id: "db-customer-spend", topic: "B4", title: "Customer Spend with LEFT JOIN", difficulty: "Medium", lang: "sql",
    statement: `List EVERY customer, including those who never ordered, with \`name\`, the number of orders \`order_count\` and the total they spent \`total\` (0 when they have no orders). Order by total (highest first), then by name.`,
    format: `The INPUT box holds the test data. Write one SELECT using a JOIN and GROUP BY.`,
    hint: `An INNER JOIN drops customers without orders, so use LEFT JOIN, \`COUNT(o.id)\` and \`COALESCE(SUM(o.amount), 0)\`.`,
    schema: `customers(id INTEGER PRIMARY KEY, name TEXT), orders(id INTEGER PRIMARY KEY, customer_id INTEGER, amount INTEGER)`,
    tpl: `CREATE TABLE customers(id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, amount INTEGER);
{{INPUT}}
{{USER}}`,
    starter: `-- Write your query here
SELECT`,
    solutionCode: `SELECT c.name, COUNT(o.id) AS order_count, COALESCE(SUM(o.amount), 0) AS total
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name
ORDER BY total DESC, c.name;`,
    tests: [
      { input: `INSERT INTO customers VALUES (1,'Asha'),(2,'Ravi'),(3,'Meena');
INSERT INTO orders VALUES (1,1,500),(2,1,250),(3,2,900);`, expected: `Ravi|1|900
Asha|2|750
Meena|0|0` },
      { input: `INSERT INTO customers VALUES (1,'Zed'),(2,'Amy');`, expected: `Amy|0|0
Zed|0|0` },
      { input: `INSERT INTO customers VALUES (1,'A'),(2,'B'),(3,'C');
INSERT INTO orders VALUES (1,1,10),(2,2,10),(3,3,5),(4,3,5);`, expected: `A|1|10
B|1|10
C|2|10` },
    ],
  },
  {
    id: "db-normalize-orders", topic: "B5", title: "Normalize a Flat Table", difficulty: "Medium", lang: "sql",
    statement: `\`orders_flat\` repeats the customer's city and the product's price on every row, so it breaks 2NF/3NF (the city depends only on the customer, the price only on the product). Decompose it: create \`customers(customer TEXT PRIMARY KEY, city TEXT)\` and \`products(product TEXT PRIMARY KEY, price INTEGER)\` and fill them with the DISTINCT data from \`orders_flat\`.`,
    format: `Write CREATE TABLE and INSERT ... SELECT DISTINCT statements. The grader then reads both new tables.`,
    hint: `\`INSERT INTO customers SELECT DISTINCT customer, city FROM orders_flat;\` and the same idea for products.`,
    schema: `orders_flat(order_id INTEGER, customer TEXT, city TEXT, product TEXT, price INTEGER)`,
    tpl: `CREATE TABLE orders_flat(order_id INTEGER, customer TEXT, city TEXT, product TEXT, price INTEGER);
{{INPUT}}
{{USER}}
SELECT 'C', customer, city FROM customers UNION ALL SELECT 'P', product, price FROM products ORDER BY 1, 2;`,
    starter: `-- Create customers and products, then fill them from orders_flat
CREATE TABLE customers (
);`,
    solutionCode: `CREATE TABLE customers (customer TEXT PRIMARY KEY, city TEXT);
CREATE TABLE products (product TEXT PRIMARY KEY, price INTEGER);
INSERT INTO customers SELECT DISTINCT customer, city FROM orders_flat;
INSERT INTO products SELECT DISTINCT product, price FROM orders_flat;`,
    tests: [
      { input: `INSERT INTO orders_flat VALUES (1,'Asha','Pune','Pen',10),(2,'Asha','Pune','Book',120),(3,'Ravi','Delhi','Pen',10),(4,'Ravi','Delhi','Bag',500),(5,'Asha','Pune','Pen',10);`, expected: `C|Asha|Pune
C|Ravi|Delhi
P|Bag|500
P|Book|120
P|Pen|10` },
      { input: `INSERT INTO orders_flat VALUES (1,'Meena','Nagpur','Lamp',300);`, expected: `C|Meena|Nagpur
P|Lamp|300` },
      { input: `INSERT INTO orders_flat VALUES (1,'A','X','p',1),(2,'B','X','p',1),(3,'A','X','q',2),(4,'C','Y','q',2);`, expected: `C|A|X
C|B|X
C|C|Y
P|p|1
P|q|2` },
    ],
  },
  {
    id: "db-bank-transfer", topic: "B6", title: "Atomic Bank Transfer", difficulty: "Hard", lang: "sql",
    statement: `Transfer 500 from account 1 to account 2 inside one transaction (\`BEGIN ... COMMIT\`) so both updates happen or neither does (atomicity). The transfer must only happen if account 1 has at least 500; otherwise no balance may change. Money must never be created or lost.`,
    format: `Write the transaction. The grader prints \`id|balance\` for all accounts afterwards.`,
    hint: `Credit account 2 only \`WHERE id = 2 AND (SELECT balance FROM accounts WHERE id = 1) >= 500\`, then debit account 1 \`WHERE id = 1 AND balance >= 500\`.`,
    schema: `accounts(id INTEGER PRIMARY KEY, owner TEXT, balance INTEGER)`,
    tpl: `CREATE TABLE accounts(id INTEGER PRIMARY KEY, owner TEXT, balance INTEGER);
{{INPUT}}
{{USER}}
SELECT id, balance FROM accounts ORDER BY id;`,
    starter: `-- Write the transfer as one transaction
BEGIN;

COMMIT;`,
    solutionCode: `BEGIN;
UPDATE accounts SET balance = balance + 500 WHERE id = 2 AND (SELECT balance FROM accounts WHERE id = 1) >= 500;
UPDATE accounts SET balance = balance - 500 WHERE id = 1 AND balance >= 500;
COMMIT;`,
    tests: [
      { input: `INSERT INTO accounts VALUES (1,'A',1000),(2,'B',200),(3,'C',50);`, expected: `1|500
2|700
3|50` },
      { input: `INSERT INTO accounts VALUES (1,'A',300),(2,'B',200);`, expected: `1|300
2|200` },
      { input: `INSERT INTO accounts VALUES (1,'A',500),(2,'B',0);`, expected: `1|0
2|500` },
      { input: `INSERT INTO accounts VALUES (1,'A',499),(2,'B',1);`, expected: `1|499
2|1` },
    ],
  },
  {
    id: "db-create-indexes", topic: "B7", title: "Create Indexes", difficulty: "Hard", lang: "sql",
    statement: `Two queries on \`orders\` are slow: (1) \`WHERE customer_id = ?\` and (2) \`WHERE order_date = ? AND status = ?\`. Create a single-column index named \`idx_orders_customer\` on \`customer_id\` and a composite index named \`idx_orders_date_status\` on \`(order_date, status)\` (equality column order matters for a composite index).`,
    format: `Write two CREATE INDEX statements. The grader lists the indexes and their columns.`,
    hint: `\`CREATE INDEX idx_orders_customer ON orders(customer_id);\` and \`CREATE INDEX idx_orders_date_status ON orders(order_date, status);\``,
    schema: `orders(id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT, status TEXT, amount INTEGER)`,
    tpl: `CREATE TABLE orders(id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT, status TEXT, amount INTEGER);
{{INPUT}}
{{USER}}
SELECT i.name, c.seqno, c.name FROM sqlite_master i, pragma_index_info(i.name) c WHERE i.type = 'index' AND i.name NOT LIKE 'sqlite_%' ORDER BY i.name, c.seqno;`,
    starter: `-- Create the two indexes
CREATE INDEX`,
    solutionCode: `CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_date_status ON orders(order_date, status);`,
    tests: [
      { input: `INSERT INTO orders VALUES (1,1,'2026-01-05','PAID',100),(2,2,'2026-01-05','NEW',50);`, expected: `idx_orders_customer|0|customer_id
idx_orders_date_status|0|order_date
idx_orders_date_status|1|status` },
      { input: `INSERT INTO orders VALUES (1,9,'2026-02-01','PAID',999);`, expected: `idx_orders_customer|0|customer_id
idx_orders_date_status|0|order_date
idx_orders_date_status|1|status` },
    ],
  },
]);
