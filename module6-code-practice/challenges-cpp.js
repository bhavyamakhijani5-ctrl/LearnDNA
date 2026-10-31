/* MODULE 6 -- Code Practice: CPP course challenges, in roadmap order.
   Expected outputs were produced by running the model solution in a real compiler/interpreter. */
registerChallenges("CPP", [
  {
    id: "cpp-reverse-palindrome", topic: "P1", title: "Reverse a Number and Check Palindrome", difficulty: "Easy", lang: "cpp",
    statement: `Read a non-negative integer with \`cin\`. Print its reverse, then \`Palindrome\` if the number equals its reverse, otherwise \`Not Palindrome\`.`,
    format: `One line: n. Print the reversed number, then the verdict.`,
    hint: `Build the reverse with \`rev = rev * 10 + n % 10\` while shrinking a copy of n.`,
    starter: `#include <iostream>
using namespace std;

int main() {
    long long n;
    cin >> n;
    long long rev = 0;
    // your code: compute rev
    cout << rev << endl;
    // your code: print Palindrome or Not Palindrome
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    long long n;
    cin >> n;
    long long rev = 0, t = n;
    while (t > 0) {
        rev = rev * 10 + t % 10;
        t /= 10;
    }
    cout << rev << endl;
    cout << (rev == n ? "Palindrome" : "Not Palindrome") << endl;
    return 0;
}`,
    tests: [
      { input: `121`, expected: `121
Palindrome` },
      { input: `123`, expected: `321
Not Palindrome` },
      { input: `1001`, expected: `1001
Palindrome` },
      { input: `7`, expected: `7
Palindrome` },
      { input: `120`, expected: `21
Not Palindrome` },
    ],
  },
  {
    id: "cpp-rectangle-class", topic: "P2", title: "Rectangle Class", difficulty: "Easy", lang: "cpp",
    statement: `Complete the \`Rectangle\` class: a constructor, and the member functions \`area()\`, \`perimeter()\` and \`isSquare()\`. Keep the data members \`private\`.`,
    format: `One line: \`w h\` (integers). Print \`Area: x\`, \`Perimeter: y\` and \`Square: Yes/No\`.`,
    hint: `Initialise the members in the constructor with \`Rectangle(int w, int h) : w(w), h(h) {}\`.`,
    starter: `#include <iostream>
using namespace std;

class Rectangle {
    int w, h;
public:
    Rectangle(int width, int height) {
        // your code
    }
    int area() const { return 0; }
    int perimeter() const { return 0; }
    bool isSquare() const { return false; }
};

int main() {
    int w, h;
    cin >> w >> h;
    Rectangle r(w, h);
    cout << "Area: " << r.area() << endl;
    cout << "Perimeter: " << r.perimeter() << endl;
    cout << "Square: " << (r.isSquare() ? "Yes" : "No") << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

class Rectangle {
    int w, h;
public:
    Rectangle(int width, int height) : w(width), h(height) {}
    int area() const { return w * h; }
    int perimeter() const { return 2 * (w + h); }
    bool isSquare() const { return w == h; }
};

int main() {
    int w, h;
    cin >> w >> h;
    Rectangle r(w, h);
    cout << "Area: " << r.area() << endl;
    cout << "Perimeter: " << r.perimeter() << endl;
    cout << "Square: " << (r.isSquare() ? "Yes" : "No") << endl;
    return 0;
}`,
    tests: [
      { input: `3 4`, expected: `Area: 12
Perimeter: 14
Square: No` },
      { input: `5 5`, expected: `Area: 25
Perimeter: 20
Square: Yes` },
      { input: `10 1`, expected: `Area: 10
Perimeter: 22
Square: No` },
      { input: `7 7`, expected: `Area: 49
Perimeter: 28
Square: Yes` },
    ],
  },
  {
    id: "cpp-constructor-trace", topic: "P3", title: "Constructor and Destructor Order", difficulty: "Medium", lang: "cpp",
    statement: `Objects are created in order and destroyed in reverse order. Make \`Tracer\` print \`Created <name>\` in its constructor and \`Destroyed <name>\` in its destructor, and keep the static counter \`alive\` correct (increase it in the constructor, decrease it in the destructor). \`main\` builds the objects recursively and prints the counter once all are alive.`,
    format: `Line 1: n. Line 2: n names. Print the trace lines produced by constructors, the \`-- alive: k --\` line, then the destructor lines.`,
    hint: `Constructor: \`alive++; cout << "Created " << name << endl;\`. Destructor: \`alive--; cout << "Destroyed " << name << endl;\`.`,
    starter: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

class Tracer {
    string name;
public:
    static int alive;
    Tracer(const string& n) : name(n) {
        // your code: update alive and print "Created <name>"
    }
    ~Tracer() {
        // your code: update alive and print "Destroyed <name>"
    }
};
int Tracer::alive = 0;

void build(const vector<string>& names, size_t i) {
    if (i == names.size()) {
        cout << "-- alive: " << Tracer::alive << " --" << endl;
        return;
    }
    Tracer t(names[i]);
    build(names, i + 1);
}

int main() {
    int n;
    cin >> n;
    vector<string> names(n);
    for (auto& s : names) cin >> s;
    build(names, 0);
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

class Tracer {
    string name;
public:
    static int alive;
    Tracer(const string& n) : name(n) {
        alive++;
        cout << "Created " << name << endl;
    }
    ~Tracer() {
        alive--;
        cout << "Destroyed " << name << endl;
    }
};
int Tracer::alive = 0;

void build(const vector<string>& names, size_t i) {
    if (i == names.size()) {
        cout << "-- alive: " << Tracer::alive << " --" << endl;
        return;
    }
    Tracer t(names[i]);
    build(names, i + 1);
}

int main() {
    int n;
    cin >> n;
    vector<string> names(n);
    for (auto& s : names) cin >> s;
    build(names, 0);
    return 0;
}`,
    tests: [
      { input: `3
a b c`, expected: `Created a
Created b
Created c
-- alive: 3 --
Destroyed c
Destroyed b
Destroyed a` },
      { input: `1
x`, expected: `Created x
-- alive: 1 --
Destroyed x` },
      { input: `2
foo bar`, expected: `Created foo
Created bar
-- alive: 2 --
Destroyed bar
Destroyed foo` },
      { input: `4
w x y z`, expected: `Created w
Created x
Created y
Created z
-- alive: 4 --
Destroyed z
Destroyed y
Destroyed x
Destroyed w` },
    ],
  },
  {
    id: "cpp-employee-hierarchy", topic: "P4", title: "Employee, Manager, Director", difficulty: "Medium", lang: "cpp",
    statement: `Build a 3-level inheritance chain. \`Employee::pay()\` returns the salary. \`Manager\` (derived from Employee) pays salary + bonus. \`Director\` (derived from Manager) pays \`Manager::pay()\` + perk. Call the base constructor from the derived constructor with an initialiser list.`,
    format: `Line 1: n. Then lines \`E name salary\`, \`M name salary bonus\` or \`D name salary bonus perk\`. Print \`name: pay\` for each line.`,
    hint: `\`Manager(string n, int s, int b) : Employee(n, s), bonus(b) {}\` and in Director call \`Manager::pay()\`.`,
    starter: `#include <iostream>
#include <string>
using namespace std;

class Employee {
protected:
    string name;
    int salary;
public:
    Employee(string n, int s) : name(n), salary(s) {}
    int pay() const { return salary; }
    string getName() const { return name; }
};

class Manager : public Employee {
    int bonus;
public:
    Manager(string n, int s, int b) : Employee(n, s), bonus(b) {}
    // your code: pay() = salary + bonus
};

class Director : public Manager {
    int perk;
public:
    Director(string n, int s, int b, int p) : Manager(n, s, b), perk(p) {}
    // your code: pay() = Manager::pay() + perk
};

int main() {
    int n;
    cin >> n;
    while (n--) {
        string t, name;
        int s, b, p;
        cin >> t >> name >> s;
        if (t == "E") { Employee e(name, s); cout << e.getName() << ": " << e.pay() << endl; }
        else if (t == "M") { cin >> b; Manager m(name, s, b); cout << m.getName() << ": " << m.pay() << endl; }
        else { cin >> b >> p; Director d(name, s, b, p); cout << d.getName() << ": " << d.pay() << endl; }
    }
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

class Employee {
protected:
    string name;
    int salary;
public:
    Employee(string n, int s) : name(n), salary(s) {}
    int pay() const { return salary; }
    string getName() const { return name; }
};

class Manager : public Employee {
    int bonus;
public:
    Manager(string n, int s, int b) : Employee(n, s), bonus(b) {}
    int pay() const { return salary + bonus; }
};

class Director : public Manager {
    int perk;
public:
    Director(string n, int s, int b, int p) : Manager(n, s, b), perk(p) {}
    int pay() const { return Manager::pay() + perk; }
};

int main() {
    int n;
    cin >> n;
    while (n--) {
        string t, name;
        int s, b, p;
        cin >> t >> name >> s;
        if (t == "E") { Employee e(name, s); cout << e.getName() << ": " << e.pay() << endl; }
        else if (t == "M") { cin >> b; Manager m(name, s, b); cout << m.getName() << ": " << m.pay() << endl; }
        else { cin >> b >> p; Director d(name, s, b, p); cout << d.getName() << ": " << d.pay() << endl; }
    }
    return 0;
}`,
    tests: [
      { input: `3
E ravi 50000
M asha 60000 8000
D meena 90000 15000 5000`, expected: `ravi: 50000
asha: 68000
meena: 110000` },
      { input: `1
E solo 1000`, expected: `solo: 1000` },
      { input: `2
M a 10 1
D b 20 2 3`, expected: `a: 11
b: 25` },
      { input: `4
D x 100 10 1
E y 5
M z 7 7
E w 0`, expected: `x: 111
y: 5
z: 14
w: 0` },
    ],
  },
  {
    id: "cpp-notifier-polymorphism", topic: "P5", title: "Notification Dispatcher (virtual functions)", difficulty: "Medium", lang: "cpp",
    statement: `\`Notifier\` is an abstract base class with a pure virtual \`send(msg)\`. Implement it in three derived classes and let \`main\` call it through base-class pointers (runtime polymorphism):
- \`Email\`: \`EMAIL: <msg>\`
- \`Sms\`: \`SMS: <first 10 characters of msg>\`
- \`Push\`: \`PUSH: <msg in UPPERCASE>\``,
    format: `Line 1: n. Then n lines: \`TYPE message text\` (TYPE is EMAIL, SMS or PUSH). Print the result of \`send\` for each line.`,
    hint: `Mark the overrides with \`override\`. For Sms use \`msg.substr(0, 10)\`, for Push use \`toupper\` on each character.`,
    starter: `#include <iostream>
#include <string>
#include <vector>
#include <cctype>
using namespace std;

class Notifier {
public:
    virtual string send(const string& msg) const = 0;
    virtual ~Notifier() {}
};

class Email : public Notifier {
public:
    string send(const string& msg) const override { return ""; } // your code
};

class Sms : public Notifier {
public:
    string send(const string& msg) const override { return ""; } // your code
};

class Push : public Notifier {
public:
    string send(const string& msg) const override { return ""; } // your code
};

int main() {
    int n;
    cin >> n;
    string line;
    getline(cin, line);
    vector<Notifier*> all;
    vector<string> msgs;
    for (int i = 0; i < n; i++) {
        getline(cin, line);
        size_t sp = line.find(' ');
        string type = line.substr(0, sp), msg = line.substr(sp + 1);
        if (type == "EMAIL") all.push_back(new Email());
        else if (type == "SMS") all.push_back(new Sms());
        else all.push_back(new Push());
        msgs.push_back(msg);
    }
    for (size_t i = 0; i < all.size(); i++) cout << all[i]->send(msgs[i]) << endl;
    for (auto p : all) delete p;
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <string>
#include <vector>
#include <cctype>
using namespace std;

class Notifier {
public:
    virtual string send(const string& msg) const = 0;
    virtual ~Notifier() {}
};

class Email : public Notifier {
public:
    string send(const string& msg) const override { return "EMAIL: " + msg; }
};

class Sms : public Notifier {
public:
    string send(const string& msg) const override { return "SMS: " + msg.substr(0, 10); }
};

class Push : public Notifier {
public:
    string send(const string& msg) const override {
        string up = msg;
        for (auto& c : up) c = toupper((unsigned char)c);
        return "PUSH: " + up;
    }
};

int main() {
    int n;
    cin >> n;
    string line;
    getline(cin, line);
    vector<Notifier*> all;
    vector<string> msgs;
    for (int i = 0; i < n; i++) {
        getline(cin, line);
        size_t sp = line.find(' ');
        string type = line.substr(0, sp), msg = line.substr(sp + 1);
        if (type == "EMAIL") all.push_back(new Email());
        else if (type == "SMS") all.push_back(new Sms());
        else all.push_back(new Push());
        msgs.push_back(msg);
    }
    for (size_t i = 0; i < all.size(); i++) cout << all[i]->send(msgs[i]) << endl;
    for (auto p : all) delete p;
    return 0;
}`,
    tests: [
      { input: `3
EMAIL Your order has shipped
SMS Your OTP is 482913 do not share
PUSH new offer today`, expected: `EMAIL: Your order has shipped
SMS: Your OTP i
PUSH: NEW OFFER TODAY` },
      { input: `1
SMS short`, expected: `SMS: short` },
      { input: `2
PUSH hello world
EMAIL hi`, expected: `PUSH: HELLO WORLD
EMAIL: hi` },
      { input: `2
SMS 0123456789ABC
PUSH MiXeD cAsE`, expected: `SMS: 0123456789
PUSH: MIXED CASE` },
    ],
  },
  {
    id: "cpp-complex-operators", topic: "P6", title: "Complex Numbers (Operator Overloading)", difficulty: "Medium", lang: "cpp",
    statement: `Overload \`operator+\`, \`operator*\` and \`operator<<\` for the \`Complex\` struct. \`(a+bi) + (c+di) = (a+c) + (b+d)i\` and \`(a+bi) * (c+di) = (ac-bd) + (ad+bc)i\`. Print a number as \`re+imi\` or \`re-imi\`, for example \`3+4i\`, \`1-2i\`, \`0+0i\`.`,
    format: `One line: \`a b c d\`. Print the sum on the first line and the product on the second line.`,
    hint: `For \`operator<<\` print \`re\`, then \`+\` if im >= 0 (a negative im already prints its minus sign), then \`im\` and \`i\`.`,
    starter: `#include <iostream>
using namespace std;

struct Complex {
    int re, im;
    Complex(int r = 0, int i = 0) : re(r), im(i) {}
};

Complex operator+(const Complex& a, const Complex& b) {
    return Complex(); // your code
}

Complex operator*(const Complex& a, const Complex& b) {
    return Complex(); // your code
}

ostream& operator<<(ostream& os, const Complex& c) {
    // your code
    return os;
}

int main() {
    int a, b, c, d;
    cin >> a >> b >> c >> d;
    Complex x(a, b), y(c, d);
    cout << (x + y) << endl;
    cout << (x * y) << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct Complex {
    int re, im;
    Complex(int r = 0, int i = 0) : re(r), im(i) {}
};

Complex operator+(const Complex& a, const Complex& b) {
    return Complex(a.re + b.re, a.im + b.im);
}

Complex operator*(const Complex& a, const Complex& b) {
    return Complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
}

ostream& operator<<(ostream& os, const Complex& c) {
    os << c.re << (c.im >= 0 ? "+" : "") << c.im << "i";
    return os;
}

int main() {
    int a, b, c, d;
    cin >> a >> b >> c >> d;
    Complex x(a, b), y(c, d);
    cout << (x + y) << endl;
    cout << (x * y) << endl;
    return 0;
}`,
    tests: [
      { input: `1 2 3 4`, expected: `4+6i
-5+10i` },
      { input: `0 0 0 0`, expected: `0+0i
0+0i` },
      { input: `2 -3 -4 5`, expected: `-2+2i
7+22i` },
      { input: `1 0 0 1`, expected: `1+1i
0+1i` },
    ],
  },
  {
    id: "cpp-top-k-words", topic: "P7", title: "Top K Frequent Words (STL)", difficulty: "Hard", lang: "cpp",
    statement: `Use the STL: count words with \`map<string,int>\`, copy them into a \`vector<pair<string,int>>\`, sort it with a custom comparator (higher count first, then alphabetical) and print the first \`k\` entries.`,
    format: `Line 1: \`n k\`. Line 2: n words. Print k lines \`word count\`.`,
    hint: `\`sort(v.begin(), v.end(), [](const auto& a, const auto& b) { ... })\` - compare counts first, then \`a.first < b.first\`.`,
    starter: `#include <iostream>
#include <map>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    int n, k;
    cin >> n >> k;
    map<string, int> freq;
    for (int i = 0; i < n; i++) {
        string w;
        cin >> w;
        freq[w]++;
    }
    vector<pair<string, int>> v(freq.begin(), freq.end());
    // your code: sort v by count (descending), then word (ascending)
    for (int i = 0; i < k && i < (int)v.size(); i++) {
        cout << v[i].first << " " << v[i].second << endl;
    }
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <map>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    int n, k;
    cin >> n >> k;
    map<string, int> freq;
    for (int i = 0; i < n; i++) {
        string w;
        cin >> w;
        freq[w]++;
    }
    vector<pair<string, int>> v(freq.begin(), freq.end());
    sort(v.begin(), v.end(), [](const pair<string, int>& a, const pair<string, int>& b) {
        if (a.second != b.second) return a.second > b.second;
        return a.first < b.first;
    });
    for (int i = 0; i < k && i < (int)v.size(); i++) {
        cout << v[i].first << " " << v[i].second << endl;
    }
    return 0;
}`,
    tests: [
      { input: `9 2
i love coding i love cpp i code cpp`, expected: `i 3
cpp 2` },
      { input: `4 3
b a c b`, expected: `b 2
a 1
c 1` },
      { input: `6 1
x y z x y z`, expected: `x 2` },
      { input: `5 10
one two two three three`, expected: `three 2
two 2
one 1` },
    ],
  },
]);
