/* MODULE 6 -- Code Practice: PYTHON course challenges, in roadmap order.
   Expected outputs were produced by running the model solution in a real compiler/interpreter. */
registerChallenges("PYTHON", [
  {
    id: "py-arithmetic", topic: "PY1", title: "Arithmetic Operators", difficulty: "Easy", lang: "python",
    statement: `Read two integers \`a\` and \`b\` and print the results of \`a + b\`, \`a - b\`, \`a * b\`, true division \`a / b\` (2 decimals), floor division \`a // b\`, remainder \`a % b\` and power \`a ** b\`, each on its own line. Note how Python's \`//\` and \`%\` behave with negative numbers.`,
    format: `One line: \`a b\` (b is never 0). Print 7 lines.`,
    hint: `Use an f-string for the division: \`f"{a / b:.2f}"\`.`,
    starter: `a, b = map(int, input().split())
# your code: print the 7 results, one per line`,
    solutionCode: `a, b = map(int, input().split())
print(a + b)
print(a - b)
print(a * b)
print(f"{a / b:.2f}")
print(a // b)
print(a % b)
print(a ** b)`,
    tests: [
      { input: `7 3`, expected: `10
4
21
2.33
2
1
343` },
      { input: `10 5`, expected: `15
5
50
2.00
2
0
100000` },
      { input: `-9 4`, expected: `-5
-13
-36
-2.25
-3
3
6561` },
      { input: `2 10`, expected: `12
-8
20
0.20
0
2
1024` },
    ],
  },
  {
    id: "py-primes", topic: "PY2", title: "Primes up to N", difficulty: "Easy", lang: "python",
    statement: `Print all prime numbers from 2 to n separated by spaces on the first line and \`Count: k\` on the second line. Practise \`for\` loops, \`range\`, \`break\` and \`else\` on loops.`,
    format: `One line: n (n >= 2). Print the primes, then \`Count: k\`.`,
    hint: `A number x is prime if no d in \`range(2, int(x ** 0.5) + 1)\` divides it.`,
    starter: `n = int(input())
primes = []
# your code: fill the list primes
print(*primes)
print("Count:", len(primes))`,
    solutionCode: `n = int(input())
primes = []
for x in range(2, n + 1):
    for d in range(2, int(x ** 0.5) + 1):
        if x % d == 0:
            break
    else:
        primes.append(x)
print(*primes)
print("Count:", len(primes))`,
    tests: [
      { input: `20`, expected: `2 3 5 7 11 13 17 19
Count: 8` },
      { input: `2`, expected: `2
Count: 1` },
      { input: `30`, expected: `2 3 5 7 11 13 17 19 23 29
Count: 10` },
      { input: `100`, expected: `2 3 5 7 11 13 17 19 23 29 31 37 41 43 47 53 59 61 67 71 73 79 83 89 97
Count: 25` },
    ],
  },
  {
    id: "py-group-anagrams", topic: "PY3", title: "Group Anagrams (dict and list)", difficulty: "Easy", lang: "python",
    statement: `Group the words that are anagrams of each other. Print one group per line, the words inside a group sorted alphabetically and separated by spaces. Groups are printed sorted by their first word.`,
    format: `One line of space-separated words. Print the groups.`,
    hint: `Use a dict whose key is \`"".join(sorted(word))\` and whose value is a list of words.`,
    starter: `words = input().split()
groups = {}
# your code: fill groups
result = sorted(sorted(g) for g in groups.values())
for g in result:
    print(*g)`,
    solutionCode: `words = input().split()
groups = {}
for w in words:
    groups.setdefault("".join(sorted(w)), []).append(w)
result = sorted(sorted(g) for g in groups.values())
for g in result:
    print(*g)`,
    tests: [
      { input: `eat tea tan ate nat bat`, expected: `ate eat tea
bat
nat tan` },
      { input: `abc`, expected: `abc` },
      { input: `listen silent enlist google gogole cat act`, expected: `act cat
enlist listen silent
gogole google` },
      { input: `a b a`, expected: `a a
b` },
    ],
  },
  {
    id: "py-memoize", topic: "PY4", title: "Memoize Decorator", difficulty: "Medium", lang: "python",
    statement: `Write a decorator \`memoize\` that caches results of a function by its argument so repeated calls are not recomputed. \`fib\` is decorated with it. Print \`fib(n)\` and how many times the real function body ran (\`calls\`).`,
    format: `One line: n. Print \`value calls\`.`,
    hint: `Keep a dict \`cache\` in the decorator's closure; in \`wrapper(n)\` return \`cache[n]\` when present, otherwise compute, store and return.`,
    starter: `def memoize(fn):
    # your code: return a wrapper that caches fn's results
    return fn

calls = 0

@memoize
def fib(n):
    global calls
    calls += 1
    return n if n < 2 else fib(n - 1) + fib(n - 2)

n = int(input())
print(fib(n), calls)`,
    solutionCode: `def memoize(fn):
    cache = {}
    def wrapper(n):
        if n not in cache:
            cache[n] = fn(n)
        return cache[n]
    return wrapper

calls = 0

@memoize
def fib(n):
    global calls
    calls += 1
    return n if n < 2 else fib(n - 1) + fib(n - 2)

n = int(input())
print(fib(n), calls)`,
    tests: [
      { input: `10`, expected: `55 11` },
      { input: `1`, expected: `1 1` },
      { input: `25`, expected: `75025 26` },
      { input: `0`, expected: `0 1` },
    ],
  },
  {
    id: "py-bank-account", topic: "PY5", title: "Bank Account Class", difficulty: "Medium", lang: "python",
    statement: `Complete the \`BankAccount\` class. \`deposit(x)\` and \`withdraw(x)\` must raise \`ValueError\` if x <= 0, and \`withdraw\` raises the custom \`InsufficientFunds\` exception if x is more than the balance. The loop at the bottom prints \`OK\`, \`Invalid amount\`, \`Insufficient funds\` or the balance.`,
    format: `Line 1: n. Then n commands: \`deposit x\`, \`withdraw x\` or \`balance\`.`,
    hint: `Store the balance in \`self._balance\` (set it in \`__init__\`) and raise exceptions *before* changing it.`,
    starter: `class InsufficientFunds(Exception):
    pass

class BankAccount:
    def __init__(self):
        pass  # your code

    def deposit(self, x):
        pass  # your code

    def withdraw(self, x):
        pass  # your code

    @property
    def balance(self):
        return 0  # your code

acc = BankAccount()
for _ in range(int(input())):
    parts = input().split()
    try:
        if parts[0] == "deposit":
            acc.deposit(int(parts[1])); print("OK")
        elif parts[0] == "withdraw":
            acc.withdraw(int(parts[1])); print("OK")
        else:
            print("Balance:", acc.balance)
    except ValueError:
        print("Invalid amount")
    except InsufficientFunds:
        print("Insufficient funds")`,
    solutionCode: `class InsufficientFunds(Exception):
    pass

class BankAccount:
    def __init__(self):
        self._balance = 0

    def deposit(self, x):
        if x <= 0:
            raise ValueError("amount must be positive")
        self._balance += x

    def withdraw(self, x):
        if x <= 0:
            raise ValueError("amount must be positive")
        if x > self._balance:
            raise InsufficientFunds()
        self._balance -= x

    @property
    def balance(self):
        return self._balance

acc = BankAccount()
for _ in range(int(input())):
    parts = input().split()
    try:
        if parts[0] == "deposit":
            acc.deposit(int(parts[1])); print("OK")
        elif parts[0] == "withdraw":
            acc.withdraw(int(parts[1])); print("OK")
        else:
            print("Balance:", acc.balance)
    except ValueError:
        print("Invalid amount")
    except InsufficientFunds:
        print("Insufficient funds")`,
    tests: [
      { input: `6
deposit 100
withdraw 30
withdraw 100
balance
deposit -5
balance`, expected: `OK
OK
Insufficient funds
Balance: 70
Invalid amount
Balance: 70` },
      { input: `2
balance
withdraw 1`, expected: `Balance: 0
Insufficient funds` },
      { input: `4
deposit 50
withdraw 0
withdraw 50
balance`, expected: `OK
Invalid amount
OK
Balance: 0` },
      { input: `3
deposit 10
deposit 20
balance`, expected: `OK
OK
Balance: 30` },
    ],
  },
  {
    id: "py-file-records", topic: "PY6", title: "Parse Records with File and Exceptions", difficulty: "Medium", lang: "python",
    statement: `Each input line should look like \`name,age\`. For every line try to convert the age with \`int()\`; lines that fail (\`ValueError\`, or a missing comma) are invalid. Write the valid lines into the file \`people.txt\` using \`with open(..., "w")\`, read the file back with \`with open(..., "r")\` and print \`Valid: n\`, \`Invalid: m\` and \`Average age: x.xx\` (0.00 when there are no valid lines).`,
    format: `Any number of lines (until the end of input). Print three lines.`,
    hint: `\`sys.stdin.read().split("\\n")\` gives the lines. Use \`try / except ValueError\`. Splitting "dave" on "," gives one part, so \`name, age = line.split(",")\` raises ValueError too.`,
    starter: `import sys

lines = [l.strip() for l in sys.stdin.read().split("\\n") if l.strip()]
invalid = 0
with open("people.txt", "w") as f:
    for line in lines:
        pass  # your code: validate the line, write valid ones to f, count invalid ones

ages = []
with open("people.txt", "r") as f:
    for line in f:
        pass  # your code: collect the ages of the saved lines

avg = sum(ages) / len(ages) if ages else 0
print("Valid:", len(ages))
print("Invalid:", invalid)
print(f"Average age: {avg:.2f}")`,
    solutionCode: `import sys

lines = [l.strip() for l in sys.stdin.read().split("\\n") if l.strip()]
invalid = 0
with open("people.txt", "w") as f:
    for line in lines:
        try:
            name, age = line.split(",")
            int(age)
        except ValueError:
            invalid += 1
            continue
        f.write(line + "\\n")

ages = []
with open("people.txt", "r") as f:
    for line in f:
        ages.append(int(line.strip().split(",")[1]))

avg = sum(ages) / len(ages) if ages else 0
print("Valid:", len(ages))
print("Invalid:", invalid)
print(f"Average age: {avg:.2f}")`,
    tests: [
      { input: `alice,30
bob,x
carol,25
dave`, expected: `Valid: 2
Invalid: 2
Average age: 27.50` },
      { input: `a,10`, expected: `Valid: 1
Invalid: 0
Average age: 10.00` },
      { input: `x,y
zzz`, expected: `Valid: 0
Invalid: 2
Average age: 0.00` },
      { input: `ann,20
ben,21
cat,22
dan,23`, expected: `Valid: 4
Invalid: 0
Average age: 21.50` },
    ],
  },
  {
    id: "py-numpy-matrix", topic: "PY7", title: "Matrix Statistics with NumPy", difficulty: "Hard", lang: "python",
    statement: `Use NumPy (no Python loops over elements). Read an r x c matrix. Print the mean of every column with 2 decimals (space separated) and then \`Row with max sum: i\` (0-based, first one in case of a tie).`,
    format: `Line 1: \`r c\`. Then r lines of c integers.`,
    hint: `\`m.mean(axis=0)\` gives column means and \`m.sum(axis=1).argmax()\` the best row. Format with \`" ".join(f"{x:.2f}" for x in means)\`.`,
    starter: `import numpy as np

r, c = map(int, input().split())
m = np.array([list(map(int, input().split())) for _ in range(r)])
# your code: print the column means, then the row with the maximum sum`,
    solutionCode: `import numpy as np

r, c = map(int, input().split())
m = np.array([list(map(int, input().split())) for _ in range(r)])
means = m.mean(axis=0)
print(" ".join(f"{x:.2f}" for x in means))
print("Row with max sum:", int(m.sum(axis=1).argmax()))`,
    tests: [
      { input: `2 3
1 2 3
4 5 6`, expected: `2.50 3.50 4.50
Row with max sum: 1` },
      { input: `3 2
5 1
2 8
9 0`, expected: `5.33 3.00
Row with max sum: 1` },
      { input: `1 4
1 2 3 4`, expected: `1.00 2.00 3.00 4.00
Row with max sum: 0` },
      { input: `2 2
-1 -2
-3 -4`, expected: `-2.00 -3.00
Row with max sum: 0` },
    ],
  },
  {
    id: "py-pandas-groupby", topic: "PY7", title: "Class Averages with pandas", difficulty: "Hard", lang: "python",
    statement: `Load CSV text into a pandas \`DataFrame\`, group it by \`class\` and print the average score of each class (2 decimals), sorted by class name, as \`class average\`.`,
    format: `Line 1 is the header \`name,class,score\`, followed by the data rows. Print one \`class average\` line per class.`,
    hint: `\`df.groupby("class")["score"].mean()\` returns a Series that is already sorted by the group key. Loop over \`.items()\`.`,
    starter: `import sys
import pandas as pd
from io import StringIO

df = pd.read_csv(StringIO(sys.stdin.read()))
# your code: group by class and print the mean score of each class`,
    solutionCode: `import sys
import pandas as pd
from io import StringIO

df = pd.read_csv(StringIO(sys.stdin.read()))
for cls, avg in df.groupby("class")["score"].mean().items():
    print(f"{cls} {avg:.2f}")`,
    tests: [
      { input: `name,class,score
Asha,B,80
Ravi,A,70
Meena,B,90
Karan,A,75`, expected: `A 72.50
B 85.00` },
      { input: `name,class,score
Solo,C,55`, expected: `C 55.00` },
      { input: `name,class,score
a,X,1
b,Y,2
c,X,2
d,Y,5
e,Z,10`, expected: `X 1.50
Y 3.50
Z 10.00` },
    ],
  },
]);
