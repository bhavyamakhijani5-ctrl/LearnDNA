/* MODULE 6 -- Code Practice: C course challenges, in roadmap order.
   Expected outputs were produced by running the model solution in a real compiler/interpreter. */
registerChallenges("C", [
  {
    id: "c-temperature-table", topic: "C1", title: "Temperature Table", difficulty: "Easy", lang: "c",
    statement: `Print a Celsius to Fahrenheit table. For every Celsius value from \`start\` to \`end\` (inclusive, moving by \`step\`) print \`C F\` where F = C * 9 / 5 + 32 with exactly one decimal. Practise \`scanf\`, \`printf\`, data types and format specifiers.`,
    format: `One line: \`start end step\` (integers, step > 0). Print one \`C F\` line per value, e.g. \`20 68.0\`.`,
    hint: `Use a double for F: \`c * 9.0 / 5 + 32\`, and print it with \`%.1f\`. Integer division would lose the fraction.`,
    starter: `#include <stdio.h>

int main() {
    int start, end, step;
    scanf("%d %d %d", &start, &end, &step);
    // your code: print "C F" for each Celsius value from start to end
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int start, end, step;
    scanf("%d %d %d", &start, &end, &step);
    for (int c = start; c <= end; c += step) {
        double f = c * 9.0 / 5 + 32;
        printf("%d %.1f\\n", c, f);
    }
    return 0;
}`,
    tests: [
      { input: `0 100 20`, expected: `0 32.0
20 68.0
40 104.0
60 140.0
80 176.0
100 212.0` },
      { input: `-10 10 10`, expected: `-10 14.0
0 32.0
10 50.0` },
      { input: `37 37 1`, expected: `37 98.6` },
      { input: `30 45 5`, expected: `30 86.0
35 95.0
40 104.0
45 113.0` },
    ],
  },
  {
    id: "c-fizzbuzz", topic: "C2", title: "FizzBuzz", difficulty: "Easy", lang: "c",
    statement: `For every number from 1 to n print \`FizzBuzz\` if it is divisible by both 3 and 5, \`Fizz\` if divisible by 3, \`Buzz\` if divisible by 5, otherwise the number itself. Uses loops and \`if / else if\`.`,
    format: `One line: n. Print n lines.`,
    hint: `Check the "both" case (divisible by 15) first, otherwise it would print only Fizz.`,
    starter: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        // your code
    }
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        if (i % 15 == 0) printf("FizzBuzz\\n");
        else if (i % 3 == 0) printf("Fizz\\n");
        else if (i % 5 == 0) printf("Buzz\\n");
        else printf("%d\\n", i);
    }
    return 0;
}`,
    tests: [
      { input: `5`, expected: `1
2
Fizz
4
Buzz` },
      { input: `15`, expected: `1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz` },
      { input: `1`, expected: `1` },
      { input: `20`, expected: `1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz
