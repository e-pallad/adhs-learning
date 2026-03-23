// Devfluent curriculum — 12 months, weekly granularity
// Each block has a stable ID used for progress tracking

export interface LearningBlock {
  id: string
  title: string
  description: string
  durationMinutes: number
  type: "theory" | "practice" | "project" | "review"
  resources?: { label: string; url: string }[]
}

export interface Week {
  week: number
  theme: string
  blocks: LearningBlock[]
}

export interface AlternativeProject {
  title: string
  description: string
}

export interface Month {
  month: number
  title: string
  description: string
  projectTitle: string
  projectDescription: string
  alternativeProjects: AlternativeProject[]
  weeks: Week[]
}

export const CURRICULUM: Month[] = [
  // ── Month 1: Web Foundations ──────────────────────────────────────────────
  {
    month: 1,
    title: "Web Foundations",
    description: "HTML, CSS basics, and how the internet works",
    projectTitle: "Personal Portfolio Page",
    projectDescription: "Build a single-page portfolio with semantic HTML and CSS — no frameworks",
    alternativeProjects: [
      {
        title: "Landing Page Clone",
        description: "Pick any popular website and recreate its landing page with HTML and CSS only — focus on layout fidelity and semantic markup",
      },
      {
        title: "Recipe Card Collection",
        description: "A static multi-page site with recipe cards using CSS Grid and Flexbox, including a print stylesheet",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "How the Internet Works",
        blocks: [
          { id: "m1w1-b1", title: "HTTP & DNS", description: "How browsers fetch pages, what DNS resolves, request/response cycle", durationMinutes: 45, type: "theory" },
          { id: "m1w1-b2", title: "Browser DevTools", description: "Network tab, Elements panel, Console — your daily tools", durationMinutes: 30, type: "practice" },
          { id: "m1w1-b3", title: "HTML Document Structure", description: "DOCTYPE, head, body, semantic tags (header, main, footer)", durationMinutes: 45, type: "theory" },
        ],
      },
      {
        week: 2,
        theme: "HTML Deep Dive",
        blocks: [
          { id: "m1w2-b1", title: "Semantic HTML", description: "nav, article, section, aside — what they mean and why it matters", durationMinutes: 45, type: "theory" },
          { id: "m1w2-b2", title: "Forms & Inputs", description: "input types, labels, validation attributes, accessibility basics — aria-label, required, fieldset", durationMinutes: 60, type: "practice" },
          { id: "m1w2-b3", title: "SEO Fundamentals", description: "meta tags, Open Graph, title and description best practices", durationMinutes: 30, type: "theory" },
        ],
      },
      {
        week: 3,
        theme: "CSS Foundations",
        blocks: [
          { id: "m1w3-b1", title: "The Box Model", description: "margin, padding, border, content — understanding layout math", durationMinutes: 45, type: "theory" },
          { id: "m1w3-b2", title: "Selectors & Specificity", description: "class, id, pseudo-selectors, how specificity is calculated", durationMinutes: 45, type: "practice" },
          { id: "m1w3-b3", title: "Flexbox", description: "flex container, flex items, alignment and spacing patterns", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 4,
        theme: "Responsive CSS, Animations & Project",
        blocks: [
          { id: "m1w4-b1", title: "CSS Grid & Responsive Design", description: "grid-template-columns, areas, auto-fill; media queries, mobile-first, viewport units, fluid typography", durationMinutes: 75, type: "practice" },
          { id: "m1w4-b2", title: "CSS Animations & Transitions", description: "transition, animation, @keyframes, transform — building hover effects and micro-interactions", durationMinutes: 45, type: "practice" },
          { id: "m1w4-b3", title: "Portfolio Project", description: "Build your personal portfolio page — HTML + CSS, no framework, include at least one animated element", durationMinutes: 120, type: "project" },
        ],
      },
    ],
  },

  // ── Month 2: JavaScript Fundamentals ─────────────────────────────────────
  {
    month: 2,
    title: "JavaScript Fundamentals",
    description: "Core JS: variables, functions, DOM, async basics — plus Git from day one",
    projectTitle: "Interactive To-Do App",
    projectDescription: "A to-do list with add/remove/complete — vanilla JS, no libraries, tracked in Git",
    alternativeProjects: [
      {
        title: "Quiz Game",
        description: "Multiple-choice quiz with a timer, score tracking, and a results screen — all vanilla JS with DOM manipulation",
      },
      {
        title: "Weather Dashboard",
        description: "Fetch from the Open-Meteo API and display current conditions and a 5-day forecast with animated weather icons",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "Git & JS Basics",
        blocks: [
          { id: "m2w1-b1", title: "Git Basics", description: "init, add, commit, status, log — set up version control before writing a single line of JS", durationMinutes: 45, type: "practice" },
          { id: "m2w1-b2", title: "Variables & Data Types", description: "let, const, var — primitives, objects, arrays, typeof", durationMinutes: 45, type: "theory" },
          { id: "m2w1-b3", title: "Functions & Scope", description: "declaration vs expression, arrow functions, closures, hoisting", durationMinutes: 60, type: "theory" },
        ],
      },
      {
        week: 2,
        theme: "Arrays, DOM & Events",
        blocks: [
          { id: "m2w2-b1", title: "Arrays & Objects", description: "map, filter, reduce, spread, destructuring — modern patterns", durationMinutes: 60, type: "practice" },
          { id: "m2w2-b2", title: "DOM API", description: "querySelector, createElement, appendChild, innerHTML vs textContent", durationMinutes: 45, type: "theory" },
          { id: "m2w2-b3", title: "Events", description: "addEventListener, event delegation, preventDefault, bubbling", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 3,
        theme: "Async JavaScript",
        blocks: [
          { id: "m2w3-b1", title: "Callbacks & the Event Loop", description: "call stack, web APIs, task queue — how async JS actually works", durationMinutes: 60, type: "theory" },
          { id: "m2w3-b2", title: "Promises & async/await", description: "promise chaining, async/await, error handling with try/catch", durationMinutes: 60, type: "practice" },
          { id: "m2w3-b3", title: "Fetch API", description: "GET and POST requests, JSON parsing, error states", durationMinutes: 45, type: "practice" },
        ],
      },
      {
        week: 4,
        theme: "Modern JS & Project",
        blocks: [
          { id: "m2w4-b1", title: "Forms & Validation", description: "reading form values, custom validation, FormData API", durationMinutes: 45, type: "practice" },
          { id: "m2w4-b2", title: "ES Modules & Browser Storage", description: "import/export, default vs named, module bundler concepts; localStorage, sessionStorage, cookies — when to use each", durationMinutes: 45, type: "theory" },
          { id: "m2w4-b3", title: "To-Do App Project", description: "Build an interactive to-do list with vanilla JS — CRUD operations, localStorage persistence, committed to a Git repo", durationMinutes: 120, type: "project" },
        ],
      },
    ],
  },

  // ── Month 3: TypeScript & Tooling ─────────────────────────────────────────
  {
    month: 3,
    title: "TypeScript & Tooling",
    description: "TypeScript, advanced Git, Node.js runtime, npm/bun, ESLint, Prettier",
    projectTitle: "TypeScript CLI Quiz App",
    projectDescription: "A command-line quiz that reads questions from JSON — typed with TypeScript",
    alternativeProjects: [
      {
        title: "Markdown Parser CLI",
        description: "Read .md files and output structured JSON representing headings, links, and code blocks — fully typed with TypeScript",
      },
      {
        title: "Budget Calculator CLI",
        description: "An interactive REPL for tracking income and expenses with file-based persistence and typed data models",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "Advanced Git & Node.js Runtime",
        blocks: [
          { id: "m3w1-b1", title: "Branching & Merging", description: "branch, checkout, merge, rebase — when to use each; resolving conflicts", durationMinutes: 60, type: "practice" },
          { id: "m3w1-b2", title: "GitHub Workflow", description: "push, pull, fork, PR, code review — team collaboration basics", durationMinutes: 45, type: "theory" },
          { id: "m3w1-b3", title: "Node.js Runtime", description: "event loop, CommonJS vs ESM modules, streams overview — how Next.js uses Node under the hood", durationMinutes: 45, type: "theory" },
        ],
      },
      {
        week: 2,
        theme: "TypeScript Basics",
        blocks: [
          { id: "m3w2-b1", title: "Types & Interfaces", description: "primitive types, union, intersection, interface vs type", durationMinutes: 60, type: "theory" },
          { id: "m3w2-b2", title: "Generics", description: "generic functions, generic interfaces, utility types (Partial, Pick)", durationMinutes: 60, type: "practice" },
          { id: "m3w2-b3", title: "TypeScript Config", description: "tsconfig.json, strict mode, module resolution, path aliases", durationMinutes: 30, type: "theory" },
        ],
      },
      {
        week: 3,
        theme: "Tooling",
        blocks: [
          { id: "m3w3-b1", title: "Package Managers", description: "npm, bun — packages, scripts, semantic versioning, lock files", durationMinutes: 30, type: "theory" },
          { id: "m3w3-b2", title: "ESLint & Prettier", description: "linting rules, auto-format on save, shared configs", durationMinutes: 30, type: "practice" },
          { id: "m3w3-b3", title: "Vite & Bundlers", description: "what bundlers do, Vite config, dev vs prod builds", durationMinutes: 45, type: "theory" },
        ],
      },
      {
        week: 4,
        theme: "Project",
        blocks: [
          { id: "m3w4-b1", title: "TypeScript Advanced Patterns", description: "discriminated unions, type guards, as const, satisfies", durationMinutes: 60, type: "theory" },
          { id: "m3w4-b2", title: "CLI Quiz Project", description: "Build a typed CLI quiz app — file I/O, JSON schema, TypeScript strict", durationMinutes: 120, type: "project" },
          { id: "m3w4-b3", title: "Month 3 Review", description: "Revisit gaps, fill in any skipped blocks", durationMinutes: 45, type: "review" },
        ],
      },
    ],
  },

  // ── Month 4: React Fundamentals ───────────────────────────────────────────
  {
    month: 4,
    title: "React Fundamentals",
    description: "Components, hooks, state, props, state management, and a testing first look",
    projectTitle: "Recipe App",
    projectDescription: "A recipe browser with filtering — React + TypeScript, no framework",
    alternativeProjects: [
      {
        title: "Habit Tracker",
        description: "Mark daily habits, visualize streaks, persist to localStorage — Context API for global state and Zustand for comparison",
      },
      {
        title: "Movie Search App",
        description: "Search the TMDB API, display results with filtering, and save favourites — demonstrates Context, custom hooks, and async data",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "React Core Concepts",
        blocks: [
          { id: "m4w1-b1", title: "JSX & Components", description: "JSX syntax, functional components, props, children", durationMinutes: 60, type: "theory" },
          { id: "m4w1-b2", title: "useState & Events", description: "useState hook, event handlers, controlled vs uncontrolled inputs", durationMinutes: 60, type: "practice" },
          { id: "m4w1-b3", title: "Lists & Conditional Rendering", description: "map with keys, ternary patterns, short-circuit rendering", durationMinutes: 45, type: "practice" },
        ],
      },
      {
        week: 2,
        theme: "React Hooks",
        blocks: [
          { id: "m4w2-b1", title: "useEffect", description: "side effects, dependency array, cleanup functions", durationMinutes: 60, type: "theory" },
          { id: "m4w2-b2", title: "useRef & useMemo", description: "DOM refs, persisting values, memoizing expensive computations", durationMinutes: 45, type: "practice" },
          { id: "m4w2-b3", title: "Custom Hooks", description: "extracting logic into reusable hooks, useFetch pattern", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 3,
        theme: "State Management",
        blocks: [
          { id: "m4w3-b1", title: "Context API", description: "createContext, useContext, avoiding prop drilling", durationMinutes: 60, type: "theory" },
          { id: "m4w3-b2", title: "useReducer", description: "reducer pattern, actions, when to prefer over useState", durationMinutes: 60, type: "practice" },
          { id: "m4w3-b3", title: "External State Management — Zustand", description: "when Context isn't enough; Zustand store, slices, devtools — compare with Context for different scales", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 4,
        theme: "Project & Testing First Look",
        blocks: [
          { id: "m4w4-b1", title: "React Performance", description: "memo, useCallback, profiler — avoiding unnecessary re-renders", durationMinutes: 45, type: "theory" },
          { id: "m4w4-b2", title: "Recipe App Project", description: "Build a recipe browser with search/filter — React + TypeScript", durationMinutes: 120, type: "project" },
          { id: "m4w4-b3", title: "Testing First Look", description: "Why test, what to test — write your first Vitest unit test and one React Testing Library smoke test for the Recipe App", durationMinutes: 45, type: "practice" },
        ],
      },
    ],
  },

  // ── Month 5: Next.js & Full-Stack Basics ──────────────────────────────────
  {
    month: 5,
    title: "Next.js & Full-Stack Basics",
    description: "App Router, Server Components, data fetching, API routes",
    projectTitle: "Public Blog",
    projectDescription: "A statically generated blog with MDX posts and dynamic routes",
    alternativeProjects: [
      {
        title: "Developer Portfolio v2",
        description: "Rebuild your Month 1 portfolio as a Next.js static site with MDX project case studies, animated page transitions, and a working contact form via Route Handlers",
      },
      {
        title: "Link-in-Bio Page",
        description: "A styled link aggregator with analytics tracking — page views stored via a Route Handler and displayed on an admin dashboard",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "Next.js App Router",
        blocks: [
          { id: "m5w1-b1", title: "App Router Concepts", description: "file-based routing, layouts, pages, loading/error files", durationMinutes: 60, type: "theory" },
          { id: "m5w1-b2", title: "Server vs Client Components", description: "when to use each, the client boundary, serialization rules", durationMinutes: 60, type: "theory" },
          { id: "m5w1-b3", title: "Dynamic Routes", description: "params, generateStaticParams, catch-all segments", durationMinutes: 45, type: "practice" },
        ],
      },
      {
        week: 2,
        theme: "Data Fetching",
        blocks: [
          { id: "m5w2-b1", title: "Async Server Components", description: "fetch in components, caching, revalidation strategies", durationMinutes: 60, type: "theory" },
          { id: "m5w2-b2", title: "Route Handlers", description: "GET/POST API routes, NextRequest/NextResponse, middleware", durationMinutes: 60, type: "practice" },
          { id: "m5w2-b3", title: "Server Actions", description: "form actions, mutation patterns, optimistic updates", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 3,
        theme: "Styling & Auth",
        blocks: [
          { id: "m5w3-b1", title: "CSS Modules & Styling Approaches", description: "CSS Modules vs CSS-in-JS (styled-components/emotion) vs Tailwind — trade-offs, DX, bundle impact; how Tailwind v4 JIT works and when to reach for each approach", durationMinutes: 60, type: "theory" },
          { id: "m5w3-b2", title: "Authentication Concepts", description: "sessions, JWTs, cookies, OAuth flow overview", durationMinutes: 45, type: "theory" },
          { id: "m5w3-b3", title: "Supabase Auth", description: "magic link, session management, SSR client setup", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 4,
        theme: "Project",
        blocks: [
          { id: "m5w4-b1", title: "MDX & Content", description: "next-mdx-remote, frontmatter, code highlighting", durationMinutes: 45, type: "practice" },
          { id: "m5w4-b2", title: "Blog Project", description: "Build a public blog with MDX posts, tags, and dynamic routes", durationMinutes: 120, type: "project" },
          { id: "m5w4-b3", title: "Month 5 Review", description: "Revisit gaps, fill in any skipped blocks", durationMinutes: 45, type: "review" },
        ],
      },
    ],
  },

  // ── Month 6: Databases & APIs ─────────────────────────────────────────────
  {
    month: 6,
    title: "Databases & APIs",
    description: "PostgreSQL, Prisma ORM, REST design, Supabase",
    projectTitle: "Expense Tracker API",
    projectDescription: "Full CRUD REST API with PostgreSQL, Prisma, auth-protected routes",
    alternativeProjects: [
      {
        title: "Bookmark Manager API",
        description: "CRUD API for saving, tagging, and full-text searching URLs — user-scoped with Supabase auth and Zod-validated inputs",
      },
      {
        title: "Recipe Database",
        description: "Store, search, and rate recipes — full REST API with auth, paginated queries, and Prisma relations between recipes, ingredients, and tags",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "PostgreSQL & SQL",
        blocks: [
          { id: "m6w1-b1", title: "Relational Database Concepts", description: "tables, rows, primary keys, foreign keys, normalization", durationMinutes: 60, type: "theory" },
          { id: "m6w1-b2", title: "SQL Queries", description: "SELECT, WHERE, JOIN, GROUP BY, ORDER BY — practical queries", durationMinutes: 60, type: "practice" },
          { id: "m6w1-b3", title: "Indexes & Performance", description: "what indexes are, when to add them, EXPLAIN ANALYZE", durationMinutes: 45, type: "theory" },
        ],
      },
      {
        week: 2,
        theme: "Prisma ORM",
        blocks: [
          { id: "m6w2-b1", title: "Prisma Schema", description: "models, relations, enums, migrations, prisma generate", durationMinutes: 60, type: "practice" },
          { id: "m6w2-b2", title: "Prisma Client Queries", description: "findMany, create, update, upsert, delete, transactions", durationMinutes: 60, type: "practice" },
          { id: "m6w2-b3", title: "Supabase as Database Host", description: "connection strings, row-level security, Supabase dashboard", durationMinutes: 45, type: "practice" },
        ],
      },
      {
        week: 3,
        theme: "REST API Design",
        blocks: [
          { id: "m6w3-b1", title: "REST Principles", description: "resources, HTTP verbs, status codes, idempotency", durationMinutes: 45, type: "theory" },
          { id: "m6w3-b2", title: "Input Validation", description: "Zod schemas, error messages, type-safe API boundaries", durationMinutes: 60, type: "practice" },
          { id: "m6w3-b3", title: "Auth Middleware", description: "protecting routes with JWT, role checks, RLS policies", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 4,
        theme: "Project",
        blocks: [
          { id: "m6w4-b1", title: "Error Handling Patterns", description: "global error handlers, typed errors, API error envelopes", durationMinutes: 45, type: "theory" },
          { id: "m6w4-b2", title: "Expense Tracker API Project", description: "Full CRUD API — categories, transactions, auth, validation", durationMinutes: 120, type: "project" },
          { id: "m6w4-b3", title: "Month 6 Review", description: "Revisit gaps, fill in any skipped blocks", durationMinutes: 45, type: "review" },
        ],
      },
    ],
  },

  // ── Month 7: Advanced React & Patterns ───────────────────────────────────
  {
    month: 7,
    title: "Advanced React & Patterns",
    description: "Advanced hooks, forms, data tables, component composition, accessibility",
    projectTitle: "Admin Dashboard",
    projectDescription: "An admin panel with a data table, filters, modals, form validation, and full keyboard accessibility",
    alternativeProjects: [
      {
        title: "SaaS Settings Panel",
        description: "User profile, mock billing plan, team member management, and notification preferences — complex multi-step forms with React Hook Form and Zod",
      },
      {
        title: "Issue Tracker",
        description: "A GitHub Issues-inspired mini app with filters, labels, status board, and drag-to-reorder — focus on compound components and accessible interactions",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "Advanced Patterns",
        blocks: [
          { id: "m7w1-b1", title: "Advanced Custom Hooks", description: "useDebounce, useLocalStorage, useIntersectionObserver", durationMinutes: 60, type: "practice" },
          { id: "m7w1-b2", title: "Error Boundaries", description: "class-based error boundaries, react-error-boundary library", durationMinutes: 45, type: "practice" },
          { id: "m7w1-b3", title: "Component Composition", description: "compound components, render props, slot patterns — building flexible, reusable UI primitives", durationMinutes: 45, type: "theory" },
        ],
      },
      {
        week: 2,
        theme: "Forms",
        blocks: [
          { id: "m7w2-b1", title: "React Hook Form", description: "register, handleSubmit, errors, validation with Zod", durationMinutes: 60, type: "practice" },
          { id: "m7w2-b2", title: "Complex Form Patterns", description: "field arrays, conditional fields, multi-step forms", durationMinutes: 60, type: "practice" },
          { id: "m7w2-b3", title: "Optimistic UI", description: "optimistic updates, rollback on error, useOptimistic hook", durationMinutes: 45, type: "theory" },
        ],
      },
      {
        week: 3,
        theme: "Accessibility",
        blocks: [
          { id: "m7w3-b1", title: "TanStack Query", description: "useQuery, useMutation, cache invalidation, stale-while-revalidate", durationMinutes: 60, type: "practice" },
          { id: "m7w3-b2", title: "A11y Fundamentals", description: "WCAG 2.1 AA, ARIA roles and properties, semantic landmarks, colour contrast — what the spec actually requires", durationMinutes: 60, type: "theory" },
          { id: "m7w3-b3", title: "A11y in Practice", description: "keyboard navigation, focus traps in modals, skip links, axe DevTools audit — make an existing component fully accessible", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 4,
        theme: "Project",
        blocks: [
          { id: "m7w4-b1", title: "Data Tables & Component Library", description: "TanStack Table — sorting, filtering, pagination; Shadcn/ui and Radix primitives, theming with CSS variables", durationMinutes: 60, type: "practice" },
          { id: "m7w4-b2", title: "Admin Dashboard Project", description: "Data table with sorting/filtering, modal forms, dashboard stats — pass an axe audit before submitting", durationMinutes: 120, type: "project" },
          { id: "m7w4-b3", title: "Month 7 Review", description: "Revisit gaps, fill in any skipped blocks", durationMinutes: 45, type: "review" },
        ],
      },
    ],
  },

  // ── Month 8: DevOps & Deployment ──────────────────────────────────────────
  {
    month: 8,
    title: "DevOps & Deployment",
    description: "CI/CD, Docker, Vercel, monitoring, environment management",
    projectTitle: "Production-Ready Deployment",
    projectDescription: "Deploy your Month 6 API with Docker, CI/CD pipeline, and monitoring",
    alternativeProjects: [
      {
        title: "Multi-Environment CI/CD",
        description: "Set up dev, staging, and production deployments for a previous project — automated tests gate merges and Vercel preview URLs appear on every PR",
      },
      {
        title: "Docker Compose Dev Stack",
        description: "Containerize a full-stack Next.js app with a Postgres DB and Nginx reverse proxy — include a hot-reload dev mode and a hardened production image",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "Deployment Basics",
        blocks: [
          { id: "m8w1-b1", title: "Environment Variables & Secrets", description: "env management, .env files, secrets in CI, Vercel env", durationMinutes: 30, type: "theory" },
          { id: "m8w1-b2", title: "Vercel Deployment", description: "git-based deploys, preview deployments, custom domains", durationMinutes: 45, type: "practice" },
          { id: "m8w1-b3", title: "DNS & Custom Domains", description: "A records, CNAME, SSL certificates, Vercel domain config", durationMinutes: 30, type: "theory" },
        ],
      },
      {
        week: 2,
        theme: "Docker",
        blocks: [
          { id: "m8w2-b1", title: "Docker Basics", description: "images, containers, Dockerfile, docker build/run/ps", durationMinutes: 60, type: "practice" },
          { id: "m8w2-b2", title: "Docker Compose", description: "multi-container apps, networking, volumes, compose up/down", durationMinutes: 60, type: "practice" },
          { id: "m8w2-b3", title: "Containerizing a Next.js App", description: "standalone output, multi-stage builds, production image", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 3,
        theme: "CI/CD",
        blocks: [
          { id: "m8w3-b1", title: "GitHub Actions", description: "workflows, jobs, steps, triggers — lint/test/deploy pipeline", durationMinutes: 60, type: "practice" },
          { id: "m8w3-b2", title: "Automated Testing in CI", description: "running Vitest in CI, test coverage, failing PRs on test failures", durationMinutes: 45, type: "practice" },
          { id: "m8w3-b3", title: "Database Migrations in CI", description: "prisma migrate deploy, migration safety, rollback strategies", durationMinutes: 45, type: "theory" },
        ],
      },
      {
        week: 4,
        theme: "Project",
        blocks: [
          { id: "m8w4-b1", title: "Monitoring & Logging", description: "Sentry error tracking, Vercel Analytics, structured logging", durationMinutes: 45, type: "theory" },
          { id: "m8w4-b2", title: "Production Deployment Project", description: "Full deployment pipeline — Docker, CI, Vercel, monitoring", durationMinutes: 120, type: "project" },
          { id: "m8w4-b3", title: "Month 8 Review", description: "Revisit gaps, fill in any skipped blocks", durationMinutes: 45, type: "review" },
        ],
      },
    ],
  },

  // ── Month 9: Testing ──────────────────────────────────────────────────────
  {
    month: 9,
    title: "Testing",
    description: "Unit, integration, and E2E testing with Vitest and Playwright",
    projectTitle: "Tested Feature",
    projectDescription: "Add full test coverage (unit + integration + E2E) to a previous project",
    alternativeProjects: [
      {
        title: "Bug Hunt & Fix (TDD-style)",
        description: "Take an intentionally buggy codebase, write failing tests to expose each bug, then fix them — experience the TDD red-green-refactor loop",
      },
      {
        title: "E2E Test Suite for the Admin Dashboard",
        description: "Write comprehensive Playwright tests for the Month 7 Admin Dashboard — auth flows, table interactions, form submissions, and accessibility checks",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "Unit Testing",
        blocks: [
          { id: "m9w1-b1", title: "Testing Concepts", description: "unit vs integration vs E2E, what to test, test pyramid", durationMinutes: 30, type: "theory" },
          { id: "m9w1-b2", title: "Vitest Basics", description: "describe, it, expect, beforeEach — writing your first tests", durationMinutes: 60, type: "practice" },
          { id: "m9w1-b3", title: "Mocking", description: "vi.mock, spies, stubs — isolating dependencies", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 2,
        theme: "React Testing",
        blocks: [
          { id: "m9w2-b1", title: "React Testing Library", description: "render, screen, userEvent — testing from the user's perspective", durationMinutes: 60, type: "practice" },
          { id: "m9w2-b2", title: "Testing Hooks & Context", description: "renderHook, custom provider wrappers, async queries", durationMinutes: 60, type: "practice" },
          { id: "m9w2-b3", title: "Snapshot Testing", description: "when snapshots help, when they hurt, keeping them useful", durationMinutes: 30, type: "theory" },
        ],
      },
      {
        week: 3,
        theme: "E2E Testing",
        blocks: [
          { id: "m9w3-b1", title: "Playwright Basics", description: "page.goto, locators, assertions, screenshot on fail", durationMinutes: 60, type: "practice" },
          { id: "m9w3-b2", title: "Auth in E2E Tests", description: "storageState, login fixtures, authenticated test suites", durationMinutes: 60, type: "practice" },
          { id: "m9w3-b3", title: "Test Data Management", description: "factories, seeders, database cleanup between tests", durationMinutes: 45, type: "theory" },
        ],
      },
      {
        week: 4,
        theme: "Project",
        blocks: [
          { id: "m9w4-b1", title: "Test Coverage & CI", description: "coverage reports, enforcing minimums in CI, coverage badges", durationMinutes: 30, type: "practice" },
          { id: "m9w4-b2", title: "Testing Project", description: "Write unit + integration + E2E tests for a previous project", durationMinutes: 120, type: "project" },
          { id: "m9w4-b3", title: "Month 9 Review", description: "Revisit gaps, fill in any skipped blocks", durationMinutes: 45, type: "review" },
        ],
      },
    ],
  },

  // ── Month 10: Performance & Security ──────────────────────────────────────
  {
    month: 10,
    title: "Performance & Security",
    description: "Web vitals, caching, CSP, OWASP top 10, rate limiting",
    projectTitle: "Performance Audit",
    projectDescription: "Audit and optimize a previous project to score 90+ on Lighthouse",
    alternativeProjects: [
      {
        title: "Security-Hardened API",
        description: "Audit the Month 6 Expense Tracker API — add rate limiting, strict CSP headers, input sanitization, and OWASP-aligned security checks; document each finding",
      },
      {
        title: "Core Web Vitals Optimization",
        description: "Take any previous project from a baseline Lighthouse score to 95+ on all metrics — document what changed and why it helped",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "Web Performance",
        blocks: [
          { id: "m10w1-b1", title: "Core Web Vitals", description: "LCP, FID/INP, CLS — what they measure and why Google cares", durationMinutes: 45, type: "theory" },
          { id: "m10w1-b2", title: "Image Optimization", description: "next/image, WebP, lazy loading, srcset, placeholder blur", durationMinutes: 45, type: "practice" },
          { id: "m10w1-b3", title: "Code Splitting & Lazy Loading", description: "dynamic imports, React.lazy, Suspense, route-level splitting", durationMinutes: 45, type: "practice" },
        ],
      },
      {
        week: 2,
        theme: "Caching",
        blocks: [
          { id: "m10w2-b1", title: "HTTP Caching", description: "Cache-Control, ETags, stale-while-revalidate, CDN caching", durationMinutes: 45, type: "theory" },
          { id: "m10w2-b2", title: "Next.js Caching Strategies", description: "unstable_cache, revalidatePath, revalidateTag, full-route cache", durationMinutes: 60, type: "practice" },
          { id: "m10w2-b3", title: "Database & Server-Side Caching", description: "N+1 problem and eager loading with Prisma include; Redis cache-aside pattern — when to reach for Redis vs Next.js built-in cache", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 3,
        theme: "Security",
        blocks: [
          { id: "m10w3-b1", title: "OWASP Top 10", description: "injection, broken auth, XSS, IDOR — what each means for web devs", durationMinutes: 60, type: "theory" },
          { id: "m10w3-b2", title: "Content Security Policy", description: "CSP headers, nonces, report-uri — defending against XSS", durationMinutes: 45, type: "practice" },
          { id: "m10w3-b3", title: "Rate Limiting & Input Sanitization", description: "rate limiting APIs, DOMPurify, SQL injection prevention with Prisma", durationMinutes: 45, type: "practice" },
        ],
      },
      {
        week: 4,
        theme: "Project",
        blocks: [
          { id: "m10w4-b1", title: "Lighthouse & Performance Tooling", description: "running Lighthouse, reading waterfall charts, PageSpeed Insights", durationMinutes: 30, type: "practice" },
          { id: "m10w4-b2", title: "Performance Audit Project", description: "Audit and optimize a previous project — target 90+ Lighthouse score", durationMinutes: 120, type: "project" },
          { id: "m10w4-b3", title: "Month 10 Review", description: "Revisit gaps, fill in any skipped blocks", durationMinutes: 45, type: "review" },
        ],
      },
    ],
  },

  // ── Month 11: Real-Time & Advanced Features ───────────────────────────────
  {
    month: 11,
    title: "Real-Time & Advanced Features",
    description: "WebSockets, Supabase Realtime, background jobs, file uploads, tRPC",
    projectTitle: "Real-Time Chat",
    projectDescription: "A real-time chat room with Supabase Realtime, auth, and file attachments",
    alternativeProjects: [
      {
        title: "Collaborative Whiteboard",
        description: "Shared canvas with Supabase Realtime broadcast for stroke sync and Presence for showing who's online — export to PNG via Canvas API",
      },
      {
        title: "Live Auction App",
        description: "Real-time bidding with a countdown timer, instant bid updates via Supabase Realtime, and a winner announcement — tRPC for the REST of the API",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "Real-Time",
        blocks: [
          { id: "m11w1-b1", title: "WebSockets", description: "WebSocket protocol, ws library, connection lifecycle, reconnection", durationMinutes: 45, type: "theory" },
          { id: "m11w1-b2", title: "Supabase Realtime", description: "Realtime channels, broadcast, presence, postgres changes", durationMinutes: 60, type: "practice" },
          { id: "m11w1-b3", title: "Optimistic UI with Realtime", description: "local state + server sync, conflict resolution", durationMinutes: 45, type: "practice" },
        ],
      },
      {
        week: 2,
        theme: "File Uploads & Storage",
        blocks: [
          { id: "m11w2-b1", title: "Supabase Storage", description: "buckets, policies, upload/download, signed URLs", durationMinutes: 60, type: "practice" },
          { id: "m11w2-b2", title: "Image Upload UI", description: "drag-and-drop, progress indicators, preview, validation", durationMinutes: 60, type: "practice" },
          { id: "m11w2-b3", title: "Background Jobs", description: "Vercel cron jobs, queue concepts, deferred work patterns", durationMinutes: 45, type: "theory" },
        ],
      },
      {
        week: 3,
        theme: "Advanced Next.js",
        blocks: [
          { id: "m11w3-b1", title: "Edge Runtime", description: "Edge vs Node.js runtime, middleware patterns, geolocation", durationMinutes: 45, type: "theory" },
          { id: "m11w3-b2", title: "Streaming & Suspense", description: "streaming SSR, Suspense boundaries, progressive loading", durationMinutes: 60, type: "practice" },
          { id: "m11w3-b3", title: "tRPC & Type-Safe APIs", description: "end-to-end type safety without code generation — routers, procedures, React Query integration; when tRPC beats REST in a Next.js monorepo", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 4,
        theme: "Project",
        blocks: [
          { id: "m11w4-b1", title: "Push Notifications", description: "Web Push API, service workers, notification permissions", durationMinutes: 45, type: "theory" },
          { id: "m11w4-b2", title: "Real-Time Chat Project", description: "Chat with Supabase Realtime, auth, file uploads, presence", durationMinutes: 120, type: "project" },
          { id: "m11w4-b3", title: "Month 11 Review", description: "Revisit gaps, fill in any skipped blocks", durationMinutes: 45, type: "review" },
        ],
      },
    ],
  },

  // ── Month 12: Capstone & Career ────────────────────────────────────────────
  {
    month: 12,
    title: "Capstone & Career",
    description: "Portfolio capstone project, interview prep, job search strategy",
    projectTitle: "Capstone Project",
    projectDescription: "A full-stack application of your choice — built, tested, documented, and deployed",
    alternativeProjects: [
      {
        title: "SaaS MVP",
        description: "A subscription-based app with mock Stripe billing, user auth, a feature-gated dashboard, and a public marketing page — the complete SaaS skeleton",
      },
      {
        title: "Open Source Contribution Sprint",
        description: "Land meaningful PRs on 3 open source projects over the month — document your process, what you learned, and what impact each contribution had",
      },
    ],
    weeks: [
      {
        week: 1,
        theme: "Capstone Planning",
        blocks: [
          { id: "m12w1-b1", title: "Project Architecture", description: "scope definition, data model, tech stack decisions, timeline", durationMinutes: 60, type: "theory" },
          { id: "m12w1-b2", title: "Capstone Build Sprint 1", description: "Core data model, auth, basic pages — foundation complete", durationMinutes: 120, type: "project" },
          { id: "m12w1-b3", title: "Interview Prep: CS Fundamentals", description: "Big O, data structures overview, sorting algorithms", durationMinutes: 60, type: "theory" },
        ],
      },
      {
        week: 2,
        theme: "Capstone Build",
        blocks: [
          { id: "m12w2-b1", title: "Capstone Build Sprint 2", description: "Main features, API routes, database queries", durationMinutes: 120, type: "project" },
          { id: "m12w2-b2", title: "Interview Prep: JavaScript Specifics", description: "closures, event loop, prototype chain, common gotchas", durationMinutes: 60, type: "theory" },
          { id: "m12w2-b3", title: "Writing a Technical README", description: "project overview, setup instructions, architecture decisions", durationMinutes: 30, type: "practice" },
        ],
      },
      {
        week: 3,
        theme: "Polish & Deploy",
        blocks: [
          { id: "m12w3-b1", title: "Capstone Build Sprint 3", description: "Polish, edge cases, error handling, mobile responsive", durationMinutes: 120, type: "project" },
          { id: "m12w3-b2", title: "Interview Prep: React & Next.js", description: "hooks rules, rendering strategies, common interview questions", durationMinutes: 60, type: "theory" },
          { id: "m12w3-b3", title: "Portfolio Review", description: "Review all projects, write case studies, update portfolio page", durationMinutes: 60, type: "practice" },
        ],
      },
      {
        week: 4,
        theme: "Career Launch",
        blocks: [
          { id: "m12w4-b1", title: "Capstone Final Deployment", description: "Production deploy, CI/CD, monitoring — your capstone is live", durationMinutes: 60, type: "project" },
          { id: "m12w4-b2", title: "Job Search Strategy", description: "resume, LinkedIn, cold outreach, how to find junior roles", durationMinutes: 60, type: "theory" },
          { id: "m12w4-b3", title: "Open Source & Community", description: "finding good first issues, PR etiquette, why OSS contributions stand out on a junior portfolio — make your first contribution today", durationMinutes: 45, type: "practice" },
        ],
      },
    ],
  },
]

export function getMonth(month: number): Month | undefined {
  return CURRICULUM.find((m) => m.month === month)
}

export function getWeek(month: number, week: number): Week | undefined {
  return getMonth(month)?.weeks.find((w) => w.week === week)
}

export function getAllBlocks(): LearningBlock[] {
  return CURRICULUM.flatMap((m) => m.weeks.flatMap((w) => w.blocks))
}

export function getBlock(blockId: string): LearningBlock | undefined {
  return getAllBlocks().find((b) => b.id === blockId)
}

export const BLOCK_TYPE_COLORS: Record<LearningBlock["type"], string> = {
  theory: "bg-blue-100 text-blue-800",
  practice: "bg-green-100 text-green-800",
  project: "bg-purple-100 text-purple-800",
  review: "bg-orange-100 text-orange-800",
}

export const BLOCK_TYPE_LABELS: Record<LearningBlock["type"], string> = {
  theory: "Theory",
  practice: "Practice",
  project: "Project",
  review: "Review",
}
