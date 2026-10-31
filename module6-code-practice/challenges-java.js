/* MODULE 6 -- Code Practice: JAVA course challenges, in roadmap order.
   Expected outputs were produced by running the model solution in a real compiler/interpreter. */
registerChallenges("JAVA", [
  {
    id: "java-digit-sum", topic: "T1", title: "Digit Sum", difficulty: "Easy", lang: "java",
    statement: `Read a non-negative integer \`n\` and print the sum of its digits. Practise Java's \`Scanner\`, \`while\` loops and the \`%\` and \`/\` operators.`,
    format: `One line: n. Print the digit sum.`,
    hint: `n % 10 gives the last digit and n / 10 removes it. Repeat while n > 0.`,
    starter: `import java.util.*;

public class Main {
    static int digitSum(int n) {
        int sum = 0;
        // your code
        return sum;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(digitSum(n));
    }
}`,
    solutionCode: `import java.util.*;

public class Main {
    static int digitSum(int n) {
        int sum = 0;
        while (n > 0) {
            sum += n % 10;
            n /= 10;
        }
        return sum;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(digitSum(n));
    }
}`,
    tests: [
      { input: `12345`, expected: `15` },
      { input: `0`, expected: `0` },
      { input: `9999`, expected: `36` },
      { input: `100`, expected: `1` },
      { input: `7`, expected: `7` },
    ],
  },
  {
    id: "java-shapes", topic: "T2", title: "Shapes with Abstract Class", difficulty: "Easy", lang: "java",
    statement: `\`Shape\` is an abstract class with an abstract method \`area()\`. Implement \`area()\` in \`Circle\` (π·r²) and \`Rectangle\` (w·h) and print the total area of all shapes with exactly 2 decimals. This is inheritance + method overriding + polymorphism in Java.`,
    format: `Line 1: n. Then n lines, each either \`CIRCLE r\` or \`RECT w h\`. Print the total area with 2 decimals.`,
    hint: `Use \`@Override double area()\` in each subclass. Use Math.PI for the circle.`,
    starter: `import java.util.*;

abstract class Shape {
    abstract double area();
}

class Circle extends Shape {
    double r;
    Circle(double r) { this.r = r; }

    @Override
    double area() {
        return 0; // your code
    }
}

class Rectangle extends Shape {
    double w, h;
    Rectangle(double w, double h) { this.w = w; this.h = h; }

    @Override
    double area() {
        return 0; // your code
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        List<Shape> shapes = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            String type = sc.next();
            if (type.equals("CIRCLE")) shapes.add(new Circle(sc.nextDouble()));
            else shapes.add(new Rectangle(sc.nextDouble(), sc.nextDouble()));
        }
        double total = 0;
        for (Shape s : shapes) total += s.area();
        System.out.println(String.format(Locale.US, "%.2f", total));
    }
}`,
    solutionCode: `import java.util.*;

abstract class Shape {
    abstract double area();
}

class Circle extends Shape {
    double r;
    Circle(double r) { this.r = r; }

    @Override
    double area() {
        return Math.PI * r * r;
    }
}

class Rectangle extends Shape {
    double w, h;
    Rectangle(double w, double h) { this.w = w; this.h = h; }

    @Override
    double area() {
        return w * h;
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        List<Shape> shapes = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            String type = sc.next();
            if (type.equals("CIRCLE")) shapes.add(new Circle(sc.nextDouble()));
            else shapes.add(new Rectangle(sc.nextDouble(), sc.nextDouble()));
        }
        double total = 0;
        for (Shape s : shapes) total += s.area();
        System.out.println(String.format(Locale.US, "%.2f", total));
    }
}`,
    tests: [
      { input: `2
CIRCLE 1
RECT 2 3`, expected: `9.14` },
      { input: `1
CIRCLE 2.5`, expected: `19.63` },
      { input: `3
RECT 1 1
RECT 2 2
RECT 3 3`, expected: `14.00` },
      { input: `2
CIRCLE 0.5
CIRCLE 1.5`, expected: `7.85` },
    ],
  },
  {
    id: "java-word-frequency", topic: "T3", title: "Word Frequency (HashMap)", difficulty: "Medium", lang: "java",
    statement: `Count how many times each word appears (case-insensitive). Print one line \`word count\` per distinct word, sorted by count (highest first) and then alphabetically. Uses \`HashMap\`, \`List\` and \`Comparator\` from the Collections framework.`,
    format: `Any number of words separated by spaces/newlines. Print \`word count\` lines.`,
    hint: `\`freq.merge(w, 1, Integer::sum)\` counts. Then copy \`freq.entrySet()\` into a list and sort it with a comparator.`,
    starter: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Map<String, Integer> freq = new HashMap<>();
        while (sc.hasNext()) {
            String w = sc.next().toLowerCase();
            // your code: update the count of w
        }
        List<Map.Entry<String, Integer>> list = new ArrayList<>(freq.entrySet());
        // your code: sort by count (descending), then by word (ascending)
        for (Map.Entry<String, Integer> e : list) {
            System.out.println(e.getKey() + " " + e.getValue());
        }
    }
}`,
    solutionCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Map<String, Integer> freq = new HashMap<>();
        while (sc.hasNext()) {
            String w = sc.next().toLowerCase();
            freq.merge(w, 1, Integer::sum);
        }
        List<Map.Entry<String, Integer>> list = new ArrayList<>(freq.entrySet());
        list.sort((a, b) -> {
            int c = b.getValue().compareTo(a.getValue());
            return c != 0 ? c : a.getKey().compareTo(b.getKey());
        });
        for (Map.Entry<String, Integer> e : list) {
            System.out.println(e.getKey() + " " + e.getValue());
        }
    }
}`,
    tests: [
      { input: `the cat and the dog and the bird`, expected: `the 3
and 2
bird 1
cat 1
dog 1` },
      { input: `a b c`, expected: `a 1
b 1
c 1` },
      { input: `to be or not to be`, expected: `be 2
to 2
not 1
or 1` },
      { input: `Java java JAVA is fun fun`, expected: `java 3
fun 2
is 1` },
    ],
  },
  {
    id: "java-safe-calculator", topic: "T4", title: "Safe Calculator (Exceptions)", difficulty: "Medium", lang: "java",
    statement: `\`calculate()\` throws exceptions for bad input. Wrap the call in \`try / catch\` and print the result, or one of these messages: \`Error: Division by zero\` (ArithmeticException), \`Error: Invalid number\` (NumberFormatException), \`Error: Unknown operator\` (IllegalArgumentException). The program must keep going after an error.`,
    format: `Line 1: n. Then n lines of the form \`a op b\` (op is + - * or /). Print one result or error per line.`,
    hint: `Catch the specific exceptions in separate \`catch\` blocks, one per message.`,
    starter: `import java.util.*;

public class Main {
    static int calculate(String a, String op, String b) {
        int x = Integer.parseInt(a);
        int y = Integer.parseInt(b);
        switch (op) {
            case "+": return x + y;
            case "-": return x - y;
            case "*": return x * y;
            case "/": return x / y;
            default: throw new IllegalArgumentException("Unknown operator");
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        for (int i = 0; i < n; i++) {
            String[] p = sc.nextLine().trim().split("\\\\s+");
            // your code: put this call inside try / catch
            System.out.println(calculate(p[0], p[1], p[2]));
        }
    }
}`,
    solutionCode: `import java.util.*;

public class Main {
    static int calculate(String a, String op, String b) {
        int x = Integer.parseInt(a);
        int y = Integer.parseInt(b);
        switch (op) {
            case "+": return x + y;
            case "-": return x - y;
            case "*": return x * y;
            case "/": return x / y;
            default: throw new IllegalArgumentException("Unknown operator");
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        for (int i = 0; i < n; i++) {
            String[] p = sc.nextLine().trim().split("\\\\s+");
            try {
                System.out.println(calculate(p[0], p[1], p[2]));
            } catch (ArithmeticException e) {
                System.out.println("Error: Division by zero");
            } catch (NumberFormatException e) {
                System.out.println("Error: Invalid number");
            } catch (IllegalArgumentException e) {
                System.out.println("Error: Unknown operator");
            }
        }
    }
}`,
    tests: [
      { input: `4
10 + 5
8 / 0
x * 3
7 % 2`, expected: `15
Error: Division by zero
Error: Invalid number
Error: Unknown operator` },
      { input: `3
100 / 7
-4 * 6
9 - 12`, expected: `14
-24
-3` },
      { input: `2
5 / 0
abc + 1`, expected: `Error: Division by zero
Error: Invalid number` },
      { input: `3
6 / 3
1 ^ 1
2 * z`, expected: `2
Error: Unknown operator
Error: Invalid number` },
    ],
  },
  {
    id: "java-parallel-sum", topic: "T5", title: "Parallel Sum with Threads", difficulty: "Hard", lang: "java",
    statement: `Split the array into \`k\` chunks and sum each chunk in its own \`Thread\`. Start every thread, \`join()\` them all, then print the total. Also count how many elements were processed using a shared counter - make \`inc()\` thread-safe with \`synchronized\`.`,
    format: `Line 1: \`n k\`. Line 2: n integers. Print \`total processed\` (the sum and the number of processed elements).`,
    hint: `In \`run()\` loop from \`from\` to \`to - 1\`, add to \`result\` and call \`inc()\`. In main call \`ws[i].start()\` for each, then \`ws[i].join()\` before reading \`result\`.`,
    starter: `import java.util.*;

public class Main {
    static int processed = 0;
    static void inc() { processed++; } // your code: make this thread-safe

    static class Worker extends Thread {
        private final int[] a;
        private final int from, to;
        long result = 0;
        Worker(int[] a, int from, int to) { this.a = a; this.from = from; this.to = to; }

        @Override
        public void run() {
            // your code: add a[from..to-1] into result and call inc() for every element
        }
    }

    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), k = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        Worker[] ws = new Worker[k];
        int chunk = (n + k - 1) / k;
        for (int i = 0; i < k; i++) {
            int from = Math.min(n, i * chunk), to = Math.min(n, from + chunk);
            ws[i] = new Worker(a, from, to);
            // your code: start the thread
        }
        long total = 0;
        for (Worker w : ws) {
            // your code: wait for the thread to finish
            total += w.result;
        }
        System.out.println(total + " " + processed);
    }
}`,
    solutionCode: `import java.util.*;

public class Main {
    static int processed = 0;
    static synchronized void inc() { processed++; }

    static class Worker extends Thread {
        private final int[] a;
        private final int from, to;
        long result = 0;
        Worker(int[] a, int from, int to) { this.a = a; this.from = from; this.to = to; }

        @Override
        public void run() {
            for (int i = from; i < to; i++) {
                result += a[i];
                inc();
            }
        }
    }

    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), k = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        Worker[] ws = new Worker[k];
        int chunk = (n + k - 1) / k;
        for (int i = 0; i < k; i++) {
            int from = Math.min(n, i * chunk), to = Math.min(n, from + chunk);
            ws[i] = new Worker(a, from, to);
            ws[i].start();
        }
        long total = 0;
        for (Worker w : ws) {
            w.join();
            total += w.result;
        }
        System.out.println(total + " " + processed);
    }
}`,
    tests: [
      { input: `5 2
1 2 3 4 5`, expected: `15 5` },
      { input: `10 3
1 2 3 4 5 6 7 8 9 10`, expected: `55 10` },
      { input: `1 4
42`, expected: `42 1` },
      { input: `8 8
1 1 1 1 1 1 1 1`, expected: `8 8` },
    ],
  },
  {
    id: "java-jdbc-statements", topic: "T6", title: "Build JDBC Prepared Statements", difficulty: "Medium", lang: "java",
    statement: `With JDBC you never concatenate user values into SQL - you use \`PreparedStatement\` with \`?\` placeholders (this prevents SQL injection). Build the three SQL strings you would pass to \`conn.prepareStatement(...)\` for a table. The FIRST column is the primary key.
- INSERT: \`INSERT INTO t (c1, c2) VALUES (?, ?)\`
- UPDATE: \`UPDATE t SET c2 = ?, c3 = ? WHERE c1 = ?\`
- SELECT: \`SELECT * FROM t WHERE c1 = ?\``,
    format: `Line 1: table name. Line 2: comma-separated column names (first = primary key). Print the INSERT, UPDATE and SELECT strings, one per line.`,
    hint: `Split the column line on commas, then use \`String.join(", ", list)\` and \`Collections.nCopies(n, "?")\` to build the lists.`,
    starter: `import java.util.*;

public class Main {
    static String insertSql(String table, String[] cols) {
        return ""; // your code
    }

    static String updateSql(String table, String[] cols) {
        return ""; // your code
    }

    static String selectSql(String table, String[] cols) {
        return ""; // your code
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String table = sc.nextLine().trim();
        String[] cols = sc.nextLine().trim().split(",");
        System.out.println(insertSql(table, cols));
        System.out.println(updateSql(table, cols));
        System.out.println(selectSql(table, cols));
    }
}`,
    solutionCode: `import java.util.*;

public class Main {
    static String insertSql(String table, String[] cols) {
        String marks = String.join(", ", Collections.nCopies(cols.length, "?"));
        return "INSERT INTO " + table + " (" + String.join(", ", cols) + ") VALUES (" + marks + ")";
    }

    static String updateSql(String table, String[] cols) {
        List<String> sets = new ArrayList<>();
        for (int i = 1; i < cols.length; i++) sets.add(cols[i] + " = ?");
        return "UPDATE " + table + " SET " + String.join(", ", sets) + " WHERE " + cols[0] + " = ?";
    }

    static String selectSql(String table, String[] cols) {
        return "SELECT * FROM " + table + " WHERE " + cols[0] + " = ?";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String table = sc.nextLine().trim();
        String[] cols = sc.nextLine().trim().split(",");
        System.out.println(insertSql(table, cols));
        System.out.println(updateSql(table, cols));
        System.out.println(selectSql(table, cols));
    }
}`,
    tests: [
      { input: `students
id,name,age`, expected: `INSERT INTO students (id, name, age) VALUES (?, ?, ?)
UPDATE students SET name = ?, age = ? WHERE id = ?
SELECT * FROM students WHERE id = ?` },
      { input: `books
isbn,title,author,price`, expected: `INSERT INTO books (isbn, title, author, price) VALUES (?, ?, ?, ?)
UPDATE books SET title = ?, author = ?, price = ? WHERE isbn = ?
SELECT * FROM books WHERE isbn = ?` },
      { input: `t
id,x`, expected: `INSERT INTO t (id, x) VALUES (?, ?)
UPDATE t SET x = ? WHERE id = ?
SELECT * FROM t WHERE id = ?` },
      { input: `employees
emp_id,name,dept,salary,city`, expected: `INSERT INTO employees (emp_id, name, dept, salary, city) VALUES (?, ?, ?, ?, ?)
UPDATE employees SET name = ?, dept = ?, salary = ?, city = ? WHERE emp_id = ?
SELECT * FROM employees WHERE emp_id = ?` },
    ],
  },
  {
    id: "java-sql-top-earners", topic: "T7", title: "Top Earners (SQL)", difficulty: "Easy", lang: "sql",
    statement: `JDBC needs SQL, so practise it here. From the \`employees\` table return the \`name\` and \`salary\` of the 3 highest-paid employees in the \`IT\` department. If salaries tie, order by name alphabetically.`,
    format: `The INPUT box holds the INSERT statements for the test data. Write one SELECT that returns name and salary.`,
    hint: `WHERE dept = 'IT', then ORDER BY salary DESC, name and finally LIMIT 3.`,
    schema: `employees(id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER)`,
    tpl: `CREATE TABLE employees(id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
{{INPUT}}
{{USER}}`,
    starter: `-- Write your SELECT query here
SELECT`,
    solutionCode: `SELECT name, salary FROM employees WHERE dept = 'IT' ORDER BY salary DESC, name LIMIT 3;`,
    tests: [
      { input: `INSERT INTO employees VALUES (1,'Asha','IT',90000),(2,'Ravi','IT',75000),(3,'Meena','HR',60000),(4,'Karan','IT',82000),(5,'Divya','IT',75000),(6,'Sam','Sales',50000);`, expected: `Asha|90000
Karan|82000
Divya|75000` },
      { input: `INSERT INTO employees VALUES (1,'Zed','IT',40000),(2,'Amy','IT',40000),(3,'Bob','Ops',99999);`, expected: `Amy|40000
Zed|40000` },
      { input: `INSERT INTO employees VALUES (1,'P','IT',10),(2,'Q','IT',30),(3,'R','IT',20),(4,'S','IT',40),(5,'T','HR',100);`, expected: `S|40
Q|30
R|20` },
    ],
  },
  {
    id: "java-route-matcher", topic: "T8", title: "Spring-style Route Matcher", difficulty: "Hard", lang: "java",
    statement: `Spring Boot maps requests like \`@GetMapping("/users/{id}")\` to controller methods. Implement \`matchPath(pattern, path)\`: it returns the list of path variables as \`name=value\` (in order) if the path matches the pattern, or \`null\` if not. A \`{name}\` segment matches any single segment; other segments must be equal. The router in \`main\` then prints the handler (plus variables), \`405 Method Not Allowed\` when the path exists but with another HTTP method, or \`404 Not Found\`.`,
    format: `Line 1: m routes. Next m lines: \`METHOD pattern handler\`. Then q, then q lines: \`METHOD path\`.`,
    hint: `Split both strings on "/". They must have the same length. For each segment: if the pattern segment is \`{x}\` store \`x=value\`, else the two segments must be equal.`,
    starter: `import java.util.*;

public class Main {
    static class Route {
        String method, pattern, handler;
        Route(String m, String p, String h) { method = m; pattern = p; handler = h; }
    }

    // Returns the variables as "name=value" strings if path matches pattern, otherwise null.
    static List<String> matchPath(String pattern, String path) {
        String[] p = pattern.split("/");
        String[] q = path.split("/");
        // your code
        return null;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int m = Integer.parseInt(sc.nextLine().trim());
        List<Route> routes = new ArrayList<>();
        for (int i = 0; i < m; i++) {
            String[] t = sc.nextLine().trim().split("\\\\s+");
            routes.add(new Route(t[0], t[1], t[2]));
        }
        int q = Integer.parseInt(sc.nextLine().trim());
        for (int i = 0; i < q; i++) {
            String[] t = sc.nextLine().trim().split("\\\\s+");
            String result = null;
            boolean pathMatched = false;
            for (Route r : routes) {
                List<String> vars = matchPath(r.pattern, t[1]);
                if (vars == null) continue;
                pathMatched = true;
                if (r.method.equals(t[0])) {
                    result = vars.isEmpty() ? r.handler : r.handler + " " + String.join(" ", vars);
                    break;
                }
            }
            if (result == null) result = pathMatched ? "405 Method Not Allowed" : "404 Not Found";
            System.out.println(result);
        }
    }
}`,
    solutionCode: `import java.util.*;

public class Main {
    static class Route {
        String method, pattern, handler;
        Route(String m, String p, String h) { method = m; pattern = p; handler = h; }
    }

    static List<String> matchPath(String pattern, String path) {
        String[] p = pattern.split("/");
        String[] q = path.split("/");
        if (p.length != q.length) return null;
        List<String> vars = new ArrayList<>();
        for (int i = 0; i < p.length; i++) {
            if (p[i].startsWith("{") && p[i].endsWith("}")) {
                vars.add(p[i].substring(1, p[i].length() - 1) + "=" + q[i]);
            } else if (!p[i].equals(q[i])) {
                return null;
            }
        }
        return vars;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int m = Integer.parseInt(sc.nextLine().trim());
        List<Route> routes = new ArrayList<>();
        for (int i = 0; i < m; i++) {
            String[] t = sc.nextLine().trim().split("\\\\s+");
            routes.add(new Route(t[0], t[1], t[2]));
        }
        int q = Integer.parseInt(sc.nextLine().trim());
        for (int i = 0; i < q; i++) {
            String[] t = sc.nextLine().trim().split("\\\\s+");
            String result = null;
            boolean pathMatched = false;
            for (Route r : routes) {
                List<String> vars = matchPath(r.pattern, t[1]);
                if (vars == null) continue;
                pathMatched = true;
                if (r.method.equals(t[0])) {
                    result = vars.isEmpty() ? r.handler : r.handler + " " + String.join(" ", vars);
                    break;
                }
            }
            if (result == null) result = pathMatched ? "405 Method Not Allowed" : "404 Not Found";
            System.out.println(result);
        }
    }
}`,
    tests: [
      { input: `4
GET /users listUsers
GET /users/{id} getUser
POST /users createUser
GET /users/{id}/posts/{pid} getPost
5
GET /users
GET /users/42
DELETE /users/42
GET /users/7/posts/3
GET /orders`, expected: `listUsers
getUser id=42
405 Method Not Allowed
getPost id=7 pid=3
404 Not Found` },
      { input: `2
GET /health ping
PUT /items/{id} updateItem
3
GET /health
PUT /items/9
GET /items/9`, expected: `ping
updateItem id=9
405 Method Not Allowed` },
      { input: `1
GET /a/{x}/{y} h
2
GET /a/1/2
GET /a/1`, expected: `h x=1 y=2
404 Not Found` },
      { input: `3
GET /products/{cat}/{id} detail
GET /products/all list
POST /products create
4
GET /products/all
GET /products/shoes/12
POST /products
PUT /products`, expected: `list
detail cat=shoes id=12
create
405 Method Not Allowed` },
    ],
  },
  {
    id: "java-rest-status", topic: "T9", title: "REST Status Code Resolver", difficulty: "Medium", lang: "java",
    statement: `A good REST API returns the right HTTP status code. Implement \`status(method, exists, valid)\` using these rules, checked in this order:
- method not GET/POST/PUT/DELETE -> 405
- GET: 200 if the resource exists, else 404
- POST: 409 if it already exists, else 400 if the body is invalid, else 201
- PUT: 400 if the body is invalid, else 200 if it exists, else 404
- DELETE: 204 if it exists, else 404`,
    format: `Line 1: n. Then n lines: \`METHOD exists valid\` where exists and valid are Y or N. Print one status code per line.`,
    hint: `A \`switch\` on the method with the rules above, evaluated in the order written.`,
    starter: `import java.util.*;

public class Main {
    static int status(String method, boolean exists, boolean valid) {
        // your code
        return 500;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 0; i < n; i++) {
            String m = sc.next();
            boolean exists = sc.next().equals("Y");
            boolean valid = sc.next().equals("Y");
            System.out.println(status(m, exists, valid));
        }
    }
}`,
    solutionCode: `import java.util.*;

public class Main {
    static int status(String method, boolean exists, boolean valid) {
        switch (method) {
            case "GET": return exists ? 200 : 404;
            case "POST":
                if (exists) return 409;
                return valid ? 201 : 400;
            case "PUT":
                if (!valid) return 400;
                return exists ? 200 : 404;
            case "DELETE": return exists ? 204 : 404;
            default: return 405;
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 0; i < n; i++) {
            String m = sc.next();
            boolean exists = sc.next().equals("Y");
            boolean valid = sc.next().equals("Y");
            System.out.println(status(m, exists, valid));
        }
    }
}`,
    tests: [
      { input: `4
GET Y Y
GET N Y
POST N Y
POST Y Y`, expected: `200
404
201
409` },
      { input: `5
PUT Y N
PUT Y Y
PUT N Y
DELETE Y Y
DELETE N N`, expected: `400
200
404
204
404` },
      { input: `3
PATCH Y Y
POST N N
OPTIONS N N`, expected: `405
400
405` },
      { input: `2
DELETE Y N
PUT N N`, expected: `204
400` },
    ],
  },
]);