16
17
Fizz
19
Buzz` },
    ],
  },
  {
    id: "c-gcd-lcm", topic: "C3", title: "GCD and LCM with Functions", difficulty: "Easy", lang: "c",
    statement: `Write the function \`gcd(a, b)\` (Euclid's algorithm). \`main\` uses it to compute the LCM as \`a / gcd * b\` and prints \`gcd lcm\`.`,
    format: `One line: \`a b\` (positive integers). Print \`gcd lcm\`.`,
    hint: `Euclid: while b is not 0, replace (a, b) by (b, a % b). The answer is a.`,
    starter: `#include <stdio.h>

int gcd(int a, int b) {
    // your code
    return 1;
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    int g = gcd(a, b);
    long long l = (long long)(a / g) * b;
    printf("%d %lld\\n", g, l);
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int gcd(int a, int b) {
    while (b != 0) {
        int t = a % b;
        a = b;
        b = t;
    }
    return a;
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    int g = gcd(a, b);
    long long l = (long long)(a / g) * b;
    printf("%d %lld\\n", g, l);
    return 0;
}`,
    tests: [
      { input: `12 18`, expected: `6 36` },
      { input: `7 13`, expected: `1 91` },
      { input: `100 75`, expected: `25 300` },
      { input: `48 180`, expected: `12 720` },
      { input: `1 1`, expected: `1 1` },
    ],
  },
  {
    id: "c-reverse-vowels", topic: "C4", title: "Reverse a String and Count Vowels", difficulty: "Medium", lang: "c",
    statement: `Read a line of text. Print the line reversed, then on the next line print the number of vowels (a, e, i, o, u - upper or lower case). Practise character arrays, \`fgets\`, \`strlen\` and indexing.`,
    format: `One line of text (may contain spaces). Print the reversed text, then the vowel count.`,
    hint: `\`fgets\` keeps the newline - remove it first. Reverse with two indices i and j moving towards each other, swapping characters.`,
    starter: `#include <stdio.h>
#include <string.h>
#include <ctype.h>

int main() {
    char s[256];
    if (!fgets(s, sizeof s, stdin)) return 0;
    s[strcspn(s, "\\r\\n")] = '\\0';
    int n = strlen(s);
    int vowels = 0;
    // your code: count the vowels and reverse s in place
    printf("%s\\n%d\\n", s, vowels);
    return 0;
}`,
    solutionCode: `#include <stdio.h>
#include <string.h>
#include <ctype.h>

int main() {
    char s[256];
    if (!fgets(s, sizeof s, stdin)) return 0;
    s[strcspn(s, "\\r\\n")] = '\\0';
    int n = strlen(s);
    int vowels = 0;
    for (int i = 0; i < n; i++) {
        char c = tolower((unsigned char)s[i]);
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') vowels++;
    }
    for (int i = 0, j = n - 1; i < j; i++, j--) {
        char t = s[i]; s[i] = s[j]; s[j] = t;
    }
    printf("%s\\n%d\\n", s, vowels);
    return 0;
}`,
    tests: [
      { input: `hello world`, expected: `dlrow olleh
3` },
      { input: `Programming in C`, expected: `C ni gnimmargorP
4` },
      { input: `AEIOU aeiou`, expected: `uoiea UOIEA
10` },
      { input: `xyz`, expected: `zyx
0` },
    ],
  },
  {
    id: "c-pointer-stats", topic: "C5", title: "Min, Max and Sum with Pointers", difficulty: "Medium", lang: "c",
    statement: `Implement \`stats(a, n, mn, mx, sum)\`. It receives an array and writes the minimum, maximum and sum through the pointers \`mn\`, \`mx\` and \`sum\`. Use pointer dereferencing (\`*mn = ...\`) - this is how C functions return several values.`,
    format: `Line 1: n. Line 2: n integers. Print \`min max sum\`.`,
    hint: `Initialise \`*mn = *mx = a[0]\` and \`*sum = 0\`, then loop over the array updating through the pointers.`,
    starter: `#include <stdio.h>

void stats(int *a, int n, int *mn, int *mx, int *sum) {
    // your code
}

int main() {
    int n;
    scanf("%d", &n);
    int a[100];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int mn = 0, mx = 0, sum = 0;
    stats(a, n, &mn, &mx, &sum);
    printf("%d %d %d\\n", mn, mx, sum);
    return 0;
}`,
    solutionCode: `#include <stdio.h>

void stats(int *a, int n, int *mn, int *mx, int *sum) {
    *mn = *mx = a[0];
    *sum = 0;
    for (int i = 0; i < n; i++) {
        if (*(a + i) < *mn) *mn = *(a + i);
        if (*(a + i) > *mx) *mx = *(a + i);
        *sum += *(a + i);
    }
}

int main() {
    int n;
    scanf("%d", &n);
    int a[100];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int mn = 0, mx = 0, sum = 0;
    stats(a, n, &mn, &mx, &sum);
    printf("%d %d %d\\n", mn, mx, sum);
    return 0;
}`,
    tests: [
      { input: `5
3 9 -2 7 4`, expected: `-2 9 21` },
      { input: `1
10`, expected: `10 10 10` },
      { input: `4
5 5 5 5`, expected: `5 5 20` },
      { input: `6
-1 -5 -3 -9 -2 -7`, expected: `-9 -1 -27` },
    ],
  },
  {
    id: "c-student-records", topic: "C6", title: "Student Records with struct", difficulty: "Medium", lang: "c",
    statement: `Store students in an array of \`struct Student\`. Print the topper (highest marks, the first one in case of a tie) and the class average with 2 decimals.`,
    format: `Line 1: n. Then n lines \`name marks\` (name has no spaces). Print \`Topper: name (marks)\` and \`Average: x.xx\`.`,
    hint: `Keep the index of the best student while looping; add all marks into a double sum and divide by n.`,
    starter: `#include <stdio.h>

struct Student {
    char name[50];
    int marks;
};

int main() {
    int n;
    scanf("%d", &n);
    struct Student s[100];
    for (int i = 0; i < n; i++) scanf("%49s %d", s[i].name, &s[i].marks);
    int best = 0;
    double sum = 0;
    // your code: find the topper index and the sum of marks
    printf("Topper: %s (%d)\\n", s[best].name, s[best].marks);
    printf("Average: %.2f\\n", sum / n);
    return 0;
}`,
    solutionCode: `#include <stdio.h>

struct Student {
    char name[50];
    int marks;
};

int main() {
    int n;
    scanf("%d", &n);
    struct Student s[100];
    for (int i = 0; i < n; i++) scanf("%49s %d", s[i].name, &s[i].marks);
    int best = 0;
    double sum = 0;
    for (int i = 0; i < n; i++) {
        sum += s[i].marks;
        if (s[i].marks > s[best].marks) best = i;
    }
    printf("Topper: %s (%d)\\n", s[best].name, s[best].marks);
    printf("Average: %.2f\\n", sum / n);
    return 0;
}`,
    tests: [
      { input: `3
Asha 85
Ravi 92
Meena 78`, expected: `Topper: Ravi (92)
Average: 85.00` },
      { input: `1
Solo 50`, expected: `Topper: Solo (50)
Average: 50.00` },
      { input: `4
A 70
B 90
C 90
D 60`, expected: `Topper: B (90)
Average: 77.50` },
      { input: `2
Zoya 100
Yash 99`, expected: `Topper: Zoya (100)
Average: 99.50` },
    ],
  },
  {
    id: "c-file-numbers", topic: "C7", title: "Write and Read a File", difficulty: "Medium", lang: "c",
    statement: `Read n numbers from the keyboard and write them (one per line) to the file \`nums.txt\` with \`fopen(..., "w")\`. Close it, open it again with \`"r"\`, read the numbers back with \`fscanf\` and print their count, sum and maximum. Always check that \`fopen\` did not return NULL and always \`fclose\`.`,
    format: `Line 1: n. Line 2: n integers. Print \`Count: c\`, \`Sum: s\`, \`Max: m\` on three lines.`,
    hint: `Loop \`while (fscanf(f, "%d", &x) == 1)\` to read until the end of the file.`,
    starter: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    FILE *f = fopen("nums.txt", "w");
    if (!f) return 1;
    for (int i = 0; i < n; i++) {
        int x;
        scanf("%d", &x);
        // your code: write x to the file
    }
    fclose(f);

    f = fopen("nums.txt", "r");
    if (!f) return 1;
    int count = 0, sum = 0, max = 0, x;
    // your code: read every number back; update count, sum and max
    fclose(f);
    printf("Count: %d\\nSum: %d\\nMax: %d\\n", count, sum, max);
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    FILE *f = fopen("nums.txt", "w");
    if (!f) return 1;
    for (int i = 0; i < n; i++) {
        int x;
        scanf("%d", &x);
        fprintf(f, "%d\\n", x);
    }
    fclose(f);

    f = fopen("nums.txt", "r");
    if (!f) return 1;
    int count = 0, sum = 0, max = 0, x;
    while (fscanf(f, "%d", &x) == 1) {
        if (count == 0 || x > max) max = x;
        sum += x;
        count++;
    }
    fclose(f);
    printf("Count: %d\\nSum: %d\\nMax: %d\\n", count, sum, max);
    return 0;
}`,
    tests: [
      { input: `5
4 8 15 16 23`, expected: `Count: 5
Sum: 66
Max: 23` },
      { input: `1
-7`, expected: `Count: 1
Sum: -7
Max: -7` },
      { input: `3
100 200 300`, expected: `Count: 3
Sum: 600
Max: 300` },
      { input: `4
-5 -2 -9 -1`, expected: `Count: 4
Sum: -17
Max: -1` },
    ],
  },
]);
