# Contributing to Devfluent

Devfluent is an open curriculum. The learning content lives in plain JSON files — you can contribute new blocks, fix typos, or add an entirely new language track, all through a standard GitHub PR.

## How contributions work

1. Fork the repository
2. Edit or add JSON files under `content/curriculum/tracks/`
3. Run `node scripts/validate-curriculum.js` locally — must pass with no errors
4. Open a PR — the CI validator runs automatically
5. A maintainer reviews and merges — merged = live

No admin access needed. No special tooling. Just JSON and a PR.

---

## Track structure

```
content/curriculum/tracks/
  {track-id}/
    meta.json          ← track metadata (required)
    month-01.json      ← month 1 content
    month-02.json
    …
    month-12.json
```

### `meta.json` format

```json
{
  "id": "python",
  "title": "Python Development",
  "description": "12-month path from Python basics to backend and data engineering",
  "language": "Python",
  "level": "beginner",
  "icon": "🐍"
}
```

| Field | Type | Values |
|---|---|---|
| `id` | string | must match directory name |
| `title` | string | displayed in UI |
| `description` | string | short summary |
| `language` | string | e.g. `"Python"`, `"Rust"` |
| `level` | string | `"beginner"` / `"intermediate"` / `"advanced"` |
| `icon` | string | single emoji |

---

## Month file format

Each `month-NN.json` file contains one month of curriculum:

```json
{
  "month": 1,
  "title": "Python Foundations",
  "description": "Variables, data types, control flow, and functions",
  "projectTitle": "CLI Calculator",
  "projectDescription": "Build a command-line calculator with basic arithmetic",
  "alternativeProjects": [
    {
      "title": "Number Guessing Game",
      "description": "A terminal game where the user guesses a random number"
    }
  ],
  "weeks": [
    {
      "week": 1,
      "theme": "Getting Started with Python",
      "blocks": [ ... ]
    }
  ]
}
```

---

## Block format

Each block is a learning unit (30–90 minutes):

```json
{
  "id": "py-m1w1-b1",
  "title": "Variables and Data Types",
  "description": "Integers, floats, strings, booleans — Python's core types",
  "durationMinutes": 45,
  "type": "theory",
  "resources": [
    { "label": "Python docs: Built-in Types", "url": "https://docs.python.org/3/library/stdtypes.html" }
  ],
  "practicalExample": "x = 42\nprint(type(x))  # <class 'int'>",
  "quiz": [ ... ]
}
```

### Block ID convention

| Track | Format | Example |
|---|---|---|
| New tracks | `{track}-m{month}w{week}-b{n}` | `py-m1w1-b1` |
| JavaScript (legacy) | `m{month}w{week}-b{n}` | `m1w1-b1` |

IDs must be **unique across the entire curriculum**. The CI validator checks for duplicates.

### Block types

| Type | When to use |
|---|---|
| `theory` | Concepts to read/watch |
| `practice` | Hands-on coding exercise |
| `project` | Mini-project to build |
| `review` | Summary / spaced repetition |

---

## Quiz format

Quizzes are optional but encouraged. Each quiz has 3–5 questions:

```json
"quiz": [
  {
    "question": "What does `len([1, 2, 3])` return?",
    "options": ["1", "2", "3", "4"],
    "correctIndex": 2,
    "explanation": "len() returns the number of items in the list, which is 3."
  }
]
```

- `options`: exactly **4** strings
- `correctIndex`: integer **0–3** (index of the correct option)
- `explanation`: shown after the user answers — explain *why*, not just what

---

## Exercises format

Exercises add live, runnable coding challenges to the **Practice** tab in `/training`. They appear alongside (not instead of) the quiz.

Each block can have an optional `exercises` array:

```json
"exercises": [
  {
    "id": "unique-exercise-id",
    "title": "Short display title",
    "description": "The exercise prompt shown to the learner. Markdown supported.\n\nExample: `myFunc('hello')` → `5`",
    "starterCode": "function myFunc(str) {\n  // your code here\n}",
    "solution": "function myFunc(str) {\n  return str.length\n}",
    "hints": [
      "Optional: one hint per string",
      "Hints are revealed on demand — don't spoil the solution"
    ],
    "tests": [
      {
        "description": "Returns length of 'hello' → 5",
        "code": "myFunc('hello') === 5"
      },
      {
        "description": "Returns 0 for empty string",
        "code": "myFunc('') === 0"
      }
    ]
  }
]
```

### Exercise field reference

| Field | Required | Notes |
|---|---|---|
| `id` | yes | Unique within the block; kebab-case |
| `title` | yes | Short label shown in the exercise list |
| `description` | yes | The prompt — plain text or markdown, shown above the editor |
| `starterCode` | yes | Code pre-loaded in the editor |
| `solution` | yes | Revealed when the learner clicks "Show solution" |
| `tests` | yes | Array of `{ description, code }` — see below |
| `hints` | no | Array of hint strings, shown one by one |

### Writing test cases

Each test's `code` field is a **JavaScript expression that evaluates to `true` or `false`**. It runs in the same scope as the learner's code, so you can call any function they define:

```json
{ "description": "myFunc('hello') returns 5", "code": "myFunc('hello') === 5" }
```

The sandbox has access to the full browser DOM API (`document.createElement`, etc.), so DOM exercises work too:

```json
{ "description": "Returns a DIV element", "code": "buildCard().tagName === 'DIV'" }
```

**Guidelines:**
- Write 2–4 tests per exercise — enough to verify correctness, not exhaustive
- Test descriptions should read as facts: *"Returns 5 for 'hello'"*, not *"test 1"*
- Test code must not rely on `console.log` or side effects — only the return value / property of the result matters
- Exercises are optional — adding one good exercise per block is better than many mediocre ones

---

## Adding a new language track

1. Create a directory: `content/curriculum/tracks/{your-track}/`
2. Add `meta.json` (see format above)
3. Add at least `month-01.json` — even a stub is fine to start
4. Use the ID prefix `{your-track}-` for all block IDs
5. Open a PR — describe the track in the PR description

Community members can then build out the remaining months via follow-up PRs.

---

## Local setup

```bash
# Clone and install
git clone https://github.com/e-pallad/adhs-learning.git
cd adhs-learning
npm install

# Validate your changes
node scripts/validate-curriculum.js

# Run the dev server to preview
npm run dev
```

The app picks up JSON changes immediately on `npm run dev` — no rebuild needed.

---

## Questions?

Open an issue or start a discussion on GitHub. We're happy to help.
