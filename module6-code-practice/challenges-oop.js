/* MODULE 6 -- Code Practice: OOP course challenges, in roadmap order.
   Expected outputs were produced by running the model solution in a real compiler/interpreter. */
registerChallenges("OOP", [
  {
    id: "oop-rectangle", topic: "O1", title: "Rectangle Class", difficulty: "Easy", lang: "javascript",
    statement: `Complete the \`Rectangle\` class: a constructor that stores \`width\` and \`height\`, and the methods \`area()\`, \`perimeter()\` and \`isSquare()\`. A class bundles data (fields) and behaviour (methods) into one object.`,
    format: `Each line: \`w h\`. Print \`area perimeter isSquare\` for each line.`,
    hint: `Store the values as \`this.width\` and \`this.height\` in the constructor, then use them in the methods.`,
    starter: `class Rectangle {
  constructor(width, height) {
    // your code
  }
  area() { return 0; }
  perimeter() { return 0; }
  isSquare() { return false; }
}

for (const line of input.trim().split("\\n")) {
  const [w, h] = line.split(" ").map(Number);
  const r = new Rectangle(w, h);
  console.log(\`\${r.area()} \${r.perimeter()} \${r.isSquare()}\`);
}`,
    solutionCode: `class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  area() { return this.width * this.height; }
  perimeter() { return 2 * (this.width + this.height); }
  isSquare() { return this.width === this.height; }
}

for (const line of input.trim().split("\\n")) {
  const [w, h] = line.split(" ").map(Number);
  const r = new Rectangle(w, h);
  console.log(\`\${r.area()} \${r.perimeter()} \${r.isSquare()}\`);
}`,
    tests: [
      { input: `3 4
5 5`, expected: `12 14 false
25 20 true` },
      { input: `10 1`, expected: `10 22 false` },
      { input: `2 2
7 3
1 9`, expected: `4 8 true
21 20 false
9 20 false` },
      { input: `6 6`, expected: `36 24 true` },
    ],
  },
  {
    id: "oop-encapsulation", topic: "O2", title: "Encapsulated Bank Account", difficulty: "Easy", lang: "javascript",
    statement: `Hide the balance with a private field \`#balance\`. Provide \`deposit(x)\` and \`withdraw(x)\` which return \`"OK"\`, \`"Invalid"\` (x <= 0) or \`"Insufficient"\` (withdraw more than the balance), and a read-only getter \`balance\`. Outside code must not be able to change the balance directly - the \`hack\` command tries \`acc.balance = 1000000\` and it must have no effect.`,
    format: `Each line: \`deposit x\`, \`withdraw x\`, \`balance\` or \`hack\`. Print the result of each command.`,
    hint: `Declare \`#balance = 0;\` in the class body and a getter \`get balance() { return this.#balance; }\` with NO setter.`,
    starter: `class BankAccount {
  // your code: private field #balance, deposit(), withdraw() and a read-only balance getter
}

const acc = new BankAccount();
for (const line of input.trim().split("\\n")) {
  const [cmd, amt] = line.split(" ");
  const x = Number(amt);
  if (cmd === "deposit") console.log(acc.deposit(x));
  else if (cmd === "withdraw") console.log(acc.withdraw(x));
  else if (cmd === "balance") console.log(acc.balance);
  else if (cmd === "hack") { acc.balance = 1000000; console.log(acc.balance); }
}`,
    solutionCode: `class BankAccount {
  #balance = 0;
  deposit(x) {
    if (x <= 0) return "Invalid";
    this.#balance += x;
    return "OK";
  }
  withdraw(x) {
    if (x <= 0) return "Invalid";
    if (x > this.#balance) return "Insufficient";
    this.#balance -= x;
    return "OK";
  }
  get balance() { return this.#balance; }
}

const acc = new BankAccount();
for (const line of input.trim().split("\\n")) {
  const [cmd, amt] = line.split(" ");
  const x = Number(amt);
  if (cmd === "deposit") console.log(acc.deposit(x));
  else if (cmd === "withdraw") console.log(acc.withdraw(x));
  else if (cmd === "balance") console.log(acc.balance);
  else if (cmd === "hack") { acc.balance = 1000000; console.log(acc.balance); }
}`,
    tests: [
      { input: `deposit 100
withdraw 30
balance`, expected: `OK
OK
70` },
      { input: `deposit -5
withdraw 10
balance`, expected: `Invalid
Insufficient
0` },
      { input: `deposit 50
hack
balance
withdraw 60`, expected: `OK
50
50
Insufficient` },
      { input: `withdraw 1
deposit 0
balance`, expected: `Insufficient
Invalid
0` },
    ],
  },
  {
    id: "oop-resource-lifecycle", topic: "O3", title: "Constructor and Dispose Lifecycle", difficulty: "Medium", lang: "javascript",
    statement: `JavaScript has constructors but no destructors, so cleanup is done with an explicit \`dispose()\` method. Make the constructor increase the static counter \`Resource.live\`, and \`dispose()\` decrease it - but only once per object (calling dispose twice must not decrease it twice).`,
    format: `Each line: \`create name\`, \`dispose name\` or \`count\`. Print \`created name\` / \`disposed name\` / the live count.`,
    hint: `Keep a \`this.disposed = false\` flag in the constructor and check it inside \`dispose()\`.`,
    starter: `class Resource {
  static live = 0;
  constructor(name) {
    // your code
  }
  dispose() {
    // your code
  }
}

const objs = new Map();
for (const line of input.trim().split("\\n")) {
  const [cmd, name] = line.split(" ");
  if (cmd === "create") { objs.set(name, new Resource(name)); console.log(\`created \${name}\`); }
  else if (cmd === "dispose") { const o = objs.get(name); if (o) o.dispose(); console.log(\`disposed \${name}\`); }
  else if (cmd === "count") console.log(Resource.live);
}`,
    solutionCode: `class Resource {
  static live = 0;
  constructor(name) {
    this.name = name;
    this.disposed = false;
    Resource.live++;
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    Resource.live--;
  }
}

const objs = new Map();
for (const line of input.trim().split("\\n")) {
  const [cmd, name] = line.split(" ");
  if (cmd === "create") { objs.set(name, new Resource(name)); console.log(\`created \${name}\`); }
  else if (cmd === "dispose") { const o = objs.get(name); if (o) o.dispose(); console.log(\`disposed \${name}\`); }
  else if (cmd === "count") console.log(Resource.live);
}`,
    tests: [
      { input: `create a
create b
count
dispose a
count
dispose a
count`, expected: `created a
created b
2
disposed a
1
disposed a
1` },
      { input: `count`, expected: `0` },
      { input: `create x
dispose y
count`, expected: `created x
disposed y
1` },
      { input: `create p
create q
create r
dispose q
dispose r
dispose q
count`, expected: `created p
created q
created r
disposed q
disposed r
disposed q
1` },
    ],
  },
  {
    id: "oop-vehicle-tolls", topic: "O4", title: "Vehicle Inheritance and Tolls", difficulty: "Medium", lang: "javascript",
    statement: `\`Vehicle\` has a base toll of 10. \`Car\` (extends Vehicle, constructor takes \`name, seats\`) charges the base toll + 2 per seat. \`Truck\` (constructor takes \`name, axles\`) charges the base toll + 15 per axle. Use \`super\` in the constructors and \`super.toll()\` in the overridden \`toll()\`. \`describe()\` is inherited and prints \`ClassName name: toll\`.`,
    format: `Each line: \`CAR name seats\`, \`TRUCK name axles\` or \`BIKE name\`. Print \`describe()\` for each.`,
    hint: `\`constructor(name, seats) { super(name); this.seats = seats; }\` and \`toll() { return super.toll() + 2 * this.seats; }\`.`,
    starter: `class Vehicle {
  constructor(name) { this.name = name; }
  toll() { return 10; }
  describe() { return \`\${this.constructor.name} \${this.name}: \${this.toll()}\`; }
}

class Car extends Vehicle {
  // your code: constructor(name, seats) and toll()
}

class Truck extends Vehicle {
  // your code: constructor(name, axles) and toll()
}

class Bike extends Vehicle {}

for (const line of input.trim().split("\\n")) {
  const [type, name, n] = line.split(" ");
  let v;
  if (type === "CAR") v = new Car(name, +n);
  else if (type === "TRUCK") v = new Truck(name, +n);
  else v = new Bike(name);
  console.log(v.describe());
}`,
    solutionCode: `class Vehicle {
  constructor(name) { this.name = name; }
  toll() { return 10; }
  describe() { return \`\${this.constructor.name} \${this.name}: \${this.toll()}\`; }
}

class Car extends Vehicle {
  constructor(name, seats) { super(name); this.seats = seats; }
  toll() { return super.toll() + 2 * this.seats; }
}

class Truck extends Vehicle {
  constructor(name, axles) { super(name); this.axles = axles; }
  toll() { return super.toll() + 15 * this.axles; }
}

class Bike extends Vehicle {}

for (const line of input.trim().split("\\n")) {
  const [type, name, n] = line.split(" ");
  let v;
  if (type === "CAR") v = new Car(name, +n);
  else if (type === "TRUCK") v = new Truck(name, +n);
  else v = new Bike(name);
  console.log(v.describe());
}`,
    tests: [
      { input: `CAR sedan 4
TRUCK hauler 3
BIKE scooter`, expected: `Car sedan: 18
Truck hauler: 55
Bike scooter: 10` },
      { input: `BIKE b`, expected: `Bike b: 10` },
      { input: `CAR mini 2
CAR suv 7`, expected: `Car mini: 14
Car suv: 24` },
      { input: `TRUCK big 6
BIKE x
CAR y 1`, expected: `Truck big: 100
Bike x: 10
Car y: 12` },
    ],
  },
  {
    id: "oop-payments", topic: "O5", title: "Payment Fees (Polymorphism)", difficulty: "Medium", lang: "javascript",
    statement: `Every payment has an \`amount\` and a \`fee()\`; \`total()\` is amount + fee. The base \`Payment\` charges no fee. Override \`fee()\` in \`Card\` (2% of the amount), \`NetBanking\` (flat 10) and leave \`Upi\` free. The loop calls \`total()\` on different payment types without caring which one it is - that is polymorphism.`,
    format: `Each line: \`TYPE amount\` with TYPE = CARD, UPI or NETBANKING. Print the total with 2 decimals.`,
    hint: `\`class Card extends Payment { fee() { return this.amount * 0.02; } }\` - no changes are needed in \`total()\`.`,
    starter: `class Payment {
  constructor(amount) { this.amount = amount; }
  fee() { return 0; }
  total() { return this.amount + this.fee(); }
}

// your code: class Card, class Upi, class NetBanking

const make = { CARD: (a) => new Card(a), UPI: (a) => new Upi(a), NETBANKING: (a) => new NetBanking(a) };
for (const line of input.trim().split("\\n")) {
  const [type, amount] = line.split(" ");
  console.log(make[type](Number(amount)).total().toFixed(2));
}`,
    solutionCode: `class Payment {
  constructor(amount) { this.amount = amount; }
  fee() { return 0; }
  total() { return this.amount + this.fee(); }
}

class Card extends Payment { fee() { return this.amount * 0.02; } }
class Upi extends Payment {}
class NetBanking extends Payment { fee() { return 10; } }

const make = { CARD: (a) => new Card(a), UPI: (a) => new Upi(a), NETBANKING: (a) => new NetBanking(a) };
for (const line of input.trim().split("\\n")) {
  const [type, amount] = line.split(" ");
  console.log(make[type](Number(amount)).total().toFixed(2));
}`,
    tests: [
      { input: `CARD 1000
UPI 500
NETBANKING 250`, expected: `1020.00
500.00
260.00` },
      { input: `CARD 99.5`, expected: `101.49` },
      { input: `UPI 10
UPI 20.25`, expected: `10.00
20.25` },
      { input: `NETBANKING 0
CARD 12.5`, expected: `10.00
12.75` },
    ],
  },
  {
    id: "oop-abstract-shapes", topic: "O6", title: "Abstract Shape", difficulty: "Medium", lang: "javascript",
    statement: `JavaScript has no \`abstract\` keyword, so emulate it. \`Shape\` must not be instantiable: its constructor throws \`Cannot instantiate abstract class Shape\` when \`new.target === Shape\`. Its \`area()\` must throw \`<ClassName> must implement area()\`. Implement \`area()\` in \`Circle\` (π·r²), \`Square\` (s²) and \`Triangle\` (b·h/2). \`main\` prints \`Name: area\` (2 decimals) or the error message.`,
    format: `Each line: \`CIRCLE r\`, \`SQUARE s\`, \`TRIANGLE b h\` or \`SHAPE\`. Print one line per shape.`,
    hint: `In the Shape constructor: \`if (new.target === Shape) throw new Error("Cannot instantiate abstract class Shape");\``,
    starter: `class Shape {
  constructor() {
    // your code: forbid direct instantiation
  }
  area() {
    // your code: abstract method
  }
  name() { return this.constructor.name; }
}

class Circle extends Shape {
  constructor(r) { super(); this.r = r; }
  area() { return 0; } // your code
}
class Square extends Shape {
  constructor(s) { super(); this.s = s; }
  area() { return 0; } // your code
}
class Triangle extends Shape {
  constructor(b, h) { super(); this.b = b; this.h = h; }
  area() { return 0; } // your code
}

function create(line) {
  const [t, a, b] = line.split(" ");
  switch (t) {
    case "CIRCLE": return new Circle(+a);
    case "SQUARE": return new Square(+a);
    case "TRIANGLE": return new Triangle(+a, +b);
    default: return new Shape();
  }
}
for (const line of input.trim().split("\\n")) {
  try {
    const s = create(line);
    console.log(\`\${s.name()}: \${s.area().toFixed(2)}\`);
  } catch (e) {
    console.log(e.message);
  }
}`,
    solutionCode: `class Shape {
  constructor() {
    if (new.target === Shape) throw new Error("Cannot instantiate abstract class Shape");
  }
  area() {
    throw new Error(\`\${this.constructor.name} must implement area()\`);
  }
  name() { return this.constructor.name; }
}

class Circle extends Shape {
  constructor(r) { super(); this.r = r; }
  area() { return Math.PI * this.r * this.r; }
}
class Square extends Shape {
  constructor(s) { super(); this.s = s; }
  area() { return this.s * this.s; }
}
class Triangle extends Shape {
  constructor(b, h) { super(); this.b = b; this.h = h; }
  area() { return (this.b * this.h) / 2; }
}

function create(line) {
  const [t, a, b] = line.split(" ");
  switch (t) {
    case "CIRCLE": return new Circle(+a);
    case "SQUARE": return new Square(+a);
    case "TRIANGLE": return new Triangle(+a, +b);
    default: return new Shape();
  }
}
for (const line of input.trim().split("\\n")) {
  try {
    const s = create(line);
    console.log(\`\${s.name()}: \${s.area().toFixed(2)}\`);
  } catch (e) {
    console.log(e.message);
  }
}`,
    tests: [
      { input: `CIRCLE 2
SQUARE 3
TRIANGLE 4 5
SHAPE`, expected: `Circle: 12.57
Square: 9.00
Triangle: 10.00
Cannot instantiate abstract class Shape` },
      { input: `SHAPE`, expected: `Cannot instantiate abstract class Shape` },
      { input: `SQUARE 1.5
CIRCLE 0.5`, expected: `Square: 2.25
Circle: 0.79` },
      { input: `TRIANGLE 3 8`, expected: `Triangle: 12.00` },
    ],
  },
]);
